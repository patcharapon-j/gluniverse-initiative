// ---------------------------------------------------------------------------
// Bake-time shaders — the SOURCE OF TRUTH for the crack/break + dying veins FX.
//
// These are the offline cousins of the (now removed) runtime `FX_FRAG_BREAK` /
// `FX_FRAG_DYING` fbm shaders. They are rendered head-less by `render.mjs` into
// seamlessly-looping, channel-packed PNG atlases (see `bake.mjs`). The shipped
// module never compiles these — at runtime it only plays the baked atlas with a
// trivial sampler (`PLAYBACK_FRAG`, also exported here for parity reference).
//
// Two deliberate changes vs. the old live shaders:
//   1. LOOPABLE NOISE. The live shaders drove motion on a linear `uTime`, which
//      pops at the loop seam. Here every animated term is driven by `uPhase`
//      (0..1 over one loop) on a CLOSED PATH — integer-cycle sines for travelling
//      pulses, and a circular domain drift for the dying veins — so frame N wraps
//      to frame 0 with no visible seam.
//   2. CHANNEL PACKING + REVEAL ORDER. Output is packed RGBA so playback needs no
//      noise math:
//        R = crack/vein CORE mask
//        G = EDGE / hot-highlight mask (carries the baked shimmer)
//        B = REVEAL ORDER (0 = appears first, 1 = appears last)
//        A = overall COVERAGE alpha
//      Progressive damage is then "reveal where B <= damageRatio" at playback,
//      so one baked loop grows new cracks across the portrait as damage rises.
// ---------------------------------------------------------------------------

// Shared value-noise (mirrors the runtime FX_GLSL_NOISE; uSeed-salted hash).
const GLSL_NOISE = `
float gluHash1(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7))+uSeed)*43758.5453); }
float gluVNoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(gluHash1(i),gluHash1(i+vec2(1.0,0.0)),f.x),
             mix(gluHash1(i+vec2(0.0,1.0)),gluHash1(i+vec2(1.0,1.0)),f.x), f.y); }
float gluFbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*gluVNoise(p); p*=2.02; a*=0.5; } return s; }
`;

// Fullscreen-quad vertex shader. vTextureCoord runs 0..1 across the frame, the
// same coordinate space PIXI's filter vertex shader feeds the runtime shaders,
// so the fragment source below stays byte-for-byte parity with what shipped.
export const BAKE_VERT = `
attribute vec2 aPos;
varying vec2 vTextureCoord;
void main(void){
  vTextureCoord = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// --- BREAK / glass fracture ------------------------------------------------
// Impact baked at centre (0.5,0.5); reveal order radiates outward so rising
// damage grows cracks from the centre to the rim. Shape/colour/intensity are
// all applied at playback, so this is one bake for all of them.
export const BAKE_FRAG_BREAK = `
precision highp float;
varying vec2 vTextureCoord;
uniform float uPhase, uSeed;
const float TAU = 6.28318530718;
const vec2 uImpact = vec2(0.5, 0.5);
vec2 gluHash2(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p+uSeed)*43758.5453); }
float gluVoroEdge(vec2 x){
  vec2 n=floor(x), f=fract(x); float f1=9.0,f2=9.0;
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 g=vec2(float(i),float(j)); vec2 o=gluHash2(n+g); vec2 r=g+o-f; float d=dot(r,r);
    if(d<f1){f2=f1;f1=d;} else if(d<f2){f2=d;}
  }
  return sqrt(f2)-sqrt(f1);
}
${GLSL_NOISE}
void main(void){
  vec2 uv=vTextureCoord;
  vec2 d=(uv-uImpact); float dist=length(d);
  float ang=atan(d.y,d.x);
  float warp=0.16*gluFbm(vec2(ang*1.2+3.0,1.7))+0.08*gluFbm(vec2(ang*3.3,5.0))-0.12;
  float wdist=dist+warp;
  float scale=mix(8.0,4.0,smoothstep(0.0,0.8,dist));   // large shards -> few cracks
  float ce=gluVoroEdge(vec2(uv.x,uv.y)*scale+7.0);
  float edge=1.0-smoothstep(0.0,0.045,ce);             // crisp lines (matches runtime uThick)
  // Baked atlas represents the SETTLED, fully-shattered loop; the one-shot
  // "shatterT" intro is gone (progressive reveal now lives in the B channel).
  float coverage=smoothstep(0.95,0.12,wdist);          // tight, leaves edges clear
  float crack=edge*coverage;
  // Travelling glow pulse, integer cycles over the loop -> seamless.
  float flow=pow(0.5+0.5*sin(dist*18.0 - TAU*uPhase*3.0),8.0);
  float pulse=0.6+0.4*sin(TAU*uPhase);
  float glowFlow=crack*flow;
  float core=smoothstep(0.10,0.0,dist);                // hot centre of the impact
  // Channel pack -------------------------------------------------------------
  float coreMask = clamp(crack + core, 0.0, 1.0);                    // R
  float hiMask   = clamp(glowFlow + core + crack*pulse*0.5, 0.0, 1.0); // G (animated shimmer)
  float reveal   = clamp(wdist / 0.95, 0.0, 1.0);                     // B (centre first)
  float cov      = clamp(max(crack, core), 0.0, 1.0);                // A
  gl_FragColor = vec4(coreMask, hiMask, reveal, cov);
}`;

// --- DYING / corruption veins ----------------------------------------------
// Edge-concentrated ridged noise. Reveal order creeps in from the rim so a
// "growing" dying look is available at playback if wanted.
export const BAKE_FRAG_DYING = `
precision highp float;
varying vec2 vTextureCoord;
uniform float uPhase, uSeed;
const float TAU = 6.28318530718;
float gluHashD(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7))+uSeed)*43758.5453); }
float gluVNoiseD(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(gluHashD(i),gluHashD(i+vec2(1.0,0.0)),f.x),
             mix(gluHashD(i+vec2(0.0,1.0)),gluHashD(i+vec2(1.0,1.0)),f.x), f.y); }
float gluFbmD(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<3;i++){ s+=a*gluVNoiseD(p); p*=2.03; a*=0.5; } return s; }
void main(void){
  vec2 uv=vTextureCoord;
  float eb=max(smoothstep(0.46,0.04,uv.x),smoothstep(0.54,0.96,uv.x));
  eb=max(eb,smoothstep(0.4,0.0,uv.y));
  // Circular domain drift -> the only time term, and it returns to start after
  // one period, so the loop is seamless.
  vec2 drift = 0.085*vec2(cos(TAU*uPhase), sin(TAU*uPhase));
  float warp=gluFbmD(uv*2.2 + drift);
  float n=gluFbmD(uv*3.4 + vec2(warp*1.4, 0.0) + 0.9*drift);
  float ridge=1.0-abs(n*2.0-1.0);
  float veins=smoothstep(0.9,1.0,ridge) * eb;          // sparse, edge-hard
  float crest=smoothstep(0.96,1.0,ridge) * eb;         // hottest crest
  // Channel pack -------------------------------------------------------------
  float coreMask = clamp(veins, 0.0, 1.0);             // R
  float hiMask   = clamp(crest, 0.0, 1.0);             // G
  float reveal   = clamp(1.0 - eb, 0.0, 1.0);          // B (rim creeps in first)
  float cov      = clamp(veins, 0.0, 1.0);             // A
  gl_FragColor = vec4(coreMask, hiMask, reveal, cov);
}`;

// --- Playback sampler (parity reference) -----------------------------------
// Trivial: one texel fetch, two-tint colourise, B-channel reveal gate, shape
// mask. No noise. This is what the runtime FX layer runs after the rewrite; it
// is exported here so the preview page and the runtime stay in lock-step.
export const PLAYBACK_FRAG_BREAK = `
precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;     // the baked atlas frame
uniform float uAspect, uClipCircle, uRatio;
uniform vec3 uCoreTint, uHotTint;
void main(void){
  vec2 uv=vTextureCoord;
  vec4 tx=texture2D(uSampler, uv);
  float reveal=smoothstep(uRatio+0.04, uRatio-0.04, tx.b); // show where B<=ratio
  float coreM=tx.r*reveal, hiM=tx.g*reveal;
  vec3 col=mix(uCoreTint, uHotTint, clamp(hiM,0.0,1.0));
  col=mix(col, vec3(1.0), clamp(hiM*hiM,0.0,1.0));
  float a=clamp(coreM*0.86 + hiM*0.7, 0.0, 1.0) * 0.94;
  if(uClipCircle>0.5){ vec2 cc=uv-vec2(0.5); cc.x*=uAspect; a*=smoothstep(0.5,0.47,length(cc)); }
  gl_FragColor=vec4(col*a, a);
}`;

export const PLAYBACK_FRAG_DYING = `
precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uAspect, uClipCircle, uRatio;
uniform vec3 uCoreTint, uHotTint;
void main(void){
  vec2 uv=vTextureCoord;
  vec4 tx=texture2D(uSampler, uv);
  float reveal=smoothstep(uRatio+0.06, uRatio-0.06, tx.b);
  float veins=tx.r*reveal;
  vec3 col=mix(uCoreTint, uHotTint, clamp(tx.g*reveal,0.0,1.0));
  float a=clamp(veins*0.62, 0.0, 1.0);
  if(uClipCircle>0.5){ vec2 cc=uv-vec2(0.5); cc.x*=uAspect; a*=smoothstep(0.5,0.47,length(cc)); }
  gl_FragColor=vec4(col*a, a);
}`;

// Default playback tints (match the old live-shader palettes).
export const TINTS = {
  break: { core: [1.0, 0.69, 0.18], hot: [1.0, 0.88, 0.44] }, // amber / hot
  dying: { core: [0.71, 0.59, 1.0], hot: [0.94, 0.84, 1.0] }  // violet / vhot
};

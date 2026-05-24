// Head-less WebGL1 renderer for the FX bake.
//
// Uses `gl` (stack-gl / ANGLE) so it runs with no browser — the exact same
// WebGL1 GLSL that PIXI compiled at runtime, which is what guarantees visual
// parity with the old live shaders. Renders one frame per loop step into a
// frame-sized context, reads the pixels back, and tiles them (top-down, with
// the GL bottom-up readback flipped) into a single packed RGBA atlas buffer.
//
// NOTE: on Linux this needs an X display; run under `xvfb-run` (see bake.mjs
// header / the npm scripts). createGL silently returns null otherwise.

import createGL from "gl";
import { BAKE_VERT } from "./shaders.mjs";

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error("shader compile failed:\n" + gl.getShaderInfoLog(sh) + "\n--- src ---\n" + src);
  }
  return sh;
}

function program(gl, frag) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, BAKE_VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error("program link failed: " + gl.getProgramInfoLog(p));
  }
  return p;
}

// Render `frames` frames of `frag` (loop phase 0..1) at `frameSize` px square
// and tile them into a cols×rows atlas. Returns { data, width, height } where
// `data` is a top-down RGBA Uint8 buffer (PNG row order).
export function renderAtlas({ frag, frameSize, frames, cols, rows, seed = 13.37 }) {
  const gl = createGL(frameSize, frameSize, { preserveDrawingBuffer: true, antialias: false });
  if (!gl) throw new Error("no WebGL context — run under xvfb-run (e.g. `xvfb-run -a node bake.mjs`)");

  const prog = program(gl, frag);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uPhase = gl.getUniformLocation(prog, "uPhase");
  const uSeed = gl.getUniformLocation(prog, "uSeed");
  if (uSeed) gl.uniform1f(uSeed, seed);

  const atlasW = cols * frameSize;
  const atlasH = rows * frameSize;
  const atlas = new Uint8Array(atlasW * atlasH * 4);
  const frameBuf = new Uint8Array(frameSize * frameSize * 4);

  for (let f = 0; f < frames; f++) {
    gl.uniform1f(uPhase, f / frames); // 0..(1-1/frames); f/frames keeps the wrap clean
    gl.viewport(0, 0, frameSize, frameSize);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.readPixels(0, 0, frameSize, frameSize, gl.RGBA, gl.UNSIGNED_BYTE, frameBuf);

    const col = f % cols;
    const row = Math.floor(f / cols);
    const ox = col * frameSize;
    const oy = row * frameSize;
    // GL readback is bottom-up; flip rows into the top-down atlas.
    for (let y = 0; y < frameSize; y++) {
      const srcRow = (frameSize - 1 - y) * frameSize * 4;
      const dstRow = ((oy + y) * atlasW + ox) * 4;
      atlas.set(frameBuf.subarray(srcRow, srcRow + frameSize * 4), dstRow);
    }
  }

  return { data: atlas, width: atlasW, height: atlasH };
}

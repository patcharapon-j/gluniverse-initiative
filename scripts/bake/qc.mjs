// QC / sign-off image generator (CPU, no GL needed).
//
//   node scripts/bake/qc.mjs
//
// The baked atlases are channel-packed (R/G/B/A carry masks + reveal order, not
// a viewable picture). This composites them through the SAME playback math as
// the runtime (mirrors PLAYBACK_FRAG_* in shaders.mjs) so you can eyeball:
//   * progressive reveal  -> qc-<effect>-reveal.png   (damage 25/50/75/100%)
//   * seamless loop        -> qc-<effect>-seam.png      (lastframe | frame0 | x8 diff)
//   * circle vs square mask-> qc-<effect>-mask.png
// It also prints an objective seam metric: the last->first frame delta should be
// in line with the average frame-to-frame delta (no pop).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import { TINTS } from "./shaders.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "assets", "fx");
const manifest = JSON.parse(readFileSync(join(OUT, "manifest.json"), "utf8"));

const TILE = 220;           // QC swatch size
const BG = [0.07, 0.07, 0.09];

function smooth(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
const clamp01 = v => Math.min(1, Math.max(0, v));
function loadAtlas(file) {
  const png = PNG.sync.read(readFileSync(join(OUT, file)));
  return { data: png.data, w: png.width, h: png.height };
}

// Bilinear-ish nearest sample of frame `f` at uv in [0,1].
function sampleFrame(atlas, info, f, u, v) {
  const col = f % info.cols, row = Math.floor(f / info.cols);
  const fs = info.frameSize;
  const px = Math.min(fs - 1, Math.max(0, Math.round(u * (fs - 1)))) + col * fs;
  const py = Math.min(fs - 1, Math.max(0, Math.round(v * (fs - 1)))) + row * fs;
  const i = (py * atlas.w + px) * 4;
  return [atlas.data[i] / 255, atlas.data[i + 1] / 255, atlas.data[i + 2] / 255, atlas.data[i + 3] / 255];
}

// Playback composite of one texel over BG. effect picks the colour math.
function composite(effect, tint, tx, ratio, clipCircle, u, v) {
  const reveal = effect === "break"
    ? smooth(ratio + 0.04, ratio - 0.04, tx[2])
    : smooth(ratio + 0.06, ratio - 0.06, tx[2]);
  let col, a;
  if (effect === "break") {
    const coreM = tx[0] * reveal, hiM = tx[1] * reveal;
    col = tint.core.map((c, k) => c + (tint.hot[k] - c) * clamp01(hiM));
    col = col.map(c => c + (1 - c) * clamp01(hiM * hiM));
    a = clamp01(coreM * 0.86 + hiM * 0.7) * 0.94;
  } else {
    const veins = tx[0] * reveal;
    col = tint.core.map((c, k) => c + (tint.hot[k] - c) * clamp01(tx[1] * reveal));
    a = clamp01(veins * 0.62);
  }
  if (clipCircle) {
    const cx = u - 0.5, cy = v - 0.5;
    a *= smooth(0.5, 0.47, Math.hypot(cx, cy));
  }
  return col.map((c, k) => c * a + BG[k] * (1 - a));
}

function blit(out, ox, oy, render) {
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const rgb = render(x / (TILE - 1), y / (TILE - 1));
      const i = ((oy + y) * out.width + (ox + x)) * 4;
      out.data[i] = Math.round(rgb[0] * 255);
      out.data[i + 1] = Math.round(rgb[1] * 255);
      out.data[i + 2] = Math.round(rgb[2] * 255);
      out.data[i + 3] = 255;
    }
  }
}

function revealSheet(effect) {
  const info = manifest.effects[effect].card;
  const atlas = loadAtlas(info.file);
  const tint = TINTS[effect];
  const ratios = [0.25, 0.5, 0.75, 1.0];
  const png = new PNG({ width: TILE * ratios.length, height: TILE });
  ratios.forEach((r, k) => {
    blit(png, k * TILE, 0, (u, v) => composite(effect, tint, sampleFrame(atlas, info, 10, u, v), r, false, u, v));
  });
  writeFileSync(join(OUT, `qc-${effect}-reveal.png`), PNG.sync.write(png));
}

function seamSheet(effect) {
  const info = manifest.effects[effect].card;
  const atlas = loadAtlas(info.file);
  const tint = TINTS[effect];
  const last = info.frames - 1;
  const png = new PNG({ width: TILE * 3, height: TILE });
  blit(png, 0, 0, (u, v) => composite(effect, tint, sampleFrame(atlas, info, last, u, v), 1, false, u, v));
  blit(png, TILE, 0, (u, v) => composite(effect, tint, sampleFrame(atlas, info, 0, u, v), 1, false, u, v));
  blit(png, TILE * 2, 0, (u, v) => {
    const a = sampleFrame(atlas, info, last, u, v), b = sampleFrame(atlas, info, 0, u, v);
    const d = Math.min(1, Math.abs(a[0] - b[0]) * 8); // x8 amplified diff
    return [d, d * 0.5, 0.05];
  });
  writeFileSync(join(OUT, `qc-${effect}-seam.png`), PNG.sync.write(png));
}

function maskSheet(effect) {
  const info = manifest.effects[effect].token;
  const atlas = loadAtlas(info.file);
  const tint = TINTS[effect];
  const png = new PNG({ width: TILE * 2, height: TILE });
  blit(png, 0, 0, (u, v) => composite(effect, tint, sampleFrame(atlas, info, 10, u, v), 1, true, u, v));
  blit(png, TILE, 0, (u, v) => composite(effect, tint, sampleFrame(atlas, info, 10, u, v), 1, false, u, v));
  writeFileSync(join(OUT, `qc-${effect}-mask.png`), PNG.sync.write(png));
}

// Objective seam metric on the raw packed channels (effect-agnostic).
function seamMetric(effect) {
  const info = manifest.effects[effect].card;
  const atlas = loadAtlas(info.file);
  const N = 24; // sparse uv grid
  const frameDelta = (fa, fb) => {
    let s = 0, n = 0;
    for (let yi = 0; yi < N; yi++) for (let xi = 0; xi < N; xi++) {
      const u = xi / (N - 1), v = yi / (N - 1);
      const a = sampleFrame(atlas, info, fa, u, v), b = sampleFrame(atlas, info, fb, u, v);
      for (let k = 0; k < 4; k++) { s += Math.abs(a[k] - b[k]); n++; }
    }
    return s / n;
  };
  let avg = 0;
  for (let f = 0; f < info.frames - 1; f++) avg += frameDelta(f, f + 1);
  avg /= info.frames - 1;
  const seam = frameDelta(info.frames - 1, 0);
  return { avg, seam, ratio: seam / (avg || 1e-6) };
}

for (const effect of ["break", "dying"]) {
  revealSheet(effect);
  seamSheet(effect);
  maskSheet(effect);
  const m = seamMetric(effect);
  console.log(`${effect}: avg frame delta=${m.avg.toFixed(5)}  seam(last->0) delta=${m.seam.toFixed(5)}  ratio=${m.ratio.toFixed(2)}x  ${m.ratio < 1.6 ? "OK seamless" : "CHECK seam"}`);
}
console.log("wrote qc-*.png to assets/fx/");

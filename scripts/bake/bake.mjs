// Offline FX atlas bake — maintainer-only, like the manual packaging step.
//
//   xvfb-run -a node scripts/bake/bake.mjs        (from repo root)
//   npm --prefix scripts/bake run bake
//
// Writes one channel-packed PNG per effect per resolution tier into assets/fx/
// plus a manifest the runtime reads to drive playback. Nothing here ships or
// runs in Foundry — the module only loads the resulting PNGs.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import { renderAtlas } from "./gl-bake.mjs";
import { BAKE_FRAG_BREAK, BAKE_FRAG_DYING } from "./shaders.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", "assets", "fx");

// Resolution tiers (mid-tier sizing; <=4096px/side for integrated GPUs).
// ~3s loops, slow ambient playback.
const TIERS = {
  token: { frameSize: 256, frames: 40, cols: 8, rows: 5 }, // 2048x1280
  card:  { frameSize: 512, frames: 40, cols: 8, rows: 5 }  // 4096x2560
};

const EFFECTS = {
  break: { frag: BAKE_FRAG_BREAK, seed: 13.37 },
  dying: { frag: BAKE_FRAG_DYING, seed: 47.11 }
};

const LOOP_SECONDS = 3;

function writeAtlas(name, atlas) {
  const png = new PNG({ width: atlas.width, height: atlas.height });
  png.data = Buffer.from(atlas.data.buffer, atlas.data.byteOffset, atlas.data.byteLength);
  const file = join(OUT, name);
  writeFileSync(file, PNG.sync.write(png));
  return file;
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const manifest = { version: 1, loopSeconds: LOOP_SECONDS, channels: "R=core G=highlight B=revealOrder A=coverage", effects: {} };

  for (const [effect, { frag, seed }] of Object.entries(EFFECTS)) {
    manifest.effects[effect] = {};
    for (const [tier, cfg] of Object.entries(TIERS)) {
      process.stdout.write(`baking ${effect}/${tier} (${cfg.cols}x${cfg.rows} @ ${cfg.frameSize}px) ... `);
      const atlas = renderAtlas({ frag, seed, ...cfg });
      const name = `${effect}-${tier}.png`;
      writeAtlas(name, atlas);
      manifest.effects[effect][tier] = {
        file: name,
        frameSize: cfg.frameSize,
        frames: cfg.frames,
        cols: cfg.cols,
        rows: cfg.rows,
        atlasWidth: atlas.width,
        atlasHeight: atlas.height
      };
      console.log(`${atlas.width}x${atlas.height} ok`);
    }
  }

  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nwrote ${OUT}/manifest.json`);
}

main();

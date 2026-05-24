# FX atlas bake harness (maintainer-only)

Offline tool that pre-renders the **break (cracks)** and **dying (veins)** FX
into seamlessly-looping, channel-packed PNG atlases. The shipped module never
runs this — it only loads the generated PNGs from `assets/fx/` and plays them
with a trivial sampler. This is an **asset-authoring step, not a runtime build
step**: the module stays buildless.

## Why

The old runtime ran multi-octave fbm noise per frame (throttled to 30fps and
gated to `high` fidelity). Baking moves all the noise math offline, so playback
is a single texture fetch — free on integrated GPUs — and lets the baked art use
higher fidelity than was affordable live.

## How to bake

Requires Node and an X display (headless-gl needs one; `xvfb` provides it):

```bash
npm install --prefix scripts/bake      # installs gl + pngjs (gitignored)
npm --prefix scripts/bake run bake     # = xvfb-run -a node bake.mjs
npm --prefix scripts/bake run qc       # composite QC sheets + seam metric
```

Outputs to `assets/fx/`:

| File | Tier | Frame | Grid | Atlas |
|------|------|-------|------|-------|
| `break-token.png`, `dying-token.png` | tiny→large tokens | 256 | 8×5 (40) | 2048×1280 |
| `break-card.png`, `dying-card.png`   | card + huge tokens | 512 | 8×5 (40) | 4096×2560 |

Plus `manifest.json` (frame/grid dims + loop length the runtime reads) and
`qc-*.png` sign-off sheets.

> Tooling note: the issue suggested Playwright, but Chromium download is blocked
> in CI/sandboxes. `headless-gl` runs the **exact same WebGL1 GLSL**, so shader
> parity is preserved without a browser.

## Atlas format (RGBA channel packing)

| Channel | Meaning |
|---------|---------|
| `R` | crack / vein **core** mask |
| `G` | **edge / hot-highlight** mask (carries the baked shimmer) |
| `B` | **reveal order** — 0 appears first, 1 last |
| `A` | overall **coverage** alpha |

Shape (circle/square), colour/tint, and damage intensity are **all applied at
playback**, so there is one bake per effect+tier — they do not multiply.
Progressive damage = reveal texels where `B <= damageRatio`, so rising damage
grows new cracks across the portrait from one baked loop.

## Seamless looping

The bake-time shaders (`shaders.mjs`) drive all motion on a **closed path**
(`uPhase` 0..1): integer-cycle sines for the travelling crack glow, and a
circular domain drift for the dying veins. Frame N therefore wraps to frame 0
with no pop. `qc.mjs` prints an objective seam metric (last→first frame delta vs
average frame delta); a ratio near 1× means seamless.

## Files

- `shaders.mjs` — **source of truth** for the bake-time GLSL and the playback
  GLSL/tints. The runtime imports nothing from here; keep the playback shader in
  the runtime byte-identical to `PLAYBACK_FRAG_*` to avoid drift.
- `gl-bake.mjs` — headless-gl renderer (frame → tiled atlas buffer).
- `bake.mjs` — orchestrator (tiers × effects → PNG + manifest).
- `qc.mjs` — CPU compositor for sign-off sheets + seam metric.
- `preview.html` — live WebGL playback preview (serve over http, see file head).

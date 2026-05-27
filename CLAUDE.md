# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

**GLUniverse Initiative** is a [Foundry VTT](https://foundryvtt.com) **v13** module that renders a cinematic, portrait-first initiative overlay on top of the default combat tracker (it complements, never replaces, the core tracker). It is system-agnostic with extra handling for PF2e (Delay, dying, etc.).

There is **no build step, no package manager, and no test suite**. The repository ships as raw Foundry module files. Foundry loads the ES module and CSS directly as declared in `module.json`.

## Repository layout

```
module.json            Foundry manifest: id, version, compatibility, esmodules, styles, languages
scripts/
  gluniverse-initiative.mjs   ENTRY module: hooks, bootstrap, settings, the
                              GLUniverseInitiativeOverlay class, CardFXManager,
                              BreakSplashGL, and the dialog/portrait/adhoc/card
                              free functions. Imports the modules below.
  constants.mjs               All data constants: MODULE_ID, SETTINGS, FLAGS,
                              VISIBILITY, palettes, ADHOC_*, CARD_*, BREAK_*,
                              PORTRAIT_FRAME_*, LOCALIZATION_FALLBACKS.
  util.mjs                    Pure helpers: localize/formatLocalized, escapeHTML/
                              Attr/CSSIdentifier, clamp, wait, modulo, formatRound,
                              formatInitiative, getDisposition, …
  conditions.mjs              System-aware (PF2e/D&D5e) condition, dying,
                              guard-break and break-gauge state readers + markup.
  gl.mjs                      Shared WebGL: card/marker FX shader source + PIXI
                              mesh helpers (makeFxMesh, setFxMeshQuad, rgbFloat).
  token-overlay.mjs           TokenOverlayManager: PIXI ground turn-markers and
                              above-token status overlays, + marker-sheet bakers.
styles/
  gluniverse-initiative.css   All styling (single file, ~6000 lines)
lang/
  en.json              Localization strings (keys prefixed GLUNI.)
docs/
  implementation-spec.md       Authoritative product/behavior spec — READ THIS FIRST
  mockups/             Standalone HTML design mockups + _build/*.md design notes
  superpowers/         Planning/spec docs (plans/, specs/) for larger efforts
.superpowers/          Brainstorm artifacts (HTML prototypes); not shipped
README.md              User-facing install/feature/packaging docs
```

`.gitignore` excludes `node_modules/`, `dist/`, editor dirs, logs. There is no `node_modules` or `dist` in practice — nothing is built.

## Architecture

The runtime is split across the `scripts/*.mjs` modules listed above. `module.json`
declares a **single esmodule entry** (`gluniverse-initiative.mjs`); Foundry loads it
and the browser resolves the relative `import`s to the sibling modules (no bundler).
When adding a module, just `import`/`export` between these files — do **not** add new
`esmodules` entries unless a file must load independently.

The entry module (`gluniverse-initiative.mjs`) is still the largest file and contains:

1. **Imports** — pulls constants/util/conditions/gl/token-overlay symbols up top.
2. **Hook registration** (top level) — `init`/`ready` bootstrap, plus `Combat`/
   `Combatant`/`Actor`/`Item` document hooks that call `overlay?.renderSoon()` or
   targeted handlers. Also `getApplication*HeaderButtons` / `renderApplicationV1/V2`
   (actor-sheet portrait-framing + card-config buttons), `renderTokenHUD` (guard-break
   button), `combatRound`, `canvasReady`. The module-level singletons (`overlay`,
   `tokenOverlays`, `cardFX`) are declared here and read by `token-overlay.mjs` via the
   handful of helpers the entry `export`s (`prefersReducedMotion`, `getCombatantTokenObject`).
3. **`class GLUniverseInitiativeOverlay`** — the core. Owns a single DOM root appended
   to `document.body`. Builds a view model from the active `Combat`, renders cards, runs
   FLIP-style turn/round animations, and handles all GM controls, visibility modes, ad hoc
   cards, delay/return, guard break, initiative adjustment, and the GM/player socket
   protocol for `End Turn`.
4. **`class CardFXManager` / `class BreakSplashGL`** — WebGL effect layers (card portrait
   FX; full-screen guard-break shatter), using the shader source from `gl.mjs`.
5. **Free functions** — portrait resolution/scaling/framing dialog, initiative math
   (`chooseInitiativeBetween`, `makeUniqueInitiative`), card-mode deck helpers, ad hoc
   dialog, and the break-gauge editor popover.

### Key concepts

- **Single mounted DOM root**: the overlay is one element on `document.body`, re-rendered via `render()` / debounced `renderSoon()`. Turn changes capture rects (`captureItemRects`) and run FLIP animations (`animateTurnChange`).
- **Per-combatant state lives in flags** under `MODULE_ID` — see `FLAGS` (`visibility`, `manualDelayed`, `guardBroken`, `adhoc`, `adhocActor`). Per-actor portrait framing is stored under `FLAGS.portraitFrame` on the Actor so it persists across combats/tokens.
- **Visibility modes** (`VISIBILITY`): `auto`, `visible`, `hidden`, `mystery`. Hidden actors must never leak through delay state, hover, or round wrapping — preserve this when editing visibility/hover code.
- **GM vs player**: only the GM drags the rail (position is a world setting synced to all). Players who own the active combatant get an `End Turn` button; the request is socketed (`SOCKET_NAME`) to the GM client and validated against active-combatant ownership before advancing combat. See `requestEndTurn` / `onSocketEndTurnRequest` / `isPrimaryActiveGM`.
- **Settings** (`SETTINGS`, registered in `registerSettings`): `enabled` (client), and world-synced `edge`, `visibleCount`, `showDefeated`, `position`, `uiScale`, `tokenOverlayShape`, plus the marker/condition/sound toggles. **There is intentionally no animation-intensity or visual-fidelity setting** — see the single-tier note below.
- **Single rendering tier**: the module runs at exactly one animation style (the most cinematic) and one performance/fidelity level (the best). The former `animationIntensity` and `visualFidelity` settings were removed; do not reintroduce tier branches. The only motion reduction respected is the OS-level `prefers-reduced-motion` (via `prefersReducedMotion()`), which is kept purely as an accessibility/GPU accommodation and skips the heaviest per-frame WebGL loops (the marker plasma and the break-splash fracture).
- **WebGL performance budget** (tuned for smooth mid-tier devices — keep these in check):
  - Ground turn-markers are **baked once** to sprite sheets (`getMarkerSheets`); only the `activeHigh` + `next` sheets are baked (no third "balanced" sheet). The per-frame cost is a textured-quad blit + cross-fade, not a live shader.
  - The guard-break splash fracture is **baked once** at `SPLASH_BAKE_SIZE`²×`SPLASH_BAKE_FRAMES` (1024²×16 ≈ 67MB VRAM). Don't bump these back to 1280²/18 (~118MB) without a reason — 1024² is crisp to ~1440p.
  - `FX_SUPERSAMPLE` (card portrait FX) is `1.25`. Each step up squares the fragment cost; raising it past ~1.5 noticeably loads mid-tier GPUs when several cards are broken/dying.
  - The card FX loop (`CardFXManager._tick`) is rAF-driven and **throttled to 30fps** (`_frameMs`); the token-overlay gauge paint self-throttles to ~30fps. The break/dying **token** status overlays still run live procedural shaders per canvas frame — if that ever becomes a hotspot, bake them like the markers rather than adding a quality setting.
- **Ad hoc cards**: GM-created initiative entries for hazards/effects/NPC turns, with persistent vs one-shot lifecycle (`ADHOC_LIFECYCLE`). Backed by a hidden actor when needed (`createActorBackedAdhocCombatant`).

## Conventions

- **Foundry v13 globals are used freely** — `game`, `ui`, `canvas`, `Hooks`, `PIXI`, `foundry.*` are referenced directly as runtime globals. There is no bundler, but the runtime **does** use native ES `import`/`export` between the `scripts/*.mjs` modules. Keep `constants.mjs`/`util.mjs`/`conditions.mjs`/`gl.mjs` as leaf modules (they must not import from the entry); `token-overlay.mjs` may import the few helpers the entry exports.
- **Localization**: every user-facing string has a `GLUNI.`-prefixed key in `lang/en.json` AND a mirror entry in `LOCALIZATION_FALLBACKS` in `constants.mjs`. When you add a string, update **both**. Retrieve via `localize(key)` / `formatLocalized(key, data)` (in `util.mjs`).
- **Always escape** dynamic content injected into HTML/CSS with `escapeHTML`, `escapeAttr`, `escapeCSSIdentifier` — the overlay builds markup as strings.
- **CSS**: all styles in the single CSS file; class names follow the overlay's existing BEM-ish naming. The JS always emits the cinematic/best-tier classes (`gluni-*-splash--cinematic`, etc.); there are no longer `--reduced`/`--default`/`gluni-fidelity--balanced` variants emitted from JS (some dead tier rules may still linger in the CSS — safe to prune).
- **Animations** are FLIP-style and always run at full cinematic strength. Match the motion language documented in `docs/implementation-spec.md` and `docs/mockups/_build/*.md`.
- Keep changes consistent with `docs/implementation-spec.md` — it is the source of truth for intended behavior.

## Versioning & release

- Bump `version` in `module.json` and update the `download` URL to match the new tag (`v<version>/gluniverse-initiative.zip`). The `manifest` URL points at `releases/latest`.
- Releases are published as GitHub releases containing `module.json` and a `gluniverse-initiative.zip`. The zip must contain the module files **at its root** so Foundry installs directly from the manifest URL. There is no automated CI/workflow — packaging is manual.
- Commit messages follow a `Release vX.Y.Z <summary>` style for releases and conventional `feat:` / `fix:` / `chore:` style for incremental work (see `git log`).

## Working in this repo

- **No tests/lint/build to run.** "Correctness" means matching the spec and not breaking Foundry v13 APIs. Verify behavior by reasoning about the hook flow and, where possible, in a real Foundry v13 world — UI/animation correctness can't be confirmed by static checks alone; say so rather than claiming a visual change works.
- **Cheap static checks for the JS:** run `node --check scripts/<file>.mjs` for syntax, and verify the whole import graph links with:
  `node --input-type=module -e "import('./scripts/gluniverse-initiative.mjs').then(()=>{}).catch(e=>console.log(e.name+': '+e.message.split('\n')[0]))"`
  A clean link prints `ReferenceError: Hooks is not defined` (the entry's first top-level Foundry-global access) — that means every cross-module `import`/`export` resolved. A `SyntaxError: ... does not provide an export named X` means a missing export. Note this does **not** catch a name that's *used inside a function body but never imported* (that's only a runtime `ReferenceError` in Foundry), so when moving code, re-import every symbol the moved code references.
- The entry module is still large; prefer targeted `Edit`s over rewrites. Search by constant/method name (the method list is dense and well-named).
- The HTML files under `docs/mockups/` and `.superpowers/` are design references/prototypes, not shipped code.

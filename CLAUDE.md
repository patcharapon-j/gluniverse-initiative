# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

**GLUniverse Initiative** is a [Foundry VTT](https://foundryvtt.com) **v13** module that renders a cinematic, portrait-first initiative overlay on top of the default combat tracker (it complements, never replaces, the core tracker). It is system-agnostic with extra handling for PF2e (Delay, dying, etc.).

There is **no build step, no package manager, and no test suite**. The repository ships as raw Foundry module files. Foundry loads the ES module and CSS directly as declared in `module.json`.

## Repository layout

```
module.json            Foundry manifest: id, version, compatibility, esmodules, styles, languages
scripts/
  gluniverse-initiative.mjs   The entire runtime (~4200 lines, single ES module)
styles/
  gluniverse-initiative.css   All styling (~4950 lines)
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

Everything lives in `scripts/gluniverse-initiative.mjs`. Structure top-to-bottom:

1. **Constants** — `MODULE_ID`, `SOCKET_NAME`, `SETTINGS`, `FLAGS`, `VISIBILITY`, `ADHOC_*`, `TOKEN_OVERLAY_PALETTE`, `PORTRAIT_FRAME_*`, and `LOCALIZATION_FALLBACKS` (inline fallbacks so the UI works even if `lang/en.json` fails to load).
2. **Hook registration** (top level, ~line 245) — `init`/`ready` bootstrap, plus `Combat`/`Combatant`/`Actor`/`Item` document hooks that call `overlay?.renderSoon()` or targeted handlers. Also `getApplication*HeaderButtons` / `renderApplicationV1/V2` (actor-sheet portrait-framing button), `renderTokenHUD` (guard-break button), `combatRound`, `canvasReady`.
3. **`class GLUniverseInitiativeOverlay`** (~line 535–2509) — the core. Owns a single DOM root appended to `document.body`. Builds a view model from the active `Combat`, renders cards, runs FLIP-style turn/round animations, and handles all GM controls, visibility modes, ad hoc cards, delay/return, guard break, initiative adjustment, and the GM/player socket protocol for `End Turn`.
4. **Free functions** — portrait resolution/scaling, initiative math (`chooseInitiativeBetween`, `makeUniqueInitiative`), PF2e helpers (`getPF2eDyingState`, `getConditionValue`), portrait-framing dialog, ad hoc dialog, and small utilities (`localize`, `escapeHTML`, `clamp`, `wait`, …).
5. **`class TokenOverlayManager`** (~line 3341–4101) — draws PIXI/canvas status overlays on tokens (delay, guard break) on the active scene.

### Key concepts

- **Single mounted DOM root**: the overlay is one element on `document.body`, re-rendered via `render()` / debounced `renderSoon()`. Turn changes capture rects (`captureItemRects`) and run FLIP animations (`animateTurnChange`).
- **Per-combatant state lives in flags** under `MODULE_ID` — see `FLAGS` (`visibility`, `manualDelayed`, `guardBroken`, `adhoc`, `adhocActor`). Per-actor portrait framing is stored under `FLAGS.portraitFrame` on the Actor so it persists across combats/tokens.
- **Visibility modes** (`VISIBILITY`): `auto`, `visible`, `hidden`, `mystery`. Hidden actors must never leak through delay state, hover, or round wrapping — preserve this when editing visibility/hover code.
- **GM vs player**: only the GM drags the rail (position is a world setting synced to all). Players who own the active combatant get an `End Turn` button; the request is socketed (`SOCKET_NAME`) to the GM client and validated against active-combatant ownership before advancing combat. See `requestEndTurn` / `onSocketEndTurnRequest` / `isPrimaryActiveGM`.
- **Settings** (`SETTINGS`, registered in `registerSettings`): `enabled` (client), and world-synced `edge`, `visibleCount`, `animationIntensity`, `showDefeated`, `position`, `uiScale`, `tokenOverlayShape`, `visualFidelity`.
- **Ad hoc cards**: GM-created initiative entries for hazards/effects/NPC turns, with persistent vs one-shot lifecycle (`ADHOC_LIFECYCLE`). Backed by a hidden actor when needed (`createActorBackedAdhocCombatant`).

## Conventions

- **Plain Foundry v13 globals** — use `game`, `ui`, `canvas`, `Hooks`, `foundry.*` APIs directly. No imports, no bundler. Use modern ES module syntax (already `.mjs`).
- **Localization**: every user-facing string has a `GLUNI.`-prefixed key in `lang/en.json` AND a mirror entry in `LOCALIZATION_FALLBACKS` at the top of the script. When you add a string, update **both**. Retrieve via `localize(key)` / `formatLocalized(key, data)`.
- **Always escape** dynamic content injected into HTML/CSS with `escapeHTML`, `escapeAttr`, `escapeCSSIdentifier` — the overlay builds markup as strings.
- **CSS**: all styles in the single CSS file; class names follow the overlay's existing BEM-ish naming. Visual fidelity tiers (`high`/`balanced`) gate expensive effects (real frosted glass, motion blur) — respect them for GPU cost.
- **Animations** are FLIP-style and intensity-aware (`animationIntensity`, `reduced`/`default`/`cinematic`). Match the motion language documented in `docs/implementation-spec.md` and `docs/mockups/_build/*.md`.
- Keep changes consistent with `docs/implementation-spec.md` — it is the source of truth for intended behavior.

## Versioning & release

- Bump `version` in `module.json` and update the `download` URL to match the new tag (`v<version>/gluniverse-initiative.zip`). The `manifest` URL points at `releases/latest`.
- Releases are published as GitHub releases containing `module.json` and a `gluniverse-initiative.zip`. The zip must contain the module files **at its root** so Foundry installs directly from the manifest URL. There is no automated CI/workflow — packaging is manual.
- Commit messages follow a `Release vX.Y.Z <summary>` style for releases and conventional `feat:` / `fix:` / `chore:` style for incremental work (see `git log`).

## Working in this repo

- **No tests/lint/build to run.** "Correctness" means matching the spec and not breaking Foundry v13 APIs. Verify behavior by reasoning about the hook flow and, where possible, in a real Foundry v13 world — UI/animation correctness can't be confirmed by static checks alone; say so rather than claiming a visual change works.
- The two source files are large; prefer targeted `Edit`s over rewrites. Search by constant/method name (the method list is dense and well-named).
- The HTML files under `docs/mockups/` and `.superpowers/` are design references/prototypes, not shipped code.

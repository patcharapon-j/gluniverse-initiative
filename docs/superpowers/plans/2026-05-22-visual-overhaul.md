# GLUniverse Initiative — Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing tactical-HUD initiative overlay with an architectural, line-driven Endfield-inspired visual treatment — notched-corner cards, sheen-sweep active enter, punch-in round splash — without touching data shape, hooks, or settings.

**Architecture:** Single-module Foundry VTT v13 module. All work happens in three files: `styles/gluniverse-initiative.css` (full rewrite of visual rules, ~1300 lines → ~1500 lines), `scripts/gluniverse-initiative.mjs` (template strings for `renderCombatantCard`, `renderDelayedSection`, `showRoundSplash`, plus splash-timing helpers; everything else untouched), `lang/en.json` (one new string). No new files. No new hooks. No data migration.

**Tech Stack:** Vanilla ES modules, vanilla CSS (custom properties, `clip-path`, `@keyframes`), Foundry VTT v13 hook API.

**Source of truth:** Design spec at `docs/superpowers/specs/2026-05-22-visual-overhaul-design.md`. When the plan and spec disagree, the plan wins (the plan reflects implementation refinements discovered while writing it).

**Working directory:** `C:\Users\patch\AppData\Local\FoundryVTT\Data\modules\gluniverse-initiative\`

**Git note:** This module is not currently a git repo. Task 0 initializes it. If you prefer to skip version control, ignore the commit steps in each task — they don't affect correctness.

**Manual-verification model:** This project has no automated test suite. Each task ends with a **Manual smoke test** the engineer runs in a live Foundry world (PF2e or generic), and a commit. Treat "the visual matches the spec" as the success criterion.

---

## File responsibilities

| File | Responsibility | Touched by tasks |
|---|---|---|
| `styles/gluniverse-initiative.css` | All visual rules: tokens, card chrome, splash chrome, motion keyframes, motion tier overrides, media queries | 1, 3–24 |
| `scripts/gluniverse-initiative.mjs` | Template strings (`renderCombatantCard`, `renderDelayedSection`, `showRoundSplash`), splash-timing constants (`getRoundSplashHold`, `getRoundSplashDuration`), ghost clone clip-path preservation | 4, 7, 8, 10, 13, 15, 18 |
| `lang/en.json` | Localization: `GLUNI.Splash.Cycle` | 2 |

No other files are created or modified.

---

## Task 0: Initialize git repository (one-time setup)

**Files:**
- Create: `.gitignore`

**Why:** Each subsequent task commits its work. The module directory is not currently a git repo. Skip this task and all `git` steps if you don't want version control.

- [ ] **Step 1: Check whether git is already initialized**

```bash
git rev-parse --is-inside-work-tree
```

If this prints `true`, skip to Step 4. Otherwise continue.

- [ ] **Step 2: Initialize the repo**

```bash
git init
git branch -m main
```

- [ ] **Step 3: Add a `.gitignore`**

Create `.gitignore` at the module root with:

```
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
node_modules/
```

- [ ] **Step 4: Baseline commit**

```bash
git add -A
git commit -m "chore: baseline before visual overhaul"
```

Expected: A commit containing all current module files. If nothing to commit, the repo is already up-to-date — proceed.

---

## Task 1: Replace `:root` design tokens

**Files:**
- Modify: `styles/gluniverse-initiative.css:1-11`

**Why:** Spec Section 1. All subsequent CSS references these tokens; everything downstream depends on them. Removes `--gluni-gold` (neutral becomes white), adds motion tokens and new line/text tokens.

- [ ] **Step 1: Replace the existing `:root` block**

In `styles/gluniverse-initiative.css`, replace the current `:root` block (lines 1–11) with:

```css
:root {
  --gluni-cyan:        #5eeaff;
  --gluni-white:       #f3fbff;
  --gluni-red:         #ff335f;
  --gluni-violet:      #b497ff;
  --gluni-ink:         #02070b;
  --gluni-line:        rgba(244, 252, 255, 0.10);
  --gluni-line-strong: rgba(244, 252, 255, 0.55);
  --gluni-text-dim:    rgba(243, 251, 255, 0.62);

  --gluni-ease:        cubic-bezier(0.16, 1, 0.3, 1);
  --gluni-snap:        cubic-bezier(0.2, 1.35, 0.22, 1);
  --gluni-exit:        cubic-bezier(0.55, 0, 0.84, 0);
  --gluni-d-quick:     180ms;
  --gluni-d-card:      420ms;
  --gluni-d-splash-in: 720ms;
  --gluni-d-splash-out: 460ms;
}
```

- [ ] **Step 2: Update neutral disposition to point at white**

Find:

```css
.gluni-card--neutral {
  --gluni-accent: var(--gluni-gold);
}
```

Replace with:

```css
.gluni-card--neutral {
  --gluni-accent: var(--gluni-white);
}
```

- [ ] **Step 3: Manual smoke test**

1. Launch Foundry, load a world, start a combat.
2. Open browser dev tools, check console — no CSS-parse errors.
3. Make at least one combatant have neutral disposition. Confirm its accent bar is white (not gold).
4. Cyan / red / violet dispositions still render correctly (no change yet).

- [ ] **Step 4: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): replace design tokens — neutral is white, motion tokens added"
```

---

## Task 2: Add `GLUNI.Splash.Cycle` localization string

**Files:**
- Modify: `lang/en.json`

**Why:** Spec Section 5 sub-string requires localizable copy. New key added now so later tasks can reference `localize("GLUNI.Splash.Cycle")`.

- [ ] **Step 1: Add the key**

In `lang/en.json`, find the line:

```json
  "GLUNI.Round": "Round",
```

Add immediately above it:

```json
  "GLUNI.Splash.Cycle": "INITIATIVE · CYCLE — {round}",
```

The full vicinity should now read:

```json
  "GLUNI.PortraitConfig.Reset": "Reset",
  "GLUNI.PortraitConfig.Save": "Save",
  "GLUNI.Splash.Cycle": "INITIATIVE · CYCLE — {round}",
  "GLUNI.Round": "Round",
  "GLUNI.Unknown": "Unknown",
  "GLUNI.Delayed": "Delayed"
```

- [ ] **Step 2: Manual smoke test**

1. Reload Foundry. No console errors about missing JSON keys.
2. Open dev console and run: `game.i18n.format("GLUNI.Splash.Cycle", { round: 7 })`.
3. Expected: `"INITIATIVE · CYCLE — 7"`.

- [ ] **Step 3: Commit**

```bash
git add lang/en.json
git commit -m "feat(visual): add splash cycle locale string"
```

---

## Task 3: Card silhouette — notched-block clip-path

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `.gluni-card` block (currently lines 162–198) and `.gluni-card::before` (lines 200–209), `.gluni-card::after` (lines 211–223)

**Why:** Spec Section 2 Silhouette. Replaces 5px border-radius + rectangular border with a notched-corner clip-path. Removes the scanline `::after` overlay. Border becomes an inset box-shadow because `clip-path` strips standard borders (this is a refinement on the spec's "::before overlay" instruction — `inset box-shadow` is more reliable, identical visually, and frees `::before` for the scrim).

- [ ] **Step 1: Replace the `.gluni-card` rule**

In `styles/gluniverse-initiative.css`, replace the entire `.gluni-card { ... }` block (the rule starting `.gluni-card {` at line 162, through its closing brace at line 198) with:

```css
.gluni-card {
  --gluni-flip-x: 0px;
  --gluni-flip-y: 0px;
  --gluni-active-shift: 0px;
  --gluni-card-scale: 1;
  --gluni-portrait-normal-x: 54%;
  --gluni-portrait-normal-y: 24%;
  --gluni-portrait-normal-scale: 1.06;
  --gluni-portrait-active-x: 55%;
  --gluni-portrait-active-y: 12%;
  --gluni-portrait-active-scale: 1.2;
  position: relative;
  isolation: isolate;
  display: grid;
  align-items: end;
  justify-self: stretch;
  width: 100%;
  min-height: 58px;
  background: var(--gluni-ink);
  box-shadow: inset 0 0 0 1px var(--gluni-line);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
  transform:
    translate(var(--gluni-flip-x), var(--gluni-flip-y))
    translateX(var(--gluni-active-shift))
    scale(var(--gluni-card-scale));
  transform-origin: center;
  transition:
    min-height var(--gluni-d-card) var(--gluni-ease),
    width var(--gluni-d-card) var(--gluni-ease),
    transform var(--gluni-d-card) var(--gluni-snap),
    box-shadow var(--gluni-d-quick) var(--gluni-ease),
    filter var(--gluni-d-quick) var(--gluni-ease),
    opacity var(--gluni-d-quick) var(--gluni-ease);
}
```

Note: `border`, `border-radius`, and `overflow: hidden` are removed (clip-path implies clipping; no border needed). The body fill becomes `--gluni-ink` (no gradient).

- [ ] **Step 2: Replace `.gluni-card::before` (scrim)**

Replace the `.gluni-card::before { ... }` block with:

```css
.gluni-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    95deg,
    rgba(2, 5, 8, 0.95),
    rgba(2, 5, 8, 0.48) 50%,
    rgba(2, 5, 8, 0)
  );
  pointer-events: none;
}
```

The scrim is heaviest on the leading edge so the name and chip always read on top of the portrait.

- [ ] **Step 3: Mirror the scrim for left-anchored rail**

Immediately after the `.gluni-card::before` block, add:

```css
.gluni-initiative--left .gluni-card::before {
  background: linear-gradient(
    -95deg,
    rgba(2, 5, 8, 0.95),
    rgba(2, 5, 8, 0.48) 50%,
    rgba(2, 5, 8, 0)
  );
}
```

- [ ] **Step 4: Remove the `.gluni-card::after` scanline overlay**

Delete the entire `.gluni-card::after { ... }` block (currently lines 211–223). Save no replacement — `::after` is now unused on the card.

- [ ] **Step 5: Manual smoke test**

1. Reload Foundry. Start combat with multiple combatants.
2. Confirm: cards have a 12px diagonal cut at the top-trailing corner (top-right on a right-anchored rail).
3. Confirm: no scanline texture inside the card body.
4. Confirm: 1px subtle line around each card (the inset box-shadow border).
5. Confirm: card height is ~58px inactive.

- [ ] **Step 6: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): apply notched-block silhouette to cards"
```

---

## Task 4: L-bracket marker + remove vignette

**Files:**
- Modify: `scripts/gluniverse-initiative.mjs:391-412` (`renderCombatantCard`)
- Modify: `styles/gluniverse-initiative.css` — `.gluni-card-vignette` block (lines 277–287); add new `.gluni-card-bracket` block

**Why:** Spec Section 2. Removes the corner-bloom vignette that fights the diagonal cut; adds the L-bracket marker (architectural detail that mirrors the leading edge).

- [ ] **Step 1: Update the card template**

In `scripts/gluniverse-initiative.mjs`, find the `renderCombatantCard(card)` method (starts around line 378). Replace its return template literal with:

```javascript
    return `
      <article class="${classes}" data-gluni-key="${escapeAttr(card.key)}" data-combatant-id="${card.id}"${style}>
        <div class="gluni-card-accent" aria-hidden="true"></div>
        <div class="gluni-card-bracket" aria-hidden="true"></div>
        ${game.user.isGM ? this.renderGMVisibilityMarker(card) : ""}
        <div class="gluni-card-portrait-wrap">
          ${card.mystery
            ? `<div class="gluni-card-mystery-mark" aria-hidden="true">?</div>`
            : `<img class="gluni-card-portrait" src="${escapeAttr(card.portrait)}" alt="" loading="lazy">`}
        </div>
        <div class="gluni-card-content">
          <div class="gluni-card-kicker">
            ${card.active ? `<span class="gluni-active-tag">TURN</span>` : ""}
            ${card.delayed ? `<span class="gluni-delayed-tag">${localize("GLUNI.Delayed").toUpperCase()}</span>` : ""}
          </div>
          <h3>${escapeHTML(card.name)}</h3>
          <span class="gluni-initiative-badge">${formatInitiative(card.initiative)}</span>
        </div>
        ${card.active ? `<div class="gluni-card-sheen" aria-hidden="true"></div>` : ""}
        ${game.user.isGM ? this.renderGMControls(card) : ""}
      </article>
    `;
```

The differences from the current template:
- `<div class="gluni-card-vignette" aria-hidden="true"></div>` is removed.
- `<div class="gluni-card-bracket" aria-hidden="true"></div>` is added immediately after `.gluni-card-accent`.
- `<div class="gluni-card-sheen" aria-hidden="true"></div>` is added on active cards (used by Task 7).

- [ ] **Step 2: Remove `.gluni-card-vignette` CSS**

In `styles/gluniverse-initiative.css`, delete the entire `.gluni-card-vignette { ... }` block (currently lines 277–287). Also delete the `.gluni-card--active .gluni-card-vignette { ... }` block (currently lines 416–422).

- [ ] **Step 3: Add `.gluni-card-bracket` CSS**

Insert immediately after the `.gluni-card-accent` block (around line 232):

```css
.gluni-card-bracket {
  position: absolute;
  top: 6px;
  z-index: 8;
  width: 8px;
  height: 8px;
  pointer-events: none;
  border-top: 1px solid var(--gluni-line-strong);
  border-left: 1px solid var(--gluni-line-strong);
  transition: border-color var(--gluni-d-quick) var(--gluni-ease);
}

.gluni-initiative--right .gluni-card-bracket {
  left: 8px;
}

.gluni-initiative--left .gluni-card-bracket {
  right: 8px;
  border-left: 0;
  border-right: 1px solid var(--gluni-line-strong);
}
```

- [ ] **Step 4: Mirror the accent bar for left-anchored rail**

Find the existing `.gluni-card-accent` block and replace it with:

```css
.gluni-card-accent {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 7;
  width: 3px;
  background: var(--gluni-accent, var(--gluni-cyan));
  box-shadow: 0 0 16px var(--gluni-accent, var(--gluni-cyan));
  transition: width var(--gluni-d-quick) var(--gluni-ease),
              box-shadow var(--gluni-d-quick) var(--gluni-ease);
}

.gluni-initiative--right .gluni-card-accent {
  left: 0;
}

.gluni-initiative--left .gluni-card-accent {
  right: 0;
}
```

- [ ] **Step 5: Manual smoke test**

1. Reload Foundry, start combat.
2. Every card shows a small L-bracket at its top-leading corner (top-left for right-anchored rail; top-right for left-anchored rail).
3. No corner-bloom highlight inside the cards.
4. Switch rail setting between "Left" and "Right" — bracket and accent mirror correctly.

- [ ] **Step 6: Commit**

```bash
git add scripts/gluniverse-initiative.mjs styles/gluniverse-initiative.css
git commit -m "feat(visual): add L-bracket marker, remove vignette bloom"
```

---

## Task 5: Card content typography + notched initiative chip

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `.gluni-card-content` (lines 289–298), `.gluni-card h3` (lines 328–341), `.gluni-initiative-badge` (lines 343–357), `.gluni-active-tag` / `.gluni-delayed-tag` (lines 308–326)

**Why:** Spec Section 2 typography + initiative chip. Names jump to 12px inactive / 16px active. Chip gets matching diagonal-cut clip-path. Active tag becomes architectural rather than candy.

- [ ] **Step 1: Update name and content paddings**

Replace the `.gluni-card-content { ... }` block with:

```css
.gluni-card-content {
  position: relative;
  z-index: 8;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 3px 6px;
  align-items: end;
  min-width: 0;
  padding: 8px 9px 9px 12px;
}
```

Replace the `.gluni-card h3 { ... }` block with:

```css
.gluni-card h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--gluni-white);
  font-size: 12px;
  font-weight: 950;
  line-height: 1.04;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
  transition: font-size var(--gluni-d-quick) var(--gluni-ease),
              color var(--gluni-d-quick) var(--gluni-ease);
}
```

- [ ] **Step 2: Reshape the initiative chip**

Replace the `.gluni-initiative-badge { ... }` block with:

```css
.gluni-initiative-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 18px;
  padding: 0 5px;
  color: var(--gluni-white);
  background: rgba(2, 7, 11, 0.78);
  font-size: 12px;
  font-weight: 950;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);
  transition: background var(--gluni-d-quick) var(--gluni-ease),
              color var(--gluni-d-quick) var(--gluni-ease),
              min-width var(--gluni-d-quick) var(--gluni-ease),
              height var(--gluni-d-quick) var(--gluni-ease),
              font-size var(--gluni-d-quick) var(--gluni-ease);
}
```

The chip now uses the same diagonal-cut motif as the card, scaled to 4px.

- [ ] **Step 3: Restyle the active and delayed tags**

Replace the `.gluni-active-tag, .gluni-delayed-tag { ... }` block (and the standalone `.gluni-delayed-tag` block that follows it) with:

```css
.gluni-active-tag,
.gluni-delayed-tag {
  display: inline-flex;
  align-items: center;
  height: 12px;
  padding: 0 5px;
  color: var(--gluni-ink);
  background: var(--gluni-accent, var(--gluni-cyan));
  font-size: 7px;
  font-weight: 950;
  letter-spacing: 0.22em;
  line-height: 1;
  clip-path: polygon(2px 0, 100% 0, 100% 100%, 0 100%, 0 2px);
}

.gluni-delayed-tag {
  color: var(--gluni-violet);
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--gluni-violet);
}
```

- [ ] **Step 4: Manual smoke test**

1. Reload Foundry. Start combat.
2. Inactive cards: name reads at 12px, mono Bahnschrift, tracked. Initiative chip has small diagonal cut at top-left.
3. Active "TURN" tag appears boxy and short, in disposition color with ink-color text.
4. Delayed combatants (if any): "DELAYED" tag has violet outline.

- [ ] **Step 5: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): notched initiative chip and tightened card typography"
```

---

## Task 6: Active card resting state

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `.gluni-card--active` block (currently lines 359–368) and related active rules through line 446

**Why:** Spec Section 3 resting state. Active card grows to 124px, accent bar to 4px with doubled glow, L-bracket recolors to accent, chip fills with accent, name jumps to 16px. The active card's clip-path extends upward 28px so the portrait can "rise out" of the card silhouette.

- [ ] **Step 1: Replace `.gluni-card--active`**

Replace the entire `.gluni-card--active { ... }` block with:

```css
.gluni-card--active {
  --gluni-card-scale: 1.02;
  width: calc(100% + 12px);
  min-height: 124px;
  overflow: visible;
  background: var(--gluni-ink);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 60%, var(--gluni-line) 40%);
  clip-path: polygon(
    0 -28px,
    calc(100% - 14px) -28px,
    100% calc(-28px + 14px),
    100% 100%,
    0 100%
  );
}
```

The clip-path now extends 28px above the card's layout box so the portrait wrap (which sits at `top: -28px`) is painted inside the notched silhouette.

- [ ] **Step 2: Strengthen the accent bar on active cards**

Insert immediately after the active block:

```css
.gluni-card--active .gluni-card-accent {
  width: 4px;
  box-shadow: 0 0 24px var(--gluni-accent, var(--gluni-cyan));
}
```

- [ ] **Step 3: Recolor the bracket on active**

Insert next:

```css
.gluni-card--active .gluni-card-bracket {
  top: -22px;
  border-top-color: var(--gluni-accent, var(--gluni-cyan));
  border-left-color: var(--gluni-accent, var(--gluni-cyan));
}

.gluni-initiative--left .gluni-card--active .gluni-card-bracket {
  border-right-color: var(--gluni-accent, var(--gluni-cyan));
}
```

(The bracket repositions into the 28px-above extension so it sits at the visual top of the new silhouette.)

- [ ] **Step 4: Update active card portrait positioning**

Find the existing `.gluni-card--active .gluni-card-portrait-wrap` and `.gluni-card--active .gluni-card-portrait` rules. Replace both with:

```css
.gluni-card--active .gluni-card-portrait-wrap {
  top: -28px;
  height: calc(100% + 28px);
  clip-path: polygon(
    0 0,
    calc(100% - 14px) 0,
    100% 14px,
    100% 100%,
    0 100%
  );
}

.gluni-card--active .gluni-card-portrait {
  object-position: var(--gluni-portrait-active-x) var(--gluni-portrait-active-y);
  transform: scale(var(--gluni-portrait-active-scale));
}
```

The portrait wrap matches the card's extended clip silhouette, so the portrait paints across the full 152px region (124 + 28 above) and clips cleanly at the diagonal.

- [ ] **Step 5: Update the active card scrim and active::after**

Replace the `.gluni-card--active::before` block with:

```css
.gluni-card--active::before {
  top: auto;
  bottom: 0;
  height: 64px;
  background: linear-gradient(
    95deg,
    rgba(2, 5, 8, 0.94),
    rgba(2, 5, 8, 0.46) 52%,
    rgba(2, 5, 8, 0)
  );
}

.gluni-initiative--left .gluni-card--active::before {
  background: linear-gradient(
    -95deg,
    rgba(2, 5, 8, 0.94),
    rgba(2, 5, 8, 0.46) 52%,
    rgba(2, 5, 8, 0)
  );
}
```

Delete the existing `.gluni-card--active::after { ... }` block entirely.

- [ ] **Step 6: Update active typography and chip fill**

Replace the existing `.gluni-card--active h3` and `.gluni-card--active .gluni-initiative-badge` rules with:

```css
.gluni-card--active h3 {
  font-size: 16px;
  letter-spacing: 0.08em;
}

.gluni-card--active .gluni-initiative-badge {
  min-width: 32px;
  height: 22px;
  padding: 0 7px;
  color: var(--gluni-ink);
  background: var(--gluni-accent, var(--gluni-cyan));
  font-size: 14px;
}
```

- [ ] **Step 7: Manual smoke test**

1. Reload Foundry. Start combat — first combatant becomes active.
2. Active card is visibly taller (~124px), 12px wider than rail, slight outward overhang.
3. Accent edge is 4px wide, glows brighter.
4. L-bracket marker is in disposition-accent color (cyan/red/violet/white), positioned just above the visual top of the card.
5. Portrait shows head-and-chest framing extending above the inactive-card baseline.
6. Initiative chip filled with accent color, larger (14px text inside a ~22px chip), still notched.
7. Name reads at 16px, uppercase, tracked.
8. Cycle turns a few times — each new active card receives this treatment (animation is still the old `gluni-active-signal`; sheen sweep comes in Task 7).

- [ ] **Step 8: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): active card resting state — taller, brighter accent, raised portrait"
```

---

## Task 7: Sheen-sweep active-enter motion

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `.gluni-card--active-entering` (line 658), `gluni-active-signal` keyframe (lines 1053–1071), `gluni-active-portrait`, `gluni-active-mystery`, `gluni-active-content`
- (The sheen `<div>` was already added to the card template in Task 4.)

**Why:** Spec Section 3 active-enter motion. Replaces the box-shadow pulse with a horizontal sheen line that draws across the top-third of the card. This is the same vocabulary used by the round splash, tying turn-change to round-change motion.

- [ ] **Step 1: Add the sheen element CSS**

Insert (anywhere in the card section, but near the L-bracket rules is logical):

```css
.gluni-card-sheen {
  position: absolute;
  top: 32%;
  height: 1px;
  z-index: 9;
  background: linear-gradient(
    90deg,
    transparent,
    var(--gluni-accent, var(--gluni-cyan)) 24%,
    var(--gluni-accent, var(--gluni-cyan)) 76%,
    transparent
  );
  box-shadow: 0 0 14px color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 70%, transparent);
  opacity: 0;
  pointer-events: none;
  transform-origin: left center;
  transform: scaleX(0);
}

.gluni-initiative--right .gluni-card-sheen {
  left: 8px;
  right: 8px;
  transform-origin: left center;
}

.gluni-initiative--left .gluni-card-sheen {
  left: 8px;
  right: 8px;
  transform-origin: right center;
}
```

- [ ] **Step 2: Replace `gluni-active-signal` keyframe with `gluni-card-sheen-draw`**

Delete the entire `@keyframes gluni-active-signal { ... }` block (lines 1053–1071).

Add in its place:

```css
@keyframes gluni-card-sheen-draw {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scaleX(1);
  }
}
```

- [ ] **Step 3: Wire the sheen to active-entering**

Find the line `.gluni-card--active-entering { animation: gluni-active-signal 620ms var(--gluni-snap) both; }` and replace it with:

```css
.gluni-card--active-entering .gluni-card-sheen {
  animation: gluni-card-sheen-draw 360ms var(--gluni-ease) 140ms both;
}
```

The 140ms delay lets the FLIP grow and portrait expand start first; the sheen runs from 140ms to 500ms (matching the spec's "Sheen line 140–500ms" row).

- [ ] **Step 4: Reduce the brightness peak of the active enter**

The previous `gluni-active-portrait` keyframe used `filter: contrast(1.16) saturate(1.18)` mid-frame. Keep it — it pairs well with the sheen.

The previous `.gluni-card.gluni-item--entering.gluni-card--active-entering` combined-animation rule (the one declaring both `gluni-card-enter` and `gluni-active-signal`) needs the second animation reference removed. Find:

```css
.gluni-card.gluni-item--entering.gluni-card--active-entering {
  animation:
    gluni-card-enter 420ms var(--gluni-snap) both,
    gluni-active-signal 620ms var(--gluni-snap) both;
}
```

Replace with:

```css
.gluni-card.gluni-item--entering.gluni-card--active-entering {
  animation: gluni-card-enter var(--gluni-d-card) var(--gluni-snap) both;
}
```

- [ ] **Step 5: Verify the `setTimeout` cleanup in mjs still fits**

In `scripts/gluniverse-initiative.mjs`, find:

```javascript
window.setTimeout(() => item.classList.remove("gluni-card--active-entering"), 680);
```

(There are two of these in `animateTurnChange`.) The sheen finishes at 140 + 360 = 500ms; 680ms cleanup is still safe. **No edit needed**; verify the timeouts exist.

- [ ] **Step 6: Brighten the L-bracket and chip in sync with the sheen**

The active card already inherits accent-color bracket and chip (from Task 6). The transitions on `color` / `background` (180ms, ease) start at the moment the `--active` class is added — that's frame 0, before the sheen. The visual effect: bracket and chip pop bright at the start; sheen passes shortly after. Acceptable per spec (the spec says "As it crosses, L-bracket pops bright" — at 180ms ease, the bracket reaches full brightness around the moment the sheen passes through it).

No additional change needed.

- [ ] **Step 7: Manual smoke test**

1. Reload Foundry, start combat with 3+ combatants. Cycle turns.
2. On each turn change: the new active card grows, portrait expands, and a 1px accent-color sheen line draws horizontally across the top-third of the card (leading-edge to trailing-edge for right-anchored rail).
3. The sheen has a soft glow trailing it.
4. After the sheen passes, the line fades out (no lingering bright line).
5. The previous box-shadow "ping" pulse is gone — the entrance is line-driven, not pulse-driven.

- [ ] **Step 8: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): sheen-sweep active-enter motion replaces signal pulse"
```

---

## Task 8: Ghost-exit motion update (clip-path inheritance)

**Files:**
- Modify: `scripts/gluniverse-initiative.mjs:567-586` (`createOutgoingGhost`, `playOutgoingGhost`)
- Modify: `styles/gluniverse-initiative.css` — `.gluni-card-ghost*` block (lines 684–698) and `gluni-active-exit-left` / `gluni-active-exit-right` keyframes (lines 1125–1151)

**Why:** Spec Section 3 active-exit + Risk Area #1. The active-exit ghost is cloned via `cloneNode(true)` and appended to `document.body`, where it loses CSS-class context. The active-card clip-path must be explicitly applied to the clone so the ghost retains the notched silhouette during its lateral exit.

- [ ] **Step 1: Explicitly assign clip-path to the ghost**

In `scripts/gluniverse-initiative.mjs`, find `createOutgoingGhost(edge)` (line 567). Replace the method with:

```javascript
  createOutgoingGhost(edge) {
    const activeCard = this.root?.querySelector(".gluni-card--active");
    if (!activeCard) return null;

    const rect = activeCard.getBoundingClientRect();
    const ghost = activeCard.cloneNode(true);
    ghost.querySelector(".gluni-card-controls")?.remove();
    ghost.querySelector(".gluni-card-sheen")?.remove();
    ghost.classList.add("gluni-card-ghost", `gluni-card-ghost--${edge}`);
    ghost.style.left = `${Math.round(rect.left)}px`;
    ghost.style.top = `${Math.round(rect.top)}px`;
    ghost.style.width = `${Math.round(rect.width)}px`;
    ghost.style.height = `${Math.round(rect.height)}px`;
    ghost.style.clipPath = "polygon(0 -28px, calc(100% - 14px) -28px, 100% calc(-28px + 14px), 100% 100%, 0 100%)";
    document.body.appendChild(ghost);
    return ghost;
  }
```

Differences:
- Removes the sheen `<div>` from the clone (so the sheen doesn't replay during exit).
- Explicitly sets `clipPath` to the same EXTENDED polygon used by the active card (the polygon starts at `0 -28px` so the ghost's visual silhouette extends 28px above its layout box, matching where the original active card was painting). This guarantees no visual jump between the original card and the ghost at frame 0 of the exit animation.

- [ ] **Step 2: Update `playOutgoingGhost` timing**

Replace `playOutgoingGhost(ghost)` (lines 583–586) with:

```javascript
  playOutgoingGhost(ghost) {
    window.requestAnimationFrame(() => ghost.classList.add("gluni-card-ghost--leave"));
    window.setTimeout(() => ghost.remove(), 540);
  }
```

(Trim from 560ms to 540ms to match the new 520ms exit + 20ms grace.)

- [ ] **Step 3: Update ghost CSS — base class**

In `styles/gluniverse-initiative.css`, replace the `.gluni-card-ghost { ... }` block with:

```css
.gluni-card-ghost {
  position: fixed;
  z-index: 89;
  pointer-events: none;
  margin: 0;
  /* clip-path is set inline by createOutgoingGhost so the cloned card keeps its silhouette. */
  transform: translateX(0) scale(1);
  background: var(--gluni-ink);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 60%, var(--gluni-line) 40%);
}
```

- [ ] **Step 4: Refresh the exit keyframes**

Replace `@keyframes gluni-active-exit-left { ... }` and `@keyframes gluni-active-exit-right { ... }` with:

```css
@keyframes gluni-active-exit-left {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-88px) scale(0.86);
    filter: blur(8px);
  }
}

@keyframes gluni-active-exit-right {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateX(88px) scale(0.86);
    filter: blur(8px);
  }
}
```

Replace the `.gluni-card-ghost--leave.gluni-card-ghost--left` and `--right` selectors' animations to:

```css
.gluni-card-ghost--leave.gluni-card-ghost--left {
  animation: gluni-active-exit-left 520ms var(--gluni-exit) forwards;
}

.gluni-card-ghost--leave.gluni-card-ghost--right {
  animation: gluni-active-exit-right 520ms var(--gluni-exit) forwards;
}
```

(Curve unified to the new `--gluni-exit` token; duration trimmed to 520ms.)

- [ ] **Step 5: Manual smoke test**

1. Reload Foundry, start combat.
2. Cycle through 3+ turns.
3. On each turn change: the outgoing active card detaches as a ghost and slides laterally (toward the play area: right for left-anchored rail, left for right-anchored rail).
4. The ghost retains the notched diagonal-cut silhouette while sliding/scaling/blurring.
5. No "ghost rectangle" appears (a misapplied clip-path symptom).

- [ ] **Step 6: Commit**

```bash
git add scripts/gluniverse-initiative.mjs styles/gluniverse-initiative.css
git commit -m "feat(visual): preserve notched silhouette on active-exit ghost"
```

---

## Task 9: Bottom-insertion and delay/return motions

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `gluni-card-enter-bottom` keyframe (lines 1020–1039), `gluni-card-rejoin` keyframe (lines 1041–1051), `gluni-item--entering-bottom` rule (line 646), `.gluni-card--outgoing-active` rule (line 680)

**Why:** Spec Section 3 bottom-insertion (~360ms) and delay/return (~520ms). Tighter, less candied motion.

- [ ] **Step 1: Refresh `gluni-card-enter-bottom`**

Replace the entire `@keyframes gluni-card-enter-bottom { ... }` block with:

```css
@keyframes gluni-card-enter-bottom {
  from {
    opacity: 0;
    transform:
      translate(var(--gluni-flip-x), var(--gluni-flip-y))
      translateY(10px)
      translateX(var(--gluni-active-shift))
      scale(0.985);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform:
      translate(0, 0)
      translateX(var(--gluni-active-shift))
      scale(var(--gluni-card-scale));
    filter: blur(0);
  }
}
```

(Already matches spec values; verify it matches.)

- [ ] **Step 2: Bind the enter-bottom rule to the new duration token**

Replace the rule `.gluni-item--entering-bottom { animation: gluni-card-enter-bottom 360ms var(--gluni-ease) both; }` with:

```css
.gluni-item--entering-bottom {
  animation: gluni-card-enter-bottom 360ms var(--gluni-ease) both;
}
```

(Same value — leave as is. Listed here so the engineer doesn't accidentally skip the line during a global find-replace.)

- [ ] **Step 3: Refresh `gluni-card-rejoin` (delay/return rejoin)**

Replace the `@keyframes gluni-card-rejoin { ... }` block with:

```css
@keyframes gluni-card-rejoin {
  from {
    opacity: 0;
    transform: translateY(12px) translateX(var(--gluni-active-shift)) scale(0.96);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(var(--gluni-active-shift)) scale(var(--gluni-card-scale));
    filter: blur(0);
  }
}
```

Replace `.gluni-card--outgoing-active { animation: gluni-card-rejoin 380ms var(--gluni-ease) both; }` with:

```css
.gluni-card--outgoing-active {
  animation: gluni-card-rejoin 440ms var(--gluni-ease) both;
}
```

- [ ] **Step 4: Refresh `gluni-card-enter`**

Replace the `@keyframes gluni-card-enter { ... }` block (lines 999–1018) with:

```css
@keyframes gluni-card-enter {
  from {
    opacity: 0;
    transform:
      translate(var(--gluni-flip-x), var(--gluni-flip-y))
      translateY(-14px)
      translateX(var(--gluni-active-shift))
      scale(0.96);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform:
      translate(0, 0)
      translateX(var(--gluni-active-shift))
      scale(var(--gluni-card-scale));
    filter: blur(0);
  }
}
```

(Slight tightening: 18px→14px, blur 4→3, scale 0.94→0.96 — keeps the motion architectural rather than dramatic.)

Replace `.gluni-item--entering { animation: gluni-card-enter 420ms var(--gluni-snap) both; }` with:

```css
.gluni-item--entering {
  animation: gluni-card-enter var(--gluni-d-card) var(--gluni-snap) both;
}
```

- [ ] **Step 5: Manual smoke test**

1. Reload Foundry. Start combat with 4+ combatants.
2. Advance several turns: the card sliding in at the bottom slides up from 10px, blur-clears, no excessive bounce.
3. Delay an active combatant (GM): card shrinks and slides into the delayed section. Return it: it grows back into the active slot with the rejoin animation.
4. No visible "jump" between FLIP and animation end.

- [ ] **Step 6: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): tighten card enter/rejoin motions"
```

---

## Task 10: Header chrome — round chip and drag handle

**Files:**
- Modify: `scripts/gluniverse-initiative.mjs:244-254` (the header in `render()`)
- Modify: `styles/gluniverse-initiative.css` — shared chip selector (lines 55–64), `.gluni-drag-handle` (lines 66–83), `.gluni-round-chip` (lines 128–153)

**Why:** Spec Section 4. Removes the `backdrop-filter: blur(8px)` and cyan inset glow. Replaces the round chip with a `ROUND ⋅ 02` layout (label + divider + numeral) with notched corner. Replaces the drag handle icon with a 3-line grip.

- [ ] **Step 1: Update the round chip template**

In `scripts/gluniverse-initiative.mjs`, find the `<header class="gluni-header">` block inside `render()` (lines 246–254). Replace it with:

```javascript
        <header class="gluni-header">
          <button class="gluni-drag-handle" type="button" title="Move tracker" aria-label="Move tracker" ${game.user.isGM ? "" : "disabled"}>
            <span class="gluni-drag-handle-grip" aria-hidden="true"></span>
          </button>
          <div class="gluni-round-chip">
            <span class="gluni-round-chip-label">${localize("GLUNI.Round").toUpperCase()}</span>
            <span class="gluni-round-chip-divider" aria-hidden="true"></span>
            <strong class="gluni-round-chip-num">${formatRound(combat.round)}</strong>
          </div>
        </header>
```

The drag handle replaces the FontAwesome icon with a CSS-drawn 3-line grip. The round chip introduces three child elements with distinct classes for label, divider, and numeral.

- [ ] **Step 2: Remove the shared chip background block**

In `styles/gluniverse-initiative.css`, find and DELETE the shared rule:

```css
.gluni-drag-handle,
.gluni-round-chip,
.gluni-turn-controls button,
.gluni-end-turn {
  border: 1px solid rgba(224, 246, 255, 0.18);
  border-radius: 4px;
  background: linear-gradient(135deg, rgba(7, 14, 19, 0.9), rgba(12, 23, 31, 0.76));
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.32), inset 0 0 18px rgba(94, 234, 255, 0.06);
  backdrop-filter: blur(8px);
}
```

(Each component will define its own chrome explicitly in the next steps — no more shared blur/glow.)

- [ ] **Step 3: Rewrite `.gluni-drag-handle`**

Replace the `.gluni-drag-handle { ... }` block (lines 66–74) and its `:disabled` and `--dragging` rules with:

```css
.gluni-drag-handle {
  display: grid;
  place-items: center;
  width: 24px;
  height: 22px;
  padding: 0;
  border: 0;
  background: var(--gluni-ink);
  box-shadow: inset 0 0 0 1px var(--gluni-line);
  color: var(--gluni-white);
  cursor: grab;
  clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);
  transition:
    box-shadow var(--gluni-d-quick) var(--gluni-ease);
}

.gluni-drag-handle:disabled {
  opacity: 0.28;
  cursor: default;
}

.gluni-drag-handle:hover:not(:disabled) {
  box-shadow:
    inset 0 0 0 1px var(--gluni-line-strong),
    inset 2px 0 0 var(--gluni-cyan);
}

.gluni-initiative--dragging .gluni-drag-handle {
  cursor: grabbing;
}

.gluni-drag-handle-grip {
  display: block;
  width: 12px;
  height: 8px;
  background:
    linear-gradient(rgba(243, 251, 255, 0.5), rgba(243, 251, 255, 0.5)) top / 100% 1px no-repeat,
    linear-gradient(rgba(243, 251, 255, 0.5), rgba(243, 251, 255, 0.5)) center / 100% 1px no-repeat,
    linear-gradient(rgba(243, 251, 255, 0.5), rgba(243, 251, 255, 0.5)) bottom / 100% 1px no-repeat;
  transition: background-color var(--gluni-d-quick) var(--gluni-ease);
}

.gluni-drag-handle:hover:not(:disabled) .gluni-drag-handle-grip {
  background:
    linear-gradient(rgba(243, 251, 255, 0.9), rgba(243, 251, 255, 0.9)) top / 100% 1px no-repeat,
    linear-gradient(rgba(243, 251, 255, 0.9), rgba(243, 251, 255, 0.9)) center / 100% 1px no-repeat,
    linear-gradient(rgba(243, 251, 255, 0.9), rgba(243, 251, 255, 0.9)) bottom / 100% 1px no-repeat;
}
```

- [ ] **Step 4: Rewrite `.gluni-round-chip`**

Replace the `.gluni-round-chip { ... }` block AND its child `span` / `strong` rules (lines 128–153) with:

```css
.gluni-round-chip {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 80px;
  height: 22px;
  padding: 0 9px 0 8px;
  background: var(--gluni-ink);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--gluni-cyan) 38%, var(--gluni-line) 62%),
    inset 0 1px 0 color-mix(in srgb, var(--gluni-cyan) 56%, transparent);
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
}

.gluni-round-chip-label {
  color: var(--gluni-text-dim);
  font-size: 8px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.gluni-round-chip-divider {
  width: 1px;
  height: 12px;
  background: var(--gluni-line-strong);
}

.gluni-round-chip-num {
  color: var(--gluni-cyan);
  font-size: 16px;
  font-weight: 950;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
```

- [ ] **Step 5: Manual smoke test**

1. Reload Foundry, start combat.
2. The header now reads `ROUND ⋅ 02` with a thin vertical line between label and number. Notched top-right corner on the chip.
3. The drag handle is a small notched square with a three-line grip (≡) drawn in CSS.
4. Hover the drag handle: lines brighten, leading edge gets a thin cyan accent stripe.
5. No backdrop-blur effects anywhere.

- [ ] **Step 6: Commit**

```bash
git add scripts/gluniverse-initiative.mjs styles/gluniverse-initiative.css
git commit -m "feat(visual): rework header — notched round chip with divider, CSS-drawn drag handle"
```

---

## Task 11: Turn controls (GM stacked + player end-turn pill)

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `.gluni-turn-controls` block (lines 100–104), button rules (lines 106–126), `.gluni-end-turn` (lines 447–479)
- Modify: `scripts/gluniverse-initiative.mjs` — `onSocketEndTurnRequest` is invoked on the GM; the player's UI needs a denied-shake hook. Add to `requestEndTurn` (lines 723–741) a 220ms shake class on socket-emit failure (i.e. no socket).

**Why:** Spec Section 4. Notched-corner small chips, fill-on-hover, press feedback for end-turn, shake on denial. Sets up the look-and-feel for both GM and player controls.

- [ ] **Step 1: Rewrite `.gluni-turn-controls` and its buttons**

In `styles/gluniverse-initiative.css`, replace the `.gluni-turn-controls { ... }` block AND the `.gluni-turn-controls button { ... }` block AND the `.gluni-turn-controls button:hover { ... }` block (lines 100–126) with:

```css
.gluni-turn-controls {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.gluni-turn-controls button {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: var(--gluni-ink);
  box-shadow: inset 0 0 0 1px var(--gluni-line);
  color: rgba(243, 251, 255, 0.78);
  cursor: pointer;
  clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);
  transition:
    background var(--gluni-d-quick) var(--gluni-ease),
    color var(--gluni-d-quick) var(--gluni-ease),
    box-shadow var(--gluni-d-quick) var(--gluni-ease),
    transform var(--gluni-d-quick) var(--gluni-ease);
}

.gluni-turn-controls button:hover {
  background: var(--gluni-cyan);
  color: var(--gluni-ink);
  box-shadow: inset 0 0 0 1px transparent;
  transform: translateY(-1px);
}
```

- [ ] **Step 2: Offset turn controls outward**

Find `.gluni-initiative--left .gluni-floating-turn-controls { left: calc(100% + 6px); }` (line 93) and `.gluni-initiative--right .gluni-floating-turn-controls { right: calc(100% + 6px); }` (line 97). Keep them — they match spec's "Offset 6px outward".

- [ ] **Step 3: Rewrite `.gluni-end-turn`**

Replace the `.gluni-end-turn { ... }` block AND `.gluni-end-turn span` AND `.gluni-end-turn:hover` (lines 447–479) with:

```css
.gluni-end-turn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 64px;
  height: 24px;
  padding: 0 10px;
  border: 0;
  background: var(--gluni-accent, var(--gluni-cyan));
  box-shadow: 0 0 18px color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 42%, transparent 58%);
  color: var(--gluni-ink);
  white-space: nowrap;
  cursor: pointer;
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
  transition:
    transform var(--gluni-d-quick) var(--gluni-ease),
    filter var(--gluni-d-quick) var(--gluni-ease),
    box-shadow var(--gluni-d-quick) var(--gluni-ease);
}

.gluni-end-turn span {
  font-size: 8px;
  font-weight: 950;
  letter-spacing: 0.18em;
  line-height: 1;
  text-transform: uppercase;
}

.gluni-end-turn:hover {
  filter: brightness(1.12);
  transform: translateY(-1px);
  box-shadow: 0 0 32px color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 64%, transparent);
}

.gluni-end-turn:active {
  transform: translateY(0) scale(0.97);
  transition-duration: 120ms;
}

.gluni-end-turn.gluni-end-turn--denied {
  animation: gluni-end-turn-shake 220ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes gluni-end-turn-shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
  0%, 100% { transform: translateX(0); }
}
```

- [ ] **Step 4: Wire the denial shake**

In `scripts/gluniverse-initiative.mjs`, replace the `async requestEndTurn()` method (lines 723–741) with:

```javascript
  async requestEndTurn() {
    const combat = this.combat;
    const combatant = combat?.combatant;
    if (!combat?.started || !combatant || !this.userOwnsCombatant(combatant, game.user)) {
      this.shakeEndTurnButton();
      return;
    }

    if (game.user.isGM) {
      await this.changeTurn(1);
      return;
    }

    if (game.socket) {
      game.socket.emit(SOCKET_NAME, {
        type: "requestEndTurn",
        combatId: combat.id,
        combatantId: combatant.id,
        userId: game.user.id
      });
    } else {
      this.shakeEndTurnButton();
    }
  }

  shakeEndTurnButton() {
    const button = this.root?.querySelector(".gluni-end-turn");
    if (!button) return;
    button.classList.remove("gluni-end-turn--denied");
    void button.offsetWidth;
    button.classList.add("gluni-end-turn--denied");
    window.setTimeout(() => button.classList.remove("gluni-end-turn--denied"), 240);
  }
```

The shake fires when the user tries to end the turn but doesn't own the current combatant (e.g., a player clicks end turn after they've already lost initiative ownership due to a race). The `void button.offsetWidth` line forces a reflow so the animation re-triggers on rapid repeated clicks.

- [ ] **Step 5: Manual smoke test**

1. Reload Foundry.
2. **GM**: hover prev/next turn controls — they fill with cyan and the icon turns ink-color, lift 1px. Click each — turn changes work.
3. **Player** (login as a non-GM with an owned combatant active): the END TURN pill is visible, notched, in the combatant's disposition color. Hover lifts/brightens. Click — turn advances (or shake if denied).
4. To trigger the shake: manually call `overlay.shakeEndTurnButton()` from the console. The pill shakes laterally for ~220ms.

- [ ] **Step 6: Commit**

```bash
git add scripts/gluniverse-initiative.mjs styles/gluniverse-initiative.css
git commit -m "feat(visual): notched turn controls, pill end-turn with press feedback and denial shake"
```

---

## Task 12: GM per-card visibility controls + persistent badge

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `.gluni-card-controls` (lines 558–567), `.gluni-card-controls button` (lines 575–587), `.gluni-card-controls button:hover/.is-selected` (lines 589–594), `.gluni-gm-visibility*` (lines 521–556)

**Why:** Spec Section 4. Visibility buttons get the notched motif, semantic-color fills for selected states. Persistent badge aligned to the new inset values.

- [ ] **Step 1: Rewrite `.gluni-card-controls` and buttons**

Replace `.gluni-card-controls`, `.gluni-card-controls button`, and `.gluni-card-controls button:hover, .gluni-card-controls button.is-selected` with:

```css
.gluni-card-controls {
  position: absolute;
  inset: auto 6px 6px auto;
  z-index: 10;
  display: flex;
  gap: 3px;
  opacity: 0;
  transform: translateY(3px);
  transition:
    opacity 140ms var(--gluni-ease),
    transform 140ms var(--gluni-ease);
}

.gluni-initiative--left .gluni-card-controls {
  inset: auto auto 6px 6px;
}

.gluni-card:hover .gluni-card-controls,
.gluni-card:focus-within .gluni-card-controls {
  opacity: 1;
  transform: translateY(0);
}

.gluni-card-controls button {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: rgba(3, 8, 12, 0.82);
  box-shadow: inset 0 0 0 1px var(--gluni-line);
  color: rgba(243, 251, 255, 0.86);
  cursor: pointer;
  clip-path: polygon(3px 0, 100% 0, 100% 100%, 0 100%, 0 3px);
  transition:
    background var(--gluni-d-quick) var(--gluni-ease),
    color var(--gluni-d-quick) var(--gluni-ease);
}

.gluni-card-controls button:hover {
  background: var(--gluni-accent, var(--gluni-cyan));
  color: var(--gluni-ink);
}

.gluni-card-controls button.is-selected[data-mode="auto"] {
  background: var(--gluni-white);
  color: var(--gluni-ink);
}

.gluni-card-controls button.is-selected[data-mode="visible"] {
  background: var(--gluni-cyan);
  color: var(--gluni-ink);
}

.gluni-card-controls button.is-selected[data-mode="mystery"] {
  background: var(--gluni-violet);
  color: var(--gluni-ink);
}

.gluni-card-controls button.is-selected[data-mode="hidden"] {
  background: var(--gluni-red);
  color: var(--gluni-white);
}
```

- [ ] **Step 2: Rewrite `.gluni-gm-visibility*`**

Replace the `.gluni-gm-visibility { ... }` block AND its three variant rules with:

```css
.gluni-gm-visibility {
  position: absolute;
  inset: 6px 6px auto auto;
  z-index: 9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 13px;
  min-width: 30px;
  padding: 0 5px;
  background: rgba(2, 6, 9, 0.78);
  box-shadow: inset 0 0 0 1px var(--gluni-line);
  color: var(--gluni-text-dim);
  font-size: 7px;
  font-weight: 950;
  letter-spacing: 0.22em;
  line-height: 1;
  clip-path: polygon(3px 0, 100% 0, 100% 100%, 0 100%, 0 3px);
}

.gluni-initiative--left .gluni-gm-visibility {
  inset: 6px auto auto 6px;
}

.gluni-gm-visibility--visible {
  color: var(--gluni-ink);
  background: var(--gluni-cyan);
}

.gluni-gm-visibility--hidden {
  color: var(--gluni-white);
  background: color-mix(in srgb, var(--gluni-red) 78%, transparent);
}

.gluni-gm-visibility--mystery {
  color: var(--gluni-ink);
  background: color-mix(in srgb, var(--gluni-violet) 82%, transparent);
}
```

- [ ] **Step 3: Remove outline-based GM mode highlights**

The current CSS has `.gluni-card--gm-hidden`, `.gluni-card--gm-mystery`, `.gluni-card--gm-visible` rules with `outline` and `border-color`. With the new clip-path silhouette, outlines render as rectangles (they don't follow clip-path), which looks wrong. Replace all three rules with:

```css
.gluni-card--gm-hidden {
  box-shadow: inset 0 0 0 1px var(--gluni-red);
}

.gluni-card--gm-mystery {
  box-shadow: inset 0 0 0 1px var(--gluni-violet);
}

.gluni-card--gm-visible {
  box-shadow: inset 0 0 0 1px var(--gluni-cyan);
}
```

(Outlines removed; `box-shadow` follows clip-path.)

- [ ] **Step 4: Manual smoke test**

1. As GM, start combat. Hover a card — visibility buttons fade up in 140ms.
2. Click SHOW — selected button fills with cyan; persistent badge at top-trailing shows "SHOW" with cyan fill.
3. Click MASK — selected button fills with violet; badge shows "MASK".
4. Click HIDE — selected button fills with red; badge shows "HIDE".
5. Click AUTO — selected button fills with white; badge fades to neutral dark.
6. The card itself gets a 1px colored inner stroke matching the selected mode (no rectangular outline poking outside the clip).

- [ ] **Step 5: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): notched GM controls with semantic fills, clip-path-aware highlights"
```

---

## Task 13: Delayed-section heading

**Files:**
- Modify: `scripts/gluniverse-initiative.mjs:497-508` (`renderDelayedSection`)
- Modify: `styles/gluniverse-initiative.css` — `.gluni-delayed-section`, `.gluni-delayed-heading` (lines 622–636)

**Why:** Spec Section 4. Heading reads `— DELAYED` with a 12px cyan tick prefix.

- [ ] **Step 1: Update the template**

In `scripts/gluniverse-initiative.mjs`, replace `renderDelayedSection(delayedCards)` with:

```javascript
  renderDelayedSection(delayedCards) {
    if (!delayedCards.length) return "";

    return `
      <section class="gluni-delayed-section">
        <div class="gluni-delayed-heading">
          <span class="gluni-delayed-tick" aria-hidden="true"></span>
          <span>— ${localize("GLUNI.Delayed").toUpperCase()}</span>
        </div>
        <div class="gluni-delayed-list">
          ${delayedCards.map(card => this.renderCombatantCard(card)).join("")}
        </div>
      </section>
    `;
  }
```

- [ ] **Step 2: Style the heading**

Replace the existing `.gluni-delayed-heading { ... }` block with:

```css
.gluni-delayed-heading {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 0;
  color: var(--gluni-text-dim);
  font-size: 9px;
  font-weight: 950;
  letter-spacing: 0.32em;
  line-height: 1;
  text-transform: uppercase;
}

.gluni-delayed-tick {
  display: inline-block;
  width: 12px;
  height: 1px;
  background: var(--gluni-cyan);
  box-shadow: 0 0 8px var(--gluni-cyan);
}
```

- [ ] **Step 3: Manual smoke test**

1. As GM, delay one combatant.
2. The delayed section appears below the rail.
3. The heading reads `▬ — DELAYED` (where `▬` is a small cyan tick line with a soft glow).
4. The delayed card itself is shorter (~42px) and dimmer than active cards.

- [ ] **Step 4: Commit**

```bash
git add scripts/gluniverse-initiative.mjs styles/gluniverse-initiative.css
git commit -m "feat(visual): delayed heading with cyan tick prefix"
```

---

## Task 14: Hover state on cards (sheen + portrait brighten)

**Files:**
- Modify: `styles/gluniverse-initiative.css` — add a hover sheen and a portrait brighten

**Why:** Spec Section 3 Hover state. A 1px accent line draws across the top of hovered cards (180ms); portrait brightens slightly (180ms). Token highlight on the scene already works.

- [ ] **Step 1: Add hover line and portrait brightening**

Insert (near the `.gluni-card-sheen` rules, but as separate rules):

```css
.gluni-card:hover:not(.gluni-card--active) {
  cursor: pointer;
}

.gluni-card:hover:not(.gluni-card--active) .gluni-card-portrait {
  filter: contrast(1.08) saturate(1.06) brightness(1.06);
}

.gluni-card:not(.gluni-card--active)::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  z-index: 9;
  background: var(--gluni-accent, var(--gluni-cyan));
  box-shadow: 0 0 8px var(--gluni-accent, var(--gluni-cyan));
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left center;
  pointer-events: none;
  transition:
    opacity var(--gluni-d-quick) var(--gluni-ease),
    transform var(--gluni-d-quick) var(--gluni-ease);
}

.gluni-initiative--left .gluni-card:not(.gluni-card--active)::after {
  transform-origin: right center;
}

.gluni-card:hover:not(.gluni-card--active)::after {
  opacity: 1;
  transform: scaleX(1);
}
```

- [ ] **Step 2: Manual smoke test**

1. Hover any non-active card in the rail.
2. A thin accent line draws across the top of the card (180ms, leading-to-trailing).
3. The portrait brightens slightly.
4. Token on the scene highlights (existing behavior, should still work).
5. Mouse-out: the line fades and retracts.

- [ ] **Step 3: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): hover line and portrait brighten on inactive cards"
```

---

## Task 15: Round splash — new DOM structure

**Files:**
- Modify: `scripts/gluniverse-initiative.mjs:883-901` (`showRoundSplash`)
- Add a helper for digit splitting.

**Why:** Spec Section 5 layout. The splash gets a precision rule, a deck with label/number/sub-string, and per-digit `<span class="d">` elements for the sheen-sweep stagger.

- [ ] **Step 1: Replace `showRoundSplash`**

In `scripts/gluniverse-initiative.mjs`, replace the existing `showRoundSplash(round)` method with:

```javascript
  showRoundSplash(round) {
    if (!this.enabled || !round) return;
    if (this.lastSplashRound === round) return;
    this.lastSplashRound = round;

    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default";
    const formatted = formatRound(round);
    const digitSpans = Array.from(formatted).map(digit => `<span class="d">${digit}</span>`).join("");
    const subString = game.i18n.format("GLUNI.Splash.Cycle", { round: formatted });

    const splash = document.createElement("div");
    splash.className = `gluni-round-splash gluni-round-splash--${intensity}`;
    splash.innerHTML = `
      <div class="gluni-round-rule" aria-hidden="true"></div>
      <div class="gluni-round-splash-inner">
        <div class="gluni-round-label">
          <span class="tick" aria-hidden="true"></span>
          <span>${localize("GLUNI.Round").toUpperCase()}</span>
        </div>
        <div class="gluni-round-num">${digitSpans}</div>
        <div class="gluni-round-sub"><span>${escapeHTML(subString)}</span></div>
      </div>
    `;
    document.body.appendChild(splash);

    window.requestAnimationFrame(() => splash.classList.add("gluni-round-splash--show"));
    window.setTimeout(() => splash.classList.add("gluni-round-splash--leave"), this.getRoundSplashHold());
    window.setTimeout(() => splash.remove(), this.getRoundSplashDuration());
  }
```

Notes:
- `digitSpans` produces one `<span class="d">` per character (digits or any padding), so round 02 → `<span class="d">0</span><span class="d">2</span>` and round 100 → three spans.
- `subString` uses `game.i18n.format` with the new `GLUNI.Splash.Cycle` key (passing the formatted round so the cycle line reads `INITIATIVE · CYCLE — 02`).
- `escapeHTML` already exists in the module.

- [ ] **Step 2: Update splash timing helpers**

Replace `getRoundSplashHold()` and `getRoundSplashDuration()` (lines 903–915) with:

```javascript
  getRoundSplashHold() {
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
    if (intensity === "reduced") return 320;
    if (intensity === "cinematic") return 1000;
    return 720;
  }

  getRoundSplashDuration() {
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
    if (intensity === "reduced") return 1100;
    if (intensity === "cinematic") return 2600;
    return 1860;
  }
```

The hold value matches the spec's "in" phase end (rule + deck + digits all settled), then the leave class triggers the out-phase animations. Duration matches the spec's total visible time per tier.

- [ ] **Step 3: Manual smoke test (structure only — styling comes next)**

1. Reload Foundry. Start combat. The first round splash appears.
2. In dev tools, inspect the `.gluni-round-splash` element. Expected DOM:
   - `.gluni-round-rule`
   - `.gluni-round-splash-inner`
     - `.gluni-round-label` containing `<span class="tick">` and `<span>ROUND</span>`
     - `.gluni-round-num` containing one `<span class="d">` per digit
     - `.gluni-round-sub` containing the cycle string
3. The splash still works (renders, removes after ~1860ms default) — even though the old CSS targets the wrong elements, the splash root just won't look right. That's expected and resolved in Tasks 16–18.

- [ ] **Step 4: Commit**

```bash
git add scripts/gluniverse-initiative.mjs
git commit -m "feat(visual): emit new splash DOM with rule, label tick, per-digit spans, sub-string"
```

---

## Task 16: Round splash — base layout CSS (no animation yet)

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `.gluni-round-splash*` rules (lines 721–862)

**Why:** Spec Section 5. Establishes the precision rule + deck layout. Animations come in Tasks 17–18.

- [ ] **Step 1: Delete the entire current splash block**

In `styles/gluniverse-initiative.css`, delete every rule from `.gluni-round-splash {` (line 721) through `.gluni-round-splash--reduced .gluni-round-splash-inner strong { ... }` (closing brace around line 862). Also delete all splash-related `@keyframes` rules: `gluni-round-frame-in`, `gluni-round-frame-out`, `gluni-round-label-in`, `gluni-round-label-out`, `gluni-round-number-in`, `gluni-round-number-out`, `gluni-round-shell-leave`, `gluni-scanline` (lines 1153–1246).

(We're starting splash CSS from a clean slate.)

- [ ] **Step 2: Insert the new base splash layout**

Insert immediately after the card section in the CSS (or anywhere before the media-query blocks at the bottom):

```css
.gluni-round-splash {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  pointer-events: none;
  font-family: "Bahnschrift", "Share Tech Mono", "JetBrains Mono", "Cascadia Mono", Consolas, monospace;
  opacity: 0;
}

.gluni-round-splash--show {
  opacity: 1;
}

.gluni-round-rule {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 88vw;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--gluni-cyan) 12%,
    var(--gluni-cyan) 88%,
    transparent
  );
  box-shadow: 0 0 24px color-mix(in srgb, var(--gluni-cyan) 60%, transparent);
  transform: translate(-50%, -50%) scaleX(0);
  opacity: 0;
  transform-origin: center;
}

.gluni-round-splash-inner {
  position: relative;
  display: grid;
  justify-items: center;
  row-gap: 4px;
  padding: 24px 64px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(2, 5, 8, 0.82) 30%,
    rgba(2, 5, 8, 0.82) 70%,
    transparent 100%
  );
  opacity: 0;
}

.gluni-round-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.gluni-round-label .tick {
  display: inline-block;
  width: 0px;
  height: 1px;
  background: var(--gluni-cyan);
  box-shadow: 0 0 8px var(--gluni-cyan);
}

.gluni-round-label span:last-child {
  color: rgba(243, 251, 255, 0.85);
  font-size: 14px;
  font-weight: 950;
  letter-spacing: 0.7em;
  line-height: 1;
  text-transform: uppercase;
  opacity: 0;
}

.gluni-round-num {
  display: inline-flex;
  align-items: baseline;
  gap: 0.02em;
  color: var(--gluni-white);
  font-size: clamp(108px, 17vw, 230px);
  font-weight: 950;
  font-variant-numeric: tabular-nums;
  line-height: 0.74;
  letter-spacing: 0.01em;
  text-shadow:
    0 0 32px color-mix(in srgb, var(--gluni-cyan) 60%, transparent),
    0 16px 50px rgba(0, 0, 0, 0.85);
}

.gluni-round-num .d {
  display: inline-block;
  opacity: 0.18;
  filter: brightness(0.9);
}

.gluni-round-sub {
  position: absolute;
  bottom: -24px;
  left: 0;
  right: 0;
  text-align: center;
}

.gluni-round-sub span {
  display: inline-block;
  color: rgba(243, 251, 255, 0.36);
  font-size: 10px;
  font-weight: 950;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  opacity: 0;
}
```

- [ ] **Step 3: Manual smoke test**

1. Reload Foundry. Start combat. Round splash appears.
2. With no animation yet, the splash shows up as ALL-IN-ONE (everything visible immediately):
   - A 1px cyan rule across the middle (88vw wide).
   - A centered horizontal vignette band with the deck.
   - "ROUND" label at the top (but small letter-spacing because the open state isn't tracked yet — that's fine).
   - The number digits visible at low opacity (0.18 — etched ghost state).
   - The cycle sub-string under the number.
3. The splash fades out after the duration (overall fade only, no specific phases yet).
4. Layout is correct: rule full width; deck centered; sub-string sits below.

- [ ] **Step 4: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): new splash layout — rule, deck, per-digit ghosts, sub-string"
```

---

## Task 17: Round splash — sheen-sweep IN animation (default tier)

**Files:**
- Modify: `styles/gluniverse-initiative.css` — add IN keyframes and bind them to `.gluni-round-splash--show`

**Why:** Spec Section 5 motion frame-by-frame, IN phase. ~720ms total. Rule scales, deck fades, label tick draws, label tracking tightens, digits stagger-light, sub-string fades.

- [ ] **Step 1: Add IN keyframes**

Append to the CSS (after the base layout rules from Task 16):

```css
@keyframes gluni-splash-rule-in {
  0% {
    transform: translate(-50%, -50%) scaleX(0);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scaleX(1);
    opacity: 1;
  }
}

@keyframes gluni-splash-deck-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes gluni-splash-tick-in {
  0% { width: 0; }
  100% { width: 14px; }
}

@keyframes gluni-splash-label-in {
  0% {
    opacity: 0;
    letter-spacing: 0.5em;
  }
  100% {
    opacity: 1;
    letter-spacing: 0.55em;
  }
}

@keyframes gluni-splash-digit-in {
  0% {
    opacity: 0.18;
    filter: brightness(0.9);
  }
  35% {
    opacity: 1;
    filter: brightness(1.6);
  }
  100% {
    opacity: 1;
    filter: brightness(1.1);
  }
}

@keyframes gluni-splash-sub-in {
  0% { opacity: 0; }
  100% { opacity: 0.4; }
}
```

- [ ] **Step 2: Wire IN animations to the show state**

Append:

```css
.gluni-round-splash--show .gluni-round-rule {
  animation: gluni-splash-rule-in 180ms var(--gluni-ease) forwards;
}

.gluni-round-splash--show .gluni-round-splash-inner {
  animation: gluni-splash-deck-in 180ms var(--gluni-ease) 100ms forwards;
}

.gluni-round-splash--show .gluni-round-label .tick {
  animation: gluni-splash-tick-in 200ms var(--gluni-ease) 200ms forwards;
}

.gluni-round-splash--show .gluni-round-label span:last-child {
  animation: gluni-splash-label-in 300ms var(--gluni-ease) 200ms forwards;
}

.gluni-round-splash--show .gluni-round-num .d {
  animation: gluni-splash-digit-in 220ms cubic-bezier(0.2, 1.0, 0.3, 1) both;
}

.gluni-round-splash--show .gluni-round-num .d:nth-child(1)  { animation-delay: 220ms; }
.gluni-round-splash--show .gluni-round-num .d:nth-child(2)  { animation-delay: 280ms; }
.gluni-round-splash--show .gluni-round-num .d:nth-child(3)  { animation-delay: 340ms; }
.gluni-round-splash--show .gluni-round-num .d:nth-child(4)  { animation-delay: 400ms; }
.gluni-round-splash--show .gluni-round-num .d:nth-child(5)  { animation-delay: 460ms; }

.gluni-round-splash--show .gluni-round-sub span {
  animation: gluni-splash-sub-in 200ms var(--gluni-ease) 380ms forwards;
}
```

Per-digit `nth-child` stagger covers up to 5 digits (round ≤ 99999). For very large rounds, the 5th and later digits will all animate at the 5th delay — acceptable for an edge case.

- [ ] **Step 3: Manual smoke test**

1. Reload Foundry. Start combat (round 1) — splash plays:
   - Rule draws from a single point outward to 88vw width (0–180ms).
   - Deck fades in (100–280ms).
   - Label tick draws from 0 to 14px (200–400ms).
   - Label "ROUND" fades in tightening its tracking (200–500ms).
   - Tens digit lights up first (220–540ms), brightness peak mid-frame.
   - Units digit lights up 60ms later (280–600ms).
   - Sub-string fades in (380–580ms).
2. After ~720ms, all elements at rest with the digits bright.
3. The OUT animation isn't wired yet — the splash will just abruptly disappear at the hold timeout. That's fixed in Task 18.
4. Trigger more round changes (call `overlay.showRoundSplash(99)` and `overlay.showRoundSplash(100)` in console with `overlay.lastSplashRound = null;` reset between calls) to confirm 99 and 100 still play correctly (100 gets three digits, last falls back to delay 340ms which is fine).

- [ ] **Step 4: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): splash sheen-sweep IN phase with per-digit stagger"
```

---

## Task 18: Round splash — sheen-sweep OUT animation

**Files:**
- Modify: `styles/gluniverse-initiative.css` — add OUT keyframes and bind them to `.gluni-round-splash--leave`

**Why:** Spec Section 5. ~460ms total. Reverse-stagger digit dim, rule retract, deck fade.

- [ ] **Step 1: Add OUT keyframes**

Append:

```css
@keyframes gluni-splash-rule-out {
  0% {
    transform: translate(-50%, -50%) scaleX(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scaleX(0);
    opacity: 0;
  }
}

@keyframes gluni-splash-deck-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes gluni-splash-digit-out {
  0% {
    opacity: 1;
    filter: brightness(1.1);
  }
  100% {
    opacity: 0.18;
    filter: brightness(0.9);
  }
}
```

- [ ] **Step 2: Wire OUT animations**

Append:

```css
.gluni-round-splash--leave .gluni-round-num .d {
  animation: gluni-splash-digit-out 160ms var(--gluni-ease) both;
}

/* Reverse-stagger: rightmost digit dims first.
   Default (2-digit): digit 2 at 0ms, digit 1 at 60ms. */
.gluni-round-splash--leave .gluni-round-num .d:nth-last-child(1) { animation-delay: 0ms; }
.gluni-round-splash--leave .gluni-round-num .d:nth-last-child(2) { animation-delay: 60ms; }
.gluni-round-splash--leave .gluni-round-num .d:nth-last-child(3) { animation-delay: 120ms; }
.gluni-round-splash--leave .gluni-round-num .d:nth-last-child(4) { animation-delay: 180ms; }
.gluni-round-splash--leave .gluni-round-num .d:nth-last-child(5) { animation-delay: 240ms; }

.gluni-round-splash--leave .gluni-round-rule {
  animation: gluni-splash-rule-out 180ms var(--gluni-exit) 160ms forwards;
}

.gluni-round-splash--leave .gluni-round-splash-inner {
  animation: gluni-splash-deck-out 160ms var(--gluni-exit) 300ms forwards;
}

.gluni-round-splash--leave .gluni-round-sub span {
  animation: gluni-splash-deck-out 120ms var(--gluni-exit) 240ms forwards;
}

.gluni-round-splash--leave .gluni-round-label .tick,
.gluni-round-splash--leave .gluni-round-label span:last-child {
  animation: gluni-splash-deck-out 120ms var(--gluni-exit) 240ms forwards;
}
```

Phase totals (default tier): digits 0–160 + reverse-stagger spread = up to 220ms; rule 160–340ms; deck 300–460ms. Matches spec's 460ms OUT.

- [ ] **Step 3: Manual smoke test**

1. Reload Foundry, start combat.
2. Watch a full round splash:
   - IN phase: rule sweeps, digits light up (Task 17).
   - Hold ~680ms with everything bright.
   - OUT phase: digits dim in reverse order (units dims first); rule retracts; deck fades.
3. Total cycle ~1860ms.
4. Advance through round changes (use a combatant with high enough init to actually loop the round, or call `overlay.lastSplashRound = null; overlay.showRoundSplash(X)` in the console).

- [ ] **Step 4: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): splash sheen-sweep OUT phase with reverse-stagger digit dim"
```

---

## Task 19: Motion tier — reduced overrides

**Files:**
- Modify: `styles/gluniverse-initiative.css` — replace the existing `.gluni-initiative--reduced` block (lines 700–707)

**Why:** Spec Section 6. `reduced` tier reads as "polished business" — snappy, no sheen flourishes, splash is straight blur-clear.

- [ ] **Step 1: Delete the old reduced rules**

Delete the entire `.gluni-initiative--reduced ...` block (the multi-selector rule at lines 700–707).

- [ ] **Step 2: Insert new reduced overrides**

Append the following block (near the other tier overrides at the bottom of the file, before the media queries):

```css
/* ============================================================
   Motion tier — REDUCED
   ============================================================ */

.gluni-initiative--reduced .gluni-card {
  transition-duration: 240ms;
}

.gluni-initiative--reduced .gluni-card-portrait,
.gluni-initiative--reduced .gluni-card-mystery-mark {
  transition-duration: 240ms;
}

.gluni-initiative--reduced .gluni-card--active-entering .gluni-card-sheen {
  animation: none;
  opacity: 0;
}

.gluni-initiative--reduced .gluni-card-ghost--leave.gluni-card-ghost--left {
  animation: gluni-active-exit-left-reduced 320ms var(--gluni-exit) forwards;
}

.gluni-initiative--reduced .gluni-card-ghost--leave.gluni-card-ghost--right {
  animation: gluni-active-exit-right-reduced 320ms var(--gluni-exit) forwards;
}

@keyframes gluni-active-exit-left-reduced {
  0% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
  100% { opacity: 0; transform: translateX(-56px) scale(0.92); filter: blur(2px); }
}

@keyframes gluni-active-exit-right-reduced {
  0% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
  100% { opacity: 0; transform: translateX(56px) scale(0.92); filter: blur(2px); }
}

.gluni-initiative--reduced .gluni-item--entering-bottom {
  animation: gluni-card-enter-bottom-reduced 200ms var(--gluni-ease) both;
}

@keyframes gluni-card-enter-bottom-reduced {
  from {
    opacity: 0;
    transform:
      translate(var(--gluni-flip-x), var(--gluni-flip-y))
      translateY(6px)
      translateX(var(--gluni-active-shift))
      scale(0.99);
  }
  to {
    opacity: 1;
    transform:
      translate(0, 0)
      translateX(var(--gluni-active-shift))
      scale(var(--gluni-card-scale));
  }
}

/* Reduced hover: no sheen line, only portrait brighten + box-shadow */
.gluni-initiative--reduced .gluni-card:not(.gluni-card--active)::after {
  display: none;
}

/* Reduced splash: straight blur-clear punch-in, total 1100ms (in 320 / hold 580 / out 200) */
.gluni-round-splash--reduced .gluni-round-rule {
  display: none;
}

.gluni-round-splash--reduced.gluni-round-splash--show .gluni-round-splash-inner {
  animation: gluni-splash-reduced-in 320ms var(--gluni-ease) forwards;
}

.gluni-round-splash--reduced.gluni-round-splash--show .gluni-round-num .d {
  animation: none;
  opacity: 1;
  filter: brightness(1);
}

.gluni-round-splash--reduced.gluni-round-splash--show .gluni-round-label .tick {
  width: 14px;
  animation: none;
}

.gluni-round-splash--reduced.gluni-round-splash--show .gluni-round-label span:last-child,
.gluni-round-splash--reduced.gluni-round-splash--show .gluni-round-sub span {
  opacity: 0.4;
  animation: none;
}

.gluni-round-splash--reduced.gluni-round-splash--leave .gluni-round-splash-inner {
  animation: gluni-splash-deck-out 200ms var(--gluni-exit) forwards;
}

.gluni-round-splash--reduced.gluni-round-splash--leave .gluni-round-num .d,
.gluni-round-splash--reduced.gluni-round-splash--leave .gluni-round-rule {
  animation: none;
}

@keyframes gluni-splash-reduced-in {
  0% {
    opacity: 0;
    transform: scale(0.98);
    filter: blur(6px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}
```

- [ ] **Step 3: Manual smoke test**

1. World setting → Animation intensity → Reduced.
2. Start combat. Advance turns.
3. No sheen line on active enter. Cards FLIP at 240ms (faster).
4. Ghost exit: shorter (56px), 320ms, 2px blur.
5. Bottom-entry: 200ms, no blur.
6. Hover a card: portrait brightens but no thin accent line draws.
7. Round splash: number appears centered with a punchy blur-clear, total ~1100ms. No sheen rule visible.
8. Reset world setting to Default before continuing.

- [ ] **Step 4: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): reduced motion tier — snappy, no sheen, blur-clear splash"
```

---

## Task 20: Motion tier — cinematic overrides

**Files:**
- Modify: `styles/gluniverse-initiative.css` — replace the existing `.gluni-initiative--cinematic` block (lines 709–719)

**Why:** Spec Section 6. `cinematic` tier reads ceremonial — slower curves, sheen trailing flare on active enter, longer ghost trail, splash echo-rule.

- [ ] **Step 1: Delete the old cinematic rules**

Delete the existing `.gluni-initiative--cinematic .gluni-card { ... }`, `.gluni-initiative--cinematic .gluni-card-portrait { ... }`, and `.gluni-initiative--cinematic .gluni-card-mystery-mark { ... }` rules.

- [ ] **Step 2: Insert new cinematic overrides**

Append:

```css
/* ============================================================
   Motion tier — CINEMATIC
   ============================================================ */

.gluni-initiative--cinematic .gluni-card {
  transition-duration: 620ms;
}

.gluni-initiative--cinematic .gluni-card-portrait,
.gluni-initiative--cinematic .gluni-card-mystery-mark {
  transition-duration: 780ms;
}

.gluni-initiative--cinematic .gluni-card--active-entering .gluni-card-sheen {
  animation-duration: 520ms;
  animation-timing-function: var(--gluni-ease);
}

/* Trailing flare on the sheen */
.gluni-initiative--cinematic .gluni-card-sheen::after {
  content: "";
  position: absolute;
  top: 0;
  right: 100%;
  width: 28px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--gluni-accent, var(--gluni-cyan))
  );
  opacity: 0;
}

.gluni-initiative--cinematic .gluni-card--active-entering .gluni-card-sheen::after {
  animation: gluni-card-sheen-flare 520ms var(--gluni-ease) 140ms both;
}

@keyframes gluni-card-sheen-flare {
  0% { opacity: 0; }
  18% { opacity: 1; }
  100% { opacity: 0; }
}

.gluni-initiative--cinematic .gluni-card-ghost--leave.gluni-card-ghost--left {
  animation: gluni-active-exit-left-cinematic 720ms var(--gluni-exit) forwards;
}

.gluni-initiative--cinematic .gluni-card-ghost--leave.gluni-card-ghost--right {
  animation: gluni-active-exit-right-cinematic 720ms var(--gluni-exit) forwards;
}

@keyframes gluni-active-exit-left-cinematic {
  0% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
  100% { opacity: 0; transform: translateX(-110px) scale(0.84); filter: blur(12px); }
}

@keyframes gluni-active-exit-right-cinematic {
  0% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
  100% { opacity: 0; transform: translateX(110px) scale(0.84); filter: blur(12px); }
}

.gluni-initiative--cinematic .gluni-item--entering-bottom {
  animation: gluni-card-enter-bottom-cinematic 480ms var(--gluni-ease) both;
}

@keyframes gluni-card-enter-bottom-cinematic {
  0% {
    opacity: 0;
    transform:
      translate(var(--gluni-flip-x), var(--gluni-flip-y))
      translateY(14px)
      translateX(var(--gluni-active-shift))
      scale(0.97);
    filter: blur(3px);
  }
  60% {
    opacity: 1;
    transform:
      translate(0, 0)
      translateX(var(--gluni-active-shift))
      scale(1.02);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform:
      translate(0, 0)
      translateX(var(--gluni-active-shift))
      scale(var(--gluni-card-scale));
    filter: blur(0);
  }
}

/* Hover sheen runs slower in cinematic */
.gluni-initiative--cinematic .gluni-card:not(.gluni-card--active)::after {
  transition-duration: 280ms;
}

/* Cinematic splash: total 2600ms (in 1000 / hold 1200 / out 400)
   - Sheen draws slower
   - Digits hold their bright peak ~80ms longer
   - Secondary "echo" rule offset 8px above, 60ms behind */

.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-rule {
  animation: gluni-splash-rule-in 280ms var(--gluni-ease) forwards;
}

.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-splash-inner {
  animation-duration: 280ms;
}

.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-label .tick {
  animation-duration: 320ms;
  animation-delay: 320ms;
}

.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-label span:last-child {
  animation-duration: 460ms;
  animation-delay: 320ms;
}

.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-num .d {
  animation: gluni-splash-digit-in-cinematic 320ms cubic-bezier(0.2, 1.0, 0.3, 1) both;
}

@keyframes gluni-splash-digit-in-cinematic {
  0% { opacity: 0.18; filter: brightness(0.9); }
  35% { opacity: 1; filter: brightness(1.8); }
  60% { opacity: 1; filter: brightness(1.4); }
  100% { opacity: 1; filter: brightness(1.15); }
}

.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-num .d:nth-child(1) { animation-delay: 340ms; }
.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-num .d:nth-child(2) { animation-delay: 420ms; }
.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-num .d:nth-child(3) { animation-delay: 500ms; }
.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-num .d:nth-child(4) { animation-delay: 580ms; }
.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-num .d:nth-child(5) { animation-delay: 660ms; }

.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-sub span {
  animation-delay: 580ms;
}

/* Echo rule for cinematic: pseudo-element on the rule, drawn 60ms behind and 8px above */
.gluni-round-splash--cinematic .gluni-round-rule::after {
  content: "";
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--gluni-cyan) 56%, transparent) 12%,
    color-mix(in srgb, var(--gluni-cyan) 56%, transparent) 88%,
    transparent
  );
  transform: scaleX(0);
  transform-origin: center;
  opacity: 0;
}

.gluni-round-splash--cinematic.gluni-round-splash--show .gluni-round-rule::after {
  animation: gluni-splash-rule-in 280ms var(--gluni-ease) 60ms forwards;
}

/* Cinematic OUT phase: 400ms total */
.gluni-round-splash--cinematic.gluni-round-splash--leave .gluni-round-num .d {
  animation-duration: 200ms;
}

.gluni-round-splash--cinematic.gluni-round-splash--leave .gluni-round-rule,
.gluni-round-splash--cinematic.gluni-round-splash--leave .gluni-round-rule::after {
  animation: gluni-splash-rule-out 200ms var(--gluni-exit) 140ms forwards;
}

.gluni-round-splash--cinematic.gluni-round-splash--leave .gluni-round-splash-inner {
  animation-duration: 160ms;
  animation-delay: 240ms;
}
```

- [ ] **Step 3: Manual smoke test**

1. World setting → Animation intensity → Cinematic.
2. Cycle turns: card FLIP feels slower; sheen line has a soft 28px leading flare; portrait expand is languid.
3. Ghost exit: travels 110px, blur 12px, 720ms.
4. Bottom-entry: 480ms, brief 1.02× overshoot.
5. Hover a card: line draws over 280ms (perceptibly slower).
6. Round splash: total ~2600ms. A secondary "echo" rule appears 8px above the primary rule, drawn 60ms behind. Digits hold their bright peak ~80ms longer.
7. Reset world setting to Default before continuing.

- [ ] **Step 4: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): cinematic motion tier — ceremonial, sheen flare, echo rule"
```

---

## Task 21: `prefers-reduced-motion` OS override

**Files:**
- Modify: `styles/gluniverse-initiative.css` — extend the `@media (prefers-reduced-motion: reduce)` block (lines 1274–1287)

**Why:** Spec Section 6 OS-level override. Clamp to reduced-tier behaviors regardless of world setting; skip the sheen sweep entirely; cards FLIP at 120ms.

- [ ] **Step 1: Replace the existing media block**

Replace the entire `@media (prefers-reduced-motion: reduce) { ... }` block at the bottom of the file with:

```css
@media (prefers-reduced-motion: reduce) {
  .gluni-card,
  .gluni-round-separator,
  .gluni-card-portrait,
  .gluni-card-mystery-mark,
  .gluni-card-controls,
  .gluni-end-turn,
  .gluni-turn-controls button {
    transition-duration: 120ms !important;
  }

  .gluni-card-sheen,
  .gluni-card-sheen::after,
  .gluni-card:not(.gluni-card--active)::after {
    animation: none !important;
    opacity: 0 !important;
    transition: none !important;
  }

  .gluni-card-ghost--leave.gluni-card-ghost--left,
  .gluni-card-ghost--leave.gluni-card-ghost--right {
    animation-duration: 220ms !important;
  }

  .gluni-item--entering,
  .gluni-item--entering-bottom,
  .gluni-card--outgoing-active {
    animation-duration: 180ms !important;
  }

  .gluni-round-rule,
  .gluni-round-rule::after {
    animation: none !important;
    transform: translate(-50%, -50%) scaleX(0) !important;
    opacity: 0 !important;
  }

  .gluni-round-splash--show .gluni-round-num .d {
    animation: none !important;
    opacity: 1 !important;
    filter: none !important;
  }

  .gluni-round-splash--show .gluni-round-splash-inner,
  .gluni-round-splash--show .gluni-round-label .tick,
  .gluni-round-splash--show .gluni-round-label span:last-child,
  .gluni-round-splash--show .gluni-round-sub span {
    animation-duration: 160ms !important;
    transform: none !important;
    filter: none !important;
  }

  .gluni-round-splash--leave * {
    animation-duration: 160ms !important;
  }
}
```

- [ ] **Step 2: Manual smoke test**

1. Enable OS-level reduced motion (Windows: Settings → Accessibility → Visual effects → Animation effects OFF; Mac: System Settings → Accessibility → Display → Reduce motion).
2. Reload Foundry. Start combat.
3. Card FLIP runs at ~120ms (very snappy).
4. No sheen on active enter; no hover line on inactive cards.
5. Round splash: rule is invisible (no draw). Digits appear at full opacity instantly. The deck fades in/out at 160ms — minimal motion.
6. Disable OS reduced motion. Reload. Confirm full-motion default returns.

- [ ] **Step 3: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): extend prefers-reduced-motion to suppress sheen, rule, digit reveal"
```

---

## Task 22: Mystery card + defeated state update

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `.gluni-card-mystery-mark` (lines 254–275), active variant (lines 424–432), `.gluni-card--defeated` (lines 498–501)

**Why:** Spec Section 2 mystery card (violet `?` glyph, soft violet radial wash) and defeated card (`saturate(0.18) brightness(0.62) opacity(0.65)` filter, accent edge dimmed to 30% alpha, bracket marker stays visible).

- [ ] **Step 1: Replace `.gluni-card-mystery-mark`**

Replace the existing `.gluni-card-mystery-mark { ... }` block with:

```css
.gluni-card-mystery-mark {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--gluni-violet);
  background:
    radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--gluni-violet) 24%, transparent), transparent 46%),
    var(--gluni-ink);
  font-family: "Bahnschrift", "Share Tech Mono", "JetBrains Mono", "Cascadia Mono", Consolas, monospace;
  font-size: 56px;
  font-weight: 950;
  line-height: 1;
  text-shadow:
    0 0 18px color-mix(in srgb, var(--gluni-violet) 80%, transparent),
    0 8px 26px rgba(0, 0, 0, 0.9);
  transform: scale(1);
  transition:
    transform var(--gluni-d-card) var(--gluni-ease),
    color var(--gluni-d-quick) var(--gluni-ease),
    text-shadow var(--gluni-d-quick) var(--gluni-ease);
}
```

- [ ] **Step 2: Replace active-variant mystery mark**

Replace `.gluni-card--active .gluni-card-mystery-mark { ... }` (lines 424–432) with:

```css
.gluni-card--active .gluni-card-mystery-mark {
  color: var(--gluni-white);
  font-size: 96px;
  transform: translateY(-4px) scale(1.06);
  text-shadow:
    0 0 32px color-mix(in srgb, var(--gluni-violet) 96%, transparent),
    0 0 64px color-mix(in srgb, var(--gluni-cyan) 24%, transparent),
    0 14px 36px rgba(0, 0, 0, 0.9);
}
```

- [ ] **Step 3: Update the defeated-state rule**

Find the existing `.gluni-card--defeated { ... }` rule and replace it with:

```css
.gluni-card--defeated {
  filter: saturate(0.18) brightness(0.62);
  opacity: 0.65;
}

.gluni-card--defeated .gluni-card-accent {
  opacity: 0.3;
}
```

(The L-bracket marker stays at its default opacity — spec requirement: "Bracket marker stays visible.")

- [ ] **Step 4: Manual smoke test — mystery**

1. As GM, set one combatant's visibility mode to MASK (mystery).
2. Re-login (or temporarily impersonate) as a player who doesn't own that combatant.
3. The mystery card shows a large violet `?` (56px inactive, 96px when active).
4. The background is a subtle violet-tinted radial wash on dark ink.
5. No FA icon, no fallback portrait shown for mystery cards.

- [ ] **Step 5: Manual smoke test — defeated**

1. As GM, mark one combatant as defeated (Foundry's built-in defeated toggle).
2. Enable the world setting "Show defeated combatants".
3. The defeated card is visibly desaturated (almost greyscale), dimmer, and at ~65% opacity.
4. The accent edge bar is faint (30% alpha).
5. The L-bracket marker still reads at full visibility.

- [ ] **Step 6: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): mystery card + defeated state per spec"
```

---

## Task 23: Narrow-screen media query update

**Files:**
- Modify: `styles/gluniverse-initiative.css` — `@media (max-width: 720px)` (lines 1248–1272)

**Why:** Spec Section 7 — narrow-screen media query preserved with updated card heights.

- [ ] **Step 1: Update the media block**

Replace the entire `@media (max-width: 720px) { ... }` block with:

```css
@media (max-width: 720px) {
  .gluni-initiative {
    width: min(176px, calc(100vw - 16px));
  }

  .gluni-portrait-config-grid {
    grid-template-columns: 1fr;
  }

  .gluni-card {
    min-height: 52px;
  }

  .gluni-card--active {
    min-height: 112px;
  }

  .gluni-card h3 {
    font-size: 11px;
  }

  .gluni-card--active h3 {
    font-size: 14px;
  }

  .gluni-card--active .gluni-initiative-badge {
    height: 19px;
    font-size: 12px;
  }
}
```

- [ ] **Step 2: Manual smoke test**

1. Open Foundry in a narrow window (or use dev-tools device mode at ~600px width).
2. The rail still fits, cards shorter (52 inactive, 112 active).
3. Names fit at 11px / 14px.
4. Splash still readable.
5. Return to a normal viewport.

- [ ] **Step 3: Commit**

```bash
git add styles/gluniverse-initiative.css
git commit -m "feat(visual): refresh narrow-screen card heights"
```

---

## Task 24: Cleanup pass + final manual QA

**Files:**
- Modify: `styles/gluniverse-initiative.css` — final cleanup of any orphan rules
- Modify: `scripts/gluniverse-initiative.mjs` — verify

**Why:** The earlier tasks deleted some keyframes and rules. Confirm nothing references removed names, and do a complete manual pass against the spec's test surface (Section 7).

- [ ] **Step 1: Grep for orphaned references**

Run these searches and confirm the listed terms NO LONGER appear in either file (each should return zero matches):

```bash
grep -n "gluni-gold" styles/gluniverse-initiative.css
grep -n "gluni-active-signal" styles/gluniverse-initiative.css
grep -n "gluni-card-vignette" styles/gluniverse-initiative.css scripts/gluniverse-initiative.mjs
grep -n "gluni-round-frame-in\|gluni-round-frame-out\|gluni-round-label-in\|gluni-round-label-out\|gluni-round-number-in\|gluni-round-number-out\|gluni-round-shell-leave\|gluni-scanline" styles/gluniverse-initiative.css
grep -n "backdrop-filter" styles/gluniverse-initiative.css
```

Expected: each command prints nothing (zero matches). If any match remains, search for the symbol's usage in the file and decide whether to remove it (orphaned) or repair the rule.

- [ ] **Step 2: Run the spec's manual test surface (Section 7)**

For each step, perform the action and confirm the listed expectation. Note any deviations.

1. **Begin combat** — overlay appears with new chrome. New silhouettes; L-bracket on each card; new header chip.
2. **Advance turns** — sheen sweeps across the new active card; outgoing ghost slides out preserving the silhouette; remaining cards FLIP into place.
3. **Cross a round boundary** — new splash plays for round 01 (or whatever the current round is). Trigger more rounds (or use `overlay.lastSplashRound = null; overlay.showRoundSplash(2)` in console) for round 02, 99, 100, 100+. Round 100+ uses three digits with the third gaining a 340ms delay.
4. **Toggle GM visibility mode** (auto/show/mask/hide) — control buttons show correct fills; persistent badge updates; card's inner stroke matches the mode.
5. **Delay an active combatant** — card shrinks into the delayed section; rejoin animation plays for the new active combatant.
6. **Return a delayed combatant** — card grows back up into the active slot.
7. **Toggle each `animationIntensity` tier** — reduced feels businesslike; default is full sheen; cinematic is ceremonial with the echo rule.
8. **Enable `prefers-reduced-motion`** in OS — clamps to minimal motion regardless of world setting.
9. **Test on both rail edges** (left and right) — sheen direction, ghost-exit direction, L-bracket position, accent edge all mirror correctly. Try setting the rail to Left in module settings; confirm bracket moves to top-right, accent to right edge, ghost slides leftward.

- [ ] **Step 3: Address any deviations**

If any step fails, file the symptom in a brief note and either fix it inline or document the regression. If multiple issues appear, fix them one at a time with individual commits.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore(visual): cleanup pass after overhaul — verify orphans and run QA matrix"
```

- [ ] **Step 5: Tag the release-candidate (optional)**

```bash
git tag v0.2.0-rc1
```

(Module version bump is the user's decision — leaving `module.json` version at 0.1.0 for now; the user can bump and re-release when they're happy.)

---

## Appendix — Quick rollback

If something breaks badly:

```bash
git log --oneline
git revert <bad-task-commit-sha>
```

Each task is its own commit, so reverting one undoes that task's CSS / mjs changes without touching subsequent tasks. Some tasks (3, 4, 7) depend on each other's CSS structure — reverting earlier tasks while keeping later ones may produce orphan selectors. Revert in reverse order when rolling back multiple.

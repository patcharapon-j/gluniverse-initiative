# GLUniverse Initiative — Visual Overhaul Design

**Status:** Approved (brainstorming session 2026-05-22)
**Scope:** Complete visual refresh of the initiative overlay UI — card chrome, motion language, round splash. No changes to data shape, hook surface, settings, or behavioral logic.
**Inspiration:** Arknights: Endfield — architectural calm, precision rules, restrained ceremony.

## Overview

GLUniverse Initiative currently presents a tactical-HUD aesthetic with rounded landscape cards, scanline textures, saturated disposition colors, and a centered-symmetric splash with twin scanlines and a parallelogram backdrop. The overhaul shifts the vocabulary to a quieter, more architectural language: notched-corner cards, a single line-decoration motif, a sheen-sweep enter animation that ties moment-to-moment turn changes to once-per-round splash, and motion that feels tight, premium, and satisfying rather than busy.

The existing module architecture (single ES module + single CSS file, Foundry v13 hooks, world settings) stays intact. No data migration, no breaking changes for users. On upgrade, the next combat start renders the new visuals.

## Design Decisions Summary

| Area | Choice |
|---|---|
| Card silhouette | Notched Block — diagonal corner cut at top-right, L-bracket marker top-left |
| Palette | Cyan friend / **white** neutral / red hostile / violet secret |
| Round splash composition | Punch-In Cinematic — horizontal precision rule + centered deck with label/number/sub-string |
| Splash motion | Sheen Sweep — digits exist as etched ghosts, lit up by the rule sweeping across |
| Active card enter motion | Sheen line draws horizontally across the new active card, matching the splash language |
| Motion philosophy | Architectural, restrained, line-driven. Snappy curves with selective overshoot for numerals |

## Section 1 — Design Token System

All visuals reference a small set of CSS custom properties on `:root`. Components carry no inline color or duration values.

### Color tokens

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
}
```

Disposition mapping:

- `--gluni-accent: var(--gluni-cyan)` for friendly
- `--gluni-accent: var(--gluni-white)` for neutral
- `--gluni-accent: var(--gluni-red)` for hostile
- `--gluni-accent: var(--gluni-violet)` for secret/mystery

The current `--gluni-gold` token is removed; neutral is now white, matching the cooler Endfield-inspired tone.

### Motion tokens

```css
:root {
  --gluni-ease:        cubic-bezier(0.16, 1, 0.3, 1);     /* default decel */
  --gluni-snap:        cubic-bezier(0.2, 1.35, 0.22, 1);  /* slight overshoot for numerals, chips */
  --gluni-exit:        cubic-bezier(0.55, 0, 0.84, 0);    /* sharp accelerated exit */
  --gluni-d-quick:     180ms;   /* hover, control state */
  --gluni-d-card:      420ms;   /* card FLIP, grow/shrink */
  --gluni-d-splash-in: 720ms;   /* splash reveal */
  --gluni-d-splash-out: 460ms;  /* splash dismiss */
}
```

Motion tiers (`reduced` / `default` / `cinematic`) override a subset of these via a class on the overlay root. See Section 6.

### Typography

Font stack unchanged: `"Bahnschrift", "Share Tech Mono", "JetBrains Mono", "Cascadia Mono", Consolas, monospace`. All names uppercase. Letter-spacing scales by context: 0.06em (small names) up to 0.55em (splash label). Numerals always `font-variant-numeric: tabular-nums`.

### Removed from current design

- Per-card `repeating-linear-gradient` scanline overlay (`gluni-card::after`).
- Red `text-shadow` secondary glow on splash number.
- Skewed parallelogram backdrop frame (`gluni-round-splash-inner::before`).
- Twin scanlines above/below splash deck (`gluni-round-splash::before`/`::after`).
- `--gluni-gold` token.
- `backdrop-filter: blur(8px)` on chip-level elements (round chip, drag handle, turn buttons).
- Cyan inset glow on auxiliary chrome (`inset 0 0 18px rgba(94, 234, 255, 0.06)`).

## Section 2 — Card Chrome (Notched Block)

### Silhouette

- `clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)` on inactive cards.
- Active cards scale the cut proportionally: `calc(100% - 14px) 0, 100% 14px`.
- No `border-radius` — square-precision geometry.
- Border applied via `::before` overlay since `clip-path` strips standard borders.

### Surface stack (z-order, inside the clip)

1. `--gluni-ink` body fill.
2. Portrait wrap (`.gluni-card-portrait-wrap > .gluni-card-portrait`, object-fit cover, framing controlled by existing Actor flags).
3. Scrim: `linear-gradient(95deg, rgba(2,5,8,0.95), rgba(2,5,8,0.48) 50%, rgba(2,5,8,0))` — heavier on the leading edge so text always reads.
4. Accent edge bar (`.gluni-card-accent`): 3px wide on the leading edge, full height. Glow: `box-shadow: 0 0 16px var(--gluni-accent)`.
5. L-bracket marker (`.gluni-card-bracket`, new element): 8×8px, 1px stroke, `--gluni-line-strong`. Always present.
6. ACTIVE kicker tag (`.gluni-active-tag`): visible only on the active card.

### Initiative chip

- Same diagonal-cut motif applied to the chip: `clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px)`.
- Inactive: `rgba(2,7,11,0.78)` background, `--gluni-white` text, 12px Bahnschrift.
- Active: filled with `--gluni-accent`, ink-color text, 14px Bahnschrift. No shadow halo.

### Name typography

- Inactive: 12px Bahnschrift 950, 0.08em letter-spacing, single-line ellipsis.
- Active: 16px Bahnschrift 950, 0.08em letter-spacing.

### Disposition variants

Only `--gluni-accent` swaps. Body, scrim, bracket, type all stay the same. This is what makes the rail feel coherent across friendly / neutral / hostile / secret.

### Defeated

Applied filter: `saturate(0.18) brightness(0.62) opacity(0.65)`. Accent edge dims to 30% alpha. Bracket marker stays visible.

### Mystery card

- Same silhouette and chrome; no portrait image.
- Large `?` glyph centered: 56px on inactive, 96px on active. Color: `--gluni-violet`. Backed by a soft `--gluni-violet`-tinted radial wash.

### Removed

- `.gluni-card-vignette` element (top-right highlight bloom that fought the diagonal cut).
- `::after` repeating-linear-gradient scanline texture.
- 5px `border-radius`.

## Section 3 — Active Card Treatment & Turn-Change Motion

The active card is the focal point of the overlay. Its visual treatment and enter motion tie the rail to the splash language (sheen sweep).

### Resting state

- Height: 124px (was 108). Width: rail width + 12px outward overhang.
- Portrait wrap shifts `top: -28px` (head-to-chest visible). Portrait uses the actor's "expanded" framing flags.
- Accent edge bar grows from 3px → 4px and glow doubles: `box-shadow: 0 0 24px var(--gluni-accent)`.
- L-bracket marker brightens from `--gluni-line-strong` to `--gluni-accent`.
- ACTIVE kicker tag fades in (top-leading).
- Initiative chip fills with accent color, scales to 14px.

### Active-enter motion (~620ms total)

| Phase | Time | Behavior |
|---|---|---|
| FLIP grow | 0–80ms | Height + width animate from inactive to active footprint. `--gluni-ease`. |
| Portrait expand | 80–320ms | Scale 1.06 → 1.20, translateY -9px, blur-clear 3px → 0. `--gluni-ease`. |
| Sheen line | 140–500ms | New `.gluni-card-sheen` element: 1px cyan rule draws horizontally across the top-third of the card, leading-edge to trailing-edge. As it crosses, L-bracket pops bright, kicker tag fades in, name brightens 75% → 100% alpha. `--gluni-ease`. |
| Init chip fill | 320–620ms | Background crossfades dark → accent, text color crossfades, size scales. `--gluni-snap`. |

The sheen line uses the same vocabulary as the splash V1 reveal — same rule, same direction, smaller scale. This is the visual through-line that ties moment-to-moment turn changes to the once-per-round splash.

### Active-exit motion (~520ms)

- Card is detached into a ghost element appended to `document.body` (current technique — retain).
- Ghost slides laterally toward the play area: translate 88px outward, scale to 0.86, blur to 8px, opacity 0. Curve: `--gluni-exit`.
- Remaining cards in the rail FLIP into new positions over `--gluni-d-card` with `--gluni-ease`.

### Bottom-insertion motion (~360ms)

- Card slides up from `translateY(10px)`, blur-clears 2px → 0, opacity 0 → 1, scale 0.985 → 1.
- `--gluni-ease`.

### Delay / return motion

- Delay: active card morphs in place (no ghost) and FLIPs down into the delayed section over 440ms. Portrait reverts to normal framing during the move.
- Return: previously-active card pushes down (rejoin animation), returning card grows up from the delayed section into the active slot. Total 520ms.

### Hover state (visible cards, GM and player)

- 1px accent line draws across the top of the hovered card (180ms, `--gluni-ease`).
- Portrait gains `filter: brightness(1.06)` for 180ms.
- Token highlight pings on the scene — already working, keep.

### Removed

- `gluni-active-signal` keyframe (the box-shadow pulse on active enter). Replaced by the sheen line, which reads as architectural rather than as a tactical HUD ping.

## Section 4 — Header & Auxiliary Chrome

### Round chip

- Layout: `ROUND ⋅ 02` block. Small uppercase `ROUND` (8px, tracked 0.32em, white 60% alpha) on the left, 1px vertical hairline divider, tabular cyan numeral (16px) on the right.
- Notched-corner clip-path (12px cut), scaled down to fit ~80px width.
- 1px cyan-tinted border. Flat dark ink fill. Single thin top precision rule for surface decoration.
- No backdrop-filter blur.

### Drag handle (GM-only)

- 24×22px chip, same notched corner. Three horizontal lines (≡) as grip icon, white 50% alpha.
- Cursor: `grab` → `grabbing` while dragging.
- Disabled state for non-GM users: 28% opacity (current behavior — keep).
- Hover: lines brighten to 90% alpha, leading edge gets a 2px cyan inner shadow.

### Turn controls (GM-only, prev / next)

- Two stacked 24×24px buttons, floating side layer anchored to the active card slot (current architecture — keep).
- Notched corner cut (4px). Default: dark ink body, white chevron icon at 78% alpha, 1px border `--gluni-line`.
- Hover: background fills with `--gluni-cyan`, icon turns ink-color, button lifts `translateY(-1px)`. 180ms `--gluni-ease`.
- 3px gap between buttons. Offset 6px outward from the active card.

### End-turn button (player, on active card)

- Same floating side-layer position when the local user owns the active combatant.
- Pill-shape, ~64px wide. Notched-corner motif.
- Default: filled with `--gluni-accent` (active combatant's disposition color), ink text, label `END TURN` at 8px tracked 0.18em.
- Hover: `filter: brightness(1.12)`, lifts 1px, glow doubles.
- Click: 120ms press feedback (`translateY(0) scale(0.97)`) then settles. If server denies request, button shakes 6px laterally for 220ms.

### GM visibility controls (per-card, hover-revealed)

- 4 small buttons in a row: `AUTO`, `SHOW`, `MASK`, `HIDE`.
- 18×18px each, notched corner.
- Placement: bottom-trailing on hover (current placement — keep). Reveal timing tightened to 140ms fade-up.
- Selected state: button fills with the corresponding semantic color (cyan for SHOW, violet for MASK, red for HIDE, white for AUTO).
- Persistent label badge in top-trailing corner (current behavior — keep, align to new edge inset values).

### Delayed-section heading

- `— DELAYED`, 9px Bahnschrift 950, tracked 0.32em.
- Prefixed with a 12px cyan tick mark matching the splash kicker language.

## Section 5 — Round Splash Detail Spec

Composition: S3 Punch-In Cinematic. Motion: V1 Sheen Sweep.

### Layout

- Splash root: fixed full-viewport overlay, z-index 90, `place-items: center`. No background.
- A horizontal precision rule that spans 88% of viewport width.
- A centered deck containing label, number, and sub-string.
- Deck horizontal vignette: `linear-gradient(90deg, transparent 0%, rgba(2,5,8,0.82) 30%, rgba(2,5,8,0.82) 70%, transparent 100%)`. No border, no brackets.

### Number

- Two-digit zero-padded (`01`, `02`, … `99`), natural width from `100`.
- `clamp(108px, 17vw, 230px)` Bahnschrift 950, `line-height: 0.74`, tabular-nums.
- Color: `--gluni-white`. Text-shadow: `0 0 32px rgba(94, 234, 255, 0.6), 0 16px 50px rgba(0, 0, 0, 0.85)`.
- Each digit is its own DOM element (`<span class="d">`) so sheen-sweep can stagger their reveals.
- The splash always uses cyan regardless of any disposition context — it is a system event.

### Label (above number)

- Text: `ROUND`, 14px Bahnschrift 950, tracked 0.55em, white 85% alpha.
- A 14px cyan tick line sits immediately left of the label with an 8px box-shadow glow.

### Sub-string (below number)

- Text: `INITIATIVE · CYCLE — 02` (round number appended dynamically).
- 10px Bahnschrift 950, tracked 0.45em, white 36% alpha.
- Absolute position, `bottom: -24px` from the number block, center-aligned.

### Motion — frame-by-frame

Total cycle ~1860ms visible. In ~720ms, hold ~680ms, out ~460ms.

| Time | Event |
|---|---|
| 0ms | Splash root inserted. Rule width 0, deck opacity 0, digits at 18% etched ghost. |
| 0–180ms | Rule scales from 4px → 88vw centered, opacity 0 → 1. `--gluni-ease`. |
| 100–280ms | Deck fades 0 → 1. Sub-string still hidden. |
| 200ms | Label tick draws to 14px width. Label text fades in tightening from 0.7em → 0.55em tracking. |
| 220ms | Tens digit lights up: opacity 0.18 → 1, `filter: brightness(1.6)` peak, text-shadow glow burst, settles to brightness(1.1) by 320ms. Curve: `cubic-bezier(0.2, 1.0, 0.3, 1)`. |
| 280ms | Units digit lights up — same animation, 60ms offset. |
| 380ms | Sub-string fades in (no movement). |
| 720ms | Hold begins. |
| ~1400ms | Hold ends. Out cycle begins. |
| 1400–1560ms | Sheen rule passes back R → L, dimming each digit to 0.18 ghost as the rule crosses it (reverse-staggered). |
| 1560–1740ms | Rule retracts 88vw → 4px → 0, opacity 1 → 0. |
| 1700–1860ms | Deck fades 1 → 0. |
| 1860ms | Splash root removed from DOM. |

### Removed from current splash

- Skewed parallelogram backdrop frame (`gluni-round-splash-inner::before`).
- Red secondary text-shadow glow on the number.
- Double scanlines above and below the deck.
- `gluni-round-shell-leave` half-blank fade — replaced by explicit element-level out keyframes that run in parallel.

## Section 6 — Motion Intensity Tiers

The existing `animationIntensity` world setting (`reduced` / `default` / `cinematic`) is preserved. The overhaul redefines what each tier renders so the differences are felt as personality changes, not just speed changes.

Each tier is selected via a single class on the overlay root: `gluni-initiative--reduced`, `gluni-initiative--default` (or no modifier), `gluni-initiative--cinematic`.

### `reduced` — Snappy & functional

| Element | Behavior |
|---|---|
| Card FLIP | 240ms (was 420). Same curve. |
| Active enter | Card grow + portrait scale runs. **Sheen line is skipped.** Bracket and kicker fade in directly. |
| Ghost exit | Lateral slide retained, blur drops to 2px, distance to 56px. 320ms. |
| Bottom entry | Slide-up retained, no blur. 200ms. |
| Round splash | Number appears centered with no sheen sweep — straight blur-clear punch-in. Total visible 1100ms (in 320 / hold 580 / out 200). |
| Hover sheen | Skipped. Hover only changes border + brightness. |

Reads as "polished business" — nothing pops, but everything still moves.

### `default` — Full spec

Sections 3 and 5 describe this tier verbatim.

### `cinematic` — Ceremonial & lingering

| Element | Behavior |
|---|---|
| Card FLIP | 620ms (slower, more weight). |
| Active enter | Sheen line runs slower and gains a soft trailing flare — 28px-wide bright head with fading tail (50ms cleanup after the line completes). Portrait scale duration 780ms. |
| Ghost exit | 720ms. Distance 110px, blur to 12px. Trailing edge briefly emits a 1px receding accent line. |
| Bottom entry | 480ms. Subtle scale grow (1.0 → 1.02 → 1.0). |
| Round splash | Total visible 2600ms. In 1000 / hold 1200 / out 400. Sheen draws slower. Digits hold their bright peak ~80ms longer. The primary rule gains a 1px secondary "echo" rule drawn 60ms behind it, offset 8px above. |
| Hover sheen | Full 280ms instead of 180ms. |

### `prefers-reduced-motion` (OS-level override)

When the user's OS prefers reduced motion:
- Force-clamp to `reduced` tier values regardless of world setting.
- Skip the sheen sweep entirely (cards and splash). Splash digits fade in with no blur or movement. Cards still FLIP but at 120ms.

The existing `@media (prefers-reduced-motion: reduce)` block in current CSS is extended to suppress the new sheen and rule animations.

## Section 7 — Implementation Architecture

### File structure

Unchanged:
- `scripts/gluniverse-initiative.mjs` — single ES module.
- `styles/gluniverse-initiative.css` — single stylesheet.
- `lang/en.json` — add `splash.cycle` and `delayed.heading` strings.
- `module.json` — no change.

### DOM changes — cards

New elements added inside `.gluni-card`:
- `.gluni-card-bracket` — 8×8px L-bracket, always present.
- `.gluni-card-sheen` — 1px sheen line, hidden by default, animated on active-state transition.

Removed:
- `.gluni-card-vignette` element.

### DOM changes — splash

Current:
```html
.gluni-round-splash > .gluni-round-splash-inner > <span>ROUND</span><strong>02</strong>
```

New:
```html
.gluni-round-splash >
  .gluni-round-rule >
  .gluni-round-splash-inner >
    .gluni-round-label > <span class="tick"></span><span>ROUND</span>
    .gluni-round-num > <span class="d">0</span><span class="d">2</span>
    .gluni-round-sub > <span>INITIATIVE · CYCLE — 02</span>
```

The splash generator emits one `<span class="d">` per digit dynamically. `nth-child` selectors handle the per-digit stagger; for round ≥ 100 the additional digits inherit the same animation with linearly extending delay.

### Card silhouette technique

- `clip-path` on `.gluni-card` for the notched corner.
- Border applied via `::before` overlay.
- Accent edge bar sits inside the clipped area (z-index 7).
- The narrow-screen media query (`max-width: 720px`) is preserved with updated card heights.

### Motion intensity tier swap

A single class on the overlay root drives all tier-specific behavior. The existing world-setting change handler in `gluniverse-initiative.mjs` already triggers a re-render — the new code just swaps the tier class instead of recomputing inline values.

### Hook surface — unchanged

All Foundry hooks remain intact:
- `combatStart`, `combatRound`, `combatTurn`, `deleteCombat`
- `updateCombatant`
- `renderActorSheet` (portrait framing native controls)
- Socket message for player end-turn requests

No changes to data shape, flag schema, or world settings.

### Risk areas

1. **Clip-path on ghost cards.** The active-exit ghost element is cloned and appended to `document.body`. The clone must inherit or be explicitly assigned the same `clip-path` so the exit animation matches the silhouette. Verify the existing clone code copies inline styles, or set the clip-path explicitly during clone.
2. **Active card portrait overflow vs. clip-path.** The active card's portrait wrap currently uses `clip-path: inset(0 0 0 0 round 5px)` to handle the `top: -28px` overflow inside the rounded card. With the new notched silhouette, this inner clip-path must either be updated to match the notched shape or removed entirely (the parent's clip-path handles the boundary).
3. **Cinematic-tier sheen trailing flare.** A `::after` pseudo-element on the sheen with a fast secondary animation. Verify the GPU compositor handles two simultaneous transform + opacity animations cleanly on lower-end hardware.

### Test surface

No formal test suite — Foundry module. Verification is manual:

1. Foundry world with PF2e or generic system, multiple combatants of different dispositions, at least one with hidden state.
2. Begin combat → confirm overlay appears with new chrome.
3. Advance turns → confirm sheen sweep + ghost exit + FLIP.
4. Cross a round boundary → confirm new splash plays correctly for 01, 02, 99, 100, 100+.
5. Toggle each GM visibility mode (auto / show / mask / hide) → confirm chrome states.
6. Delay an active combatant → confirm shrink animation into delayed section.
7. Return a delayed combatant → confirm return animation.
8. Toggle each `animationIntensity` tier in world settings → confirm cycle feels distinct.
9. Enable `prefers-reduced-motion` in OS → confirm clamps to reduced behavior.
10. Test rail on both edges (left and right) — confirm sheen direction, ghost-exit direction, and overhang all mirror correctly.

### Migration

None. Existing flags (visibility mode, framing values, world position) work as-is. Existing world settings work as-is. A user who upgrades sees new visuals on next combat start.

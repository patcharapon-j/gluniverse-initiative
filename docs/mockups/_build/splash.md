# Splash premium-pass build — round + break unified glass engine

Two centred-banner overlays (`.gluni-round-splash` cyan, `.gluni-break-splash` amber)
become siblings off one visual engine: a layered **scrim → frosted-glass deck → foreground
type** composition with motion-blur entry, an overshoot-then-settle beat, a rule glint, and
sharper per-glyph choreography. Break additionally gets an impact burst + short screen shake.

Fidelity is read from the existing client setting `visualFidelity` (do NOT register it) and
emitted as a class `gluni-fidelity--high` / `gluni-fidelity--balanced` on each splash root.
Real `backdrop-filter` glass is gated under `--high`; faked layered-gradient glass under
`--balanced`. The `animationIntensity` tiering (`--reduced` / `--cinematic`) is preserved.

Markup adds ONE child inside each existing `-inner`: a `.gluni-round-deck` /
`.gluni-break-deck` glass plate element (first child, `aria-hidden`). It sits behind the
type as the dedicated glass/bevel/glow layer so depth layers are clean. All previously
existing class names are kept.

---

## JS — replace methods

(Anchor by method name. `showRoundSplash` and `showBreakSplash` change their `className`
string + add one inner deck element + add a fidelity helper; the four `get*` helpers are
unchanged in signature but re-listed so the orchestrator can drop them in verbatim. A new
private helper `getVisualFidelity()` is introduced — add it near the other splash helpers.)

```js
// showRoundSplash  — anchor: "showRoundSplash(round)"
showRoundSplash(round) {
  if (!this.enabled || !round) return;
  if (this.lastSplashRound === round) return;
  this.lastSplashRound = round;

  const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default";
  const fidelity = this.getVisualFidelity();
  const formatted = formatRound(round);
  const digitSpans = Array.from(formatted).map(digit => `<span class="d">${digit}</span>`).join("");
  const subString = formatLocalized("GLUNI.Splash.Cycle", { round: formatted });

  const splash = document.createElement("div");
  splash.className = `gluni-round-splash gluni-round-splash--${intensity} gluni-fidelity--${fidelity}`;
  splash.innerHTML = `
    <div class="gluni-round-rule" aria-hidden="true"></div>
    <div class="gluni-round-splash-inner">
      <div class="gluni-round-deck" aria-hidden="true"></div>
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

```js
// getRoundSplashHold  — anchor: "getRoundSplashHold()"  (unchanged)
getRoundSplashHold() {
  const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
  if (intensity === "reduced") return 300;
  if (intensity === "cinematic") return 940;
  return 760;
}
```

```js
// getRoundSplashDuration  — anchor: "getRoundSplashDuration()"  (unchanged)
getRoundSplashDuration() {
  const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
  if (intensity === "reduced") return 820;
  if (intensity === "cinematic") return 1500;
  return 1240;
}
```

```js
// showBreakSplash  — anchor: "showBreakSplash(name)"
showBreakSplash(name) {
  if (!this.enabled || !name) return;

  const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default";
  const fidelity = this.getVisualFidelity();
  const breakText = localize("GLUNI.GuardBreak").toUpperCase();
  const letterSpans = Array.from(breakText).map(letter =>
    letter === " " ? `<span class="d"> </span>` : `<span class="d">${escapeHTML(letter)}</span>`
  ).join("");

  const splash = document.createElement("div");
  splash.className = `gluni-break-splash gluni-break-splash--${intensity} gluni-fidelity--${fidelity}`;
  splash.innerHTML = `
    <div class="gluni-break-splash-burst" aria-hidden="true"></div>
    <div class="gluni-break-splash-rule" aria-hidden="true"></div>
    <div class="gluni-break-splash-inner">
      <div class="gluni-break-deck" aria-hidden="true"></div>
      <div class="gluni-break-splash-label">
        <span class="tick" aria-hidden="true"></span>
        <span>${localize("GLUNI.Splash.Break").toUpperCase()}</span>
      </div>
      <div class="gluni-break-splash-text">${letterSpans}</div>
      <div class="gluni-break-splash-name"><span>${escapeHTML(name)}</span></div>
    </div>
  `;
  document.body.appendChild(splash);

  window.requestAnimationFrame(() => splash.classList.add("gluni-break-splash--show"));
  // Short screen-shake on impact (skipped on reduced tier via the class gate in CSS).
  if (intensity !== "reduced") {
    window.requestAnimationFrame(() => {
      splash.classList.add("gluni-break-splash--shake");
      window.setTimeout(() => splash.classList.remove("gluni-break-splash--shake"), intensity === "cinematic" ? 520 : 420);
    });
  }
  window.setTimeout(() => splash.classList.add("gluni-break-splash--leave"), this.getBreakSplashHold());
  window.setTimeout(() => splash.remove(), this.getBreakSplashDuration());
}
```

```js
// getBreakSplashHold  — anchor: "getBreakSplashHold()"  (unchanged)
getBreakSplashHold() {
  const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
  if (intensity === "reduced") return 440;
  if (intensity === "cinematic") return 1600;
  return 1200;
}
```

```js
// getBreakSplashDuration  — anchor: "getBreakSplashDuration()"  (unchanged)
getBreakSplashDuration() {
  const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
  if (intensity === "reduced") return 960;
  if (intensity === "cinematic") return 2400;
  return 1860;
}
```

```js
// getVisualFidelity  — NEW helper. Add adjacent to the splash helpers above
// (e.g. right after getRoundSplashDuration). Guarded read of the existing
// client setting "visualFidelity"; defaults to "high".
getVisualFidelity() {
  let fidelity = "high";
  try { fidelity = game.settings.get("gluniverse-initiative", "visualFidelity") || "high"; } catch {}
  return fidelity === "balanced" ? "balanced" : "high";
}
```

---

## CSS — REPLACE these existing blocks

### Replaces `.gluni-round-splash--show`
```css
.gluni-round-splash--show {
  opacity: 1;
  background:
    radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--gluni-cyan) 7%, transparent) 0%, transparent 38%),
    radial-gradient(ellipse at 50% 50%, transparent 24%, rgba(2, 5, 8, 0.20) 58%, rgba(2, 5, 8, 0.46) 100%);
}
```

### Replaces `.gluni-round-rule`
```css
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

/* Glint that rides across the rule on settle */
.gluni-round-rule::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 22%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--gluni-white), transparent);
  filter: blur(1px);
  opacity: 0;
  transform: translateX(-160%);
}
```

### Replaces `.gluni-round-splash-inner`
```css
/* Foreground TYPE layer only — no background here; the deck plate carries the glass. */
.gluni-round-splash-inner {
  position: relative;
  display: grid;
  justify-items: center;
  row-gap: 5px;
  min-width: min(420px, 76vw);
  padding: 24px 60px;
  background: transparent;
  opacity: 0;
  transform: translateY(7px) scale(0.978);
  filter: blur(6px);
}

/* Frosted-glass deck plate: scrim + bevel + accent glow, sits behind the type. */
.gluni-round-deck {
  position: absolute;
  inset: -4px -10px;
  z-index: -1;
  pointer-events: none;
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    rgba(10, 22, 30, 0.62),
    rgba(2, 7, 11, 0.78) 52%,
    rgba(2, 6, 10, 0.7)
  );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--gluni-cyan) 30%, rgba(255, 255, 255, 0.22)),
    inset 0 -1px 0 rgba(0, 0, 0, 0.7),
    inset 0 0 0 1px color-mix(in srgb, var(--gluni-cyan) 22%, var(--gluni-line)),
    inset 0 0 38px color-mix(in srgb, var(--gluni-cyan) 12%, transparent),
    0 26px 70px rgba(0, 0, 0, 0.62);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
}

/* Real frosted glass on HIGH fidelity. */
.gluni-round-splash.gluni-fidelity--high .gluni-round-deck {
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
}

/* Faked layered-gradient glass on BALANCED fidelity (no backdrop-filter). */
.gluni-round-splash.gluni-fidelity--balanced .gluni-round-deck {
  background:
    linear-gradient(125deg, rgba(255, 255, 255, 0.05), transparent 38%),
    repeating-linear-gradient(115deg, rgba(255, 255, 255, 0.018) 0 2px, transparent 2px 5px),
    linear-gradient(180deg, rgba(12, 26, 34, 0.86), rgba(2, 6, 10, 0.92) 54%, rgba(2, 6, 10, 0.86));
}
```

### Replaces `.gluni-round-num .d`
```css
.gluni-round-num .d {
  --gluni-digit-delay: 150ms;
  --gluni-digit-cinematic-delay: 220ms;
  display: inline-block;
  opacity: 0.16;
  filter: brightness(0.88) blur(3px);
  transform: translateY(10px);
}
```

### Replaces `.gluni-round-splash--show .gluni-round-splash-inner`
```css
.gluni-round-splash--show .gluni-round-splash-inner {
  animation: gluni-splash-deck-in 360ms var(--gluni-snap) 70ms forwards;
}
```

### Replaces `.gluni-round-splash--show .gluni-round-num .d`
```css
.gluni-round-splash--show .gluni-round-num .d {
  animation: gluni-splash-digit-in 300ms var(--gluni-snap) var(--gluni-digit-delay) both;
}
```

### Replaces digit stagger delays (snappier; 18ms→14ms steps)
```css
.gluni-round-splash--show .gluni-round-num .d:nth-child(2) {
  --gluni-digit-delay: 164ms;
  --gluni-digit-cinematic-delay: 244ms;
}

.gluni-round-splash--show .gluni-round-num .d:nth-child(3) {
  --gluni-digit-delay: 178ms;
  --gluni-digit-cinematic-delay: 268ms;
}

.gluni-round-splash--show .gluni-round-num .d:nth-child(4) {
  --gluni-digit-delay: 192ms;
  --gluni-digit-cinematic-delay: 292ms;
}

.gluni-round-splash--show .gluni-round-num .d:nth-child(5) {
  --gluni-digit-delay: 206ms;
  --gluni-digit-cinematic-delay: 316ms;
}
```

### Replaces `@keyframes gluni-splash-deck-in` (overshoot + settle + motion-blur resolve)
```css
@keyframes gluni-splash-deck-in {
  0% {
    opacity: 0;
    transform: translateY(7px) scale(0.978);
    filter: blur(6px);
  }
  60% {
    opacity: 1;
    transform: translateY(-1px) scale(1.03);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
```

### Replaces `@keyframes gluni-splash-digit-in` (y-offset + blur-resolve + brighter pop)
```css
@keyframes gluni-splash-digit-in {
  0% {
    opacity: 0.16;
    filter: brightness(0.88) blur(3px);
    transform: translateY(10px);
  }
  50% {
    opacity: 1;
    filter: brightness(1.5) blur(0);
    transform: translateY(-1px);
  }
  100% {
    opacity: 1;
    filter: brightness(1.06) blur(0);
    transform: translateY(0);
  }
}
```

### Replaces `@keyframes gluni-splash-deck-out` (resolve back to soft blur on exit)
```css
@keyframes gluni-splash-deck-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-6px) scale(0.982);
    filter: blur(6px);
  }
}
```

### Replaces `.gluni-break-splash--show` (amber scrim accent)
```css
.gluni-break-splash--show {
  opacity: 1;
  background:
    radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--gluni-break) 9%, transparent) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(2, 5, 8, 0.26) 60%, rgba(2, 5, 8, 0.56) 100%);
}
```

### Replaces `.gluni-break-splash-inner`
```css
/* Foreground TYPE layer only — glass lives on the deck plate. */
.gluni-break-splash-inner {
  position: relative;
  display: grid;
  justify-items: center;
  row-gap: 6px;
  min-width: min(480px, 82vw);
  padding: 28px 66px;
  background: transparent;
  opacity: 0;
  transform: translateY(9px) scale(0.975);
  filter: blur(7px);
}

/* Amber sibling of the round deck: same glass engine, hotter palette. */
.gluni-break-deck {
  position: absolute;
  inset: -4px -10px;
  z-index: -1;
  pointer-events: none;
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    rgba(30, 18, 6, 0.6),
    rgba(8, 5, 2, 0.8) 52%,
    rgba(6, 4, 2, 0.72)
  );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--gluni-break-hot) 36%, rgba(255, 255, 255, 0.24)),
    inset 0 -1px 0 rgba(0, 0, 0, 0.72),
    inset 0 0 0 1px color-mix(in srgb, var(--gluni-break) 26%, var(--gluni-line)),
    inset 0 0 44px color-mix(in srgb, var(--gluni-break) 15%, transparent),
    0 26px 74px rgba(0, 0, 0, 0.66);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}

.gluni-break-splash.gluni-fidelity--high .gluni-break-deck {
  backdrop-filter: blur(15px) saturate(1.55);
  -webkit-backdrop-filter: blur(15px) saturate(1.55);
}

.gluni-break-splash.gluni-fidelity--balanced .gluni-break-deck {
  background:
    linear-gradient(125deg, rgba(255, 224, 160, 0.06), transparent 40%),
    repeating-linear-gradient(115deg, rgba(255, 224, 160, 0.022) 0 2px, transparent 2px 5px),
    linear-gradient(180deg, rgba(34, 20, 7, 0.86), rgba(8, 5, 2, 0.92) 54%, rgba(8, 5, 2, 0.86));
}
```

### Replaces `.gluni-break-splash-text .d` (stronger blur-resolve start)
```css
.gluni-break-splash-text .d {
  --gluni-break-letter-delay: 96ms;
  --gluni-break-letter-cinematic-delay: 150ms;
  display: inline-block;
  opacity: 0;
  filter: brightness(0.8) blur(3px);
  transform: translateY(16px) scaleY(1.14);
}
```

### Replaces letter stagger delays (snappier; 28ms→22ms steps)
```css
.gluni-break-splash-text .d:nth-child(2) {
  --gluni-break-letter-delay: 118ms;
  --gluni-break-letter-cinematic-delay: 178ms;
}
.gluni-break-splash-text .d:nth-child(3) {
  --gluni-break-letter-delay: 140ms;
  --gluni-break-letter-cinematic-delay: 206ms;
}
.gluni-break-splash-text .d:nth-child(4) {
  --gluni-break-letter-delay: 162ms;
  --gluni-break-letter-cinematic-delay: 234ms;
}
.gluni-break-splash-text .d:nth-child(5) {
  --gluni-break-letter-delay: 184ms;
  --gluni-break-letter-cinematic-delay: 262ms;
}
.gluni-break-splash-text .d:nth-child(6) {
  --gluni-break-letter-delay: 206ms;
  --gluni-break-letter-cinematic-delay: 290ms;
}
.gluni-break-splash-text .d:nth-child(7) {
  --gluni-break-letter-delay: 228ms;
  --gluni-break-letter-cinematic-delay: 318ms;
}
.gluni-break-splash-text .d:nth-child(8) {
  --gluni-break-letter-delay: 250ms;
  --gluni-break-letter-cinematic-delay: 346ms;
}
.gluni-break-splash-text .d:nth-child(9) {
  --gluni-break-letter-delay: 272ms;
  --gluni-break-letter-cinematic-delay: 374ms;
}
.gluni-break-splash-text .d:nth-child(10) {
  --gluni-break-letter-delay: 294ms;
  --gluni-break-letter-cinematic-delay: 402ms;
}
```

### Replaces `.gluni-break-splash--show .gluni-break-splash-inner`
```css
.gluni-break-splash--show .gluni-break-splash-inner {
  animation: gluni-break-deck-in 340ms var(--gluni-snap) 50ms forwards;
}
```

### Replaces `@keyframes gluni-break-deck-in` (bigger overshoot + settle, blur resolve)
```css
@keyframes gluni-break-deck-in {
  0% {
    opacity: 0;
    transform: translateY(9px) scale(0.975);
    filter: blur(7px);
  }
  54% {
    opacity: 1;
    transform: translateY(-3px) scale(1.035);
    filter: blur(0);
  }
  78% {
    transform: translateY(1px) scale(0.994);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
```

### Replaces `@keyframes gluni-break-deck-out`
```css
@keyframes gluni-break-deck-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-7px) scale(0.98);
    filter: blur(7px);
  }
}
```

---

## CSS — APPEND these new blocks

```css
/* Round rule glint: fires on settle (after --show), gated to high+cinematic for premium feel. */
.gluni-round-splash--show .gluni-round-rule::before {
  animation: gluni-splash-rule-glint 540ms var(--gluni-ease) 220ms forwards;
}

.gluni-round-splash--reduced .gluni-round-rule::before {
  animation: none;
  opacity: 0;
}

@keyframes gluni-splash-rule-glint {
  0% { opacity: 0; transform: translateX(-160%); }
  16% { opacity: 0.9; }
  100% { opacity: 0; transform: translateX(520%); }
}
```

```css
/* Break impact shake — JS toggles .gluni-break-splash--shake briefly after --show.
   Applied to the deck/type plate so the scrim stays still. Reduced tier never gets the class. */
.gluni-break-splash--shake .gluni-break-splash-inner {
  animation:
    gluni-break-deck-in 340ms var(--gluni-snap) 50ms forwards,
    gluni-break-shake 420ms ease-out 40ms;
}

.gluni-break-splash--cinematic.gluni-break-splash--shake .gluni-break-splash-inner {
  animation:
    gluni-break-deck-in 340ms var(--gluni-snap) 50ms forwards,
    gluni-break-shake-strong 520ms ease-out 40ms;
}

@keyframes gluni-break-shake {
  0% { translate: 0 0; }
  18% { translate: -5px 2px; }
  36% { translate: 4px -2px; }
  54% { translate: -3px 1px; }
  72% { translate: 2px -1px; }
  100% { translate: 0 0; }
}

@keyframes gluni-break-shake-strong {
  0% { translate: 0 0; }
  14% { translate: -8px 3px; }
  30% { translate: 7px -3px; }
  46% { translate: -5px 2px; }
  62% { translate: 4px -2px; }
  80% { translate: -2px 1px; }
  100% { translate: 0 0; }
}
```

```css
/* Break rule edge-glint on settle (cinematic-leaning premium accent). */
.gluni-break-splash--show .gluni-break-splash-rule::after {
  /* Note: ::after on the rule is already declared under --cinematic; this glint
     reuses the existing echo. For balanced/default add a sweeping highlight here. */
}
```

```css
/* HIGH-fidelity deck gets a faint moving spec highlight on the bevel for "real glass" sheen.
   Balanced fidelity skips it (transform/opacity only elsewhere). */
.gluni-round-splash.gluni-fidelity--high .gluni-round-deck::after,
.gluni-break-splash.gluni-fidelity--high .gluni-break-deck::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 255, 255, 0.06) 48%,
    transparent 60%
  );
  opacity: 0;
}

.gluni-round-splash.gluni-fidelity--high.gluni-round-splash--show .gluni-round-deck::after,
.gluni-break-splash.gluni-fidelity--high.gluni-break-splash--show .gluni-break-deck::after {
  animation: gluni-splash-glass-spec 720ms var(--gluni-ease) 180ms forwards;
}

@keyframes gluni-splash-glass-spec {
  0% { opacity: 0; transform: translateX(-22%); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translateX(22%); }
}
```

```css
/* reduced-motion: neutralise the new layers so they never animate. Append INSIDE the
   existing @media (prefers-reduced-motion: reduce) block alongside the current splash
   overrides (anchor: the rule ".gluni-round-splash--leave *"). */
@media (prefers-reduced-motion: reduce) {
  .gluni-round-deck::after,
  .gluni-break-deck::after,
  .gluni-round-rule::before {
    animation: none !important;
    opacity: 0 !important;
  }

  .gluni-break-splash--shake .gluni-break-splash-inner,
  .gluni-break-splash--cinematic.gluni-break-splash--shake .gluni-break-splash-inner {
    animation-name: gluni-break-deck-in !important;
  }
}
```

---

## INTEGRATION NOTES

**Landmarks to find (anchor by these, never line numbers):**
- JS methods: `showRoundSplash(round)`, `showBreakSplash(name)`, `getRoundSplashHold()`,
  `getRoundSplashDuration()`, `getBreakSplashHold()`, `getBreakSplashDuration()`.
  Add new helper `getVisualFidelity()` adjacent to `getRoundSplashDuration()`.
- CSS selectors replaced: `.gluni-round-splash--show`, `.gluni-round-rule`,
  `.gluni-round-splash-inner`, `.gluni-round-num .d`,
  `.gluni-round-splash--show .gluni-round-splash-inner`,
  `.gluni-round-splash--show .gluni-round-num .d` (+ its `:nth-child` delay rules),
  `.gluni-break-splash--show`, `.gluni-break-splash-inner`, `.gluni-break-splash-text .d`
  (+ its `:nth-child` delay rules), `.gluni-break-splash--show .gluni-break-splash-inner`.
- CSS keyframes replaced: `gluni-splash-deck-in`, `gluni-splash-digit-in`,
  `gluni-splash-deck-out`, `gluni-break-deck-in`, `gluni-break-deck-out`.
- The reduced-motion `@media (prefers-reduced-motion: reduce)` block (anchor rule
  `.gluni-round-splash--leave *`) gets the appended overrides above.

**New markup (inside existing `-inner`, no class renames):**
- `<div class="gluni-round-deck" aria-hidden="true">` as first child of `.gluni-round-splash-inner`.
- `<div class="gluni-break-deck" aria-hidden="true">` as first child of `.gluni-break-splash-inner`.
- New root classes: `gluni-fidelity--high` / `gluni-fidelity--balanced` appended to each splash root.
- New transient root class on break: `gluni-break-splash--shake` (added then removed by JS timer).

**Fidelity confirmation:** `visualFidelity` is read GUARDED and NOT registered here
(`getVisualFidelity()` try/catch, defaults `"high"`). Real `backdrop-filter: blur() saturate()`
glass is gated under `.gluni-fidelity--high .gluni-*-deck`; the faked layered-gradient glass is
gated under `.gluni-fidelity--balanced .gluni-*-deck`. The HIGH-only glass-spec sweep is also
gated by `.gluni-fidelity--high`. `animationIntensity` tiering (`--reduced` / `--default` /
`--cinematic`) is untouched and still drives hold/duration via the four `get*` helpers and the
existing tier CSS blocks.

**New localization strings:** NONE. Reuses existing `GLUNI.Round`, `GLUNI.Splash.Cycle`,
`GLUNI.Splash.Break`, `GLUNI.GuardBreak`.

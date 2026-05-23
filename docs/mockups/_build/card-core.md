# Card Core — Premium Pass (Option 4 material + heavy turn-change motion)

Draft for orchestrator integration. Anchor everything by **selector / @keyframes / method name**, never line numbers.
All new behavior is additive and degrades safely. Status pattern overlays, FLIP reflow, ghost, mystery/adhoc/delayed/defeated handling are preserved.

Fidelity contract assumed: orchestrator adds `gluni-fidelity--high` (default) or `gluni-fidelity--balanced` on `#gluni-initiative`. We gate real `backdrop-filter`/`blur()` under `.gluni-fidelity--high` and faked layered glass under `.gluni-fidelity--balanced`. The `visualFidelity` setting is registered ELSEWHERE; JS reads it guarded only to choose blur-streak vs ghost-trail.

---

## CSS — :root additions (append-safe block)

Append this block anywhere after the existing `:root { ... }` (it only adds tokens; it does not redeclare existing ones). These are the unified holo hue tokens + motion timings for the new beats.

```css
:root {
  /* Holographic shimmer / prismatic edge — default cyan -> violet -> magenta.
     Status classes remap these so shimmer + edge-spec inherit the accent hue. */
  --gluni-holo-a: var(--gluni-cyan);
  --gluni-holo-b: var(--gluni-violet);
  --gluni-holo-c: #ff66b3;            /* magenta (matches mockup .v4) */
  --gluni-magenta: #ff66b3;

  /* Heavy turn-change beat timings (cinematic baseline; tiers scale via root class). */
  --gluni-beat-anticipation: 80ms;
  --gluni-beat-strike: 240ms;
  --gluni-beat-gap: 60ms;
  --gluni-beat-impact: 200ms;
  --gluni-beat-settle: 220ms;

  /* Lift offsets for the active card (mockup .v4 active translate). */
  --gluni-active-lift-y: -2px;
}
```

---

## CSS — REPLACE blocks

### REPLACE selector: `.gluni-card`

Adds the recessed tactical panel (layered bg + bevel + AO inner shadow) from `.v4 .card`, while preserving every existing var, the transform stack, transitions, clip-path, container/contain. Only `background` and `box-shadow` are upgraded, and `--gluni-card-lift-y` is introduced (default 0) so active lift composes into the existing transform without a new translate origin fight.

```css
.gluni-card {
  --gluni-flip-x: 0px;
  --gluni-flip-y: 0px;
  --gluni-flip-scale-x: 1;
  --gluni-flip-scale-y: 1;
  --gluni-active-shift: 0px;
  --gluni-card-lift-y: 0px;
  --gluni-card-scale: 1;
  --gluni-portrait-normal-x: 54%;
  --gluni-portrait-normal-y: 24%;
  --gluni-portrait-normal-scale: 1.06;
  --gluni-portrait-active-x: 55%;
  --gluni-portrait-active-y: 12%;
  --gluni-portrait-active-scale: 1.2;
  --gluni-portrait-quality-cap: 1;
  position: relative;
  isolation: isolate;
  display: grid;
  align-items: end;
  justify-self: stretch;
  width: 100%;
  min-height: 58px;
  container-type: inline-size;
  contain: layout style;
  background: linear-gradient(180deg, #0a1218 0%, #04080c 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.6),
    inset 1px 0 0 rgba(255, 255, 255, 0.04),
    inset 0 0 0 1px var(--gluni-line),
    inset 0 0 28px rgba(0, 0, 0, 0.4);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
  transform:
    translate(var(--gluni-flip-x), calc(var(--gluni-flip-y) + var(--gluni-card-lift-y)))
    translateX(var(--gluni-active-shift))
    scaleX(var(--gluni-flip-scale-x))
    scaleY(var(--gluni-flip-scale-y))
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

> NOTE: `.gluni-card--dragging` and the `.gluni-card:hover...` transform overrides also list the transform stack. Orchestrator should add the `+ var(--gluni-card-lift-y)` term to the `var(--gluni-flip-y)` slot in `.gluni-card--dragging` and the hover rule too, OR simpler: leave them — lift only applies to active cards which are never dragged/hovered-as-idle, so they will not conflict. (Drag rule already replaces `--gluni-flip-y` with `calc(... + drag-y)`; lift-y is 0 on non-active so no visual change.) Recommended: no change to those two rules.

### REPLACE selector: `.gluni-card::before`  (idle edge-spec highlight sweep)

The existing `::before` is the dark directional **veil**. We KEEP the veil but move it; the mockup's screen-blend highlight is a SEPARATE layer. To avoid stealing the `::before` (veil) we instead add the highlight as a new appended rule (`.gluni-card-spec`, see APPEND) — but the veil rule itself is unchanged. **No replace needed here.** (Listed so orchestrator knows we deliberately left `.gluni-card::before` and `.gluni-initiative--left .gluni-card::before` intact.)

### REPLACE selector: `.gluni-card-portrait-wrap`

Adds the `.v4` portrait-wrap inset hairline (`inset 0 0 0 1px rgba(255,255,255,0.05)`) and keeps all transitions. The glass plate + vignette/top-sheen come from a NEW `.gluni-card-glass` element (APPEND) plus a `::after` (APPEND); this rule only gains the subtle frame.

```css
.gluni-card-portrait-wrap {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  contain: layout paint style;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition:
    top var(--gluni-d-card) var(--gluni-snap),
    height var(--gluni-d-card) var(--gluni-snap),
    clip-path var(--gluni-d-card) var(--gluni-snap);
}
```

### REPLACE selector: `.gluni-card--active`

Adds forward LIFT (via `--gluni-card-lift-y`) + larger soft drop shadow + lit accent inner ring, translating `.v4 .card.is-active`. Preserves width/min-height/overflow/clip-path expansion and the `--gluni-card-scale` bump.

```css
.gluni-card--active {
  --gluni-card-scale: 1.02;
  --gluni-card-lift-y: var(--gluni-active-lift-y);
  width: calc(100% + 12px);
  min-height: 124px;
  overflow: visible;
  background: linear-gradient(180deg, #0d1822 0%, #04080c 100%);
  box-shadow:
    inset 0 1px 0 rgba(94, 234, 255, 0.20),
    inset 0 -1px 0 rgba(0, 0, 0, 0.6),
    inset 0 0 0 1px color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 70%, var(--gluni-line) 30%),
    inset 0 0 32px rgba(0, 0, 0, 0.4),
    0 18px 36px rgba(0, 0, 0, 0.7),
    0 0 32px color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 34%, transparent);
  clip-path: polygon(
    0 -42px,
    calc(100% - 14px) -42px,
    100% calc(-42px + 14px),
    100% 100%,
    0 100%
  );
}
```

### REPLACE selector: `.gluni-card--active .gluni-card-accent`  (prismatic edge-spec, status-tinted)

Replaces the plain widened accent with the `.v4` prismatic gradient — but built from the holo tokens so it follows status hue automatically.

```css
.gluni-card--active .gluni-card-accent {
  width: 4px;
  background: linear-gradient(
    180deg,
    var(--gluni-holo-a),
    var(--gluni-holo-b) 50%,
    var(--gluni-holo-c)
  );
  box-shadow:
    0 0 24px var(--gluni-holo-a),
    0 0 24px var(--gluni-holo-b);
}
```

---

## CSS — APPEND blocks (new rules + @keyframes)

### Idle edge-spec highlight (screen-blend), left/right mirrored

```css
/* Edge specular highlight sweep — mockup `.v4 .card::before`. Separate layer so the
   existing dark veil (.gluni-card::before) is untouched. */
.gluni-card-spec {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 30%);
  mix-blend-mode: screen;
  opacity: 0.9;
}

.gluni-initiative--left .gluni-card-spec {
  background: linear-gradient(245deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 30%);
}

/* Active: prismatic catch in the spec, derived from holo hue. */
.gluni-card--active .gluni-card-spec {
  background:
    linear-gradient(115deg, color-mix(in srgb, var(--gluni-holo-a) 22%, transparent) 0%, transparent 28%),
    linear-gradient(295deg, color-mix(in srgb, var(--gluni-holo-a) 10%, transparent) 0%, transparent 25%);
}

.gluni-initiative--left .gluni-card--active .gluni-card-spec {
  background:
    linear-gradient(245deg, color-mix(in srgb, var(--gluni-holo-a) 22%, transparent) 0%, transparent 28%),
    linear-gradient(65deg, color-mix(in srgb, var(--gluni-holo-a) 10%, transparent) 0%, transparent 25%);
}
```

### Glass plate over the portrait (vignette + top sheen) + real-blur on HIGH

```css
/* Glass plate vignette + top sheen — mockup `.v4 .card-portrait-wrap::after`.
   Implemented as a real element (.gluni-card-glass) so it tracks the portrait-wrap
   expansion when active and we can attach backdrop-filter. */
.gluni-card-glass {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 36%, rgba(0, 0, 0, 0.18) 100%),
    radial-gradient(120% 60% at 20% 0%, rgba(255, 255, 255, 0.10), transparent 50%);
}

/* HIGH fidelity: real frosted glass behind the sheen. */
.gluni-fidelity--high .gluni-card-glass {
  backdrop-filter: blur(0.6px) saturate(1.08);
  -webkit-backdrop-filter: blur(0.6px) saturate(1.08);
}

/* BALANCED: faked depth via an extra dark inset gradient instead of backdrop-filter. */
.gluni-fidelity--balanced .gluni-card-glass {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0) 36%, rgba(0, 0, 0, 0.22) 100%),
    radial-gradient(120% 60% at 20% 0%, rgba(255, 255, 255, 0.12), transparent 50%),
    radial-gradient(140% 80% at 80% 110%, rgba(0, 0, 0, 0.30), transparent 55%);
}

/* When active, the wrap grows upward by 42px; glass lives inside the wrap so it follows
   automatically. Keep it clipped to the wrap's silhouette (wrap already clips). */
```

### Holographic shimmer layer (active), status-tinted, left/right mirrored

```css
/* Holographic drift — mockup `.v4 .card.is-active::after`, but as its own element so it
   stacks correctly UNDER nothing important and ABOVE status overlays. Hue from holo tokens. */
.gluni-card-holo {
  position: absolute;
  inset: -42px 0 0 0;
  z-index: 8;
  pointer-events: none;
  opacity: 0;
  background:
    linear-gradient(
      115deg,
      color-mix(in srgb, var(--gluni-holo-a) 0%, transparent) 0%,
      color-mix(in srgb, var(--gluni-holo-a) 28%, transparent) 26%,
      color-mix(in srgb, var(--gluni-holo-b) 28%, transparent) 44%,
      color-mix(in srgb, var(--gluni-holo-c) 24%, transparent) 60%,
      color-mix(in srgb, var(--gluni-holo-a) 0%, transparent) 80%
    );
  background-size: 240% 100%;
  background-position: 0% 0%;
  mix-blend-mode: screen;
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0.35) 70%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0.35) 70%, transparent 100%);
}

.gluni-card--active .gluni-card-holo {
  opacity: 0.75;
  animation: gluni-holo-drift 5s linear infinite;
}

.gluni-initiative--left .gluni-card--active .gluni-card-holo {
  animation-name: gluni-holo-drift-left;
}

/* Adhoc active uses a hidden-overflow square silhouette already; pin holo to box. */
.gluni-card--active.gluni-card--adhoc .gluni-card-holo {
  inset: 0;
}

@keyframes gluni-holo-drift {
  0%   { background-position:   0% 0%; }
  100% { background-position: 240% 0%; }
}

@keyframes gluni-holo-drift-left {
  0%   { background-position: 240% 0%; }
  100% { background-position:   0% 0%; }
}
```

### Status overlays sit UNDER shimmer + dimmed when active

The existing status backgrounds already drop to `z-index: 0` when active (see `.gluni-card--active .gluni-card-dying-bg` etc.). `.gluni-card-holo` is `z-index: 8`, so it is above them. Add a slight dim of status pattern layers when active so the shimmer reads:

```css
.gluni-card--active .gluni-card-dying-bg,
.gluni-card--active .gluni-card-dying-repeat,
.gluni-card--active .gluni-card-guard-break-bg,
.gluni-card--active .gluni-card-guard-break-repeat,
.gluni-card--active .gluni-card-adhoc-repeat {
  filter: brightness(0.86);
}
```

### Status-driven holo hue remap (unify with accent)

```css
/* Dying -> violet family. */
.gluni-card--dying {
  --gluni-holo-a: var(--gluni-dying);
  --gluni-holo-b: var(--gluni-dying-hot);
  --gluni-holo-c: var(--gluni-violet);
}

/* Guard broken -> amber/break family. */
.gluni-card--guard-broken {
  --gluni-holo-a: var(--gluni-break);
  --gluni-holo-b: var(--gluni-break-hot);
  --gluni-holo-c: var(--gluni-break-deep);
}

/* Adhoc / disposition: derive from the resolved accent so any accent override flows in.
   This keeps the shimmer monochromatic-ish toward the card's accent while retaining range. */
.gluni-card--adhoc,
.gluni-card--hostile,
.gluni-card--friendly,
.gluni-card--neutral,
.gluni-card--secret,
.gluni-card--mystery {
  --gluni-holo-a: var(--gluni-accent, var(--gluni-cyan));
  --gluni-holo-b: color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 60%, var(--gluni-violet) 40%);
  --gluni-holo-c: color-mix(in srgb, var(--gluni-accent, var(--gluni-cyan)) 45%, var(--gluni-magenta) 55%);
}
```

> Specificity note: status (`--dying` / `--guard-broken`) classes co-exist with disposition classes on the same element. Because all the above are single-class selectors (equal specificity), **append the dying/guard-broken blocks AFTER the disposition block** so dying/break win source-order. Orchestrator: paste the disposition/adhoc remap first, then dying, then guard-broken.

### Shockwave ring (settle beat) + card-only shake + accent flare

```css
/* Shockwave ring radiates from the active card edge. Mounted by createShockwave() into the
   active card; absolutely positioned, never affects layout, never shakes the rail. */
.gluni-card-shockwave {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  border: 2px solid color-mix(in srgb, var(--gluni-holo-a) 80%, var(--gluni-white) 20%);
  border-radius: 2px;
  opacity: 0;
  transform: scale(0.4);
  box-shadow:
    0 0 18px color-mix(in srgb, var(--gluni-holo-a) 70%, transparent),
    inset 0 0 18px color-mix(in srgb, var(--gluni-holo-a) 40%, transparent);
  will-change: transform, opacity;
  animation: gluni-shockwave 460ms var(--gluni-ease) forwards;
}

@keyframes gluni-shockwave {
  0%   { opacity: 0; transform: scale(0.4); }
  18%  { opacity: 0.9; }
  100% { opacity: 0; transform: scale(1.9); }
}

/* Card-only impact shake — applied to the active card element ONLY (JS toggles the class),
   decays over ~220ms. Composes with the live transform via an inner offset var so it does
   not clobber flip/lift/scale: we shake a child instead. See .gluni-card-shaker below. */
.gluni-card-shaker {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.gluni-card--impact-settle .gluni-card-content,
.gluni-card--impact-settle .gluni-initiative-badge,
.gluni-card--impact-settle .gluni-card-portrait-wrap {
  animation: gluni-impact-shake 220ms var(--gluni-snap) both;
}

@keyframes gluni-impact-shake {
  0%   { transform: translateX(0); }
  20%  { transform: translateX(3px); }
  40%  { transform: translateX(-2px); }
  60%  { transform: translateX(1.4px); }
  80%  { transform: translateX(-0.8px); }
  100% { transform: translateX(0); }
}

/* Accent / holo flare on impact: brief brightness pop on the accent + holo. */
.gluni-card--impact-settle .gluni-card-accent {
  animation: gluni-impact-flare 320ms var(--gluni-ease) both;
}

@keyframes gluni-impact-flare {
  0%   { filter: brightness(2.2) saturate(1.4); }
  100% { filter: brightness(1) saturate(1); }
}

/* Incoming active SLAM (impact beat) — overshoot into place. JS adds .gluni-card--impact. */
.gluni-card--impact {
  animation: gluni-active-slam 200ms var(--gluni-snap) both;
}

@keyframes gluni-active-slam {
  0%   { transform:
           translate(var(--gluni-flip-x), calc(var(--gluni-flip-y) + var(--gluni-card-lift-y) - 6px))
           translateX(var(--gluni-active-shift))
           scale(calc(var(--gluni-card-scale) * 1.06)); }
  60%  { transform:
           translate(var(--gluni-flip-x), calc(var(--gluni-flip-y) + var(--gluni-card-lift-y) + 1px))
           translateX(var(--gluni-active-shift))
           scale(calc(var(--gluni-card-scale) * 0.992)); }
  100% { transform:
           translate(var(--gluni-flip-x), calc(var(--gluni-flip-y) + var(--gluni-card-lift-y)))
           translateX(var(--gluni-active-shift))
           scale(var(--gluni-card-scale)); }
}
```

### Outgoing anticipation + motion-blur strike (HIGH) / trail (BALANCED)

```css
/* Anticipation: the outgoing ghost pulls back ~8px toward the rail before leaving. */
.gluni-card-ghost--anticipate.gluni-card-ghost--right {
  transform: translateX(8px) scale(1);
  transition: transform var(--gluni-beat-anticipation) var(--gluni-ease);
}

.gluni-card-ghost--anticipate.gluni-card-ghost--left {
  transform: translateX(-8px) scale(1);
  transition: transform var(--gluni-beat-anticipation) var(--gluni-ease);
}

/* HIGH fidelity strike adds a real blur streak baked into the exit keyframes (already
   blur(8px) in gluni-active-exit-*). BALANCED drops blur and leans on a duplicated trail
   ghost (created by createOutgoingGhost when balanced). Gate the blur: */
.gluni-fidelity--balanced .gluni-card-ghost--leave.gluni-card-ghost--left,
.gluni-fidelity--balanced .gluni-card-ghost--leave.gluni-card-ghost--right {
  filter: none;
}

.gluni-fidelity--balanced .gluni-card-ghost--leave.gluni-card-ghost--left {
  animation-name: gluni-active-exit-left-noblur;
}

.gluni-fidelity--balanced .gluni-card-ghost--leave.gluni-card-ghost--right {
  animation-name: gluni-active-exit-right-noblur;
}

@keyframes gluni-active-exit-left-noblur {
  0%   { opacity: 1; transform: translateX(0) scale(1); }
  100% { opacity: 0; transform: translateX(-88px) scale(0.86); }
}

@keyframes gluni-active-exit-right-noblur {
  0%   { opacity: 1; transform: translateX(0) scale(1); }
  100% { opacity: 0; transform: translateX(88px) scale(0.86); }
}

/* Trailing ghost clone (balanced) — fainter, lagged. */
.gluni-card-ghost--trail {
  opacity: 0.4;
}
```

### Tier gates for the heavy beats

```css
/* REDUCED: no slam/shake/shockwave/holo animation; quick crossfade only. */
.gluni-initiative--reduced .gluni-card--impact,
.gluni-initiative--reduced .gluni-card--impact-settle .gluni-card-content,
.gluni-initiative--reduced .gluni-card--impact-settle .gluni-initiative-badge,
.gluni-initiative--reduced .gluni-card--impact-settle .gluni-card-portrait-wrap,
.gluni-initiative--reduced .gluni-card--impact-settle .gluni-card-accent {
  animation: none !important;
}

.gluni-initiative--reduced .gluni-card-shockwave {
  display: none !important;
}

.gluni-initiative--reduced .gluni-card--active .gluni-card-holo {
  animation: none;
  opacity: 0.4;
}

/* prefers-reduced-motion: extend the existing media block list. Orchestrator should add
   these selectors to the big @media (prefers-reduced-motion: reduce) rule that sets
   animation:none — listed here for convenience: */
/*  .gluni-card-holo, .gluni-card-shockwave, .gluni-card--impact,
    .gluni-card--impact-settle .gluni-card-content,
    .gluni-card--impact-settle .gluni-initiative-badge,
    .gluni-card--impact-settle .gluni-card-portrait-wrap,
    .gluni-card--impact-settle .gluni-card-accent  */
```

---

## JS — REPLACE methods

### REPLACE method: `render`

Full body. Preserves the entire existing pipeline; the only additions: capture `previousActiveInitiative` for the badge count-up, pass `fidelity` + previous initiative into `animateTurnChange`, and a guarded read of fidelity. FLIP reflow path (`captureItemRects` / `animateTurnChange` / ghost / slide-ins) is untouched.

```js
  render() {
    if (!this.root) return;
    this.renderTimer = null;

    const combat = this.combat;
    const hasActiveCombat = Boolean(combat?.started && combat.combatants?.size);

    if (!this.enabled || !hasActiveCombat) {
      this.closeInitiativeContextMenu();
      this.root.className = "gluni-initiative gluni-initiative--hidden";
      if (this.lastMarkup) {
        this.root.innerHTML = "";
        this.lastMarkup = "";
      }
      this.lastRootClassName = this.root.className;
      tokenOverlays?.refresh();
      return;
    }

    const settings = this.getRenderSettings();
    const view = this.buildViewModel(combat, settings);
    this.detectStatusTransitions(view);
    const turnKey = view.normal.map(item => item.key ?? `${item.type}:${item.round}`).join("|");
    const isTurnChange = this.lastTurnKey && turnKey !== this.lastTurnKey;
    const previousRenderedRound = this.lastRenderedRound;
    const roundDelta = Number.isFinite(previousRenderedRound) ? Math.max(0, (combat.round ?? 1) - previousRenderedRound) : 0;
    const previousActiveKey = this.lastActiveKey;
    const previousActiveInitiative = this.lastActiveInitiative ?? null;
    const isDelayReturn = Boolean(this.pendingDelayReturnId && view.activeId === this.pendingDelayReturnId);
    const fidelity = readVisualFidelity();
    const rootClassName = [
      "gluni-initiative",
      `gluni-initiative--${settings.edge}`,
      `gluni-initiative--${settings.intensity}`,
      settings.isGM ? "gluni-initiative--gm" : "gluni-initiative--player",
      isTurnChange ? "gluni-initiative--turn-change" : "",
      isDelayReturn ? "gluni-initiative--delay-return" : ""
    ].filter(Boolean).join(" ");
    const markup = this.renderMarkup(combat, view, settings);
    const markupChanged = markup !== this.lastMarkup;
    const shouldAnimateTurnChange = isTurnChange && markupChanged && settings.intensity !== "reduced";
    const oldRects = shouldAnimateTurnChange ? this.captureItemRects() : new Map();
    const outgoingGhost = shouldAnimateTurnChange && !isDelayReturn ? this.createOutgoingGhost(settings.edge, fidelity) : null;
    this.lastTurnKey = turnKey;

    if (rootClassName !== this.lastRootClassName) {
      this.root.className = rootClassName;
      this.lastRootClassName = rootClassName;
    }

    this.applyUIScale(settings.uiScale);
    this.applyPosition(settings.edge);

    if (markupChanged) {
      this.closeInitiativeContextMenu();
      this.root.innerHTML = markup;
      this.lastMarkup = markup;
      this.positionFloatingControls();
    }

    if (shouldAnimateTurnChange) {
      this.animateTurnChange(oldRects, {
        previousActiveKey,
        isDelayReturn,
        roundDelta,
        intensity: settings.intensity,
        edge: settings.edge,
        fidelity,
        previousActiveInitiative
      });
    }
    if (outgoingGhost) this.playOutgoingGhost(outgoingGhost, { intensity: settings.intensity });
    this.playPendingGuardBreakImpact();
    this.playPendingSlideIns();
    this.playPendingDyingWipes();
    this.lastActiveId = view.activeId;
    this.lastActiveKey = view.activeKey;
    this.lastActiveInitiative = this.getActiveInitiative(view);
    this.lastRenderedRound = combat.round ?? null;
    if (isDelayReturn) this.pendingDelayReturnId = null;
    tokenOverlays?.refresh();
  }
```

### REPLACE method: `animateTurnChange`

Full body. The FLIP reflow of non-active cards is **identical** to the original (preflip/flipping with `--gluni-flip-*`). New: after the FLIP work is queued, we orchestrate the active hand-off beats (anticipation handled by ghost; strike = ghost already flying; gap; impact slam class; settle = shake class + shockwave + flare; badge count-up) on the NEW active card only — the rail stays still because beats are applied to the active card element and absolute children, never to `.gluni-rail`.

```js
  animateTurnChange(oldRects, options = {}) {
    const items = Array.from(this.root.querySelectorAll("[data-gluni-key]"));
    const previousActiveKey = options.previousActiveKey ?? null;
    const roundDelta = Number(options.roundDelta) || 0;
    const intensity = options.intensity ?? "default";
    const flipItems = [];
    let newActive = null;

    for (const item of items) {
      const isActive = item.classList.contains("gluni-card--active");
      const wasActive = item.dataset.gluniKey === previousActiveKey;
      if (isActive) newActive = item;
      if (wasActive && !isActive && !options.isDelayReturn) continue;

      const oldRect = this.getContinuityRect(oldRects, item.dataset.gluniKey, roundDelta);
      if (!oldRect) {
        item.classList.add("gluni-item--entering");
        if (!isActive) item.classList.add("gluni-item--entering-bottom");
        if (isActive && item.dataset.gluniKey !== previousActiveKey) item.classList.add("gluni-card--active-entering");
        window.setTimeout(() => item.classList.remove("gluni-item--entering", "gluni-item--entering-bottom", "gluni-card--active-entering"), 680);
        continue;
      }

      const newRect = item.getBoundingClientRect();
      const dx = oldRect.left + oldRect.width / 2 - (newRect.left + newRect.width / 2);
      const dy = oldRect.top + oldRect.height / 2 - (newRect.top + newRect.height / 2);
      const scaleX = newRect.width ? oldRect.width / newRect.width : 1;
      const scaleY = newRect.height ? oldRect.height / newRect.height : 1;
      const moved = Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5;
      const resized = Math.abs(scaleX - 1) >= 0.01 || Math.abs(scaleY - 1) >= 0.01;

      if (isActive && item.dataset.gluniKey !== previousActiveKey) {
        item.classList.add("gluni-card--active-entering");
        window.setTimeout(() => item.classList.remove("gluni-card--active-entering"), 680);
      }

      if (!moved && !resized) continue;

      item.classList.add("gluni-item--preflip");
      item.style.setProperty("--gluni-flip-x", `${Math.round(dx)}px`);
      item.style.setProperty("--gluni-flip-y", `${Math.round(dy)}px`);
      item.style.setProperty("--gluni-flip-scale-x", scaleX.toFixed(4));
      item.style.setProperty("--gluni-flip-scale-y", scaleY.toFixed(4));
      flipItems.push(item);
    }

    if (flipItems.length) {
      this.root.getBoundingClientRect();

      for (const item of flipItems) {
        item.classList.remove("gluni-item--preflip");
        item.classList.add("gluni-item--flipping");

        window.requestAnimationFrame(() => {
          item.style.setProperty("--gluni-flip-x", "0px");
          item.style.setProperty("--gluni-flip-y", "0px");
          item.style.setProperty("--gluni-flip-scale-x", "1");
          item.style.setProperty("--gluni-flip-scale-y", "1");
        });

        window.setTimeout(() => item.classList.remove("gluni-item--flipping"), 680);
      }
    }

    // ---- Heavy active hand-off beats (additive; never touches .gluni-rail) ----
    if (newActive && intensity !== "reduced" && !options.isDelayReturn) {
      this.playActiveHandoff(newActive, options);
    } else if (newActive && options.previousActiveInitiative != null) {
      // reduced (or delay return): set badge instantly to the final value.
      const badge = newActive.querySelector(".gluni-initiative-badge");
      if (badge) this.animateBadgeCountUp(badge, options.previousActiveInitiative, badge.textContent, true);
    }
  }
```

### REPLACE method: `createOutgoingGhost`

Full body. Adds optional balanced trailing clone + initial anticipation-ready state. Signature gains `fidelity`. Preserves existing clone/clip/position behavior. Returns either the ghost element or `{ ghost, trail }` — `playOutgoingGhost` is updated to accept both shapes.

```js
  createOutgoingGhost(edge, fidelity = "high") {
    const activeCard = this.root?.querySelector(".gluni-card--active");
    if (!activeCard) return null;

    const rect = activeCard.getBoundingClientRect();
    const makeClone = () => {
      const clone = activeCard.cloneNode(true);
      clone.querySelector(".gluni-card-controls")?.remove();
      clone.querySelector(".gluni-card-sheen")?.remove();
      clone.querySelector(".gluni-card-shockwave")?.remove();
      clone.classList.remove("gluni-card--impact", "gluni-card--impact-settle");
      clone.classList.add("gluni-card-ghost", `gluni-card-ghost--${edge}`);
      clone.style.left = `${Math.round(rect.left)}px`;
      clone.style.top = `${Math.round(rect.top)}px`;
      clone.style.width = `${Math.round(rect.width)}px`;
      clone.style.height = `${Math.round(rect.height)}px`;
      clone.style.clipPath = "polygon(0 -42px, calc(100% - 14px) -42px, 100% calc(-42px + 14px), 100% 100%, 0 100%)";
      document.body.appendChild(clone);
      return clone;
    };

    const ghost = makeClone();
    let trail = null;
    // On BALANCED fidelity, real motion-blur is disabled; use a lagged trail clone to fake the streak.
    if (fidelity === "balanced") {
      trail = makeClone();
      trail.classList.add("gluni-card-ghost--trail");
    }

    return { ghost, trail, edge };
  }
```

### REPLACE method: `playOutgoingGhost`

Full body. Accepts the legacy single element OR the `{ ghost, trail, edge }` object. Adds the anticipation pull-back beat (~80ms) before the strike, and a small lag for the trail. Cleanup timings preserved/extended for cinematic.

```js
  playOutgoingGhost(payload, options = {}) {
    if (!payload) return;
    const ghost = payload.ghost ?? payload;
    const trail = payload.trail ?? null;
    const edge = payload.edge ?? (ghost.classList.contains("gluni-card-ghost--left") ? "left" : "right");
    const intensity = options.intensity ?? "default";
    const reduced = intensity === "reduced";
    const removeAt = intensity === "cinematic" ? 900 : (reduced ? 360 : 560);

    const startStrike = el => {
      if (!el) return;
      el.classList.remove("gluni-card-ghost--anticipate");
      el.classList.add("gluni-card-ghost--leave");
    };

    if (reduced) {
      startStrike(ghost);
    } else {
      // anticipation: pull back toward the rail, then strike off.
      ghost.classList.add("gluni-card-ghost--anticipate");
      window.requestAnimationFrame(() => {
        window.setTimeout(() => startStrike(ghost), 80);
      });
    }

    if (trail) {
      // trailing clone lags ~70ms behind to fake the motion streak on balanced fidelity.
      window.setTimeout(() => startStrike(trail), reduced ? 0 : 150);
      window.setTimeout(() => trail.remove(), removeAt + 80);
    }

    window.setTimeout(() => ghost.remove(), removeAt);
  }
```

---

## JS — NEW methods

Add these as methods on `class GLUniverseInitiativeOverlay` (place near `playOutgoingGhost`). All guard against missing elements and never throw.

```js
  getActiveInitiative(view) {
    try {
      const active = view?.normal?.find(item => item.type === "combatant" && item.active);
      return active ? formatInitiative(active.initiative) : null;
    } catch (_e) {
      return null;
    }
  }

  // Orchestrates the gap -> impact -> settle beats on the NEW active card only.
  playActiveHandoff(activeEl, options = {}) {
    if (!activeEl) return;
    const intensity = options.intensity ?? "default";
    const cinematic = intensity === "cinematic";
    const gap = cinematic ? 60 : 30;
    const badge = activeEl.querySelector(".gluni-initiative-badge");
    const fromInit = options.previousActiveInitiative ?? null;
    const toInit = badge ? badge.textContent : null;

    // Hold badge at the previous value until the reveal, then count up.
    if (badge && fromInit != null && fromInit !== toInit) {
      badge.textContent = fromInit;
    }

    // GAP, then IMPACT slam.
    window.setTimeout(() => {
      if (!activeEl.isConnected) return;
      activeEl.classList.add("gluni-card--impact");
      window.setTimeout(() => activeEl.classList.remove("gluni-card--impact"), 240);

      // SETTLE: shake + shockwave + flare + badge count-up, fired at impact landing.
      const settleAt = 140; // shortly into the slam, as it lands
      window.setTimeout(() => {
        if (!activeEl.isConnected) return;
        activeEl.classList.add("gluni-card--impact-settle");
        window.setTimeout(() => activeEl.classList.remove("gluni-card--impact-settle"), 340);
        if (cinematic || intensity === "default") this.createShockwave(activeEl);
        if (badge) {
          this.animateBadgeCountUp(badge, fromInit, toInit, intensity === "reduced");
        }
      }, settleAt);
    }, gap);
  }

  createShockwave(activeEl) {
    if (!activeEl || !activeEl.isConnected) return;
    try {
      const ring = document.createElement("div");
      ring.className = "gluni-card-shockwave";
      ring.setAttribute("aria-hidden", "true");
      // Size to the visible card body (exclude the -42px notch overhang).
      ring.style.left = "0";
      ring.style.right = "0";
      ring.style.top = "0";
      ring.style.bottom = "0";
      activeEl.appendChild(ring);
      window.setTimeout(() => ring.remove(), 520);
    } catch (_e) {
      // never throw from a cosmetic beat
    }
  }

  // rAF tween of an integer-ish badge from `from` to `to`. `instant` jumps immediately.
  animateBadgeCountUp(badge, from, to, instant = false) {
    if (!badge) return;
    const target = String(to ?? badge.textContent ?? "");
    const startNum = Number(from);
    const endNum = Number(target);

    if (instant || !Number.isFinite(startNum) || !Number.isFinite(endNum) || startNum === endNum) {
      badge.textContent = target;
      return;
    }

    // Preserve formatting (decimals) by tracking whether target had a fractional part.
    const decimals = target.includes(".") ? 1 : 0;
    const duration = 360;
    const startTime = (typeof performance !== "undefined" ? performance.now() : Date.now());

    const step = now => {
      if (!badge.isConnected) return;
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = startNum + (endNum - startNum) * eased;
      badge.textContent = decimals ? value.toFixed(1) : String(Math.round(value));
      if (t < 1) {
        window.requestAnimationFrame(step);
      } else {
        badge.textContent = target; // snap to exact final string
      }
    };

    window.requestAnimationFrame(step);
  }
```

Add this module-scope helper near the other top-level functions (e.g. beside `formatInitiative`):

```js
function readVisualFidelity() {
  let f = "high";
  try {
    f = game.settings.get("gluniverse-initiative", "visualFidelity") || "high";
  } catch (_e) {
    f = "high";
  }
  return f === "balanced" ? "balanced" : "high";
}
```

Also initialize the new field in the constructor (anchor: the block setting `this.lastActiveKey = null;`):

```js
    this.lastActiveInitiative = null;
```

---

## JS — renderCombatantCard changes

Anchor: inside `renderCombatantCard`, in the returned template literal. Three minimal markup additions; no existing layer removed.

1. **Edge-spec highlight** — add immediately AFTER the opening `<article ...>` tag's first child `<div class="gluni-card-accent" ...>` line, i.e. right before `<div class="gluni-card-bracket" ...>`:

```html
        <div class="gluni-card-spec" aria-hidden="true"></div>
```

2. **Glass plate** — add INSIDE the portrait-wrap branch, immediately after the portrait `<img>` / mystery-mark, before the closing `</div>` of `.gluni-card-portrait-wrap`. Replace the existing portrait-wrap sub-block:

Existing:
```html
          : `<div class="gluni-card-portrait-wrap">
              ${card.mystery
                ? `<div class="gluni-card-mystery-mark" aria-hidden="true">?</div>`
                : `<img class="gluni-card-portrait" src="${escapeAttr(card.portrait)}" alt="" loading="lazy" decoding="async">`}
            </div>`}
```

New:
```html
          : `<div class="gluni-card-portrait-wrap">
              ${card.mystery
                ? `<div class="gluni-card-mystery-mark" aria-hidden="true">?</div>`
                : `<img class="gluni-card-portrait" src="${escapeAttr(card.portrait)}" alt="" loading="lazy" decoding="async">`}
              <div class="gluni-card-glass" aria-hidden="true"></div>
            </div>`}
```

> The glass plate is added even for adhoc? No — adhoc cards use the `gluni-card-adhoc-bg` branch (no portrait-wrap), so they get no glass, which is correct. Mystery cards keep the glass over the `?` mark, which reads as intended (subtle sheen). Acceptable.

3. **Holo shimmer layer** — only on active cards. Anchor: the existing line that conditionally adds the sheen:

Existing:
```html
        ${card.active ? `<div class="gluni-card-sheen" aria-hidden="true"></div>` : ""}
```

New (add holo alongside the sheen):
```html
        ${card.active ? `<div class="gluni-card-holo" aria-hidden="true"></div><div class="gluni-card-sheen" aria-hidden="true"></div>` : ""}
```

No change needed for the shockwave mount — `createShockwave()` appends it to the active card at runtime.

---

## INTEGRATION NOTES

**New CSS vars (all default-safe):** `--gluni-holo-a/-b/-c` (default cyan/violet/magenta on `:root`), `--gluni-magenta`, `--gluni-card-lift-y` (0 by default, set to `--gluni-active-lift-y` on active), `--gluni-active-lift-y` (-2px), beat-timing tokens. None collide with existing names.

**New DOM layers (minimal):** `.gluni-card-spec` (idle edge highlight, all cards), `.gluni-card-glass` (inside portrait-wrap, non-adhoc cards), `.gluni-card-holo` (active only), `.gluni-card-shockwave` (runtime, active only). Reused existing `.gluni-card-sheen`.

**Z-order:** veil `.gluni-card::before` z2; glass z2 (inside wrap which is z1, so glass renders above portrait but below content z8); spec z3; status bgs z3-7 idle, drop to z0 when active; holo z8; content z8; badge/accent z7-9; shockwave z10. Holo deliberately sits ABOVE status overlays; status overlays are dimmed `brightness(0.86)` when active.

**FLIP preserved:** `animateTurnChange` keeps the exact preflip/flipping measurement + `--gluni-flip-*` reset loop for all non-active items. Heavy beats are layered AFTER, applied only to the new active card element and its absolute children, so the rail never shakes. The outgoing card still leaves via the evolved ghost (anticipation pull-back -> strike).

**Badge count-up:** `render()` stashes `this.lastActiveInitiative` (formatted string) each frame. On turn change, `playActiveHandoff` immediately sets the new active badge BACK to the previous value, then at the settle beat calls `animateBadgeCountUp` (rAF easeOutCubic tween writing `textContent`, decimals preserved). Reduced tier / delay-return / non-finite values jump instantly to the final string. Guards `badge.isConnected` so a re-render mid-tween never throws.

**Tier behavior:**
- `reduced`: `shouldAnimateTurnChange` already false in render path for FLIP; additionally beats are gated (`intensity !== "reduced"` in `animateTurnChange`), shockwave hidden, slam/shake disabled via `.gluni-initiative--reduced` CSS, badge instant, holo static. Outgoing ghost uses the existing reduced exit.
- `default`: gap 30ms, slam + shake + shockwave + flare + count-up. Holo drifts.
- `cinematic`: gap 60ms, longer ghost cleanup (900ms), full ~800ms drama (anticipation 80 + strike ~240 via ghost + gap 60 + impact 200 + settle 220).

**Fidelity behavior:** orchestrator must put `gluni-fidelity--high` / `gluni-fidelity--balanced` on `#gluni-initiative`. HIGH: real `backdrop-filter` on `.gluni-card-glass` + real `blur(8px)` motion streak (existing `gluni-active-exit-*`). BALANCED: faked layered-gradient glass, no backdrop-filter, exit keyframes swapped to `*-noblur`, plus a lagged `.gluni-card-ghost--trail` clone (created in `createOutgoingGhost` when `readVisualFidelity()==="balanced"`). `readVisualFidelity()` reads the client setting guarded; never registers it.

**Things the orchestrator must wire:**
1. Append the dying/guard-broken holo-remap blocks AFTER the disposition/adhoc holo-remap block (source-order specificity tie-break).
2. Add the listed new selectors to the existing `@media (prefers-reduced-motion: reduce)` `animation:none` group.
3. Add `this.lastActiveInitiative = null;` to the constructor.
4. Confirm `.gluni-card--dragging` / `.gluni-card:hover` transform stacks: lift-y is 0 on non-active so leaving them unchanged is safe (recommended). If a dragged card could ever be active, add `+ var(--gluni-card-lift-y)` to their `--gluni-flip-y` slot.
5. The `gluni-active-slam` / `gluni-active-exit-*-noblur` keyframes reference `--gluni-flip-*`, `--gluni-card-lift-y`, `--gluni-active-shift`, `--gluni-card-scale` which all exist on the card.

**No behavior broken:** mystery (glass over `?`), adhoc (no portrait-wrap so no glass; holo pinned to box via `.gluni-card--active.gluni-card--adhoc .gluni-card-holo { inset:0 }`), delayed/defeated (idle material only, no active beats unless they become active), guard-break impact pipeline (`playPendingGuardBreakImpact`) untouched.
```

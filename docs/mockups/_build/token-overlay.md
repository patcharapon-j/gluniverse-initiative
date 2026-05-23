# Token Overlay — PIXI rebuild (premium pass)

Cinematic per-token overlay rewritten to share the rail HUD language: an
angled-corner **tactical frame**, **corner brackets**, a **clipped tag chip**,
and (BREAK only) an animated **holo edge sweep**. DELAYED stays calm with a slow
pulse. Honors the `visualFidelity` client setting (`"high"` default,
`"balanced"`), defaulting to high if the setting is absent.

## INTEGRATION NOTES

**(a) Landmark to replace:** Replace the entire `class TokenOverlayManager {`
block (from the line `class TokenOverlayManager {` through its closing `}`,
i.e. the whole class) with the class below. No call sites change — the public
surface (`refresh`, `forceRedraw`, `destroy`, constructor) is identical.

**(b) New module-level constants:** One new constant object,
`TOKEN_OVERLAY_PALETTE`. Place it near the other module-level constants at the
top of the file (e.g. just after `const SETTINGS = { ... };`). It is the only
new top-level symbol introduced. Everything else (helpers `clamp`,
`getCombatantTokenObject`, `getGuardBreakState`, `overlay.isDelayed`,
`MODULE_ID`, `SETTINGS`) is reused unchanged.

```js
const TOKEN_OVERLAY_PALETTE = {
  delayed: 0x4aa3ff,
  delayedHi: 0x9ad8ff,
  broken: 0xffb12d,
  brokenHot: 0xffe070,
  brokenDeep: 0xff6f1a,
  ink: 0x02070b,
  white: 0xf3fbff,
  violet: 0xb497ff,
  magenta: 0xff66b3
};
```

**(c) visualFidelity:** The class READS the setting via
`_getFidelity()` using the exact guarded pattern
(`game.settings.get("gluniverse-initiative", "visualFidelity") || "high"`
inside a try/catch defaulting to `"high"`). It NEVER registers the setting —
registration is owned by the other writer. If the setting is missing the
try/catch falls back to `"high"`, and `forceRedraw()` will re-read it so a
settings change can trigger a redraw. Both `"circle"` and `"square"`
(`_getShape`) paths are fully supported in every layer.

**Performance:** `_redraw` is still only invoked from `_upsert` when
mode / w / h / shape / **fidelity** changes. The tick loop mutates only cheap
properties (alpha, rotation, position of a pre-built sweep) and never redraws.
Destroyed-container guards are preserved everywhere (`_upsert`, `_onTick`,
`_removeEntry`).

```js
class TokenOverlayManager {
  constructor() {
    this._entries = new Map();
    this._ticking = false;
    this._tickFn = this._onTick.bind(this);
    this._time = 0;
  }

  refresh() {
    if (!canvas?.ready || !globalThis.PIXI) {
      this._clearAll();
      return;
    }

    const combat = game.combat;
    if (!combat?.started || !overlay?.enabled) {
      this._clearAll();
      return;
    }

    const wanted = new Map();
    for (const combatant of combat.combatants ?? []) {
      const delayed = overlay.isDelayed(combatant);
      const broken = Boolean(getGuardBreakState(combatant));
      if (!delayed && !broken) continue;

      const token = getCombatantTokenObject(combatant);
      if (!token || !token.w || !token.h) continue;

      wanted.set(token.id, { token, delayed, broken });
    }

    for (const tokenId of [...this._entries.keys()]) {
      if (!wanted.has(tokenId)) this._removeEntry(tokenId);
    }

    for (const [tokenId, state] of wanted) {
      this._upsert(state.token, state.broken ? "broken" : "delayed");
    }

    if (this._entries.size > 0 && !this._ticking) this._startTick();
    else if (this._entries.size === 0) this._stopTick();
  }

  forceRedraw() {
    for (const entry of this._entries.values()) {
      entry.mode = null;
      entry.shape = null;
      entry.fidelity = null;
    }
    this.refresh();
  }

  _getShape() {
    try { return game.settings.get(MODULE_ID, SETTINGS.tokenOverlayShape) || "circle"; }
    catch { return "circle"; }
  }

  _getFidelity() {
    let fidelity = "high";
    try { fidelity = game.settings.get(MODULE_ID, "visualFidelity") || "high"; } catch {}
    return fidelity === "balanced" ? "balanced" : "high";
  }

  _upsert(token, mode) {
    let entry = this._entries.get(token.id);

    if (entry && entry.container.destroyed) {
      this._entries.delete(token.id);
      entry = null;
    }

    if (!entry) {
      entry = this._createEntry(token);
      this._entries.set(token.id, entry);
    }

    if (entry.container.parent !== token) {
      try { token.addChild(entry.container); } catch { return; }
    }

    const shape = this._getShape();
    const fidelity = this._getFidelity();
    if (
      entry.mode !== mode ||
      entry.w !== token.w ||
      entry.h !== token.h ||
      entry.shape !== shape ||
      entry.fidelity !== fidelity
    ) {
      entry.mode = mode;
      entry.w = token.w;
      entry.h = token.h;
      entry.shape = shape;
      entry.fidelity = fidelity;
      this._redraw(entry);
    }
  }

  _createEntry(token) {
    const container = new PIXI.Container();
    container.eventMode = "none";
    container.interactiveChildren = false;

    // Soft outer glow (own layer so it can carry a BlurFilter on "high").
    const glow = new PIXI.Graphics();
    container.addChild(glow);

    const wash = new PIXI.Graphics();
    container.addChild(wash);

    // Static tactical frame (angled-corner ring + inner hairline).
    const frame = new PIXI.Graphics();
    container.addChild(frame);

    // L-shaped corner brackets.
    const brackets = new PIXI.Graphics();
    container.addChild(brackets);

    const cracks = new PIXI.Graphics();
    container.addChild(cracks);

    // Animated holo edge sweep (BREAK only). Pre-drawn once; the tick loop
    // only rotates / fades it. Lives in its own container so rotation pivots
    // around the token centre without touching other layers.
    const sweep = new PIXI.Container();
    sweep.visible = false;
    const sweepGfx = new PIXI.Graphics();
    sweep.addChild(sweepGfx);
    container.addChild(sweep);

    const pillBg = new PIXI.Graphics();
    container.addChild(pillBg);

    const label = new PIXI.Text("", {
      fontFamily: '"Bahnschrift", "Segoe UI", Arial, sans-serif',
      fontSize: 10,
      fontWeight: "bold",
      fill: "#02070b",
      letterSpacing: 1.2,
      align: "center",
      trim: true
    });
    label.anchor.set(0.5, 0.5);
    container.addChild(label);

    token.addChild(container);

    return {
      container, glow, wash, frame, brackets, cracks, sweep, sweepGfx, pillBg, label,
      mode: null, w: 0, h: 0, shape: null, fidelity: null,
      phase: Math.random() * Math.PI * 2,
      seed: Math.random() * 99999,
      // Geometry the tick loop needs without re-deriving each frame.
      cx: 0, cy: 0, sweepR: 0
    };
  }

  // ---- frame geometry helpers -------------------------------------------

  // Notch size for the angled corners, echoing the rail card clip-path.
  _notch(w, h) {
    return clamp(Math.min(w, h) * 0.16, 5, 16);
  }

  // Returns the angled-corner outline points for a square frame inset by `pad`.
  // Top-left and bottom-right corners are notched (mirrors the card silhouette).
  _framePoints(w, h, pad) {
    const n = this._notch(w, h);
    const x0 = pad, y0 = pad, x1 = w - pad, y1 = h - pad;
    return [
      x0 + n, y0,
      x1, y0,
      x1, y1 - n,
      x1 - n, y1,
      x0, y1,
      x0, y0 + n
    ];
  }

  _redraw(entry) {
    const { glow, wash, frame, brackets, cracks, sweep, sweepGfx, pillBg, label,
            mode, w, h, shape, seed } = entry;
    const P = TOKEN_OVERLAY_PALETTE;
    const isBreak = mode === "broken";
    const isCircle = shape === "circle";
    const high = entry.fidelity !== "balanced";
    const cx = w / 2, cy = h / 2;
    const r = Math.min(w, h) / 2;
    const rng = this._seededRng(seed);

    entry.cx = cx;
    entry.cy = cy;

    const accent = isBreak ? P.broken : P.delayed;
    const hi = isBreak ? P.brokenHot : P.delayedHi;

    // ---- wash (interior fill + subtle interior shading) -------------------
    wash.clear();
    if (isCircle) {
      if (isBreak) {
        wash.beginFill(P.broken, 0.06); wash.drawCircle(cx, cy, r - 2); wash.endFill();
        wash.beginFill(P.brokenDeep, 0.04); wash.drawCircle(cx + r * 0.18, cy - r * 0.12, r * 0.5); wash.endFill();
        wash.beginFill(P.brokenHot, 0.035); wash.drawCircle(cx - r * 0.22, cy + r * 0.18, r * 0.4); wash.endFill();
      } else {
        wash.beginFill(P.delayed, 0.05); wash.drawCircle(cx, cy, r - 2); wash.endFill();
        wash.beginFill(P.delayedHi, 0.035); wash.drawCircle(cx + r * 0.25, cy - r * 0.15, r * 0.45); wash.endFill();
      }
      wash.lineStyle({ width: r * 0.4, color: P.ink, alpha: 0.12, alignment: 0 });
      wash.drawCircle(cx, cy, r - 1);
      wash.lineStyle(0);
    } else {
      const pts = this._framePoints(w, h, 2);
      wash.beginFill(accent, isBreak ? 0.06 : 0.05);
      wash.drawPolygon(pts);
      wash.endFill();
      if (isBreak) {
        wash.beginFill(P.brokenDeep, 0.04); wash.drawCircle(cx + w * 0.16, cy - h * 0.12, r * 0.5); wash.endFill();
      } else {
        wash.beginFill(P.delayedHi, 0.03); wash.drawCircle(cx + w * 0.18, cy - h * 0.12, r * 0.45); wash.endFill();
      }
      wash.lineStyle({ width: Math.min(w, h) * 0.18, color: P.ink, alpha: 0.1, alignment: 0 });
      wash.drawPolygon(this._framePoints(w, h, 1));
      wash.lineStyle(0);
    }

    if (!isBreak) this._drawDelayPattern(wash, cx, cy, r, w, h, isCircle, rng);

    // ---- soft outer glow (high only; balanced skips the blur layers) ------
    glow.clear();
    glow.filters = null;
    if (high) {
      const gAlpha = isBreak ? 0.20 : 0.13;
      const expand = isBreak ? 4 : 3;
      glow.lineStyle({ width: isBreak ? 8 : 6, color: hi, alpha: gAlpha, alignment: 0 });
      if (isCircle) glow.drawCircle(cx, cy, r + expand);
      // Negative pad expands the frame polygon outward by `expand` on all sides.
      else glow.drawPolygon(this._framePoints(w, h, -expand));
      try {
        const blur = new PIXI.BlurFilter(isBreak ? 6 : 4);
        blur.quality = 2;
        glow.filters = [blur];
      } catch {}
    }

    // ---- tactical frame: accent stroke + inner hairline -------------------
    frame.clear();
    if (isCircle) {
      if (!high) {
        frame.lineStyle({ width: isBreak ? 4 : 3, color: hi, alpha: isBreak ? 0.10 : 0.07, alignment: 0 });
        frame.drawCircle(cx, cy, r + 1);
      }
      frame.lineStyle({ width: isBreak ? 2.5 : 2, color: accent, alpha: isBreak ? 0.82 : 0.72, alignment: 0.5 });
      frame.drawCircle(cx, cy, r);
      frame.lineStyle({ width: isBreak ? 1 : 0.8, color: hi, alpha: isBreak ? 0.26 : 0.2, alignment: 1 });
      frame.drawCircle(cx, cy, r - (isBreak ? 1.5 : 1.2));
    } else {
      if (!high) {
        frame.lineStyle({ width: isBreak ? 4 : 3, color: hi, alpha: isBreak ? 0.10 : 0.07, alignment: 0 });
        frame.drawPolygon(this._framePoints(w, h, isBreak ? -1 : 0));
      }
      frame.lineStyle({ width: isBreak ? 2.5 : 2, color: accent, alpha: isBreak ? 0.82 : 0.72, alignment: 0.5 });
      frame.drawPolygon(this._framePoints(w, h, 1));
      frame.lineStyle({ width: isBreak ? 1 : 0.8, color: hi, alpha: isBreak ? 0.26 : 0.2, alignment: 1 });
      frame.drawPolygon(this._framePoints(w, h, 2.5));
    }

    // ---- corner brackets (L-marks at the frame corners) -------------------
    this._drawBrackets(brackets, w, h, r, cx, cy, isCircle, accent, isBreak ? 0.9 : 0.78);

    // ---- break cracks -----------------------------------------------------
    cracks.clear();
    if (isBreak) this._drawBreakCracks(cracks, cx, cy, r, rng);

    // ---- holo edge sweep (BREAK only) -------------------------------------
    sweepGfx.clear();
    sweep.visible = false;
    sweep.alpha = 0;
    if (isBreak) {
      this._buildSweep(entry, sweepGfx, w, h, r, isCircle, high);
      sweep.position.set(cx, cy);
      sweepGfx.position.set(-cx, -cy); // keep gfx in token-space; pivot at centre
      sweep.visible = true;
    }

    // ---- tag chip (clipped-corner) + label --------------------------------
    const baseSize = Math.max(w, h);
    const fontSize = clamp(Math.round(baseSize * 0.095), 8, 13);
    label.style.fontSize = fontSize;
    label.style.fontWeight = "bold";
    label.style.letterSpacing = fontSize > 10 ? 1.5 : 1;
    label.text = isBreak ? "BREAK" : "DELAYED";
    label.style.fill = isBreak ? "#02070b" : "#4aa3ff";

    const padX = fontSize * 0.6;
    const padY = fontSize * 0.32;
    const chipW = label.width + padX * 2;
    const chipH = label.height + padY * 2;
    const chipX = (w - chipW) / 2;
    const chipY = h - chipH - Math.max(3, baseSize * 0.03);
    const chipNotch = clamp(chipH * 0.42, 3, 7);

    pillBg.clear();
    if (isBreak) {
      // Solid amber chip with near-black text — clipped top-left / bottom-right.
      if (high) {
        pillBg.lineStyle({ width: 3, color: P.broken, alpha: 0.22 });
        pillBg.drawPolygon(this._chipPoints(chipX - 1, chipY - 1, chipW + 2, chipH + 2, chipNotch));
        pillBg.lineStyle(0);
      }
      pillBg.beginFill(0x000000, 0.4);
      pillBg.drawPolygon(this._chipPoints(chipX, chipY + 1, chipW, chipH, chipNotch));
      pillBg.endFill();
      pillBg.beginFill(P.broken, 0.95);
      pillBg.drawPolygon(this._chipPoints(chipX, chipY, chipW, chipH, chipNotch));
      pillBg.endFill();
      pillBg.lineStyle({ width: 0.8, color: P.brokenHot, alpha: 0.55 });
      pillBg.drawPolygon(this._chipPoints(chipX, chipY, chipW, chipH, chipNotch));
    } else {
      // Outlined blue chip with blue text.
      pillBg.lineStyle(0);
      pillBg.beginFill(0x000000, 0.32);
      pillBg.drawPolygon(this._chipPoints(chipX, chipY + 1, chipW, chipH, chipNotch));
      pillBg.endFill();
      pillBg.beginFill(P.ink, 0.6);
      pillBg.drawPolygon(this._chipPoints(chipX, chipY, chipW, chipH, chipNotch));
      pillBg.endFill();
      pillBg.lineStyle({ width: 1.2, color: P.delayed, alpha: 0.82 });
      pillBg.drawPolygon(this._chipPoints(chipX, chipY, chipW, chipH, chipNotch));
    }

    label.position.set(w / 2, chipY + chipH / 2);
  }

  // Clipped-corner chip outline (top-left + bottom-right notched, matching the
  // rail tag chips).
  _chipPoints(x, y, cw, ch, n) {
    return [
      x + n, y,
      x + cw, y,
      x + cw, y + ch - n,
      x + cw - n, y + ch,
      x, y + ch,
      x, y + n
    ];
  }

  _drawBrackets(g, w, h, r, cx, cy, isCircle, color, alpha) {
    g.clear();
    const len = clamp(Math.min(w, h) * 0.16, 6, 18);
    const lw = 1.6;
    g.lineStyle({ width: lw, color, alpha });

    if (isCircle) {
      // Four short tangential ticks at the diagonal NE/NW/SE/SW positions.
      const off = r + 1;
      const diag = Math.SQRT1_2;
      const corners = [
        { dx: -diag, dy: -diag }, // NW
        { dx: diag, dy: -diag },  // NE
        { dx: diag, dy: diag },   // SE
        { dx: -diag, dy: diag }   // SW
      ];
      for (const c of corners) {
        const px = cx + c.dx * off;
        const py = cy + c.dy * off;
        // tangent direction (perpendicular to radius)
        const tx = -c.dy, ty = c.dx;
        // two short arms forming an L (along tangent + inward radial)
        g.moveTo(px - tx * len * 0.5, py - ty * len * 0.5);
        g.lineTo(px + tx * len * 0.5, py + ty * len * 0.5);
        g.moveTo(px, py);
        g.lineTo(px - c.dx * len * 0.55, py - c.dy * len * 0.55);
      }
    } else {
      const pad = 1;
      const x0 = pad, y0 = pad, x1 = w - pad, y1 = h - pad;
      const n = this._notch(w, h);
      // Top-left (sits just past the notch).
      g.moveTo(x0, y0 + n + len); g.lineTo(x0, y0 + n); g.lineTo(x0 + n, y0); g.lineTo(x0 + n + len, y0);
      // Top-right.
      g.moveTo(x1 - len, y0); g.lineTo(x1, y0); g.lineTo(x1, y0 + len);
      // Bottom-left.
      g.moveTo(x0, y1 - len); g.lineTo(x0, y1); g.lineTo(x0 + len, y1);
      // Bottom-right (sits just past the notch).
      g.moveTo(x1, y1 - n - len); g.lineTo(x1, y1 - n); g.lineTo(x1 - n, y1); g.lineTo(x1 - n - len, y1);
    }
    g.lineStyle(0);
  }

  // Builds the holo sweep as a short bright arc/segment of the frame edge.
  // It is positioned/rotated by the tick loop. We bake a localized highlight
  // (a fading "comet" along the edge) once; animation only spins + fades it.
  _buildSweep(entry, g, w, h, r, isCircle, high) {
    const P = TOKEN_OVERLAY_PALETTE;
    g.clear();
    const cx = w / 2, cy = h / 2;
    const sweepR = isCircle ? r : Math.min(w, h) / 2;
    entry.sweepR = sweepR;

    // Three colour stops travelling around: deep amber -> hot -> white tip.
    const stops = high
      ? [
          { col: P.brokenDeep, a: 0.0, span: 0.55, wmul: 0.9 },
          { col: P.broken,     a: 0.55, span: 0.32, wmul: 1.0 },
          { col: P.brokenHot,  a: 0.85, span: 0.16, wmul: 1.2 },
          { col: P.white,      a: 1.0, span: 0.05, wmul: 1.5 }
        ]
      : [
          { col: P.broken,    a: 0.55, span: 0.3, wmul: 1.0 },
          { col: P.brokenHot, a: 0.9, span: 0.12, wmul: 1.3 }
        ];

    if (isCircle) {
      // Draw a comet arc from angle 0 backwards; tick loop rotates the gfx.
      const arc = high ? Math.PI * 0.9 : Math.PI * 0.6;
      const segCount = high ? 22 : 12;
      for (let s = 0; s < segCount; s++) {
        const t0 = s / segCount;
        const t1 = (s + 1) / segCount;
        // brightness ramps toward the leading tip (t -> 1)
        const stop = this._sweepStop(stops, t0);
        const lw = (high ? 3 : 2.4) * stop.wmul;
        g.lineStyle({ width: lw, color: stop.col, alpha: stop.a * (0.5 + 0.5 * t0) });
        const a0 = -arc + arc * t0;
        const a1 = -arc + arc * t1;
        g.moveTo(cx + Math.cos(a0) * sweepR, cy + Math.sin(a0) * sweepR);
        g.lineTo(cx + Math.cos(a1) * sweepR, cy + Math.sin(a1) * sweepR);
      }
    } else {
      // Square: trace a comet along the angled-corner perimeter starting at the
      // top-left notch. The tick loop advances `entry` by re-positioning along
      // the path, but to keep it cheap we instead rotate the same way as the
      // circle using an approximate radius pivot, plus a perimeter shimmer.
      const pts = this._framePoints(w, h, 1);
      // Build perimeter point list (closed loop).
      const loop = [];
      for (let i = 0; i < pts.length; i += 2) loop.push({ x: pts[i], y: pts[i + 1] });
      loop.push({ ...loop[0] });
      // cumulative lengths
      let total = 0;
      const segs = [];
      for (let i = 0; i < loop.length - 1; i++) {
        const dx = loop[i + 1].x - loop[i].x, dy = loop[i + 1].y - loop[i].y;
        const len = Math.hypot(dx, dy);
        segs.push({ a: loop[i], b: loop[i + 1], len, at: total });
        total += len;
      }
      entry.sweepPerim = total;
      entry.sweepSegs = segs;
      // The comet is drawn at distance 0; tick loop sets sweepGfx via a sampled
      // position. For square we render a static gradient dash set and let the
      // tick loop slide a mask-free bright dot. Simplest cheap approach: draw a
      // fixed bright dash and animate alpha + a moving highlight graphic.
      const dashCount = high ? 14 : 8;
      const dashLen = total / (dashCount * 2);
      for (let i = 0; i < dashCount; i++) {
        const t = i / dashCount;
        const stop = this._sweepStop(stops, t);
        const startD = t * total;
        this._drawPerimDash(g, segs, startD, dashLen, stop.col, stop.a * 0.5, (high ? 2.6 : 2.2) * stop.wmul);
      }
    }
  }

  _sweepStop(stops, t) {
    // Map normalized progress to one of the colour stops by cumulative span.
    let acc = 0;
    for (const s of stops) {
      acc += s.span;
      if (t <= acc) return s;
    }
    return stops[stops.length - 1];
  }

  // Draws a dash of length `dashLen` starting at perimeter distance `startD`.
  _drawPerimDash(g, segs, startD, dashLen, color, alpha, width) {
    const total = segs[segs.length - 1].at + segs[segs.length - 1].len;
    let d = ((startD % total) + total) % total;
    let remaining = dashLen;
    g.lineStyle({ width, color, alpha });
    let started = false;
    let guard = 0;
    while (remaining > 0 && guard++ < 64) {
      const seg = segs.find(s => d >= s.at && d < s.at + s.len) || segs[0];
      const into = d - seg.at;
      const segRemain = seg.len - into;
      const take = Math.min(segRemain, remaining);
      const ux = (seg.b.x - seg.a.x) / (seg.len || 1);
      const uy = (seg.b.y - seg.a.y) / (seg.len || 1);
      const px = seg.a.x + ux * into;
      const py = seg.a.y + uy * into;
      const qx = px + ux * take;
      const qy = py + uy * take;
      if (!started) { g.moveTo(px, py); started = true; }
      g.lineTo(qx, qy);
      remaining -= take;
      d += take;
      if (d >= total) d -= total;
    }
  }

  _drawDelayPattern(g, cx, cy, r, w, h, isCircle, rng) {
    const insetR = r * 0.9;
    const P = TOKEN_OVERLAY_PALETTE;

    this._drawHatchSet(g, cx, cy, insetR, w, h, isCircle, Math.PI / 6, P.delayed, 0.06, 0.7);
    this._drawHatchSet(g, cx, cy, insetR, w, h, isCircle, 5 * Math.PI / 6, P.delayedHi, 0.04, 0.6);

    const nodeCount = 3 + Math.floor(rng() * 2);
    const bounds = isCircle ? r * 0.65 : Math.min(w, h) * 0.32;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = bounds * (0.3 + rng() * 0.7);
      const nx = cx + Math.cos(a) * d;
      const ny = cy + Math.sin(a) * d;
      const sides = 4 + Math.floor(rng() * 2);
      const nodeR = Math.max(w, h) * (0.04 + rng() * 0.04);

      const pts = [];
      for (let s = 0; s < sides; s++) {
        const sa = (s / sides) * Math.PI * 2 + rng() * 0.5;
        const sr = nodeR * (0.7 + rng() * 0.6);
        pts.push(nx + Math.cos(sa) * sr, ny + Math.sin(sa) * sr);
      }
      g.lineStyle({ width: 0.7, color: P.delayedHi, alpha: 0.2 + rng() * 0.1 });
      g.drawPolygon(pts);
      nodes.push({ x: nx, y: ny });
    }

    for (let i = 1; i < nodes.length; i++) {
      g.lineStyle({ width: 0.5, color: P.delayed, alpha: 0.14 });
      g.moveTo(nodes[i - 1].x, nodes[i - 1].y);
      g.lineTo(nodes[i].x, nodes[i].y);

      if (rng() > 0.5) {
        const mx = (nodes[i - 1].x + nodes[i].x) / 2 + (rng() - 0.5) * 6;
        const my = (nodes[i - 1].y + nodes[i].y) / 2 + (rng() - 0.5) * 6;
        const ta = rng() * Math.PI * 2;
        const tl = Math.max(w, h) * 0.04;
        g.lineStyle({ width: 0.4, color: P.delayedHi, alpha: 0.1 });
        g.moveTo(mx, my);
        g.lineTo(mx + Math.cos(ta) * tl, my + Math.sin(ta) * tl);
      }
    }
  }

  _drawHatchSet(g, cx, cy, insetR, w, h, isCircle, theta, color, alpha, lineW) {
    const dirX = Math.cos(theta), dirY = Math.sin(theta);
    const normX = -Math.sin(theta), normY = Math.cos(theta);
    const maxD = isCircle ? insetR : Math.max(w, h);
    const spacing = Math.max(10, maxD * 0.12);

    g.lineStyle({ width: lineW, color, alpha });

    for (let d = -maxD; d <= maxD; d += spacing) {
      if (isCircle) {
        const sqr = insetR * insetR - d * d;
        if (sqr < 4) continue;
        const half = Math.sqrt(sqr);
        const lx = cx + normX * d, ly = cy + normY * d;
        g.moveTo(lx - dirX * half, ly - dirY * half);
        g.lineTo(lx + dirX * half, ly + dirY * half);
      } else {
        const lx = cx + normX * d, ly = cy + normY * d;
        const ext = maxD * 1.5;
        g.moveTo(lx - dirX * ext, ly - dirY * ext);
        g.lineTo(lx + dirX * ext, ly + dirY * ext);
      }
    }
  }

  _drawBreakCracks(g, cx, cy, radius, rng) {
    const P = TOKEN_OVERLAY_PALETTE;
    const impactX = cx + (rng() - 0.5) * radius * 0.3;
    const impactY = cy + (rng() - 0.5) * radius * 0.3;

    g.beginFill(P.broken, 0.1);
    g.drawCircle(impactX, impactY, radius * 0.22);
    g.endFill();
    g.beginFill(P.brokenHot, 0.18);
    g.drawCircle(impactX, impactY, radius * 0.1);
    g.endFill();
    g.beginFill(P.white, 0.14);
    g.drawCircle(impactX, impactY, radius * 0.04);
    g.endFill();

    const armCount = 5 + Math.floor(rng() * 3);
    const step = (Math.PI * 2) / armCount;
    const colors = [P.brokenHot, P.broken, P.brokenDeep, P.white];
    const arms = [];

    for (let i = 0; i < armCount; i++) {
      const angle = step * i + (rng() - 0.5) * step * 0.5;
      const armLen = radius * (0.55 + rng() * 0.4);
      const segs = 6 + Math.floor(rng() * 4);
      const color = colors[Math.floor(rng() * colors.length)];
      const path = this._buildCrackPath(impactX, impactY, angle, armLen, segs, rng);
      arms.push({ path, color });

      if (rng() > 0.35) {
        const bi = Math.min(Math.floor(path.length * (0.3 + rng() * 0.35)), path.length - 1);
        const bp = path[bi];
        const ba = angle + (rng() > 0.5 ? 1 : -1) * (0.4 + rng() * 0.8);
        const bl = armLen * (0.25 + rng() * 0.3);
        const branchPath = this._buildCrackPath(bp.x, bp.y, ba, bl, 3 + Math.floor(rng() * 3), rng);
        arms.push({ path: branchPath, color, branch: true });

        if (rng() > 0.6 && branchPath.length > 1) {
          const si = Math.min(Math.floor(branchPath.length * (0.5 + rng() * 0.3)), branchPath.length - 1);
          const sp = branchPath[si];
          const sa = ba + (rng() > 0.5 ? 1 : -1) * (0.5 + rng() * 0.6);
          const subPath = this._buildCrackPath(sp.x, sp.y, sa, bl * 0.4, 2 + Math.floor(rng() * 2), rng);
          arms.push({ path: subPath, color: P.brokenHot, sub: true });
        }
      }
    }

    for (const arm of arms) {
      const bw = arm.sub ? 4 : arm.branch ? 5.5 : 7;
      const ba = arm.sub ? 0.06 : arm.branch ? 0.09 : 0.14;
      this._renderCrackPath(g, arm.path, arm.color, ba, bw, 0.6);
    }

    for (const arm of arms) {
      const sw = arm.sub ? 0.8 : arm.branch ? 1.2 : 1.8;
      const sa = arm.sub ? 0.3 : arm.branch ? 0.42 : 0.58;
      this._renderCrackPath(g, arm.path, arm.color, sa, sw, 0.85);
    }
  }

  _buildCrackPath(sx, sy, baseAngle, length, segments, rng) {
    const path = [{ x: sx, y: sy }];
    let px = sx, py = sy, angle = baseAngle;
    const segLen = length / segments;

    for (let s = 0; s < segments; s++) {
      angle += (rng() - 0.5) * 0.7;
      const nx = px + Math.cos(angle) * segLen;
      const ny = py + Math.sin(angle) * segLen;
      const mx = (px + nx) / 2 + (rng() - 0.5) * segLen * 0.4;
      const my = (py + ny) / 2 + (rng() - 0.5) * segLen * 0.4;
      path.push({ x: mx, y: my, ctrl: true });
      path.push({ x: nx, y: ny });
      px = nx;
      py = ny;
    }
    return path;
  }

  _renderCrackPath(g, path, color, alpha, startWidth, taper) {
    if (path.length < 2) return;
    const totalSegs = Math.floor((path.length - 1) / 2);
    let idx = 0;

    for (let s = 0; s < totalSegs; s++) {
      const progress = s / Math.max(totalSegs, 1);
      const lw = Math.max(startWidth * (1 - progress * taper), 0.3);
      const la = alpha * (1 - progress * 0.45);

      g.lineStyle({ width: lw, color, alpha: la });
      g.moveTo(path[idx].x, path[idx].y);

      if (idx + 2 < path.length && path[idx + 1].ctrl) {
        g.quadraticCurveTo(path[idx + 1].x, path[idx + 1].y, path[idx + 2].x, path[idx + 2].y);
        idx += 2;
      } else {
        g.lineTo(path[idx + 1].x, path[idx + 1].y);
        idx += 1;
      }
    }
  }

  _seededRng(seed) {
    let s = Math.floor(seed) | 0;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return (s >>> 16) / 32768;
    };
  }

  _removeEntry(tokenId) {
    const entry = this._entries.get(tokenId);
    if (!entry) return;
    if (!entry.container.destroyed) {
      // Drop any blur filter we attached so the GPU resource is released.
      try { if (entry.glow) entry.glow.filters = null; } catch {}
      if (entry.container.parent) entry.container.parent.removeChild(entry.container);
      entry.container.destroy({ children: true });
    }
    this._entries.delete(tokenId);
  }

  _clearAll() {
    for (const tokenId of [...this._entries.keys()]) this._removeEntry(tokenId);
    this._stopTick();
  }

  _startTick() {
    if (this._ticking) return;
    const ticker = canvas?.app?.ticker;
    if (!ticker) return;
    this._ticking = true;
    ticker.add(this._tickFn);
  }

  _stopTick() {
    if (!this._ticking) return;
    this._ticking = false;
    canvas?.app?.ticker?.remove(this._tickFn);
  }

  _onTick(dt) {
    this._time += (typeof dt === "number" ? dt : 1) / 60;
    for (const entry of this._entries.values()) {
      if (entry.container.destroyed) continue;
      const isBreak = entry.mode === "broken";
      const high = entry.fidelity !== "balanced";

      if (isBreak) {
        // Frame keeps a gentle breathing pulse.
        const bt = 0.5 + 0.5 * Math.sin((this._time * 2 * Math.PI / 1.28) + entry.phase);
        entry.frame.alpha = 0.7 + 0.3 * bt;
        if (entry.brackets) entry.brackets.alpha = 0.65 + 0.35 * bt;

        const ct = 0.5 + 0.5 * Math.sin((this._time * 2 * Math.PI / 1.08) + entry.phase + 0.7);
        entry.cracks.alpha = 0.55 + 0.45 * ct;

        // Holo edge sweep — cheap: rotate (circle) or fade-pulse (square) the
        // pre-built highlight, plus an overall travelling alpha shimmer.
        if (entry.sweep && !entry.sweep.destroyed) {
          const speed = high ? 2.6 : 1.9; // radians/sec-ish
          const shimmer = 0.55 + 0.45 * Math.sin((this._time * 2 * Math.PI / (high ? 0.7 : 1.0)) + entry.phase);
          entry.sweep.alpha = (high ? 0.85 : 0.6) * shimmer;
          if (entry.shape === "circle") {
            entry.sweep.rotation = (this._time * speed) % (Math.PI * 2);
          } else {
            // Square: cannot cheaply rotate around a non-circular edge, so we
            // pulse alpha and slide a subtle skew via position bob instead.
            entry.sweep.rotation = 0;
            const bob = Math.sin(this._time * speed * 0.5 + entry.phase) * 0.6;
            entry.sweep.position.set(entry.cx, entry.cy + bob);
          }
        }
      } else {
        // DELAYED stays calm: slow gentle pulse, no sweep.
        const t = 0.5 + 0.5 * Math.sin((this._time * 2 * Math.PI / 3.5) + entry.phase);
        entry.frame.alpha = 0.55 + 0.3 * t;
        if (entry.brackets) entry.brackets.alpha = 0.5 + 0.3 * t;
        if (entry.glow) entry.glow.alpha = 0.6 + 0.4 * t;
      }
    }
  }

  destroy() {
    this._clearAll();
  }
}
```

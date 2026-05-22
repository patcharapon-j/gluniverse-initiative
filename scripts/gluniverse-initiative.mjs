const MODULE_ID = "gluniverse-initiative";
const SOCKET_NAME = `module.${MODULE_ID}`;

const SETTINGS = {
  enabled: "enabled",
  edge: "edge",
  visibleCount: "visibleCount",
  animationIntensity: "animationIntensity",
  showDefeated: "showDefeated",
  position: "position"
};

const FLAGS = {
  visibility: "visibility",
  manualDelayed: "manualDelayed",
  portraitFrame: "portraitFrame"
};

const VISIBILITY = {
  auto: "auto",
  visible: "visible",
  hidden: "hidden",
  mystery: "mystery"
};

const FALLBACK_PORTRAIT = "icons/svg/mystery-man.svg";
const CONFIGURABLE_ACTOR_TYPES = new Set(["character", "npc", "pc"]);
const PORTRAIT_FRAME_DEFAULTS = Object.freeze({
  normal: Object.freeze({ x: 54, y: 24, scale: 1.06 }),
  expanded: Object.freeze({ x: 55, y: 12, scale: 1.2 })
});
const PORTRAIT_FRAME_LIMITS = Object.freeze({
  x: Object.freeze({ min: -50, max: 150 }),
  y: Object.freeze({ min: -50, max: 150 }),
  scale: Object.freeze({ min: 0.5, max: 3 })
});

let overlay;

Hooks.once("init", () => {
  registerSettings();
});

Hooks.once("ready", () => {
  overlay = new GLUniverseInitiativeOverlay();
  overlay.mount();
  overlay.render();
});

Hooks.on("createCombat", () => overlay?.renderSoon());
Hooks.on("deleteCombat", () => overlay?.renderSoon());
Hooks.on("updateCombat", (combat, changed) => overlay?.onCombatUpdate(combat, changed));
Hooks.on("createCombatant", () => overlay?.renderSoon());
Hooks.on("deleteCombatant", () => overlay?.renderSoon());
Hooks.on("updateCombatant", () => overlay?.renderSoon());
Hooks.on("updateActor", (_actor, changed) => {
  if (changed.flags?.[MODULE_ID] || foundry.utils.hasProperty(changed, `flags.${MODULE_ID}.${FLAGS.portraitFrame}`)) {
    overlay?.renderSoon();
  }
});
Hooks.on("getApplicationHeaderButtons", (app, buttons) => addPortraitHeaderButton(app, buttons));
Hooks.on("getApplicationV1HeaderButtons", (app, buttons) => addPortraitHeaderButton(app, buttons));
Hooks.on("getActorSheetHeaderButtons", (app, buttons) => addPortraitHeaderButton(app, buttons));
Hooks.on("getHeaderControlsApplicationV2", (app, controls) => addPortraitHeaderControl(app, controls));
Hooks.on("renderApplicationV1", (app, html) => injectPortraitTitlebarButton(app, html));
Hooks.on("renderApplicationV2", (app, html) => injectPortraitTitlebarButton(app, html));
Hooks.on("combatRound", (_combat, updateData) => {
  if (typeof updateData?.round === "number") overlay?.showRoundSplash(updateData.round);
});

function registerSettings() {
  const rerender = () => overlay?.renderSoon();

  game.settings.register(MODULE_ID, SETTINGS.enabled, {
    name: "GLUNI.Settings.Enabled.Name",
    hint: "GLUNI.Settings.Enabled.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.edge, {
    name: "GLUNI.Settings.Edge.Name",
    hint: "GLUNI.Settings.Edge.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      left: "Left",
      right: "Right"
    },
    default: "right",
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.visibleCount, {
    name: "GLUNI.Settings.VisibleCount.Name",
    hint: "GLUNI.Settings.VisibleCount.Hint",
    scope: "world",
    config: true,
    type: Number,
    range: {
      min: 1,
      max: 12,
      step: 1
    },
    default: 5,
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.animationIntensity, {
    name: "GLUNI.Settings.AnimationIntensity.Name",
    hint: "GLUNI.Settings.AnimationIntensity.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      reduced: "Reduced",
      default: "Default",
      cinematic: "Cinematic"
    },
    default: "default",
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.showDefeated, {
    name: "GLUNI.Settings.ShowDefeated.Name",
    hint: "GLUNI.Settings.ShowDefeated.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.position, {
    scope: "world",
    config: false,
    type: Object,
    default: {
      x: null,
      y: 120
    },
    onChange: rerender
  });
}

class GLUniverseInitiativeOverlay {
  constructor() {
    this.root = null;
    this.drag = null;
    this.renderTimer = null;
    this.lastRound = game.combat?.round ?? null;
    this.lastTurnKey = "";
    this.lastActiveId = null;
    this.lastActiveKey = null;
    this.pendingDelayReturnId = null;
  }

  mount() {
    if (this.root) return;

    this.root = document.createElement("aside");
    this.root.id = "gluni-initiative";
    this.root.setAttribute("aria-live", "polite");
    document.body.appendChild(this.root);

    this.root.addEventListener("click", event => this.onClick(event));
    this.root.addEventListener("pointerdown", event => this.onPointerDown(event));
    this.root.addEventListener("mouseover", event => this.onCardHover(event, true));
    this.root.addEventListener("mouseout", event => this.onCardHover(event, false));

    if (game.socket) {
      game.socket.on(SOCKET_NAME, data => {
        if (data?.type === "refresh") this.renderSoon();
        if (data?.type === "roundSplash") this.showRoundSplash(data.round);
        if (data?.type === "requestEndTurn") this.onSocketEndTurnRequest(data);
      });
    }
  }

  get combat() {
    return game.combat ?? null;
  }

  get enabled() {
    return Boolean(game.settings.get(MODULE_ID, SETTINGS.enabled));
  }

  renderSoon() {
    window.clearTimeout(this.renderTimer);
    this.renderTimer = window.setTimeout(() => this.render(), 30);
  }

  onCombatUpdate(combat, changed) {
    if (changed?.started === true) {
      this.showRoundSplash(combat.round ?? 1);
    }

    if (typeof changed?.round === "number" && changed.round !== this.lastRound) {
      this.showRoundSplash(changed.round);
      this.lastRound = changed.round;
    }

    this.renderSoon();
  }

  render() {
    if (!this.root) return;

    const combat = this.combat;
    const hasActiveCombat = Boolean(combat?.started && combat.combatants?.size);

    if (!this.enabled || !hasActiveCombat) {
      this.root.className = "gluni-initiative gluni-initiative--hidden";
      this.root.innerHTML = "";
      return;
    }

    const edge = game.settings.get(MODULE_ID, SETTINGS.edge) || "right";
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default";
    const oldRects = this.captureItemRects();
    const view = this.buildViewModel(combat);
    const turnKey = view.normal.map(item => item.key ?? `${item.type}:${item.round}`).join("|");
    const isTurnChange = this.lastTurnKey && turnKey !== this.lastTurnKey;
    const previousActiveKey = this.lastActiveKey;
    const isDelayReturn = Boolean(this.pendingDelayReturnId && view.activeId === this.pendingDelayReturnId);
    const outgoingGhost = isTurnChange && !isDelayReturn ? this.createOutgoingGhost(edge) : null;
    this.lastTurnKey = turnKey;

    this.root.className = [
      "gluni-initiative",
      `gluni-initiative--${edge}`,
      `gluni-initiative--${intensity}`,
      game.user.isGM ? "gluni-initiative--gm" : "gluni-initiative--player",
      isTurnChange ? "gluni-initiative--turn-change" : "",
      isDelayReturn ? "gluni-initiative--delay-return" : ""
    ].filter(Boolean).join(" ");

    this.applyPosition(edge);

    this.root.innerHTML = `
      <div class="gluni-shell">
        <header class="gluni-header">
          <button class="gluni-drag-handle" type="button" title="Move tracker" aria-label="Move tracker" ${game.user.isGM ? "" : "disabled"}>
            <i class="fa-solid fa-grip-lines" aria-hidden="true"></i>
          </button>
          <div class="gluni-round-chip">
            <span>${localize("GLUNI.Round").toUpperCase()}</span>
            <strong>${formatRound(combat.round)}</strong>
          </div>
        </header>
        <div class="gluni-rail">
          ${view.normal.map(item => this.renderRailItem(item)).join("")}
        </div>
        ${this.renderDelayedSection(view.delayed)}
        ${this.renderFloatingTurnControls(view)}
      </div>
    `;

    this.positionFloatingControls();
    if (isTurnChange) this.animateTurnChange(oldRects, { previousActiveKey, isDelayReturn });
    if (outgoingGhost) this.playOutgoingGhost(outgoingGhost);
    this.lastActiveId = view.activeId;
    this.lastActiveKey = view.activeKey;
    if (isDelayReturn) this.pendingDelayReturnId = null;
  }

  buildViewModel(combat) {
    const sourceTurns = Array.isArray(combat.turns) && combat.turns.length
      ? combat.turns
      : combat.combatants?.contents ?? Array.from(combat.combatants ?? []);
    const turns = Array.from(sourceTurns)
      .map(entry => Array.isArray(entry) ? entry[1] : entry)
      .filter(Boolean);
    const visibleCount = clamp(Number(game.settings.get(MODULE_ID, SETTINGS.visibleCount)) || 5, 1, 12);
    const normal = [];
    const delayed = [];

    if (!turns.length) return { normal, delayed, activeId: null, activeKey: null };

    const currentTurn = Number.isInteger(combat.turn) ? combat.turn : 0;
    const activeId = combat.combatant?.id ?? turns[currentTurn]?.id ?? null;

    for (const combatant of turns) {
      if (this.shouldSkipDefeated(combatant)) continue;
      if (!this.isDelayed(combatant)) continue;

      const card = this.buildCombatantCard(combatant, {
        active: false,
        delayed: true,
        roundOffset: 0,
        key: `delayed:${combatant.id}`
      });
      if (card) delayed.push(card);
    }

    let added = 0;
    const insertedRoundOffsets = new Set();
    let guard = 0;
    const maxScannedTurns = turns.length * Math.max(visibleCount * 2, 4);

    while (added < visibleCount && guard < maxScannedTurns) {
      const absoluteIndex = currentTurn + guard;
      const turnIndex = modulo(absoluteIndex, turns.length);
      const combatant = turns[turnIndex];
      const roundOffset = Math.floor(absoluteIndex / turns.length);
      guard += 1;

      if (!combatant || this.shouldSkipDefeated(combatant) || this.isDelayed(combatant)) continue;

      const card = this.buildCombatantCard(combatant, {
        active: combatant.id === activeId && roundOffset === 0,
        delayed: false,
        roundOffset,
        key: `combatant:${combatant.id}:round:${roundOffset}`
      });
      if (!card) continue;

      if (roundOffset > 0 && !insertedRoundOffsets.has(roundOffset)) {
        const round = (combat.round ?? 1) + roundOffset;
        normal.push({
          type: "separator",
          key: `separator:${round}:offset:${roundOffset}`,
          round
        });
        insertedRoundOffsets.add(roundOffset);
      }

      normal.push(card);
      added += 1;
    }

    const activeKey = normal.find(item => item.type === "combatant" && item.active)?.key ?? null;
    return { normal, delayed, activeId, activeKey };
  }

  buildCombatantCard(combatant, options) {
    const visibility = this.resolveVisibility(combatant);
    if (visibility.playerMode === VISIBILITY.hidden && !game.user.isGM) return null;

    const mystery = visibility.playerMode === VISIBILITY.mystery && !game.user.isGM;
    const disposition = getDisposition(combatant, mystery);

    return {
      type: "combatant",
      id: combatant.id,
      key: options.key ?? `combatant:${combatant.id}`,
      active: options.active,
      delayed: options.delayed,
      mystery,
      gmVisibilityMode: visibility.gmMode,
      defeated: Boolean(combatant.defeated),
      disposition,
      name: mystery ? localize("GLUNI.Unknown") : combatant.name,
      initiative: combatant.initiative,
      portrait: mystery ? null : getPortrait(combatant),
      portraitFrame: mystery ? null : getPortraitFrame(combatant.actor),
      canEndTurn: Boolean(options.active && !game.user.isGM && this.userOwnsCombatant(combatant, game.user))
    };
  }

  renderRailItem(item) {
    if (item.type === "separator") {
      return `
        <div class="gluni-round-separator" data-gluni-key="${escapeAttr(item.key)}" data-round="${item.round}">
          <span>${localize("GLUNI.Round").toUpperCase()}</span>
          <strong>${formatRound(item.round)}</strong>
        </div>
      `;
    }

    return this.renderCombatantCard(item);
  }

  renderCombatantCard(card) {
    const classes = [
      "gluni-card",
      card.active ? "gluni-card--active" : "",
      this.lastActiveKey === card.key && !card.active ? "gluni-card--outgoing-active" : "",
      card.delayed ? "gluni-card--delayed" : "",
      card.mystery ? "gluni-card--mystery" : "",
      card.defeated ? "gluni-card--defeated" : "",
      `gluni-card--${card.disposition}`,
      game.user.isGM && card.gmVisibilityMode !== VISIBILITY.auto ? `gluni-card--gm-${card.gmVisibilityMode}` : ""
    ].filter(Boolean).join(" ");
    const style = card.portraitFrame ? ` style="${escapeAttr(renderPortraitFrameStyle(card.portraitFrame))}"` : "";

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
  }

  renderFloatingTurnControls(view) {
    const activeCard = view.normal.find(item => item.type === "combatant" && item.active);
    if (!activeCard) return "";

    const content = game.user.isGM
      ? this.renderGMTurnControl()
      : activeCard.canEndTurn ? this.renderEndTurnControl() : "";

    if (!content) return "";

    return `<div class="gluni-floating-turn-controls">${content}</div>`;
  }

  renderGMTurnControl() {
    return `
      <div class="gluni-turn-controls" aria-label="${localize("GLUNI.Controls.TurnControls")}">
        <button type="button" data-action="previousTurn" title="${localize("GLUNI.Controls.PreviousTurn")}" aria-label="${localize("GLUNI.Controls.PreviousTurn")}">
          <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
        </button>
        <button type="button" data-action="nextTurn" title="${localize("GLUNI.Controls.NextTurn")}" aria-label="${localize("GLUNI.Controls.NextTurn")}">
          <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
        </button>
      </div>
    `;
  }

  renderEndTurnControl() {
    return `
      <button class="gluni-end-turn" type="button" data-action="endTurn" title="${localize("GLUNI.Controls.EndTurn")}" aria-label="${localize("GLUNI.Controls.EndTurn")}">
        <span>${localize("GLUNI.Controls.EndTurn").toUpperCase()}</span>
        <i class="fa-solid fa-forward-step" aria-hidden="true"></i>
      </button>
    `;
  }

  positionFloatingControls() {
    const shell = this.root?.querySelector(".gluni-shell");
    const activeCard = this.root?.querySelector(".gluni-card--active");
    const controls = this.root?.querySelector(".gluni-floating-turn-controls");
    if (!shell || !activeCard || !controls) return;

    const shellRect = shell.getBoundingClientRect();
    const cardRect = activeCard.getBoundingClientRect();
    const top = Math.max(0, Math.round(cardRect.top - shellRect.top + 32));
    shell.style.setProperty("--gluni-control-top", `${top}px`);
  }

  renderGMVisibilityMarker(card) {
    const mode = card.gmVisibilityMode ?? VISIBILITY.auto;
    const labels = {
      [VISIBILITY.auto]: "AUTO",
      [VISIBILITY.visible]: "SHOW",
      [VISIBILITY.hidden]: "HIDE",
      [VISIBILITY.mystery]: "MASK"
    };

    return `<span class="gluni-gm-visibility gluni-gm-visibility--${mode}">${labels[mode] ?? "AUTO"}</span>`;
  }

  renderGMControls(card) {
    const activeMode = card.gmVisibilityMode ?? VISIBILITY.auto;

    return `
      <div class="gluni-card-controls">
        <button class="${activeMode === VISIBILITY.auto ? "is-selected" : ""}" type="button" data-action="visibility" data-mode="auto" title="${localize("GLUNI.Controls.Auto")}" aria-label="${localize("GLUNI.Controls.Auto")}">
          <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
        </button>
        <button class="${activeMode === VISIBILITY.visible ? "is-selected" : ""}" type="button" data-action="visibility" data-mode="visible" title="${localize("GLUNI.Controls.Visible")}" aria-label="${localize("GLUNI.Controls.Visible")}">
          <i class="fa-solid fa-eye" aria-hidden="true"></i>
        </button>
        <button class="${activeMode === VISIBILITY.mystery ? "is-selected" : ""}" type="button" data-action="visibility" data-mode="mystery" title="${localize("GLUNI.Controls.Mystery")}" aria-label="${localize("GLUNI.Controls.Mystery")}">
          <i class="fa-solid fa-user-secret" aria-hidden="true"></i>
        </button>
        <button class="${activeMode === VISIBILITY.hidden ? "is-selected" : ""}" type="button" data-action="visibility" data-mode="hidden" title="${localize("GLUNI.Controls.Hidden")}" aria-label="${localize("GLUNI.Controls.Hidden")}">
          <i class="fa-solid fa-eye-slash" aria-hidden="true"></i>
        </button>
        <button type="button" data-action="${card.delayed ? "return" : "delay"}" title="${card.delayed ? localize("GLUNI.Controls.Return") : localize("GLUNI.Controls.Delay")}" aria-label="${card.delayed ? localize("GLUNI.Controls.Return") : localize("GLUNI.Controls.Delay")}">
          <i class="fa-solid fa-hourglass-half" aria-hidden="true"></i>
        </button>
      </div>
    `;
  }

  renderDelayedSection(delayedCards) {
    if (!delayedCards.length) return "";

    return `
      <section class="gluni-delayed-section">
        <div class="gluni-delayed-heading">${localize("GLUNI.Delayed").toUpperCase()}</div>
        <div class="gluni-delayed-list">
          ${delayedCards.map(card => this.renderCombatantCard(card)).join("")}
        </div>
      </section>
    `;
  }

  captureItemRects() {
    const rects = new Map();
    if (!this.root) return rects;

    for (const item of this.root.querySelectorAll("[data-gluni-key]")) {
      rects.set(item.dataset.gluniKey, item.getBoundingClientRect());
    }

    return rects;
  }

  animateTurnChange(oldRects, options = {}) {
    const items = Array.from(this.root.querySelectorAll("[data-gluni-key]"));
    const previousActiveKey = options.previousActiveKey ?? null;

    for (const item of items) {
      const isActive = item.classList.contains("gluni-card--active");
      const wasActive = item.dataset.gluniKey === previousActiveKey;
      if (wasActive && !isActive && !options.isDelayReturn) continue;

      const oldRect = oldRects.get(item.dataset.gluniKey);
      if (!oldRect) {
        item.classList.add("gluni-item--entering");
        if (!isActive) item.classList.add("gluni-item--entering-bottom");
        if (isActive && item.dataset.gluniKey !== previousActiveKey) item.classList.add("gluni-card--active-entering");
        window.setTimeout(() => item.classList.remove("gluni-item--entering", "gluni-item--entering-bottom", "gluni-card--active-entering"), 620);
        continue;
      }

      const newRect = item.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;
      const moved = Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5;

      if (isActive && item.dataset.gluniKey !== previousActiveKey) {
        item.classList.add("gluni-card--active-entering");
        window.setTimeout(() => item.classList.remove("gluni-card--active-entering"), 680);
      }

      if (!moved) continue;

      item.classList.add("gluni-item--preflip");
      item.style.setProperty("--gluni-flip-x", `${Math.round(dx)}px`);
      item.style.setProperty("--gluni-flip-y", `${Math.round(dy)}px`);
      item.getBoundingClientRect();
      item.classList.remove("gluni-item--preflip");
      item.classList.add("gluni-item--flipping");

      window.requestAnimationFrame(() => {
        item.style.setProperty("--gluni-flip-x", "0px");
        item.style.setProperty("--gluni-flip-y", "0px");
      });

      window.setTimeout(() => item.classList.remove("gluni-item--flipping"), 680);
    }
  }

  createOutgoingGhost(edge) {
    const activeCard = this.root?.querySelector(".gluni-card--active");
    if (!activeCard) return null;

    const rect = activeCard.getBoundingClientRect();
    const ghost = activeCard.cloneNode(true);
    ghost.querySelector(".gluni-card-controls")?.remove();
    ghost.classList.add("gluni-card-ghost", `gluni-card-ghost--${edge}`);
    ghost.style.left = `${Math.round(rect.left)}px`;
    ghost.style.top = `${Math.round(rect.top)}px`;
    ghost.style.width = `${Math.round(rect.width)}px`;
    ghost.style.height = `${Math.round(rect.height)}px`;
    document.body.appendChild(ghost);
    return ghost;
  }

  playOutgoingGhost(ghost) {
    window.requestAnimationFrame(() => ghost.classList.add("gluni-card-ghost--leave"));
    window.setTimeout(() => ghost.remove(), 560);
  }

  resolveVisibility(combatant) {
    const flagMode = combatant.getFlag(MODULE_ID, FLAGS.visibility) || VISIBILITY.auto;
    const foundryHidden = Boolean(combatant.hidden || combatant.token?.hidden);

    let playerMode = flagMode;
    if (flagMode === VISIBILITY.auto) playerMode = foundryHidden ? VISIBILITY.mystery : VISIBILITY.visible;

    return {
      gmMode: flagMode,
      playerMode
    };
  }

  shouldSkipDefeated(combatant) {
    if (!combatant.defeated) return false;
    return !game.settings.get(MODULE_ID, SETTINGS.showDefeated);
  }

  isDelayed(combatant) {
    if (combatant.getFlag(MODULE_ID, FLAGS.manualDelayed)) return true;
    if (game.system?.id !== "pf2e") return false;

    const flags = combatant.flags?.pf2e ?? {};
    return Boolean(
      combatant.getFlag("pf2e", "delayed") ||
      flags.delayed ||
      flags.delay ||
      flags.turn?.delayed ||
      flags.initiative?.delayed ||
      flags.combatant?.delayed
    );
  }

  onCardHover(event, hovered) {
    const card = event.target.closest("[data-combatant-id]");
    if (!card || !this.root.contains(card)) return;
    if (event.relatedTarget && card.contains(event.relatedTarget)) return;
    if (!game.user.isGM && card.classList.contains("gluni-card--mystery")) return;

    const combatant = this.combat?.combatants?.get(card.dataset.combatantId);
    this.setTokenHover(combatant, hovered);
  }

  setTokenHover(combatant, hovered) {
    const token = getCombatantTokenObject(combatant);
    if (!token) return;

    try {
      if (hovered && typeof token._onHoverIn === "function") {
        token._onHoverIn({ type: "mouseover" }, { hoverOutOthers: false });
        return;
      }

      if (!hovered && typeof token._onHoverOut === "function") {
        token._onHoverOut({ type: "mouseout" });
        return;
      }
    } catch (_error) {
      // Fall through to the render-flag path for Foundry versions with stricter hover handlers.
    }

    token.hover = hovered;
    token.renderFlags?.set?.({ refreshState: true });
    token.refresh?.();
  }

  async onClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || !this.root.contains(button)) return;

    event.preventDefault();
    event.stopPropagation();

    const action = button.dataset.action;

    if (action === "previousTurn" || action === "nextTurn") {
      if (!game.user.isGM) return;
      await this.changeTurn(action === "nextTurn" ? 1 : -1);
      return;
    }

    if (action === "endTurn") {
      await this.requestEndTurn();
      return;
    }

    if (!game.user.isGM) return;

    const card = button.closest("[data-combatant-id]");
    const combatant = this.combat?.combatants?.get(card?.dataset.combatantId);
    if (!combatant) return;

    if (action === "visibility") {
      await this.setVisibility(combatant, button.dataset.mode);
      return;
    }

    if (action === "delay") {
      await combatant.setFlag(MODULE_ID, FLAGS.manualDelayed, true);
      if (this.combat?.combatant?.id === combatant.id) await this.combat.nextTurn();
      this.broadcastRefresh();
      return;
    }

    if (action === "return") {
      const wasDelayed = this.isDelayed(combatant);
      this.pendingDelayReturnId = combatant.id;
      await combatant.unsetFlag(MODULE_ID, FLAGS.manualDelayed);
      await this.clearKnownPF2eDelayFlags(combatant);
      if (wasDelayed) await this.returnDelayedCombatantToTurn(combatant);
      this.broadcastRefresh();
    }
  }

  async changeTurn(direction) {
    const combat = this.combat;
    if (!combat?.started) return;

    if (direction > 0 && typeof combat.nextTurn === "function") await combat.nextTurn();
    else if (direction < 0 && typeof combat.previousTurn === "function") await combat.previousTurn();
    else await this.updateTurnFallback(direction);

    this.broadcastRefresh();
  }

  async updateTurnFallback(direction) {
    const combat = this.combat;
    const turns = Array.from(combat?.turns ?? []);
    if (!combat?.started || !turns.length) return;

    const currentTurn = Number.isInteger(combat.turn) ? combat.turn : 0;
    const nextTurn = modulo(currentTurn + direction, turns.length);
    await combat.update({ turn: nextTurn });
  }

  async requestEndTurn() {
    const combat = this.combat;
    const combatant = combat?.combatant;
    if (!combat?.started || !combatant || !this.userOwnsCombatant(combatant, game.user)) return;

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
    }
  }

  async onSocketEndTurnRequest(data) {
    if (!this.isPrimaryActiveGM()) return;

    const combat = this.combat;
    if (!combat?.started || combat.id !== data.combatId) return;
    if (combat.combatant?.id !== data.combatantId) return;

    const requestingUser = game.users?.get(data.userId);
    if (!requestingUser || !this.userOwnsCombatant(combat.combatant, requestingUser)) return;

    await this.changeTurn(1);
  }

  isPrimaryActiveGM() {
    if (!game.user.isGM) return false;

    const users = game.users?.contents ?? Array.from(game.users ?? []);
    const activeGMs = Array.from(users)
      .map(entry => Array.isArray(entry) ? entry[1] : entry)
      .filter(user => user?.active && user.isGM)
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));

    return (activeGMs[0]?.id ?? game.user.id) === game.user.id;
  }

  userOwnsCombatant(combatant, user) {
    if (!combatant || !user) return false;
    if (user.isGM) return true;

    const actor = combatant.actor;
    if (typeof actor?.testUserPermission === "function" && actor.testUserPermission(user, "OWNER")) return true;

    const ownerLevel = globalThis.CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;
    const ownership = actor?.ownership ?? {};
    if (Number(ownership[user.id] ?? ownership.default ?? 0) >= ownerLevel) return true;

    const players = Array.from(combatant.players ?? []);
    return players.some(player => player?.id === user.id);
  }

  async returnDelayedCombatantToTurn(combatant) {
    const combat = this.combat;
    const current = combat?.combatant;
    if (!combat?.started || !current || current.id === combatant.id) return;

    const currentInitiative = Number(current.initiative);
    if (!Number.isFinite(currentInitiative)) return;

    const targetInitiative = currentInitiative + 0.01;

    if (typeof combat.setInitiative === "function") {
      await combat.setInitiative(combatant.id, targetInitiative);
    } else {
      await combatant.update({ initiative: targetInitiative });
    }

    const returnedIndex = Array.from(combat.turns ?? []).findIndex(turn => turn.id === combatant.id);
    if (returnedIndex >= 0) await combat.update({ turn: returnedIndex });
  }

  async clearKnownPF2eDelayFlags(combatant) {
    if (game.system?.id !== "pf2e") return;

    await Promise.allSettled([
      combatant.unsetFlag("pf2e", "delayed"),
      combatant.unsetFlag("pf2e", "delay")
    ]);
  }

  async setVisibility(combatant, mode) {
    if (mode === VISIBILITY.auto) await combatant.unsetFlag(MODULE_ID, FLAGS.visibility);
    else await combatant.setFlag(MODULE_ID, FLAGS.visibility, mode);
    this.broadcastRefresh();
  }

  onPointerDown(event) {
    if (!game.user.isGM) return;
    const handle = event.target.closest(".gluni-drag-handle");
    if (!handle || !this.root.contains(handle)) return;

    event.preventDefault();
    const rect = this.root.getBoundingClientRect();

    this.drag = {
      startX: event.clientX,
      startY: event.clientY,
      rootX: rect.left,
      rootY: rect.top
    };

    this.root.classList.add("gluni-initiative--dragging");
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp, { once: true });
  }

  onPointerMove = event => {
    if (!this.drag) return;

    const x = clamp(this.drag.rootX + event.clientX - this.drag.startX, 0, window.innerWidth - this.root.offsetWidth);
    const y = clamp(this.drag.rootY + event.clientY - this.drag.startY, 0, window.innerHeight - this.root.offsetHeight);

    this.root.style.left = `${Math.round(x)}px`;
    this.root.style.top = `${Math.round(y)}px`;
    this.root.style.right = "auto";
  };

  onPointerUp = async () => {
    if (!this.drag) return;

    window.removeEventListener("pointermove", this.onPointerMove);
    this.root.classList.remove("gluni-initiative--dragging");
    this.drag = null;

    const rect = this.root.getBoundingClientRect();
    await game.settings.set(MODULE_ID, SETTINGS.position, {
      x: Math.round(rect.left),
      y: Math.round(rect.top)
    });
    this.broadcastRefresh();
  };

  applyPosition(edge) {
    const position = game.settings.get(MODULE_ID, SETTINGS.position) ?? {};
    const hasCustomX = Number.isFinite(position.x);
    const y = Number.isFinite(position.y) ? position.y : 120;

    this.root.style.top = `${y}px`;
    this.root.style.left = "";
    this.root.style.right = "";

    if (hasCustomX) {
      this.root.style.left = `${position.x}px`;
      this.root.style.right = "auto";
      return;
    }

    if (edge === "left") this.root.style.left = "18px";
    else this.root.style.right = "18px";
  }

  showRoundSplash(round) {
    if (!this.enabled || !round) return;
    if (this.lastSplashRound === round) return;
    this.lastSplashRound = round;

    const splash = document.createElement("div");
    splash.className = `gluni-round-splash gluni-round-splash--${game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default"}`;
    splash.innerHTML = `
      <div class="gluni-round-splash-inner">
        <span>${localize("GLUNI.Round").toUpperCase()}</span>
        <strong>${formatRound(round)}</strong>
      </div>
    `;
    document.body.appendChild(splash);

    window.requestAnimationFrame(() => splash.classList.add("gluni-round-splash--show"));
    window.setTimeout(() => splash.classList.add("gluni-round-splash--leave"), this.getRoundSplashHold());
    window.setTimeout(() => splash.remove(), this.getRoundSplashDuration());
  }

  getRoundSplashHold() {
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
    if (intensity === "reduced") return 450;
    if (intensity === "cinematic") return 1150;
    return 850;
  }

  getRoundSplashDuration() {
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
    if (intensity === "reduced") return 850;
    if (intensity === "cinematic") return 1750;
    return 1300;
  }

  broadcastRefresh() {
    this.renderSoon();
    if (game.socket) game.socket.emit(SOCKET_NAME, { type: "refresh" });
  }
}

function getPortrait(combatant) {
  const actorImage = combatant.actor?.img;
  const tokenImage = combatant.token?.texture?.src || combatant.token?.img || combatant.img;
  return actorImage || tokenImage || FALLBACK_PORTRAIT;
}

function addPortraitHeaderButton(app, buttons) {
  const actor = getActorFromSheet(app);
  if (!canConfigurePortrait(actor)) return;
  if (buttons.some(button => button.class === "gluni-portrait-frame")) return;

  buttons.unshift({
    label: localize("GLUNI.PortraitConfig.Button"),
    class: "gluni-portrait-frame",
    icon: "fa-solid fa-crop-simple",
    onclick: event => {
      event?.preventDefault?.();
      openPortraitConfigDialog(actor);
    }
  });
}

function addPortraitHeaderControl(app, controls) {
  const actor = getActorFromSheet(app);
  if (!canConfigurePortrait(actor)) return;
  if (controls.some(control => control.action === "gluni-portrait-frame")) return;

  controls.unshift({
    action: "gluni-portrait-frame",
    icon: "fa-solid fa-crop-simple",
    label: "GLUNI.PortraitConfig.Button",
    onClick: event => {
      event?.preventDefault?.();
      openPortraitConfigDialog(actor);
    },
    visible: true
  });
}

function injectPortraitTitlebarButton(app, html) {
  const actor = getActorFromSheet(app);
  if (!canConfigurePortrait(actor)) return;

  const element = getHTMLElement(html) ?? getHTMLElement(app.element) ?? app.element;
  const wrapper = element?.closest?.(".app, .application, .window-app") ?? element;
  const header = app.window?.header ?? wrapper?.querySelector?.(".window-header");
  if (!header || header.querySelector("[data-gluni-portrait-frame], .gluni-portrait-frame")) return;

  const button = document.createElement("a");
  button.className = "header-button gluni-portrait-frame";
  button.dataset.gluniPortraitFrame = "true";
  button.dataset.action = "gluni-portrait-frame";
  button.title = localize("GLUNI.PortraitConfig.Open");
  button.innerHTML = `<i class="fa-solid fa-crop-simple" aria-hidden="true"></i>${localize("GLUNI.PortraitConfig.Button")}`;
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    openPortraitConfigDialog(actor);
  });

  const close = header.querySelector('[data-action="close"], .close');
  if (close) header.insertBefore(button, close);
  else header.appendChild(button);
}

function getActorFromSheet(app) {
  const document = app?.actor ?? app?.document ?? app?.object ?? app?.options?.document;
  return document?.documentName === "Actor" ? document : null;
}

function canConfigurePortrait(actor) {
  if (!actor || !CONFIGURABLE_ACTOR_TYPES.has(actor.type)) return false;
  return game.user.isGM || actor.isOwner || actor.testUserPermission?.(game.user, "OWNER");
}

function openPortraitConfigDialog(actor) {
  const frame = getPortraitFrame(actor);
  const portrait = actor.img || FALLBACK_PORTRAIT;

  new Dialog({
    title: game.i18n.format("GLUNI.PortraitConfig.Title", { name: actor.name }),
    content: renderPortraitConfigDialog(actor, frame, portrait),
    buttons: {
      reset: {
        icon: '<i class="fa-solid fa-rotate-left"></i>',
        label: localize("GLUNI.PortraitConfig.Reset"),
        callback: async () => {
          await actor.unsetFlag(MODULE_ID, FLAGS.portraitFrame);
          overlay?.broadcastRefresh();
        }
      },
      save: {
        icon: '<i class="fa-solid fa-check"></i>',
        label: localize("GLUNI.PortraitConfig.Save"),
        callback: async html => {
          const nextFrame = readPortraitConfigForm(html);
          await actor.setFlag(MODULE_ID, FLAGS.portraitFrame, nextFrame);
          overlay?.broadcastRefresh();
        }
      }
    },
    default: "save",
    render: html => activatePortraitConfigDialog(html)
  }, {
    classes: ["gluni-portrait-dialog"],
    width: 560,
    resizable: false
  }).render(true);
}

function renderPortraitConfigDialog(actor, frame, portrait) {
  return `
    <form class="gluni-portrait-config-form" autocomplete="off">
      <p class="gluni-portrait-config-note">${localize("GLUNI.PortraitConfig.Hint")}</p>
      <div class="gluni-portrait-config-grid">
        ${renderPortraitConfigPanel("normal", localize("GLUNI.PortraitConfig.Normal"), frame.normal, portrait, actor.name)}
        ${renderPortraitConfigPanel("expanded", localize("GLUNI.PortraitConfig.Expanded"), frame.expanded, portrait, actor.name)}
      </div>
    </form>
  `;
}

function renderPortraitConfigPanel(mode, label, values, portrait, actorName) {
  const frameStyle = renderSinglePortraitFrameStyle(mode, values);
  const previewClasses = [
    "gluni-card",
    "gluni-card--frame-preview",
    mode === "expanded" ? "gluni-card--active gluni-card--frame-preview-expanded" : "gluni-card--frame-preview-normal",
    "gluni-card--friendly"
  ].join(" ");

  return `
    <section class="gluni-portrait-config-panel" data-frame-mode="${mode}">
      <div class="gluni-portrait-config-panel-head">
        <strong>${escapeHTML(label)}</strong>
        <span>${mode === "expanded" ? localize("GLUNI.PortraitConfig.ActiveCard") : localize("GLUNI.PortraitConfig.NormalCard")}</span>
      </div>
      <article class="${previewClasses}" data-frame-preview="${mode}" style="${escapeAttr(frameStyle)}" title="${localize("GLUNI.PortraitConfig.PreviewHint")}">
        <div class="gluni-card-accent" aria-hidden="true"></div>
        <div class="gluni-card-bracket" aria-hidden="true"></div>
        <div class="gluni-card-portrait-wrap">
          <img class="gluni-card-portrait" src="${escapeAttr(portrait)}" alt="${escapeAttr(actorName)}" draggable="false">
        </div>
        <div class="gluni-card-content">
          <div class="gluni-card-kicker">${mode === "expanded" ? `<span class="gluni-active-tag">TURN</span>` : ""}</div>
          <h3>${escapeHTML(actorName)}</h3>
          <span class="gluni-initiative-badge">18</span>
        </div>
      </article>
      ${renderPortraitControl(mode, "x", localize("GLUNI.PortraitConfig.PositionX"), values.x, PORTRAIT_FRAME_LIMITS.x.min, PORTRAIT_FRAME_LIMITS.x.max, 1)}
      ${renderPortraitControl(mode, "y", localize("GLUNI.PortraitConfig.PositionY"), values.y, PORTRAIT_FRAME_LIMITS.y.min, PORTRAIT_FRAME_LIMITS.y.max, 1)}
      ${renderPortraitControl(mode, "scale", localize("GLUNI.PortraitConfig.Scale"), values.scale, PORTRAIT_FRAME_LIMITS.scale.min, PORTRAIT_FRAME_LIMITS.scale.max, 0.01)}
    </section>
  `;
}

function renderPortraitControl(mode, property, label, value, min, max, step) {
  const name = `${mode}.${property}`;
  const displayValue = property === "scale" ? Number(value).toFixed(2) : Math.round(value);
  return `
    <label class="gluni-portrait-control">
      <span>${escapeHTML(label)}</span>
      <input type="range" name="${escapeAttr(name)}" min="${min}" max="${max}" step="${step}" value="${displayValue}" data-frame-input="${mode}" data-frame-property="${property}">
      <input type="number" name="${escapeAttr(name)}" min="${min}" max="${max}" step="${step}" value="${displayValue}" data-frame-input="${mode}" data-frame-property="${property}">
    </label>
  `;
}

function activatePortraitConfigDialog(html) {
  const element = getHTMLElement(html);
  const form = element?.querySelector(".gluni-portrait-config-form");
  if (!form) return;

  const updatePreviews = () => {
    const frame = readPortraitConfigForm(form);
    for (const mode of ["normal", "expanded"]) {
      const preview = form.querySelector(`[data-frame-preview="${mode}"]`);
      if (!preview) continue;
      preview.style.setProperty("--gluni-portrait-normal-x", `${frame[mode].x}%`);
      preview.style.setProperty("--gluni-portrait-normal-y", `${frame[mode].y}%`);
      preview.style.setProperty("--gluni-portrait-normal-scale", frame[mode].scale);
      preview.style.setProperty("--gluni-portrait-active-x", `${frame[mode].x}%`);
      preview.style.setProperty("--gluni-portrait-active-y", `${frame[mode].y}%`);
      preview.style.setProperty("--gluni-portrait-active-scale", frame[mode].scale);
    }
  };

  form.addEventListener("input", event => {
    const input = event.target.closest("[data-frame-input]");
    if (!input) return;
    syncPortraitInputs(form, input);
    updatePreviews();
  });

  for (const preview of form.querySelectorAll("[data-frame-preview]")) {
    preview.addEventListener("wheel", event => {
      event.preventDefault();
      const mode = preview.dataset.framePreview;
      const scaleInput = form.querySelector(`input[type="number"][name="${mode}.scale"]`);
      if (!scaleInput) return;
      const delta = event.deltaY > 0 ? -0.04 : 0.04;
      setPortraitInputValue(form, mode, "scale", Number(scaleInput.value) + delta);
      updatePreviews();
    }, { passive: false });

    preview.addEventListener("pointerdown", event => {
      if (event.button !== 2) return;
      event.preventDefault();
      const mode = preview.dataset.framePreview;
      const startRect = preview.getBoundingClientRect();
      const startX = Number(form.querySelector(`input[type="number"][name="${mode}.x"]`)?.value ?? 50);
      const startY = Number(form.querySelector(`input[type="number"][name="${mode}.y"]`)?.value ?? 50);

      preview.setPointerCapture(event.pointerId);
      preview.classList.add("gluni-portrait-preview--dragging");

      const onMove = moveEvent => {
        const deltaX = ((moveEvent.clientX - event.clientX) / startRect.width) * 100;
        const deltaY = ((moveEvent.clientY - event.clientY) / startRect.height) * 100;
        setPortraitInputValue(form, mode, "x", startX + deltaX);
        setPortraitInputValue(form, mode, "y", startY + deltaY);
        updatePreviews();
      };
      const onUp = upEvent => {
        if (preview.hasPointerCapture(upEvent.pointerId)) preview.releasePointerCapture(upEvent.pointerId);
        preview.classList.remove("gluni-portrait-preview--dragging");
        preview.removeEventListener("pointermove", onMove);
        preview.removeEventListener("pointerup", onUp);
        preview.removeEventListener("pointercancel", onUp);
      };

      preview.addEventListener("pointermove", onMove);
      preview.addEventListener("pointerup", onUp);
      preview.addEventListener("pointercancel", onUp);
    });

    preview.addEventListener("contextmenu", event => event.preventDefault());
  }

  updatePreviews();
}

function syncPortraitInputs(form, input) {
  const name = input.getAttribute("name");
  if (!name) return;
  const mode = input.dataset.frameInput;
  const property = input.dataset.frameProperty;
  const value = normalizePortraitValue(property, input.value);

  for (const related of form.querySelectorAll(`[name="${name}"]`)) {
    related.value = property === "scale" ? value.toFixed(2) : String(Math.round(value));
  }

  setPortraitInputValue(form, mode, property, value);
}

function setPortraitInputValue(form, mode, property, rawValue) {
  const value = normalizePortraitValue(property, rawValue);
  const displayValue = property === "scale" ? value.toFixed(2) : String(Math.round(value));
  for (const input of form.querySelectorAll(`[name="${mode}.${property}"]`)) {
    input.value = displayValue;
  }
}

function readPortraitConfigForm(html) {
  const form = getHTMLElement(html)?.querySelector?.(".gluni-portrait-config-form") ?? getHTMLElement(html);
  const frame = structuredClone(PORTRAIT_FRAME_DEFAULTS);

  for (const mode of ["normal", "expanded"]) {
    for (const property of ["x", "y", "scale"]) {
      const input = form?.querySelector?.(`input[type="number"][name="${mode}.${property}"]`);
      frame[mode][property] = normalizePortraitValue(property, input?.value ?? PORTRAIT_FRAME_DEFAULTS[mode][property]);
    }
  }

  return frame;
}

function getPortraitFrame(actor) {
  return normalizePortraitFrame(actor?.getFlag?.(MODULE_ID, FLAGS.portraitFrame));
}

function normalizePortraitFrame(value) {
  const frame = structuredClone(PORTRAIT_FRAME_DEFAULTS);
  if (!value || typeof value !== "object") return frame;

  for (const mode of ["normal", "expanded"]) {
    const source = value[mode];
    if (!source || typeof source !== "object") continue;
    for (const property of ["x", "y", "scale"]) {
      frame[mode][property] = normalizePortraitValue(property, source[property] ?? frame[mode][property]);
    }
  }

  return frame;
}

function normalizePortraitValue(property, value) {
  const number = Number(value);
  const fallback = property === "scale" ? 1 : 50;
  const safeValue = Number.isFinite(number) ? number : fallback;
  const limits = PORTRAIT_FRAME_LIMITS[property];
  return clamp(safeValue, limits.min, limits.max);
}

function renderPortraitFrameStyle(frame) {
  const value = normalizePortraitFrame(frame);
  return [
    `--gluni-portrait-normal-x: ${value.normal.x}%;`,
    `--gluni-portrait-normal-y: ${value.normal.y}%;`,
    `--gluni-portrait-normal-scale: ${value.normal.scale};`,
    `--gluni-portrait-active-x: ${value.expanded.x}%;`,
    `--gluni-portrait-active-y: ${value.expanded.y}%;`,
    `--gluni-portrait-active-scale: ${value.expanded.scale};`
  ].join(" ");
}

function renderSinglePortraitFrameStyle(mode, values) {
  const frame = normalizePortraitFrame({ [mode]: values });
  const value = frame[mode];
  return [
    `--gluni-portrait-normal-x: ${value.x}%;`,
    `--gluni-portrait-normal-y: ${value.y}%;`,
    `--gluni-portrait-normal-scale: ${value.scale};`,
    `--gluni-portrait-active-x: ${value.x}%;`,
    `--gluni-portrait-active-y: ${value.y}%;`,
    `--gluni-portrait-active-scale: ${value.scale};`
  ].join(" ");
}

function getHTMLElement(value) {
  if (!value) return null;
  if (value instanceof HTMLElement) return value;
  if (value[0] instanceof HTMLElement) return value[0];
  if (value.element instanceof HTMLElement) return value.element;
  if (value.element?.[0] instanceof HTMLElement) return value.element[0];
  return null;
}

function getCombatantTokenObject(combatant) {
  if (!combatant) return null;
  if (combatant.token?.object) return combatant.token.object;

  const tokenId = combatant.token?.id ?? combatant.tokenId;
  const sceneId = combatant.scene?.id ?? combatant.token?.parent?.id;
  const tokens = globalThis.canvas?.tokens?.placeables ?? [];

  return tokens.find(token => {
    const document = token.document;
    if (sceneId && document?.parent?.id !== sceneId) return false;
    if (tokenId && document?.id === tokenId) return true;
    return !tokenId && combatant.actor?.id && token.actor?.id === combatant.actor.id;
  }) ?? null;
}

function getDisposition(combatant, mystery) {
  if (mystery) return "secret";

  const disposition = combatant.token?.disposition;
  const tokenDispositions = globalThis.CONST?.TOKEN_DISPOSITIONS ?? {};

  if (disposition === tokenDispositions.FRIENDLY || disposition === 1) return "friendly";
  if (disposition === tokenDispositions.HOSTILE || disposition === -1) return "hostile";
  if (disposition === tokenDispositions.SECRET || disposition === -2) return "secret";
  return "neutral";
}

function formatRound(round) {
  const value = Number(round) || 1;
  if (value < 100) return String(value).padStart(2, "0");
  return String(value);
}

function formatInitiative(initiative) {
  if (initiative === null || initiative === undefined) return "--";
  const value = Number(initiative);
  if (!Number.isFinite(value)) return String(initiative);
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function localize(key) {
  return game.i18n?.localize(key) ?? key;
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHTML(value) {
  const element = document.createElement("span");
  element.textContent = value ?? "";
  return element.innerHTML;
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

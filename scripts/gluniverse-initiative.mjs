const MODULE_ID = "gluniverse-initiative";
const SOCKET_NAME = `module.${MODULE_ID}`;

const SETTINGS = {
  enabled: "enabled",
  edge: "edge",
  visibleCount: "visibleCount",
  animationIntensity: "animationIntensity",
  showDefeated: "showDefeated",
  position: "position",
  uiScale: "uiScale",
  tokenOverlayShape: "tokenOverlayShape",
  visualFidelity: "visualFidelity"
};

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

const FLAGS = {
  visibility: "visibility",
  manualDelayed: "manualDelayed",
  guardBroken: "guardBroken",
  portraitFrame: "portraitFrame",
  adhoc: "adhoc",
  adhocActor: "adhocActor"
};

const VISIBILITY = {
  auto: "auto",
  visible: "visible",
  hidden: "hidden",
  mystery: "mystery"
};

// PF2e-only: an Effect item applied to a broken actor that imposes a -2 status
// penalty to AC and all saving throws. The slug + module flag let us find and
// remove exactly the effect we created when the break is cleared.
const PF2E_GUARD_BREAK_EFFECT_SLUG = "gluni-guard-break";
const PF2E_GUARD_BREAK_PENALTY = 2;

const LOCALIZATION_FALLBACKS = Object.freeze({
  "GLUNI.Settings.AnimationIntensity.Default": "Default",
  "GLUNI.Settings.AnimationIntensity.Cinematic": "Cinematic",
  "GLUNI.Settings.AnimationIntensity.Hint": "Controls how dramatic turn and round animations feel.",
  "GLUNI.Settings.AnimationIntensity.Name": "Animation intensity",
  "GLUNI.Settings.AnimationIntensity.Reduced": "Reduced",
  "GLUNI.Settings.Edge.Hint": "Choose which screen edge the initiative rail anchors to.",
  "GLUNI.Settings.Edge.Left": "Left",
  "GLUNI.Settings.Edge.Name": "Tracker edge",
  "GLUNI.Settings.Edge.Right": "Right",
  "GLUNI.Settings.Enabled.Hint": "Show the GLUniverse Initiative overlay for this user while combat is active.",
  "GLUNI.Settings.Enabled.Name": "Show cinematic initiative overlay",
  "GLUNI.Settings.ShowDefeated.Hint": "When disabled, defeated combatants are omitted from the cinematic overlay.",
  "GLUNI.Settings.ShowDefeated.Name": "Show defeated combatants",
  "GLUNI.Settings.TokenOverlayShape.Circle": "Circle",
  "GLUNI.Settings.TokenOverlayShape.Hint": "Shape of the status overlay drawn on tokens with delay or guard break.",
  "GLUNI.Settings.TokenOverlayShape.Name": "Token overlay shape",
  "GLUNI.Settings.TokenOverlayShape.Square": "Square",
  "GLUNI.Settings.UIScale.Hint": "Scale the initiative tracker for only this user.",
  "GLUNI.Settings.UIScale.Name": "UI scale",
  "GLUNI.Settings.VisualFidelity.Name": "Visual fidelity",
  "GLUNI.Settings.VisualFidelity.Hint": "Higher fidelity uses real frosted glass and motion blur for the most premium look. Step down to Balanced for lighter GPU load while staying premium.",
  "GLUNI.Settings.VisualFidelity.High": "High (best looking)",
  "GLUNI.Settings.VisualFidelity.Balanced": "Balanced (lighter)",
  "GLUNI.Settings.VisibleCount.Hint": "Number of normal initiative combatants to show from the current turn forward.",
  "GLUNI.Settings.VisibleCount.Name": "Visible combatants",
  "GLUNI.Controls.Auto": "Auto",
  "GLUNI.Controls.Delay": "Delay",
  "GLUNI.Controls.EndTurn": "End turn",
  "GLUNI.Controls.AdjustInitiative": "Adjust initiative",
  "GLUNI.Controls.Apply": "Apply",
  "GLUNI.Controls.GuardBreak": "Guard break",
  "GLUNI.Controls.ClearGuardBreak": "Clear guard break",
  "GLUNI.Controls.TokenGuardBreak": "Toggle break on token",
  "GLUNI.Controls.TokenGuardBreak.NoCombat": "Start combat before marking break.",
  "GLUNI.Controls.TokenGuardBreak.NoCombatant": "This token is not in the active combat.",
  "GLUNI.Controls.DecreaseInitiative": "Decrease initiative",
  "GLUNI.Controls.Hidden": "Hide",
  "GLUNI.Controls.IncreaseInitiative": "Increase initiative",
  "GLUNI.Controls.Mystery": "Mystery",
  "GLUNI.Controls.NextTurn": "Next turn",
  "GLUNI.Controls.PreviousTurn": "Previous turn",
  "GLUNI.Controls.Return": "Return",
  "GLUNI.Controls.TurnControls": "Turn controls",
  "GLUNI.Controls.Visible": "Show",
  "GLUNI.AdHoc.Add": "Add ad hoc initiative",
  "GLUNI.AdHoc.Create": "Create",
  "GLUNI.AdHoc.Delete": "Delete ad hoc initiative",
  "GLUNI.AdHoc.DeleteConfirm": "Delete ad hoc initiative entry \"{name}\"?",
  "GLUNI.AdHoc.DefaultName": "Ad Hoc Trigger",
  "GLUNI.AdHoc.DialogTitle": "Ad Hoc Initiative",
  "GLUNI.AdHoc.Icon": "Icon",
  "GLUNI.AdHoc.Initiative": "Initiative",
  "GLUNI.AdHoc.Lifecycle": "Duration",
  "GLUNI.AdHoc.Name": "Name",
  "GLUNI.AdHoc.NameRequired": "Ad hoc initiative needs a name.",
  "GLUNI.AdHoc.OneShot": "One shot",
  "GLUNI.AdHoc.Persistent": "Persistent",
  "GLUNI.AdHoc.Round": "Round",
  "GLUNI.AdHoc.Type": "Type",
  "GLUNI.AdHoc.Type.Effect": "Effect",
  "GLUNI.AdHoc.Type.Environment": "Environment",
  "GLUNI.AdHoc.Type.Hazard": "Hazard",
  "GLUNI.AdHoc.Type.NPC": "NPC",
  "GLUNI.AdHoc.Visibility": "Visibility",
  "GLUNI.Delayed": "Delayed",
  "GLUNI.GuardBreak": "Break",
  "GLUNI.PF2e.BreakEffect.Name": "Break",
  "GLUNI.PF2e.BreakEffect.Description": "<p>Your guard has been broken. You take a -2 status penalty to AC and all saving throws.</p>",
  "GLUNI.Dying": "Dying",
  "GLUNI.Dying.Aria": "Dying {value} of {max}",
  "GLUNI.PortraitConfig.ActiveCard": "Active card",
  "GLUNI.PortraitConfig.Button": "Frame",
  "GLUNI.PortraitConfig.Expanded": "Expanded",
  "GLUNI.PortraitConfig.Hint": "Tune how this actor's image is cropped in normal and active initiative cards. Right-drag a preview to reposition; use the mouse wheel over a preview to adjust zoom.",
  "GLUNI.PortraitConfig.Normal": "Normal",
  "GLUNI.PortraitConfig.NormalCard": "Idle card",
  "GLUNI.PortraitConfig.Open": "Configure initiative portrait",
  "GLUNI.PortraitConfig.PositionX": "X",
  "GLUNI.PortraitConfig.PositionY": "Y",
  "GLUNI.PortraitConfig.PreviewHint": "Right-drag to reposition. Mouse wheel adjusts zoom.",
  "GLUNI.PortraitConfig.Reset": "Reset",
  "GLUNI.PortraitConfig.Save": "Save",
  "GLUNI.PortraitConfig.Scale": "Zoom",
  "GLUNI.PortraitConfig.Title": "{name} Initiative Portrait",
  "GLUNI.Round": "Round",
  "GLUNI.Splash.Break": "GUARD BREAK",
  "GLUNI.Splash.Cycle": "INITIATIVE - CYCLE {round}",
  "GLUNI.Unknown": "Unknown"
});

const ADHOC_DEFAULT_TYPE = "effect";
const ADHOC_TYPES = Object.freeze({
  effect: Object.freeze({
    label: "GLUNI.AdHoc.Type.Effect",
    icon: "fa-solid fa-bolt",
    disposition: "neutral"
  }),
  hazard: Object.freeze({
    label: "GLUNI.AdHoc.Type.Hazard",
    icon: "fa-solid fa-triangle-exclamation",
    disposition: "hostile"
  }),
  npc: Object.freeze({
    label: "GLUNI.AdHoc.Type.NPC",
    icon: "fa-solid fa-user-clock",
    disposition: "secret"
  }),
  environment: Object.freeze({
    label: "GLUNI.AdHoc.Type.Environment",
    icon: "fa-solid fa-cloud-bolt",
    disposition: "friendly"
  })
});
const ADHOC_VISIBILITY_MODES = new Set([VISIBILITY.visible, VISIBILITY.mystery, VISIBILITY.hidden]);
const ADHOC_LIFECYCLE = Object.freeze({
  persistent: "persistent",
  oneShot: "oneShot"
});
const ADHOC_LIFECYCLE_MODES = new Set(Object.values(ADHOC_LIFECYCLE));
const STATUS_ANIMATION = Object.freeze({
  delay: Object.freeze({ label: "GLUNI.Delayed", colorClass: "delay", motion: "slide" }),
  guardBreak: Object.freeze({ label: "GLUNI.GuardBreak", colorClass: "break", motion: "slide" }),
  dying: Object.freeze({ label: "GLUNI.Dying", colorClass: "dying", motion: "dying" })
});
const ADHOC_ICON_CHOICES = Object.freeze([
  "fa-solid fa-bolt",
  "fa-solid fa-burst",
  "fa-solid fa-fire",
  "fa-solid fa-skull",
  "fa-solid fa-triangle-exclamation",
  "fa-solid fa-cloud-bolt",
  "fa-solid fa-droplet",
  "fa-solid fa-wind",
  "fa-solid fa-snowflake",
  "fa-solid fa-radiation",
  "fa-solid fa-biohazard",
  "fa-solid fa-eye",
  "fa-solid fa-eye-slash",
  "fa-solid fa-hourglass-half",
  "fa-solid fa-clock",
  "fa-solid fa-stopwatch",
  "fa-solid fa-gears",
  "fa-solid fa-shield-halved",
  "fa-solid fa-crosshairs",
  "fa-solid fa-person-rays",
  "fa-solid fa-spider",
  "fa-solid fa-dragon",
  "fa-solid fa-ghost",
  "fa-solid fa-user-clock",
  "fa-solid fa-masks-theater",
  "fa-solid fa-circle-nodes",
  "fa-solid fa-circle-radiation",
  "fa-solid fa-location-crosshairs",
  "fa-solid fa-dungeon",
  "fa-solid fa-land-mine-on",
  "fa-solid fa-volcano",
  "fa-solid fa-mountain-sun",
  "fa-solid fa-water",
  "fa-solid fa-cloud-showers-heavy",
  "fa-solid fa-wand-sparkles",
  "fa-solid fa-hand-sparkles",
  "fa-solid fa-book-skull",
  "fa-solid fa-flask-vial",
  "fa-solid fa-circle-question",
  "fa-solid fa-star-of-life"
]);

const COMBATANT_RENDER_UPDATE_KEYS = new Set([
  "actorId",
  "defeated",
  "flags",
  "hidden",
  "img",
  "initiative",
  "name",
  "sceneId",
  "sort",
  "token",
  "tokenId"
]);
const ACTOR_RENDER_UPDATE_KEYS = new Set(["flags", "img", "items", "name", "prototypeToken", "system"]);

const FALLBACK_PORTRAIT = "icons/svg/mystery-man.svg";
const PORTRAIT_MIN_PIXELS = Object.freeze({
  normalHeight: 58,
  activeHeight: 166
});
const CONFIGURABLE_ACTOR_TYPES = new Set(["character", "npc", "pc"]);
const PORTRAIT_FRAME_DEFAULTS = Object.freeze({
  normal: Object.freeze({ x: 54, y: 24, scale: 1.06 }),
  expanded: Object.freeze({ x: 55, y: 12, scale: 1.2 })
});
const PORTRAIT_FRAME_LIMITS = Object.freeze({
  x: Object.freeze({ min: -100, max: 200 }),
  y: Object.freeze({ min: -100, max: 200 }),
  scale: Object.freeze({ min: 0.5, max: 3 })
});

let overlay;
let tokenOverlays;
const portraitQualityCache = new Map();

Hooks.once("init", () => {
  registerSettings();
});

Hooks.once("ready", () => {
  overlay = new GLUniverseInitiativeOverlay();
  overlay.mount();
  overlay.render();
  tokenOverlays = new TokenOverlayManager();
});

Hooks.on("createCombat", () => overlay?.renderSoon());
Hooks.on("preDeleteCombat", combat => overlay?.removeAllPF2eGuardBreakEffects(combat));
Hooks.on("deleteCombat", () => overlay?.renderSoon());
Hooks.on("updateCombat", (combat, changed) => overlay?.onCombatUpdate(combat, changed));
Hooks.on("createCombatant", () => overlay?.renderSoon());
Hooks.on("preDeleteCombatant", combatant => overlay?.removePF2eGuardBreakEffect(combatant));
Hooks.on("deleteCombatant", () => overlay?.renderSoon());
Hooks.on("updateCombatant", (_combatant, changed) => {
  if (isRelevantCombatantUpdate(changed)) overlay?.renderSoon();
});
Hooks.on("updateActor", (actor, changed) => {
  if (isRelevantActorUpdate(changed) && overlay?.hasCombatActor(actor)) {
    overlay?.renderSoon();
  }
});
Hooks.on("createItem", item => overlay?.onActorItemChange(item?.parent));
Hooks.on("deleteItem", item => overlay?.onActorItemChange(item?.parent));
Hooks.on("updateItem", item => overlay?.onActorItemChange(item?.parent));
Hooks.on("getApplicationHeaderButtons", (app, buttons) => addPortraitHeaderButton(app, buttons));
Hooks.on("getApplicationV1HeaderButtons", (app, buttons) => addPortraitHeaderButton(app, buttons));
Hooks.on("getActorSheetHeaderButtons", (app, buttons) => addPortraitHeaderButton(app, buttons));
Hooks.on("getHeaderControlsApplicationV2", (app, controls) => addPortraitHeaderControl(app, controls));
Hooks.on("renderApplicationV1", (app, html) => injectPortraitTitlebarButton(app, html));
Hooks.on("renderApplicationV2", (app, html) => injectPortraitTitlebarButton(app, html));
Hooks.on("renderTokenHUD", (hud, html, data) => addGuardBreakTokenHudButton(hud, html, data));
Hooks.on("combatRound", (_combat, updateData) => {
  if (typeof updateData?.round === "number") overlay?.showRoundSplash(updateData.round);
});
Hooks.on("canvasReady", () => tokenOverlays?.refresh());

function registerSettings() {
  const rerender = () => overlay?.renderSoon();

  game.settings.register(MODULE_ID, SETTINGS.enabled, {
    name: localize("GLUNI.Settings.Enabled.Name"),
    hint: localize("GLUNI.Settings.Enabled.Hint"),
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.edge, {
    name: localize("GLUNI.Settings.Edge.Name"),
    hint: localize("GLUNI.Settings.Edge.Hint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      left: localize("GLUNI.Settings.Edge.Left"),
      right: localize("GLUNI.Settings.Edge.Right")
    },
    default: "right",
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.visibleCount, {
    name: localize("GLUNI.Settings.VisibleCount.Name"),
    hint: localize("GLUNI.Settings.VisibleCount.Hint"),
    scope: "world",
    config: true,
    type: Number,
    range: {
      min: 1,
      max: 12,
      step: 1
    },
    default: 6,
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.animationIntensity, {
    name: localize("GLUNI.Settings.AnimationIntensity.Name"),
    hint: localize("GLUNI.Settings.AnimationIntensity.Hint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      reduced: localize("GLUNI.Settings.AnimationIntensity.Reduced"),
      default: localize("GLUNI.Settings.AnimationIntensity.Default"),
      cinematic: localize("GLUNI.Settings.AnimationIntensity.Cinematic")
    },
    default: "cinematic",
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.showDefeated, {
    name: localize("GLUNI.Settings.ShowDefeated.Name"),
    hint: localize("GLUNI.Settings.ShowDefeated.Hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.uiScale, {
    name: localize("GLUNI.Settings.UIScale.Name"),
    hint: localize("GLUNI.Settings.UIScale.Hint"),
    scope: "client",
    config: true,
    type: Number,
    range: {
      min: 0.75,
      max: 1.5,
      step: 0.05
    },
    default: 1,
    onChange: rerender
  });

  game.settings.register(MODULE_ID, SETTINGS.tokenOverlayShape, {
    name: localize("GLUNI.Settings.TokenOverlayShape.Name"),
    hint: localize("GLUNI.Settings.TokenOverlayShape.Hint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      circle: localize("GLUNI.Settings.TokenOverlayShape.Circle"),
      square: localize("GLUNI.Settings.TokenOverlayShape.Square")
    },
    default: "circle",
    onChange: () => tokenOverlays?.forceRedraw()
  });

  game.settings.register(MODULE_ID, SETTINGS.visualFidelity, {
    name: localize("GLUNI.Settings.VisualFidelity.Name"),
    hint: localize("GLUNI.Settings.VisualFidelity.Hint"),
    scope: "client",
    config: true,
    type: String,
    choices: {
      high: localize("GLUNI.Settings.VisualFidelity.High"),
      balanced: localize("GLUNI.Settings.VisualFidelity.Balanced")
    },
    default: "high",
    onChange: () => {
      overlay?.renderSoon();
      tokenOverlays?.forceRedraw();
    }
  });

  game.settings.register(MODULE_ID, SETTINGS.position, {
    scope: "client",
    config: false,
    type: Object,
    default: {
      x: null,
      y: 120
    },
    onChange: rerender
  });
}

function getVisualFidelity() {
  try {
    return game.settings.get(MODULE_ID, SETTINGS.visualFidelity) || "high";
  } catch {
    return "high";
  }
}

function isRelevantCombatantUpdate(changed) {
  if (!changed || typeof changed !== "object") return true;
  const keys = Object.keys(changed);
  if (!keys.length) return true;
  return keys.some(key => COMBATANT_RENDER_UPDATE_KEYS.has(key));
}

function isRelevantActorUpdate(changed) {
  if (!changed || typeof changed !== "object") return true;
  const keys = Object.keys(changed);
  if (!keys.length) return true;
  if (!keys.some(key => ACTOR_RENDER_UPDATE_KEYS.has(key))) return false;
  if (changed.name !== undefined || changed.img !== undefined || changed.prototypeToken !== undefined || changed.system !== undefined || changed.items !== undefined) return true;
  return Boolean(changed.flags?.[MODULE_ID] || foundry.utils.hasProperty(changed, `flags.${MODULE_ID}.${FLAGS.portraitFrame}`));
}

function addGuardBreakTokenHudButton(hud, html, data) {
  if (!game.user.isGM) return;

  const element = getHTMLElement(html);
  const token = hud?.object ?? canvas?.scene?.tokens?.get(data?._id ?? "")?.object ?? null;
  if (!element || !token?.document) return;
  if (element.querySelector(".gluni-token-guard-break")) return;

  const combatant = getCombatantForToken(game.combat, token);
  const isBroken = Boolean(combatant && getGuardBreakState(combatant));

  const button = document.createElement("button");
  button.type = "button";
  button.className = `control-icon gluni-token-guard-break${isBroken ? " active" : ""}`;
  button.title = localize(isBroken ? "GLUNI.Controls.ClearGuardBreak" : "GLUNI.Controls.GuardBreak");
  button.ariaLabel = localize("GLUNI.Controls.TokenGuardBreak");
  button.dataset.tooltip = localize("GLUNI.Controls.TokenGuardBreak");
  button.innerHTML = '<i class="fa-solid fa-shield-halved" aria-hidden="true"></i>';
  button.addEventListener("click", async event => {
    event.preventDefault();
    event.stopPropagation();
    if (button.disabled) return;

    button.disabled = true;
    try {
      await toggleTokenHudGuardBreak(token, button);
    } finally {
      button.disabled = false;
    }
  });

  const column = element.querySelector(".col.right") ?? element.querySelector(".right") ?? element;
  column.append(button);
}

async function toggleTokenHudGuardBreak(token, button) {
  const combat = game.combat ?? null;
  if (!combat?.started) {
    ui.notifications?.warn(localize("GLUNI.Controls.TokenGuardBreak.NoCombat"));
    return;
  }

  const combatant = getCombatantForToken(combat, token);
  if (!combatant || isAdhocCombatant(combatant)) {
    ui.notifications?.warn(localize("GLUNI.Controls.TokenGuardBreak.NoCombatant"));
    return;
  }

  const wasBroken = Boolean(getGuardBreakState(combatant));
  if (wasBroken) await overlay?.clearGuardBreak(combatant);
  else await overlay?.applyGuardBreak(combatant);

  const isBroken = !wasBroken;
  button?.classList.toggle("active", isBroken);
  if (button) button.title = localize(isBroken ? "GLUNI.Controls.ClearGuardBreak" : "GLUNI.Controls.GuardBreak");
}

function getCombatantForToken(combat, token, combatants = getCombatantList(combat)) {
  const direct = token?.document?.combatant ?? token?.combatant ?? null;
  if (direct?.id && combat?.combatants?.get?.(direct.id)) return direct;

  const document = token?.document ?? token;
  const tokenId = document?.id ?? token?.id ?? null;
  const sceneId = document?.parent?.id ?? document?.scene?.id ?? canvas?.scene?.id ?? null;
  const actorId = token?.actor?.id ?? document?.actor?.id ?? document?.actorId ?? null;

  if (tokenId) {
    const exact = combatants.find(combatant => {
      const combatantTokenId = combatant.token?.id ?? combatant.tokenId ?? null;
      if (combatantTokenId !== tokenId) return false;

      const combatantSceneId = getCombatantSceneId(combatant);
      return !sceneId || !combatantSceneId || combatantSceneId === sceneId;
    });
    if (exact) return exact;
  }

  if (!actorId) return null;

  const actorMatches = combatants.filter(combatant => {
    const combatantActorId = combatant.actor?.id ?? combatant.actorId ?? null;
    return combatantActorId === actorId;
  });
  if (actorMatches.length === 1) return actorMatches[0];

  const sceneMatches = actorMatches.filter(combatant => {
    const combatantSceneId = getCombatantSceneId(combatant);
    return !sceneId || !combatantSceneId || combatantSceneId === sceneId;
  });
  return sceneMatches.length === 1 ? sceneMatches[0] : null;
}

function getCombatantList(combat) {
  return Array.from(combat?.combatants?.contents ?? combat?.combatants ?? [])
    .map(entry => Array.isArray(entry) ? entry[1] : entry)
    .filter(Boolean);
}

function getCombatantSceneId(combatant) {
  return combatant?.scene?.id ?? combatant?.sceneId ?? combatant?.token?.parent?.id ?? combatant?.token?.scene?.id ?? null;
}

class GLUniverseInitiativeOverlay {
  constructor() {
    this.root = null;
    this.drag = null;
    this.renderTimer = null;
    this.lastRound = game.combat?.round ?? null;
    this.lastRenderedRound = game.combat?.round ?? null;
    this.lastTurnKey = "";
    this.lastActiveId = null;
    this.lastActiveKey = null;
    this.lastActiveInitiative = null;
    this.pendingDelayReturnId = null;
    this.lastMarkup = "";
    this.lastRootClassName = "";
    this.lastPositionStyle = null;
    this.adhocSkipTimer = null;
    this.guardBreakClearTimer = null;
    this.pendingGuardBreakImpactId = null;
    this.cardDrag = null;
    this.contextMenu = null;
    this.pendingSlideInIds = new Set();
    this.pendingDyingWipeIds = new Set();
    this.pendingStatusFlashes = new Map();
    this.lastDyingIds = new Set();
    this.lastDelayedIds = new Set();
    this.lastBrokenIds = new Set();
    this.recentStatusAnimations = new Map();
    this.statusSnapshotInitialized = false;
    this.handledEndTurnRequests = new Set();
  }

  mount() {
    if (this.root) return;

    this.root = document.createElement("aside");
    this.root.id = "gluni-initiative";
    this.root.setAttribute("aria-live", "polite");
    document.body.appendChild(this.root);

    this.root.addEventListener("click", event => this.onClick(event));
    this.root.addEventListener("contextmenu", event => this.onContextMenu(event));
    this.root.addEventListener("pointerdown", event => this.onPointerDown(event));
    this.root.addEventListener("mouseover", event => this.onCardHover(event, true));
    this.root.addEventListener("mouseout", event => this.onCardHover(event, false));

    if (game.socket) {
      game.socket.on(SOCKET_NAME, data => {
        if (data?.type === "refresh") this.renderSoon();
        if (data?.type === "roundSplash") this.showRoundSplash(data.round);
        if (data?.type === "guardBreakImpact") this.queueGuardBreakImpact(data);
        if (data?.type === "breakSplash") this.showBreakSplash(data.name);
        if (data?.type === "statusAnimation") this.queueStatusAnimation(data);
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

  hasCombatActor(actor) {
    if (!actor) return false;
    const combatants = this.combat?.combatants?.contents ?? Array.from(this.combat?.combatants ?? []);
    return combatants.some(entry => {
      const combatant = Array.isArray(entry) ? entry[1] : entry;
      return combatant?.actor?.id === actor.id || combatant?.actorId === actor.id;
    });
  }

  onActorItemChange(actor) {
    if (this.hasCombatActor(actor)) this.renderSoon();
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

    if (game.user.isGM && (typeof changed?.turn === "number" || typeof changed?.round === "number")) {
      this.skipInactiveAdhocTurnSoon();
      this.clearActiveGuardBreakSoon();
    }

    this.renderSoon();
  }

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
    const fidelity = getVisualFidelity();
    const rootClassName = [
      "gluni-initiative",
      `gluni-initiative--${settings.edge}`,
      `gluni-initiative--${settings.intensity}`,
      `gluni-fidelity--${getVisualFidelity()}`,
      settings.isGM ? "gluni-initiative--gm" : "gluni-initiative--player",
      isTurnChange ? "gluni-initiative--turn-change" : "",
      isDelayReturn ? "gluni-initiative--delay-return" : ""
    ].filter(Boolean).join(" ");
    const markup = this.renderMarkup(combat, view, settings);
    const markupChanged = markup !== this.lastMarkup;
    const shouldAnimateTurnChange = isTurnChange && markupChanged && settings.intensity !== "reduced";
    const oldRects = shouldAnimateTurnChange ? this.captureItemRects() : new Map();
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

  getRenderSettings() {
    const visibleCount = clamp(Number(game.settings.get(MODULE_ID, SETTINGS.visibleCount)) || 5, 1, 12);
    const uiScale = clamp(Number(game.settings.get(MODULE_ID, SETTINGS.uiScale)) || 1, 0.75, 1.5);

    return {
      edge: game.settings.get(MODULE_ID, SETTINGS.edge) || "right",
      intensity: game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default",
      visibleCount,
      uiScale,
      showDefeated: Boolean(game.settings.get(MODULE_ID, SETTINGS.showDefeated)),
      isGM: Boolean(game.user.isGM)
    };
  }

  renderMarkup(combat, view, settings) {
    return `
      <div class="gluni-shell">
        <header class="gluni-header">
          <button class="gluni-drag-handle" type="button" title="Move tracker" aria-label="Move tracker">
            <span class="gluni-drag-handle-grip" aria-hidden="true"></span>
          </button>
          <div class="gluni-round-chip">
            <span class="gluni-round-chip-label">${localize("GLUNI.Round").toUpperCase()}</span>
            <span class="gluni-round-chip-divider" aria-hidden="true"></span>
            <strong class="gluni-round-chip-num">${formatRound(combat.round)}</strong>
          </div>
        </header>
        <div class="gluni-rail">
          ${view.normal.map(item => this.renderRailItem(item)).join("")}
        </div>
        ${this.renderDelayedSection(view.delayed)}
        ${this.renderFloatingTurnControls(view)}
      </div>
    `;
  }

  buildViewModel(combat, settings = this.getRenderSettings()) {
    const sourceTurns = Array.isArray(combat.turns) && combat.turns.length
      ? combat.turns
      : combat.combatants?.contents ?? Array.from(combat.combatants ?? []);
    const turns = Array.from(sourceTurns)
      .map(entry => Array.isArray(entry) ? entry[1] : entry)
      .filter(Boolean);
    const states = turns.map(combatant => {
      const skipped = Boolean(combatant.defeated && !settings.showDefeated);
      return {
        combatant,
        skipped,
        delayed: skipped ? false : this.isDelayed(combatant)
      };
    });
    const normal = [];
    const delayed = [];

    if (!turns.length) return { normal, delayed, activeId: null, activeKey: null };

    const currentTurn = Number.isInteger(combat.turn) ? combat.turn : 0;
    const activeId = combat.combatant?.id ?? turns[currentTurn]?.id ?? null;
    const currentRound = combat.round ?? 1;

    for (const state of states) {
      if (state.skipped || !state.delayed) continue;
      if (!shouldShowAdhocOnRound(state.combatant, currentRound)) continue;

      const card = this.buildCombatantCard(state.combatant, {
        active: false,
        delayed: true,
        roundOffset: 0,
        displayRound: currentRound,
        key: `delayed:${state.combatant.id}`
      });
      if (card) delayed.push(card);
    }

    let added = 0;
    const insertedRoundOffsets = new Set();
    let guard = 0;
    const maxScannedTurns = turns.length * Math.max(settings.visibleCount * 2, 4);

    while (added < settings.visibleCount && guard < maxScannedTurns) {
      const absoluteIndex = currentTurn + guard;
      const turnIndex = modulo(absoluteIndex, turns.length);
      const state = states[turnIndex];
      const combatant = state?.combatant;
      const roundOffset = Math.floor(absoluteIndex / turns.length);
      const displayRound = currentRound + roundOffset;
      guard += 1;

      if (!combatant || state.skipped || state.delayed) continue;
      if (!shouldShowAdhocOnRound(combatant, displayRound)) continue;

      const card = this.buildCombatantCard(combatant, {
        active: combatant.id === activeId && roundOffset === 0,
        delayed: false,
        roundOffset,
        displayRound,
        key: `combatant:${combatant.id}:round:${roundOffset}`
      });
      if (!card) continue;

      if (roundOffset > 0 && !insertedRoundOffsets.has(roundOffset)) {
        const round = currentRound + roundOffset;
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

    const adhoc = getAdhocData(combatant, options.displayRound);
    const mystery = visibility.playerMode === VISIBILITY.mystery && !game.user.isGM;
    const disposition = adhoc ? adhoc.disposition : getDisposition(combatant, mystery);

    const portrait = mystery || adhoc ? null : getPortrait(combatant);

    return {
      type: "combatant",
      id: combatant.id,
      key: options.key ?? `combatant:${combatant.id}`,
      active: options.active,
      delayed: options.delayed,
      roundOffset: Number(options.roundOffset) || 0,
      mystery,
      gmVisibilityMode: visibility.gmMode,
      defeated: Boolean(combatant.defeated),
      disposition,
      adhoc,
      guardBroken: !adhoc && Boolean(getGuardBreakState(combatant)),
      dying: mystery || adhoc ? null : getPF2eDyingState(combatant),
      name: mystery ? localize("GLUNI.Unknown") : adhoc?.name ?? combatant.name,
      initiative: combatant.initiative,
      portrait,
      portraitScaleCap: mystery || adhoc ? 1 : getPortraitScaleCap(portrait),
      portraitFrame: mystery || adhoc ? null : getPortraitFrame(combatant.actor),
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
      card.adhoc ? "gluni-card--adhoc" : "",
      card.adhoc ? `gluni-card--adhoc-${card.adhoc.type}` : "",
      card.guardBroken ? "gluni-card--guard-broken" : "",
      card.dying ? "gluni-card--dying" : "",
      card.dying ? `gluni-card--dying-${card.dying.severity}` : "",
      card.mystery ? "gluni-card--mystery" : "",
      card.defeated ? "gluni-card--defeated" : "",
      `gluni-card--${card.disposition}`,
      game.user.isGM && card.gmVisibilityMode !== VISIBILITY.auto ? `gluni-card--gm-${card.gmVisibilityMode}` : ""
    ].filter(Boolean).join(" ");
    const style = renderCombatantStyle(card);

    return `
      <article class="${classes}" data-gluni-key="${escapeAttr(card.key)}" data-combatant-id="${card.id}" data-round-offset="${card.roundOffset}"${style}>
        <div class="gluni-card-accent" aria-hidden="true"></div>
        <div class="gluni-card-spec" aria-hidden="true"></div>
        <div class="gluni-card-bracket" aria-hidden="true"></div>
        ${game.user.isGM ? this.renderGMVisibilityMarker(card) : ""}
        ${card.adhoc && !card.mystery
          ? `
            <div class="gluni-card-adhoc-repeat" aria-hidden="true">
              ${renderAdhocRepeatText(card.name)}
            </div>
            <div class="gluni-card-adhoc-bg" aria-hidden="true"><i class="${escapeAttr(card.adhoc.icon)}"></i></div>
          `
          : `<div class="gluni-card-portrait-wrap">
              ${card.mystery
                ? `<div class="gluni-card-mystery-mark" aria-hidden="true">?</div>`
                : `<img class="gluni-card-portrait" src="${escapeAttr(card.portrait)}" alt="" loading="lazy" decoding="async">`}
              <div class="gluni-card-glass" aria-hidden="true"></div>
            </div>`}
        ${card.delayed
          ? `
            <div class="gluni-card-delayed-bg" aria-hidden="true"></div>
            <div class="gluni-card-delayed-repeat" aria-hidden="true">
              ${renderDelayedRepeatText(card.name)}
            </div>
          `
          : ""}
        ${card.dying
          ? `
            <div class="gluni-card-dying-bg" aria-hidden="true"></div>
            <div class="gluni-card-dying-repeat" aria-hidden="true">
              ${renderDyingRepeatText(card.dying)}
            </div>
          `
          : ""}
        ${card.guardBroken
          ? `
            <div class="gluni-card-guard-break-bg" aria-hidden="true"></div>
            <div class="gluni-card-guard-break-repeat" aria-hidden="true">
              ${renderGuardBreakRepeatText()}
            </div>
          `
          : ""}
        <div class="gluni-card-content">
          <div class="gluni-card-kicker">
            ${card.active ? `<span class="gluni-active-tag">TURN</span>` : ""}
            ${card.guardBroken ? `<span class="gluni-guard-break-tag">${localize("GLUNI.GuardBreak").toUpperCase()}</span>` : ""}
            ${card.dying ? `<span class="gluni-dying-tag">${localize("GLUNI.Dying").toUpperCase()} ${card.dying.value}</span>` : ""}
            ${card.adhoc ? `<span class="gluni-adhoc-tag">${escapeHTML(card.adhoc.label).toUpperCase()}</span>` : ""}
            ${card.adhoc?.oneShot ? `<span class="gluni-adhoc-tag gluni-adhoc-tag--oneshot">${localize("GLUNI.AdHoc.OneShot").toUpperCase()} ${formatRound(card.adhoc.round)}</span>` : ""}
            ${card.delayed ? `<span class="gluni-delayed-tag">${localize("GLUNI.Delayed").toUpperCase()}</span>` : ""}
          </div>
          <h3>${escapeHTML(card.name)}</h3>
          ${card.dying ? renderDyingPips(card.dying) : ""}
        </div>
        <span class="gluni-initiative-badge">${formatInitiative(card.initiative)}</span>
        ${card.active ? `<div class="gluni-card-holo" aria-hidden="true"></div><div class="gluni-card-sheen" aria-hidden="true"></div>` : ""}
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
        <button type="button" data-action="addAdhoc" title="${localize("GLUNI.AdHoc.Add")}" aria-label="${localize("GLUNI.AdHoc.Add")}">
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
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
        ${!card.adhoc ? `
          <button class="${card.guardBroken ? "is-selected" : ""}" type="button" data-action="guardBreak" title="${card.guardBroken ? localize("GLUNI.Controls.ClearGuardBreak") : localize("GLUNI.Controls.GuardBreak")}" aria-label="${card.guardBroken ? localize("GLUNI.Controls.ClearGuardBreak") : localize("GLUNI.Controls.GuardBreak")}">
            <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
          </button>
        ` : ""}
        ${card.adhoc ? `
          <button type="button" data-action="deleteAdhoc" title="${localize("GLUNI.AdHoc.Delete")}" aria-label="${localize("GLUNI.AdHoc.Delete")}">
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        ` : ""}
      </div>
    `;
  }

  renderDelayedSection(delayedCards) {
    if (!delayedCards.length) return "";

    return `
      <section class="gluni-delayed-section">
        <div class="gluni-delayed-heading">
          <span class="gluni-delayed-tick" aria-hidden="true"></span>
          <span>&mdash; ${localize("GLUNI.Delayed").toUpperCase()}</span>
        </div>
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
    const roundDelta = Number(options.roundDelta) || 0;
    const intensity = options.intensity ?? "default";
    const flipItems = [];
    let newActive = null;

    for (const item of items) {
      const isActive = item.classList.contains("gluni-card--active");
      if (isActive) newActive = item;

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

    // ---- Magic-move hand-off: the card morphs from its small rail size into the active
    // size purely via the FLIP transform above. No slam, shake, shockwave, or swipe — just
    // a smooth count-up of the initiative badge to finish the beat. ----
    if (newActive) {
      const badge = newActive.querySelector(".gluni-initiative-badge");
      if (badge) {
        const animate = intensity !== "reduced" && !options.isDelayReturn;
        this.animateBadgeCountUp(badge, options.previousActiveInitiative, badge.textContent, !animate);
      }
    }
  }

  getContinuityRect(oldRects, key, roundDelta = 0) {
    const direct = oldRects.get(key);
    if (direct || roundDelta <= 0 || !key) return direct;

    const combatantMatch = key.match(/^combatant:([^:]+):round:(\d+)$/);
    if (combatantMatch) {
      const [, id, roundOffset] = combatantMatch;
      return oldRects.get(`combatant:${id}:round:${Number(roundOffset) + roundDelta}`) ?? null;
    }

    const separatorMatch = key.match(/^separator:(\d+):offset:(\d+)$/);
    if (separatorMatch) {
      const [, round, roundOffset] = separatorMatch;
      return oldRects.get(`separator:${round}:offset:${Number(roundOffset) + roundDelta}`) ?? null;
    }

    return null;
  }

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
        if (cinematic) this.createShockwave(activeEl);
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

    if (action === "addAdhoc") {
      if (!game.user.isGM) return;
      this.openAdhocDialog();
      return;
    }

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

    if (action === "deleteAdhoc") {
      if (!isAdhocCombatant(combatant)) return;
      await this.deleteAdhocCombatant(combatant);
      return;
    }

    if (action === "delay") {
      const edge = game.settings.get(MODULE_ID, SETTINGS.edge) || "right";
      const cardEl = this.root?.querySelector(`.gluni-card[data-combatant-id="${escapeCSSIdentifier(combatant.id)}"]`);
      if (cardEl) {
        this.createStatusFlashGhost(cardEl, localize("GLUNI.Delayed").toUpperCase(), "delay", edge);
      }
      this.pendingSlideInIds.add(combatant.id);
      this.statusAnimationRecentlyQueued(combatant.id, "delay");
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
      return;
    }

    if (action === "guardBreak") {
      if (getGuardBreakState(combatant)) await this.clearGuardBreak(combatant);
      else await this.applyGuardBreak(combatant);
    }
  }

  onContextMenu(event) {
    if (!game.user.isGM) return;

    const card = event.target.closest(".gluni-card[data-combatant-id]");
    if (!card || !this.root.contains(card)) return;
    if (event.target.closest("button, input, select, textarea, .gluni-card-controls")) return;

    const combatant = this.combat?.combatants?.get(card.dataset.combatantId);
    if (!combatant) return;

    event.preventDefault();
    event.stopPropagation();
    this.openInitiativeContextMenu(combatant, event);
  }

  openAdhocDialog() {
    const combat = this.combat;
    if (!game.user.isGM || !combat?.started) return;

    openAdhocInitiativeDialog({
      combat,
      onCreate: data => this.createAdhocCombatant(data)
    });
  }

  async createAdhocCombatant(data) {
    const combat = this.combat;
    if (!game.user.isGM || !combat?.started) return null;

    const payload = normalizeAdhocPayload(data, combat);
    const flags = {
      [MODULE_ID]: {
        [FLAGS.adhoc]: {
          name: payload.name,
          type: payload.type,
          icon: payload.icon,
          lifecycle: payload.lifecycle,
          round: payload.round
        },
        [FLAGS.visibility]: payload.visibility
      }
    };
    const combatantData = {
      name: payload.name,
      img: FALLBACK_PORTRAIT,
      hidden: payload.visibility !== VISIBILITY.visible,
      initiative: payload.initiative,
      flags
    };

    try {
      const [combatant] = await combat.createEmbeddedDocuments("Combatant", [combatantData]);
      await this.applyCombatantInitiative(combatant, payload.initiative);
      this.broadcastRefresh();
      return combatant;
    } catch (error) {
      return this.createActorBackedAdhocCombatant(payload, flags, error);
    }
  }

  async createActorBackedAdhocCombatant(payload, flags, originalError) {
    const combat = this.combat;
    if (!globalThis.Actor || !combat?.started) throw originalError;

    let actor = null;
    try {
      actor = await Actor.create({
        name: payload.name,
        type: getAdhocActorType(),
        img: FALLBACK_PORTRAIT,
        flags: {
          [MODULE_ID]: {
            [FLAGS.adhocActor]: true
          }
        }
      }, { renderSheet: false });

      const [combatant] = await combat.createEmbeddedDocuments("Combatant", [{
        actorId: actor.id,
        hidden: payload.visibility !== VISIBILITY.visible,
        initiative: payload.initiative,
        flags
      }]);
      await this.applyCombatantInitiative(combatant, payload.initiative);
      this.broadcastRefresh();
      return combatant;
    } catch (error) {
      if (actor?.delete) await actor.delete().catch(() => {});
      console.error(`${MODULE_ID} | Failed to create ad hoc initiative combatant`, error, originalError);
      throw error;
    }
  }

  async applyCombatantInitiative(combatant, initiative) {
    if (!combatant || !Number.isFinite(initiative)) return;
    if (typeof this.combat?.setInitiative === "function") {
      await this.combat.setInitiative(combatant.id, initiative);
      return;
    }
    await combatant.update({ initiative });
  }

  async deleteAdhocCombatant(combatant, options = {}) {
    const shouldConfirm = options.confirm !== false;
    const confirmed = !shouldConfirm || await confirmAdhocDelete(combatant);
    if (!confirmed) return;

    const actor = combatant.actor;
    const deleteActor = Boolean(actor?.getFlag?.(MODULE_ID, FLAGS.adhocActor));
    await combatant.delete();
    if (deleteActor) await actor.delete().catch(() => {});
    this.broadcastRefresh();
  }

  async changeTurn(direction, combat = this.combat) {
    if (!combat?.started) return;
    const outgoingCombatant = combat.combatant;
    const outgoingRound = combat.round ?? 1;

    if (direction > 0 && typeof combat.nextTurn === "function") await combat.nextTurn();
    else if (direction < 0 && typeof combat.previousTurn === "function") await combat.previousTurn();
    else await this.updateTurnFallback(direction, combat);

    if (direction > 0 && isDueOneShotAdhoc(outgoingCombatant, outgoingRound)) {
      await this.deleteAdhocCombatant(outgoingCombatant, { confirm: false });
    }

    if (direction > 0) await this.skipInactiveAdhocTurns(combat);

    this.broadcastRefresh();
  }

  skipInactiveAdhocTurnSoon() {
    window.clearTimeout(this.adhocSkipTimer);
    this.adhocSkipTimer = window.setTimeout(() => this.skipInactiveAdhocTurns(), 40);
  }

  async skipInactiveAdhocTurns(combat = this.combat) {
    if (!game.user.isGM || !combat?.started || !this.isPrimaryActiveGM()) return;

    const turns = Array.from(combat.turns ?? []);
    const maxSkips = Math.max(turns.length, 1);
    let skipped = 0;

    while (skipped < maxSkips) {
      const combatant = combat.combatant;
      const adhoc = getAdhocData(combatant);
      const round = combat.round ?? 1;
      if (!adhoc?.oneShot) break;
      if (adhoc.round < round) {
        await this.deleteAdhocCombatant(combatant, { confirm: false });
        break;
      }
      if (adhoc.round === round) break;

      skipped += 1;
      if (typeof combat.nextTurn === "function") await combat.nextTurn();
      else await this.updateTurnFallback(1, combat);
    }

    if (skipped) this.broadcastRefresh();
  }

  async updateTurnFallback(direction, combat = this.combat) {
    const turns = Array.from(combat?.turns ?? []);
    if (!combat?.started || !turns.length) return;

    const currentTurn = Number.isInteger(combat.turn) ? combat.turn : 0;
    const nextTurn = modulo(currentTurn + direction, turns.length);
    await combat.update({ turn: nextTurn });
  }

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
        requestId: `${game.user.id}:${combat.id}:${combatant.id}:${Date.now()}`,
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

  async onSocketEndTurnRequest(data) {
    if (!game.user.isGM || !data?.combatId || !data?.combatantId || !data?.userId) return;

    const requestId = data.requestId || `${data.userId}:${data.combatId}:${data.combatantId}`;
    if (this.handledEndTurnRequests.has(requestId)) return;
    this.handledEndTurnRequests.add(requestId);
    window.setTimeout(() => this.handledEndTurnRequests.delete(requestId), 10000);

    const gmRank = this.getActiveGMRank();
    if (gmRank > 0) await wait(gmRank * 180);

    const combat = this.getCombatById(data.combatId);
    if (!combat?.started || combat.id !== data.combatId) return;
    if (combat.combatant?.id !== data.combatantId) return;

    const requestingUser = game.users?.get(data.userId);
    if (!requestingUser || !this.userOwnsCombatant(combat.combatant, requestingUser)) return;

    await this.changeTurn(1, combat);
  }

  getCombatById(combatId) {
    if (this.combat?.id === combatId) return this.combat;

    const direct = game.combats?.get?.(combatId);
    if (direct) return direct;

    const combats = game.combats?.contents ?? Array.from(game.combats ?? []);
    return Array.from(combats)
      .map(entry => Array.isArray(entry) ? entry[1] : entry)
      .find(combat => combat?.id === combatId) ?? null;
  }

  isPrimaryActiveGM() {
    if (!game.user.isGM) return false;

    const activeGMs = this.getActiveGMs();
    return (activeGMs[0]?.id ?? game.user.id) === game.user.id;
  }

  getActiveGMRank() {
    if (!game.user.isGM) return -1;
    const activeGMs = this.getActiveGMs();
    const rank = activeGMs.findIndex(user => user.id === game.user.id);
    return rank >= 0 ? rank : 0;
  }

  getActiveGMs() {
    const users = game.users?.contents ?? Array.from(game.users ?? []);
    return Array.from(users)
      .map(entry => Array.isArray(entry) ? entry[1] : entry)
      .filter(user => user?.active && user.isGM)
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
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

    const turns = Array.from(combat.turns ?? []);
    const currentIndex = turns.findIndex(turn => turn.id === current.id);
    if (currentIndex < 0) return;

    const before = currentIndex > 0 ? turns[currentIndex - 1] : null;
    const targetInitiative = chooseInitiativeBetween({
      before: before?.initiative,
      after: current.initiative,
      existing: getUsedInitiatives(combat, combatant.id)
    });

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

  async applyPF2eGuardBreakEffect(combatant) {
    if (game.system?.id !== "pf2e" || !game.user.isGM) return;
    const actor = combatant?.actor;
    if (!actor?.createEmbeddedDocuments) return;
    if (findPF2eGuardBreakEffects(actor).length) return;

    const effectData = {
      type: "effect",
      name: localize("GLUNI.PF2e.BreakEffect.Name"),
      img: "icons/svg/downgrade.svg",
      system: {
        slug: PF2E_GUARD_BREAK_EFFECT_SLUG,
        description: { value: localize("GLUNI.PF2e.BreakEffect.Description") },
        tokenIcon: { show: true },
        duration: { value: -1, unit: "unlimited", expiry: null, sustained: false },
        rules: [
          { key: "FlatModifier", selector: "ac", type: "status", value: -PF2E_GUARD_BREAK_PENALTY },
          { key: "FlatModifier", selector: "saving-throw", type: "status", value: -PF2E_GUARD_BREAK_PENALTY }
        ]
      },
      flags: { [MODULE_ID]: { guardBreak: true } }
    };

    try {
      await actor.createEmbeddedDocuments("Item", [effectData]);
    } catch (error) {
      console.warn(`${MODULE_ID} | Failed to apply PF2e break effect`, error);
    }
  }

  async removePF2eGuardBreakEffect(combatant) {
    if (game.system?.id !== "pf2e" || !game.user.isGM) return;
    const actor = combatant?.actor;
    if (!actor?.deleteEmbeddedDocuments) return;

    const ids = findPF2eGuardBreakEffects(actor).map(effect => effect.id);
    if (!ids.length) return;

    try {
      await actor.deleteEmbeddedDocuments("Item", ids);
    } catch (error) {
      console.warn(`${MODULE_ID} | Failed to remove PF2e break effect`, error);
    }
  }

  async removeAllPF2eGuardBreakEffects(combat) {
    if (game.system?.id !== "pf2e" || !game.user.isGM || !combat) return;
    const combatants = Array.from(combat.combatants ?? []);
    await Promise.allSettled(combatants.map(combatant => this.removePF2eGuardBreakEffect(combatant)));
  }

  async applyGuardBreak(combatant) {
    const combat = this.combat;
    if (!game.user.isGM || !combat?.started || !combatant || isAdhocCombatant(combatant)) return;

    const activeId = combat.combatant?.id ?? null;
    const wasActive = activeId === combatant.id;
    const edge = game.settings.get(MODULE_ID, SETTINGS.edge) || "right";

    const cardEl = this.root?.querySelector(`.gluni-card[data-combatant-id="${escapeCSSIdentifier(combatant.id)}"]`);
    if (cardEl) {
      this.createStatusFlashGhost(cardEl, localize("GLUNI.GuardBreak").toUpperCase(), "break", edge);
    }
    this.pendingSlideInIds.add(combatant.id);
    this.statusAnimationRecentlyQueued(combatant.id, "guardBreak");
    this.showBreakSplash(combatant.name);

    const payload = {
      round: combat.round ?? 1,
      anchorCombatantId: activeId,
      appliedTurn: Number.isInteger(combat.turn) ? combat.turn : null,
      appliedAt: Date.now()
    };

    await combatant.setFlag(MODULE_ID, FLAGS.guardBroken, payload);
    await combatant.unsetFlag(MODULE_ID, FLAGS.manualDelayed);
    await this.clearKnownPF2eDelayFlags(combatant);
    await this.applyPF2eGuardBreakEffect(combatant);
    await this.moveGuardBrokenCombatantBeforeActive(combatant, activeId);
    this.queueGuardBreakImpact({ combatId: combat.id, combatantId: combatant.id });
    this.broadcastGuardBreakImpact(combatant.id);

    if (wasActive) await this.changeTurn(1);
    else this.broadcastRefresh();
  }

  async clearGuardBreak(combatant) {
    if (!game.user.isGM || !combatant || !getGuardBreakState(combatant)) return;
    await combatant.unsetFlag(MODULE_ID, FLAGS.guardBroken);
    await this.removePF2eGuardBreakEffect(combatant);
    this.broadcastRefresh();
  }

  async moveGuardBrokenCombatantBeforeActive(combatant, activeId) {
    const combat = this.combat;
    const current = combat?.combatant;
    if (!combat?.started || !current || !combatant) return;

    const turns = Array.from(combat.turns ?? []);
    const currentIndex = turns.findIndex(turn => turn.id === current.id);
    if (currentIndex < 0) return;

    const before = currentIndex > 0 ? turns[currentIndex - 1] : null;
    const targetInitiative = chooseInitiativeBetween({
      before: before?.initiative,
      after: current.initiative,
      existing: getUsedInitiatives(combat, combatant.id)
    });

    await this.applyCombatantInitiative(combatant, targetInitiative);
    if (activeId) await this.restoreActiveTurn(activeId);
  }

  clearActiveGuardBreakSoon() {
    window.clearTimeout(this.guardBreakClearTimer);
    this.guardBreakClearTimer = window.setTimeout(() => this.clearActiveGuardBreak(), 50);
  }

  async clearActiveGuardBreak() {
    const combat = this.combat;
    const combatant = combat?.combatant;
    if (!game.user.isGM || !combat?.started || !combatant || !this.isPrimaryActiveGM()) return;

    const state = getGuardBreakState(combatant);
    if (!state) return;
    if (state.anchorCombatantId === combatant.id && state.round === (combat.round ?? 1)) return;

    await combatant.unsetFlag(MODULE_ID, FLAGS.guardBroken);
    await this.removePF2eGuardBreakEffect(combatant);
    this.broadcastRefresh();
  }

  queueGuardBreakImpact(data) {
    if (!data?.combatantId) return;
    if (data.combatId && this.combat?.id !== data.combatId) return;
    this.pendingGuardBreakImpactId = data.combatantId;
    this.renderSoon();
  }

  playPendingGuardBreakImpact() {
    const combatantId = this.pendingGuardBreakImpactId;
    if (!combatantId || !this.root) return;
    this.pendingGuardBreakImpactId = null;

    window.requestAnimationFrame(() => {
      const card = this.root?.querySelector(`.gluni-card[data-combatant-id="${escapeCSSIdentifier(combatantId)}"]`);
      if (!card) return;
      card.classList.remove("gluni-card--guard-break-impact");
      void card.offsetWidth;
      card.classList.add("gluni-card--guard-break-impact");
      this.pulseTagEnter(card, ".gluni-guard-break-tag");
      window.setTimeout(() => card.classList.remove("gluni-card--guard-break-impact"), 760);
    });
  }

  broadcastGuardBreakImpact(combatantId) {
    if (!game.socket || !combatantId) return;
    game.socket.emit(SOCKET_NAME, {
      type: "guardBreakImpact",
      combatId: this.combat?.id,
      combatantId
    });
  }

  showBreakSplash(name) {
    if (!this.enabled || !name) return;

    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default";
    const fidelity = getVisualFidelity();
    const breakText = localize("GLUNI.GuardBreak").toUpperCase();
    const letterSpans = Array.from(breakText).map(letter =>
      letter === " " ? `<span class="d"> </span>` : `<span class="d">${escapeHTML(letter)}</span>`
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

  getBreakSplashHold() {
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
    if (intensity === "reduced") return 440;
    if (intensity === "cinematic") return 1600;
    return 1200;
  }

  getBreakSplashDuration() {
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
    if (intensity === "reduced") return 960;
    if (intensity === "cinematic") return 2400;
    return 1860;
  }

  broadcastBreakSplash(name) {
    if (!game.socket || !name) return;
    game.socket.emit(SOCKET_NAME, { type: "breakSplash", name });
  }

  queueStatusAnimation(data) {
    if (!data?.combatantId || data.senderId === game.user.id) return;
    if (data.combatId && this.combat?.id !== data.combatId) return;

    const status = STATUS_ANIMATION[data.kind];
    if (!status) return;
    if (this.statusAnimationRecentlyQueued(data.combatantId, data.kind)) return;

    if (status.motion === "slide") {
      this.pendingSlideInIds.add(data.combatantId);
      this.pendingStatusFlashes.set(data.combatantId, data.kind);
    } else if (status.motion === "dying") {
      this.pendingDyingWipeIds.add(data.combatantId);
    }

    this.renderSoon();
  }

  broadcastStatusAnimation(combatantId, kind) {
    if (!game.socket || !combatantId || !STATUS_ANIMATION[kind]) return;
    game.socket.emit(SOCKET_NAME, {
      type: "statusAnimation",
      combatId: this.combat?.id,
      combatantId,
      kind,
      senderId: game.user.id
    });
  }

  statusAnimationRecentlyQueued(combatantId, kind) {
    const now = Date.now();
    for (const [key, timestamp] of this.recentStatusAnimations) {
      if (now - timestamp > 1500) this.recentStatusAnimations.delete(key);
    }

    const key = `${combatantId}:${kind}`;
    const lastQueuedAt = this.recentStatusAnimations.get(key) ?? 0;
    if (now - lastQueuedAt < 1200) return true;

    this.recentStatusAnimations.set(key, now);
    return false;
  }

  async setVisibility(combatant, mode) {
    if (mode === VISIBILITY.auto) await combatant.unsetFlag(MODULE_ID, FLAGS.visibility);
    else await combatant.setFlag(MODULE_ID, FLAGS.visibility, mode);
    this.broadcastRefresh();
  }

  onPointerDown(event) {
    const handle = event.target.closest(".gluni-drag-handle");
    if (handle && this.root.contains(handle)) {
      this.startTrackerDrag(event);
      return;
    }

    if (!game.user.isGM) return;
    if (event.button !== 0) return;
    if (event.target.closest("button, input, select, textarea, .gluni-card-controls")) return;

    const card = event.target.closest(".gluni-rail .gluni-card[data-combatant-id]");
    if (!card || !this.root.contains(card)) return;
    this.startCardDrag(event, card);
  }

  startTrackerDrag(event) {
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

  startCardDrag(event, card) {
    const combatant = this.combat?.combatants?.get(card.dataset.combatantId);
    if (!combatant) return;
    const railCards = Array.from(this.root?.querySelectorAll(".gluni-rail .gluni-card[data-combatant-id]") ?? []);
    const originalIndex = railCards.indexOf(card);

    event.preventDefault();
    this.closeInitiativeContextMenu();
    card.setPointerCapture?.(event.pointerId);

    this.cardDrag = {
      combatantId: combatant.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      originalBeforeId: railCards[originalIndex - 1]?.dataset.combatantId ?? null,
      originalAfterId: railCards[originalIndex + 1]?.dataset.combatantId ?? null,
      card
    };

    this.root.classList.add("gluni-initiative--card-dragging");
    card.classList.add("gluni-card--dragging");
    window.addEventListener("pointermove", this.onCardPointerMove);
    window.addEventListener("pointerup", this.onCardPointerUp, { once: true });
    window.addEventListener("pointercancel", this.onCardPointerCancel, { once: true });
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
  };

  onCardPointerMove = event => {
    if (!this.cardDrag) return;

    const distance = Math.hypot(event.clientX - this.cardDrag.startX, event.clientY - this.cardDrag.startY);
    if (distance > 4) this.cardDrag.moved = true;
    if (!this.cardDrag.moved) return;

    this.cardDrag.card.style.setProperty("--gluni-card-drag-y", `${Math.round(event.clientY - this.cardDrag.startY)}px`);
    this.updateCardDropMarker(event.clientY);
  };

  onCardPointerUp = async event => {
    const drag = this.cardDrag;
    if (!drag) return;

    const target = drag.moved ? this.getCardDropTarget(event.clientY) : null;
    this.finishCardDrag();

    if (!target) return;
    if (target.beforeId === drag.originalBeforeId && target.afterId === drag.originalAfterId) return;

    const combatant = this.combat?.combatants?.get(drag.combatantId);
    if (!combatant) return;

    await this.moveCombatantBetween(combatant, target.beforeId, target.afterId);
  };

  onCardPointerCancel = () => {
    this.finishCardDrag();
  };

  finishCardDrag() {
    if (!this.cardDrag) return;

    window.removeEventListener("pointermove", this.onCardPointerMove);
    this.clearCardDropMarkers();
    this.cardDrag.card.classList.remove("gluni-card--dragging");
    this.cardDrag.card.style.removeProperty("--gluni-card-drag-y");
    this.root.classList.remove("gluni-initiative--card-dragging");
    this.cardDrag = null;
  }

  updateCardDropMarker(clientY) {
    this.clearCardDropMarkers();
    const target = this.getCardDropTarget(clientY);
    if (!target?.marker) return;
    target.marker.classList.add(target.position === "before" ? "gluni-card--drop-before" : "gluni-card--drop-after");
  }

  clearCardDropMarkers() {
    for (const card of this.root?.querySelectorAll(".gluni-card--drop-before, .gluni-card--drop-after") ?? []) {
      card.classList.remove("gluni-card--drop-before", "gluni-card--drop-after");
    }
  }

  getCardDropTarget(clientY) {
    const draggedId = this.cardDrag?.combatantId;
    const cards = Array.from(this.root?.querySelectorAll(".gluni-rail .gluni-card[data-combatant-id]") ?? [])
      .filter(card => card.dataset.combatantId !== draggedId);
    if (!cards.length) return null;

    let insertIndex = cards.findIndex(card => clientY < card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2);
    if (insertIndex < 0) insertIndex = cards.length;

    const beforeCard = cards[insertIndex - 1] ?? null;
    const afterCard = cards[insertIndex] ?? null;
    const marker = afterCard ?? beforeCard;
    const position = afterCard ? "before" : "after";

    return {
      beforeId: beforeCard?.dataset.combatantId ?? null,
      afterId: afterCard?.dataset.combatantId ?? null,
      marker,
      position
    };
  }

  async moveCombatantBetween(combatant, beforeId, afterId) {
    const combat = this.combat;
    if (!combat?.started || !combatant) return;

    const before = beforeId ? combat.combatants?.get(beforeId) : null;
    const after = afterId ? combat.combatants?.get(afterId) : null;
    if (!before && !after) return;

    const activeId = combat.combatant?.id ?? null;
    const initiative = chooseInitiativeBetween({
      before: before?.initiative,
      after: after?.initiative,
      existing: getUsedInitiatives(combat, combatant.id)
    });

    await this.applyCombatantInitiative(combatant, initiative);
    await this.restoreActiveTurn(activeId);
    this.broadcastRefresh();
  }

  async restoreActiveTurn(activeId) {
    if (!activeId) return;
    const activeIndex = Array.from(this.combat?.turns ?? []).findIndex(turn => turn.id === activeId);
    if (activeIndex >= 0 && this.combat?.turn !== activeIndex) await this.combat.update({ turn: activeIndex });
  }

  openInitiativeContextMenu(combatant, event) {
    this.closeInitiativeContextMenu();

    const currentInitiative = Number(combatant.initiative);
    const menu = document.createElement("form");
    menu.className = "gluni-context-menu";
    menu.innerHTML = `
      <label class="gluni-context-field">
        <span>${localize("GLUNI.Controls.AdjustInitiative")}</span>
        <input type="number" name="initiative" step="0.1" value="${escapeAttr(Number.isFinite(currentInitiative) ? formatInitiative(currentInitiative) : "")}" autofocus>
      </label>
      <div class="gluni-context-actions">
        <button type="button" data-context-action="decrease" title="${localize("GLUNI.Controls.DecreaseInitiative")}" aria-label="${localize("GLUNI.Controls.DecreaseInitiative")}">
          <i class="fa-solid fa-minus" aria-hidden="true"></i>
        </button>
        <button type="submit" data-context-action="apply">${localize("GLUNI.Controls.Apply").toUpperCase()}</button>
        <button type="button" data-context-action="increase" title="${localize("GLUNI.Controls.IncreaseInitiative")}" aria-label="${localize("GLUNI.Controls.IncreaseInitiative")}">
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
      </div>
    `;

    document.body.appendChild(menu);
    const menuRect = menu.getBoundingClientRect();
    const left = clamp(event.clientX, 6, window.innerWidth - menuRect.width - 6);
    const top = clamp(event.clientY, 6, window.innerHeight - menuRect.height - 6);
    menu.style.left = `${Math.round(left)}px`;
    menu.style.top = `${Math.round(top)}px`;

    const input = menu.querySelector("input[name='initiative']");
    const applyValue = async value => {
      const activeId = this.combat?.combatant?.id ?? null;
      const initiative = makeUniqueInitiative(value, getUsedInitiatives(this.combat, combatant.id));
      await this.applyCombatantInitiative(combatant, initiative);
      await this.restoreActiveTurn(activeId);
      this.closeInitiativeContextMenu();
      this.broadcastRefresh();
    };

    menu.addEventListener("submit", async submitEvent => {
      submitEvent.preventDefault();
      const value = Number(input?.value);
      if (Number.isFinite(value)) await applyValue(value);
    });

    menu.addEventListener("click", async clickEvent => {
      const action = clickEvent.target.closest("[data-context-action]")?.dataset.contextAction;
      if (action !== "increase" && action !== "decrease") return;
      clickEvent.preventDefault();
      const base = Number(input?.value);
      const next = (Number.isFinite(base) ? base : currentInitiative || 0) + (action === "increase" ? 1 : -1);
      await applyValue(next);
    });

    const closeOnOutside = closeEvent => {
      if (menu.contains(closeEvent.target)) return;
      this.closeInitiativeContextMenu();
    };
    window.setTimeout(() => {
      if (this.contextMenu?.element !== menu) return;
      document.addEventListener("pointerdown", closeOnOutside);
      document.addEventListener("contextmenu", closeOnOutside);
    }, 0);

    this.contextMenu = { element: menu, closeOnOutside };
    input?.focus();
    input?.select();
  }

  closeInitiativeContextMenu() {
    if (this.contextMenu?.closeOnOutside) {
      document.removeEventListener("pointerdown", this.contextMenu.closeOnOutside);
      document.removeEventListener("contextmenu", this.contextMenu.closeOnOutside);
    }
    this.contextMenu?.element?.remove();
    this.contextMenu = null;
  }

  applyPosition(edge) {
    const position = game.settings.get(MODULE_ID, SETTINGS.position) ?? {};
    const hasCustomX = Number.isFinite(position.x);
    const y = Number.isFinite(position.y) ? position.y : 120;
    const next = {
      top: `${y}px`,
      left: hasCustomX || edge === "left" ? `${hasCustomX ? position.x : 18}px` : "",
      right: hasCustomX || edge === "left" ? "auto" : "18px"
    };

    if (
      this.lastPositionStyle?.top === next.top &&
      this.lastPositionStyle?.left === next.left &&
      this.lastPositionStyle?.right === next.right
    ) return;

    this.root.style.top = next.top;
    this.root.style.left = next.left;
    this.root.style.right = next.right;
    this.lastPositionStyle = next;
  }

  applyUIScale(scale) {
    this.root?.style.setProperty("--gluni-ui-scale", String(scale || 1));
  }

  showRoundSplash(round) {
    if (!this.enabled || !round) return;
    if (this.lastSplashRound === round) return;
    this.lastSplashRound = round;

    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default";
    const fidelity = getVisualFidelity();
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

  getRoundSplashHold() {
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
    if (intensity === "reduced") return 300;
    if (intensity === "cinematic") return 940;
    return 760;
  }

  getRoundSplashDuration() {
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity);
    if (intensity === "reduced") return 820;
    if (intensity === "cinematic") return 1500;
    return 1240;
  }

  broadcastRefresh() {
    this.renderSoon();
    if (game.socket) game.socket.emit(SOCKET_NAME, { type: "refresh" });
  }

  playStatusFlash(card, text, colorClass) {
    return new Promise(resolve => {
      const flash = document.createElement("div");
      flash.className = `gluni-status-flash gluni-status-flash--${colorClass}`;
      flash.innerHTML = `<span>${escapeHTML(text)}</span>`;
      card.appendChild(flash);
      window.requestAnimationFrame(() => flash.classList.add("gluni-status-flash--go"));
      window.setTimeout(() => {
        flash.remove();
        resolve();
      }, 560);
    });
  }

  playInlineStatusFlash(card, text, colorClass) {
    const flash = document.createElement("div");
    flash.className = `gluni-status-flash gluni-status-flash--${colorClass}`;
    flash.innerHTML = `<span>${escapeHTML(text)}</span>`;
    card.appendChild(flash);
    window.requestAnimationFrame(() => flash.classList.add("gluni-status-flash--go"));
    window.setTimeout(() => flash.remove(), 620);
  }

  // One-shot "stamp" entrance for a status tag chip when its status is first applied.
  pulseTagEnter(card, selector) {
    const tag = card?.querySelector?.(selector);
    if (!tag) return;
    tag.classList.remove("gluni-tag--enter");
    void tag.offsetWidth;
    tag.classList.add("gluni-tag--enter");
    window.setTimeout(() => tag.classList.remove("gluni-tag--enter"), 480);
  }

  createStatusSlideGhost(card, edge) {
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.querySelector(".gluni-card-controls")?.remove();
    ghost.querySelector(".gluni-card-sheen")?.remove();
    ghost.querySelector(".gluni-status-flash")?.remove();
    ghost.classList.add("gluni-status-slide-ghost");
    ghost.style.position = "fixed";
    ghost.style.left = `${Math.round(rect.left)}px`;
    ghost.style.top = `${Math.round(rect.top)}px`;
    ghost.style.width = `${Math.round(rect.width)}px`;
    ghost.style.height = `${Math.round(rect.height)}px`;
    ghost.style.zIndex = "71";
    ghost.style.margin = "0";
    document.body.appendChild(ghost);
    window.requestAnimationFrame(() => {
      ghost.classList.add(edge === "left" ? "gluni-status-slide-ghost--go-left" : "gluni-status-slide-ghost--go-right");
    });
    window.setTimeout(() => ghost.remove(), 320);
  }

  createStatusFlashGhost(card, text, colorClass, edge) {
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.querySelector(".gluni-card-controls")?.remove();
    ghost.querySelector(".gluni-card-sheen")?.remove();
    ghost.querySelector(".gluni-status-flash")?.remove();
    ghost.classList.add("gluni-status-slide-ghost");
    const intensity = game.settings.get(MODULE_ID, SETTINGS.animationIntensity) || "default";
    if (intensity !== "default") ghost.classList.add(`gluni-status-slide-ghost--${intensity}`);
    ghost.style.position = "fixed";
    ghost.style.left = `${Math.round(rect.left)}px`;
    ghost.style.top = `${Math.round(rect.top)}px`;
    ghost.style.width = `${Math.round(rect.width)}px`;
    ghost.style.height = `${Math.round(rect.height)}px`;
    ghost.style.zIndex = "71";
    ghost.style.margin = "0";
    const flash = document.createElement("div");
    flash.className = `gluni-status-flash gluni-status-flash--${colorClass}`;
    flash.innerHTML = `<span>${escapeHTML(text)}</span>`;
    ghost.appendChild(flash);
    document.body.appendChild(ghost);
    window.requestAnimationFrame(() => flash.classList.add("gluni-status-flash--go"));
    const flashDuration = intensity === "cinematic" ? 680 : intensity === "reduced" ? 420 : 560;
    const slideDuration = intensity === "cinematic" ? 420 : intensity === "reduced" ? 240 : 320;
    window.setTimeout(() => {
      flash.remove();
      ghost.classList.add(edge === "left" ? "gluni-status-slide-ghost--go-left" : "gluni-status-slide-ghost--go-right");
      window.setTimeout(() => ghost.remove(), slideDuration);
    }, flashDuration);
  }

  playPendingSlideIns() {
    if (!this.pendingSlideInIds.size || !this.root) return;
    for (const id of this.pendingSlideInIds) {
      const card = this.root.querySelector(`.gluni-card[data-combatant-id="${escapeCSSIdentifier(id)}"]`);
      if (!card) {
        this.pendingStatusFlashes.delete(id);
        continue;
      }
      const statusKind = this.pendingStatusFlashes.get(id);
      const status = STATUS_ANIMATION[statusKind];
      if (status) this.playInlineStatusFlash(card, localize(status.label).toUpperCase(), status.colorClass);
      if (statusKind === "delay") this.pulseTagEnter(card, ".gluni-delayed-tag");
      this.pendingStatusFlashes.delete(id);
      card.classList.add("gluni-card--slide-in");
      window.setTimeout(() => card.classList.remove("gluni-card--slide-in"), 400);
    }
    this.pendingSlideInIds.clear();
  }

  playPendingDyingWipes() {
    if (!this.pendingDyingWipeIds.size || !this.root) return;
    for (const id of this.pendingDyingWipeIds) {
      const card = this.root.querySelector(`.gluni-card[data-combatant-id="${escapeCSSIdentifier(id)}"]`);
      if (!card || !card.classList.contains("gluni-card--dying")) continue;
      card.classList.add("gluni-card--dying-entering");
      this.playInlineStatusFlash(card, localize("GLUNI.Dying").toUpperCase(), "dying");
      this.pulseTagEnter(card, ".gluni-dying-tag");
      window.setTimeout(() => card.classList.remove("gluni-card--dying-entering"), 640);
    }
    this.pendingDyingWipeIds.clear();
  }

  detectStatusTransitions(view) {
    const hadSnapshot = this.statusSnapshotInitialized;
    const currentDying = new Set();
    const currentDelayed = new Set();
    const currentBroken = new Set();
    const allCards = [...view.normal, ...view.delayed];
    for (const item of allCards) {
      if (item.type !== "combatant") continue;
      if (item.dying) currentDying.add(item.id);
      if (item.delayed) currentDelayed.add(item.id);
      if (item.guardBroken) currentBroken.add(item.id);
    }
    for (const id of currentDying) {
      if (this.lastDyingIds.has(id)) continue;

      const queuedLocally = !this.statusAnimationRecentlyQueued(id, "dying");
      if (queuedLocally) this.pendingDyingWipeIds.add(id);
      if (queuedLocally && hadSnapshot && game.user.isGM && this.isPrimaryActiveGM()) {
        this.broadcastStatusAnimation(id, "dying");
      }
    }
    const edge = game.settings.get(MODULE_ID, SETTINGS.edge) || "right";
    for (const id of currentDelayed) {
      if (this.lastDelayedIds.has(id)) continue;
      if (!this.statusAnimationRecentlyQueued(id, "delay")) {
        const cardEl = this.root?.querySelector(`.gluni-card[data-combatant-id="${escapeCSSIdentifier(id)}"]`);
        if (cardEl) {
          this.createStatusFlashGhost(cardEl, localize("GLUNI.Delayed").toUpperCase(), "delay", edge);
        }
        this.pendingSlideInIds.add(id);
      }
    }
    for (const id of currentBroken) {
      if (this.lastBrokenIds.has(id)) continue;
      if (!this.statusAnimationRecentlyQueued(id, "guardBreak")) {
        const cardEl = this.root?.querySelector(`.gluni-card[data-combatant-id="${escapeCSSIdentifier(id)}"]`);
        if (cardEl) {
          this.createStatusFlashGhost(cardEl, localize("GLUNI.GuardBreak").toUpperCase(), "break", edge);
        }
        this.pendingSlideInIds.add(id);
        if (hadSnapshot) {
          const combatant = this.combat?.combatants?.get(id);
          if (combatant) this.showBreakSplash(combatant.name);
        }
      }
    }
    this.lastDyingIds = currentDying;
    this.lastDelayedIds = currentDelayed;
    this.lastBrokenIds = currentBroken;
    this.statusSnapshotInitialized = true;
  }
}

function getPortrait(combatant) {
  const actorImage = combatant.actor?.img;
  const tokenImage = combatant.token?.texture?.src || combatant.token?.img || combatant.img;
  return actorImage || tokenImage || FALLBACK_PORTRAIT;
}

function renderCombatantStyle(card) {
  const styleParts = [];
  if (card.portraitFrame) styleParts.push(renderPortraitFrameStyle(card.portraitFrame));
  if (Number.isFinite(card.portraitScaleCap)) {
    styleParts.push(`--gluni-portrait-quality-cap: ${card.portraitScaleCap.toFixed(3)};`);
  }
  return styleParts.length ? ` style="${escapeAttr(styleParts.join(" "))}"` : "";
}

function getUsedInitiatives(combat, exceptId = null) {
  return Array.from(combat?.combatants ?? [])
    .map(entry => Array.isArray(entry) ? entry[1] : entry)
    .filter(combatant => combatant?.id !== exceptId)
    .map(combatant => Number(combatant.initiative))
    .filter(Number.isFinite);
}

function chooseInitiativeBetween({ before, after, existing = [] } = {}) {
  const beforeValue = normalizeInitiativeNumber(before);
  const afterValue = normalizeInitiativeNumber(after);
  const used = new Set(Array.from(existing).map(value => normalizeInitiativeNumber(value)).filter(Number.isFinite));

  if (Number.isFinite(beforeValue) && Number.isFinite(afterValue) && beforeValue > afterValue) {
    const wholeHigh = Math.ceil(beforeValue) - 1;
    const wholeLow = Math.floor(afterValue) + 1;
    for (let value = wholeHigh; value >= wholeLow; value -= 1) {
      if (value < beforeValue && value > afterValue && !used.has(value)) return value;
    }

    return makeUniqueInitiative((beforeValue + afterValue) / 2, used, { min: afterValue, max: beforeValue });
  }

  if (Number.isFinite(afterValue)) {
    const whole = Math.floor(afterValue) + 1;
    if (whole > afterValue && !used.has(whole)) return whole;
    return makeUniqueInitiative(afterValue + 1, used, { min: afterValue });
  }

  if (Number.isFinite(beforeValue)) {
    const whole = Math.ceil(beforeValue) - 1;
    if (whole < beforeValue && !used.has(whole)) return whole;
    return makeUniqueInitiative(beforeValue - 1, used, { max: beforeValue });
  }

  return makeUniqueInitiative(10, used);
}

function makeUniqueInitiative(value, existing = [], bounds = {}) {
  const used = existing instanceof Set
    ? existing
    : new Set(Array.from(existing).map(entry => normalizeInitiativeNumber(entry)).filter(Number.isFinite));
  const base = normalizeInitiativeNumber(value);
  const fallback = Number.isFinite(base) ? base : 10;
  const min = normalizeInitiativeNumber(bounds.min);
  const max = normalizeInitiativeNumber(bounds.max);
  const fits = candidate => {
    if (!Number.isFinite(candidate)) return false;
    if (Number.isFinite(min) && candidate <= min) return false;
    if (Number.isFinite(max) && candidate >= max) return false;
    return !used.has(candidate);
  };

  if (fits(fallback)) return fallback;

  for (let step = 1; step <= 100; step += 1) {
    const offset = step / 10;
    for (const direction of [1, -1]) {
      const candidate = normalizeInitiativeNumber(fallback + direction * offset);
      if (fits(candidate)) return candidate;
    }
  }

  for (let step = 1; step <= 1000; step += 1) {
    const offset = step / 10;
    for (const direction of [1, -1]) {
      const candidate = normalizeInitiativeNumber(fallback + direction * offset);
      if (Number.isFinite(candidate) && !used.has(candidate)) return candidate;
    }
  }

  return normalizeInitiativeNumber(fallback + 0.1);
}

function normalizeInitiativeNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return NaN;
  return Math.round(number * 10) / 10;
}

function getPF2eDyingState(combatant) {
  if (game.system?.id !== "pf2e") return null;

  const actor = combatant?.actor;
  if (!actor || actor.type !== "character") return null;

  const dyingValue = getActorAttributeValue(actor, "dying") ?? getConditionValue(actor, "dying");
  const value = Math.max(0, Math.round(Number(dyingValue) || 0));
  if (value <= 0) return null;

  const doomed = Math.max(0, Math.round(Number(getActorAttributeValue(actor, "doomed") ?? getConditionValue(actor, "doomed") ?? 0) || 0));
  const rawMax = getActorAttributeValue(actor, "dying", "max");
  const hasDiehard = hasActorItem(actor, "diehard");
  const baseMax = Number.isFinite(rawMax) ? rawMax : hasDiehard ? 5 : 4;
  const max = clamp(Math.max(1, Math.round(baseMax - doomed)), 1, 9);
  const ratio = clamp(value / max, 0, 1.5);
  const severity = ratio >= 1 ? "critical" : ratio >= 0.67 ? "high" : "low";

  return { value, max, doomed, hasDiehard, severity };
}

function getActorAttributeValue(actor, attribute, property = "value") {
  const direct = actor?.system?.attributes?.[attribute]?.[property];
  if (Number.isFinite(Number(direct))) return Number(direct);

  const nested = actor?.system?.attributes?.[attribute]?.[property]?.value;
  if (Number.isFinite(Number(nested))) return Number(nested);

  return null;
}

function getConditionValue(actor, slug) {
  const condition = getActorItems(actor).find(item => item?.type === "condition" && getItemSlug(item) === slug);
  if (!condition) return null;

  const candidates = [
    condition.system?.value?.value,
    condition.system?.badge?.value,
    condition.system?.value,
    condition.value
  ];

  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value)) return value;
  }

  return 1;
}

function hasActorItem(actor, slug) {
  return getActorItems(actor).some(item => getItemSlug(item) === slug);
}

function findPF2eGuardBreakEffects(actor) {
  return getActorItems(actor).filter(item =>
    item?.type === "effect" &&
    (item.getFlag?.(MODULE_ID, "guardBreak") === true || getItemSlug(item) === PF2E_GUARD_BREAK_EFFECT_SLUG)
  );
}

function getActorItems(actor) {
  const items = actor?.items?.contents ?? actor?.items ?? [];
  return Array.from(items)
    .map(entry => Array.isArray(entry) ? entry[1] : entry)
    .filter(Boolean);
}

function getItemSlug(item) {
  return String(item?.slug ?? item?.system?.slug ?? item?.flags?.core?.sourceId ?? item?.name ?? "")
    .trim()
    .toLowerCase()
    .replace(/^.*\./, "")
    .replace(/\s+/g, "-");
}

function renderDyingRepeatText(dying) {
  const text = `${localize("GLUNI.Dying").toUpperCase()} ${dying.value}/${dying.max}`;
  const line = Array.from({ length: 5 }, () => `<span>${escapeHTML(text)}</span>`).join("");
  return Array.from({ length: 6 }, (_, index) => `
    <div class="gluni-card-dying-repeat-line${index % 2 ? " gluni-card-dying-repeat-line--alt" : ""}">
      ${line}
    </div>
  `).join("");
}

function renderGuardBreakRepeatText() {
  const text = localize("GLUNI.GuardBreak").toUpperCase();
  const line = Array.from({ length: 6 }, () => `<span>${escapeHTML(text)}</span>`).join("");
  return Array.from({ length: 5 }, (_, index) => `
    <div class="gluni-card-guard-break-repeat-line${index % 2 ? " gluni-card-guard-break-repeat-line--alt" : ""}">
      ${line}
    </div>
  `).join("");
}

function getGuardBreakState(combatant) {
  const value = combatant?.getFlag?.(MODULE_ID, FLAGS.guardBroken);
  if (!value) return null;
  if (typeof value === "object") return value;
  return {};
}

function renderDyingPips(dying) {
  const max = clamp(Math.round(Number(dying.max) || 4), 1, 9);
  const value = clamp(Math.round(Number(dying.value) || 0), 0, max);
  const label = formatLocalized("GLUNI.Dying.Aria", { value, max });
  const pips = Array.from({ length: max }, (_unused, index) => {
    const filled = index < value;
    return `<span class="gluni-dying-pip${filled ? " gluni-dying-pip--filled" : ""}" aria-hidden="true"></span>`;
  }).join("");

  return `<div class="gluni-dying-pips" role="img" aria-label="${escapeAttr(label)}">${pips}</div>`;
}

function getPortraitScaleCap(path) {
  if (!path) return 1;
  const cached = portraitQualityCache.get(path);
  if (cached) return cached.scaleCap;

  const pending = { scaleCap: 1, ready: false };
  portraitQualityCache.set(path, pending);
  loadPortraitScaleCap(path, pending);
  return pending.scaleCap;
}

async function loadPortraitScaleCap(path, entry) {
  try {
    const texture = await loadTexture(path, { fallback: FALLBACK_PORTRAIT });
    const baseTexture = texture?.baseTexture;
    if (baseTexture && globalThis.PIXI?.SCALE_MODES) {
      baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
      baseTexture.update?.();
    }
    const width = baseTexture?.realWidth ?? baseTexture?.width ?? texture?.width ?? 0;
    const height = baseTexture?.realHeight ?? baseTexture?.height ?? texture?.height ?? 0;
    const cap = computePortraitScaleCap(width, height);
    entry.scaleCap = cap;
    entry.ready = true;
    overlay?.renderSoon();
  } catch (_error) {
    entry.scaleCap = 1;
    entry.ready = true;
  }
}

function computePortraitScaleCap(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 1;
  const pixels = width * height;
  if (pixels <= 0) return 1;
  const normalArea = 188 * PORTRAIT_MIN_PIXELS.normalHeight;
  const activeArea = 200 * PORTRAIT_MIN_PIXELS.activeHeight;
  const targetArea = Math.max(normalArea, activeArea);
  const ratio = Math.sqrt(pixels / targetArea);
  return clamp(ratio, 0.22, 1);
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
    title: formatLocalized("GLUNI.PortraitConfig.Title", { name: actor.name }),
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
        </div>
        <span class="gluni-initiative-badge">18</span>
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
        setPortraitInputValue(form, mode, "x", startX - deltaX);
        setPortraitInputValue(form, mode, "y", startY - deltaY);
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

function openAdhocInitiativeDialog({ combat, onCreate }) {
  const defaults = getAdhocDialogDefaults(combat);

  new Dialog({
    title: localize("GLUNI.AdHoc.DialogTitle"),
    content: renderAdhocInitiativeDialog(defaults),
    buttons: {
      create: {
        icon: '<i class="fa-solid fa-plus"></i>',
        label: localize("GLUNI.AdHoc.Create"),
        callback: async html => {
          const data = readAdhocInitiativeForm(html, combat);
          if (!data.name) {
            globalThis.ui?.notifications?.warn(localize("GLUNI.AdHoc.NameRequired"));
            return false;
          }
          await onCreate(data);
        }
      }
    },
    default: "create",
    render: html => activateAdhocInitiativeDialog(html)
  }, {
    classes: ["gluni-adhoc-dialog"],
    width: 420,
    resizable: false
  }).render(true);
}

function getAdhocDialogDefaults(combat) {
  const currentInitiative = Number(combat?.combatant?.initiative);
  return {
    name: localize("GLUNI.AdHoc.DefaultName"),
    initiative: Number.isFinite(currentInitiative) ? currentInitiative : 10,
    round: Math.max(1, Number(combat?.round) || 1),
    lifecycle: ADHOC_LIFECYCLE.persistent,
    type: ADHOC_DEFAULT_TYPE,
    visibility: VISIBILITY.visible,
    icon: ADHOC_TYPES[ADHOC_DEFAULT_TYPE].icon
  };
}

function renderAdhocInitiativeDialog(defaults) {
  return `
    <form class="gluni-adhoc-form" autocomplete="off">
      <label class="gluni-adhoc-field">
        <span>${localize("GLUNI.AdHoc.Name")}</span>
        <input type="text" name="name" value="${escapeAttr(defaults.name)}" required>
      </label>
      <div class="gluni-adhoc-row">
        <label class="gluni-adhoc-field">
          <span>${localize("GLUNI.AdHoc.Initiative")}</span>
          <input type="number" name="initiative" value="${escapeAttr(defaults.initiative)}" step="0.01">
        </label>
        <label class="gluni-adhoc-field">
          <span>${localize("GLUNI.AdHoc.Round")}</span>
          <input type="number" name="round" value="${escapeAttr(defaults.round)}" min="1" step="1" data-adhoc-round>
        </label>
      </div>
      <div class="gluni-adhoc-row">
        <label class="gluni-adhoc-field">
          <span>${localize("GLUNI.AdHoc.Lifecycle")}</span>
          <select name="lifecycle" data-adhoc-lifecycle>
            <option value="${ADHOC_LIFECYCLE.persistent}" selected>${localize("GLUNI.AdHoc.Persistent")}</option>
            <option value="${ADHOC_LIFECYCLE.oneShot}">${localize("GLUNI.AdHoc.OneShot")}</option>
          </select>
        </label>
        <label class="gluni-adhoc-field">
          <span>${localize("GLUNI.AdHoc.Type")}</span>
          <select name="type">
            ${Object.entries(ADHOC_TYPES).map(([type, config]) => `
              <option value="${escapeAttr(type)}" data-icon="${escapeAttr(config.icon)}" ${type === defaults.type ? "selected" : ""}>${localize(config.label)}</option>
            `).join("")}
          </select>
        </label>
      </div>
      <label class="gluni-adhoc-field">
        <span>${localize("GLUNI.AdHoc.Icon")}</span>
        <div class="gluni-adhoc-icon-input">
          <i class="${escapeAttr(defaults.icon)}" data-adhoc-icon-preview aria-hidden="true"></i>
          <input type="text" name="icon" value="${escapeAttr(defaults.icon)}" list="gluni-adhoc-icons">
        </div>
        <datalist id="gluni-adhoc-icons">
          ${ADHOC_ICON_CHOICES.map(icon => `<option value="${escapeAttr(icon)}"></option>`).join("")}
        </datalist>
      </label>
      <label class="gluni-adhoc-field">
        <span>${localize("GLUNI.AdHoc.Visibility")}</span>
        <select name="visibility">
          <option value="${VISIBILITY.visible}" selected>${localize("GLUNI.Controls.Visible")}</option>
          <option value="${VISIBILITY.mystery}">${localize("GLUNI.Controls.Mystery")}</option>
          <option value="${VISIBILITY.hidden}">${localize("GLUNI.Controls.Hidden")}</option>
        </select>
      </label>
    </form>
  `;
}

function activateAdhocInitiativeDialog(html) {
  const form = getHTMLElement(html)?.querySelector(".gluni-adhoc-form");
  if (!form) return;

  const typeSelect = form.elements.type;
  const iconInput = form.elements.icon;
  const iconPreview = form.querySelector("[data-adhoc-icon-preview]");
  const lifecycleSelect = form.querySelector("[data-adhoc-lifecycle]");
  const roundInput = form.querySelector("[data-adhoc-round]");
  const updatePreview = () => {
    if (!iconPreview || !iconInput) return;
    iconPreview.className = normalizeAdhocIcon(iconInput.value);
  };
  const updateLifecycle = () => {
    if (!roundInput || !lifecycleSelect) return;
    roundInput.disabled = lifecycleSelect.value !== ADHOC_LIFECYCLE.oneShot;
  };

  typeSelect?.addEventListener("change", () => {
    const selected = typeSelect.selectedOptions?.[0];
    if (selected?.dataset.icon && iconInput) iconInput.value = selected.dataset.icon;
    updatePreview();
  });
  iconInput?.addEventListener("input", updatePreview);
  lifecycleSelect?.addEventListener("change", updateLifecycle);
  updatePreview();
  updateLifecycle();
}

function readAdhocInitiativeForm(html, combat) {
  const form = getHTMLElement(html)?.querySelector?.(".gluni-adhoc-form") ?? getHTMLElement(html);
  const data = new FormData(form);
  return normalizeAdhocPayload({
    name: data.get("name"),
    initiative: data.get("initiative"),
    round: data.get("round"),
    lifecycle: data.get("lifecycle"),
    type: data.get("type"),
    visibility: data.get("visibility"),
    icon: data.get("icon")
  }, combat);
}

function normalizeAdhocPayload(data, combat) {
  const fallback = getAdhocDialogDefaults(combat);
  const type = ADHOC_TYPES[data?.type] ? data.type : fallback.type;
  const initiative = Number(data?.initiative);
  const round = Math.max(1, Math.round(Number(data?.round) || fallback.round));
  const lifecycle = ADHOC_LIFECYCLE_MODES.has(data?.lifecycle) ? data.lifecycle : fallback.lifecycle;
  const visibility = ADHOC_VISIBILITY_MODES.has(data?.visibility) ? data.visibility : fallback.visibility;
  const name = String(data?.name ?? fallback.name).trim();

  return {
    name: name || fallback.name,
    initiative: Number.isFinite(initiative) ? initiative : fallback.initiative,
    round,
    lifecycle,
    type,
    visibility,
    icon: normalizeAdhocIcon(data?.icon ?? ADHOC_TYPES[type].icon)
  };
}

function normalizeAdhocIcon(value) {
  const icon = String(value ?? "").trim();
  if (ADHOC_ICON_CHOICES.includes(icon)) return icon;
  const classes = icon.split(/\s+/).filter(Boolean);
  const hasFamily = classes.some(className => /^fa-(solid|regular|brands)$/.test(className));
  const hasIcon = classes.some(className => /^fa-[a-z0-9-]+$/i.test(className) && !/^fa-(solid|regular|brands)$/i.test(className));
  if (hasFamily && hasIcon && classes.every(className => /^fa-[a-z0-9-]+$/i.test(className))) return classes.join(" ");
  return ADHOC_TYPES[ADHOC_DEFAULT_TYPE].icon;
}

function renderAdhocRepeatText(name) {
  const text = escapeHTML(name);
  const line = Array.from({ length: 5 }, () => `<span>${text}</span>`).join("");
  return Array.from({ length: 6 }, (_, index) => `
    <div class="gluni-card-adhoc-repeat-line${index % 2 ? " gluni-card-adhoc-repeat-line--alt" : ""}">
      ${line}
    </div>
  `).join("");
}

function renderDelayedRepeatText(name) {
  const text = `${localize("GLUNI.Delayed").toUpperCase()} / ${escapeHTML(name)}`;
  const line = Array.from({ length: 4 }, () => `<span>${text}</span>`).join("");
  return Array.from({ length: 4 }, (_, index) => `
    <div class="gluni-card-delayed-repeat-line${index % 2 ? " gluni-card-delayed-repeat-line--alt" : ""}">
      ${line}
    </div>
  `).join("");
}

function getAdhocData(combatant) {
  const value = combatant?.getFlag?.(MODULE_ID, FLAGS.adhoc);
  if (!value || typeof value !== "object") return null;

  const type = ADHOC_TYPES[value.type] ? value.type : ADHOC_DEFAULT_TYPE;
  const config = ADHOC_TYPES[type];
  const name = String(value.name || combatant.name || localize("GLUNI.AdHoc.DefaultName")).trim();
  const lifecycle = ADHOC_LIFECYCLE_MODES.has(value.lifecycle) ? value.lifecycle : ADHOC_LIFECYCLE.persistent;
  const round = Math.max(1, Math.round(Number(value.round) || 1));

  return {
    type,
    name,
    label: localize(config.label),
    icon: normalizeAdhocIcon(value.icon ?? config.icon),
    disposition: config.disposition,
    lifecycle,
    round,
    oneShot: lifecycle === ADHOC_LIFECYCLE.oneShot
  };
}

function isAdhocCombatant(combatant) {
  return Boolean(getAdhocData(combatant));
}

function shouldShowAdhocOnRound(combatant, round) {
  const adhoc = getAdhocData(combatant);
  return !adhoc?.oneShot || adhoc.round === round;
}

function isDueOneShotAdhoc(combatant, round) {
  const adhoc = getAdhocData(combatant);
  return Boolean(adhoc?.oneShot && adhoc.round === round);
}

function getAdhocActorType() {
  const actorConfig = globalThis.CONFIG?.Actor ?? {};
  const types = new Set([
    ...Object.keys(actorConfig.typeLabels ?? {}),
    ...Object.keys(actorConfig.dataModels ?? {}),
    ...Object.keys(game.system?.model?.Actor ?? {})
  ]);
  for (const type of ["npc", "character", "pc", "creature"]) {
    if (types.has(type)) return type;
  }
  return types.values().next().value ?? "npc";
}

async function confirmAdhocDelete(combatant) {
  const name = getAdhocData(combatant)?.name ?? combatant?.name ?? localize("GLUNI.AdHoc.DefaultName");
  if (typeof globalThis.Dialog?.confirm === "function") {
    return globalThis.Dialog.confirm({
      title: localize("GLUNI.AdHoc.Delete"),
      content: `<p>${formatLocalized("GLUNI.AdHoc.DeleteConfirm", { name: escapeHTML(name) })}</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false
    });
  }

  return window.confirm(formatLocalized("GLUNI.AdHoc.DeleteConfirm", { name }));
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
  const frame = clonePortraitFrameDefaults();

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
  const frame = clonePortraitFrameDefaults();
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

function clonePortraitFrameDefaults() {
  return {
    normal: { ...PORTRAIT_FRAME_DEFAULTS.normal },
    expanded: { ...PORTRAIT_FRAME_DEFAULTS.expanded }
  };
}

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
  const rounded = normalizeInitiativeNumber(value);
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(1);
}

function localize(key) {
  const value = game.i18n?.localize(key);
  return value && value !== key ? value : LOCALIZATION_FALLBACKS[key] ?? key;
}

function formatLocalized(key, data = {}) {
  const value = game.i18n?.format?.(key, data);
  const template = value && value !== key ? value : LOCALIZATION_FALLBACKS[key] ?? key;
  return String(template).replace(/\{([^}]+)\}/g, (_match, field) => data[field] ?? "");
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function escapeCSSIdentifier(value) {
  const raw = String(value ?? "");
  if (globalThis.CSS?.escape) return CSS.escape(raw);
  return raw.replace(/[^a-zA-Z0-9_-]/g, match => `\\${match}`);
}

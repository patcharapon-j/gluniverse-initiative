export const MODULE_ID = "gluniverse-initiative";
export const SOCKET_NAME = `module.${MODULE_ID}`;

export const SETTINGS = {
  enabled: "enabled",
  initiativeMode: "initiativeMode",
  edge: "edge",
  visibleCount: "visibleCount",
  showDefeated: "showDefeated",
  position: "position",
  uiScale: "uiScale",
  tokenOverlayShape: "tokenOverlayShape",
  turnMarkerEnabled: "turnMarkerEnabled",
  startMarkerEnabled: "startMarkerEnabled",
  startConnectorEnabled: "startConnectorEnabled",
  conditionBadges: "conditionBadges",
  conditionBadgeLayout: "conditionBadgeLayout",
  guardBreakSound: "guardBreakSound",
  guardBreakSoundVolume: "guardBreakSoundVolume"
};

export const TOKEN_OVERLAY_PALETTE = {
  delayed: 0x4aa3ff,
  delayedHi: 0x9ad8ff,
  broken: 0xffb12d,
  brokenHot: 0xffe070,
  brokenDeep: 0xff6f1a,
  dying: 0xb497ff,
  dyingHot: 0xefd7ff,
  dyingDeep: 0x6a3fb0,
  saveSuccess: 0x57e08b,
  saveSuccessHot: 0xb6ffd0,
  saveFailure: 0xff5d6c,
  saveFailureHot: 0xffc0c6,
  stable: 0x4ad9c0,
  stableHot: 0xb6fff2,
  ink: 0x02070b,
  white: 0xf3fbff,
  violet: 0xb497ff,
  magenta: 0xff66b3
};

// Ground turn-marker disposition colours. `base` is synced to the initiative
// card's per-disposition accent (--gluni-cyan / --gluni-white / --gluni-red /
// --gluni-violet) so a token's ground ring reads as the same theme as its rail
// card. `hi` is the brighter accent used for sweeps, glow and bright edges.
export const DISPOSITION_PALETTE = {
  friendly: { base: 0x5eeaff, hi: 0xb9f7ff },   // --gluni-cyan
  hostile: { base: 0xff335f, hi: 0xff8aa3 },    // --gluni-red
  neutral: { base: 0xf3fbff, hi: 0xffffff },    // --gluni-white
  secret: { base: 0xb497ff, hi: 0xe0d4ff }      // --gluni-violet
};

export function getDispositionColors(disposition) {
  return DISPOSITION_PALETTE[disposition] ?? DISPOSITION_PALETTE.neutral;
}

export const FLAGS = {
  visibility: "visibility",
  manualDelayed: "manualDelayed",
  guardBroken: "guardBroken",
  breakGauge: "breakGauge",
  portraitFrame: "portraitFrame",
  adhoc: "adhoc",
  adhocActor: "adhocActor",
  turnStart: "turnStart",
  hiddenConditions: "hiddenConditions",
  // Card initiative mode: per-actor deck config { cards, turns } stored on the
  // Actor, and the live shuffled turn order stored on the Combat as cardDeal:
  // { round, pointer, sequence: [{ cid, n }] }.
  cardConfig: "cardConfig",
  cardDeal: "cardDeal"
};

export const INITIATIVE_MODE = Object.freeze({ standard: "standard", card: "card" });

// Card mode per-actor deck configuration.
//  - cards: copies of this actor's card in the deck; more copies => more likely
//    to be dealt an early slot. Extra draws after placement are ignored.
//  - turns: how many turns this actor takes per round (boss multi-turn). Each of
//    the actor's first `turns` draws becomes a real turn slot.
// The deck holds max(cards, turns) copies so a multi-turn actor can always reach
// its full turn count.
export const CARD_CONFIG_DEFAULTS = Object.freeze({ cards: 1, turns: 1 });
export const CARD_CONFIG_LIMITS = Object.freeze({
  cards: Object.freeze({ min: 1, max: 10 }),
  turns: Object.freeze({ min: 1, max: 10 })
});

// Break gauge: a GM-managed resource bar that depletes toward a guard break.
// Stored per-combatant under FLAGS.breakGauge as { max, value, mode }.
export const BREAK_GAUGE_DEFAULT_MAX = 100;
export const BREAK_GAUGE_MODES = Object.freeze({ smooth: "smooth", segmented: "segmented" });
// Shared by the card (CSS) and token (PIXI) gauges so they animate alike.
export const BREAK_GAUGE_FLASH_SEC = 0.55;
export const BREAK_GAUGE_SHEEN_SEC = 3.4;

export const VISIBILITY = {
  auto: "auto",
  visible: "visible",
  hidden: "hidden",
  mystery: "mystery"
};

// PF2e-only: an Effect item applied to a broken actor that imposes a -2 status
// penalty to AC and all saving throws. The slug + module flag let us find and
// remove exactly the effect we created when the break is cleared.
export const PF2E_GUARD_BREAK_EFFECT_SLUG = "gluni-guard-break";
export const PF2E_GUARD_BREAK_PENALTY = 2;

export const LOCALIZATION_FALLBACKS = Object.freeze({
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
  "GLUNI.Settings.TurnMarker.Name": "Turn marker on tokens",
  "GLUNI.Settings.TurnMarker.Hint": "Draw a cinematic ground ring beneath the current and next combatant's tokens, coloured by disposition.",
  "GLUNI.Settings.StartMarker.Name": "Starting-location marker",
  "GLUNI.Settings.StartMarker.Hint": "Mark where the active combatant's token began its turn, so players can see how far it has moved.",
  "GLUNI.Settings.StartConnector.Name": "Starting-location trail",
  "GLUNI.Settings.StartConnector.Hint": "Draw a flowing connector line from the starting-location marker to the active token. Requires the starting-location marker.",
  "GLUNI.Settings.ConditionBadges.Name": "Show condition badges",
  "GLUNI.Settings.ConditionBadges.Hint": "Display the small per-condition badges alongside each combatant card. Does not affect the in-card condition treatment or the actual conditions on the token.",
  "GLUNI.Settings.ConditionBadgeLayout.Name": "Condition badge layout",
  "GLUNI.Settings.ConditionBadgeLayout.Hint": "Arrange the condition badges as stacked horizontal pills, or as a slim vertical strip of rotated text along the card.",
  "GLUNI.Settings.ConditionBadgeLayout.Horizontal": "Horizontal pills",
  "GLUNI.Settings.ConditionBadgeLayout.Vertical": "Vertical strip",
  "GLUNI.Settings.GuardBreakSound.Name": "Guard break sound",
  "GLUNI.Settings.GuardBreakSound.Hint": "Audio file played for everyone when a combatant's guard is broken. Leave empty for no sound.",
  "GLUNI.Settings.GuardBreakSoundVolume.Name": "Guard break sound volume",
  "GLUNI.Settings.GuardBreakSoundVolume.Hint": "Playback volume of the guard break sound for this user.",
  "GLUNI.TurnMarker.Next": "Next",
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
  "GLUNI.Controls.TokenBreakGauge": "Break gauge",
  "GLUNI.BreakGauge.Label": "Break",
  "GLUNI.BreakGauge.Title": "Break gauge",
  "GLUNI.BreakGauge.Max": "Max",
  "GLUNI.BreakGauge.Current": "Current",
  "GLUNI.BreakGauge.Mode": "Mode",
  "GLUNI.BreakGauge.Mode.Smooth": "Smooth",
  "GLUNI.BreakGauge.Mode.Segmented": "Segmented",
  "GLUNI.BreakGauge.Enable": "Show break gauge",
  "GLUNI.BreakGauge.Apply": "Apply",
  "GLUNI.BreakGauge.Clear": "Remove",
  "GLUNI.BreakGauge.Aria": "Break gauge {value} of {max}",
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
  "GLUNI.Conditions.Title": "Conditions",
  "GLUNI.Conditions.Hide": "Hide on tracker",
  "GLUNI.Conditions.Show": "Show on tracker",
  "GLUNI.Conditions.None": "No temporary conditions",
  "GLUNI.PF2e.BreakEffect.Name": "Break",
  "GLUNI.PF2e.BreakEffect.Description": "<p>Your guard has been broken. You take a -2 status penalty to AC and all saving throws, and you lose all resistances.</p>",
  "GLUNI.Dying": "Dying",
  "GLUNI.Dying.Aria": "Dying {value} of {max}",
  "GLUNI.DeathSaves": "Death Saves",
  "GLUNI.DeathSaves.Stable": "Stable",
  "GLUNI.DeathSaves.Success.Aria": "Death save successes {value} of {max}",
  "GLUNI.DeathSaves.Failure.Aria": "Death save failures {value} of {max}",
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
  "GLUNI.Unknown": "Unknown",
  "GLUNI.Settings.InitiativeMode.Name": "Initiative mode",
  "GLUNI.Settings.InitiativeMode.Hint": "Standard uses each combatant's rolled initiative. Card draws a fresh, shuffled turn order each round, ignoring initiative scores.",
  "GLUNI.Settings.InitiativeMode.Standard": "Standard (initiative scores)",
  "GLUNI.Settings.InitiativeMode.Card": "Card (shuffle &amp; deal each round)",
  "GLUNI.Card.Order": "Draw order {order}",
  "GLUNI.Card.Swap": "Swap turn with another combatant",
  "GLUNI.Card.SwapCancel": "Cancel swap",
  "GLUNI.Card.SwapPick": "Force this combatant to act now",
  "GLUNI.Card.SwapPickShort": "Act now",
  "GLUNI.Card.Reshuffle": "Reshuffle",
  "GLUNI.Card.Deck": "Deck",
  "GLUNI.Card.DeckRemaining": "{count} cards left this round",
  "GLUNI.Card.Reorder": "Drag to reorder upcoming turns",
  "GLUNI.Card.Config.Button": "Deck",
  "GLUNI.Card.Config.Open": "Configure initiative deck",
  "GLUNI.Card.Config.Title": "{name} Initiative Deck",
  "GLUNI.Card.Config.Hint": "Card initiative settings for this actor. These only apply while the Card initiative mode is active.",
  "GLUNI.Card.Config.Cards": "Cards in deck",
  "GLUNI.Card.Config.CardsHint": "More copies make this actor more likely to be dealt an early turn. Extra copies do not grant extra turns.",
  "GLUNI.Card.Config.Turns": "Turns per round",
  "GLUNI.Card.Config.TurnsHint": "How many turns this actor takes each round (for multi-turn bosses).",
  "GLUNI.Card.Config.Reset": "Reset",
  "GLUNI.Card.Config.Save": "Save"
});

export const ADHOC_DEFAULT_TYPE = "effect";
export const ADHOC_TYPES = Object.freeze({
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
export const ADHOC_VISIBILITY_MODES = new Set([VISIBILITY.visible, VISIBILITY.mystery, VISIBILITY.hidden]);
export const ADHOC_LIFECYCLE = Object.freeze({
  persistent: "persistent",
  oneShot: "oneShot"
});
export const ADHOC_LIFECYCLE_MODES = new Set(Object.values(ADHOC_LIFECYCLE));
export const STATUS_ANIMATION = Object.freeze({
  delay: Object.freeze({ label: "GLUNI.Delayed", colorClass: "delay", motion: "slide" }),
  guardBreak: Object.freeze({ label: "GLUNI.GuardBreak", colorClass: "break", motion: "slide" }),
  dying: Object.freeze({ label: "GLUNI.Dying", colorClass: "dying", motion: "dying" })
});
export const ADHOC_ICON_CHOICES = Object.freeze([
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

export const COMBATANT_RENDER_UPDATE_KEYS = new Set([
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
export const ACTOR_RENDER_UPDATE_KEYS = new Set(["flags", "img", "items", "name", "prototypeToken", "system"]);

export const FALLBACK_PORTRAIT = "icons/svg/mystery-man.svg";
export const PORTRAIT_MIN_PIXELS = Object.freeze({
  normalHeight: 58,
  activeHeight: 166
});
export const CONFIGURABLE_ACTOR_TYPES = new Set(["character", "npc", "pc"]);
export const PORTRAIT_FRAME_DEFAULTS = Object.freeze({
  normal: Object.freeze({ x: 54, y: 24, scale: 1.06 }),
  expanded: Object.freeze({ x: 55, y: 12, scale: 1.2 })
});
export const PORTRAIT_FRAME_LIMITS = Object.freeze({
  x: Object.freeze({ min: -100, max: 200 }),
  y: Object.freeze({ min: -100, max: 200 }),
  scale: Object.freeze({ min: 0.5, max: 3 })
});

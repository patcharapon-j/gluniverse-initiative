# GLUniverse Initiative Implementation Spec

## Product Direction

GLUniverse Initiative is a Foundry VTT v13 cinematic initiative overlay. It complements the default combat tracker instead of replacing it. The overlay focuses on portrait-driven landscape cards, a vertical turn rail, smooth turn-change animation, and a dramatic round splash inspired by modern tactical RPG UI language.

The module is system-agnostic first, with PF2e-friendly Delay handling where possible.

## Core Experience

- The overlay appears only while a Combat encounter exists and the local user has enabled it.
- The rail can be placed on the left or right screen edge.
- Only the GM can drag the rail. The dragged position is saved as a world setting and synced to all users.
- GMs get compact previous/next turn buttons as an external side control on the active card.
- A player who owns the active combatant gets an `End Turn` button on the active card. The request is socketed to the GM client and validated against active combatant ownership before advancing combat.
- Turn controls are rendered in a floating side layer anchored to the active slot so card FLIP motion and portrait overflow do not move or block them.
- Hovering a visible initiative card highlights that combatant's token on the active scene. Mystery cards do not reveal token identity to players through hover.
- The visible normal turn order is looped from the current turn forward.
- The number of visible normal combatants defaults to 5 and is configurable.
- If the visible loop crosses the end of a round, insert a compact `Round NN` separator before the next-round combatant each time it crosses, so high visible counts with only a few actors can show multiple round separators.
- A repeated combatant shown after the next-round separator remains an inactive preview card, even if it is the same actor as the current active turn.
- The current round is shown in compact card-like chrome; the overlay should not use a large background panel.
- When a new round begins, show a center-screen splash:
  - Huge two-digit round number: `01`, `02`, ..., `99`, then natural width from `100`.
  - Smaller uppercase `ROUND` label centered above the number.
  - Tight quick in/out animation: the number appears cleanly, then fades with subtle scale; the `ROUND` label fades with a restrained horizontal tracking effect.

## Card Design

- Cards use a narrow landscape combat-strip aspect ratio to keep the overlay footprint small.
- Inactive cards are cropped strips that prioritize face and upper chest.
- Only the current turn card grows larger and allows the portrait to overflow upward so the head-to-chest region is visible.
- Portrait source priority:
  1. Actor portrait
  2. Token image
  3. Fallback icon
- PC/character and NPC actor sheets include a native sheet header portrait framing control for users with owner permission:
  - Normal and expanded card framing are configured independently.
  - Each mode supports freeform X/Y crop position and zoom scaling.
  - Previews use the exact initiative card dimensions for the normal and active cards.
  - Right-drag on a preview adjusts X/Y crop position; mouse wheel adjusts zoom.
  - Values are stored on the Actor, so framing persists across combats and tokens.
- Each card shows:
  - Combatant name
  - Compact initiative badge
  - Disposition accent
  - Active turn indicator when current
- The UI uses compact mono/tech typography and should read as a tactical combat HUD, not a broad glass dashboard.
- Disposition is indicated with a slim colored accent plus compact iconography:
  - Friendly: cyan/blue
  - Neutral: amber/white
  - Hostile: red/magenta
  - Secret/hidden/mystery: violet/dimmed
  - Defeated: desaturated card treatment

## Visibility

Visibility is controlled per combatant with GM-only hover controls.

Modes:

- `auto`: Respect Foundry combatant/token hidden state.
- `visible`: Force visible in the cinematic overlay.
- `hidden`: Fully omit from player-facing overlay.
- `mystery`: Show an anonymized `Unknown` card without identity or portrait, using a large centered `?` mark instead of an image.

Defaults:

- Non-hidden combatants use `auto` and appear normally.
- Hidden/secret combatants appear as mystery cards to players.
- GMs can see controls and can force visible, hidden, or mystery.
- GMs get a persistent compact mode label on each card (`AUTO`, `SHOW`, `HIDE`, `MASK`) plus selected-state controls on hover.

Visibility must not leak hidden actors through Delay state or round wrapping.

## Defeated Combatants

- Configurable.
- Default: hidden from player-facing normal loop.
- GM can configure whether defeated combatants remain visible.
- Defeated combatants use a desaturated visual treatment when shown.

## PF2e Delay Handling

Delay is a special initiative state outside the normal loop.

- Delayed combatants do not count against the configured normal visible combatant limit.
- Delayed combatants appear in a compact delayed section. Its placement is configurable (`delayedPlacement`): `side` (default) anchors it as a column on the tracker's screen-edge side — opposite the condition badges, which jut toward the screen centre — and `bottom` keeps the classic section stacked beneath the rail.
- A combatant that delays should animate/shrink from the active card area into the delayed section.
- A combatant that re-enters initiative should slide/highlight back into the active slot.
- The module should auto-detect known PF2e delay flags when available.
- GM-only manual delayed toggle exists as a fallback for PF2e or any other system.
- When the GM manually delays the active combatant, the module advances the Foundry combat turn.
- When the GM manually returns a delayed combatant, the module places that combatant into the current active slot and pushes the previously active combatant down to be next.
- Delay visibility respects the combatant visibility mode:
  - hidden stays omitted
  - mystery stays anonymized
  - visible appears normally

## Settings

Client settings:

- Enable cinematic initiative overlay.

World settings:

- Edge: `left` or `right`.
- Visible combatants: number, default 5.
- Show all combatants: boolean, default off. When on, the overlay lists every combatant in the order (one full cycle of the turn order, including ad hoc cards) instead of a fixed window, and the visible-combatants count is ignored. One-shot ad hoc entries still only surface on their scheduled round.
- Delayed card placement: `side` (default) or `bottom` (see PF2e Delay Handling).
- Animation intensity: `reduced`, `default`, or `cinematic`.
- Defeated combatants: hide or show.
- Overlay position: world-synced `{ x, y }`.

## Implementation Notes

- Use Foundry v13 module manifest with `esmodules` and `styles`.
- Use core Combat and Combatant document hooks.
- Store per-combatant state in flags under this module id.
- Use a single mounted DOM root appended to `document.body`.
- Use FLIP-style card motion on turn changes: the previous active card exits laterally during normal turn advance, remaining cards slide into their new positions, new active cards grow with portrait motion, bottom insertions fade in from below with a subtle upward settle, and delay returns push the current active card down instead of removing it.
- Avoid sound effects for now.

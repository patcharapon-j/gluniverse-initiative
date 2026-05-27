# GLUniverse Initiative

A cinematic, portrait-first initiative overlay for Foundry VTT v13.

## Install

Use this manifest URL in Foundry's **Install Module** dialog:

```text
https://github.com/patcharapon-j/gluniverse-initiative/releases/latest/download/module.json
```

## Features

- Portrait-led turn cards with a larger active combatant state.
- Smooth initiative transitions, round-wrap continuity, and a polished round splash.
- Player-safe GM controls for visibility, mystery state, delay, return, and turn advancement.
- GM ad hoc initiative cards for hazards, environmental effects, abstract NPC turns, and other initiative-count triggers, with persistent and one-shot round modes.
- PF2e-friendly Delay handling with delayed combatants grouped below the main turn rail.
- Per-user overlay settings for edge placement, visible combatant count, animation intensity, and defeated combatant visibility.
- Actor portrait framing controls for normal and active initiative cards.
- Two initiative modes: **Standard** (rolled initiative) and **Card**, where each round the combatants' cards are shuffled and dealt to set the turn order, with FLIP turn animation, per-actor deck advantage (more cards = more likely to act early), multi-turn bosses, and an active-creature **swap** action that forces another combatant to act now.

## Compatibility

- Foundry VTT: v13 minimum, v13 verified.
- System: system-agnostic, with extra handling for known PF2e delay flags.

## Usage

Enable the module in a world, start combat, and the initiative overlay appears while an encounter is active. The overlay can be configured from Foundry's module settings. GMs can use the card controls to advance turns, add ad hoc initiative triggers, delay or return combatants, and adjust player-facing visibility.

To tune an actor portrait, open the actor sheet and use the **Frame** control added by the module. Right-drag the preview to reposition the image and use the mouse wheel to adjust zoom.

Choose the initiative mode in the module settings. In **Card** mode the deck is reshuffled and dealt automatically at the start of every round (the GM can force a re-deal), initiative scores are ignored, and each actor's deck is configured from the **Deck** control on its sheet — how many cards it has (early-turn advantage) and how many turns it takes per round (multi-turn bosses). On its turn, a combatant's controller can use the **swap** control to trade places with an upcoming combatant and force it to act immediately.

## Release Packaging

Releases include:

- `module.json`
- `gluniverse-initiative.zip`

The zip contains the module files at its root so Foundry can install it directly from the manifest download URL.

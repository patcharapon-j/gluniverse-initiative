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
- PF2e-friendly Delay handling with delayed combatants grouped below the main turn rail.
- Per-user overlay settings for edge placement, visible combatant count, animation intensity, and defeated combatant visibility.
- Actor portrait framing controls for normal and active initiative cards.

## Compatibility

- Foundry VTT: v13 minimum, v13 verified.
- System: system-agnostic, with extra handling for known PF2e delay flags.

## Usage

Enable the module in a world, start combat, and the initiative overlay appears while an encounter is active. The overlay can be configured from Foundry's module settings. GMs can use the card controls to advance turns, delay or return combatants, and adjust player-facing visibility.

To tune an actor portrait, open the actor sheet and use the **Frame** control added by the module. Right-drag the preview to reposition the image and use the mouse wheel to adjust zoom.

## Release Packaging

Releases include:

- `module.json`
- `gluniverse-initiative.zip`

The zip contains the module files at its root so Foundry can install it directly from the manifest download URL.

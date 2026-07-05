# Anjana Memory Quest

Anjana Memory Quest is a game-based technology portfolio for Anjana Venugopalan. A pixel avatar runs through a mystic forest, completes short levels, and unlocks portfolio memories as rewards.

## Implementation Plan

1. Initialize a React + Vite + TypeScript project with Phaser for the game layer.
2. Document the visual system: pixel forest world, quest HUD, reward panels, keyboard controls, fonts, colors, and animation rules.
3. Build the game shell: intro, controls, HUD, side memory panel, and quick level loop.
4. Add the avatar, forest world, obstacles, collectibles, reward unlocks, and persistent revisit state.
5. Fill verified resume-backed portfolio sections.
6. Add personal sections after Anjana provides final copy for about, soft skills, hobbies, and any narrative refinements.
7. Polish responsive behavior, accessibility, and Vercel-ready build scripts.

## Design System

The visual direction is inspired by the referenced Figma file's pixel-game mood: layered fantasy forest, oversized pixel panels, HUD meters, reward chests, dark overlays, and quest text. Assets are original unless the Figma asset license is explicitly verified.

### Theme Principles

- **World:** Mystic forest, luminous fog, deep trees, small magical particles, and quick platforming levels.
- **Avatar:** Pixelated brown girl with cute glasses, expressive jump pose, warm outfit accents, and crisp 4px pixel styling.
- **UI:** Pixel-framed panels, blocky buttons, memory log sidebar, quest text strip, and reward cards that feel like discovered artifacts.
- **Interaction:** Game-first entry with accessible unlock-all control for recruiters and keyboard-only users.
- **Motion:** Parallax background, subtle HUD pulses, short reward reveals, and reduced-motion support.

### Fonts

- **Display / Game UI:** `Pixelify Sans`
- **Body / Portfolio Copy:** `Space Grotesk`, falling back to system sans-serif

### Palette

- Forest night: `#101820`
- Canopy green: `#1f5a3d`
- Moss: `#6aa84f`
- Firefly gold: `#ffd166`
- Orchid magic: `#c084fc`
- Rose accent: `#ff6f91`
- Parchment panel: `#f9e7b7`
- Ink: `#211a1d`

## Controls

- Move: `ArrowLeft`, `ArrowRight`, `A`, `D`
- Jump: `Space`, `ArrowUp`, `W`
- Unlock all: visible button in the memory sidebar

## Content Source

Verified content is extracted from `/home/anj/Downloads/SSN 2028-Anjana-Integrated MTech CSE-Appian Resume.pdf`.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

The project is Vercel-ready as a standard Vite app. No deployment is performed from this repository setup.

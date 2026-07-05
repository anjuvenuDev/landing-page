# Anjana Memory Quest

Anjana Memory Quest is a full-screen game-based technology portfolio for Anjana Venugopalan. It opens with a first-person flashback narration, then keeps the game as the only base screen while logs and portfolio memories layer over it.

## Implementation Plan

1. Initialize a React + Vite + TypeScript project with Phaser for the game layer.
2. Document the visual system: pixel forest world, quest HUD, reward panels, keyboard controls, fonts, colors, and animation rules.
3. Build the flashback intro with typed narration, avatar gestures, and a choice between entering the quest or directly unlocking memory shards.
4. Add the full-screen game shell: controls, HUD, icon-triggered log drawer, and quick level loop.
5. Add the avatar, forest world, obstacles, collectibles, treasure chests, reward unlocks, and persistent revisit state.
5. Fill verified resume-backed portfolio sections.
6. Add personal sections after Anjana provides final copy for about, soft skills, hobbies, and any narrative refinements.
7. Polish responsive behavior, accessibility, and Vercel-ready build scripts.

## Design System

The visual direction is inspired by the referenced Figma file's pixel-game mood: layered fantasy forest, oversized pixel panels, HUD meters, reward chests, dark overlays, and quest text. Assets are original unless the Figma asset license is explicitly verified.

### Theme Principles

- **World:** Mystic forest, luminous fog, deep trees, small magical particles, and quick platforming levels.
- **Avatar:** Pixelated brown girl matching the supplied references: large black hair, warm brown/orange skin, large eyes, small smile, blue top, light pants, and subtle glasses.
- **UI:** Pixel-framed overlays, blocky buttons, icon-triggered memory log drawer, quest text strip, and treasure boxes that reveal reward cards.
- **Interaction:** Game-first entry with accessible unlock-all control for recruiters and keyboard-only users.
- **Motion:** Typewriter narration, avatar gestures, fade/slide transitions, treasure reveal flashes, parallax background, short reward reveals, and reduced-motion support.

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

### Pixel UI Rules

- Build major surfaces as square-edged pixel panels with double borders and hard shadows.
- Keep copy readable in DOM panels rather than inside the canvas.
- Use short in-game quest text; use the reward cards for longer portfolio evidence.
- Avoid direct Figma asset export unless license status is confirmed.
- Keep levels under a minute and place the reward shard in a clearly reachable path.
- Keep the live app full-screen: intro first, then game as the single base screen.
- Logs must stay hidden behind an icon until opened as a left-side overlay.
- Portfolio sections appear over the game after a treasure unlock and close with Continue to next level.

## Experience Flow

1. **Flashback intro:** first-person story text types onto the screen while the pixel avatar gestures beside it.
2. **Choice:** visitors can enter the game or directly unlock the memory shards.
3. **Game screen:** the game occupies the entire viewport.
4. **Log drawer:** a single icon toggles the memory log over the left side of the game.
5. **Chest reveal:** each level ends by opening a treasure box, which unlocks a portfolio memory over the same screen.
6. **Continue:** the reward overlay closes and the next level takes over the full-screen game again.

## Portfolio Sections

- About: pending final personal introduction from Anjana.
- Projects: resume-verified, with GitHub/profile/live redirection buttons.
- Work Experience: resume-verified.
- Technical Skills: resume-verified.
- Soft Skills: pending final copy from Anjana, with resume-backed signals used as temporary material.
- Extra-curricular Activities: resume-verified.
- Hobbies & Interests: pending final copy from Anjana.
- Achievements: resume-verified.

## Commit Plan

The implementation is intentionally committed in stages:

1. `Initialize React Vite portfolio project`
2. `Build pixel game shell and portfolio layout`
3. `Refine reward gating and design documentation`
4. `Polish responsive quest experience`
5. `Finalize verification and local run notes`

## Controls

- Move: `ArrowLeft`, `ArrowRight`, `A`, `D`
- Jump: `Space`, `ArrowUp`, `W`
- Mobile: touch buttons appear on smaller screens
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

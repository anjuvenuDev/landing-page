# Memory Quest deployment

Static React/Vite site. No backend, account setup, or API keys required.

## Validate and build

```sh
npm ci
npm run lint
npm run test:levels
npm run build
npm run preview
```

Deploy `dist/` to any static host, or import the repository into Vercel using the included `vercel.json`. The Vercel build command is `npm run build`; output directory is `dist`. No production deployment has been created by this task.

The game engine is lazy-loaded only on entering a level. Progress is saved locally in the visitor's browser; browsing the treasury does not unlock game progress. Direct section links use `?view=journal&section=projects`; expanded links use `?view=slides&section=projects`.

Fullscreen uses the browser Fullscreen API when supported, and an expanded in-page layout otherwise. Mobile landscape and portrait use the same playable level geometry. Voice autoplay is deliberately absent; the opening uses readable, skippable typewritten narration. Reduced motion is supported through OS preferences and the sun control.

## Artwork

`public/assets/memory-forest.webp` is the optimized production background, generated using the built-in image generation tool. Prompt: a cinematic 16-bit enchanted twilight forest, teal pines and layered mountains, crescent moon, warm cabin and golden path, dark central space for typography, no lettering or people. The original PNG is retained. Existing avatar, environment and treasury assets are reused.

## Release checks

- Fresh visit opens the centered narration with Anjana's avatar.
- Skip story leads to both Play the quest and Open treasury.
- Eight roadmap nodes select distinct progressively harder levels.
- Spark collection gates the rune box; falls retain collected sparks.
- Pause/resume, restart, keyboard and touch controls work.
- Each treasury chapter has compact and fullscreen layouts, chapter navigation and a next-level action.
- Verify a full run on the target phone/browser before production publication.

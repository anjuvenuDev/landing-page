export type PlatformPattern = { x: number; rise: number; tiles: number; lifted?: boolean };
const titles = ['The Sunlit Trail', 'The Maker’s Grove', 'The Winding Wood', 'The Crystal Crossing', 'The Whispering Canopy', 'The Guild’s Ascent', 'The Moonlit Gauntlet', 'The Memory Archive'];
const descriptions = [
  'Find your feet on generous platforms and gentle gaps. A quiet first walk through the woods.',
  'The trail gets longer. Build a rhythm as the gaps widen and the ledges climb.',
  'Watch for the first forest guardian. Jump over it, then keep your momentum across the gaps.',
  'Narrower landings and two guardians ask for deliberate, well-timed jumps.',
  'Three guardians patrol the canopy. Watch their rhythm before you leap.',
  'Four guardians and rising ledges. Find a safe moment, then commit to the jump.',
  'Five guardians, tighter footing, and a longer moonlit trail. Make every landing count.',
  'The final test combines the longest course, the tightest gaps, and six guardians. Recover the last memory.',
];
export const challenges = titles.map((name, index) => {
  const count = 5 + Math.floor(index / 2);
  const gap = 1.45 + index * .1;
  let x = 0;
  const platforms: PlatformPattern[] = Array.from({ length: count }, (_, i) => {
    const tiles = i === 0 ? 9 : i === count - 1 ? 10 : 8 - Math.floor(index / 3);
    const platform = { x, rise: i % 2 === 0 ? .15 : .5 + index * .045, tiles };
    x += tiles + gap;
    return platform;
  });
  return { name, description: descriptions[index], difficulty: ['Beginner', 'Easy', 'Adventurer', 'Intermediate', 'Challenging', 'Advanced', 'Expert', 'Final trial'][index], platforms, hazards: Math.max(0, index - 1), gap, background: ['sunset', 'pine-forest', 'jungle', 'teal-forest', 'mist-forest', 'moon-mountain', 'blue-moon', 'ember-woods'][index] };
});

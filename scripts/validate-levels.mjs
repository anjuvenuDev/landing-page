const avatarScale = 0.62;
const platformSurfaceInset = 16;
const maxRunVelocity = 360;
const jumpVelocity = 520;
const gravity = 1150;
const minimumPitUnits = 1.4;
const coursePatterns = [
  [
    { x: 0, rise: 0, tiles: 10 },
    { x: 12.35, rise: 0.76, tiles: 8 },
    { x: 22.55, rise: 1.32, tiles: 8, lifted: true },
    { x: 32.35, rise: 0.88, tiles: 8 },
    { x: 42.4, rise: 0.12, tiles: 12 },
  ],
  [
    { x: 0, rise: 0, tiles: 9 },
    { x: 11.65, rise: 0.44, tiles: 7 },
    { x: 20.85, rise: 1.04, tiles: 9, lifted: true },
    { x: 32.15, rise: 1.48, tiles: 7 },
    { x: 41.55, rise: 0.7, tiles: 11 },
  ],
  [
    { x: 0, rise: 0, tiles: 11 },
    { x: 13.45, rise: 1.02, tiles: 7 },
    { x: 22.95, rise: 0.42, tiles: 8 },
    { x: 32.9, rise: 1.22, tiles: 8, lifted: true },
    { x: 43.15, rise: 0.38, tiles: 12 },
  ],
  [
    { x: 0, rise: 0, tiles: 10 },
    { x: 12.15, rise: 0.64, tiles: 8 },
    { x: 22.4, rise: 1.5, tiles: 7, lifted: true },
    { x: 31.75, rise: 0.64, tiles: 9 },
    { x: 43.05, rise: 1.02, tiles: 10 },
  ],
];

const viewportHeights = [520, 640, 768, 900];
const levelCount = 8;

function courseScale(height) {
  return Math.max(3, Math.min(4, Math.round(height / 260)));
}

function playerYForSurface(surfaceY) {
  const avatarSpriteHeight = 250;
  const bodyHeight = Math.max(78, Math.floor(avatarSpriteHeight * 0.34));
  const bodyOffsetY = Math.max(0, avatarSpriteHeight - bodyHeight);
  const avatarBodyBottomOffset = (bodyOffsetY + bodyHeight - avatarSpriteHeight) * avatarScale;
  return surfaceY - avatarBodyBottomOffset;
}

function buildCourse(level, height) {
  const tileScale = courseScale(height);
  const unit = 16 * tileScale;
  const baseY = height - Math.max(126, unit * 2.2);
  const lift = Math.min(level - 1, 5) * (unit * 0.14);
  const pattern = coursePatterns[(level - 1) % coursePatterns.length];
  const platforms = pattern.map((platform) => ({
    x: platform.x * unit,
    y: baseY - platform.rise * unit - (platform.lifted ? lift : 0),
    tiles: platform.tiles,
  }));

  const platformSurfaces = platforms.map((platform) => {
    const width = platform.tiles * unit;
    const bodyWidth = width - unit * 0.16;
    const left = platform.x + (width - bodyWidth) / 2;
    const right = left + bodyWidth;
    return {
      kind: "platform",
      left,
      right,
      y: platform.y + platformSurfaceInset * tileScale,
      margin: Math.max(24, unit * 0.72),
    };
  });

  const finalPlatform = platforms[4];
  const finalSurfaceY = finalPlatform.y + platformSurfaceInset * tileScale;
  const triggerX = finalPlatform.x + unit * Math.min(2.4, finalPlatform.tiles - 4.2);
  const chestX = finalPlatform.x + unit * Math.min(6.5, finalPlatform.tiles - 2.2);
  return {
    tileScale,
    unit,
    platforms,
    platformSurfaces,
    safeSurfaces: platformSurfaces,
    spawn: { x: unit * 2.1, y: playerYForSurface(platformSurfaces[0].y) },
    triggerBox: { x: triggerX, y: finalSurfaceY },
    chest: { x: chestX, y: finalSurfaceY },
  };
}

function jumpTime(startY, targetY) {
  const deltaY = targetY - startY;
  const a = 0.5 * gravity;
  const b = -jumpVelocity;
  const c = -deltaY;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 0;
  return (-b + Math.sqrt(discriminant)) / (2 * a);
}

function canReach(from, to) {
  const gap = Math.max(0, to.left + to.margin - (from.right - from.margin));
  if (gap === 0) return true;
  const time = jumpTime(from.y, to.y);
  const reachable = Math.max(0, maxRunVelocity * time - 18);
  return gap <= reachable;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const results = [];

for (let level = 1; level <= levelCount; level += 1) {
  for (const height of viewportHeights) {
    const course = buildCourse(level, height);
    const first = course.platformSurfaces[0];
    const last = course.platformSurfaces.at(-1);

    assert(first, `level ${level} height ${height}: missing first platform`);
    assert(last, `level ${level} height ${height}: missing final platform`);
    assert(course.spawn.x > first.left + first.margin, `level ${level} height ${height}: spawn starts too close to left edge`);
    assert(course.spawn.x < first.right - first.margin, `level ${level} height ${height}: spawn starts too close to right edge`);
    assert(Math.abs(course.spawn.y - playerYForSurface(first.y)) < 0.1, `level ${level} height ${height}: spawn is not on first surface`);

    for (let index = 0; index < course.platformSurfaces.length - 1; index += 1) {
      const current = course.platformSurfaces[index];
      const next = course.platformSurfaces[index + 1];
      const visiblePit = next.left - current.right;
      assert(visiblePit >= course.unit * minimumPitUnits, `level ${level} height ${height}: platform ${index + 1} to ${index + 2} has no meaningful pit`);
      assert(canReach(current, next), `level ${level} height ${height}: platform ${index + 1} cannot reach platform ${index + 2}`);
    }

    for (const surface of course.safeSurfaces) {
      assert(surface.left < surface.right, `level ${level} height ${height}: invalid ${surface.kind} width`);
      assert(surface.margin * 2 < surface.right - surface.left, `level ${level} height ${height}: ${surface.kind} safe margin consumes surface`);
      assert(Number.isFinite(surface.y), `level ${level} height ${height}: ${surface.kind} surface is not finite`);
    }

    assert(course.triggerBox.x > last.left + last.margin, `level ${level} height ${height}: unlock box is before safe final platform`);
    assert(course.triggerBox.x < last.right - last.margin, `level ${level} height ${height}: unlock box is past safe final platform`);
    assert(course.triggerBox.y === last.y, `level ${level} height ${height}: unlock box is not on final surface`);
    assert(course.chest.x > last.left, `level ${level} height ${height}: chest is before final platform`);
    assert(course.chest.x < last.right, `level ${level} height ${height}: chest is past final platform`);
    assert(course.chest.y === last.y, `level ${level} height ${height}: chest is not on final surface`);

    results.push(`level ${level} @ ${height}px`);
  }
}

console.log(`Validated ${results.length} level layouts: ${results.join(", ")}`);

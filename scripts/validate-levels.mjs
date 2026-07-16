const avatarScale = 0.62;
const platformSurfaceInset = 16;
const maxRunVelocity = 360;
const jumpVelocity = 520;
const gravity = 1150;
const minimumPitUnits = 1.4;

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
  const platforms = [
    { x: 0, y: baseY, tiles: 10 },
    { x: unit * 12.35, y: baseY - unit * 0.76, tiles: 8 },
    { x: unit * 22.55, y: baseY - unit * 1.32 - lift, tiles: 8 },
    { x: unit * 32.35, y: baseY - unit * 0.88, tiles: 8 },
    { x: unit * 42.4, y: baseY - unit * 0.12, tiles: 12 },
  ];

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

  const crateSurfaces = [
    boxSurface(platforms[0].x + unit * 9.8, platformSurfaces[0].y, tileScale),
  ];
  if (level > 2) {
    crateSurfaces.push(boxSurface(platforms[1].x + unit * 5.6, platformSurfaces[1].y, tileScale));
  }
  if (level > 4) {
    crateSurfaces.push(boxSurface(platforms[3].x + unit * 5.5, platformSurfaces[3].y, tileScale));
  }

  const finalPlatform = platforms[4];
  const midPlatform = platforms[3];
  return {
    tileScale,
    unit,
    platforms,
    platformSurfaces,
    safeSurfaces: [...platformSurfaces, ...crateSurfaces],
    spawn: { x: unit * 2.1, y: playerYForSurface(platformSurfaces[0].y) },
    shard: { x: midPlatform.x + unit * 4.8, y: midPlatform.y - unit * 0.88 },
    chest: { x: finalPlatform.x + finalPlatform.tiles * unit - unit * 2.1, y: finalPlatform.y - unit * 0.72 },
  };
}

function boxSurface(x, surfaceY, tileScale) {
  const boxScale = tileScale / 2;
  const boxWidth = 32 * boxScale;
  const boxHeight = 32 * boxScale;
  const halfWidth = boxWidth / 2;
  return {
    kind: "crate",
    left: x - halfWidth,
    right: x + halfWidth,
    y: surfaceY - boxHeight,
    margin: Math.max(5, halfWidth * 0.18),
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

    assert(course.shard.x > course.platformSurfaces[3].left, `level ${level} height ${height}: shard is before its platform`);
    assert(course.shard.x < course.platformSurfaces[3].right, `level ${level} height ${height}: shard is past its platform`);
    assert(course.chest.x > last.left, `level ${level} height ${height}: chest is before final platform`);
    assert(course.chest.x < last.right, `level ${level} height ${height}: chest is past final platform`);

    results.push(`level ${level} @ ${height}px`);
  }
}

console.log(`Validated ${results.length} level layouts: ${results.join(", ")}`);

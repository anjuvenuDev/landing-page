import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/game/levels.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { challenges } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
let tested = 0;
for (const [index, level] of challenges.entries()) {
  assert.ok(level.platforms.length >= 5);
  if (index) {
    assert.ok(level.gap > challenges[index - 1].gap, 'Gaps must increase at every level');
    assert.ok(level.hazards >= challenges[index - 1].hazards, 'Hazards cannot decrease');
    assert.notDeepEqual(level.platforms, challenges[index - 1].platforms, 'Every course must be distinct');
  }
  for (const height of [420, 520, 620, 768, 900]) {
    const unit = 16 * Math.max(3, Math.min(4, Math.round(height / 260)));
    const base = height - Math.max(126, unit * 2.2);
    for (let i = 0; i < level.platforms.length - 1; i++) {
      const from = level.platforms[i], to = level.platforms[i + 1];
      const gap = (to.x - from.x - from.tiles) * unit;
      const rise = (to.rise - from.rise) * unit;
      const discriminant = 520 ** 2 - 2 * 1150 * rise;
      assert.ok(discriminant > 0, `Level ${index + 1}: rise exceeds jump height`);
      const flightTime = (520 + Math.sqrt(discriminant)) / 1150;
      // Include safe landing margins, collision inset and 18px timing tolerance.
      assert.ok(gap + 1.6 * unit + 18 < 360 * flightTime, `Level ${index + 1}: gap ${i} unreachable at ${height}px`);
      assert.ok(to.tiles * unit > 2 * 360 ** 2 / (2 * 900), 'Landing must allow acceleration for next jump');
      assert.ok(base - to.rise * unit > 110, 'Platforms must leave room under HUD');
      tested++;
    }
    const last = level.platforms.at(-1);
    assert.ok(6.5 < last.tiles - .72, 'Chest must be safely inside final platform');
    assert.ok(2.4 < last.tiles - .72, 'Rune box must be safely inside final platform');
  }
  assert.ok(level.hazards <= level.platforms.length - 1);
}
console.log(`PASS: ${challenges.length} unique progressive levels; ${tested} jump trajectories across 5 viewport heights; safe landings, hazards and treasure placement.`);

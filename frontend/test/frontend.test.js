import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('frontend index.html exists and does not disable zoom', () => {
  const htmlPath = path.resolve(process.cwd(), 'index.html');
  assert.ok(fs.existsSync(htmlPath), 'index.html must exist');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(!html.includes('user-scalable=no'), 'Never disable browser zoom per DESIGN.md & CLAUDE.md');
  assert.ok(!html.includes('maximum-scale=1'), 'Never restrict maximum-scale per DESIGN.md & CLAUDE.md');
});

test('frontend tailwind config contains approved restream studio tokens', () => {
  const tailwindPath = path.resolve(process.cwd(), 'tailwind.config.js');
  assert.ok(fs.existsSync(tailwindPath), 'tailwind.config.js must exist');
  const tailwind = fs.readFileSync(tailwindPath, 'utf8');
  assert.match(tailwind, /#0B0F17/, 'Background token must match DESIGN.md');
  assert.match(tailwind, /#131B2E/, 'Surface token must match DESIGN.md');
});

test('frontend index.css defines all 3 Apex themes (dark, light, green)', () => {
  const cssPath = path.resolve(process.cwd(), 'src/index.css');
  assert.ok(fs.existsSync(cssPath), 'src/index.css must exist');
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.ok(css.includes('[data-theme="dark"]'), 'Dark theme token definitions must exist');
  assert.ok(css.includes('[data-theme="light"]'), 'Light theme token definitions must exist');
  assert.ok(css.includes('[data-theme="green"]'), 'Green theme token definitions must exist');
  assert.ok(css.includes('--bg-glow'), 'Atmospheric glow radial gradient must exist');
});


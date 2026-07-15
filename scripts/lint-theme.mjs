import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const roots = process.argv.slice(2);
const scanRoots = roots.length ? roots : ['src/app', 'src/styles'];

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const PALETTE = /var\(\s*--_?(primary|accent|neutral|sage|teal|cream)-\d/;
const EXTS = ['.ts', '.scss', '.html'];

function isAllowed(path) {
  return path.includes('/color-themes/') || basename(path) === '_tokens.scss';
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXTS.some(e => p.endsWith(e))) out.push(p);
  }
}

const files = [];
for (const r of scanRoots) {
  try { walk(r, files); } catch { /* root 不存在略過 */ }
}

const violations = [];
for (const f of files) {
  if (isAllowed(f)) continue;
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (HEX.test(line) || PALETTE.test(line)) violations.push(`${f}:${i + 1}: ${line.trim()}`);
  });
}

if (violations.length) {
  console.log('lint:theme 發現寫死色/底層色（請改綁 --mat-sys-* 或 --app-*）：');
  for (const v of violations) console.log('  ' + v);
  process.exit(1);
}
console.log('lint:theme 通過：無寫死色。');

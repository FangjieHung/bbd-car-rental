import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const PALETTE = /var\(\s*--_?(primary|accent|neutral|sage|teal|cream)-\d/;
const EXTS = ['.ts', '.scss', '.html'];

export function collectThemedAppRoots(appsDir = 'apps') {
  const roots = [];
  if (!existsSync(appsDir)) return roots;
  for (const name of readdirSync(appsDir)) {
    const src = join(appsDir, name, 'src');
    const styles = join(src, 'styles.scss');
    if (existsSync(styles) && readFileSync(styles, 'utf8').includes('theme-pack')) {
      roots.push(src);
    }
  }
  return roots;
}

export function isAllowed(path) {
  return path.includes('/color-themes/')
    || path.includes('/quill-content-style/')
    || basename(path) === '_tokens.scss';
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.some(e => p.endsWith(e))) out.push(p);
  }
}

export function runLint(scanRoots) {
  const files = [];
  for (const r of scanRoots) {
    try {
      const st = statSync(r);
      if (st.isDirectory()) walk(r, files);
      else if (EXTS.some(e => r.endsWith(e))) files.push(r);
    } catch { /* root 不存在略過 */ }
  }
  const violations = [];
  for (const f of files) {
    if (isAllowed(f)) continue;
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (HEX.test(line) || PALETTE.test(line)) violations.push(`${f}:${i + 1}: ${line.trim()}`);
    });
  }
  return violations;
}

// 直接執行時：掃 libs/theme-pack + 所有有套主題的 app（或 CLI 指定的路徑）
if (import.meta.url === `file://${process.argv[1]}`) {
  const cliRoots = process.argv.slice(2);
  const scanRoots = cliRoots.length
    ? cliRoots
    : ['libs/theme-pack/src', ...collectThemedAppRoots('apps')];
  const violations = runLint(scanRoots);
  if (violations.length) {
    console.log('lint:theme 發現寫死色/底層色（請改綁 --mat-sys-* 或 --app-*）：');
    for (const v of violations) console.log('  ' + v);
    process.exit(1);
  }
  console.log('lint:theme 通過：無寫死色。');
}

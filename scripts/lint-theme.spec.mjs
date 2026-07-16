import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectThemedAppRoots } from './lint-theme.mjs';

function run(dir) {
  try {
    execFileSync('node', ['scripts/lint-theme.mjs', dir], { encoding: 'utf8' });
    return { code: 0, out: '' };
  } catch (e) {
    return { code: e.status, out: e.stdout?.toString() ?? '' };
  }
}

describe('lint-theme', () => {
  it('掃到寫死色 → exit 1 並列出檔案', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lt-'));
    writeFileSync(join(dir, 'bad.scss'), '.x { color: #ff0000; }');
    const r = run(dir);
    expect(r.code).toBe(1);
    expect(r.out).toContain('bad.scss');
  });

  it('乾淨（只用 token）→ exit 0', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lt-'));
    writeFileSync(join(dir, 'ok.scss'), '.x { color: var(--mat-sys-primary); }');
    expect(run(dir).code).toBe(0);
  });

  it('_tokens.scss 允許寫死色 → exit 0', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lt-'));
    mkdirSync(join(dir, 'material'), { recursive: true });
    writeFileSync(join(dir, 'material', '_tokens.scss'), '--x: #ff0000;');
    expect(run(dir).code).toBe(0);
  });

  it('scanRoot 可以是單一 .scss 檔（非目錄）→ 也會被 lint', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lt-'));
    const file = join(dir, 'single.scss');
    writeFileSync(file, '.x { color: #ff0000; }');
    const r = run(file);
    expect(r.code).toBe(1);
    expect(r.out).toContain('single.scss');
  });

  it('collectThemedAppRoots 只回傳有 @use theme-pack 的 app', () => {
    const base = mkdtempSync(join(tmpdir(), 'lt-'));
    const apps = join(base, 'apps');
    for (const [name, styles] of [
      ['admin', "@use 'theme-pack/src/lib/styles/skeleton';"],
      ['store', "@use 'tailwindcss';"],
    ]) {
      mkdirSync(join(apps, name, 'src'), { recursive: true });
      writeFileSync(join(apps, name, 'src', 'styles.scss'), styles);
    }
    const roots = collectThemedAppRoots(apps);
    expect(roots).toHaveLength(1);
    expect(roots[0].endsWith(join('admin', 'src'))).toBe(true);
  });
});

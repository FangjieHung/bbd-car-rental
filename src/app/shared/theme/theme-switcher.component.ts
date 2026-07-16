import { Component, inject } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { PARADIGMS, COLOR_THEMES } from '../../core/theme/theme.token';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <section class="theme-panel" aria-label="外觀設定">
      <p class="theme-panel__title">外觀</p>

      <div class="theme-row">
        <span class="theme-row__label">範式</span>
        <div class="theme-row__options" role="group" aria-label="範式">
          @for (p of paradigms; track p.id) {
            <button
              type="button"
              class="theme-pill"
              [class.is-active]="theme.paradigm() === p.id"
              [attr.aria-pressed]="theme.paradigm() === p.id"
              (click)="onParadigm(p.id)"
            >
              {{ p.label }}
            </button>
          }
        </div>
      </div>

      <div class="theme-row">
        <span class="theme-row__label">配色</span>
        <div class="theme-row__options" role="group" aria-label="配色">
          @for (c of colorThemes; track c.id) {
            <button
              type="button"
              class="theme-pill"
              [class.is-active]="theme.theme() === c.id"
              [attr.aria-pressed]="theme.theme() === c.id"
              (click)="onTheme(c.id)"
            >
              {{ c.label }}
            </button>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .theme-panel {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
    }
    .theme-panel__title {
      margin: 0;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--app-shell-on-muted);
    }
    .theme-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .theme-row__label {
      font-size: 0.75rem;
      color: var(--app-shell-on-muted);
    }
    .theme-row__options {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .theme-pill {
      flex: 1 1 auto;
      padding: 6px 10px;
      border: 0;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--app-shell-on-muted);
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      transition: background 160ms ease, color 160ms ease;
    }
    .theme-pill:hover {
      background: rgba(255, 255, 255, 0.14);
      color: var(--app-shell-on);
    }
    .theme-pill.is-active {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }
  `,
})
export class ThemeSwitcherComponent {
  readonly theme = inject(ThemeService);
  readonly paradigms = PARADIGMS;
  readonly colorThemes = COLOR_THEMES;
  onParadigm(id: string) { this.theme.setParadigm(id); }
  onTheme(id: string) { this.theme.setTheme(id); }
}

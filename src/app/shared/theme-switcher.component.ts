import { Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../core/theme/theme.service';
import { PARADIGMS, COLOR_THEMES } from '../core/theme/theme.token';

@Component({
  selector: 'app-theme-switcher',
  imports: [MatSelectModule, FormsModule],
  template: `
    <mat-select [ngModel]="theme.paradigm()" (ngModelChange)="onParadigm($event)" aria-label="範式">
      @for (p of paradigms; track p.id) { <mat-option [value]="p.id">{{ p.label }}</mat-option> }
    </mat-select>
    <mat-select [ngModel]="theme.theme()" (ngModelChange)="onTheme($event)" aria-label="配色">
      @for (c of colorThemes; track c.id) { <mat-option [value]="c.id">{{ c.label }}</mat-option> }
    </mat-select>
  `,
  styles: `
    :host {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    mat-select {
      min-width: 6rem;
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

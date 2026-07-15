import { Component, input } from '@angular/core';

export type ChipTone = 'green' | 'blue' | 'gray' | 'red' | 'yellow';

// Verdant StatusPill：膠囊 + 色點（tone 對應 success/info/neutral/error/warning）
const TONE_STYLE: Record<ChipTone, { bg: string; fg: string; dot: string }> = {
  green: { bg: 'var(--app-positive-bg)', fg: 'var(--app-positive-fg)', dot: 'var(--app-positive-dot)' },
  blue: { bg: 'var(--app-info-bg)', fg: 'var(--app-info-fg)', dot: 'var(--app-info-dot)' },
  gray: { bg: 'var(--mat-sys-surface-container-high)', fg: 'var(--mat-sys-on-surface-variant)', dot: 'var(--mat-sys-outline)' },
  red: { bg: 'var(--app-danger-bg)', fg: 'var(--app-danger-fg)', dot: 'var(--app-danger-dot)' },
  yellow: { bg: 'var(--app-warning-bg)', fg: 'var(--app-warning-fg)', dot: 'var(--app-warning-dot)' },
};

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss'],
})
export class StatusChipComponent {
  readonly label = input.required<string>();
  readonly tone = input.required<ChipTone>();
  get s(): { bg: string; fg: string; dot: string } {
    return TONE_STYLE[this.tone()];
  }
}

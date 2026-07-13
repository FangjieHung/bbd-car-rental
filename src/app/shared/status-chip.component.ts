import { Component, input } from '@angular/core';

export type ChipTone = 'green' | 'blue' | 'gray' | 'red' | 'yellow';

// Verdant StatusPill：膠囊 + 色點（tone 對應 success/info/neutral/error/warning）
const TONE_STYLE: Record<ChipTone, { bg: string; fg: string; dot: string }> = {
  green: { bg: 'var(--status-success-bg)', fg: 'var(--status-success-fg)', dot: 'var(--status-success-dot)' },
  blue: { bg: 'var(--status-info-bg)', fg: 'var(--status-info-fg)', dot: 'var(--status-info-dot)' },
  gray: { bg: 'var(--surface-pill)', fg: 'var(--text-secondary)', dot: 'var(--cream-400)' },
  red: { bg: 'var(--status-error-bg)', fg: 'var(--status-error-fg)', dot: 'var(--status-error-dot)' },
  yellow: { bg: 'var(--status-warning-bg)', fg: 'var(--status-warning-fg)', dot: 'var(--status-warning-dot)' },
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

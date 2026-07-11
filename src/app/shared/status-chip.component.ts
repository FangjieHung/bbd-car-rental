import { Component, input } from '@angular/core';

export type ChipTone = 'green' | 'blue' | 'gray' | 'red' | 'yellow';

const TONE_CLASS: Record<ChipTone, string> = {
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-200 text-gray-700',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
};

@Component({
  selector: 'app-status-chip',
  template: `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {{ toneClass }}">{{ label() }}</span>`,
})
export class StatusChipComponent {
  readonly label = input.required<string>();
  readonly tone = input.required<ChipTone>();
  get toneClass(): string {
    return TONE_CLASS[this.tone()];
  }
}

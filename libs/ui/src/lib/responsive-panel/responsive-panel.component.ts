import { Component, input, output } from '@angular/core';

@Component({
  selector: 'lib-responsive-panel',
  templateUrl: './responsive-panel.component.html',
  styleUrl: './responsive-panel.component.scss',
})
export class ResponsivePanelComponent {
  readonly open = input(false);
  readonly heading = input('');
  readonly closeLabel = input.required<string>();
  readonly closed = output<void>();
}

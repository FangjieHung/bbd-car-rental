import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ZH_TW } from '../../core/i18n/zh-tw';
import { TimelineViewComponent } from './timeline-view.component';

@Component({
  selector: 'app-dispatch-page',
  imports: [MatButtonToggleModule, TimelineViewComponent],
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 class="text-xl font-bold">{{ t.dispatch.title }}</h1>
        <mat-button-toggle-group [value]="view()" (change)="setView($event.value)">
          <mat-button-toggle value="timeline">{{ t.dispatch.timeline }}</mat-button-toggle>
          <mat-button-toggle value="calendar">{{ t.dispatch.calendar }}</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
      @if (view() === 'timeline') {
        <app-timeline-view />
      } @else {
        <p class="text-gray-500">calendar（Task 13）</p>
      }
    </div>
  `,
})
export class DispatchPageComponent {
  protected readonly t = ZH_TW;
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly view = toSignal(
    this.route.queryParamMap.pipe(map(p => (p.get('view') === 'calendar' ? 'calendar' : 'timeline'))),
    { initialValue: 'timeline' as const },
  );

  setView(view: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { view }, queryParamsHandling: 'merge' });
  }
}

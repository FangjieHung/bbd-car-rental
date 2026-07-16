import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { TimelineViewComponent } from '../timeline-view.component';
import { CalendarViewComponent } from '../calendar-view.component';

@Component({
  selector: 'app-dispatch-page',
  imports: [MatButtonToggleModule, TimelineViewComponent, CalendarViewComponent],
  templateUrl: './dispatch-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class DispatchPageComponent {
  protected readonly t = ZH_TW;
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly view = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => (p.get('view') === 'calendar' ? 'calendar' : 'timeline')),
    ),
    { initialValue: 'timeline' as const },
  );

  setView(view: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }
}

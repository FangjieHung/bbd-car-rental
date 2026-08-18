import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BOOKING_CONTEXT } from '../booking-context';

@Component({
  selector: 'app-booking-done',
  imports: [RouterLink],
  templateUrl: './done.component.html',
  styleUrl: './done.component.scss',
})
export class DoneComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly context = inject(BOOKING_CONTEXT);

  readonly bookingId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  /** 夥伴情境要回到夥伴的搜尋頁，不能把客人踢出夥伴品牌的網址 */
  protected readonly homeLink = this.context.basePath;
}

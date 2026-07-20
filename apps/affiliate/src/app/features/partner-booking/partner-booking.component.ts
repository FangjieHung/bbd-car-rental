import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PARTNER_REPO } from '@car-rental/domain';
import { BookingFlowComponent, FlowMode } from '@car-rental/booking-flow';

@Component({
  selector: 'app-partner-booking',
  imports: [BookingFlowComponent],
  templateUrl: './partner-booking.component.html',
  styleUrl: './partner-booking.component.scss',
})
export class PartnerBookingComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly partnerRepo = inject(PARTNER_REPO);

  readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly partner = computed(() => {
    const slug = this.slug();
    if (!slug) return null;
    return this.partnerRepo.getAll().find((p) => p.slug === slug) ?? null;
  });

  readonly mode = computed<FlowMode>(() => {
    const partner = this.partner();
    return partner ? { kind: 'partner', partner } : { kind: 'consumer' };
  });
}

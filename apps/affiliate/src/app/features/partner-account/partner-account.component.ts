import { Component, computed, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PartnerAccountStore } from '../../stores/partner-account.store';

@Component({
  selector: 'app-partner-account',
  imports: [SlicePipe],
  templateUrl: './partner-account.component.html',
  styleUrl: './partner-account.component.scss',
})
export class PartnerAccountComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PartnerAccountStore);

  readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly account = computed(() => {
    const slug = this.slug();
    if (!slug) return null;
    return this.store.getAccount(slug);
  });
}

import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Partner } from '@car-rental/domain';
import { providePartnerBookingContext } from '../booking-context';
import { DoneComponent } from './done.component';

const partner: Partner = {
  id: 'pt1',
  name: '海景民宿',
  slug: 'seaview',
  discountPercent: 10,
  commission: { type: 'percent', value: 5 },
};

function setup(opts: { partnerContext?: boolean } = {}) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(convertToParamMap({ id: 'b1' })) },
      },
      ...(opts.partnerContext
        ? [providePartnerBookingContext(signal(partner), signal('seaview'))]
        : []),
    ],
  });
  return TestBed.runInInjectionContext(() => new DoneComponent());
}

describe('DoneComponent', () => {
  it('consumer 情境下返回首頁連結為 [\'/\']，不會把客人踢出當前品牌網址', () => {
    const component = setup();
    expect(component['homeLink']()).toEqual(['/']);
  });

  it('夥伴情境下返回首頁連結帶夥伴 slug，不會把客人踢出夥伴品牌網址', () => {
    const component = setup({ partnerContext: true });
    expect(component['homeLink']()).toEqual(['/p', 'seaview']);
  });
});

import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Partner, PARTNER_REPO, createInMemoryRepo } from '@car-rental/domain';
import { PartnerShellComponent } from './partner-shell.component';

const partners: Partner[] = [
  { id: 'pt1', name: '海景民宿', slug: 'seaview', discountPercent: 8, commission: { type: 'percent', value: 10 } },
];

function setup(slug: string) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PartnerShellComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(new Map([['slug', slug]])) },
      },
      { provide: PARTNER_REPO, useValue: createInMemoryRepo<Partner>(partners) },
    ],
  });
  const fixture = TestBed.createComponent(PartnerShellComponent);
  fixture.detectChanges();
  return fixture;
}

describe('PartnerShellComponent', () => {
  it('slug 找不到對應 partner 時顯示「連結無效」', () => {
    const fixture = setup('no-such-slug');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('連結無效');
    expect(text).toContain('找不到對應的合作夥伴，請確認連結是否正確。');
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeNull();
  });

  it('slug 為空時同樣視為連結無效', () => {
    const fixture = setup('');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('連結無效');
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeNull();
  });

  it('slug 對應到 partner 時渲染 router-outlet，不顯示「連結無效」', () => {
    const fixture = setup('seaview');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('連結無效');
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});

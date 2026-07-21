import { Injectable, Signal, inject, signal } from '@angular/core';
import { Partner } from '../../core/models';
import { PARTNER_REPO } from '../../core/repositories/tokens';

// 純前端 mock 階段，apps/affiliate 是獨立的 app（獨立 origin），預設跑在 4400
// （見 apps/affiliate/project.json 的 serve port）。「複製代訂連結」若只給相對路徑
// `/p/:slug`，貼到瀏覽器網址列會被當成「目前站台（admin）底下的 /p/:slug」打開，
// 而 admin 沒有這條路由 → 導回首頁，連結形同打不開。故此處組出含 origin 的完整網址。
// 接真後端／正式網域後，這裡要換成環境設定注入的 affiliate 網域，而不是寫死 localhost。
const AFFILIATE_ORIGIN = 'http://localhost:4400';

@Injectable({ providedIn: 'root' })
export class PartnerStore {
  private repo = inject(PARTNER_REPO);
  private _partners = signal<Partner[]>(this.repo.getAll());
  readonly partners: Signal<Partner[]> = this._partners.asReadonly();

  isSlugUnique(slug: string, excludeId?: string): boolean {
    const norm = slug.trim().toLowerCase();
    return !this.repo
      .getAll()
      .some((p) => p.id !== excludeId && p.slug.toLowerCase() === norm);
  }

  bookingLink(partner: Partner): string {
    return `${AFFILIATE_ORIGIN}/p/${partner.slug}`;
  }

  create(input: Omit<Partner, 'id'>): Partner {
    const p: Partner = { id: crypto.randomUUID(), ...input };
    this.repo.create(p);
    this._partners.set(this.repo.getAll());
    return p;
  }

  update(id: string, patch: Partial<Partner>): void {
    this.repo.update(id, patch);
    this._partners.set(this.repo.getAll());
  }

  remove(id: string): void {
    this.repo.remove(id);
    this._partners.set(this.repo.getAll());
  }
}

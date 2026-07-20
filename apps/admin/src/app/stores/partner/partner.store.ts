import { Injectable, Signal, inject, signal } from '@angular/core';
import { Partner } from '../../core/models';
import { PARTNER_REPO } from '../../core/repositories/tokens';

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
    return `/p/${partner.slug}`;
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

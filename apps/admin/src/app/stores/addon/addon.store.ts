import { Injectable, Signal, inject, signal } from '@angular/core';
import { AddOn } from '../../core/models';
import { ADDON_REPO } from '../../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class AddOnStore {
  private repo = inject(ADDON_REPO);
  private _addOns = signal<AddOn[]>(this.repo.getAll());
  readonly addOns: Signal<AddOn[]> = this._addOns.asReadonly();
  create(input: Omit<AddOn, 'id'>): AddOn {
    const a: AddOn = { id: crypto.randomUUID(), ...input };
    this.repo.create(a); this._addOns.set(this.repo.getAll()); return a;
  }
  update(id: string, patch: Partial<AddOn>): void { this.repo.update(id, patch); this._addOns.set(this.repo.getAll()); }
  remove(id: string): void { this.repo.remove(id); this._addOns.set(this.repo.getAll()); }
}

import { Injectable, Signal, inject, signal } from '@angular/core';
import { Customer } from '../../core/models';
import { CUSTOMER_REPO } from '../../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class CustomerStore {
  private repo = inject(CUSTOMER_REPO);
  private _customers = signal<Customer[]>(this.repo.getAll());
  readonly customers: Signal<Customer[]> = this._customers.asReadonly();

  create(input: Omit<Customer, 'id'>): Customer {
    const customer: Customer = { id: crypto.randomUUID(), ...input };
    this.repo.create(customer);
    this.reload();
    return customer;
  }

  update(id: string, patch: Partial<Omit<Customer, 'id'>>): void {
    this.repo.update(id, patch);
    this.reload();
  }

  remove(id: string): void {
    this.repo.remove(id);
    this.reload();
  }

  nameOf(id: string): string {
    return this._customers().find((c) => c.id === id)?.name ?? '—';
  }

  private reload(): void {
    this._customers.set(this.repo.getAll());
  }
}

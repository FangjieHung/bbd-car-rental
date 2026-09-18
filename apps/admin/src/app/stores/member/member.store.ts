import { Injectable, Signal, inject, signal } from '@angular/core';
import { Member } from '../../core/models';
import { MEMBER_REPO } from '../../core/repositories/tokens';

@Injectable({ providedIn: 'root' })
export class MemberStore {
  private repo = inject(MEMBER_REPO);
  private _members = signal<Member[]>(this.repo.getAll());
  readonly members: Signal<Member[]> = this._members.asReadonly();

  create(input: Omit<Member, 'id'>): Member {
    const member: Member = { id: crypto.randomUUID(), ...input };
    this.repo.create(member);
    this.reload();
    return member;
  }

  update(id: string, patch: Partial<Omit<Member, 'id'>>): void {
    this.repo.update(id, patch);
    this.reload();
  }

  remove(id: string): void {
    this.repo.remove(id);
    this.reload();
  }

  nameOf(id: string): string {
    return this._members().find((c) => c.id === id)?.name ?? '—';
  }

  private reload(): void {
    this._members.set(this.repo.getAll());
  }
}

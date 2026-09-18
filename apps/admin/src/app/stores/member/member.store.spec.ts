import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MemberStore } from './member.store';
import { MEMBER_REPO } from '../../core/repositories/tokens';
import { createInMemoryRepo } from '../../core/repositories/testing';
import { Member } from '../../core/models';

describe('MemberStore', () => {
  let store: MemberStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>() }],
    });
    store = TestBed.inject(MemberStore);
  });

  it('CRUD 與 nameOf', () => {
    const c = store.create({ name: '王小明', phone: '0912', kind: 'local' });
    expect(store.members()).toHaveLength(1);
    expect(store.nameOf(c.id)).toBe('王小明');
    expect(store.nameOf('nope')).toBe('—');
    store.update(c.id, { phone: '0999' });
    expect(store.members()[0].phone).toBe('0999');
    store.remove(c.id);
    expect(store.members()).toEqual([]);
  });
});

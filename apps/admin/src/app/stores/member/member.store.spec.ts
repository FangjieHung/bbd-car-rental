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
    const updated = store.update(c.id, { phone: '0999' });
    expect(store.members()[0].phone).toBe('0999');
    // update() 回傳更新後的完整 Member，呼叫端（例如 member-form-dialog）不必再另外查一次
    // 就能拿到最新資料，跟 create() 的回傳慣例一致。
    expect(updated).toEqual(store.members()[0]);
    store.remove(c.id);
    expect(store.members()).toEqual([]);
  });
});

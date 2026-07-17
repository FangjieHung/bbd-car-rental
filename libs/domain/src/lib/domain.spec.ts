// 空 lib 的測試骨架佔位 spec — 後續 Task 加入實際業務邏輯測試後可移除。
// 目的：讓 vitest-angular 的 unit-test executor 有至少一個 spec 可跑
// （@nx/angular:unit-test 在完全沒有 *.spec.ts 時會直接失敗，而非 0 tests 通過）。
describe('domain lib scaffold', () => {
  it('should have a working test runner', () => {
    expect(true).toBe(true);
  });
});

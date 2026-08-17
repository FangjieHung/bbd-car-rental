# Data Table Selection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the shared `lib-data-table` with opt-in row selection, select-all behavior, and selected-row batch actions without changing existing pages by default.

**Architecture:** Keep selection state inside the reusable table, keyed by the existing `rowId` function, and expose selected rows through `selectionChange` plus a `batchDelete` event. Preserve the existing export-all toolbar button and add a conditional batch toolbar for selected-row export, delete, and a content slot for page-specific actions. Support the standard table mode while leaving custom escape-hatch templates responsible for their own DOM.

**Tech Stack:** Angular standalone components, signals/input/output APIs, Vitest, Angular TestBed, existing `@car-rental/ui` data-table export helpers, SCSS.

---

### Task 1: Extend data-table contracts and labels

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.types.ts`
- Modify: `libs/ui/src/lib/data-table/data-table.slot.directives.ts` (or the existing slot-directive file path if the filename differs)
- Modify: `libs/ui/src/lib/data-table/data-table.component.spec.ts`
- Modify: every `DataTableLabels` object found by `rg -n "DataTableLabels|labels:" apps libs -g '*.ts'`

**Step 1: Write the failing type/contract tests**

Add compile-level assertions or a small TestBed host fixture proving that:

- `DataTableLabels` contains selection, batch-delete, and selected-export labels.
- A `dtBatchActions` template can be projected into the table.
- The component accepts `selectable`, `selection`, and listens for `selectionChange`/`batchDelete`.

**Step 2: Run the focused test to verify it fails**

Run: `npx nx test ui --runInBand`

Expected: FAIL because the new labels, directive, and component API do not exist yet.

**Step 3: Implement the contracts**

- Add the minimum label fields required for accessible checkbox labels and visible batch-button text.
- Add a `DataTableBatchActionsDirective` using the existing content-slot pattern, with a template context whose implicit value is `readonly T[]`.
- Export the directive from `libs/ui/src/index.ts`.
- Update all existing labels fixtures and app label objects with Traditional Chinese text so existing consumers remain type-safe.

**Step 4: Run the focused test to verify it passes**

Run: `npx nx test ui --runInBand`

Expected: PASS for the contract and existing tests.

**Step 5: Commit**

```bash
git add libs/ui/src/lib/data-table apps
git commit -m "feat: add data table selection contracts"
```

### Task 2: Add failing tests for selection behavior

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.component.spec.ts`

**Step 1: Write the failing tests**

Add focused tests that assert:

- Default `selectable=false` renders no checkbox or batch toolbar.
- `selectable=true` renders a checkbox in the first header/body column.
- Clicking one row emits exactly that row through `selectionChange` and reveals the batch toolbar.
- The header checkbox selects all current rows, emits all rows, and a second click clears them.
- A partially selected table sets the header checkbox to `indeterminate`.
- `batchDelete` emits the selected rows without deleting them internally.
- The selected-export button calls the export helper with selected rows, while export-all still uses all rows.
- Removing a row from `rows` removes its stale selection and emits the cleaned selection.
- The projected `dtBatchActions` receives the selected rows.

Use a real host component and DOM checkbox clicks; only mock the existing `xlsx` boundary already used by this spec.

**Step 2: Run the tests to verify they fail correctly**

Run: `npx nx test ui --runInBand`

Expected: FAIL on missing DOM/API or incorrect selection behavior, not on test setup errors.

### Task 3: Implement selection state and synchronization

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.component.ts`

**Step 1: Implement the minimal selection model**

- Add `selectable`, `selection`, `selectionChange`, and `batchDelete` inputs/outputs.
- Add a `selectedIds` signal keyed by `rowId()`.
- Derive selected rows, selected count, all-selected, and partially-selected state from current `rows()`.
- Synchronize external `selection` input and prune IDs that no longer exist in `rows()`.
- Add row toggle, select-all toggle, and batch-delete handlers.
- Keep custom mode behavior unchanged; selection rendering and toolbar must be scoped to standard mode.

**Step 2: Run the focused tests**

Run: `npx nx test ui --runInBand`

Expected: Selection state tests still fail only for missing template rendering or export wiring.

### Task 4: Implement checkbox column and conditional batch toolbar

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.component.html`
- Modify: `libs/ui/src/lib/data-table/data-table.component.scss`

**Step 1: Add the standard-mode DOM**

- Render a header checkbox and row checkboxes before `resolvedColumns()` when `selectable()` is true.
- Set the native header checkbox `indeterminate` property from the derived partial-selection state.
- Add accessible labels from `DataTableLabels`.
- Render the existing export-all button independently so its current behavior remains unchanged.
- Render a batch toolbar only when `selectable()` and selected count is greater than zero.
- Add buttons for batch delete and selected-only export, then project `dtBatchActions` with selected rows as implicit context.

**Step 2: Style and responsive behavior**

- Add a stable selection-cell width and focus-visible styles using existing table tokens.
- Keep the selection cell visible in both cards and scroll mobile modes.
- Avoid including checkbox markup as a data column in row export.

**Step 3: Run the focused tests**

Run: `npx nx test ui --runInBand`

Expected: DOM, accessibility, toolbar visibility, and slot tests pass.

### Task 5: Add selected-only export path

**Files:**
- Modify: `libs/ui/src/lib/data-table/data-table.component.ts`
- Modify: `libs/ui/src/lib/data-table/data-table.component.spec.ts`

**Step 1: Verify the red export assertion**

Run: `npx nx test ui --runInBand`

Expected: the selected-export assertion identifies the missing export dispatch or wrong row set.

**Step 2: Implement selected export**

- Reuse `exportRows(this.columns(), this.selectedRows(), selectedExportName)`.
- Keep custom-mode export behavior and export-all behavior unchanged.
- Route export failures through the existing `exportFailed` output.

**Step 3: Run the focused tests**

Run: `npx nx test ui --runInBand`

Expected: all data-table tests pass.

### Task 6: Enable selection on the required pages and wire batch actions

**Files:**
- Modify: page templates/components selected according to product need, starting with the existing standard-mode pages under `apps/admin/src/app/features/**/pages/`
- Test: corresponding page specs where batch delete or custom actions are wired

**Step 1: Add page-level failing tests**

For each enabled page, assert that `[selectable]` is on, selected rows are captured, and the page-specific batch action receives the selected rows. Keep pages without a batch use case disabled until explicitly enabled.

**Step 2: Implement page wiring**

- Add a signal for selected rows.
- Bind `[selectable]`, `[selection]`, and `(selectionChange)`.
- Bind `(batchDelete)` to the page’s existing confirmation/delete flow where applicable.
- Use `dtBatchActions` for any page-specific batch operation.

**Step 3: Run affected page tests**

Run: `npx nx affected -t test --base=HEAD~1 --head=HEAD`

Expected: all affected page tests pass.

### Task 7: Run full verification and review residual risks

**Files:**
- No new files; inspect all changed files and `git diff`.

**Step 1: Run validation**

Run: `npx nx affected -t lint,test,build`

Expected: exit code 0 with no failed lint, test, or build targets.

**Step 2: Review requirements against implementation**

Verify that:

- Selection is opt-in per page.
- Export-all remains available with original behavior.
- Selected-only export, delete, and custom slot are hidden until at least one row is selected.
- Header select-all supports indeterminate state.
- No checkbox is included in exported data.
- Existing custom mode and mobile behavior remain compatible.

**Step 3: Commit**

```bash
git add libs/ui apps docs/plans/2026-08-14-data-table-selection.md
git commit -m "feat: add selectable data table batch actions"
```


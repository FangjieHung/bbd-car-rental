# Dashboard Work List Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Calendar-aligned dashboard work-list table for pickups, returns, and next-day return preparation using the shared `lib-data-table` component.

**Architecture:** Keep the selected day in `DashboardPageComponent` as a `Date` signal, with today/tomorrow as shortcuts. Add a date-change output to `CalendarViewComponent` so calendar clicks update the parent date; pass the same date to timeline and derive work-list rows from the existing booking, vehicle, and customer stores. Use separate DataTable sections for pickups, returns, and the empty-return next-day preview so each section has a clear heading and empty state.

**Tech Stack:** Angular standalone components, signals/computed/output, `@car-rental/ui` DataTableComponent/DataTableCellDirective, Angular Material buttons, Vitest, Nx.

---

### Task 1: Add failing date-sync and work-list data tests

**Files:**
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.spec.ts`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view.spec.ts`

**Step 1: Write the failing tests**

- Verify dashboard work-list pickup and return rows use the selected calendar date and include both `confirmed` and `in_progress` bookings.
- Verify an empty selected-day return list exposes next-day returns for preparation.
- Verify Calendar emits the selected date when a day is clicked.

**Step 2: Run the tests to verify they fail**

Run: `npx nx test admin --skip-nx-cache`

Expected: FAIL because the dashboard has no work-list row computed values and Calendar has no date-change output.

### Task 2: Implement Calendar-as-source date flow and row derivation

**Files:**
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.html`

**Step 1: Add the minimal parent date state**

- Replace the today/tomorrow-only internal date assumption with a selected `Date` signal while retaining today/tomorrow shortcut labels.
- Derive target date, display date label, pickup rows, return rows, and next-day preview rows from that signal.
- Reuse the Calendar active booking rule (`confirmed` and `in_progress`) and existing vehicle/customer stores.

**Step 2: Add Calendar date output**

- Add an output that emits `startOfDay(d)` whenever a calendar day button is clicked.
- Keep the existing input synchronization for shortcut changes and preserve month navigation/detail selection.

**Step 3: Run focused tests**

Run: `npx nx test admin --skip-nx-cache`

Expected: PASS for the new date-flow and row-derivation tests.

### Task 3: Render the work list with shared DataTable

**Files:**
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts`
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.html`
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.scss` (create only if local layout styles are needed)

**Step 1: Add DataTable imports and column definitions**

- Import `DataTableComponent`, `DataTableCellDirective`, and `DataTableColumn` from `@car-rental/ui`.
- Add admin shared DataTable labels.
- Define columns for vehicle, customer, time, location, phone, wash, and payment; mark action/phone column excluded from export.
- Render unavailable flight, wash, and payment details as `—` or safe status text based on existing model fields.

**Step 2: Add grouped table sections**

- Add the 「今日工作清單」 header with the date toggle and selected date label.
- Render 「取車」 and 「還車」 DataTable sections with row counts.
- When returns are empty, render the next-day return preview section instead of pretending there are returns for the selected day.
- Use accessible `tel:` links with visible phone text.

**Step 3: Run focused test and lint**

Run: `npx nx test admin --skip-nx-cache`

Expected: PASS.

Run: `npx eslint apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts apps/admin/src/app/features/dashboard/pages/dashboard-page.component.spec.ts apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts`

Expected: PASS.

### Task 4: Verify the complete change

**Files:**
- Modify: none

**Step 1: Run the admin test suite**

Run: `npx nx test admin --skip-nx-cache`

Expected: all admin specs and tests pass.

**Step 2: Check formatting and references**

Run: `git diff --check && rg -n "content-grid|list-stack|list-row" apps/admin/src/app || true`

Expected: no diff errors; no removed dashboard list styles referenced by remaining pages.

**Step 3: Review the final diff**

Run: `git status --short && git diff --stat`

Expected: only intended dashboard/calendar files are changed in addition to pre-existing user changes.

**Step 4: Commit the implementation**

```bash
git add apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts apps/admin/src/app/features/dashboard/pages/dashboard-page.component.html apps/admin/src/app/features/dashboard/pages/dashboard-page.component.spec.ts apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.html apps/admin/src/app/features/dispatch/calendar-view.spec.ts
git commit -m "feat: add dashboard work list"
```

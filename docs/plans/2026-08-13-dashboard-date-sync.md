# Dashboard Date Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Synchronize the dashboard's today/tomorrow toggle across pickup/return cards and dispatch timeline/calendar views.

**Architecture:** `DashboardPageComponent` remains the single owner of the selected dashboard date and passes the resolved `Date` into the dispatch child components. The timeline uses that date as its range anchor, while the calendar accepts it as its initial selected day and still permits independent day inspection afterward.

**Tech Stack:** Angular standalone components, signals/computed values, Angular Material button toggles, Jest, Nx.

---

### Task 1: Add failing coverage for the shared dashboard date contract

**Files:**
- Create: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.spec.ts`
- Modify: `apps/admin/src/app/features/dispatch/timeline-view.spec.ts`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view.spec.ts`

**Step 1: Write the failing tests**

- Verify dashboard defaults to today and changes its resolved target date to tomorrow when `setSelectedDate('tomorrow')` is called.
- Verify timeline can be initialized with a supplied date and uses that date as its first visible day.
- Verify calendar can be initialized with a supplied date and selects that date.

**Step 2: Run tests to verify they fail**

Run: `npx nx test admin --testFile=apps/admin/src/app/features/dashboard/pages/dashboard-page.component.spec.ts`

Expected: FAIL because the dashboard date is not exposed as a child-compatible target date and dispatch components do not yet accept an input date.

Run: `npx nx test admin --testFile=apps/admin/src/app/features/dispatch/timeline-view.spec.ts`

Expected: FAIL because the timeline has no supplied-date input contract.

### Task 2: Implement the shared date input and synchronization

**Files:**
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts`
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.html`
- Modify: `apps/admin/src/app/features/dispatch/timeline-view.component.ts`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view.component.ts`

**Step 1: Add the minimal dashboard-to-child data flow**

- Expose the existing computed target date as the child input source.
- Bind the same target date to `<app-timeline-view>` and `<app-calendar-view>`.
- Keep the existing dashboard toggle and pickup/return computed filters unchanged except for using the shared resolved date.

**Step 2: Add timeline input handling**

- Add a required signal input for the target date.
- Initialize the 14-day `rangeStart` from the input when it is available.
- Keep previous/next range controls working by continuing to mutate `rangeStart` after initialization.
- Ensure the maintenance highlight compares against the actual current day, as before.

**Step 3: Add calendar input handling**

- Add a required signal input for the target date.
- When the input changes, update the displayed month and selected day to that target date.
- Avoid resetting the selected day after unrelated month navigation unless the user explicitly changes month.
- Preserve clicking any calendar day to inspect its details.

**Step 4: Run focused tests**

Run: `npx nx test admin --testFile=apps/admin/src/app/features/dashboard/pages/dashboard-page.component.spec.ts`

Expected: PASS.

Run: `npx nx test admin --testFile=apps/admin/src/app/features/dispatch/timeline-view.spec.ts`

Expected: PASS.

Run: `npx nx test admin --testFile=apps/admin/src/app/features/dispatch/calendar-view.spec.ts`

Expected: PASS.

### Task 3: Verify the complete admin application

**Files:**
- Modify: none

**Step 1: Run the relevant test suite**

Run: `npx nx test admin`

Expected: PASS with no regressions in dashboard or dispatch behavior.

**Step 2: Run lint**

Run: `npx nx lint admin`

Expected: PASS with no new lint errors.

**Step 3: Inspect the final diff and status**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the intended implementation files remain modified in addition to pre-existing user changes.

**Step 4: Commit the implementation**

```bash
git add apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts apps/admin/src/app/features/dashboard/pages/dashboard-page.component.html apps/admin/src/app/features/dashboard/pages/dashboard-page.component.spec.ts apps/admin/src/app/features/dispatch/timeline-view.component.ts apps/admin/src/app/features/dispatch/timeline-view.spec.ts apps/admin/src/app/features/dispatch/calendar-view.component.ts apps/admin/src/app/features/dispatch/calendar-view.spec.ts
git commit -m "feat: sync dashboard dispatch date"
```


# Search Submit Button Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a submit button to `PageToolbarComponent` that appears for non-blank search input and emits a normalized search request for current and future backend search flows.

**Architecture:** Keep the existing `query` model unchanged for compatibility with current page filtering. Add a `searchSubmit` output and a small submit handler shared by the button and Enter key; emit only `query().trim()` when non-empty. Keep the input, query, and expanded state intact after submit.

**Tech Stack:** Angular standalone component, Angular Signals/model/output, template control flow, Vitest, Angular Material icons/buttons.

---

### Task 1: Add failing component tests for submit behavior

**Files:**
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts`

**Step 1: Write the failing tests**

Add a `submitBtn` query helper and tests covering:

- The submit button is absent when `query()` is empty or whitespace-only.
- The submit button appears for non-blank query text.
- Clicking it emits `searchSubmit` with trimmed text.
- Pressing Enter on the input emits the same trimmed text.
- Whitespace-only input does not emit.

Use the component output subscription or an emitted-value array, and call `fixture.detectChanges()` after changing the signal so the DOM assertion reflects the current template state.

**Step 2: Run the focused test to verify it fails**

Run: `npx vitest run apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts`

Expected: FAIL because `searchSubmit`, the submit button, and the submit handlers do not exist yet.

### Task 2: Implement the submit event and conditional button

**Files:**
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.ts`
- Modify: `apps/admin/src/app/shared/ui/page-toolbar.component.html`
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts` only if an appropriate submit aria-label is not already available

**Step 1: Add the output and handler**

Add `readonly searchSubmit = output<string>();` and a handler that trims `query()`, returns without emitting when the result is empty, and otherwise emits the normalized value. Add an input keydown handler that calls the same submit handler only for Enter.

**Step 2: Render the conditional button**

Inside the existing search container, render a native `button type="button"` when `query().trim()` is non-empty. Give it a search submit icon and an accessible label. Wire its click event to the shared handler. Wire Enter on the input to the same handler, preserving the existing Escape behavior.

**Step 3: Add only necessary styling**

Reuse the existing `.search__toggle, .search__clear` button styling or extend it minimally so the submit button has the same size, focus-visible outline, hover treatment, and flex behavior. Do not alter the search width behavior unless the new button causes a verified narrow-screen overflow.

### Task 3: Verify the component and surrounding admin app

**Files:**
- No additional files expected.

**Step 1: Run the focused component tests**

Run: `npx vitest run apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts`

Expected: PASS, including all existing expand, clear, Escape, blur, and new submit cases.

**Step 2: Run the admin unit test target**

Run: `npx nx test admin`

Expected: PASS with no regressions in shared toolbar consumers.

**Step 3: Review the final diff and status**

Run: `git diff -- apps/admin/src/app/shared/ui/page-toolbar.component.ts apps/admin/src/app/shared/ui/page-toolbar.component.html apps/admin/src/app/shared/ui/page-toolbar.component.scss apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts && git status --short`

Confirm the diff contains only the requested submit behavior and does not stage or modify the user’s unrelated existing changes.

**Step 4: Commit the implementation**

```bash
git add apps/admin/src/app/shared/ui/page-toolbar.component.ts \
  apps/admin/src/app/shared/ui/page-toolbar.component.html \
  apps/admin/src/app/shared/ui/page-toolbar.component.scss \
  apps/admin/src/app/shared/ui/page-toolbar.component.spec.ts
git commit -m "feat: add explicit search submit action"
```

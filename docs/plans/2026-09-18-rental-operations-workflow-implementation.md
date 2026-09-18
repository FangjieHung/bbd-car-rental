# Rental Operations Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the admin-side rental operations workflow for identity checks, multi-payment accounting, versioned contracts, pickup/return, cancellation/refunds, customer credit, operator recovery, and dashboard warnings while keeping external services mocked behind explicit adapters.

**Architecture:** Keep `RentalBooking` as the fulfillment aggregate and move repeatable or versioned data into separate domain records and repositories. Put all calculations in pure functions under `libs/domain`, use Angular signal stores in `apps/admin`, and expose the workflow through one responsive 80vw booking workspace dialog plus focused child panels. Update `booking-flow` and all app providers atomically when the shared booking lifecycle changes.

**Tech Stack:** Angular 22 standalone components, Angular Material 22, Nx 23, TypeScript 6, signals, reactive forms, Vitest, localStorage repositories, development-only IndexedDB blob adapter.

---

## Execution rules and known baseline

- Before implementation, invoke `@superpowers:using-git-worktrees` and create an isolated worktree from commit `e99bb8f` or the latest descendant that contains the approved design docs.
- Use `@superpowers:test-driven-development` for every behavior change and `@ng19-nx-frontend-standard` plus `@ux-guidelines` for Angular/UI work.
- Preserve the current `Member` naming. Do not reintroduce `Customer` models or `cr.customers` storage keys.
- Do not store identity images, passport images, driver's-license images, or signature bitmaps in `localStorage`.
- The backend hand-off remains authoritative for production OCR, storage, Email, refunds, permissions, and legal rule updates.
- Every task below ends with a focused commit. Do not combine unrelated files in those commits.

Baseline observed on 2026-09-18:

- `domain:test`: 37 tests pass.
- `booking-flow:test`: does not compile because an in-progress insurance/summary API is incomplete.
- `admin:test`: 162/165 pass. Two unrelated failures are in `page-toolbar.component.spec.ts`; one overlapping failure is the current return-progress expectation.
- Do not modify the page-toolbar files as part of this feature. Record those two failures in the final report unless a separate upstream commit fixes them first.

## Task 1: Finish the existing insurance quote contract

This is a prerequisite because rental contracts must include insurance and `booking-flow` cannot currently compile.

**Files:**

- Modify: `libs/domain/src/lib/models/index.ts`
- Modify: `libs/domain/src/lib/models/vehicle.ts`
- Modify: `libs/domain/src/lib/models/price-breakdown.ts`
- Modify: `libs/domain/src/lib/pricing/calculate-price.ts`
- Modify: `libs/domain/src/lib/pricing/calculate-price.spec.ts`
- Modify: `libs/booking-flow/src/lib/quote.service.ts`
- Modify: `libs/booking-flow/src/lib/components/order-summary-card.component.ts`
- Modify: `libs/booking-flow/src/lib/components/order-summary-card.component.html`
- Modify: `libs/booking-flow/src/lib/components/order-summary-card.component.spec.ts`
- Verify: `libs/booking-flow/src/lib/pages/plan-page.component.spec.ts`

**Step 1: Write the failing domain tests**

Add cases proving that an optional insurance plan is charged once per rental day and is included in `total` and `insuranceSubtotal`:

```ts
it('adds the selected insurance plan for every rental day', () => {
  const result = calculatePrice({
    plan,
    calendar,
    startDate: '2026-01-05',
    endDate: '2026-01-08',
    addOns: [],
    insurancePlan: { id: 'safe', name: '安心方案', dailyPriceFrom: 200, tags: [], coverageItems: [] },
  });

  expect(result.insuranceSubtotal).toBe(600);
  expect(result.total).toBe(result.rentalSubtotal - result.couponDiscount + 600);
});
```

**Step 2: Run the focused test and confirm failure**

Run:

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
```

Expected: FAIL because `insurancePlan` and `insuranceSubtotal` are not part of the current contract.

**Step 3: Complete the domain API**

- Export `InsurancePlan` from `models/index.ts`.
- Add optional `insurancePlans`, `fuelPolicy`, and `mileagePolicy` fields to `Vehicle` because the existing plan page already consumes them.
- Add `insuranceSubtotal: number` to `PriceBreakdown`.
- Add optional `insurancePlan` to `calculatePrice` and compute `dailyPriceFrom * rentalDays`.
- Include insurance after discounts, alongside add-ons, in `total`.

Use these exact policy types:

```ts
export type FuelPolicy = 'full_to_full' | 'full_to_empty' | 'same_level';
export type MileagePolicy = 'unlimited' | 'limited';
```

**Step 4: Complete the summary-card API already expected by tests**

Add:

```ts
@Input() returnLocation = '';
@Input() showVehicleHeader = true;

protected mapUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

get originalTotal(): number {
  const price = this.priceBreakdown;
  return price ? price.rentalRaw + price.addOnSubtotal + price.insuranceSubtotal : 0;
}

get baseFareAmount(): number {
  const price = this.priceBreakdown;
  return price ? price.rentalSubtotal - price.partnerDiscount + price.insuranceSubtotal : 0;
}

get discountPercent(): number {
  return this.originalTotal === 0 ? 0 : Math.round((this.discountTotal / this.originalTotal) * 100);
}
```

Update the template to honor `showVehicleHeader`, render `returnLocation`, and show an insurance line only when the subtotal is positive.

**Step 5: Run domain and booking-flow tests**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
NX_DAEMON=false npx nx test booking-flow --skipNxCache
```

Expected: both targets compile and pass. If unrelated expectations remain, record their exact output before continuing.

**Step 6: Commit**

```bash
git add libs/domain/src/lib/models libs/domain/src/lib/pricing libs/booking-flow/src/lib/quote.service.ts libs/booking-flow/src/lib/components libs/booking-flow/src/lib/pages/plan-page.component.spec.ts
git commit -m "fix(booking-flow): complete insurance quote contract"
```

## Task 2: Add payment records and pure balance derivation

**Files:**

- Create: `libs/domain/src/lib/models/payment-record.ts`
- Create: `libs/domain/src/lib/payments/calculate-payment-summary.ts`
- Create: `libs/domain/src/lib/payments/calculate-payment-summary.spec.ts`
- Create: `libs/domain/src/lib/payments/index.ts`
- Modify: `libs/domain/src/lib/models/enums.ts`
- Modify: `libs/domain/src/lib/models/index.ts`
- Modify: `libs/domain/src/index.ts`

**Step 1: Write failing payment-summary tests**

Cover zero payment, deposit threshold, mixed methods, full payment, additional charge after full payment, completed refund, and overpayment:

```ts
it('becomes additional_payment_due when a confirmed adjustment reopens a settled booking', () => {
  const summary = calculatePaymentSummary({
    baseTotal: 3_000,
    depositRequired: 900,
    payments: [payment({ amount: 3_000, purpose: 'balance' })],
    adjustments: [adjustment({ amount: 500 })],
    refunds: [],
  });

  expect(summary).toMatchObject({
    requiredTotal: 3_500,
    netPaid: 3_000,
    balanceDue: 500,
    status: 'additional_payment_due',
  });
});
```

**Step 2: Run and confirm failure**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
```

Expected: FAIL because the payment module does not exist.

**Step 3: Add the model contracts**

Use:

```ts
export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'line_pay'
  | 'bank_transfer'
  | 'customer_credit';

export type PaymentPurpose = 'deposit' | 'balance' | 'adjustment';
export type PaymentRecordStatus = 'pending' | 'confirmed' | 'failed' | 'voided';
export type PaymentStatus =
  | 'deposit_due'
  | 'deposit_paid'
  | 'paid_in_full'
  | 'additional_payment_due'
  | 'overpaid';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  purpose: PaymentPurpose;
  status: PaymentRecordStatus;
  receivedAt: string;
  handledBy: string;
  bankLastFive?: string;
  note?: string;
}

export interface ChargeAdjustment {
  id: string;
  bookingId: string;
  kind: 'late_return' | 'energy' | 'manual';
  quotedAmount: number;
  amount: number;
  status: 'draft' | 'confirmed' | 'voided';
  reason?: string;
  createdAt: string;
  handledBy: string;
}

export interface RefundRecord {
  id: string;
  bookingId: string;
  cancellationCaseId?: string;
  amount: number;
  method: Exclude<PaymentMethod, 'customer_credit'>;
  status: 'pending' | 'completed' | 'failed' | 'voided';
  processedAt?: string;
  handledBy: string;
  note?: string;
}
```

Validate bank last-five only for `bank_transfer`, reject non-positive amounts, and count only confirmed payments, confirmed adjustments, and completed refunds.

**Step 4: Implement the pure summary function**

Return `requiredTotal`, `confirmedPayments`, `completedRefunds`, `netPaid`, `balanceDue`, `methods`, and derived `status`. Keep all amounts integer TWD.

**Step 5: Run tests and commit**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
git add libs/domain/src/lib/models libs/domain/src/lib/payments libs/domain/src/index.ts
git commit -m "feat(domain): add payment ledger calculations"
```

## Task 3: Separate booking fulfillment from payment and migrate stored data

**Files:**

- Modify: `libs/domain/src/lib/models/enums.ts`
- Modify: `libs/domain/src/lib/models/rental-booking.ts`
- Create: `libs/domain/src/lib/repositories/normalize-rental-booking.ts`
- Create: `libs/domain/src/lib/repositories/normalize-rental-booking.spec.ts`
- Modify: `libs/domain/src/lib/repositories/local-storage-repository.ts`
- Modify: `libs/domain/src/lib/repositories/seed-data.ts`
- Modify: `libs/domain/src/lib/availability/is-vehicle-available.ts`
- Modify: `libs/domain/src/lib/availability/is-vehicle-available.spec.ts`
- Modify: `libs/booking-flow/src/lib/catalog.store.ts`
- Modify: `libs/booking-flow/src/lib/catalog.store.spec.ts`
- Modify: `libs/booking-flow/src/lib/pages/payment-page.component.ts`
- Modify: `libs/booking-flow/src/lib/pages/payment-page.component.spec.ts`
- Modify: `libs/booking-flow/src/lib/steps/done.component.ts`
- Modify: `libs/booking-flow/src/lib/steps/done.component.spec.ts`
- Modify: `apps/admin/src/app/stores/booking/booking.store.ts`
- Modify: `apps/admin/src/app/stores/booking/booking.store.spec.ts`
- Modify: `apps/admin/src/app/stores/vehicle/vehicle.store.ts`
- Modify: `apps/admin/src/app/stores/vehicle/vehicle.store.spec.ts`
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts`

**Step 1: Write migration and lifecycle tests**

Required assertions:

```ts
expect(normalizeRentalBooking({ ...legacy, status: 'pending_payment' }).status).toBe('reserved');
expect(normalizeRentalBooking({ ...legacy, status: 'confirmed' }).status).toBe('reserved');
expect(normalizeRentalBooking({ ...current, status: 'in_progress' }).status).toBe('in_progress');
```

Also prove `reserved` occupies inventory and `cancelled`/`completed` do not.

**Step 2: Run focused tests and confirm failure**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
```

**Step 3: Replace the booking lifecycle**

Use:

```ts
export type BookingStatus = 'reserved' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentPreference = 'credit_card' | 'line_pay' | 'on_site' | 'bank_transfer';
```

In `RentalBooking`, replace `paymentMethod?` with `paymentPreference?`, add `depositRequired: number`, and keep `priceBreakdown` as the immutable base quote snapshot.

**Step 4: Add a repository normalization hook**

Extend `LocalStorageRepository` with an optional normalizer without changing existing callers:

```ts
constructor(
  private readonly key: string,
  private readonly seed: () => T[],
  private readonly onReset?: () => void,
  private readonly normalize?: (item: unknown) => T,
) {}
```

Apply it after JSON parsing. `normalizeRentalBooking` must map legacy statuses, rename `paymentMethod` to `paymentPreference`, calculate a safe default deposit requirement capped at 30% for legacy passenger-car records, and preserve unknown optional fields.

**Step 5: Update all status transitions atomically**

- Admin-created and consumer-created bookings start as `reserved`.
- `pickUp`: `reserved → in_progress`.
- `complete`: `in_progress → completed`.
- Cancellation is allowed from `reserved`; an in-progress booking must use the return flow, not generic cancellation.
- Replace `confirmPayment` with payment-ledger behavior in Task 7; remove status mutation now.
- Update `isVehicleAvailable`, seed data, i18n, dashboard helpers, and all typed status fixtures.

**Step 6: Keep the public booking payment page working**

Until Task 7 provides the repository-backed payment store, make `markBookingPaid` return the unchanged `reserved` booking and expose a narrow callback seam that Task 7 will replace. Update page guards to treat `reserved` as a valid order state and stop using fulfillment status as proof of payment.

**Step 7: Run the affected test suites**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
NX_DAEMON=false npx nx test booking-flow --skipNxCache
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/booking/booking.store.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/vehicle/vehicle.store.spec.ts'
```

Expected: focused tests pass; no `pending_payment` or `confirmed` remains in executable code outside the migration fixture.

**Step 8: Commit**

```bash
git add libs/domain libs/booking-flow apps/admin/src/app/stores apps/admin/src/app/core/i18n/zh-tw.ts
git commit -m "refactor(domain): separate booking and payment states"
```

## Task 4: Add cancellation, operator liability, and customer-credit calculations

**Files:**

- Create: `libs/domain/src/lib/models/cancellation-case.ts`
- Create: `libs/domain/src/lib/models/customer-credit.ts`
- Create: `libs/domain/src/lib/cancellation/quote-cancellation.ts`
- Create: `libs/domain/src/lib/cancellation/quote-cancellation.spec.ts`
- Create: `libs/domain/src/lib/cancellation/index.ts`
- Modify: `libs/domain/src/lib/models/index.ts`
- Modify: `libs/domain/src/index.ts`

**Step 1: Write the failing legal-boundary tests**

Cover all passenger-car boundaries: 10, 9, 7, 6, 4, 3, 2, 1, and 0 calendar days in Asia/Taipei. Also cover:

```ts
it('refunds all non-deposit prepayment separately from the deposit penalty', () => {
  const quote = quoteCancellation({
    contractKind: 'passenger_car',
    responsibility: 'customer',
    cancellationRequestedAt: '2026-10-01T10:00:00+08:00',
    pickupAt: '2026-10-06T09:00:00+08:00',
    depositPaid: 900,
    otherPrepayment: 2_100,
    transferFee: 0,
  });

  expect(quote.depositRefund).toBe(360);
  expect(quote.otherPrepaymentRefund).toBe(2_100);
  expect(quote.totalCashDue).toBe(2_460);
});
```

Add tests for force majeure full refund and zero fee, operator fault with deposit returning twice the deposit, operator fault without a deposit using one total rental amount, and scooter policy missing returning `manual_review`.

**Step 2: Run and confirm failure**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
```

**Step 3: Implement exact models**

`CancellationCase` must snapshot inputs and outputs, not only store the final amount. Include responsibility, reason tag, requested time, rule version, original payment totals, refund lines, transfer fee, disposition (`refund`, `credit`, `split`), status, approvals, and evidence asset IDs.

`CustomerCreditLedgerEntry` must be append-only:

```ts
export interface CustomerCreditLedgerEntry {
  id: string;
  memberId: string;
  sourceCancellationCaseId?: string;
  type: 'issued' | 'redeemed' | 'expired' | 'extended' | 'reversed';
  amount: number;
  occurredAt: string;
  expiresAt?: string;
  handledBy: string;
  reason?: string;
}
```

Never store a mutable `balance` field; derive it from entries.

**Step 4: Implement the quote function**

- Treat day boundaries as calendar dates in Asia/Taipei, not elapsed 24-hour blocks.
- Allow transfer fees only from 0 to 100, default 0.
- Force-majeure and operator-fault quotes always force the fee to 0.
- Keep statutory compensation separate from goodwill compensation.
- Return `manual_review` for intentional operator conduct, additional customer damage, or missing scooter rules.

**Step 5: Run and commit**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
git add libs/domain/src/lib/models libs/domain/src/lib/cancellation libs/domain/src/index.ts
git commit -m "feat(domain): calculate cancellations and customer credit"
```

## Task 5: Add pickup readiness and return-charge calculations

**Files:**

- Create: `libs/domain/src/lib/models/handover-record.ts`
- Create: `libs/domain/src/lib/handover/evaluate-pickup-readiness.ts`
- Create: `libs/domain/src/lib/handover/evaluate-pickup-readiness.spec.ts`
- Create: `libs/domain/src/lib/handover/calculate-return-charges.ts`
- Create: `libs/domain/src/lib/handover/calculate-return-charges.spec.ts`
- Create: `libs/domain/src/lib/handover/index.ts`
- Modify: `libs/domain/src/lib/models/pricing-plan.ts`
- Modify: `libs/domain/src/lib/models/vehicle.ts`
- Modify: `libs/domain/src/lib/models/index.ts`
- Modify: `libs/domain/src/index.ts`

**Step 1: Write failing readiness tests**

Test separate blockers for insufficient deposit, unsigned latest contract, missing identity document, expired or mismatched driver credential, unconfirmed original-document check, vehicle maintenance, and time conflict. Test that missing Email and low-confidence OCR are warnings, not blockers.

**Step 2: Write failing return-charge tests**

Required cases:

- exactly at due time: zero late fee;
- inside grace period: zero;
- one minute past grace: one unit;
- partial unit rounds up;
- daily cap applies;
- fuel drops from 8/8 to 5/8;
- EV drops from 80% to 62%;
- manual adjustment requires a reason when it differs from the quote.

**Step 3: Add policy fields**

```ts
export interface LateReturnPolicy {
  graceMinutes: number;
  unitMinutes: number;
  feePerUnit: number;
  dailyCap: number;
}

export interface EnergyReturnPolicy {
  measure: 'eighths' | 'percent';
  feePerUnit: number;
  serviceFee: number;
}
```

Attach policies to `PricingPlan`; add `energyType: 'gasoline' | 'electric'` to `Vehicle` with a normalizer-derived fallback for existing records.

**Step 4: Implement pure functions and records**

`HandoverRecord` needs pickup/return kind, actual time, mileage, energy reading, photo asset IDs, original-document check, signatures/confirmations, actor, and notes. `evaluatePickupReadiness` returns arrays of typed blockers and warnings; it does not return a single boolean without reasons.

**Step 5: Run and commit**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
git add libs/domain/src/lib/models libs/domain/src/lib/handover libs/domain/src/index.ts
git commit -m "feat(domain): add pickup and return rules"
```

## Task 6: Add document, eligibility, contract, reminder, and audit contracts

**Files:**

- Create: `libs/domain/src/lib/models/identity-document.ts`
- Create: `libs/domain/src/lib/models/contract-version.ts`
- Create: `libs/domain/src/lib/models/reminder-status.ts`
- Create: `libs/domain/src/lib/models/audit-entry.ts`
- Create: `libs/domain/src/lib/contracts/contract-versioning.ts`
- Create: `libs/domain/src/lib/contracts/contract-versioning.spec.ts`
- Create: `libs/domain/src/lib/contracts/index.ts`
- Modify: `libs/domain/src/lib/models/member.ts`
- Modify: `libs/domain/src/lib/models/index.ts`
- Modify: `libs/domain/src/index.ts`

**Step 1: Write failing contract-version tests**

Prove that changing member, vehicle, rental times, locations, base price, or insurance supersedes the signed contract; changing an internal note does not.

**Step 2: Extend member and document models**

Use:

```ts
export type MemberKind = 'local' | 'foreign_visitor' | 'resident';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  kind: MemberKind;
  nationality?: string;
  birthDate?: string;
  address?: string;
  idNumber?: string;
  note?: string;
}
```

Keep image references in `IdentityDocument` and `DriverCredential`, never on `Member`. Include document type, issuing country, number, expiry, standardized vehicle classes, OCR state, verification state, asset IDs, version, superseded ID, and audit fields.

**Step 3: Add immutable contract snapshots**

`ContractVersion` contains version number, status (`draft`, `signed`, `superseded`), a complete contract snapshot, optional signature asset IDs, created/signed timestamps, and superseded reason. Do not make it point only to mutable live member/booking data.

**Step 4: Add reminder and audit models**

Reminder states must match the backend hand-off. Audit entries must store action, entity, before/after summary, reason, actor, and server-compatible timestamp fields.

**Step 5: Run and commit**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
git add libs/domain/src/lib/models libs/domain/src/lib/contracts libs/domain/src/index.ts
git commit -m "feat(domain): add document and contract records"
```

## Task 7: Register repositories, seeds, stores, and external-service adapters

**Files:**

- Modify: `libs/domain/src/lib/repositories/tokens.ts`
- Modify: `libs/domain/src/lib/repositories/seed-data.ts`
- Modify: `apps/admin/src/app/core/repositories/tokens.ts`
- Modify: `apps/admin/src/app/core/repositories/seed-data.ts`
- Modify: `apps/admin/src/app/app.config.ts`
- Modify: `apps/booking/src/app/app.config.ts`
- Modify: `apps/affiliate/src/app/app.config.ts`
- Create: `apps/admin/src/app/core/services/document-asset.gateway.ts`
- Create: `apps/admin/src/app/core/services/indexed-db-document-asset.gateway.ts`
- Create: `apps/admin/src/app/core/services/ocr.gateway.ts`
- Create: `apps/admin/src/app/core/services/mock-ocr.gateway.ts`
- Create: `apps/admin/src/app/core/services/driver-eligibility.gateway.ts`
- Create: `apps/admin/src/app/core/services/mock-driver-eligibility.gateway.ts`
- Create: `apps/admin/src/app/core/services/reminder.gateway.ts`
- Create: `apps/admin/src/app/core/services/mock-reminder.gateway.ts`
- Create: `apps/admin/src/app/stores/payment/payment.store.ts`
- Create: `apps/admin/src/app/stores/payment/payment.store.spec.ts`
- Create: `apps/admin/src/app/stores/document/document.store.ts`
- Create: `apps/admin/src/app/stores/document/document.store.spec.ts`
- Create: `apps/admin/src/app/stores/contract/contract.store.ts`
- Create: `apps/admin/src/app/stores/contract/contract.store.spec.ts`
- Create: `apps/admin/src/app/stores/handover/handover.store.ts`
- Create: `apps/admin/src/app/stores/handover/handover.store.spec.ts`
- Create: `apps/admin/src/app/stores/cancellation/cancellation.store.ts`
- Create: `apps/admin/src/app/stores/cancellation/cancellation.store.spec.ts`
- Create: `apps/admin/src/app/stores/credit/credit.store.ts`
- Create: `apps/admin/src/app/stores/credit/credit.store.spec.ts`

**Step 1: Write store tests with in-memory repositories**

Test one behavior per store: append confirmed payment and recompute summary, upload metadata then confirm OCR correction, create/supersede/sign a contract, record pickup/return, create a cancellation quote and disposition, issue/redeem/extend credit.

**Step 2: Add repository tokens**

Create typed tokens for payment, refund, adjustment, identity document, driver credential, contract, handover, cancellation, customer-credit entry, reminder, operator-recovery case, and audit entry.

**Step 3: Register local repositories**

Use stable keys such as:

```text
cr.payments
cr.refunds
cr.chargeAdjustments
cr.identityDocuments
cr.driverCredentials
cr.contractVersions
cr.handoverRecords
cr.cancellationCases
cr.customerCreditLedger
cr.reminderStatuses
cr.operatorRecoveryCases
cr.auditEntries
```

Seed only enough linked data to demonstrate pickup-ready, blocked, overdue, refund-pending, and foreign manual-review cases.

**Step 4: Fix the stale app provider names**

Replace `CUSTOMER_REPO`, `seedCustomers`, and `cr.customers` in booking and affiliate configs with `MEMBER_REPO`, `seedMembers`, and `cr.members`. Register payment repositories in all apps before changing `CatalogStore.markBookingPaid` to append a payment record.

**Step 5: Implement safe development adapters**

- `IndexedDbDocumentAssetGateway` stores blobs in a named development-only database and returns opaque IDs/object URLs; it must revoke URLs and expose `clearDevelopmentData()`.
- `MockOcrGateway` returns deterministic fixtures after a short observable/promise boundary and supports `succeeded`, `low_confidence`, and `failed` paths.
- `MockDriverEligibilityGateway` returns `manual_review` for foreign documents unless a fixture explicitly supplies a verified rule.
- `MockReminderGateway` stores state only; it must never claim that an Email was actually sent.

**Step 6: Run focused tests and builds**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/**/*.spec.ts'
NX_DAEMON=false npx nx build booking --configuration=development
NX_DAEMON=false npx nx build affiliate --configuration=development
```

Expected: store tests and both public apps compile. The known page-toolbar admin test failures are outside this focused run.

**Step 7: Commit**

```bash
git add libs/domain/src/lib/repositories apps/admin/src/app/core apps/admin/src/app/stores apps/admin/src/app/app.config.ts apps/booking/src/app/app.config.ts apps/affiliate/src/app/app.config.ts
git commit -m "feat(admin): wire rental workflow repositories"
```

## Task 8: Build the responsive booking workspace shell and URL synchronization

**Files:**

- Create: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.ts`
- Create: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html`
- Create: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.scss`
- Create: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.spec.ts`
- Create: `apps/admin/src/app/features/bookings/services/booking-workspace.service.ts`
- Create: `apps/admin/src/app/features/bookings/services/booking-workspace.service.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/pages/bookings-page.component.ts`
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts`
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts`

**Step 1: Write failing shell tests**

Verify seven named sections, active-section switching, accessible heading/status text, close behavior, and dirty-form close prevention. Add service tests proving:

- opening writes `booking` and `section` query params;
- reloading with those params opens the same section;
- closing removes only those params;
- browser back closes the dialog;
- a second URL emission does not open duplicate dialogs.

**Step 2: Implement the dialog sizing contract**

Open with:

```ts
this.dialog.open(BookingWorkspaceDialogComponent, {
  data: { bookingId, section },
  width: '80vw',
  maxWidth: '1200px',
  height: 'min(88dvh, 960px)',
  panelClass: 'booking-workspace-dialog',
  autoFocus: 'dialog',
  restoreFocus: true,
});
```

At `max-width: 768px`, the panel class must become `100vw × 100dvh`, remove border radius, and keep exactly one inner scrolling region. Do not disable Material's focus trap.

**Step 3: Build the section navigation**

Sections: overview, documents, payments, contract, handover, cancellation, activity. Lazy-render non-active sections so image-heavy content is not created on initial open.

**Step 4: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/dialogs/booking-workspace-dialog.component.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/services/booking-workspace.service.spec.ts'
git add apps/admin/src/app/features/bookings apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts apps/admin/src/app/core/i18n/zh-tw.ts
git commit -m "feat(admin): add responsive booking workspace"
```

## Task 9: Upgrade the member and document capture flow

**Files:**

- Modify: `apps/admin/src/app/features/bookings/dialogs/member-form-dialog.component.ts`
- Modify: `apps/admin/src/app/features/bookings/dialogs/member-form-dialog.component.html`
- Create: `apps/admin/src/app/features/bookings/dialogs/member-form-dialog.component.spec.ts`
- Create: `apps/admin/src/app/features/bookings/components/document-capture.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/document-capture.component.html`
- Create: `apps/admin/src/app/features/bookings/components/document-capture.component.scss`
- Create: `apps/admin/src/app/features/bookings/components/document-capture.component.spec.ts`
- Create: `apps/admin/src/app/features/bookings/components/driver-eligibility-panel.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/driver-eligibility-panel.component.html`
- Create: `apps/admin/src/app/features/bookings/components/driver-eligibility-panel.component.spec.ts`
- Modify: `apps/admin/src/app/stores/member/member.store.ts`
- Modify: `apps/admin/src/app/stores/member/member.store.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/pages/members-page.component.ts`
- Modify: `apps/admin/src/app/features/bookings/pages/members-page.component.html`

**Step 1: Write failing dynamic-form tests**

Prove:

- local members see Taiwan ID and Taiwan license fields;
- foreign visitors see nationality, passport, entry date, original license, IDP, and endorsement fields;
- residents see ARC plus the applicable license path;
- switching kind does not silently discard already uploaded assets;
- capture uses `accept="image/*" capture="environment"` but still works as normal file input;
- OCR suggestions never overwrite a manually edited value until confirmed;
- low confidence and failure remain recoverable.

**Step 2: Implement the capture component**

The component emits opaque asset IDs and preview URLs, not base64 strings. Reserve layout space while processing to avoid dialog jumps. Provide visible Retake, Use photo, Retry OCR, and Enter manually actions.

**Step 3: Implement foreign eligibility UI**

Display result as eligible, ineligible, or manual review with reasons and legal-use-through date. Never show mock results as official; include a visible development badge from the adapter.

**Step 4: Integrate member persistence and booking snapshots**

Member data is reusable, but when attached to a booking the workspace creates document/credential version references and a text snapshot. Add an explicit “本次已核對正本” control to the pickup section; do not set it automatically from stored images.

**Step 5: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/*.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/dialogs/member-form-dialog.component.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/member/member.store.spec.ts'
git add apps/admin/src/app/features/bookings apps/admin/src/app/stores/member
git commit -m "feat(admin): add renter document capture"
```

## Task 10: Expand the booking form into an operational creation flow

**Files:**

- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-form-dialog.component.ts`
- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-form-dialog.component.html`
- Create: `apps/admin/src/app/features/bookings/dialogs/booking-form-dialog.component.scss`
- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-form-dialog.component.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/pages/bookings-page.component.ts`
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts`
- Modify: `apps/admin/src/app/stores/booking/booking.store.ts`
- Modify: `apps/admin/src/app/stores/booking/booking.store.spec.ts`

**Step 1: Write failing wizard tests**

Test the five sections: rental/vehicle, renter/credentials, quote/payment draft, contract preview, final review. Verify vehicle conflicts, reused member IDs, new-member creation, deposit cap, incomplete-item summary, and that core edits to an existing signed booking request a new contract version.

**Step 2: Implement responsive sizing**

Open the creation dialog with `width: 80vw`, `maxWidth: 800px`, and `maxHeight: 90dvh`. On mobile, use the same full-screen panel class rules as the workspace.

**Step 3: Keep the form transaction atomic**

The dialog collects draft data but does not create payment/contract child records until final submit. On submit:

1. validate vehicle availability again;
2. create or reuse the member;
3. create `reserved` booking with quote snapshot and deposit requirement;
4. append proposed payment records;
5. create contract version 1 draft;
6. schedule mock reminders if Email exists;
7. close with the booking ID and open the workspace overview.

If any local repository write fails, surface the failed step and do not report success. Since local repositories lack true transactions, add compensating cleanup only for records created in the current attempt.

**Step 4: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/dialogs/booking-form-dialog.component.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/booking/booking.store.spec.ts'
git add apps/admin/src/app/features/bookings/dialogs/booking-form-dialog* apps/admin/src/app/features/bookings/pages/bookings-page.component.ts apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts apps/admin/src/app/stores/booking
git commit -m "feat(admin): build operational booking flow"
```

## Task 11: Add the payments and charges workspace section

**Files:**

- Create: `apps/admin/src/app/features/bookings/components/payment-panel.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/payment-panel.component.html`
- Create: `apps/admin/src/app/features/bookings/components/payment-panel.component.scss`
- Create: `apps/admin/src/app/features/bookings/components/payment-panel.component.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.ts`
- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html`
- Modify: `apps/admin/src/app/core/i18n/zh-tw.ts`

**Step 1: Write failing interaction tests**

Verify multiple payments, mixed methods, conditional bank-last-five validation, non-positive amount rejection, double-submit lock, failed-record recovery, and status/remaining-balance updates.

**Step 2: Implement the ledger UI**

Show a summary block with base quote, confirmed adjustments, required total, net paid, balance, deposit requirement, and derived status. Under it show immutable transaction rows. “新增收款” opens an inline form; voiding creates an audit action rather than deleting the row.

**Step 3: Replace public booking-flow payment status mutation**

Inject the payment repository into `CatalogStore`. `markBookingPaid` appends one confirmed payment for `priceBreakdown.total` using the selected simulated method and leaves booking status `reserved`. Update payment-page and done-page tests accordingly.

**Step 4: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/payment-panel.component.spec.ts'
NX_DAEMON=false npx nx test booking-flow --skipNxCache
git add apps/admin/src/app/features/bookings/components/payment-panel* apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog* apps/admin/src/app/core/i18n/zh-tw.ts libs/booking-flow
git commit -m "feat(admin): add multi-payment ledger"
```

## Task 12: Add contract preview, versioning, and signature capture

**Files:**

- Create: `apps/admin/src/app/features/bookings/components/signature-pad.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/signature-pad.component.html`
- Create: `apps/admin/src/app/features/bookings/components/signature-pad.component.scss`
- Create: `apps/admin/src/app/features/bookings/components/signature-pad.component.spec.ts`
- Create: `apps/admin/src/app/features/bookings/components/contract-panel.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/contract-panel.component.html`
- Create: `apps/admin/src/app/features/bookings/components/contract-panel.component.scss`
- Create: `apps/admin/src/app/features/bookings/components/contract-panel.component.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html`
- Modify: `apps/admin/src/app/stores/contract/contract.store.ts`

**Step 1: Write failing contract tests**

Test draft preview content, latest-version selection, required acknowledgement, clear/redraw, pointer and keyboard fallback, sign action, immutable signed version, and superseding after a core booking edit.

**Step 2: Implement the preview from snapshots**

Render renter, vehicle, plate, period, locations, pricing, deposit, insurance, add-ons, cancellation terms, late/energy rules, and document snapshot. Do not read live member fields when rendering an old version.

**Step 3: Implement signature capture safely**

Store the canvas/blob through `DocumentAssetGateway` and persist only its opaque asset ID in `ContractVersion`. Provide typed-name acknowledgement if pointer input is unavailable. The mock must visibly say that it is not a production legally sealed PDF.

**Step 4: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/signature-pad.component.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/contract-panel.component.spec.ts'
git add apps/admin/src/app/features/bookings/components apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html apps/admin/src/app/stores/contract
git commit -m "feat(admin): add versioned rental contracts"
```

## Task 13: Add pickup and return workflows

**Files:**

- Create: `apps/admin/src/app/features/bookings/components/handover-panel.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/handover-panel.component.html`
- Create: `apps/admin/src/app/features/bookings/components/handover-panel.component.scss`
- Create: `apps/admin/src/app/features/bookings/components/handover-panel.component.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html`
- Modify: `apps/admin/src/app/stores/handover/handover.store.ts`
- Modify: `apps/admin/src/app/stores/booking/booking.store.ts`
- Modify: `apps/admin/src/app/stores/booking/booking.store.spec.ts`
- Modify: `apps/admin/src/app/stores/vehicle/vehicle.store.ts`

**Step 1: Write failing pickup tests**

Prove that each hard blocker prevents normal pickup and each warning does not. Test supervisor override requires actor and reason, while legal ineligibility and unsafe/unavailable vehicle remain non-overridable unless policy explicitly allows it.

**Step 2: Write failing return tests**

Test actual return time/mileage/energy, photo IDs, calculated charges, confirmation before adjustment creation, manual adjustment reason, and completion with an unpaid balance.

**Step 3: Implement orchestration in the handover store**

Pickup order:

1. recompute readiness;
2. save pickup record;
3. transition vehicle to `rented`;
4. transition booking to `in_progress`;
5. append audit entry.

Return order:

1. save return record;
2. confirm charge adjustments;
3. transition vehicle to `available`;
4. transition booking to `completed`;
5. append audit entry;
6. leave any balance as receivable.

If a step fails, do not claim completion; surface which local step succeeded and offer retry.

**Step 4: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/handover-panel.component.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/handover/handover.store.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/booking/booking.store.spec.ts'
git add apps/admin/src/app/features/bookings/components/handover-panel* apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html apps/admin/src/app/stores/handover apps/admin/src/app/stores/booking apps/admin/src/app/stores/vehicle
git commit -m "feat(admin): add pickup and return workflow"
```

## Task 14: Add customer cancellation, refunds, and credit disposition

**Files:**

- Create: `apps/admin/src/app/features/bookings/components/cancellation-panel.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/cancellation-panel.component.html`
- Create: `apps/admin/src/app/features/bookings/components/cancellation-panel.component.scss`
- Create: `apps/admin/src/app/features/bookings/components/cancellation-panel.component.spec.ts`
- Create: `apps/admin/src/app/features/bookings/components/customer-credit-panel.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/customer-credit-panel.component.html`
- Create: `apps/admin/src/app/features/bookings/components/customer-credit-panel.component.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html`
- Modify: `apps/admin/src/app/stores/cancellation/cancellation.store.ts`
- Modify: `apps/admin/src/app/stores/credit/credit.store.ts`
- Modify: `apps/admin/src/app/stores/booking/booking.store.ts`

**Step 1: Write failing cancellation UI tests**

Test responsibility/reason selection, exact quote lines, force-majeure evidence and approval, transfer fee range/default/reason, scooter manual-review block, and pending-refund state.

**Step 2: Write failing disposition tests**

Test refund, full credit, and split disposition. Credit requires explicit customer consent, defaults to 12 months, reminds at 30 days, and can be extended only with reason/audit.

**Step 3: Implement without deleting financial history**

Cancellation creates a case, snapshots the quote, appends refund/credit records, transitions the booking to `cancelled`, and keeps all payment records. It must never call repository `remove()` for payments or contracts.

**Step 4: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/cancellation-panel.component.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/customer-credit-panel.component.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/cancellation/cancellation.store.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/credit/credit.store.spec.ts'
git add apps/admin/src/app/features/bookings/components apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html apps/admin/src/app/stores/cancellation apps/admin/src/app/stores/credit apps/admin/src/app/stores/booking
git commit -m "feat(admin): add cancellation and customer credit"
```

## Task 15: Add operator recovery and compensation

**Files:**

- Create: `libs/domain/src/lib/models/operator-recovery-case.ts`
- Modify: `libs/domain/src/lib/models/index.ts`
- Create: `apps/admin/src/app/stores/operator-recovery/operator-recovery.store.ts`
- Create: `apps/admin/src/app/stores/operator-recovery/operator-recovery.store.spec.ts`
- Create: `apps/admin/src/app/features/bookings/components/operator-recovery-panel.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/operator-recovery-panel.component.html`
- Create: `apps/admin/src/app/features/bookings/components/operator-recovery-panel.component.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/components/cancellation-panel.component.html`

**Step 1: Write failing recovery-path tests**

Cover vehicle breakdown, oversell, and staff-dispatch error. Verify the ordered paths:

1. same-class replacement;
2. free upgrade with zero customer price increase;
3. partner transfer with absorbed difference and customer consent;
4. operator-fault cancellation only after rejection/failure.

**Step 2: Write compensation tests**

Prove that statutory cash due is separate from taxi reimbursement and goodwill credit/coupon. Operator cases must have zero transfer fee and cannot force credit instead of cash. Intentional conduct or additional documented loss must remain `manual_review`.

**Step 3: Implement and audit every attempt**

Store discovery time, notification time, each attempted remedy, availability/quote snapshot, customer decision, absorbed difference, final disposition, actor, and approver. A vehicle change must trigger a new contract version.

**Step 4: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/operator-recovery/operator-recovery.store.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/operator-recovery-panel.component.spec.ts'
git add libs/domain/src/lib/models apps/admin/src/app/stores/operator-recovery apps/admin/src/app/features/bookings/components
git commit -m "feat(admin): add operator recovery workflow"
```

## Task 16: Integrate payment/readiness warnings and actions into dashboard lists

**Files:**

- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.ts`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.html`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view/calendar-view.component.scss`
- Modify: `apps/admin/src/app/features/dispatch/calendar-view.spec.ts`
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.ts`
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.html`
- Modify: `apps/admin/src/app/features/dashboard/pages/dashboard-page.component.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/pages/bookings-page.component.ts`
- Modify: `apps/admin/src/app/features/bookings/pages/bookings-page.component.html`
- Modify: `apps/admin/src/app/features/bookings/pages/bookings-page.component.spec.ts`

**Step 1: Write failing work-list tests**

Verify pickup rows show payment status/balance, document status, latest contract status, readiness text, and actions for pay/edit/cancel/pickup. Verify return rows show overdue duration, reminder status, estimated late fee, balance, contact, and return action.

Update progress semantics:

- pickup total: reserved/in-progress/completed bookings whose start date matches;
- pickup done: in-progress/completed;
- return total: in-progress/completed bookings whose end date matches;
- return done: completed;
- reserved bookings are never counted as returns.

This resolves the existing overlapping dashboard-progress test failure.

**Step 2: Implement severity presentation**

Every blocker/urgent/warning item includes icon, text, and action. Do not add color-only dots. Sort urgent operator-recovery, overdue return, and refund-pending items before ordinary rows while preserving stable time order within each severity.

**Step 3: Wire actions to the shared workspace**

Calendar and booking-table actions open the same workspace section. Remove the old simple booking-detail dialog once no callers remain. Do not duplicate cancellation or payment forms inside the list.

**Step 4: Run and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/dispatch/calendar-view.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/dashboard/pages/dashboard-page.component.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/pages/bookings-page.component.spec.ts'
git add apps/admin/src/app/features/dispatch apps/admin/src/app/features/dashboard apps/admin/src/app/features/bookings/pages
git commit -m "feat(admin): surface rental operations on dashboard"
```

## Task 17: Add reminder status behavior and activity timeline

**Files:**

- Create: `apps/admin/src/app/features/bookings/components/activity-timeline.component.ts`
- Create: `apps/admin/src/app/features/bookings/components/activity-timeline.component.html`
- Create: `apps/admin/src/app/features/bookings/components/activity-timeline.component.spec.ts`
- Create: `apps/admin/src/app/stores/reminder/reminder.store.ts`
- Create: `apps/admin/src/app/stores/reminder/reminder.store.spec.ts`
- Modify: `apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html`
- Modify: `apps/admin/src/app/features/bookings/components/handover-panel.component.html`

**Step 1: Write failing reminder tests**

Test 24-hour and 2-hour scheduling, missing Email, reschedule after end-time edit, cancellation/completion suppression, retryable failure, permanent failure, and the explicit mock/not-sent label.

**Step 2: Write activity-timeline tests**

Render payments, contract versions, document verification, pickup/return, adjustments, cancellation, refund/credit, operator recovery, supervisor override, and reminder events in chronological order. Sensitive field values must be masked.

**Step 3: Implement and commit**

```bash
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/stores/reminder/reminder.store.spec.ts'
NX_DAEMON=false npx nx test admin --skipNxCache --include='src/app/features/bookings/components/activity-timeline.component.spec.ts'
git add apps/admin/src/app/stores/reminder apps/admin/src/app/features/bookings/components/activity-timeline* apps/admin/src/app/features/bookings/dialogs/booking-workspace-dialog.component.html apps/admin/src/app/features/bookings/components/handover-panel.component.html
git commit -m "feat(admin): add reminders and activity history"
```

## Task 18: Final verification, visual QA, and documentation sync

**Files:**

- Modify if needed: `docs/architecture/04-booking-flow.md`
- Modify if needed: `README.md`
- Verify: `docs/plans/2026-09-18-rental-operations-workflow-design.md`
- Verify: `docs/plans/2026-09-18-rental-operations-backend-handoff.md`

**Step 1: Search for forbidden legacy assumptions**

```bash
rg -n "pending_payment|status === 'confirmed'|confirmPayment\(|paymentMethod\?" apps libs
rg -n "CUSTOMER_REPO|seedCustomers|cr\.customers" apps libs
```

Expected: no executable legacy booking/payment coupling remains. Migration tests and explanatory history may contain legacy strings.

**Step 2: Run automated verification**

```bash
NX_DAEMON=false npx nx test domain --skipNxCache
NX_DAEMON=false npx nx test booking-flow --skipNxCache
NX_DAEMON=false npx nx test admin --skipNxCache
NX_DAEMON=false npx nx lint domain
NX_DAEMON=false npx nx lint booking-flow
NX_DAEMON=false npx nx lint admin
NX_DAEMON=false npx nx build admin --configuration=development
NX_DAEMON=false npx nx build booking --configuration=development
NX_DAEMON=false npx nx build affiliate --configuration=development
npm run lint:theme
git diff --check
```

Expected: all new and overlapping tests pass. If the two pre-existing page-toolbar tests still fail, include their unchanged names/output in the hand-off and do not claim a fully green admin suite.

**Step 3: Perform browser QA**

Start the admin app and verify at 1440, 1024, 768, 390, and 320px:

- creation dialog is 80vw/max 800px on desktop and full-screen on mobile;
- workspace is 80vw/max 1200px and has one scrolling region;
- focus is trapped, Esc/dirtiness works, focus returns to the originating row;
- URL reload/back restores/closes the workspace;
- long foreign names, document values, currency, and notes do not overflow;
- OCR failure and camera-unavailable fallbacks are usable;
- pickup blockers and supervisor override are explicit;
- physical return can complete with receivable balance;
- all cancellation/operator scenarios show line-item math;
- no mock OCR/Email/refund state is presented as production success.

Capture at least these screenshots in a temporary review artifact, not in the repository unless requested:

1. desktop booking overview;
2. mobile full-screen documents section;
3. pickup blocked state;
4. return charge confirmation;
5. customer cancellation quote;
6. operator recovery options.

**Step 4: Sync architecture docs**

Update `docs/architecture/04-booking-flow.md` so public booking payment now appends a payment record and leaves fulfillment `reserved`. Add a concise README note explaining that OCR, document storage, Email, and refunds are development mocks and link the backend hand-off.

**Step 5: Final commit**

```bash
git add docs/architecture/04-booking-flow.md README.md
git commit -m "docs: document rental operations workflow"
```

**Step 6: Request code review before integration**

Invoke `@superpowers:requesting-code-review`, address findings with `@superpowers:receiving-code-review`, then use `@superpowers:verification-before-completion` before claiming completion. After all required checks are green or documented as unchanged baseline failures, use `@superpowers:finishing-a-development-branch` to choose merge/PR/cleanup.

## Delivery checklist

- [ ] Payment status is derived from immutable payment/refund/adjustment records.
- [ ] Booking fulfillment uses only reserved/in-progress/completed/cancelled.
- [ ] Existing stored bookings are normalized without silently discarding data.
- [ ] Member documents are versioned and booking snapshots remain stable.
- [ ] Foreign eligibility defaults to manual review when rules are unknown.
- [ ] Latest signed contract is required for pickup and superseded after core edits.
- [ ] Pickup blockers have actionable reasons and audited supervisor override.
- [ ] Return completion releases the vehicle even if receivables remain.
- [ ] Passenger-car cancellation boundaries and operator compensation are tested.
- [ ] Scooter cancellation does not reuse passenger-car rules without policy.
- [ ] Refund fees default to zero and never apply to force majeure/operator fault.
- [ ] Customer credit uses a ledger, explicit consent, 12-month default, and expiry reminder.
- [ ] Operator recovery tries same class, free upgrade, and partner transfer before cancellation.
- [ ] Dashboard pickup/return lists expose the next action without duplicating forms.
- [ ] Desktop/tablet/mobile dialog behavior passes keyboard and visual QA.
- [ ] Production-dependent features remain clearly mocked and documented for backend hand-off.

import { Component, computed, inject, input } from '@angular/core';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { AUDIT_ENTRY_REPO } from '../../../core/repositories/tokens';
import { BookingStore } from '../../../stores/booking/booking.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { DocumentStore } from '../../../stores/document/document.store';
import { HandoverStore } from '../../../stores/handover/handover.store';
import { CancellationStore } from '../../../stores/cancellation/cancellation.store';
import { CreditStore } from '../../../stores/credit/credit.store';
import { OperatorRecoveryStore } from '../../../stores/operator-recovery/operator-recovery.store';
import { ReminderStore } from '../../../stores/reminder/reminder.store';

/**
 * 活動時間軸涵蓋的事件種類——對應本任務 brief 列出的十種：款項、合約版本、證件驗證、
 * 取車／還車、費用調整、取消、退款／購物金、業者復原、主管覆核、還車提醒。
 */
export type ActivityEventKind =
  | 'payment'
  | 'refund'
  | 'credit'
  | 'adjustment'
  | 'contract_version'
  | 'document_verification'
  | 'pickup'
  | 'return'
  | 'cancellation'
  | 'operator_recovery'
  | 'supervisor_override'
  | 'reminder';

export interface ActivityEvent {
  id: string;
  at: string; // ISO，時間軸排序依據
  kind: ActivityEventKind;
  title: string;
  detail?: string;
  actor?: string;
}

/**
 * 只顯示末 4 碼，其餘遮罩——身分證號、護照號碼、駕照號碼屬於個資，活動時間軸只需要
 * 呈現「有無驗證、驗證結果」，不需要（也不應該）顯示完整證件號碼。設計文件與本任務 brief
 * 都沒有規定確切的遮罩格式，這是本任務的實作判斷：保留末 4 碼方便現場人員核對「是哪一筆」，
 * 其餘一律以 * 取代。
 */
export function maskSensitiveValue(value: string): string {
  if (value.length <= 4) return '*'.repeat(value.length);
  return '*'.repeat(value.length - 4) + value.slice(-4);
}

/**
 * 訂單詳情「活動紀錄」分頁。彙整橫跨八個以上 store／repository 的事件，統一依發生時間
 * 由舊到新排序成單一時間軸——這裡刻意只做「彙整與呈現」，不重新計算或改寫任何來源資料，
 * 每個事件的內容都直接取自各自 store 已經算好、已經持久化的紀錄。
 *
 * 付款／退款／購物金／取消案件的關聯：RefundRecord 沒有建立時間欄位（只有 processedAt，
 * 且本專案目前沒有任何呼叫路徑會呼叫 PaymentStore.completeRefund() 去補上它），因此退款
 * 事件的時間退回讀取所屬取消案件的 requestedAt；購物金分類帳則只收與本訂單取消案件有關聯
 * 的核發／異動（sourceCancellationCaseId 對得上），避免把會員在其他訂單的購物金歷史也混進來。
 */
@Component({
  selector: 'app-activity-timeline',
  templateUrl: './activity-timeline.component.html',
  styleUrl: './activity-timeline.component.scss',
})
export class ActivityTimelineComponent {
  protected readonly t = ZH_TW;

  private readonly bookingStore = inject(BookingStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly contractStore = inject(ContractStore);
  private readonly documentStore = inject(DocumentStore);
  private readonly handoverStore = inject(HandoverStore);
  private readonly cancellationStore = inject(CancellationStore);
  private readonly creditStore = inject(CreditStore);
  private readonly operatorRecoveryStore = inject(OperatorRecoveryStore);
  private readonly reminderStore = inject(ReminderStore);
  private readonly auditRepo = inject(AUDIT_ENTRY_REPO);

  readonly bookingId = input.required<string>();

  protected readonly events = computed<ActivityEvent[]>(() => {
    const bookingId = this.bookingId();
    const booking = this.bookingStore.bookings().find((b) => b.id === bookingId);

    const events: ActivityEvent[] = [
      ...this.paymentEvents(bookingId),
      ...this.adjustmentEvents(bookingId),
      ...this.contractEvents(bookingId),
      ...this.handoverEvents(bookingId),
      ...this.cancellationEvents(bookingId),
      ...this.reminderEvents(bookingId),
    ];

    if (booking) {
      events.push(...this.documentEvents(booking.memberId));
    }

    const cancellationCaseIds = this.cancellationStore.casesFor(bookingId).map((c) => c.id);
    events.push(...this.refundAndCreditEvents(bookingId, booking?.memberId, cancellationCaseIds));
    events.push(...this.operatorRecoveryEvents(bookingId));
    events.push(...this.supervisorOverrideEvents(bookingId, cancellationCaseIds));

    return events.sort((a, b) => a.at.localeCompare(b.at));
  });

  /** 顯示用的簡短時間字串（YYYY-MM-DD HH:mm），`<time>` 的 datetime 屬性另外保留完整 ISO。 */
  protected formatAt(iso: string): string {
    return iso.length >= 16 ? `${iso.slice(0, 10)} ${iso.slice(11, 16)}` : iso;
  }

  private paymentEvents(bookingId: string): ActivityEvent[] {
    return this.paymentStore.paymentsFor(bookingId).map((p) => ({
      id: `payment-${p.id}`,
      at: p.receivedAt,
      kind: 'payment' as const,
      title: `${this.t.activityTimeline.kindLabels['payment']}：${p.amount} 元（${this.t.bookingForm.paymentMethodLabels[p.method] ?? p.method}）`,
      detail: `${this.t.bookingForm.paymentPurposeLabels[p.purpose] ?? p.purpose} · ${this.t.paymentPanel.recordStatusLabels[p.status] ?? p.status}`,
      actor: p.handledBy,
    }));
  }

  private adjustmentEvents(bookingId: string): ActivityEvent[] {
    return this.paymentStore.adjustmentsFor(bookingId).map((a) => ({
      id: `adjustment-${a.id}`,
      at: a.createdAt,
      kind: 'adjustment' as const,
      title: `${this.t.activityTimeline.kindLabels['adjustment']}：${a.amount} 元（${a.kind}）`,
      ...(a.reason ? { detail: a.reason } : {}),
      actor: a.handledBy,
    }));
  }

  private contractEvents(bookingId: string): ActivityEvent[] {
    const events: ActivityEvent[] = [];
    for (const v of this.contractStore.versionsFor(bookingId)) {
      events.push({
        id: `contract-created-${v.id}`,
        at: v.createdAt,
        kind: 'contract_version',
        title: `${this.t.activityTimeline.kindLabels['contract_version']}：建立第 ${v.version} 版`,
      });
      if (v.signedAt) {
        events.push({
          id: `contract-signed-${v.id}`,
          at: v.signedAt,
          kind: 'contract_version',
          title: `${this.t.activityTimeline.kindLabels['contract_version']}：簽署第 ${v.version} 版`,
        });
      }
    }
    return events;
  }

  private documentEvents(memberId: string): ActivityEvent[] {
    const events: ActivityEvent[] = [];
    for (const doc of this.documentStore.identityDocumentsFor(memberId)) {
      if (!doc.verification.verifiedAt) continue;
      events.push({
        id: `identity-${doc.id}`,
        at: doc.verification.verifiedAt,
        kind: 'document_verification',
        title: `${this.t.activityTimeline.kindLabels['document_verification']}：${doc.type}（${
          this.t.activityTimeline.verificationStateLabels[doc.verification.state] ?? doc.verification.state
        }）`,
        detail: maskSensitiveValue(doc.documentNumber),
        ...(doc.verification.verifiedBy ? { actor: doc.verification.verifiedBy } : {}),
      });
    }
    for (const cred of this.documentStore.driverCredentialsFor(memberId)) {
      if (!cred.verification.verifiedAt) continue;
      events.push({
        id: `credential-${cred.id}`,
        at: cred.verification.verifiedAt,
        kind: 'document_verification',
        title: `${this.t.activityTimeline.kindLabels['document_verification']}：${cred.type}（${
          this.t.activityTimeline.verificationStateLabels[cred.verification.state] ?? cred.verification.state
        }）`,
        detail: maskSensitiveValue(cred.documentNumber),
        ...(cred.verification.verifiedBy ? { actor: cred.verification.verifiedBy } : {}),
      });
    }
    return events;
  }

  private handoverEvents(bookingId: string): ActivityEvent[] {
    return this.handoverStore.recordsFor(bookingId).map((r) => ({
      id: `handover-${r.id}`,
      at: r.actualAt,
      kind: r.kind === 'pickup' ? ('pickup' as const) : ('return' as const),
      title: `${this.t.activityTimeline.kindLabels[r.kind]}：里程 ${r.mileage}`,
      actor: r.operatorConfirmation.confirmedBy,
    }));
  }

  private cancellationEvents(bookingId: string): ActivityEvent[] {
    const events: ActivityEvent[] = [];
    for (const c of this.cancellationStore.casesFor(bookingId)) {
      events.push({
        id: `cancellation-${c.id}`,
        at: c.requestedAt,
        kind: 'cancellation',
        title: `${this.t.activityTimeline.kindLabels['cancellation']}：${
          this.t.cancellationPanel.responsibilityLabels[c.responsibility] ?? c.responsibility
        }（應退 ${c.totalCashDue} 元）`,
        detail: c.reason,
      });
      if (c.approvedAt) {
        events.push({
          id: `cancellation-approved-${c.id}`,
          at: c.approvedAt,
          kind: 'cancellation',
          title: `${this.t.activityTimeline.kindLabels['cancellation']}：核准`,
          ...(c.approvedBy ? { actor: c.approvedBy } : {}),
        });
      }
    }
    return events;
  }

  private refundAndCreditEvents(
    bookingId: string,
    memberId: string | undefined,
    cancellationCaseIds: string[],
  ): ActivityEvent[] {
    const events: ActivityEvent[] = [];
    const casesById = new Map(this.cancellationStore.casesFor(bookingId).map((c) => [c.id, c]));

    for (const r of this.paymentStore.refundsFor(bookingId)) {
      // RefundRecord 沒有 createdAt，且目前沒有任何呼叫路徑會補上 processedAt（見類別註解）——
      // 只能退而求其次，用所屬取消案件的提出時間近似「這筆退款是什麼時候發生的」；完全無從
      // 判斷時間時，寧可略過這筆事件，也不要在時間軸上放一個瞎猜的時間點。
      const at = r.processedAt ?? (r.cancellationCaseId ? casesById.get(r.cancellationCaseId)?.requestedAt : undefined);
      if (!at) continue;
      events.push({
        id: `refund-${r.id}`,
        at,
        kind: 'refund',
        title: `${this.t.activityTimeline.kindLabels['refund']}：${r.amount} 元（${this.t.bookingForm.paymentMethodLabels[r.method] ?? r.method}）`,
        detail: this.t.activityTimeline.refundStatusLabels[r.status] ?? r.status,
        actor: r.handledBy,
      });
    }

    if (memberId) {
      for (const entry of this.creditStore.entriesFor(memberId)) {
        if (!entry.sourceCancellationCaseId || !cancellationCaseIds.includes(entry.sourceCancellationCaseId)) {
          continue;
        }
        events.push({
          id: `credit-${entry.id}`,
          at: entry.occurredAt,
          kind: 'credit',
          title: `${this.t.activityTimeline.kindLabels['credit']}：${entry.amount} 元（${this.t.customerCreditPanel.typeLabels[entry.type] ?? entry.type}）`,
          ...(entry.reason ? { detail: entry.reason } : {}),
          actor: entry.handledBy,
        });
      }
    }

    return events;
  }

  private operatorRecoveryEvents(bookingId: string): ActivityEvent[] {
    const events: ActivityEvent[] = [];
    for (const c of this.operatorRecoveryStore.casesFor(bookingId)) {
      events.push({
        id: `operator-recovery-${c.id}`,
        at: c.discoveredAt,
        kind: 'operator_recovery',
        title: `${this.t.activityTimeline.kindLabels['operator_recovery']}：${this.t.operatorRecoveryPanel.reasonLabels[c.reason] ?? c.reason}`,
        actor: c.createdBy,
      });
      for (const attempt of c.remedyAttempts) {
        events.push({
          id: `operator-recovery-remedy-${attempt.id}`,
          at: attempt.attemptedAt,
          kind: 'operator_recovery',
          title: `${this.t.activityTimeline.kindLabels['operator_recovery']}：${
            this.t.operatorRecoveryPanel.remedyTypeLabels[attempt.type] ?? attempt.type
          }（${this.t.operatorRecoveryPanel.outcomeLabels[attempt.outcome] ?? attempt.outcome}）`,
          actor: attempt.notedBy,
        });
      }
      for (const taxi of c.taxiReimbursements) {
        events.push({
          id: `operator-recovery-taxi-${taxi.id}`,
          at: taxi.occurredAt,
          kind: 'operator_recovery',
          title: `${this.t.activityTimeline.kindLabels['operator_recovery']}：計程車車資補貼 ${taxi.amount} 元`,
          actor: taxi.notedBy,
        });
      }
      for (const goodwill of c.goodwillCompensations) {
        events.push({
          id: `operator-recovery-goodwill-${goodwill.id}`,
          at: goodwill.occurredAt,
          kind: 'operator_recovery',
          title: `${this.t.activityTimeline.kindLabels['operator_recovery']}：善意補償 ${goodwill.amount} 元（${
            this.t.operatorRecoveryPanel.goodwillTypeLabels[goodwill.type] ?? goodwill.type
          }）`,
          actor: goodwill.notedBy,
        });
      }
    }
    return events;
  }

  /**
   * 主管覆核事件：目前只有 HandoverStore（取車覆核）與 CancellationStore（退款手續費主管確認）
   * 會寫入 action: 'override'／'approve' 的 AuditEntry。這裡直接讀 AUDIT_ENTRY_REPO 並用
   * 「這個訂單自己的取車／還車紀錄與取消案件 id」反查回相關的稽核紀錄——AuditEntry.entityId
   * 存的是子紀錄自己的 id，不是 bookingId，必須先取得這些 id 集合才能篩選。
   */
  private supervisorOverrideEvents(bookingId: string, cancellationCaseIds: string[]): ActivityEvent[] {
    const handoverRecordIds = new Set(this.handoverStore.recordsFor(bookingId).map((r) => r.id));
    const caseIds = new Set(cancellationCaseIds);
    const relevant = this.auditRepo.getAll().filter(
      (entry) =>
        (entry.action === 'override' && entry.entityType === 'handover_record' && handoverRecordIds.has(entry.entityId)) ||
        (entry.action === 'approve' && entry.entityType === 'cancellation_case' && caseIds.has(entry.entityId)),
    );
    return relevant.map((entry) => ({
      id: `override-${entry.id}`,
      at: entry.createdAt,
      kind: 'supervisor_override' as const,
      title: `${this.t.activityTimeline.kindLabels['supervisor_override']}：${entry.afterSummary ?? entry.action}`,
      ...(entry.reason ? { detail: entry.reason } : {}),
      actor: entry.actorName,
    }));
  }

  private reminderEvents(bookingId: string): ActivityEvent[] {
    return this.reminderStore.statusesFor(bookingId).map((status) => {
      const at = status.sentAt ?? status.scheduledFor ?? status.updatedAt;
      const offsetLabel = this.t.reminderPanel.offsetLabels[status.offset] ?? status.offset;
      const stateLabel = this.t.dispatch.workList.reminderStateLabels[status.state] ?? status.state;
      const detailParts = [stateLabel];
      if (status.failureReason) detailParts.push(status.failureReason);
      // 「已寄送」是本專案最容易被誤讀成真的寄出去的狀態，每筆提醒事件都附上明確的模擬標示——
      // 見 ReminderStore 類別註解與設計文件第 8 節：實際寄送由後端負責，前端從未真的寄過信。
      if (status.state === 'sent') detailParts.push(this.t.activityTimeline.reminderMockSuffix);

      return {
        id: `reminder-${status.id}`,
        at,
        kind: 'reminder' as const,
        title: `${this.t.activityTimeline.kindLabels['reminder']}：${offsetLabel}`,
        detail: detailParts.join(' · '),
      };
    });
  }
}

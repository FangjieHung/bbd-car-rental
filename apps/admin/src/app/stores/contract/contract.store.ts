import { Injectable, Signal, inject, signal } from '@angular/core';
import { ContractSnapshot, ContractVersion, evaluateContractChange } from '@car-rental/domain';
import { CONTRACT_VERSION_REPO } from '../../core/repositories/tokens';

/**
 * 合約版本的薄封裝：CRUD 寫入 CONTRACT_VERSION_REPO，
 * 是否構成重大異動（需要 supersede 舊版並開新版）委派給 Task 6 的 evaluateContractChange 純函式。
 */
@Injectable({ providedIn: 'root' })
export class ContractStore {
  private readonly repo = inject(CONTRACT_VERSION_REPO);

  private readonly _versions = signal<ContractVersion[]>(this.repo.getAll());
  readonly versions: Signal<ContractVersion[]> = this._versions.asReadonly();

  versionsFor(bookingId: string): ContractVersion[] {
    return this._versions()
      .filter((v) => v.bookingId === bookingId)
      .sort((a, b) => a.version - b.version);
  }

  latestFor(bookingId: string): ContractVersion | undefined {
    const versions = this.versionsFor(bookingId);
    return versions.length > 0 ? versions[versions.length - 1] : undefined;
  }

  createDraft(bookingId: string, snapshot: ContractSnapshot): ContractVersion {
    const latest = this.latestFor(bookingId);
    const draft: ContractVersion = {
      id: crypto.randomUUID(),
      bookingId,
      version: latest ? latest.version + 1 : 1,
      status: 'draft',
      snapshot,
      createdAt: new Date().toISOString(),
    };
    this.repo.create(draft);
    this.reload();
    return draft;
  }

  sign(id: string, signatureAssetIds: string[]): ContractVersion {
    const updated = this.repo.update(id, {
      status: 'signed',
      signedAt: new Date().toISOString(),
      signatureAssetIds,
    });
    this.reload();
    return updated;
  }

  /**
   * 依新快照與目前最新版本比對：不構成重大異動就直接回傳現有最新版本（不產生無意義的新版本）；
   * 構成重大異動則把目前版本標記 superseded，並建立下一版草稿。
   */
  reviseIfChanged(bookingId: string, nextSnapshot: ContractSnapshot): ContractVersion {
    const latest = this.latestFor(bookingId);
    if (!latest) return this.createDraft(bookingId, nextSnapshot);

    const evaluation = evaluateContractChange(latest.snapshot, nextSnapshot);
    if (!evaluation.supersedes) return latest;

    this.repo.update(latest.id, {
      status: 'superseded',
      supersededReason: evaluation.changedFields.join(', '),
    });
    this.reload();
    return this.createDraft(bookingId, nextSnapshot);
  }

  private reload(): void {
    this._versions.set(this.repo.getAll());
  }
}

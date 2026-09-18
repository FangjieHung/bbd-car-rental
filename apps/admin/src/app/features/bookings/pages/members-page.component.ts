import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { DataTableCellDirective, DataTableColumn, DataTableComponent } from '@car-rental/ui';
import { Member } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { MemberStore } from '../../../stores/member/member.store';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import { PageToolbarComponent } from '../../../shared/ui/page-toolbar.component';
import { HeaderToolbarDirective } from '../../../layout/header/header-toolbar-slot';
import { ADMIN_DATA_TABLE_LABELS } from '../../../shared/ui/data-table-labels';
import { MemberFormDialogComponent } from '../dialogs/member-form-dialog.component';

@Component({
  selector: 'app-members-page',
  imports: [
    DataTableComponent,
    DataTableCellDirective,
    MatButtonModule,
    MatTooltipModule,
    PageToolbarComponent,
    HeaderToolbarDirective,
  ],
  templateUrl: './members-page.component.html',
  styleUrls: ['../../../app.scss'],
})
export class MembersPageComponent {
  protected readonly t = ZH_TW;
  readonly store = inject(MemberStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly labels = ADMIN_DATA_TABLE_LABELS;

  readonly columns: DataTableColumn<Member>[] = [
    { key: 'name', label: this.t.member.name, primary: true },
    { key: 'phone', label: this.t.member.phone, primary: true },
    { key: 'idNumber', label: this.t.member.idNumber, exportValue: (c) => c.idNumber ?? '—' },
    { key: 'note', label: this.t.member.note, exportValue: (c) => c.note ?? '' },
    { key: 'actions', label: this.t.common.actions, exportSkip: true },
  ];

  onExportFailed(e: Error): void {
    console.error('DataTable 匯出失敗', e);
    this.snackBar.open(this.labels.exportFailedText, undefined, { duration: 3000 });
  }

  async openForm(member: Member | null): Promise<void> {
    const ref = this.dialog.open(MemberFormDialogComponent, { data: member, width: '400px' });
    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;
    if (member) this.store.update(member.id, result);
    else this.store.create(result);
  }

  async remove(member: Member): Promise<void> {
    if (await confirm(this.dialog, this.t.common.deleteConfirm)) this.store.remove(member.id);
  }
}

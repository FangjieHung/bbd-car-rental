import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  PriceBreakdown,
  RENTAL_BRANCHES,
  Vehicle,
  VehicleCategory,
  VehicleUnavailableReason,
  findBranch,
  needsDispatch,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { StatusChipComponent } from '../../../shared/chips/status-chip.component';
import { TwdPipe } from '../../../shared/pipes/twd.pipe';
import { RENTAL_AVAILABILITY } from './rental-availability';
import { calendarDaysBetween, rentalPeriodOf, toDateKey } from './rental-period';

const t = ZH_TW;

/** 代入 `{name}` 形式的佔位字（同 common.selectedCount 的寫法）。 */
function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

/** 據點在 RENTAL_BRANCHES 的順序；沒有設定或查無此據點的排最後。 */
function branchOrder(branchId: string | undefined): number {
  const index = RENTAL_BRANCHES.findIndex((b) => b.id === branchId);
  return index < 0 ? RENTAL_BRANCHES.length : index;
}

/** 一列可以租的車（畫面要顯示的字都先算好）。 */
export interface AvailableVehicleRow {
  vehicle: Vehicle;
  /** 「在 {所在據點}」；所在據點未設定（或查無此據點）時為 undefined。 */
  branchText?: string;
  /** 取車據點已選、且知道車在哪時才有：免調度（成功色）或「需調度 A→B」（警示色）。 */
  dispatch?: { status: 'success' | 'warning'; label: string };
  /** 這段期間的租金試算；該車型沒有定價方案時為 undefined（畫面顯示「—」）。 */
  quote?: PriceBreakdown;
}

/** 一列同車型、但這段期間不能租的車。 */
export interface BlockedVehicleRow {
  vehicle: Vehicle;
  /** 不能租的原因，例：「已預訂 09/25 09:00–09/27 18:00」「保養中」。 */
  reason: string;
}

let nextListId = 0;

/**
 * 可租清單：列出一段期間內可以租的車（與月曆可用數同一個判斷），附所在據點、需不需要調度、這段期間的租金；
 * 同車型但不能租的車收在下方，展開可看原因。建單第 1 步用單選模式；總覽「可用」分頁（批次 3）用按鈕模式、
 * 點了直接去建單。元件只負責顯示與回報「點了哪台」，選了之後怎麼寫回表單由使用端決定。
 */
@Component({
  selector: 'app-available-vehicle-list',
  imports: [NgTemplateOutlet, StatusChipComponent, TwdPipe],
  templateUrl: './available-vehicle-list.component.html',
  styleUrl: './available-vehicle-list.component.scss',
})
export class AvailableVehicleListComponent {
  protected readonly t = t;
  private readonly source = inject(RENTAL_AVAILABILITY);
  /** 單選圈的 name；同一頁有兩份清單時不能互相干擾。 */
  protected readonly radioName = `available-vehicle-list-${nextListId++}`;

  /** 取車時間：本地時間 YYYY-MM-DDTHH:mm（與訂單表單的 datetime-local 欄位同格式）。 */
  readonly start = input('');
  /** 還車時間，格式同 `start`。 */
  readonly end = input('');
  /** 只列這個車種；空字串＝全部。 */
  readonly category = input<VehicleCategory | ''>('');
  /** 取車據點 id；有值時已在這個據點的車排前面，並標出免調度／需調度。 */
  readonly pickupBranchId = input('');
  /** true：單選清單（每列有單選圈、選中的列加框線）；false：每列是一顆按鈕。 */
  readonly selectable = input(false);
  /** 單選時目前選中的車輛 id。 */
  readonly selectedVehicleId = input('');
  /** 編輯既有訂單時傳入它的 id，排除它自己，否則它的車會顯示成「已預訂」。 */
  readonly excludeBookingId = input<string | undefined>(undefined);

  /** 使用者點了某一列（單選模式下＝選了這台車）。 */
  readonly vehicleSelected = output<Vehicle>();

  private readonly period = computed(() => rentalPeriodOf(this.start(), this.end()));
  /** empty：租期還沒選齊；invalid：還車不晚於取車；ready：可以列清單。 */
  protected readonly periodState = computed<'empty' | 'invalid' | 'ready'>(() => {
    if (!this.start() || !this.end()) return 'empty';
    return this.period() ? 'ready' : 'invalid';
  });

  private readonly availability = computed(() => {
    const period = this.period();
    if (!period) return undefined;
    return this.source.forPeriod(period.start.toISOString(), period.end.toISOString(), this.excludeBookingId());
  });

  private readonly categoryWord = computed(() => {
    const category = this.category();
    return category ? (t.vehicle.typeLabels[category] ?? category) : t.rentalSearch.anyCategory;
  });

  /** 依取車據點排序：已在取車據點的排前面，其餘依據點（RENTAL_BRANCHES 的順序）、車牌。 */
  readonly rows = computed<AvailableVehicleRow[]>(() => {
    const availability = this.availability();
    const period = this.period();
    if (!availability || !period) return [];
    const category = this.category();
    const pickup = findBranch(this.pickupBranchId());
    const startDate = toDateKey(period.start);
    const endDate = toDateKey(period.end);
    const atPickup = (v: Vehicle) => !!pickup && findBranch(v.branchId)?.id === pickup.id;

    return availability.available
      .filter((v) => !category || v.category === category)
      .sort(
        (a, b) =>
          Number(atPickup(b)) - Number(atPickup(a)) ||
          branchOrder(findBranch(a.branchId)?.id) - branchOrder(findBranch(b.branchId)?.id) ||
          a.plateNumber.localeCompare(b.plateNumber),
      )
      .map((vehicle) => {
        const branch = findBranch(vehicle.branchId);
        const row: AvailableVehicleRow = { vehicle, quote: this.source.quote(vehicle, startDate, endDate) };
        if (branch) row.branchText = fill(t.rentalSearch.atBranch, { branch: branch.name });
        if (branch && pickup) {
          row.dispatch = needsDispatch(branch.id, pickup.id)
            ? { status: 'warning', label: fill(t.rentalSearch.needsDispatch, { from: branch.name, to: pickup.name }) }
            : { status: 'success', label: t.rentalSearch.noDispatch };
        }
        return row;
      });
  });

  /** 同車型、這段期間不能租的車，依車牌排序。 */
  readonly blocked = computed<BlockedVehicleRow[]>(() => {
    const category = this.category();
    return (this.availability()?.unavailable ?? [])
      .filter(({ vehicle }) => !category || vehicle.category === category)
      .sort((a, b) => a.vehicle.plateNumber.localeCompare(b.vehicle.plateNumber))
      .map(({ vehicle, reasons }) => ({
        vehicle,
        reason: reasons.map((r) => this.reasonText(r)).join(t.rentalSearch.reasonSeparator),
      }));
  });

  protected readonly title = computed(() =>
    fill(t.rentalSearch.listTitle, { count: this.rows().length, category: this.categoryWord() }),
  );
  protected readonly emptyText = computed(() => fill(t.rentalSearch.empty, { category: this.categoryWord() }));
  protected readonly blockedToggleText = computed(() =>
    fill(t.rentalSearch.blockedToggle, { count: this.blocked().length }),
  );
  /** 「N 天」：與定價引擎的晚數一致（只看日期）。 */
  protected readonly daysText = computed(() => {
    const period = this.period();
    return period ? fill(t.rentalSearch.days, { days: calendarDaysBetween(period.start, period.end) }) : '';
  });

  /** 使用者明確展開／收合過就照他的；沒動過時，整段期間都沒有可租的車才預設展開。 */
  private readonly blockedToggled = signal<boolean | null>(null);
  protected readonly blockedOpen = computed(() => this.blockedToggled() ?? this.rows().length === 0);

  protected toggleBlocked(): void {
    this.blockedToggled.set(!this.blockedOpen());
  }

  protected pick(vehicle: Vehicle): void {
    this.vehicleSelected.emit(vehicle);
  }

  private reasonText(reason: VehicleUnavailableReason): string {
    if (reason.kind === 'maintenance') return t.rentalSearch.maintenance;
    return fill(t.rentalSearch.booked, {
      start: fmtDateTime(reason.order.startTime),
      end: fmtDateTime(reason.order.endTime),
    });
  }
}

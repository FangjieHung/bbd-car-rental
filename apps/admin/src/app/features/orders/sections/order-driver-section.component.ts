import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { merge } from 'rxjs';
import { VEHICLE_CATEGORIES, VehicleCategory } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { DriverEligibilityResult } from '../../../core/services/driver-eligibility.gateway';
import { DriverEligibilityPanelComponent } from '../../members/components/driver-eligibility-panel.component';
import {
  OrderForm,
  orderFormValue,
  LICENSE_PATHS,
  isForeignLicensePath,
  prefillDriver,
  ORDER_FORM_DATA,
} from '@car-rental/order-form';
import { latestByVersion } from '../incomplete/order-incomplete';

/**
 * 建立訂單第 2 步的「駕駛資格」區塊（4.2）：欄位與規則沿用會員視窗——駕照號碼、效期、准駕類別、
 * 標準化車種；外國旅客另有互惠資格查核（同一個 driver-eligibility-panel）。整組可以留空，
 * 留空時列入待補「駕駛資格未查核」。
 *
 * 選了既有會員就帶入他最新一版的駕駛資格（仍可修改）；換回新承租人時清空。證件照片不在這一步拍，
 * 之後在會員資料補（會員視窗有完整的拍照／OCR 流程）。只放在建立訂單頁：訂單詳情的「編輯訂單」
 * 只改訂單本身的欄位（CONTEXT.md「編輯訂單」），駕駛資格屬於會員資料。
 */
@Component({
  selector: 'app-order-driver-section',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, DriverEligibilityPanelComponent],
  templateUrl: './order-driver-section.component.html',
  styleUrl: './order-section.scss',
})
export class OrderDriverSectionComponent {
  protected readonly t = ZH_TW;
  protected readonly licensePaths = LICENSE_PATHS;
  protected readonly categories = VEHICLE_CATEGORIES;
  private readonly data = inject(ORDER_FORM_DATA);

  readonly form = input.required<OrderForm>();
  /** 本次租的車種；標準化車種選了不同的車種時提醒（取車時會被「准駕車種不符」擋下）。 */
  readonly vehicleCategory = input<VehicleCategory | undefined>(undefined);

  private readonly value = orderFormValue(this.form);
  private readonly memberId = computed(() => this.value().renter.memberId);
  protected readonly isResident = computed(() => this.value().renter.kind === 'resident');
  protected readonly isForeignVisitor = computed(() => this.value().renter.kind === 'foreign_visitor');
  protected readonly isForeignPath = computed(() => {
    const v = this.value();
    return isForeignLicensePath(v.renter.kind, v.driver.licensePath);
  });
  /** 互惠資格查核用的發照國家：與送出時寫入的相同（沒填發照國家就用國籍）。 */
  protected readonly issuingCountry = computed(() => {
    const v = this.value();
    return v.driver.licenseIssuingCountry.trim() || v.renter.nationality.trim();
  });
  /** 帶入了既有會員的駕駛資格（提示「有更新再修改」）。 */
  protected readonly prefilled = computed(() => {
    const memberId = this.memberId();
    return !!memberId && !!latestByVersion(this.data.driverCredentialsOf(memberId));
  });
  /** 標準化車種與本次車輛不同時，本次車輛的車型名稱（提醒用）；相符或還沒選時為空字串。 */
  protected readonly classMismatchVehicle = computed(() => {
    const chosen = this.value().driver.standardizedVehicleClass;
    const rented = this.vehicleCategory();
    return chosen && rented && chosen !== rented ? (this.t.vehicle.typeLabels[rented] ?? rented) : '';
  });

  /** 最近一次處理過的承租人；只在「換了一位」時帶入／清空，重新建立元件（例如換步驟版面）不會清掉已填的內容。 */
  private lastMemberId: string | null | undefined = undefined;

  constructor() {
    effect(() => {
      const memberId = this.memberId();
      untracked(() => {
        if (this.lastMemberId === undefined || this.lastMemberId === memberId) {
          this.lastMemberId = memberId;
          return;
        }
        this.lastMemberId = memberId;
        const form = this.form();
        const credential = memberId ? latestByVersion(this.data.driverCredentialsOf(memberId)) : undefined;
        prefillDriver(form, credential, form.getRawValue().renter.kind);
      });
    });

    // 發照國家（或國籍）改了，先前的互惠資格查核結果就不算數，要重新查核。
    effect((onCleanup) => {
      const form = this.form();
      const { driver, renter } = form.controls;
      const sub = merge(driver.controls.licenseIssuingCountry.valueChanges, renter.controls.nationality.valueChanges).subscribe(
        () => {
          if (driver.controls.reciprocityStatus.value !== null) driver.controls.reciprocityStatus.setValue(null);
        },
      );
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected onEligibilityChecked(result: DriverEligibilityResult): void {
    this.form().controls.driver.controls.reciprocityStatus.setValue(result.reciprocityStatus);
  }
}

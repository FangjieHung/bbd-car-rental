import { Directive, TemplateRef, inject } from '@angular/core';

/** 逃生門模式：頁面自行提供 thead 內容（可用 colspan / rowspan）。 */
@Directive({ selector: 'ng-template[dtHead]' })
export class DataTableHeadDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** 逃生門模式：頁面自行提供 tbody 內容。 */
@Directive({ selector: 'ng-template[dtBody]' })
export class DataTableBodyDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

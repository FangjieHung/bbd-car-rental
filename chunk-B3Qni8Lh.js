import {ag as S,aq as $e,v,m as mE,co as me,dG as ge,dH as St,n as nl,a0 as gi,av as Qa,d as di,_ as _p,M as MI,R as Rc,r as fp,ay as sI,B as Bv,U as Up,D as Dp,h as vp,az as HI,aE as xp,aF as rI,aG as oI,dI as l,bM as H,a4 as ip,a5 as ms,a6 as ni,cp as Ht$1,a7 as gt,dq as vt,dJ as T,ap as mC,a9 as Rn,aM as J,cm as Rt$1,ct as $t$1,aW as Fi,aV as Bo,a2 as VE,a3 as BE,Q as QE,s as sl,J as JE,f as al,an as Ep,d2 as Z,ac as ye,a8 as Ne$1,ah as H$1,ai as lt,ab as Lf,dK as Qo,t as tl,P as Pp,aD as yI,aQ as Y,as as ih,bl as sg,aU as Eg,ak as DP,aw as eI,ax as tI,aP as Np,ad as Yt,bC as Ee,bc as vl,dC as Dl,cf as xn,be as _i,F as Fo,aT as Ag,bu as Or,b as UE,e as GE,bD as Yp,bH as OI,bE as qp,dL as kD,aj as Mc,aS as w,bf as ie,ar as $r,bg as mv,O as Oc,k as kc,aC as wp,L as Lc,bj as Gp,aZ as Fp,S as Sp,cS as Ip}from'./main-75DZX6EX.js';import {c as ce,r as rt,a as ae$1,P as Pt$1,l as ln,b as an}from'./chunk-oxE4iUvs.js';var It=new S("DUAL_MONTH_RANGE_PICKER_LABELS");function $t(i,s){return this._trackRow(s)}var Nt=(i,s)=>s.id;function Gt(i,s){if(i&1&&(Oc(0,"tr",0)(1,"td",3),MI(2),kc()()),i&2){let e=JE();Bv(),Fp("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),vp("colspan",e.numCols),Bv(),Lc(" ",e.label," ");}}function Ut(i,s){if(i&1&&(Oc(0,"td",3),MI(1),kc()),i&2){let e=JE(2);Fp("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),vp("colspan",e._firstRowOffset),Bv(),Lc(" ",e._firstRowOffset>=e.labelMinRequiredCells?e.label:""," ");}}function Xt(i,s){if(i&1){let e=QE();Oc(0,"td",6)(1,"button",7),Sp("click",function(t){let n=sl(e).$implicit,r=JE(2);return al(r._cellClicked(n,t))})("focus",function(t){let n=sl(e).$implicit,r=JE(2);return al(r._emitActiveDateChange(n,t))}),Oc(2,"span",8),MI(3),kc(),Ip(4,"span",9),kc()();}if(i&2){let e=s.$implicit,a=s.$index,t=JE().$index,n=JE();Fp("width",n._cellWidth)("padding-top",n._cellPadding)("padding-bottom",n._cellPadding),vp("data-mat-row",t)("data-mat-col",a),Bv(),yI(e.cssClasses),Pp("mat-calendar-body-disabled",!e.enabled)("mat-calendar-body-active",n._isActiveCell(t,a))("mat-calendar-body-range-start",n._isRangeStart(e.compareValue))("mat-calendar-body-range-end",n._isRangeEnd(e.compareValue))("mat-calendar-body-in-range",n._isInRange(e.compareValue))("mat-calendar-body-comparison-bridge-start",n._isComparisonBridgeStart(e.compareValue,t,a))("mat-calendar-body-comparison-bridge-end",n._isComparisonBridgeEnd(e.compareValue,t,a))("mat-calendar-body-comparison-start",n._isComparisonStart(e.compareValue))("mat-calendar-body-comparison-end",n._isComparisonEnd(e.compareValue))("mat-calendar-body-in-comparison-range",n._isInComparisonRange(e.compareValue))("mat-calendar-body-preview-start",n._isPreviewStart(e.compareValue))("mat-calendar-body-preview-end",n._isPreviewEnd(e.compareValue))("mat-calendar-body-in-preview",n._isInPreview(e.compareValue)),wp("tabIndex",n._isActiveCell(t,a)?0:-1),vp("aria-label",e.ariaLabel)("aria-disabled",!e.enabled||null)("aria-pressed",n._isSelected(e.compareValue))("aria-current",n.todayValue===e.compareValue?"date":null)("aria-describedby",n._getDescribedby(e.compareValue)),Bv(),Pp("mat-calendar-body-selected",n._isSelected(e.compareValue))("mat-calendar-body-comparison-identical",n._isComparisonIdentical(e.compareValue))("mat-calendar-body-today",n.todayValue===e.compareValue),Bv(),Lc(" ",e.displayValue," ");}}function Zt(i,s){if(i&1&&(Oc(0,"tr",1),VE(1,Ut,2,6,"td",4),UE(2,Xt,5,49,"td",5,Nt),kc()),i&2){let e=s.$implicit,a=s.$index,t=JE();Bv(),BE(a===0&&t._firstRowOffset?1:-1),Bv(),GE(e);}}function Jt(i,s){if(i&1&&(di(0,"th",2)(1,"span",6),MI(2),Rc(),di(3,"span",3),MI(4),Rc()()),i&2){let e=s.$implicit;Bv(2),Up(e.long),Bv(2),Up(e.narrow);}}var ea=["*"];function ta(i,s){}function aa(i,s){if(i&1){let e=QE();di(0,"mat-month-view",4),Yp("activeDateChange",function(t){sl(e);let n=JE();return OI(n.activeDate,t)||(n.activeDate=t),al(t)}),_p("_userSelection",function(t){sl(e);let n=JE();return al(n._dateSelected(t))})("dragStarted",function(t){sl(e);let n=JE();return al(n._dragStarted(t))})("dragEnded",function(t){sl(e);let n=JE();return al(n._dragEnded(t))}),Rc();}if(i&2){let e=JE();qp("activeDate",e.activeDate),Dp("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)("comparisonStart",e.comparisonStart)("comparisonEnd",e.comparisonEnd)("startDateAccessibleName",e.startDateAccessibleName)("endDateAccessibleName",e.endDateAccessibleName)("activeDrag",e._activeDrag);}}function na(i,s){if(i&1){let e=QE();di(0,"mat-year-view",5),Yp("activeDateChange",function(t){sl(e);let n=JE();return OI(n.activeDate,t)||(n.activeDate=t),al(t)}),_p("monthSelected",function(t){sl(e);let n=JE();return al(n._monthSelectedInYearView(t))})("selectedChange",function(t){sl(e);let n=JE();return al(n._goToDateInView(t,"month"))}),Rc();}if(i&2){let e=JE();qp("activeDate",e.activeDate),Dp("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass);}}function ia(i,s){if(i&1){let e=QE();di(0,"mat-multi-year-view",6),Yp("activeDateChange",function(t){sl(e);let n=JE();return OI(n.activeDate,t)||(n.activeDate=t),al(t)}),_p("yearSelected",function(t){sl(e);let n=JE();return al(n._yearSelectedInMultiYearView(t))})("selectedChange",function(t){sl(e);let n=JE();return al(n._goToDateInView(t,"year"))}),Rc();}if(i&2){let e=JE();qp("activeDate",e.activeDate),Dp("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass);}}function ra(i,s){}var sa=["button"],oa=[[["","matDatepickerToggleIcon",""]]],da=["[matDatepickerToggleIcon]"];function la(i,s){i&1&&(vl(),di(0,"svg",2),Ep(1,"path",3),Rc());}var j=(()=>{class i{changes=new J;calendarLabel="Calendar";openCalendarLabel="Open calendar";closeCalendarLabel="Close calendar";prevMonthLabel="Previous month";nextMonthLabel="Next month";prevYearLabel="Previous year";nextYearLabel="Next year";prevMultiYearLabel="Previous 24 years";nextMultiYearLabel="Next 24 years";switchToMonthViewLabel="Choose date";switchToMultiYearViewLabel="Choose month and year";startDateLabel="Start date";endDateLabel="End date";comparisonDateLabel="Comparison range";formatYearRange(e,a){return `${e} \u2013 ${a}`}formatYearRangeLabel(e,a){return `${e} to ${a}`}static \u0275fac=function(a){return new(a||i)};static \u0275prov=xn({token:i,factory:i.\u0275fac})}return i})(),ca=0,ae=class{value;displayValue;ariaLabel;enabled;compareValue;rawValue;id=ca++;cssClasses;constructor(s,e,a,t,n,r=s,c){this.value=s,this.displayValue=e,this.ariaLabel=a,this.enabled=t,this.compareValue=r,this.rawValue=c,this.cssClasses=n instanceof Set?Array.from(n):n;}},pa={passive:false,capture:true},Ce={passive:true,capture:true},Rt={passive:true},K=(()=>{class i{_elementRef=v(Rn);_ngZone=v(Ne$1);_platform=v(w);_intl=v(j);_eventCleanups;_skipNextFocus=false;_focusActiveCellAfterViewChecked=false;label;rows;todayValue;startValue;endValue;labelMinRequiredCells;numCols=7;activeCell=0;ngAfterViewChecked(){this._focusActiveCellAfterViewChecked&&(this._focusActiveCell(),this._focusActiveCellAfterViewChecked=false);}isRange=false;cellAspectRatio=1;comparisonStart=null;comparisonEnd=null;previewStart=null;previewEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedValueChange=new $e;previewChange=new $e;activeDateChange=new $e;dragStarted=new $e;dragEnded=new $e;_firstRowOffset;_cellPadding;_cellWidth;_startDateLabelId;_endDateLabelId;_comparisonStartDateLabelId;_comparisonEndDateLabelId;_didDragSinceMouseDown=false;_injector=v(ie);comparisonDateAccessibleName=this._intl.comparisonDateLabel;_trackRow=e=>e;constructor(){let e=v(Lf),a=v(Yt);this._startDateLabelId=a.getId("mat-calendar-body-start-"),this._endDateLabelId=a.getId("mat-calendar-body-end-"),this._comparisonStartDateLabelId=a.getId("mat-calendar-body-comparison-start-"),this._comparisonEndDateLabelId=a.getId("mat-calendar-body-comparison-end-"),v(H$1).load($r),this._ngZone.runOutsideAngular(()=>{let t=this._elementRef.nativeElement,n=[e.listen(t,"touchmove",this._touchmoveHandler,pa),e.listen(t,"mouseenter",this._enterHandler,Ce),e.listen(t,"focus",this._enterHandler,Ce),e.listen(t,"mouseleave",this._leaveHandler,Ce),e.listen(t,"blur",this._leaveHandler,Ce),e.listen(t,"mousedown",this._mousedownHandler,Rt),e.listen(t,"touchstart",this._mousedownHandler,Rt)];this._platform.isBrowser&&n.push(e.listen("window","mouseup",this._mouseupHandler),e.listen("window","touchend",this._touchendHandler)),this._eventCleanups=n;});}_cellClicked(e,a){this._didDragSinceMouseDown||e.enabled&&this.selectedValueChange.emit({value:e.value,event:a});}_emitActiveDateChange(e,a){e.enabled&&this.activeDateChange.emit({value:e.value,event:a});}_isSelected(e){return this.startValue===e||this.endValue===e}ngOnChanges(e){let a=e.numCols,{rows:t,numCols:n}=this;(e.rows||a)&&(this._firstRowOffset=t&&t.length&&t[0].length?n-t[0].length:0),(e.cellAspectRatio||a||!this._cellPadding)&&(this._cellPadding=`${50*this.cellAspectRatio/n}%`),(a||!this._cellWidth)&&(this._cellWidth=`${100/n}%`);}ngOnDestroy(){this._eventCleanups.forEach(e=>e());}_isActiveCell(e,a){let t=e*this.numCols+a;return e&&(t-=this._firstRowOffset),t==this.activeCell}_focusActiveCell(e=true){mv(()=>{setTimeout(()=>{let a=this._elementRef.nativeElement.querySelector(".mat-calendar-body-active");a&&(e||(this._skipNextFocus=true),a.focus());});},{injector:this._injector});}_scheduleFocusActiveCellAfterViewChecked(){this._focusActiveCellAfterViewChecked=true;}_isRangeStart(e){return Ne(e,this.startValue,this.endValue)}_isRangeEnd(e){return Le(e,this.startValue,this.endValue)}_isInRange(e){return Be(e,this.startValue,this.endValue,this.isRange)}_isComparisonStart(e){return Ne(e,this.comparisonStart,this.comparisonEnd)}_isComparisonBridgeStart(e,a,t){if(!this._isComparisonStart(e)||this._isRangeStart(e)||!this._isInRange(e))return  false;let n=this.rows[a][t-1];if(!n){let r=this.rows[a-1];n=r&&r[r.length-1];}return n&&!this._isRangeEnd(n.compareValue)}_isComparisonBridgeEnd(e,a,t){if(!this._isComparisonEnd(e)||this._isRangeEnd(e)||!this._isInRange(e))return  false;let n=this.rows[a][t+1];if(!n){let r=this.rows[a+1];n=r&&r[0];}return n&&!this._isRangeStart(n.compareValue)}_isComparisonEnd(e){return Le(e,this.comparisonStart,this.comparisonEnd)}_isInComparisonRange(e){return Be(e,this.comparisonStart,this.comparisonEnd,this.isRange)}_isComparisonIdentical(e){return this.comparisonStart===this.comparisonEnd&&e===this.comparisonStart}_isPreviewStart(e){return Ne(e,this.previewStart,this.previewEnd)}_isPreviewEnd(e){return Le(e,this.previewStart,this.previewEnd)}_isInPreview(e){return Be(e,this.previewStart,this.previewEnd,this.isRange)}_getDescribedby(e){if(!this.isRange)return null;if(this.startValue===e&&this.endValue===e)return `${this._startDateLabelId} ${this._endDateLabelId}`;if(this.startValue===e)return this._startDateLabelId;if(this.endValue===e)return this._endDateLabelId;if(this.comparisonStart!==null&&this.comparisonEnd!==null){if(e===this.comparisonStart&&e===this.comparisonEnd)return `${this._comparisonStartDateLabelId} ${this._comparisonEndDateLabelId}`;if(e===this.comparisonStart)return this._comparisonStartDateLabelId;if(e===this.comparisonEnd)return this._comparisonEndDateLabelId}return null}_enterHandler=e=>{if(this._skipNextFocus&&e.type==="focus"){this._skipNextFocus=false;return}if(e.target&&this.isRange){let a=this._getCellFromElement(e.target);a&&this._ngZone.run(()=>this.previewChange.emit({value:a.enabled?a:null,event:e}));}};_touchmoveHandler=e=>{if(!this.isRange)return;let a=Ft(e),t=a?this._getCellFromElement(a):null;a!==e.target&&(this._didDragSinceMouseDown=true),Ye(e.target)&&e.preventDefault(),this._ngZone.run(()=>this.previewChange.emit({value:t?.enabled?t:null,event:e}));};_leaveHandler=e=>{this.previewEnd!==null&&this.isRange&&(e.type!=="blur"&&(this._didDragSinceMouseDown=true),e.target&&this._getCellFromElement(e.target)&&!(e.relatedTarget&&this._getCellFromElement(e.relatedTarget))&&this._ngZone.run(()=>this.previewChange.emit({value:null,event:e})));};_mousedownHandler=e=>{if(!this.isRange)return;this._didDragSinceMouseDown=false;let a=e.target&&this._getCellFromElement(e.target);!a||!this._isInRange(a.compareValue)||this._ngZone.run(()=>{this.dragStarted.emit({value:a.rawValue,event:e});});};_mouseupHandler=e=>{if(!this.isRange)return;let a=Ye(e.target);if(!a){this._ngZone.run(()=>{this.dragEnded.emit({value:null,event:e});});return}a.closest(".mat-calendar-body")===this._elementRef.nativeElement&&this._ngZone.run(()=>{let t=this._getCellFromElement(a);this.dragEnded.emit({value:t?.rawValue??null,event:e});});};_touchendHandler=e=>{let a=Ft(e);a&&this._mouseupHandler({target:a});};_getCellFromElement(e){let a=Ye(e);if(a){let t=a.getAttribute("data-mat-row"),n=a.getAttribute("data-mat-col");if(t&&n)return this.rows[parseInt(t)]?.[parseInt(n)]||null}return null}static \u0275fac=function(a){return new(a||i)};static \u0275cmp=mE({type:i,selectors:[["","mat-calendar-body",""]],hostAttrs:[1,"mat-calendar-body"],inputs:{label:"label",rows:"rows",todayValue:"todayValue",startValue:"startValue",endValue:"endValue",labelMinRequiredCells:"labelMinRequiredCells",numCols:"numCols",activeCell:"activeCell",isRange:"isRange",cellAspectRatio:"cellAspectRatio",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",previewStart:"previewStart",previewEnd:"previewEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedValueChange:"selectedValueChange",previewChange:"previewChange",activeDateChange:"activeDateChange",dragStarted:"dragStarted",dragEnded:"dragEnded"},exportAs:["matCalendarBody"],features:[Qa],decls:11,vars:11,consts:[["aria-hidden","true"],["role","row"],[1,"mat-calendar-body-hidden-label",3,"id"],[1,"mat-calendar-body-label"],[1,"mat-calendar-body-label",3,"paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container",3,"width","paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container"],["type","button",1,"mat-calendar-body-cell",3,"click","focus","tabindex"],[1,"mat-calendar-body-cell-content","mat-focus-indicator"],["aria-hidden","true",1,"mat-calendar-body-cell-preview"]],template:function(a,t){a&1&&(VE(0,Gt,3,6,"tr",0),UE(1,Zt,4,1,"tr",1,$t,true),Oc(3,"span",2),MI(4),kc(),Oc(5,"span",2),MI(6),kc(),Oc(7,"span",2),MI(8),kc(),Oc(9,"span",2),MI(10),kc()),a&2&&(BE(t._firstRowOffset<t.labelMinRequiredCells?0:-1),Bv(),GE(t.rows),Bv(2),wp("id",t._startDateLabelId),Bv(),Lc(" ",t.startDateAccessibleName,`
`),Bv(),wp("id",t._endDateLabelId),Bv(),Lc(" ",t.endDateAccessibleName,`
`),Bv(),wp("id",t._comparisonStartDateLabelId),Bv(),Gp(" ",t.comparisonDateAccessibleName," ",t.startDateAccessibleName,`
`),Bv(),wp("id",t._comparisonEndDateLabelId),Bv(),Gp(" ",t.comparisonDateAccessibleName," ",t.endDateAccessibleName,`
`));},styles:[`.mat-calendar-body {
  min-width: 224px;
}

.mat-calendar-body-today:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
  border-color: var(--mat-datepicker-calendar-date-today-outline-color, var(--mat-sys-primary));
}

.mat-calendar-body-label {
  height: 0;
  line-height: 0;
  text-align: start;
  padding-left: 4.7142857143%;
  padding-right: 4.7142857143%;
  font-size: var(--mat-datepicker-calendar-body-label-text-size, var(--mat-sys-title-small-size));
  font-weight: var(--mat-datepicker-calendar-body-label-text-weight, var(--mat-sys-title-small-weight));
  color: var(--mat-datepicker-calendar-body-label-text-color, var(--mat-sys-on-surface));
}

.mat-calendar-body-hidden-label {
  display: none;
}

.mat-calendar-body-cell-container {
  position: relative;
  height: 0;
  line-height: 0;
}

.mat-calendar-body-cell {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: none;
  text-align: center;
  outline: none;
  margin: 0;
  font-family: var(--mat-datepicker-calendar-text-font, var(--mat-sys-body-medium-font));
  font-size: var(--mat-datepicker-calendar-text-size, var(--mat-sys-body-medium-size));
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  outline: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
}
.mat-calendar-body-cell::-moz-focus-inner {
  border: 0;
}

.mat-calendar-body-cell::before,
.mat-calendar-body-cell::after,
.mat-calendar-body-cell-preview {
  content: "";
  position: absolute;
  top: 5%;
  left: 0;
  z-index: 0;
  box-sizing: border-box;
  display: block;
  height: 90%;
  width: 100%;
}

.mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,
.mat-calendar-body-range-start::after,
.mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,
.mat-calendar-body-comparison-start::after,
.mat-calendar-body-preview-start .mat-calendar-body-cell-preview {
  left: 5%;
  width: 95%;
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
}
[dir=rtl] .mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,
[dir=rtl] .mat-calendar-body-range-start::after,
[dir=rtl] .mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,
[dir=rtl] .mat-calendar-body-comparison-start::after,
[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview {
  left: 0;
  border-radius: 0;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}

.mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,
.mat-calendar-body-range-end::after,
.mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,
.mat-calendar-body-comparison-end::after,
.mat-calendar-body-preview-end .mat-calendar-body-cell-preview {
  width: 95%;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}
[dir=rtl] .mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,
[dir=rtl] .mat-calendar-body-range-end::after,
[dir=rtl] .mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,
[dir=rtl] .mat-calendar-body-comparison-end::after,
[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview {
  left: 5%;
  border-radius: 0;
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
}

[dir=rtl] .mat-calendar-body-comparison-bridge-start.mat-calendar-body-range-end::after,
[dir=rtl] .mat-calendar-body-comparison-bridge-end.mat-calendar-body-range-start::after {
  width: 95%;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}

.mat-calendar-body-comparison-start.mat-calendar-body-range-end::after, [dir=rtl] .mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,
.mat-calendar-body-comparison-end.mat-calendar-body-range-start::after,
[dir=rtl] .mat-calendar-body-comparison-end.mat-calendar-body-range-start::after {
  width: 90%;
}

.mat-calendar-body-in-preview {
  color: var(--mat-datepicker-calendar-date-preview-state-outline-color, var(--mat-sys-primary));
}
.mat-calendar-body-in-preview .mat-calendar-body-cell-preview {
  border-top: dashed 1px;
  border-bottom: dashed 1px;
}

.mat-calendar-body-preview-start .mat-calendar-body-cell-preview {
  border-left: dashed 1px;
}
[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview {
  border-left: 0;
  border-right: dashed 1px;
}

.mat-calendar-body-preview-end .mat-calendar-body-cell-preview {
  border-right: dashed 1px;
}
[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview {
  border-right: 0;
  border-left: dashed 1px;
}

.mat-calendar-body-disabled {
  cursor: default;
}
.mat-calendar-body-disabled > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
  color: var(--mat-datepicker-calendar-date-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-calendar-body-disabled > .mat-calendar-body-today:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
  border-color: var(--mat-datepicker-calendar-date-today-disabled-state-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mat-calendar-body-disabled {
    opacity: 0.5;
  }
}

.mat-calendar-body-cell-content {
  top: 5%;
  left: 5%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 90%;
  height: 90%;
  line-height: 1;
  border-width: 1px;
  border-style: solid;
  border-radius: 999px;
  color: var(--mat-datepicker-calendar-date-text-color, var(--mat-sys-on-surface));
  border-color: var(--mat-datepicker-calendar-date-outline-color, transparent);
}
.mat-calendar-body-cell-content.mat-focus-indicator {
  position: absolute;
}
@media (forced-colors: active) {
  .mat-calendar-body-cell-content {
    border: none;
  }
}

.cdk-keyboard-focused .mat-calendar-body-active > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical), .cdk-program-focused .mat-calendar-body-active > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
  background-color: var(--mat-datepicker-calendar-date-focus-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
}

@media (hover: hover) {
  .mat-calendar-body-cell:not(.mat-calendar-body-disabled):hover > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
    background-color: var(--mat-datepicker-calendar-date-hover-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
  }
}
.mat-calendar-body-selected {
  background-color: var(--mat-datepicker-calendar-date-selected-state-background-color, var(--mat-sys-primary));
  color: var(--mat-datepicker-calendar-date-selected-state-text-color, var(--mat-sys-on-primary));
}
.mat-calendar-body-disabled > .mat-calendar-body-selected {
  background-color: var(--mat-datepicker-calendar-date-selected-disabled-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-calendar-body-selected.mat-calendar-body-today {
  box-shadow: inset 0 0 0 1px var(--mat-datepicker-calendar-date-today-selected-state-outline-color, var(--mat-sys-primary));
}

.mat-calendar-body-in-range::before {
  background: var(--mat-datepicker-calendar-date-in-range-state-background-color, var(--mat-sys-primary-container));
}

.mat-calendar-body-comparison-identical,
.mat-calendar-body-in-comparison-range::before {
  background: var(--mat-datepicker-calendar-date-in-comparison-range-state-background-color, var(--mat-sys-tertiary-container));
}

.mat-calendar-body-comparison-identical,
.mat-calendar-body-in-comparison-range::before {
  background: var(--mat-datepicker-calendar-date-in-comparison-range-state-background-color, var(--mat-sys-tertiary-container));
}

.mat-calendar-body-comparison-bridge-start::before,
[dir=rtl] .mat-calendar-body-comparison-bridge-end::before {
  background: linear-gradient(to right, var(--mat-datepicker-calendar-date-in-range-state-background-color, var(--mat-sys-primary-container)) 50%, var(--mat-datepicker-calendar-date-in-comparison-range-state-background-color, var(--mat-sys-tertiary-container)) 50%);
}

.mat-calendar-body-comparison-bridge-end::before,
[dir=rtl] .mat-calendar-body-comparison-bridge-start::before {
  background: linear-gradient(to left, var(--mat-datepicker-calendar-date-in-range-state-background-color, var(--mat-sys-primary-container)) 50%, var(--mat-datepicker-calendar-date-in-comparison-range-state-background-color, var(--mat-sys-tertiary-container)) 50%);
}

.mat-calendar-body-in-range > .mat-calendar-body-comparison-identical,
.mat-calendar-body-in-comparison-range.mat-calendar-body-in-range::after {
  background: var(--mat-datepicker-calendar-date-in-overlap-range-state-background-color, var(--mat-sys-secondary-container));
}

.mat-calendar-body-comparison-identical.mat-calendar-body-selected,
.mat-calendar-body-in-comparison-range > .mat-calendar-body-selected {
  background: var(--mat-datepicker-calendar-date-in-overlap-range-selected-state-background-color, var(--mat-sys-secondary));
}

@media (forced-colors: active) {
  .mat-datepicker-popup:not(:empty),
  .mat-calendar-body-cell:not(.mat-calendar-body-in-range) .mat-calendar-body-selected {
    outline: solid 1px;
  }
  .mat-calendar-body-today {
    outline: dotted 1px;
  }
  .mat-calendar-body-cell::before,
  .mat-calendar-body-cell::after,
  .mat-calendar-body-selected {
    background: none;
  }
  .mat-calendar-body-in-range::before,
  .mat-calendar-body-comparison-bridge-start::before,
  .mat-calendar-body-comparison-bridge-end::before {
    border-top: solid 1px;
    border-bottom: solid 1px;
  }
  .mat-calendar-body-range-start::before {
    border-left: solid 1px;
  }
  [dir=rtl] .mat-calendar-body-range-start::before {
    border-left: 0;
    border-right: solid 1px;
  }
  .mat-calendar-body-range-end::before {
    border-right: solid 1px;
  }
  [dir=rtl] .mat-calendar-body-range-end::before {
    border-right: 0;
    border-left: solid 1px;
  }
  .mat-calendar-body-in-comparison-range::before {
    border-top: dashed 1px;
    border-bottom: dashed 1px;
  }
  .mat-calendar-body-comparison-start::before {
    border-left: dashed 1px;
  }
  [dir=rtl] .mat-calendar-body-comparison-start::before {
    border-left: 0;
    border-right: dashed 1px;
  }
  .mat-calendar-body-comparison-end::before {
    border-right: dashed 1px;
  }
  [dir=rtl] .mat-calendar-body-comparison-end::before {
    border-right: 0;
    border-left: dashed 1px;
  }
}
`],encapsulation:2})}return i})();function Pe(i){return i?.nodeName==="TD"}function Ye(i){let s;return Pe(i)?s=i:Pe(i.parentNode)?s=i.parentNode:Pe(i.parentNode?.parentNode)&&(s=i.parentNode.parentNode),s?.getAttribute("data-mat-row")!=null?s:null}function Ne(i,s,e){return e!==null&&s!==e&&i<e&&i===s}function Le(i,s,e){return s!==null&&s!==e&&i>=s&&i===e}function Be(i,s,e,a){return a&&s!==null&&e!==null&&s!==e&&i>=s&&i<=e}function Ft(i){let s=i.changedTouches[0];return document.elementFromPoint(s.clientX,s.clientY)}var D=class{start;end;_disableStructuralEquivalency;constructor(s,e){this.start=s,this.end=e;}},we=(()=>{class i{selection;_adapter;_selectionChanged=new J;selectionChanged=this._selectionChanged;constructor(e,a){this.selection=e,this._adapter=a,this.selection=e;}updateSelection(e,a){let t=this.selection;this.selection=e,this._selectionChanged.next({selection:e,source:a,oldValue:t});}ngOnDestroy(){this._selectionChanged.complete();}_isValidDateInstance(e){return this._adapter.isDateInstance(e)&&this._adapter.isValid(e)}static \u0275fac=function(a){kD();};static \u0275prov=H({token:i,factory:i.\u0275fac})}return i})(),ha=(()=>{class i extends we{constructor(e){super(null,e);}add(e){super.updateSelection(e,this);}isValid(){return this.selection!=null&&this._isValidDateInstance(this.selection)}isComplete(){return this.selection!=null}clone(){let e=new i(this._adapter);return e.updateSelection(this.selection,this),e}static \u0275fac=function(a){return new(a||i)(Z(l))};static \u0275prov=H({token:i,factory:i.\u0275fac})}return i})();var ua={provide:we,useFactory:()=>v(we,{optional:true,skipSelf:true})||new ha(v(l))};var ke=new S("MAT_DATE_RANGE_SELECTION_STRATEGY"),Lt=(()=>{class i{_dateAdapter;constructor(e){this._dateAdapter=e;}selectionFinished(e,a){let{start:t,end:n}=a;return t==null?t=e:n==null&&e&&this._dateAdapter.compareDate(e,t)>=0?n=e:(t=e,n=null),new D(t,n)}createPreview(e,a){let t=null,n=null;return a.start&&!a.end&&e&&(t=a.start,n=e),new D(t,n)}createDrag(e,a,t){let n=a.start,r=a.end;if(!n||!r)return null;let c=this._dateAdapter,ie=c.compareDate(n,r)!==0,P=c.getYear(t)-c.getYear(e),Y=c.getMonth(t)-c.getMonth(e),re=c.getDate(t)-c.getDate(e);return ie&&c.sameDate(e,a.start)?(n=t,c.compareDate(t,r)>0&&(r=c.addCalendarYears(r,P),r=c.addCalendarMonths(r,Y),r=c.addCalendarDays(r,re))):ie&&c.sameDate(e,a.end)?(r=t,c.compareDate(t,n)<0&&(n=c.addCalendarYears(n,P),n=c.addCalendarMonths(n,Y),n=c.addCalendarDays(n,re))):(n=c.addCalendarYears(n,P),n=c.addCalendarMonths(n,Y),n=c.addCalendarDays(n,re),r=c.addCalendarYears(r,P),r=c.addCalendarMonths(r,Y),r=c.addCalendarDays(r,re)),new D(n,r)}static \u0275fac=function(a){return new(a||i)(Z(l))};static \u0275prov=H({token:i,factory:i.\u0275fac})}return i})(),He=7,ma=0,Tt=(()=>{class i{_changeDetectorRef=v(mC);_dateFormats=v(T,{optional:true});_dateAdapter=v(l,{optional:true});_dir=v(_i,{optional:true});_rangeStrategy=v(ke,{optional:true});_rerenderSubscription=Y.EMPTY;_selectionKeyPressed=false;get activeDate(){return this._activeDate}set activeDate(e){let a=this._activeDate,t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(t,this.minDate,this.maxDate),this._hasSameMonthAndYear(a,this._activeDate)||this._init();}_activeDate;get selected(){return this._selected}set selected(e){e instanceof D?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setRanges(this._selected);}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;activeDrag=null;selectedChange=new $e;_userSelection=new $e;dragStarted=new $e;dragEnded=new $e;activeDateChange=new $e;_matCalendarBody;_monthLabel=Fo("");_weeks=Fo([]);_firstWeekOffset=Fo(0);_rangeStart=Fo(null);_rangeEnd=Fo(null);_comparisonRangeStart=Fo(null);_comparisonRangeEnd=Fo(null);_previewStart=Fo(null);_previewEnd=Fo(null);_isRange=Fo(false);_todayDate=Fo(null);_weekdays=Fo([]);constructor(){v(H$1).load(lt),this._activeDate=this._dateAdapter.today();}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ag(null)).subscribe(()=>this._init());}ngOnChanges(e){let a=e.comparisonStart||e.comparisonEnd;a&&!a.firstChange&&this._setRanges(this.selected),e.activeDrag&&!this.activeDrag&&this._clearPreview();}ngOnDestroy(){this._rerenderSubscription.unsubscribe();}_dateSelected(e){let a=e.value,t=this._getDateFromDayOfMonth(a),n,r;this._selected instanceof D?(n=this._getDateInCurrentMonth(this._selected.start),r=this._getDateInCurrentMonth(this._selected.end)):n=r=this._getDateInCurrentMonth(this._selected),(n!==a||r!==a)&&this.selectedChange.emit(t),this._userSelection.emit({value:t,event:e.event}),this._clearPreview(),this._changeDetectorRef.markForCheck();}_updateActiveDate(e){let a=e.value,t=this._activeDate;this.activeDate=this._getDateFromDayOfMonth(a),this._dateAdapter.compareDate(t,this.activeDate)&&this.activeDateChange.emit(this._activeDate);}_handleCalendarBodyKeydown(e){let a=this._activeDate,t=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,t?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,t?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,-7);break;case 40:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,7);break;case 36:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,1-this._dateAdapter.getDate(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,this._dateAdapter.getNumDaysInMonth(this._activeDate)-this._dateAdapter.getDate(this._activeDate));break;case 33:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,-1):this._dateAdapter.addCalendarMonths(this._activeDate,-1);break;case 34:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,1):this._dateAdapter.addCalendarMonths(this._activeDate,1);break;case 13:case 32:this._selectionKeyPressed=true,this._canSelect(this._activeDate)&&e.preventDefault();return;case 27:this._previewEnd()!=null&&!Or(e)&&(this._clearPreview(),this.activeDrag?this.dragEnded.emit({value:null,event:e}):(this.selectedChange.emit(null),this._userSelection.emit({value:null,event:e})),e.preventDefault(),e.stopPropagation());return;default:return}this._dateAdapter.compareDate(a,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault();}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._canSelect(this._activeDate)&&this._dateSelected({value:this._dateAdapter.getDate(this._activeDate),event:e}),this._selectionKeyPressed=false);}_init(){this._setRanges(this.selected),this._todayDate.set(this._getCellCompareValue(this._dateAdapter.today())),this._monthLabel.set(this._dateFormats.display.monthLabel?this._dateAdapter.format(this.activeDate,this._dateFormats.display.monthLabel):this._dateAdapter.getMonthNames("short")[this._dateAdapter.getMonth(this.activeDate)].toLocaleUpperCase());let e=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),1);this._firstWeekOffset.set((He+this._dateAdapter.getDayOfWeek(e)-this._dateAdapter.getFirstDayOfWeek())%He),this._initWeekdays(),this._createWeekCells(),this._changeDetectorRef.markForCheck();}_focusActiveCell(e){this._matCalendarBody._focusActiveCell(e);}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked();}_previewChanged({event:e,value:a}){if(this._rangeStrategy){let t=a?a.rawValue:null,n=this._rangeStrategy.createPreview(t,this.selected,e);if(this._previewStart.set(this._getCellCompareValue(n.start)),this._previewEnd.set(this._getCellCompareValue(n.end)),this.activeDrag&&t){let r=this._rangeStrategy.createDrag?.(this.activeDrag.value,this.selected,t,e);r&&(this._previewStart.set(this._getCellCompareValue(r.start)),this._previewEnd.set(this._getCellCompareValue(r.end)));}}}_dragEnded(e){if(this.activeDrag)if(e.value){let a=this._rangeStrategy?.createDrag?.(this.activeDrag.value,this.selected,e.value,e.event);this.dragEnded.emit({value:a??null,event:e.event});}else this.dragEnded.emit({value:null,event:e.event});}_getDateFromDayOfMonth(e){return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),e)}_initWeekdays(){let e=this._dateAdapter.getFirstDayOfWeek(),a=this._dateAdapter.getDayOfWeekNames("narrow"),n=this._dateAdapter.getDayOfWeekNames("long").map((r,c)=>({long:r,narrow:a[c],id:ma++}));this._weekdays.set(n.slice(e).concat(n.slice(0,e)));}_createWeekCells(){let e=this._dateAdapter.getNumDaysInMonth(this.activeDate),a=this._dateAdapter.getDateNames(),t=[[]];for(let n=0,r=this._firstWeekOffset();n<e;n++,r++){r==He&&(t.push([]),r=0);let c=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),n+1),ie=this._shouldEnableDate(c),P=this._dateAdapter.format(c,this._dateFormats.display.dateA11yLabel),Y=this.dateClass?this.dateClass(c,"month"):void 0;t[t.length-1].push(new ae(n+1,a[n],P,ie,Y,this._getCellCompareValue(c),c));}this._weeks.set(t);}_shouldEnableDate(e){return !!e&&(!this.minDate||this._dateAdapter.compareDate(e,this.minDate)>=0)&&(!this.maxDate||this._dateAdapter.compareDate(e,this.maxDate)<=0)&&(!this.dateFilter||this.dateFilter(e))}_getDateInCurrentMonth(e){return e&&this._hasSameMonthAndYear(e,this.activeDate)?this._dateAdapter.getDate(e):null}_hasSameMonthAndYear(e,a){return !!(e&&a&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(a)&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(a))}_getCellCompareValue(e){if(e){let a=this._dateAdapter.getYear(e),t=this._dateAdapter.getMonth(e),n=this._dateAdapter.getDate(e);return new Date(a,t,n).getTime()}return null}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setRanges(e){e instanceof D?(this._rangeStart.set(this._getCellCompareValue(e.start)),this._rangeEnd.set(this._getCellCompareValue(e.end)),this._isRange.set(true)):(this._rangeStart.set(this._getCellCompareValue(e)),this._rangeEnd.set(this._rangeStart()),this._isRange.set(false)),this._comparisonRangeStart.set(this._getCellCompareValue(this.comparisonStart)),this._comparisonRangeEnd.set(this._getCellCompareValue(this.comparisonEnd));}_canSelect(e){return !this.dateFilter||this.dateFilter(e)}_clearPreview(){this._previewStart.set(null),this._previewEnd.set(null);}static \u0275fac=function(a){return new(a||i)};static \u0275cmp=mE({type:i,selectors:[["mat-month-view"]],viewQuery:function(a,t){if(a&1&&xp(K,5),a&2){let n;rI(n=oI())&&(t._matCalendarBody=n.first);}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName",activeDrag:"activeDrag"},outputs:{selectedChange:"selectedChange",_userSelection:"_userSelection",dragStarted:"dragStarted",dragEnded:"dragEnded",activeDateChange:"activeDateChange"},exportAs:["matMonthView"],features:[Qa],decls:8,vars:14,consts:[["role","grid",1,"mat-calendar-table"],[1,"mat-calendar-table-header"],["scope","col"],["aria-hidden","true"],["colspan","7",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","previewChange","dragStarted","dragEnded","keyup","keydown","label","rows","todayValue","startValue","endValue","comparisonStart","comparisonEnd","previewStart","previewEnd","isRange","labelMinRequiredCells","activeCell","startDateAccessibleName","endDateAccessibleName"],[1,"cdk-visually-hidden"]],template:function(a,t){a&1&&(di(0,"table",0)(1,"thead",1)(2,"tr"),UE(3,Jt,5,2,"th",2,Nt),Rc(),di(5,"tr",3),Ep(6,"th",4),Rc()(),di(7,"tbody",5),_p("selectedValueChange",function(r){return t._dateSelected(r)})("activeDateChange",function(r){return t._updateActiveDate(r)})("previewChange",function(r){return t._previewChanged(r)})("dragStarted",function(r){return t.dragStarted.emit(r)})("dragEnded",function(r){return t._dragEnded(r)})("keyup",function(r){return t._handleCalendarBodyKeyup(r)})("keydown",function(r){return t._handleCalendarBodyKeydown(r)}),Rc()()),a&2&&(Bv(3),GE(t._weekdays()),Bv(4),Dp("label",t._monthLabel())("rows",t._weeks())("todayValue",t._todayDate())("startValue",t._rangeStart())("endValue",t._rangeEnd())("comparisonStart",t._comparisonRangeStart())("comparisonEnd",t._comparisonRangeEnd())("previewStart",t._previewStart())("previewEnd",t._previewEnd())("isRange",t._isRange())("labelMinRequiredCells",3)("activeCell",t._dateAdapter.getDate(t.activeDate)-1)("startDateAccessibleName",t.startDateAccessibleName)("endDateAccessibleName",t.endDateAccessibleName));},dependencies:[K],encapsulation:2})}return i})(),k=24,ze=4,Ot=(()=>{class i{_changeDetectorRef=v(mC);_dateAdapter=v(l,{optional:true});_dir=v(_i,{optional:true});_rerenderSubscription=Y.EMPTY;_selectionKeyPressed=false;get activeDate(){return this._activeDate}set activeDate(e){let a=this._activeDate,t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(t,this.minDate,this.maxDate),Bt(this._dateAdapter,a,this._activeDate,this.minDate,this.maxDate)||this._init();}_activeDate;get selected(){return this._selected}set selected(e){e instanceof D?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedYear(e);}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_maxDate=null;dateFilter;dateClass;selectedChange=new $e;yearSelected=new $e;activeDateChange=new $e;_matCalendarBody;_years=Fo([]);_todayYear=Fo(0);_selectedYear=Fo(null);constructor(){this._dateAdapter,this._activeDate=this._dateAdapter.today();}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ag(null)).subscribe(()=>this._init());}ngOnDestroy(){this._rerenderSubscription.unsubscribe();}_init(){this._todayYear.set(this._dateAdapter.getYear(this._dateAdapter.today()));let a=this._dateAdapter.getYear(this._activeDate)-te(this._dateAdapter,this.activeDate,this.minDate,this.maxDate),t=[];for(let n=0,r=[];n<k;n++)r.push(a+n),r.length==ze&&(t.push(r.map(c=>this._createCellForYear(c))),r=[]);this._years.set(t),this._changeDetectorRef.markForCheck();}_yearSelected(e){let a=e.value,t=this._dateAdapter.createDate(a,0,1),n=this._getDateFromYear(a);this.yearSelected.emit(t),this.selectedChange.emit(n);}_updateActiveDate(e){let a=e.value,t=this._activeDate;this.activeDate=this._getDateFromYear(a),this._dateAdapter.compareDate(t,this.activeDate)&&this.activeDateChange.emit(this.activeDate);}_handleCalendarBodyKeydown(e){let a=this._activeDate,t=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,t?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,t?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-ze);break;case 40:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,ze);break;case 36:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-te(this._dateAdapter,this.activeDate,this.minDate,this.maxDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,k-te(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)-1);break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-k*10:-k);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?k*10:k);break;case 13:case 32:this._selectionKeyPressed=true;break;default:return}this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked(),e.preventDefault();}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._yearSelected({value:this._dateAdapter.getYear(this._activeDate),event:e}),this._selectionKeyPressed=false);}_getActiveCell(){return te(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)}_focusActiveCell(){this._matCalendarBody._focusActiveCell();}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked();}_getDateFromYear(e){let a=this._dateAdapter.getMonth(this.activeDate),t=this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(e,a,1));return this._dateAdapter.createDate(e,a,Math.min(this._dateAdapter.getDate(this.activeDate),t))}_createCellForYear(e){let a=this._dateAdapter.createDate(e,0,1),t=this._dateAdapter.getYearName(a),n=this.dateClass?this.dateClass(a,"multi-year"):void 0;return new ae(e,t,t,this._shouldEnableYear(e),n)}_shouldEnableYear(e){if(e==null||this.maxDate&&e>this._dateAdapter.getYear(this.maxDate)||this.minDate&&e<this._dateAdapter.getYear(this.minDate))return  false;if(!this.dateFilter)return  true;let a=this._dateAdapter.createDate(e,0,1);for(let t=a;this._dateAdapter.getYear(t)==e;t=this._dateAdapter.addCalendarDays(t,1))if(this.dateFilter(t))return  true;return  false}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedYear(e){if(this._selectedYear.set(null),e instanceof D){let a=e.start||e.end;a&&this._selectedYear.set(this._dateAdapter.getYear(a));}else e&&this._selectedYear.set(this._dateAdapter.getYear(e));}static \u0275fac=function(a){return new(a||i)};static \u0275cmp=mE({type:i,selectors:[["mat-multi-year-view"]],viewQuery:function(a,t){if(a&1&&xp(K,5),a&2){let n;rI(n=oI())&&(t._matCalendarBody=n.first);}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",activeDateChange:"activeDateChange"},exportAs:["matMultiYearView"],decls:5,vars:7,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","rows","todayValue","startValue","endValue","numCols","cellAspectRatio","activeCell"]],template:function(a,t){a&1&&(di(0,"table",0)(1,"thead",1)(2,"tr"),Ep(3,"th",2),Rc()(),di(4,"tbody",3),_p("selectedValueChange",function(r){return t._yearSelected(r)})("activeDateChange",function(r){return t._updateActiveDate(r)})("keyup",function(r){return t._handleCalendarBodyKeyup(r)})("keydown",function(r){return t._handleCalendarBodyKeydown(r)}),Rc()()),a&2&&(Bv(4),Dp("rows",t._years())("todayValue",t._todayYear())("startValue",t._selectedYear())("endValue",t._selectedYear())("numCols",4)("cellAspectRatio",4/7)("activeCell",t._getActiveCell()));},dependencies:[K],encapsulation:2})}return i})();function Bt(i,s,e,a,t){let n=i.getYear(s),r=i.getYear(e),c=Ht(i,a,t);return Math.floor((n-c)/k)===Math.floor((r-c)/k)}function te(i,s,e,a){let t=i.getYear(s);return _a(t-Ht(i,e,a),k)}function Ht(i,s,e){let a=0;return e?a=i.getYear(e)-k+1:s&&(a=i.getYear(s)),a}function _a(i,s){return (i%s+s)%s}var Pt=(()=>{class i{_changeDetectorRef=v(mC);_dateFormats=v(T,{optional:true});_dateAdapter=v(l,{optional:true});_dir=v(_i,{optional:true});_rerenderSubscription=Y.EMPTY;_selectionKeyPressed=false;get activeDate(){return this._activeDate}set activeDate(e){let a=this._activeDate,t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(t,this.minDate,this.maxDate),this._dateAdapter.getYear(a)!==this._dateAdapter.getYear(this._activeDate)&&this._init();}_activeDate;get selected(){return this._selected}set selected(e){e instanceof D?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedMonth(e);}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_maxDate=null;dateFilter;dateClass;selectedChange=new $e;monthSelected=new $e;activeDateChange=new $e;_matCalendarBody;_months=Fo([]);_yearLabel=Fo("");_todayMonth=Fo(null);_selectedMonth=Fo(null);constructor(){this._activeDate=this._dateAdapter.today();}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ag(null)).subscribe(()=>this._init());}ngOnDestroy(){this._rerenderSubscription.unsubscribe();}_monthSelected(e){let a=e.value,t=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),a,1);this.monthSelected.emit(t);let n=this._getDateFromMonth(a);this.selectedChange.emit(n);}_updateActiveDate(e){let a=e.value,t=this._activeDate;this.activeDate=this._getDateFromMonth(a),this._dateAdapter.compareDate(t,this.activeDate)&&this.activeDateChange.emit(this.activeDate);}_handleCalendarBodyKeydown(e){let a=this._activeDate,t=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,t?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,t?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-4);break;case 40:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,4);break;case 36:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-this._dateAdapter.getMonth(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,11-this._dateAdapter.getMonth(this._activeDate));break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-10:-1);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?10:1);break;case 13:case 32:this._selectionKeyPressed=true;break;default:return}this._dateAdapter.compareDate(a,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault();}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._monthSelected({value:this._dateAdapter.getMonth(this._activeDate),event:e}),this._selectionKeyPressed=false);}_init(){this._setSelectedMonth(this.selected),this._todayMonth.set(this._getMonthInCurrentYear(this._dateAdapter.today())),this._yearLabel.set(this._dateAdapter.getYearName(this.activeDate));let e=this._dateAdapter.getMonthNames("short");this._months.set([[0,1,2,3],[4,5,6,7],[8,9,10,11]].map(a=>a.map(t=>this._createCellForMonth(t,e[t])))),this._changeDetectorRef.markForCheck();}_focusActiveCell(){this._matCalendarBody._focusActiveCell();}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked();}_getMonthInCurrentYear(e){return e&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(this.activeDate)?this._dateAdapter.getMonth(e):null}_getDateFromMonth(e){let a=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),t=this._dateAdapter.getNumDaysInMonth(a);return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,Math.min(this._dateAdapter.getDate(this.activeDate),t))}_createCellForMonth(e,a){let t=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),n=this._dateAdapter.format(t,this._dateFormats.display.monthYearA11yLabel),r=this.dateClass?this.dateClass(t,"year"):void 0;return new ae(e,a.toLocaleUpperCase(),n,this._shouldEnableMonth(e),r)}_shouldEnableMonth(e){let a=this._dateAdapter.getYear(this.activeDate);if(e==null||this._isYearAndMonthAfterMaxDate(a,e)||this._isYearAndMonthBeforeMinDate(a,e))return  false;if(!this.dateFilter)return  true;let t=this._dateAdapter.createDate(a,e,1);for(let n=t;this._dateAdapter.getMonth(n)==e;n=this._dateAdapter.addCalendarDays(n,1))if(this.dateFilter(n))return  true;return  false}_isYearAndMonthAfterMaxDate(e,a){if(this.maxDate){let t=this._dateAdapter.getYear(this.maxDate),n=this._dateAdapter.getMonth(this.maxDate);return e>t||e===t&&a>n}return  false}_isYearAndMonthBeforeMinDate(e,a){if(this.minDate){let t=this._dateAdapter.getYear(this.minDate),n=this._dateAdapter.getMonth(this.minDate);return e<t||e===t&&a<n}return  false}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedMonth(e){e instanceof D?this._selectedMonth.set(this._getMonthInCurrentYear(e.start)||this._getMonthInCurrentYear(e.end)):this._selectedMonth.set(this._getMonthInCurrentYear(e));}static \u0275fac=function(a){return new(a||i)};static \u0275cmp=mE({type:i,selectors:[["mat-year-view"]],viewQuery:function(a,t){if(a&1&&xp(K,5),a&2){let n;rI(n=oI())&&(t._matCalendarBody=n.first);}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",monthSelected:"monthSelected",activeDateChange:"activeDateChange"},exportAs:["matYearView"],decls:5,vars:9,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","label","rows","todayValue","startValue","endValue","labelMinRequiredCells","numCols","cellAspectRatio","activeCell"]],template:function(a,t){a&1&&(di(0,"table",0)(1,"thead",1)(2,"tr"),Ep(3,"th",2),Rc()(),di(4,"tbody",3),_p("selectedValueChange",function(r){return t._monthSelected(r)})("activeDateChange",function(r){return t._updateActiveDate(r)})("keyup",function(r){return t._handleCalendarBodyKeyup(r)})("keydown",function(r){return t._handleCalendarBodyKeydown(r)}),Rc()()),a&2&&(Bv(4),Dp("label",t._yearLabel())("rows",t._months())("todayValue",t._todayMonth())("startValue",t._selectedMonth())("endValue",t._selectedMonth())("labelMinRequiredCells",2)("numCols",4)("cellAspectRatio",4/7)("activeCell",t._dateAdapter.getMonth(t.activeDate)));},dependencies:[K],encapsulation:2})}return i})(),zt=(()=>{class i{_intl=v(j);calendar=v(ne);_dateAdapter=v(l,{optional:true});_dateFormats=v(T,{optional:true});_periodButtonText;_periodButtonDescription;_periodButtonLabel;_prevButtonLabel;_nextButtonLabel;constructor(){v(H$1).load(lt);let e=v(mC);this._updateLabels(),this.calendar.stateChanges.subscribe(()=>{this._updateLabels(),e.markForCheck();});}get periodButtonText(){return this._periodButtonText}get periodButtonDescription(){return this._periodButtonDescription}get periodButtonLabel(){return this._periodButtonLabel}get prevButtonLabel(){return this._prevButtonLabel}get nextButtonLabel(){return this._nextButtonLabel}currentPeriodClicked(){this.calendar.currentView=this.calendar.currentView=="month"?"multi-year":"month";}previousClicked(){this.previousEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,-1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?-1:-k));}nextClicked(){this.nextEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?1:k));}previousEnabled(){return this.calendar.minDate?!this.calendar.minDate||!this._isSameView(this.calendar.activeDate,this.calendar.minDate):true}nextEnabled(){return !this.calendar.maxDate||!this._isSameView(this.calendar.activeDate,this.calendar.maxDate)}_updateLabels(){let e=this.calendar,a=this._intl,t=this._dateAdapter;e.currentView==="month"?(this._periodButtonText=t.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonDescription=t.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonLabel=a.switchToMultiYearViewLabel,this._prevButtonLabel=a.prevMonthLabel,this._nextButtonLabel=a.nextMonthLabel):e.currentView==="year"?(this._periodButtonText=t.getYearName(e.activeDate),this._periodButtonDescription=t.getYearName(e.activeDate),this._periodButtonLabel=a.switchToMonthViewLabel,this._prevButtonLabel=a.prevYearLabel,this._nextButtonLabel=a.nextYearLabel):(this._periodButtonText=a.formatYearRange(...this._formatMinAndMaxYearLabels()),this._periodButtonDescription=a.formatYearRangeLabel(...this._formatMinAndMaxYearLabels()),this._periodButtonLabel=a.switchToMonthViewLabel,this._prevButtonLabel=a.prevMultiYearLabel,this._nextButtonLabel=a.nextMultiYearLabel);}_isSameView(e,a){return this.calendar.currentView=="month"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(a)&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(a):this.calendar.currentView=="year"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(a):Bt(this._dateAdapter,e,a,this.calendar.minDate,this.calendar.maxDate)}_formatMinAndMaxYearLabels(){let a=this._dateAdapter.getYear(this.calendar.activeDate)-te(this._dateAdapter,this.calendar.activeDate,this.calendar.minDate,this.calendar.maxDate),t=a+k-1,n=this._dateAdapter.getYearName(this._dateAdapter.createDate(a,0,1)),r=this._dateAdapter.getYearName(this._dateAdapter.createDate(t,0,1));return [n,r]}_periodButtonLabelId=v(Yt).getId("mat-calendar-period-label-");static \u0275fac=function(a){return new(a||i)};static \u0275cmp=mE({type:i,selectors:[["mat-calendar-header"]],exportAs:["matCalendarHeader"],ngContentSelectors:ea,decls:17,vars:13,consts:[[1,"mat-calendar-header"],[1,"mat-calendar-controls"],["aria-live","polite",1,"cdk-visually-hidden",3,"id"],["matButton","","type","button",1,"mat-calendar-period-button",3,"click"],["aria-hidden","true"],["viewBox","0 0 10 5","focusable","false","aria-hidden","true",1,"mat-calendar-arrow"],["points","0,0 5,5 10,0"],[1,"mat-calendar-spacer"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-previous-button",3,"click","disabled","matTooltip"],["viewBox","0 0 24 24","focusable","false","aria-hidden","true"],["d","M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-next-button",3,"click","disabled","matTooltip"],["d","M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"]],template:function(a,t){a&1&&(eI(),di(0,"div",0)(1,"div",1)(2,"span",2),MI(3),Rc(),di(4,"button",3),_p("click",function(){return t.currentPeriodClicked()}),di(5,"span",4),MI(6),Rc(),vl(),di(7,"svg",5),Ep(8,"polygon",6),Rc()(),Dl(),Ep(9,"div",7),tI(10),di(11,"button",8),_p("click",function(){return t.previousClicked()}),vl(),di(12,"svg",9),Ep(13,"path",10),Rc()(),Dl(),di(14,"button",11),_p("click",function(){return t.nextClicked()}),vl(),di(15,"svg",9),Ep(16,"path",12),Rc()()()()),a&2&&(Bv(2),Dp("id",t._periodButtonLabelId),Bv(),Up(t.periodButtonDescription),Bv(),vp("aria-label",t.periodButtonLabel)("aria-describedby",t._periodButtonLabelId),Bv(2),Up(t.periodButtonText),Bv(),Pp("mat-calendar-invert",t.calendar.currentView!=="month"),Bv(4),Dp("disabled",!t.previousEnabled())("matTooltip",t.prevButtonLabel),vp("aria-label",t.prevButtonLabel),Bv(3),Dp("disabled",!t.nextEnabled())("matTooltip",t.nextButtonLabel),vp("aria-label",t.nextButtonLabel));},dependencies:[tl,gi,Ee],encapsulation:2})}return i})(),ne=(()=>{class i{_dateAdapter=v(l,{optional:true});_dateFormats=v(T,{optional:true});_changeDetectorRef=v(mC);_elementRef=v(Rn);headerComponent;_calendarHeaderPortal;_intlChanges;_moveFocusOnNextTick=false;get startAt(){return this._startAt}set startAt(e){this._startAt=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_startAt=null;startView="month";get selected(){return this._selected}set selected(e){e instanceof D?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedChange=new $e;yearSelected=new $e;monthSelected=new $e;viewChanged=new $e(true);_userSelection=new $e;_userDragDrop=new $e;monthView;yearView;multiYearView;get activeDate(){return this._clampedActiveDate}set activeDate(e){this._clampedActiveDate=this._dateAdapter.clampDate(e,this.minDate,this.maxDate),this.stateChanges.next(),this._changeDetectorRef.markForCheck();}_clampedActiveDate;get currentView(){return this._currentView}set currentView(e){let a=this._currentView!==e?e:null;this._currentView=e,this._moveFocusOnNextTick=true,this._changeDetectorRef.markForCheck(),a&&(this.stateChanges.next(),this.viewChanged.emit(a));}_currentView;_activeDrag=null;stateChanges=new J;constructor(){this._intlChanges=v(j).changes.subscribe(()=>{this._changeDetectorRef.markForCheck(),this.stateChanges.next();});}ngAfterContentInit(){this._calendarHeaderPortal=new Rt$1(this.headerComponent||zt),this.activeDate=this.startAt||this._dateAdapter.today(),this._currentView=this.startView;}ngAfterViewChecked(){this._moveFocusOnNextTick&&(this._moveFocusOnNextTick=false,this.focusActiveCell());}ngOnDestroy(){this._intlChanges.unsubscribe(),this.stateChanges.complete();}ngOnChanges(e){let a=e.minDate&&!this._dateAdapter.sameDate(e.minDate.previousValue,e.minDate.currentValue)?e.minDate:void 0,t=e.maxDate&&!this._dateAdapter.sameDate(e.maxDate.previousValue,e.maxDate.currentValue)?e.maxDate:void 0,n=a||t||e.dateFilter;if(n&&!n.firstChange){let r=this._getCurrentViewComponent();r&&(this._elementRef.nativeElement.contains($t$1())&&(this._moveFocusOnNextTick=true),this._changeDetectorRef.detectChanges(),r._init());}this.stateChanges.next();}focusActiveCell(){this._getCurrentViewComponent()?._focusActiveCell(false);}updateTodaysDate(){this._getCurrentViewComponent()?._init();}_dateSelected(e){let a=e.value;(this.selected instanceof D||a&&!this._dateAdapter.sameDate(a,this.selected))&&this.selectedChange.emit(a),this._userSelection.emit(e);}_yearSelectedInMultiYearView(e){this.yearSelected.emit(e);}_monthSelectedInYearView(e){this.monthSelected.emit(e);}_goToDateInView(e,a){this.activeDate=e,this.currentView=a;}_dragStarted(e){this._activeDrag=e;}_dragEnded(e){this._activeDrag&&(e.value&&this._userDragDrop.emit(e),this._activeDrag=null);}_getCurrentViewComponent(){return this.monthView||this.yearView||this.multiYearView}static \u0275fac=function(a){return new(a||i)};static \u0275cmp=mE({type:i,selectors:[["mat-calendar"]],viewQuery:function(a,t){if(a&1&&xp(Tt,5)(Pt,5)(Ot,5),a&2){let n;rI(n=oI())&&(t.monthView=n.first),rI(n=oI())&&(t.yearView=n.first),rI(n=oI())&&(t.multiYearView=n.first);}},hostAttrs:[1,"mat-calendar"],inputs:{headerComponent:"headerComponent",startAt:"startAt",startView:"startView",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",monthSelected:"monthSelected",viewChanged:"viewChanged",_userSelection:"_userSelection",_userDragDrop:"_userDragDrop"},exportAs:["matCalendar"],features:[HI([ua]),Qa],decls:5,vars:2,consts:[[3,"cdkPortalOutlet"],["cdkMonitorSubtreeFocus","","tabindex","-1",1,"mat-calendar-content"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","_userSelection","dragStarted","dragEnded","activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDateChange","monthSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","yearSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"]],template:function(a,t){if(a&1&&(fp(0,ta,0,0,"ng-template",0),di(1,"div",1),VE(2,aa,1,11,"mat-month-view",2)(3,na,1,6,"mat-year-view",3)(4,ia,1,6,"mat-multi-year-view",3),Rc()),a&2){let n;Dp("cdkPortalOutlet",t._calendarHeaderPortal),Bv(2),BE((n=t.currentView)==="month"?2:n==="year"?3:n==="multi-year"?4:-1);}},dependencies:[Fi,Bo,Tt,Pt,Ot],styles:[`.mat-calendar {
  display: block;
  line-height: normal;
  font-family: var(--mat-datepicker-calendar-text-font, var(--mat-sys-body-medium-font));
  font-size: var(--mat-datepicker-calendar-text-size, var(--mat-sys-body-medium-size));
}

.mat-calendar-header {
  padding: 8px 8px 0 8px;
}

.mat-calendar-content {
  padding: 0 8px 8px 8px;
  outline: none;
}

.mat-calendar-controls {
  display: flex;
  align-items: center;
  margin: 5% calc(4.7142857143% - 16px);
}

.mat-calendar-spacer {
  flex: 1 1 auto;
}

.mat-calendar-period-button {
  min-width: 0;
  margin: 0 8px;
  font-size: var(--mat-datepicker-calendar-period-button-text-size, var(--mat-sys-title-small-size));
  font-weight: var(--mat-datepicker-calendar-period-button-text-weight, var(--mat-sys-title-small-weight));
  --mat-button-text-label-text-color: var(--mat-datepicker-calendar-period-button-text-color, var(--mat-sys-on-surface-variant));
}

.mat-calendar-arrow {
  display: inline-block;
  width: 10px;
  height: 5px;
  margin: 0 0 0 5px;
  vertical-align: middle;
  fill: var(--mat-datepicker-calendar-period-button-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-calendar-arrow.mat-calendar-invert {
  transform: rotate(180deg);
}
[dir=rtl] .mat-calendar-arrow {
  margin: 0 5px 0 0;
}
@media (forced-colors: active) {
  .mat-calendar-arrow {
    fill: CanvasText;
  }
}

.mat-datepicker-content .mat-calendar-previous-button:not(.mat-mdc-button-disabled),
.mat-datepicker-content .mat-calendar-next-button:not(.mat-mdc-button-disabled) {
  color: var(--mat-datepicker-calendar-navigation-button-icon-color, var(--mat-sys-on-surface-variant));
}
[dir=rtl] .mat-calendar-previous-button,
[dir=rtl] .mat-calendar-next-button {
  transform: rotate(180deg);
}

.mat-calendar-table {
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
}

.mat-calendar-table-header th {
  text-align: center;
  padding: 0 0 8px 0;
  color: var(--mat-datepicker-calendar-header-text-color, var(--mat-sys-on-surface-variant));
  font-size: var(--mat-datepicker-calendar-header-text-size, var(--mat-sys-title-small-size));
  font-weight: var(--mat-datepicker-calendar-header-text-weight, var(--mat-sys-title-small-weight));
}

.mat-calendar-table-header-divider {
  position: relative;
  height: 1px;
}
.mat-calendar-table-header-divider::after {
  content: "";
  position: absolute;
  top: 0;
  left: -8px;
  right: -8px;
  height: 1px;
  background: var(--mat-datepicker-calendar-header-divider-color, transparent);
}

.mat-calendar-body-cell-content::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-calendar-body-cell:focus-visible .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2})}return i})();var ga=(()=>{class i{_elementRef=v(Rn);_animationsDisabled=ye();_changeDetectorRef=v(mC);_globalModel=v(we);_dateAdapter=v(l);_ngZone=v(Ne$1);_rangeSelectionStrategy=v(ke,{optional:true});_stateChanges;_model;_eventCleanups;_animationFallback;_calendar;color;datepicker;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;_isAbove=false;_animationDone=new J;_isAnimating=false;_closeButtonText;_closeButtonFocused=false;_actionsPortal=null;_dialogLabelId=null;constructor(){if(v(H$1).load(lt),this._closeButtonText=v(j).closeCalendarLabel,!this._animationsDisabled){let e=this._elementRef.nativeElement,a=v(Lf);this._eventCleanups=this._ngZone.runOutsideAngular(()=>[a.listen(e,"animationstart",this._handleAnimationEvent),a.listen(e,"animationend",this._handleAnimationEvent),a.listen(e,"animationcancel",this._handleAnimationEvent)]);}}ngAfterViewInit(){this._stateChanges=this.datepicker.stateChanges.subscribe(()=>{this._changeDetectorRef.markForCheck();}),this._calendar.focusActiveCell();}ngOnDestroy(){clearTimeout(this._animationFallback),this._eventCleanups?.forEach(e=>e()),this._stateChanges?.unsubscribe(),this._animationDone.complete();}_handleUserSelection(e){let a=this._model.selection,t=e.value,n=a instanceof D;if(n&&this._rangeSelectionStrategy){let r=this._rangeSelectionStrategy.selectionFinished(t,a,e.event);this._model.updateSelection(r,this);}else t&&(n||!this._dateAdapter.sameDate(t,a))&&this._model.add(t);(!this._model||this._model.isComplete())&&!this._actionsPortal&&this.datepicker.close();}_handleUserDragDrop(e){this._model.updateSelection(e.value,this);}_startExitAnimation(){this._elementRef.nativeElement.classList.add("mat-datepicker-content-exit"),this._animationsDisabled?this._animationDone.next():(clearTimeout(this._animationFallback),this._animationFallback=setTimeout(()=>{this._isAnimating||this._animationDone.next();},200));}_handleAnimationEvent=e=>{let a=this._elementRef.nativeElement;e.target!==a||!e.animationName.startsWith("_mat-datepicker-content")||(clearTimeout(this._animationFallback),this._isAnimating=e.type==="animationstart",a.classList.toggle("mat-datepicker-content-animating",this._isAnimating),this._isAnimating||this._animationDone.next());};_getSelected(){return this._model.selection}_applyPendingSelection(){this._model!==this._globalModel&&this._globalModel.updateSelection(this._model.selection,this);}_assignActions(e,a){this._model=e?this._globalModel.clone():this._globalModel,this._actionsPortal=e,a&&this._changeDetectorRef.detectChanges();}static \u0275fac=function(a){return new(a||i)};static \u0275cmp=mE({type:i,selectors:[["mat-datepicker-content"]],viewQuery:function(a,t){if(a&1&&xp(ne,5),a&2){let n;rI(n=oI())&&(t._calendar=n.first);}},hostAttrs:[1,"mat-datepicker-content"],hostVars:6,hostBindings:function(a,t){a&2&&(yI(t.color?"mat-"+t.color:""),Pp("mat-datepicker-content-touch",t.datepicker.touchUi)("mat-datepicker-content-animations-enabled",!t._animationsDisabled));},inputs:{color:"color"},exportAs:["matDatepickerContent"],decls:5,vars:26,consts:[["cdkTrapFocus","","role","dialog",1,"mat-datepicker-content-container"],[3,"yearSelected","monthSelected","viewChanged","_userSelection","_userDragDrop","id","startAt","startView","minDate","maxDate","dateFilter","headerComponent","selected","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName"],[3,"cdkPortalOutlet"],["type","button","matButton","elevated",1,"mat-datepicker-close-button",3,"focus","blur","click","color"]],template:function(a,t){a&1&&(di(0,"div",0)(1,"mat-calendar",1),_p("yearSelected",function(r){return t.datepicker._selectYear(r)})("monthSelected",function(r){return t.datepicker._selectMonth(r)})("viewChanged",function(r){return t.datepicker._viewChanged(r)})("_userSelection",function(r){return t._handleUserSelection(r)})("_userDragDrop",function(r){return t._handleUserDragDrop(r)}),Rc(),fp(2,ra,0,0,"ng-template",2),di(3,"button",3),_p("focus",function(){return t._closeButtonFocused=true})("blur",function(){return t._closeButtonFocused=false})("click",function(){return t.datepicker.close()}),MI(4),Rc()()),a&2&&(Pp("mat-datepicker-content-container-with-custom-header",t.datepicker.calendarHeaderComponent)("mat-datepicker-content-container-with-actions",t._actionsPortal),vp("aria-modal",true)("aria-labelledby",t._dialogLabelId??void 0),Bv(),yI(t.datepicker.panelClass),Dp("id",t.datepicker.id)("startAt",t.datepicker.startAt)("startView",t.datepicker.startView)("minDate",t.datepicker._getMinDate())("maxDate",t.datepicker._getMaxDate())("dateFilter",t.datepicker._getDateFilter())("headerComponent",t.datepicker.calendarHeaderComponent)("selected",t._getSelected())("dateClass",t.datepicker.dateClass)("comparisonStart",t.comparisonStart)("comparisonEnd",t.comparisonEnd)("startDateAccessibleName",t.startDateAccessibleName)("endDateAccessibleName",t.endDateAccessibleName),Bv(),Dp("cdkPortalOutlet",t._actionsPortal),Bv(),Pp("cdk-visually-hidden",!t._closeButtonFocused),Dp("color",t.color||"primary"),Bv(),Up(t._closeButtonText));},dependencies:[Qo,ne,Fi,tl],styles:[`@keyframes _mat-datepicker-content-dropdown-enter {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-datepicker-content-dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-datepicker-content-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-datepicker-content {
  display: block;
  background-color: var(--mat-datepicker-calendar-container-background-color, var(--mat-sys-surface-container-high));
  color: var(--mat-datepicker-calendar-container-text-color, var(--mat-sys-on-surface));
  box-shadow: var(--mat-datepicker-calendar-container-elevation-shadow, 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12));
  border-radius: var(--mat-datepicker-calendar-container-shape, var(--mat-sys-corner-large));
}
.mat-datepicker-content.mat-datepicker-content-animations-enabled {
  animation: _mat-datepicker-content-dropdown-enter 120ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-datepicker-content .mat-calendar {
  width: 296px;
  height: 354px;
}
.mat-datepicker-content .mat-datepicker-content-container-with-custom-header .mat-calendar {
  height: auto;
}
.mat-datepicker-content .mat-datepicker-close-button {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
}
.mat-datepicker-content-animating .mat-datepicker-content .mat-datepicker-close-button {
  display: none;
}

.mat-datepicker-content-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mat-datepicker-content-touch {
  display: block;
  max-height: 80vh;
  box-shadow: var(--mat-datepicker-calendar-container-touch-elevation-shadow, 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12));
  border-radius: var(--mat-datepicker-calendar-container-touch-shape, var(--mat-sys-corner-extra-large));
  position: relative;
  overflow: visible;
  min-height: fit-content;
}
.mat-datepicker-content-touch.mat-datepicker-content-animations-enabled {
  animation: _mat-datepicker-content-dialog-enter 150ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-datepicker-content-touch .mat-datepicker-content-container {
  min-height: 312px;
  max-height: 788px;
  min-width: 250px;
  max-width: 750px;
}
.mat-datepicker-content-touch .mat-calendar {
  width: 100%;
  height: auto;
}

.mat-datepicker-content-exit.mat-datepicker-content-animations-enabled {
  animation: _mat-datepicker-content-exit 100ms linear;
}

@media all and (orientation: landscape) {
  .mat-datepicker-content-touch .mat-datepicker-content-container {
    width: 64vh;
    height: 80vh;
  }
}
@media all and (orientation: portrait) {
  .mat-datepicker-content-touch .mat-datepicker-content-container {
    width: 80vw;
    height: 100vw;
  }
  .mat-datepicker-content-touch .mat-datepicker-content-container-with-actions {
    height: 115vw;
  }
}
`],encapsulation:2})}return i})();var fa=(()=>{class i{static \u0275fac=function(a){return new(a||i)};static \u0275dir=Mc({type:i,selectors:[["","matDatepickerToggleIcon",""]]})}return i})(),ba=(()=>{class i{_intl=v(j);_changeDetectorRef=v(mC);_stateChanges=Y.EMPTY;datepicker;tabIndex=null;ariaLabel;get disabled(){return this._disabled===void 0&&this.datepicker?this.datepicker.disabled:!!this._disabled}set disabled(e){this._disabled=e;}_disabled;disableRipple=false;_customIcon;_button;constructor(){let e=v(new ih("tabindex"),{optional:true}),a=Number(e);this.tabIndex=a||a===0?a:null;}ngOnChanges(e){e.datepicker&&this._watchStateChanges();}ngOnDestroy(){this._stateChanges.unsubscribe();}ngAfterContentInit(){this._watchStateChanges();}_open(e){this.datepicker&&!this.disabled&&(this.datepicker.open(),e.stopPropagation());}_watchStateChanges(){let e=this.datepicker?this.datepicker.stateChanges:sg(),a=this.datepicker&&this.datepicker.datepickerInput?this.datepicker.datepickerInput.stateChanges:sg(),t=this.datepicker?Eg(this.datepicker.openedStream,this.datepicker.closedStream):sg();this._stateChanges.unsubscribe(),this._stateChanges=Eg(this._intl.changes,e,a,t).subscribe(()=>this._changeDetectorRef.markForCheck());}static \u0275fac=function(a){return new(a||i)};static \u0275cmp=mE({type:i,selectors:[["mat-datepicker-toggle"]],contentQueries:function(a,t,n){if(a&1&&Np(n,fa,5),a&2){let r;rI(r=oI())&&(t._customIcon=r.first);}},viewQuery:function(a,t){if(a&1&&xp(sa,5),a&2){let n;rI(n=oI())&&(t._button=n.first);}},hostAttrs:[1,"mat-datepicker-toggle"],hostVars:8,hostBindings:function(a,t){a&1&&_p("click",function(r){return t._open(r)}),a&2&&(vp("tabindex",null)("data-mat-calendar",t.datepicker?t.datepicker.id:null),Pp("mat-datepicker-toggle-active",t.datepicker&&t.datepicker.opened)("mat-accent",t.datepicker&&t.datepicker.color==="accent")("mat-warn",t.datepicker&&t.datepicker.color==="warn"));},inputs:{datepicker:[0,"for","datepicker"],tabIndex:"tabIndex",ariaLabel:[0,"aria-label","ariaLabel"],disabled:[2,"disabled","disabled",DP],disableRipple:"disableRipple"},exportAs:["matDatepickerToggle"],features:[Qa],ngContentSelectors:da,decls:4,vars:7,consts:[["button",""],["matIconButton","","type","button",3,"tabIndex","disabled","disableRipple"],["viewBox","0 0 24 24","width","24px","height","24px","fill","currentColor","focusable","false","aria-hidden","true",1,"mat-datepicker-toggle-default-icon"],["d","M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"]],template:function(a,t){a&1&&(eI(oa),di(0,"button",1,0),VE(2,la,2,0,":svg:svg",2),tI(3),Rc()),a&2&&(Dp("tabIndex",t.disabled?-1:t.tabIndex)("disabled",t.disabled)("disableRipple",t.disableRipple),vp("aria-haspopup",t.datepicker?"dialog":null)("aria-label",t.ariaLabel||t._intl.openCalendarLabel)("aria-expanded",t.datepicker?t.datepicker.opened:null),Bv(2),BE(t._customIcon?-1:2));},dependencies:[gi],styles:[`.mat-datepicker-toggle {
  pointer-events: auto;
  color: var(--mat-datepicker-toggle-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-datepicker-toggle button {
  color: inherit;
}

.mat-datepicker-toggle-active {
  color: var(--mat-datepicker-toggle-active-state-icon-color, var(--mat-sys-primary));
}

@media (forced-colors: active) {
  .mat-datepicker-toggle-default-icon {
    color: CanvasText;
  }
}
`],encapsulation:2})}return i})();var Kt=(()=>{class i{static \u0275fac=function(a){return new(a||i)};static \u0275mod=ip({type:i});static \u0275inj=ms({providers:[j],imports:[nl,me,ni,Ht$1,ga,ba,zt,gt,vt]})}return i})();var q=class i extends Lt{onHover=null;constructor(){super(v(l,{optional:true}));}createPreview(s,e){return this.onHover?.(s),super.createPreview(s,e)}static \u0275fac=function(e){return new(e||i)};static \u0275prov=H({token:i,factory:i.\u0275fac})};var Da=["leftCal"],ya=["rightCal"],Ca=["triggerInput"],wa=["panel"];function ka(i,s){if(i&1){let e=QE();di(0,"div",10,2),_p("keydown.escape",function(){sl(e);let t=JE();return al(t.onPanelEscape())}),di(2,"div",11),_p("mouseleave",function(){sl(e);let t=JE();return al(t.onHover(null))}),di(3,"div",12)(4,"div",13)(5,"button",14),_p("click",function(){sl(e);let t=JE();return al(t.goPrev())}),di(6,"span",15),MI(7,"chevron_left"),Rc()(),di(8,"span",16),MI(9),Rc(),Ep(10,"span",17),Rc(),di(11,"mat-calendar",18,3),_p("selectedChange",function(t){sl(e);let n=JE();return al(n.onDateClicked(t))}),Rc()(),di(13,"div",12)(14,"div",13),Ep(15,"span",17),di(16,"span",16),MI(17),Rc(),di(18,"button",14),_p("click",function(){sl(e);let t=JE();return al(t.goNext())}),di(19,"span",15),MI(20,"chevron_right"),Rc()()(),di(21,"mat-calendar",18,4),_p("selectedChange",function(t){sl(e);let n=JE();return al(n.onDateClicked(t))}),Rc()()()();}if(i&2){let e=JE();Bv(5),vp("aria-label",e.labels.prevMonth),Bv(4),Up(e.monthLabel(e.leftMonth)),Bv(2),Dp("startAt",e.leftMonth)("selected",e.selectedRange),Bv(6),Up(e.monthLabel(e.rightMonth)),Bv(),vp("aria-label",e.labels.nextMonth),Bv(3),Dp("startAt",e.rightMonth)("selected",e.selectedRange);}}function jt(i){return new Date(i.getFullYear(),i.getMonth(),1)}function qt(i,s){return new Date(i.getFullYear(),i.getMonth()+s,1)}function Aa(i,s){return !i||!s?i===s:i.getFullYear()===s.getFullYear()&&i.getMonth()===s.getMonth()&&i.getDate()===s.getDate()}var Qt=class i{start=null;end=null;rangeSelected=new $e;labels=v(It);leftCal;rightCal;triggerInput;panel;isOpen=false;leftMonth=jt(new Date);selectedRange=new D(null,null);hoverStrategy=v(q);pendingStart=null;pendingEnd=null;hoverDate=null;focusCalendarOnNextCheck=false;constructor(){this.hoverStrategy.onHover=s=>this.onHover(s);}ngAfterViewChecked(){this.focusCalendarOnNextCheck&&(this.focusCalendarOnNextCheck=false,this.leftCal?.focusActiveCell());}ngOnChanges(s){(s.start||s.end)&&(this.pendingStart=this.start,this.pendingEnd=this.end,this.hoverDate=null,this.syncSelectedRange(),this.start&&(this.leftMonth=jt(this.start)));}get rightMonth(){return qt(this.leftMonth,1)}get displayValue(){return !this.start||!this.end?"":`${this.formatDate(this.start)} - ${this.formatDate(this.end)}`}monthLabel(s){return this.labels.monthTitle.replace("{year}",String(s.getFullYear())).replace("{month}",String(s.getMonth()+1))}open(){this.hoverDate=null,this.isOpen=true;}close(){this.hoverDate=null,this.syncSelectedRange(),this.isOpen=false;}openViaKeyboard(s){s.preventDefault(),this.open();}onPanelAttached(){this.focusCalendarOnNextCheck=true;}onPanelEscape(){this.close(),this.triggerInput?.nativeElement.focus();}goPrev(){this.shiftMonths(-1);}goNext(){this.shiftMonths(1);}onDateClicked(s){if(s&&(!this.pendingStart||this.pendingEnd?(this.pendingStart=s,this.pendingEnd=null):s<this.pendingStart?this.pendingStart=s:this.pendingEnd=s,this.hoverDate=null,this.syncSelectedRange(),this.pendingStart&&this.pendingEnd)){let e=this.panel?.nativeElement.ownerDocument.activeElement;e&&this.panel?.nativeElement.contains(e)&&this.triggerInput?.nativeElement.focus(),this.rangeSelected.emit({start:this.pendingStart,end:this.pendingEnd}),this.isOpen=false;}}onHover(s){let e=this.pendingStart&&!this.pendingEnd?s:null;Aa(e,this.hoverDate)||(this.hoverDate=e,this.syncSelectedRange());}syncSelectedRange(){let s=this.pendingEnd;this.pendingStart&&!s&&this.hoverDate&&this.hoverDate>this.pendingStart&&(s=this.hoverDate),this.selectedRange=new D(this.pendingStart,s);}shiftMonths(s){this.leftMonth=qt(this.leftMonth,s),this.leftCal&&(this.leftCal.activeDate=this.leftMonth),this.rightCal&&(this.rightCal.activeDate=this.rightMonth);}formatDate(s){let e=a=>String(a).padStart(2,"0");return `${s.getFullYear()}/${e(s.getMonth()+1)}/${e(s.getDate())}`}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mE({type:i,selectors:[["lib-dual-month-range-picker"]],viewQuery:function(e,a){if(e&1&&xp(Da,5)(ya,5)(Ca,5)(wa,5),e&2){let t;rI(t=oI())&&(a.leftCal=t.first),rI(t=oI())&&(a.rightCal=t.first),rI(t=oI())&&(a.triggerInput=t.first),rI(t=oI())&&(a.panel=t.first);}},inputs:{start:"start",end:"end"},outputs:{rangeSelected:"rangeSelected"},features:[HI([q,{provide:ke,useExisting:q}]),Qa],decls:10,vars:8,consts:[["origin","cdkOverlayOrigin"],["triggerInput",""],["panel",""],["leftCal",""],["rightCal",""],["cdkOverlayOrigin","",1,"block","w-full"],["appearance","fill",1,"w-full",3,"click"],["matInput","","readonly","","aria-haspopup","dialog",3,"keydown.enter","keydown.space","keydown.alt.arrowdown","value","placeholder"],["matIconSuffix","","aria-hidden","true",1,"material-symbols-rounded"],["cdkConnectedOverlay","","cdkConnectedOverlayBackdropClass","dual-calendar-backdrop","cdkConnectedOverlayPanelClass","dual-calendar-overlay-pane",3,"backdropClick","attach","detach","cdkConnectedOverlayOrigin","cdkConnectedOverlayOpen","cdkConnectedOverlayHasBackdrop","cdkConnectedOverlayDisableClose"],["tabindex","-1",1,"dual-calendar-panel",3,"keydown.escape"],[1,"calendars-row",3,"mouseleave"],[1,"calendar-pane"],[1,"month-head"],["type","button","mat-icon-button","",3,"click"],["aria-hidden","true",1,"material-symbols-rounded"],[1,"month-label"],[1,"head-spacer"],[3,"selectedChange","startAt","selected"]],template:function(e,a){if(e&1&&(di(0,"div",5,0)(2,"mat-form-field",6),_p("click",function(){return a.open()}),di(3,"mat-label"),MI(4),Rc(),di(5,"input",7,1),_p("keydown.enter",function(n){return a.openViaKeyboard(n)})("keydown.space",function(n){return a.openViaKeyboard(n)})("keydown.alt.arrowdown",function(n){return a.openViaKeyboard(n)}),Rc(),di(7,"span",8),MI(8,"calendar_month"),Rc()()(),fp(9,ka,23,8,"ng-template",9),_p("backdropClick",function(){return a.close()})("attach",function(){return a.onPanelAttached()})("detach",function(){return a.close()})),e&2){let t=sI(1);Bv(4),Up(a.labels.field),Bv(),Dp("value",a.displayValue)("placeholder",a.labels.placeholder),vp("aria-expanded",a.isOpen),Bv(4),Dp("cdkConnectedOverlayOrigin",t)("cdkConnectedOverlayOpen",a.isOpen)("cdkConnectedOverlayHasBackdrop",true)("cdkConnectedOverlayDisableClose",true);}},dependencies:[me,ge,St,nl,gi,ce,rt,ae$1,Pt$1,ln,an,Kt,ne],styles:['@charset "UTF-8";.dual-calendar-panel[_ngcontent-%COMP%]{background:var(--mat-sys-surface-container-high);border:1px solid var(--mat-sys-outline-variant);border-radius:var(--mat-sys-corner-medium);box-shadow:var(--mat-sys-level3);padding:8px 12px 12px;max-width:calc(100vw - 24px);box-sizing:border-box}.calendars-row[_ngcontent-%COMP%]{display:flex;gap:8px}.calendar-pane[_ngcontent-%COMP%]{width:280px;max-width:100%}@media(max-width:767px){.calendars-row[_ngcontent-%COMP%]{flex-direction:column;align-items:center}.calendar-pane[_ngcontent-%COMP%]{width:min(100%,340px)}.dual-calendar-panel[_ngcontent-%COMP%]{width:100%;max-width:none;max-height:85vh;overflow-y:auto;border-inline:0;border-bottom:0;border-radius:var(--mat-sys-corner-large) var(--mat-sys-corner-large) 0 0;padding-bottom:max(12px,env(safe-area-inset-bottom));animation:_ngcontent-%COMP%_dual-calendar-slide-up .2s ease-out}}@keyframes _ngcontent-%COMP%_dual-calendar-slide-up{0%{transform:translateY(100%)}to{transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.dual-calendar-panel[_ngcontent-%COMP%]{animation:none}}.month-head[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px}.month-head[_ngcontent-%COMP%]   .month-label[_ngcontent-%COMP%]{flex:1;text-align:center;font-weight:500}.month-head[_ngcontent-%COMP%]   .head-spacer[_ngcontent-%COMP%]{width:40px;flex:none}@media(max-width:767px){  .dual-calendar-overlay-pane{position:absolute!important;inset:auto 0 0!important;transform:none!important;max-width:none!important}}@media(max-width:767px){  .dual-calendar-backdrop{background:#0006}}.dual-calendar-panel[_ngcontent-%COMP%]     .mat-calendar-header{display:none}.dual-calendar-panel[_ngcontent-%COMP%]     .mat-calendar-body tr[aria-hidden=true]{display:none}.dual-calendar-panel[_ngcontent-%COMP%]     .mat-calendar-body-label{visibility:hidden}']})};export{It as I,Qt as Q};
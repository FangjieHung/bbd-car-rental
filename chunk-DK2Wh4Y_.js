import {a as aF,T,at as G,au as ce,av as Ue,F as FI,n as ii,K as KE,p as mc,q as yp,c as aE,o as ov,A as Ap,t as up,e as cE,aw as He,ax as So,ay as b,d as dD,V as VI,M as Ml,az as Yi,G as G$1,U as KL,Z as ve,aA as Be,a6 as Oe,a3 as _,aB as vt$1,$ as $I,X as XL,E as aD,aC as lp,k as bp,ah as vp,ai as _E,aj as ME,W as dr,aD as sn,aE as _e,aF as H,aG as Hi,a8 as Bp,aH as Qd,z as TE,B as CE,r as dp,aI as SE,aJ as Ip,aK as s,aL as a,aM as o,aN as D,m as Fu,O as Ou,b as dE,C as Cp,f as fE,g,u as u$1,h as DE,aO as lE,D as Dc,an as vE,aP as Op,R as Rp,aQ as kp,aR as ao,aS as Pp,ar as Xl,as as eu}from'./main-XEJKKLUI.js';import {f}from'./chunk-CicBCoNG.js';import {n}from'./chunk-Byd0GKxQ.js';import {u,T as T$1}from'./chunk-CCK2IlOy.js';import {p}from'./chunk-OboDQbSf.js';import {B as Be$1,q as qe,w as wi,d as dr$1,o as or,l as lr,a as ar}from'./chunk-DQJsnlfc.js';function Qe(o,a){let t=!a?.manualCleanup?a?.injector?.get(He)??T(He):null,n=et(a?.equal),s;a?.requireSync?s=So({kind:0},{equal:n}):s=So({kind:1,value:a?.initialValue},{equal:n});let g,b$1=o.subscribe({next:h=>s.set({kind:1,value:h}),error:h=>{s.set({kind:2,error:h}),g?.();},complete:()=>{g?.();}});if(a?.requireSync&&s().kind===0)throw new b(601,false);return g=t?.onDestroy(b$1.unsubscribe.bind(b$1)),dD(()=>{let h=s();switch(h.kind){case 1:return h.value;case 2:throw h.error;case 0:throw new b(601,false)}},{equal:a?.equal})}function et(o=Object.is){return (a,e)=>a.kind===1&&e.kind===1&&o(a.value,e.value)}var lt=["button"],st=["*"];function dt(o,a){if(o&1&&(ii(0,"div",2),dp(1,"mat-pseudo-checkbox",6),mc()),o&2){let e=DE();ov(),up("disabled",e.disabled);}}var Ze=new _("MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS",{providedIn:"root",factory:()=>({hideSingleSelectionIndicator:false,hideMultipleSelectionIndicator:false,disabledInteractive:false})}),Ye=new _("MatButtonToggleGroup"),ct={provide:qe,useExisting:ao(()=>le),multi:true},W=class{source;value;constructor(a,e){this.source=a,this.value=e;}},le=(()=>{class o{_changeDetector=T(KL);_dir=T(ve,{optional:true});_multiple=false;_disabled=false;_disabledInteractive=false;_selectionModel;_rawValue;_controlValueAccessorChangeFn=()=>{};_onTouched=()=>{};_buttonToggles;appearance;get name(){return this._name}set name(e){this._name=e,this._markButtonsForCheck();}_name=T(Be).getId("mat-button-toggle-group-");vertical=false;get value(){let e=this._selectionModel?this._selectionModel.selected:[];return this.multiple?e.map(t=>t.value):e[0]?e[0].value:void 0}set value(e){this._setSelectionByValue(e),this.valueChange.emit(this.value);}valueChange=new Oe;get selected(){let e=this._selectionModel?this._selectionModel.selected:[];return this.multiple?e:e[0]||null}get multiple(){return this._multiple}set multiple(e){this._multiple=e,this._markButtonsForCheck();}get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._markButtonsForCheck();}get disabledInteractive(){return this._disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e,this._markButtonsForCheck();}get dir(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}change=new Oe;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._markButtonsForCheck();}_hideSingleSelectionIndicator;get hideMultipleSelectionIndicator(){return this._hideMultipleSelectionIndicator}set hideMultipleSelectionIndicator(e){this._hideMultipleSelectionIndicator=e,this._markButtonsForCheck();}_hideMultipleSelectionIndicator;constructor(){let e=T(Ze,{optional:true});this.appearance=e&&e.appearance?e.appearance:"standard",this._hideSingleSelectionIndicator=e?.hideSingleSelectionIndicator??false,this._hideMultipleSelectionIndicator=e?.hideMultipleSelectionIndicator??false;}ngOnInit(){this._selectionModel=new u(this.multiple,void 0,false);}ngAfterContentInit(){this._selectionModel.select(...this._buttonToggles.filter(e=>e.checked)),this.multiple||this._initializeTabIndex();}writeValue(e){this.value=e,this._changeDetector.markForCheck();}registerOnChange(e){this._controlValueAccessorChangeFn=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e;}_keydown(e){if(this.multiple||this.disabled||vt$1(e))return;let n=e.target.id,s=this._buttonToggles.toArray().findIndex(b=>b.buttonId===n),g=null;switch(e.keyCode){case 32:case 13:g=this._buttonToggles.get(s)||null;break;case 38:g=this._getNextButton(s,-1);break;case 37:g=this._getNextButton(s,this.dir==="ltr"?-1:1);break;case 40:g=this._getNextButton(s,1);break;case 39:g=this._getNextButton(s,this.dir==="ltr"?1:-1);break;default:return}g&&(e.preventDefault(),g._onButtonClick(),g.focus());}_emitChangeEvent(e){let t=new W(e,this.value);this._rawValue=t.value,this._controlValueAccessorChangeFn(t.value),this.change.emit(t);}_syncButtonToggle(e,t,n=false,s=false){!this.multiple&&this.selected&&!e.checked&&(this.selected.checked=false),this._selectionModel?t?this._selectionModel.select(e):this._selectionModel.deselect(e):s=true,s?Promise.resolve().then(()=>this._updateModelValue(e,n)):this._updateModelValue(e,n);}_isSelected(e){return this._selectionModel&&this._selectionModel.isSelected(e)}_isPrechecked(e){return typeof this._rawValue>"u"?false:this.multiple&&Array.isArray(this._rawValue)?this._rawValue.some(t=>e.value!=null&&t===e.value):e.value===this._rawValue}_initializeTabIndex(){if(this._buttonToggles.forEach(e=>{e.tabIndex=-1;}),this.selected)this.selected.tabIndex=0;else for(let e=0;e<this._buttonToggles.length;e++){let t=this._buttonToggles.get(e);if(!t.disabled){t.tabIndex=0;break}}}_getNextButton(e,t){let n=this._buttonToggles;for(let s=1;s<=n.length;s++){let g=(e+t*s+n.length)%n.length,b=n.get(g);if(b&&!b.disabled)return b}return null}_setSelectionByValue(e){if(this._rawValue=e,!this._buttonToggles)return;let t=this._buttonToggles.toArray();if(this.multiple&&e?(this._clearSelection(),e.forEach(n=>this._selectValue(n,t))):(this._clearSelection(),this._selectValue(e,t)),!this.multiple&&t.every(n=>n.tabIndex===-1)){for(let n of t)if(!n.disabled){n.tabIndex=0;break}}}_clearSelection(){this._selectionModel.clear(),this._buttonToggles.forEach(e=>{e.checked=false,this.multiple||(e.tabIndex=-1);});}_selectValue(e,t){for(let n of t)if(n.value===e){n.checked=true,this._selectionModel.select(n),this.multiple||(n.tabIndex=0);break}}_updateModelValue(e,t){t&&this._emitChangeEvent(e),this.valueChange.emit(this.value);}_markButtonsForCheck(){this._buttonToggles?.forEach(e=>e._markForCheck());}static \u0275fac=function(t){return new(t||o)};static \u0275dir=$I({type:o,selectors:[["mat-button-toggle-group"]],contentQueries:function(t,n,s){if(t&1&&vp(s,Z,5),t&2){let g;_E(g=ME())&&(n._buttonToggles=g);}},hostAttrs:[1,"mat-button-toggle-group"],hostVars:6,hostBindings:function(t,n){t&1&&yp("keydown",function(g){return n._keydown(g)}),t&2&&(lp("role",n.multiple?"group":"radiogroup")("aria-disabled",n.disabled),bp("mat-button-toggle-vertical",n.vertical)("mat-button-toggle-group-appearance-standard",n.appearance==="standard"));},inputs:{appearance:"appearance",name:"name",vertical:[2,"vertical","vertical",XL],value:"value",multiple:[2,"multiple","multiple",XL],disabled:[2,"disabled","disabled",XL],disabledInteractive:[2,"disabledInteractive","disabledInteractive",XL],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",XL],hideMultipleSelectionIndicator:[2,"hideMultipleSelectionIndicator","hideMultipleSelectionIndicator",XL]},outputs:{valueChange:"valueChange",change:"change"},exportAs:["matButtonToggleGroup"],features:[aD([ct,{provide:Ye,useExisting:o}])]})}return o})(),Z=(()=>{class o{_changeDetectorRef=T(KL);_elementRef=T(dr);_focusMonitor=T(sn);_idGenerator=T(Be);_animationDisabled=_e();_checked=false;ariaLabel;ariaLabelledby=null;_buttonElement;buttonToggleGroup;get buttonId(){return `${this.id}-button`}id;name;value;get tabIndex(){return this._tabIndex()}set tabIndex(e){this._tabIndex.set(e);}_tabIndex;disableRipple=false;get appearance(){return this.buttonToggleGroup?this.buttonToggleGroup.appearance:this._appearance}set appearance(e){this._appearance=e;}_appearance;get checked(){return this.buttonToggleGroup?this.buttonToggleGroup._isSelected(this):this._checked}set checked(e){e!==this._checked&&(this._checked=e,this.buttonToggleGroup&&this.buttonToggleGroup._syncButtonToggle(this,this._checked),this._changeDetectorRef.markForCheck());}get disabled(){return this._disabled||this.buttonToggleGroup&&this.buttonToggleGroup.disabled}set disabled(e){this._disabled=e;}_disabled=false;get disabledInteractive(){return this._disabledInteractive||this.buttonToggleGroup!==null&&this.buttonToggleGroup.disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e;}_disabledInteractive;change=new Oe;constructor(){T(H).load(Hi);let e=T(Ye,{optional:true}),t=T(new Bp("tabindex"),{optional:true})||"",n=T(Ze,{optional:true});this._tabIndex=So(parseInt(t)||0),this.buttonToggleGroup=e,this._appearance=n&&n.appearance?n.appearance:"standard",this._disabledInteractive=n?.disabledInteractive??false;}ngOnInit(){let e=this.buttonToggleGroup;this.id=this.id||this._idGenerator.getId("mat-button-toggle-"),e&&(e._isPrechecked(this)?this.checked=true:e._isSelected(this)!==this._checked&&e._syncButtonToggle(this,this._checked));}ngAfterViewInit(){this._animationDisabled||this._elementRef.nativeElement.classList.add("mat-button-toggle-animations-enabled"),this._focusMonitor.monitor(this._elementRef,true);}ngOnDestroy(){let e=this.buttonToggleGroup;this._focusMonitor.stopMonitoring(this._elementRef),e&&e._isSelected(this)&&e._syncButtonToggle(this,false,false,true);}focus(e){this._buttonElement.nativeElement.focus(e);}_onButtonClick(){if(this.disabled)return;let e=this.isSingleSelector()?true:!this._checked;if(e!==this._checked&&(this._checked=e,this.buttonToggleGroup&&(this.buttonToggleGroup._syncButtonToggle(this,this._checked,true),this.buttonToggleGroup._onTouched())),this.isSingleSelector()){let t=this.buttonToggleGroup._buttonToggles.find(n=>n.tabIndex===0);t&&(t.tabIndex=-1),this.tabIndex=0;}this.change.emit(new W(this,this.value));}_markForCheck(){this._changeDetectorRef.markForCheck();}_getButtonName(){return this.isSingleSelector()?this.buttonToggleGroup.name:this.name||null}isSingleSelector(){return this.buttonToggleGroup&&!this.buttonToggleGroup.multiple}static \u0275fac=function(t){return new(t||o)};static \u0275cmp=FI({type:o,selectors:[["mat-button-toggle"]],viewQuery:function(t,n){if(t&1&&Ip(lt,5),t&2){let s;_E(s=ME())&&(n._buttonElement=s.first);}},hostAttrs:["role","presentation",1,"mat-button-toggle"],hostVars:14,hostBindings:function(t,n){t&1&&yp("focus",function(){return n.focus()}),t&2&&(lp("aria-label",null)("aria-labelledby",null)("id",n.id)("name",null),bp("mat-button-toggle-standalone",!n.buttonToggleGroup)("mat-button-toggle-checked",n.checked)("mat-button-toggle-disabled",n.disabled)("mat-button-toggle-disabled-interactive",n.disabledInteractive)("mat-button-toggle-appearance-standard",n.appearance==="standard"));},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],id:"id",name:"name",value:"value",tabIndex:"tabIndex",disableRipple:[2,"disableRipple","disableRipple",XL],appearance:"appearance",checked:[2,"checked","checked",XL],disabled:[2,"disabled","disabled",XL],disabledInteractive:[2,"disabledInteractive","disabledInteractive",XL]},outputs:{change:"change"},exportAs:["matButtonToggle"],ngContentSelectors:st,decls:7,vars:13,consts:[["button",""],["type","button",1,"mat-button-toggle-button","mat-focus-indicator",3,"click","id","disabled"],[1,"mat-button-toggle-checkbox-wrapper"],[1,"mat-button-toggle-label-content"],[1,"mat-button-toggle-focus-overlay"],["matRipple","",1,"mat-button-toggle-ripple",3,"matRippleTrigger","matRippleDisabled"],["state","checked","aria-hidden","true","appearance","minimal",3,"disabled"]],template:function(t,n){if(t&1&&(TE(),ii(0,"button",1,0),yp("click",function(){return n._onButtonClick()}),aE(2,dt,2,1,"div",2),ii(3,"span",3),CE(4),mc()(),dp(5,"span",4)(6,"span",5)),t&2){let s=SE(1);up("id",n.buttonId)("disabled",n.disabled&&!n.disabledInteractive||null),lp("role",n.isSingleSelector()?"radio":"button")("tabindex",n.disabled&&!n.disabledInteractive?-1:n.tabIndex)("aria-pressed",n.isSingleSelector()?null:n.checked)("aria-checked",n.isSingleSelector()?n.checked:null)("name",n._getButtonName())("aria-label",n.ariaLabel)("aria-labelledby",n.ariaLabelledby)("aria-disabled",n.disabled&&n.disabledInteractive?"true":null),ov(2),cE(n.buttonToggleGroup&&(!n.buttonToggleGroup.multiple&&!n.buttonToggleGroup.hideSingleSelectionIndicator||n.buttonToggleGroup.multiple&&!n.buttonToggleGroup.hideMultipleSelectionIndicator)?2:-1),ov(4),up("matRippleTrigger",s)("matRippleDisabled",n.disableRipple||n.disabled);}},dependencies:[Qd,T$1],styles:[`.mat-button-toggle-standalone,
.mat-button-toggle-group {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  white-space: nowrap;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  border-radius: var(--mat-button-toggle-legacy-shape);
  transform: translateZ(0);
}
.mat-button-toggle-standalone:not([class*=mat-elevation-z]),
.mat-button-toggle-group:not([class*=mat-elevation-z]) {
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
}
@media (forced-colors: active) {
  .mat-button-toggle-standalone,
  .mat-button-toggle-group {
    outline: solid 1px;
  }
}

.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,
.mat-button-toggle-group-appearance-standard {
  border-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
  border: solid 1px var(--mat-button-toggle-divider-color, var(--mat-sys-outline));
}
.mat-button-toggle-standalone.mat-button-toggle-appearance-standard .mat-pseudo-checkbox,
.mat-button-toggle-group-appearance-standard .mat-pseudo-checkbox {
  --mat-pseudo-checkbox-minimal-selected-checkmark-color: var(--mat-button-toggle-selected-state-text-color, var(--mat-sys-on-secondary-container));
}
.mat-button-toggle-standalone.mat-button-toggle-appearance-standard:not([class*=mat-elevation-z]),
.mat-button-toggle-group-appearance-standard:not([class*=mat-elevation-z]) {
  box-shadow: none;
}
@media (forced-colors: active) {
  .mat-button-toggle-standalone.mat-button-toggle-appearance-standard,
  .mat-button-toggle-group-appearance-standard {
    outline: 0;
  }
}

.mat-button-toggle-vertical {
  flex-direction: column;
}
.mat-button-toggle-vertical .mat-button-toggle-label-content {
  display: block;
}

.mat-button-toggle {
  white-space: nowrap;
  position: relative;
  color: var(--mat-button-toggle-legacy-text-color);
  font-family: var(--mat-button-toggle-legacy-label-text-font);
  font-size: var(--mat-button-toggle-legacy-label-text-size);
  line-height: var(--mat-button-toggle-legacy-label-text-line-height);
  font-weight: var(--mat-button-toggle-legacy-label-text-weight);
  letter-spacing: var(--mat-button-toggle-legacy-label-text-tracking);
  --mat-pseudo-checkbox-minimal-selected-checkmark-color: var(--mat-button-toggle-legacy-selected-state-text-color);
}
.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay {
  opacity: var(--mat-button-toggle-legacy-focus-state-layer-opacity);
}
.mat-button-toggle .mat-icon svg {
  vertical-align: top;
}

.mat-button-toggle-checkbox-wrapper {
  display: inline-block;
  justify-content: flex-start;
  align-items: center;
  width: 0;
  height: 18px;
  line-height: 18px;
  overflow: hidden;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translate3d(0, -50%, 0);
}
[dir=rtl] .mat-button-toggle-checkbox-wrapper {
  left: auto;
  right: 16px;
}
.mat-button-toggle-appearance-standard .mat-button-toggle-checkbox-wrapper {
  left: 12px;
}
[dir=rtl] .mat-button-toggle-appearance-standard .mat-button-toggle-checkbox-wrapper {
  left: auto;
  right: 12px;
}
.mat-button-toggle-checked .mat-button-toggle-checkbox-wrapper {
  width: 18px;
}
.mat-button-toggle-animations-enabled .mat-button-toggle-checkbox-wrapper {
  transition: width 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-button-toggle-vertical .mat-button-toggle-checkbox-wrapper {
  transition: none;
}

.mat-button-toggle-checked {
  color: var(--mat-button-toggle-legacy-selected-state-text-color);
  background-color: var(--mat-button-toggle-legacy-selected-state-background-color);
}

.mat-button-toggle-disabled {
  pointer-events: none;
  color: var(--mat-button-toggle-legacy-disabled-state-text-color);
  background-color: var(--mat-button-toggle-legacy-disabled-state-background-color);
  --mat-pseudo-checkbox-minimal-disabled-selected-checkmark-color: var(--mat-button-toggle-legacy-disabled-state-text-color);
}
.mat-button-toggle-disabled.mat-button-toggle-checked {
  background-color: var(--mat-button-toggle-legacy-disabled-selected-state-background-color);
}

.mat-button-toggle-disabled-interactive {
  pointer-events: auto;
}

.mat-button-toggle-appearance-standard {
  color: var(--mat-button-toggle-text-color, var(--mat-sys-on-surface));
  background-color: var(--mat-button-toggle-background-color, transparent);
  font-family: var(--mat-button-toggle-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-toggle-label-text-size, var(--mat-sys-label-large-size));
  line-height: var(--mat-button-toggle-label-text-line-height, var(--mat-sys-label-large-line-height));
  font-weight: var(--mat-button-toggle-label-text-weight, var(--mat-sys-label-large-weight));
  letter-spacing: var(--mat-button-toggle-label-text-tracking, var(--mat-sys-label-large-tracking));
}
.mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard + .mat-button-toggle-appearance-standard {
  border-left: solid 1px var(--mat-button-toggle-divider-color, var(--mat-sys-outline));
}
[dir=rtl] .mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard + .mat-button-toggle-appearance-standard {
  border-left: none;
  border-right: solid 1px var(--mat-button-toggle-divider-color, var(--mat-sys-outline));
}
.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle-appearance-standard + .mat-button-toggle-appearance-standard {
  border-left: none;
  border-right: none;
  border-top: solid 1px var(--mat-button-toggle-divider-color, var(--mat-sys-outline));
}
.mat-button-toggle-appearance-standard.mat-button-toggle-checked {
  color: var(--mat-button-toggle-selected-state-text-color, var(--mat-sys-on-secondary-container));
  background-color: var(--mat-button-toggle-selected-state-background-color, var(--mat-sys-secondary-container));
}
.mat-button-toggle-appearance-standard.mat-button-toggle-disabled {
  color: var(--mat-button-toggle-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-toggle-disabled-state-background-color, transparent);
}
.mat-button-toggle-appearance-standard.mat-button-toggle-disabled .mat-pseudo-checkbox {
  --mat-pseudo-checkbox-minimal-disabled-selected-checkmark-color: var(--mat-button-toggle-disabled-selected-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-button-toggle-appearance-standard.mat-button-toggle-disabled.mat-button-toggle-checked {
  color: var(--mat-button-toggle-disabled-selected-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-toggle-disabled-selected-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay {
  background-color: var(--mat-button-toggle-state-layer-color, var(--mat-sys-on-surface));
}
.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay {
  opacity: var(--mat-button-toggle-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-button-toggle-appearance-standard.cdk-keyboard-focused .mat-button-toggle-focus-overlay {
  opacity: var(--mat-button-toggle-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
@media (hover: none) {
  .mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay {
    display: none;
  }
}

.mat-button-toggle-label-content {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  padding: 0 16px;
  line-height: var(--mat-button-toggle-legacy-height);
  position: relative;
}
.mat-button-toggle-appearance-standard .mat-button-toggle-label-content {
  padding: 0 12px;
  line-height: var(--mat-button-toggle-height, 40px);
}

.mat-button-toggle-label-content > * {
  vertical-align: middle;
}

.mat-button-toggle-focus-overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  background-color: var(--mat-button-toggle-legacy-state-layer-color);
}

@media (forced-colors: active) {
  .mat-button-toggle-checked .mat-button-toggle-focus-overlay {
    border-bottom: solid 500px;
    opacity: 0.5;
    height: 0;
  }
  .mat-button-toggle-checked:hover .mat-button-toggle-focus-overlay {
    opacity: 0.6;
  }
  .mat-button-toggle-checked.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay {
    border-bottom: solid 500px;
  }
}
.mat-button-toggle .mat-button-toggle-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}

.mat-button-toggle-button {
  border: 0;
  background: none;
  color: inherit;
  padding: 0;
  margin: 0;
  font: inherit;
  outline: none;
  width: 100%;
  cursor: pointer;
}
.mat-button-toggle-animations-enabled .mat-button-toggle-button {
  transition: padding 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-button-toggle-vertical .mat-button-toggle-button {
  transition: none;
}
.mat-button-toggle-disabled .mat-button-toggle-button {
  cursor: default;
}
.mat-button-toggle-button::-moz-focus-inner {
  border: 0;
}
.mat-button-toggle-checked .mat-button-toggle-button:has(.mat-button-toggle-checkbox-wrapper) {
  padding-left: 30px;
}
[dir=rtl] .mat-button-toggle-checked .mat-button-toggle-button:has(.mat-button-toggle-checkbox-wrapper) {
  padding-left: 0;
  padding-right: 30px;
}

.mat-button-toggle-standalone.mat-button-toggle-appearance-standard {
  --mat-focus-indicator-border-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
}

.mat-button-toggle-group-appearance-standard:not(.mat-button-toggle-vertical) .mat-button-toggle:last-of-type .mat-button-toggle-button::before {
  border-top-right-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
  border-bottom-right-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
}
.mat-button-toggle-group-appearance-standard:not(.mat-button-toggle-vertical) .mat-button-toggle:first-of-type .mat-button-toggle-button::before {
  border-top-left-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
  border-bottom-left-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
}

.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle:last-of-type .mat-button-toggle-button::before {
  border-bottom-right-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
  border-bottom-left-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
}
.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle:first-of-type .mat-button-toggle-button::before {
  border-top-right-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
  border-top-left-radius: var(--mat-button-toggle-shape, var(--mat-sys-corner-extra-large));
}
`],encapsulation:2})}return o})(),Ke=(()=>{class o{static \u0275fac=function(t){return new(t||o)};static \u0275mod=VI({type:o});static \u0275inj=Ml({imports:[Yi,Z,G$1]})}return o})();var Y=class o{t=aF;data=T(wi);customerStore=T(n);vehicleStore=T(p);fmt=g;get plate(){return this.vehicleStore.vehicles().find(a=>a.id===this.data.vehicleId)?.plateNumber??"\u2014"}static \u0275fac=function(e){return new(e||o)};static \u0275cmp=FI({type:o,selectors:[["app-booking-detail-dialog"]],decls:46,vars:15,consts:[["mat-dialog-content","",1,"text-sm","flex","flex-col","gap-1.5"],[2,"color","var(--text-secondary)"],["mat-dialog-actions","","align","end"],["mat-button","","mat-dialog-close",""]],template:function(e,t){e&1&&(ii(0,"div",0)(1,"p")(2,"b"),KE(3),mc(),KE(4,"\uFF1A"),ii(5,"span",1),KE(6),mc()(),ii(7,"p")(8,"b"),KE(9),mc(),KE(10,"\uFF1A"),ii(11,"span",1),KE(12),mc()(),ii(13,"p")(14,"b"),KE(15),mc(),KE(16,"\uFF1A"),ii(17,"span",1),KE(18),mc()(),ii(19,"p")(20,"b"),KE(21),mc(),KE(22,"\uFF1A"),ii(23,"span",1),KE(24),mc()(),ii(25,"p")(26,"b"),KE(27),mc(),KE(28,"\uFF1A"),ii(29,"span",1),KE(30),mc()(),ii(31,"p")(32,"b"),KE(33),mc(),KE(34,"\uFF1A"),ii(35,"span",1),KE(36),mc()(),ii(37,"p")(38,"b"),KE(39),mc(),KE(40,"\uFF1A"),ii(41,"span",1),KE(42),mc()()(),ii(43,"div",2)(44,"button",3),KE(45),mc()()),e&2&&(ov(3),Ap(t.t.booking.vehicle),ov(3),Ap(t.plate),ov(3),Ap(t.t.booking.customer),ov(3),Ap(t.customerStore.nameOf(t.data.customerId)),ov(3),Ap(t.t.booking.startTime),ov(3),Ap(t.fmt(t.data.startTime)),ov(3),Ap(t.t.booking.endTime),ov(3),Ap(t.fmt(t.data.endTime)),ov(3),Ap(t.t.booking.pickupLocation),ov(3),Ap(t.data.pickupLocation),ov(3),Ap(t.t.booking.returnLocation),ov(3),Ap(t.data.returnLocation),ov(3),Ap(t.t.booking.status),ov(3),Ap(t.t.booking.statusLabels[t.data.status]),ov(3),Ap(t.t.common.confirm));},dependencies:[dr$1,or,lr,ar,Fu,Ou],encapsulation:2})};var gt=(o,a)=>a.id,mt=(o,a)=>a.bookingId;function pt(o,a){if(o&1&&(ii(0,"div",6),KE(1),mc()),o&2){let e=a.$implicit,t=DE();ov(),Ap(t.fmtDate(e));}}function bt(o,a){if(o&1&&(ii(0,"span",9),KE(1),mc()),o&2){let e=DE(2);ov(),Dc("\uFF08",e.t.dispatch.maintenanceBlock,"\uFF09");}}function ht(o,a){if(o&1&&dp(0,"div",13),o&2){let e=a.$index,t=DE().$implicit,n=DE();Cp("background",t.status==="maintenance"&&e===n.todayIdx()?"var(--cream-300)":null);}}function ft(o,a){if(o&1){let e=vE();ii(0,"button",14),yp("click",function(){let n=Xl(e).$implicit,s=DE(2);return eu(s.openDetail(n.bookingId))}),KE(1),mc();}if(o&2){let e=a.$implicit,t=DE(2);Cp("background",e.kind==="confirmed"?"var(--teal-500)":"var(--sage-500)")("grid-column",e.startCol+1+" / span "+e.span)("grid-row",1),ov(),Dc(" ",t.t.booking.statusLabels[e.kind]," ");}}function vt(o,a){if(o&1&&(ii(0,"div",7)(1,"div",4)(2,"div",8),KE(3),aE(4,bt,2,1,"span",9),mc(),dE(5,ht,1,2,"div",10,lE),mc(),ii(7,"div",11),dp(8,"div"),dE(9,ft,2,7,"button",12,mt),mc()()),o&2){let e=a.$implicit,t=DE();ov(),Cp("grid-template-columns",t.gridCols),ov(2),Dc(" ",e.plateNumber," "),ov(),cE(e.status==="maintenance"?4:-1),ov(),fE(t.days()),ov(2),Cp("grid-template-columns",t.gridCols),ov(2),fE(t.blocksOf(e.id));}}function _t(o,a,e,t){let n=[];for(let s of o){if(s.vehicleId!==a||s.status!=="confirmed"&&s.status!=="in_progress")continue;let g=D(new Date(s.startTime),e),b=D(new Date(s.endTime),e);if(b<0||g>t-1)continue;let h=Math.max(g,0),f=Math.min(b,t-1);n.push({startCol:h+1,span:f-h+1,kind:s.status,bookingId:s.id});}return n}var de=14,K=class o$1{t=aF;vehicleStore=T(p);bookingStore=T(f);dialog=T(Be$1);fmtDate=s;gridCols=`120px repeat(${de}, minmax(48px, 1fr))`;rangeStart=So(a(new Date));days=dD(()=>Array.from({length:de},(a,e)=>o(this.rangeStart(),e)));todayIdx=dD(()=>D(new Date,this.rangeStart()));shift(a){this.rangeStart.update(e=>o(e,a));}blocksOf(a){return _t(this.bookingStore.bookings(),a,this.rangeStart(),de)}openDetail(a){let e=this.bookingStore.bookings().find(t=>t.id===a);e&&this.dialog.open(Y,{data:e,width:"360px"});}static \u0275fac=function(e){return new(e||o$1)};static \u0275cmp=FI({type:o$1,selectors:[["app-timeline-view"]],decls:14,vars:5,consts:[[1,"flex","items-center","gap-2"],["mat-button","",3,"click"],[1,"v-card","overflow-x-auto","!p-0"],[1,"min-w-[900px]"],[1,"grid"],[1,"text-xs","font-bold","p-2"],[1,"text-xs","text-center","p-2",2,"color","var(--text-tertiary)","border-left","1px solid var(--border-subtle)"],[1,"relative",2,"border-top","1px solid var(--border-subtle)"],[1,"text-sm","p-2","whitespace-nowrap"],[1,"text-xs",2,"color","var(--text-tertiary)"],[1,"min-h-10",2,"border-left","1px solid var(--border-subtle)",3,"background"],[1,"absolute","inset-0","grid","pointer-events-none"],[1,"pointer-events-auto","self-center","h-6","rounded","text-xs","truncate","px-1.5","cursor-pointer","font-semibold",2,"color","#fff",3,"background","grid-column","grid-row"],[1,"min-h-10",2,"border-left","1px solid var(--border-subtle)"],[1,"pointer-events-auto","self-center","h-6","rounded","text-xs","truncate","px-1.5","cursor-pointer","font-semibold",2,"color","#fff",3,"click"]],template:function(e,t){e&1&&(ii(0,"div",0)(1,"button",1),yp("click",function(){return t.shift(-14)}),KE(2),mc(),ii(3,"button",1),yp("click",function(){return t.shift(14)}),KE(4),mc()(),ii(5,"div",2)(6,"div",3)(7,"div",4)(8,"div",5),KE(9),mc(),dE(10,pt,2,1,"div",6,lE),mc(),dE(12,vt,11,6,"div",7,gt),mc()()),e&2&&(ov(2),Ap(t.t.dispatch.prevRange),ov(2),Ap(t.t.dispatch.nextRange),ov(3),Cp("grid-template-columns",t.gridCols),ov(2),Ap(t.t.booking.vehicle),ov(),fE(t.days()),ov(2),fE(t.vehicleStore.vehicles()));},dependencies:[Fu,Ou],encapsulation:2})};var yt=(o,a)=>a.getTime(),xt=(o,a)=>a.id;function kt(o,a){if(o&1){let e=vE();ii(0,"button",6),yp("click",function(){let n=Xl(e).$implicit,s=DE();return eu(s.selected.set(n))}),ii(1,"div",2),KE(2),mc(),ii(3,"div",7),KE(4),mc(),ii(5,"div",8),KE(6),mc()();}if(o&2){let e=a.$implicit,t=DE();Cp("background",t.selected()&&t.isSameDay(e,t.selected())?"var(--sage-100)":null),bp("opacity-40",e.getMonth()!==t.month().getMonth()),ov(),Cp("color",t.isSameDay(e,t.todayDate)?"var(--sage-600)":null),ov(),Ap(e.getDate()),ov(2),Op("",t.t.dispatch.pickups,"",t.statsOf(e).pickups," ",t.t.dispatch.returns,"",t.statsOf(e).returns),ov(2),Rp("",t.t.dispatch.available," ",t.statsOf(e).available);}}function Tt(o,a){if(o&1&&(ii(0,"p",10),KE(1),mc()),o&2){let e=DE(2);ov(),Ap(e.t.common.empty);}}function St(o,a){if(o&1&&(ii(0,"li",12),KE(1),mc()),o&2){let e=a.$implicit,t=DE(3);ov(),Pp(" ",t.plateOf(e.vehicleId),"\uFF5C",t.customerStore.nameOf(e.customerId),"\uFF5C ",t.fmt(e.startTime)," \u2192 ",t.fmt(e.endTime),"\uFF5C",t.t.booking.statusLabels[e.status]," ");}}function Ct(o,a){if(o&1&&(ii(0,"ul",11),dE(1,St,2,5,"li",12,xt),mc()),o&2){let e=DE(),t=DE();ov(),fE(t.dayBookings(e));}}function It(o,a){if(o&1&&(ii(0,"div",5)(1,"h2",9),KE(2),mc(),aE(3,Tt,2,1,"p",10)(4,Ct,3,0,"ul",11),mc()),o&2){let e=a,t=DE();ov(2),kp("",t.t.dispatch.dayDetail,"\uFF08",e.getMonth()+1,"/",e.getDate(),"\uFF09"),ov(),cE(t.dayBookings(e).length===0?3:4);}}var wt=["confirmed","in_progress"];function Dt(o$1,a$1,e){let t=o$1.filter(f=>wt.includes(f.status)),n=a(e),s=o(n,1),g=t.filter(f=>u$1(new Date(f.startTime),e)).length,b=t.filter(f=>u$1(new Date(f.endTime),e)).length,h=new Set(t.filter(f=>new Date(f.startTime)<s&&new Date(f.endTime)>n).map(f=>f.vehicleId));return {pickups:g,returns:b,available:a$1-h.size}}var J=class o$1{t=aF;bookingStore=T(f);vehicleStore=T(p);customerStore=T(n);fmt=g;isSameDay=u$1;month=So(new Date(new Date().getFullYear(),new Date().getMonth(),1));selected=So(null);todayDate=new Date;monthLabel=dD(()=>`${this.month().getFullYear()} / ${this.month().getMonth()+1}`);monthDays=dD(()=>{let a=this.month(),e=o(a,-a.getDay());return Array.from({length:42},(t,n)=>o(e,n))});shiftMonth(a){let e=this.month();this.month.set(new Date(e.getFullYear(),e.getMonth()+a,1)),this.selected.set(null);}statsOf(a){return Dt(this.bookingStore.bookings(),this.vehicleStore.vehicles().length,a)}dayBookings(a$1){let e=a(a$1),t=o(e,1);return this.bookingStore.bookings().filter(n=>n.status==="confirmed"||n.status==="in_progress").filter(n=>new Date(n.startTime)<t&&new Date(n.endTime)>e)}plateOf(a){return this.vehicleStore.vehicles().find(e=>e.id===a)?.plateNumber??"\u2014"}static \u0275fac=function(e){return new(e||o$1)};static \u0275cmp=FI({type:o$1,selectors:[["app-calendar-view"]],decls:11,vars:4,consts:[[1,"flex","items-center","gap-2","mb-2"],["mat-button","",3,"click"],[1,"font-bold"],[1,"grid","grid-cols-7","gap-px","text-xs","rounded-lg","overflow-hidden",2,"background","var(--border-subtle)"],[1,"p-2","min-h-16","text-left","cursor-pointer","transition-colors","hover:[background:var(--surface-pill)]",2,"background","var(--surface-card)",3,"opacity-40","background"],[1,"mt-4"],[1,"p-2","min-h-16","text-left","cursor-pointer","transition-colors","hover:[background:var(--surface-pill)]",2,"background","var(--surface-card)",3,"click"],[2,"color","var(--text-secondary)"],[2,"color","var(--text-tertiary)"],[1,"font-bold","mb-2"],[1,"text-sm",2,"color","var(--text-tertiary)"],[1,"text-sm","flex","flex-col","gap-1"],[1,"v-card","!p-3"]],template:function(e,t){if(e&1&&(ii(0,"div",0)(1,"button",1),yp("click",function(){return t.shiftMonth(-1)}),KE(2),mc(),ii(3,"span",2),KE(4),mc(),ii(5,"button",1),yp("click",function(){return t.shiftMonth(1)}),KE(6),mc()(),ii(7,"div",3),dE(8,kt,7,13,"button",4,yt),mc(),aE(10,It,5,4,"div",5)),e&2){let n;ov(2),Ap(t.t.dispatch.prevMonth),ov(2),Ap(t.monthLabel()),ov(2),Ap(t.t.dispatch.nextMonth),ov(2),fE(t.monthDays()),ov(2),cE((n=t.selected())?10:-1,n);}},dependencies:[Fu,Ou],encapsulation:2})};function Mt(o,a){o&1&&dp(0,"app-timeline-view");}function Et(o,a){o&1&&dp(0,"app-calendar-view");}var Xe=class o{t=aF;route=T(G);router=T(ce);view=Qe(this.route.queryParamMap.pipe(Ue(a=>a.get("view")==="calendar"?"calendar":"timeline")),{initialValue:"timeline"});setView(a){this.router.navigate([],{relativeTo:this.route,queryParams:{view:a},queryParamsHandling:"merge"});}static \u0275fac=function(e){return new(e||o)};static \u0275cmp=FI({type:o,selectors:[["app-dispatch-page"]],decls:11,vars:5,consts:[[1,"pt-6","flex","flex-col","gap-5"],[1,"flex","items-center","justify-between","flex-wrap","gap-2"],[1,"v-page-title"],[3,"change","value"],["value","timeline"],["value","calendar"]],template:function(e,t){e&1&&(ii(0,"div",0)(1,"div",1)(2,"h1",2),KE(3),mc(),ii(4,"mat-button-toggle-group",3),yp("change",function(s){return t.setView(s.value)}),ii(5,"mat-button-toggle",4),KE(6),mc(),ii(7,"mat-button-toggle",5),KE(8),mc()()(),aE(9,Mt,1,0,"app-timeline-view")(10,Et,1,0,"app-calendar-view"),mc()),e&2&&(ov(3),Ap(t.t.dispatch.title),ov(),up("value",t.view()),ov(2),Ap(t.t.dispatch.timeline),ov(2),Ap(t.t.dispatch.calendar),ov(),cE(t.view()==="timeline"?9:10));},dependencies:[Ke,le,Z,K,J],encapsulation:2})};export{Xe as DispatchPageComponent};
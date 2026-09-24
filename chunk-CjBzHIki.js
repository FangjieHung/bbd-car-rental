import {k,H}from'./chunk-BPzI7628.js';import {d}from'./chunk-CwDLuQoh.js';import {s as se,F as F$1,Z as Ze,_ as _e,v as ve,H as He}from'./chunk-BHu089Sz.js';import {b,E,F}from'./chunk-BuVca2L1.js';import {s as s$1}from'./chunk-kAIVVhKw.js';import {G as GP,v,i as a,C as Ce,j as B,F as Fo,l as eC,m as mE,o as s,n as nl,t as tl,q as jn,d as di$1,r as fp,_ as _p,R as Rc,B as Bv,D as Dp,w as i,x as l,y as b$1,M as MI,U as Up,z as Be,A as fP,E as dP,H as pP,I as zt$2,K as we,N as o,T as Ml,V as NP,W as nC,X as D$1,Y as l$1,Z as m,$ as Ae,a0 as gi$1,a1 as Ct,a2 as VE,h as vp,P as Pp,a3 as BE,a4 as ip,a5 as ms,a6 as ni$1,a7 as gt$1,a8 as Ne,a9 as Rn,aa as jc,ab as Lf,ac as ye,ad as Yt,ae as Ar$1,af as Pe,ag as S$1,ah as H$1,ai as lt,aj as Mc,ak as DP,Q as QE,s as sl,J as JE,f as al,L as Lc,al as $I,am as Re,b as UE,an as Ep,e as GE,ao as st,ap as mC,aq as $e$1,ar as $r$1,as as ih,at as Td,au as m$1,av as Qa$1,aw as eI,ax as tI,ay as sI,az as HI,aA as po,aB as EP,aC as wp,aD as yI,aE as xp,aF as rI,aG as oI,aH as _n,aI as Ii$1,aJ as xd,aK as lp,aL as On,aM as J,aN as L,aO as pp,aP as Np,aQ as Y,aR as Ko,aS as w,aT as Ag,aU as Eg,aV as Bo,aW as Fi$1,aX as $E,aY as yp,aZ as Fp,a_ as se$1,a$ as hP,b0 as Le,b1 as wt,b2 as Xy,b3 as Rp,b4 as iI,b5 as f,b6 as s$2,b7 as oh,b8 as HE,b9 as Qp,ba as kI,bb as Yt$1,bc as vl,bd as Hs,be as _i,bf as ie,bg as mv,bh as ce$2,O as Oc,S as Sp,k as kc,bi as FI,bj as Gp,bk as F$2,bl as sg,bm as bg,bn as Og,bo as Zt,bp as Dt,bq as Rg,br as M,bs as Zc,bt as kn,bu as Or$1,bv as Vn,bw as PI,bx as tf}from'./main-75DZX6EX.js';import'./chunk-DPdLMF14.js';import'./chunk-B5d8Wyso.js';import {g}from'./chunk-Bp_G63OB.js';import {p}from'./chunk-Izk0NL_T.js';import {i as i$1}from'./chunk-BNi7JZ09.js';import {D,I}from'./chunk-D0YGezDV.js';import {T}from'./chunk-Bkc-yUjI.js';import {j}from'./chunk-CD3WURtk.js';import {a as at,c as ce,S}from'./chunk-CA9EEeQT.js';import {q as qt$1,z as zt$3}from'./chunk-3Sd-6Sel.js';import {e as ee,H as Ht$1,j as jt$1,N as Nt$1,z as zt$1,V as Vt$1,$ as $e,O}from'./chunk-BL11I4KC.js';import {c as ce$1,r as rt,a as ae,l as ln,b as an,Q as Qe}from'./chunk-oxE4iUvs.js';import {Q,m as m$2}from'./chunk-CWUOc4J_.js';var Ba=new S$1("MAT_BADGE_CONFIG"),ua="mat-badge-content",Aa=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mE({type:i,selectors:[["ng-component"]],decls:0,vars:0,template:function(t,a){},styles:[`.mat-badge {
  position: relative;
}
.mat-badge.mat-badge {
  overflow: visible;
}

.mat-badge-content {
  position: absolute;
  text-align: center;
  display: inline-block;
  transition: transform 200ms ease-in-out;
  transform: scale(0.6);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
  pointer-events: none;
  background-color: var(--mat-badge-background-color, var(--mat-sys-error));
  color: var(--mat-badge-text-color, var(--mat-sys-on-error));
  font-family: var(--mat-badge-text-font, var(--mat-sys-label-small-font));
  font-weight: var(--mat-badge-text-weight, var(--mat-sys-label-small-weight));
  border-radius: var(--mat-badge-container-shape, var(--mat-sys-corner-full));
}
.mat-badge-above .mat-badge-content {
  bottom: 100%;
}
.mat-badge-below .mat-badge-content {
  top: 100%;
}
.mat-badge-before .mat-badge-content {
  right: 100%;
}
[dir=rtl] .mat-badge-before .mat-badge-content {
  right: auto;
  left: 100%;
}
.mat-badge-after .mat-badge-content {
  left: 100%;
}
[dir=rtl] .mat-badge-after .mat-badge-content {
  left: auto;
  right: 100%;
}
@media (forced-colors: active) {
  .mat-badge-content {
    outline: solid 1px;
    border-radius: 0;
  }
}

.mat-badge-disabled .mat-badge-content {
  background-color: var(--mat-badge-disabled-state-background-color, color-mix(in srgb, var(--mat-sys-error) 38%, transparent));
  color: var(--mat-badge-disabled-state-text-color, var(--mat-sys-on-error));
}

.mat-badge-hidden .mat-badge-content {
  display: none;
}

.ng-animate-disabled .mat-badge-content,
.mat-badge-content._mat-animation-noopable {
  transition: none;
}

.mat-badge-content.mat-badge-active {
  transform: none;
}

.mat-badge-small .mat-badge-content {
  width: var(--mat-badge-legacy-small-size-container-size, unset);
  height: var(--mat-badge-legacy-small-size-container-size, unset);
  min-width: var(--mat-badge-small-size-container-size, 6px);
  min-height: var(--mat-badge-small-size-container-size, 6px);
  line-height: var(--mat-badge-small-size-line-height, 6px);
  padding: var(--mat-badge-small-size-container-padding, 0);
  font-size: var(--mat-badge-small-size-text-size, 0);
  margin: var(--mat-badge-small-size-container-offset, -6px 0);
}
.mat-badge-small.mat-badge-overlap .mat-badge-content {
  margin: var(--mat-badge-small-size-container-overlap-offset, -6px);
}

.mat-badge-medium .mat-badge-content {
  width: var(--mat-badge-legacy-container-size, unset);
  height: var(--mat-badge-legacy-container-size, unset);
  min-width: var(--mat-badge-container-size, 16px);
  min-height: var(--mat-badge-container-size, 16px);
  line-height: var(--mat-badge-line-height, 16px);
  padding: var(--mat-badge-container-padding, 0 4px);
  font-size: var(--mat-badge-text-size, var(--mat-sys-label-small-size));
  margin: var(--mat-badge-container-offset, -12px 0);
}
.mat-badge-medium.mat-badge-overlap .mat-badge-content {
  margin: var(--mat-badge-container-overlap-offset, -12px);
}

.mat-badge-large .mat-badge-content {
  width: var(--mat-badge-legacy-large-size-container-size, unset);
  height: var(--mat-badge-legacy-large-size-container-size, unset);
  min-width: var(--mat-badge-large-size-container-size, 16px);
  min-height: var(--mat-badge-large-size-container-size, 16px);
  line-height: var(--mat-badge-large-size-line-height, 16px);
  padding: var(--mat-badge-large-size-container-padding, 0 4px);
  font-size: var(--mat-badge-large-size-text-size, var(--mat-sys-label-small-size));
  margin: var(--mat-badge-large-size-container-offset, -12px 0);
}
.mat-badge-large.mat-badge-overlap .mat-badge-content {
  margin: var(--mat-badge-large-size-container-overlap-offset, -12px);
}
`],encapsulation:2})}return i})(),ha=(()=>{class i{_ngZone=v(Ne);_elementRef=v(Rn);_ariaDescriber=v(jc);_renderer=v(Lf);_animationsDisabled=ye();_idGenerator=v(Yt);get color(){return this._color}set color(e){this._setColor(e),this._color=e;}_color;overlap;disabled=false;position;get content(){return this._content}set content(e){this._updateRenderedContent(e);}_content;get description(){return this._description}set description(e){this._updateDescription(e);}_description;size;hidden=false;_badgeElement;_inlineBadgeDescription;_isInitialized=false;_interactivityChecker=v(Ar$1);_document=v(Pe);constructor(){let e=v(Ba,{optional:true}),t=v(H$1);t.load(Aa),t.load(lt),this._color=e?.color||"primary",this.overlap=e?.overlap??true,this.position=e?.position||"above after",this.size=e?.size||"medium";}isAbove(){return this.position.indexOf("below")===-1}isAfter(){return this.position.indexOf("before")===-1}getBadgeElement(){return this._badgeElement}ngOnInit(){this._clearExistingBadges(),this.content&&!this._badgeElement&&(this._badgeElement=this._createBadgeElement(),this._updateRenderedContent(this.content)),this._isInitialized=true;}ngAfterViewInit(){}ngOnDestroy(){this._renderer.destroyNode&&(this._renderer.destroyNode(this._badgeElement),this._inlineBadgeDescription?.remove()),this._ariaDescriber.removeDescription(this._elementRef.nativeElement,this.description);}_isHostInteractive(){return this._interactivityChecker.isFocusable(this._elementRef.nativeElement,{ignoreVisibility:true})}_createBadgeElement(){let e=this._renderer.createElement("span"),t="mat-badge-active";return e.setAttribute("id",this._idGenerator.getId("mat-badge-content-")),e.setAttribute("aria-hidden","true"),e.classList.add(ua),this._animationsDisabled&&e.classList.add("_mat-animation-noopable"),this._elementRef.nativeElement.appendChild(e),typeof requestAnimationFrame=="function"&&!this._animationsDisabled?this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>{e.classList.add(t);});}):e.classList.add(t),e}_updateRenderedContent(e){let t=`${e??""}`.trim();this._isInitialized&&t&&!this._badgeElement&&(this._badgeElement=this._createBadgeElement()),this._badgeElement&&(this._badgeElement.textContent=t),this._content=t;}_updateDescription(e){this._ariaDescriber.removeDescription(this._elementRef.nativeElement,this.description),(!e||this._isHostInteractive())&&this._removeInlineDescription(),this._description=e,this._isHostInteractive()?this._ariaDescriber.describe(this._elementRef.nativeElement,e):this._updateInlineDescription();}_updateInlineDescription(){this._inlineBadgeDescription||(this._inlineBadgeDescription=this._document.createElement("span"),this._inlineBadgeDescription.classList.add("cdk-visually-hidden")),this._inlineBadgeDescription.textContent=this.description,this._badgeElement?.appendChild(this._inlineBadgeDescription);}_removeInlineDescription(){this._inlineBadgeDescription?.remove(),this._inlineBadgeDescription=void 0;}_setColor(e){let t=this._elementRef.nativeElement.classList;t.remove(`mat-badge-${this._color}`),e&&t.add(`mat-badge-${e}`);}_clearExistingBadges(){let e=this._elementRef.nativeElement.querySelectorAll(`:scope > .${ua}`);for(let t of Array.from(e))t!==this._badgeElement&&t.remove();}static \u0275fac=function(t){return new(t||i)};static \u0275dir=Mc({type:i,selectors:[["","matBadge",""]],hostAttrs:[1,"mat-badge"],hostVars:20,hostBindings:function(t,a){t&2&&Pp("mat-badge-overlap",a.overlap)("mat-badge-above",a.isAbove())("mat-badge-below",!a.isAbove())("mat-badge-before",!a.isAfter())("mat-badge-after",a.isAfter())("mat-badge-small",a.size==="small")("mat-badge-medium",a.size==="medium")("mat-badge-large",a.size==="large")("mat-badge-hidden",a.hidden||!a.content)("mat-badge-disabled",a.disabled);},inputs:{color:[0,"matBadgeColor","color"],overlap:[2,"matBadgeOverlap","overlap",DP],disabled:[2,"matBadgeDisabled","disabled",DP],position:[0,"matBadgePosition","position"],content:[0,"matBadge","content"],description:[0,"matBadgeDescription","description"],size:[0,"matBadgeSize","size"],hidden:[2,"matBadgeHidden","hidden",DP]}})}return i})(),_a=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=ip({type:i});static \u0275inj=ms({imports:[ni$1,gt$1]})}return i})();var Va=["switch"],Fa=["*"];function za(i,n){i&1&&(di$1(0,"span",11),vl(),di$1(1,"svg",13),Ep(2,"path",14),Rc(),di$1(3,"svg",15),Ep(4,"path",16),Rc()());}var Wa=new S$1("mat-slide-toggle-default-options",{providedIn:"root",factory:()=>({disableToggleValue:false,hideIcon:false,disabledInteractive:false})}),ct=class{source;checked;constructor(n,e){this.source=n,this.checked=e;}},Bt=(()=>{class i{_elementRef=v(Rn);_focusMonitor=v(st);_changeDetectorRef=v(mC);defaults=v(Wa);_onChange=e=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=false;_createChangeEvent(e){return new ct(this,e)}_labelId;get buttonId(){return `${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus();}_noopAnimations=ye();_focused=false;name=null;id;labelPosition="after";ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=false;color;disabled=false;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked=e,this._changeDetectorRef.markForCheck();}hideIcon;disabledInteractive;change=new $e$1;toggleChange=new $e$1;get inputId(){return `${this.id||this._uniqueId}-input`}constructor(){v(H$1).load($r$1);let e=v(new ih("tabindex"),{optional:true}),t=this.defaults;this.tabIndex=e==null?0:parseInt(e)||0,this.color=t.color||"accent",this.id=this._uniqueId=v(Yt).getId("mat-mdc-slide-toggle-"),this.hideIcon=t.hideIcon??false,this.disabledInteractive=t.disabledInteractive??false,this._labelId=this._uniqueId+"-label";}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{e==="keyboard"||e==="program"?(this._focused=true,this._changeDetectorRef.markForCheck()):e||Promise.resolve().then(()=>{this._focused=false,this._onTouched(),this._changeDetectorRef.markForCheck();});});}ngOnChanges(e){e.required&&this._validatorOnChange();}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef);}writeValue(e){this.checked=!!e;}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorOnChange=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck();}toggle(){this.checked=!this.checked,this._onChange(this.checked);}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked));}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new ct(this,this.checked))));}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mE({type:i,selectors:[["mat-slide-toggle"]],viewQuery:function(t,a){if(t&1&&xp(Va,5),t&2){let o;rI(o=oI())&&(a._switchElement=o.first);}},hostAttrs:[1,"mat-mdc-slide-toggle"],hostVars:13,hostBindings:function(t,a){t&2&&(wp("id",a.id),vp("tabindex",null)("aria-label",null)("name",null)("aria-labelledby",null),yI(a.color?"mat-"+a.color:""),Pp("mat-mdc-slide-toggle-focused",a._focused)("mat-mdc-slide-toggle-checked",a.checked)("_mat-animation-noopable",a._noopAnimations));},inputs:{name:"name",id:"id",labelPosition:"labelPosition",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],required:[2,"required","required",DP],color:"color",disabled:[2,"disabled","disabled",DP],disableRipple:[2,"disableRipple","disableRipple",DP],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:EP(e)],checked:[2,"checked","checked",DP],hideIcon:[2,"hideIcon","hideIcon",DP],disabledInteractive:[2,"disabledInteractive","disabledInteractive",DP]},outputs:{change:"change",toggleChange:"toggleChange"},exportAs:["matSlideToggle"],features:[HI([{provide:Q,useExisting:po(()=>i),multi:true},{provide:m$2,useExisting:i,multi:true}]),Qa$1],ngContentSelectors:Fa,decls:14,vars:27,consts:[["switch",""],["mat-internal-form-field","",3,"labelPosition"],["role","switch","type","button",1,"mdc-switch",3,"click","tabIndex","disabled"],[1,"mat-mdc-slide-toggle-touch-target"],[1,"mdc-switch__track"],[1,"mdc-switch__handle-track"],[1,"mdc-switch__handle"],[1,"mdc-switch__shadow"],[1,"mdc-elevation-overlay"],[1,"mdc-switch__ripple"],["mat-ripple","",1,"mat-mdc-slide-toggle-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-switch__icons"],[1,"mdc-label",3,"click","for"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--on"],["d","M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"],["viewBox","0 0 24 24","aria-hidden","true",1,"mdc-switch__icon","mdc-switch__icon--off"],["d","M20 13H4v-2h16v2z"]],template:function(t,a){if(t&1&&(eI(),di$1(0,"div",1)(1,"button",2,0),_p("click",function(){return a._handleClick()}),Ep(3,"div",3)(4,"span",4),di$1(5,"span",5)(6,"span",6)(7,"span",7),Ep(8,"span",8),Rc(),di$1(9,"span",9),Ep(10,"span",10),Rc(),VE(11,za,5,0,"span",11),Rc()()(),di$1(12,"label",12),_p("click",function(u){return u.stopPropagation()}),tI(13),Rc()()),t&2){let o=sI(2);Dp("labelPosition",a.labelPosition),Bv(),Pp("mdc-switch--selected",a.checked)("mdc-switch--unselected",!a.checked)("mdc-switch--checked",a.checked)("mdc-switch--disabled",a.disabled)("mat-mdc-slide-toggle-disabled-interactive",a.disabledInteractive),Dp("tabIndex",a.disabled&&!a.disabledInteractive?-1:a.tabIndex)("disabled",a.disabled&&!a.disabledInteractive),vp("id",a.buttonId)("name",a.name)("aria-label",a.ariaLabel)("aria-labelledby",a._getAriaLabelledBy())("aria-describedby",a.ariaDescribedby)("aria-required",a.required||null)("aria-checked",a.checked)("aria-disabled",a.disabled&&a.disabledInteractive?"true":null),Bv(9),Dp("matRippleTrigger",o)("matRippleDisabled",a.disableRipple||a.disabled)("matRippleCentered",true),Bv(),BE(a.hideIcon?-1:11),Bv(),Dp("for",a.buttonId),vp("id",a._labelId);}},dependencies:[Td,m$1],styles:[`.mdc-switch {
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 0;
  position: relative;
  width: var(--mat-slide-toggle-track-width, 52px);
}
.mdc-switch.mdc-switch--disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-switch.mat-mdc-slide-toggle-disabled-interactive {
  pointer-events: auto;
}

.mdc-switch__track {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: var(--mat-slide-toggle-track-height, 32px);
  border-radius: var(--mat-slide-toggle-track-shape, var(--mat-sys-corner-full));
}
.mdc-switch--disabled.mdc-switch .mdc-switch__track {
  opacity: var(--mat-slide-toggle-disabled-track-opacity, 0.12);
}
.mdc-switch__track::before, .mdc-switch__track::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  height: 100%;
  left: 0;
  position: absolute;
  width: 100%;
  border-width: var(--mat-slide-toggle-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-track-outline-color, var(--mat-sys-outline));
}
.mdc-switch--selected .mdc-switch__track::before, .mdc-switch--selected .mdc-switch__track::after {
  border-width: var(--mat-slide-toggle-selected-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-selected-track-outline-color, transparent);
}
.mdc-switch--disabled .mdc-switch__track::before, .mdc-switch--disabled .mdc-switch__track::after {
  border-width: var(--mat-slide-toggle-disabled-unselected-track-outline-width, 2px);
  border-color: var(--mat-slide-toggle-disabled-unselected-track-outline-color, var(--mat-sys-on-surface));
}
@media (forced-colors: active) {
  .mdc-switch__track {
    border-color: currentColor;
  }
}
.mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: translateX(0);
  background: var(--mat-slide-toggle-unselected-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch--selected .mdc-switch__track::before {
  transform: translateX(-100%);
}
.mdc-switch--selected .mdc-switch__track::before {
  opacity: var(--mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::before {
  opacity: var(--mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-hover-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-focus-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch:enabled:active .mdc-switch__track::before {
  background: var(--mat-slide-toggle-unselected-pressed-track-color, var(--mat-sys-surface-variant));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__track::before, .mdc-switch.mdc-switch--disabled .mdc-switch__track::before {
  background: var(--mat-slide-toggle-disabled-unselected-track-color, var(--mat-sys-surface-variant));
}
.mdc-switch__track::after {
  transform: translateX(-100%);
  background: var(--mat-slide-toggle-selected-track-color, var(--mat-sys-primary));
}
[dir=rtl] .mdc-switch__track::after {
  transform: translateX(100%);
}
.mdc-switch--selected .mdc-switch__track::after {
  transform: translateX(0);
}
.mdc-switch--selected .mdc-switch__track::after {
  opacity: var(--mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::after {
  opacity: var(--mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-hover-track-color, var(--mat-sys-primary));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-focus-track-color, var(--mat-sys-primary));
}
.mdc-switch:enabled:active .mdc-switch__track::after {
  background: var(--mat-slide-toggle-selected-pressed-track-color, var(--mat-sys-primary));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__track::after, .mdc-switch.mdc-switch--disabled .mdc-switch__track::after {
  background: var(--mat-slide-toggle-disabled-selected-track-color, var(--mat-sys-on-surface));
}

.mdc-switch__handle-track {
  height: 100%;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  left: 0;
  right: auto;
  transform: translateX(0);
  width: calc(100% - var(--mat-slide-toggle-handle-width));
}
[dir=rtl] .mdc-switch__handle-track {
  left: auto;
  right: 0;
}
.mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(-100%);
}

.mdc-switch__handle {
  display: flex;
  pointer-events: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: auto;
  transition: width 75ms cubic-bezier(0.4, 0, 0.2, 1), height 75ms cubic-bezier(0.4, 0, 0.2, 1), margin 75ms cubic-bezier(0.4, 0, 0.2, 1);
  width: var(--mat-slide-toggle-handle-width);
  height: var(--mat-slide-toggle-handle-height);
  border-radius: var(--mat-slide-toggle-handle-shape, var(--mat-sys-corner-full));
}
[dir=rtl] .mdc-switch__handle {
  left: auto;
  right: 0;
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle {
  width: var(--mat-slide-toggle-unselected-handle-size, 16px);
  height: var(--mat-slide-toggle-unselected-handle-size, 16px);
  margin: var(--mat-slide-toggle-unselected-handle-horizontal-margin, 0 8px);
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin, 0 4px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle {
  width: var(--mat-slide-toggle-selected-handle-size, 24px);
  height: var(--mat-slide-toggle-selected-handle-size, 24px);
  margin: var(--mat-slide-toggle-selected-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--mat-slide-toggle-selected-with-icon-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch__handle:has(.mdc-switch__icons) {
  width: var(--mat-slide-toggle-with-icon-handle-size, 24px);
  height: var(--mat-slide-toggle-with-icon-handle-size, 24px);
}
.mat-mdc-slide-toggle .mdc-switch:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  width: var(--mat-slide-toggle-pressed-handle-size, 28px);
  height: var(--mat-slide-toggle-pressed-handle-size, 28px);
}
.mat-mdc-slide-toggle .mdc-switch--selected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--mat-slide-toggle-selected-pressed-handle-horizontal-margin, 0 22px);
}
.mat-mdc-slide-toggle .mdc-switch--unselected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--mat-slide-toggle-unselected-pressed-handle-horizontal-margin, 0 2px);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__handle::after {
  opacity: var(--mat-slide-toggle-disabled-selected-handle-opacity, 1);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__handle::after {
  opacity: var(--mat-slide-toggle-disabled-unselected-handle-opacity, 0.38);
}
.mdc-switch__handle::before, .mdc-switch__handle::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  width: 100%;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transition: background-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1), border-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}
@media (forced-colors: active) {
  .mdc-switch__handle::before, .mdc-switch__handle::after {
    border-color: currentColor;
  }
}
.mdc-switch--selected:enabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-handle-color, var(--mat-sys-on-primary));
}
.mdc-switch--selected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-hover-handle-color, var(--mat-sys-primary-container));
}
.mdc-switch--selected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-focus-handle-color, var(--mat-sys-primary-container));
}
.mdc-switch--selected:enabled:active .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-selected-pressed-handle-color, var(--mat-sys-primary-container));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:hover:not(:focus):not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:focus:not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--selected:active .mdc-switch__handle::after, .mdc-switch--selected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-disabled-selected-handle-color, var(--mat-sys-surface));
}
.mdc-switch--unselected:enabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-handle-color, var(--mat-sys-outline));
}
.mdc-switch--unselected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-hover-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-focus-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected:enabled:active .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-unselected-pressed-handle-color, var(--mat-sys-on-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--mat-slide-toggle-disabled-unselected-handle-color, var(--mat-sys-on-surface));
}
.mdc-switch__handle::before {
  background: var(--mat-slide-toggle-handle-surface-color);
}

.mdc-switch__shadow {
  border-radius: inherit;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}
.mdc-switch:enabled .mdc-switch__shadow {
  box-shadow: var(--mat-slide-toggle-handle-elevation-shadow);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:hover:not(:focus):not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:focus:not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:active .mdc-switch__shadow, .mdc-switch.mdc-switch--disabled .mdc-switch__shadow {
  box-shadow: var(--mat-slide-toggle-disabled-handle-elevation-shadow);
}

.mdc-switch__ripple {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  width: var(--mat-slide-toggle-state-layer-size, 40px);
  height: var(--mat-slide-toggle-state-layer-size, 40px);
}
.mdc-switch__ripple::after {
  content: "";
  opacity: 0;
}
.mdc-switch--disabled .mdc-switch__ripple::after {
  display: none;
}
.mat-mdc-slide-toggle-disabled-interactive .mdc-switch__ripple::after {
  display: block;
}
.mdc-switch:hover .mdc-switch__ripple::after {
  transition: 75ms opacity cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:focus .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:active .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled:enabled:hover:not(:focus) .mdc-switch__ripple::after, .mdc-switch--unselected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mdc-switch--unselected:enabled:focus .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mdc-switch--unselected:enabled:active .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-unselected-pressed-state-layer-color, var(--mat-sys-on-surface));
  opacity: var(--mat-slide-toggle-unselected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}
.mdc-switch--selected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-hover-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mdc-switch--selected:enabled:focus .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-focus-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mdc-switch--selected:enabled:active .mdc-switch__ripple::after {
  background: var(--mat-slide-toggle-selected-pressed-state-layer-color, var(--mat-sys-primary));
  opacity: var(--mat-slide-toggle-selected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}

.mdc-switch__icons {
  position: relative;
  height: 100%;
  width: 100%;
  z-index: 1;
  transform: translateZ(0);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__icons {
  opacity: var(--mat-slide-toggle-disabled-unselected-icon-opacity, 0.38);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__icons {
  opacity: var(--mat-slide-toggle-disabled-selected-icon-opacity, 0.38);
}

.mdc-switch__icon {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0;
  transition: opacity 30ms 0ms cubic-bezier(0.4, 0, 1, 1);
}
.mdc-switch--unselected .mdc-switch__icon {
  width: var(--mat-slide-toggle-unselected-icon-size, 16px);
  height: var(--mat-slide-toggle-unselected-icon-size, 16px);
  fill: var(--mat-slide-toggle-unselected-icon-color, var(--mat-sys-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--mat-slide-toggle-disabled-unselected-icon-color, var(--mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__icon {
  width: var(--mat-slide-toggle-selected-icon-size, 16px);
  height: var(--mat-slide-toggle-selected-icon-size, 16px);
  fill: var(--mat-slide-toggle-selected-icon-color, var(--mat-sys-on-primary-container));
}
.mdc-switch--selected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--mat-slide-toggle-disabled-selected-icon-color, var(--mat-sys-on-surface));
}

.mdc-switch--selected .mdc-switch__icon--on,
.mdc-switch--unselected .mdc-switch__icon--off {
  opacity: 1;
  transition: opacity 45ms 30ms cubic-bezier(0, 0, 0.2, 1);
}

.mat-mdc-slide-toggle {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  -webkit-tap-highlight-color: transparent;
  outline: 0;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple,
.mat-mdc-slide-toggle .mdc-switch__ripple::after {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple:not(:empty),
.mat-mdc-slide-toggle .mdc-switch__ripple::after:not(:empty) {
  transform: translateZ(0);
}
.mat-mdc-slide-toggle.mat-mdc-slide-toggle-focused .mat-focus-indicator::before {
  content: "";
}
.mat-mdc-slide-toggle .mat-internal-form-field {
  color: var(--mat-slide-toggle-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-slide-toggle-label-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-slide-toggle-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-slide-toggle-label-text-size, var(--mat-sys-body-medium-size));
  letter-spacing: var(--mat-slide-toggle-label-text-tracking, var(--mat-sys-body-medium-tracking));
  font-weight: var(--mat-slide-toggle-label-text-weight, var(--mat-sys-body-medium-weight));
}
.mat-mdc-slide-toggle .mat-ripple-element {
  opacity: 0.12;
}
.mat-mdc-slide-toggle .mat-focus-indicator::before {
  border-radius: 50%;
}
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle-track,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__icon,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::after,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::after {
  transition: none;
}
.mat-mdc-slide-toggle .mdc-switch:enabled + .mdc-label {
  cursor: pointer;
}
.mat-mdc-slide-toggle .mdc-switch--disabled + label {
  color: var(--mat-slide-toggle-disabled-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-slide-toggle label:empty {
  display: none;
}

.mat-mdc-slide-toggle-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--mat-slide-toggle-touch-target-size, 48px);
  width: 100%;
  transform: translate(-50%, -50%);
  display: var(--mat-slide-toggle-touch-target-display, block);
}
[dir=rtl] .mat-mdc-slide-toggle-touch-target {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}
`],encapsulation:2})}return i})(),ba=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=ip({type:i});static \u0275inj=ms({imports:[Bt,gt$1]})}return i})();var Wt=["*"];function ja(i,n){i&1&&tI(0);}var Qa=["tabListContainer"],Ga=["tabList"],Ka=["tabListInner"],Ua=["nextPaginator"],Ya=["previousPaginator"],Za=["content"];function Xa(i,n){}var Ja=["tabBodyWrapper"],ei=["tabHeader"];function ti(i,n){}function ni(i,n){if(i&1&&fp(0,ti,0,0,"ng-template",12),i&2){let e=JE().$implicit;Dp("cdkPortalOutlet",e.templateLabel);}}function ai(i,n){if(i&1&&MI(0),i&2){let e=JE().$implicit;Up(e.textLabel);}}function ii(i,n){if(i&1){let e=QE();di$1(0,"div",7,2),_p("click",function(){let a=sl(e),o=a.$implicit,u=a.$index,D=JE(),k=sI(1);return al(D._handleClick(o,k,u))})("cdkFocusChange",function(a){let o=sl(e).$index,u=JE();return al(u._tabFocusChanged(a,o))}),Ep(2,"span",8)(3,"div",9),di$1(4,"span",10)(5,"span",11),VE(6,ni,1,1,null,12)(7,ai,1,1),Rc()()();}if(i&2){let e=n.$implicit,t=n.$index,a=sI(1),o=JE();yI(e.labelClass),Pp("mdc-tab--active",o.selectedIndex===t),Dp("id",o._getTabLabelId(e,t))("disabled",e.disabled)("fitInkBarToContent",o.fitInkBarToContent),vp("tabIndex",o._getTabIndex(t))("aria-posinset",t+1)("aria-setsize",o._tabs.length)("aria-controls",o._getTabContentId(t))("aria-selected",o.selectedIndex===t)("aria-label",e.ariaLabel||null)("aria-labelledby",!e.ariaLabel&&e.ariaLabelledby?e.ariaLabelledby:null),Bv(3),Dp("matRippleTrigger",a)("matRippleDisabled",e.disabled||o.disableRipple),Bv(3),BE(e.templateLabel?6:7);}}function ri(i,n){i&1&&tI(0);}function oi(i,n){if(i&1){let e=QE();di$1(0,"mat-tab-body",13),_p("_onCentered",function(){sl(e);let a=JE();return al(a._removeTabBodyWrapperHeight())})("_onCentering",function(a){sl(e);let o=JE();return al(o._setTabBodyWrapperHeight(a))})("_beforeCentering",function(a){sl(e);let o=JE();return al(o._bodyCentered(a))}),Rc();}if(i&2){let e=n.$implicit,t=n.$index,a=JE();yI(e.bodyClass),Dp("id",a._getTabContentId(t))("content",e.content)("position",e.position)("animationDuration",a._bodyAnimationDuration)("preserveContent",a.preserveContent),vp("tabindex",a.contentTabIndex!=null&&a.selectedIndex===t?a.contentTabIndex:null)("aria-labelledby",a._getTabLabelId(e,t))("aria-hidden",a.selectedIndex!==t);}}var si=new S$1("MatTabContent"),Ht=(()=>{class i{template=v(_n);static \u0275fac=function(t){return new(t||i)};static \u0275dir=Mc({type:i,selectors:[["","matTabContent",""]],features:[HI([{provide:si,useExisting:i}])]})}return i})(),li=new S$1("MatTabLabel"),ya=new S$1("MAT_TAB"),$t=(()=>{class i extends Ii$1{_closestTab=v(ya,{optional:true});static \u0275fac=(()=>{let e;return function(a){return (e||(e=xd(i)))(a||i)}})();static \u0275dir=Mc({type:i,selectors:[["","mat-tab-label",""],["","matTabLabel",""]],features:[HI([{provide:li,useExisting:i}]),lp]})}return i})(),wa=new S$1("MAT_TAB_GROUP"),qt=(()=>{class i{_viewContainerRef=v(On);_closestTabGroup=v(wa,{optional:true});disabled=false;get templateLabel(){return this._templateLabel}set templateLabel(e){this._setTemplateLabelInput(e);}_templateLabel;_explicitContent=void 0;_implicitContent;textLabel="";ariaLabel;ariaLabelledby;labelClass;bodyClass;id=null;_contentPortal=null;get content(){return this._contentPortal}_stateChanges=new J;position=null;origin=null;isActive=false;constructor(){v(H$1).load($r$1);}ngOnChanges(e){(e.hasOwnProperty("textLabel")||e.hasOwnProperty("disabled"))&&this._stateChanges.next();}ngOnDestroy(){this._stateChanges.complete();}ngOnInit(){this._contentPortal=new L(this._explicitContent||this._implicitContent,this._viewContainerRef);}_setTemplateLabelInput(e){e&&e._closestTab===this&&(this._templateLabel=e);}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mE({type:i,selectors:[["mat-tab"]],contentQueries:function(t,a,o){if(t&1&&Np(o,$t,5)(o,Ht,7,_n),t&2){let u;rI(u=oI())&&(a.templateLabel=u.first),rI(u=oI())&&(a._explicitContent=u.first);}},viewQuery:function(t,a){if(t&1&&xp(_n,7),t&2){let o;rI(o=oI())&&(a._implicitContent=o.first);}},hostAttrs:["hidden",""],hostVars:1,hostBindings:function(t,a){t&2&&vp("id",null);},inputs:{disabled:[2,"disabled","disabled",DP],textLabel:[0,"label","textLabel"],ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],labelClass:"labelClass",bodyClass:"bodyClass",id:"id"},exportAs:["matTab"],features:[HI([{provide:ya,useExisting:i}]),Qa$1],ngContentSelectors:Wt,decls:1,vars:0,template:function(t,a){t&1&&(eI(),pp(0,ja,1,0,"ng-template"));},encapsulation:2,changeDetection:1})}return i})(),At="mdc-tab-indicator--active",ga="mdc-tab-indicator--no-transition",Vt=class{_items;_currentItem;constructor(n){this._items=n;}hide(){this._items.forEach(n=>n.deactivateInkBar()),this._currentItem=void 0;}alignToElement(n){let e=this._items.find(a=>a.elementRef.nativeElement===n),t=this._currentItem;if(e!==t&&(t?.deactivateInkBar(),e)){let a=t?.elementRef.nativeElement.getBoundingClientRect?.();e.activateInkBar(a),this._currentItem=e;}}},di=(()=>{class i{_elementRef=v(Rn);_inkBarElement=null;_inkBarContentElement=null;_fitToContent=false;get fitInkBarToContent(){return this._fitToContent}set fitInkBarToContent(e){this._fitToContent!==e&&(this._fitToContent=e,this._inkBarElement&&this._appendInkBarElement());}activateInkBar(e){let t=this._elementRef.nativeElement;if(!e||!t.getBoundingClientRect||!this._inkBarContentElement){t.classList.add(At);return}let a=t.getBoundingClientRect(),o=e.width/a.width,u=e.left-a.left;t.classList.add(ga),this._inkBarContentElement.style.setProperty("transform",`translateX(${u}px) scaleX(${o})`),t.getBoundingClientRect(),t.classList.remove(ga),t.classList.add(At),this._inkBarContentElement.style.setProperty("transform","");}deactivateInkBar(){this._elementRef.nativeElement.classList.remove(At);}ngOnInit(){this._createInkBarElement();}ngOnDestroy(){this._inkBarElement?.remove(),this._inkBarElement=this._inkBarContentElement=null;}_createInkBarElement(){let e=this._elementRef.nativeElement.ownerDocument||document,t=this._inkBarElement=e.createElement("span"),a=this._inkBarContentElement=e.createElement("span");t.className="mdc-tab-indicator",a.className="mdc-tab-indicator__content mdc-tab-indicator__content--underline",t.appendChild(this._inkBarContentElement),this._appendInkBarElement();}_appendInkBarElement(){this._inkBarElement;let e=this._fitToContent?this._elementRef.nativeElement.querySelector(".mdc-tab__content"):this._elementRef.nativeElement;e.appendChild(this._inkBarElement);}static \u0275fac=function(t){return new(t||i)};static \u0275dir=Mc({type:i,inputs:{fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",DP]}})}return i})();var Ca=(()=>{class i extends di{elementRef=v(Rn);disabled=false;focus(){this.elementRef.nativeElement.focus();}getOffsetLeft(){return this.elementRef.nativeElement.offsetLeft}getOffsetWidth(){return this.elementRef.nativeElement.offsetWidth}static \u0275fac=(()=>{let e;return function(a){return (e||(e=xd(i)))(a||i)}})();static \u0275dir=Mc({type:i,selectors:[["","matTabLabelWrapper",""]],hostVars:3,hostBindings:function(t,a){t&2&&(vp("aria-disabled",!!a.disabled),Pp("mat-mdc-tab-disabled",a.disabled));},inputs:{disabled:[2,"disabled","disabled",DP]},features:[lp]})}return i})(),fa={passive:true},ci=650,mi=100;function Nt(i){let n=i+"";return /^[0-9]+(?:\.[0-9]+)?$/.test(n)?`${i}ms`:/^[0-9]+(?:\.[0-9]+)?(?:ms|s)$/.test(n)?n:""}var pi=(()=>{class i{_elementRef=v(Rn);_changeDetectorRef=v(mC);_viewportRuler=v(F$2);_dir=v(_i,{optional:true});_ngZone=v(Ne);_platform=v(w);_sharedResizeObserver=v(Qe);_injector=v(ie);_renderer=v(Lf);_animationsDisabled=ye();_eventCleanups;_scrollDistance=0;_selectedIndexChanged=false;_destroyed=new J;_showPaginationControls=false;_disableScrollAfter=true;_disableScrollBefore=true;_tabLabelCount;_scrollDistanceChanged=false;_keyManager;_currentTextContent;_stopScrolling=new J;disablePagination=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){let t=isNaN(e)?0:e;this._selectedIndex!=t&&(this._selectedIndexChanged=true,this._selectedIndex=t,this._keyManager&&this._keyManager.updateActiveItem(t));}_selectedIndex=0;selectFocusedIndex=new $e$1;indexFocused=new $e$1;constructor(){this._eventCleanups=this._ngZone.runOutsideAngular(()=>[this._renderer.listen(this._elementRef.nativeElement,"mouseleave",()=>this._stopInterval())]);}ngAfterViewInit(){this._eventCleanups.push(this._renderer.listen(this._previousPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("before"),fa),this._renderer.listen(this._nextPaginator.nativeElement,"touchstart",()=>this._handlePaginatorPress("after"),fa));}ngAfterContentInit(){let e=this._dir?this._dir.change:sg("ltr"),t=this._sharedResizeObserver.observe(this._elementRef.nativeElement).pipe(bg(32),Og(this._destroyed)),a=this._viewportRuler.change(150).pipe(Og(this._destroyed)),o=()=>{this.updatePagination(),this._alignInkBarToSelectedTab();};this._keyManager=new Zt(this._items).withHorizontalOrientation(this._getLayoutDirection()).withHomeAndEnd().withWrap().skipPredicate(()=>false),this._keyManager.updateActiveItem(Math.max(this._selectedIndex,0)),mv(o,{injector:this._injector}),Eg(e,a,t,this._items.changes,this._itemsResized()).pipe(Og(this._destroyed)).subscribe(()=>{this._ngZone.run(()=>{Promise.resolve().then(()=>{this._scrollDistance=Math.max(0,Math.min(this._getMaxScrollDistance(),this._scrollDistance)),o();});}),this._keyManager?.withHorizontalOrientation(this._getLayoutDirection());}),this._keyManager.change.subscribe(u=>{this.indexFocused.emit(u),this._setTabFocus(u);});}_itemsResized(){return typeof ResizeObserver!="function"?Dt:this._items.changes.pipe(Ag(this._items),Rg(e=>new M(t=>this._ngZone.runOutsideAngular(()=>{let a=new ResizeObserver(o=>t.next(o));return e.forEach(o=>a.observe(o.elementRef.nativeElement)),()=>{a.disconnect();}}))),Zc(1),kn(e=>e.some(t=>t.contentRect.width>0&&t.contentRect.height>0)))}ngAfterContentChecked(){this._tabLabelCount!=this._items.length&&(this.updatePagination(),this._tabLabelCount=this._items.length,this._changeDetectorRef.markForCheck()),this._selectedIndexChanged&&(this._scrollToLabel(this._selectedIndex),this._checkScrollingControls(),this._alignInkBarToSelectedTab(),this._selectedIndexChanged=false,this._changeDetectorRef.markForCheck()),this._scrollDistanceChanged&&(this._updateTabScrollPosition(),this._scrollDistanceChanged=false,this._changeDetectorRef.markForCheck());}ngOnDestroy(){this._eventCleanups.forEach(e=>e()),this._keyManager?.destroy(),this._destroyed.next(),this._destroyed.complete(),this._stopScrolling.complete();}_handleKeydown(e){if(!Or$1(e))switch(e.keyCode){case 13:case 32:if(this.focusIndex!==this.selectedIndex){let t=this._items.get(this.focusIndex);t&&!t.disabled&&(this.selectFocusedIndex.emit(this.focusIndex),this._itemSelected(e));}break;default:this._keyManager?.onKeydown(e);}}_onContentChanges(){let e=this._elementRef.nativeElement.textContent;e!==this._currentTextContent&&(this._currentTextContent=e||"",this._ngZone.run(()=>{this.updatePagination(),this._alignInkBarToSelectedTab(),this._changeDetectorRef.markForCheck();}));}updatePagination(){this._checkPaginationEnabled(),this._checkScrollingControls(),this._updateTabScrollPosition();}get focusIndex(){return this._keyManager?this._keyManager.activeItemIndex:0}set focusIndex(e){!this._isValidIndex(e)||this.focusIndex===e||!this._keyManager||this._keyManager.setActiveItem(e);}_isValidIndex(e){return this._items?!!this._items.toArray()[e]:true}_setTabFocus(e){if(this._showPaginationControls&&this._scrollToLabel(e),this._items&&this._items.length){this._items.toArray()[e].focus();let t=this._tabListContainer.nativeElement;this._getLayoutDirection()=="ltr"?t.scrollLeft=0:t.scrollLeft=t.scrollWidth-t.offsetWidth;}}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_updateTabScrollPosition(){if(this.disablePagination)return;let e=this.scrollDistance,t=this._getLayoutDirection()==="ltr"?-e:e;this._tabList.nativeElement.style.transform=`translateX(${Math.round(t)}px)`,(this._platform.TRIDENT||this._platform.EDGE)&&(this._tabListContainer.nativeElement.scrollLeft=0);}get scrollDistance(){return this._scrollDistance}set scrollDistance(e){this._scrollTo(e);}_scrollHeader(e){let t=this._tabListContainer.nativeElement.offsetWidth,a=(e=="before"?-1:1)*t/3;return this._scrollTo(this._scrollDistance+a)}_handlePaginatorClick(e){this._stopInterval(),this._scrollHeader(e);}_scrollToLabel(e){if(this.disablePagination)return;let t=this._items?this._items.toArray()[e]:null;if(!t)return;let a=this._tabListContainer.nativeElement.offsetWidth,{offsetLeft:o,offsetWidth:u}=t.elementRef.nativeElement,D,k;this._getLayoutDirection()=="ltr"?(D=o,k=D+u):(k=this._tabListInner.nativeElement.offsetWidth-o,D=k-u);let V=this.scrollDistance,R=this.scrollDistance+a;D<V?this.scrollDistance-=V-D:k>R&&(this.scrollDistance+=Math.min(k-R,D-V));}_checkPaginationEnabled(){if(this.disablePagination)this._showPaginationControls=false;else {let e=this._tabListInner.nativeElement.scrollWidth,t=this._elementRef.nativeElement.offsetWidth,a=e-t>=5;a||(this.scrollDistance=0),a!==this._showPaginationControls&&(this._showPaginationControls=a,this._changeDetectorRef.markForCheck());}}_checkScrollingControls(){this.disablePagination?this._disableScrollAfter=this._disableScrollBefore=true:(this._disableScrollBefore=this.scrollDistance==0,this._disableScrollAfter=this.scrollDistance==this._getMaxScrollDistance(),this._changeDetectorRef.markForCheck());}_getMaxScrollDistance(){let e=this._tabListInner.nativeElement.scrollWidth,t=this._tabListContainer.nativeElement.offsetWidth;return e-t||0}_alignInkBarToSelectedTab(){let e=this._items&&this._items.length?this._items.toArray()[this.selectedIndex]:null,t=e?e.elementRef.nativeElement:null;t?this._inkBar.alignToElement(t):this._inkBar.hide();}_stopInterval(){this._stopScrolling.next();}_handlePaginatorPress(e,t){t&&t.button!=null&&t.button!==0||(this._stopInterval(),Vn(ci,mi).pipe(Og(Eg(this._stopScrolling,this._destroyed))).subscribe(()=>{let{maxScrollDistance:a,distance:o}=this._scrollHeader(e);(o===0||o>=a)&&this._stopInterval();}));}_scrollTo(e){if(this.disablePagination)return {maxScrollDistance:0,distance:0};let t=this._getMaxScrollDistance();return this._scrollDistance=Math.max(0,Math.min(t,e)),this._scrollDistanceChanged=true,this._checkScrollingControls(),{maxScrollDistance:t,distance:this._scrollDistance}}static \u0275fac=function(t){return new(t||i)};static \u0275dir=Mc({type:i,inputs:{disablePagination:[2,"disablePagination","disablePagination",DP],selectedIndex:[2,"selectedIndex","selectedIndex",EP]},outputs:{selectFocusedIndex:"selectFocusedIndex",indexFocused:"indexFocused"}})}return i})(),ui=(()=>{class i extends pi{_items;_tabListContainer;_tabList;_tabListInner;_nextPaginator;_previousPaginator;_inkBar;ariaLabel;ariaLabelledby;disableRipple=false;ngAfterContentInit(){this._inkBar=new Vt(this._items),super.ngAfterContentInit();}_itemSelected(e){e.preventDefault();}static \u0275fac=(()=>{let e;return function(a){return (e||(e=xd(i)))(a||i)}})();static \u0275cmp=mE({type:i,selectors:[["mat-tab-header"]],contentQueries:function(t,a,o){if(t&1&&Np(o,Ca,4),t&2){let u;rI(u=oI())&&(a._items=u);}},viewQuery:function(t,a){if(t&1&&xp(Qa,7)(Ga,7)(Ka,7)(Ua,5)(Ya,5),t&2){let o;rI(o=oI())&&(a._tabListContainer=o.first),rI(o=oI())&&(a._tabList=o.first),rI(o=oI())&&(a._tabListInner=o.first),rI(o=oI())&&(a._nextPaginator=o.first),rI(o=oI())&&(a._previousPaginator=o.first);}},hostAttrs:[1,"mat-mdc-tab-header"],hostVars:4,hostBindings:function(t,a){t&2&&Pp("mat-mdc-tab-header-pagination-controls-enabled",a._showPaginationControls)("mat-mdc-tab-header-rtl",a._getLayoutDirection()=="rtl");},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],disableRipple:[2,"disableRipple","disableRipple",DP]},features:[lp],ngContentSelectors:Wt,decls:13,vars:10,consts:[["previousPaginator",""],["tabListContainer",""],["tabList",""],["tabListInner",""],["nextPaginator",""],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-before",3,"click","mousedown","touchend","matRippleDisabled"],[1,"mat-mdc-tab-header-pagination-chevron"],[1,"mat-mdc-tab-label-container",3,"keydown"],["role","tablist",1,"mat-mdc-tab-list",3,"cdkObserveContent"],[1,"mat-mdc-tab-labels"],["mat-ripple","",1,"mat-mdc-tab-header-pagination","mat-mdc-tab-header-pagination-after",3,"mousedown","click","touchend","matRippleDisabled"]],template:function(t,a){t&1&&(eI(),di$1(0,"div",5,0),_p("click",function(){return a._handlePaginatorClick("before")})("mousedown",function(u){return a._handlePaginatorPress("before",u)})("touchend",function(){return a._stopInterval()}),Ep(2,"div",6),Rc(),di$1(3,"div",7,1),_p("keydown",function(u){return a._handleKeydown(u)}),di$1(5,"div",8,2),_p("cdkObserveContent",function(){return a._onContentChanges()}),di$1(7,"div",9,3),tI(9),Rc()()(),di$1(10,"div",10,4),_p("mousedown",function(u){return a._handlePaginatorPress("after",u)})("click",function(){return a._handlePaginatorClick("after")})("touchend",function(){return a._stopInterval()}),Ep(12,"div",6),Rc()),t&2&&(Pp("mat-mdc-tab-header-pagination-disabled",a._disableScrollBefore),Dp("matRippleDisabled",a._disableScrollBefore||a.disableRipple),Bv(3),Pp("_mat-animation-noopable",a._animationsDisabled),Bv(2),vp("aria-label",a.ariaLabel||null)("aria-labelledby",a.ariaLabelledby||null),Bv(5),Pp("mat-mdc-tab-header-pagination-disabled",a._disableScrollAfter),Dp("matRippleDisabled",a._disableScrollAfter||a.disableRipple));},dependencies:[Td,Hs],styles:[`.mat-mdc-tab-header {
  display: flex;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.mdc-tab-indicator .mdc-tab-indicator__content {
  transition-duration: var(--mat-tab-header-animation-duration, 250ms);
}

.mat-mdc-tab-header-pagination {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: none;
  justify-content: center;
  align-items: center;
  min-width: 32px;
  cursor: pointer;
  z-index: 2;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  box-sizing: content-box;
  outline: 0;
}
.mat-mdc-tab-header-pagination::-moz-focus-inner {
  border: 0;
}
.mat-mdc-tab-header-pagination .mat-ripple-element {
  opacity: 0.12;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-header-pagination-controls-enabled .mat-mdc-tab-header-pagination {
  display: flex;
}

.mat-mdc-tab-header-pagination-before,
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after {
  padding-left: 4px;
}
.mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {
  transform: rotate(-135deg);
}

.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before,
.mat-mdc-tab-header-pagination-after {
  padding-right: 4px;
}
.mat-mdc-tab-header-rtl .mat-mdc-tab-header-pagination-before .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-header-pagination-after .mat-mdc-tab-header-pagination-chevron {
  transform: rotate(45deg);
}

.mat-mdc-tab-header-pagination-chevron {
  border-style: solid;
  border-width: 2px 2px 0 0;
  height: 8px;
  width: 8px;
  border-color: var(--mat-tab-pagination-icon-color, var(--mat-sys-on-surface));
}

.mat-mdc-tab-header-pagination-disabled {
  box-shadow: none;
  cursor: default;
  pointer-events: none;
}
.mat-mdc-tab-header-pagination-disabled .mat-mdc-tab-header-pagination-chevron {
  opacity: 0.4;
}

.mat-mdc-tab-list {
  flex-grow: 1;
  position: relative;
  transition: transform 500ms cubic-bezier(0.35, 0, 0.25, 1);
}
._mat-animation-noopable .mat-mdc-tab-list {
  transition: none;
}

.mat-mdc-tab-label-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  z-index: 1;
  border-bottom-style: solid;
  border-bottom-width: var(--mat-tab-divider-height, 1px);
  border-bottom-color: var(--mat-tab-divider-color, var(--mat-sys-surface-variant));
}
.mat-mdc-tab-group-inverted-header .mat-mdc-tab-label-container {
  border-bottom: none;
  border-top-style: solid;
  border-top-width: var(--mat-tab-divider-height, 1px);
  border-top-color: var(--mat-tab-divider-color, var(--mat-sys-surface-variant));
}

.mat-mdc-tab-labels {
  display: flex;
  flex: 1 0 auto;
}
[mat-align-tabs=center] > .mat-mdc-tab-header .mat-mdc-tab-labels {
  justify-content: center;
}
[mat-align-tabs=end] > .mat-mdc-tab-header .mat-mdc-tab-labels {
  justify-content: flex-end;
}
.cdk-drop-list .mat-mdc-tab-labels, .mat-mdc-tab-labels.cdk-drop-list {
  min-height: var(--mat-tab-container-height, 48px);
}

.mat-mdc-tab::before {
  margin: 5px;
}
@media (forced-colors: active) {
  .mat-mdc-tab[aria-disabled=true] {
    color: GrayText;
  }
}
`],encapsulation:2,changeDetection:1})}return i})(),hi=new S$1("MAT_TABS_CONFIG"),va=(()=>{class i extends Fi$1{_host=v(Ft);_ngZone=v(Ne);_centeringSub=Y.EMPTY;_leavingSub=Y.EMPTY;ngOnInit(){super.ngOnInit(),this._centeringSub=this._host._beforeCentering.pipe(Ag(this._host._isCenterPosition())).subscribe(e=>{this._host._content&&e&&!this.hasAttached()&&this._ngZone.run(()=>{Promise.resolve().then(),this.attach(this._host._content);});}),this._leavingSub=this._host._afterLeavingCenter.subscribe(()=>{this._host.preserveContent||this._ngZone.run(()=>this.detach());});}ngOnDestroy(){super.ngOnDestroy(),this._centeringSub.unsubscribe(),this._leavingSub.unsubscribe();}static \u0275fac=(()=>{let e;return function(a){return (e||(e=xd(i)))(a||i)}})();static \u0275dir=Mc({type:i,selectors:[["","matTabBodyHost",""]],features:[lp]})}return i})(),Ft=(()=>{class i{_elementRef=v(Rn);_dir=v(_i,{optional:true});_ngZone=v(Ne);_injector=v(ie);_renderer=v(Lf);_diAnimationsDisabled=ye();_eventCleanups;_initialized=false;_fallbackTimer;_positionIndex;_dirChangeSubscription=Y.EMPTY;_position;_previousPosition;_onCentering=new $e$1;_beforeCentering=new $e$1;_afterLeavingCenter=new $e$1;_onCentered=new $e$1(true);_portalHost;_contentElement;_content;animationDuration="500ms";preserveContent=false;set position(e){this._positionIndex=e,this._computePositionAnimationState();}constructor(){if(this._dir){let e=v(mC);this._dirChangeSubscription=this._dir.change.subscribe(t=>{this._computePositionAnimationState(t),e.markForCheck();});}}ngOnInit(){this._bindTransitionEvents(),this._position==="center"&&(this._setActiveClass(true),mv(()=>this._onCentering.emit(this._elementRef.nativeElement.clientHeight),{injector:this._injector})),this._initialized=true;}ngOnDestroy(){clearTimeout(this._fallbackTimer),this._eventCleanups?.forEach(e=>e()),this._dirChangeSubscription.unsubscribe();}_bindTransitionEvents(){this._ngZone.runOutsideAngular(()=>{let e=this._elementRef.nativeElement,t=a=>{a.target===this._contentElement?.nativeElement&&(this._elementRef.nativeElement.classList.remove("mat-tab-body-animating"),a.type==="transitionend"&&this._transitionDone());};this._eventCleanups=[this._renderer.listen(e,"transitionstart",a=>{a.target===this._contentElement?.nativeElement&&(this._elementRef.nativeElement.classList.add("mat-tab-body-animating"),this._transitionStarted());}),this._renderer.listen(e,"transitionend",t),this._renderer.listen(e,"transitioncancel",t)];});}_transitionStarted(){clearTimeout(this._fallbackTimer);let e=this._position==="center";this._beforeCentering.emit(e),e&&this._onCentering.emit(this._elementRef.nativeElement.clientHeight);}_transitionDone(){this._position==="center"?this._onCentered.emit():this._previousPosition==="center"&&this._afterLeavingCenter.emit();}_setActiveClass(e){this._elementRef.nativeElement.classList.toggle("mat-mdc-tab-body-active",e);}_getLayoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_isCenterPosition(){return this._positionIndex===0}_computePositionAnimationState(e=this._getLayoutDirection()){this._previousPosition=this._position,this._positionIndex<0?this._position=e=="ltr"?"left":"right":this._positionIndex>0?this._position=e=="ltr"?"right":"left":this._position="center",this._animationsDisabled()?this._simulateTransitionEvents():this._initialized&&(this._position==="center"||this._previousPosition==="center")&&(clearTimeout(this._fallbackTimer),this._fallbackTimer=this._ngZone.runOutsideAngular(()=>setTimeout(()=>this._simulateTransitionEvents(),100)));}_simulateTransitionEvents(){this._transitionStarted(),mv(()=>this._transitionDone(),{injector:this._injector});}_animationsDisabled(){return this._diAnimationsDisabled||this.animationDuration==="0ms"||this.animationDuration==="0s"}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mE({type:i,selectors:[["mat-tab-body"]],viewQuery:function(t,a){if(t&1&&xp(va,5)(Za,5),t&2){let o;rI(o=oI())&&(a._portalHost=o.first),rI(o=oI())&&(a._contentElement=o.first);}},hostAttrs:[1,"mat-mdc-tab-body"],hostVars:1,hostBindings:function(t,a){t&2&&vp("inert",a._position==="center"?null:"");},inputs:{_content:[0,"content","_content"],animationDuration:"animationDuration",preserveContent:"preserveContent",position:"position"},outputs:{_onCentering:"_onCentering",_beforeCentering:"_beforeCentering",_onCentered:"_onCentered"},decls:3,vars:6,consts:[["content",""],["cdkScrollable","",1,"mat-mdc-tab-body-content"],["matTabBodyHost",""]],template:function(t,a){t&1&&(di$1(0,"div",1,0),fp(2,Xa,0,0,"ng-template",2),Rc()),t&2&&Pp("mat-tab-body-content-left",a._position==="left")("mat-tab-body-content-right",a._position==="right")("mat-tab-body-content-can-animate",a._position==="center"||a._previousPosition==="center");},dependencies:[va,ce$2],styles:[`.mat-mdc-tab-body {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: block;
  overflow: hidden;
  outline: 0;
  flex-basis: 100%;
}
.mat-mdc-tab-body.mat-mdc-tab-body-active {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 1;
  flex-grow: 1;
}
.mat-mdc-tab-group.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body.mat-mdc-tab-body-active {
  overflow-y: hidden;
}

.mat-mdc-tab-body-content {
  height: 100%;
  overflow: auto;
  transform: none;
  visibility: hidden;
}
.mat-tab-body-animating > .mat-mdc-tab-body-content, .mat-mdc-tab-body-active > .mat-mdc-tab-body-content {
  visibility: visible;
}
.mat-tab-body-animating > .mat-mdc-tab-body-content {
  min-height: 1px;
}
.mat-mdc-tab-group-dynamic-height .mat-mdc-tab-body-content {
  overflow: hidden;
}

.mat-tab-body-content-can-animate {
  transition: transform var(--mat-tab-body-animation-duration) 1ms cubic-bezier(0.35, 0, 0.25, 1);
}
.mat-mdc-tab-body-wrapper._mat-animation-noopable .mat-tab-body-content-can-animate {
  transition: none;
}

.mat-tab-body-content-left {
  transform: translate3d(-100%, 0, 0);
}

.mat-tab-body-content-right {
  transform: translate3d(100%, 0, 0);
}
`],encapsulation:2,changeDetection:1})}return i})(),ka=(()=>{class i{_elementRef=v(Rn);_changeDetectorRef=v(mC);_ngZone=v(Ne);_tabsSubscription=Y.EMPTY;_tabLabelSubscription=Y.EMPTY;_tabBodySubscription=Y.EMPTY;_diAnimationsDisabled=ye();_bodyAnimationDuration;_headerAnimationDuration;_allTabs;_tabBodies;_tabBodyWrapper;_tabHeader;_tabs=new Ko;_indexToSelect=0;_lastFocusedTabIndex=null;_tabBodyWrapperHeight=0;color;get fitInkBarToContent(){return this._fitInkBarToContent}set fitInkBarToContent(e){this._fitInkBarToContent=e,this._changeDetectorRef.markForCheck();}_fitInkBarToContent=false;stretchTabs=true;alignTabs=null;dynamicHeight=false;get selectedIndex(){return this._selectedIndex}set selectedIndex(e){this._indexToSelect=isNaN(e)?null:e;}_selectedIndex=null;headerPosition="above";get animationDuration(){return this._animationDuration}set animationDuration(e){this._animationDuration=e,e&&typeof e=="object"?(this._bodyAnimationDuration=Nt(e.body),this._headerAnimationDuration=Nt(e.header)):this._headerAnimationDuration=this._bodyAnimationDuration=Nt(e);}_animationDuration;get contentTabIndex(){return this._contentTabIndex}set contentTabIndex(e){this._contentTabIndex=isNaN(e)?null:e;}_contentTabIndex=null;disablePagination=false;disableRipple=false;preserveContent=false;get backgroundColor(){return this._backgroundColor}set backgroundColor(e){let t=this._elementRef.nativeElement.classList;t.remove("mat-tabs-with-background",`mat-background-${this.backgroundColor}`),e&&t.add("mat-tabs-with-background",`mat-background-${e}`),this._backgroundColor=e;}_backgroundColor;ariaLabel;ariaLabelledby;selectedIndexChange=new $e$1;focusChange=new $e$1;animationDone=new $e$1;selectedTabChange=new $e$1(true);_groupId;_isServer=!v(w).isBrowser;constructor(){let e=v(hi,{optional:true});this._groupId=v(Yt).getId("mat-tab-group-"),this.animationDuration=e&&e.animationDuration?e.animationDuration:"500ms",this.disablePagination=e&&e.disablePagination!=null?e.disablePagination:false,this.dynamicHeight=e&&e.dynamicHeight!=null?e.dynamicHeight:false,e?.contentTabIndex!=null&&(this.contentTabIndex=e.contentTabIndex),this.preserveContent=!!e?.preserveContent,this.fitInkBarToContent=e&&e.fitInkBarToContent!=null?e.fitInkBarToContent:false,this.stretchTabs=e&&e.stretchTabs!=null?e.stretchTabs:true,this.alignTabs=e&&e.alignTabs!=null?e.alignTabs:null;}ngAfterContentChecked(){let e=this._indexToSelect=this._clampTabIndex(this._indexToSelect);if(this._selectedIndex!=e){let t=this._selectedIndex==null;if(!t){this.selectedTabChange.emit(this._createChangeEvent(e));let a=this._tabBodyWrapper.nativeElement;a.style.minHeight=a.clientHeight+"px";}Promise.resolve().then(()=>{this._tabs.forEach((a,o)=>a.isActive=o===e),t||(this.selectedIndexChange.emit(e),this._tabBodyWrapper.nativeElement.style.minHeight="");});}this._tabs.forEach((t,a)=>{t.position=a-e,this._selectedIndex!=null&&t.position==0&&!t.origin&&(t.origin=e-this._selectedIndex);}),this._selectedIndex!==e&&(this._selectedIndex=e,this._lastFocusedTabIndex=null,this._changeDetectorRef.markForCheck());}ngAfterContentInit(){this._subscribeToAllTabChanges(),this._subscribeToTabLabels(),this._tabsSubscription=this._tabs.changes.subscribe(()=>{let e=this._clampTabIndex(this._indexToSelect);if(e===this._selectedIndex){let t=this._tabs.toArray(),a;for(let o=0;o<t.length;o++)if(t[o].isActive){this._indexToSelect=this._selectedIndex=o,this._lastFocusedTabIndex=null,a=t[o];break}!a&&t[e]&&Promise.resolve().then(()=>{t[e].isActive=true,this.selectedTabChange.emit(this._createChangeEvent(e));});}this._changeDetectorRef.markForCheck();});}ngAfterViewInit(){this._tabBodySubscription=this._tabBodies.changes.subscribe(()=>this._bodyCentered(true));}_subscribeToAllTabChanges(){this._allTabs.changes.pipe(Ag(this._allTabs)).subscribe(e=>{this._tabs.reset(e.filter(t=>t._closestTabGroup===this||!t._closestTabGroup)),this._tabs.notifyOnChanges();});}ngOnDestroy(){this._tabs.destroy(),this._tabsSubscription.unsubscribe(),this._tabLabelSubscription.unsubscribe(),this._tabBodySubscription.unsubscribe();}realignInkBar(){this._tabHeader&&this._tabHeader._alignInkBarToSelectedTab();}updatePagination(){this._tabHeader&&this._tabHeader.updatePagination();}focusTab(e){let t=this._tabHeader;t&&(t.focusIndex=e);}_focusChanged(e){this._lastFocusedTabIndex=e,this.focusChange.emit(this._createChangeEvent(e));}_createChangeEvent(e){let t=new zt;return t.index=e,this._tabs&&this._tabs.length&&(t.tab=this._tabs.toArray()[e]),t}_subscribeToTabLabels(){this._tabLabelSubscription&&this._tabLabelSubscription.unsubscribe(),this._tabLabelSubscription=Eg(...this._tabs.map(e=>e._stateChanges)).subscribe(()=>this._changeDetectorRef.markForCheck());}_clampTabIndex(e){return Math.min(this._tabs.length-1,Math.max(e||0,0))}_getTabLabelId(e,t){return e.id||`${this._groupId}-label-${t}`}_getTabContentId(e){return `${this._groupId}-content-${e}`}_setTabBodyWrapperHeight(e){if(!this.dynamicHeight||!this._tabBodyWrapperHeight){this._tabBodyWrapperHeight=e;return}let t=this._tabBodyWrapper.nativeElement;t.style.height=this._tabBodyWrapperHeight+"px",this._tabBodyWrapper.nativeElement.offsetHeight&&(t.style.height=e+"px");}_removeTabBodyWrapperHeight(){let e=this._tabBodyWrapper.nativeElement;this._tabBodyWrapperHeight=e.clientHeight,e.style.height="",this._ngZone.run(()=>this.animationDone.emit());}_handleClick(e,t,a){t.focusIndex=a,e.disabled||(this.selectedIndex=a);}_getTabIndex(e){let t=this._lastFocusedTabIndex??this.selectedIndex;return e===t?0:-1}_tabFocusChanged(e,t){e&&e!=="mouse"&&e!=="touch"&&(this._tabHeader.focusIndex=t);}_bodyCentered(e){e&&this._tabBodies?.forEach((t,a)=>t._setActiveClass(a===this._selectedIndex));}_bodyAnimationsDisabled(){return this._diAnimationsDisabled||this._bodyAnimationDuration==="0"||this._bodyAnimationDuration==="0ms"}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mE({type:i,selectors:[["mat-tab-group"]],contentQueries:function(t,a,o){if(t&1&&Np(o,qt,5),t&2){let u;rI(u=oI())&&(a._allTabs=u);}},viewQuery:function(t,a){if(t&1&&xp(Ja,5)(ei,5)(Ft,5),t&2){let o;rI(o=oI())&&(a._tabBodyWrapper=o.first),rI(o=oI())&&(a._tabHeader=o.first),rI(o=oI())&&(a._tabBodies=o);}},hostAttrs:[1,"mat-mdc-tab-group"],hostVars:13,hostBindings:function(t,a){t&2&&(vp("mat-align-tabs",a.alignTabs),yI("mat-"+(a.color||"primary")),Fp("--mat-tab-body-animation-duration",a._bodyAnimationDuration)("--mat-tab-header-animation-duration",a._headerAnimationDuration),Pp("mat-mdc-tab-group-dynamic-height",a.dynamicHeight)("mat-mdc-tab-group-inverted-header",a.headerPosition==="below")("mat-mdc-tab-group-stretch-tabs",a.stretchTabs));},inputs:{color:"color",fitInkBarToContent:[2,"fitInkBarToContent","fitInkBarToContent",DP],stretchTabs:[2,"mat-stretch-tabs","stretchTabs",DP],alignTabs:[0,"mat-align-tabs","alignTabs"],dynamicHeight:[2,"dynamicHeight","dynamicHeight",DP],selectedIndex:[2,"selectedIndex","selectedIndex",EP],headerPosition:"headerPosition",animationDuration:"animationDuration",contentTabIndex:[2,"contentTabIndex","contentTabIndex",EP],disablePagination:[2,"disablePagination","disablePagination",DP],disableRipple:[2,"disableRipple","disableRipple",DP],preserveContent:[2,"preserveContent","preserveContent",DP],backgroundColor:"backgroundColor",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"]},outputs:{selectedIndexChange:"selectedIndexChange",focusChange:"focusChange",animationDone:"animationDone",selectedTabChange:"selectedTabChange"},exportAs:["matTabGroup"],features:[HI([{provide:wa,useExisting:i}])],ngContentSelectors:Wt,decls:9,vars:8,consts:[["tabHeader",""],["tabBodyWrapper",""],["tabNode",""],[3,"indexFocused","selectFocusedIndex","selectedIndex","disableRipple","disablePagination","aria-label","aria-labelledby"],["role","tab","matTabLabelWrapper","","cdkMonitorElementFocus","",1,"mdc-tab","mat-mdc-tab","mat-focus-indicator",3,"id","mdc-tab--active","class","disabled","fitInkBarToContent"],[1,"mat-mdc-tab-body-wrapper"],["role","tabpanel",3,"id","class","content","position","animationDuration","preserveContent"],["role","tab","matTabLabelWrapper","","cdkMonitorElementFocus","",1,"mdc-tab","mat-mdc-tab","mat-focus-indicator",3,"click","cdkFocusChange","id","disabled","fitInkBarToContent"],[1,"mdc-tab__ripple"],["mat-ripple","",1,"mat-mdc-tab-ripple",3,"matRippleTrigger","matRippleDisabled"],[1,"mdc-tab__content"],[1,"mdc-tab__text-label"],[3,"cdkPortalOutlet"],["role","tabpanel",3,"_onCentered","_onCentering","_beforeCentering","id","content","position","animationDuration","preserveContent"]],template:function(t,a){t&1&&(eI(),di$1(0,"mat-tab-header",3,0),_p("indexFocused",function(u){return a._focusChanged(u)})("selectFocusedIndex",function(u){return a.selectedIndex=u}),UE(2,ii,8,17,"div",4,$E),Rc(),VE(4,ri,1,0),di$1(5,"div",5,1),UE(7,oi,1,10,"mat-tab-body",6,$E),Rc()),t&2&&(Dp("selectedIndex",a.selectedIndex||0)("disableRipple",a.disableRipple)("disablePagination",a.disablePagination),yp("aria-label",a.ariaLabel)("aria-labelledby",a.ariaLabelledby),Bv(2),GE(a._tabs),Bv(2),BE(a._isServer?4:-1),Bv(),Pp("_mat-animation-noopable",a._bodyAnimationsDisabled()),Bv(2),GE(a._tabs));},dependencies:[ui,Ca,Bo,Td,Fi$1,Ft],styles:[`.mdc-tab {
  min-width: 90px;
  padding: 0 24px;
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  box-sizing: border-box;
  border: none;
  outline: none;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  z-index: 1;
  touch-action: manipulation;
}

.mdc-tab__content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: inherit;
  pointer-events: none;
}

.mdc-tab__text-label {
  transition: 150ms color linear;
  display: inline-block;
  line-height: 1;
  z-index: 2;
}

.mdc-tab--active .mdc-tab__text-label {
  transition-delay: 100ms;
}

._mat-animation-noopable .mdc-tab__text-label {
  transition: none;
}

.mdc-tab-indicator {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.mdc-tab-indicator__content {
  transition: var(--mat-tab-header-animation-duration, 250ms) transform cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left;
  opacity: 0;
}

.mdc-tab-indicator__content--underline {
  align-self: flex-end;
  box-sizing: border-box;
  width: 100%;
  border-top-style: solid;
}

.mdc-tab-indicator--active .mdc-tab-indicator__content {
  opacity: 1;
}

._mat-animation-noopable .mdc-tab-indicator__content, .mdc-tab-indicator--no-transition .mdc-tab-indicator__content {
  transition: none;
}

.mat-mdc-tab-ripple.mat-mdc-tab-ripple {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
}

.mat-mdc-tab {
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-decoration: none;
  background: none;
  height: var(--mat-tab-container-height, 48px);
  font-family: var(--mat-tab-label-text-font, var(--mat-sys-title-small-font));
  font-size: var(--mat-tab-label-text-size, var(--mat-sys-title-small-size));
  letter-spacing: var(--mat-tab-label-text-tracking, var(--mat-sys-title-small-tracking));
  line-height: var(--mat-tab-label-text-line-height, var(--mat-sys-title-small-line-height));
  font-weight: var(--mat-tab-label-text-weight, var(--mat-sys-title-small-weight));
}
.mat-mdc-tab.mdc-tab {
  flex-grow: 0;
}
.mat-mdc-tab .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-indicator-color, var(--mat-sys-primary));
  border-top-width: var(--mat-tab-active-indicator-height, 2px);
  border-radius: var(--mat-tab-active-indicator-shape, 0);
}
.mat-mdc-tab:hover .mdc-tab__text-label {
  color: var(--mat-tab-inactive-hover-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab:focus .mdc-tab__text-label {
  color: var(--mat-tab-inactive-focus-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
  color: var(--mat-tab-active-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active .mdc-tab__ripple::before,
.mat-mdc-tab.mdc-tab--active .mat-ripple-element {
  background-color: var(--mat-tab-active-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active:hover .mdc-tab__text-label {
  color: var(--mat-tab-active-hover-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active:hover .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-hover-indicator-color, var(--mat-sys-primary));
}
.mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label {
  color: var(--mat-tab-active-focus-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab.mdc-tab--active:focus .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-active-focus-indicator-color, var(--mat-sys-primary));
}
.mat-mdc-tab.mat-mdc-tab-disabled {
  opacity: 0.4;
  pointer-events: none;
}
.mat-mdc-tab.mat-mdc-tab-disabled .mdc-tab__content {
  pointer-events: none;
}
.mat-mdc-tab.mat-mdc-tab-disabled .mdc-tab__ripple::before,
.mat-mdc-tab.mat-mdc-tab-disabled .mat-ripple-element {
  background-color: var(--mat-tab-disabled-ripple-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-tab .mdc-tab__ripple::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  pointer-events: none;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab .mdc-tab__text-label {
  color: var(--mat-tab-inactive-label-text-color, var(--mat-sys-on-surface));
  display: inline-flex;
  align-items: center;
}
.mat-mdc-tab .mdc-tab__content {
  position: relative;
  pointer-events: auto;
}
.mat-mdc-tab:hover .mdc-tab__ripple::before {
  opacity: 0.04;
}
.mat-mdc-tab.cdk-program-focused .mdc-tab__ripple::before, .mat-mdc-tab.cdk-keyboard-focused .mdc-tab__ripple::before {
  opacity: 0.12;
}
.mat-mdc-tab .mat-ripple-element {
  opacity: 0.12;
  background-color: var(--mat-tab-inactive-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-tab-group.mat-mdc-tab-group-stretch-tabs > .mat-mdc-tab-header .mat-mdc-tab {
  flex-grow: 1;
}

.mat-mdc-tab-group {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination {
  background-color: var(--mat-tab-background-color);
}
.mat-mdc-tab-group.mat-tabs-with-background.mat-primary > .mat-mdc-tab-header .mat-mdc-tab .mdc-tab__text-label {
  color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background.mat-primary > .mat-mdc-tab-header .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-header .mat-mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label {
  color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background:not(.mat-primary) > .mat-mdc-tab-header .mat-mdc-tab:not(.mdc-tab--active) .mdc-tab-indicator__content--underline {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-focus-indicator::before, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron,
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-focus-indicator::before {
  border-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-ripple-element, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mdc-tab__ripple::before, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-ripple-element, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mdc-tab__ripple::before {
  background-color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header .mat-mdc-tab-header-pagination-chevron, .mat-mdc-tab-group.mat-tabs-with-background > .mat-mdc-tab-header-pagination .mat-mdc-tab-header-pagination-chevron {
  color: var(--mat-tab-foreground-color);
}
.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header {
  flex-direction: column-reverse;
}
.mat-mdc-tab-group.mat-mdc-tab-group-inverted-header .mdc-tab-indicator__content--underline {
  align-self: flex-start;
}

.mat-mdc-tab-body-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  transition: height 500ms cubic-bezier(0.35, 0, 0.25, 1);
}
.mat-mdc-tab-body-wrapper._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
`],encapsulation:2,changeDetection:1})}return i})(),zt=class{index;tab};var xa=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=ip({type:i});static \u0275inj=ms({imports:[gt$1]})}return i})();var bi=["panelWrapper"],gi=["panel"],fi=[[["","panelHeaderExtra",""]],[["","panelHeaderTabs",""]],"*"],vi=["[panelHeaderExtra]","[panelHeaderTabs]","*"];function yi(i,n){if(i&1){let e=QE();Oc(0,"div",11),Sp("click",function(){sl(e);let a=JE(2);return al(a.closed.emit())})("keydown.enter",function(){sl(e);let a=JE(2);return al(a.closed.emit())})("keydown.space",function(a){sl(e);let o=JE(2);return a.preventDefault(),al(o.closed.emit())}),kc();}if(i&2){let e=JE(2);vp("aria-label",e.closeLabel());}}function wi(i,n){if(i&1&&(Oc(0,"h2",7),MI(1),kc()),i&2){let e=JE(2);wp("id",e.headingId),Bv(),Up(e.heading());}}function Ci(i,n){if(i&1){let e=QE();Oc(0,"button",12),Sp("click",function(){sl(e);let a=JE(2);return al(a.closed.emit())}),Oc(1,"span",13),MI(2,"close"),kc()();}if(i&2){let e=JE(2);vp("aria-label",e.closeLabel());}}function ki(i,n){if(i&1){let e=QE();Oc(0,"div",2,0),VE(2,yi,1,1,"div",3),Oc(3,"div",4,1),Sp("keydown",function(a){sl(e);let o=JE();return al(o.onTrapKeydown(a))}),Oc(5,"div",5)(6,"div",6),VE(7,wi,2,2,"h2",7),tI(8),VE(9,Ci,3,1,"button",8),kc(),Oc(10,"div",9),tI(11,1),kc()(),Oc(12,"div",10),tI(13,2),kc()()();}if(i&2){let e=JE();Bv(2),BE(e.isNarrow()?2:-1),Bv(),Pp("responsive-panel--narrow",e.isNarrow()),vp("tabindex",e.isNarrow()?"0":null)("role",e.isNarrow()?"dialog":null)("aria-modal",e.isNarrow()?"true":null)("aria-labelledby",e.heading()?e.headingId:null)("aria-label",e.heading()?null:e.closeLabel()),Bv(2),Pp("responsive-panel__header--borderless",!e.showHeaderDivider()),Bv(2),BE(e.heading()?7:-1),Bv(2),BE(e.showCloseButton()?9:-1);}}var xi="(max-width: 1280px)",Di='button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',mt=class i{open=fP(false);heading=fP("");closeLabel=fP.required();showCloseButton=fP(true);showHeaderDivider=fP(true);closed=dP();static nextId=0;headingId=`responsive-panel-heading-${i.nextId++}`;breakpointObserver=v(zt$2);isNarrow=T(this.breakpointObserver.observe([xi]).pipe(we(n=>n.matches)),{initialValue:false});overlay=v(se$1);wrapperRef=hP("panelWrapper");panelRef=hP("panel");renderContent=Fo(false);lastFocused=null;overlayRef=null;domPortal=null;portaledWrapper=null;constructor(){Ml(()=>{this.open()?this.renderContent.set(true):(this.detachOverlay(),this.renderContent.set(false));}),Ml(()=>{let n=this.wrapperRef();n&&(this.isNarrow()?this.attachOverlay(n):this.detachOverlay());}),Ml(()=>{this.open()?(this.lastFocused=document.activeElement,this.focusableElements()[0]?.focus()):(this.lastFocused?.focus?.(),this.lastFocused=null);}),Ml(()=>{document.body.style.overflow=this.open()&&this.isNarrow()?"hidden":"";}),v(Le).onDestroy(()=>this.detachOverlay());}onEscape(){this.open()&&this.closed.emit();}onTrapKeydown(n){if(n.key!=="Tab"||!this.isNarrow())return;let e=this.focusableElements();if(e.length===0)return;let t=e[0],a=e[e.length-1];n.shiftKey&&document.activeElement===t?(n.preventDefault(),a.focus()):!n.shiftKey&&document.activeElement===a&&(n.preventDefault(),t.focus());}attachOverlay(n){if(this.overlayRef)return;let e=document.activeElement,t=!!e&&n.nativeElement.contains(e);this.overlayRef=this.overlay.create({positionStrategy:this.overlay.position().global()}),this.domPortal=new wt(n),this.portaledWrapper=n.nativeElement,this.overlayRef.attach(this.domPortal),t&&e?.focus();}detachOverlay(){if(!this.domPortal)return;let n=document.activeElement,e=!!n&&!!this.portaledWrapper?.contains(n);this.domPortal.isAttached&&this.domPortal.detach(),this.domPortal=null,this.portaledWrapper=null,this.overlayRef?.dispose(),this.overlayRef=null,e&&n?.focus();}focusableElements(){let n=this.panelRef()?.nativeElement??this.wrapperRef()?.nativeElement??null;return n?Array.from(n.querySelectorAll(Di)):[]}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mE({type:i,selectors:[["lib-responsive-panel"]],viewQuery:function(e,t){e&1&&Rp(t.wrapperRef,bi,5)(t.panelRef,gi,5),e&2&&iI(2);},hostBindings:function(e,t){e&1&&_p("keydown.escape",function(){return t.onEscape()},Xy);},inputs:{open:[1,"open"],heading:[1,"heading"],closeLabel:[1,"closeLabel"],showCloseButton:[1,"showCloseButton"],showHeaderDivider:[1,"showHeaderDivider"]},outputs:{closed:"closed"},ngContentSelectors:vi,decls:1,vars:1,consts:[["panelWrapper",""],["panel",""],[1,"responsive-panel-wrapper"],["role","button","tabindex","0",1,"responsive-panel__backdrop"],[1,"responsive-panel",3,"keydown"],[1,"responsive-panel__header"],[1,"responsive-panel__heading-group"],[1,"responsive-panel__heading",3,"id"],["type","button",1,"responsive-panel__close"],[1,"responsive-panel__header-tabs"],[1,"responsive-panel__body"],["role","button","tabindex","0",1,"responsive-panel__backdrop",3,"click","keydown.enter","keydown.space"],["type","button",1,"responsive-panel__close",3,"click"],["aria-hidden","true",1,"material-symbols-rounded"]],template:function(e,t){e&1&&(eI(fi),VE(0,ki,14,12,"div",2)),e&2&&BE(t.renderContent()?0:-1);},styles:[`[_nghost-%COMP%]{display:contents}.responsive-panel-wrapper[_ngcontent-%COMP%]{display:contents}.responsive-panel[_ngcontent-%COMP%]{display:flex;flex-direction:column;background:var(--mat-sys-surface);color:var(--mat-sys-on-surface);overflow:hidden}.responsive-panel__header[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:.5rem;padding:.75rem 1rem 0;border-bottom:1px solid var(--mat-sys-outline-variant)}.responsive-panel__header--borderless[_ngcontent-%COMP%]{border-bottom:none;padding-bottom:.5rem}.responsive-panel__heading-group[_ngcontent-%COMP%]{display:flex;width:100%;align-items:center;gap:.5rem;min-width:0}.responsive-panel__heading[_ngcontent-%COMP%]{margin:0;font-weight:700}.responsive-panel__header-tabs[_ngcontent-%COMP%]{display:flex;flex:1 1 auto;min-width:0;overflow:hidden;width:100%}.responsive-panel__header-tabs[_ngcontent-%COMP%]:empty{display:none}.responsive-panel__header-tabs[_ngcontent-%COMP%]    >*{min-width:0;width:100%}.responsive-panel__close[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:.25rem;margin-left:auto;color:var(--mat-sys-on-surface-variant)}.responsive-panel__body[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;overflow-y:auto}.responsive-panel__body[_ngcontent-%COMP%]    >*{flex:1 1 auto;min-height:0}.responsive-panel[_ngcontent-%COMP%]:not(.responsive-panel--narrow){flex:0 1 clamp(320px,32vw,480px);height:100%;min-width:0}.responsive-panel--narrow[_ngcontent-%COMP%]{position:fixed;inset-inline:0;bottom:0;max-height:70vh;overflow-y:auto;border-radius:var(--mat-sys-corner-large) var(--mat-sys-corner-large) 0 0;z-index:101;animation:_ngcontent-%COMP%_responsive-panel-slide-up .2s ease-out}.responsive-panel__backdrop[_ngcontent-%COMP%]{position:fixed;inset:0;background:#0006;z-index:100}@keyframes _ngcontent-%COMP%_responsive-panel-slide-up{0%{transform:translateY(100%)}to{transform:translateY(0)}}
`]})};var Mi=(i,n)=>n.id,Pi=(i,n)=>n.bookingId;function Ti(i,n){if(i&1){let e=QE();di$1(0,"button",9),_p("click",function(){let a=sl(e).$implicit,o=JE();return al(o.selectDate(a))}),di$1(1,"span",10),MI(2),Rc(),di$1(3,"span",11),MI(4),Rc()();}if(i&2){let e=n.$implicit,t=n.$index,a=JE();Pp("timeline-view__cell-header--today",t===a.todayIdx())("timeline-view__cell-header--selected",t===a.selectedIdx()),Dp("title",a.fmtDate(e)),vp("aria-label",a.fmtDate(e)),Bv(2),Up(a.shortDateLabel(e)),Bv(2),Up(a.weekdayLabel(e));}}function Ii(i,n){if(i&1&&(di$1(0,"div",16),MI(1),Rc()),i&2){let e=JE(2);Bv(),Up(e.t.dispatch.maintenanceBlock);}}function Oi(i,n){if(i&1&&Ep(0,"div",20),i&2){JE();let e=FI(0);Pp("timeline-view__day--tall",e>1);}}function Si(i,n){i&1&&(di$1(0,"span",22),MI(1,"swap_horiz"),Rc());}function Li(i,n){if(i&1&&(di$1(0,"span",24),MI(1,"schedule"),Rc(),di$1(2,"span",25),MI(3),Rc()),i&2){let e=JE(3);Bv(3),Up(e.t.timeline.overdue);}}function Ei(i,n){if(i&1){let e=QE();di$1(0,"button",21),_p("click",function(){let a=sl(e).$implicit,o=JE(2);return al(o.openDetail(a.bookingId))}),VE(1,Si,2,0,"span",22),VE(2,Li,4,1),di$1(3,"span",23),MI(4),Rc()();}if(i&2){let e=n.$implicit,t=JE(2);Fp("grid-column",e.startCol+1+" / span "+e.span)("grid-row",e.lane+1),Pp("timeline-view__booking--reserved",e.kind==="reserved")("timeline-view__booking--in-progress",e.kind==="in_progress")("timeline-view__booking--overdue",e.overdue)("timeline-view__booking--conflict",e.conflict),Dp("title",t.blockTitle(e)),vp("aria-label",t.blockTitle(e)),Bv(),BE(e.needsDispatch?1:-1),Bv(),BE(e.overdue?2:-1),Bv(2),Up(t.blockLabel(e));}}function Ri(i,n){if(i&1&&(Qp(0),di$1(1,"div",12)(2,"div",5)(3,"div",13)(4,"div",14),MI(5),Rc(),di$1(6,"div",15),MI(7),Rc(),di$1(8,"div",15),MI(9),Rc(),VE(10,Ii,2,1,"div",16),Rc(),UE(11,Oi,1,2,"div",17,HE),Rc(),di$1(13,"div",18),Ep(14,"div"),UE(15,Ei,5,17,"button",19,Pi),Rc()()),i&2){let e=n.$implicit,t=JE(),a=t.blocksOf(e);kI(t.laneCountOf(a)),Bv(),Pp("timeline-view__vehicle-row--maintenance",e.status==="maintenance"),Bv(),Fp("grid-template-columns",t.gridCols),Bv(3),Up(e.plateNumber),Bv(2),Up(e.model),Bv(2),Up(t.locationLabel(e)),Bv(),BE(e.status==="maintenance"?10:-1),Bv(),GE(t.days()),Bv(2),Fp("grid-template-columns",t.gridCols),Bv(2),GE(a);}}function Bi(i,n){return i.status==="in_progress"&&new Date(i.endTime).getTime()<n.getTime()}function Ai(i,n,e,t,a$1,o=new Date){let u=s$2(a(o),t),D=[];for(let k of i){if(k.vehicleId!==n||k.status!=="reserved"&&k.status!=="in_progress")continue;let V=s$2(new Date(k.startTime),t),R=Bi(k,o),oe=s$2(new Date(k.endTime),t),$=R?Math.max(oe,u):oe;if($<0||V>a$1-1)continue;let Fe=Math.max(V,0),Ra=Math.min($,a$1-1);D.push({startCol:Fe+1,span:Ra-Fe+1,kind:k.status,bookingId:k.id,memberId:k.memberId,pickupBranchId:k.pickupBranchId,overdue:R,needsDispatch:k.status==="reserved"&&Re(e,k.pickupBranchId),conflict:false,lane:0});}for(let k of D.filter(V=>V.overdue)){let V=k.startCol+k.span-1;for(let R of D){if(R===k||R.kind!=="reserved")continue;let oe=R.startCol+R.span-1;R.startCol<=V&&oe>=k.startCol&&(R.conflict=true);}}return Ni(D),D}function Ni(i){let n=[...i].sort((t,a)=>t.startCol-a.startCol||t.span-a.span),e=[];for(let t of n){let a=t.startCol+t.span-1,o=e.findIndex(u=>u<t.startCol);o===-1&&(o=e.length),e[o]=a,t.lane=o;}}function Vi(i){return i.reduce((n,e)=>Math.max(n,e.lane+1),1)}function Fi(i){return `${i.getMonth()+1}/${i.getDate()}`}var pt=14,ut=class i{t=GP;vehicleStore=v(p);orderStore=v(b);memberStore=v(D);orderDetail=v(d);fmtDate=D$1;shortDateLabel=Fi;laneCountOf=Vi;gridCols=`140px repeat(${pt}, minmax(56px, 1fr))`;targetDate=fP(a(new Date));vehicles=fP(null);dateSelect=dP();rows=eC(()=>this.vehicles()??this.vehicleStore.vehicles());rangeStart=Fo(f(a(new Date)));days=eC(()=>Array.from({length:pt},(n,e)=>o(this.rangeStart(),e)));todayIdx=eC(()=>s$2(new Date,this.rangeStart()));selectedIdx=eC(()=>s$2(a(this.targetDate()),this.rangeStart()));rangeInitialized=false;constructor(){Ml(()=>{let n=a(this.targetDate());if(!this.rangeInitialized){this.rangeStart.set(f(n)),this.rangeInitialized=true;return}let e=oh(()=>this.rangeStart()),t=s$2(n,e);(t<0||t>=pt)&&this.rangeStart.set(f(n));});}shift(n){this.rangeStart.update(e=>o(e,n));}selectDate(n){this.dateSelect.emit(n);}blocksOf(n){return Ai(this.orderStore.orders(),n.id,n.branchId,this.rangeStart(),pt)}locationLabel(n){return n.branchId?b$1(n.branchId):this.t.timeline.locationUnset}weekdayLabel(n){return this.t.dispatch.weekdays[n.getDay()]}renterName(n){return this.memberStore.nameOf(n.memberId)}pickupBranchName(n){return b$1(n.pickupBranchId)}blockLabel(n){return `${this.renterName(n)}\u30FB${this.pickupBranchName(n)}`}blockTitle(n){let e=[this.t.order.statusLabels[n.kind],this.blockLabel(n)];return n.overdue&&e.push(this.t.timeline.overdue),n.needsDispatch&&e.push(this.t.dispatch.workList.needsDispatch),e.join("\u30FB")}openDetail(n){let e=this.orderStore.orders().find(t=>t.id===n);e&&this.orderDetail.open(e.id);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mE({type:i,selectors:[["app-timeline-view"]],inputs:{targetDate:[1,"targetDate"],vehicles:[1,"vehicles"]},outputs:{dateSelect:"dateSelect"},decls:15,vars:5,consts:[[1,"timeline-view"],[1,"flex","items-center","gap-2"],["mat-button","",3,"click"],[1,"timeline-view__scroller"],[1,"timeline-view__canvas"],[1,"grid"],[1,"timeline-view__corner","text-xs","font-bold","p-2"],["type","button",1,"timeline-view__cell-header",3,"timeline-view__cell-header--today","timeline-view__cell-header--selected","title"],[1,"timeline-view__vehicle-row","relative",3,"timeline-view__vehicle-row--maintenance"],["type","button",1,"timeline-view__cell-header",3,"click","title"],[1,"timeline-view__cell-header-date"],[1,"timeline-view__cell-header-weekday"],[1,"timeline-view__vehicle-row","relative"],[1,"timeline-view__row-head","p-2"],[1,"timeline-view__plate","text-sm"],[1,"timeline-view__muted"],[1,"timeline-view__maintenance-tag"],[1,"timeline-view__day",3,"timeline-view__day--tall"],[1,"timeline-view__blocks","absolute","inset-0","grid","pointer-events-none"],["type","button",1,"timeline-view__booking","pointer-events-auto","self-center","h-6","rounded","text-xs","px-1.5","cursor-pointer","font-semibold","flex","items-center","gap-1",3,"timeline-view__booking--reserved","timeline-view__booking--in-progress","timeline-view__booking--overdue","timeline-view__booking--conflict","grid-column","grid-row","title"],[1,"timeline-view__day"],["type","button",1,"timeline-view__booking","pointer-events-auto","self-center","h-6","rounded","text-xs","px-1.5","cursor-pointer","font-semibold","flex","items-center","gap-1",3,"click","title"],["aria-hidden","true",1,"material-symbols-rounded","timeline-view__dispatch-icon"],[1,"truncate"],["aria-hidden","true",1,"material-symbols-rounded","timeline-view__overdue-icon"],[1,"timeline-view__overdue-label"]],template:function(e,t){e&1&&(di$1(0,"div",0)(1,"div",1)(2,"button",2),_p("click",function(){return t.shift(-7)}),MI(3),Rc(),di$1(4,"button",2),_p("click",function(){return t.shift(7)}),MI(5),Rc()(),di$1(6,"div",3)(7,"div",4)(8,"div",5)(9,"div",6),MI(10),Rc(),UE(11,Ti,5,8,"button",7,HE),Rc(),UE(13,Ri,17,11,"div",8,Mi),Rc()()()),e&2&&(Bv(3),Up(t.t.dispatch.prevRange),Bv(2),Up(t.t.dispatch.nextRange),Bv(3),Fp("grid-template-columns",t.gridCols),Bv(2),Up(t.t.order.vehicle),Bv(),GE(t.days()),Bv(2),GE(t.rows()));},dependencies:[nl,tl],styles:[".timeline-view__scroller[_ngcontent-%COMP%]{overflow-x:auto;background:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:var(--mat-sys-corner-small)}.timeline-view__canvas[_ngcontent-%COMP%]{min-width:924px}.timeline-view__corner[_ngcontent-%COMP%], .timeline-view__row-head[_ngcontent-%COMP%]{position:sticky;left:0;z-index:1;background:var(--mat-sys-surface)}.timeline-view__cell-header[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.05rem;padding:.3rem .125rem;border:none;border-left:1px solid var(--mat-sys-outline-variant);background:none;font:inherit;cursor:pointer;color:var(--mat-sys-on-surface-variant)}.timeline-view__cell-header-date[_ngcontent-%COMP%]{font-size:.75rem;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}.timeline-view__cell-header-weekday[_ngcontent-%COMP%]{font-size:.6875rem;line-height:1}.timeline-view__cell-header--today[_ngcontent-%COMP%]{font-weight:700;color:var(--mat-sys-primary)}.timeline-view__cell-header--selected[_ngcontent-%COMP%]{background:var(--app-info-bg);color:var(--app-info-fg);border-radius:var(--mat-sys-corner-small, 4px)}.timeline-view__day[_ngcontent-%COMP%]{border-left:1px solid var(--mat-sys-outline-variant);min-height:2.5rem}.timeline-view__day--tall[_ngcontent-%COMP%]{min-height:3.5rem}.timeline-view__muted[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant);font-size:.75rem}.timeline-view__plate[_ngcontent-%COMP%]{font-weight:600}.timeline-view__maintenance-tag[_ngcontent-%COMP%]{display:inline-block;margin-top:.15rem;border-radius:var(--mat-sys-corner-full, 999px);padding:.05rem .45rem;font-size:.7rem;font-weight:600;background:var(--app-neutral-bg);color:var(--app-neutral-fg)}.timeline-view__vehicle-row[_ngcontent-%COMP%]{border-top:1px solid var(--mat-sys-outline-variant)}.timeline-view__vehicle-row--maintenance[_ngcontent-%COMP%]   .timeline-view__day[_ngcontent-%COMP%]{background:repeating-linear-gradient(135deg,var(--mat-sys-surface-variant) 0,var(--mat-sys-surface-variant) 8px,transparent 8px,transparent 16px);opacity:.7}.timeline-view__blocks[_ngcontent-%COMP%]{row-gap:.25rem}.timeline-view__booking[_ngcontent-%COMP%]{color:var(--mat-sys-on-primary)}.timeline-view__booking--reserved[_ngcontent-%COMP%]{background:var(--app-viz-2)}.timeline-view__booking--in-progress[_ngcontent-%COMP%]{background:var(--mat-sys-primary)}.timeline-view__booking--overdue[_ngcontent-%COMP%]{background:var(--app-danger-bg);color:var(--app-danger-fg)}.timeline-view__booking--conflict[_ngcontent-%COMP%]{outline:2px solid var(--app-danger-fg);outline-offset:-2px}.timeline-view__dispatch-icon[_ngcontent-%COMP%]{font-size:.85rem;line-height:1}.timeline-view__overdue-icon[_ngcontent-%COMP%]{flex:0 0 auto;font-size:.85rem;line-height:1}.timeline-view__overdue-label[_ngcontent-%COMP%]{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"]})};var Wi=(i,n)=>n.term,Da=(i,n)=>n.key,Hi=(i,n)=>n.text;function $i(i,n){if(i&1&&(di$1(0,"span")(1,"span",15),MI(2),Rc(),MI(3),Rc()),i&2){let e=n.$implicit,t=JE(2);yI(t.chipClass(e)),Bv(2),Up(e.icon),Bv(),Lc(" ",e.text," ");}}function qi(i,n){if(i&1&&(di$1(0,"div",4),UE(1,$i,4,4,"span",14,Hi),Rc()),i&2){let e=JE();Bv(),GE(e.data.chips);}}function ji(i,n){if(i&1&&(di$1(0,"a",7)(1,"span",15),MI(2,"call"),Rc(),MI(3),Rc()),i&2){let e=n;Dp("href",e.href,tf),vp("aria-label",e.ariaLabel),Bv(3),Lc(" ",e.label," ");}}function Qi(i,n){if(i&1&&(di$1(0,"div")(1,"dt"),MI(2),Rc(),di$1(3,"dd"),MI(4),Rc()()),i&2){let e=n.$implicit;Bv(2),Up(e.term),Bv(2),Up(e.value);}}function Gi(i,n){if(i&1){let e=QE();di$1(0,"li",17)(1,"span",15),MI(2),Rc(),di$1(3,"span",18),MI(4),Rc(),di$1(5,"button",19),_p("click",function(){let a=sl(e).$implicit,o=JE(2);return al(o.goHandle(a))}),MI(6),Rc()();}if(i&2){let e=n.$implicit,t=JE(2);Pp("work-list-severity__item--blocker",e.kind==="blocker")("work-list-severity__item--warning",e.kind==="warning"),Bv(2),Up(e.kind==="blocker"?"report":"warning"),Bv(2),Up(e.message),Bv(2),Lc(" ",t.t.dispatch.workList.goHandle," ");}}function Ki(i,n){if(i&1&&(di$1(0,"ul",9),UE(1,Gi,7,7,"li",16,Da),Rc()),i&2){let e=JE();Bv(),GE(e.data.severities);}}function Ui(i,n){if(i&1){let e=QE();di$1(0,"button",20),_p("click",function(){let a=sl(e).$implicit,o=JE();return al(o.runAction(a))}),di$1(1,"span",15),MI(2),Rc(),MI(3),Rc();}if(i&2){let e=n.$implicit;Dp("matButton",e.variant),Bv(2),Up(e.icon),Bv(),Lc(" ",e.label," ");}}var _t=class i{t=GP;data=v($e);dialogRef=v(O);chipClass(n){return ["ui-chip","work-list-row__status-chip",n.tone?`ui-chip--${n.tone}`:"",n.className??""].filter(Boolean).join(" ")}runAction(n){this.dialogRef.close({kind:"action",key:n.key});}goHandle(n){this.dialogRef.close({kind:"severity",severity:n});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mE({type:i,selectors:[["app-work-list-detail-dialog"]],decls:29,vars:10,consts:[["mat-dialog-title","",1,"work-list-detail-dialog__title"],[1,"work-list-detail-dialog__plate"],[1,"work-list-detail-dialog__subtitle"],["mat-dialog-content","",1,"work-list-detail-dialog__content"],[1,"work-list-detail-dialog__chips"],[1,"work-list-detail"],[1,"work-list-detail__member"],[1,"work-list-detail__phone-link","underline",3,"href"],[1,"work-list-detail__time"],[1,"work-list-severity"],["mat-dialog-actions","",1,"work-list-detail-dialog__actions"],["matButton","text","type","button","mat-dialog-close",""],[1,"work-list-detail-dialog__actions-spacer"],["matButton","","type","button",3,"matButton"],[3,"class"],["aria-hidden","true",1,"material-symbols-rounded"],[1,"work-list-severity__item",3,"work-list-severity__item--blocker","work-list-severity__item--warning"],[1,"work-list-severity__item"],[1,"work-list-severity__text"],["matButton","text","type","button",3,"click"],["matButton","","type","button",3,"click","matButton"]],template:function(e,t){if(e&1&&(di$1(0,"h2",0)(1,"span",1),MI(2),Rc(),di$1(3,"span",2),MI(4),Rc()(),di$1(5,"div",3),VE(6,qi,3,0,"div",4),di$1(7,"dl",5)(8,"div")(9,"dt"),MI(10),Rc(),di$1(11,"dd",6)(12,"span"),MI(13),Rc(),VE(14,ji,4,3,"a",7),Rc()(),di$1(15,"div")(16,"dt"),MI(17),Rc(),di$1(18,"dd",8),MI(19),Rc()(),UE(20,Qi,5,2,"div",null,Wi),Rc(),VE(22,Ki,3,0,"ul",9),Rc(),di$1(23,"div",10)(24,"button",11),MI(25),Rc(),Ep(26,"span",12),UE(27,Ui,4,3,"button",13,Da),Rc()),e&2){let a;Bv(2),Up(t.data.title),Bv(2),Up(t.data.subtitle),Bv(2),BE(t.data.chips.length>0?6:-1),Bv(4),Up(t.t.dispatch.workList.customer),Bv(3),Up(t.data.member.name),Bv(),BE((a=t.data.member.phone)?14:-1,a),Bv(3),Up(t.data.timeTerm),Bv(2),Up(t.data.time),Bv(),GE(t.data.fields),Bv(2),BE(t.data.severities.length>0?22:-1),Bv(3),Up(t.t.common.close),Bv(2),GE(t.data.actions);}},dependencies:[Ht$1,jt$1,Nt$1,zt$1,Vt$1,nl,tl],styles:["[_nghost-%COMP%]{display:block}.work-list-detail-dialog__title.work-list-detail-dialog__title[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.125rem;padding-bottom:.75rem}.work-list-detail-dialog__plate[_ngcontent-%COMP%]{font-size:1.375rem;font-weight:700;font-variant-numeric:tabular-nums;color:var(--mat-sys-on-surface)}.work-list-detail-dialog__subtitle[_ngcontent-%COMP%]{font-size:1rem;font-weight:400;color:var(--mat-sys-on-surface-variant)}.work-list-detail-dialog__content[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:1rem}.work-list-detail-dialog__chips[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:.5rem}.work-list-row__status-chip[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.25rem}.work-list-row__status-chip[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:16px}.ui-chip.work-list-row__status-chip[_ngcontent-%COMP%]{white-space:normal}.work-list-detail[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem;margin:0}.work-list-detail[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{display:grid;grid-template-columns:5.5rem minmax(0,1fr);column-gap:1rem;align-items:start}.work-list-detail[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.work-list-detail[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%]{margin:0;min-width:0;overflow-wrap:anywhere}.work-list-detail[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]:first-child   dt[_ngcontent-%COMP%]{align-self:center}.work-list-detail__time[_ngcontent-%COMP%]{font-variant-numeric:tabular-nums}.work-list-detail__member[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:center;column-gap:.5rem;row-gap:.25rem}.work-list-detail__phone-link[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.25rem;min-height:44px}.work-list-detail__phone-link[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:18px}.work-list-detail__phone-link[_ngcontent-%COMP%]:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.work-list-severity[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.25rem;margin:0;padding:0;list-style:none}.work-list-severity__item[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.5rem;padding:.5rem .75rem;border-radius:.5rem}.work-list-severity__item[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:18px;flex:0 0 auto}.work-list-severity__item[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{margin-left:auto;flex:0 0 auto}.work-list-severity__text[_ngcontent-%COMP%]{flex:1 1 auto;min-width:0}.work-list-severity__item--blocker[_ngcontent-%COMP%]{background:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container)}.work-list-severity__item--warning[_ngcontent-%COMP%]{background:var(--mat-sys-tertiary-container);color:var(--mat-sys-on-tertiary-container)}.work-list-detail-dialog__actions[_ngcontent-%COMP%]{flex-wrap:wrap;gap:.5rem;padding:.5rem 1.5rem 1.25rem}.work-list-detail-dialog__actions-spacer[_ngcontent-%COMP%]{flex:1 1 auto}"]})};var Yi=(i,n)=>n.getTime(),Ia=(i,n)=>n.id,Oa=(i,n)=>n.text,Zi=(i,n)=>n.value;function Xi(i,n){if(i&1&&(di$1(0,"h2",8),MI(1),Rc()),i&2){let e=JE();Bv(),Up(e.monthLabel());}}function Ji(i,n){if(i&1){let e=QE();di$1(0,"button",19),_p("click",function(){sl(e);let a=JE();return al(a.shiftMonth(-1))}),di$1(1,"span",7),MI(2,"chevron_left"),Rc()();}if(i&2){let e=JE();vp("aria-label",e.t.dispatch.prevMonth);}}function er(i,n){if(i&1){let e=QE();di$1(0,"button",19),_p("click",function(){sl(e);let a=JE();return al(a.shiftMonth(1))}),di$1(1,"span",7),MI(2,"chevron_right"),Rc()();}if(i&2){let e=JE();vp("aria-label",e.t.dispatch.nextMonth);}}function tr(i,n){if(i&1&&(di$1(0,"div",20),MI(1),Rc()),i&2){let e=n.$implicit;Bv(),Lc(" ",e," ");}}function nr(i,n){if(i&1&&(di$1(0,"div",12),UE(1,tr,2,1,"div",20,$E),Rc()),i&2){let e=JE();Bv(),GE(e.t.dispatch.weekdays);}}function ar(i,n){if(i&1&&(di$1(0,"span",25),MI(1),Rc()),i&2){JE();let e=FI(0),t=JE(2);Bv(),Gp(" ",t.t.dispatch.pickups," ",e.pickups," ");}}function ir(i,n){if(i&1&&(di$1(0,"span",26),MI(1),Rc()),i&2){JE();let e=FI(0),t=JE(2);Bv(),Gp(" ",t.t.dispatch.returns," ",e.returns," ");}}function rr(i,n){if(i&1&&(di$1(0,"span",27),MI(1),Rc()),i&2){JE();let e=FI(0),t=JE(2);Bv(),Gp(" ",t.t.dispatch.workList.needsDispatch," ",e.needsDispatch," ");}}function or(i,n){if(i&1&&(di$1(0,"span",29),MI(1),Rc()),i&2){JE();let e=FI(0),t=JE(2);Pp("calendar-view__available--low",t.isLowAvailability(e)),Bv(),Gp(" ",t.t.dispatch.available," ",e.available," ");}}function sr(i,n){if(i&1){let e=QE();Qp(0),di$1(1,"button",22),_p("click",function(){let a=sl(e).$implicit,o=JE(2);return al(o.selectDate(a))}),di$1(2,"div",23),MI(3),Rc(),di$1(4,"div",24),VE(5,ar,2,2,"span",25),VE(6,ir,2,2,"span",26),VE(7,rr,2,2,"span",27),VE(8,or,2,4,"span",28),Rc()();}if(i&2){let e=n.$implicit,t=JE(2),a=kI(t.statsOf(e));Bv(),Pp("opacity-40",e.getMonth()!==t.month().getMonth())("calendar-view__day--selected",t.selected()&&t.isSameDay(e,t.selected())),Bv(),Pp("calendar-view__day-number--today",t.isSameDay(e,t.todayDate)),Bv(),Lc(" ",e.getDate()," "),Bv(2),BE(a.pickups>0?5:-1),Bv(),BE(a.returns>0?6:-1),Bv(),BE(a.needsDispatch>0?7:-1),Bv(),BE(t.isPast(e)?-1:8);}}function lr(i,n){if(i&1&&(di$1(0,"div",13),UE(1,sr,9,12,"button",21,Yi),Rc()),i&2){let e=JE();Bv(),GE(e.monthDays());}}function dr(i,n){if(i&1){let e=QE();di$1(0,"div",14)(1,"app-timeline-view",30),_p("dateSelect",function(a){sl(e);let o=JE();return al(o.selectDate(a))}),Rc()();}if(i&2){let e=JE();Bv(),Dp("targetDate",e.timelineDate());}}function cr(i,n){i&1&&(di$1(0,"span",17),MI(1),Rc()),i&2&&(Bv(),Up(n));}function mr(i,n){if(i&1&&(di$1(0,"span",34)(1,"span",35),MI(2),Rc(),di$1(3,"span",36),MI(4),Rc()()),i&2){JE();let e=FI(0);Bv(2),Up(e.title),Bv(2),Up(e.done);}}function pr(i,n){if(i&1&&(di$1(0,"p",39),MI(1),Rc()),i&2){let e=JE(3);Bv(),Lc(" ",e.t.dispatch.workList.noDispatchNeeded," ");}}function ur(i,n){if(i&1&&(di$1(0,"span")(1,"span",7),MI(2),Rc(),MI(3),Rc()),i&2){let e=n.$implicit;yI(PI("ui-chip work-list-row__status-chip ",e.className)),Pp("ui-chip--positive",e.tone==="positive")("ui-chip--warning",e.tone==="warning")("ui-chip--neutral",e.tone==="neutral")("ui-chip--info",e.tone==="info"),Bv(2),Up(e.icon),Bv(),Lc(" ",e.text," ");}}function hr(i,n){if(i&1){let e=QE();di$1(0,"li")(1,"button",42),_p("click",function(){let a=sl(e).$implicit,o=JE(4);return al(o.openWorkListDetail(a))}),di$1(2,"span",43)(3,"span",44),MI(4),Rc(),di$1(5,"span",45),MI(6),Rc(),UE(7,ur,4,13,"span",46,Oa),Rc(),di$1(9,"span",47),MI(10),Rc(),di$1(11,"span",48),MI(12," chevron_right "),Rc()()();}if(i&2){let e=n.$implicit,t=JE(4),a=t.vehicleOf(e);Bv(),vp("aria-label",t.detailAriaLabel(e)),Bv(3),Up(a?.plateNumber??"\u2014"),Bv(2),Gp("",a?.model??"\u2014"," \xB7 ",t.memberName(e)),Bv(),GE(t.workListChips(e)),Bv(3),Up(t.fmtTime(e.order.startTime));}}function _r(i,n){if(i&1&&(di$1(0,"li",41),MI(1),Rc()),i&2){let e=JE(4);Bv(),Up(e.t.common.empty);}}function br(i,n){if(i&1&&(di$1(0,"ul",40),UE(1,hr,13,5,"li",null,Ia,false,_r,2,1,"li",41),Rc()),i&2){let e=JE(3);Bv(),GE(e.pickupWorkRows());}}function gr(i,n){if(i&1){let e=QE();di$1(0,"div",37)(1,"mat-slide-toggle",38),_p("change",function(a){sl(e);let o=JE(2);return al(o.onNeedsDispatchFilterChange(a))}),MI(2),Rc()(),VE(3,pr,2,1,"p",39)(4,br,4,1,"ul",40);}if(i&2){let e=JE(2);Bv(),Dp("checked",e.showNeedsDispatchOnly())("disabled",e.pickupNeedsDispatchCount()===0&&!e.showNeedsDispatchOnly()),Bv(),Gp(" ",e.t.dispatch.workList.needsDispatchFilter,"\uFF08",e.pickupNeedsDispatchCount(),"\uFF09 "),Bv(),BE(e.showNeedsDispatchOnly()&&e.pickupWorkRows().length===0?3:4);}}function fr(i,n){i&1&&(di$1(0,"span",49),MI(1),Rc()),i&2&&(Bv(),Up(n));}function vr(i,n){if(i&1&&(di$1(0,"span",34)(1,"span",35),MI(2),Rc(),di$1(3,"span",36),MI(4),VE(5,fr,2,1,"span",49),Rc()()),i&2){let e;JE();let t=FI(1);Bv(2),Up(t.title),Bv(2),Lc(" ",t.done," "),Bv(),BE((e=t.overdue)?5:-1,e);}}function yr(i,n){if(i&1&&(di$1(0,"span")(1,"span",7),MI(2),Rc(),MI(3),Rc()),i&2){let e=n.$implicit;yI(PI("ui-chip work-list-row__status-chip ",e.className)),Pp("ui-chip--positive",e.tone==="positive")("ui-chip--warning",e.tone==="warning")("ui-chip--neutral",e.tone==="neutral")("ui-chip--info",e.tone==="info"),Bv(2),Up(e.icon),Bv(),Lc(" ",e.text," ");}}function wr(i,n){if(i&1){let e=QE();di$1(0,"li")(1,"button",42),_p("click",function(){let a=sl(e).$implicit,o=JE(4);return al(o.openWorkListDetail(a))}),di$1(2,"span",43)(3,"span",44),MI(4),Rc(),di$1(5,"span",45),MI(6),Rc(),UE(7,yr,4,13,"span",46,Oa),Rc(),di$1(9,"span",47),MI(10),Rc(),di$1(11,"span",48),MI(12," chevron_right "),Rc()()();}if(i&2){let e=n.$implicit,t=JE(4),a=t.vehicleOf(e);Bv(),vp("aria-label",t.detailAriaLabel(e)),Bv(3),Up(a?.plateNumber??"\u2014"),Bv(2),Gp("",a?.model??"\u2014"," \xB7 ",t.memberName(e)),Bv(),GE(t.workListChips(e)),Bv(3),Up(t.fmtTime(e.order.endTime));}}function Cr(i,n){if(i&1&&(di$1(0,"ul",40),UE(1,wr,13,5,"li",null,Ia),Rc()),i&2){let e=JE(3);Bv(),GE(e.returnWorkRows());}}function kr(i,n){if(i&1&&(di$1(0,"p",50),MI(1),Rc()),i&2){let e=JE(3);Bv(),Up(e.t.dispatch.workList.noReturns);}}function xr(i,n){if(i&1&&VE(0,Cr,3,0,"ul",40)(1,kr,2,1,"p",50),i&2){let e=JE(2);BE(e.returnWorkRows().length>0?0:1);}}function Dr(i,n){if(i&1&&(di$1(0,"span",34)(1,"span",35),MI(2),Rc()()),i&2){let e=JE(2);Bv(2),Up(e.availableTabLabel());}}function Mr(i,n){if(i&1&&(di$1(0,"p",52),MI(1),Rc()),i&2){let e=JE(3);Bv(),Up(e.t.dispatch.availablePanel.pastDate);}}function Pr(i,n){if(i&1&&(di$1(0,"mat-option",60),MI(1),Rc()),i&2){let e=n.$implicit;Dp("value",e.value),Bv(),Up(e.label);}}function Tr(i,n){if(i&1){let e=QE();di$1(0,"div",53)(1,"p",54),MI(2),Rc(),di$1(3,"div",55)(4,"mat-form-field",56)(5,"mat-label"),MI(6),Rc(),di$1(7,"input",57),_p("change",function(a){sl(e);let o=JE(3);return al(o.onReturnDateChange(a))}),Rc()(),di$1(8,"mat-form-field",56)(9,"mat-label"),MI(10),Rc(),di$1(11,"mat-select",58),_p("valueChange",function(a){sl(e);let o=JE(3);return al(o.availableCategory.set(a))}),di$1(12,"mat-option",59),MI(13),Rc(),UE(14,Pr,2,2,"mat-option",60,Zi),Rc()()()(),di$1(16,"app-available-vehicle-list",61),_p("vehicleSelected",function(a){sl(e);let o=JE(3);return al(o.openOrderFor(a))}),Rc();}if(i&2){let e=JE(3);Bv(2),Up(e.startsOnLabel()),Bv(4),Up(e.t.dispatch.availablePanel.returnDate),Bv(),Dp("min",e.minReturnDateKey())("value",e.returnDateKey()),Bv(3),Up(e.t.rentalSearch.category),Bv(),Dp("value",e.availableCategory()),Bv(2),Up(e.t.rentalSearch.allCategories),Bv(),GE(e.categoryOptions),Bv(2),Dp("start",e.availableStart())("end",e.availableEnd())("category",e.availableCategory())("selectable",false);}}function Ir(i,n){if(i&1&&(di$1(0,"div",51),VE(1,Mr,2,1,"p",52)(2,Tr,17,11),Rc()),i&2){let e=JE(2);Bv(),BE(e.isSelectedPast()?1:2);}}function Or(i,n){if(i&1){let e=QE();Qp(0)(1),di$1(2,"mat-tab-group",31),_p("selectedIndexChange",function(a){sl(e);let o=JE();return al(o.onPanelTabIndexChange(a))}),di$1(3,"mat-tab"),fp(4,mr,5,2,"ng-template",32)(5,gr,5,5,"ng-template",33),Rc(),di$1(6,"mat-tab"),fp(7,vr,6,3,"ng-template",32)(8,xr,2,1,"ng-template",33),Rc(),di$1(9,"mat-tab"),fp(10,Dr,3,1,"ng-template",32)(11,Ir,3,1,"ng-template",33),Rc()();}if(i&2){let e=JE();kI(e.pickupTabLabel()),Bv(),kI(e.returnTabLabel()),Bv(),Dp("selectedIndex",e.panelTabIndex());}}var Sr="(max-width: 1280px)";function Ie(i,n){return i.replace(/\{(\w+)\}/g,(e,t)=>t in n?String(n[t]):e)}function Lr(i){return i.endsWith("\u3002")?i.slice(0,-1):i}function Ma(i,n){return i.getFullYear()===n.getFullYear()&&i.getMonth()===n.getMonth()}var jt="view";function Sa(i){return i==="timeline"?"timeline":"calendar"}function Pa(i){return i==="foreign_visitor"?"passport":i==="resident"?"resident_permit":"taiwan_id"}function bt(i){return i.reduce((n,e)=>!n||e.version>n.version?e:n,void 0)}function Er(i){return i==="manual_review"?"pending":i}var Qt=["reserved","in_progress","completed"],Rr={deposit_below_threshold:"payments",latest_contract_unsigned:"contract",required_document_missing_or_expired:"documents",foreign_reciprocity_or_vehicle_class_mismatch:"documents",original_document_not_confirmed:"handover",vehicle_not_deliverable:"overview"},Br={missing_email:"overview",low_confidence_ocr:"documents",document_near_expiry:"documents",special_note:"overview"},Ar=["sent","failed","missing_email","scheduled","pending_schedule"],Ta=["pickup","return","available"],Nr=1;function Vr(i,n,e){let t=a(e);return Yt$1(i,{startTime:t.toISOString(),endTime:o(t,1).toISOString(),orders:n}).available}function La(i,n){return i.status!=="reserved"?false:Re(n?.branchId,i.pickupBranchId)}function Fr(i$1,n,e){let t=new Map(n.map(a=>[a.id,a]));return {pickups:ft(i$1,e).total,returns:vt(i$1,e).total,available:Vr(n,i$1,e).length,needsDispatch:i$1.filter(a=>i(new Date(a.startTime),e)&&La(a,t.get(a.vehicleId))).length}}function ft(i$1,n){let e=i$1.filter(a=>i(new Date(a.startTime),n)&&Qt.includes(a.status)),t=e.filter(a=>a.status!=="reserved").length;return {total:e.length,done:t,pending:e.length-t}}function vt(i$1,n){let e=i$1.filter(a=>i(new Date(a.endTime),n)&&Qt.includes(a.status)),t=e.filter(a=>a.status==="completed").length;return {total:e.length,done:t,pending:e.length-t}}var gt=class i$2{t=GP;orderStore=v(b);vehicleStore=v(p);pricingStore=v(s$1);memberStore=v(D);isSameDay=i;router=v(Ce);orderDetail=v(d);availability=v(se);paymentStore=v(E);documentStore=v(I);contractStore=v(F);handoverStore=v(H);prepStore=v(k);dialog=v(ee);reminderRepo=v(Be);reminderStatuses=Fo(this.reminderRepo.getAll());month=Fo(new Date(new Date().getFullYear(),new Date().getMonth(),1));selected=Fo(null);panelDismissed=Fo(true);panelTab=Fo("pickup");targetDate=fP(a(new Date));dateSelected=dP();view=pP("calendar");todayDate=new Date;today=a(this.todayDate);breakpointObserver=v(zt$2);isNarrow=T(this.breakpointObserver.observe([Sr]).pipe(we(n=>n.matches)),{initialValue:false});monthLabel=eC(()=>`${this.month().getFullYear()} / ${this.month().getMonth()+1}`);monthDays=eC(()=>{let n=this.month(),e=o(n,-n.getDay());return Array.from({length:42},(t,a)=>o(e,a))});panelOpen=eC(()=>this.selected()!==null&&(!this.isNarrow()||!this.panelDismissed()));panelTabIndex=eC(()=>Ta.indexOf(this.panelTab()));onPanelTabIndexChange(n){this.panelTab.set(Ta[n]??"pickup");}panelHeading=eC(()=>{let n=this.selected();return n?`${n.getMonth()+1}/${n.getDate()} \u661F\u671F${this.t.dispatch.weekdays[n.getDay()]}`:""});relativeDayLabel=eC(()=>{let n=this.selected();if(!n)return null;let e=a(this.todayDate);return i(n,e)?"\u4ECA\u5929":i(n,o(e,1))?"\u660E\u5929":i(n,o(e,2))?"\u5F8C\u5929":null});lastEmitted=null;constructor(){let n=true;Ml(()=>{let e=a(this.targetDate()),t=this.lastEmitted===e.getTime();this.lastEmitted=null,this.month.set(new Date(e.getFullYear(),e.getMonth(),1)),this.selected.set(e),t||this.panelTab.set("pickup"),!n&&!t&&this.panelDismissed.set(false),n=false;});}emitSelection(n){this.lastEmitted=n.getTime(),this.dateSelected.emit(n);}shiftMonth(n){let e=this.month(),t=new Date(e.getFullYear(),e.getMonth()+n,1);this.month.set(t);let a=this.selected();if(a&&Ma(a,t))return;let o=Ma(this.today,t)?this.today:t;this.selected.set(o),this.emitSelection(o);}goToToday(){let n=a(this.todayDate);this.month.set(new Date(n.getFullYear(),n.getMonth(),1)),this.selected.set(n),this.panelDismissed.set(true),this.emitSelection(n);}dismissPanel(){this.panelDismissed.set(true);}selectDate(n){let e=a(n);this.selected.set(e),this.panelDismissed.set(false),this.emitSelection(e);}setView(n){this.view.set(n);}timelineDate=eC(()=>this.selected()??this.today);statsOf(n){return Fr(this.orderStore.orders(),this.vehicleStore.vehicles(),n)}isPast(n){return a(n).getTime()<this.today.getTime()}isLowAvailability(n){return n.available<=Nr}selectedPickupProgress=eC(()=>ft(this.orderStore.orders(),this.selected()??this.todayDate));selectedReturnProgress=eC(()=>vt(this.orderStore.orders(),this.selected()??this.todayDate));countedBookings=eC(()=>this.orderStore.orders().filter(n=>Qt.includes(n.status)));pickupTabLabel=eC(()=>{let n=this.selectedPickupProgress();return {title:`${this.t.dispatch.panelTabs.pickup} ${n.total}`,done:Ie(this.t.dispatch.panelTabs.done,{count:n.done})}});returnTabLabel=eC(()=>{let n=this.selectedReturnProgress(),e=this.returnWorkRows().filter(t=>this.isOverdue(t)).length;return {title:`${this.t.dispatch.panelTabs.return} ${n.total}`,done:Ie(this.t.dispatch.panelTabs.done,{count:n.done}),overdue:e>0?Ie(this.t.dispatch.panelTabs.overdue,{count:e}):null}});availableTabLabel=eC(()=>{let n=this.availableCount();return n===null?this.t.dispatch.panelTabs.available:`${this.t.dispatch.panelTabs.available} ${n}`});showNeedsDispatchOnly=Fo(false);pickupWorkRowsForDay=eC(()=>{let n=this.selected();return n?this.countedBookings().filter(e=>i(new Date(e.startTime),n)).map(e=>({id:`pickup-${e.id}`,order:e,kind:"pickup"})).sort((e,t)=>new Date(e.order.startTime).getTime()-new Date(t.order.startTime).getTime()):[]});pickupNeedsDispatchCount=eC(()=>this.pickupWorkRowsForDay().filter(n=>this.needsDispatch(n)).length);pickupWorkRows=eC(()=>{let n=this.pickupWorkRowsForDay();return this.showNeedsDispatchOnly()?n.filter(e=>this.needsDispatch(e)):n});onNeedsDispatchFilterChange(n){this.showNeedsDispatchOnly.set(n.checked);}returnWorkRows=eC(()=>{let n=this.selected();if(!n)return [];let e=this.countedBookings().filter(a=>i(new Date(a.endTime),n)).map(a=>({id:`return-${a.id}`,order:a,kind:"return"})),t=e;if(i(n,this.todayDate)){let a=new Set(e.map(u=>u.order.id)),o=this.orderStore.orders().filter(u=>u.status==="in_progress"&&!a.has(u.id)&&new Date(u.endTime).getTime()<Date.now()).map(u=>({id:`return-${u.id}`,order:u,kind:"return"}));t=[...e,...o];}return t.sort((a,o)=>new Date(a.order.endTime).getTime()-new Date(o.order.endTime).getTime()),t.sort((a,o)=>Number(this.isOverdue(o))-Number(this.isOverdue(a))),t});categoryOptions=NP.map(n=>({value:n,label:this.t.vehicle.typeLabels[n]??n}));availableCategory=Fo("");selectedDateKey=eC(()=>{let n=this.selected();return n?F$1(n):""});minReturnDateKey=eC(()=>{let n=this.selected();return n?F$1(o(a(n),1)):""});returnDateKey=nC(()=>this.selectedDateKey()?this.minReturnDateKey():"");isSelectedPast=eC(()=>{let n=this.selected();return !!n&&this.isPast(n)});startsOnLabel=eC(()=>{let n=this.selected();return n?Ie(this.t.dispatch.availablePanel.startsOn,{date:D$1(n)}):""});availableStart=eC(()=>this.selectedDateKey()&&!this.isSelectedPast()?Ze(this.selectedDateKey(),He):"");availableEnd=eC(()=>this.availableStart()&&this.returnDateKey()?Ze(this.returnDateKey(),He):"");availableCount=eC(()=>{let n=_e(this.availableStart(),this.availableEnd());if(!n)return null;let e=this.availableCategory();return this.availability.forPeriod(n.start.toISOString(),n.end.toISOString()).available.filter(t=>!e||t.category===e).length});onReturnDateChange(n){let e=n.target,t=this.minReturnDateKey(),a=e.value&&e.value>=t?e.value:t;this.returnDateKey.set(a),e.value=a;}openOrderFor(n){let e=_e(this.availableStart(),this.availableEnd());e&&this.router.navigate(["/orders/new"],{queryParams:{vehicleId:n.id,start:e.start.toISOString(),end:e.end.toISOString()}});}vehicleOf(n){return this.vehicleStore.vehicles().find(e=>e.id===n.order.vehicleId)}memberOf(n){return this.memberStore.members().find(e=>e.id===n.order.memberId)}fmtTime(n){let e=new Date(n),t=a=>String(a).padStart(2,"0");return `${t(e.getHours())}:${t(e.getMinutes())}`}memberName(n){return this.memberStore.nameOf(n.order.memberId)}branchId(n){return b$1(n.kind==="pickup"?n.order.pickupBranchId:n.order.returnBranchId)}needsDispatch(n){return La(n.order,this.vehicleOf(n))}needsPrep(n){return n.order.status==="reserved"&&this.prepStore.hasOpenTaskFor(n.order.vehicleId)}dispatchRouteLabel(n){return Ie(this.t.rentalSearch.needsDispatch,{from:b$1(this.vehicleOf(n)?.branchId),to:b$1(n.order.pickupBranchId)})}dispatchNote(n){let e=this.vehicleOf(n),t=b$1(e?.branchId),a=this.branchId(n);return `${this.t.dispatch.workList.dispatchNeededPrefix}${t}${this.t.dispatch.workList.dispatchNeededMiddle}${a}`}phoneHref(n){let e=this.memberStore.members().find(t=>t.id===n.memberId)?.phone;return e?`tel:${e}`:null}phoneLabel(n){return this.memberStore.members().find(e=>e.id===n.memberId)?.phone??"\u2014"}paymentStatusLabel(n){return this.t.paymentPanel.statusLabels[this.paymentStore.summaryFor(n.order.id).status]}balanceDue(n){return this.paymentStore.summaryFor(n.order.id).balanceDue}documentCheckStatus(n){let e=this.memberOf(n),t=Pa(e?.kind),a=bt(this.documentStore.identityDocumentsFor(n.order.memberId).filter(D=>D.type===t)),o=bt(this.documentStore.driverCredentialsFor(n.order.memberId));if(!a||!o)return "missing";let u=[a.verification.state,o.verification.state];return u.includes("rejected")?"rejected":u.every(D=>D==="verified")?"verified":"pending"}documentCheckLabel(n){return this.t.dispatch.workList.documentStatusLabels[this.documentCheckStatus(n)]}contractStatusLabel(n){let e=this.contractStore.latestFor(n.order.id);return e?this.t.contractPanel.statusLabels[e.status]:this.t.dispatch.workList.noContract}readinessInputFor(n){let e=n.order,t=this.vehicleOf(n);if(!t)return;let a=this.memberOf(n),o=Pa(a?.kind),u=bt(this.documentStore.identityDocumentsFor(e.memberId).filter($=>$.type===o)),D=bt(this.documentStore.driverCredentialsFor(e.memberId)),k=this.paymentStore.paymentsFor(e.id).filter($=>$.purpose==="deposit"&&$.status==="confirmed").reduce(($,Fe)=>$+Fe.amount,0),V=this.orderStore.findConflicts(t.id,e.startTime,e.endTime,e.id).length>0,R=a?.kind==="foreign_visitor",oe=this.previousRentalOf(e);return l$1({evaluatedAt:new Date().toISOString(),depositRequired:e.depositRequired,depositPaid:k,latestContractSigned:Ae(this.contractStore.versionsFor(e.id))==="signed",requiredDocuments:[l$1(l$1({kind:o,present:!!u},u?.expiryDate?{expiryDate:u.expiryDate}:{}),u?.verification.ocrConfidence!=null?{ocrConfidence:u.verification.ocrConfidence}:{})],driverCredential:D?m(l$1({present:true},D.expiryDate?{expiryDate:D.expiryDate}:{}),{matchesVehicleClass:D.matchesRentedVehicleClass??D.standardizedVehicleClass===t.category,isForeignVisitor:R,reciprocityStatus:R?Er(D.reciprocityStatus):"not_applicable"}):{present:false,matchesVehicleClass:true,isForeignVisitor:R,reciprocityStatus:"not_applicable"},originalDocumentCheckedThisVisit:true,vehicle:l$1({status:t.status,hasSchedulingConflict:V},oe?{previousRental:{scheduledReturnAt:oe.endTime}}:{})},a?.email?{memberEmail:a.email}:{})}previousRentalOf(n){return this.orderStore.orders().find(e=>e.vehicleId===n.vehicleId&&e.id!==n.id&&e.status==="in_progress")}readiness(n){if(n.order.status!=="reserved")return;let e=this.readinessInputFor(n);return e?this.handoverStore.evaluateReadiness(e):void 0}readinessLabel(n){let e=this.readiness(n);if(!e)return "\u2014";if(e.ready)return this.t.dispatch.workList.ready;let t=e.blockers[0]?.message??this.t.dispatch.workList.ready;return Lr(t)}isPickupReady(n){return this.readiness(n)?.ready??true}blockersOf(n){return this.readiness(n)?.blockers??[]}warningsOf(n){return this.readiness(n)?.warnings??[]}goHandleBlocker(n,e){let t=e.reason==="previous_rental_not_returned"?this.previousRentalOf(n.order):void 0;if(t){this.orderDetail.open(t.id,"handover");return}this.orderDetail.open(n.order.id,Rr[e.type]);}goHandleWarning(n,e){this.orderDetail.open(n.order.id,Br[e.type]);}isOverdue(n){return n.order.status==="in_progress"&&new Date(n.order.endTime).getTime()<Date.now()}overdueDurationLabel(n){if(!this.isOverdue(n))return this.t.dispatch.workList.onTime;let e=Math.floor((Date.now()-new Date(n.order.endTime).getTime())/6e4),t=Math.floor(e/60),a=e%60;return t>0?`${t} ${this.t.dispatch.workList.hoursUnit} ${a} ${this.t.dispatch.workList.minutesUnit}`:`${a} ${this.t.dispatch.workList.minutesUnit}`}isReturnedUnsettled(n){return n.order.status==="completed"&&this.balanceDue(n)>0}reminderStateLabel(n){let e=this.reminderStatuses().filter(t=>t.bookingId===n.order.id);for(let t of Ar)if(e.some(a=>a.state===t))return this.t.dispatch.workList.reminderStateLabels[t];return this.t.dispatch.workList.reminderStateLabels.pending_schedule}estimatedLateFee(n){let e=n.order;if(e.status!=="in_progress")return 0;let t=this.vehicleOf(n);if(!t)return 0;let a=this.returnPolicyFor(e,t);return this.handoverStore.calculateCharges({scheduledReturnAt:e.endTime,actualReturnAt:new Date().toISOString(),lateReturnPolicy:a.lateReturnPolicy,energyReturnPolicy:a.energyReturnPolicy,pickupEnergyLevel:0,returnEnergyLevel:0}).finalLateFee}returnPolicyFor(n,e){let t=this.contractStore.latestFor(n.id)?.snapshot.disclosedRules,a=this.pricingStore.plans().find(o=>o.appliesToCategory===e.category);return {lateReturnPolicy:t?.lateReturnPolicy??a?.lateReturnPolicy??{graceMinutes:0,unitMinutes:60,feePerUnit:0,dailyCap:0},energyReturnPolicy:t?.energyReturnPolicy??a?.energyReturnPolicy??{measure:"eighths",feePerUnit:0,serviceFee:0}}}openWorkListDetail(n){this.dialog.open(_t,{data:this.workListDetailData(n),width:"640px",maxWidth:"92vw",autoFocus:"dialog"}).afterClosed().subscribe(t=>{t&&this.runWorkListDetailResult(n,t);});}detailAriaLabel(n){return Ie(this.t.dispatch.workList.openDetail,{plate:this.vehicleOf(n)?.plateNumber??"\u2014"})}runWorkListDetailResult(n,e){if(e.kind==="severity"){let t=e.severity;t.kind==="blocker"?this.goHandleBlocker(n,t.blocker):this.goHandleWarning(n,t.warning);return}switch(e.key){case "pay":return this.payAction(n);case "edit":return this.editAction(n);case "contract":return this.viewContractAction(n);case "cancel":return this.cancelAction(n);case "pickup":return this.pickupAction(n);case "view":return this.viewAction(n);case "return":return this.returnAction(n)}}workListDetailData(n){let e=this.vehicleOf(n),t=n.kind==="pickup",a=this.t.dispatch.workList,o=this.phoneHref(n.order);return {title:e?.plateNumber??"\u2014",subtitle:`${e?.model??"\u2014"} \xB7 ${this.memberName(n)}`,timeTerm:t?a.pickupTime:a.returnTime,time:this.fmtTime(t?n.order.startTime:n.order.endTime),chips:this.workListChips(n),member:{name:this.memberName(n),phone:o?{href:o,label:t?this.t.dispatch.workList.callLabel:a.contact,ariaLabel:`${this.memberName(n)}\uFF0C\u64A5\u6253\u96FB\u8A71 ${this.phoneLabel(n.order)}`}:null},fields:t?this.pickupDetailFields(n):this.returnDetailFields(n),severities:t?this.workListSeverities(n):[],actions:t?this.pickupDetailActions(n):this.returnDetailActions(n)}}workListChips(n){let e=this.t.dispatch.workList,t=[];if(n.kind==="pickup"){if(n.order.status==="reserved"){let a=this.isPickupReady(n);t.push({tone:a?"positive":"warning",icon:a?"check_circle":"report",text:this.readinessLabel(n),className:"work-list-row__readiness"});}else t.push({tone:"neutral",icon:"check",text:e.pickedUp,className:"work-list-row__picked-up"});return this.needsDispatch(n)&&t.push({tone:"warning",icon:"swap_horiz",text:this.dispatchRouteLabel(n),className:"work-list-row__dispatch"}),this.needsPrep(n)&&t.push({tone:"warning",icon:"cleaning_services",text:this.t.prep.notPrepped,className:"work-list-row__prep"}),t}if(this.isReturnedUnsettled(n))t.push({tone:"warning",icon:"receipt_long",text:e.returnedUnsettled});else if(n.order.status==="in_progress"){let a=this.isOverdue(n);t.push({tone:a?"warning":"positive",icon:a?"schedule":"check_circle",text:a?`${e.overdue} ${this.overdueDurationLabel(n)}`:e.onTime});}else n.order.status==="reserved"&&t.push({tone:null,icon:"hourglass_empty",text:e.notPickedUpYet});return t}pickupDetailFields(n){let e=this.t.dispatch.workList,t=[{term:e.pickupBranchId,value:this.branchId(n)}];return this.needsDispatch(n)&&t.push({term:e.needsDispatch,value:this.dispatchNote(n)}),t.push({term:e.payment,value:`${this.paymentStatusLabel(n)}\u30FB${e.balanceDue} ${i$1(this.balanceDue(n))}`},{term:e.documentCheck,value:this.documentCheckLabel(n)},{term:e.contractStatus,value:this.contractStatusLabel(n)}),t}returnDetailFields(n){let e=this.t.dispatch.workList;return [{term:e.returnBranchId,value:this.branchId(n)},{term:e.reminderStatus,value:this.reminderStateLabel(n)},{term:e.estimatedLateFee,value:i$1(this.estimatedLateFee(n))},{term:e.currentBalance,value:i$1(this.balanceDue(n))}]}workListSeverities(n){return [...this.blockersOf(n).map(e=>({kind:"blocker",key:`blocker-${e.reason}`,message:e.message,blocker:e})),...this.warningsOf(n).map(e=>({kind:"warning",key:`warning-${e.type}`,message:e.message,warning:e}))]}pickupDetailActions(n){let e=n.order.status==="reserved",t=[{key:"pay",label:this.t.dispatch.workList.pay,icon:"payments",variant:"tonal"}];return e&&t.push({key:"edit",label:this.t.common.edit,icon:"edit",variant:"tonal"}),t.push({key:"contract",label:this.t.dispatch.workList.viewContract,icon:"description",variant:"tonal"}),e&&t.push({key:"cancel",label:this.t.common.cancel,icon:"cancel",variant:"tonal"},{key:"pickup",label:this.t.order.pickUp,icon:"directions_car",variant:"filled"}),t}returnDetailActions(n){let e=[{key:"view",label:this.t.dispatch.workList.view,icon:"visibility",variant:"tonal"}];return n.order.status==="in_progress"&&e.push({key:"return",label:this.t.order.complete,icon:"assignment_turned_in",variant:"filled"}),e}payAction(n){this.orderDetail.open(n.order.id,"payments");}viewContractAction(n){this.orderDetail.open(n.order.id,"contract");}cancelAction(n){this.orderDetail.open(n.order.id,"cancellation");}pickupAction(n){this.orderDetail.open(n.order.id,"handover");}returnAction(n){this.orderDetail.open(n.order.id,"handover");}viewAction(n){this.orderDetail.open(n.order.id);}editAction(n){this.orderDetail.edit(n.order.id);}static \u0275fac=function(e){return new(e||i$2)};static \u0275cmp=mE({type:i$2,selectors:[["app-calendar-view"]],inputs:{targetDate:[1,"targetDate"],view:[1,"view"]},outputs:{dateSelected:"dateSelected",view:"viewChange"},decls:29,vars:22,consts:[[1,"calendar-view"],[1,"ui-card","calendar-view__layout"],[1,"flex","flex-col","flex-auto","min-w-0"],[1,"calendar-view__sticky-top"],[1,"calendar-view__header"],[1,"ui-card-titleNav","calendar-view__view-switch"],["type","button",1,"ui-card-titleNav__item",3,"click"],["aria-hidden","true",1,"material-symbols-rounded"],[1,"ui-text-title","calendar-view__month"],[1,"calendar-view__toolbar","flex","items-center","gap-2"],["mat-icon-button",""],["matButton","outlined",3,"click"],[1,"calendar-view__weekday-row"],[1,"calendar-view__grid"],[1,"calendar-view__timeline"],[1,"split-view__panel"],[3,"closed","open","heading","closeLabel","showCloseButton","showHeaderDivider"],["panelHeaderExtra","",1,"calendar-view__relative-chip"],[1,"calendar-view__panel-tabs",3,"selectedIndex"],["mat-icon-button","",3,"click"],[1,"calendar-view__weekday","p-2","text-center","font-bold","calendar-view__muted"],[1,"calendar-view__day","p-2","min-h-16","text-left","cursor-pointer","transition-colors","hover:[background:var(--mat-sys-surface-container-high)]",3,"opacity-40","calendar-view__day--selected"],[1,"calendar-view__day","p-2","min-h-16","text-left","cursor-pointer","transition-colors","hover:[background:var(--mat-sys-surface-container-high)]",3,"click"],[1,"font-bold"],[1,"calendar-view__stats"],[1,"ui-chip","ui-chip--info","calendar-view__stat-chip"],[1,"ui-chip","ui-chip--neutral","calendar-view__stat-chip"],[1,"ui-chip","ui-chip--warning","calendar-view__stat-chip","calendar-view__stat-chip--dispatch"],[1,"calendar-view__available",3,"calendar-view__available--low"],[1,"calendar-view__available"],[3,"dateSelect","targetDate"],[1,"calendar-view__panel-tabs",3,"selectedIndexChange","selectedIndex"],["mat-tab-label",""],["matTabContent",""],[1,"panel-tab-label"],[1,"panel-tab-label__title"],[1,"panel-tab-label__meta"],[1,"flex","items-center","gap-2","px-3","pt-2","pb-1"],[3,"change","checked","disabled"],[1,"pb-4","pt-4","text-sm","calendar-view__muted"],[1,"work-list"],[1,"work-list__empty"],["type","button",1,"work-list-row",3,"click"],[1,"work-list-row__title"],[1,"work-list-row__plate"],[1,"work-list-row__meta"],[3,"class","ui-chip--positive","ui-chip--warning","ui-chip--neutral","ui-chip--info"],[1,"work-list-row__time"],["aria-hidden","true",1,"material-symbols-rounded","work-list-row__chevron"],[1,"panel-tab-label__overdue"],[1,"pb-4","pt-4","calendar-view__muted"],[1,"available-panel"],[1,"available-panel__past"],[1,"available-panel__query"],[1,"available-panel__start"],[1,"available-panel__fields"],["subscriptSizing","dynamic"],["matInput","","type","date",1,"available-panel__return-date",3,"change","min","value"],[1,"available-panel__category",3,"valueChange","value"],["value",""],[3,"value"],[3,"vehicleSelected","start","end","category","selectable"]],template:function(e,t){if(e&1&&(di$1(0,"div",0)(1,"div",1)(2,"section",2)(3,"div",3)(4,"div",4)(5,"nav",5)(6,"button",6),_p("click",function(){return t.setView("calendar")}),di$1(7,"span",7),MI(8,"calendar_month"),Rc(),di$1(9,"span"),MI(10),Rc()(),di$1(11,"button",6),_p("click",function(){return t.setView("timeline")}),di$1(12,"span",7),MI(13,"view_timeline"),Rc(),di$1(14,"span"),MI(15),Rc()()(),VE(16,Xi,2,1,"h2",8),di$1(17,"div",9),VE(18,Ji,3,1,"button",10),di$1(19,"button",11),_p("click",function(){return t.goToToday()}),MI(20),Rc(),VE(21,er,3,1,"button",10),Rc()(),VE(22,nr,3,0,"div",12),Rc(),VE(23,lr,3,0,"div",13)(24,dr,2,1,"div",14),Rc(),di$1(25,"section",15)(26,"lib-responsive-panel",16),_p("closed",function(){return t.dismissPanel()}),VE(27,cr,2,1,"span",17),VE(28,Or,12,3,"mat-tab-group",18),Rc()()()()),e&2){let a;Bv(5),vp("aria-label",t.t.dispatch.viewSwitch),Bv(),Pp("is-active",t.view()==="calendar"),vp("aria-pressed",t.view()==="calendar"),Bv(4),Up(t.t.dispatch.calendar),Bv(),Pp("is-active",t.view()==="timeline"),vp("aria-pressed",t.view()==="timeline"),Bv(4),Up(t.t.dispatch.timeline),Bv(),BE(t.view()==="calendar"?16:-1),Bv(2),BE(t.view()==="calendar"?18:-1),Bv(2),Up(t.t.dispatch.today),Bv(),BE(t.view()==="calendar"?21:-1),Bv(),BE(t.view()==="calendar"?22:-1),Bv(),BE(t.view()==="calendar"?23:24),Bv(3),Dp("open",t.panelOpen())("heading",t.panelHeading())("closeLabel",t.t.common.closePanel)("showCloseButton",t.isNarrow())("showHeaderDivider",false),Bv(),BE((a=t.relativeDayLabel())?27:-1,a),Bv(),BE(t.selected()?28:-1);}},dependencies:[nl,tl,gi$1,ce$1,rt,ae,ln,an,qt$1,zt$3,Ct,ba,Bt,xa,Ht,$t,qt,ka,mt,ve,ut],styles:[`app-calendar-view[_nghost-%COMP%]{display:flex;flex-direction:column;min-height:0}.calendar-view[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}.calendar-view__layout[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:stretch;flex:1 1 auto;min-height:0;overflow:auto}@media(min-width:1280.02px){.calendar-view__layout[_ngcontent-%COMP%]{flex-direction:row}}.split-view__panel[_ngcontent-%COMP%]{overflow:auto;width:0}@media(min-width:1280.02px){.split-view__panel[_ngcontent-%COMP%]{flex:0 0 clamp(320px,32vw,560px);min-width:0;border-left:1px solid var(--mat-sys-outline-variant);width:auto}}.calendar-view__sticky-top[_ngcontent-%COMP%]{position:sticky;top:0;z-index:2;flex:0 0 auto;background:var(--mat-sys-surface)}.calendar-view__header[_ngcontent-%COMP%]{display:flex;min-height:fit-content;align-items:center;flex-wrap:wrap;gap:.5rem 1rem;padding:.75rem 1rem}.calendar-view__month[_ngcontent-%COMP%]{margin:0}.calendar-view__header[_ngcontent-%COMP%]   .calendar-view__toolbar[_ngcontent-%COMP%]{margin-left:auto}.calendar-view__timeline[_ngcontent-%COMP%]{flex:1 1 auto;min-width:0;padding:0 1rem 1rem}.calendar-view__weekday-row[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;background:var(--mat-sys-outline-variant)}.calendar-view__grid[_ngcontent-%COMP%]{flex:1 1 auto;min-width:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-auto-rows:minmax(6rem,1fr);gap:1px;overflow:hidden;background:var(--mat-sys-outline-variant)}.calendar-view__weekday[_ngcontent-%COMP%]{background:var(--mat-sys-surface-container)}.calendar-view__day[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-width:0;background:var(--mat-sys-surface);font-size:.875rem}.calendar-view__day--selected[_ngcontent-%COMP%]{background:var(--mat-button-tonal-container-color, var(--mat-sys-secondary-container))}.calendar-view__day-number--today[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;border-radius:calc(infinity * 1px);background-color:var(--mat-sys-primary);height:1.75rem;width:1.75rem;border-radius:10rem;color:var(--mat-sys-on-primary);font-size:.85rem}.calendar-view__muted[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.calendar-view__stats[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:flex-start;gap:.125rem;margin-top:.125rem}.calendar-view__stat-chip[_ngcontent-%COMP%]{gap:.25rem;padding:.1rem .5rem;font-size:.85rem}.calendar-view__available[_ngcontent-%COMP%]{flex-basis:100%;font-size:.75rem;font-variant-numeric:tabular-nums;color:var(--mat-sys-on-surface-variant)}.calendar-view__available--low[_ngcontent-%COMP%]{font-weight:600;color:var(--app-warning-fg)}@media(max-width:640px){.calendar-view__header[_ngcontent-%COMP%]   .ui-text-title[_ngcontent-%COMP%]{font-size:1.25rem;white-space:nowrap}.calendar-view__toolbar[_ngcontent-%COMP%]{flex-shrink:0;gap:0;margin-bottom:0}.calendar-view__day[_ngcontent-%COMP%]{padding:.375rem .125rem}.calendar-view__stats[_ngcontent-%COMP%]{width:100%}.calendar-view__stat-chip[_ngcontent-%COMP%]{max-width:100%;padding:.125rem .25rem;font-size:clamp(.625rem,2.8vw,.75rem)}.calendar-view__available[_ngcontent-%COMP%]{font-size:clamp(.625rem,2.8vw,.75rem)}}.calendar-view__panel-tabs[_ngcontent-%COMP%]{--mat-tab-container-height: 3.75rem}.panel-tab-label[_ngcontent-%COMP%]{display:inline-flex;flex-direction:column;align-items:center;gap:.125rem;line-height:1.2}.panel-tab-label__title[_ngcontent-%COMP%]{font-size:.9375rem;font-weight:600;font-variant-numeric:tabular-nums}.panel-tab-label__meta[_ngcontent-%COMP%]{display:inline-flex;gap:.375rem;font-size:.75rem;font-weight:400;font-variant-numeric:tabular-nums;color:var(--mat-sys-on-surface-variant)}.panel-tab-label__overdue[_ngcontent-%COMP%]{font-weight:600;color:var(--app-warning-fg)}.available-panel[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem;padding:.75rem 1rem 1rem}.available-panel__query[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem}.available-panel__start[_ngcontent-%COMP%]{margin:0;font-size:.9375rem;font-weight:600;font-variant-numeric:tabular-nums;color:var(--mat-sys-on-surface)}.available-panel__fields[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.available-panel__fields[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%]{width:100%}.available-panel__past[_ngcontent-%COMP%]{margin:0;padding:.75rem 1rem;border:1px dashed var(--mat-sys-outline-variant);border-radius:var(--mat-sys-corner-medium);font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.work-list[_ngcontent-%COMP%]{display:block;margin:0;padding:0;list-style:none}.work-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] + li[_ngcontent-%COMP%]   .work-list-row[_ngcontent-%COMP%]{border-top:1px solid var(--mat-sys-outline-variant)}.work-list-row[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;width:100%;min-height:3.5rem;padding:.75rem 1rem;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.work-list-row[_ngcontent-%COMP%]:hover{background:var(--mat-sys-surface-container-high)}.work-list-row[_ngcontent-%COMP%]:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.work-list-row__title[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:flex-start;gap:4px;flex:1 1 auto;min-width:0;overflow-wrap:anywhere}.work-list-row__time[_ngcontent-%COMP%]{flex:0 0 auto;white-space:nowrap;font-size:1rem;font-weight:500;font-variant-numeric:tabular-nums;color:var(--mat-sys-on-surface-variant)}.work-list-row__chevron[_ngcontent-%COMP%]{flex:0 0 auto;font-size:1.25rem;color:var(--mat-sys-on-surface-variant)}.work-list__empty[_ngcontent-%COMP%]{padding:1rem;color:var(--mat-sys-on-surface-variant)}.work-list-row__plate[_ngcontent-%COMP%]{font-size:1rem;font-weight:600;color:var(--mat-sys-on-surface)}.work-list-row__meta[_ngcontent-%COMP%]{font-size:.875rem;font-weight:400;color:var(--mat-sys-on-surface-variant)}.work-list-row__status-chip[_ngcontent-%COMP%]{align-self:flex-start;display:inline-flex;align-items:center;gap:.25rem;margin-top:2px}.work-list-row__status-chip[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:16px}.ui-chip.work-list-row__status-chip[_ngcontent-%COMP%]{white-space:normal}.calendar-view__relative-chip[_ngcontent-%COMP%]{display:inline-flex;align-items:center;border-radius:999px;padding:.15rem .6rem;font-size:.75rem;font-weight:600;background:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container)}
`,`[_nghost-%COMP%]{display:block;min-width:0}app-root[_nghost-%COMP%]{height:100%}app-dashboard-page[_nghost-%COMP%]{display:flex;flex-direction:column;min-height:0}@media(min-width:1024px)and (min-height:600px){app-dashboard-page[_nghost-%COMP%]{flex:1 1 auto}}app-dashboard-page[_nghost-%COMP%] > .shell-container[_ngcontent-%COMP%]{flex:1 1 auto;height:auto;min-height:0}.app-shell[_ngcontent-%COMP%]{height:100%;background:linear-gradient(135deg,var(--mat-sys-surface-container-low) 0%,var(--mat-sys-surface-container-high) 100%)}.sidenav-container[_ngcontent-%COMP%]{height:100%}.app-sidenav[_ngcontent-%COMP%]{width:280px;border:0;background:var(--app-shell-bg);color:var(--app-shell-on);padding:24px 16px;box-shadow:var(--mat-sys-level4)}.sidenav-container[_ngcontent-%COMP%]   .app-sidenav[_ngcontent-%COMP%]{transition:width .2s ease,transform .4s cubic-bezier(.25,.8,.25,1)}.app-sidenav.collapsed[_ngcontent-%COMP%]{width:84px;padding:24px 12px}.content-area[_ngcontent-%COMP%]{display:flex;flex-direction:column;background:transparent}.page-shell[_ngcontent-%COMP%]{display:flex;flex-direction:column;padding:0 1.5rem 1.5rem;flex:1 0 auto;min-height:0}@media(min-width:1024px)and (min-height:600px){.page-shell--fill[_ngcontent-%COMP%]{flex:1 1 0}}.ui-card-titleNav[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.25rem}.ui-card-titleNav__item[_ngcontent-%COMP%]{display:inline-flex;min-height:2.75rem;align-items:center;gap:.5rem;border:0;border-radius:2rem;padding:.5rem .75rem;background:transparent;color:var(--mat-sys-on-surface-variant);font:inherit;font-size:.875rem;white-space:nowrap;cursor:pointer;transition:background-color .18s ease,color .18s ease,box-shadow .18s ease}.ui-card-titleNav__item[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:1.25rem}.ui-card-titleNav__item[_ngcontent-%COMP%]:hover{background:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.ui-card-titleNav__item[_ngcontent-%COMP%]:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.ui-card-titleNav__item.is-active[_ngcontent-%COMP%]{background:var(--mat-sys-surface-container-highest);color:var(--mat-sys-on-surface);box-shadow:var(--mat-sys-level1)}.page-actions[_ngcontent-%COMP%]{display:flex;gap:.5rem}.empty-state[_ngcontent-%COMP%]{font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.stat-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.stat-card[_ngcontent-%COMP%]{border-radius:1rem;padding:1rem 1.1rem;background:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);box-shadow:var(--mat-sys-level2)}.stat-card__label[_ngcontent-%COMP%]{margin-top:.35rem;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.section-title[_ngcontent-%COMP%]{margin-bottom:.75rem;font-size:1.125rem;font-weight:700;font-family:var(--font-display)}.chip-list[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:.5rem;font-size:.875rem}.alert-chip[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.5rem;border-radius:999px;padding:.35rem .75rem;font-weight:600;background:var(--app-warning-bg);color:var(--app-warning-fg)}.alert-chip--overdue[_ngcontent-%COMP%]{background:var(--app-danger-bg);color:var(--app-danger-fg)}.alert-chip__dot[_ngcontent-%COMP%]{width:.375rem;height:.375rem;border-radius:999px;background:var(--app-warning-dot)}.alert-chip__dot--overdue[_ngcontent-%COMP%]{background:var(--app-danger-dot)}.form-shell[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem;padding-top:.5rem}.tier-row[_ngcontent-%COMP%], .range-row[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:baseline;gap:.75rem}.tier-row[_ngcontent-%COMP%] > mat-form-field[_ngcontent-%COMP%], .range-row[_ngcontent-%COMP%] > mat-form-field[_ngcontent-%COMP%]{flex:1 1 12rem;min-width:0;max-width:100%}.tier-row[_ngcontent-%COMP%] > button[_ngcontent-%COMP%], .range-row[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{flex:0 0 auto}.tier-row[_ngcontent-%COMP%] + .tier-row[_ngcontent-%COMP%], .range-row[_ngcontent-%COMP%] + .range-row[_ngcontent-%COMP%]{margin-top:.75rem}.error-message[_ngcontent-%COMP%]{font-size:.875rem;white-space:pre-wrap;color:var(--app-danger-fg)}.actions[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.5rem}.dialog-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.35rem;font-size:.875rem}.muted[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.stack-block[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem}.mtn-badge[_ngcontent-%COMP%]{display:inline-flex;align-items:center;margin-left:.375rem;border-radius:var(--mat-sys-corner-full, 999px);padding:.15rem .5rem;font-size:.7rem;font-weight:600;white-space:nowrap}.mtn-badge--danger[_ngcontent-%COMP%]{background:var(--app-danger-bg);color:var(--app-danger-fg)}.mtn-badge--warning[_ngcontent-%COMP%]{background:var(--app-warning-bg);color:var(--app-warning-fg)}.maintenance-only-filter-chip[_ngcontent-%COMP%]{border:none;cursor:pointer;font:inherit}.maintenance-only-filter-chip[_ngcontent-%COMP%]:hover, .maintenance-only-filter-chip[_ngcontent-%COMP%]:focus-visible{background:var(--app-info-dot)}.section-header[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between}.vehicle-list[_ngcontent-%COMP%]{display:flex;flex-direction:column}.vehicle-row[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid var(--mat-sys-outline-variant)}.vehicle-row[_ngcontent-%COMP%]:last-child{border-bottom:0}.vehicle-row__plate[_ngcontent-%COMP%]{width:7rem}.vehicle-row__status[_ngcontent-%COMP%]{width:5rem;color:var(--mat-sys-on-surface-variant)}.action-cell[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:center;gap:.25rem}.text-secondary[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}@media(max-width:900px){.app-sidenav[_ngcontent-%COMP%]{width:min(86vw,280px)}.page-shell[_ngcontent-%COMP%]{padding:16px}}@media(min-width:768px){.stat-grid[_ngcontent-%COMP%]{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:767px){.content-area[_ngcontent-%COMP%]:has(.toolbar-actions:not(:empty)){padding-bottom:calc(5.5rem + env(safe-area-inset-bottom))}}@media(max-width:639px){.range-row[_ngcontent-%COMP%] > mat-form-field[_ngcontent-%COMP%]{flex-basis:100%}.range-row[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{margin-left:auto}}
`]})};function zr(i,n){if(i&1&&(di$1(0,"span",9),MI(1),Rc()),i&2){let e=n.$implicit;Bv(),Up(e.plate);}}function Wr(i,n){if(i&1&&(di$1(0,"span",10),MI(1),Rc()),i&2){let e=n.$implicit;Pp("prep-queue__next-pickup--none",!e.hasNextPickup),Bv(),Up(e.nextPickupAt);}}function Hr(i,n){if(i&1){let e=QE();di$1(0,"button",11),_p("click",function(){let a=sl(e).$implicit,o=JE();return al(o.complete(a))}),di$1(1,"span",12),MI(2,"task_alt"),Rc(),MI(3),Rc();}if(i&2){let e=n.$implicit,t=JE();vp("aria-label",t.completeLabel(e)),Bv(3),Lc(" ",t.t.prep.complete," ");}}var yt=class i{t=GP;prepStore=v(k);vehicleStore=v(p);labels=at;columns=[{key:"plate",label:this.t.prep.columns.plate,primary:true},{key:"model",label:this.t.prep.columns.model},{key:"returnedAt",label:this.t.prep.columns.returnedAt},{key:"returnBranchId",label:this.t.prep.columns.returnBranchId},{key:"nextPickupAt",label:this.t.prep.columns.nextPickupAt,primary:true},{key:"actions",label:this.t.common.actions,primary:true,exportSkip:true}];rows=eC(()=>{let n=new Map(this.vehicleStore.vehicles().map(e=>[e.id,e]));return this.prepStore.queue().map(({task:e,nextPickup:t})=>{let a=n.get(e.vehicleId);return {id:e.id,plate:a?.plateNumber??"\u2014",model:a?.model??"\u2014",returnedAt:l(e.returnedAt),returnBranchId:b$1(e.returnBranchId),nextPickupAt:t?l(t.startTime):this.t.prep.noNextPickup,hasNextPickup:!!t}})});completeLabel(n){return this.t.prep.completeAriaLabel.replace("{plate}",n.plate)}complete(n){this.prepStore.complete(n.id,this.t.layout.adminUser);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mE({type:i,selectors:[["app-prep-queue-dialog"]],decls:12,vars:8,consts:[["mat-dialog-title",""],["mat-dialog-content","",1,"prep-queue"],[1,"prep-queue__hint"],[3,"columns","rows","labels","showExport","emptyText"],["dtCell","plate"],["dtCell","nextPickupAt"],["dtCell","actions"],["mat-dialog-actions","","align","end"],["matButton","text","type","button","mat-dialog-close",""],[1,"prep-queue__plate"],[1,"prep-queue__next-pickup"],["matButton","tonal","type","button",1,"prep-queue__complete",3,"click"],["aria-hidden","true",1,"material-symbols-rounded"]],template:function(e,t){e&1&&(di$1(0,"h2",0),MI(1),Rc(),di$1(2,"div",1)(3,"p",2),MI(4),Rc(),di$1(5,"lib-data-table",3),fp(6,zr,2,1,"ng-template",4)(7,Wr,2,3,"ng-template",5)(8,Hr,4,2,"ng-template",6),Rc()(),di$1(9,"div",7)(10,"button",8),MI(11),Rc()()),e&2&&(Bv(),Up(t.t.prep.title),Bv(3),Up(t.t.prep.hint),Bv(),Dp("columns",t.columns)("rows",t.rows())("labels",t.labels)("showExport",false)("emptyText",t.t.prep.empty),Bv(6),Up(t.t.prep.close));},dependencies:[Ht$1,jt$1,Nt$1,zt$1,Vt$1,nl,tl,ce,S],styles:["[_nghost-%COMP%]{display:block}.prep-queue__hint[_ngcontent-%COMP%]{margin:0 0 .75rem;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.prep-queue__plate[_ngcontent-%COMP%]{font-weight:600;color:var(--mat-sys-on-surface)}.prep-queue__next-pickup[_ngcontent-%COMP%]{font-variant-numeric:tabular-nums}.prep-queue__next-pickup--none[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.prep-queue__complete[_ngcontent-%COMP%]{white-space:nowrap}"]})};var $r=()=>({maintenance:"due"});function qr(i,n){if(i&1){let e=QE();di$1(0,"app-page-toolbar",3),_p("searchSubmit",function(a){sl(e);let o=JE();return al(o.onSearchSubmit(a))}),di$1(1,"button",4),_p("click",function(){sl(e);let a=JE();return al(a.openPrepQueue())}),di$1(2,"span",5),MI(3,"cleaning_services"),Rc(),MI(4),Rc(),di$1(5,"a",6)(6,"span",5),MI(7,"car_repair"),Rc(),MI(8),Rc(),di$1(9,"a",7)(10,"span",5),MI(11,"add"),Rc(),MI(12),Rc()();}if(i&2){let e=JE();Dp("placeholder",e.t.dashboard.searchPlaceholder),Bv(),Dp("matBadge",e.pendingPrepCount())("matBadgeHidden",e.pendingPrepCount()===0),Bv(3),Lc(" ",e.t.dashboard.pendingPrep," "),Bv(),Dp("queryParams",$I(9,$r))("matBadge",e.maintenanceStore.alerts().length)("matBadgeHidden",e.maintenanceStore.alerts().length===0),Bv(3),Lc(" ",e.t.dashboard.maintenanceDue," "),Bv(4),Lc(" ",e.t.dashboard.newOrder," ");}}var Ea=class i{t=GP;orderStore=v(b);memberStore=v(D);maintenanceStore=v(g);prepStore=v(k);dialog=v(ee);todayDate=a(new Date);router=v(Ce);route=v(B);targetDate=Fo(a(new Date));queryParamMap=T(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});view=eC(()=>Sa(this.queryParamMap().get(jt)));onViewChange(n){n!==this.view()&&this.router.navigate([],{relativeTo:this.route,queryParams:{[jt]:n==="timeline"?n:null},queryParamsHandling:"merge",replaceUrl:true});}selectCalendarDate(n){this.targetDate.set(a(n));}onSearchSubmit(n){this.router.navigate(["/orders"],{queryParams:{q:n}});}todayPickup=eC(()=>ft(this.orderStore.orders(),this.todayDate));todayPickupTotal=eC(()=>this.todayPickup().total);todayPickupDone=eC(()=>this.todayPickup().done);todayPickupPending=eC(()=>this.todayPickup().pending);todayReturn=eC(()=>vt(this.orderStore.orders(),this.todayDate));todayReturnTotal=eC(()=>this.todayReturn().total);todayReturnDone=eC(()=>this.todayReturn().done);todayReturnPending=eC(()=>this.todayReturn().pending);pendingPrepCount=eC(()=>this.prepStore.openCount());openPrepQueue(){this.dialog.open(yt,{width:"760px",maxWidth:"92vw"});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mE({type:i,selectors:[["app-dashboard-page"]],decls:3,vars:2,consts:[[1,"shell-container"],["appHeaderToolbar",""],[1,"flex-auto",3,"dateSelected","viewChange","targetDate","view"],[3,"searchSubmit","placeholder"],["actions","","type","button","matButton","outlined","aria-haspopup","dialog","matBadgeColor","warn",1,"dashboard-queue","dashboard-queue--prep",3,"click","matBadge","matBadgeHidden"],["aria-hidden","true",1,"material-symbols-rounded"],["actions","","matButton","outlined","routerLink","/vehicles","matBadgeColor","warn",1,"dashboard-queue",3,"queryParams","matBadge","matBadgeHidden"],["actions","","matButton","filled","routerLink","/orders/new",1,"dashboard-new-order"]],template:function(e,t){e&1&&(di$1(0,"div",0),fp(1,qr,13,10,"ng-template",1),di$1(2,"app-calendar-view",2),_p("dateSelected",function(o){return t.selectCalendarDate(o)})("viewChange",function(o){return t.onViewChange(o)}),Rc()()),e&2&&(Bv(2),Dp("targetDate",t.targetDate())("view",t.view()));},dependencies:[gt,j,s,nl,tl,_a,ha,jn],styles:[`[_nghost-%COMP%]{display:block;min-width:0}app-root[_nghost-%COMP%]{height:100%}app-dashboard-page[_nghost-%COMP%]{display:flex;flex-direction:column;min-height:0}@media(min-width:1024px)and (min-height:600px){app-dashboard-page[_nghost-%COMP%]{flex:1 1 auto}}app-dashboard-page[_nghost-%COMP%] > .shell-container[_ngcontent-%COMP%]{flex:1 1 auto;height:auto;min-height:0}.app-shell[_ngcontent-%COMP%]{height:100%;background:linear-gradient(135deg,var(--mat-sys-surface-container-low) 0%,var(--mat-sys-surface-container-high) 100%)}.sidenav-container[_ngcontent-%COMP%]{height:100%}.app-sidenav[_ngcontent-%COMP%]{width:280px;border:0;background:var(--app-shell-bg);color:var(--app-shell-on);padding:24px 16px;box-shadow:var(--mat-sys-level4)}.sidenav-container[_ngcontent-%COMP%]   .app-sidenav[_ngcontent-%COMP%]{transition:width .2s ease,transform .4s cubic-bezier(.25,.8,.25,1)}.app-sidenav.collapsed[_ngcontent-%COMP%]{width:84px;padding:24px 12px}.content-area[_ngcontent-%COMP%]{display:flex;flex-direction:column;background:transparent}.page-shell[_ngcontent-%COMP%]{display:flex;flex-direction:column;padding:0 1.5rem 1.5rem;flex:1 0 auto;min-height:0}@media(min-width:1024px)and (min-height:600px){.page-shell--fill[_ngcontent-%COMP%]{flex:1 1 0}}.ui-card-titleNav[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.25rem}.ui-card-titleNav__item[_ngcontent-%COMP%]{display:inline-flex;min-height:2.75rem;align-items:center;gap:.5rem;border:0;border-radius:2rem;padding:.5rem .75rem;background:transparent;color:var(--mat-sys-on-surface-variant);font:inherit;font-size:.875rem;white-space:nowrap;cursor:pointer;transition:background-color .18s ease,color .18s ease,box-shadow .18s ease}.ui-card-titleNav__item[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:1.25rem}.ui-card-titleNav__item[_ngcontent-%COMP%]:hover{background:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface)}.ui-card-titleNav__item[_ngcontent-%COMP%]:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.ui-card-titleNav__item.is-active[_ngcontent-%COMP%]{background:var(--mat-sys-surface-container-highest);color:var(--mat-sys-on-surface);box-shadow:var(--mat-sys-level1)}.page-actions[_ngcontent-%COMP%]{display:flex;gap:.5rem}.empty-state[_ngcontent-%COMP%]{font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.stat-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.stat-card[_ngcontent-%COMP%]{border-radius:1rem;padding:1rem 1.1rem;background:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);box-shadow:var(--mat-sys-level2)}.stat-card__label[_ngcontent-%COMP%]{margin-top:.35rem;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.section-title[_ngcontent-%COMP%]{margin-bottom:.75rem;font-size:1.125rem;font-weight:700;font-family:var(--font-display)}.chip-list[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:.5rem;font-size:.875rem}.alert-chip[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.5rem;border-radius:999px;padding:.35rem .75rem;font-weight:600;background:var(--app-warning-bg);color:var(--app-warning-fg)}.alert-chip--overdue[_ngcontent-%COMP%]{background:var(--app-danger-bg);color:var(--app-danger-fg)}.alert-chip__dot[_ngcontent-%COMP%]{width:.375rem;height:.375rem;border-radius:999px;background:var(--app-warning-dot)}.alert-chip__dot--overdue[_ngcontent-%COMP%]{background:var(--app-danger-dot)}.form-shell[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem;padding-top:.5rem}.tier-row[_ngcontent-%COMP%], .range-row[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:baseline;gap:.75rem}.tier-row[_ngcontent-%COMP%] > mat-form-field[_ngcontent-%COMP%], .range-row[_ngcontent-%COMP%] > mat-form-field[_ngcontent-%COMP%]{flex:1 1 12rem;min-width:0;max-width:100%}.tier-row[_ngcontent-%COMP%] > button[_ngcontent-%COMP%], .range-row[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{flex:0 0 auto}.tier-row[_ngcontent-%COMP%] + .tier-row[_ngcontent-%COMP%], .range-row[_ngcontent-%COMP%] + .range-row[_ngcontent-%COMP%]{margin-top:.75rem}.error-message[_ngcontent-%COMP%]{font-size:.875rem;white-space:pre-wrap;color:var(--app-danger-fg)}.actions[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.5rem}.dialog-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.35rem;font-size:.875rem}.muted[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.stack-block[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem}.mtn-badge[_ngcontent-%COMP%]{display:inline-flex;align-items:center;margin-left:.375rem;border-radius:var(--mat-sys-corner-full, 999px);padding:.15rem .5rem;font-size:.7rem;font-weight:600;white-space:nowrap}.mtn-badge--danger[_ngcontent-%COMP%]{background:var(--app-danger-bg);color:var(--app-danger-fg)}.mtn-badge--warning[_ngcontent-%COMP%]{background:var(--app-warning-bg);color:var(--app-warning-fg)}.maintenance-only-filter-chip[_ngcontent-%COMP%]{border:none;cursor:pointer;font:inherit}.maintenance-only-filter-chip[_ngcontent-%COMP%]:hover, .maintenance-only-filter-chip[_ngcontent-%COMP%]:focus-visible{background:var(--app-info-dot)}.section-header[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between}.vehicle-list[_ngcontent-%COMP%]{display:flex;flex-direction:column}.vehicle-row[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid var(--mat-sys-outline-variant)}.vehicle-row[_ngcontent-%COMP%]:last-child{border-bottom:0}.vehicle-row__plate[_ngcontent-%COMP%]{width:7rem}.vehicle-row__status[_ngcontent-%COMP%]{width:5rem;color:var(--mat-sys-on-surface-variant)}.action-cell[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:center;gap:.25rem}.text-secondary[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}@media(max-width:900px){.app-sidenav[_ngcontent-%COMP%]{width:min(86vw,280px)}.page-shell[_ngcontent-%COMP%]{padding:16px}}@media(min-width:768px){.stat-grid[_ngcontent-%COMP%]{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:767px){.content-area[_ngcontent-%COMP%]:has(.toolbar-actions:not(:empty)){padding-bottom:calc(5.5rem + env(safe-area-inset-bottom))}}@media(max-width:639px){.range-row[_ngcontent-%COMP%] > mat-form-field[_ngcontent-%COMP%]{flex-basis:100%}.range-row[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{margin-left:auto}}
`]})};export{Ea as DashboardPageComponent};
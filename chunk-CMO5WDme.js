import {Q as Qt,I as It$1}from'./chunk-B3Qni8Lh.js';import {P,M,d as ce,f as fe,V,N as Ne,e as he,g as xe,s as se}from'./chunk-B3g4t1kf.js';import {l as eC,v,A as fP,m as mE,a1 as Ct,n as nl,t as tl,d as di$1,M as MI,R as Rc,an as Ep,bJ as _D,_ as _p,b as UE,a2 as VE,aX as $E,ay as sI,D as Dp,B as Bv,U as Up,bK as MD,e as GE,a3 as BE,P as Pp,Z as m,Y as l,a0 as gi,ag as S,G as GP,bz as Q,V as NP,F as Fo$1,W as nC,T as Ml,az as HI,a$ as hP,L as Lc,b3 as Rp,b4 as iI,a4 as ip,a5 as ms,co as me$1,dp as je,dq as vt,a7 as gt,ap as mC,a9 as Rn$1,ac as ye,aQ as Y,aq as $e$2,ad as Yt,aS as w,dr as Xt,ak as DP,aw as eI,aO as pp,ds as Lt,aE as xp,aH as _n,aF as rI,aG as oI,aP as Np,dt as Vt$1,du as de,bf as ie,aL as On,a8 as Ne$1,be as _i$1,bk as F$1,ab as Lf,aM as J$1,I as zt$2,dv as ot,aU as Eg,bt as kn,bl as sg,K as we,dw as Y$2,cd as vg,aT as Ag,bq as Rg,br as M$1,bu as Or,ct as $t,cZ as Fg,dx as wg,cj as en,aN as L,ci as xt,dy as Qa,ck as U,dz as Pt,dA as de$1,dB as me$2,aj as Mc,av as Qa$1,h as vp,bj as Gp,Q as QE,s as sl,J as JE,f as al,cP as Wr,ao as st$1,ah as H,ar as $r,as as ih,aB as EP,bg as mv,at as Td,au as m$1,ax as tI,b9 as Qp,O as Oc,k as kc,bF as WI,ba as kI,bG as YI,cT as zp,bc as vl,dC as Dl,aA as po$1,aC as wp,aD as yI,dD as r,E as dP,dE as C,dF as Ot,aY as yp,di as sp,bi as FI}from'./main-75DZX6EX.js';import {s as se$1,H as He,K as Ke,J as Je,G as Ge,m as me,_ as _e,Z as Ze,F,v as ve}from'./chunk-BHu089Sz.js';import {i}from'./chunk-BNi7JZ09.js';import {q as qt,z as zt,G as Ge$1}from'./chunk-3Sd-6Sel.js';import {$ as $e$1,O as O$1,H as Ht,N as Nt,z as zt$1,V as Vt}from'./chunk-BL11I4KC.js';import {c as ce$1,r as rt,a as ae,I as It,l as ln,b as an,d as le,Y as Y$1}from'./chunk-oxE4iUvs.js';import {G as Gn,$ as $e,R as Rn,P as Pn,f as fn,c as cn,a as an$1,d as Gt,Q as Q$1,m as m$2}from'./chunk-CWUOc4J_.js';function st(n,o,e=()=>({})){let t=eC(()=>P(n(),o)),i=eC(()=>M(n(),o)),s=eC(()=>{let{vehicleId:A,startLocal:ee,endLocal:Le}=n().rental;return !!A&&!!ee&&!!Le&&!i()}),h=eC(()=>{let{vehicleId:A,startLocal:ee,endLocal:Le}=n().rental;return !A||!ee||!Le?[]:o.findConflicts(A,new Date(ee).toISOString(),new Date(Le).toISOString(),e().editingBookingId)}),b=eC(()=>o.depositCap(t(),i()?.total??0)),ae=eC(()=>n().pricing.depositRequired>b()),Fe=eC(()=>ce(e().originalPriceBreakdown,t(),n().pricing.insurancePlanId));return {vehicle:t,quote:i,quoteUnavailable:s,conflicts:h,depositCap:b,depositExceedsCap:ae,insuranceUnreconciled:Fe}}var bi=["vehicle","period","branches","renter"];function Zn(n,o,e){let{rental:t,renter:i$1,driver:s,pricing:h}=n,b=!!t.startLocal&&!!t.endLocal,ae=b&&new Date(t.endLocal).getTime()<=new Date(t.startLocal).getTime(),Fe=h.depositRequired==null||!Number.isFinite(h.depositRequired)||h.depositRequired<0,A=e.orderForm.problems;return [{section:"rental",group:"vehicle",missing:true,message:A.rentalBaseline,failed:!t.vehicleId},{section:"rental",group:"period",missing:true,message:A.rentalBaseline,failed:!b},{section:"rental",group:"period",message:A.endBeforeStart,failed:ae},{section:"rental",group:"branches",missing:true,message:A.branchesRequired,failed:!t.pickupBranchId||!t.returnBranchId},{section:"rental",group:"vehicle",message:e.orderForm.vehicleConflict,failed:o.conflicts().length>0},{section:"rental",group:"vehicle",message:e.orderForm.quoteUnavailable,failed:o.quoteUnavailable()},{section:"renter",group:"renter",missing:true,message:A.renterBaseline,failed:!i$1.name.trim()||!i$1.phone.trim()},{section:"renter",message:A.driverClassRequired,failed:!!s.licenseNumber.trim()&&!s.standardizedVehicleClass},{section:"pricing",message:A.depositInvalid,failed:Fe},{section:"pricing",message:`${e.orderForm.depositExceedsCap}\uFF08${i(o.depositCap())}\uFF09`,failed:!Fe&&o.depositExceedsCap()},{section:"pricing",message:e.orderForm.insuranceUnreconciled,failed:o.insuranceUnreconciled()},{section:"pricing",message:A.paymentDraftAmountInvalid,failed:n.payments.drafts.some(ee=>ee.amount==null||ee.amount<=0)}]}function Wo(n,o,e){let t={rental:[],renter:[],pricing:[]};for(let i of Zn(n,o,e)){let s=t[i.section];i.failed&&!s.includes(i.message)&&s.push(i.message);}return t}function Xo(n,o,e){let t=Zn(n,o,e);return bi.filter(i=>t.some(s=>s.group===i)).map(i=>{let s=t.filter(h=>h.group===i&&h.failed);return {group:i,met:s.length===0,missing:s.some(h=>h.missing),issues:s.filter(h=>!h.missing).map(h=>h.message)}})}function Jn(n){if(!n.startLocal||!n.endLocal)return;let o=t=>new Date(`${t.slice(0,10)}T00:00:00`).getTime(),e=Math.round((o(n.endLocal)-o(n.startLocal))/864e5);return Number.isFinite(e)&&e>=0?e:void 0}function Yo(n,o){let e=n.reduce((t,i)=>t+(i.amount??0),0);return {collected:e,due:o===void 0?void 0:o-e}}var yi=["panel"],ki=["*"];function xi(n,o){if(n&1&&(Oc(0,"div",1,0),tI(2),kc()),n&2){let e=o.id,t=JE();yI(t._classList),Pp("mat-mdc-autocomplete-visible",t.showPanel)("mat-mdc-autocomplete-hidden",!t.showPanel)("mat-autocomplete-panel-animations-enabled",!t._animationsDisabled)("mat-primary",t._color==="primary")("mat-accent",t._color==="accent")("mat-warn",t._color==="warn"),wp("id",t.id),vp("aria-label",t.ariaLabel||null)("aria-labelledby",t._getPanelAriaLabelledby(e));}}var Mt=class{source;option;constructor(o,e){this.source=o,this.option=e;}},ni=new S("mat-autocomplete-default-options",{providedIn:"root",factory:()=>({autoActiveFirstOption:false,autoSelectActiveOption:false,hideSingleSelectionIndicator:false,requireSelection:false,hasBackdrop:false})}),ii=(()=>{class n{_changeDetectorRef=v(mC);_elementRef=v(Rn$1);_defaults=v(ni);_animationsDisabled=ye();_activeOptionChanges=Y.EMPTY;_keyManager;showPanel=false;get isOpen(){return this._isOpen&&this.showPanel}_isOpen=false;_latestOpeningTrigger;_setColor(e){this._color=e,this._changeDetectorRef.markForCheck();}_color;template;panel;options;optionGroups;ariaLabel;ariaLabelledby;displayWith=null;autoActiveFirstOption;autoSelectActiveOption;requireSelection;panelWidth;disableRipple=false;optionSelected=new $e$2;opened=new $e$2;closed=new $e$2;optionActivated=new $e$2;set classList(e){this._classList=e,this._elementRef.nativeElement.className="";}_classList;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties();}_hideSingleSelectionIndicator;_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck();}id=v(Yt).getId("mat-autocomplete-");inertGroups;constructor(){let e=v(w);this.inertGroups=e?.SAFARI||false,this.autoActiveFirstOption=!!this._defaults.autoActiveFirstOption,this.autoSelectActiveOption=!!this._defaults.autoSelectActiveOption,this.requireSelection=!!this._defaults.requireSelection,this._hideSingleSelectionIndicator=this._defaults.hideSingleSelectionIndicator??false;}ngAfterContentInit(){this._keyManager=new Xt(this.options).withWrap().skipPredicate(this._skipPredicate),this._activeOptionChanges=this._keyManager.change.subscribe(e=>{this.isOpen&&this.optionActivated.emit({source:this,option:this.options.toArray()[e]||null});}),this._setVisibility();}ngOnDestroy(){this._keyManager?.destroy(),this._activeOptionChanges.unsubscribe();}_setScrollTop(e){this.panel&&(this.panel.nativeElement.scrollTop=e);}_getScrollTop(){return this.panel?this.panel.nativeElement.scrollTop:0}_setVisibility(){this.showPanel=!!this.options?.length,this._changeDetectorRef.markForCheck();}_emitSelectEvent(e){let t=new Mt(this,e);this.optionSelected.emit(t);}_getPanelAriaLabelledby(e){if(this.ariaLabel)return null;let t=e?e+" ":"";return this.ariaLabelledby?t+this.ariaLabelledby:e}_skipPredicate(){return  false}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=mE({type:n,selectors:[["mat-autocomplete"]],contentQueries:function(t,i,s){if(t&1&&Np(s,Ct,5)(s,Vt$1,5),t&2){let h;rI(h=oI())&&(i.options=h),rI(h=oI())&&(i.optionGroups=h);}},viewQuery:function(t,i){if(t&1&&xp(_n,7)(yi,5),t&2){let s;rI(s=oI())&&(i.template=s.first),rI(s=oI())&&(i.panel=s.first);}},hostAttrs:[1,"mat-mdc-autocomplete"],inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],displayWith:"displayWith",autoActiveFirstOption:[2,"autoActiveFirstOption","autoActiveFirstOption",DP],autoSelectActiveOption:[2,"autoSelectActiveOption","autoSelectActiveOption",DP],requireSelection:[2,"requireSelection","requireSelection",DP],panelWidth:"panelWidth",disableRipple:[2,"disableRipple","disableRipple",DP],classList:[0,"class","classList"],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",DP]},outputs:{optionSelected:"optionSelected",opened:"opened",closed:"closed",optionActivated:"optionActivated"},exportAs:["matAutocomplete"],features:[HI([{provide:Lt,useExisting:n}])],ngContentSelectors:ki,decls:1,vars:0,consts:[["panel",""],["role","listbox",1,"mat-mdc-autocomplete-panel","mdc-menu-surface","mdc-menu-surface--open",3,"id"]],template:function(t,i){t&1&&(eI(),pp(0,xi,3,17,"ng-template"));},styles:[`div.mat-mdc-autocomplete-panel {
  width: 100%;
  max-height: 256px;
  visibility: hidden;
  transform-origin: center top;
  overflow: auto;
  padding: 8px 0;
  box-sizing: border-box;
  position: relative;
  border-radius: var(--mat-autocomplete-container-shape, var(--mat-sys-corner-extra-small));
  box-shadow: var(--mat-autocomplete-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
  background-color: var(--mat-autocomplete-background-color, var(--mat-sys-surface-container));
}
@media (forced-colors: active) {
  div.mat-mdc-autocomplete-panel {
    outline: solid 1px;
  }
}
.cdk-overlay-pane:not(.mat-mdc-autocomplete-panel-above) div.mat-mdc-autocomplete-panel {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.mat-mdc-autocomplete-panel-above div.mat-mdc-autocomplete-panel {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  transform-origin: center bottom;
}
div.mat-mdc-autocomplete-panel.mat-mdc-autocomplete-visible {
  visibility: visible;
}

div.mat-mdc-autocomplete-panel.mat-mdc-autocomplete-hidden,
.cdk-overlay-pane:has(> .mat-mdc-autocomplete-hidden) {
  visibility: hidden;
  pointer-events: none;
}

@keyframes _mat-autocomplete-enter {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.mat-autocomplete-panel-animations-enabled {
  animation: _mat-autocomplete-enter 120ms cubic-bezier(0, 0, 0.2, 1);
}

mat-autocomplete {
  display: none;
}
`],encapsulation:2})}return n})();var Ci={provide:Q$1,useExisting:po$1(()=>wt),multi:true};var Si=new S("mat-autocomplete-scroll-strategy",{providedIn:"root",factory:()=>{let n=v(ie);return ()=>Ot(n)}}),wt=(()=>{class n{_environmentInjector=v(de);_element=v(Rn$1);_injector=v(ie);_viewContainerRef=v(On);_zone=v(Ne$1);_changeDetectorRef=v(mC);_dir=v(_i$1,{optional:true});_formField=v(Y$1,{optional:true,host:true});_viewportRuler=v(F$1);_scrollStrategy=v(Si);_renderer=v(Lf);_animationsDisabled=ye();_defaults=v(ni,{optional:true});_overlayRef=null;_portal;_componentDestroyed=false;_initialized=new J$1;_keydownSubscription;_outsideClickSubscription;_cleanupWindowBlur;_previousValue=null;_valueOnAttach=null;_valueOnLastKeydown=null;_positionStrategy;_manuallyFloatingLabel=false;_closingActionsSubscription;_viewportSubscription=Y.EMPTY;_breakpointObserver=v(zt$2);_handsetLandscapeSubscription=Y.EMPTY;_canOpenOnNextFocus=true;_valueBeforeAutoSelection;_pendingAutoselectedOption=null;_closeKeyEventStream=new J$1;_overlayPanelClass=ot(this._defaults?.overlayPanelClass||[]);_windowBlurHandler=()=>{this._canOpenOnNextFocus=this.panelOpen||!this._hasFocus();};_onChange=()=>{};_onTouched=()=>{};autocomplete;position="auto";connectedTo;autocompleteAttribute="off";autocompleteDisabled=false;_aboveClass="mat-mdc-autocomplete-panel-above";ngAfterViewInit(){this._initialized.next(),this._initialized.complete(),this._cleanupWindowBlur=this._renderer.listen("window","blur",this._windowBlurHandler);}ngOnChanges(e){e.position&&this._positionStrategy&&(this._setStrategyPositions(this._positionStrategy),this.panelOpen&&this._overlayRef.updatePosition());}ngOnDestroy(){this._cleanupWindowBlur?.(),this._handsetLandscapeSubscription.unsubscribe(),this._viewportSubscription.unsubscribe(),this._componentDestroyed=true,this._destroyPanel(),this._closeKeyEventStream.complete();}get panelOpen(){return this._overlayAttached&&this.autocomplete.showPanel}_overlayAttached=false;openPanel(){this._openPanelInternal();}closePanel(){this._resetLabel(),this._overlayAttached&&(this.panelOpen&&this._zone.run(()=>{this.autocomplete.closed.emit();}),this.autocomplete._latestOpeningTrigger===this&&(this.autocomplete._isOpen=false,this.autocomplete._latestOpeningTrigger=null),this._overlayAttached=false,this._pendingAutoselectedOption=null,this._overlayRef&&this._overlayRef.hasAttached()&&(this._overlayRef.detach(),this._closingActionsSubscription.unsubscribe()),this._updatePanelState(),this._componentDestroyed||this._changeDetectorRef.detectChanges());}updatePosition(){this._overlayAttached&&this._overlayRef.updatePosition();}get panelClosingActions(){return Eg(this.optionSelections,this.autocomplete._keyManager.tabOut.pipe(kn(()=>this._overlayAttached)),this._closeKeyEventStream,this._getOutsideClickStream(),this._overlayRef?this._overlayRef.detachments().pipe(kn(()=>this._overlayAttached)):sg()).pipe(we(e=>e instanceof Y$2?e:null))}optionSelections=vg(()=>{let e=this.autocomplete?this.autocomplete.options:null;return e?e.changes.pipe(Ag(e),Rg(()=>Eg(...e.map(t=>t.onSelectionChange)))):this._initialized.pipe(Rg(()=>this.optionSelections))});get activeOption(){return this.autocomplete&&this.autocomplete._keyManager?this.autocomplete._keyManager.activeItem:null}_getOutsideClickStream(){return new M$1(e=>{let t=s=>{let h=C(s),b=this._formField?this._formField.getConnectedOverlayOrigin().nativeElement:null,ae=this.connectedTo?this.connectedTo.elementRef.nativeElement:null;this._overlayAttached&&h!==this._element.nativeElement&&!this._hasFocus()&&(!b||!b.contains(h))&&(!ae||!ae.contains(h))&&this._overlayRef&&!this._overlayRef.overlayElement.contains(h)&&e.next(s);},i=[this._renderer.listen("document","click",t),this._renderer.listen("document","auxclick",t),this._renderer.listen("document","touchend",t)];return ()=>{i.forEach(s=>s());}})}writeValue(e){Promise.resolve(null).then(()=>this._assignOptionValue(e));}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this._element.nativeElement.disabled=e;}_handleKeydown(e){let t=e,i=t.keyCode,s=Or(t);if(i===27&&!s&&t.preventDefault(),this._valueOnLastKeydown=this._element.nativeElement.value,this.activeOption&&i===13&&this.panelOpen&&!s)this.activeOption._selectViaInteraction(),this._resetActiveItem(),t.preventDefault();else if(this.autocomplete){let h=this.autocomplete._keyManager.activeItem,b=i===38||i===40;i===9||b&&!s&&this.panelOpen?this.autocomplete._keyManager.onKeydown(t):b&&this._canOpen()&&this._openPanelInternal(this._valueOnLastKeydown),(b||this.autocomplete._keyManager.activeItem!==h)&&(this._scrollToOption(this.autocomplete._keyManager.activeItemIndex||0),this.autocomplete.autoSelectActiveOption&&this.activeOption&&(this._pendingAutoselectedOption||(this._valueBeforeAutoSelection=this._valueOnLastKeydown),this._pendingAutoselectedOption=this.activeOption,this._assignOptionValue(this.activeOption.value)));}}_handleInput(e){let t=e.target,i=t.value;if(t.type==="number"&&(i=i==""?null:parseFloat(i)),this._previousValue!==i){if(this._previousValue=i,this._pendingAutoselectedOption=null,(!this.autocomplete||!this.autocomplete.requireSelection)&&this._onChange(i),!i)this._clearPreviousSelectedOption(null,false);else if(this.panelOpen&&!this.autocomplete.requireSelection){let s=this.autocomplete.options?.find(h=>h.selected);if(s){let h=this._getDisplayValue(s.value);i!==h&&s.deselect(false);}}if(this._canOpen()&&this._hasFocus()){let s=this._valueOnLastKeydown??this._element.nativeElement.value;this._valueOnLastKeydown=null,this._openPanelInternal(s);}}}_handleFocus(){this._canOpenOnNextFocus?this._canOpen()&&(this._previousValue=this._element.nativeElement.value,this._attachOverlay(this._previousValue),this._floatLabel(true)):this._canOpenOnNextFocus=true;}_handleClick(){this._canOpen()&&!this.panelOpen&&this._openPanelInternal();}_hasFocus(){return $t()===this._element.nativeElement}_floatLabel(e=false){this._formField&&this._formField.floatLabel==="auto"&&(e?this._formField._animateAndLockLabel():this._formField.floatLabel="always",this._manuallyFloatingLabel=true);}_resetLabel(){this._manuallyFloatingLabel&&(this._formField&&(this._formField.floatLabel="auto"),this._manuallyFloatingLabel=false);}_subscribeToClosingActions(){let e=new M$1(i=>{mv(()=>{i.next();},{injector:this._environmentInjector});}),t=this.autocomplete.options?.changes.pipe(Fg(()=>this._positionStrategy.reapplyLastPosition()),wg(0))??sg();return Eg(e,t).pipe(Rg(()=>this._zone.run(()=>{let i=this.panelOpen;return this._resetActiveItem(),this._updatePanelState(),this._changeDetectorRef.detectChanges(),this.panelOpen&&this._overlayRef.updatePosition(),i!==this.panelOpen&&(this.panelOpen?this._emitOpened():this.autocomplete.closed.emit()),this.panelClosingActions})),en(1)).subscribe(i=>this._setValueAndClose(i))}_emitOpened(){this.autocomplete.opened.emit();}_destroyPanel(){this._overlayRef&&(this.closePanel(),this._overlayRef.dispose(),this._overlayRef=null);}_getDisplayValue(e){let t=this.autocomplete;return t&&t.displayWith?t.displayWith(e):e}_assignOptionValue(e){let t=this._getDisplayValue(e);e==null&&this._clearPreviousSelectedOption(null,false),this._updateNativeInputValue(t??"");}_updateNativeInputValue(e){this._formField?this._formField._control.value=e:this._element.nativeElement.value=e,this._previousValue=e;}_setValueAndClose(e){let t=this.autocomplete,i=e?e.source:this._pendingAutoselectedOption;i?(this._clearPreviousSelectedOption(i),this._assignOptionValue(i.value),this._onChange(i.value),t._emitSelectEvent(i),this._element.nativeElement.focus()):t.requireSelection&&this._element.nativeElement.value!==this._valueOnAttach&&(this._clearPreviousSelectedOption(null),this._assignOptionValue(null),this._onChange(null)),this.closePanel();}_clearPreviousSelectedOption(e,t){this.autocomplete?.options?.forEach(i=>{i!==e&&i.selected&&i.deselect(t);});}_openPanelInternal(e=this._element.nativeElement.value){this._attachOverlay(e),this._floatLabel();}_attachOverlay(e){if(!this.autocomplete)return;let t=this._overlayRef;t?(this._positionStrategy.setOrigin(this._getConnectedElement()),t.updateSize({width:this._getPanelWidth()})):(this._portal=new L(this.autocomplete.template,this._viewContainerRef,{id:this._formField?.getLabelId()}),t=xt(this._injector,this._getOverlayConfig()),this._overlayRef=t,this._viewportSubscription=this._viewportRuler.change().subscribe(()=>{this.panelOpen&&t&&t.updateSize({width:this._getPanelWidth()});}),this._handsetLandscapeSubscription=this._breakpointObserver.observe(Qa.HandsetLandscape).subscribe(s=>{s.matches?this._positionStrategy.withFlexibleDimensions(true).withGrowAfterOpen(true).withViewportMargin(8):this._positionStrategy.withFlexibleDimensions(false).withGrowAfterOpen(false).withViewportMargin(0);})),t&&!t.hasAttached()&&(t.attach(this._portal),this._valueOnAttach=e,this._valueOnLastKeydown=null,this._closingActionsSubscription=this._subscribeToClosingActions());let i=this.panelOpen;this.autocomplete._isOpen=this._overlayAttached=true,this.autocomplete._latestOpeningTrigger=this,this.autocomplete._setColor(this._formField?.color),this._updatePanelState(),this.panelOpen&&i!==this.panelOpen&&this._emitOpened();}_handlePanelKeydown=e=>{(e.keyCode===27&&!Or(e)||e.keyCode===38&&Or(e,"altKey"))&&(this._pendingAutoselectedOption&&(this._updateNativeInputValue(this._valueBeforeAutoSelection??""),this._pendingAutoselectedOption=null),this._closeKeyEventStream.next(),this._resetActiveItem(),e.stopPropagation(),e.preventDefault());};_updatePanelState(){if(this.autocomplete._setVisibility(),this.panelOpen){let e=this._overlayRef;this._keydownSubscription||(this._keydownSubscription=e.keydownEvents().subscribe(this._handlePanelKeydown)),this._outsideClickSubscription||(this._outsideClickSubscription=e.outsidePointerEvents().subscribe());}else this._keydownSubscription?.unsubscribe(),this._outsideClickSubscription?.unsubscribe(),this._keydownSubscription=this._outsideClickSubscription=void 0;}_getOverlayConfig(){return new U({positionStrategy:this._getOverlayPosition(),scrollStrategy:this._scrollStrategy(),width:this._getPanelWidth(),direction:this._dir??void 0,hasBackdrop:this._defaults?.hasBackdrop,backdropClass:this._defaults?.backdropClass||"cdk-overlay-transparent-backdrop",panelClass:this._overlayPanelClass,disableAnimations:this._animationsDisabled})}_getOverlayPosition(){let e=Pt(this._injector,this._getConnectedElement()).withFlexibleDimensions(false).withPush(false).withPopoverLocation("inline");return this._setStrategyPositions(e),this._positionStrategy=e,e}_setStrategyPositions(e){let t=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"}],i=this._aboveClass,s=[{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:i},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom",panelClass:i}],h;this.position==="above"?h=s:this.position==="below"?h=t:h=[...t,...s],e.withPositions(h);}_getConnectedElement(){return this.connectedTo?this.connectedTo.elementRef:this._formField?this._formField.getConnectedOverlayOrigin():this._element}_getPanelWidth(){return this.autocomplete.panelWidth||this._getHostWidth()}_getHostWidth(){return this._getConnectedElement().nativeElement.getBoundingClientRect().width}_resetActiveItem(){let e=this.autocomplete;if(e.autoActiveFirstOption){let t=-1;for(let i=0;i<e.options.length;i++)if(!e.options.get(i).disabled){t=i;break}e._keyManager.setActiveItem(t);}else e._keyManager.setActiveItem(-1);}_canOpen(){let e=this._element.nativeElement;return !e.readOnly&&!e.disabled&&!this.autocompleteDisabled}_scrollToOption(e){let t=this.autocomplete,i=de$1(e,t.options,t.optionGroups);if(e===0&&i===1)t._setScrollTop(0);else if(t.panel){let s=t.options.toArray()[e];if(s){let h=s._getHostElement(),b=me$2(h.offsetTop,h.offsetHeight,t._getScrollTop(),t.panel.nativeElement.offsetHeight);t._setScrollTop(b);}}}static \u0275fac=function(t){return new(t||n)};static \u0275dir=Mc({type:n,selectors:[["input","matAutocomplete",""],["textarea","matAutocomplete",""]],hostAttrs:[1,"mat-mdc-autocomplete-trigger"],hostVars:7,hostBindings:function(t,i){t&1&&_p("focusin",function(){return i._handleFocus()})("blur",function(){return i._onTouched()})("input",function(h){return i._handleInput(h)})("keydown",function(h){return i._handleKeydown(h)})("click",function(){return i._handleClick()}),t&2&&vp("autocomplete",i.autocompleteAttribute)("role",i.autocompleteDisabled?null:"combobox")("aria-autocomplete",i.autocompleteDisabled?null:"list")("aria-activedescendant",i.panelOpen&&i.activeOption?i.activeOption.id:null)("aria-expanded",i.autocompleteDisabled?null:i.panelOpen.toString())("aria-controls",i.autocompleteDisabled||!i.panelOpen?null:i.autocomplete?.id)("aria-haspopup",i.autocompleteDisabled?null:"listbox");},inputs:{autocomplete:[0,"matAutocomplete","autocomplete"],position:[0,"matAutocompletePosition","position"],connectedTo:[0,"matAutocompleteConnectedTo","connectedTo"],autocompleteAttribute:[0,"autocomplete","autocompleteAttribute"],autocompleteDisabled:[2,"matAutocompleteDisabled","autocompleteDisabled",DP]},exportAs:["matAutocompleteTrigger"],features:[HI([Ci]),Qa$1]})}return n})(),oi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=ip({type:n});static \u0275inj=ms({imports:[me$1,je,vt,je,gt]})}return n})();var Ii=(n,o)=>o.id;function Mi(n,o){if(n&1&&(di$1(0,"mat-option",5),MI(1),Rc()),n&2){let e=o.$implicit;Dp("value",e.id),Bv(),Gp("",e.name,"\uFF08",e.phone,"\uFF09");}}function wi(n,o){if(n&1){let e=QE();di$1(0,"button",11),_p("click",function(){sl(e);let i=JE();return al(i.changeMember())}),MI(1),Rc();}if(n&2){let e=JE();Bv(),Lc(" ",e.t.member.changeMember," ");}}function Pi(n,o){if(n&1&&(di$1(0,"mat-option",5),MI(1),Rc()),n&2){let e=o.$implicit,t=JE();Dp("value",e),Bv(),Up(t.t.member.kindLabels[e]);}}function Ti(n,o){if(n&1&&(di$1(0,"mat-form-field")(1,"mat-label"),MI(2),Rc(),Ep(3,"input",12),_D(),Rc()),n&2){let e=JE();Bv(2),Up(e.t.member.nationality),Bv(),MD();}}var ai=class n{t=v(fe);kinds=["local","foreign_visitor","resident"];data=v(V);form=fP.required();value=Ne(this.form);locked=eC(()=>!!this.value().renter.memberId);isForeignVisitor=eC(()=>this.value().renter.kind==="foreign_visitor");identityNumberLabel=eC(()=>this.t.member.identityNumberLabel[this.value().renter.kind]);memberSuggestions=eC(()=>this.locked()?[]:this.data.searchMembers(this.value().renter.name));onMemberSelected(o){let e=this.data.memberById(o.option.value);e&&(he(this.form(),e),this.form().controls.renter.markAsDirty());}changeMember(){xe(this.form()),this.form().controls.renter.markAsDirty();}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=mE({type:n,selectors:[["lib-order-renter-section"]],inputs:{form:[1,"form"]},decls:35,vars:13,consts:[["memberAuto","matAutocomplete"],[1,"order-section",3,"formGroup"],[1,"order-section__grid"],["matInput","","formControlName","name","autocomplete","off",3,"matAutocomplete"],[3,"optionSelected"],[3,"value"],["matInput","","type","tel","formControlName","phone"],["mat-button","","type","button",1,"self-start"],["formControlName","kind"],["matInput","","formControlName","idNumber"],["matInput","","type","email","formControlName","email"],["mat-button","","type","button",1,"self-start",3,"click"],["matInput","","formControlName","nationality"]],template:function(e,t){if(e&1&&(di$1(0,"div",1)(1,"div",2)(2,"mat-form-field")(3,"mat-label"),MI(4),Rc(),Ep(5,"input",3),_D(),di$1(6,"mat-autocomplete",4,0),_p("optionSelected",function(s){return t.onMemberSelected(s)}),UE(8,Mi,2,3,"mat-option",5,Ii),Rc(),di$1(10,"mat-error"),MI(11),Rc()(),di$1(12,"mat-form-field")(13,"mat-label"),MI(14),Rc(),Ep(15,"input",6),_D(),di$1(16,"mat-error"),MI(17),Rc()()(),VE(18,wi,2,1,"button",7),di$1(19,"div",2)(20,"mat-form-field")(21,"mat-label"),MI(22),Rc(),di$1(23,"mat-select",8),UE(24,Pi,2,2,"mat-option",5,$E),Rc(),_D(),Rc(),di$1(26,"mat-form-field")(27,"mat-label"),MI(28),Rc(),Ep(29,"input",9),_D(),Rc(),VE(30,Ti,4,1,"mat-form-field"),di$1(31,"mat-form-field")(32,"mat-label"),MI(33),Rc(),Ep(34,"input",10),_D(),Rc()()()),e&2){let i=sI(7);Dp("formGroup",t.form().controls.renter),Bv(4),Up(t.t.member.name),Bv(),Dp("matAutocomplete",i),MD(),Bv(3),GE(t.memberSuggestions()),Bv(3),Up(t.t.orderForm.required),Bv(3),Up(t.t.member.phone),Bv(),MD(),Bv(2),Up(t.t.orderForm.required),Bv(),BE(t.locked()?18:-1),Bv(4),Up(t.t.member.kind),Bv(),MD(),Bv(),GE(t.kinds),Bv(4),Up(t.identityNumberLabel()),Bv(),MD(),Bv(),BE(t.isForeignVisitor()?30:-1),Bv(),Pp("order-section__full",!t.isForeignVisitor()),Bv(2),Up(t.t.member.email),Bv(),MD();}},dependencies:[Gn,$e,Rn,Pn,fn,cn,oi,ii,Ct,wt,nl,tl,ce$1,rt,ae,It,ln,an,qt,zt],styles:["[_nghost-%COMP%]{display:block;min-width:0}.order-section[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem}.order-section__grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1rem;row-gap:.25rem}@media(max-width:600px){.order-section__grid[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr)}}.order-section__full[_ngcontent-%COMP%]{grid-column:1/-1}.order-section__subtitle[_ngcontent-%COMP%]{margin:1.25rem 0 .5rem;font-size:1.0625rem;font-weight:600;color:var(--mat-sys-on-surface)}.order-section__notice[_ngcontent-%COMP%]{margin:0 0 .75rem;font-size:1rem;color:var(--mat-sys-error)}.order-section__hint[_ngcontent-%COMP%]{margin:0 0 .75rem;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.order-section__dl[_ngcontent-%COMP%]{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:.625rem 1.5rem;margin:0 0 1rem;font-size:1rem}.order-section__dl[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.order-section__dl[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%]{margin:0;color:var(--mat-sys-on-surface);overflow-wrap:anywhere}.order-section__dl[_ngcontent-%COMP%]   .is-total[_ngcontent-%COMP%]{font-weight:600}"]})};var Di=["input"],Ri=["formField"],Ai=["*"],mt=class{source;value;constructor(o,e){this.source=o,this.value=e;}},Fi={provide:Q$1,useExisting:po$1(()=>Dt),multi:true},di=new S("MatRadioGroup"),Li=new S("mat-radio-default-options",{providedIn:"root",factory:()=>({color:"accent",disabledInteractive:false})}),Dt=(()=>{class n{_changeDetector=v(mC);_value=null;_name=v(Yt).getId("mat-radio-group-");_selected=null;_isInitialized=false;_labelPosition="after";_disabled=false;_required=false;_buttonChanges;_controlValueAccessorChangeFn=()=>{};onTouched=()=>{};change=new $e$2;_radios;color;get name(){return this._name}set name(e){this._name=e,this._updateRadioButtonNames();}get labelPosition(){return this._labelPosition}set labelPosition(e){this._labelPosition=e==="before"?"before":"after",this._markRadiosForCheck();}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this._updateSelectedRadioFromValue(),this._checkSelectedRadioButton());}_checkSelectedRadioButton(){this._selected&&!this._selected.checked&&(this._selected.checked=true);}get selected(){return this._selected}set selected(e){this._selected=e,this.value=e?e.value:null,this._checkSelectedRadioButton();}get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._markRadiosForCheck();}get required(){return this._required}set required(e){this._required=e,this._markRadiosForCheck();}get disabledInteractive(){return this._disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e,this._markRadiosForCheck();}_disabledInteractive=false;ngAfterContentInit(){this._isInitialized=true,this._buttonChanges=this._radios.changes.subscribe(()=>{this.selected&&!this._radios.find(e=>e===this.selected)&&(this._selected=null);});}ngOnDestroy(){this._buttonChanges?.unsubscribe();}_touch(){this.onTouched&&this.onTouched();}_updateRadioButtonNames(){this._radios&&this._radios.forEach(e=>{e.name=this.name,e._markForCheck();});}_updateSelectedRadioFromValue(){let e=this._selected!==null&&this._selected.value===this._value;this._radios&&!e&&(this._selected=null,this._radios.forEach(t=>{t.checked=this.value===t.value,t.checked&&(this._selected=t);}));}_emitChangeEvent(){this._isInitialized&&this.change.emit(new mt(this._selected,this._value));}_markRadiosForCheck(){this._radios&&this._radios.forEach(e=>e._markForCheck());}writeValue(e){this.value=e,this._changeDetector.markForCheck();}registerOnChange(e){this._controlValueAccessorChangeFn=e;}registerOnTouched(e){this.onTouched=e;}setDisabledState(e){this.disabled=e,this._changeDetector.markForCheck();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=Mc({type:n,selectors:[["mat-radio-group"]],contentQueries:function(t,i,s){if(t&1&&Np(s,pt,5),t&2){let h;rI(h=oI())&&(i._radios=h);}},hostAttrs:["role","radiogroup",1,"mat-mdc-radio-group"],inputs:{color:"color",name:"name",labelPosition:"labelPosition",value:"value",selected:"selected",disabled:[2,"disabled","disabled",DP],required:[2,"required","required",DP],disabledInteractive:[2,"disabledInteractive","disabledInteractive",DP]},outputs:{change:"change"},exportAs:["matRadioGroup"],features:[HI([Fi,{provide:di,useExisting:n}])]})}return n})(),pt=(()=>{class n{_elementRef=v(Rn$1);_changeDetector=v(mC);_focusMonitor=v(st$1);_radioDispatcher=v(Ge$1);_defaultOptions=v(Li,{optional:true});_ngZone=v(Ne$1);_renderer=v(Lf);_uniqueId=v(Yt).getId("mat-radio-");_cleanupClick;id=this._uniqueId;name;ariaLabel;ariaLabelledby;ariaDescribedby;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked!==e&&(this._checked=e,e&&this.radioGroup&&this.radioGroup.value!==this.value?this.radioGroup.selected=this:!e&&this.radioGroup&&this.radioGroup.value===this.value&&(this.radioGroup.selected=null),e&&this._radioDispatcher.notify(this.id,this.name),this._changeDetector.markForCheck());}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this.radioGroup!==null&&(this.checked||(this.checked=this.radioGroup.value===e),this.checked&&(this.radioGroup.selected=this)));}get labelPosition(){return this._labelPosition||this.radioGroup&&this.radioGroup.labelPosition||"after"}set labelPosition(e){this._labelPosition=e;}_labelPosition;get disabled(){return this._disabled||this.radioGroup!==null&&this.radioGroup.disabled}set disabled(e){this._setDisabled(e);}get required(){return this._required||this.radioGroup&&this.radioGroup.required}set required(e){e!==this._required&&this._changeDetector.markForCheck(),this._required=e;}get color(){return this._color||this.radioGroup&&this.radioGroup.color||this._defaultOptions&&this._defaultOptions.color||"accent"}set color(e){this._color=e;}_color;get disabledInteractive(){return this._disabledInteractive||this.radioGroup!==null&&this.radioGroup.disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e;}_disabledInteractive;change=new $e$2;radioGroup;get inputId(){return `${this.id||this._uniqueId}-input`}_checked=false;_disabled=false;_required=false;_value=null;_removeUniqueSelectionListener=()=>{};_previousTabIndex;_inputElement;_rippleTrigger;_noopAnimations=ye();_injector=v(ie);constructor(){v(H).load($r);let e=v(di,{optional:true}),t=v(new ih("tabindex"),{optional:true});this.radioGroup=e,this._disabledInteractive=this._defaultOptions?.disabledInteractive??false,t&&(this.tabIndex=EP(t,0));}focus(e,t){t?this._focusMonitor.focusVia(this._inputElement,t,e):this._inputElement.nativeElement.focus(e);}_markForCheck(){this._changeDetector.markForCheck();}ngOnInit(){this.radioGroup&&(this.checked=this.radioGroup.value===this._value,this.checked&&(this.radioGroup.selected=this),this.name=this.radioGroup.name),this._removeUniqueSelectionListener=this._radioDispatcher.listen((e,t)=>{e!==this.id&&t===this.name&&(this.checked=false);});}ngDoCheck(){this._updateTabIndex();}ngAfterViewInit(){this._updateTabIndex(),this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{!e&&this.radioGroup&&this.radioGroup._touch();}),this._ngZone.runOutsideAngular(()=>{this._cleanupClick=this._renderer.listen(this._inputElement.nativeElement,"click",this._onInputClick);});}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._removeUniqueSelectionListener();}_emitChangeEvent(){this.change.emit(new mt(this,this._value));}_isRippleDisabled(){return this.disableRipple||this.disabled}_onInputInteraction(e){if(e.stopPropagation(),!this.checked&&!this.disabled){let t=this.radioGroup&&this.value!==this.radioGroup.value;this.checked=true,this._emitChangeEvent(),this.radioGroup&&(this.radioGroup._controlValueAccessorChangeFn(this.value),t&&this.radioGroup._emitChangeEvent());}}_onTouchTargetClick(e){this._onInputInteraction(e),(!this.disabled||this.disabledInteractive)&&this._inputElement?.nativeElement.focus();}_setDisabled(e){this._disabled!==e&&(this._disabled=e,this._changeDetector.markForCheck());}_onInputClick=e=>{this.disabled&&this.disabledInteractive&&e.preventDefault();};_updateTabIndex(){let e=this.radioGroup,t;if(!e||!e.selected||this.disabled?t=this.tabIndex:t=e.selected===this?this.tabIndex:-1,t!==this._previousTabIndex){let i=this._inputElement?.nativeElement;i&&(i.setAttribute("tabindex",t+""),this._previousTabIndex=t,mv(()=>{queueMicrotask(()=>{e&&e.selected&&e.selected!==this&&document.activeElement===i&&(e.selected?._inputElement.nativeElement.focus(),document.activeElement===i&&this._inputElement.nativeElement.blur());});},{injector:this._injector}));}}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=mE({type:n,selectors:[["mat-radio-button"]],viewQuery:function(t,i){if(t&1&&xp(Di,5)(Ri,7,Rn$1),t&2){let s;rI(s=oI())&&(i._inputElement=s.first),rI(s=oI())&&(i._rippleTrigger=s.first);}},hostAttrs:[1,"mat-mdc-radio-button"],hostVars:19,hostBindings:function(t,i){t&1&&_p("focus",function(){return i._inputElement.nativeElement.focus()}),t&2&&(vp("id",i.id)("tabindex",null)("aria-label",null)("aria-labelledby",null)("aria-describedby",null),Pp("mat-primary",i.color==="primary")("mat-accent",i.color==="accent")("mat-warn",i.color==="warn")("mat-mdc-radio-checked",i.checked)("mat-mdc-radio-disabled",i.disabled)("mat-mdc-radio-disabled-interactive",i.disabledInteractive)("_mat-animation-noopable",i._noopAnimations));},inputs:{id:"id",name:"name",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],disableRipple:[2,"disableRipple","disableRipple",DP],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:EP(e)],checked:[2,"checked","checked",DP],value:"value",labelPosition:"labelPosition",disabled:[2,"disabled","disabled",DP],required:[2,"required","required",DP],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",DP]},outputs:{change:"change"},exportAs:["matRadioButton"],ngContentSelectors:Ai,decls:13,vars:17,consts:[["formField",""],["input",""],["mat-internal-form-field","",3,"labelPosition"],[1,"mdc-radio"],["aria-hidden","true",1,"mat-mdc-radio-touch-target",3,"click"],["type","radio","aria-invalid","false",1,"mdc-radio__native-control",3,"change","id","checked","disabled","required"],["aria-hidden","true",1,"mdc-radio__background"],[1,"mdc-radio__outer-circle"],[1,"mdc-radio__inner-circle"],["mat-ripple","","aria-hidden","true",1,"mat-radio-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mat-ripple-element","mat-radio-persistent-ripple"],[1,"mdc-label",3,"for"]],template:function(t,i){t&1&&(eI(),di$1(0,"div",2,0)(2,"div",3)(3,"div",4),_p("click",function(h){return i._onTouchTargetClick(h)}),Rc(),di$1(4,"input",5,1),_p("change",function(h){return i._onInputInteraction(h)}),Rc(),di$1(6,"div",6),Ep(7,"div",7)(8,"div",8),Rc(),di$1(9,"div",9),Ep(10,"div",10),Rc()(),di$1(11,"label",11),tI(12),Rc()()),t&2&&(Dp("labelPosition",i.labelPosition),Bv(2),Pp("mdc-radio--disabled",i.disabled),Bv(2),Dp("id",i.inputId)("checked",i.checked)("disabled",i.disabled&&!i.disabledInteractive)("required",i.required),vp("name",i.name)("value",i.value)("aria-label",i.ariaLabel)("aria-labelledby",i.ariaLabelledby)("aria-describedby",i.ariaDescribedby)("aria-disabled",i.disabled&&i.disabledInteractive?"true":null),Bv(5),Dp("matRippleTrigger",i._rippleTrigger.nativeElement)("matRippleDisabled",i._isRippleDisabled())("matRippleCentered",true),Bv(2),Dp("for",i.inputId));},dependencies:[Td,m$1],styles:[`.mat-mdc-radio-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-radio-button .mdc-radio {
  display: inline-block;
  position: relative;
  flex: 0 0 auto;
  box-sizing: content-box;
  width: 20px;
  height: 20px;
  will-change: opacity, transform, border-color, color;
  padding: calc((var(--mat-radio-state-layer-size, 40px) - 20px) / 2);
  cursor: pointer;
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:not([disabled]):not(:focus) ~ .mdc-radio__background::before {
  opacity: 0.04;
  transform: scale(1);
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:not([disabled]) ~ .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-unselected-hover-icon-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-selected-hover-icon-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-selected-hover-icon-color, var(--mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-unselected-pressed-icon-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-selected-pressed-icon-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-selected-pressed-icon-color, var(--mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__background {
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
}
.mat-mdc-radio-button .mdc-radio__background::before {
  position: absolute;
  transform: scale(0, 0);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  content: "";
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
  width: var(--mat-radio-state-layer-size, 40px);
  height: var(--mat-radio-state-layer-size, 40px);
  top: calc(-1 * (var(--mat-radio-state-layer-size, 40px) - 20px) / 2);
  left: calc(-1 * (var(--mat-radio-state-layer-size, 40px) - 20px) / 2);
}
.mat-mdc-radio-button .mdc-radio__outer-circle {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-width: 2px;
  border-style: solid;
  border-radius: 50%;
  transition: border-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mat-mdc-radio-button .mdc-radio__inner-circle {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  transform: scale(0);
  border-radius: 50%;
  transition: transform 90ms cubic-bezier(0.4, 0, 0.6, 1), background-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
@media (forced-colors: active) {
  .mat-mdc-radio-button .mdc-radio__inner-circle {
    background-color: CanvasText !important;
  }
}
.mat-mdc-radio-button .mdc-radio__native-control {
  position: absolute;
  margin: 0;
  padding: 0;
  opacity: 0;
  top: 0;
  right: 0;
  left: 0;
  cursor: inherit;
  z-index: 1;
  width: var(--mat-radio-state-layer-size, 40px);
  height: var(--mat-radio-state-layer-size, 40px);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background {
  transition: opacity 90ms cubic-bezier(0, 0, 0.2, 1), transform 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__outer-circle, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__outer-circle {
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__inner-circle {
  transition: transform 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:focus + .mdc-radio__background::before {
  transform: scale(1);
  opacity: 0.12;
  transition: opacity 90ms cubic-bezier(0, 0, 0.2, 1), transform 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-disabled-unselected-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-radio-disabled-unselected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background {
  cursor: default;
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-disabled-selected-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-disabled-selected-icon-color, var(--mat-sys-on-surface, currentColor));
  opacity: var(--mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-unselected-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-selected-icon-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-selected-icon-color, var(--mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:focus:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-selected-focus-icon-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:focus:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-selected-focus-icon-color, var(--mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  transform: scale(0.5);
  transition: transform 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled {
  pointer-events: auto;
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-disabled-unselected-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-radio-disabled-unselected-icon-opacity, 0.38);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled:hover .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__outer-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:checked:focus + .mdc-radio__background > .mdc-radio__outer-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-disabled-selected-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled:hover .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:checked:focus + .mdc-radio__background > .mdc-radio__inner-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-disabled-selected-icon-color, var(--mat-sys-on-surface, currentColor));
  opacity: var(--mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__background::before,
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__outer-circle,
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__inner-circle {
  transition: none !important;
}
.mat-mdc-radio-button label {
  cursor: pointer;
}
.mat-mdc-radio-button label:empty {
  display: none;
}
.mat-mdc-radio-button .mdc-radio__background::before {
  background-color: var(--mat-radio-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button.mat-mdc-radio-checked .mat-ripple-element,
.mat-mdc-radio-button.mat-mdc-radio-checked .mdc-radio__background::before {
  background-color: var(--mat-radio-checked-ripple-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mat-ripple-element,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__background::before {
  background-color: var(--mat-radio-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button .mat-internal-form-field {
  color: var(--mat-radio-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-radio-label-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-radio-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-radio-label-text-size, var(--mat-sys-body-medium-size));
  letter-spacing: var(--mat-radio-label-text-tracking, var(--mat-sys-body-medium-tracking));
  font-weight: var(--mat-radio-label-text-weight, var(--mat-sys-body-medium-weight));
}
.mat-mdc-radio-button .mdc-radio--disabled + label {
  color: var(--mat-radio-disabled-label-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-radio-button .mat-radio-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
}
.mat-mdc-radio-button .mat-radio-ripple > .mat-ripple-element {
  opacity: 0.14;
}
.mat-mdc-radio-button .mat-radio-ripple::before {
  border-radius: 50%;
}
.mat-mdc-radio-button .mdc-radio > .mdc-radio__native-control:focus:enabled:not(:checked) ~ .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-unselected-focus-icon-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button.cdk-focused .mat-focus-indicator::before {
  content: "";
}

.mat-mdc-radio-disabled {
  cursor: default;
  pointer-events: none;
}
.mat-mdc-radio-disabled.mat-mdc-radio-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-radio-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--mat-radio-touch-target-size, 48px);
  width: var(--mat-radio-touch-target-size, 48px);
  transform: translate(-50%, -50%);
  display: var(--mat-radio-touch-target-display, block);
}
[dir=rtl] .mat-mdc-radio-touch-target {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}
`],encapsulation:2})}return n})(),li=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=ip({type:n});static \u0275inj=ms({imports:[Wr,pt,gt]})}return n})();var Vi=(n,o)=>o.id,Bi=(n,o)=>o.addOn.id;function qi(n,o){if(n&1&&(di$1(0,"dl",5)(1,"dt"),MI(2),Rc(),di$1(3,"dd"),MI(4),Rc(),di$1(5,"dt"),MI(6),Rc(),di$1(7,"dd"),MI(8),Rc(),di$1(9,"dt"),MI(10),Rc(),di$1(11,"dd"),MI(12),Rc(),di$1(13,"dt",6),MI(14),Rc(),di$1(15,"dd",6),MI(16),Rc()()),n&2){let e=JE(),t=JE();Bv(2),Up(t.t.orderForm.rentalSubtotal),Bv(2),Up(t.twd(e.rentalSubtotal)),Bv(2),Up(t.t.orderForm.insuranceSubtotal),Bv(2),Up(t.twd(e.insuranceSubtotal)),Bv(2),Up(t.t.orderForm.addOnSubtotal),Bv(2),Up(t.twd(e.addOnSubtotal)),Bv(2),Up(t.t.orderForm.quoteTotal),Bv(2),Up(t.twd(e.total));}}function zi(n,o){if(n&1&&VE(0,qi,17,8,"dl",5),n&2){let e=JE();BE(e.showQuote()?0:-1);}}function Gi(n,o){if(n&1&&(di$1(0,"p",1),MI(1),Rc()),n&2){let e=JE();Bv(),Up(e.t.orderForm.quotePending);}}function Ui(n,o){if(n&1&&(di$1(0,"p",2),MI(1),Rc()),n&2){let e=JE();Bv(),Up(e.t.orderForm.insuranceUnreconciled);}}function Hi(n,o){if(n&1&&MI(0),n&2){let e=JE(),t=JE(3);Lc("\u2013",t.twd(e.max));}}function ji(n,o){if(n&1&&(MI(0),VE(1,Hi,1,1)),n&2){let e=o,t=JE(3);Lc(" ",t.twd(e.min)),Bv(),BE(e.max!==e.min?1:-1);}}function Qi(n,o){n&1&&(di$1(0,"span",21),MI(1,"\u2014"),Rc());}function $i(n,o){if(n&1){let e=QE();di$1(0,"tr",16),_p("click",function(){let i=sl(e).$implicit,s=JE(2);return al(s.selectInsurance(i.id))}),di$1(1,"td",17),Ep(2,"mat-radio-button",18),Rc(),di$1(3,"td",19),MI(4),Rc(),di$1(5,"td",20),VE(6,ji,2,2)(7,Qi,2,0,"span",21),Rc(),di$1(8,"td",20),MI(9),Rc(),di$1(10,"td",20),MI(11),Rc()();}if(n&2){let e,t=o.$implicit,i=JE(2);Pp("is-selected",i.selectedInsurance()===t.id),Bv(2),Dp("value",t.id),yp("aria-label",t.name),Bv(2),Up(t.name),Bv(2),BE((e=t.deductible)?6:7,e),Bv(3),Up(i.twd(t.daily)),Bv(2),Up(t.subtotal===null?"\u2014":i.twd(t.subtotal));}}function Ki(n,o){if(n&1&&(di$1(0,"h3",7),MI(1),Rc(),di$1(2,"mat-radio-group",8)(3,"table",9)(4,"thead")(5,"tr")(6,"th",10)(7,"span",11),MI(8),Rc()(),di$1(9,"th",12),MI(10),Rc(),di$1(11,"th",13),MI(12),Rc(),di$1(13,"th",13),MI(14),Rc(),di$1(15,"th",14),MI(16),Rc()()(),di$1(17,"tbody"),UE(18,$i,12,8,"tr",15,Vi),Rc()()(),_D()),n&2){let e=JE();Bv(),Up(e.t.orderForm.insurance),Bv(),vp("aria-label",e.t.orderForm.insurance),MD(),Bv(6),Up(e.s.insuranceTable.select),Bv(2),Up(e.s.insuranceTable.plan),Bv(2),Up(e.s.insuranceTable.deductible),Bv(2),Up(e.s.insuranceTable.daily),Bv(2),Lc(" ",e.days()===null?e.s.insuranceTable.subtotal:e.days()+e.s.insuranceTable.subtotalDaysSuffix," "),Bv(2),GE(e.insuranceRows());}}function Wi(n,o){if(n&1){let e=QE();di$1(0,"tr",25)(1,"th",28),MI(2),Rc(),di$1(3,"td",20),MI(4),Rc(),di$1(5,"td",29)(6,"div",30)(7,"button",31),_p("click",function(){let i=sl(e).$implicit,s=JE(2);return al(s.stepAddOn(i.addOn.id,-1))}),di$1(8,"span",32),MI(9,"remove"),Rc()(),di$1(10,"output",33),MI(11),Rc(),di$1(12,"button",34),_p("click",function(){let i=sl(e).$implicit,s=JE(2);return al(s.stepAddOn(i.addOn.id,1))}),di$1(13,"span",32),MI(14,"add"),Rc()()()(),di$1(15,"td",35),MI(16),Rc()();}if(n&2){let e=o.$implicit,t=JE(2);Bv(2),Up(e.addOn.name),Bv(2),Gp("",t.twd(e.addOn.unitPrice),"",t.s.addOnTable.unitSuffix[e.addOn.unit]),Bv(3),Dp("disabled",e.qty===0),vp("aria-label",t.s.addOnTable.decreasePrefix+e.addOn.name),Bv(4),Up(e.qty),Bv(),vp("aria-label",t.s.addOnTable.increasePrefix+e.addOn.name),Bv(4),Up(e.subtotal===null?"\u2014":t.twd(e.subtotal));}}function Xi(n,o){if(n&1&&(di$1(0,"h3",7),MI(1),Rc(),di$1(2,"div",22)(3,"table",23)(4,"thead")(5,"tr")(6,"th",12),MI(7),Rc(),di$1(8,"th",13),MI(9),Rc(),di$1(10,"th",24),MI(11),Rc(),di$1(12,"th",13),MI(13),Rc()()(),di$1(14,"tbody"),UE(15,Wi,17,8,"tr",25,Bi),Rc(),di$1(17,"tfoot")(18,"tr")(19,"th",26),MI(20),Rc(),di$1(21,"td",27),MI(22),Rc()()()()()),n&2){let e=JE();Bv(),Up(e.t.orderForm.addOns),Bv(6),Up(e.s.addOnTable.item),Bv(2),Up(e.s.addOnTable.unitPrice),Bv(2),Up(e.s.addOnTable.qty),Bv(2),Up(e.s.addOnTable.subtotal),Bv(2),GE(e.addOnRows()),Bv(5),Up(e.s.addOnTable.total),Bv(2),Up(e.addOnTotal()===null?"\u2014":e.twd(e.addOnTotal()));}}function Yi(n,o){if(n&1&&(di$1(0,"p",2),MI(1),Rc()),n&2){let e=JE();Bv(),Gp(" ",e.t.orderForm.depositExceedsCap,"\uFF08",e.twd(e.derived.depositCap()),"\uFF09 ");}}var Zi="\u79DF\u8ECA\u81EA\u8CA0\u984D";function Ji(n){let o=n.coverageItems.find(e=>e.name===Zi)??n.coverageItems[0];return o?{min:o.deductibleMin,max:o.deductibleMax}:null}var si=class n{t=v(fe);twd=o=>i(o??NaN);s=this.t.orderSummary;NO_INSURANCE_VALUE=se;data=v(V);form=fP.required();context=fP({});showQuote=fP(true);value=Ne(this.form);derived=st(this.value,this.data,()=>this.context());days=eC(()=>Jn(this.value().rental)??null);selectedInsurance=eC(()=>this.value().pricing.insurancePlanId);insuranceRows=eC(()=>{let o=this.derived.vehicle()?.insurancePlans??[],e=this.days(),t=i=>e===null?null:i*e;return [{id:se,name:this.t.orderForm.insuranceNone,deductible:null,daily:0,subtotal:t(0)},...o.map(i=>({id:i.id,name:i.name,deductible:Ji(i),daily:i.dailyPriceFrom,subtotal:t(i.dailyPriceFrom)}))]});addOnRows=eC(()=>{let o=this.derived.quote(),e=this.value().pricing.addOnQty;return this.data.addOns().map(t=>({addOn:t,qty:e[t.id]??0,subtotal:o?o.addOnLines.find(i=>i.addOnId===t.id)?.amount??0:null}))});addOnTotal=eC(()=>this.derived.quote()?.addOnSubtotal??null);depositCapHint=eC(()=>{let o=this.t.orderForm,e=i(this.derived.depositCap());return this.derived.vehicle()?.category==="car"?`${o.depositCapPrefix}${e}${o.depositCapCarSuffix}`:`${o.depositCapNoRulePrefix}${e}`});selectInsurance(o){let e=this.form().controls.pricing.controls.insurancePlanId;e.value!==o&&(e.setValue(o),e.markAsDirty());}stepAddOn(o,e){let t=this.form().controls.pricing.controls.addOnQty,i=Math.max(0,(t.value[o]??0)+e);i!==(t.value[o]??0)&&(t.setValue(m(l({},t.value),{[o]:i})),t.markAsDirty());}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=mE({type:n,selectors:[["lib-order-pricing-section"]],inputs:{form:[1,"form"],context:[1,"context"],showQuote:[1,"showQuote"]},decls:14,vars:8,consts:[[1,"order-section",3,"formGroup"],[1,"order-section__hint"],["role","alert",1,"order-section__notice"],[1,"order-section__grid","pricing-deposit"],["matInput","","type","number","min","0","formControlName","depositRequired"],[1,"order-section__dl"],[1,"is-total"],[1,"order-section__subtitle"],["formControlName","insurancePlanId",1,"pricing-table__scroll"],[1,"pricing-table","pricing-table--insurance"],["scope","col",1,"pricing-table__select"],[1,"visually-hidden"],["scope","col"],["scope","col",1,"is-num"],["scope","col",1,"is-num","pricing-table__days"],[1,"pricing-table__option",3,"is-selected"],[1,"pricing-table__option",3,"click"],[1,"pricing-table__select"],[3,"value","aria-label"],[1,"pricing-table__name"],[1,"is-num"],[1,"is-muted"],[1,"pricing-table__scroll"],[1,"pricing-table","pricing-table--add-ons"],["scope","col",1,"pricing-table__qty"],[1,"pricing-table__add-on"],["scope","row","colspan","3"],[1,"is-num","pricing-table__total"],["scope","row",1,"pricing-table__name"],[1,"pricing-table__qty"],[1,"qty-stepper"],["mat-icon-button","","type","button",1,"qty-stepper__button","qty-stepper__decrease",3,"click","disabled"],["aria-hidden","true",1,"material-symbols-rounded"],[1,"qty-stepper__value"],["mat-icon-button","","type","button",1,"qty-stepper__button","qty-stepper__increase",3,"click"],[1,"is-num","pricing-table__subtotal"]],template:function(e,t){if(e&1&&(di$1(0,"div",0),VE(1,zi,1,1)(2,Gi,2,1,"p",1),VE(3,Ui,2,1,"p",2),VE(4,Ki,20,7),VE(5,Xi,23,7),di$1(6,"div",3)(7,"mat-form-field")(8,"mat-label"),MI(9),Rc(),Ep(10,"input",4),_D(),di$1(11,"mat-hint"),MI(12),Rc()()(),VE(13,Yi,2,2,"p",2),Rc()),e&2){let i;Dp("formGroup",t.form().controls.pricing),Bv(),BE((i=t.derived.quote())?1:2,i),Bv(2),BE(t.derived.insuranceUnreconciled()?3:-1),Bv(),BE(t.derived.vehicle()?.insurancePlans?.length?4:-1),Bv(),BE(t.addOnRows().length>0?5:-1),Bv(4),Up(t.t.orderForm.deposit),Bv(),MD(),Bv(2),Up(t.depositCapHint()),Bv(),BE(t.derived.depositExceedsCap()?13:-1);}},dependencies:[Gn,$e,an$1,Rn,Pn,Gt,fn,cn,nl,gi,ce$1,rt,ae,le,ln,an,li,Dt,pt],styles:["[_nghost-%COMP%]{display:block;min-width:0}.order-section[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem}.order-section__grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1rem;row-gap:.25rem}@media(max-width:600px){.order-section__grid[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr)}}.order-section__full[_ngcontent-%COMP%]{grid-column:1/-1}.order-section__subtitle[_ngcontent-%COMP%]{margin:1.25rem 0 .5rem;font-size:1.0625rem;font-weight:600;color:var(--mat-sys-on-surface)}.order-section__notice[_ngcontent-%COMP%]{margin:0 0 .75rem;font-size:1rem;color:var(--mat-sys-error)}.order-section__hint[_ngcontent-%COMP%]{margin:0 0 .75rem;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.order-section__dl[_ngcontent-%COMP%]{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:.625rem 1.5rem;margin:0 0 1rem;font-size:1rem}.order-section__dl[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.order-section__dl[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%]{margin:0;color:var(--mat-sys-on-surface);overflow-wrap:anywhere}.order-section__dl[_ngcontent-%COMP%]   .is-total[_ngcontent-%COMP%]{font-weight:600}",".pricing-table__scroll[_ngcontent-%COMP%]{display:block;margin:0 0 1.25rem;overflow-x:auto;overflow-y:hidden}.pricing-table[_ngcontent-%COMP%]{width:100%;margin:0;border-collapse:collapse;font-size:1rem}.pricing-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], .pricing-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:.5rem .75rem;border-bottom:1px solid var(--mat-sys-outline-variant);text-align:left;vertical-align:middle}.pricing-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{padding-top:.375rem;padding-bottom:.5rem;font-size:1rem;font-weight:500;color:var(--mat-sys-on-surface-variant);white-space:nowrap}.pricing-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{font-weight:400}.pricing-table[_ngcontent-%COMP%]   tfoot[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], .pricing-table[_ngcontent-%COMP%]   tfoot[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{border-bottom:0;font-weight:600}.pricing-table[_ngcontent-%COMP%]   tfoot[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{text-align:right}.pricing-table[_ngcontent-%COMP%]   .is-num[_ngcontent-%COMP%]{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}.pricing-table[_ngcontent-%COMP%]   .is-muted[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.pricing-table[_ngcontent-%COMP%]   .pricing-table__select[_ngcontent-%COMP%]{position:relative;width:2.75rem;padding-right:0;--mat-radio-state-layer-size: 32px;--mat-radio-touch-target-display: none}.pricing-table[_ngcontent-%COMP%]   .pricing-table__qty[_ngcontent-%COMP%]{width:8rem;text-align:center}.pricing-table__name[_ngcontent-%COMP%]{white-space:nowrap}.pricing-table__option[_ngcontent-%COMP%]{cursor:pointer}.pricing-table__option[_ngcontent-%COMP%]:hover{background:var(--mat-sys-surface-container-low)}.pricing-table__option.is-selected[_ngcontent-%COMP%]{background:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container)}.qty-stepper[_ngcontent-%COMP%]{--mat-icon-button-state-layer-size: 32px;--mat-icon-button-icon-size: 20px;display:inline-flex;align-items:center;gap:.25rem}.qty-stepper[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{display:block;font-size:20px;line-height:1}.qty-stepper__value[_ngcontent-%COMP%]{min-width:2.5ch;text-align:center;font-weight:600;font-variant-numeric:tabular-nums}.pricing-deposit[_ngcontent-%COMP%]{margin-top:.5rem}.visually-hidden[_ngcontent-%COMP%]{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}"]})};var eo={document:{disclaimer:"\u672C\u9801\u50C5\u70BA\u958B\u767C\u671F\u6A21\u64EC\u5408\u7D04\uFF0C\u975E\u6B63\u5F0F\u5177\u6CD5\u5F8B\u6548\u529B\u7684\u7528\u5370 PDF\uFF1B\u6B63\u5F0F\u5408\u7D04 PDF\u3001\u96DC\u6E4A\u8207\u7C3D\u7F72\u8B49\u64DA\u7531\u5F8C\u7AEF\u63A5\u624B\u3002",versionLabel:"\u7248\u672C",statusLabels:{draft:"\u8349\u7A3F",signed:"\u5DF2\u7C3D\u7F72",superseded:"\u5DF2\u88AB\u53D6\u4EE3"},createdAt:"\u5EFA\u7ACB\u6642\u9593",signedAt:"\u7C3D\u7F72\u6642\u9593",renterSection:"\u51FA\u79DF\u4EBA\u8207\u627F\u79DF\u4EBA",driverSection:"\u99D5\u99DB\u4EBA",sameAsRenter:"\u540C\u627F\u79DF\u4EBA",partyName:"\u59D3\u540D",partyPhone:"\u96FB\u8A71",partyIdNumber:"\u8B49\u4EF6\u865F",vehicleSection:"\u8ECA\u8F1B\u8CC7\u6599",plateNumber:"\u8ECA\u724C",brand:"\u5EE0\u724C",model:"\u578B\u865F",vehicleCategory:"\u8ECA\u578B",vehicleCategoryLabels:{scooter:"\u6A5F\u8ECA",car:"\u6C7D\u8ECA",ev:"\u96FB\u52D5\u8ECA"},fuelPolicy:"\u6CB9\u91CF\u653F\u7B56",fuelPolicyLabels:{full_to_full:"\u6EFF\u6CB9\u9084\u6EFF\u6CB9",full_to_empty:"\u6EFF\u6CB9\u53EF\u9084\u7A7A\u6CB9",same_level:"\u9084\u8ECA\u540C\u53D6\u8ECA\u6CB9\u91CF"},mileagePolicy:"\u91CC\u7A0B\u653F\u7B56",mileagePolicyLabels:{unlimited:"\u4E0D\u9650\u91CC\u7A0B",limited:"\u9650\u5236\u91CC\u7A0B"},energyType:"\u80FD\u6E90\u7A2E\u985E",energyTypeLabels:{gasoline:"\u71C3\u6CB9",electric:"\u96FB\u52D5"},periodSection:"\u79DF\u671F\u8207\u53D6\u9084\u8ECA\u5730\u9EDE",startTime:"\u958B\u59CB\u6642\u9593",endTime:"\u7D50\u675F\u6642\u9593",pickupBranchId:"\u53D6\u8ECA\u5730\u9EDE",returnBranchId:"\u9084\u8ECA\u5730\u9EDE",pricingSection:"\u79DF\u91D1\u3001\u4FDD\u96AA\u8207\u8A08\u50F9\u660E\u7D30",rentalSubtotal:"\u79DF\u91D1\u5C0F\u8A08",addOnSubtotal:"\u914D\u4EF6\u5C0F\u8A08",insuranceSubtotal:"\u4FDD\u96AA\u5C0F\u8A08",total:"\u5831\u50F9\u5408\u8A08",deposit:"\u8A02\u91D1",addOnsSection:"\u52A0\u8CFC\u914D\u4EF6",disclosedRulesSection:"\u5DF2\u63ED\u9732\u898F\u5247",cancellationRule:"\u53D6\u6D88\u898F\u5247",cancellationContractKindLabels:{passenger_car:"\u5C0F\u5BA2\u8ECA",scooter:"\u6A5F\u8ECA"},ruleVersion:"\u898F\u5247\u7248\u672C",lateReturnPolicy:"\u903E\u6642\u898F\u5247",graceMinutes:"\u514D\u8CBB\u5BEC\u9650\uFF08\u5206\u9418\uFF09",unitMinutes:"\u8A08\u8CBB\u55AE\u4F4D\uFF08\u5206\u9418\uFF09",feePerUnit:"\u6BCF\u55AE\u4F4D\u8CBB\u7528",dailyCap:"\u55AE\u65E5\u4E0A\u9650",energyReturnPolicy:"\u80FD\u6E90\u88DC\u7E73\u898F\u5247",energyMeasureLabels:{eighths:"\u6CB9\u91CF\u516B\u5206\u683C",percent:"\u96FB\u91CF\u767E\u5206\u6BD4"},serviceFee:"\u8655\u7406\u8CBB",otherDisclosures:"\u5176\u4ED6\u5DF2\u63ED\u9732\u4E8B\u9805"},signaturePad:{drawTab:"\u624B\u5BEB\u7C3D\u540D",typeTab:"\u6253\u5B57\u7C3D\u540D",canvasAriaLabel:"\u7C3D\u540D\u756B\u5E03",emptyDrawHint:"\u8ACB\u65BC\u4E0B\u65B9\u6846\u5167\u7528\u6ED1\u9F20\u6216\u89F8\u63A7\u7C3D\u540D",typedNameLabel:"\u7C3D\u7F72\u4EBA\u59D3\u540D\uFF08\u4EE3\u66FF\u7C3D\u540D\uFF09",typedNamePlaceholder:"\u8ACB\u8F38\u5165\u59D3\u540D",clear:"\u6E05\u9664\u91CD\u5BEB",acknowledge:"\u672C\u4EBA\u78BA\u8A8D\u5DF2\u95B1\u8B80\u4E26\u540C\u610F\u4E0A\u5217\u5408\u7D04\u5167\u5BB9",mockNotice:"\u672C\u7C3D\u540D\u70BA\u958B\u767C\u671F\u6A21\u64EC\u5B58\u8B49\uFF0C\u975E\u6B63\u5F0F\u5177\u6CD5\u5F8B\u6548\u529B\u7684\u7528\u5370\u7C3D\u7F72",confirmSign:"\u78BA\u8A8D\u7C3D\u7F72",signing:"\u8655\u7406\u4E2D\u2026"},dialog:{title:"\u7C3D\u7F72\u6700\u65B0\u7248\u672C",cancel:"\u53D6\u6D88",confirm:"\u78BA\u8A8D\u7C3D\u7F72",signing:"\u8655\u7406\u4E2D\u2026"},needsResignNotice:"\u689D\u6B3E\u5DF2\u8B8A\u66F4\uFF0C\u9700\u91CD\u65B0\u7C3D\u7F72"},Oe=new S("CONTRACT_SIGNING_LABELS",{providedIn:"root",factory:()=>eo});var to=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}),ut=class n{transform(o){if(!o)return "";let e=new Date(o);if(Number.isNaN(e.getTime()))return o;let t=i=>to.formatToParts(e).find(s=>s.type===i)?.value??"";return `${t("year")}/${t("month")}/${t("day")} ${t("hour")}:${t("minute")}`}static \u0275fac=function(e){return new(e||n)};static \u0275pipe=sp({name:"taipeiDateTime",type:n,pure:true})};var no=(n,o)=>o.addOnId;function io(n,o){if(n&1&&(Oc(0,"dt"),MI(1),kc(),Oc(2,"dd"),MI(3),WI(4,"taipeiDateTime"),kc()),n&2){let e=JE(),t=JE();Bv(),Up(t.l.signedAt),Bv(2),Up(YI(4,2,e.signedAt));}}function oo(n,o){if(n&1&&(Oc(0,"dl",2)(1,"dt"),MI(2),kc(),Oc(3,"dd"),MI(4),WI(5,"taipeiDateTime"),kc(),VE(6,io,5,4),kc()),n&2){let e=o,t=JE();Bv(2),Up(t.l.createdAt),Bv(2),Up(YI(5,3,e.createdAt)),Bv(2),BE(e.signedAt?6:-1);}}function ao(n,o){if(n&1&&(Oc(0,"dt"),MI(1),kc(),Oc(2,"dd"),MI(3),kc()),n&2){let e=JE(),t=FI(0);Bv(),Up(e.l.partyIdNumber),Bv(2),Up(t.renter.idNumber);}}function ro(n,o){if(n&1&&(Oc(0,"p",5),MI(1),kc()),n&2){let e=JE();Bv(),Up(e.l.sameAsRenter);}}function co(n,o){if(n&1&&(Oc(0,"dl",4)(1,"dt"),MI(2),kc(),Oc(3,"dd"),MI(4),kc(),Oc(5,"dt"),MI(6),kc(),Oc(7,"dd"),MI(8),kc()()),n&2){let e=JE(),t=FI(0);Bv(2),Up(e.l.partyName),Bv(2),Up(t.driver.name),Bv(2),Up(e.l.partyPhone),Bv(2),Up(t.driver.phone);}}function lo(n,o){if(n&1&&(Oc(0,"dt"),MI(1),kc(),Oc(2,"dd"),MI(3),kc()),n&2){let e=JE(),t=FI(0);Bv(),Up(e.l.fuelPolicy),Bv(2),Up(e.l.fuelPolicyLabels[t.vehicle.fuelPolicy]);}}function so(n,o){if(n&1&&(Oc(0,"dt"),MI(1),kc(),Oc(2,"dd"),MI(3),kc()),n&2){let e=JE(),t=FI(0);Bv(),Up(e.l.mileagePolicy),Bv(2),Up(e.l.mileagePolicyLabels[t.vehicle.mileagePolicy]);}}function mo(n,o){if(n&1&&(Oc(0,"dt"),MI(1),kc(),Oc(2,"dd"),MI(3),kc()),n&2){let e=JE(),t=FI(0);Bv(),Up(e.l.energyType),Bv(2),Up(e.l.energyTypeLabels[t.vehicle.energyType]);}}function po(n,o){if(n&1&&(Oc(0,"li"),MI(1),kc()),n&2){let e=o.$implicit,t=JE(2);Bv(),zp("",e.name," \xD7 ",e.qty,"\uFF08",t.twd(e.amount),"\uFF09");}}function uo(n,o){if(n&1&&(Oc(0,"h4"),MI(1),kc(),Oc(2,"ul",6),UE(3,po,2,3,"li",null,no),kc()),n&2){let e=JE(),t=FI(0);Bv(),Up(e.l.addOnsSection),Bv(2),GE(t.pricing.addOnLines);}}function ho(n,o){if(n&1&&(Oc(0,"h4"),MI(1),kc(),Oc(2,"dl",4)(3,"dt"),MI(4),kc(),Oc(5,"dd"),MI(6),kc(),Oc(7,"dt"),MI(8),kc(),Oc(9,"dd"),MI(10),kc(),Oc(11,"dt"),MI(12),kc(),Oc(13,"dd"),MI(14),kc(),Oc(15,"dt"),MI(16),kc(),Oc(17,"dd"),MI(18),kc()()),n&2){let e=o,t=JE();Bv(),Up(t.l.lateReturnPolicy),Bv(3),Up(t.l.graceMinutes),Bv(2),Up(e.graceMinutes),Bv(2),Up(t.l.unitMinutes),Bv(2),Up(e.unitMinutes),Bv(2),Up(t.l.feePerUnit),Bv(2),Up(t.twd(e.feePerUnit)),Bv(2),Up(t.l.dailyCap),Bv(2),Up(t.twd(e.dailyCap));}}function _o(n,o){if(n&1&&(Oc(0,"h4"),MI(1),kc(),Oc(2,"dl",4)(3,"dt"),MI(4),kc(),Oc(5,"dd"),MI(6),kc(),Oc(7,"dt"),MI(8),kc(),Oc(9,"dd"),MI(10),kc()()),n&2){let e=o,t=JE();Bv(),Up(t.l.energyReturnPolicy),Bv(3),Up(t.l.energyMeasureLabels[e.measure]),Bv(2),Up(t.twd(e.feePerUnit)),Bv(2),Up(t.l.serviceFee),Bv(2),Up(t.twd(e.serviceFee));}}function bo(n,o){if(n&1&&(Oc(0,"li"),MI(1),kc()),n&2){let e=o.$implicit;Bv(),Up(e);}}function go(n,o){if(n&1&&(Oc(0,"h4"),MI(1),kc(),Oc(2,"ul",7),UE(3,bo,2,1,"li",null,$E),kc()),n&2){let e=JE(),t=FI(0);Bv(),Up(e.l.otherDisclosures),Bv(2),GE(t.disclosedRules.otherDisclosures);}}var ht=class n{l=v(Oe).document;twd=i;snapshot=fP.required();version=fP(void 0);sameDriverAsRenter=eC(()=>{let o=this.snapshot();return o.driver.memberId===o.renter.memberId});static \u0275fac=function(e){return new(e||n)};static \u0275cmp=mE({type:n,selectors:[["lib-contract-document"]],inputs:{snapshot:[1,"snapshot"],version:[1,"version"]},decls:99,vars:56,consts:[[1,"contract-document"],[1,"contract-document__disclaimer"],[1,"contract-document__meta"],[1,"contract-document__section"],[1,"contract-document__grid"],[1,"contract-document__same-as-renter"],[1,"contract-document__add-on-list"],[1,"contract-document__other-disclosures"]],template:function(e,t){if(e&1&&(Qp(0),Oc(1,"article",0)(2,"p",1),MI(3),kc(),VE(4,oo,7,5,"dl",2),Oc(5,"section",3)(6,"h3"),MI(7),kc(),Oc(8,"dl",4)(9,"dt"),MI(10),kc(),Oc(11,"dd"),MI(12),kc(),Oc(13,"dt"),MI(14),kc(),Oc(15,"dd"),MI(16),kc(),VE(17,ao,4,2),kc(),Oc(18,"h4"),MI(19),kc(),VE(20,ro,2,1,"p",5)(21,co,9,4,"dl",4),kc(),Oc(22,"section",3)(23,"h3"),MI(24),kc(),Oc(25,"dl",4)(26,"dt"),MI(27),kc(),Oc(28,"dd"),MI(29),kc(),Oc(30,"dt"),MI(31),kc(),Oc(32,"dd"),MI(33),kc(),Oc(34,"dt"),MI(35),kc(),Oc(36,"dd"),MI(37),kc(),VE(38,lo,4,2),VE(39,so,4,2),VE(40,mo,4,2),kc()(),Oc(41,"section",3)(42,"h3"),MI(43),kc(),Oc(44,"dl",4)(45,"dt"),MI(46),kc(),Oc(47,"dd"),MI(48),WI(49,"taipeiDateTime"),kc(),Oc(50,"dt"),MI(51),kc(),Oc(52,"dd"),MI(53),WI(54,"taipeiDateTime"),kc(),Oc(55,"dt"),MI(56),kc(),Oc(57,"dd"),MI(58),kc(),Oc(59,"dt"),MI(60),kc(),Oc(61,"dd"),MI(62),kc()()(),Oc(63,"section",3)(64,"h3"),MI(65),kc(),Oc(66,"dl",4)(67,"dt"),MI(68),kc(),Oc(69,"dd"),MI(70),kc(),Oc(71,"dt"),MI(72),kc(),Oc(73,"dd"),MI(74),kc(),Oc(75,"dt"),MI(76),kc(),Oc(77,"dd"),MI(78),kc(),Oc(79,"dt"),MI(80),kc(),Oc(81,"dd"),MI(82),kc(),Oc(83,"dt"),MI(84),kc(),Oc(85,"dd"),MI(86),kc()(),VE(87,uo,5,1),kc(),Oc(88,"section",3)(89,"h3"),MI(90),kc(),Oc(91,"dl",4)(92,"dt"),MI(93),kc(),Oc(94,"dd"),MI(95),kc()(),VE(96,ho,19,9),VE(97,_o,11,5),VE(98,go,5,1),kc()()),e&2){let i,s,h,b=kI(t.snapshot());Bv(3),Up(t.l.disclaimer),Bv(),BE((i=t.version())?4:-1,i),Bv(3),Up(t.l.renterSection),Bv(3),Up(t.l.partyName),Bv(2),Up(b.renter.name),Bv(2),Up(t.l.partyPhone),Bv(2),Up(b.renter.phone),Bv(),BE(b.renter.idNumber?17:-1),Bv(2),Up(t.l.driverSection),Bv(),BE(t.sameDriverAsRenter()?20:21),Bv(4),Up(t.l.vehicleSection),Bv(3),Up(t.l.plateNumber),Bv(2),Up(b.vehicle.plateNumber),Bv(2),Gp("",t.l.brand," / ",t.l.model),Bv(2),Gp("",b.vehicle.brand," ",b.vehicle.model),Bv(2),Up(t.l.vehicleCategory),Bv(2),Up(t.l.vehicleCategoryLabels[b.vehicle.category]),Bv(),BE(b.vehicle.fuelPolicy?38:-1),Bv(),BE(b.vehicle.mileagePolicy?39:-1),Bv(),BE(b.vehicle.energyType?40:-1),Bv(3),Up(t.l.periodSection),Bv(3),Up(t.l.startTime),Bv(2),Up(YI(49,52,b.rentalStartTime)),Bv(3),Up(t.l.endTime),Bv(2),Up(YI(54,54,b.rentalEndTime)),Bv(3),Up(t.l.pickupBranchId),Bv(2),Up(b.pickupBranchId),Bv(2),Up(t.l.returnBranchId),Bv(2),Up(b.returnBranchId),Bv(3),Up(t.l.pricingSection),Bv(3),Up(t.l.rentalSubtotal),Bv(2),Up(t.twd(b.pricing.rentalSubtotal)),Bv(2),Up(t.l.addOnSubtotal),Bv(2),Up(t.twd(b.pricing.addOnSubtotal)),Bv(2),Up(t.l.insuranceSubtotal),Bv(2),Up(t.twd(b.pricing.insuranceSubtotal)),Bv(2),Up(t.l.total),Bv(2),Up(t.twd(b.pricing.total)),Bv(2),Up(t.l.deposit),Bv(2),Up(t.twd(b.depositRequired)),Bv(),BE(b.pricing.addOnLines.length>0?87:-1),Bv(3),Up(t.l.disclosedRulesSection),Bv(3),Up(t.l.cancellationRule),Bv(2),zp(" ",t.l.cancellationContractKindLabels[b.disclosedRules.cancellationContractKind]," \uFF08",t.l.ruleVersion,"\uFF1A",b.disclosedRules.cancellationRuleVersion,"\uFF09 "),Bv(),BE((s=b.disclosedRules.lateReturnPolicy)?96:-1,s),Bv(),BE((h=b.disclosedRules.energyReturnPolicy)?97:-1,h),Bv(),BE(b.disclosedRules.otherDisclosures?.length?98:-1);}},dependencies:[ut],styles:['@charset "UTF-8";[_nghost-%COMP%]{display:block}.contract-document[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:1rem}.contract-document__disclaimer[_ngcontent-%COMP%]{margin:0;font-size:.875rem;color:var(--app-warning-fg)}.contract-document__meta[_ngcontent-%COMP%], .contract-document__grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:max-content 1fr;column-gap:1rem;row-gap:.5rem;margin:0;font-size:1rem}.contract-document__meta[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%], .contract-document__grid[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.contract-document__meta[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%], .contract-document__grid[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%]{margin:0;overflow-wrap:anywhere}.contract-document__section[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem;padding:1rem;border:1px solid var(--mat-sys-outline-variant);border-radius:.5rem}.contract-document__section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0 0 .375rem;font-size:1.0625rem}.contract-document__section[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{margin:.75rem 0 .375rem;font-size:1rem;color:var(--mat-sys-on-surface-variant)}.contract-document__same-as-renter[_ngcontent-%COMP%]{margin:0;font-size:1rem;color:var(--mat-sys-on-surface-variant)}.contract-document__add-on-list[_ngcontent-%COMP%], .contract-document__other-disclosures[_ngcontent-%COMP%]{margin:0;padding-left:1.25rem;font-size:1rem}.contract-document__add-on-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] + li[_ngcontent-%COMP%], .contract-document__other-disclosures[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] + li[_ngcontent-%COMP%]{margin-top:.375rem}']})};var fo=["input"],vo=["label"],yo=["*"],Rt={color:"accent",clickAction:"check-indeterminate",disabledInteractive:false},ko=new S("mat-checkbox-default-options",{providedIn:"root",factory:()=>Rt}),O=(function(n){return n[n.Init=0]="Init",n[n.Checked=1]="Checked",n[n.Unchecked=2]="Unchecked",n[n.Indeterminate=3]="Indeterminate",n})(O||{}),At=class{source;checked},Ft=(()=>{class n{_elementRef=v(Rn$1);_changeDetectorRef=v(mC);_ngZone=v(Ne$1);_animationsDisabled=ye();_options=v(ko,{optional:true});focus(){this._inputElement.nativeElement.focus();}_createChangeEvent(e){let t=new At;return t.source=this,t.checked=e,t}_getAnimationTargetElement(){return this._inputElement?.nativeElement}_animationClasses={uncheckedToChecked:"mdc-checkbox--anim-unchecked-checked",uncheckedToIndeterminate:"mdc-checkbox--anim-unchecked-indeterminate",checkedToUnchecked:"mdc-checkbox--anim-checked-unchecked",checkedToIndeterminate:"mdc-checkbox--anim-checked-indeterminate",indeterminateToChecked:"mdc-checkbox--anim-indeterminate-checked",indeterminateToUnchecked:"mdc-checkbox--anim-indeterminate-unchecked"};ariaLabel="";ariaLabelledby=null;ariaDescribedby;ariaExpanded;ariaControls;ariaOwns;_uniqueId;id;get inputId(){return `${this.id||this._uniqueId}-input`}required=false;labelPosition="after";name=null;change=new $e$2;indeterminateChange=new $e$2;value;disableRipple=false;_inputElement;_labelElement;tabIndex;color;disabledInteractive;_onTouched=()=>{};_currentAnimationClass="";_currentCheckState=O.Init;_controlValueAccessorChangeFn=()=>{};_validatorChangeFn=()=>{};constructor(){v(H).load($r);let e=v(new ih("tabindex"),{optional:true});this._options=this._options||Rt,this.color=this._options.color||Rt.color,this.tabIndex=e==null?0:parseInt(e)||0,this.id=this._uniqueId=v(Yt).getId("mat-mdc-checkbox-"),this.disabledInteractive=this._options?.disabledInteractive??false;}ngOnChanges(e){e.required&&this._validatorChangeFn();}ngAfterViewInit(){this._syncIndeterminate(this.indeterminate);}get checked(){return this._checked}set checked(e){e!=this.checked&&(this._checked=e,this._changeDetectorRef.markForCheck());}_checked=false;get disabled(){return this._disabled}set disabled(e){e!==this.disabled&&(this._disabled=e,this._changeDetectorRef.markForCheck());}_disabled=false;get indeterminate(){return this._indeterminate()}set indeterminate(e){let t=e!=this._indeterminate();this._indeterminate.set(e),t&&(e?this._transitionCheckState(O.Indeterminate):this._transitionCheckState(this.checked?O.Checked:O.Unchecked),this.indeterminateChange.emit(e)),this._syncIndeterminate(e);}_indeterminate=Fo$1(false);_isRippleDisabled(){return this.disableRipple||this.disabled}_onLabelTextChange(){this._changeDetectorRef.detectChanges();}writeValue(e){this.checked=!!e;}registerOnChange(e){this._controlValueAccessorChangeFn=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e;}validate(e){return this.required&&e.value!==true?{required:true}:null}registerOnValidatorChange(e){this._validatorChangeFn=e;}_transitionCheckState(e){let t=this._currentCheckState,i=this._getAnimationTargetElement();if(!(t===e||!i)&&(this._currentAnimationClass&&i.classList.remove(this._currentAnimationClass),this._currentAnimationClass=this._getAnimationClassForCheckStateTransition(t,e),this._currentCheckState=e,this._currentAnimationClass.length>0)){i.classList.add(this._currentAnimationClass);let s=this._currentAnimationClass;this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{i.classList.remove(s);},1e3);});}}_emitChangeEvent(){this._controlValueAccessorChangeFn(this.checked),this.change.emit(this._createChangeEvent(this.checked)),this._inputElement&&(this._inputElement.nativeElement.checked=this.checked);}toggle(){this.checked=!this.checked,this._controlValueAccessorChangeFn(this.checked);}_handleInputClick(){let e=this._options?.clickAction;!this.disabled&&e!=="noop"?(this.indeterminate&&e!=="check"&&Promise.resolve().then(()=>{this._indeterminate.set(false),this.indeterminateChange.emit(false);}),this._checked=!this._checked,this._transitionCheckState(this._checked?O.Checked:O.Unchecked),this._emitChangeEvent()):(this.disabled&&this.disabledInteractive||!this.disabled&&e==="noop")&&(this._inputElement.nativeElement.checked=this.checked,this._inputElement.nativeElement.indeterminate=this.indeterminate);}_onInteractionEvent(e){e.stopPropagation();}_onBlur(){Promise.resolve().then(()=>{this._onTouched(),this._changeDetectorRef.markForCheck();});}_getAnimationClassForCheckStateTransition(e,t){if(this._animationsDisabled)return "";switch(e){case O.Init:if(t===O.Checked)return this._animationClasses.uncheckedToChecked;if(t==O.Indeterminate)return this._checked?this._animationClasses.checkedToIndeterminate:this._animationClasses.uncheckedToIndeterminate;break;case O.Unchecked:return t===O.Checked?this._animationClasses.uncheckedToChecked:this._animationClasses.uncheckedToIndeterminate;case O.Checked:return t===O.Unchecked?this._animationClasses.checkedToUnchecked:this._animationClasses.checkedToIndeterminate;case O.Indeterminate:return t===O.Checked?this._animationClasses.indeterminateToChecked:this._animationClasses.indeterminateToUnchecked}return ""}_syncIndeterminate(e){let t=this._inputElement;t&&(t.nativeElement.indeterminate=e);}_onInputClick(){this._handleInputClick();}_onTouchTargetClick(){this._handleInputClick(),this.disabled||this._inputElement.nativeElement.focus();}_preventBubblingFromLabel(e){e.target&&this._labelElement.nativeElement.contains(e.target)&&e.stopPropagation();}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=mE({type:n,selectors:[["mat-checkbox"]],viewQuery:function(t,i){if(t&1&&xp(fo,5)(vo,5),t&2){let s;rI(s=oI())&&(i._inputElement=s.first),rI(s=oI())&&(i._labelElement=s.first);}},hostAttrs:[1,"mat-mdc-checkbox"],hostVars:16,hostBindings:function(t,i){t&2&&(wp("id",i.id),vp("tabindex",null)("aria-label",null)("aria-labelledby",null),yI(i.color?"mat-"+i.color:"mat-accent"),Pp("_mat-animation-noopable",i._animationsDisabled)("mdc-checkbox--disabled",i.disabled)("mat-mdc-checkbox-disabled",i.disabled)("mat-mdc-checkbox-checked",i.checked)("mat-mdc-checkbox-disabled-interactive",i.disabledInteractive));},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],ariaExpanded:[2,"aria-expanded","ariaExpanded",DP],ariaControls:[0,"aria-controls","ariaControls"],ariaOwns:[0,"aria-owns","ariaOwns"],id:"id",required:[2,"required","required",DP],labelPosition:"labelPosition",name:"name",value:"value",disableRipple:[2,"disableRipple","disableRipple",DP],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?void 0:EP(e)],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",DP],checked:[2,"checked","checked",DP],disabled:[2,"disabled","disabled",DP],indeterminate:[2,"indeterminate","indeterminate",DP]},outputs:{change:"change",indeterminateChange:"indeterminateChange"},exportAs:["matCheckbox"],features:[HI([{provide:Q$1,useExisting:po$1(()=>n),multi:true},{provide:m$2,useExisting:n,multi:true}]),Qa$1],ngContentSelectors:yo,decls:15,vars:23,consts:[["checkbox",""],["input",""],["label",""],["mat-internal-form-field","",3,"click","labelPosition"],[1,"mdc-checkbox"],["aria-hidden","true",1,"mat-mdc-checkbox-touch-target",3,"click"],["type","checkbox",1,"mdc-checkbox__native-control",3,"blur","click","change","checked","indeterminate","disabled","id","required","tabIndex"],["aria-hidden","true",1,"mdc-checkbox__ripple"],["aria-hidden","true",1,"mdc-checkbox__background"],["focusable","false","viewBox","0 0 24 24",1,"mdc-checkbox__checkmark"],["fill","none","d","M1.73,12.91 8.1,19.28 22.79,4.59",1,"mdc-checkbox__checkmark-path"],[1,"mdc-checkbox__mixedmark"],["mat-ripple","","aria-hidden","true",1,"mat-mdc-checkbox-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-label",3,"for"]],template:function(t,i){if(t&1&&(eI(),di$1(0,"div",3),_p("click",function(h){return i._preventBubblingFromLabel(h)}),di$1(1,"div",4,0)(3,"div",5),_p("click",function(){return i._onTouchTargetClick()}),Rc(),di$1(4,"input",6,1),_p("blur",function(){return i._onBlur()})("click",function(){return i._onInputClick()})("change",function(h){return i._onInteractionEvent(h)}),Rc(),Ep(6,"div",7),di$1(7,"div",8),vl(),di$1(8,"svg",9),Ep(9,"path",10),Rc(),Dl(),Ep(10,"div",11),Rc(),Ep(11,"div",12),Rc(),di$1(12,"label",13,2),tI(14),Rc()()),t&2){let s=sI(2);Dp("labelPosition",i.labelPosition),Bv(4),Pp("mdc-checkbox--selected",i.checked),Dp("checked",i.checked)("indeterminate",i.indeterminate)("disabled",i.disabled&&!i.disabledInteractive)("id",i.inputId)("required",i.required)("tabIndex",i.disabled&&!i.disabledInteractive?-1:i.tabIndex),vp("aria-label",i.ariaLabel||null)("aria-labelledby",i.ariaLabelledby)("aria-describedby",i.ariaDescribedby)("aria-checked",i.indeterminate?"mixed":null)("aria-controls",i.ariaControls)("aria-disabled",i.disabled&&i.disabledInteractive?true:null)("aria-expanded",i.ariaExpanded)("aria-owns",i.ariaOwns)("name",i.name)("value",i.value),Bv(7),Dp("matRippleTrigger",s)("matRippleDisabled",i.disableRipple||i.disabled)("matRippleCentered",true),Bv(),Dp("for",i.inputId);}},dependencies:[Td,m$1],styles:[`.mdc-checkbox {
  display: inline-block;
  position: relative;
  flex: 0 0 18px;
  box-sizing: content-box;
  width: 18px;
  height: 18px;
  line-height: 0;
  white-space: nowrap;
  cursor: pointer;
  vertical-align: bottom;
  padding: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
  margin: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
}
.mdc-checkbox:hover > .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:hover > .mat-mdc-checkbox-ripple > .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control:focus + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control:focus ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:active > .mdc-checkbox__native-control + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-pressed-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:active > .mdc-checkbox__native-control ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-pressed-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:hover > .mdc-checkbox__native-control:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-hover-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:hover > .mdc-checkbox__native-control:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-hover-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox .mdc-checkbox__native-control:focus:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-focus-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox .mdc-checkbox__native-control:focus:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-focus-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:active > .mdc-checkbox__native-control:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-pressed-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:active > .mdc-checkbox__native-control:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-pressed-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control ~ .mat-mdc-checkbox-ripple .mat-ripple-element,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control + .mdc-checkbox__ripple {
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control {
  position: absolute;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 1;
  width: var(--mat-checkbox-state-layer-size, 40px);
  height: var(--mat-checkbox-state-layer-size, 40px);
  top: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
  right: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
  left: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
}

.mdc-checkbox--disabled {
  cursor: default;
  pointer-events: none;
}

.mdc-checkbox__background {
  display: inline-flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 2px;
  background-color: transparent;
  pointer-events: none;
  will-change: background-color, border-color;
  transition: background-color 90ms cubic-bezier(0.4, 0, 0.6, 1), border-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
  -webkit-print-color-adjust: exact;
  color-adjust: exact;
  border-color: var(--mat-checkbox-unselected-icon-color, var(--mat-sys-on-surface-variant));
  top: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
  left: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
}

.mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:enabled:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox--disabled .mdc-checkbox__background {
  border-color: var(--mat-checkbox-disabled-unselected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__background {
    border-color: GrayText;
  }
}

.mdc-checkbox__native-control:disabled:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:disabled:indeterminate ~ .mdc-checkbox__background {
  background-color: var(--mat-checkbox-disabled-selected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: transparent;
}
@media (forced-colors: active) {
  .mdc-checkbox__native-control:disabled:checked ~ .mdc-checkbox__background,
  .mdc-checkbox__native-control:disabled:indeterminate ~ .mdc-checkbox__background {
    border-color: GrayText;
  }
}

.mdc-checkbox:hover > .mdc-checkbox__native-control:not(:checked) ~ .mdc-checkbox__background,
.mdc-checkbox:hover > .mdc-checkbox__native-control:not(:indeterminate) ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-unselected-hover-icon-color, var(--mat-sys-on-surface));
  background-color: transparent;
}

.mdc-checkbox:hover > .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox:hover > .mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-hover-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-hover-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox__native-control:focus:focus:not(:checked) ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:focus:focus:not(:indeterminate) ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-unselected-focus-icon-color, var(--mat-sys-on-surface));
}

.mdc-checkbox__native-control:focus:focus:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:focus:focus:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-focus-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-focus-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox:hover > .mdc-checkbox__native-control ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control:focus ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__background {
  border-color: var(--mat-checkbox-disabled-unselected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox:hover > .mdc-checkbox__native-control ~ .mdc-checkbox__background,
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control:focus ~ .mdc-checkbox__background,
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__background {
    border-color: GrayText;
  }
}
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  background-color: var(--mat-checkbox-disabled-selected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: transparent;
}

.mdc-checkbox__checkmark {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 180ms cubic-bezier(0.4, 0, 0.6, 1);
  color: var(--mat-checkbox-selected-checkmark-color, var(--mat-sys-on-primary));
}
@media (forced-colors: active) {
  .mdc-checkbox__checkmark {
    color: CanvasText;
  }
}

.mdc-checkbox--disabled .mdc-checkbox__checkmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__checkmark {
  color: var(--mat-checkbox-disabled-selected-checkmark-color, var(--mat-sys-surface));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__checkmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__checkmark {
    color: GrayText;
  }
}

.mdc-checkbox__checkmark-path {
  transition: stroke-dashoffset 180ms cubic-bezier(0.4, 0, 0.6, 1);
  stroke: currentColor;
  stroke-width: 3.12px;
  stroke-dashoffset: 29.7833385;
  stroke-dasharray: 29.7833385;
}

.mdc-checkbox__mixedmark {
  width: 100%;
  height: 0;
  transform: scaleX(0) rotate(0deg);
  border-width: 1px;
  border-style: solid;
  opacity: 0;
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
  border-color: var(--mat-checkbox-selected-checkmark-color, var(--mat-sys-on-primary));
}
@media (forced-colors: active) {
  .mdc-checkbox__mixedmark {
    margin: 0 1px;
  }
}

.mdc-checkbox--disabled .mdc-checkbox__mixedmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__mixedmark {
  border-color: var(--mat-checkbox-disabled-selected-checkmark-color, var(--mat-sys-surface));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__mixedmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__mixedmark {
    border-color: GrayText;
  }
}

.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__background,
.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__background,
.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__background,
.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__background {
  animation-duration: 180ms;
  animation-timing-function: linear;
}

.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__checkmark-path {
  animation: mdc-checkbox-unchecked-checked-checkmark-path 180ms linear;
  transition: none;
}

.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-unchecked-indeterminate-mixedmark 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__checkmark-path {
  animation: mdc-checkbox-checked-unchecked-checkmark-path 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__checkmark {
  animation: mdc-checkbox-checked-indeterminate-checkmark 90ms linear;
  transition: none;
}
.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-checked-indeterminate-mixedmark 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__checkmark {
  animation: mdc-checkbox-indeterminate-checked-checkmark 500ms linear;
  transition: none;
}
.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-indeterminate-checked-mixedmark 500ms linear;
  transition: none;
}

.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-indeterminate-unchecked-mixedmark 300ms linear;
  transition: none;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path,
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path {
  stroke-dashoffset: 0;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__checkmark {
  transition: opacity 180ms cubic-bezier(0, 0, 0.2, 1), transform 180ms cubic-bezier(0, 0, 0.2, 1);
  opacity: 1;
}
.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transform: scaleX(1) rotate(-45deg);
}

.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__checkmark {
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transform: scaleX(1) rotate(0deg);
  opacity: 1;
}

@keyframes mdc-checkbox-unchecked-checked-checkmark-path {
  0%, 50% {
    stroke-dashoffset: 29.7833385;
  }
  50% {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  100% {
    stroke-dashoffset: 0;
  }
}
@keyframes mdc-checkbox-unchecked-indeterminate-mixedmark {
  0%, 68.2% {
    transform: scaleX(0);
  }
  68.2% {
    animation-timing-function: cubic-bezier(0, 0, 0, 1);
  }
  100% {
    transform: scaleX(1);
  }
}
@keyframes mdc-checkbox-checked-unchecked-checkmark-path {
  from {
    animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
    opacity: 1;
    stroke-dashoffset: 0;
  }
  to {
    opacity: 0;
    stroke-dashoffset: -29.7833385;
  }
}
@keyframes mdc-checkbox-checked-indeterminate-checkmark {
  from {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(45deg);
    opacity: 0;
  }
}
@keyframes mdc-checkbox-indeterminate-checked-checkmark {
  from {
    animation-timing-function: cubic-bezier(0.14, 0, 0, 1);
    transform: rotate(45deg);
    opacity: 0;
  }
  to {
    transform: rotate(360deg);
    opacity: 1;
  }
}
@keyframes mdc-checkbox-checked-indeterminate-mixedmark {
  from {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: rotate(-45deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}
@keyframes mdc-checkbox-indeterminate-checked-mixedmark {
  from {
    animation-timing-function: cubic-bezier(0.14, 0, 0, 1);
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(315deg);
    opacity: 0;
  }
}
@keyframes mdc-checkbox-indeterminate-unchecked-mixedmark {
  0% {
    animation-timing-function: linear;
    transform: scaleX(1);
    opacity: 1;
  }
  32.8%, 100% {
    transform: scaleX(0);
    opacity: 0;
  }
}
.mat-mdc-checkbox {
  display: inline-block;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mat-mdc-checkbox-touch-target,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__native-control,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__ripple,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mat-mdc-checkbox-ripple::before,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__checkmark,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-checkbox label {
  cursor: pointer;
}
.mat-mdc-checkbox .mat-internal-form-field {
  color: var(--mat-checkbox-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-checkbox-label-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-checkbox-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-checkbox-label-text-size, var(--mat-sys-body-medium-size));
  letter-spacing: var(--mat-checkbox-label-text-tracking, var(--mat-sys-body-medium-tracking));
  font-weight: var(--mat-checkbox-label-text-weight, var(--mat-sys-body-medium-weight));
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled.mat-mdc-checkbox-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled.mat-mdc-checkbox-disabled-interactive input {
  cursor: default;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled label {
  cursor: default;
  color: var(--mat-checkbox-disabled-label-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mat-mdc-checkbox.mat-mdc-checkbox-disabled label {
    color: GrayText;
  }
}
.mat-mdc-checkbox label:empty {
  display: none;
}
.mat-mdc-checkbox .mdc-checkbox__ripple {
  opacity: 0;
}

.mat-mdc-checkbox .mat-mdc-checkbox-ripple,
.mdc-checkbox__ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-checkbox .mat-mdc-checkbox-ripple:not(:empty),
.mdc-checkbox__ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-mdc-checkbox-ripple .mat-ripple-element {
  opacity: 0.1;
}

.mat-mdc-checkbox-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--mat-checkbox-touch-target-size, 48px);
  width: var(--mat-checkbox-touch-target-size, 48px);
  transform: translate(-50%, -50%);
  display: var(--mat-checkbox-touch-target-display, block);
}

.mat-mdc-checkbox .mat-mdc-checkbox-ripple::before {
  border-radius: 50%;
}

.mdc-checkbox__native-control:focus-visible ~ .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2})}return n})(),mi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=ip({type:n});static \u0275inj=ms({imports:[Ft,gt]})}return n})();var Co=["canvas"];function So(n,o){if(n&1&&(di$1(0,"p",10),MI(1),Rc()),n&2){let e=JE(2);Bv(),Up(e.labels.emptyDrawHint);}}function Eo(n,o){if(n&1){let e=QE();di$1(0,"canvas",9,0),_p("pointerdown",function(i){sl(e);let s=JE();return al(s.onPointerDown(i))})("pointermove",function(i){sl(e);let s=JE();return al(s.onPointerMove(i))})("pointerup",function(){sl(e);let i=JE();return al(i.onPointerUp())})("pointerleave",function(){sl(e);let i=JE();return al(i.onPointerUp())})("pointercancel",function(){sl(e);let i=JE();return al(i.onPointerUp())}),Rc(),VE(2,So,2,1,"p",10);}if(n&2){let e=JE();vp("aria-label",e.labels.canvasAriaLabel),Bv(2),BE(e.hasDrawing()?-1:2);}}function Oo(n,o){if(n&1){let e=QE();di$1(0,"mat-form-field",4)(1,"mat-label"),MI(2),Rc(),di$1(3,"input",11),_p("input",function(i){sl(e);let s=JE();return al(s.onTypedNameInputEvent(i))}),Rc()();}if(n&2){let e=JE();Bv(2),Up(e.labels.typedNameLabel),Bv(),Dp("value",e.typedName())("placeholder",e.labels.typedNamePlaceholder);}}function Io(n,o){if(n&1){let e=QE();di$1(0,"button",12),_p("click",function(){sl(e);let i=JE();return al(i.confirm())}),MI(1),Rc();}if(n&2){let e=JE();Dp("disabled",!e.canConfirm()),Bv(),Lc(" ",e.submitting()?e.labels.signing:e.labels.confirmSign," ");}}var Ie=class n{labels=v(Oe).signaturePad;assetStore=v(r);showConfirmButton=fP(true);signed=dP();canvasRef=hP("canvas");isDrawing=false;lastPoint;mode=Fo$1("draw");hasDrawing=Fo$1(false);typedName=Fo$1("");acknowledged=Fo$1(false);_submitting=Fo$1(false);submitting=this._submitting.asReadonly();hasSignatureInput=eC(()=>this.mode()==="draw"?this.hasDrawing():this.typedName().trim().length>0);canConfirm=eC(()=>this.hasSignatureInput()&&this.acknowledged()&&!this._submitting());getContext(){let o=this.canvasRef()?.nativeElement;if(!o)return null;let e=o.getContext("2d");return e&&(e.lineWidth=2*this.backingScale(o),e.lineCap="round",e.strokeStyle=getComputedStyle(o).color),e}syncCanvasSize(){let o=this.canvasRef()?.nativeElement;if(!o)return;let e=o.getBoundingClientRect();if(e.width===0||e.height===0)return;let t=typeof window<"u"&&window.devicePixelRatio?window.devicePixelRatio:1,i=Math.round(e.width*t),s=Math.round(e.height*t);o.width!==i&&(o.width=i),o.height!==s&&(o.height=s);}backingScale(o){let e=o.getBoundingClientRect();return e.width>0?o.width/e.width:1}switchMode(o){this.mode.set(o);}onPointerDown(o){this.hasDrawing()||this.syncCanvasSize(),this.isDrawing=true,this.lastPoint=this.pointFromEvent(o),o.target?.setPointerCapture?.(o.pointerId);}onPointerMove(o){if(!this.isDrawing)return;let e=this.pointFromEvent(o),t=this.getContext();t&&this.lastPoint&&(t.beginPath(),t.moveTo(this.lastPoint.x,this.lastPoint.y),t.lineTo(e.x,e.y),t.stroke()),this.lastPoint=e,this.hasDrawing.set(true);}onPointerUp(){this.isDrawing=false,this.lastPoint=void 0;}pointFromEvent(o){let e=this.canvasRef()?.nativeElement;if(!e)return {x:0,y:0};let t=e.getBoundingClientRect(),i=t.width>0?e.width/t.width:1,s=t.height>0?e.height/t.height:1;return {x:(o.clientX-t.left)*i,y:(o.clientY-t.top)*s}}clear(){if(this.mode()==="draw"){let o=this.canvasRef()?.nativeElement,e=this.getContext();o&&e&&e.clearRect(0,0,o.width,o.height),this.hasDrawing.set(false);}else this.typedName.set("");this.isDrawing=false,this.lastPoint=void 0;}onTypedNameInput(o){this.typedName.set(o);}onTypedNameInputEvent(o){this.onTypedNameInput(o.target.value);}toggleAcknowledged(o){this.acknowledged.set(o);}onAcknowledgeChange(o){this.toggleAcknowledged(o.checked);}async confirm(){if(this.canConfirm()){this._submitting.set(true);try{let o=this.mode()==="draw"?await this.captureDrawingBlob():this.typedNameBlob();if(!o)return;let e=this.mode()==="draw"?"signature.png":"signature-typed.txt",t=await this.assetStore.store(o,e);return this.signed.emit(t),t}finally{this._submitting.set(false);}}}captureDrawingBlob(){let o=this.canvasRef()?.nativeElement;return o?new Promise(e=>o.toBlob(t=>e(t??void 0),"image/png")):Promise.resolve(void 0)}typedNameBlob(){return new Blob([this.typedName().trim()],{type:"text/plain"})}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=mE({type:n,selectors:[["lib-signature-pad"]],viewQuery:function(e,t){e&1&&Rp(t.canvasRef,Co,5),e&2&&iI();},inputs:{showConfirmButton:[1,"showConfirmButton"]},outputs:{signed:"signed"},decls:15,vars:16,consts:[["canvas",""],[1,"signature-pad"],["role","group",1,"signature-pad__mode-switch"],["type","button","mat-stroked-button","",1,"signature-pad__mode-btn",3,"click"],[1,"signature-pad__typed-field"],["type","button","mat-button","",3,"click","disabled"],[3,"change","checked"],[1,"signature-pad__mock-notice"],["type","button","mat-flat-button","",3,"disabled"],["width","480","height","160","tabindex","0",1,"signature-pad__canvas",3,"pointerdown","pointermove","pointerup","pointerleave","pointercancel"],[1,"signature-pad__hint"],["matInput","",3,"input","value","placeholder"],["type","button","mat-flat-button","",3,"click","disabled"]],template:function(e,t){e&1&&(di$1(0,"div",1)(1,"div",2)(2,"button",3),_p("click",function(){return t.switchMode("draw")}),MI(3),Rc(),di$1(4,"button",3),_p("click",function(){return t.switchMode("type")}),MI(5),Rc()(),VE(6,Eo,3,2)(7,Oo,4,3,"mat-form-field",4),di$1(8,"button",5),_p("click",function(){return t.clear()}),MI(9),Rc(),di$1(10,"mat-checkbox",6),_p("change",function(s){return t.onAcknowledgeChange(s)}),MI(11),Rc(),di$1(12,"p",7),MI(13),Rc(),VE(14,Io,2,2,"button",8),Rc()),e&2&&(Bv(),vp("aria-label",t.labels.drawTab+"/"+t.labels.typeTab),Bv(),Pp("is-active",t.mode()==="draw"),vp("aria-pressed",t.mode()==="draw"),Bv(),Lc(" ",t.labels.drawTab," "),Bv(),Pp("is-active",t.mode()==="type"),vp("aria-pressed",t.mode()==="type"),Bv(),Lc(" ",t.labels.typeTab," "),Bv(),BE(t.mode()==="draw"?6:7),Bv(2),Dp("disabled",!t.hasSignatureInput()),Bv(),Lc(" ",t.labels.clear," "),Bv(),Dp("checked",t.acknowledged()),Bv(),Lc(" ",t.labels.acknowledge," "),Bv(2),Up(t.labels.mockNotice),Bv(),BE(t.showConfirmButton()?14:-1));},dependencies:[nl,tl,mi,Ft,ce$1,rt,ae,ln,an],styles:['@charset "UTF-8";[_nghost-%COMP%]{display:block}.signature-pad[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.75rem}.signature-pad__mode-switch[_ngcontent-%COMP%]{display:flex;gap:.5rem}.signature-pad__mode-btn.is-active[_ngcontent-%COMP%]{font-weight:600}.signature-pad__canvas[_ngcontent-%COMP%]{width:100%;height:var(--lib-signature-pad-canvas-height, 10rem);border:1px dashed var(--mat-sys-outline-variant);border-radius:.375rem;touch-action:none;background:var(--mat-sys-surface);cursor:crosshair}.signature-pad__hint[_ngcontent-%COMP%]{margin:0;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.signature-pad__typed-field[_ngcontent-%COMP%]{width:100%}.signature-pad__mock-notice[_ngcontent-%COMP%]{margin:0;font-size:.875rem;color:var(--app-warning-fg)}']})};function Mo(n,o){if(n&1&&(di$1(0,"span",1),MI(1),Rc()),n&2){let e=JE();Bv(),Gp("",e.labels.document.versionLabel," ",o.version);}}function wo(n,o){if(n&1&&(di$1(0,"p",3),MI(1),Rc()),n&2){let e=JE();Bv(),Up(e.labels.needsResignNotice);}}var _t=class n{labels=v(Oe);data=v($e$1);dialogRef=v(O$1);pad=hP.required(Ie);canConfirm=eC(()=>this.pad().canConfirm());submitting=eC(()=>this.pad().submitting());cancel(){this.dialogRef.close(void 0);}async confirm(){let o=await this.pad().confirm();o&&this.dialogRef.close(o);}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=mE({type:n,selectors:[["lib-contract-signing-dialog"]],viewQuery:function(e,t){e&1&&Rp(t.pad,Ie,5),e&2&&iI();},hostAttrs:[1,"lib-contract-signing-dialog"],decls:13,vars:9,consts:[["mat-dialog-title","",1,"lib-contract-signing-dialog__title"],[1,"lib-contract-signing-dialog__version"],[1,"lib-contract-signing-dialog__content"],["role","status",1,"lib-contract-signing-dialog__notice"],[1,"lib-contract-signing-dialog__document",3,"snapshot","version"],[1,"lib-contract-signing-dialog__signature"],[3,"showConfirmButton"],["align","end",1,"lib-contract-signing-dialog__actions"],["type","button","mat-button","",3,"click"],["type","button","mat-flat-button","",3,"click","disabled"]],template:function(e,t){if(e&1&&(di$1(0,"h2",0),MI(1),VE(2,Mo,2,2,"span",1),Rc(),di$1(3,"mat-dialog-content",2),VE(4,wo,2,1,"p",3),Ep(5,"lib-contract-document",4),di$1(6,"section",5),Ep(7,"lib-signature-pad",6),Rc()(),di$1(8,"mat-dialog-actions",7)(9,"button",8),_p("click",function(){return t.cancel()}),MI(10),Rc(),di$1(11,"button",9),_p("click",function(){return t.confirm()}),MI(12),Rc()()),e&2){let i;Bv(),Lc(" ",t.labels.dialog.title," "),Bv(),BE((i=t.data.version)?2:-1,i),Bv(2),BE(t.data.needsResign?4:-1),Bv(),Dp("snapshot",t.data.snapshot)("version",t.data.version),Bv(2),Dp("showConfirmButton",false),Bv(3),Up(t.labels.dialog.cancel),Bv(),Dp("disabled",!t.canConfirm()),Bv(),Lc(" ",t.submitting()?t.labels.dialog.signing:t.labels.dialog.confirm," ");}},dependencies:[Ht,Nt,zt$1,Vt,nl,tl,ht,Ie],styles:[`@charset "UTF-8";.lib-contract-signing-dialog{display:flex;flex-direction:column;height:100%;min-height:0}.lib-contract-signing-dialog__title{display:flex;align-items:baseline;flex-wrap:wrap;column-gap:.75rem}.lib-contract-signing-dialog__version{font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.lib-contract-signing-dialog .lib-contract-signing-dialog__content{flex:1 1 auto;min-height:0;max-height:none;display:flex;flex-direction:column;gap:1.25rem;color:var(--mat-sys-on-surface)}.lib-contract-signing-dialog__notice{margin:0;padding:.625rem .875rem;border-radius:var(--mat-sys-corner-small);background:var(--app-warning-bg);color:var(--app-warning-fg);font-weight:600}.lib-contract-signing-dialog__signature{padding:1rem;border:1px solid var(--mat-sys-primary);border-radius:var(--mat-sys-corner-medium);background:var(--mat-sys-surface-container-low);--lib-signature-pad-canvas-height: 14rem}.lib-contract-signing-dialog__actions{border-top:1px solid var(--mat-sys-outline-variant)}.cdk-overlay-pane.lib-contract-signing-dialog-panel--fullscreen .mat-mdc-dialog-surface{border-radius:0!important}.lib-contract-signing-dialog-panel--fullscreen .lib-contract-signing-dialog__signature{padding:.75rem;--lib-signature-pad-canvas-height: 12rem}
`],encapsulation:2})};var Po="(max-width: 768px)",pi="lib-contract-signing-dialog-panel",To="lib-contract-signing-dialog-panel--fullscreen";function Do(){return typeof window<"u"&&typeof window.matchMedia=="function"?window.matchMedia(Po).matches:false}function Ro(n,o=Do()){let e={data:n,disableClose:true,autoFocus:"dialog",restoreFocus:true};return o?m(l({},e),{width:"100vw",height:"100dvh",maxWidth:"100vw",maxHeight:"100dvh",panelClass:[pi,To]}):m(l({},e),{width:"min(960px, 92vw)",height:"min(92dvh, 1080px)",maxWidth:"92vw",maxHeight:"92dvh",panelClass:[pi]})}function vc(n,o){return n.open(_t,Ro(o)).afterClosed()}var Ao=(n,o)=>o.value,ui=(n,o)=>o.id;function Fo(n,o){if(n&1&&(di$1(0,"mat-option",5),MI(1),Rc()),n&2){let e=o.$implicit;Dp("value",e.value),Bv(),Up(e.label);}}function Lo(n,o){if(n&1&&(di$1(0,"mat-option",5),MI(1),Rc()),n&2){let e=o.$implicit;Dp("value",e),Bv(),Up(e);}}function No(n,o){if(n&1&&(di$1(0,"mat-option",5),MI(1),Rc()),n&2){let e=o.$implicit;Dp("value",e),Bv(),Up(e);}}function Vo(n,o){if(n&1&&(di$1(0,"mat-option",5),MI(1),Rc()),n&2){let e=o.$implicit;Dp("value",e.id),Bv(),Up(e.name);}}function Bo(n,o){if(n&1&&(di$1(0,"mat-option",5),MI(1),Rc()),n&2){let e=o.$implicit;Dp("value",e.id),Bv(),Up(e.name);}}function qo(n,o){if(n&1&&(di$1(0,"p",12),MI(1),Rc()),n&2){let e=JE();Bv(),Up(e.setAsideText());}}function zo(n,o){if(n&1&&(di$1(0,"p",13),MI(1),Rc()),n&2){let e=JE();Bv(),Gp(" ",e.t.orderForm.vehicleConflict,"\uFF08",e.derived.conflicts().length,"\uFF09 ");}}function Go(n,o){if(n&1&&(di$1(0,"p",13),MI(1),Rc()),n&2){let e=JE();Bv(),Up(e.t.orderForm.quoteUnavailable);}}var J=GP,Uo={field:J.rentalSearch.period,placeholder:J.rentalSearch.periodPlaceholder,prevMonth:J.rentalSearch.prevMonth,nextMonth:J.rentalSearch.nextMonth,monthTitle:J.rentalSearch.monthTitle};function hi(n,o){return n===o||!!n&&!!o&&n.getTime()===o.getTime()}var _i=class n{t=J;branches=Q;categoryOptions=NP.map(o=>({value:o,label:J.vehicle.typeLabels[o]??o}));data=v(V);availability=v(se$1);form=fP.required();context=fP({});value=Ne(this.form);derived=st(this.value,this.data,()=>this.context());category=Fo$1("");startLocal=eC(()=>this.value().rental.startLocal);endLocal=eC(()=>this.value().rental.endLocal);pickupBranchId=eC(()=>this.value().rental.pickupBranchId);vehicleId=eC(()=>this.value().rental.vehicleId);editingBookingId=eC(()=>this.context().editingBookingId);pendingStartTime=Fo$1(He);pendingEndTime=Fo$1(He);startTime=eC(()=>Ke(this.startLocal())||this.pendingStartTime());endTime=eC(()=>Ke(this.endLocal())||this.pendingEndTime());startTimeOptions=eC(()=>Je(this.startTime()));endTimeOptions=eC(()=>Je(this.endTime()));rangeStart=eC(()=>Ge(me(this.startLocal())),{equal:hi});rangeEnd=eC(()=>Ge(me(this.endLocal())),{equal:hi});wantedVehicleId=nC({source:()=>({form:this.form(),id:this.vehicleId()}),computation:(o,e)=>o.id||(e&&e.source.form===o.form?e.value:"")});periodAvailability=eC(()=>{let o=_e(this.startLocal(),this.endLocal());if(o)return this.availability.forPeriod(o.start.toISOString(),o.end.toISOString(),this.editingBookingId())});setAsideVehicle=eC(()=>{let o=this.wantedVehicleId(),e=this.periodAvailability();if(!(!o||!e||e.available.some(t=>t.id===o)))return this.data.vehicles().find(t=>t.id===o)});setAsideText=eC(()=>{let o=this.setAsideVehicle();return o?J.rentalSearch.originalUnavailable.replace("{plate}",o.plateNumber):""});constructor(){Ml(()=>{if(this.editingBookingId())return;let o=this.wantedVehicleId(),e=this.periodAvailability();if(!o||!e)return;let t=this.category(),s=e.available.some(b=>b.id===o&&(!t||b.category===t))?o:"",h=this.form().controls.rental.controls.vehicleId;h.value!==s&&h.setValue(s);});}onRangeSelected(o){let e=this.form().controls.rental;e.patchValue({startLocal:Ze(F(o.start),this.startTime()),endLocal:Ze(F(o.end),this.endTime())}),e.controls.startLocal.markAsDirty(),e.controls.endLocal.markAsDirty();}onStartTimeChange(o){this.pendingStartTime.set(o),this.applyTime(this.form().controls.rental.controls.startLocal,o);}onEndTimeChange(o){this.pendingEndTime.set(o),this.applyTime(this.form().controls.rental.controls.endLocal,o);}pickVehicle(o){let e=this.form().controls.rental.controls.vehicleId;e.setValue(o.id),e.markAsDirty(),e.markAsTouched();}applyTime(o,e){let t=me(o.value);t&&(o.setValue(Ze(t,e)),o.markAsDirty());}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=mE({type:n,selectors:[["app-order-rental-section"]],inputs:{form:[1,"form"],context:[1,"context"]},features:[HI([{provide:It$1,useValue:Uo}])],decls:45,vars:23,consts:[[1,"order-section","rental-search",3,"formGroup"],[1,"rental-search__bar"],[1,"rental-search__row","rental-search__row--period"],[1,"rental-search__category",3,"valueChange","value"],["value",""],[3,"value"],[1,"rental-search__range",3,"rangeSelected","start","end"],[1,"rental-search__row","rental-search__row--details"],[1,"rental-search__start-time",3,"valueChange","value"],[1,"rental-search__end-time",3,"valueChange","value"],["formControlName","pickupBranchId"],["formControlName","returnBranchId"],["role","alert",1,"order-section__notice","rental-search__set-aside"],["role","alert",1,"order-section__notice"],[3,"vehicleSelected","start","end","category","pickupBranchId","selectable","selectedVehicleId","excludeBookingId"]],template:function(e,t){e&1&&(di$1(0,"div",0)(1,"div",1)(2,"div",2)(3,"mat-form-field")(4,"mat-label"),MI(5),Rc(),di$1(6,"mat-select",3),_p("valueChange",function(s){return t.category.set(s)}),di$1(7,"mat-option",4),MI(8),Rc(),UE(9,Fo,2,2,"mat-option",5,Ao),Rc()(),di$1(11,"lib-dual-month-range-picker",6),_p("rangeSelected",function(s){return t.onRangeSelected(s)}),Rc()(),di$1(12,"div",7)(13,"mat-form-field")(14,"mat-label"),MI(15),Rc(),di$1(16,"mat-select",8),_p("valueChange",function(s){return t.onStartTimeChange(s)}),UE(17,Lo,2,2,"mat-option",5,$E),Rc()(),di$1(19,"mat-form-field")(20,"mat-label"),MI(21),Rc(),di$1(22,"mat-select",9),_p("valueChange",function(s){return t.onEndTimeChange(s)}),UE(23,No,2,2,"mat-option",5,$E),Rc()(),di$1(25,"mat-form-field")(26,"mat-label"),MI(27),Rc(),di$1(28,"mat-select",10),UE(29,Vo,2,2,"mat-option",5,ui),Rc(),_D(),di$1(31,"mat-error"),MI(32),Rc()(),di$1(33,"mat-form-field")(34,"mat-label"),MI(35),Rc(),di$1(36,"mat-select",11),UE(37,Bo,2,2,"mat-option",5,ui),Rc(),_D(),di$1(39,"mat-error"),MI(40),Rc()()()(),VE(41,qo,2,1,"p",12)(42,zo,2,2,"p",13),di$1(43,"app-available-vehicle-list",14),_p("vehicleSelected",function(s){return t.pickVehicle(s)}),Rc(),VE(44,Go,2,1,"p",13),Rc()),e&2&&(Dp("formGroup",t.form().controls.rental),Bv(5),Up(t.t.rentalSearch.category),Bv(),Dp("value",t.category()),Bv(2),Up(t.t.rentalSearch.allCategories),Bv(),GE(t.categoryOptions),Bv(2),Dp("start",t.rangeStart())("end",t.rangeEnd()),Bv(4),Up(t.t.rentalSearch.startTime),Bv(),Dp("value",t.startTime()),Bv(),GE(t.startTimeOptions()),Bv(4),Up(t.t.rentalSearch.endTime),Bv(),Dp("value",t.endTime()),Bv(),GE(t.endTimeOptions()),Bv(4),Up(t.t.rentalSearch.pickupBranchId),Bv(),MD(),Bv(),GE(t.branches),Bv(3),Up(t.t.orderForm.required),Bv(3),Up(t.t.rentalSearch.returnBranchId),Bv(),MD(),Bv(),GE(t.branches),Bv(3),Up(t.t.orderForm.required),Bv(),BE(t.setAsideVehicle()?41:t.derived.conflicts().length>0?42:-1),Bv(2),Dp("start",t.startLocal())("end",t.endLocal())("category",t.category())("pickupBranchId",t.pickupBranchId())("selectable",true)("selectedVehicleId",t.vehicleId())("excludeBookingId",t.editingBookingId()),Bv(),BE(t.derived.quoteUnavailable()?44:-1));},dependencies:[Gn,Rn,Pn,fn,cn,ce$1,rt,ae,It,qt,zt,Ct,Qt,ve],styles:["[_nghost-%COMP%]{display:block;min-width:0}.order-section[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem}.order-section__grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1rem;row-gap:.25rem}@media(max-width:600px){.order-section__grid[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr)}}.order-section__full[_ngcontent-%COMP%]{grid-column:1/-1}.order-section__subtitle[_ngcontent-%COMP%]{margin:1.25rem 0 .5rem;font-size:1.0625rem;font-weight:600;color:var(--mat-sys-on-surface)}.order-section__notice[_ngcontent-%COMP%]{margin:0 0 .75rem;font-size:1rem;color:var(--mat-sys-error)}.order-section__hint[_ngcontent-%COMP%]{margin:0 0 .75rem;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.order-section__dl[_ngcontent-%COMP%]{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:.625rem 1.5rem;margin:0 0 1rem;font-size:1rem}.order-section__dl[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.order-section__dl[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%]{margin:0;color:var(--mat-sys-on-surface);overflow-wrap:anywhere}.order-section__dl[_ngcontent-%COMP%]   .is-total[_ngcontent-%COMP%]{font-weight:600}",".rental-search[_ngcontent-%COMP%]{gap:.5rem}.rental-search__row[_ngcontent-%COMP%]{display:grid;column-gap:1rem}.rental-search__row--period[_ngcontent-%COMP%]{grid-template-columns:minmax(0,12rem) minmax(0,1fr)}.rental-search__row--details[_ngcontent-%COMP%]{grid-template-columns:repeat(4,minmax(0,1fr))}.rental-search__range[_ngcontent-%COMP%]{display:block;min-width:0}.rental-search__set-aside[_ngcontent-%COMP%]{margin:0}@media(max-width:767.98px){.rental-search__row--period[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr)}.rental-search__row--details[_ngcontent-%COMP%]{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:399.98px){.rental-search__row--details[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr)}}"]})};export{Ft as F,Jn as J,Oe as O,Wo as W,Xo as X,Yo as Y,_i as _,ai as a,si as b,ht as h,mi as m,st as s,vc as v};
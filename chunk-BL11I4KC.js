import {v,ag as S,ad as Yt,bf as ie,ac as ye,aM as J$1,cd as vg,aT as Ag,Y as l,Z as m,ce as oe,cf as xn,cg as Kt,ch as ne,ci as xt,cj as en,ck as U,cl as st,cm as Rt,aH as _n,aN as L,be as _i,cn as Ln,bt as kn,aU as Eg,bu as Or,aq as $e$1,aJ as xd,m as mE,aW as Fi,aK as lp,d as di,r as fp,R as Rc,aC as wp,h as vp,P as Pp,a4 as ip,a5 as ms,co as me,cp as Ht$1,a7 as gt,a9 as Rn,aj as Mc,av as Qa,_ as _p,cq as bE,cr as tt,cs as Ir,ae as Ar,a8 as Ne$1,ao as st$1,ab as Lf,ap as mC,aS as w,af as Pe$1,bg as mv,ct as $t,aE as xp,aF as rI,aG as oI,F as Fo,cu as Kt$1,a6 as ni,bh as ce}from'./main-75DZX6EX.js';function ze(i,a){}var g=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;positionStrategy;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;scrollStrategy;closeOnNavigation=true;closeOnDestroy=true;closeOnOverlayDetachments=true;disableAnimations=false;providers;container;templateContext;bindings};var K=(()=>{class i extends tt{_elementRef=v(Rn);_focusTrapFactory=v(Ir);_config;_interactivityChecker=v(Ar);_ngZone=v(Ne$1);_focusMonitor=v(st$1);_renderer=v(Lf);_changeDetectorRef=v(mC);_injector=v(ie);_platform=v(w);_document=v(Pe$1);_portalOutlet;_focusTrapped=new J$1;_focusTrap=null;_elementFocusedBeforeDialogWasOpened=null;_closeInteractionType=null;_ariaLabelledByQueue=[];_isDestroyed=false;constructor(){super(),this._config=v(g,{optional:true})||new g,this._config.ariaLabelledBy&&this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);}_addAriaLabelledBy(e){this._ariaLabelledByQueue.push(e),this._changeDetectorRef.markForCheck();}_removeAriaLabelledBy(e){let t=this._ariaLabelledByQueue.indexOf(e);t>-1&&(this._ariaLabelledByQueue.splice(t,1),this._changeDetectorRef.markForCheck());}_contentAttached(){this._initializeFocusTrap(),this._captureInitialFocus();}_captureInitialFocus(){this._trapFocus();}ngOnDestroy(){this._focusTrapped.complete(),this._isDestroyed=true,this._restoreFocus();}attachComponentPortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._contentAttached(),t}attachTemplatePortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._contentAttached(),t}attachDomPortal=e=>{this._portalOutlet.hasAttached();let t=this._portalOutlet.attachDomPortal(e);return this._contentAttached(),t};_recaptureFocus(){this._containsFocus()||this._trapFocus();}_forceFocus(e,t){this._interactivityChecker.isFocusable(e)||(e.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let n=()=>{o(),l(),e.removeAttribute("tabindex");},o=this._renderer.listen(e,"blur",n),l=this._renderer.listen(e,"mousedown",n);})),e.focus(t);}_focusByCssSelector(e,t){let n=this._elementRef.nativeElement.querySelector(e);n&&this._forceFocus(n,t);}_trapFocus(e){this._isDestroyed||mv(()=>{let t=this._elementRef.nativeElement;switch(this._config.autoFocus){case  false:case "dialog":this._containsFocus()||t.focus(e);break;case  true:case "first-tabbable":this._focusTrap?.focusInitialElement(e)||this._focusDialogContainer(e);break;case "first-heading":this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]',e);break;default:this._focusByCssSelector(this._config.autoFocus,e);break}this._focusTrapped.next();},{injector:this._injector});}_restoreFocus(){let e=this._config.restoreFocus,t=null;if(typeof e=="string"?t=this._document.querySelector(e):typeof e=="boolean"?t=e?this._elementFocusedBeforeDialogWasOpened:null:e&&(t=e),this._config.restoreFocus&&t&&typeof t.focus=="function"){let n=$t(),o=this._elementRef.nativeElement;(!n||n===this._document.body||n===o||o.contains(n))&&(this._focusMonitor?(this._focusMonitor.focusVia(t,this._closeInteractionType),this._closeInteractionType=null):t.focus());}this._focusTrap&&this._focusTrap.destroy();}_focusDialogContainer(e){this._elementRef.nativeElement.focus?.(e);}_containsFocus(){let e=this._elementRef.nativeElement,t=$t();return e===t||e.contains(t)}_initializeFocusTrap(){this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._document&&(this._elementFocusedBeforeDialogWasOpened=$t()));}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mE({type:i,selectors:[["cdk-dialog-container"]],viewQuery:function(t,n){if(t&1&&xp(Fi,7),t&2){let o;rI(o=oI())&&(n._portalOutlet=o.first);}},hostAttrs:["tabindex","-1",1,"cdk-dialog-container"],hostVars:6,hostBindings:function(t,n){t&2&&vp("id",n._config.id||null)("role",n._config.role)("aria-modal",n._config.ariaModal)("aria-labelledby",n._config.ariaLabel?null:n._ariaLabelledByQueue[0])("aria-label",n._config.ariaLabel)("aria-describedby",n._config.ariaDescribedBy||null);},features:[lp],decls:1,vars:0,consts:[["cdkPortalOutlet",""]],template:function(t,n){t&1&&fp(0,ze,0,0,"ng-template",0);},dependencies:[Fi],styles:[`.cdk-dialog-container {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  max-height: inherit;
}
`],encapsulation:2,changeDetection:1})}return i})(),T=class{overlayRef;config;componentInstance=null;componentRef=null;containerInstance;disableClose;closed=new J$1;backdropClick;keydownEvents;outsidePointerEvents;id;_detachSubscription;constructor(a,e){this.overlayRef=a,this.config=e,this.disableClose=e.disableClose,this.backdropClick=a.backdropClick(),this.keydownEvents=a.keydownEvents(),this.outsidePointerEvents=a.outsidePointerEvents(),this.id=e.id,this.keydownEvents.subscribe(t=>{t.keyCode===27&&!this.disableClose&&!Or(t)&&(t.preventDefault(),this.close(void 0,{focusOrigin:"keyboard"}));}),this.backdropClick.subscribe(()=>{!this.disableClose&&this._canClose()?this.close(void 0,{focusOrigin:"mouse"}):this.containerInstance._recaptureFocus?.();}),this._detachSubscription=a.detachments().subscribe(()=>{e.closeOnOverlayDetachments!==false&&this.close();});}close(a,e){if(this._canClose(a)){let t=this.closed;this.containerInstance._closeInteractionType=e?.focusOrigin||"program",this._detachSubscription.unsubscribe(),this.overlayRef.dispose(),t.next(a),t.complete(),this.componentInstance=this.containerInstance=null;}}updatePosition(){return this.overlayRef.updatePosition(),this}updateSize(a="",e=""){return this.overlayRef.updateSize({width:a,height:e}),this}addPanelClass(a){return this.overlayRef.addPanelClass(a),this}removePanelClass(a){return this.overlayRef.removePanelClass(a),this}_canClose(a){let e=this.config;return !!this.containerInstance&&(!e.closePredicate||e.closePredicate(a,e,this.componentInstance))}},He=new S("DialogScrollStrategy",{providedIn:"root",factory:()=>{let i=v(ie);return ()=>Kt(i)}}),Ge=new S("DialogData"),We=new S("DefaultDialogConfig");function Qe(i){let a=Fo(i),e=new $e$1;return {valueSignal:a,get value(){return a()},change:e,ngOnDestroy(){e.complete();}}}var X=(()=>{class i{_injector=v(ie);_defaultOptions=v(We,{optional:true});_parentDialog=v(i,{optional:true,skipSelf:true});_overlayContainer=v(ne);_idGenerator=v(Yt);_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new J$1;_afterOpenedAtThisLevel=new J$1;_ariaHiddenElements=new Map;_scrollStrategy=v(He);get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}afterAllClosed=vg(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(Ag(void 0)));open(e,t){let n=this._defaultOptions||new g;t=l(l({},n),t),t.id=t.id||this._idGenerator.getId("cdk-dialog-"),t.id&&this.getDialogById(t.id);let o=this._getOverlayConfig(t),l$1=xt(this._injector,o),r=new T(l$1,t),d=this._attachContainer(l$1,r,t);if(r.containerInstance=d,!this.openDialogs.length){let H=this._overlayContainer.getContainerElement();d._focusTrapped?d._focusTrapped.pipe(en(1)).subscribe(()=>{this._hideNonDialogContentFromAssistiveTechnology(H);}):this._hideNonDialogContentFromAssistiveTechnology(H);}return this._attachDialogContent(e,r,d,t),this.openDialogs.push(r),r.closed.subscribe(()=>this._removeOpenDialog(r,true)),this.afterOpened.next(r),r}closeAll(){$(this.openDialogs,e=>e.close());}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){$(this._openDialogsAtThisLevel,e=>{e.config.closeOnDestroy===false&&this._removeOpenDialog(e,false);}),$(this._openDialogsAtThisLevel,e=>e.close()),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete(),this._openDialogsAtThisLevel=[];}_getOverlayConfig(e){let t=new U({positionStrategy:e.positionStrategy||oe().centerHorizontally().centerVertically(),scrollStrategy:e.scrollStrategy||this._scrollStrategy(),panelClass:e.panelClass,hasBackdrop:e.hasBackdrop,direction:e.direction,minWidth:e.minWidth,minHeight:e.minHeight,maxWidth:e.maxWidth,maxHeight:e.maxHeight,width:e.width,height:e.height,disposeOnNavigation:e.closeOnNavigation,disableAnimations:e.disableAnimations});return e.backdropClass&&(t.backdropClass=e.backdropClass),t}_attachContainer(e,t,n){let o=n.injector||n.viewContainerRef?.injector,l=[{provide:g,useValue:n},{provide:T,useValue:t},{provide:st,useValue:e}],r;n.container?typeof n.container=="function"?r=n.container:(r=n.container.type,l.push(...n.container.providers(n))):r=K;let d=new Rt(r,n.viewContainerRef,ie.create({parent:o||this._injector,providers:l}));return e.attach(d).instance}_attachDialogContent(e,t,n,o){if(e instanceof _n){let l$1=this._createInjector(o,t,n,void 0),r={$implicit:o.data,dialogRef:t};o.templateContext&&(r=l(l({},r),typeof o.templateContext=="function"?o.templateContext():o.templateContext)),n.attachTemplatePortal(new L(e,null,r,l$1));}else {let l=this._createInjector(o,t,n,this._injector),r=n.attachComponentPortal(new Rt(e,o.viewContainerRef,l,null,o.bindings));t.componentRef=r,t.componentInstance=r.instance;}}_createInjector(e,t,n,o){let l=e.injector||e.viewContainerRef?.injector,r=[{provide:Ge,useValue:e.data},{provide:T,useValue:t}];return e.providers&&(typeof e.providers=="function"?r.push(...e.providers(t,e,n)):r.push(...e.providers)),e.direction&&(!l||!l.get(_i,null,{optional:true}))&&r.push({provide:_i,useValue:Qe(e.direction)}),ie.create({parent:l||o,providers:r})}_removeOpenDialog(e,t){let n=this.openDialogs.indexOf(e);n>-1&&(this.openDialogs.splice(n,1),this.openDialogs.length||(this._ariaHiddenElements.forEach((o,l)=>{o?l.setAttribute("aria-hidden",o):l.removeAttribute("aria-hidden");}),this._ariaHiddenElements.clear(),t&&this._getAfterAllClosed().next()));}_hideNonDialogContentFromAssistiveTechnology(e){if(e.parentElement){let t=e.parentElement.children;for(let n=t.length-1;n>-1;n--){let o=t[n];o!==e&&o.nodeName!=="SCRIPT"&&o.nodeName!=="STYLE"&&!o.hasAttribute("aria-live")&&!o.hasAttribute("popover")&&(this._ariaHiddenElements.set(o,o.getAttribute("aria-hidden")),o.setAttribute("aria-hidden","true"));}}}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}static \u0275fac=function(t){return new(t||i)};static \u0275prov=xn({token:i,factory:i.\u0275fac})}return i})();function $(i,a){let e=i.length;for(;e--;)a(i[e]);}var Fe=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=ip({type:i});static \u0275inj=ms({providers:[X],imports:[me,Ht$1,ni,Ht$1]})}return i})();function qe(i,a){}var z=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;position;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;delayFocusTrap=true;scrollStrategy;closeOnNavigation=true;enterAnimationDuration;exitAnimationDuration;bindings},J="mdc-dialog--open",Le="mdc-dialog--opening",Re="mdc-dialog--closing",Ue=150,Ye=75,Ze=(()=>{class i extends K{_animationStateChanged=new $e$1;_animationsEnabled=!ye();_actionSectionCount=0;_hostElement=this._elementRef.nativeElement;_enterAnimationDuration=this._animationsEnabled?Me(this._config.enterAnimationDuration)??Ue:0;_exitAnimationDuration=this._animationsEnabled?Me(this._config.exitAnimationDuration)??Ye:0;_animationTimer=null;_contentAttached(){super._contentAttached(),this._startOpenAnimation();}_startOpenAnimation(){this._animationStateChanged.emit({state:"opening",totalTime:this._enterAnimationDuration}),this._animationsEnabled?(this._hostElement.style.setProperty(Pe,`${this._enterAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(Le,J)),this._waitForAnimationToComplete(this._enterAnimationDuration,this._finishDialogOpen)):(this._hostElement.classList.add(J),Promise.resolve().then(()=>this._finishDialogOpen()));}_startExitAnimation(){this._animationStateChanged.emit({state:"closing",totalTime:this._exitAnimationDuration}),this._hostElement.classList.remove(J),this._animationsEnabled?(this._hostElement.style.setProperty(Pe,`${this._exitAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(Re)),this._waitForAnimationToComplete(this._exitAnimationDuration,this._finishDialogClose)):Promise.resolve().then(()=>this._finishDialogClose());}_updateActionSectionCount(e){this._actionSectionCount+=e,this._changeDetectorRef.markForCheck();}_finishDialogOpen=()=>{this._clearAnimationClasses(),this._openAnimationDone(this._enterAnimationDuration);};_finishDialogClose=()=>{this._clearAnimationClasses(),this._animationStateChanged.emit({state:"closed",totalTime:this._exitAnimationDuration});};_clearAnimationClasses(){this._hostElement.classList.remove(Le,Re);}_waitForAnimationToComplete(e,t){this._animationTimer!==null&&clearTimeout(this._animationTimer),this._animationTimer=setTimeout(t,e);}_requestAnimationFrame(e){this._ngZone.runOutsideAngular(()=>{typeof requestAnimationFrame=="function"?requestAnimationFrame(e):e();});}_captureInitialFocus(){this._config.delayFocusTrap||this._trapFocus();}_openAnimationDone(e){this._config.delayFocusTrap&&this._trapFocus(),this._animationStateChanged.next({state:"opened",totalTime:e});}ngOnDestroy(){super.ngOnDestroy(),this._animationTimer!==null&&clearTimeout(this._animationTimer);}attachComponentPortal(e){let t=super.attachComponentPortal(e);return t.location.nativeElement.classList.add("mat-mdc-dialog-component-host"),t}static \u0275fac=(()=>{let e;return function(n){return (e||(e=xd(i)))(n||i)}})();static \u0275cmp=mE({type:i,selectors:[["mat-dialog-container"]],hostAttrs:["tabindex","-1",1,"mat-mdc-dialog-container","mdc-dialog"],hostVars:10,hostBindings:function(t,n){t&2&&(wp("id",n._config.id),vp("aria-modal",n._config.ariaModal)("role",n._config.role)("aria-labelledby",n._config.ariaLabel?null:n._ariaLabelledByQueue[0])("aria-label",n._config.ariaLabel)("aria-describedby",n._config.ariaDescribedBy||null),Pp("_mat-animation-noopable",!n._animationsEnabled)("mat-mdc-dialog-container-with-actions",n._actionSectionCount>0));},features:[lp],decls:3,vars:0,consts:[[1,"mat-mdc-dialog-inner-container","mdc-dialog__container"],[1,"mat-mdc-dialog-surface","mdc-dialog__surface"],["cdkPortalOutlet",""]],template:function(t,n){t&1&&(di(0,"div",0)(1,"div",1),fp(2,qe,0,0,"ng-template",2),Rc()());},dependencies:[Fi],styles:[`.mat-mdc-dialog-container {
  width: 100%;
  height: 100%;
  display: block;
  box-sizing: border-box;
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
  outline: 0;
}

.cdk-overlay-pane.mat-mdc-dialog-panel {
  max-width: var(--mat-dialog-container-max-width, 560px);
  min-width: var(--mat-dialog-container-min-width, 280px);
}
@media (max-width: 599px) {
  .cdk-overlay-pane.mat-mdc-dialog-panel {
    max-width: var(--mat-dialog-container-small-max-width, calc(100vw - 32px));
  }
}

.mat-mdc-dialog-inner-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  height: 100%;
  opacity: 0;
  transition: opacity linear var(--mat-dialog-transition-duration, 0ms);
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
}
.mdc-dialog--closing .mat-mdc-dialog-inner-container {
  transition: opacity 75ms linear;
  transform: none;
}
.mdc-dialog--open .mat-mdc-dialog-inner-container {
  opacity: 1;
}
._mat-animation-noopable .mat-mdc-dialog-inner-container {
  transition: none;
}

.mat-mdc-dialog-surface {
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  outline: 0;
  transform: scale(0.8);
  transition: transform var(--mat-dialog-transition-duration, 0ms) cubic-bezier(0, 0, 0.2, 1);
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
  box-shadow: var(--mat-dialog-container-elevation-shadow, none);
  border-radius: var(--mat-dialog-container-shape, var(--mat-sys-corner-extra-large, 4px));
  background-color: var(--mat-dialog-container-color, var(--mat-sys-surface, white));
}
[dir=rtl] .mat-mdc-dialog-surface {
  text-align: right;
}
.mdc-dialog--open .mat-mdc-dialog-surface, .mdc-dialog--closing .mat-mdc-dialog-surface {
  transform: none;
}
._mat-animation-noopable .mat-mdc-dialog-surface {
  transition: none;
}
.mat-mdc-dialog-surface::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 2px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}

.mat-mdc-dialog-title {
  display: block;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  margin: 0 0 1px;
  padding: var(--mat-dialog-headline-padding, 6px 24px 13px);
}
.mat-mdc-dialog-title::before {
  display: inline-block;
  width: 0;
  height: 40px;
  content: "";
  vertical-align: 0;
}
[dir=rtl] .mat-mdc-dialog-title {
  text-align: right;
}
.mat-mdc-dialog-container .mat-mdc-dialog-title {
  color: var(--mat-dialog-subhead-color, var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--mat-dialog-subhead-font, var(--mat-sys-headline-small-font, inherit));
  line-height: var(--mat-dialog-subhead-line-height, var(--mat-sys-headline-small-line-height, 1.5rem));
  font-size: var(--mat-dialog-subhead-size, var(--mat-sys-headline-small-size, 1rem));
  font-weight: var(--mat-dialog-subhead-weight, var(--mat-sys-headline-small-weight, 400));
  letter-spacing: var(--mat-dialog-subhead-tracking, var(--mat-sys-headline-small-tracking, 0.03125em));
}

.mat-mdc-dialog-content {
  display: block;
  flex-grow: 1;
  box-sizing: border-box;
  margin: 0;
  overflow: auto;
  max-height: 65vh;
}
.mat-mdc-dialog-content > :first-child {
  margin-top: 0;
}
.mat-mdc-dialog-content > :last-child {
  margin-bottom: 0;
}
.mat-mdc-dialog-container .mat-mdc-dialog-content {
  color: var(--mat-dialog-supporting-text-color, var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6)));
  font-family: var(--mat-dialog-supporting-text-font, var(--mat-sys-body-medium-font, inherit));
  line-height: var(--mat-dialog-supporting-text-line-height, var(--mat-sys-body-medium-line-height, 1.5rem));
  font-size: var(--mat-dialog-supporting-text-size, var(--mat-sys-body-medium-size, 1rem));
  font-weight: var(--mat-dialog-supporting-text-weight, var(--mat-sys-body-medium-weight, 400));
  letter-spacing: var(--mat-dialog-supporting-text-tracking, var(--mat-sys-body-medium-tracking, 0.03125em));
}
.mat-mdc-dialog-container .mat-mdc-dialog-content {
  padding: var(--mat-dialog-content-padding, 20px 24px);
}
.mat-mdc-dialog-container-with-actions .mat-mdc-dialog-content {
  padding: var(--mat-dialog-with-actions-content-padding, 20px 24px 0);
}
.mat-mdc-dialog-container .mat-mdc-dialog-title + .mat-mdc-dialog-content {
  padding-top: 0;
}

.mat-mdc-dialog-actions {
  display: flex;
  position: relative;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  min-height: 52px;
  margin: 0;
  border-top: 1px solid transparent;
  padding: var(--mat-dialog-actions-padding, 16px 24px);
  justify-content: var(--mat-dialog-actions-alignment, flex-end);
}
@media (forced-colors: active) {
  .mat-mdc-dialog-actions {
    border-top-color: CanvasText;
  }
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-start, .mat-mdc-dialog-actions[align=start] {
  justify-content: start;
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-center, .mat-mdc-dialog-actions[align=center] {
  justify-content: center;
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-end, .mat-mdc-dialog-actions[align=end] {
  justify-content: flex-end;
}
.mat-mdc-dialog-actions .mat-button-base + .mat-button-base,
.mat-mdc-dialog-actions .mat-mdc-button-base + .mat-mdc-button-base {
  margin-left: 8px;
}
[dir=rtl] .mat-mdc-dialog-actions .mat-button-base + .mat-button-base,
[dir=rtl] .mat-mdc-dialog-actions .mat-mdc-button-base + .mat-mdc-button-base {
  margin-left: 0;
  margin-right: 8px;
}

.mat-mdc-dialog-component-host {
  display: contents;
}
`],encapsulation:2,changeDetection:1})}return i})(),Pe="--mat-dialog-transition-duration";function Me(i){return i==null?null:typeof i=="number"?i:i.endsWith("ms")?Kt$1(i.substring(0,i.length-2)):i.endsWith("s")?Kt$1(i.substring(0,i.length-1))*1e3:i==="0"?0:null}var V=(function(i){return i[i.OPEN=0]="OPEN",i[i.CLOSING=1]="CLOSING",i[i.CLOSED=2]="CLOSED",i})(V||{}),O=class{_ref;_config;_containerInstance;componentInstance;componentRef=null;disableClose;id;_afterOpened=new Ln(1);_beforeClosed=new Ln(1);_result;_closeFallbackTimeout;_state=V.OPEN;_closeInteractionType;constructor(a,e,t){this._ref=a,this._config=e,this._containerInstance=t,this.disableClose=e.disableClose,this.id=a.id,a.addPanelClass("mat-mdc-dialog-panel"),t._animationStateChanged.pipe(kn(n=>n.state==="opened"),en(1)).subscribe(()=>{this._afterOpened.next(),this._afterOpened.complete();}),t._animationStateChanged.pipe(kn(n=>n.state==="closed"),en(1)).subscribe(()=>{clearTimeout(this._closeFallbackTimeout),this._finishDialogClose();}),a.overlayRef.detachments().subscribe(()=>{this._beforeClosed.next(this._result),this._beforeClosed.complete(),this._finishDialogClose();}),Eg(this.backdropClick(),this.keydownEvents().pipe(kn(n=>n.keyCode===27&&!this.disableClose&&!Or(n)))).subscribe(n=>{this.disableClose||(n.preventDefault(),Be(this,n.type==="keydown"?"keyboard":"mouse"));});}close(a){let e=this._config.closePredicate;e&&!e(a,this._config,this.componentInstance)||(this._result=a,this._containerInstance._animationStateChanged.pipe(kn(t=>t.state==="closing"),en(1)).subscribe(t=>{this._beforeClosed.next(a),this._beforeClosed.complete(),this._ref.overlayRef.detachBackdrop(),this._closeFallbackTimeout=setTimeout(()=>this._finishDialogClose(),t.totalTime+100);}),this._state=V.CLOSING,this._containerInstance._startExitAnimation());}afterOpened(){return this._afterOpened}afterClosed(){return this._ref.closed}beforeClosed(){return this._beforeClosed}backdropClick(){return this._ref.backdropClick}keydownEvents(){return this._ref.keydownEvents}updatePosition(a){let e=this._ref.config.positionStrategy;return a&&(a.left||a.right)?a.left?e.left(a.left):e.right(a.right):e.centerHorizontally(),a&&(a.top||a.bottom)?a.top?e.top(a.top):e.bottom(a.bottom):e.centerVertically(),this._ref.updatePosition(),this}updateSize(a="",e=""){return this._ref.updateSize(a,e),this}addPanelClass(a){return this._ref.addPanelClass(a),this}removePanelClass(a){return this._ref.removePanelClass(a),this}getState(){return this._state}_finishDialogClose(){this._state=V.CLOSED,this._ref.close(this._result,{focusOrigin:this._closeInteractionType}),this.componentInstance=null;}};function Be(i,a,e){return i._closeInteractionType=a,i.close(e)}var $e=new S("MatMdcDialogData"),Ke=new S("mat-mdc-dialog-default-options"),Xe=new S("mat-mdc-dialog-scroll-strategy",{providedIn:"root",factory:()=>{let i=v(ie);return ()=>Kt(i)}}),ee=(()=>{class i{_defaultOptions=v(Ke,{optional:true});_scrollStrategy=v(Xe);_parentDialog=v(i,{optional:true,skipSelf:true});_idGenerator=v(Yt);_injector=v(ie);_dialog=v(X);_animationsDisabled=ye();_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new J$1;_afterOpenedAtThisLevel=new J$1;dialogConfigClass=z;_dialogRefConstructor;_dialogContainerType;_dialogDataToken;get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}afterAllClosed=vg(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(Ag(void 0)));constructor(){this._dialogRefConstructor=O,this._dialogContainerType=Ze,this._dialogDataToken=$e;}open(e,t){let n;t=l(l({},this._defaultOptions||new z),t),t.id=t.id||this._idGenerator.getId("mat-mdc-dialog-"),t.scrollStrategy=t.scrollStrategy||this._scrollStrategy();let o=this._dialog.open(e,m(l({},t),{positionStrategy:oe(this._injector).centerHorizontally().centerVertically(),disableClose:true,closePredicate:void 0,closeOnDestroy:false,closeOnOverlayDetachments:false,disableAnimations:this._animationsDisabled||t.enterAnimationDuration?.toLocaleString()==="0"||t.exitAnimationDuration?.toString()==="0",container:{type:this._dialogContainerType,providers:()=>[{provide:this.dialogConfigClass,useValue:t},{provide:g,useValue:t}]},templateContext:()=>({dialogRef:n}),providers:(l,r,d)=>(n=new this._dialogRefConstructor(l,t,d),n.updatePosition(t?.position),[{provide:this._dialogContainerType,useValue:d},{provide:this._dialogDataToken,useValue:r.data},{provide:this._dialogRefConstructor,useValue:n}])}));return n.componentRef=o.componentRef,n.componentInstance=o.componentInstance,this.openDialogs.push(n),this.afterOpened.next(n),n.afterClosed().subscribe(()=>{let l=this.openDialogs.indexOf(n);l>-1&&(this.openDialogs.splice(l,1),this.openDialogs.length||this._getAfterAllClosed().next());}),n}closeAll(){this._closeDialogs(this.openDialogs);}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){this._closeDialogs(this._openDialogsAtThisLevel),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete();}_closeDialogs(e){let t=e.length;for(;t--;)e[t].close();}static \u0275fac=function(t){return new(t||i)};static \u0275prov=xn({token:i,factory:i.\u0275fac})}return i})(),jt=(()=>{class i{dialogRef=v(O,{optional:true});_elementRef=v(Rn);_dialog=v(ee);ariaLabel;type="button";dialogResult;_matDialogClose;ngOnInit(){this.dialogRef||(this.dialogRef=Ne(this._elementRef,this._dialog.openDialogs));}ngOnChanges(e){let t=e._matDialogClose;t&&(this.dialogResult=t.currentValue);}_onButtonClick(e){this._elementRef.nativeElement.getAttribute("aria-disabled")!=="true"&&Be(this.dialogRef,e.screenX===0&&e.screenY===0?"keyboard":"mouse",this.dialogResult);}static \u0275fac=function(t){return new(t||i)};static \u0275dir=Mc({type:i,selectors:[["","mat-dialog-close",""],["","matDialogClose",""]],hostVars:2,hostBindings:function(t,n){t&1&&_p("click",function(l){return n._onButtonClick(l)}),t&2&&vp("aria-label",n.ariaLabel||null)("type",n.type);},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],type:"type",dialogResult:[0,"mat-dialog-close","dialogResult"],_matDialogClose:[0,"matDialogClose","_matDialogClose"]},exportAs:["matDialogClose"],features:[Qa]})}return i})(),je=(()=>{class i{_dialogRef=v(O,{optional:true});_elementRef=v(Rn);_dialog=v(ee);ngOnInit(){this._dialogRef||(this._dialogRef=Ne(this._elementRef,this._dialog.openDialogs)),this._dialogRef&&Promise.resolve().then(()=>{this._onAdd();});}ngOnDestroy(){this._dialogRef?._containerInstance&&Promise.resolve().then(()=>{this._onRemove();});}static \u0275fac=function(t){return new(t||i)};static \u0275dir=Mc({type:i})}return i})(),Nt=(()=>{class i extends je{id=v(Yt).getId("mat-mdc-dialog-title-");_onAdd(){this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);}_onRemove(){this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);}static \u0275fac=(()=>{let e;return function(n){return (e||(e=xd(i)))(n||i)}})();static \u0275dir=Mc({type:i,selectors:[["","mat-dialog-title",""],["","matDialogTitle",""]],hostAttrs:[1,"mat-mdc-dialog-title","mdc-dialog__title"],hostVars:1,hostBindings:function(t,n){t&2&&wp("id",n.id);},inputs:{id:"id"},exportAs:["matDialogTitle"],features:[lp]})}return i})(),Vt=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275dir=Mc({type:i,selectors:[["","mat-dialog-content",""],["mat-dialog-content"],["","matDialogContent",""]],hostAttrs:[1,"mat-mdc-dialog-content","mdc-dialog__content"],features:[bE([ce])]})}return i})(),zt=(()=>{class i extends je{align;_onAdd(){this._dialogRef._containerInstance?._updateActionSectionCount?.(1);}_onRemove(){this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);}static \u0275fac=(()=>{let e;return function(n){return (e||(e=xd(i)))(n||i)}})();static \u0275dir=Mc({type:i,selectors:[["","mat-dialog-actions",""],["mat-dialog-actions"],["","matDialogActions",""]],hostAttrs:[1,"mat-mdc-dialog-actions","mdc-dialog__actions"],hostVars:6,hostBindings:function(t,n){t&2&&Pp("mat-mdc-dialog-actions-align-start",n.align==="start")("mat-mdc-dialog-actions-align-center",n.align==="center")("mat-mdc-dialog-actions-align-end",n.align==="end");},inputs:{align:"align"},features:[lp]})}return i})();function Ne(i,a){let e=i.nativeElement.parentElement;for(;e&&!e.classList.contains("mat-mdc-dialog-container");)e=e.parentElement;return e?a.find(t=>t.id===e.id):null}var Ht=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=ip({type:i});static \u0275inj=ms({providers:[ee],imports:[Fe,me,Ht$1,gt]})}return i})();export{$e as $,Ht as H,Nt as N,O,Vt as V,ee as e,jt as j,zt as z};
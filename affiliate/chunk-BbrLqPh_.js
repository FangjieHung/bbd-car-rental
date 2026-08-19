import {C,g as ge,b3 as ot,ae as x,G as Ge,J as JE,M as Mo$1,m as mI,o as ii,j as jI,A as AE,p as gc,v as tp,F as Fy,V as VI,z as Qf,b4 as op,e as du,l,k,_ as Zf,b as ap,b5 as ps$1,R as yp,E as Ec,b6 as sp,b7 as up,b8 as cp,b9 as lp,ba as dp,d as ge$1,ax as Fe,bb as $,aC as jg,Q as QI,w as BI,bc as _v,bd as wp,be as lE,bf as Nv,$ as $I,bg as Dp,bh as la,a as mc,y as yc,bi as Ep,I as vI,K as yl$1,bj as pr$1,aj as Dv,af as ar$1,D as DI,aa as Bf,a6 as BE,q as dp$1,aZ as UP,av as he$1,bk as CI,bl as Es$1,N as Ks$1,ao as P,aD as di,ag as be,i as jP,H as HP,aW as Cm,ap as ee$1,ah as Un$1,au as tl,bm as Nh,bn as bh,aS as Cn,aY as xh,bo as gh,bp as zP,n as ca,ab as rE,U as Uf,ad as oE,r as ap$1,a$ as ip,s as cE,b0 as sE,b1 as aE,t as sp$1,bq as op$1,br as gm,bs as Le$1,bt as So$1,bu as ne,al as qP,bv as Xf,O as zf,bw as Je,bx as Gc,by as Fe$1,bz as Oe,bA as ph,bB as Ap,bC as Ri$1,az as ks$1,bD as li,aA as ie,aI as GP,a2 as tu,bE as me,bF as pe$1,ay as vi,bG as ee,bH as Ne$1,bI as VP,L as LP,P as PP,aM as py,X as XE,bJ as FP,bK as si,aP as rm,x as tE,bL as HI,a9 as qm,ai as Is$1,am as ke,an as Um,bM as Pm,bN as $e,bO as Ip,T as vp,bP as he$2,bQ as ro$1,a7 as Re$1,aw as q,ac as Yf,ar as tr$1,bR as ft,aT as Re$2,at as sr$1,Z as EE,W as Wc,bS as Oc,a_ as np,a0 as $l$1,a1 as Ul$1,bT as hh,bU as $n$2,bV as zc,aR as th,bW as nu,bX as Ce,bY as Ov,S as WE,bZ as GE,b_ as fc,b$ as De,aQ as M,c0 as _h,a8 as b,c1 as up$1,c2 as Sh,c3 as QE,c4 as FE,c5 as Fd$1}from'./main-U7HLXGQW.js';import {T as Tn$1,q as qn$1,$ as $n$1,h as hn,W as Wt$1,a as $$1,Q as Qt$1,b as qt$1,m as mn,i as it,s as st$1,l as lt$1,J as Je$1,r as rt,k as ke$1,n as nt,P as Pi$1,V as Vo$1}from'./chunk-tvg5dNxL.js';function Qa(i,n){return i>=n.start&&i<=n.end}function Ka(i,n){if(n.peakSeasons.some(t=>Qa(i,t)))return "peak";if(n.holidays.some(t=>Qa(i,t)))return "holiday";let e=new Date(i+"T00:00:00").getDay();return e===0||e===6?"weekend":"weekday"}function vo(i,n){let e=[],t=new Date(i+"T00:00:00"),a=new Date(n+"T00:00:00");for(;t<a;){let r=o=>String(o).padStart(2,"0");e.push(`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())}`),t.setDate(t.getDate()+1);}return e}function bo(i,n){let e=i.filter(t=>n>=t.minDays).sort((t,a)=>a.minDays-t.minDays);return e.length?e[0].discountPercent:0}function bi(i,n){return !(n.startDate<i.validFrom||n.startDate>i.validTo||i.minDays!==void 0&&n.days<i.minDays||i.applicableCategories&&!i.applicableCategories.includes(n.category))}function Za(i){let{plan:n,calendar:e,startDate:t,endDate:a,addOns:r,coupon:o}=i,g=vo(t,a),S=g.length,L=g.map(de=>{let He=Ka(de,e);return {date:de,dayType:He,price:n.dayTypeRates[He]}}),ze=L.reduce((de,He)=>de+He.price,0),ln=bo(n.tiers,S),ni=Math.round(ze*ln/100),Nt=ze-ni,dn=i.partnerDiscountPercent??0,cn=Math.round(Nt*dn/100),ii=Nt-cn,Ji=r.filter(de=>de.qty>0).map(({addOn:de,qty:He})=>({addOnId:de.id,name:de.name,qty:He,amount:de.unitPrice*He*(de.unit==="per_day"?S:1)})),ea=Ji.reduce((de,He)=>de+He.amount,0),ai=0,ta;o&&bi(o,{startDate:t,days:S,category:n.appliesToCategory})&&(ai=o.type==="percent"?Math.round(ii*o.value/100):Math.min(o.value,ii),ta=o.code);let go=ii-ai+ea;return {dailyLines:L,rentalRaw:ze,tierDiscountPercent:ln,tierDiscountAmount:ni,rentalSubtotal:Nt,partnerDiscountPercent:dn,partnerDiscount:cn,addOnLines:Ji,addOnSubtotal:ea,couponCode:ta,couponDiscount:ai,total:go}}function Xa(i,n,e,t){return i<t&&e<n}var yo=["pending_payment","confirmed","in_progress"];function yi(i){return i.vehicle.status==="maintenance"?false:!i.bookings.some(n=>n.vehicleId===i.vehicle.id&&yo.includes(n.status)&&Xa(i.startTime,i.endTime,n.startTime,n.endTime))}var Co={partner:Mo$1(null),basePath:Mo$1(["/"])},Ke=new x("BOOKING_CONTEXT",{providedIn:"root",factory:()=>Co});function Do(i,n){return {partner:i,basePath:JE(()=>["/p",n()])}}var Ja=class i{route=C(ge);context=C(Ke);bookingRepo=C(ap);bookingId=Tn$1(this.route.paramMap.pipe(Ge(n=>n.get("id")??"")),{initialValue:""});booking=JE(()=>this.bookingRepo.getById(this.bookingId())??null);statusMessage=JE(()=>this.booking()?.status==="confirmed"?"\u60A8\u7684\u8A02\u55AE\u5DF2\u6210\u7ACB\u4E26\u78BA\u8A8D\uFF0C\u6211\u5011\u5C07\u76E1\u5FEB\u70BA\u60A8\u6E96\u5099\u8ECA\u8F1B\u3002":"\u60A8\u7684\u8A02\u55AE\u5DF2\u6210\u7ACB\uFF0C\u72C0\u614B\u70BA\u300C\u5F85\u4ED8\u6B3E/\u5F85\u4EBA\u5DE5\u78BA\u8A8D\u300D\uFF0C\u6211\u5011\u5C07\u76E1\u5FEB\u70BA\u60A8\u8655\u7406\u3002");homeLink=this.context.basePath;static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-booking-done"]],decls:9,vars:3,consts:[[1,"done-page"],[1,"booking-id"],[3,"routerLink"]],template:function(e,t){e&1&&(ii(0,"div",0)(1,"h1"),AE(2,"\u8A02\u55AE\u6210\u7ACB"),gc(),ii(3,"p"),AE(4),gc(),ii(5,"p",1),AE(6),gc(),ii(7,"a",2),AE(8,"\u8FD4\u56DE\u9996\u9801"),gc()()),e&2&&(Fy(4),yp(t.statusMessage()),Fy(2),Ec("\u8A02\u55AE\u7DE8\u865F\uFF1A",t.bookingId()),Fy(),Qf("routerLink",t.homeLink()));},dependencies:[ps$1],styles:[".done-page[_ngcontent-%COMP%]{padding:32px 16px;max-width:480px;text-align:center}.done-page[_ngcontent-%COMP%]   .booking-id[_ngcontent-%COMP%]{font-weight:700;margin:16px 0}"]})};var Re=class i{vehicleRepo=C(op);bookingRepo=C(ap);customerRepo=C(sp);planRepo=C(up);calRepo=C(cp);addOnRepo=C(lp);couponRepo=C(dp);availableVehicles(n,e){let t=this.bookingRepo.getAll();return this.vehicleRepo.getAll().filter(a=>yi({vehicle:a,startTime:n,endTime:e,bookings:t}))}planForCategory(n){return this.planRepo.getAll().find(e=>e.appliesToCategory===n)}addOns(){return this.addOnRepo.getAll()}price(n){let e=this.planForCategory(n.category);if(!e)throw new Error("\u7121\u6B64\u8ECA\u578B\u5B9A\u50F9");return Za(k({plan:e,calendar:this.calRepo.getAll()[0]},n))}validateCoupon(n,e){let t=this.couponRepo.getAll().find(a=>a.code.toLowerCase()===n.trim().toLowerCase());return t?bi(t,e)?{ok:true,coupon:t}:{ok:false,reason:"\u4E0D\u7B26\u4F7F\u7528\u689D\u4EF6"}:{ok:false,reason:"\u67E5\u7121\u6B64\u512A\u60E0\u78BC"}}submitBooking(n){let e=this.vehicleRepo.getById(n.vehicleId);if(!e)throw new Error("\u67E5\u7121\u8ECA\u8F1B");if(!yi({vehicle:e,startTime:n.startTime,endTime:n.endTime,bookings:this.bookingRepo.getAll()}))throw new Error("\u8ECA\u8F1B\u5DF2\u88AB\u9810\u7D04");let t=n.couponCode?this.couponRepo.getAll().find(g=>g.code.toLowerCase()===n.couponCode.toLowerCase()):void 0,a=this.price({category:n.category,startDate:n.startDate,endDate:n.endDate,addOns:n.addOns,coupon:t,partnerDiscountPercent:n.partnerDiscountPercent}),r={id:crypto.randomUUID(),name:n.customer.name,phone:n.customer.phone,note:n.customer.email};this.customerRepo.create(r);let o=k({id:crypto.randomUUID(),vehicleId:n.vehicleId,customerId:r.id,startTime:n.startTime,endTime:n.endTime,pickupLocation:n.pickupLocation,returnLocation:n.returnLocation,status:"pending_payment",addOns:n.addOns.filter(g=>g.qty>0).map(g=>({addOnId:g.addOn.id,qty:g.qty})),couponCode:a.couponCode,priceBreakdown:a,paymentMethod:n.paymentMethod},n.sourcePartnerId?{sourcePartnerId:n.sourcePartnerId}:{});return this.bookingRepo.create(o),o}markBookingPaid(n){let e=this.bookingRepo.getById(n);if(!e)throw new Error("\u67E5\u7121\u8A02\u55AE");if(e.status!=="pending_payment")throw new Error("\u8A02\u55AE\u72C0\u614B\u4E0D\u5141\u8A31\u4ED8\u6B3E");return this.bookingRepo.update(n,{status:"confirmed"})}static \u0275fac=function(e){return new(e||i)};static \u0275prov=ge$1({token:i,factory:i.\u0275fac,providedIn:"root"})};var lr=(()=>{class i{_renderer;_elementRef;onChange=e=>{};onTouched=()=>{};constructor(e,t){this._renderer=e,this._elementRef=t;}setProperty(e,t){this._renderer.setProperty(this._elementRef.nativeElement,e,t);}registerOnTouched(e){this.onTouched=e;}registerOnChange(e){this.onChange=e;}setDisabledState(e){this.setProperty("disabled",e);}static \u0275fac=function(t){return new(t||i)(pr$1(Dv),pr$1(ar$1))};static \u0275dir=DI({type:i})}return i})(),dr=(()=>{class i extends lr{static \u0275fac=(()=>{let e;return function(a){return (e||(e=rm(i)))(a||i)}})();static \u0275dir=DI({type:i,features:[Bf]})}return i})(),bt=new x("");var xo={provide:bt,useExisting:ro$1(()=>Ne),multi:true};function Mo(){let i=he$2()?he$2().getUserAgent():"";return /android (\d+)/.test(i.toLowerCase())}var wo=new x(""),Ne=(()=>{class i extends lr{_compositionMode;_composing=false;constructor(e,t,a){super(e,t),this._compositionMode=a,this._compositionMode==null&&(this._compositionMode=!Mo());}writeValue(e){let t=e??"";this.setProperty("value",t);}_handleInput(e){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(e);}_compositionStart(){this._composing=true;}_compositionEnd(e){this._composing=false,this._compositionMode&&this.onChange(e);}static \u0275fac=function(t){return new(t||i)(pr$1(Dv),pr$1(ar$1),pr$1(wo,8))};static \u0275dir=DI({type:i,selectors:[["input","formControlName","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControlName","",3,"ngNoCva",""],["input","formControl","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControl","",3,"ngNoCva",""],["input","ngModel","",3,"type","checkbox",3,"ngNoCva",""],["textarea","ngModel","",3,"ngNoCva",""],["","ngDefaultControl",""]],hostBindings:function(t,a){t&1&&tp("input",function(o){return a._handleInput(o.target.value)})("blur",function(){return a.onTouched()})("compositionstart",function(){return a._compositionStart()})("compositionend",function(o){return a._compositionEnd(o.target.value)});},standalone:false,features:[BE([xo]),Bf]})}return i})();function Mi(i){return i==null||wi(i)===0}function wi(i){return i==null?null:Array.isArray(i)||typeof i=="string"?i.length:i instanceof Set?i.size:null}var yt=new x(""),ki=new x(""),ko=/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,Ze=class{static min(n){return cr(n)}static max(n){return Eo(n)}static required(n){return ur(n)}static requiredTrue(n){return Ao(n)}static email(n){return So(n)}static minLength(n){return Vo(n)}static maxLength(n){return Oo(n)}static pattern(n){return Fo(n)}static nullValidator(n){return En()}static compose(n){return gr(n)}static composeAsync(n){return vr(n)}};function cr(i){return n=>{if(n.value==null||i==null)return null;let e=parseFloat(n.value);return !isNaN(e)&&e<i?{min:{min:i,actual:n.value}}:null}}function Eo(i){return n=>{if(n.value==null||i==null)return null;let e=parseFloat(n.value);return !isNaN(e)&&e>i?{max:{max:i,actual:n.value}}:null}}function ur(i){return Mi(i.value)?{required:true}:null}function Ao(i){return i.value===true?null:{required:true}}function So(i){return Mi(i.value)||ko.test(i.value)?null:{email:true}}function Vo(i){return n=>{let e=n.value?.length??wi(n.value);return e===null||e===0?null:e<i?{minlength:{requiredLength:i,actualLength:e}}:null}}function Oo(i){return n=>{let e=n.value?.length??wi(n.value);return e!==null&&e>i?{maxlength:{requiredLength:i,actualLength:e}}:null}}function Fo(i){if(!i)return En;let n,e;return typeof i=="string"?(e="",i.charAt(0)!=="^"&&(e+="^"),e+=i,i.charAt(i.length-1)!=="$"&&(e+="$"),n=new RegExp(e)):(e=i.toString(),n=i),t=>{if(Mi(t.value))return null;let a=t.value;return n.test(a)?null:{pattern:{requiredPattern:e,actualValue:a}}}}function En(i){return null}function mr(i){return i!=null}function pr(i){return fc(i)?De(i):i}function hr(i){let n={};return i.forEach(e=>{n=e!=null?k(k({},n),e):n;}),Object.keys(n).length===0?null:n}function fr(i,n){return n.map(e=>e(i))}function Io(i){return !i.validate}function _r(i){return i.map(n=>Io(n)?n:e=>n.validate(e))}function gr(i){if(!i)return null;let n=i.filter(mr);return n.length==0?null:function(e){return hr(fr(e,n))}}function Ei(i){return i!=null?gr(_r(i)):null}function vr(i){if(!i)return null;let n=i.filter(mr);return n.length==0?null:function(e){let t=fr(e,n).map(pr);return hh(t).pipe(Ge(hr))}}function Ai(i){return i!=null?vr(_r(i)):null}function er(i,n){return i===null?[n]:Array.isArray(i)?[...i,n]:[i,n]}function br(i){return i._rawValidators}function yr(i){return i._rawAsyncValidators}function Ci(i){return i?Array.isArray(i)?i:[i]:[]}function An(i,n){return Array.isArray(i)?i.includes(n):i===n}function tr(i,n){let e=Ci(n);return Ci(i).forEach(a=>{An(e,a)||e.push(a);}),e}function nr(i,n){return Ci(n).filter(e=>!An(i,e))}var Sn=class{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(n){this._rawValidators=n||[],this._composedValidatorFn=Ei(this._rawValidators);}_setAsyncValidators(n){this._rawAsyncValidators=n||[],this._composedAsyncValidatorFn=Ai(this._rawAsyncValidators);}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(n){this._onDestroyCallbacks.push(n);}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(n=>n()),this._onDestroyCallbacks=[];}reset(n=void 0){this.control?.reset(n);}hasError(n,e){return this.control?this.control.hasError(n,e):false}getError(n,e){return this.control?this.control.getError(n,e):null}},vt=class extends Sn{name;get formDirective(){return null}get path(){return null}};var qt="VALID",kn="INVALID",St="PENDING",Yt="DISABLED",st=class{},Vn=class extends st{value;source;constructor(n,e){super(),this.value=n,this.source=e;}},Wt=class extends st{pristine;source;constructor(n,e){super(),this.pristine=n,this.source=e;}},$t=class extends st{touched;source;constructor(n,e){super(),this.touched=n,this.source=e;}},Vt=class extends st{status;source;constructor(n,e){super(),this.status=n,this.source=e;}},On=class extends st{source;constructor(n){super(),this.source=n;}},Ot=class extends st{source;constructor(n){super(),this.source=n;}};function Cr(i){return (Pn(i)?i.validators:i)||null}function To(i){return Array.isArray(i)?Ei(i):i||null}function Dr(i,n){return (Pn(n)?n.asyncValidators:i)||null}function Ro(i){return Array.isArray(i)?Ai(i):i||null}function Pn(i){return i!=null&&!Array.isArray(i)&&typeof i=="object"}function Po(i,n,e){let t=i.controls;if(!(Object.keys(t)).length)throw new b(1e3,"");if(!xr(t,e))throw new b(1001,"")}function No(i,n,e){i._forEachChild((t,a)=>{if(e[a]===void 0)throw new b(-1002,"")});}var Fn=class{_pendingDirty=false;_hasOwnPendingAsyncValidator=null;_pendingTouched=false;_onCollectionChange=()=>{};_updateOn;_hasRequired=Mo$1(false);_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(n,e){this._assignValidators(n),this._assignAsyncValidators(e);}get validator(){return this._composedValidatorFn}set validator(n){this._rawValidators=this._composedValidatorFn=n,this._updateHasRequiredValidator();}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(n){this._rawAsyncValidators=this._composedAsyncValidatorFn=n;}get parent(){return this._parent}get status(){return XE(this.statusReactive)}set status(n){XE(()=>this.statusReactive.set(n));}_status=JE(()=>this.statusReactive());statusReactive=Mo$1(void 0);get valid(){return this.status===qt}get invalid(){return this.status===kn}get pending(){return this.status===St}get disabled(){return this.status===Yt}get enabled(){return this.status!==Yt}errors;get pristine(){return XE(this.pristineReactive)}set pristine(n){XE(()=>this.pristineReactive.set(n));}_pristine=JE(()=>this.pristineReactive());pristineReactive=Mo$1(true);get dirty(){return !this.pristine}get touched(){return XE(this.touchedReactive)}set touched(n){XE(()=>this.touchedReactive.set(n));}_touched=JE(()=>this.touchedReactive());touchedReactive=Mo$1(false);get untouched(){return !this.touched}_events=new ee$1;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:"change"}setValidators(n){this._assignValidators(n);}setAsyncValidators(n){this._assignAsyncValidators(n);}addValidators(n){this.setValidators(tr(n,this._rawValidators));}addAsyncValidators(n){this.setAsyncValidators(tr(n,this._rawAsyncValidators));}removeValidators(n){this.setValidators(nr(n,this._rawValidators));}removeAsyncValidators(n){this.setAsyncValidators(nr(n,this._rawAsyncValidators));}hasValidator(n){return An(this._rawValidators,n)}hasAsyncValidator(n){return An(this._rawAsyncValidators,n)}clearValidators(){this.validator=null;}clearAsyncValidators(){this.asyncValidator=null;}markAsTouched(n={}){let e=this.touched===false;this.touched=true;let t=n.sourceControl??this;n.onlySelf||this._parent?.markAsTouched(l(k({},n),{sourceControl:t})),e&&n.emitEvent!==false&&this._events.next(new $t(true,t));}markAllAsDirty(n={}){this.markAsDirty({onlySelf:true,emitEvent:n.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsDirty(n));}markAllAsTouched(n={}){this.markAsTouched({onlySelf:true,emitEvent:n.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsTouched(n));}markAsUntouched(n={}){let e=this.touched===true;this.touched=false,this._pendingTouched=false;let t=n.sourceControl??this;this._forEachChild(a=>{a.markAsUntouched({onlySelf:true,emitEvent:n.emitEvent,sourceControl:t});}),n.onlySelf||this._parent?._updateTouched(n,t),e&&n.emitEvent!==false&&this._events.next(new $t(false,t));}markAsDirty(n={}){let e=this.pristine===true;this.pristine=false;let t=n.sourceControl??this;n.onlySelf||this._parent?.markAsDirty(l(k({},n),{sourceControl:t})),e&&n.emitEvent!==false&&this._events.next(new Wt(false,t));}markAsPristine(n={}){let e=this.pristine===false;this.pristine=true,this._pendingDirty=false;let t=n.sourceControl??this;this._forEachChild(a=>{a.markAsPristine({onlySelf:true,emitEvent:n.emitEvent});}),n.onlySelf||this._parent?._updatePristine(n,t),e&&n.emitEvent!==false&&this._events.next(new Wt(true,t));}markAsPending(n={}){this.status=St;let e=n.sourceControl??this;n.emitEvent!==false&&(this._events.next(new Vt(this.status,e)),this.statusChanges.emit(this.status)),n.onlySelf||this._parent?.markAsPending(l(k({},n),{sourceControl:e}));}disable(n={}){let e=this._parentMarkedDirty(n.onlySelf);this.status=Yt,this.errors=null,this._forEachChild(a=>{a.disable(l(k({},n),{onlySelf:true}));}),this._updateValue();let t=n.sourceControl??this;n.emitEvent!==false&&(this._events.next(new Vn(this.value,t)),this._events.next(new Vt(this.status,t)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(l(k({},n),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(a=>a(true));}enable(n={}){let e=this._parentMarkedDirty(n.onlySelf);this.status=qt,this._forEachChild(t=>{t.enable(l(k({},n),{onlySelf:true}));}),this.updateValueAndValidity({onlySelf:true,emitEvent:n.emitEvent}),this._updateAncestors(l(k({},n),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(t=>t(false));}_updateAncestors(n,e){n.onlySelf||(this._parent?.updateValueAndValidity(n),n.skipPristineCheck||this._parent?._updatePristine({},e),this._parent?._updateTouched({},e));}setParent(n){this._parent=n;}getRawValue(){return this.value}updateValueAndValidity(n={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let t=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===qt||this.status===St)&&this._runAsyncValidator(t,n.emitEvent);}let e=n.sourceControl??this;n.emitEvent!==false&&(this._events.next(new Vn(this.value,e)),this._events.next(new Vt(this.status,e)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),n.onlySelf||this._parent?.updateValueAndValidity(l(k({},n),{sourceControl:e}));}_updateTreeValidity(n={emitEvent:true}){this._forEachChild(e=>e._updateTreeValidity(n)),this.updateValueAndValidity({onlySelf:true,emitEvent:n.emitEvent});}_setInitialStatus(){this.status=this._allControlsDisabled()?Yt:qt;}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(n,e){if(this.asyncValidator){this.status=St,this._hasOwnPendingAsyncValidator={emitEvent:e!==false,shouldHaveEmitted:n!==false};let t=pr(this.asyncValidator(this));this._asyncValidationSubscription=t.subscribe(a=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(a,{emitEvent:e,shouldHaveEmitted:n});});}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let n=(this._hasOwnPendingAsyncValidator?.emitEvent||this._hasOwnPendingAsyncValidator?.shouldHaveEmitted)??false;return this._hasOwnPendingAsyncValidator=null,n}return  false}setErrors(n,e={}){this.errors=n,this._updateControlsErrors(e.emitEvent!==false,this,e.shouldHaveEmitted);}get(n){let e=n;return e==null||(Array.isArray(e)||(e=e.split(".")),e.length===0)?null:e.reduce((t,a)=>t&&t._find(a),this)}getError(n,e){let t=e?this.get(e):this;return t?.errors?t.errors[n]:null}hasError(n,e){return !!this.getError(n,e)}get root(){let n=this;for(;n._parent;)n=n._parent;return n}_updateControlsErrors(n,e,t){this.status=this._calculateStatus(),n&&this.statusChanges.emit(this.status),(n||t)&&this._events.next(new Vt(this.status,e)),this._parent&&this._parent._updateControlsErrors(n,e,t);}_initObservables(){this.valueChanges=new Fe,this.statusChanges=new Fe;}_calculateStatus(){return this._allControlsDisabled()?Yt:this.errors?kn:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(St)?St:this._anyControlsHaveStatus(kn)?kn:qt}_anyControlsHaveStatus(n){return this._anyControls(e=>e.status===n)}_anyControlsDirty(){return this._anyControls(n=>n.dirty)}_anyControlsTouched(){return this._anyControls(n=>n.touched)}_updatePristine(n,e){let t=!this._anyControlsDirty(),a=this.pristine!==t;this.pristine=t,n.onlySelf||this._parent?._updatePristine(n,e),a&&this._events.next(new Wt(this.pristine,e));}_updateTouched(n={},e){this.touched=this._anyControlsTouched(),this._events.next(new $t(this.touched,e)),n.onlySelf||this._parent?._updateTouched(n,e);}_onDisabledChange=[];_registerOnCollectionChange(n){this._onCollectionChange=n;}_setUpdateStrategy(n){Pn(n)&&n.updateOn!=null&&(this._updateOn=n.updateOn);}_parentMarkedDirty(n){return !n&&!!this._parent?.dirty&&!this._parent._anyControlsDirty()}_find(n){return null}_assignValidators(n){this._rawValidators=Array.isArray(n)?n.slice():n,this._composedValidatorFn=To(this._rawValidators),this._updateHasRequiredValidator();}_assignAsyncValidators(n){this._rawAsyncValidators=Array.isArray(n)?n.slice():n,this._composedAsyncValidatorFn=Ro(this._rawAsyncValidators);}_updateHasRequiredValidator(){XE(()=>this._hasRequired.set(this.hasValidator(Ze.required)));}};function xr(i,n){return Object.hasOwn(i,n)}function Lo(i){return i.tagName==="INPUT"||i.tagName==="SELECT"||i.tagName==="TEXTAREA"}function Bo(i,n,e,t){switch(e){case "name":i.setAttribute(n,e,t);break;case "disabled":case "readonly":case "required":t?i.setAttribute(n,e,""):i.removeAttribute(n,e);break;case "max":case "min":case "minLength":case "maxLength":t!==void 0?i.setAttribute(n,e,t.toString()):i.removeAttribute(n,e);break}}var Di=class{kind;context;control;message;constructor({kind:n,context:e,control:t}){this.kind=n,this.context=e,this.control=t;}};function zo(i){return typeof i=="number"?i:parseFloat(i)}var Mr=(()=>{class i{_validator=En;_onChange;_enabled;ngOnChanges(e){if(this.inputName in e){let t=this.normalizeInput(e[this.inputName].currentValue);this._enabled=this.enabled(t),this._validator=this._enabled?this.createValidator(t):En,this._onChange?.();}}validate(e){return this._validator(e)}registerOnValidatorChange(e){this._onChange=e;}enabled(e){return e!=null}static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,features:[jg]})}return i})();var Ho={provide:yt,useExisting:ro$1(()=>Si),multi:true},Si=(()=>{class i extends Mr{min;inputName="min";normalizeInput=e=>zo(e);createValidator=e=>cr(e);static \u0275fac=(()=>{let e;return function(a){return (e||(e=rm(i)))(a||i)}})();static \u0275dir=DI({type:i,selectors:[["input","type","number","min","","formControlName",""],["input","type","number","min","","formControl",""],["input","type","number","min","","ngModel",""]],hostVars:1,hostBindings:function(t,a){t&2&&zf("min",a._enabled?a.min:null);},inputs:{min:"min"},standalone:false,features:[BE([Ho]),Bf]})}return i})(),jo={provide:yt,useExisting:ro$1(()=>wr),multi:true};var wr=(()=>{class i extends Mr{required;inputName="required";normalizeInput=qP;createValidator=e=>ur;enabled(e){return e}static \u0275fac=(()=>{let e;return function(a){return (e||(e=rm(i)))(a||i)}})();static \u0275dir=DI({type:i,selectors:[["","required","","formControlName","",3,"type","checkbox"],["","required","","formControl","",3,"type","checkbox"],["","required","","ngModel","",3,"type","checkbox"]],hostVars:1,hostBindings:function(t,a){t&2&&zf("required",a._enabled?"":null);},inputs:{required:"required"},standalone:false,features:[BE([jo]),Bf]})}return i})();var Go=new x(""),Nn=new x("",{factory:()=>Vi}),Vi="always";function qo(i,n){return [...n.path,i]}function ir(i,n,e=Vi){Oi(i,n),n.valueAccessor.writeValue(i.value),(i.disabled||e==="always")&&n.valueAccessor.setDisabledState?.(i.disabled),Uo(i,n),$o(i,n),Wo(i,n),Yo(i,n);}function ar(i,n,e=true){let t=()=>{};n?.valueAccessor?.registerOnChange(t),n?.valueAccessor?.registerOnTouched(t),Tn(i,n),i&&(n._invokeOnDestroyCallbacks(),i._registerOnCollectionChange(()=>{}));}function In(i,n){i.forEach(e=>{e.registerOnValidatorChange&&e.registerOnValidatorChange(n);});}function Yo(i,n){if(n.valueAccessor.setDisabledState){let e=t=>{n.valueAccessor.setDisabledState(t);};i.registerOnDisabledChange(e),n._registerOnDestroy(()=>{i._unregisterOnDisabledChange(e);});}}function Oi(i,n){let e=br(i);n.validator!==null?i.setValidators(er(e,n.validator)):typeof e=="function"&&i.setValidators([e]);let t=yr(i);n.asyncValidator!==null?i.setAsyncValidators(er(t,n.asyncValidator)):typeof t=="function"&&i.setAsyncValidators([t]);let a=()=>i.updateValueAndValidity();In(n._rawValidators,a),In(n._rawAsyncValidators,a);}function Tn(i,n){let e=false;if(i!==null){if(n.validator!==null){let a=br(i);if(Array.isArray(a)&&a.length>0){let r=a.filter(o=>o!==n.validator);r.length!==a.length&&(e=true,i.setValidators(r));}}if(n.asyncValidator!==null){let a=yr(i);if(Array.isArray(a)&&a.length>0){let r=a.filter(o=>o!==n.asyncValidator);r.length!==a.length&&(e=true,i.setAsyncValidators(r));}}}let t=()=>{};return In(n._rawValidators,t),In(n._rawAsyncValidators,t),e}function Uo(i,n){n.valueAccessor.registerOnChange(e=>{i._pendingValue=e,i._pendingChange=true,i._pendingDirty=true,i.updateOn==="change"&&kr(i,n);});}function Wo(i,n){n.valueAccessor.registerOnTouched(()=>{i._pendingTouched=true,i.updateOn==="blur"&&i._pendingChange&&kr(i,n),i.updateOn!=="submit"&&i.markAsTouched();});}function kr(i,n){i._pendingDirty&&i.markAsDirty(),i.setValue(i._pendingValue,{emitModelToViewChange:false}),n.viewToModelUpdate(i._pendingValue),i._pendingChange=false;}function $o(i,n){let e=(t,a)=>{n.valueAccessor.writeValue(t),a&&n.viewToModelUpdate(t);};i.registerOnChange(e),n._registerOnDestroy(()=>{i._unregisterOnChange(e);});}function Er(i,n){Oi(i,n);}function Qo(i,n){return Tn(i,n)}function Ko(i,n){if(!i.hasOwnProperty("model"))return  false;let e=i.model;return e.isFirstChange()?true:!Object.is(n,e.currentValue)}function Zo(i){return Object.getPrototypeOf(i.constructor)===dr}function Ar(i,n){i._syncPendingControls(),n.forEach(e=>{let t=e.control;t.updateOn==="submit"&&t._pendingChange&&(e.viewToModelUpdate(t._pendingValue),t._pendingChange=false);});}function Xo(i,n){if(!n)return null;let e,t,a;return n.forEach(r=>{r.constructor===Ne?e=r:Zo(r)?t=r:a=r;}),a||t||e||null}function Jo(i,n){let e=i.indexOf(n);e>-1&&i.splice(e,1);}var es={provide:Go,useFactory:()=>{let i=C(Pe,{self:true});return {setParseErrors:n=>{i.setParseErrorSource(n);},set onReset(n){i.onReset=n;}}}},Pe=class extends Sn{_parent=null;name=null;valueAccessor=null;isCustomControlBased=false;userOnReset;resetSubscription;set onReset(n){this.userOnReset=n,this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.control&&(this.resetSubscription=this.control.events.subscribe(e=>{e instanceof Ot&&this.control&&this.userOnReset?.(this.control.value);}),this.subscription?.add(this.resetSubscription));}isNativeFormElement=false;rawValueAccessors;_selectedValueAccessor=null;get selectedValueAccessor(){return this._selectedValueAccessor??=Xo(this,this.rawValueAccessors)}parseErrorsValidator=null;renderer;injector;requiredValidatorViaDi;subscription;customControlBindings=null;constructor(n,e,t){super(),this.injector=n,this.renderer=e,this.rawValueAccessors=t,this.injector?.get(Re$1)?.onDestroy(()=>{this.removeParseErrorsValidator(this.control),this.subscription?.unsubscribe();});}setupCustomControl(){this.subscription?.unsubscribe();let n=this.injector?.get(UP);if(!this.control||!n)return;let e=n.markForCheck.bind(n);this.subscription=new q,this.subscription.add(this.control.valueChanges.subscribe(e)),this.subscription.add(this.control.statusChanges.subscribe(e)),this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.userOnReset&&(this.resetSubscription=this.control.events.subscribe(t=>{t instanceof Ot&&this.control&&this.userOnReset?.(this.control.value);}),this.subscription.add(this.resetSubscription)),this.parseErrorsValidator&&this.control.addValidators(this.parseErrorsValidator);}ngControlCreate(n){!n.nativeElement.hasAttribute?.("ngNoCva")&&(this.rawValueAccessors&&this.rawValueAccessors.length>0||this.valueAccessor!==null)||!n.customControl||(this.isCustomControlBased=true,n.listenToCustomControlModel(a=>{this.control?.setValue(a,{emitModelToViewChange:false}),this.control?.markAsDirty(),this.viewToModelUpdate(a);}),n.listenToCustomControlOutput("touch",()=>{this.control?.markAsTouched();}),this.customControlBindings={},this.isNativeFormElement=Lo(n.nativeElement),this.requiredValidatorViaDi=this._rawValidators.find(a=>a instanceof wr));}ngControlUpdate(n,e){if(!this.isCustomControlBased)return;let t=this.control,a=this.customControlBindings;Object.is(a.value,t.value)||(a.value=t.value,n.setCustomControlModelInput(t.value)),this.bindControlProperty(n,a,"touched",t.touched),this.bindControlProperty(n,a,"dirty",t.dirty),this.bindControlProperty(n,a,"valid",t.valid),this.bindControlProperty(n,a,"invalid",t.invalid),this.bindControlProperty(n,a,"pending",t.pending),this.bindControlProperty(n,a,"disabled",t.disabled),this.shouldBindRequired&&this.bindControlProperty(n,a,"required",this.isRequired);let r=t.errors;if(a.errors!==r){a.errors=r;let o=this._convertErrors(r);n.setInputOnDirectives("errors",o);}}get isRequired(){return (this.requiredValidatorViaDi?._enabled||this.control?._hasRequired())??false}get shouldBindRequired(){return  true}bindControlProperty(n,e,t,a){if(e[t]===a)return;e[t]=a;let r=n.setInputOnDirectives(t,a);this.isNativeFormElement&&!r&&(t==="disabled"||t==="required")&&this.renderer&&Bo(this.renderer,n.nativeElement,t,a);}_convertErrors(n){if(n===null)return [];let e=this.control;return Object.entries(n).map(([t,a])=>new Di({context:a,kind:t,control:e}))}setParseErrorSource(n){if(n===void 0)return;let e=null,t=JE(()=>{let a=n();return a.length===0?null:a.reduce((r,o)=>(r[o.kind]=o,r),{})});this.parseErrorsValidator=(()=>e).bind(this),du(()=>{e=t(),this.control?.updateValueAndValidity({emitEvent:false});},{injector:this.injector});}removeParseErrorsValidator(n){this.parseErrorsValidator&&(n?.removeValidators(this.parseErrorsValidator),n?.updateValueAndValidity({emitEvent:false}));}},xi=class{_cd;constructor(n){this._cd=n;}get isTouched(){return this._cd?.control?._touched?.(),!!this._cd?.control?.touched}get isUntouched(){return !!this._cd?.control?.untouched}get isPristine(){return this._cd?.control?._pristine?.(),!!this._cd?.control?.pristine}get isDirty(){return !!this._cd?.control?.dirty}get isValid(){return this._cd?.control?._status?.(),!!this._cd?.control?.valid}get isInvalid(){return !!this._cd?.control?.invalid}get isPending(){return !!this._cd?.control?.pending}get isSubmitted(){return this._cd?._submitted?.(),!!this._cd?.submitted}};var lt=(()=>{class i extends xi{constructor(e){super(e);}static \u0275fac=function(t){return new(t||i)(pr$1(Pe,2))};static \u0275dir=DI({type:i,selectors:[["","formControlName",""],["","ngModel",""],["","formControl",""]],hostVars:14,hostBindings:function(t,a){t&2&&dp$1("ng-untouched",a.isUntouched)("ng-touched",a.isTouched)("ng-pristine",a.isPristine)("ng-dirty",a.isDirty)("ng-valid",a.isValid)("ng-invalid",a.isInvalid)("ng-pending",a.isPending);},standalone:false,features:[Bf]})}return i})();var Rn=class extends Fn{constructor(n,e,t){super(Cr(e),Dr(t,e)),this.controls=n,this._initObservables(),this._setUpdateStrategy(e),this._setUpControls(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator});}controls;registerControl(n,e){let t=this._find(n);return t||(this.controls[n]=e,e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange),e)}addControl(n,e,t={}){this.registerControl(n,e),this.updateValueAndValidity({emitEvent:t.emitEvent}),this._onCollectionChange();}removeControl(n,e={}){let t=this._find(n);t&&t._registerOnCollectionChange(()=>{}),delete this.controls[n],this.updateValueAndValidity({emitEvent:e.emitEvent}),this._onCollectionChange();}setControl(n,e,t={}){let a=this._find(n);a&&a._registerOnCollectionChange(()=>{}),delete this.controls[n],e&&this.registerControl(n,e),this.updateValueAndValidity({emitEvent:t.emitEvent}),this._onCollectionChange();}contains(n){return this._find(n)?.enabled===true}setValue(n,e={}){XE(()=>{No(this,true,n),Object.keys(n).forEach(t=>{Po(this,true,t),this.controls[t].setValue(n[t],{onlySelf:true,emitEvent:e.emitEvent});}),this.updateValueAndValidity(e);});}patchValue(n,e={}){n!=null&&(Object.keys(n).forEach(t=>{let a=this._find(t);a&&a.patchValue(n[t],{onlySelf:true,emitEvent:e.emitEvent});}),this.updateValueAndValidity(e));}reset(n={},e={}){this._forEachChild((t,a)=>{t.reset(n?n[a]:null,l(k({},e),{onlySelf:true}));}),this._updatePristine(e,this),this._updateTouched(e,this),this.updateValueAndValidity(e),e?.emitEvent!==false&&this._events.next(new Ot(this));}getRawValue(){return this._reduceChildren({},(n,e,t)=>(n[t]=e.getRawValue(),n))}_syncPendingControls(){let n=this._reduceChildren(false,(e,t)=>t._syncPendingControls()?true:e);return n&&this.updateValueAndValidity({onlySelf:true}),n}_forEachChild(n){Object.keys(this.controls).forEach(e=>{let t=this.controls[e];t&&n(t,e);});}_setUpControls(){this._forEachChild(n=>{n.setParent(this),n._registerOnCollectionChange(this._onCollectionChange);});}_updateValue(){this.value=this._reduceValue();}_anyControls(n){for(let[e,t]of Object.entries(this.controls))if(this.contains(e)&&n(t))return  true;return  false}_reduceValue(){let n={};return this._reduceChildren(n,(e,t,a)=>((t.enabled||this.disabled)&&(e[a]=t.value),e))}_reduceChildren(n,e){let t=n;return this._forEachChild((a,r)=>{t=e(t,a,r);}),t}_allControlsDisabled(){for(let n of Object.keys(this.controls))if(this.controls[n].enabled)return  false;return Object.keys(this.controls).length>0||this.disabled}_find(n){return xr(this.controls,n)?this.controls[n]:null}};var ts={provide:vt,useExisting:ro$1(()=>Qt)},Ut=Promise.resolve(),Qt=(()=>{class i extends vt{callSetDisabledState;get submitted(){return XE(this.submittedReactive)}_submitted=JE(()=>this.submittedReactive());submittedReactive=Mo$1(false);_directives=new Set;form;ngSubmit=new Fe;options;constructor(e,t,a){super(),this.callSetDisabledState=a,this.form=new Rn({},Ei(e),Ai(t));}ngAfterViewInit(){this._setUpdateStrategy();}get formDirective(){return this}get control(){return this.form}get path(){return []}get controls(){return this.form.controls}addControl(e){Ut.then(()=>{let t=this._findContainer(e.path);e.control=t.registerControl(e.name,e.control),e._setupWithForm(this.callSetDisabledState),e.control.updateValueAndValidity({emitEvent:false}),this._directives.add(e);});}getControl(e){return this.form.get(e.path)}removeControl(e){Ut.then(()=>{this._findContainer(e.path)?.removeControl(e.name),this._directives.delete(e);});}addFormGroup(e){Ut.then(()=>{let t=this._findContainer(e.path),a=new Rn({});Er(a,e),t.registerControl(e.name,a),a.updateValueAndValidity({emitEvent:false});});}removeFormGroup(e){Ut.then(()=>{this._findContainer(e.path)?.removeControl?.(e.name);});}getFormGroup(e){return this.form.get(e.path)}updateModel(e,t){Ut.then(()=>{this.form.get(e.path).setValue(t);});}setValue(e){this.control.setValue(e);}onSubmit(e){return this.submittedReactive.set(true),Ar(this.form,this._directives),this.ngSubmit.emit(e),this.form._events.next(new On(this.control)),e?.target?.method==="dialog"}onReset(){this.resetForm();}resetForm(e=void 0){this.form.reset(e),this.submittedReactive.set(false);}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.form._updateOn=this.options.updateOn);}_findContainer(e){return e.pop(),e.length?this.form.get(e):this.form}static \u0275fac=function(t){return new(t||i)(pr$1(yt,10),pr$1(ki,10),pr$1(Nn,8))};static \u0275dir=DI({type:i,selectors:[["form",3,"ngNoForm","",3,"formGroup","",3,"formArray",""],["ng-form"],["","ngForm",""]],hostBindings:function(t,a){t&1&&tp("submit",function(o){return a.onSubmit(o)})("reset",function(){return a.onReset()});},inputs:{options:[0,"ngFormOptions","options"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:false,features:[BE([ts]),Bf]})}return i})();function rr(i,n){let e=i.indexOf(n);e>-1&&i.splice(e,1);}function or(i){return typeof i=="object"&&i!==null&&Object.keys(i).length===2&&"value"in i&&"disabled"in i}var Sr=class extends Fn{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=false;constructor(n=null,e,t){super(Cr(e),Dr(t,e)),this._applyFormState(n),this._setUpdateStrategy(e),this._initObservables(),this.updateValueAndValidity({onlySelf:true,emitEvent:!!this.asyncValidator}),Pn(e)&&(e.nonNullable||e.initialValueIsDefault)&&(or(n)?this.defaultValue=n.value:this.defaultValue=n);}setValue(n,e={}){XE(()=>{this.value=this._pendingValue=n,this._onChange.length&&e.emitModelToViewChange!==false&&this._onChange.forEach(t=>t(this.value,e.emitViewToModelChange!==false)),this.updateValueAndValidity(e);});}patchValue(n,e={}){this.setValue(n,e);}reset(n=this.defaultValue,e={}){this._applyFormState(n),this.markAsPristine(e),this.markAsUntouched(e),this.setValue(this.value,e),e.overwriteDefaultValue&&(this.defaultValue=this.value),this._pendingChange=false,e?.emitEvent!==false&&this._events.next(new Ot(this));}_updateValue(){}_anyControls(n){return  false}_allControlsDisabled(){return this.disabled}registerOnChange(n){this._onChange.push(n);}_unregisterOnChange(n){rr(this._onChange,n);}registerOnDisabledChange(n){this._onDisabledChange.push(n);}_unregisterOnDisabledChange(n){rr(this._onDisabledChange,n);}_forEachChild(n){}_syncPendingControls(){return this.updateOn==="submit"&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:true,emitModelToViewChange:false}),true):false}_applyFormState(n){or(n)?(this.value=this._pendingValue=n.value,n.disabled?this.disable({onlySelf:true,emitEvent:false}):this.enable({onlySelf:true,emitEvent:false})):this.value=this._pendingValue=n;}};var ns=i=>i instanceof Sr;var is={provide:Pe,useExisting:ro$1(()=>Xe)},sr=Promise.resolve(),Xe=(()=>{class i extends Pe{_changeDetectorRef;callSetDisabledState;control=new Sr;static ngAcceptInputType_isDisabled;_registered=false;viewModel;name="";isDisabled;model;options;update=new Fe;constructor(e,t,a,r,o,g,S,L){super(S,L,r),this._changeDetectorRef=o,this.callSetDisabledState=g,this._parent=e,this._setValidators(t),this._setAsyncValidators(a);}ngOnChanges(e){if(this._checkForErrors(),!this._registered||"name"in e){if(this._registered&&(this._checkName(),this.formDirective)){let t=e.name.previousValue;this.formDirective.removeControl({name:t,path:this._getPath(t)});}this._setUpControl();}"isDisabled"in e&&this._updateDisabled(e),Ko(e,this.viewModel)&&(this._updateValue(this.model),this.viewModel=this.model);}ngOnDestroy(){this.formDirective?.removeControl(this);}\u0275ngControlCreate(e){super.ngControlCreate(e);}\u0275ngControlUpdate(e){super.ngControlUpdate(e,false);}get shouldBindRequired(){return  false}get path(){return this._getPath(this.name)}get formDirective(){return this._parent?this._parent.formDirective:null}viewToModelUpdate(e){this.viewModel=e,this.update.emit(e);}_setUpControl(){this._setUpdateStrategy(),this._isStandalone()?this._setUpStandalone():this.formDirective.addControl(this),this._registered=true;}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.control._updateOn=this.options.updateOn);}_isStandalone(){return !this._parent||!!(this.options&&this.options.standalone)}_setUpStandalone(){this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,ir(this.control,this,this.callSetDisabledState)),this.control.updateValueAndValidity({emitEvent:false});}_setupWithForm(e){this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,ir(this.control,this,e));}_checkForErrors(){this._checkName();}_checkName(){this.options&&this.options.name&&(this.name=this.options.name),!this._isStandalone()&&this.name;}_updateValue(e){sr.then(()=>{this.control.setValue(e,{emitViewToModelChange:false}),this._changeDetectorRef?.markForCheck();});}_updateDisabled(e){let t=e.isDisabled.currentValue,a=t!==0&&qP(t);sr.then(()=>{a&&!this.control.disabled?this.control.disable():!a&&this.control.disabled&&this.control.enable(),this._changeDetectorRef?.markForCheck();});}_getPath(e){return this._parent?qo(e,this._parent):[e]}static \u0275fac=function(t){return new(t||i)(pr$1(vt,9),pr$1(yt,10),pr$1(ki,10),pr$1(bt,10),pr$1(UP,8),pr$1(Nn,8),pr$1(he$1,8),pr$1(Dv,8))};static \u0275dir=DI({type:i,selectors:[["","ngModel","",3,"formControlName","",3,"formControl",""]],inputs:{name:"name",isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"],options:[0,"ngModelOptions","options"]},outputs:{update:"ngModelChange"},exportAs:["ngModel"],standalone:false,features:[BE([is,es]),Bf,jg,CI(null)]})}return i})();var as={provide:bt,useExisting:ro$1(()=>Fi),multi:true},Fi=(()=>{class i extends dr{writeValue(e){let t=e??"";this.setProperty("value",t);}registerOnChange(e){this.onChange=t=>{e(t==""?null:parseFloat(t));};}static \u0275fac=(()=>{let e;return function(a){return (e||(e=rm(i)))(a||i)}})();static \u0275dir=DI({type:i,selectors:[["input","type","number","formControlName","",3,"ngNoCva",""],["input","type","number","formControl","",3,"ngNoCva",""],["input","type","number","ngModel","",3,"ngNoCva",""]],hostBindings:function(t,a){t&1&&tp("input",function(o){return a.onChange(o.target.value)})("blur",function(){return a.onTouched()});},standalone:false,features:[BE([as]),Bf]})}return i})();var rs=(()=>{class i extends vt{callSetDisabledState;get submitted(){return XE(this._submittedReactive)}set submitted(e){this._submittedReactive.set(e);}_submitted=JE(()=>this._submittedReactive());_submittedReactive=Mo$1(false);_oldForm;_onCollectionChange=()=>this._updateDomValue();directives=[];constructor(e,t,a){super(),this.callSetDisabledState=a,this._setValidators(e),this._setAsyncValidators(t);}ngOnChanges(e){this.onChanges(e);}ngOnDestroy(){this.onDestroy();}onChanges(e){this._checkFormPresent(),e.hasOwnProperty("form")&&(this._updateValidators(),this._updateDomValue(),this._updateRegistrations(),this._oldForm=this.form);}onDestroy(){this.form&&(Tn(this.form,this),this.form._onCollectionChange===this._onCollectionChange&&this.form._registerOnCollectionChange(()=>{}));}get formDirective(){return this}get path(){return []}addControl(e){let t=this.form.get(e.path);return e._setupWithForm(t,this.callSetDisabledState),t.updateValueAndValidity({emitEvent:false}),this.directives.push(e),t}getControl(e){return this.form.get(e.path)}removeControl(e){ar(e.control||null,e,false),Jo(this.directives,e);}addFormGroup(e){this._setUpFormContainer(e);}removeFormGroup(e){this._cleanUpFormContainer(e);}getFormGroup(e){return this.form.get(e.path)}getFormArray(e){return this.form.get(e.path)}addFormArray(e){this._setUpFormContainer(e);}removeFormArray(e){this._cleanUpFormContainer(e);}updateModel(e,t){this.form.get(e.path).setValue(t);}onReset(){this.resetForm();}resetForm(e=void 0,t={}){this.form.reset(e,t),this._submittedReactive.set(false);}onSubmit(e){return this.submitted=true,Ar(this.form,this.directives),this.ngSubmit.emit(e),this.form._events.next(new On(this.control)),e?.target?.method==="dialog"}_updateDomValue(){this.directives.forEach(e=>{let t=e.control,a=this.form.get(e.path);t!==a&&(ar(t||null,e),ns(a)&&e._setupWithForm(a,this.callSetDisabledState));}),this.form._updateTreeValidity({emitEvent:false});}_setUpFormContainer(e){let t=this.form.get(e.path);Er(t,e),t.updateValueAndValidity({emitEvent:false});}_cleanUpFormContainer(e){let t=this.form?.get(e.path);t&&Qo(t,e)&&t.updateValueAndValidity({emitEvent:false});}_updateRegistrations(){this.form._registerOnCollectionChange(this._onCollectionChange),this._oldForm?._registerOnCollectionChange(()=>{});}_updateValidators(){Oi(this.form,this),this._oldForm&&Tn(this._oldForm,this);}_checkFormPresent(){this.form;}static \u0275fac=function(t){return new(t||i)(pr$1(yt,10),pr$1(ki,10),pr$1(Nn,8))};static \u0275dir=DI({type:i,features:[Bf,jg]})}return i})();var os={provide:vt,useExisting:ro$1(()=>Kt)},Kt=(()=>{class i extends rs{form=null;ngSubmit=new Fe;get control(){return this.form}static \u0275fac=(()=>{let e;return function(a){return (e||(e=rm(i)))(a||i)}})();static \u0275dir=DI({type:i,selectors:[["","formGroup",""]],hostBindings:function(t,a){t&1&&tp("submit",function(o){return a.onSubmit(o)})("reset",function(){return a.onReset()});},inputs:{form:[0,"formGroup","form"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:false,features:[BE([os]),Bf]})}return i})();var ss=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({})}return i})();var dt=(()=>{class i{static withConfig(e){return {ngModule:i,providers:[{provide:Nn,useValue:e.callSetDisabledState??Vi}]}}static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({imports:[ss]})}return i})();var Ii=class{_box;_destroyed=new ee$1;_resizeSubject=new ee$1;_resizeObserver;_elementObservables=new Map;constructor(n){this._box=n,typeof ResizeObserver<"u"&&(this._resizeObserver=new ResizeObserver(e=>this._resizeSubject.next(e)));}observe(n){return this._elementObservables.has(n)||this._elementObservables.set(n,new M(e=>{let t=this._resizeSubject.subscribe(e);return this._resizeObserver?.observe(n,{box:this._box}),()=>{this._resizeObserver?.unobserve(n),t.unsubscribe(),this._elementObservables.delete(n);}}).pipe(Cn(e=>e.some(t=>t.target===n)),_h({bufferSize:1,refCount:true}),xh(this._destroyed))),this._elementObservables.get(n)}destroy(){this._destroyed.next(),this._destroyed.complete(),this._resizeSubject.complete(),this._elementObservables.clear();}},Vr=(()=>{class i{_cleanupErrorListener;_observers=new Map;_ngZone=C(be);constructor(){}ngOnDestroy(){for(let[,e]of this._observers)e.destroy();this._observers.clear(),this._cleanupErrorListener?.();}observe(e,t){let a=t?.box||"content-box";return this._observers.has(a)||this._observers.set(a,new Ii(a)),this._observers.get(a).observe(e)}static \u0275fac=function(t){return new(t||i)};static \u0275prov=sr$1({token:i,factory:i.\u0275fac})}return i})();var ls=["notch"],ds=["*"],Or=["iconPrefixContainer"],Fr=["textPrefixContainer"],Ir=["iconSuffixContainer"],Tr=["textSuffixContainer"],cs=["textField"],us=["*",[["mat-label"]],[["","matPrefix",""],["","matIconPrefix",""]],[["","matTextPrefix",""]],[["","matTextSuffix",""]],[["","matSuffix",""],["","matIconSuffix",""]],[["mat-error"],["","matError",""]],[["mat-hint",3,"align","end"]],[["mat-hint","align","end"]]],ms=["*","mat-label","[matPrefix], [matIconPrefix]","[matTextPrefix]","[matTextSuffix]","[matSuffix], [matIconSuffix]","mat-error, [matError]","mat-hint:not([align='end'])","mat-hint[align='end']"];function ps(i,n){i&1&&Zf(0,"span",21);}function hs(i,n){if(i&1&&(ii(0,"label",20),oE(1,1),jI(2,ps,1,0,"span",21),gc()),i&2){let e=tE(2);Qf("floating",e._shouldLabelFloat())("monitorResize",e._hasOutline())("id",e._labelId),zf("for",e._control.disableAutomaticLabeling?null:e._control.id),Fy(2),VI(!e.hideRequiredMarker&&e._control.required?2:-1);}}function fs(i,n){if(i&1&&jI(0,hs,3,5,"label",20),i&2){let e=tE();VI(e._hasFloatingLabel()?0:-1);}}function _s(i,n){i&1&&Zf(0,"div",7);}function gs(i,n){}function vs(i,n){if(i&1&&Uf(0,gs,0,0,"ng-template",13),i&2){tE(2);let e=lE(1);Qf("ngTemplateOutlet",e);}}function bs(i,n){if(i&1&&(ii(0,"div",9),jI(1,vs,1,1,null,13),gc()),i&2){let e=tE();Qf("matFormFieldNotchedOutlineOpen",e._shouldLabelFloat()),Fy(),VI(e._forceDisplayInfixLabel()?-1:1);}}function ys(i,n){i&1&&(ii(0,"div",10,2),oE(2,2),gc());}function Cs(i,n){i&1&&(ii(0,"div",11,3),oE(2,3),gc());}function Ds(i,n){}function xs(i,n){if(i&1&&Uf(0,Ds,0,0,"ng-template",13),i&2){tE();let e=lE(1);Qf("ngTemplateOutlet",e);}}function Ms(i,n){i&1&&(ii(0,"div",14,4),oE(2,4),gc());}function ws(i,n){i&1&&(ii(0,"div",15,5),oE(2,5),gc());}function ks(i,n){i&1&&Zf(0,"div",16);}function Es(i,n){i&1&&(ii(0,"div",18),oE(1,6),gc());}function As(i,n){if(i&1&&(ii(0,"mat-hint",22),AE(1),gc()),i&2){let e=tE(2);Qf("id",e._hintLabelId),Fy(),yp(e.hintLabel);}}function Ss(i,n){if(i&1&&(ii(0,"div",19),jI(1,As,2,2,"mat-hint",22),oE(2,7),Zf(3,"div",23),oE(4,8),gc()),i&2){let e=tE();Fy(),VI(e.hintLabel?1:-1);}}var pe=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["mat-label"]]})}return i})(),Vs=new x("MatError");var Ti=(()=>{class i{align="start";id=C(di).getId("mat-mdc-hint-");static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["mat-hint"]],hostAttrs:[1,"mat-mdc-form-field-hint","mat-mdc-form-field-bottom-align"],hostVars:4,hostBindings:function(t,a){t&2&&(Xf("id",a.id),zf("align",null),dp$1("mat-mdc-form-field-hint-end",a.align==="end"));},inputs:{align:"align",id:"id"}})}return i})(),Os=new x("MatPrefix");var Hr=new x("MatSuffix"),Zt=(()=>{class i{set _isTextSelector(e){this._isText=true;}_isText=false;static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["","matSuffix",""],["","matIconSuffix",""],["","matTextSuffix",""]],inputs:{_isTextSelector:[0,"matTextSuffix","_isTextSelector"]},features:[BE([{provide:Hr,useExisting:i}])]})}return i})(),jr=new x("FloatingLabelParent"),Rr=(()=>{class i{_elementRef=C(ar$1);get floating(){return this._floating}set floating(e){this._floating=e,this.monitorResize&&this._handleResize();}_floating=false;get monitorResize(){return this._monitorResize}set monitorResize(e){this._monitorResize=e,this._monitorResize?this._subscribeToResize():this._resizeSubscription.unsubscribe();}_monitorResize=false;_resizeObserver=C(Vr);_ngZone=C(be);_parent=C(jr);_resizeSubscription=new q;ngOnDestroy(){this._resizeSubscription.unsubscribe();}getWidth(){return Fs(this._elementRef.nativeElement)}get element(){return this._elementRef.nativeElement}_handleResize(){setTimeout(()=>this._parent._handleLabelResized());}_subscribeToResize(){this._resizeSubscription.unsubscribe(),this._ngZone.runOutsideAngular(()=>{this._resizeSubscription=this._resizeObserver.observe(this._elementRef.nativeElement,{box:"border-box"}).subscribe(()=>this._handleResize());});}static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["label","matFormFieldFloatingLabel",""]],hostAttrs:[1,"mdc-floating-label","mat-mdc-floating-label"],hostVars:2,hostBindings:function(t,a){t&2&&dp$1("mdc-floating-label--float-above",a.floating);},inputs:{floating:"floating",monitorResize:"monitorResize"}})}return i})();function Fs(i){let n=i;if(n.offsetParent!==null)return n.scrollWidth;let e=n.cloneNode(true);e.style.setProperty("position","absolute"),e.style.setProperty("transform","translate(-9999px, -9999px)"),document.documentElement.appendChild(e);let t=e.scrollWidth;return e.remove(),t}var Pr="mdc-line-ripple--active",Bn="mdc-line-ripple--deactivating",Nr=(()=>{class i{_elementRef=C(ar$1);_cleanupTransitionEnd;constructor(){let e=C(be),t=C(Dv);e.runOutsideAngular(()=>{this._cleanupTransitionEnd=t.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionEnd);});}activate(){let e=this._elementRef.nativeElement.classList;e.remove(Bn),e.add(Pr);}deactivate(){this._elementRef.nativeElement.classList.add(Bn);}_handleTransitionEnd=e=>{let t=this._elementRef.nativeElement.classList,a=t.contains(Bn);e.propertyName==="opacity"&&a&&t.remove(Pr,Bn);};ngOnDestroy(){this._cleanupTransitionEnd();}static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["div","matFormFieldLineRipple",""]],hostAttrs:[1,"mdc-line-ripple"]})}return i})(),Lr=(()=>{class i{_elementRef=C(ar$1);_ngZone=C(be);open=false;_notch;ngAfterViewInit(){let e=this._elementRef.nativeElement,t=e.querySelector(".mdc-floating-label");t?(e.classList.add("mdc-notched-outline--upgraded"),typeof requestAnimationFrame=="function"&&(t.style.transitionDuration="0s",this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>t.style.transitionDuration="");}))):e.classList.add("mdc-notched-outline--no-label");}_setNotchWidth(e){let t=this._notch.nativeElement;!this.open||!e?t.style.width="":t.style.width=`calc(${e}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + 9px)`;}_setMaxWidth(e){this._notch.nativeElement.style.setProperty("--mat-form-field-notch-max-width",`calc(100% - ${e}px)`);}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["div","matFormFieldNotchedOutline",""]],viewQuery:function(t,a){if(t&1&&ip(ls,5),t&2){let r;sE(r=aE())&&(a._notch=r.first);}},hostAttrs:[1,"mdc-notched-outline"],hostVars:2,hostBindings:function(t,a){t&2&&dp$1("mdc-notched-outline--notched",a.open);},inputs:{open:[0,"matFormFieldNotchedOutlineOpen","open"]},ngContentSelectors:ds,decls:5,vars:0,consts:[["notch",""],[1,"mat-mdc-notch-piece","mdc-notched-outline__leading"],[1,"mat-mdc-notch-piece","mdc-notched-outline__notch"],[1,"mat-mdc-notch-piece","mdc-notched-outline__trailing"]],template:function(t,a){t&1&&(rE(),Yf(0,"div",1),mc(1,"div",2,0),oE(3),yc(),Yf(4,"div",3));},encapsulation:2})}return i})(),Xt=(()=>{class i{value=null;stateChanges;id;placeholder;ngControl=null;focused=false;empty=false;shouldLabelFloat=false;required=false;disabled=false;errorState=false;controlType;autofilled;userAriaDescribedBy;disableAutomaticLabeling;describedByIds;static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i})}return i})();var Ct=new x("MatFormField"),Is=new x("MAT_FORM_FIELD_DEFAULT_OPTIONS"),Br="fill",Ts="auto",zr="fixed",Rs="translateY(-50%)",xe=(()=>{class i{_elementRef=C(ar$1);_changeDetectorRef=C(UP);_platform=C(P);_idGenerator=C(di);_ngZone=C(be);_defaults=C(Is,{optional:true});_currentDirection;_textField;_iconPrefixContainer;_textPrefixContainer;_iconSuffixContainer;_textSuffixContainer;_floatingLabel;_notchedOutline;_lineRipple;_iconPrefixContainerSignal=jP("iconPrefixContainer");_textPrefixContainerSignal=jP("textPrefixContainer");_iconSuffixContainerSignal=jP("iconSuffixContainer");_textSuffixContainerSignal=jP("textSuffixContainer");_prefixSuffixContainers=JE(()=>[this._iconPrefixContainerSignal(),this._textPrefixContainerSignal(),this._iconSuffixContainerSignal(),this._textSuffixContainerSignal()].map(e=>e?.nativeElement).filter(e=>e!==void 0));_formFieldControl;_prefixChildren;_suffixChildren;_errorChildren;_hintChildren;_labelChild=HP(pe);get hideRequiredMarker(){return this._hideRequiredMarker}set hideRequiredMarker(e){this._hideRequiredMarker=Cm(e);}_hideRequiredMarker=false;color="primary";get floatLabel(){return this._floatLabel||this._defaults?.floatLabel||Ts}set floatLabel(e){e!==this._floatLabel&&(this._floatLabel=e,this._changeDetectorRef.markForCheck());}_floatLabel;get appearance(){return this._appearanceSignal()}set appearance(e){let t=e||this._defaults?.appearance||Br;this._appearanceSignal.set(t);}_appearanceSignal=Mo$1(Br);get subscriptSizing(){return this._subscriptSizing||this._defaults?.subscriptSizing||zr}set subscriptSizing(e){this._subscriptSizing=e||this._defaults?.subscriptSizing||zr;}_subscriptSizing=null;get hintLabel(){return this._hintLabel}set hintLabel(e){this._hintLabel=e,this._processHints();}_hintLabel="";_hasIconPrefix=false;_hasTextPrefix=false;_hasIconSuffix=false;_hasTextSuffix=false;_labelId=this._idGenerator.getId("mat-mdc-form-field-label-");_hintLabelId=this._idGenerator.getId("mat-mdc-hint-");_describedByIds;get _control(){return this._explicitFormFieldControl||this._formFieldControl}set _control(e){this._explicitFormFieldControl=e;}_destroyed=new ee$1;_isFocused=null;_explicitFormFieldControl;_previousControl=null;_previousControlValidatorFn=null;_stateChanges;_valueChanges;_describedByChanges;_outlineLabelOffsetResizeObserver=null;_animationsDisabled=Un$1();constructor(){let e=this._defaults,t=C(tl);e&&(e.appearance&&(this.appearance=e.appearance),this._hideRequiredMarker=!!e?.hideRequiredMarker,e.color&&(this.color=e.color)),du(()=>this._currentDirection=t.valueSignal()),this._syncOutlineLabelOffset();}ngAfterViewInit(){this._updateFocusState(),this._animationsDisabled||this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-form-field-animations-enabled");},300);}),this._changeDetectorRef.detectChanges();}ngAfterContentInit(){this._assertFormFieldControl(),this._initializeSubscript(),this._initializePrefixAndSuffix();}ngAfterContentChecked(){this._assertFormFieldControl(),this._control!==this._previousControl&&(this._initializeControl(this._previousControl),this._control.ngControl&&this._control.ngControl.control&&(this._previousControlValidatorFn=this._control.ngControl.control.validator),this._previousControl=this._control),this._control.ngControl&&this._control.ngControl.control&&this._control.ngControl.control.validator!==this._previousControlValidatorFn&&this._changeDetectorRef.markForCheck();}ngOnDestroy(){this._outlineLabelOffsetResizeObserver?.disconnect(),this._stateChanges?.unsubscribe(),this._valueChanges?.unsubscribe(),this._describedByChanges?.unsubscribe(),this._destroyed.next(),this._destroyed.complete();}getLabelId=JE(()=>this._hasFloatingLabel()?this._labelId:null);getConnectedOverlayOrigin(){return this._textField||this._elementRef}_animateAndLockLabel(){this._hasFloatingLabel()&&(this.floatLabel="always");}_initializeControl(e){let t=this._control,a="mat-mdc-form-field-type-";e&&this._elementRef.nativeElement.classList.remove(a+e.controlType),t.controlType&&this._elementRef.nativeElement.classList.add(a+t.controlType),this._stateChanges?.unsubscribe(),this._stateChanges=t.stateChanges.subscribe(()=>{this._updateFocusState(),this._changeDetectorRef.markForCheck();}),this._describedByChanges?.unsubscribe(),this._describedByChanges=t.stateChanges.pipe(Nh([void 0,void 0]),Ge(()=>[t.errorState,t.userAriaDescribedBy]),bh(),Cn(([[r,o],[g,S]])=>r!==g||o!==S)).subscribe(()=>this._syncDescribedByIds()),this._valueChanges?.unsubscribe(),t.ngControl&&t.ngControl.valueChanges&&(this._valueChanges=t.ngControl.valueChanges.pipe(xh(this._destroyed)).subscribe(()=>this._changeDetectorRef.markForCheck()));}_checkPrefixAndSuffixTypes(){this._hasIconPrefix=!!this._prefixChildren.find(e=>!e._isText),this._hasTextPrefix=!!this._prefixChildren.find(e=>e._isText),this._hasIconSuffix=!!this._suffixChildren.find(e=>!e._isText),this._hasTextSuffix=!!this._suffixChildren.find(e=>e._isText);}_initializePrefixAndSuffix(){this._checkPrefixAndSuffixTypes(),gh(this._prefixChildren.changes,this._suffixChildren.changes).subscribe(()=>{this._checkPrefixAndSuffixTypes(),this._changeDetectorRef.markForCheck();});}_initializeSubscript(){this._hintChildren.changes.subscribe(()=>{this._processHints(),this._changeDetectorRef.markForCheck();}),this._errorChildren.changes.subscribe(()=>{this._syncDescribedByIds(),this._changeDetectorRef.markForCheck();}),this._validateHints(),this._syncDescribedByIds();}_assertFormFieldControl(){this._control;}_updateFocusState(){let e=this._control.focused;e&&!this._isFocused?(this._isFocused=true,this._lineRipple?.activate()):!e&&(this._isFocused||this._isFocused===null)&&(this._isFocused=false,this._lineRipple?.deactivate()),this._elementRef.nativeElement.classList.toggle("mat-focused",e),this._textField?.nativeElement.classList.toggle("mdc-text-field--focused",e);}_syncOutlineLabelOffset(){zP({earlyRead:()=>{if(this._appearanceSignal()!=="outline")return this._outlineLabelOffsetResizeObserver?.disconnect(),null;if(globalThis.ResizeObserver){this._outlineLabelOffsetResizeObserver||=new globalThis.ResizeObserver(()=>{this._writeOutlinedLabelStyles(this._getOutlinedLabelOffset());});for(let e of this._prefixSuffixContainers())this._outlineLabelOffsetResizeObserver.observe(e,{box:"border-box"});}return this._getOutlinedLabelOffset()},write:e=>this._writeOutlinedLabelStyles(e())});}_shouldAlwaysFloat(){return this.floatLabel==="always"}_hasOutline(){return this.appearance==="outline"}_forceDisplayInfixLabel(){return !this._platform.isBrowser&&this._prefixChildren.length&&!this._shouldLabelFloat()}_hasFloatingLabel=JE(()=>!!this._labelChild());_shouldLabelFloat(){return this._hasFloatingLabel()?this._control.shouldLabelFloat||this._shouldAlwaysFloat():false}_shouldForward(e){let t=this._control?this._control.ngControl:null;return t&&t[e]}_getSubscriptMessageType(){return this._errorChildren&&this._errorChildren.length>0&&this._control.errorState?"error":"hint"}_handleLabelResized(){this._refreshOutlineNotchWidth();}_refreshOutlineNotchWidth(){!this._hasOutline()||!this._floatingLabel||!this._shouldLabelFloat()?this._notchedOutline?._setNotchWidth(0):this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth());}_processHints(){this._validateHints(),this._syncDescribedByIds();}_validateHints(){this._hintChildren;}_syncDescribedByIds(){if(this._control){let e=[];if(this._control.userAriaDescribedBy&&typeof this._control.userAriaDescribedBy=="string"&&e.push(...this._control.userAriaDescribedBy.split(" ")),this._getSubscriptMessageType()==="hint"){let r=this._hintChildren?this._hintChildren.find(g=>g.align==="start"):null,o=this._hintChildren?this._hintChildren.find(g=>g.align==="end"):null;r?e.push(r.id):this._hintLabel&&e.push(this._hintLabelId),o&&e.push(o.id);}else this._errorChildren&&e.push(...this._errorChildren.map(r=>r.id));let t=this._control.describedByIds,a;if(t){let r=this._describedByIds||e;a=e.concat(t.filter(o=>o&&!r.includes(o)));}else a=e;this._control.setDescribedByIds(a),this._describedByIds=e;}}_getOutlinedLabelOffset(){if(!this._hasOutline()||!this._floatingLabel)return null;if(!this._iconPrefixContainer&&!this._textPrefixContainer)return ["",null];if(!this._isAttachedToDom())return null;let e=this._iconPrefixContainer?.nativeElement,t=this._textPrefixContainer?.nativeElement,a=this._iconSuffixContainer?.nativeElement,r=this._textSuffixContainer?.nativeElement,o=e?.getBoundingClientRect().width??0,g=t?.getBoundingClientRect().width??0,S=a?.getBoundingClientRect().width??0,L=r?.getBoundingClientRect().width??0,ze=this._currentDirection==="rtl"?"-1":"1",ln=`${o+g}px`,Nt=`calc(${ze} * (${ln} + var(--mat-mdc-form-field-label-offset-x, 0px)))`,dn=`var(--mat-mdc-form-field-label-transform, ${Rs} translateX(${Nt}))`,cn=o+g+S+L;return [dn,cn]}_writeOutlinedLabelStyles(e){if(e!==null){let[t,a]=e;this._floatingLabel&&(this._floatingLabel.element.style.transform=t),a!==null&&this._notchedOutline?._setMaxWidth(a);}}_isAttachedToDom(){let e=this._elementRef.nativeElement;if(e.getRootNode){let t=e.getRootNode();return t&&t!==e}return document.documentElement.contains(e)}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-form-field"]],contentQueries:function(t,a,r){if(t&1&&(sp$1(r,a._labelChild,pe,5),op$1(r,Xt,5)(r,Os,5)(r,Hr,5)(r,Vs,5)(r,Ti,5)),t&2){cE();let o;sE(o=aE())&&(a._formFieldControl=o.first),sE(o=aE())&&(a._prefixChildren=o),sE(o=aE())&&(a._suffixChildren=o),sE(o=aE())&&(a._errorChildren=o),sE(o=aE())&&(a._hintChildren=o);}},viewQuery:function(t,a){if(t&1&&(ap$1(a._iconPrefixContainerSignal,Or,5)(a._textPrefixContainerSignal,Fr,5)(a._iconSuffixContainerSignal,Ir,5)(a._textSuffixContainerSignal,Tr,5),ip(cs,5)(Or,5)(Fr,5)(Ir,5)(Tr,5)(Rr,5)(Lr,5)(Nr,5)),t&2){cE(4);let r;sE(r=aE())&&(a._textField=r.first),sE(r=aE())&&(a._iconPrefixContainer=r.first),sE(r=aE())&&(a._textPrefixContainer=r.first),sE(r=aE())&&(a._iconSuffixContainer=r.first),sE(r=aE())&&(a._textSuffixContainer=r.first),sE(r=aE())&&(a._floatingLabel=r.first),sE(r=aE())&&(a._notchedOutline=r.first),sE(r=aE())&&(a._lineRipple=r.first);}},hostAttrs:[1,"mat-mdc-form-field"],hostVars:38,hostBindings:function(t,a){t&2&&dp$1("mat-mdc-form-field-label-always-float",a._shouldAlwaysFloat())("mat-mdc-form-field-has-icon-prefix",a._hasIconPrefix)("mat-mdc-form-field-has-icon-suffix",a._hasIconSuffix)("mat-form-field-invalid",a._control.errorState)("mat-form-field-disabled",a._control.disabled)("mat-form-field-autofilled",a._control.autofilled)("mat-form-field-appearance-fill",a.appearance=="fill")("mat-form-field-appearance-outline",a.appearance=="outline")("mat-form-field-hide-placeholder",a._hasFloatingLabel()&&!a._shouldLabelFloat())("mat-primary",a.color!=="accent"&&a.color!=="warn")("mat-accent",a.color==="accent")("mat-warn",a.color==="warn")("ng-untouched",a._shouldForward("untouched"))("ng-touched",a._shouldForward("touched"))("ng-pristine",a._shouldForward("pristine"))("ng-dirty",a._shouldForward("dirty"))("ng-valid",a._shouldForward("valid"))("ng-invalid",a._shouldForward("invalid"))("ng-pending",a._shouldForward("pending"));},inputs:{hideRequiredMarker:"hideRequiredMarker",color:"color",floatLabel:"floatLabel",appearance:"appearance",subscriptSizing:"subscriptSizing",hintLabel:"hintLabel"},exportAs:["matFormField"],features:[BE([{provide:Ct,useExisting:i},{provide:jr,useExisting:i}])],ngContentSelectors:ms,decls:18,vars:21,consts:[["labelTemplate",""],["textField",""],["iconPrefixContainer",""],["textPrefixContainer",""],["textSuffixContainer",""],["iconSuffixContainer",""],[1,"mat-mdc-text-field-wrapper","mdc-text-field",3,"click"],[1,"mat-mdc-form-field-focus-overlay"],[1,"mat-mdc-form-field-flex"],["matFormFieldNotchedOutline","",3,"matFormFieldNotchedOutlineOpen"],[1,"mat-mdc-form-field-icon-prefix"],[1,"mat-mdc-form-field-text-prefix"],[1,"mat-mdc-form-field-infix"],[3,"ngTemplateOutlet"],[1,"mat-mdc-form-field-text-suffix"],[1,"mat-mdc-form-field-icon-suffix"],["matFormFieldLineRipple",""],["aria-atomic","true","aria-live","polite",1,"mat-mdc-form-field-subscript-wrapper","mat-mdc-form-field-bottom-align"],[1,"mat-mdc-form-field-error-wrapper"],[1,"mat-mdc-form-field-hint-wrapper"],["matFormFieldFloatingLabel","",3,"floating","monitorResize","id"],["aria-hidden","true",1,"mat-mdc-form-field-required-marker","mdc-floating-label--required"],[3,"id"],[1,"mat-mdc-form-field-hint-spacer"]],template:function(t,a){if(t&1&&(rE(us),Uf(0,fs,1,1,"ng-template",null,0,QE),ii(2,"div",6,1),tp("click",function(o){return a._control.onContainerClick(o)}),jI(4,_s,1,0,"div",7),ii(5,"div",8),jI(6,bs,2,2,"div",9),jI(7,ys,3,0,"div",10),jI(8,Cs,3,0,"div",11),ii(9,"div",12),jI(10,xs,1,1,null,13),oE(11),gc(),jI(12,Ms,3,0,"div",14),jI(13,ws,3,0,"div",15),gc(),jI(14,ks,1,0,"div",16),gc(),ii(15,"div",17),jI(16,Es,2,0,"div",18)(17,Ss,5,1,"div",19),gc()),t&2){let r;Fy(2),dp$1("mdc-text-field--filled",!a._hasOutline())("mdc-text-field--outlined",a._hasOutline())("mdc-text-field--no-label",!a._hasFloatingLabel())("mdc-text-field--disabled",a._control.disabled)("mdc-text-field--invalid",a._control.errorState),Fy(2),VI(!a._hasOutline()&&!a._control.disabled?4:-1),Fy(2),VI(a._hasOutline()?6:-1),Fy(),VI(a._hasIconPrefix?7:-1),Fy(),VI(a._hasTextPrefix?8:-1),Fy(2),VI(!a._hasOutline()||a._forceDisplayInfixLabel()?10:-1),Fy(2),VI(a._hasTextSuffix?12:-1),Fy(),VI(a._hasIconSuffix?13:-1),Fy(),VI(a._hasOutline()?-1:14),Fy(),dp$1("mat-mdc-form-field-subscript-dynamic-size",a.subscriptSizing==="dynamic");let o=a._getSubscriptMessageType();Fy(),VI((r=o)==="error"?16:r==="hint"?17:-1);}},dependencies:[Rr,Lr,ca,Nr,Ti],styles:[`.mdc-text-field {
  display: inline-flex;
  align-items: baseline;
  padding: 0 16px;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  will-change: opacity, transform, color;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.mdc-text-field__input {
  width: 100%;
  min-width: 0;
  border: none;
  border-radius: 0;
  background: none;
  padding: 0;
  -moz-appearance: none;
  -webkit-appearance: none;
  height: 28px;
}
.mdc-text-field__input::-webkit-calendar-picker-indicator, .mdc-text-field__input::-webkit-search-cancel-button {
  display: none;
}
.mdc-text-field__input::-ms-clear {
  display: none;
}
.mdc-text-field__input:focus {
  outline: none;
}
.mdc-text-field__input:invalid {
  box-shadow: none;
}
.mdc-text-field__input::placeholder {
  opacity: 0;
}
.mdc-text-field__input::-moz-placeholder {
  opacity: 0;
}
.mdc-text-field__input::-webkit-input-placeholder {
  opacity: 0;
}
.mdc-text-field__input:-ms-input-placeholder {
  opacity: 0;
}
.mdc-text-field--no-label .mdc-text-field__input::placeholder, .mdc-text-field--focused .mdc-text-field__input::placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder, .mdc-text-field--focused .mdc-text-field__input::-moz-placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder, .mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder {
  opacity: 1;
}
.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder, .mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder {
  opacity: 1;
}
.mdc-text-field--disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::placeholder {
  opacity: 0;
}
.mdc-text-field--disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::-moz-placeholder {
  opacity: 0;
}
.mdc-text-field--disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive::-webkit-input-placeholder {
  opacity: 0;
}
.mdc-text-field--disabled:not(.mdc-text-field--no-label) .mdc-text-field__input.mat-mdc-input-disabled-interactive:-ms-input-placeholder {
  opacity: 0;
}
.mdc-text-field--outlined .mdc-text-field__input, .mdc-text-field--filled.mdc-text-field--no-label .mdc-text-field__input {
  height: 100%;
}
.mdc-text-field--outlined .mdc-text-field__input {
  display: flex;
  border: none !important;
  background-color: transparent;
}
.mdc-text-field--disabled .mdc-text-field__input {
  pointer-events: auto;
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input {
  color: var(--mat-form-field-filled-input-text-color, var(--mat-sys-on-surface));
  caret-color: var(--mat-form-field-filled-caret-color, var(--mat-sys-primary));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder {
  color: var(--mat-form-field-filled-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder {
  color: var(--mat-form-field-filled-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--mat-form-field-filled-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder {
  color: var(--mat-form-field-filled-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input {
  color: var(--mat-form-field-outlined-input-text-color, var(--mat-sys-on-surface));
  caret-color: var(--mat-form-field-outlined-caret-color, var(--mat-sys-primary));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder {
  color: var(--mat-form-field-outlined-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-moz-placeholder {
  color: var(--mat-form-field-outlined-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--mat-form-field-outlined-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-text-field__input:-ms-input-placeholder {
  color: var(--mat-form-field-outlined-input-text-placeholder-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__input {
  caret-color: var(--mat-form-field-filled-error-caret-color, var(--mat-sys-error));
}
.mdc-text-field--outlined.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-text-field__input {
  caret-color: var(--mat-form-field-outlined-error-caret-color, var(--mat-sys-error));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-text-field__input {
  color: var(--mat-form-field-filled-disabled-input-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mdc-text-field__input {
  color: var(--mat-form-field-outlined-disabled-input-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-text-field--disabled .mdc-text-field__input {
    background-color: Window;
  }
}

.mdc-text-field--filled {
  height: 56px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: var(--mat-form-field-filled-container-shape, var(--mat-sys-corner-extra-small));
  border-top-right-radius: var(--mat-form-field-filled-container-shape, var(--mat-sys-corner-extra-small));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) {
  background-color: var(--mat-form-field-filled-container-color, var(--mat-sys-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--disabled {
  background-color: var(--mat-form-field-filled-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 4%, transparent));
}

.mdc-text-field--outlined {
  height: 56px;
  overflow: visible;
  padding-right: max(16px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)));
  padding-left: max(16px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)) + 4px);
}
[dir=rtl] .mdc-text-field--outlined {
  padding-right: max(16px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)) + 4px);
  padding-left: max(16px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)));
}

.mdc-floating-label {
  position: absolute;
  left: 0;
  transform-origin: left top;
  line-height: 1.15rem;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
  overflow: hidden;
  will-change: transform;
}
[dir=rtl] .mdc-floating-label {
  right: 0;
  left: auto;
  transform-origin: right top;
  text-align: right;
}
.mdc-text-field .mdc-floating-label {
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.mdc-notched-outline .mdc-floating-label {
  display: inline-block;
  position: relative;
  max-width: 100%;
}
.mdc-text-field--outlined .mdc-floating-label {
  left: 4px;
  right: auto;
}
[dir=rtl] .mdc-text-field--outlined .mdc-floating-label {
  left: auto;
  right: 4px;
}
.mdc-text-field--filled .mdc-floating-label {
  left: 16px;
  right: auto;
}
[dir=rtl] .mdc-text-field--filled .mdc-floating-label {
  left: auto;
  right: 16px;
}
.mdc-text-field--disabled .mdc-floating-label {
  cursor: default;
}
@media (forced-colors: active) {
  .mdc-text-field--disabled .mdc-floating-label {
    z-index: 1;
  }
}
.mdc-text-field--filled.mdc-text-field--no-label .mdc-floating-label {
  display: none;
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-floating-label {
  color: var(--mat-form-field-filled-label-text-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label {
  color: var(--mat-form-field-filled-focus-label-text-color, var(--mat-sys-primary));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label {
  color: var(--mat-form-field-filled-hover-label-text-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-floating-label {
  color: var(--mat-form-field-filled-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label {
  color: var(--mat-form-field-filled-error-label-text-color, var(--mat-sys-error));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label {
  color: var(--mat-form-field-filled-error-focus-label-text-color, var(--mat-sys-error));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label {
  color: var(--mat-form-field-filled-error-hover-label-text-color, var(--mat-sys-on-error-container));
}
.mdc-text-field--filled .mdc-floating-label {
  font-family: var(--mat-form-field-filled-label-text-font, var(--mat-sys-body-large-font));
  font-size: var(--mat-form-field-filled-label-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-form-field-filled-label-text-weight, var(--mat-sys-body-large-weight));
  letter-spacing: var(--mat-form-field-filled-label-text-tracking, var(--mat-sys-body-large-tracking));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-floating-label {
  color: var(--mat-form-field-outlined-label-text-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-floating-label {
  color: var(--mat-form-field-outlined-focus-label-text-color, var(--mat-sys-primary));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-floating-label {
  color: var(--mat-form-field-outlined-hover-label-text-color, var(--mat-sys-on-surface));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mdc-floating-label {
  color: var(--mat-form-field-outlined-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-floating-label {
  color: var(--mat-form-field-outlined-error-label-text-color, var(--mat-sys-error));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mdc-floating-label {
  color: var(--mat-form-field-outlined-error-focus-label-text-color, var(--mat-sys-error));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--disabled):hover .mdc-floating-label {
  color: var(--mat-form-field-outlined-error-hover-label-text-color, var(--mat-sys-on-error-container));
}
.mdc-text-field--outlined .mdc-floating-label {
  font-family: var(--mat-form-field-outlined-label-text-font, var(--mat-sys-body-large-font));
  font-size: var(--mat-form-field-outlined-label-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-form-field-outlined-label-text-weight, var(--mat-sys-body-large-weight));
  letter-spacing: var(--mat-form-field-outlined-label-text-tracking, var(--mat-sys-body-large-tracking));
}

.mdc-floating-label--float-above {
  cursor: auto;
  transform: translateY(-106%) scale(0.75);
}
.mdc-text-field--filled .mdc-floating-label--float-above {
  transform: translateY(-106%) scale(0.75);
}
.mdc-text-field--outlined .mdc-floating-label--float-above {
  transform: translateY(-37.25px) scale(1);
  font-size: 0.75rem;
}
.mdc-notched-outline .mdc-floating-label--float-above {
  text-overflow: clip;
}
.mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  max-width: 133.3333333333%;
}
.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above, .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  transform: translateY(-34.75px) scale(0.75);
}
.mdc-text-field--outlined.mdc-notched-outline--upgraded .mdc-floating-label--float-above, .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  font-size: 1rem;
}

.mdc-floating-label--required:not(.mdc-floating-label--hide-required-marker)::after {
  margin-left: 1px;
  margin-right: 0;
  content: "*";
}
[dir=rtl] .mdc-floating-label--required:not(.mdc-floating-label--hide-required-marker)::after {
  margin-left: 0;
  margin-right: 1px;
}

.mdc-notched-outline {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  height: 100%;
  text-align: left;
  pointer-events: none;
}
[dir=rtl] .mdc-notched-outline {
  text-align: right;
}
.mdc-text-field--outlined .mdc-notched-outline {
  z-index: 1;
}

.mat-mdc-notch-piece {
  box-sizing: border-box;
  height: 100%;
  pointer-events: none;
  border: none;
  border-top: 1px solid;
  border-bottom: 1px solid;
}
.mdc-text-field--focused .mat-mdc-notch-piece {
  border-width: 2px;
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-outline-color, var(--mat-sys-outline));
  border-width: var(--mat-form-field-outlined-outline-width, 1px);
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-hover-outline-color, var(--mat-sys-on-surface));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-focus-outline-color, var(--mat-sys-primary));
}
.mdc-text-field--outlined.mdc-text-field--disabled .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-disabled-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-error-outline-color, var(--mat-sys-error));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--focused):hover .mdc-notched-outline .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-error-hover-outline-color, var(--mat-sys-on-error-container));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--invalid.mdc-text-field--focused .mat-mdc-notch-piece {
  border-color: var(--mat-form-field-outlined-error-focus-outline-color, var(--mat-sys-error));
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline .mat-mdc-notch-piece {
  border-width: var(--mat-form-field-outlined-focus-outline-width, 2px);
}

.mdc-notched-outline__leading {
  border-left: 1px solid;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-left-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
}
.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading {
  width: max(12px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small)));
}
[dir=rtl] .mdc-notched-outline__leading {
  border-left: none;
  border-right: 1px solid;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-top-right-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-right-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
}

.mdc-notched-outline__trailing {
  flex-grow: 1;
  border-left: none;
  border-right: 1px solid;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-right-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
}
[dir=rtl] .mdc-notched-outline__trailing {
  border-left: 1px solid;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-left-radius: var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small));
}

.mdc-notched-outline__notch {
  flex: 0 0 auto;
  width: auto;
}
.mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch {
  max-width: min(var(--mat-form-field-notch-max-width, 100%), calc(100% - max(12px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small))) * 2));
}
.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  max-width: min(100%, calc(100% - max(12px, var(--mat-form-field-outlined-container-shape, var(--mat-sys-corner-extra-small))) * 2));
}
.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-top: 1px;
}
.mdc-text-field--focused.mdc-text-field--outlined .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-top: 2px;
}
.mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-left: 0;
  padding-right: 8px;
  border-top: none;
}
[dir=rtl] .mdc-notched-outline--notched .mdc-notched-outline__notch {
  padding-left: 8px;
  padding-right: 0;
}
.mdc-notched-outline--no-label .mdc-notched-outline__notch {
  display: none;
}

.mdc-line-ripple::before, .mdc-line-ripple::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-bottom-style: solid;
  content: "";
}
.mdc-line-ripple::before {
  z-index: 1;
  border-bottom-width: var(--mat-form-field-filled-active-indicator-height, 1px);
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-active-indicator-color, var(--mat-sys-on-surface-variant));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-hover-active-indicator-color, var(--mat-sys-on-surface));
}
.mdc-text-field--filled.mdc-text-field--disabled .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-disabled-active-indicator-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-error-active-indicator-color, var(--mat-sys-error));
}
.mdc-text-field--filled:not(.mdc-text-field--disabled).mdc-text-field--invalid:not(.mdc-text-field--focused):hover .mdc-line-ripple::before {
  border-bottom-color: var(--mat-form-field-filled-error-hover-active-indicator-color, var(--mat-sys-on-error-container));
}
.mdc-line-ripple::after {
  transform: scaleX(0);
  opacity: 0;
  z-index: 2;
}
.mdc-text-field--filled .mdc-line-ripple::after {
  border-bottom-width: var(--mat-form-field-filled-focus-active-indicator-height, 2px);
}
.mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-line-ripple::after {
  border-bottom-color: var(--mat-form-field-filled-focus-active-indicator-color, var(--mat-sys-primary));
}
.mdc-text-field--filled.mdc-text-field--invalid:not(.mdc-text-field--disabled) .mdc-line-ripple::after {
  border-bottom-color: var(--mat-form-field-filled-error-focus-active-indicator-color, var(--mat-sys-error));
}

.mdc-line-ripple--active::after {
  transform: scaleX(1);
  opacity: 1;
}

.mdc-line-ripple--deactivating::after {
  opacity: 0;
}

.mdc-text-field--disabled {
  pointer-events: none;
}

.mat-mdc-form-field-textarea-control {
  vertical-align: middle;
  resize: vertical;
  box-sizing: border-box;
  height: auto;
  margin: 0;
  padding: 0;
  border: none;
  overflow: auto;
}

.mat-mdc-form-field-input-control.mat-mdc-form-field-input-control {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font: inherit;
  letter-spacing: inherit;
  text-decoration: inherit;
  text-transform: inherit;
  border: none;
}

.mat-mdc-form-field .mat-mdc-floating-label.mdc-floating-label {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  line-height: normal;
  pointer-events: all;
  will-change: auto;
}

.mat-mdc-form-field:not(.mat-form-field-disabled) .mat-mdc-floating-label.mdc-floating-label {
  cursor: inherit;
}

.mdc-text-field--no-label:not(.mdc-text-field--textarea) .mat-mdc-form-field-input-control.mdc-text-field__input,
.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control {
  height: auto;
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control.mdc-text-field__input[type=color] {
  height: 23px;
}

.mat-mdc-text-field-wrapper {
  height: auto;
  flex: auto;
  will-change: auto;
}

.mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper {
  padding-left: 0;
  --mat-mdc-form-field-label-offset-x: -16px;
}

.mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper {
  padding-right: 0;
}

[dir=rtl] .mat-mdc-text-field-wrapper {
  padding-left: 16px;
  padding-right: 16px;
}
[dir=rtl] .mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper {
  padding-left: 0;
}
[dir=rtl] .mat-mdc-form-field-has-icon-prefix .mat-mdc-text-field-wrapper {
  padding-right: 0;
}

.mat-form-field-disabled .mdc-text-field__input::placeholder {
  color: var(--mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input::-moz-placeholder {
  color: var(--mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input::-webkit-input-placeholder {
  color: var(--mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-disabled .mdc-text-field__input:-ms-input-placeholder {
  color: var(--mat-form-field-disabled-input-text-placeholder-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mat-mdc-form-field-label-always-float .mdc-text-field__input::placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
  opacity: 1;
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-infix .mat-mdc-floating-label {
  left: auto;
  right: auto;
}

.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-text-field__input {
  display: inline-block;
}

.mat-mdc-form-field .mat-mdc-text-field-wrapper.mdc-text-field .mdc-notched-outline__notch {
  padding-top: 0;
}

.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch {
  border-left: 1px solid transparent;
}

[dir=rtl] .mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field.mat-mdc-form-field .mdc-notched-outline__notch {
  border-left: none;
  border-right: 1px solid transparent;
}

.mat-mdc-form-field-infix {
  min-height: var(--mat-form-field-container-height, 56px);
  padding-top: var(--mat-form-field-filled-with-label-container-padding-top, 24px);
  padding-bottom: var(--mat-form-field-filled-with-label-container-padding-bottom, 8px);
}
.mdc-text-field--outlined .mat-mdc-form-field-infix, .mdc-text-field--no-label .mat-mdc-form-field-infix {
  padding-top: var(--mat-form-field-container-vertical-padding, 16px);
  padding-bottom: var(--mat-form-field-container-vertical-padding, 16px);
}

.mat-mdc-text-field-wrapper .mat-mdc-form-field-flex .mat-mdc-floating-label {
  top: calc(var(--mat-form-field-container-height, 56px) / 2);
}

.mdc-text-field--filled .mat-mdc-floating-label {
  display: var(--mat-form-field-filled-label-display, block);
}

.mat-mdc-text-field-wrapper.mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  --mat-mdc-form-field-label-transform: translateY(calc(calc(6.75px + var(--mat-form-field-container-height, 56px) / 2) * -1))
    scale(var(--mat-mdc-form-field-floating-label-scale, 0.75));
  transform: var(--mat-mdc-form-field-label-transform);
}

@keyframes _mat-form-field-subscript-animation {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.mat-mdc-form-field-subscript-wrapper {
  box-sizing: border-box;
  width: 100%;
  position: relative;
}

.mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field-error-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 16px;
  opacity: 1;
  transform: translateY(0);
  animation: _mat-form-field-subscript-animation 0ms cubic-bezier(0.55, 0, 0.55, 0.2);
}

.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field-subscript-dynamic-size .mat-mdc-form-field-error-wrapper {
  position: static;
}

.mat-mdc-form-field-bottom-align::before {
  content: "";
  display: inline-block;
  height: 16px;
}

.mat-mdc-form-field-bottom-align.mat-mdc-form-field-subscript-dynamic-size::before {
  content: unset;
}

.mat-mdc-form-field-hint-end {
  order: 1;
}

.mat-mdc-form-field-hint-wrapper {
  display: flex;
}

.mat-mdc-form-field-hint-spacer {
  flex: 1 0 1em;
}

.mat-mdc-form-field-error {
  display: block;
  color: var(--mat-form-field-error-text-color, var(--mat-sys-error));
}

.mat-mdc-form-field-subscript-wrapper,
.mat-mdc-form-field-bottom-align::before {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--mat-form-field-subscript-text-font, var(--mat-sys-body-small-font));
  line-height: var(--mat-form-field-subscript-text-line-height, var(--mat-sys-body-small-line-height));
  font-size: var(--mat-form-field-subscript-text-size, var(--mat-sys-body-small-size));
  letter-spacing: var(--mat-form-field-subscript-text-tracking, var(--mat-sys-body-small-tracking));
  font-weight: var(--mat-form-field-subscript-text-weight, var(--mat-sys-body-small-weight));
}

.mat-mdc-form-field-focus-overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  opacity: 0;
  pointer-events: none;
  background-color: var(--mat-form-field-state-layer-color, var(--mat-sys-on-surface));
}
.mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-focus-overlay {
  opacity: var(--mat-form-field-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay {
  opacity: var(--mat-form-field-focus-state-layer-opacity, 0);
}

select.mat-mdc-form-field-input-control {
  -moz-appearance: none;
  -webkit-appearance: none;
  background-color: transparent;
  display: inline-flex;
  box-sizing: border-box;
}
select.mat-mdc-form-field-input-control:not(:disabled) {
  cursor: pointer;
}
select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option {
  color: var(--mat-form-field-select-option-text-color, var(--mat-sys-neutral10));
}
select.mat-mdc-form-field-input-control:not(.mat-mdc-native-select-inline) option:disabled {
  color: var(--mat-form-field-select-disabled-option-text-color, color-mix(in srgb, var(--mat-sys-neutral10) 38%, transparent));
}

.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after {
  content: "";
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid;
  position: absolute;
  right: 0;
  top: 50%;
  margin-top: -2.5px;
  pointer-events: none;
  color: var(--mat-form-field-enabled-select-arrow-color, var(--mat-sys-on-surface-variant));
}
[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-infix::after {
  right: auto;
  left: 0;
}
.mat-mdc-form-field-type-mat-native-select.mat-focused .mat-mdc-form-field-infix::after {
  color: var(--mat-form-field-focus-select-arrow-color, var(--mat-sys-primary));
}
.mat-mdc-form-field-type-mat-native-select.mat-form-field-disabled .mat-mdc-form-field-infix::after {
  color: var(--mat-form-field-disabled-select-arrow-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control {
  padding-right: 15px;
}
[dir=rtl] .mat-mdc-form-field-type-mat-native-select .mat-mdc-form-field-input-control {
  padding-right: 0;
  padding-left: 15px;
}

@media (forced-colors: active) {
  .mat-form-field-appearance-fill .mat-mdc-text-field-wrapper {
    outline: solid 1px;
  }
}
@media (forced-colors: active) {
  .mat-form-field-appearance-fill.mat-form-field-disabled .mat-mdc-text-field-wrapper {
    outline-color: GrayText;
  }
}

@media (forced-colors: active) {
  .mat-form-field-appearance-fill.mat-focused .mat-mdc-text-field-wrapper {
    outline: dashed 3px;
  }
}

@media (forced-colors: active) {
  .mat-mdc-form-field.mat-focused .mdc-notched-outline {
    border: dashed 3px;
  }
}

.mat-mdc-form-field-input-control[type=date], .mat-mdc-form-field-input-control[type=datetime], .mat-mdc-form-field-input-control[type=datetime-local], .mat-mdc-form-field-input-control[type=month], .mat-mdc-form-field-input-control[type=week], .mat-mdc-form-field-input-control[type=time] {
  line-height: 1;
}
.mat-mdc-form-field-input-control::-webkit-datetime-edit {
  line-height: 1;
  padding: 0;
  margin-bottom: -2px;
}

.mat-mdc-form-field {
  --mat-mdc-form-field-floating-label-scale: 0.75;
  display: inline-flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--mat-form-field-container-text-font, var(--mat-sys-body-large-font));
  line-height: var(--mat-form-field-container-text-line-height, var(--mat-sys-body-large-line-height));
  font-size: var(--mat-form-field-container-text-size, var(--mat-sys-body-large-size));
  letter-spacing: var(--mat-form-field-container-text-tracking, var(--mat-sys-body-large-tracking));
  font-weight: var(--mat-form-field-container-text-weight, var(--mat-sys-body-large-weight));
}
.mat-mdc-form-field .mdc-text-field--outlined .mdc-floating-label--float-above {
  font-size: calc(var(--mat-form-field-outlined-label-text-populated-size) * var(--mat-mdc-form-field-floating-label-scale));
}
.mat-mdc-form-field .mdc-text-field--outlined .mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  font-size: var(--mat-form-field-outlined-label-text-populated-size);
}
[dir=rtl] .mat-mdc-form-field {
  text-align: right;
}

.mat-mdc-form-field-flex {
  display: inline-flex;
  align-items: baseline;
  box-sizing: border-box;
  width: 100%;
}

.mat-mdc-text-field-wrapper {
  width: 100%;
  z-index: 0;
}

.mat-mdc-form-field-icon-prefix,
.mat-mdc-form-field-icon-suffix {
  align-self: center;
  line-height: 0;
  pointer-events: auto;
  position: relative;
  z-index: 1;
}
.mat-mdc-form-field-icon-prefix > .mat-icon,
.mat-mdc-form-field-icon-suffix > .mat-icon {
  padding: 0 12px;
  box-sizing: content-box;
}

.mat-mdc-form-field-icon-prefix {
  color: var(--mat-form-field-leading-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-form-field-disabled .mat-mdc-form-field-icon-prefix {
  color: var(--mat-form-field-disabled-leading-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-trailing-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-form-field-disabled .mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-disabled-trailing-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-invalid .mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-error-trailing-icon-color, var(--mat-sys-error));
}
.mat-form-field-invalid:not(.mat-focused):not(.mat-form-field-disabled) .mat-mdc-text-field-wrapper:hover .mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-error-hover-trailing-icon-color, var(--mat-sys-on-error-container));
}
.mat-form-field-invalid.mat-focused .mat-mdc-text-field-wrapper .mat-mdc-form-field-icon-suffix {
  color: var(--mat-form-field-error-focus-trailing-icon-color, var(--mat-sys-error));
}

.mat-mdc-form-field-icon-prefix,
[dir=rtl] .mat-mdc-form-field-icon-suffix {
  padding: 0 4px 0 0;
}

.mat-mdc-form-field-icon-suffix,
[dir=rtl] .mat-mdc-form-field-icon-prefix {
  padding: 0 0 0 4px;
}

.mat-mdc-form-field-subscript-wrapper .mat-icon,
.mat-mdc-form-field label .mat-icon {
  width: 1em;
  height: 1em;
  font-size: inherit;
}

.mat-mdc-form-field-infix {
  flex: auto;
  min-width: 0;
  width: 180px;
  position: relative;
  box-sizing: border-box;
}
.mat-mdc-form-field-infix:has(textarea[cols]) {
  width: auto;
}

.mat-mdc-form-field .mdc-notched-outline__notch {
  margin-left: -1px;
  -webkit-clip-path: inset(-9em -999em -9em 1px);
  clip-path: inset(-9em -999em -9em 1px);
}
[dir=rtl] .mat-mdc-form-field .mdc-notched-outline__notch {
  margin-left: 0;
  margin-right: -1px;
  -webkit-clip-path: inset(-9em 1px -9em -999em);
  clip-path: inset(-9em 1px -9em -999em);
}

.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-floating-label {
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::-moz-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input::-webkit-input-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field__input:-ms-input-placeholder {
  transition: opacity 67ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::-moz-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::-moz-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input::-webkit-input-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input::-webkit-input-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--no-label .mdc-text-field__input:-ms-input-placeholder, .mat-mdc-form-field.mat-form-field-animations-enabled.mdc-text-field--focused .mdc-text-field__input:-ms-input-placeholder {
  transition-delay: 40ms;
  transition-duration: 110ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-text-field--filled:not(.mdc-ripple-upgraded):focus .mdc-text-field__ripple::before {
  transition-duration: 75ms;
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mdc-line-ripple::after {
  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-mdc-form-field.mat-form-field-animations-enabled .mat-mdc-form-field-hint-wrapper,
.mat-mdc-form-field.mat-form-field-animations-enabled .mat-mdc-form-field-error-wrapper {
  animation-duration: 300ms;
}

.mdc-notched-outline .mdc-floating-label {
  max-width: calc(100% + 1px);
}

.mdc-notched-outline--upgraded .mdc-floating-label--float-above {
  max-width: calc(133.3333333333% + 1px);
}
`],encapsulation:2})}return i})();var se=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({imports:[Es$1,xe,Ks$1]})}return i})();var Ns=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["ng-component"]],hostAttrs:["cdk-text-field-style-loader",""],decls:0,vars:0,template:function(t,a){},styles:[`textarea.cdk-textarea-autosize {
  resize: none;
}

textarea.cdk-textarea-autosize-measuring {
  padding: 2px 0 !important;
  box-sizing: content-box !important;
  height: auto !important;
  overflow: hidden !important;
}

textarea.cdk-textarea-autosize-measuring-firefox {
  padding: 2px 0 !important;
  box-sizing: content-box !important;
  height: 0 !important;
}

@keyframes cdk-text-field-autofill-start { /*!*/ }
@keyframes cdk-text-field-autofill-end { /*!*/ }
.cdk-text-field-autofill-monitored:-webkit-autofill {
  animation: cdk-text-field-autofill-start 0s 1ms;
}

.cdk-text-field-autofill-monitored:not(:-webkit-autofill) {
  animation: cdk-text-field-autofill-end 0s 1ms;
}
`],encapsulation:2})}return i})(),Ls={passive:true},Gr=(()=>{class i{_platform=C(P);_ngZone=C(be);_renderer=C(tr$1).createRenderer(null,null);_styleLoader=C(ke);_monitoredElements=new Map;monitor(e){if(!this._platform.isBrowser)return ft;this._styleLoader.load(Ns);let t=Re$2(e),a=this._monitoredElements.get(t);if(a)return a.subject;let r=new ee$1,o="cdk-text-field-autofilled",g=L=>{L.animationName==="cdk-text-field-autofill-start"&&!t.classList.contains(o)?(t.classList.add(o),this._ngZone.run(()=>r.next({target:L.target,isAutofilled:true}))):L.animationName==="cdk-text-field-autofill-end"&&t.classList.contains(o)&&(t.classList.remove(o),this._ngZone.run(()=>r.next({target:L.target,isAutofilled:false})));},S=this._ngZone.runOutsideAngular(()=>(t.classList.add("cdk-text-field-autofill-monitored"),this._renderer.listen(t,"animationstart",g,Ls)));return this._monitoredElements.set(t,{subject:r,unlisten:S}),r}stopMonitoring(e){let t=Re$2(e),a=this._monitoredElements.get(t);a&&(a.unlisten(),a.subject.complete(),t.classList.remove("cdk-text-field-autofill-monitored"),t.classList.remove("cdk-text-field-autofilled"),this._monitoredElements.delete(t));}ngOnDestroy(){this._monitoredElements.forEach((e,t)=>this.stopMonitoring(t));}static \u0275fac=function(t){return new(t||i)};static \u0275prov=sr$1({token:i,factory:i.\u0275fac})}return i})();var qr=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({})}return i})();var zn=new x("MAT_INPUT_VALUE_ACCESSOR");var Bs=["button","checkbox","file","hidden","image","radio","range","reset","submit"],zs=new x("MAT_INPUT_CONFIG"),Le=(()=>{class i{_elementRef=C(ar$1);_platform=C(P);ngControl=C(Pe,{optional:true,self:true});_autofillMonitor=C(Gr);_ngZone=C(be);_formField=C(Ct,{optional:true});_renderer=C(Dv);_uid=C(di).getId("mat-input-");_previousNativeValue;_inputValueAccessor;_signalBasedValueAccessor;_previousPlaceholder=null;_errorStateTracker;_config=C(zs,{optional:true});_cleanupIosKeyup;_cleanupWebkitWheel;_isServer=false;_isNativeSelect=false;_isTextarea=false;_isInFormField=false;focused=false;stateChanges=new ee$1;controlType="mat-input";autofilled=false;get disabled(){return this._disabled}set disabled(e){this._disabled=Cm(e),this.focused&&(this.focused=false,this.stateChanges.next());}_disabled=false;get id(){return this._id}set id(e){this._id=e||this._uid;}_id;placeholder;name;get required(){return this._required??this.ngControl?.control?.hasValidator(Ze.required)??false}set required(e){this._required=Cm(e);}_required;get type(){return this._type}set type(e){this._type=e||"text",this._validateType(),!this._isTextarea&&gm().has(this._type)&&(this._elementRef.nativeElement.type=this._type);}_type="text";get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}userAriaDescribedBy;get value(){return this._signalBasedValueAccessor?this._signalBasedValueAccessor.value():this._inputValueAccessor.value}set value(e){e!==this.value&&(this._signalBasedValueAccessor?this._signalBasedValueAccessor.value.set(e):this._inputValueAccessor.value=e,this.stateChanges.next());}get readonly(){return this._readonly}set readonly(e){this._readonly=Cm(e);}_readonly=false;disabledInteractive;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}_neverEmptyInputTypes=["date","datetime","datetime-local","month","time","week"].filter(e=>gm().has(e));constructor(){let e=C(Qt,{optional:true}),t=C(Kt,{optional:true}),a=C(Le$1),r=C(zn,{optional:true,self:true}),o=this._elementRef.nativeElement,g=o.nodeName.toLowerCase();r?So$1(r.value)?this._signalBasedValueAccessor=r:this._inputValueAccessor=r:this._inputValueAccessor=o,this._previousNativeValue=this.value,this.id=this.id,this._platform.IOS&&this._ngZone.runOutsideAngular(()=>{this._cleanupIosKeyup=this._renderer.listen(o,"keyup",this._iOSKeyupListener);}),this._errorStateTracker=new ne(a,this.ngControl,t,e,this.stateChanges),this._isServer=!this._platform.isBrowser,this._isNativeSelect=g==="select",this._isTextarea=g==="textarea",this._isInFormField=!!this._formField,this.disabledInteractive=this._config?.disabledInteractive||false,this._isNativeSelect&&(this.controlType=o.multiple?"mat-native-select-multiple":"mat-native-select"),this._signalBasedValueAccessor&&du(()=>{this._signalBasedValueAccessor.value(),this.stateChanges.next();});}ngAfterViewInit(){this._platform.isBrowser&&this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(e=>{this.autofilled=e.isAutofilled,this.stateChanges.next();});}ngOnChanges(){this.stateChanges.next();}ngOnDestroy(){this.stateChanges.complete(),this._platform.isBrowser&&this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement),this._cleanupIosKeyup?.(),this._cleanupWebkitWheel?.();}ngDoCheck(){this.ngControl&&(this.updateErrorState(),this.ngControl.disabled!==null&&this.ngControl.disabled!==this.disabled&&(this.disabled=this.ngControl.disabled,this.stateChanges.next())),this._dirtyCheckNativeValue(),this._dirtyCheckPlaceholder();}focus(e){this._elementRef.nativeElement.focus(e);}updateErrorState(){this._errorStateTracker.updateErrorState();}_focusChanged(e){if(e!==this.focused){if(!this._isNativeSelect&&e&&this.disabled&&this.disabledInteractive){let t=this._elementRef.nativeElement;t.type==="number"?(t.type="text",t.setSelectionRange(0,0),t.type="number"):t.setSelectionRange(0,0);}this.focused=e,this.stateChanges.next();}}_onInput(){}_dirtyCheckNativeValue(){let e=this._elementRef.nativeElement.value;this._previousNativeValue!==e&&(this._previousNativeValue=e,this.stateChanges.next());}_dirtyCheckPlaceholder(){let e=this._getPlaceholder();if(e!==this._previousPlaceholder){let t=this._elementRef.nativeElement;this._previousPlaceholder=e,e?t.setAttribute("placeholder",e):t.removeAttribute("placeholder");}}_getPlaceholder(){return this.placeholder||null}_validateType(){Bs.indexOf(this._type)>-1;}_isNeverEmpty(){return this._neverEmptyInputTypes.indexOf(this._type)>-1}_isBadInput(){let e=this._elementRef.nativeElement.validity;return e&&e.badInput}get empty(){return !this._isNeverEmpty()&&!this._elementRef.nativeElement.value&&!this._isBadInput()&&!this.autofilled}get shouldLabelFloat(){if(this._isNativeSelect){let e=this._elementRef.nativeElement,t=e.options[0];return this.focused||e.multiple||!this.empty||!!(e.selectedIndex>-1&&t&&t.label)}else return this.focused&&!this.disabled||!this.empty}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let t=this._elementRef.nativeElement;e.length?t.setAttribute("aria-describedby",e.join(" ")):t.removeAttribute("aria-describedby");}onContainerClick(){this.focused||this.focus();}_isInlineSelect(){let e=this._elementRef.nativeElement;return this._isNativeSelect&&(e.multiple||e.size>1)}_iOSKeyupListener=e=>{let t=e.target;!t.value&&t.selectionStart===0&&t.selectionEnd===0&&(t.setSelectionRange(1,1),t.setSelectionRange(0,0));};_getReadonlyAttribute(){return this._isNativeSelect?null:this.readonly||this.disabled&&this.disabledInteractive?"true":null}static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["input","matInput",""],["textarea","matInput",""],["select","matNativeControl",""],["input","matNativeControl",""],["textarea","matNativeControl",""]],hostAttrs:[1,"mat-mdc-input-element"],hostVars:21,hostBindings:function(t,a){t&1&&tp("focus",function(){return a._focusChanged(true)})("blur",function(){return a._focusChanged(false)})("input",function(){return a._onInput()}),t&2&&(Xf("id",a.id)("disabled",a.disabled&&!a.disabledInteractive)("required",a.required),zf("name",a.name||null)("readonly",a._getReadonlyAttribute())("aria-disabled",a.disabled&&a.disabledInteractive?"true":null)("aria-invalid",a.empty&&a.required?null:a.errorState)("aria-required",a.required)("id",a.id),dp$1("mat-input-server",a._isServer)("mat-mdc-form-field-textarea-control",a._isInFormField&&a._isTextarea)("mat-mdc-form-field-input-control",a._isInFormField)("mat-mdc-input-disabled-interactive",a.disabledInteractive)("mdc-text-field__input",a._isInFormField)("mat-mdc-native-select-inline",a._isInlineSelect()));},inputs:{disabled:"disabled",id:"id",placeholder:"placeholder",name:"name",required:"required",type:"type",errorStateMatcher:"errorStateMatcher",userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],value:"value",readonly:"readonly",disabledInteractive:[2,"disabledInteractive","disabledInteractive",qP]},exportAs:["matInput"],features:[BE([{provide:Xt,useExisting:i}]),jg]})}return i})(),Be=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({imports:[se,se,qr,Ks$1]})}return i})();var tn=class{_multiple;_emitChanges;compareWith;_selection=new Set;_deselectedToEmit=[];_selectedToEmit=[];_selected=null;get selected(){return this._selected||(this._selected=Array.from(this._selection.values())),this._selected}changed=new ee$1;bulk={select:n=>this._select(n),deselect:n=>this._deselect(n),setSelection:n=>this._setSelection(n)};constructor(n=false,e,t=true,a){this._multiple=n,this._emitChanges=t,this.compareWith=a,e&&e.length&&(n?e.forEach(r=>this._markSelected(r)):this._markSelected(e[0]),this._selectedToEmit.length=0);}select(...n){return this._select(n)}deselect(...n){return this._deselect(n)}setSelection(...n){return this._setSelection(n)}toggle(n){return this.isSelected(n)?this.deselect(n):this.select(n)}clear(n=true){this._unmarkAll();let e=this._hasQueuedChanges();return n&&this._emitChangeEvent(),e}isSelected(n){return this._selection.has(this._getConcreteValue(n))}isEmpty(){return this._selection.size===0}hasValue(){return !this.isEmpty()}sort(n){this._multiple&&this.selected&&this._selected.sort(n);}isMultipleSelection(){return this._multiple}_select(n){this._verifyValueAssignment(n),n.forEach(t=>this._markSelected(t));let e=this._hasQueuedChanges();return this._emitChangeEvent(),e}_deselect(n){this._verifyValueAssignment(n),n.forEach(t=>this._unmarkSelected(t));let e=this._hasQueuedChanges();return this._emitChangeEvent(),e}_setSelection(n){this._verifyValueAssignment(n);let e=this.selected,t=new Set(n.map(r=>this._getConcreteValue(r)));n.forEach(r=>this._markSelected(r)),e.filter(r=>!t.has(this._getConcreteValue(r,t))).forEach(r=>this._unmarkSelected(r));let a=this._hasQueuedChanges();return this._emitChangeEvent(),a}_emitChangeEvent(){this._selected=null,(this._selectedToEmit.length||this._deselectedToEmit.length)&&(this.changed.next({source:this,added:this._selectedToEmit,removed:this._deselectedToEmit}),this._deselectedToEmit=[],this._selectedToEmit=[]);}_markSelected(n){n=this._getConcreteValue(n),this.isSelected(n)||(this._multiple||this._unmarkAll(),this.isSelected(n)||this._selection.add(n),this._emitChanges&&this._selectedToEmit.push(n));}_unmarkSelected(n){n=this._getConcreteValue(n),this.isSelected(n)&&(this._selection.delete(n),this._emitChanges&&this._deselectedToEmit.push(n));}_unmarkAll(){this.isEmpty()||this._selection.forEach(n=>this._unmarkSelected(n));}_verifyValueAssignment(n){n.length>1&&this._multiple;}_hasQueuedChanges(){return !!(this._deselectedToEmit.length||this._selectedToEmit.length)}_getConcreteValue(n,e){if(this.compareWith){e=e??this._selection;for(let t of e)if(this.compareWith(n,t))return t;return n}else return n}};var Ri=(()=>{class i{_listeners=[];notify(e,t){for(let a of this._listeners)a(e,t);}listen(e){return this._listeners.push(e),()=>{this._listeners=this._listeners.filter(t=>e!==t);}}ngOnDestroy(){this._listeners=[];}static \u0275fac=function(t){return new(t||i)};static \u0275prov=sr$1({token:i,factory:i.\u0275fac})}return i})();var js=["trigger"],Gs=["panel"],qs=[[["mat-select-trigger"]],"*"],Ys=["mat-select-trigger","*"];function Us(i,n){if(i&1&&(ii(0,"span",4),AE(1),gc()),i&2){let e=tE();Fy(),yp(e.placeholder);}}function Ws(i,n){i&1&&oE(0);}function $s(i,n){if(i&1&&(ii(0,"span",11),AE(1),gc()),i&2){let e=tE(2);Fy(),yp(e.triggerValue);}}function Qs(i,n){if(i&1&&(ii(0,"span",5),jI(1,Ws,1,0)(2,$s,2,1,"span",11),gc()),i&2){let e=tE();Fy(),VI(e.customTrigger?1:2);}}function Ks(i,n){if(i&1){let e=QI();ii(0,"div",12,1),tp("keydown",function(a){$l$1(e);let r=tE();return Ul$1(r._handleKeydown(a))}),oE(2,1),gc();}if(i&2){let e=tE();EE(e.panelClass),dp$1("mat-select-panel-animations-enabled",!e._animationsDisabled)("mat-primary",e._parentFormField?.color==="primary")("mat-accent",e._parentFormField?.color==="accent")("mat-warn",e._parentFormField?.color==="warn")("mat-undefined",!e._parentFormField?.color),zf("id",e.id+"-panel")("aria-multiselectable",e.multiple)("aria-label",e.ariaLabel||null)("aria-labelledby",e._getPanelAriaLabelledby());}}var Zs=new x("mat-select-scroll-strategy",{providedIn:"root",factory:()=>{let i=C(he$1);return ()=>rt(i)}}),Xs=new x("MAT_SELECT_CONFIG"),Js=new x("MatSelectTrigger"),Pi=class{source;value;constructor(n,e){this.source=n,this.value=e;}},Yr=(()=>{class i{_viewportRuler=C($$1);_changeDetectorRef=C(UP);_elementRef=C(ar$1);_dir=C(tl,{optional:true});_idGenerator=C(di);_renderer=C(Dv);_parentFormField=C(Ct,{optional:true});ngControl=C(Pe,{self:true,optional:true});_liveAnnouncer=C(Gc);_defaultOptions=C(Xs,{optional:true});_animationsDisabled=Un$1();_popoverLocation;_initialized=new ee$1;_cleanupDetach;options;optionGroups;customTrigger;_positions=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"}];_scrollOptionIntoView(e){let t=this.options.toArray()[e];if(t){let a=this.panel.nativeElement,r=Fe$1(e,this.options,this.optionGroups),o=t._getHostElement();e===0&&r===1?a.scrollTop=0:a.scrollTop=Oe(o.offsetTop,o.offsetHeight,a.scrollTop,a.offsetHeight);}}_positioningSettled(){this._scrollOptionIntoView(this._keyManager.activeItemIndex||0);}_getChangeEvent(e){return new Pi(this,e)}_scrollStrategyFactory=C(Zs);_panelOpen=false;_compareWith=(e,t)=>e===t;_uid=this._idGenerator.getId("mat-select-");_triggerAriaLabelledBy=null;_previousControl;_destroy=new ee$1;_errorStateTracker;stateChanges=new ee$1;disableAutomaticLabeling=true;userAriaDescribedBy;_selectionModel;_keyManager;_preferredOverlayOrigin;_overlayWidth;_onChange=()=>{};_onTouched=()=>{};_valueId=this._idGenerator.getId("mat-select-value-");_scrollStrategy;_overlayPanelClass=this._defaultOptions?.overlayPanelClass||"";get focused(){return this._focused||this._panelOpen}_focused=false;controlType="mat-select";trigger;panel;_overlayDir;panelClass;disabled=false;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e);}_disableRipple=Mo$1(false);tabIndex=0;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties();}_hideSingleSelectionIndicator=this._defaultOptions?.hideSingleSelectionIndicator??false;get placeholder(){return this._placeholder}set placeholder(e){this._placeholder=e,this.stateChanges.next();}_placeholder;get required(){return this._required??this.ngControl?.control?.hasValidator(Ze.required)??false}set required(e){this._required=e,this.stateChanges.next();}_required;get multiple(){return this._multiple}set multiple(e){this._selectionModel,this._multiple=e;}_multiple=false;disableOptionCentering=this._defaultOptions?.disableOptionCentering??false;get compareWith(){return this._compareWith}set compareWith(e){this._compareWith=e,this._selectionModel&&this._initializeSelection();}get value(){return this._value}set value(e){this._assignValue(e)&&this._onChange(e);}_value;ariaLabel="";ariaLabelledby;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e;}typeaheadDebounceInterval;sortComparator;get id(){return this._id}set id(e){this._id=e||this._uid,this.stateChanges.next();}_id;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e;}panelWidth=this._defaultOptions&&typeof this._defaultOptions.panelWidth<"u"?this._defaultOptions.panelWidth:"auto";canSelectNullableOptions=this._defaultOptions?.canSelectNullableOptions??false;optionSelectionChanges=ph(()=>{let e=this.options;return e?e.changes.pipe(Nh(e),Sh(()=>gh(...e.map(t=>t.onSelectionChange)))):this._initialized.pipe(Sh(()=>this.optionSelectionChanges))});openedChange=new Fe;_openedStream=this.openedChange.pipe(Cn(e=>e),Ge(()=>{}));_closedStream=this.openedChange.pipe(Cn(e=>!e),Ge(()=>{}));selectionChange=new Fe;valueChange=new Fe;constructor(){let e=C(Le$1),t=C(Qt,{optional:true}),a=C(Kt,{optional:true}),r=C(new Ap("tabindex"),{optional:true}),o=C(Qt$1,{optional:true});this.ngControl&&(this.ngControl.valueAccessor=this),this._defaultOptions?.typeaheadDebounceInterval!=null&&(this.typeaheadDebounceInterval=this._defaultOptions.typeaheadDebounceInterval),this._errorStateTracker=new ne(e,this.ngControl,a,t,this.stateChanges),this._scrollStrategy=this._scrollStrategyFactory(),this.tabIndex=r==null?0:parseInt(r)||0,this._popoverLocation=o?.usePopover===false?null:"inline",this.id=this.id;}ngOnInit(){this._selectionModel=new tn(this.multiple),this.stateChanges.next(),this._viewportRuler.change().pipe(xh(this._destroy)).subscribe(()=>{this.panelOpen&&(this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._changeDetectorRef.detectChanges());});}ngAfterContentInit(){this._initialized.next(),this._initialized.complete(),this._initKeyManager(),this._selectionModel.changed.pipe(xh(this._destroy)).subscribe(e=>{e.added.forEach(t=>t.select()),e.removed.forEach(t=>t.deselect());}),this.options.changes.pipe(Nh(null),xh(this._destroy)).subscribe(()=>{this._resetOptions(),this._initializeSelection();});}ngDoCheck(){let e=this._getTriggerAriaLabelledby(),t=this.ngControl;if(e!==this._triggerAriaLabelledBy){let a=this._elementRef.nativeElement;this._triggerAriaLabelledBy=e,e?a.setAttribute("aria-labelledby",e):a.removeAttribute("aria-labelledby");}t&&(this._previousControl!==t.control&&(this._previousControl!==void 0&&t.disabled!==null&&t.disabled!==this.disabled&&(this.disabled=t.disabled),this._previousControl=t.control),this.updateErrorState());}ngOnChanges(e){(e.disabled||e.userAriaDescribedBy)&&this.stateChanges.next(),e.typeaheadDebounceInterval&&this._keyManager&&this._keyManager.withTypeAhead(this.typeaheadDebounceInterval),e.panelClass&&this.panelClass instanceof Set&&(this.panelClass=Array.from(this.panelClass));}ngOnDestroy(){this._cleanupDetach?.(),this._keyManager?.destroy(),this._destroy.next(),this._destroy.complete(),this.stateChanges.complete();}toggle(){this.panelOpen?this.close():this.open();}open(){this._canOpen()&&(this._parentFormField&&(this._preferredOverlayOrigin=this._parentFormField.getConnectedOverlayOrigin()),this._cleanupDetach?.(),this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._panelOpen=true,this._overlayDir.positionChange.pipe(Ri$1(1)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this._positioningSettled();}),this._overlayDir.attachOverlay(),this._keyManager.withHorizontalOrientation(null),this._highlightCorrectOption(),this._changeDetectorRef.markForCheck(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(true)));}close(){this._panelOpen&&(this._panelOpen=false,this._exitAndDetach(),this._keyManager.withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._changeDetectorRef.markForCheck(),this._onTouched(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(false)));}_exitAndDetach(){if(this._animationsDisabled||!this.panel){this._detachOverlay();return}this._cleanupDetach?.(),this._cleanupDetach=()=>{t(),clearTimeout(a),this._cleanupDetach=void 0;};let e=this.panel.nativeElement,t=this._renderer.listen(e,"animationend",r=>{r.animationName==="_mat-select-exit"&&(this._cleanupDetach?.(),this._detachOverlay());}),a=setTimeout(()=>{this._cleanupDetach?.(),this._detachOverlay();},200);e.classList.add("mat-select-panel-exit");}_detachOverlay(){this._overlayDir.detachOverlay(),this._changeDetectorRef.markForCheck();}writeValue(e){this._assignValue(e);}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck(),this.stateChanges.next();}get panelOpen(){return this._panelOpen}get selected(){return this.multiple?this._selectionModel?.selected||[]:this._selectionModel?.selected[0]}get triggerValue(){if(this.empty)return "";if(this._multiple){let e=this._selectionModel.selected.map(t=>t.viewValue);return this._isRtl()&&e.reverse(),e.join(", ")}return this._selectionModel.selected[0].viewValue}updateErrorState(){this._errorStateTracker.updateErrorState();}_isRtl(){return this._dir?this._dir.value==="rtl":false}_handleKeydown(e){this.disabled||(this.panelOpen?this._handleOpenKeydown(e):this._handleClosedKeydown(e));}_handleClosedKeydown(e){let t=e.keyCode,a=t===40||t===38||t===37||t===39,r=t===13||t===32,o=this._keyManager;if(!o.isTyping()&&r&&!ks$1(e)||(this.multiple||e.altKey)&&a)e.preventDefault(),this.open();else if(!this.multiple){let g=this.selected;o.onKeydown(e);let S=this.selected;S&&g!==S&&this._liveAnnouncer.announce(S.viewValue,1e4);}}_handleOpenKeydown(e){let t=this._keyManager,a=e.keyCode,r=a===40||a===38,o=t.isTyping();if(r&&e.altKey)e.preventDefault(),this.close();else if(!o&&(a===13||a===32)&&t.activeItem&&!ks$1(e))e.preventDefault(),t.activeItem._selectViaInteraction();else if(!o&&this._multiple&&a===65&&e.ctrlKey){e.preventDefault();let g=this.options.some(S=>!S.disabled&&!S.selected);this.options.forEach(S=>{S.disabled||(g?S.select():S.deselect());});}else {let g=t.activeItemIndex;t.onKeydown(e),this._multiple&&r&&e.shiftKey&&t.activeItem&&t.activeItemIndex!==g&&t.activeItem._selectViaInteraction();}}_handleOverlayKeydown(e){e.keyCode===27&&!ks$1(e)&&(e.preventDefault(),this.close());}_onFocus(){this.disabled||(this._focused=true,this.stateChanges.next());}_onBlur(){this._focused=false,this._keyManager?.cancelTypeahead(),!this.disabled&&!this.panelOpen&&(this._onTouched(),this._changeDetectorRef.markForCheck(),this.stateChanges.next());}get empty(){return !this._selectionModel||this._selectionModel.isEmpty()}_initializeSelection(){Promise.resolve().then(()=>{this.ngControl&&(this._value=this.ngControl.value),this._setSelectionByValue(this._value),this.stateChanges.next();});}_setSelectionByValue(e){if(this.options.forEach(t=>t.setInactiveStyles()),this._selectionModel.clear(),this.multiple&&e)e.forEach(t=>this._selectOptionByValue(t)),this._sortValues();else {let t=this._selectOptionByValue(e);t?this._keyManager.updateActiveItem(t):this.panelOpen||this._keyManager.updateActiveItem(-1);}this._changeDetectorRef.markForCheck();}_selectOptionByValue(e){let t=this.options.find(a=>{if(this._selectionModel.isSelected(a))return  false;try{return (a.value!=null||this.canSelectNullableOptions)&&this._compareWith(a.value,e)}catch{return  false}});return t&&this._selectionModel.select(t),t}_assignValue(e){return e!==this._value||this._multiple&&Array.isArray(e)?(this.options&&this._setSelectionByValue(e),this._value=e,true):false}_skipPredicate=e=>this.panelOpen?false:e.disabled;_getOverlayWidth(e){return this.panelWidth==="auto"?(e instanceof qt$1?e.elementRef:e||this._elementRef).nativeElement.getBoundingClientRect().width:this.panelWidth===null?"":this.panelWidth}_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck();}_initKeyManager(){this._keyManager=new li(this.options).withTypeAhead(this.typeaheadDebounceInterval).withVerticalOrientation().withHorizontalOrientation(this._isRtl()?"rtl":"ltr").withHomeAndEnd().withPageUpDown().withAllowedModifierKeys(["shiftKey"]).skipPredicate(this._skipPredicate),this._keyManager.tabOut.subscribe(()=>{this.panelOpen&&(!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction(),this.focus(),this.close());}),this._keyManager.change.subscribe(()=>{this._panelOpen&&this.panel?this._scrollOptionIntoView(this._keyManager.activeItemIndex||0):!this._panelOpen&&!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction();});}_resetOptions(){let e=gh(this.options.changes,this._destroy);this.optionSelectionChanges.pipe(xh(e)).subscribe(t=>{this._onSelect(t.source,t.isUserInput),t.isUserInput&&!this.multiple&&this._panelOpen&&(this.close(),this.focus());}),gh(...this.options.map(t=>t._stateChanges)).pipe(xh(e)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this.stateChanges.next();});}_onSelect(e,t){let a=this._selectionModel.isSelected(e);!this.canSelectNullableOptions&&e.value==null&&!this._multiple?(e.deselect(),this._selectionModel.clear(),this.value!=null&&this._propagateChanges(e.value)):(a!==e.selected&&(e.selected?this._selectionModel.select(e):this._selectionModel.deselect(e)),t&&this._keyManager.setActiveItem(e),this.multiple&&(this._sortValues(),t&&this.focus())),a!==this._selectionModel.isSelected(e)&&this._propagateChanges(),this.stateChanges.next();}_sortValues(){if(this.multiple){let e=this.options.toArray();this._selectionModel.sort((t,a)=>this.sortComparator?this.sortComparator(t,a,e):e.indexOf(t)-e.indexOf(a)),this.stateChanges.next();}}_propagateChanges(e){let t;this.multiple?t=this.selected.map(a=>a.value):t=this.selected?this.selected.value:e,this._value=t,this.valueChange.emit(t),this._onChange(t),this.selectionChange.emit(this._getChangeEvent(t)),this._changeDetectorRef.markForCheck();}_highlightCorrectOption(){if(this._keyManager)if(this.empty){let e=-1;for(let t=0;t<this.options.length;t++)if(!this.options.get(t).disabled){e=t;break}this._keyManager.setActiveItem(e);}else this._keyManager.setActiveItem(this._selectionModel.selected[0]);}_canOpen(){return !this._panelOpen&&!this.disabled&&this.options?.length>0&&!!this._overlayDir}focus(e){this._elementRef.nativeElement.focus(e);}_getPanelAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||null,t=e?e+" ":"";return this.ariaLabelledby?t+this.ariaLabelledby:e}_getAriaActiveDescendant(){return this.panelOpen&&this._keyManager&&this._keyManager.activeItem?this._keyManager.activeItem.id:null}_getTriggerAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||"";return this.ariaLabelledby&&(e+=" "+this.ariaLabelledby),e||(e=this._valueId),e}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let t=this._elementRef.nativeElement;e.length?t.setAttribute("aria-describedby",e.join(" ")):t.removeAttribute("aria-describedby");}onContainerClick(e){let t=ie(e);t&&(t.tagName==="MAT-OPTION"||t.classList.contains("cdk-overlay-backdrop")||t.closest(".mat-mdc-select-panel"))||(this.focus(),this.open());}get shouldLabelFloat(){return this.panelOpen||!this.empty||this.focused&&!!this.placeholder}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-select"]],contentQueries:function(t,a,r){if(t&1&&op$1(r,Js,5)(r,$,5)(r,pe$1,5),t&2){let o;sE(o=aE())&&(a.customTrigger=o.first),sE(o=aE())&&(a.options=o),sE(o=aE())&&(a.optionGroups=o);}},viewQuery:function(t,a){if(t&1&&ip(js,5)(Gs,5)(mn,5),t&2){let r;sE(r=aE())&&(a.trigger=r.first),sE(r=aE())&&(a.panel=r.first),sE(r=aE())&&(a._overlayDir=r.first);}},hostAttrs:["role","combobox","aria-haspopup","listbox",1,"mat-mdc-select"],hostVars:21,hostBindings:function(t,a){t&1&&tp("keydown",function(o){return a._handleKeydown(o)})("focus",function(){return a._onFocus()})("blur",function(){return a._onBlur()}),t&2&&(zf("id",a.id)("tabindex",a.disabled?-1:a.tabIndex)("aria-controls",a.panelOpen?a.id+"-panel":null)("aria-expanded",a.panelOpen)("aria-label",a.ariaLabel||null)("aria-required",a.required.toString())("aria-disabled",a.disabled.toString())("aria-invalid",a.errorState)("aria-activedescendant",a._getAriaActiveDescendant()),dp$1("mat-mdc-select-disabled",a.disabled)("mat-mdc-select-invalid",a.errorState)("mat-mdc-select-required",a.required)("mat-mdc-select-empty",a.empty)("mat-mdc-select-multiple",a.multiple)("mat-select-open",a.panelOpen));},inputs:{userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],panelClass:"panelClass",disabled:[2,"disabled","disabled",qP],disableRipple:[2,"disableRipple","disableRipple",qP],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:GP(e)],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",qP],placeholder:"placeholder",required:[2,"required","required",qP],multiple:[2,"multiple","multiple",qP],disableOptionCentering:[2,"disableOptionCentering","disableOptionCentering",qP],compareWith:"compareWith",value:"value",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],errorStateMatcher:"errorStateMatcher",typeaheadDebounceInterval:[2,"typeaheadDebounceInterval","typeaheadDebounceInterval",GP],sortComparator:"sortComparator",id:"id",panelWidth:"panelWidth",canSelectNullableOptions:[2,"canSelectNullableOptions","canSelectNullableOptions",qP]},outputs:{openedChange:"openedChange",_openedStream:"opened",_closedStream:"closed",selectionChange:"selectionChange",valueChange:"valueChange"},exportAs:["matSelect"],features:[BE([{provide:Xt,useExisting:i},{provide:me,useExisting:i}]),jg],ngContentSelectors:Ys,decls:11,vars:10,consts:[["fallbackOverlayOrigin","cdkOverlayOrigin","trigger",""],["panel",""],["cdk-overlay-origin","",1,"mat-mdc-select-trigger",3,"click"],[1,"mat-mdc-select-value"],[1,"mat-mdc-select-placeholder","mat-mdc-select-min-line"],[1,"mat-mdc-select-value-text"],[1,"mat-mdc-select-arrow-wrapper"],[1,"mat-mdc-select-arrow"],["viewBox","0 0 24 24","width","24px","height","24px","focusable","false","aria-hidden","true"],["d","M7 10l5 5 5-5z"],["cdk-connected-overlay","","cdkConnectedOverlayHasBackdrop","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"detach","backdropClick","overlayKeydown","cdkConnectedOverlayDisableClose","cdkConnectedOverlayPanelClass","cdkConnectedOverlayScrollStrategy","cdkConnectedOverlayOrigin","cdkConnectedOverlayPositions","cdkConnectedOverlayWidth","cdkConnectedOverlayFlexibleDimensions","cdkConnectedOverlayUsePopover"],[1,"mat-mdc-select-min-line"],["role","listbox","tabindex","-1",1,"mat-mdc-select-panel","mdc-menu-surface","mdc-menu-surface--open",3,"keydown"]],template:function(t,a){if(t&1&&(rE(qs),ii(0,"div",2,0),tp("click",function(){return a.open()}),ii(3,"div",3),jI(4,Us,2,1,"span",4)(5,Qs,3,1,"span",5),gc(),ii(6,"div",6)(7,"div",7),tu(),ii(8,"svg",8),Zf(9,"path",9),gc()()()(),Uf(10,Ks,3,16,"ng-template",10),tp("detach",function(){return a.close()})("backdropClick",function(){return a.close()})("overlayKeydown",function(o){return a._handleOverlayKeydown(o)})),t&2){let r=lE(1);Fy(3),zf("id",a._valueId),Fy(),VI(a.empty?4:5),Fy(6),Qf("cdkConnectedOverlayDisableClose",true)("cdkConnectedOverlayPanelClass",a._overlayPanelClass)("cdkConnectedOverlayScrollStrategy",a._scrollStrategy)("cdkConnectedOverlayOrigin",a._preferredOverlayOrigin||r)("cdkConnectedOverlayPositions",a._positions)("cdkConnectedOverlayWidth",a._overlayWidth)("cdkConnectedOverlayFlexibleDimensions",true)("cdkConnectedOverlayUsePopover",a._popoverLocation);}},dependencies:[qt$1,mn],styles:[`@keyframes _mat-select-enter {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-select-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-mdc-select {
  display: inline-block;
  width: 100%;
  outline: none;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  color: var(--mat-select-enabled-trigger-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-select-trigger-text-font, var(--mat-sys-body-large-font));
  line-height: var(--mat-select-trigger-text-line-height, var(--mat-sys-body-large-line-height));
  font-size: var(--mat-select-trigger-text-size, var(--mat-sys-body-large-size));
  font-weight: var(--mat-select-trigger-text-weight, var(--mat-sys-body-large-weight));
  letter-spacing: var(--mat-select-trigger-text-tracking, var(--mat-sys-body-large-tracking));
}

div.mat-mdc-select-panel {
  box-shadow: var(--mat-select-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
}

.mat-mdc-select-disabled {
  color: var(--mat-select-disabled-trigger-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-select-disabled .mat-mdc-select-placeholder {
  color: var(--mat-select-disabled-trigger-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mat-mdc-select-trigger {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
  width: 100%;
}
.mat-mdc-select-disabled .mat-mdc-select-trigger {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
}

.mat-mdc-select-value {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mat-mdc-select-value-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mat-mdc-select-arrow-wrapper {
  height: 24px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}
.mat-form-field-appearance-fill .mdc-text-field--no-label .mat-mdc-select-arrow-wrapper {
  transform: none;
}

.mat-mdc-form-field .mat-mdc-select.mat-mdc-select-invalid .mat-mdc-select-arrow,
.mat-form-field-invalid:not(.mat-form-field-disabled) .mat-mdc-form-field-infix::after {
  color: var(--mat-select-invalid-arrow-color, var(--mat-sys-error));
}

.mat-mdc-select-arrow {
  width: 10px;
  height: 5px;
  position: relative;
  color: var(--mat-select-enabled-arrow-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-form-field.mat-focused .mat-mdc-select-arrow {
  color: var(--mat-select-focused-arrow-color, var(--mat-sys-primary));
}
.mat-mdc-form-field .mat-mdc-select.mat-mdc-select-disabled .mat-mdc-select-arrow {
  color: var(--mat-select-disabled-arrow-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-select-open .mat-mdc-select-arrow {
  transform: rotate(180deg);
}
.mat-form-field-animations-enabled .mat-mdc-select-arrow {
  transition: transform 80ms linear;
}
.mat-mdc-select-arrow svg {
  fill: currentColor;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
@media (forced-colors: active) {
  .mat-mdc-select-arrow svg {
    fill: CanvasText;
  }
  .mat-mdc-select-disabled .mat-mdc-select-arrow svg {
    fill: GrayText;
  }
}

div.mat-mdc-select-panel {
  width: 100%;
  max-height: 275px;
  outline: 0;
  overflow: auto;
  padding: 8px 0;
  box-sizing: border-box;
  transform-origin: top center;
  border-radius: 0 0 4px 4px;
  position: relative;
  background-color: var(--mat-select-panel-background-color, var(--mat-sys-surface-container));
}
.mat-mdc-select-panel-above div.mat-mdc-select-panel {
  border-radius: 4px 4px 0 0;
  transform-origin: bottom center;
}
@media (forced-colors: active) {
  div.mat-mdc-select-panel {
    outline: solid 1px;
  }
}

.mat-select-panel-animations-enabled {
  animation: _mat-select-enter 120ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-select-panel-animations-enabled.mat-select-panel-exit {
  animation: _mat-select-exit 100ms linear;
}

.mat-mdc-select-placeholder {
  transition: color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);
  color: var(--mat-select-placeholder-text-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-form-field:not(.mat-form-field-animations-enabled) .mat-mdc-select-placeholder, ._mat-animation-noopable .mat-mdc-select-placeholder {
  transition: none;
}
.mat-form-field-hide-placeholder .mat-mdc-select-placeholder {
  color: transparent;
  -webkit-text-fill-color: transparent;
  transition: none;
  display: block;
}

.mat-mdc-form-field-type-mat-select:not(.mat-form-field-disabled) .mat-mdc-text-field-wrapper {
  cursor: pointer;
}
.mat-mdc-form-field-type-mat-select.mat-form-field-appearance-fill .mat-mdc-floating-label {
  max-width: calc(100% - 18px);
}
.mat-mdc-form-field-type-mat-select.mat-form-field-appearance-fill .mdc-floating-label--float-above {
  max-width: calc(100% / 0.75 - 24px);
}
.mat-mdc-form-field-type-mat-select.mat-form-field-appearance-outline .mdc-notched-outline__notch {
  max-width: calc(100% - 60px);
}
.mat-mdc-form-field-type-mat-select.mat-form-field-appearance-outline .mdc-text-field--label-floating .mdc-notched-outline__notch {
  max-width: calc(100% - 24px);
}

.mat-mdc-select-min-line:empty::before {
  content: " ";
  white-space: pre;
  width: 1px;
  display: inline-block;
  visibility: hidden;
}

.mat-form-field-appearance-fill .mat-mdc-select-arrow-wrapper {
  transform: var(--mat-select-arrow-transform, translateY(-8px));
}
`],encapsulation:2})}return i})();var Ur=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({imports:[hn,Je,Ks$1,Wt$1,se,Je]})}return i})();var nl=["panelTemplate"],il=(i,n)=>n.value;function al(i,n){if(i&1){let e=QI();ii(0,"mat-option",3),tp("onSelectionChange",function(a){$l$1(e);let r=tE(2);return Ul$1(r._selectValue(a.source))}),AE(1),gc();}if(i&2){let e=n.$implicit;Qf("value",e.value),Fy(),yp(e.label);}}function rl(i,n){if(i&1){let e=QI();ii(0,"div",1),tp("animationend",function(a){$l$1(e);let r=tE();return Ul$1(r._handleAnimationEnd(a))}),BI(1,al,2,2,"mat-option",2,il),gc();}if(i&2){let e=tE();dp$1("mat-timepicker-panel-animations-enabled",!e._animationsDisabled)("mat-timepicker-panel-exit",!e.isOpen()),Qf("id",e.panelId),zf("aria-label",e.ariaLabel()||null)("aria-labelledby",e._getAriaLabelledby()),Fy(),$I(e._timeOptions);}}var ol=[[["","matTimepickerToggleIcon",""]]],sl=["[matTimepickerToggleIcon]"];function ll(i,n){i&1&&(tu(),ii(0,"svg",1),Zf(1,"path",2),gc());}var dl=/^(\d*\.?\d+)\s*(h|hour|hours|m|min|minute|minutes|s|second|seconds)?$/i,$r=new x("MAT_TIMEPICKER_CONFIG");function Wr(i){let n;if(i===null)return null;if(typeof i=="number")n=i;else {if(i.trim().length===0)return null;let e=i.match(dl),t=e?parseFloat(e[1]):null,a=e?.[2]?.toLowerCase()||null;if(!e||t===null||isNaN(t))return null;a==="h"||a==="hour"||a==="hours"?n=t*3600:a==="m"||a==="min"||a==="minute"||a==="minutes"?n=t*60:n=t;}return n}function cl(i,n,e,t,a){a=Math.max(a,1);let r=[],o=i.compareTime(e,t)<1?e:t;for(;i.sameDate(o,e)&&i.compareTime(o,t)<1&&i.isValid(o);)r.push({value:o,label:i.format(o,n.display.timeOptionLabel)}),o=i.addSeconds(o,a);return r}var ul=new x("MAT_TIMEPICKER_SCROLL_STRATEGY",{providedIn:"root",factory:()=>{let i=C(he$1);return ()=>rt(i)}}),Li=(()=>{class i{_dir=C(tl,{optional:true});_viewContainerRef=C(vi);_injector=C(he$1);_defaultConfig=C($r,{optional:true});_dateAdapter=C(ee,{optional:true});_dateFormats=C(Ne$1,{optional:true});_scrollStrategyFactory=C(ul);_animationsDisabled=Un$1();_isOpen=Mo$1(false);_activeDescendant=Mo$1(null);_input=Mo$1(null);_overlayRef=null;_portal=null;_optionsCacheKey=null;_localeChanges;_onOpenRender=null;_panelTemplate=jP.required("panelTemplate");_timeOptions=[];_options=VP();_keyManager=new li(this._options,this._injector).withHomeAndEnd(true).withPageUpDown(true).withVerticalOrientation(true);interval=LP(Wr(this._defaultConfig?.interval||null),{transform:Wr});options=LP(null);isOpen=this._isOpen.asReadonly();selected=PP();opened=PP();closed=PP();activeDescendant=this._activeDescendant.asReadonly();panelId=C(di).getId("mat-timepicker-panel-");disableRipple=LP(this._defaultConfig?.disableRipple??false,{transform:qP});ariaLabel=LP(null,{alias:"aria-label"});ariaLabelledby=LP(null,{alias:"aria-labelledby"});disabled=JE(()=>!!this._input()?.disabled());panelClass=LP();constructor(){C(ar$1).nativeElement.setAttribute("mat-timepicker-panel-id",this.panelId),this._handleLocaleChanges(),this._handleInputStateChanges(),this._keyManager.change.subscribe(()=>this._activeDescendant.set(this._keyManager.activeItem?.id||null));}open(){let e=this._input();if(!e||(e.focus(),this._isOpen()))return;this._isOpen.set(true),this._generateOptions();let t=this._getOverlayRef();t.updateSize({width:e.getOverlayOrigin().nativeElement.offsetWidth}),this._portal??=new it(this._panelTemplate(),this._viewContainerRef),t.hasAttached()||t.attach(this._portal),this._onOpenRender?.destroy(),this._onOpenRender=py(()=>{let a=this._options();this._syncSelectedState(e.value(),a,a[0]),this._onOpenRender=null;},{injector:this._injector}),this.opened.emit();}close(){this._isOpen()&&(this._isOpen.set(false),this.closed.emit(),this._animationsDisabled&&this._overlayRef?.detach());}registerInput(e){this._input();this._input.set(e);}ngOnDestroy(){this._keyManager.destroy(),this._localeChanges?.unsubscribe(),this._onOpenRender?.destroy(),this._overlayRef?.dispose();}_getOverlayHost(){return this._overlayRef?.hostElement}_selectValue(e){this.close(),this._keyManager.setActiveItem(e),this._options().forEach(t=>{t!==e&&t.deselect(false);}),this._input()?.timepickerValueAssigned(e.value),this.selected.emit({value:e.value,source:this}),this._input()?.focus();}_getAriaLabelledby(){return this.ariaLabel()?null:this.ariaLabelledby()||this._input()?.getLabelId()||null}_handleAnimationEnd(e){e.animationName==="_mat-timepicker-exit"&&this._overlayRef?.detach();}_getOverlayRef(){if(this._overlayRef)return this._overlayRef;let e=st$1(this._injector,this._input().getOverlayOrigin()).withFlexibleDimensions(false).withPush(false).withTransformOriginOn(".mat-timepicker-panel").withPopoverLocation("inline").withPositions([{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-timepicker-above"}]);return this._overlayRef=lt$1(this._injector,{positionStrategy:e,scrollStrategy:this._scrollStrategyFactory(),direction:this._dir||"ltr",hasBackdrop:false,disableAnimations:this._animationsDisabled,panelClass:this.panelClass()}),this._overlayRef.detachments().subscribe(()=>this.close()),this._overlayRef.keydownEvents().subscribe(t=>this._handleKeydown(t)),this._overlayRef.outsidePointerEvents().subscribe(t=>{let a=ie(t),r=this._input()?.getOverlayOrigin().nativeElement;a&&r&&a!==r&&!r.contains(a)&&this.close();}),this._overlayRef}_generateOptions(){let e=this.interval()??1800,t=this.options();if(t!==null)this._timeOptions=t;else {let a=this._input(),r=this._dateAdapter,o=this._dateFormats.display.timeInput,g=a?.min()||r.setTime(r.today(),0,0,0),S=a?.max()||r.setTime(r.today(),23,59,0),L=e+"/"+r.format(g,o)+"/"+r.format(S,o);L!==this._optionsCacheKey&&(this._optionsCacheKey=L,this._timeOptions=cl(r,this._dateFormats,g,S,e));}}_syncSelectedState(e,t,a){let r=false;for(let o of t)e&&this._dateAdapter.sameTime(o.value,e)?(o.select(false),Ni(o,"center"),XE(()=>this._keyManager.setActiveItem(o)),r=true):o.deselect(false);r||(a?(XE(()=>this._keyManager.setActiveItem(a)),Ni(a,"center")):XE(()=>this._keyManager.setActiveItem(-1)));}_handleKeydown(e){let t=e.keyCode;if(t===9)this.close();else if(t===27&&!ks$1(e))e.preventDefault(),this.close();else if(t===13)e.preventDefault(),this._keyManager.activeItem?this._selectValue(this._keyManager.activeItem):this.close();else {let a=this._keyManager.activeItem;this._keyManager.onKeydown(e);let r=this._keyManager.activeItem;r&&r!==a&&Ni(r,"nearest");}}_handleLocaleChanges(){this._localeChanges=this._dateAdapter.localeChanges.subscribe(()=>{this._optionsCacheKey=null,this.isOpen()&&this._generateOptions();});}_handleInputStateChanges(){du(()=>{let e=this._input(),t=this._options();this._isOpen()&&e&&this._syncSelectedState(e.value(),t,null);});}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-timepicker"]],viewQuery:function(t,a){t&1&&ap$1(a._panelTemplate,nl,5)(a._options,$,5),t&2&&cE(2);},inputs:{interval:[1,"interval"],options:[1,"options"],disableRipple:[1,"disableRipple"],ariaLabel:[1,"aria-label","ariaLabel"],ariaLabelledby:[1,"aria-labelledby","ariaLabelledby"],panelClass:[1,"panelClass"]},outputs:{selected:"selected",opened:"opened",closed:"closed"},exportAs:["matTimepicker"],features:[BE([{provide:me,useExisting:i}])],decls:2,vars:0,consts:[["panelTemplate",""],["role","listbox",1,"mat-timepicker-panel",3,"animationend","id"],[3,"value"],[3,"onSelectionChange","value"]],template:function(t,a){t&1&&Uf(0,rl,3,7,"ng-template",null,0,QE);},dependencies:[$],styles:[`@keyframes _mat-timepicker-enter {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-timepicker-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
mat-timepicker {
  display: none;
}

.mat-timepicker-panel {
  width: 100%;
  max-height: 256px;
  transform-origin: center top;
  overflow: auto;
  padding: 8px 0;
  box-sizing: border-box;
  position: relative;
  border-bottom-left-radius: var(--mat-timepicker-container-shape, var(--mat-sys-corner-extra-small));
  border-bottom-right-radius: var(--mat-timepicker-container-shape, var(--mat-sys-corner-extra-small));
  box-shadow: var(--mat-timepicker-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
  background-color: var(--mat-timepicker-container-background-color, var(--mat-sys-surface-container));
}
@media (forced-colors: active) {
  .mat-timepicker-panel {
    outline: solid 1px;
  }
}
.mat-timepicker-above .mat-timepicker-panel {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: var(--mat-timepicker-container-shape, var(--mat-sys-corner-extra-small));
  border-top-right-radius: var(--mat-timepicker-container-shape, var(--mat-sys-corner-extra-small));
}

.mat-timepicker-panel-animations-enabled {
  animation: _mat-timepicker-enter 120ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-timepicker-panel-animations-enabled.mat-timepicker-panel-exit {
  animation: _mat-timepicker-exit 100ms linear;
}

.mat-timepicker-input[readonly] {
  cursor: pointer;
}

@media (forced-colors: active) {
  .mat-timepicker-toggle-default-icon {
    color: CanvasText;
  }
}
`],encapsulation:2})}return i})();function Ni(i,n){i._getHostElement().scrollIntoView({block:n,inline:n});}var Qr=(()=>{class i{_elementRef=C(ar$1);_dateAdapter=C(ee,{optional:true});_dateFormats=C(Ne$1,{optional:true});_formField=C(Ct,{optional:true});_onChange;_onTouched;_validatorOnChange;_cleanupClick;_accessorDisabled=Mo$1(false);_localeSubscription;_timepickerSubscription;_validator;_lastValueValid=true;_minValid=true;_maxValid=true;_lastValidDate=null;_ariaActiveDescendant=JE(()=>{let e=this.timepicker(),t=e.isOpen(),a=e.activeDescendant();return t&&a?a:null});_ariaExpanded=JE(()=>this.timepicker().isOpen()+"");_ariaControls=JE(()=>{let e=this.timepicker();return e.isOpen()?e.panelId:null});value=FP(null);timepicker=LP.required({alias:"matTimepicker"});min=LP(null,{alias:"matTimepickerMin",transform:e=>this._transformDateInput(e)});max=LP(null,{alias:"matTimepickerMax",transform:e=>this._transformDateInput(e)});openOnClick=LP(true,{alias:"matTimepickerOpenOnClick",transform:qP});disabled=JE(()=>this.disabledInput()||this._accessorDisabled());disabledInput=LP(false,{transform:qP,alias:"disabled"});constructor(){let e=C(Dv);this._validator=this._getValidator(),this._updateFormsState(),this._registerTimepicker(),this._localeSubscription=this._dateAdapter.localeChanges.subscribe(()=>{this._hasFocus()||this._formatValue(this.value());}),this._cleanupClick=e.listen(this.getOverlayOrigin().nativeElement,"click",this._handleClick);}writeValue(e){let t=this._dateAdapter.deserialize(e);this.value.set(this._dateAdapter.getValidDateOrNull(t));}registerOnChange(e){this._onChange=e;}registerOnTouched(e){this._onTouched=e;}setDisabledState(e){this._accessorDisabled.set(e);}validate(e){return this._validator(e)}registerOnValidatorChange(e){this._validatorOnChange=e;}getOverlayOrigin(){return this._formField?.getConnectedOverlayOrigin()||this._elementRef}focus(){this._elementRef.nativeElement.focus();}ngOnDestroy(){this._cleanupClick(),this._timepickerSubscription?.unsubscribe(),this._localeSubscription.unsubscribe();}getLabelId(){return this._formField?.getLabelId()||null}_handleClick=e=>{if(this.disabled()||!this.openOnClick())return;let t=ie(e),a=this.timepicker()._getOverlayHost();(!t||!a||!a.contains(t))&&this.timepicker().open();};_handleInput(e){let t=e.target.value,a=this.value(),r=this._dateAdapter.parseTime(t,this._dateFormats.parse.timeInput),o=!this._dateAdapter.sameTime(r,a);!r||o||t&&!a?this._assignUserSelection(r,true):this._validatorOnChange?.();}_handleBlur(){let e=this.value();e&&this._isValid(e)&&this._formatValue(e),this.timepicker().isOpen()||this._onTouched?.();}_handleKeydown(e){this.timepicker().isOpen()||this.disabled()||(e.keyCode===27&&!ks$1(e)&&this.value()!==null?(e.preventDefault(),this.value.set(null),this._formatValue(null)):(e.keyCode===40||e.keyCode===38)&&(e.preventDefault(),this.timepicker().open()));}timepickerValueAssigned(e){this._dateAdapter.sameTime(e,this.value())||(this._assignUserSelection(e,true),this._formatValue(e));}_updateFormsState(){du(()=>{let{_dateAdapter:e,_lastValueValid:t,_minValid:a,_maxValid:r}=this,o=e.deserialize(this.value()),g=this.min(),S=this.max(),L=this._lastValueValid=this._isValid(o);this._minValid=!g||!o||!L||e.compareTime(g,o)<=0,this._maxValid=!S||!o||!L||e.compareTime(S,o)>=0;let ze=t!==L||a!==this._minValid||r!==this._maxValid;this._hasFocus()||this._formatValue(o),o&&L&&(this._lastValidDate=o),ze&&this._validatorOnChange?.();});}_registerTimepicker(){du(()=>{let e=this.timepicker();e.registerInput(this),e.closed.subscribe(()=>this._onTouched?.());});}_assignUserSelection(e,t){let a;if(e==null||!this._isValid(e))a=e;else {let r=this._dateAdapter,o=r.getValidDateOrNull(this._lastValidDate||this.value()),g=r.getHours(e),S=r.getMinutes(e),L=r.getSeconds(e);a=o?r.setTime(o,g,S,L):e;}t&&this._onChange?.(a),this.value.set(a);}_formatValue(e){e=this._dateAdapter.getValidDateOrNull(e),this._elementRef.nativeElement.value=e==null?"":this._dateAdapter.format(e,this._dateFormats.display.timeInput);}_isValid(e){return !e||this._dateAdapter.isValid(e)}_transformDateInput(e){let t=typeof e=="string"?this._dateAdapter.parseTime(e,this._dateFormats.parse.timeInput):this._dateAdapter.deserialize(e);return t&&this._dateAdapter.isValid(t)?t:null}_hasFocus(){return si()===this._elementRef.nativeElement}_getValidator(){return Ze.compose([()=>this._lastValueValid?null:{matTimepickerParse:{text:this._elementRef.nativeElement.value}},e=>this._minValid?null:{matTimepickerMin:{min:this.min(),actual:this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value))}},e=>this._maxValid?null:{matTimepickerMax:{max:this.max(),actual:this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value))}}])}static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["input","matTimepicker",""]],hostAttrs:["role","combobox","type","text","aria-haspopup","listbox",1,"mat-timepicker-input"],hostVars:5,hostBindings:function(t,a){t&1&&tp("blur",function(){return a._handleBlur()})("input",function(o){return a._handleInput(o)})("keydown",function(o){return a._handleKeydown(o)}),t&2&&(Xf("disabled",a.disabled()),zf("aria-activedescendant",a._ariaActiveDescendant())("aria-expanded",a._ariaExpanded())("aria-controls",a._ariaControls())("mat-timepicker-id",a.timepicker()?.panelId));},inputs:{value:[1,"value"],timepicker:[1,"matTimepicker","timepicker"],min:[1,"matTimepickerMin","min"],max:[1,"matTimepickerMax","max"],openOnClick:[1,"matTimepickerOpenOnClick","openOnClick"],disabledInput:[1,"disabled","disabledInput"]},outputs:{value:"valueChange"},exportAs:["matTimepickerInput"],features:[BE([{provide:bt,useExisting:i,multi:true},{provide:yt,useExisting:i,multi:true},{provide:zn,useExisting:i}])]})}return i})(),Bi=(()=>{class i{_defaultConfig=C($r,{optional:true});_defaultTabIndex=(()=>{let e=C(new Ap("tabindex"),{optional:true}),t=Number(e);return isNaN(t)?null:t})();_isDisabled=JE(()=>{let e=this.timepicker();return this.disabled()||e.disabled()});timepicker=LP.required({alias:"for"});ariaLabel=LP(void 0,{alias:"aria-label"});ariaLabelledby=LP(void 0,{alias:"aria-labelledby"});_defaultAriaLabel="Open timepicker options";disabled=LP(false,{transform:qP,alias:"disabled"});tabIndex=LP(this._defaultTabIndex);disableRipple=LP(this._defaultConfig?.disableRipple??false,{transform:qP});_open(e){this.timepicker()&&!this._isDisabled()&&(this.timepicker().open(),e.stopPropagation());}getAriaLabel(){return this.ariaLabelledby()?null:this.ariaLabel()||this._defaultAriaLabel}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-timepicker-toggle"]],hostAttrs:[1,"mat-timepicker-toggle"],hostVars:1,hostBindings:function(t,a){t&1&&tp("click",function(o){return a._open(o)}),t&2&&zf("tabindex",null);},inputs:{timepicker:[1,"for","timepicker"],ariaLabel:[1,"aria-label","ariaLabel"],ariaLabelledby:[1,"aria-labelledby","ariaLabelledby"],disabled:[1,"disabled"],tabIndex:[1,"tabIndex"],disableRipple:[1,"disableRipple"]},exportAs:["matTimepickerToggle"],ngContentSelectors:sl,decls:3,vars:6,consts:[["matIconButton","","type","button","aria-haspopup","listbox",3,"tabIndex","disabled","disableRipple"],["height","24px","width","24px","viewBox","0 -960 960 960","fill","currentColor","focusable","false","aria-hidden","true",1,"mat-timepicker-toggle-default-icon"],["d","m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"]],template:function(t,a){t&1&&(rE(ol),ii(0,"button",0),oE(1,0,null,ll,2,0),gc()),t&2&&(Qf("tabIndex",a._isDisabled()?-1:a.tabIndex())("disabled",a._isDisabled())("disableRipple",a.disableRipple()),zf("aria-label",a.getAriaLabel())("aria-labelledby",a.ariaLabelledby())("aria-expanded",a.timepicker().isOpen()));},dependencies:[Je$1],encapsulation:2})}return i})(),Kr=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({imports:[Li,Bi,Wt$1]})}return i})();var zi={car:["car"],scooter:["scooter","ev"]};function Hn(i){return i&&i in zi?i:void 0}var Zr=["\u6A5F\u5834","\u6E2F\u53E3","\u5E97\u8216"],It="\u6A5F\u5834";function pl(i,n){return this._trackRow(n)}var io=(i,n)=>n.id;function hl(i,n){if(i&1&&(mc(0,"tr",0)(1,"td",3),AE(2),yc()()),i&2){let e=tE();Fy(),up$1("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),zf("colspan",e.numCols),Fy(),Ec(" ",e.label," ");}}function fl(i,n){if(i&1&&(mc(0,"td",3),AE(1),yc()),i&2){let e=tE(2);up$1("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),zf("colspan",e._firstRowOffset),Fy(),Ec(" ",e._firstRowOffset>=e.labelMinRequiredCells?e.label:""," ");}}function _l(i,n){if(i&1){let e=QI();mc(0,"td",6)(1,"button",7),np("click",function(a){let r=$l$1(e).$implicit,o=tE(2);return Ul$1(o._cellClicked(r,a))})("focus",function(a){let r=$l$1(e).$implicit,o=tE(2);return Ul$1(o._emitActiveDateChange(r,a))}),mc(2,"span",8),AE(3),yc(),Yf(4,"span",9),yc()();}if(i&2){let e=n.$implicit,t=n.$index,a=tE().$index,r=tE();up$1("width",r._cellWidth)("padding-top",r._cellPadding)("padding-bottom",r._cellPadding),zf("data-mat-row",a)("data-mat-col",t),Fy(),EE(e.cssClasses),dp$1("mat-calendar-body-disabled",!e.enabled)("mat-calendar-body-active",r._isActiveCell(a,t))("mat-calendar-body-range-start",r._isRangeStart(e.compareValue))("mat-calendar-body-range-end",r._isRangeEnd(e.compareValue))("mat-calendar-body-in-range",r._isInRange(e.compareValue))("mat-calendar-body-comparison-bridge-start",r._isComparisonBridgeStart(e.compareValue,a,t))("mat-calendar-body-comparison-bridge-end",r._isComparisonBridgeEnd(e.compareValue,a,t))("mat-calendar-body-comparison-start",r._isComparisonStart(e.compareValue))("mat-calendar-body-comparison-end",r._isComparisonEnd(e.compareValue))("mat-calendar-body-in-comparison-range",r._isInComparisonRange(e.compareValue))("mat-calendar-body-preview-start",r._isPreviewStart(e.compareValue))("mat-calendar-body-preview-end",r._isPreviewEnd(e.compareValue))("mat-calendar-body-in-preview",r._isInPreview(e.compareValue)),Xf("tabIndex",r._isActiveCell(a,t)?0:-1),zf("aria-label",e.ariaLabel)("aria-disabled",!e.enabled||null)("aria-pressed",r._isSelected(e.compareValue))("aria-current",r.todayValue===e.compareValue?"date":null)("aria-describedby",r._getDescribedby(e.compareValue)),Fy(),dp$1("mat-calendar-body-selected",r._isSelected(e.compareValue))("mat-calendar-body-comparison-identical",r._isComparisonIdentical(e.compareValue))("mat-calendar-body-today",r.todayValue===e.compareValue),Fy(),Ec(" ",e.displayValue," ");}}function gl(i,n){if(i&1&&(mc(0,"tr",1),jI(1,fl,2,6,"td",4),BI(2,_l,5,49,"td",5,io),yc()),i&2){let e=n.$implicit,t=n.$index,a=tE();Fy(),VI(t===0&&a._firstRowOffset?1:-1),Fy(),$I(e);}}function vl(i,n){if(i&1&&(ii(0,"th",2)(1,"span",6),AE(2),gc(),ii(3,"span",3),AE(4),gc()()),i&2){let e=n.$implicit;Fy(2),yp(e.long),Fy(2),yp(e.narrow);}}var bl=["*"];function yl(i,n){}function Cl(i,n){if(i&1){let e=QI();ii(0,"mat-month-view",4),wp("activeDateChange",function(a){$l$1(e);let r=tE();return FE(r.activeDate,a)||(r.activeDate=a),Ul$1(a)}),tp("_userSelection",function(a){$l$1(e);let r=tE();return Ul$1(r._dateSelected(a))})("dragStarted",function(a){$l$1(e);let r=tE();return Ul$1(r._dragStarted(a))})("dragEnded",function(a){$l$1(e);let r=tE();return Ul$1(r._dragEnded(a))}),gc();}if(i&2){let e=tE();Dp("activeDate",e.activeDate),Qf("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)("comparisonStart",e.comparisonStart)("comparisonEnd",e.comparisonEnd)("startDateAccessibleName",e.startDateAccessibleName)("endDateAccessibleName",e.endDateAccessibleName)("activeDrag",e._activeDrag);}}function Dl(i,n){if(i&1){let e=QI();ii(0,"mat-year-view",5),wp("activeDateChange",function(a){$l$1(e);let r=tE();return FE(r.activeDate,a)||(r.activeDate=a),Ul$1(a)}),tp("monthSelected",function(a){$l$1(e);let r=tE();return Ul$1(r._monthSelectedInYearView(a))})("selectedChange",function(a){$l$1(e);let r=tE();return Ul$1(r._goToDateInView(a,"month"))}),gc();}if(i&2){let e=tE();Dp("activeDate",e.activeDate),Qf("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass);}}function xl(i,n){if(i&1){let e=QI();ii(0,"mat-multi-year-view",6),wp("activeDateChange",function(a){$l$1(e);let r=tE();return FE(r.activeDate,a)||(r.activeDate=a),Ul$1(a)}),tp("yearSelected",function(a){$l$1(e);let r=tE();return Ul$1(r._yearSelectedInMultiYearView(a))})("selectedChange",function(a){$l$1(e);let r=tE();return Ul$1(r._goToDateInView(a,"year"))}),gc();}if(i&2){let e=tE();Dp("activeDate",e.activeDate),Qf("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass);}}function Ml(i,n){}var wl=["button"],kl=[[["","matDatepickerToggleIcon",""]]],El=["[matDatepickerToggleIcon]"];function Al(i,n){i&1&&(tu(),ii(0,"svg",2),Zf(1,"path",3),gc());}var Rt=(()=>{class i{changes=new ee$1;calendarLabel="Calendar";openCalendarLabel="Open calendar";closeCalendarLabel="Close calendar";prevMonthLabel="Previous month";nextMonthLabel="Next month";prevYearLabel="Previous year";nextYearLabel="Next year";prevMultiYearLabel="Previous 24 years";nextMultiYearLabel="Next 24 years";switchToMonthViewLabel="Choose date";switchToMultiYearViewLabel="Choose month and year";startDateLabel="Start date";endDateLabel="End date";comparisonDateLabel="Comparison range";formatYearRange(e,t){return `${e} \u2013 ${t}`}formatYearRangeLabel(e,t){return `${e} to ${t}`}static \u0275fac=function(t){return new(t||i)};static \u0275prov=sr$1({token:i,factory:i.\u0275fac})}return i})(),Sl=0,on=class{value;displayValue;ariaLabel;enabled;compareValue;rawValue;id=Sl++;cssClasses;constructor(n,e,t,a,r,o=n,g){this.value=n,this.displayValue=e,this.ariaLabel=t,this.enabled=a,this.compareValue=o,this.rawValue=g,this.cssClasses=r instanceof Set?Array.from(r):r;}},Vl={passive:false,capture:true},jn={passive:true,capture:true},Xr={passive:true},Tt=(()=>{class i{_elementRef=C(ar$1);_ngZone=C(be);_platform=C(P);_intl=C(Rt);_eventCleanups;_skipNextFocus=false;_focusActiveCellAfterViewChecked=false;label;rows;todayValue;startValue;endValue;labelMinRequiredCells;numCols=7;activeCell=0;ngAfterViewChecked(){this._focusActiveCellAfterViewChecked&&(this._focusActiveCell(),this._focusActiveCellAfterViewChecked=false);}isRange=false;cellAspectRatio=1;comparisonStart=null;comparisonEnd=null;previewStart=null;previewEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedValueChange=new Fe;previewChange=new Fe;activeDateChange=new Fe;dragStarted=new Fe;dragEnded=new Fe;_firstRowOffset;_cellPadding;_cellWidth;_startDateLabelId;_endDateLabelId;_comparisonStartDateLabelId;_comparisonEndDateLabelId;_didDragSinceMouseDown=false;_injector=C(he$1);comparisonDateAccessibleName=this._intl.comparisonDateLabel;_trackRow=e=>e;constructor(){let e=C(Dv),t=C(di);this._startDateLabelId=t.getId("mat-calendar-body-start-"),this._endDateLabelId=t.getId("mat-calendar-body-end-"),this._comparisonStartDateLabelId=t.getId("mat-calendar-body-comparison-start-"),this._comparisonEndDateLabelId=t.getId("mat-calendar-body-comparison-end-"),C(ke).load(Um),this._ngZone.runOutsideAngular(()=>{let a=this._elementRef.nativeElement,r=[e.listen(a,"touchmove",this._touchmoveHandler,Vl),e.listen(a,"mouseenter",this._enterHandler,jn),e.listen(a,"focus",this._enterHandler,jn),e.listen(a,"mouseleave",this._leaveHandler,jn),e.listen(a,"blur",this._leaveHandler,jn),e.listen(a,"mousedown",this._mousedownHandler,Xr),e.listen(a,"touchstart",this._mousedownHandler,Xr)];this._platform.isBrowser&&r.push(e.listen("window","mouseup",this._mouseupHandler),e.listen("window","touchend",this._touchendHandler)),this._eventCleanups=r;});}_cellClicked(e,t){this._didDragSinceMouseDown||e.enabled&&this.selectedValueChange.emit({value:e.value,event:t});}_emitActiveDateChange(e,t){e.enabled&&this.activeDateChange.emit({value:e.value,event:t});}_isSelected(e){return this.startValue===e||this.endValue===e}ngOnChanges(e){let t=e.numCols,{rows:a,numCols:r}=this;(e.rows||t)&&(this._firstRowOffset=a&&a.length&&a[0].length?r-a[0].length:0),(e.cellAspectRatio||t||!this._cellPadding)&&(this._cellPadding=`${50*this.cellAspectRatio/r}%`),(t||!this._cellWidth)&&(this._cellWidth=`${100/r}%`);}ngOnDestroy(){this._eventCleanups.forEach(e=>e());}_isActiveCell(e,t){let a=e*this.numCols+t;return e&&(a-=this._firstRowOffset),a==this.activeCell}_focusActiveCell(e=true){py(()=>{setTimeout(()=>{let t=this._elementRef.nativeElement.querySelector(".mat-calendar-body-active");t&&(e||(this._skipNextFocus=true),t.focus());});},{injector:this._injector});}_scheduleFocusActiveCellAfterViewChecked(){this._focusActiveCellAfterViewChecked=true;}_isRangeStart(e){return Gi(e,this.startValue,this.endValue)}_isRangeEnd(e){return qi(e,this.startValue,this.endValue)}_isInRange(e){return Yi(e,this.startValue,this.endValue,this.isRange)}_isComparisonStart(e){return Gi(e,this.comparisonStart,this.comparisonEnd)}_isComparisonBridgeStart(e,t,a){if(!this._isComparisonStart(e)||this._isRangeStart(e)||!this._isInRange(e))return  false;let r=this.rows[t][a-1];if(!r){let o=this.rows[t-1];r=o&&o[o.length-1];}return r&&!this._isRangeEnd(r.compareValue)}_isComparisonBridgeEnd(e,t,a){if(!this._isComparisonEnd(e)||this._isRangeEnd(e)||!this._isInRange(e))return  false;let r=this.rows[t][a+1];if(!r){let o=this.rows[t+1];r=o&&o[0];}return r&&!this._isRangeStart(r.compareValue)}_isComparisonEnd(e){return qi(e,this.comparisonStart,this.comparisonEnd)}_isInComparisonRange(e){return Yi(e,this.comparisonStart,this.comparisonEnd,this.isRange)}_isComparisonIdentical(e){return this.comparisonStart===this.comparisonEnd&&e===this.comparisonStart}_isPreviewStart(e){return Gi(e,this.previewStart,this.previewEnd)}_isPreviewEnd(e){return qi(e,this.previewStart,this.previewEnd)}_isInPreview(e){return Yi(e,this.previewStart,this.previewEnd,this.isRange)}_getDescribedby(e){if(!this.isRange)return null;if(this.startValue===e&&this.endValue===e)return `${this._startDateLabelId} ${this._endDateLabelId}`;if(this.startValue===e)return this._startDateLabelId;if(this.endValue===e)return this._endDateLabelId;if(this.comparisonStart!==null&&this.comparisonEnd!==null){if(e===this.comparisonStart&&e===this.comparisonEnd)return `${this._comparisonStartDateLabelId} ${this._comparisonEndDateLabelId}`;if(e===this.comparisonStart)return this._comparisonStartDateLabelId;if(e===this.comparisonEnd)return this._comparisonEndDateLabelId}return null}_enterHandler=e=>{if(this._skipNextFocus&&e.type==="focus"){this._skipNextFocus=false;return}if(e.target&&this.isRange){let t=this._getCellFromElement(e.target);t&&this._ngZone.run(()=>this.previewChange.emit({value:t.enabled?t:null,event:e}));}};_touchmoveHandler=e=>{if(!this.isRange)return;let t=Jr(e),a=t?this._getCellFromElement(t):null;t!==e.target&&(this._didDragSinceMouseDown=true),ji(e.target)&&e.preventDefault(),this._ngZone.run(()=>this.previewChange.emit({value:a?.enabled?a:null,event:e}));};_leaveHandler=e=>{this.previewEnd!==null&&this.isRange&&(e.type!=="blur"&&(this._didDragSinceMouseDown=true),e.target&&this._getCellFromElement(e.target)&&!(e.relatedTarget&&this._getCellFromElement(e.relatedTarget))&&this._ngZone.run(()=>this.previewChange.emit({value:null,event:e})));};_mousedownHandler=e=>{if(!this.isRange)return;this._didDragSinceMouseDown=false;let t=e.target&&this._getCellFromElement(e.target);!t||!this._isInRange(t.compareValue)||this._ngZone.run(()=>{this.dragStarted.emit({value:t.rawValue,event:e});});};_mouseupHandler=e=>{if(!this.isRange)return;let t=ji(e.target);if(!t){this._ngZone.run(()=>{this.dragEnded.emit({value:null,event:e});});return}t.closest(".mat-calendar-body")===this._elementRef.nativeElement&&this._ngZone.run(()=>{let a=this._getCellFromElement(t);this.dragEnded.emit({value:a?.rawValue??null,event:e});});};_touchendHandler=e=>{let t=Jr(e);t&&this._mouseupHandler({target:t});};_getCellFromElement(e){let t=ji(e);if(t){let a=t.getAttribute("data-mat-row"),r=t.getAttribute("data-mat-col");if(a&&r)return this.rows[parseInt(a)]?.[parseInt(r)]||null}return null}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["","mat-calendar-body",""]],hostAttrs:[1,"mat-calendar-body"],inputs:{label:"label",rows:"rows",todayValue:"todayValue",startValue:"startValue",endValue:"endValue",labelMinRequiredCells:"labelMinRequiredCells",numCols:"numCols",activeCell:"activeCell",isRange:"isRange",cellAspectRatio:"cellAspectRatio",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",previewStart:"previewStart",previewEnd:"previewEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedValueChange:"selectedValueChange",previewChange:"previewChange",activeDateChange:"activeDateChange",dragStarted:"dragStarted",dragEnded:"dragEnded"},exportAs:["matCalendarBody"],features:[jg],decls:11,vars:11,consts:[["aria-hidden","true"],["role","row"],[1,"mat-calendar-body-hidden-label",3,"id"],[1,"mat-calendar-body-label"],[1,"mat-calendar-body-label",3,"paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container",3,"width","paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container"],["type","button",1,"mat-calendar-body-cell",3,"click","focus","tabindex"],[1,"mat-calendar-body-cell-content","mat-focus-indicator"],["aria-hidden","true",1,"mat-calendar-body-cell-preview"]],template:function(t,a){t&1&&(jI(0,hl,3,6,"tr",0),BI(1,gl,4,1,"tr",1,pl,true),mc(3,"span",2),AE(4),yc(),mc(5,"span",2),AE(6),yc(),mc(7,"span",2),AE(8),yc(),mc(9,"span",2),AE(10),yc()),t&2&&(VI(a._firstRowOffset<a.labelMinRequiredCells?0:-1),Fy(),$I(a.rows),Fy(2),Xf("id",a._startDateLabelId),Fy(),Ec(" ",a.startDateAccessibleName,`
`),Fy(),Xf("id",a._endDateLabelId),Fy(),Ec(" ",a.endDateAccessibleName,`
`),Fy(),Xf("id",a._comparisonStartDateLabelId),Fy(),vp(" ",a.comparisonDateAccessibleName," ",a.startDateAccessibleName,`
`),Fy(),Xf("id",a._comparisonEndDateLabelId),Fy(),vp(" ",a.comparisonDateAccessibleName," ",a.endDateAccessibleName,`
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
`],encapsulation:2})}return i})();function Hi(i){return i?.nodeName==="TD"}function ji(i){let n;return Hi(i)?n=i:Hi(i.parentNode)?n=i.parentNode:Hi(i.parentNode?.parentNode)&&(n=i.parentNode.parentNode),n?.getAttribute("data-mat-row")!=null?n:null}function Gi(i,n,e){return e!==null&&n!==e&&i<e&&i===n}function qi(i,n,e){return n!==null&&n!==e&&i>=n&&i===e}function Yi(i,n,e,t){return t&&n!==null&&e!==null&&n!==e&&i>=n&&i<=e}function Jr(i){let n=i.changedTouches[0];return document.elementFromPoint(n.clientX,n.clientY)}var ae=class{start;end;_disableStructuralEquivalency;constructor(n,e){this.start=n,this.end=e;}},Gn=(()=>{class i{selection;_adapter;_selectionChanged=new ee$1;selectionChanged=this._selectionChanged;constructor(e,t){this.selection=e,this._adapter=t,this.selection=e;}updateSelection(e,t){let a=this.selection;this.selection=e,this._selectionChanged.next({selection:e,source:t,oldValue:a});}ngOnDestroy(){this._selectionChanged.complete();}_isValidDateInstance(e){return this._adapter.isDateInstance(e)&&this._adapter.isValid(e)}static \u0275fac=function(t){Ov();};static \u0275prov=ge$1({token:i,factory:i.\u0275fac})}return i})(),Ol=(()=>{class i extends Gn{constructor(e){super(null,e);}add(e){super.updateSelection(e,this);}isValid(){return this.selection!=null&&this._isValidDateInstance(this.selection)}isComplete(){return this.selection!=null}clone(){let e=new i(this._adapter);return e.updateSelection(this.selection,this),e}static \u0275fac=function(t){return new(t||i)(Ce(ee))};static \u0275prov=ge$1({token:i,factory:i.\u0275fac})}return i})();var Fl={provide:Gn,useFactory:()=>C(Gn,{optional:true,skipSelf:true})||new Ol(C(ee))};var ao=new x("MAT_DATE_RANGE_SELECTION_STRATEGY");var Ui=7,Il=0,eo=(()=>{class i{_changeDetectorRef=C(UP);_dateFormats=C(Ne$1,{optional:true});_dateAdapter=C(ee,{optional:true});_dir=C(tl,{optional:true});_rangeStrategy=C(ao,{optional:true});_rerenderSubscription=q.EMPTY;_selectionKeyPressed=false;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),this._hasSameMonthAndYear(t,this._activeDate)||this._init();}_activeDate;get selected(){return this._selected}set selected(e){e instanceof ae?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setRanges(this._selected);}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;activeDrag=null;selectedChange=new Fe;_userSelection=new Fe;dragStarted=new Fe;dragEnded=new Fe;activeDateChange=new Fe;_matCalendarBody;_monthLabel=Mo$1("");_weeks=Mo$1([]);_firstWeekOffset=Mo$1(0);_rangeStart=Mo$1(null);_rangeEnd=Mo$1(null);_comparisonRangeStart=Mo$1(null);_comparisonRangeEnd=Mo$1(null);_previewStart=Mo$1(null);_previewEnd=Mo$1(null);_isRange=Mo$1(false);_todayDate=Mo$1(null);_weekdays=Mo$1([]);constructor(){C(ke).load($n$2),this._activeDate=this._dateAdapter.today();}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Nh(null)).subscribe(()=>this._init());}ngOnChanges(e){let t=e.comparisonStart||e.comparisonEnd;t&&!t.firstChange&&this._setRanges(this.selected),e.activeDrag&&!this.activeDrag&&this._clearPreview();}ngOnDestroy(){this._rerenderSubscription.unsubscribe();}_dateSelected(e){let t=e.value,a=this._getDateFromDayOfMonth(t),r,o;this._selected instanceof ae?(r=this._getDateInCurrentMonth(this._selected.start),o=this._getDateInCurrentMonth(this._selected.end)):r=o=this._getDateInCurrentMonth(this._selected),(r!==t||o!==t)&&this.selectedChange.emit(a),this._userSelection.emit({value:a,event:e.event}),this._clearPreview(),this._changeDetectorRef.markForCheck();}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromDayOfMonth(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this._activeDate);}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,-7);break;case 40:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,7);break;case 36:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,1-this._dateAdapter.getDate(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,this._dateAdapter.getNumDaysInMonth(this._activeDate)-this._dateAdapter.getDate(this._activeDate));break;case 33:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,-1):this._dateAdapter.addCalendarMonths(this._activeDate,-1);break;case 34:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,1):this._dateAdapter.addCalendarMonths(this._activeDate,1);break;case 13:case 32:this._selectionKeyPressed=true,this._canSelect(this._activeDate)&&e.preventDefault();return;case 27:this._previewEnd()!=null&&!ks$1(e)&&(this._clearPreview(),this.activeDrag?this.dragEnded.emit({value:null,event:e}):(this.selectedChange.emit(null),this._userSelection.emit({value:null,event:e})),e.preventDefault(),e.stopPropagation());return;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault();}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._canSelect(this._activeDate)&&this._dateSelected({value:this._dateAdapter.getDate(this._activeDate),event:e}),this._selectionKeyPressed=false);}_init(){this._setRanges(this.selected),this._todayDate.set(this._getCellCompareValue(this._dateAdapter.today())),this._monthLabel.set(this._dateFormats.display.monthLabel?this._dateAdapter.format(this.activeDate,this._dateFormats.display.monthLabel):this._dateAdapter.getMonthNames("short")[this._dateAdapter.getMonth(this.activeDate)].toLocaleUpperCase());let e=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),1);this._firstWeekOffset.set((Ui+this._dateAdapter.getDayOfWeek(e)-this._dateAdapter.getFirstDayOfWeek())%Ui),this._initWeekdays(),this._createWeekCells(),this._changeDetectorRef.markForCheck();}_focusActiveCell(e){this._matCalendarBody._focusActiveCell(e);}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked();}_previewChanged({event:e,value:t}){if(this._rangeStrategy){let a=t?t.rawValue:null,r=this._rangeStrategy.createPreview(a,this.selected,e);if(this._previewStart.set(this._getCellCompareValue(r.start)),this._previewEnd.set(this._getCellCompareValue(r.end)),this.activeDrag&&a){let o=this._rangeStrategy.createDrag?.(this.activeDrag.value,this.selected,a,e);o&&(this._previewStart.set(this._getCellCompareValue(o.start)),this._previewEnd.set(this._getCellCompareValue(o.end)));}}}_dragEnded(e){if(this.activeDrag)if(e.value){let t=this._rangeStrategy?.createDrag?.(this.activeDrag.value,this.selected,e.value,e.event);this.dragEnded.emit({value:t??null,event:e.event});}else this.dragEnded.emit({value:null,event:e.event});}_getDateFromDayOfMonth(e){return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),e)}_initWeekdays(){let e=this._dateAdapter.getFirstDayOfWeek(),t=this._dateAdapter.getDayOfWeekNames("narrow"),r=this._dateAdapter.getDayOfWeekNames("long").map((o,g)=>({long:o,narrow:t[g],id:Il++}));this._weekdays.set(r.slice(e).concat(r.slice(0,e)));}_createWeekCells(){let e=this._dateAdapter.getNumDaysInMonth(this.activeDate),t=this._dateAdapter.getDateNames(),a=[[]];for(let r=0,o=this._firstWeekOffset();r<e;r++,o++){o==Ui&&(a.push([]),o=0);let g=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),r+1),S=this._shouldEnableDate(g),L=this._dateAdapter.format(g,this._dateFormats.display.dateA11yLabel),ze=this.dateClass?this.dateClass(g,"month"):void 0;a[a.length-1].push(new on(r+1,t[r],L,S,ze,this._getCellCompareValue(g),g));}this._weeks.set(a);}_shouldEnableDate(e){return !!e&&(!this.minDate||this._dateAdapter.compareDate(e,this.minDate)>=0)&&(!this.maxDate||this._dateAdapter.compareDate(e,this.maxDate)<=0)&&(!this.dateFilter||this.dateFilter(e))}_getDateInCurrentMonth(e){return e&&this._hasSameMonthAndYear(e,this.activeDate)?this._dateAdapter.getDate(e):null}_hasSameMonthAndYear(e,t){return !!(e&&t&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(t)&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t))}_getCellCompareValue(e){if(e){let t=this._dateAdapter.getYear(e),a=this._dateAdapter.getMonth(e),r=this._dateAdapter.getDate(e);return new Date(t,a,r).getTime()}return null}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setRanges(e){e instanceof ae?(this._rangeStart.set(this._getCellCompareValue(e.start)),this._rangeEnd.set(this._getCellCompareValue(e.end)),this._isRange.set(true)):(this._rangeStart.set(this._getCellCompareValue(e)),this._rangeEnd.set(this._rangeStart()),this._isRange.set(false)),this._comparisonRangeStart.set(this._getCellCompareValue(this.comparisonStart)),this._comparisonRangeEnd.set(this._getCellCompareValue(this.comparisonEnd));}_canSelect(e){return !this.dateFilter||this.dateFilter(e)}_clearPreview(){this._previewStart.set(null),this._previewEnd.set(null);}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-month-view"]],viewQuery:function(t,a){if(t&1&&ip(Tt,5),t&2){let r;sE(r=aE())&&(a._matCalendarBody=r.first);}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName",activeDrag:"activeDrag"},outputs:{selectedChange:"selectedChange",_userSelection:"_userSelection",dragStarted:"dragStarted",dragEnded:"dragEnded",activeDateChange:"activeDateChange"},exportAs:["matMonthView"],features:[jg],decls:8,vars:14,consts:[["role","grid",1,"mat-calendar-table"],[1,"mat-calendar-table-header"],["scope","col"],["aria-hidden","true"],["colspan","7",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","previewChange","dragStarted","dragEnded","keyup","keydown","label","rows","todayValue","startValue","endValue","comparisonStart","comparisonEnd","previewStart","previewEnd","isRange","labelMinRequiredCells","activeCell","startDateAccessibleName","endDateAccessibleName"],[1,"cdk-visually-hidden"]],template:function(t,a){t&1&&(ii(0,"table",0)(1,"thead",1)(2,"tr"),BI(3,vl,5,2,"th",2,io),gc(),ii(5,"tr",3),Zf(6,"th",4),gc()(),ii(7,"tbody",5),tp("selectedValueChange",function(o){return a._dateSelected(o)})("activeDateChange",function(o){return a._updateActiveDate(o)})("previewChange",function(o){return a._previewChanged(o)})("dragStarted",function(o){return a.dragStarted.emit(o)})("dragEnded",function(o){return a._dragEnded(o)})("keyup",function(o){return a._handleCalendarBodyKeyup(o)})("keydown",function(o){return a._handleCalendarBodyKeydown(o)}),gc()()),t&2&&(Fy(3),$I(a._weekdays()),Fy(4),Qf("label",a._monthLabel())("rows",a._weeks())("todayValue",a._todayDate())("startValue",a._rangeStart())("endValue",a._rangeEnd())("comparisonStart",a._comparisonRangeStart())("comparisonEnd",a._comparisonRangeEnd())("previewStart",a._previewStart())("previewEnd",a._previewEnd())("isRange",a._isRange())("labelMinRequiredCells",3)("activeCell",a._dateAdapter.getDate(a.activeDate)-1)("startDateAccessibleName",a.startDateAccessibleName)("endDateAccessibleName",a.endDateAccessibleName));},dependencies:[Tt],encapsulation:2})}return i})(),he=24,Wi=4,to=(()=>{class i{_changeDetectorRef=C(UP);_dateAdapter=C(ee,{optional:true});_dir=C(tl,{optional:true});_rerenderSubscription=q.EMPTY;_selectionKeyPressed=false;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),ro(this._dateAdapter,t,this._activeDate,this.minDate,this.maxDate)||this._init();}_activeDate;get selected(){return this._selected}set selected(e){e instanceof ae?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedYear(e);}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_maxDate=null;dateFilter;dateClass;selectedChange=new Fe;yearSelected=new Fe;activeDateChange=new Fe;_matCalendarBody;_years=Mo$1([]);_todayYear=Mo$1(0);_selectedYear=Mo$1(null);constructor(){this._dateAdapter,this._activeDate=this._dateAdapter.today();}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Nh(null)).subscribe(()=>this._init());}ngOnDestroy(){this._rerenderSubscription.unsubscribe();}_init(){this._todayYear.set(this._dateAdapter.getYear(this._dateAdapter.today()));let t=this._dateAdapter.getYear(this._activeDate)-rn(this._dateAdapter,this.activeDate,this.minDate,this.maxDate),a=[];for(let r=0,o=[];r<he;r++)o.push(t+r),o.length==Wi&&(a.push(o.map(g=>this._createCellForYear(g))),o=[]);this._years.set(a),this._changeDetectorRef.markForCheck();}_yearSelected(e){let t=e.value,a=this._dateAdapter.createDate(t,0,1),r=this._getDateFromYear(t);this.yearSelected.emit(a),this.selectedChange.emit(r);}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromYear(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this.activeDate);}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-Wi);break;case 40:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,Wi);break;case 36:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-rn(this._dateAdapter,this.activeDate,this.minDate,this.maxDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,he-rn(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)-1);break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-he*10:-he);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?he*10:he);break;case 13:case 32:this._selectionKeyPressed=true;break;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked(),e.preventDefault();}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._yearSelected({value:this._dateAdapter.getYear(this._activeDate),event:e}),this._selectionKeyPressed=false);}_getActiveCell(){return rn(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)}_focusActiveCell(){this._matCalendarBody._focusActiveCell();}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked();}_getDateFromYear(e){let t=this._dateAdapter.getMonth(this.activeDate),a=this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(e,t,1));return this._dateAdapter.createDate(e,t,Math.min(this._dateAdapter.getDate(this.activeDate),a))}_createCellForYear(e){let t=this._dateAdapter.createDate(e,0,1),a=this._dateAdapter.getYearName(t),r=this.dateClass?this.dateClass(t,"multi-year"):void 0;return new on(e,a,a,this._shouldEnableYear(e),r)}_shouldEnableYear(e){if(e==null||this.maxDate&&e>this._dateAdapter.getYear(this.maxDate)||this.minDate&&e<this._dateAdapter.getYear(this.minDate))return  false;if(!this.dateFilter)return  true;let t=this._dateAdapter.createDate(e,0,1);for(let a=t;this._dateAdapter.getYear(a)==e;a=this._dateAdapter.addCalendarDays(a,1))if(this.dateFilter(a))return  true;return  false}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedYear(e){if(this._selectedYear.set(null),e instanceof ae){let t=e.start||e.end;t&&this._selectedYear.set(this._dateAdapter.getYear(t));}else e&&this._selectedYear.set(this._dateAdapter.getYear(e));}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-multi-year-view"]],viewQuery:function(t,a){if(t&1&&ip(Tt,5),t&2){let r;sE(r=aE())&&(a._matCalendarBody=r.first);}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",activeDateChange:"activeDateChange"},exportAs:["matMultiYearView"],decls:5,vars:7,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","rows","todayValue","startValue","endValue","numCols","cellAspectRatio","activeCell"]],template:function(t,a){t&1&&(ii(0,"table",0)(1,"thead",1)(2,"tr"),Zf(3,"th",2),gc()(),ii(4,"tbody",3),tp("selectedValueChange",function(o){return a._yearSelected(o)})("activeDateChange",function(o){return a._updateActiveDate(o)})("keyup",function(o){return a._handleCalendarBodyKeyup(o)})("keydown",function(o){return a._handleCalendarBodyKeydown(o)}),gc()()),t&2&&(Fy(4),Qf("rows",a._years())("todayValue",a._todayYear())("startValue",a._selectedYear())("endValue",a._selectedYear())("numCols",4)("cellAspectRatio",4/7)("activeCell",a._getActiveCell()));},dependencies:[Tt],encapsulation:2})}return i})();function ro(i,n,e,t,a){let r=i.getYear(n),o=i.getYear(e),g=oo(i,t,a);return Math.floor((r-g)/he)===Math.floor((o-g)/he)}function rn(i,n,e,t){let a=i.getYear(n);return Tl(a-oo(i,e,t),he)}function oo(i,n,e){let t=0;return e?t=i.getYear(e)-he+1:n&&(t=i.getYear(n)),t}function Tl(i,n){return (i%n+n)%n}var no=(()=>{class i{_changeDetectorRef=C(UP);_dateFormats=C(Ne$1,{optional:true});_dateAdapter=C(ee,{optional:true});_dir=C(tl,{optional:true});_rerenderSubscription=q.EMPTY;_selectionKeyPressed=false;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),this._dateAdapter.getYear(t)!==this._dateAdapter.getYear(this._activeDate)&&this._init();}_activeDate;get selected(){return this._selected}set selected(e){e instanceof ae?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedMonth(e);}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_maxDate=null;dateFilter;dateClass;selectedChange=new Fe;monthSelected=new Fe;activeDateChange=new Fe;_matCalendarBody;_months=Mo$1([]);_yearLabel=Mo$1("");_todayMonth=Mo$1(null);_selectedMonth=Mo$1(null);constructor(){this._activeDate=this._dateAdapter.today();}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Nh(null)).subscribe(()=>this._init());}ngOnDestroy(){this._rerenderSubscription.unsubscribe();}_monthSelected(e){let t=e.value,a=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),t,1);this.monthSelected.emit(a);let r=this._getDateFromMonth(t);this.selectedChange.emit(r);}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromMonth(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this.activeDate);}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-4);break;case 40:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,4);break;case 36:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-this._dateAdapter.getMonth(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,11-this._dateAdapter.getMonth(this._activeDate));break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-10:-1);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?10:1);break;case 13:case 32:this._selectionKeyPressed=true;break;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault();}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._monthSelected({value:this._dateAdapter.getMonth(this._activeDate),event:e}),this._selectionKeyPressed=false);}_init(){this._setSelectedMonth(this.selected),this._todayMonth.set(this._getMonthInCurrentYear(this._dateAdapter.today())),this._yearLabel.set(this._dateAdapter.getYearName(this.activeDate));let e=this._dateAdapter.getMonthNames("short");this._months.set([[0,1,2,3],[4,5,6,7],[8,9,10,11]].map(t=>t.map(a=>this._createCellForMonth(a,e[a])))),this._changeDetectorRef.markForCheck();}_focusActiveCell(){this._matCalendarBody._focusActiveCell();}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked();}_getMonthInCurrentYear(e){return e&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(this.activeDate)?this._dateAdapter.getMonth(e):null}_getDateFromMonth(e){let t=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),a=this._dateAdapter.getNumDaysInMonth(t);return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,Math.min(this._dateAdapter.getDate(this.activeDate),a))}_createCellForMonth(e,t){let a=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),r=this._dateAdapter.format(a,this._dateFormats.display.monthYearA11yLabel),o=this.dateClass?this.dateClass(a,"year"):void 0;return new on(e,t.toLocaleUpperCase(),r,this._shouldEnableMonth(e),o)}_shouldEnableMonth(e){let t=this._dateAdapter.getYear(this.activeDate);if(e==null||this._isYearAndMonthAfterMaxDate(t,e)||this._isYearAndMonthBeforeMinDate(t,e))return  false;if(!this.dateFilter)return  true;let a=this._dateAdapter.createDate(t,e,1);for(let r=a;this._dateAdapter.getMonth(r)==e;r=this._dateAdapter.addCalendarDays(r,1))if(this.dateFilter(r))return  true;return  false}_isYearAndMonthAfterMaxDate(e,t){if(this.maxDate){let a=this._dateAdapter.getYear(this.maxDate),r=this._dateAdapter.getMonth(this.maxDate);return e>a||e===a&&t>r}return  false}_isYearAndMonthBeforeMinDate(e,t){if(this.minDate){let a=this._dateAdapter.getYear(this.minDate),r=this._dateAdapter.getMonth(this.minDate);return e<a||e===a&&t<r}return  false}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedMonth(e){e instanceof ae?this._selectedMonth.set(this._getMonthInCurrentYear(e.start)||this._getMonthInCurrentYear(e.end)):this._selectedMonth.set(this._getMonthInCurrentYear(e));}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-year-view"]],viewQuery:function(t,a){if(t&1&&ip(Tt,5),t&2){let r;sE(r=aE())&&(a._matCalendarBody=r.first);}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",monthSelected:"monthSelected",activeDateChange:"activeDateChange"},exportAs:["matYearView"],decls:5,vars:9,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","label","rows","todayValue","startValue","endValue","labelMinRequiredCells","numCols","cellAspectRatio","activeCell"]],template:function(t,a){t&1&&(ii(0,"table",0)(1,"thead",1)(2,"tr"),Zf(3,"th",2),gc()(),ii(4,"tbody",3),tp("selectedValueChange",function(o){return a._monthSelected(o)})("activeDateChange",function(o){return a._updateActiveDate(o)})("keyup",function(o){return a._handleCalendarBodyKeyup(o)})("keydown",function(o){return a._handleCalendarBodyKeydown(o)}),gc()()),t&2&&(Fy(4),Qf("label",a._yearLabel())("rows",a._months())("todayValue",a._todayMonth())("startValue",a._selectedMonth())("endValue",a._selectedMonth())("labelMinRequiredCells",2)("numCols",4)("cellAspectRatio",4/7)("activeCell",a._dateAdapter.getMonth(a.activeDate)));},dependencies:[Tt],encapsulation:2})}return i})(),so=(()=>{class i{_intl=C(Rt);calendar=C(sn);_dateAdapter=C(ee,{optional:true});_dateFormats=C(Ne$1,{optional:true});_periodButtonText;_periodButtonDescription;_periodButtonLabel;_prevButtonLabel;_nextButtonLabel;constructor(){C(ke).load($n$2);let e=C(UP);this._updateLabels(),this.calendar.stateChanges.subscribe(()=>{this._updateLabels(),e.markForCheck();});}get periodButtonText(){return this._periodButtonText}get periodButtonDescription(){return this._periodButtonDescription}get periodButtonLabel(){return this._periodButtonLabel}get prevButtonLabel(){return this._prevButtonLabel}get nextButtonLabel(){return this._nextButtonLabel}currentPeriodClicked(){this.calendar.currentView=this.calendar.currentView=="month"?"multi-year":"month";}previousClicked(){this.previousEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,-1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?-1:-he));}nextClicked(){this.nextEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?1:he));}previousEnabled(){return this.calendar.minDate?!this.calendar.minDate||!this._isSameView(this.calendar.activeDate,this.calendar.minDate):true}nextEnabled(){return !this.calendar.maxDate||!this._isSameView(this.calendar.activeDate,this.calendar.maxDate)}_updateLabels(){let e=this.calendar,t=this._intl,a=this._dateAdapter;e.currentView==="month"?(this._periodButtonText=a.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonDescription=a.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonLabel=t.switchToMultiYearViewLabel,this._prevButtonLabel=t.prevMonthLabel,this._nextButtonLabel=t.nextMonthLabel):e.currentView==="year"?(this._periodButtonText=a.getYearName(e.activeDate),this._periodButtonDescription=a.getYearName(e.activeDate),this._periodButtonLabel=t.switchToMonthViewLabel,this._prevButtonLabel=t.prevYearLabel,this._nextButtonLabel=t.nextYearLabel):(this._periodButtonText=t.formatYearRange(...this._formatMinAndMaxYearLabels()),this._periodButtonDescription=t.formatYearRangeLabel(...this._formatMinAndMaxYearLabels()),this._periodButtonLabel=t.switchToMonthViewLabel,this._prevButtonLabel=t.prevMultiYearLabel,this._nextButtonLabel=t.nextMultiYearLabel);}_isSameView(e,t){return this.calendar.currentView=="month"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t)&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(t):this.calendar.currentView=="year"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t):ro(this._dateAdapter,e,t,this.calendar.minDate,this.calendar.maxDate)}_formatMinAndMaxYearLabels(){let t=this._dateAdapter.getYear(this.calendar.activeDate)-rn(this._dateAdapter,this.calendar.activeDate,this.calendar.minDate,this.calendar.maxDate),a=t+he-1,r=this._dateAdapter.getYearName(this._dateAdapter.createDate(t,0,1)),o=this._dateAdapter.getYearName(this._dateAdapter.createDate(a,0,1));return [r,o]}_periodButtonLabelId=C(di).getId("mat-calendar-period-label-");static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-calendar-header"]],exportAs:["matCalendarHeader"],ngContentSelectors:bl,decls:17,vars:13,consts:[[1,"mat-calendar-header"],[1,"mat-calendar-controls"],["aria-live","polite",1,"cdk-visually-hidden",3,"id"],["matButton","","type","button",1,"mat-calendar-period-button",3,"click"],["aria-hidden","true"],["viewBox","0 0 10 5","focusable","false","aria-hidden","true",1,"mat-calendar-arrow"],["points","0,0 5,5 10,0"],[1,"mat-calendar-spacer"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-previous-button",3,"click","disabled","matTooltip"],["viewBox","0 0 24 24","focusable","false","aria-hidden","true"],["d","M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-next-button",3,"click","disabled","matTooltip"],["d","M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"]],template:function(t,a){t&1&&(rE(),ii(0,"div",0)(1,"div",1)(2,"span",2),AE(3),gc(),ii(4,"button",3),tp("click",function(){return a.currentPeriodClicked()}),ii(5,"span",4),AE(6),gc(),tu(),ii(7,"svg",5),Zf(8,"polygon",6),gc()(),nu(),Zf(9,"div",7),oE(10),ii(11,"button",8),tp("click",function(){return a.previousClicked()}),tu(),ii(12,"svg",9),Zf(13,"path",10),gc()(),nu(),ii(14,"button",11),tp("click",function(){return a.nextClicked()}),tu(),ii(15,"svg",9),Zf(16,"path",12),gc()()()()),t&2&&(Fy(2),Qf("id",a._periodButtonLabelId),Fy(),yp(a.periodButtonDescription),Fy(),zf("aria-label",a.periodButtonLabel)("aria-describedby",a._periodButtonLabelId),Fy(2),yp(a.periodButtonText),Fy(),dp$1("mat-calendar-invert",a.calendar.currentView!=="month"),Fy(4),Qf("disabled",!a.previousEnabled())("matTooltip",a.prevButtonLabel),zf("aria-label",a.prevButtonLabel),Fy(3),Qf("disabled",!a.nextEnabled())("matTooltip",a.nextButtonLabel),zf("aria-label",a.nextButtonLabel));},dependencies:[$n$1,Je$1,Vo$1],encapsulation:2})}return i})(),sn=(()=>{class i{_dateAdapter=C(ee,{optional:true});_dateFormats=C(Ne$1,{optional:true});_changeDetectorRef=C(UP);_elementRef=C(ar$1);headerComponent;_calendarHeaderPortal;_intlChanges;_moveFocusOnNextTick=false;get startAt(){return this._startAt}set startAt(e){this._startAt=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_startAt=null;startView="month";get selected(){return this._selected}set selected(e){e instanceof ae?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedChange=new Fe;yearSelected=new Fe;monthSelected=new Fe;viewChanged=new Fe(true);_userSelection=new Fe;_userDragDrop=new Fe;monthView;yearView;multiYearView;get activeDate(){return this._clampedActiveDate}set activeDate(e){this._clampedActiveDate=this._dateAdapter.clampDate(e,this.minDate,this.maxDate),this.stateChanges.next(),this._changeDetectorRef.markForCheck();}_clampedActiveDate;get currentView(){return this._currentView}set currentView(e){let t=this._currentView!==e?e:null;this._currentView=e,this._moveFocusOnNextTick=true,this._changeDetectorRef.markForCheck(),t&&(this.stateChanges.next(),this.viewChanged.emit(t));}_currentView;_activeDrag=null;stateChanges=new ee$1;constructor(){this._intlChanges=C(Rt).changes.subscribe(()=>{this._changeDetectorRef.markForCheck(),this.stateChanges.next();});}ngAfterContentInit(){this._calendarHeaderPortal=new nt(this.headerComponent||so),this.activeDate=this.startAt||this._dateAdapter.today(),this._currentView=this.startView;}ngAfterViewChecked(){this._moveFocusOnNextTick&&(this._moveFocusOnNextTick=false,this.focusActiveCell());}ngOnDestroy(){this._intlChanges.unsubscribe(),this.stateChanges.complete();}ngOnChanges(e){let t=e.minDate&&!this._dateAdapter.sameDate(e.minDate.previousValue,e.minDate.currentValue)?e.minDate:void 0,a=e.maxDate&&!this._dateAdapter.sameDate(e.maxDate.previousValue,e.maxDate.currentValue)?e.maxDate:void 0,r=t||a||e.dateFilter;if(r&&!r.firstChange){let o=this._getCurrentViewComponent();o&&(this._elementRef.nativeElement.contains(si())&&(this._moveFocusOnNextTick=true),this._changeDetectorRef.detectChanges(),o._init());}this.stateChanges.next();}focusActiveCell(){this._getCurrentViewComponent()?._focusActiveCell(false);}updateTodaysDate(){this._getCurrentViewComponent()?._init();}_dateSelected(e){let t=e.value;(this.selected instanceof ae||t&&!this._dateAdapter.sameDate(t,this.selected))&&this.selectedChange.emit(t),this._userSelection.emit(e);}_yearSelectedInMultiYearView(e){this.yearSelected.emit(e);}_monthSelectedInYearView(e){this.monthSelected.emit(e);}_goToDateInView(e,t){this.activeDate=e,this.currentView=t;}_dragStarted(e){this._activeDrag=e;}_dragEnded(e){this._activeDrag&&(e.value&&this._userDragDrop.emit(e),this._activeDrag=null);}_getCurrentViewComponent(){return this.monthView||this.yearView||this.multiYearView}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-calendar"]],viewQuery:function(t,a){if(t&1&&ip(eo,5)(no,5)(to,5),t&2){let r;sE(r=aE())&&(a.monthView=r.first),sE(r=aE())&&(a.yearView=r.first),sE(r=aE())&&(a.multiYearView=r.first);}},hostAttrs:[1,"mat-calendar"],inputs:{headerComponent:"headerComponent",startAt:"startAt",startView:"startView",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",monthSelected:"monthSelected",viewChanged:"viewChanged",_userSelection:"_userSelection",_userDragDrop:"_userDragDrop"},exportAs:["matCalendar"],features:[BE([Fl]),jg],decls:5,vars:2,consts:[[3,"cdkPortalOutlet"],["cdkMonitorSubtreeFocus","","tabindex","-1",1,"mat-calendar-content"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","_userSelection","dragStarted","dragEnded","activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDateChange","monthSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","yearSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"]],template:function(t,a){if(t&1&&(Uf(0,yl,0,0,"ng-template",0),ii(1,"div",1),jI(2,Cl,1,11,"mat-month-view",2)(3,Dl,1,6,"mat-year-view",3)(4,xl,1,6,"mat-multi-year-view",3),gc()),t&2){let r;Qf("cdkPortalOutlet",a._calendarHeaderPortal),Fy(2),VI((r=a.currentView)==="month"?2:r==="year"?3:r==="multi-year"?4:-1);}},dependencies:[Pi$1,Oc,eo,no,to],styles:[`.mat-calendar {
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
`],encapsulation:2})}return i})();var Rl=(()=>{class i{_elementRef=C(ar$1);_animationsDisabled=Un$1();_changeDetectorRef=C(UP);_globalModel=C(Gn);_dateAdapter=C(ee);_ngZone=C(be);_rangeSelectionStrategy=C(ao,{optional:true});_stateChanges;_model;_eventCleanups;_animationFallback;_calendar;color;datepicker;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;_isAbove=false;_animationDone=new ee$1;_isAnimating=false;_closeButtonText;_closeButtonFocused=false;_actionsPortal=null;_dialogLabelId=null;constructor(){if(C(ke).load($n$2),this._closeButtonText=C(Rt).closeCalendarLabel,!this._animationsDisabled){let e=this._elementRef.nativeElement,t=C(Dv);this._eventCleanups=this._ngZone.runOutsideAngular(()=>[t.listen(e,"animationstart",this._handleAnimationEvent),t.listen(e,"animationend",this._handleAnimationEvent),t.listen(e,"animationcancel",this._handleAnimationEvent)]);}}ngAfterViewInit(){this._stateChanges=this.datepicker.stateChanges.subscribe(()=>{this._changeDetectorRef.markForCheck();}),this._calendar.focusActiveCell();}ngOnDestroy(){clearTimeout(this._animationFallback),this._eventCleanups?.forEach(e=>e()),this._stateChanges?.unsubscribe(),this._animationDone.complete();}_handleUserSelection(e){let t=this._model.selection,a=e.value,r=t instanceof ae;if(r&&this._rangeSelectionStrategy){let o=this._rangeSelectionStrategy.selectionFinished(a,t,e.event);this._model.updateSelection(o,this);}else a&&(r||!this._dateAdapter.sameDate(a,t))&&this._model.add(a);(!this._model||this._model.isComplete())&&!this._actionsPortal&&this.datepicker.close();}_handleUserDragDrop(e){this._model.updateSelection(e.value,this);}_startExitAnimation(){this._elementRef.nativeElement.classList.add("mat-datepicker-content-exit"),this._animationsDisabled?this._animationDone.next():(clearTimeout(this._animationFallback),this._animationFallback=setTimeout(()=>{this._isAnimating||this._animationDone.next();},200));}_handleAnimationEvent=e=>{let t=this._elementRef.nativeElement;e.target!==t||!e.animationName.startsWith("_mat-datepicker-content")||(clearTimeout(this._animationFallback),this._isAnimating=e.type==="animationstart",t.classList.toggle("mat-datepicker-content-animating",this._isAnimating),this._isAnimating||this._animationDone.next());};_getSelected(){return this._model.selection}_applyPendingSelection(){this._model!==this._globalModel&&this._globalModel.updateSelection(this._model.selection,this);}_assignActions(e,t){this._model=e?this._globalModel.clone():this._globalModel,this._actionsPortal=e,t&&this._changeDetectorRef.detectChanges();}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-datepicker-content"]],viewQuery:function(t,a){if(t&1&&ip(sn,5),t&2){let r;sE(r=aE())&&(a._calendar=r.first);}},hostAttrs:[1,"mat-datepicker-content"],hostVars:6,hostBindings:function(t,a){t&2&&(EE(a.color?"mat-"+a.color:""),dp$1("mat-datepicker-content-touch",a.datepicker.touchUi)("mat-datepicker-content-animations-enabled",!a._animationsDisabled));},inputs:{color:"color"},exportAs:["matDatepickerContent"],decls:5,vars:26,consts:[["cdkTrapFocus","","role","dialog",1,"mat-datepicker-content-container"],[3,"yearSelected","monthSelected","viewChanged","_userSelection","_userDragDrop","id","startAt","startView","minDate","maxDate","dateFilter","headerComponent","selected","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName"],[3,"cdkPortalOutlet"],["type","button","matButton","elevated",1,"mat-datepicker-close-button",3,"focus","blur","click","color"]],template:function(t,a){t&1&&(ii(0,"div",0)(1,"mat-calendar",1),tp("yearSelected",function(o){return a.datepicker._selectYear(o)})("monthSelected",function(o){return a.datepicker._selectMonth(o)})("viewChanged",function(o){return a.datepicker._viewChanged(o)})("_userSelection",function(o){return a._handleUserSelection(o)})("_userDragDrop",function(o){return a._handleUserDragDrop(o)}),gc(),Uf(2,Ml,0,0,"ng-template",2),ii(3,"button",3),tp("focus",function(){return a._closeButtonFocused=true})("blur",function(){return a._closeButtonFocused=false})("click",function(){return a.datepicker.close()}),AE(4),gc()()),t&2&&(dp$1("mat-datepicker-content-container-with-custom-header",a.datepicker.calendarHeaderComponent)("mat-datepicker-content-container-with-actions",a._actionsPortal),zf("aria-modal",true)("aria-labelledby",a._dialogLabelId??void 0),Fy(),EE(a.datepicker.panelClass),Qf("id",a.datepicker.id)("startAt",a.datepicker.startAt)("startView",a.datepicker.startView)("minDate",a.datepicker._getMinDate())("maxDate",a.datepicker._getMaxDate())("dateFilter",a.datepicker._getDateFilter())("headerComponent",a.datepicker.calendarHeaderComponent)("selected",a._getSelected())("dateClass",a.datepicker.dateClass)("comparisonStart",a.comparisonStart)("comparisonEnd",a.comparisonEnd)("startDateAccessibleName",a.startDateAccessibleName)("endDateAccessibleName",a.endDateAccessibleName),Fy(),Qf("cdkPortalOutlet",a._actionsPortal),Fy(),dp$1("cdk-visually-hidden",!a._closeButtonFocused),Qf("color",a.color||"primary"),Fy(),yp(a._closeButtonText));},dependencies:[zc,sn,Pi$1,$n$1],styles:[`@keyframes _mat-datepicker-content-dropdown-enter {
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
`],encapsulation:2})}return i})();var Pl=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["","matDatepickerToggleIcon",""]]})}return i})(),Nl=(()=>{class i{_intl=C(Rt);_changeDetectorRef=C(UP);_stateChanges=q.EMPTY;datepicker;tabIndex=null;ariaLabel;get disabled(){return this._disabled===void 0&&this.datepicker?this.datepicker.disabled:!!this._disabled}set disabled(e){this._disabled=e;}_disabled;disableRipple=false;_customIcon;_button;constructor(){let e=C(new Ap("tabindex"),{optional:true}),t=Number(e);this.tabIndex=t||t===0?t:null;}ngOnChanges(e){e.datepicker&&this._watchStateChanges();}ngOnDestroy(){this._stateChanges.unsubscribe();}ngAfterContentInit(){this._watchStateChanges();}_open(e){this.datepicker&&!this.disabled&&(this.datepicker.open(),e.stopPropagation());}_watchStateChanges(){let e=this.datepicker?this.datepicker.stateChanges:th(),t=this.datepicker&&this.datepicker.datepickerInput?this.datepicker.datepickerInput.stateChanges:th(),a=this.datepicker?gh(this.datepicker.openedStream,this.datepicker.closedStream):th();this._stateChanges.unsubscribe(),this._stateChanges=gh(this._intl.changes,e,t,a).subscribe(()=>this._changeDetectorRef.markForCheck());}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-datepicker-toggle"]],contentQueries:function(t,a,r){if(t&1&&op$1(r,Pl,5),t&2){let o;sE(o=aE())&&(a._customIcon=o.first);}},viewQuery:function(t,a){if(t&1&&ip(wl,5),t&2){let r;sE(r=aE())&&(a._button=r.first);}},hostAttrs:[1,"mat-datepicker-toggle"],hostVars:8,hostBindings:function(t,a){t&1&&tp("click",function(o){return a._open(o)}),t&2&&(zf("tabindex",null)("data-mat-calendar",a.datepicker?a.datepicker.id:null),dp$1("mat-datepicker-toggle-active",a.datepicker&&a.datepicker.opened)("mat-accent",a.datepicker&&a.datepicker.color==="accent")("mat-warn",a.datepicker&&a.datepicker.color==="warn"));},inputs:{datepicker:[0,"for","datepicker"],tabIndex:"tabIndex",ariaLabel:[0,"aria-label","ariaLabel"],disabled:[2,"disabled","disabled",qP],disableRipple:"disableRipple"},exportAs:["matDatepickerToggle"],features:[jg],ngContentSelectors:El,decls:4,vars:7,consts:[["button",""],["matIconButton","","type","button",3,"tabIndex","disabled","disableRipple"],["viewBox","0 0 24 24","width","24px","height","24px","fill","currentColor","focusable","false","aria-hidden","true",1,"mat-datepicker-toggle-default-icon"],["d","M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"]],template:function(t,a){t&1&&(rE(kl),ii(0,"button",1,0),jI(2,Al,2,0,":svg:svg",2),oE(3),gc()),t&2&&(Qf("tabIndex",a.disabled?-1:a.tabIndex)("disabled",a.disabled)("disableRipple",a.disableRipple),zf("aria-haspopup",a.datepicker?"dialog":null)("aria-label",a.ariaLabel||a._intl.openCalendarLabel)("aria-expanded",a.datepicker?a.datepicker.opened:null),Fy(2),VI(a._customIcon?-1:2));},dependencies:[Je$1],styles:[`.mat-datepicker-toggle {
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
`],encapsulation:2})}return i})();var lo=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({providers:[Rt],imports:[qn$1,hn,Wc,ke$1,Rl,Nl,so,Ks$1,Wt$1]})}return i})();var Bl=["leftCal"],zl=["rightCal"];function Hl(i,n){if(i&1){let e=QI();ii(0,"div",8)(1,"div",9)(2,"div",10)(3,"div",11)(4,"button",12),tp("click",function(){$l$1(e);let a=tE();return Ul$1(a.goPrev())}),ii(5,"span",13),AE(6,"chevron_left"),gc()(),ii(7,"span",14),AE(8),gc(),Zf(9,"span",15),gc(),ii(10,"mat-calendar",16,1),tp("selectedChange",function(a){$l$1(e);let r=tE();return Ul$1(r.onDateClicked(a))}),gc()(),ii(12,"div",10)(13,"div",11),Zf(14,"span",15),ii(15,"span",14),AE(16),gc(),ii(17,"button",17),tp("click",function(){$l$1(e);let a=tE();return Ul$1(a.goNext())}),ii(18,"span",13),AE(19,"chevron_right"),gc()()(),ii(20,"mat-calendar",16,2),tp("selectedChange",function(a){$l$1(e);let r=tE();return Ul$1(r.onDateClicked(a))}),gc()()()();}if(i&2){let e=tE();Fy(8),yp(e.monthLabel(e.leftMonth)),Fy(2),Qf("startAt",e.leftMonth)("selected",e.selectedRange),Fy(6),yp(e.monthLabel(e.rightMonth)),Fy(4),Qf("startAt",e.rightMonth)("selected",e.selectedRange);}}function co(i){return new Date(i.getFullYear(),i.getMonth(),1)}function uo(i,n){return new Date(i.getFullYear(),i.getMonth()+n,1)}var qn=class i{start=null;end=null;placeholder="\u9078\u64C7\u65E5\u671F\u7BC4\u570D";rangeSelected=new Fe;leftCal;rightCal;isOpen=false;leftMonth=co(new Date);selectedRange=new ae(null,null);pendingStart=null;pendingEnd=null;ngOnChanges(n){(n.start||n.end)&&(this.pendingStart=this.start,this.pendingEnd=this.end,this.selectedRange=new ae(this.start,this.end),this.start&&(this.leftMonth=co(this.start)));}get rightMonth(){return uo(this.leftMonth,1)}get displayValue(){return !this.start||!this.end?"":`${this.formatDate(this.start)} - ${this.formatDate(this.end)}`}monthLabel(n){return `${n.getFullYear()}\u5E74${n.getMonth()+1}\u6708`}open(){this.isOpen=true;}close(){this.isOpen=false;}goPrev(){this.shiftMonths(-1);}goNext(){this.shiftMonths(1);}onDateClicked(n){n&&(!this.pendingStart||this.pendingEnd?(this.pendingStart=n,this.pendingEnd=null):n<this.pendingStart?this.pendingStart=n:this.pendingEnd=n,this.selectedRange=new ae(this.pendingStart,this.pendingEnd),this.pendingStart&&this.pendingEnd&&(this.rangeSelected.emit({start:this.pendingStart,end:this.pendingEnd}),this.isOpen=false));}shiftMonths(n){this.leftMonth=uo(this.leftMonth,n),this.leftCal&&(this.leftCal.activeDate=this.leftMonth),this.rightCal&&(this.rightCal.activeDate=this.rightMonth);}formatDate(n){let e=t=>String(t).padStart(2,"0");return `${n.getFullYear()}/${e(n.getMonth()+1)}/${e(n.getDate())}`}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-dual-month-range-picker"]],viewQuery:function(e,t){if(e&1&&ip(Bl,5)(zl,5),e&2){let a;sE(a=aE())&&(t.leftCal=a.first),sE(a=aE())&&(t.rightCal=a.first);}},inputs:{start:"start",end:"end",placeholder:"placeholder"},outputs:{rangeSelected:"rangeSelected"},features:[jg],decls:9,vars:5,consts:[["origin","cdkOverlayOrigin"],["leftCal",""],["rightCal",""],["cdkOverlayOrigin","",1,"block","w-full"],["appearance","fill",1,"w-full",3,"click"],["matInput","","readonly","",3,"value","placeholder"],["matIconSuffix","","aria-hidden","true",1,"material-symbols-rounded"],["cdkConnectedOverlay","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"backdropClick","detach","cdkConnectedOverlayOrigin","cdkConnectedOverlayOpen","cdkConnectedOverlayHasBackdrop"],[1,"dual-calendar-panel"],[1,"calendars-row"],[1,"calendar-pane"],[1,"month-head"],["type","button","mat-icon-button","","aria-label","\u4E0A\u500B\u6708",3,"click"],["aria-hidden","true",1,"material-symbols-rounded"],[1,"month-label"],[1,"head-spacer"],[3,"selectedChange","startAt","selected"],["type","button","mat-icon-button","","aria-label","\u4E0B\u500B\u6708",3,"click"]],template:function(e,t){if(e&1&&(ii(0,"div",3,0)(2,"mat-form-field",4),tp("click",function(){return t.open()}),ii(3,"mat-label"),AE(4,"\u79DF\u671F"),gc(),Zf(5,"input",5),ii(6,"span",6),AE(7,"calendar_month"),gc()()(),Uf(8,Hl,22,6,"ng-template",7),tp("backdropClick",function(){return t.close()})("detach",function(){return t.close()})),e&2){let a=lE(1);Fy(5),Qf("value",t.displayValue)("placeholder",t.placeholder),Fy(3),Qf("cdkConnectedOverlayOrigin",a)("cdkConnectedOverlayOpen",t.isOpen)("cdkConnectedOverlayHasBackdrop",true);}},dependencies:[hn,mn,qt$1,qn$1,Je$1,se,xe,pe,Zt,Be,Le,lo,sn],styles:[".dual-calendar-panel[_ngcontent-%COMP%]{background:var(--mat-sys-surface-container-high, #fff);border-radius:12px;box-shadow:0 8px 24px #00000026;padding:8px 12px 12px}.calendars-row[_ngcontent-%COMP%]{display:flex;gap:8px}.calendar-pane[_ngcontent-%COMP%]{width:280px}.month-head[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px}.month-head[_ngcontent-%COMP%]   .month-label[_ngcontent-%COMP%]{flex:1;text-align:center;font-weight:500}.month-head[_ngcontent-%COMP%]   .head-spacer[_ngcontent-%COMP%]{width:40px;flex:none}.dual-calendar-panel[_ngcontent-%COMP%]     .mat-calendar-header{display:none}.dual-calendar-panel[_ngcontent-%COMP%]     .mat-calendar-body-label{opacity:0}"]})};var jl=(i,n)=>n.value;function Gl(i,n){if(i&1&&(ii(0,"mat-option",5),AE(1),gc()),i&2){let e=n.$implicit;Qf("value",e.value),Fy(),yp(e.label);}}var Un=i=>{let n=new Date;return n.setHours(i,0,0,0),n},ql=[{value:"scooter",label:"\u6A5F\u8ECA"},{value:"car",label:"\u6C7D\u8ECA"}],Wn=class i{dateRange=null;dateRangeChange=new Fe;locations=Zr;vehicleGroups=ql;vehicleGroup="car";startDate=null;endDate=null;startTime=Un(9);endTime=Un(9);pickupLocation=It;returnLocation=It;returnLocationTouched=false;ngOnChanges(){if(this.dateRange){let n=new Date(this.dateRange.startDateTime),e=new Date(this.dateRange.endDateTime);this.startDate=n,this.endDate=e,this.startTime=n,this.endTime=e,this.pickupLocation=this.dateRange.pickupLocation,this.returnLocation=this.dateRange.returnLocation,this.vehicleGroup=this.dateRange.vehicleGroup??"car",this.returnLocationTouched=!!this.dateRange.returnLocation&&this.dateRange.returnLocation!==this.dateRange.pickupLocation;}}get isValid(){return !!(this.startDate&&this.endDate)}onVehicleGroupChange(n){this.vehicleGroup=n;}onPickupLocationChange(n){this.pickupLocation=n,this.returnLocationTouched||(this.returnLocation=n);}onReturnLocationChange(n){this.returnLocation=n,this.returnLocationTouched=true;}onRangeSelected(n){this.startDate=n.start,this.endDate=n.end;}confirm(){this.isValid&&this.dateRangeChange.emit({startDateTime:this.combine(this.startDate,this.startTime??Un(9)),endDateTime:this.combine(this.endDate,this.endTime??Un(9)),pickupLocation:this.pickupLocation,returnLocation:this.returnLocation,vehicleGroup:this.vehicleGroup});}combine(n,e){let t=new Date(n);t.setHours(e.getHours(),e.getMinutes(),0,0);let a=r=>String(r).padStart(2,"0");return `${t.getFullYear()}-${a(t.getMonth()+1)}-${a(t.getDate())}T${a(t.getHours())}:${a(t.getMinutes())}`}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-date-step"]],inputs:{dateRange:"dateRange"},outputs:{dateRangeChange:"dateRangeChange"},features:[jg],decls:27,vars:10,consts:[["startPicker",""],["endPicker",""],[1,"date-step"],["appearance","fill",1,"md:max-w-42"],[3,"ngModelChange","ngModel"],[3,"value"],[1,"min-w-80","xl:max-w-80",3,"rangeSelected","start","end"],[1,"ui-field-group","xl:max-w-82"],["appearance","fill"],["matInput","",3,"ngModelChange","matTimepicker","ngModel"],["matSuffix","","aria-label","\u958B\u555F\u53D6\u8ECA\u6642\u9593\u9078\u64C7\u5668",3,"for"],["matSuffix","","aria-label","\u958B\u555F\u9084\u8ECA\u6642\u9593\u9078\u64C7\u5668",3,"for"],[1,"actions","w-full","xl:w-fit"],["matButton","filled",1,"min-h-14","w-full","xl:w-auto",3,"click","disabled"],["aria-hidden","true",1,"material-symbols-rounded"]],template:function(e,t){if(e&1){let a=QI();ii(0,"div",2)(1,"mat-form-field",3)(2,"mat-label"),AE(3,"\u8ECA\u8F1B\u985E\u578B"),gc(),ii(4,"mat-select",4),tp("ngModelChange",function(o){return t.onVehicleGroupChange(o)}),BI(5,Gl,2,2,"mat-option",5,jl),gc(),_v(),gc(),ii(7,"app-dual-month-range-picker",6),tp("rangeSelected",function(o){return t.onRangeSelected(o)}),gc(),ii(8,"div",7)(9,"mat-form-field",8)(10,"mat-label"),AE(11,"\u53D6\u8ECA\u6642\u9593"),gc(),ii(12,"input",9),wp("ngModelChange",function(o){return $l$1(a),FE(t.startTime,o)||(t.startTime=o),Ul$1(o)}),gc(),_v(),Zf(13,"mat-timepicker-toggle",10)(14,"mat-timepicker",null,0),gc(),ii(16,"mat-form-field",8)(17,"mat-label"),AE(18,"\u9084\u8ECA\u6642\u9593"),gc(),ii(19,"input",9),wp("ngModelChange",function(o){return $l$1(a),FE(t.endTime,o)||(t.endTime=o),Ul$1(o)}),gc(),_v(),Zf(20,"mat-timepicker-toggle",11)(21,"mat-timepicker",null,1),gc()(),ii(23,"div",12)(24,"button",13),tp("click",function(){return t.confirm()}),ii(25,"span",14),AE(26,"search"),gc()()()();}if(e&2){let a=lE(15),r=lE(22);Fy(4),Qf("ngModel",t.vehicleGroup),Nv(),Fy(),$I(t.vehicleGroups),Fy(2),Qf("start",t.startDate)("end",t.endDate),Fy(5),Qf("matTimepicker",a),Dp("ngModel",t.startTime),Nv(),Fy(),Qf("for",a),Fy(6),Qf("matTimepicker",r),Dp("ngModel",t.endTime),Nv(),Fy(),Qf("for",r),Fy(4),Qf("disabled",!t.isValid);}},dependencies:[dt,Ne,lt,Xe,se,xe,pe,Zt,Be,Le,Ur,Yr,$,Kr,Li,Qr,Bi,qn$1,$n$1,qn],styles:[`.date-step[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:0 8px}.date-step[_ngcontent-%COMP%]   app-dual-month-range-picker[_ngcontent-%COMP%], .date-step[_ngcontent-%COMP%]   .ui-field-group[_ngcontent-%COMP%], .date-step[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%]{flex:auto}@media(width>=768px){.date-step[_ngcontent-%COMP%]{flex-direction:row;flex-wrap:wrap}}.actions[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;margin-bottom:1rem}
`]})};var Yl=(i,n)=>n.id;function Ul(i,n){i&1&&(mc(0,"p",1),AE(1,"\u8ACB\u5148\u9078\u64C7\u79DF\u671F\u4EE5\u67E5\u770B\u53EF\u79DF\u8ECA\u8F1B\u3002"),yc());}function Wl(i,n){if(i&1&&Yf(0,"img",6),i&2){let e=tE().$implicit;Xf("src",e.imageUrl,Fd$1)("alt",e.brand+" "+e.model);}}function $l(i,n){if(i&1&&(mc(0,"span",7),AE(1),yc()),i&2){let e=tE().$implicit,t=tE();Fy(),Ec(" ",t.categoryIcon(e)," ");}}function Ql(i,n){if(i&1&&(mc(0,"li")(1,"span",19),AE(2,"airline_seat_recline_normal"),yc(),AE(3),yc()),i&2){let e=tE().$implicit;Fy(3),Ec(" ",e.seats,"\u4EBA\u5EA7 ");}}function Kl(i,n){if(i&1&&(mc(0,"li")(1,"span",19),AE(2,"luggage"),yc(),AE(3),yc()),i&2){let e=tE().$implicit;Fy(3),Ec(" ",e.luggage,"\u4EF6\u884C\u674E ");}}function Zl(i,n){i&1&&(mc(0,"li")(1,"span",19),AE(2,"ac_unit"),yc(),AE(3," \u7A7A\u8ABF "),yc());}function Xl(i,n){if(i&1&&(mc(0,"li")(1,"span",20),AE(2),yc(),AE(3),yc()),i&2){let e=tE().$implicit,t=tE();Fy(2),yp(t.transmissionMark(e)),Fy(),Ec(" ",t.transmissionLabel(e)," ");}}function Jl(i,n){i&1&&(mc(0,"span",14),AE(1,"\u7ACB\u5373\u78BA\u8A8D"),yc());}function ed(i,n){i&1&&(mc(0,"p",17),AE(1,"\u66AB\u7121\u5B9A\u50F9"),yc());}function td(i,n){if(i&1&&(mc(0,"p",21),AE(1),WE(2,"number"),mc(3,"span",22),AE(4,"\xA0/ \u5929"),yc()(),mc(5,"p",23),AE(6),WE(7,"number"),yc()),i&2){let e=tE().$implicit,t=tE();Fy(),Ec(" NT$ ",GE(2,2,t.dailyPrice(e))),Fy(5),Ec("\u7E3D\u8A08 NT$ ",GE(7,4,t.totalPrice(e)));}}function nd(i,n){if(i&1){let e=QI();mc(0,"article",4),np("click",function(){let a=$l$1(e).$implicit,r=tE();return Ul$1(r.select(a))})("keydown.enter",function(){let a=$l$1(e).$implicit,r=tE();return Ul$1(r.select(a))}),mc(1,"div",5),jI(2,Wl,1,2,"img",6)(3,$l,2,1,"span",7),yc(),mc(4,"div",8)(5,"p",9),AE(6),yc(),mc(7,"h4",10),AE(8),mc(9,"span",11),AE(10," \u6216\u540C\u7D1A "),mc(11,"span",12),AE(12,"info"),yc()()(),mc(13,"ul",13),jI(14,Ql,4,1,"li"),jI(15,Kl,4,1,"li"),jI(16,Zl,4,0,"li"),jI(17,Xl,4,2,"li"),yc(),jI(18,Jl,2,0,"span",14),yc(),mc(19,"div",15)(20,"div",16),jI(21,ed,2,0,"p",17)(22,td,8,6),yc(),mc(23,"button",18),np("click",function(a){let r=$l$1(e).$implicit,o=tE();return a.stopPropagation(),Ul$1(o.select(r))}),mc(24,"span",19),AE(25),yc()()()();}if(i&2){let e=n.$implicit,t=tE();dp$1("selected",t.selectedVehicle?.id===e.id)("unpriced",t.isUnpriced(e)),Fy(2),VI(e.imageUrl?2:3),Fy(4),yp(t.classLabel(e)),Fy(2),Ip(" ",e.brand," ",e.model," ",e.year," edition "),Fy(6),VI(e.seats?14:-1),Fy(),VI(e.luggage?15:-1),Fy(),VI(e.hasAirConditioner?16:-1),Fy(),VI(e.transmission?17:-1),Fy(),VI(e.instantConfirm?18:-1),Fy(3),VI(t.isUnpriced(e)?21:22),Fy(2),Xf("disabled",t.isUnpriced(e)),zf("aria-label",t.selectedVehicle?.id===e.id?"\u5DF2\u9078\u64C7 "+e.brand+" "+e.model:"\u9078\u64C7 "+e.brand+" "+e.model),Fy(2),Ec(" ",t.selectedVehicle?.id===e.id?"check":"chevron_right"," ");}}var id={car:"\u6C7D\u8ECA",scooter:"\u6A5F\u8ECA",ev:"\u96FB\u52D5\u8ECA"},ad={car:"directions_car",scooter:"two_wheeler",ev:"electric_moped"},$n=class i{_vehicles=Mo$1([]);set vehicles(n){this._vehicles.set(n??[]);}get vehicles(){return this._vehicles()}selectedVehicle=null;priceForVehicle=()=>null;days=1;vehicleSelect=new Fe;select(n){this.priceForVehicle(n)!==null&&this.vehicleSelect.emit(n);}isUnpriced(n){return this.priceForVehicle(n)===null}dailyPrice(n){let e=this.priceForVehicle(n);return e===null?null:Math.round(e/Math.max(1,this.days))}totalPrice(n){return this.priceForVehicle(n)}classLabel(n){return n.classLabel??id[n.category]}categoryIcon(n){return ad[n.category]}transmissionLabel(n){return n.transmission==="manual"?"\u624B\u6392":"\u81EA\u6392"}transmissionMark(n){return n.transmission==="manual"?"M":"A"}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-vehicle-step"]],inputs:{vehicles:"vehicles",selectedVehicle:"selectedVehicle",priceForVehicle:"priceForVehicle",days:"days"},outputs:{vehicleSelect:"vehicleSelect"},decls:5,vars:1,consts:[[1,"vehicle-step"],[1,"empty-hint"],[1,"vehicle-cards"],["role","button","tabindex","0",1,"vehicle-card",3,"selected","unpriced"],["role","button","tabindex","0",1,"vehicle-card",3,"click","keydown.enter"],[1,"v-media"],[3,"src","alt"],["aria-hidden","true",1,"material-symbols-rounded","v-media__placeholder"],[1,"v-body"],[1,"v-class"],[1,"v-title"],[1,"v-similar"],["title","\u5BE6\u969B\u8ECA\u8F1B\u4EE5\u73FE\u5834\u914D\u8ECA\u70BA\u6E96\uFF0C\u5C07\u63D0\u4F9B\u540C\u7B49\u7D1A\u6216\u4EE5\u4E0A\u8ECA\u6B3E","aria-label","\u5BE6\u969B\u8ECA\u8F1B\u4EE5\u73FE\u5834\u914D\u8ECA\u70BA\u6E96\uFF0C\u5C07\u63D0\u4F9B\u540C\u7B49\u7D1A\u6216\u4EE5\u4E0A\u8ECA\u6B3E",1,"material-symbols-rounded","v-info"],[1,"v-specs"],[1,"v-badge"],[1,"v-price"],[1,"v-price__main"],[1,"v-amount","v-amount--none"],["type","button",1,"v-cta",3,"click","disabled"],["aria-hidden","true",1,"material-symbols-rounded"],["aria-hidden","true",1,"v-mark"],[1,"v-amount"],[1,"v-unit"],[1,"v-total"]],template:function(e,t){e&1&&(mc(0,"div",0),jI(1,Ul,2,0,"p",1),mc(2,"div",2),BI(3,nd,26,18,"article",3,Yl),yc()()),e&2&&(Fy(),VI(t.vehicles.length===0?1:-1),Fy(2),$I(t.vehicles));},dependencies:[la],styles:['@charset "UTF-8";.vehicle-step[_ngcontent-%COMP%]{padding:16px 0}.vehicle-step[_ngcontent-%COMP%]   .empty-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .vehicle-cards[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px}.vehicle-step[_ngcontent-%COMP%]   .vehicle-card[_ngcontent-%COMP%]{display:grid;grid-template-columns:140px minmax(0,1fr) 200px;align-items:stretch;gap:16px;padding:16px;cursor:pointer;background:var(--mat-sys-surface-container-lowest, #fff);border:1px solid var(--mat-sys-outline-variant);border-radius:var(--mat-sys-corner-medium, 12px);transition:border-color .15s ease,box-shadow .15s ease}.vehicle-step[_ngcontent-%COMP%]   .vehicle-card[_ngcontent-%COMP%]:not(.unpriced):hover{border-color:var(--mat-sys-primary);box-shadow:var(--mat-sys-level1)}.vehicle-step[_ngcontent-%COMP%]   .vehicle-card.selected[_ngcontent-%COMP%]{border-color:var(--mat-sys-primary);box-shadow:0 0 0 1px var(--mat-sys-primary) inset}.vehicle-step[_ngcontent-%COMP%]   .vehicle-card.unpriced[_ngcontent-%COMP%]{cursor:not-allowed;opacity:.55}.vehicle-step[_ngcontent-%COMP%]   .v-media[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;min-width:0}.vehicle-step[_ngcontent-%COMP%]   .v-media[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:100%;height:100%;max-height:92px;object-fit:contain}.vehicle-step[_ngcontent-%COMP%]   .v-media__placeholder[_ngcontent-%COMP%]{font-size:56px;line-height:1;color:var(--mat-sys-on-surface-variant);opacity:.5}.vehicle-step[_ngcontent-%COMP%]   .v-body[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0}.vehicle-step[_ngcontent-%COMP%]   .v-class[_ngcontent-%COMP%]{margin:0;font-size:.8125rem;font-weight:600;color:var(--mat-sys-primary);white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-title[_ngcontent-%COMP%]{margin:0;font-size:1.0625rem;font-weight:700;line-height:1.3;color:var(--mat-sys-on-surface)}.vehicle-step[_ngcontent-%COMP%]   .v-similar[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:2px;margin-left:4px;font-size:.8125rem;font-weight:400;color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .v-info[_ngcontent-%COMP%]{font-size:15px;line-height:1;cursor:help}.vehicle-step[_ngcontent-%COMP%]   .v-specs[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin:2px 0 0;padding:0;list-style:none;font-size:.8125rem;color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .v-specs[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-specs[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:17px;line-height:1}.vehicle-step[_ngcontent-%COMP%]   .v-mark[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border:1px solid currentColor;border-radius:999px;font-size:10px;font-weight:700;line-height:1}.vehicle-step[_ngcontent-%COMP%]   .v-badge[_ngcontent-%COMP%]{display:inline-flex;align-items:center;flex-shrink:0;margin-top:2px;padding:2px 8px;border-radius:4px;background:var(--app-positive-bg, #e6f4ea);color:var(--app-positive-fg, #1e7b40);font-size:.75rem;font-weight:600;white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-price[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto 1fr;align-items:center;column-gap:12px;padding-left:16px;border-left:1px solid var(--mat-sys-outline-variant);text-align:right}.vehicle-step[_ngcontent-%COMP%]   .v-amount[_ngcontent-%COMP%]{margin:0;font-size:1.375rem;font-weight:700;line-height:1.2;color:var(--mat-sys-on-surface);white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-amount--none[_ngcontent-%COMP%]{font-size:.9375rem;font-weight:600;color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .v-unit[_ngcontent-%COMP%]{font-size:.8125rem;font-weight:400;color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .v-total[_ngcontent-%COMP%]{margin:2px 0 0;font-size:.75rem;color:var(--mat-sys-on-surface-variant);white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-cta[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;flex-shrink:0;padding:0;border:none;border-radius:var(--mat-sys-corner-small, 8px);background:var(--mat-sys-primary);color:var(--mat-sys-on-primary);cursor:pointer;transition:filter .15s ease}.vehicle-step[_ngcontent-%COMP%]   .v-cta[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:24px;line-height:1}.vehicle-step[_ngcontent-%COMP%]   .v-cta[_ngcontent-%COMP%]:hover:not(:disabled){filter:brightness(1.08)}.vehicle-step[_ngcontent-%COMP%]   .v-cta[_ngcontent-%COMP%]:disabled{cursor:not-allowed;background:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface-variant)}@media(max-width:720px){.vehicle-step[_ngcontent-%COMP%]   .vehicle-card[_ngcontent-%COMP%]{grid-template-columns:96px minmax(0,1fr);gap:12px}.vehicle-step[_ngcontent-%COMP%]   .v-price[_ngcontent-%COMP%]{grid-column:1/-1;grid-template-rows:auto auto;padding-left:0;padding-top:12px;border-left:none;border-top:1px solid var(--mat-sys-outline-variant);text-align:left}}']})};var Pt=class i{catalog=C(Re);daysBetween(n,e){if(!n||!e)return 0;let t=new Date(e+"T00:00:00").getTime()-new Date(n+"T00:00:00").getTime();return Math.max(0,Math.round(t/864e5))}vehicleTotal(n,e){if(!e.startDate||!e.endDate||!this.catalog.planForCategory(n.category))return null;try{return this.catalog.price({category:n.category,startDate:e.startDate,endDate:e.endDate,addOns:[],partnerDiscountPercent:e.partnerDiscountPercent}).total}catch(t){return console.error("[QuoteService] vehicleTotal \u8A66\u7B97\u5931\u6557",t),null}}validateCoupon(n,e){let t=n.trim();return t?this.catalog.validateCoupon(t,e):null}quote(n){if(!n.startDate||!n.endDate||!this.catalog.planForCategory(n.vehicle.category))return null;try{return this.catalog.price({category:n.vehicle.category,startDate:n.startDate,endDate:n.endDate,addOns:n.addOnLines,coupon:n.coupon,partnerDiscountPercent:n.partnerDiscountPercent})}catch(e){return console.error("[QuoteService] quote \u8A66\u7B97\u5931\u6557",e),null}}static \u0275fac=function(e){return new(e||i)};static \u0275prov=ge$1({token:i,factory:i.\u0275fac,providedIn:"root"})};var rd=(i,n)=>n.addOn.id,od=(i,n)=>n.date,sd=(i,n)=>n.addOnId;function ld(i,n){if(i&1&&(mc(0,"span",5),AE(1),yc()),i&2){let e=n.$implicit;Fy(),vp("",e.addOn.name," x",e.qty);}}function dd(i,n){if(i&1&&(mc(0,"div",4)(1,"span"),AE(2,"\u914D\u4EF6"),yc(),mc(3,"span"),BI(4,ld,2,2,"span",5,rd),yc()()),i&2){let e=tE(2);Fy(4),$I(e.selectedAddOnLines);}}function cd(i,n){if(i&1&&(mc(0,"div",1)(1,"div",4)(2,"span"),AE(3,"\u8ECA\u6B3E"),yc(),mc(4,"span"),AE(5),yc()(),mc(6,"div",4)(7,"span"),AE(8,"\u79DF\u671F"),yc(),mc(9,"span"),AE(10),yc()(),jI(11,dd,6,0,"div",4),yc()),i&2){let e=tE();Fy(5),Ip("",e.vehicle.brand," ",e.vehicle.model,"\uFF08",e.vehicle.plateNumber,"\uFF09"),Fy(5),vp("",e.startDate," \uFF5E ",e.endDate),Fy(),VI(e.selectedAddOnLines.length>0?11:-1);}}function ud(i,n){i&1&&(mc(0,"p",2),AE(1,"\u5C1A\u672A\u9078\u64C7\u8ECA\u8F1B\u3002"),yc());}function md(i,n){if(i&1&&(mc(0,"div",4)(1,"span"),AE(2),yc(),mc(3,"span"),AE(4),yc()()),i&2){let e=n.$implicit;Fy(2),vp("",e.date,"\uFF08",e.dayType,"\uFF09"),Fy(2),Ec("NT$ ",e.price);}}function pd(i,n){if(i&1&&(mc(0,"div",6)(1,"span"),AE(2),yc(),mc(3,"span"),AE(4),yc()()),i&2){let e=tE(2);Fy(2),Ec("\u7D2F\u79DF\u6298\u6263\uFF08",e.priceBreakdown.tierDiscountPercent,"%\uFF09"),Fy(2),Ec("-NT$ ",e.priceBreakdown.tierDiscountAmount);}}function hd(i,n){if(i&1&&(mc(0,"div",6)(1,"span"),AE(2),yc(),mc(3,"span"),AE(4),yc()()),i&2){let e=tE(2);Fy(2),Ec("\u5925\u4F34\u6298\u6263\uFF08",e.priceBreakdown.partnerDiscountPercent,"%\uFF09"),Fy(2),Ec("-NT$ ",e.priceBreakdown.partnerDiscount);}}function fd(i,n){if(i&1&&(mc(0,"div",4)(1,"span"),AE(2),yc(),mc(3,"span"),AE(4),yc()()),i&2){let e=n.$implicit;Fy(2),vp("",e.name," x",e.qty),Fy(2),Ec("NT$ ",e.amount);}}function _d(i,n){if(i&1&&(mc(0,"div",4)(1,"span"),AE(2,"\u914D\u4EF6\u8CBB\u7528\u5C0F\u8A08"),yc(),mc(3,"span"),AE(4),yc()()),i&2){let e=tE(2);Fy(4),Ec("NT$ ",e.priceBreakdown.addOnSubtotal);}}function gd(i,n){if(i&1&&(mc(0,"div",6)(1,"span"),AE(2),yc(),mc(3,"span"),AE(4),yc()()),i&2){let e=tE(2);Fy(2),Ec("\u512A\u60E0\u6298\u62B5\uFF08",e.priceBreakdown.couponCode,"\uFF09"),Fy(2),Ec("-NT$ ",e.priceBreakdown.couponDiscount);}}function vd(i,n){if(i&1&&(mc(0,"div",3)(1,"h3"),AE(2,"\u8A66\u7B97\u660E\u7D30"),yc(),BI(3,md,5,3,"div",4,od),mc(5,"div",4)(6,"span"),AE(7,"\u79DF\u91D1\u539F\u50F9"),yc(),mc(8,"span"),AE(9),yc()(),jI(10,pd,5,2,"div",6),mc(11,"div",4)(12,"span"),AE(13,"\u79DF\u91D1\u5C0F\u8A08"),yc(),mc(14,"span"),AE(15),yc()(),jI(16,hd,5,2,"div",6),BI(17,fd,5,3,"div",4,sd),jI(19,_d,5,1,"div",4),jI(20,gd,5,2,"div",6),mc(21,"div",7)(22,"span"),AE(23,"\u61C9\u4ED8\u7E3D\u8A08"),yc(),mc(24,"span"),AE(25),yc()()()),i&2){let e=tE();Fy(3),$I(e.priceBreakdown.dailyLines),Fy(6),Ec("NT$ ",e.priceBreakdown.rentalRaw),Fy(),VI(e.priceBreakdown.tierDiscountAmount>0?10:-1),Fy(5),Ec("NT$ ",e.priceBreakdown.rentalSubtotal),Fy(),VI(e.priceBreakdown.partnerDiscount>0?16:-1),Fy(),$I(e.priceBreakdown.addOnLines),Fy(2),VI(e.priceBreakdown.addOnSubtotal>0?19:-1),Fy(),VI(e.priceBreakdown.couponDiscount>0?20:-1),Fy(5),Ec("NT$ ",e.priceBreakdown.total);}}var Qn=class i{vehicle=null;startDate="";endDate="";selectedAddOnLines=[];priceBreakdown=null;static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-order-summary-card"]],inputs:{vehicle:"vehicle",startDate:"startDate",endDate:"endDate",selectedAddOnLines:"selectedAddOnLines",priceBreakdown:"priceBreakdown"},decls:6,vars:2,consts:[[1,"order-summary-card"],[1,"summary-block"],[1,"empty-state"],[1,"summary"],[1,"line"],[1,"add-on-item"],[1,"line","discount"],[1,"line","total"]],template:function(e,t){e&1&&(mc(0,"div",0)(1,"h3"),AE(2,"\u8CFC\u8CB7\u5167\u5BB9"),yc(),jI(3,cd,12,6,"div",1)(4,ud,2,0,"p",2),jI(5,vd,26,7,"div",3),yc()),e&2&&(Fy(3),VI(t.vehicle?3:4),Fy(2),VI(t.priceBreakdown?5:-1));},styles:[".order-summary-card[_ngcontent-%COMP%]{align-self:start}@media(min-width:900px){.order-summary-card[_ngcontent-%COMP%]{position:sticky;top:1rem}}.order-summary-card[_ngcontent-%COMP%]   .summary-block[_ngcontent-%COMP%]{margin-bottom:16px}.order-summary-card[_ngcontent-%COMP%]   .add-on-item[_ngcontent-%COMP%]{margin-left:8px}.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]{margin-top:16px;border-top:1px solid rgba(0,0,0,.12);padding-top:12px}.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding:4px 0}.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .discount[_ngcontent-%COMP%]{color:#2e7d32}.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{font-weight:700;font-size:1.1em;border-top:1px solid rgba(0,0,0,.12);margin-top:8px;padding-top:8px}@media(max-width:899.98px){.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{position:sticky;bottom:0;margin-top:0;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px));background:var(--mat-sys-surface-container-highest, #fff)}}"]})};var Kn=class i{pickupLocation="";returnLocation="";startDate="";endDate="";days=0;edit=new Fe;get location(){return this.pickupLocation?!this.returnLocation||this.returnLocation===this.pickupLocation?this.pickupLocation:`\u53D6\u8ECA ${this.pickupLocation} \u30FB \u9084\u8ECA ${this.returnLocation}`:""}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-search-criteria-bar"]],inputs:{pickupLocation:"pickupLocation",returnLocation:"returnLocation",startDate:"startDate",endDate:"endDate",days:"days"},outputs:{edit:"edit"},decls:5,vars:4,consts:[[1,"search-criteria-bar"],[1,"criteria"],["mat-stroked-button","","type","button",3,"click"]],template:function(e,t){e&1&&(ii(0,"div",0)(1,"span",1),AE(2),gc(),ii(3,"button",2),tp("click",function(){return t.edit.emit()}),AE(4,"\u4FEE\u6539"),gc()()),e&2&&(Fy(2),Ep(" ",t.location," \xB7 ",t.startDate," \uFF5E ",t.endDate," \xB7 \u5171 ",t.days," \u5929 "));},dependencies:[qn$1,$n$1],styles:[".search-criteria-bar[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.75rem 1rem;border-radius:var(--mat-sys-corner-medium, 12px);background:var(--mat-sys-surface-container);color:var(--mat-sys-on-surface)}.search-criteria-bar[_ngcontent-%COMP%]   .criteria[_ngcontent-%COMP%]{font:var(--mat-sys-body-medium)}"]})};function bd(i,n){i&1&&(ii(0,"div",1),AE(1),gc()),i&2&&(Fy(),Ec("",n.name," \u5C08\u5C6C\u9810\u7D04"));}var mo=class i{route=C(ge);router=C(ot);catalog=C(Re);quote=C(Pt);context=C(Ke);partner=this.context.partner;params=Tn$1(this.route.queryParamMap.pipe(Ge(n=>({start:n.get("start")??"",end:n.get("end")??"",pickup:n.get("pickup")??"",return:n.get("return")??"",group:Hn(n.get("group"))}))),{initialValue:{start:"",end:"",pickup:"",return:"",group:void 0}});dateRange=JE(()=>{let{start:n,end:e,pickup:t,return:a,group:r}=this.params();return !n||!e?null:{startDateTime:n,endDateTime:e,pickupLocation:t||It,returnLocation:a||It,vehicleGroup:r}});startDate=JE(()=>this.params().start.slice(0,10));endDate=JE(()=>this.params().end.slice(0,10));days=JE(()=>this.quote.daysBetween(this.startDate(),this.endDate()));selectedVehicle=Mo$1(null);availableVehicles=JE(()=>{let n=this.dateRange();if(!n)return [];let e=this.catalog.availableVehicles(n.startDateTime,n.endDateTime);if(!n.vehicleGroup)return e;let t=zi[n.vehicleGroup];return e.filter(a=>t.includes(a.category))});priceForVehicle=n=>this.quote.vehicleTotal(n,{startDate:this.startDate(),endDate:this.endDate(),partnerDiscountPercent:this.partner()?.discountPercent});onDateRangeChange(n){this.selectedVehicle.set(null),this.router.navigate([],{relativeTo:this.route,queryParams:{start:n.startDateTime,end:n.endDateTime,pickup:n.pickupLocation,return:n.returnLocation,group:n.vehicleGroup??null},replaceUrl:true});}onVehicleSelect(n){let e=this.dateRange();e&&this.router.navigate([...this.context.basePath(),"order",n.id],{queryParams:{start:e.startDateTime,end:e.endDateTime,pickup:e.pickupLocation,return:e.returnLocation,group:e.vehicleGroup??null}});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-search-page"]],decls:8,vars:6,consts:[[1,"search-page"],[1,"partner-banner"],[1,"date-section"],[3,"dateRangeChange","dateRange"],[1,"vehicle-section"],[3,"vehicleSelect","vehicles","selectedVehicle","priceForVehicle","days"]],template:function(e,t){if(e&1&&(ii(0,"div",0),jI(1,bd,2,1,"div",1),ii(2,"h1"),AE(3,"\u79DF\u8ECA\u9810\u7D04"),gc(),ii(4,"section",2)(5,"app-date-step",3),tp("dateRangeChange",function(r){return t.onDateRangeChange(r)}),gc()(),ii(6,"section",4)(7,"app-vehicle-step",5),tp("vehicleSelect",function(r){return t.onVehicleSelect(r)}),gc()()()),e&2){let a;Fy(),VI((a=t.partner())?1:-1,a),Fy(4),Qf("dateRange",t.dateRange()),Fy(2),Qf("vehicles",t.availableVehicles())("selectedVehicle",t.selectedVehicle())("priceForVehicle",t.priceForVehicle)("days",t.days());}},dependencies:[Wn,$n],styles:[".search-page[_ngcontent-%COMP%]{max-width:960px;margin:0 auto;padding:24px}.search-page[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{margin-bottom:16px}.search-page[_ngcontent-%COMP%]   .date-section[_ngcontent-%COMP%]{margin-bottom:2rem}"]})};var yd=(i,n)=>n.id;function Cd(i,n){i&1&&(ii(0,"p"),AE(1,"\u76EE\u524D\u7121\u53EF\u52A0\u8CFC\u914D\u4EF6\u3002"),gc());}function Dd(i,n){if(i&1){let e=QI();ii(0,"div",1)(1,"div",2)(2,"span",3),AE(3),gc(),ii(4,"span",4),AE(5),gc()(),ii(6,"mat-form-field",5)(7,"mat-label"),AE(8,"\u6578\u91CF"),gc(),ii(9,"input",6),tp("ngModelChange",function(a){let r=$l$1(e).$implicit,o=tE();return Ul$1(o.onQtyInput(r.id,a))}),gc(),_v(),gc()();}if(i&2){let e=n.$implicit,t=tE();Fy(3),yp(e.name),Fy(2),vp("NT$ ",e.unitPrice," / ",t.unitLabel[e.unit]),Fy(4),Qf("ngModel",t.qtyOf(e.id)),Nv();}}var xd={per_rental:"\u6BCF\u7B46\u8A02\u55AE",per_day:"\u6BCF\u65E5"},Zn=class i{addOns=[];addOnQty={};addOnQtyChange=new Fe;unitLabel=xd;qtyOf(n){return this.addOnQty[n]??0}onQtyInput(n,e){let t=Math.max(0,Number(e)||0);this.addOnQtyChange.emit({addOnId:n,qty:t});}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-addon-step"]],inputs:{addOns:"addOns",addOnQty:"addOnQty"},outputs:{addOnQtyChange:"addOnQtyChange"},decls:4,vars:1,consts:[[1,"addon-step"],[1,"addon-row"],[1,"addon-info"],[1,"name"],[1,"price"],["appearance","outline",1,"qty-field"],["matInput","","type","number","min","0",3,"ngModelChange","ngModel"]],template:function(e,t){e&1&&(ii(0,"div",0),jI(1,Cd,2,0,"p"),BI(2,Dd,10,4,"div",1,yd),gc()),e&2&&(Fy(),VI(t.addOns.length===0?1:-1),Fy(),$I(t.addOns));},dependencies:[dt,Ne,Fi,lt,Si,Xe,se,xe,pe,Be,Le],styles:[".addon-step[_ngcontent-%COMP%]{padding:16px 0;max-width:480px}.addon-step[_ngcontent-%COMP%]   .addon-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:8px}.addon-step[_ngcontent-%COMP%]   .addon-info[_ngcontent-%COMP%]{display:flex;flex-direction:column}.addon-step[_ngcontent-%COMP%]   .addon-info[_ngcontent-%COMP%]   .name[_ngcontent-%COMP%]{font-weight:600}.addon-step[_ngcontent-%COMP%]   .addon-info[_ngcontent-%COMP%]   .price[_ngcontent-%COMP%]{font-size:.85em;opacity:.7}.addon-step[_ngcontent-%COMP%]   .qty-field[_ngcontent-%COMP%]{width:100px}"]})};function Md(i,n){if(i&1&&(ii(0,"p",4),AE(1),gc()),i&2){let e=tE(2);Fy(),Ec("\u512A\u60E0\u78BC\u53EF\u7528\uFF1A",e.couponResult.coupon?.code);}}function wd(i,n){if(i&1&&(ii(0,"p",5),AE(1),gc()),i&2){let e=tE(2);Fy(),yp(e.couponResult.reason);}}function kd(i,n){if(i&1&&jI(0,Md,2,1,"p",4)(1,wd,2,1,"p",5),i&2){let e=tE();VI(e.couponResult.ok?0:1);}}function Ed(i,n){if(i&1&&(ii(0,"div",6)(1,"span"),AE(2,"\u914D\u4EF6\u8CBB\u7528"),gc(),ii(3,"span"),AE(4),gc()()),i&2){let e=tE(2);Fy(4),Ec("NT$ ",e.priceBreakdown.addOnSubtotal);}}function Ad(i,n){if(i&1&&(ii(0,"div",7)(1,"span"),AE(2),gc(),ii(3,"span"),AE(4),gc()()),i&2){let e=tE(2);Fy(2),Ec("\u512A\u60E0\u6298\u62B5\uFF08",e.priceBreakdown.couponCode,"\uFF09"),Fy(2),Ec("-NT$ ",e.priceBreakdown.couponDiscount);}}function Sd(i,n){if(i&1&&(ii(0,"div",3)(1,"h3"),AE(2,"\u8A66\u7B97\u660E\u7D30"),gc(),ii(3,"div",6)(4,"span"),AE(5,"\u79DF\u91D1\u5C0F\u8A08"),gc(),ii(6,"span"),AE(7),gc()(),jI(8,Ed,5,1,"div",6),jI(9,Ad,5,2,"div",7),ii(10,"div",8)(11,"span"),AE(12,"\u7E3D\u8A08"),gc(),ii(13,"span"),AE(14),gc()()()),i&2){let e=tE();Fy(7),Ec("NT$ ",e.priceBreakdown.rentalSubtotal),Fy(),VI(e.priceBreakdown.addOnSubtotal>0?8:-1),Fy(),VI(e.priceBreakdown.couponDiscount>0?9:-1),Fy(5),Ec("NT$ ",e.priceBreakdown.total);}}function Vd(i,n){i&1&&(ii(0,"p"),AE(1,"\u8ACB\u5148\u5B8C\u6210\u524D\u9762\u6B65\u9A5F\u4EE5\u67E5\u770B\u8A66\u7B97\u3002"),gc());}var Xn=class i{couponCode="";couponResult=null;priceBreakdown=null;couponCodeChange=new Fe;onCodeInput(n){this.couponCodeChange.emit(n);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-coupon-step"]],inputs:{couponCode:"couponCode",couponResult:"couponResult",priceBreakdown:"priceBreakdown"},outputs:{couponCodeChange:"couponCodeChange"},decls:8,vars:3,consts:[[1,"coupon-step"],["appearance","outline"],["matInput","","placeholder","\u8F38\u5165\u512A\u60E0\u78BC",3,"ngModelChange","ngModel"],[1,"summary"],[1,"coupon-ok"],[1,"coupon-error"],[1,"line"],[1,"line","discount"],[1,"line","total"]],template:function(e,t){e&1&&(ii(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),AE(3,"\u512A\u60E0\u78BC"),gc(),ii(4,"input",2),tp("ngModelChange",function(r){return t.onCodeInput(r)}),gc(),_v(),gc(),jI(5,kd,2,1),jI(6,Sd,15,4,"div",3)(7,Vd,2,0,"p"),gc()),e&2&&(Fy(4),Qf("ngModel",t.couponCode),Nv(),Fy(),VI(t.couponResult?5:-1),Fy(),VI(t.priceBreakdown?6:7));},dependencies:[dt,Ne,lt,Xe,se,xe,pe,Be,Le],styles:[".coupon-step[_ngcontent-%COMP%]{padding:16px 0;max-width:400px}.coupon-step[_ngcontent-%COMP%]   .coupon-ok[_ngcontent-%COMP%]{color:#2e7d32}.coupon-step[_ngcontent-%COMP%]   .coupon-error[_ngcontent-%COMP%]{color:#c62828}.coupon-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]{margin-top:16px;border-top:1px solid rgba(0,0,0,.12);padding-top:12px}.coupon-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding:4px 0}.coupon-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .discount[_ngcontent-%COMP%]{color:#2e7d32}.coupon-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{font-weight:700;font-size:1.1em;border-top:1px solid rgba(0,0,0,.12);margin-top:8px;padding-top:8px}"]})};var Od=["input"],Fd=["formField"],Id=["*"],Jn=class{source;value;constructor(n,e){this.source=n,this.value=e;}},Td={provide:bt,useExisting:ro$1(()=>Xi),multi:true},po=new x("MatRadioGroup"),Rd=new x("mat-radio-default-options",{providedIn:"root",factory:()=>({color:"accent",disabledInteractive:false})}),Xi=(()=>{class i{_changeDetector=C(UP);_value=null;_name=C(di).getId("mat-radio-group-");_selected=null;_isInitialized=false;_labelPosition="after";_disabled=false;_required=false;_buttonChanges;_controlValueAccessorChangeFn=()=>{};onTouched=()=>{};change=new Fe;_radios;color;get name(){return this._name}set name(e){this._name=e,this._updateRadioButtonNames();}get labelPosition(){return this._labelPosition}set labelPosition(e){this._labelPosition=e==="before"?"before":"after",this._markRadiosForCheck();}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this._updateSelectedRadioFromValue(),this._checkSelectedRadioButton());}_checkSelectedRadioButton(){this._selected&&!this._selected.checked&&(this._selected.checked=true);}get selected(){return this._selected}set selected(e){this._selected=e,this.value=e?e.value:null,this._checkSelectedRadioButton();}get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._markRadiosForCheck();}get required(){return this._required}set required(e){this._required=e,this._markRadiosForCheck();}get disabledInteractive(){return this._disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e,this._markRadiosForCheck();}_disabledInteractive=false;ngAfterContentInit(){this._isInitialized=true,this._buttonChanges=this._radios.changes.subscribe(()=>{this.selected&&!this._radios.find(e=>e===this.selected)&&(this._selected=null);});}ngOnDestroy(){this._buttonChanges?.unsubscribe();}_touch(){this.onTouched&&this.onTouched();}_updateRadioButtonNames(){this._radios&&this._radios.forEach(e=>{e.name=this.name,e._markForCheck();});}_updateSelectedRadioFromValue(){let e=this._selected!==null&&this._selected.value===this._value;this._radios&&!e&&(this._selected=null,this._radios.forEach(t=>{t.checked=this.value===t.value,t.checked&&(this._selected=t);}));}_emitChangeEvent(){this._isInitialized&&this.change.emit(new Jn(this._selected,this._value));}_markRadiosForCheck(){this._radios&&this._radios.forEach(e=>e._markForCheck());}writeValue(e){this.value=e,this._changeDetector.markForCheck();}registerOnChange(e){this._controlValueAccessorChangeFn=e;}registerOnTouched(e){this.onTouched=e;}setDisabledState(e){this.disabled=e,this._changeDetector.markForCheck();}static \u0275fac=function(t){return new(t||i)};static \u0275dir=DI({type:i,selectors:[["mat-radio-group"]],contentQueries:function(t,a,r){if(t&1&&op$1(r,ei,5),t&2){let o;sE(o=aE())&&(a._radios=o);}},hostAttrs:["role","radiogroup",1,"mat-mdc-radio-group"],inputs:{color:"color",name:"name",labelPosition:"labelPosition",value:"value",selected:"selected",disabled:[2,"disabled","disabled",qP],required:[2,"required","required",qP],disabledInteractive:[2,"disabledInteractive","disabledInteractive",qP]},outputs:{change:"change"},exportAs:["matRadioGroup"],features:[BE([Td,{provide:po,useExisting:i}])]})}return i})(),ei=(()=>{class i{_elementRef=C(ar$1);_changeDetector=C(UP);_focusMonitor=C(Is$1);_radioDispatcher=C(Ri);_defaultOptions=C(Rd,{optional:true});_ngZone=C(be);_renderer=C(Dv);_uniqueId=C(di).getId("mat-radio-");_cleanupClick;id=this._uniqueId;name;ariaLabel;ariaLabelledby;ariaDescribedby;disableRipple=false;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked!==e&&(this._checked=e,e&&this.radioGroup&&this.radioGroup.value!==this.value?this.radioGroup.selected=this:!e&&this.radioGroup&&this.radioGroup.value===this.value&&(this.radioGroup.selected=null),e&&this._radioDispatcher.notify(this.id,this.name),this._changeDetector.markForCheck());}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this.radioGroup!==null&&(this.checked||(this.checked=this.radioGroup.value===e),this.checked&&(this.radioGroup.selected=this)));}get labelPosition(){return this._labelPosition||this.radioGroup&&this.radioGroup.labelPosition||"after"}set labelPosition(e){this._labelPosition=e;}_labelPosition;get disabled(){return this._disabled||this.radioGroup!==null&&this.radioGroup.disabled}set disabled(e){this._setDisabled(e);}get required(){return this._required||this.radioGroup&&this.radioGroup.required}set required(e){e!==this._required&&this._changeDetector.markForCheck(),this._required=e;}get color(){return this._color||this.radioGroup&&this.radioGroup.color||this._defaultOptions&&this._defaultOptions.color||"accent"}set color(e){this._color=e;}_color;get disabledInteractive(){return this._disabledInteractive||this.radioGroup!==null&&this.radioGroup.disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e;}_disabledInteractive;change=new Fe;radioGroup;get inputId(){return `${this.id||this._uniqueId}-input`}_checked=false;_disabled=false;_required=false;_value=null;_removeUniqueSelectionListener=()=>{};_previousTabIndex;_inputElement;_rippleTrigger;_noopAnimations=Un$1();_injector=C(he$1);constructor(){C(ke).load(Um);let e=C(po,{optional:true}),t=C(new Ap("tabindex"),{optional:true});this.radioGroup=e,this._disabledInteractive=this._defaultOptions?.disabledInteractive??false,t&&(this.tabIndex=GP(t,0));}focus(e,t){t?this._focusMonitor.focusVia(this._inputElement,t,e):this._inputElement.nativeElement.focus(e);}_markForCheck(){this._changeDetector.markForCheck();}ngOnInit(){this.radioGroup&&(this.checked=this.radioGroup.value===this._value,this.checked&&(this.radioGroup.selected=this),this.name=this.radioGroup.name),this._removeUniqueSelectionListener=this._radioDispatcher.listen((e,t)=>{e!==this.id&&t===this.name&&(this.checked=false);});}ngDoCheck(){this._updateTabIndex();}ngAfterViewInit(){this._updateTabIndex(),this._focusMonitor.monitor(this._elementRef,true).subscribe(e=>{!e&&this.radioGroup&&this.radioGroup._touch();}),this._ngZone.runOutsideAngular(()=>{this._cleanupClick=this._renderer.listen(this._inputElement.nativeElement,"click",this._onInputClick);});}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._removeUniqueSelectionListener();}_emitChangeEvent(){this.change.emit(new Jn(this,this._value));}_isRippleDisabled(){return this.disableRipple||this.disabled}_onInputInteraction(e){if(e.stopPropagation(),!this.checked&&!this.disabled){let t=this.radioGroup&&this.value!==this.radioGroup.value;this.checked=true,this._emitChangeEvent(),this.radioGroup&&(this.radioGroup._controlValueAccessorChangeFn(this.value),t&&this.radioGroup._emitChangeEvent());}}_onTouchTargetClick(e){this._onInputInteraction(e),(!this.disabled||this.disabledInteractive)&&this._inputElement?.nativeElement.focus();}_setDisabled(e){this._disabled!==e&&(this._disabled=e,this._changeDetector.markForCheck());}_onInputClick=e=>{this.disabled&&this.disabledInteractive&&e.preventDefault();};_updateTabIndex(){let e=this.radioGroup,t;if(!e||!e.selected||this.disabled?t=this.tabIndex:t=e.selected===this?this.tabIndex:-1,t!==this._previousTabIndex){let a=this._inputElement?.nativeElement;a&&(a.setAttribute("tabindex",t+""),this._previousTabIndex=t,py(()=>{queueMicrotask(()=>{e&&e.selected&&e.selected!==this&&document.activeElement===a&&(e.selected?._inputElement.nativeElement.focus(),document.activeElement===a&&this._inputElement.nativeElement.blur());});},{injector:this._injector}));}}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=mI({type:i,selectors:[["mat-radio-button"]],viewQuery:function(t,a){if(t&1&&ip(Od,5)(Fd,7,ar$1),t&2){let r;sE(r=aE())&&(a._inputElement=r.first),sE(r=aE())&&(a._rippleTrigger=r.first);}},hostAttrs:[1,"mat-mdc-radio-button"],hostVars:19,hostBindings:function(t,a){t&1&&tp("focus",function(){return a._inputElement.nativeElement.focus()}),t&2&&(zf("id",a.id)("tabindex",null)("aria-label",null)("aria-labelledby",null)("aria-describedby",null),dp$1("mat-primary",a.color==="primary")("mat-accent",a.color==="accent")("mat-warn",a.color==="warn")("mat-mdc-radio-checked",a.checked)("mat-mdc-radio-disabled",a.disabled)("mat-mdc-radio-disabled-interactive",a.disabledInteractive)("_mat-animation-noopable",a._noopAnimations));},inputs:{id:"id",name:"name",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],disableRipple:[2,"disableRipple","disableRipple",qP],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:GP(e)],checked:[2,"checked","checked",qP],value:"value",labelPosition:"labelPosition",disabled:[2,"disabled","disabled",qP],required:[2,"required","required",qP],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",qP]},outputs:{change:"change"},exportAs:["matRadioButton"],ngContentSelectors:Id,decls:13,vars:17,consts:[["formField",""],["input",""],["mat-internal-form-field","",3,"labelPosition"],[1,"mdc-radio"],["aria-hidden","true",1,"mat-mdc-radio-touch-target",3,"click"],["type","radio","aria-invalid","false",1,"mdc-radio__native-control",3,"change","id","checked","disabled","required"],["aria-hidden","true",1,"mdc-radio__background"],[1,"mdc-radio__outer-circle"],[1,"mdc-radio__inner-circle"],["mat-ripple","","aria-hidden","true",1,"mat-radio-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mat-ripple-element","mat-radio-persistent-ripple"],[1,"mdc-label",3,"for"]],template:function(t,a){t&1&&(rE(),ii(0,"div",2,0)(2,"div",3)(3,"div",4),tp("click",function(o){return a._onTouchTargetClick(o)}),gc(),ii(4,"input",5,1),tp("change",function(o){return a._onInputInteraction(o)}),gc(),ii(6,"div",6),Zf(7,"div",7)(8,"div",8),gc(),ii(9,"div",9),Zf(10,"div",10),gc()(),ii(11,"label",11),oE(12),gc()()),t&2&&(Qf("labelPosition",a.labelPosition),Fy(2),dp$1("mdc-radio--disabled",a.disabled),Fy(2),Qf("id",a.inputId)("checked",a.checked)("disabled",a.disabled&&!a.disabledInteractive)("required",a.required),zf("name",a.name)("value",a.value)("aria-label",a.ariaLabel)("aria-labelledby",a.ariaLabelledby)("aria-describedby",a.ariaDescribedby)("aria-disabled",a.disabled&&a.disabledInteractive?"true":null),Fy(5),Qf("matRippleTrigger",a._rippleTrigger.nativeElement)("matRippleDisabled",a._isRippleDisabled())("matRippleCentered",true),Fy(2),Qf("for",a.inputId));},dependencies:[Pm,$e],styles:[`.mat-mdc-radio-button {
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
`],encapsulation:2})}return i})(),ho=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=vI({type:i});static \u0275inj=yl$1({imports:[qm,ei,Ks$1]})}return i})();function Nd(i,n){if(i&1&&(ii(0,"mat-radio-button",7),AE(1),gc()),i&2){let e=n.$implicit,t=tE();Qf("value",e),Fy(),yp(t.paymentMethodLabel[e]);}}function Ld(i,n){if(i&1&&(ii(0,"p",8),AE(1),gc()),i&2){let e=tE();Fy(),yp(e.submitError);}}var Bd={credit_card:"\u4FE1\u7528\u5361",line_pay:"LINE Pay",on_site:"\u73FE\u5834\u4ED8\u6B3E",bank_transfer:"\u8F49\u5E33"},ti=class i{vehicle=null;startDate="";endDate="";selectedAddOnLines=[];priceBreakdown=null;submitting=false;submitError="";confirm=new Fe;paymentMethodLabel=Bd;paymentMethods=["credit_card","line_pay","on_site","bank_transfer"];form={name:"",phone:"",email:"",paymentMethod:"on_site"};get canSubmit(){return !!this.priceBreakdown&&this.form.name.trim().length>0&&this.form.phone.trim().length>0&&this.form.email.trim().length>0&&!this.submitting}onSubmit(){this.canSubmit&&this.confirm.emit(k({},this.form));}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-confirm-step"]],inputs:{vehicle:"vehicle",startDate:"startDate",endDate:"endDate",selectedAddOnLines:"selectedAddOnLines",priceBreakdown:"priceBreakdown",submitting:"submitting",submitError:"submitError"},outputs:{confirm:"confirm"},decls:25,vars:7,consts:[[1,"confirm-step"],[1,"form-grid"],["appearance","outline"],["matInput","","name","name",3,"ngModelChange","ngModel"],["matInput","","name","phone",3,"ngModelChange","ngModel"],["matInput","","type","email","name","email",3,"ngModelChange","ngModel"],["name","paymentMethod",3,"ngModelChange","ngModel"],[3,"value"],[1,"submit-error"],[1,"actions"],["mat-flat-button","","color","primary",3,"click","disabled"]],template:function(e,t){e&1&&(ii(0,"div",0)(1,"h3"),AE(2,"\u4ED8\u6B3E\u4EBA\u8CC7\u8A0A"),gc(),ii(3,"div",1)(4,"mat-form-field",2)(5,"mat-label"),AE(6,"\u59D3\u540D"),gc(),ii(7,"input",3),wp("ngModelChange",function(r){return FE(t.form.name,r)||(t.form.name=r),r}),gc(),_v(),gc(),ii(8,"mat-form-field",2)(9,"mat-label"),AE(10,"\u96FB\u8A71"),gc(),ii(11,"input",4),wp("ngModelChange",function(r){return FE(t.form.phone,r)||(t.form.phone=r),r}),gc(),_v(),gc(),ii(12,"mat-form-field",2)(13,"mat-label"),AE(14,"Email"),gc(),ii(15,"input",5),wp("ngModelChange",function(r){return FE(t.form.email,r)||(t.form.email=r),r}),gc(),_v(),gc()(),ii(16,"h3"),AE(17,"\u4ED8\u6B3E\u65B9\u5F0F"),gc(),ii(18,"mat-radio-group",6),wp("ngModelChange",function(r){return FE(t.form.paymentMethod,r)||(t.form.paymentMethod=r),r}),BI(19,Nd,2,2,"mat-radio-button",7,HI),gc(),_v(),jI(21,Ld,2,1,"p",8),ii(22,"div",9)(23,"button",10),tp("click",function(){return t.onSubmit()}),AE(24),gc()()()),e&2&&(Fy(7),Dp("ngModel",t.form.name),Nv(),Fy(4),Dp("ngModel",t.form.phone),Nv(),Fy(4),Dp("ngModel",t.form.email),Nv(),Fy(3),Dp("ngModel",t.form.paymentMethod),Nv(),Fy(),$I(t.paymentMethods),Fy(2),VI(t.submitError?21:-1),Fy(2),Qf("disabled",!t.canSubmit),Fy(),Ec(" ",t.submitting?"\u8655\u7406\u4E2D\u2026":"\u524D\u5F80\u4ED8\u6B3E"," "));},dependencies:[dt,Ne,lt,Xe,se,xe,pe,Be,Le,ho,Xi,ei,qn$1,$n$1],styles:[".confirm-step[_ngcontent-%COMP%]{padding:16px 0;max-width:480px}.confirm-step[_ngcontent-%COMP%]   .summary-block[_ngcontent-%COMP%]{margin-bottom:16px}.confirm-step[_ngcontent-%COMP%]   .add-on-item[_ngcontent-%COMP%]{margin-left:8px}.confirm-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]{margin-top:16px;border-top:1px solid rgba(0,0,0,.12);padding-top:12px}.confirm-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding:4px 0}.confirm-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .discount[_ngcontent-%COMP%]{color:#2e7d32}.confirm-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{font-weight:700;font-size:1.1em;border-top:1px solid rgba(0,0,0,.12);margin-top:8px;padding-top:8px}.confirm-step[_ngcontent-%COMP%]   .form-grid[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:8px;max-width:320px}.confirm-step[_ngcontent-%COMP%]   .submit-error[_ngcontent-%COMP%]{color:#c62828}.confirm-step[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%]{margin-top:16px}"]})};function zd(i,n){i&1&&(ii(0,"div",1),AE(1),gc()),i&2&&(Fy(),Ec("",n.name," \u5C08\u5C6C\u9810\u7D04"));}var fo=class i{route=C(ge);router=C(ot);catalog=C(Re);quote=C(Pt);context=C(Ke);vehicleRepo=C(op);partner=this.context.partner;vehicleId=Tn$1(this.route.paramMap.pipe(Ge(n=>n.get("vehicleId")??"")),{initialValue:""});params=Tn$1(this.route.queryParamMap.pipe(Ge(n=>({start:n.get("start")??"",end:n.get("end")??"",pickup:n.get("pickup")??"",return:n.get("return")??"",group:Hn(n.get("group"))}))),{initialValue:{start:"",end:"",pickup:"",return:"",group:void 0}});vehicle=JE(()=>this.vehicleRepo.getById(this.vehicleId())??null);startDate=JE(()=>this.params().start.slice(0,10));endDate=JE(()=>this.params().end.slice(0,10));pickupLocation=JE(()=>this.params().pickup);returnLocation=JE(()=>this.params().return);days=JE(()=>this.quote.daysBetween(this.startDate(),this.endDate()));addOnQty=Mo$1({});couponCode=Mo$1("");submitting=Mo$1(false);submitError=Mo$1("");addOns=JE(()=>this.catalog.addOns());selectedAddOnLines=JE(()=>{let n=this.addOnQty();return this.addOns().map(e=>({addOn:e,qty:n[e.id]??0})).filter(e=>e.qty>0)});couponResult=JE(()=>{let n=this.vehicle();return n?this.quote.validateCoupon(this.couponCode(),{startDate:this.startDate(),days:this.days(),category:n.category}):null});priceBreakdown=JE(()=>{let n=this.vehicle();if(!n)return null;let e=this.couponResult();return this.quote.quote({vehicle:n,startDate:this.startDate(),endDate:this.endDate(),addOnLines:this.selectedAddOnLines(),coupon:e?.ok?e.coupon:void 0,partnerDiscountPercent:this.partner()?.discountPercent})});guardEffect=du(()=>{this.ensureValidOrRedirect();});ensureValidOrRedirect(){return this.vehicle()&&this.startDate()&&this.endDate()&&this.pickupLocation()&&this.returnLocation()?true:(this.goToSearch(),false)}goToSearch(){let{start:n,end:e,pickup:t,return:a,group:r}=this.params();this.router.navigate([...this.context.basePath(),"search"],{queryParams:n&&e?{start:n,end:e,pickup:t,return:a,group:r??null}:{}});}onAddOnQtyChange(n,e){this.addOnQty.update(t=>l(k({},t),{[n]:e}));}onCouponCodeChange(n){this.couponCode.set(n);}onConfirmSubmit(n){if(!this.ensureValidOrRedirect())return;let e=this.vehicle(),{start:t,end:a,pickup:r,return:o}=this.params();this.submitting.set(true),this.submitError.set("");try{let g=this.couponResult(),S=this.catalog.submitBooking({vehicleId:e.id,startTime:t,endTime:a,pickupLocation:r,returnLocation:o,customer:{name:n.name,phone:n.phone,email:n.email},category:e.category,startDate:this.startDate(),endDate:this.endDate(),addOns:this.selectedAddOnLines(),couponCode:g?.ok?g.coupon?.code:void 0,paymentMethod:n.paymentMethod,partnerDiscountPercent:this.partner()?.discountPercent,sourcePartnerId:this.partner()?.id});this.router.navigate([...this.context.basePath(),"pay",S.id]);}catch(g){this.submitError.set(g instanceof Error?g.message:"\u9001\u51FA\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66");}finally{this.submitting.set(false);}}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-order-page"]],decls:19,vars:23,consts:[[1,"order-page"],[1,"partner-banner"],[3,"edit","pickupLocation","returnLocation","startDate","endDate","days"],[1,"checkout-layout"],[1,"checkout-main"],[3,"addOnQtyChange","addOns","addOnQty"],[3,"couponCodeChange","couponCode","couponResult","priceBreakdown"],[3,"confirm","vehicle","startDate","endDate","selectedAddOnLines","priceBreakdown","submitting","submitError"],[1,"checkout-aside"],[3,"vehicle","startDate","endDate","selectedAddOnLines","priceBreakdown"]],template:function(e,t){if(e&1&&(ii(0,"div",0),jI(1,zd,2,1,"div",1),ii(2,"h1"),AE(3,"\u586B\u5BEB\u8A02\u55AE"),gc(),ii(4,"app-search-criteria-bar",2),tp("edit",function(){return t.goToSearch()}),gc(),ii(5,"div",3)(6,"div",4)(7,"section")(8,"h2"),AE(9,"\u52A0\u8CFC\u914D\u4EF6"),gc(),ii(10,"app-addon-step",5),tp("addOnQtyChange",function(r){return t.onAddOnQtyChange(r.addOnId,r.qty)}),gc()(),ii(11,"section")(12,"h2"),AE(13,"\u512A\u60E0\u5238"),gc(),ii(14,"app-coupon-step",6),tp("couponCodeChange",function(r){return t.onCouponCodeChange(r)}),gc()(),ii(15,"section")(16,"app-confirm-step",7),tp("confirm",function(r){return t.onConfirmSubmit(r)}),gc()()(),ii(17,"aside",8),Zf(18,"app-order-summary-card",9),gc()()()),e&2){let a;Fy(),VI((a=t.partner())?1:-1,a),Fy(3),Qf("pickupLocation",t.pickupLocation())("returnLocation",t.returnLocation())("startDate",t.startDate())("endDate",t.endDate())("days",t.days()),Fy(6),Qf("addOns",t.addOns())("addOnQty",t.addOnQty()),Fy(4),Qf("couponCode",t.couponCode())("couponResult",t.couponResult())("priceBreakdown",t.priceBreakdown()),Fy(2),Qf("vehicle",t.vehicle())("startDate",t.startDate())("endDate",t.endDate())("selectedAddOnLines",t.selectedAddOnLines())("priceBreakdown",t.priceBreakdown())("submitting",t.submitting())("submitError",t.submitError()),Fy(2),Qf("vehicle",t.vehicle())("startDate",t.startDate())("endDate",t.endDate())("selectedAddOnLines",t.selectedAddOnLines())("priceBreakdown",t.priceBreakdown());}},dependencies:[Kn,Zn,Xn,ti,Qn],styles:[".order-page[_ngcontent-%COMP%]   .checkout-layout[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr;gap:2rem;margin-top:1.5rem}.order-page[_ngcontent-%COMP%]   .checkout-main[_ngcontent-%COMP%]   section[_ngcontent-%COMP%] + section[_ngcontent-%COMP%]{margin-top:2rem}@media(max-width:899.98px){.order-page[_ngcontent-%COMP%]   .checkout-main[_ngcontent-%COMP%]{padding-bottom:40vh}.order-page[_ngcontent-%COMP%]   .checkout-aside[_ngcontent-%COMP%]{position:fixed;inset:auto 0 0;max-height:40vh;overflow-y:auto;z-index:20;background:var(--mat-sys-surface-container-highest, #fff);border-top:1px solid var(--mat-sys-outline-variant, rgba(0, 0, 0, .12));box-shadow:var(--mat-sys-level2, 0 -2px 8px rgba(0, 0, 0, .12));padding:0 1rem}}@media(min-width:900px){.order-page[_ngcontent-%COMP%]   .checkout-layout[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr) 20rem;align-items:start}}"]})};function Hd(i,n){if(i&1&&(ii(0,"p",4),AE(1),gc()),i&2){let e=tE(2);Fy(),yp(e.payError());}}function jd(i,n){if(i&1){let e=QI();ii(0,"div",1)(1,"div",2)(2,"span"),AE(3,"\u8A02\u55AE\u7DE8\u865F"),gc(),ii(4,"span"),AE(5),gc()(),ii(6,"div",2)(7,"span"),AE(8,"\u4ED8\u6B3E\u65B9\u5F0F"),gc(),ii(9,"span"),AE(10),gc()(),ii(11,"div",3)(12,"span"),AE(13,"\u61C9\u4ED8\u91D1\u984D"),gc(),ii(14,"span"),AE(15),gc()()(),jI(16,Hd,2,1,"p",4),ii(17,"div",5)(18,"button",6),tp("click",function(){$l$1(e);let a=tE();return Ul$1(a.onPaySuccess())}),AE(19," \u6A21\u64EC\u4ED8\u6B3E\u6210\u529F "),gc(),ii(20,"button",7),tp("click",function(){$l$1(e);let a=tE();return Ul$1(a.onPayFailure())}),AE(21," \u6A21\u64EC\u4ED8\u6B3E\u5931\u6557 "),gc()(),ii(22,"p",8),AE(23,"\u6B64\u70BA\u4F54\u4F4D\u4ED8\u6B3E\u9801\uFF0C\u5C1A\u672A\u4E32\u63A5\u91D1\u6D41\u3002"),gc();}if(i&2){let e=tE();Fy(5),yp(n.id),Fy(5),yp(e.paymentMethodLabel()),Fy(5),Ec("NT$ ",e.amount()),Fy(),VI(e.payError()?16:-1),Fy(2),Qf("disabled",e.paying()),Fy(2),Qf("disabled",e.paying());}}function Gd(i,n){i&1&&(ii(0,"p"),AE(1,"\u67E5\u7121\u6B64\u8A02\u55AE\u3002"),gc());}var qd={credit_card:"\u4FE1\u7528\u5361",line_pay:"LINE Pay",on_site:"\u73FE\u5834\u4ED8\u6B3E",bank_transfer:"\u8F49\u5E33"},_o=class i{route=C(ge);router=C(ot);catalog=C(Re);context=C(Ke);bookingRepo=C(ap);bookingId=Tn$1(this.route.paramMap.pipe(Ge(n=>n.get("bookingId")??"")),{initialValue:""});booking=JE(()=>this.bookingRepo.getById(this.bookingId())??null);amount=JE(()=>this.booking()?.priceBreakdown?.total??0);paymentMethodLabel=JE(()=>{let n=this.booking()?.paymentMethod;return n?qd[n]:"\u672A\u6307\u5B9A"});payError=Mo$1("");paying=Mo$1(false);guardEffect=du(()=>{this.redirectIfNotPayable();});redirectIfNotPayable(){let n=this.booking();return n&&n.status==="pending_payment"?true:(this.goToDone(),false)}onPaySuccess(){this.paying.set(true),this.payError.set("");try{this.catalog.markBookingPaid(this.bookingId()),this.goToDone();}catch(n){this.payError.set(n instanceof Error?n.message:"\u4ED8\u6B3E\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66");}finally{this.paying.set(false);}}onPayFailure(){this.payError.set("\u4ED8\u6B3E\u672A\u5B8C\u6210\uFF0C\u8ACB\u91CD\u65B0\u5617\u8A66\u6216\u6539\u7528\u5176\u4ED6\u4ED8\u6B3E\u65B9\u5F0F\u3002");}goToDone(){let n=[...this.context.basePath(),"done",this.bookingId()];this.router.navigate(n);}static \u0275fac=function(e){return new(e||i)};static \u0275cmp=mI({type:i,selectors:[["app-payment-page"]],decls:5,vars:1,consts:[[1,"payment-page"],[1,"pay-summary"],[1,"line"],[1,"line","total"],[1,"pay-error"],[1,"actions"],["mat-flat-button","","color","primary",3,"click","disabled"],["mat-stroked-button","",3,"click","disabled"],[1,"placeholder-note"]],template:function(e,t){if(e&1&&(ii(0,"div",0)(1,"h1"),AE(2,"\u4ED8\u6B3E"),gc(),jI(3,jd,24,6)(4,Gd,2,0,"p"),gc()),e&2){let a;Fy(3),VI((a=t.booking())?3:4,a);}},dependencies:[qn$1,$n$1],styles:[".payment-page[_ngcontent-%COMP%]   .pay-summary[_ngcontent-%COMP%]{margin:1.5rem 0}.payment-page[_ngcontent-%COMP%]   .pay-summary[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding:.5rem 0}.payment-page[_ngcontent-%COMP%]   .pay-summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{font:var(--mat-sys-title-medium)}.payment-page[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%]{display:flex;gap:.75rem}.payment-page[_ngcontent-%COMP%]   .pay-error[_ngcontent-%COMP%]{color:var(--mat-sys-error)}.payment-page[_ngcontent-%COMP%]   .placeholder-note[_ngcontent-%COMP%]{margin-top:1rem;color:var(--mat-sys-on-surface-variant);font:var(--mat-sys-body-small)}"]})};export{Ke as BOOKING_CONTEXT,Re as CatalogStore,It as DEFAULT_LOCATION,Wn as DateStepComponent,Ja as DoneComponent,Zr as LOCATIONS,fo as OrderPageComponent,Qn as OrderSummaryCardComponent,_o as PaymentPageComponent,Pt as QuoteService,Kn as SearchCriteriaBarComponent,mo as SearchPageComponent,zi as VEHICLE_GROUP_CATEGORIES,$n as VehicleStepComponent,Do as createPartnerBookingContext,Hn as toVehicleGroup};
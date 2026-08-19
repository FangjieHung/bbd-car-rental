import{$ as Ve,$a as K,$b as Qi,A as Ka,Aa as ne,B as s,Ba as De,C as Hn,Ca as g,Cb as Ye,D as P,Da as Bt,Db as wt,E as T,Ea as p,Eb as Un,F as dt,Fa as he,Fb as fe,G as Gi,Ga as Y,Gb as Xi,H as X,Ha as yt,Hb as fr,I as Se,Ia as oe,Ib as we,J as Kt,Ja as O,Jb as $n,K as v,Ka as R,Kb as mt,L as H,La as ar,Lb as fn,Ma as Yn,Mb as _n,N as x,Na as pn,Nb as Zt,O as Qa,Oa as Ze,Ob as _r,P as ve,Pa as hn,Pb as Oe,Q as Za,Qa as I,Qb as Xn,R as ee,Ra as Je,Rb as gr,S as Ke,Sa as m,Sb as br,T as te,Ta as N,Tb as vr,U as F,Ua as E,Ub as yr,V as Ja,Va as et,Vb as Pe,W as Ee,Wa as Gn,Wb as Kn,X as l,Xa as rr,Xb as _e,Y as un,Ya as ze,Yb as Cr,Z as ct,Za as He,Zb as xr,_ as $,_a as je,_b as Ki,a as W,aa as Fe,ab as qi,ac as J,b as xe,ba as Q,bb as Ui,bc as ut,c as pe,ca as er,cb as Wn,cc as Dr,d as Bn,da as Qe,db as M,dc as Jt,e as L,ea as tr,eb as ue,ec as Qn,f as Wa,fa as Wi,fb as Ct,fc as wr,g as qa,ga as D,gb as qn,gc as kt,h as Xt,ha as U,hb as ie,hc as kr,i as be,ia as V,ib as or,ic as Mr,j as Ua,ja as nr,jb as zt,jc as ke,k as $a,ka as re,kb as sr,kc as ge,l as lt,la as Ie,lb as lr,lc as Zn,m as Le,ma as jn,mb as Z,mc as Zi,n as zi,na as B,nb as S,nc as Sr,o as Hi,oa as y,ob as xt,oc as Jn,p as ji,pa as C,pb as dr,pc as Er,q as Yi,qa as ir,qb as cr,qc as ei,r as Xe,ra as ce,rb as $i,rc as Ar,s as zn,sa as me,sb as mr,sc as en,t as ae,ta as b,tb as ur,tc as Or,u as Xa,ua as d,ub as pr,uc as Rr,v as Nt,va as c,vc as Vr,w as Be,wa as j,wb as Dt,wc as Fr,x as Lt,xa as f,y as q,ya as _,yb as Qt,z as A,za as Ae,zb as hr}from"./chunk-CX7JM6LA.js";function pt(a,n){let t=!n?.manualCleanup?n?.injector?.get(Kt)??s(Kt):null,i=ws(n?.equal),r;n?.requireSync?r=x({kind:0},{equal:i}):r=x({kind:1,value:n?.initialValue},{equal:i});let o,u=a.subscribe({next:h=>r.set({kind:1,value:h}),error:h=>{r.set({kind:2,error:h}),o?.()},complete:()=>{o?.()}});if(n?.requireSync&&r().kind===0)throw new Nt(601,!1);return o=t?.onDestroy(u.unsubscribe.bind(u)),M(()=>{let h=r();switch(h.kind){case 1:return h.value;case 2:throw h.error;case 0:throw new Nt(601,!1)}},{equal:n?.equal})}function ws(a=Object.is){return(n,e)=>n.kind===1&&e.kind===1&&a(n.value,e.value)}function Ir(a,n){return a>=n.start&&a<=n.end}function Pr(a,n){if(n.peakSeasons.some(t=>Ir(a,t)))return"peak";if(n.holidays.some(t=>Ir(a,t)))return"holiday";let e=new Date(a+"T00:00:00").getDay();return e===0||e===6?"weekend":"weekday"}function ks(a,n){let e=[],t=new Date(a+"T00:00:00"),i=new Date(n+"T00:00:00");for(;t<i;){let r=o=>String(o).padStart(2,"0");e.push(`${t.getFullYear()}-${r(t.getMonth()+1)}-${r(t.getDate())}`),t.setDate(t.getDate()+1)}return e}function Ms(a,n){let e=a.filter(t=>n>=t.minDays).sort((t,i)=>i.minDays-t.minDays);return e.length?e[0].discountPercent:0}function Ji(a,n){return!(n.startDate<a.validFrom||n.startDate>a.validTo||a.minDays!==void 0&&n.days<a.minDays||a.applicableCategories&&!a.applicableCategories.includes(n.category))}function Tr(a){let{plan:n,calendar:e,startDate:t,endDate:i,addOns:r,coupon:o}=a,u=ks(t,i),h=u.length,w=u.map(Re=>{let st=Pr(Re,e);return{date:Re,dayType:st,price:n.dayTypeRates[st]}}),k=w.reduce((Re,st)=>Re+st.price,0),z=Ms(n.tiers,h),se=Math.round(k*z/100),le=k-se,de=a.partnerDiscountPercent??0,Ce=Math.round(le*de/100),$t=le-Ce,ja=r.filter(Re=>Re.qty>0).map(({addOn:Re,qty:st})=>({addOnId:Re.id,name:Re.name,qty:st,amount:Re.unitPrice*st*(Re.unit==="per_day"?h:1)})),Ya=ja.reduce((Re,st)=>Re+st.amount,0),Bi=0,Ga;o&&Ji(o,{startDate:t,days:h,category:n.appliesToCategory})&&(Bi=o.type==="percent"?Math.round($t*o.value/100):Math.min(o.value,$t),Ga=o.code);let Ds=$t-Bi+Ya;return{dailyLines:w,rentalRaw:k,tierDiscountPercent:z,tierDiscountAmount:se,rentalSubtotal:le,partnerDiscountPercent:de,partnerDiscount:Ce,addOnLines:ja,addOnSubtotal:Ya,couponCode:Ga,couponDiscount:Bi,total:Ds}}function Nr(a,n,e,t){return a<t&&e<n}var Ss=["pending_payment","confirmed","in_progress"];function ea(a){return a.vehicle.status==="maintenance"?!1:!a.bookings.some(n=>n.vehicleId===a.vehicle.id&&Ss.includes(n.status)&&Nr(a.startTime,a.endTime,n.startTime,n.endTime))}var Es={partner:x(null),basePath:x(["/"])},ht=new A("BOOKING_CONTEXT",{providedIn:"root",factory:()=>Es});function As(a,n){return{partner:a,basePath:M(()=>["/p",n()])}}function jm(a,n){return{provide:ht,useValue:As(a,n)}}var Lr=class a{route=s(Dt);context=s(ht);bookingRepo=s(en);bookingId=pt(this.route.paramMap.pipe(be(n=>n.get("id")??"")),{initialValue:""});booking=M(()=>this.bookingRepo.getById(this.bookingId())??null);statusMessage=M(()=>this.booking()?.status==="confirmed"?"\u60A8\u7684\u8A02\u55AE\u5DF2\u6210\u7ACB\u4E26\u78BA\u8A8D\uFF0C\u6211\u5011\u5C07\u76E1\u5FEB\u70BA\u60A8\u6E96\u5099\u8ECA\u8F1B\u3002":"\u60A8\u7684\u8A02\u55AE\u5DF2\u6210\u7ACB\uFF0C\u72C0\u614B\u70BA\u300C\u5F85\u4ED8\u6B3E/\u5F85\u4EBA\u5DE5\u78BA\u8A8D\u300D\uFF0C\u6211\u5011\u5C07\u76E1\u5FEB\u70BA\u60A8\u8655\u7406\u3002");homeLink=this.context.basePath;static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-booking-done"]],decls:9,vars:3,consts:[[1,"done-page"],[1,"booking-id"],[3,"routerLink"]],template:function(e,t){e&1&&(d(0,"div",0)(1,"h1"),m(2,"\u8A02\u55AE\u6210\u7ACB"),c(),d(3,"p"),m(4),c(),d(5,"p",1),m(6),c(),d(7,"a",2),m(8,"\u8FD4\u56DE\u9996\u9801"),c()()),e&2&&(l(4),N(t.statusMessage()),l(2),E("\u8A02\u55AE\u7DE8\u865F\uFF1A",t.bookingId()),l(),b("routerLink",t.homeLink()))},dependencies:[hr],styles:[".done-page[_ngcontent-%COMP%]{padding:32px 16px;max-width:480px;text-align:center}.done-page[_ngcontent-%COMP%]   .booking-id[_ngcontent-%COMP%]{font-weight:700;margin:16px 0}"]})};var tt=class a{vehicleRepo=s(ei);bookingRepo=s(en);customerRepo=s(Ar);planRepo=s(Or);calRepo=s(Rr);addOnRepo=s(Vr);couponRepo=s(Fr);availableVehicles(n,e){let t=this.bookingRepo.getAll();return this.vehicleRepo.getAll().filter(i=>ea({vehicle:i,startTime:n,endTime:e,bookings:t}))}planForCategory(n){return this.planRepo.getAll().find(e=>e.appliesToCategory===n)}addOns(){return this.addOnRepo.getAll()}price(n){let e=this.planForCategory(n.category);if(!e)throw new Error("\u7121\u6B64\u8ECA\u578B\u5B9A\u50F9");return Tr(W({plan:e,calendar:this.calRepo.getAll()[0]},n))}validateCoupon(n,e){let t=this.couponRepo.getAll().find(i=>i.code.toLowerCase()===n.trim().toLowerCase());return t?Ji(t,e)?{ok:!0,coupon:t}:{ok:!1,reason:"\u4E0D\u7B26\u4F7F\u7528\u689D\u4EF6"}:{ok:!1,reason:"\u67E5\u7121\u6B64\u512A\u60E0\u78BC"}}submitBooking(n){let e=this.vehicleRepo.getById(n.vehicleId);if(!e)throw new Error("\u67E5\u7121\u8ECA\u8F1B");if(!ea({vehicle:e,startTime:n.startTime,endTime:n.endTime,bookings:this.bookingRepo.getAll()}))throw new Error("\u8ECA\u8F1B\u5DF2\u88AB\u9810\u7D04");let t=n.couponCode?this.couponRepo.getAll().find(u=>u.code.toLowerCase()===n.couponCode.toLowerCase()):void 0,i=this.price({category:n.category,startDate:n.startDate,endDate:n.endDate,addOns:n.addOns,coupon:t,partnerDiscountPercent:n.partnerDiscountPercent}),r={id:crypto.randomUUID(),name:n.customer.name,phone:n.customer.phone,note:n.customer.email};this.customerRepo.create(r);let o=W({id:crypto.randomUUID(),vehicleId:n.vehicleId,customerId:r.id,startTime:n.startTime,endTime:n.endTime,pickupLocation:n.pickupLocation,returnLocation:n.returnLocation,status:"pending_payment",addOns:n.addOns.filter(u=>u.qty>0).map(u=>({addOnId:u.addOn.id,qty:u.qty})),couponCode:i.couponCode,priceBreakdown:i,paymentMethod:n.paymentMethod},n.sourcePartnerId?{sourcePartnerId:n.sourcePartnerId}:{});return this.bookingRepo.create(o),o}markBookingPaid(n){let e=this.bookingRepo.getById(n);if(!e)throw new Error("\u67E5\u7121\u8A02\u55AE");if(e.status!=="pending_payment")throw new Error("\u8A02\u55AE\u72C0\u614B\u4E0D\u5141\u8A31\u4ED8\u6B3E");return this.bookingRepo.update(n,{status:"confirmed"})}static \u0275fac=function(e){return new(e||a)};static \u0275prov=Lt({token:a,factory:a.\u0275fac,providedIn:"root"})};var Ur=(()=>{class a{_renderer;_elementRef;onChange=e=>{};onTouched=()=>{};constructor(e,t){this._renderer=e,this._elementRef=t}setProperty(e,t){this._renderer.setProperty(this._elementRef.nativeElement,e,t)}registerOnTouched(e){this.onTouched=e}registerOnChange(e){this.onChange=e}setDisabledState(e){this.setProperty("disabled",e)}static \u0275fac=function(t){return new(t||a)(Q($),Q(F))};static \u0275dir=V({type:a})}return a})(),$r=(()=>{class a extends Ur{static \u0275fac=(()=>{let e;return function(i){return(e||(e=Ke(a)))(i||a)}})();static \u0275dir=V({type:a,features:[re]})}return a})(),jt=new A("");var Os={provide:jt,useExisting:Be(()=>it),multi:!0};function Rs(){let a=$i()?$i().getUserAgent():"";return/android (\d+)/.test(a.toLowerCase())}var Vs=new A(""),it=(()=>{class a extends Ur{_compositionMode;_composing=!1;constructor(e,t,i){super(e,t),this._compositionMode=i,this._compositionMode==null&&(this._compositionMode=!Rs())}writeValue(e){let t=e??"";this.setProperty("value",t)}_handleInput(e){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(e)}_compositionStart(){this._composing=!0}_compositionEnd(e){this._composing=!1,this._compositionMode&&this.onChange(e)}static \u0275fac=function(t){return new(t||a)(Q($),Q(F),Q(Vs,8))};static \u0275dir=V({type:a,selectors:[["input","formControlName","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControlName","",3,"ngNoCva",""],["input","formControl","",3,"type","checkbox",3,"ngNoCva",""],["textarea","formControl","",3,"ngNoCva",""],["input","ngModel","",3,"type","checkbox",3,"ngNoCva",""],["textarea","ngModel","",3,"ngNoCva",""],["","ngDefaultControl",""]],hostBindings:function(t,i){t&1&&g("input",function(o){return i._handleInput(o.target.value)})("blur",function(){return i.onTouched()})("compositionstart",function(){return i._compositionStart()})("compositionend",function(o){return i._compositionEnd(o.target.value)})},standalone:!1,features:[K([Os]),re]})}return a})();function aa(a){return a==null||ra(a)===0}function ra(a){return a==null?null:Array.isArray(a)||typeof a=="string"?a.length:a instanceof Set?a.size:null}var Yt=new A(""),oa=new A(""),Fs=/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,ft=class{static min(n){return Xr(n)}static max(n){return Is(n)}static required(n){return Kr(n)}static requiredTrue(n){return Ps(n)}static email(n){return Ts(n)}static minLength(n){return Ns(n)}static maxLength(n){return Ls(n)}static pattern(n){return Bs(n)}static nullValidator(n){return ni()}static compose(n){return no(n)}static composeAsync(n){return io(n)}};function Xr(a){return n=>{if(n.value==null||a==null)return null;let e=parseFloat(n.value);return!isNaN(e)&&e<a?{min:{min:a,actual:n.value}}:null}}function Is(a){return n=>{if(n.value==null||a==null)return null;let e=parseFloat(n.value);return!isNaN(e)&&e>a?{max:{max:a,actual:n.value}}:null}}function Kr(a){return aa(a.value)?{required:!0}:null}function Ps(a){return a.value===!0?null:{required:!0}}function Ts(a){return aa(a.value)||Fs.test(a.value)?null:{email:!0}}function Ns(a){return n=>{let e=n.value?.length??ra(n.value);return e===null||e===0?null:e<a?{minlength:{requiredLength:a,actualLength:e}}:null}}function Ls(a){return n=>{let e=n.value?.length??ra(n.value);return e!==null&&e>a?{maxlength:{requiredLength:a,actualLength:e}}:null}}function Bs(a){if(!a)return ni;let n,e;return typeof a=="string"?(e="",a.charAt(0)!=="^"&&(e+="^"),e+=a,a.charAt(a.length-1)!=="$"&&(e+="$"),n=new RegExp(e)):(e=a.toString(),n=a),t=>{if(aa(t.value))return null;let i=t.value;return n.test(i)?null:{pattern:{requiredPattern:e,actualValue:i}}}}function ni(a){return null}function Qr(a){return a!=null}function Zr(a){return tr(a)?qa(a):a}function Jr(a){let n={};return a.forEach(e=>{n=e!=null?W(W({},n),e):n}),Object.keys(n).length===0?null:n}function eo(a,n){return n.map(e=>e(a))}function zs(a){return!a.validate}function to(a){return a.map(n=>zs(n)?n:e=>n.validate(e))}function no(a){if(!a)return null;let n=a.filter(Qr);return n.length==0?null:function(e){return Jr(eo(e,n))}}function sa(a){return a!=null?no(to(a)):null}function io(a){if(!a)return null;let n=a.filter(Qr);return n.length==0?null:function(e){let t=eo(e,n).map(Zr);return $a(t).pipe(be(Jr))}}function la(a){return a!=null?io(to(a)):null}function Br(a,n){return a===null?[n]:Array.isArray(a)?[...a,n]:[a,n]}function ao(a){return a._rawValidators}function ro(a){return a._rawAsyncValidators}function ta(a){return a?Array.isArray(a)?a:[a]:[]}function ii(a,n){return Array.isArray(a)?a.includes(n):a===n}function zr(a,n){let e=ta(n);return ta(a).forEach(i=>{ii(e,i)||e.push(i)}),e}function Hr(a,n){return ta(n).filter(e=>!ii(a,e))}var ai=class{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(n){this._rawValidators=n||[],this._composedValidatorFn=sa(this._rawValidators)}_setAsyncValidators(n){this._rawAsyncValidators=n||[],this._composedAsyncValidatorFn=la(this._rawAsyncValidators)}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(n){this._onDestroyCallbacks.push(n)}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(n=>n()),this._onDestroyCallbacks=[]}reset(n=void 0){this.control?.reset(n)}hasError(n,e){return this.control?this.control.hasError(n,e):!1}getError(n,e){return this.control?this.control.getError(n,e):null}},Ht=class extends ai{name;get formDirective(){return null}get path(){return null}};var gn="VALID",ti="INVALID",tn="PENDING",bn="DISABLED",Mt=class{},ri=class extends Mt{value;source;constructor(n,e){super(),this.value=n,this.source=e}},yn=class extends Mt{pristine;source;constructor(n,e){super(),this.pristine=n,this.source=e}},Cn=class extends Mt{touched;source;constructor(n,e){super(),this.touched=n,this.source=e}},nn=class extends Mt{status;source;constructor(n,e){super(),this.status=n,this.source=e}},oi=class extends Mt{source;constructor(n){super(),this.source=n}},an=class extends Mt{source;constructor(n){super(),this.source=n}};function oo(a){return(mi(a)?a.validators:a)||null}function Hs(a){return Array.isArray(a)?sa(a):a||null}function so(a,n){return(mi(n)?n.asyncValidators:a)||null}function js(a){return Array.isArray(a)?la(a):a||null}function mi(a){return a!=null&&!Array.isArray(a)&&typeof a=="object"}function Ys(a,n,e){let t=a.controls;if(!(n?Object.keys(t):t).length)throw new Nt(1e3,"");if(!lo(t,e))throw new Nt(1001,"")}function Gs(a,n,e){a._forEachChild((t,i)=>{if(e[i]===void 0)throw new Nt(-1002,"")})}var si=class{_pendingDirty=!1;_hasOwnPendingAsyncValidator=null;_pendingTouched=!1;_onCollectionChange=()=>{};_updateOn;_hasRequired=x(!1);_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(n,e){this._assignValidators(n),this._assignAsyncValidators(e)}get validator(){return this._composedValidatorFn}set validator(n){this._rawValidators=this._composedValidatorFn=n,this._updateHasRequiredValidator()}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(n){this._rawAsyncValidators=this._composedAsyncValidatorFn=n}get parent(){return this._parent}get status(){return ue(this.statusReactive)}set status(n){ue(()=>this.statusReactive.set(n))}_status=M(()=>this.statusReactive());statusReactive=x(void 0);get valid(){return this.status===gn}get invalid(){return this.status===ti}get pending(){return this.status===tn}get disabled(){return this.status===bn}get enabled(){return this.status!==bn}errors;get pristine(){return ue(this.pristineReactive)}set pristine(n){ue(()=>this.pristineReactive.set(n))}_pristine=M(()=>this.pristineReactive());pristineReactive=x(!0);get dirty(){return!this.pristine}get touched(){return ue(this.touchedReactive)}set touched(n){ue(()=>this.touchedReactive.set(n))}_touched=M(()=>this.touchedReactive());touchedReactive=x(!1);get untouched(){return!this.touched}_events=new L;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:"change"}setValidators(n){this._assignValidators(n)}setAsyncValidators(n){this._assignAsyncValidators(n)}addValidators(n){this.setValidators(zr(n,this._rawValidators))}addAsyncValidators(n){this.setAsyncValidators(zr(n,this._rawAsyncValidators))}removeValidators(n){this.setValidators(Hr(n,this._rawValidators))}removeAsyncValidators(n){this.setAsyncValidators(Hr(n,this._rawAsyncValidators))}hasValidator(n){return ii(this._rawValidators,n)}hasAsyncValidator(n){return ii(this._rawAsyncValidators,n)}clearValidators(){this.validator=null}clearAsyncValidators(){this.asyncValidator=null}markAsTouched(n={}){let e=this.touched===!1;this.touched=!0;let t=n.sourceControl??this;n.onlySelf||this._parent?.markAsTouched(xe(W({},n),{sourceControl:t})),e&&n.emitEvent!==!1&&this._events.next(new Cn(!0,t))}markAllAsDirty(n={}){this.markAsDirty({onlySelf:!0,emitEvent:n.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsDirty(n))}markAllAsTouched(n={}){this.markAsTouched({onlySelf:!0,emitEvent:n.emitEvent,sourceControl:this}),this._forEachChild(e=>e.markAllAsTouched(n))}markAsUntouched(n={}){let e=this.touched===!0;this.touched=!1,this._pendingTouched=!1;let t=n.sourceControl??this;this._forEachChild(i=>{i.markAsUntouched({onlySelf:!0,emitEvent:n.emitEvent,sourceControl:t})}),n.onlySelf||this._parent?._updateTouched(n,t),e&&n.emitEvent!==!1&&this._events.next(new Cn(!1,t))}markAsDirty(n={}){let e=this.pristine===!0;this.pristine=!1;let t=n.sourceControl??this;n.onlySelf||this._parent?.markAsDirty(xe(W({},n),{sourceControl:t})),e&&n.emitEvent!==!1&&this._events.next(new yn(!1,t))}markAsPristine(n={}){let e=this.pristine===!1;this.pristine=!0,this._pendingDirty=!1;let t=n.sourceControl??this;this._forEachChild(i=>{i.markAsPristine({onlySelf:!0,emitEvent:n.emitEvent})}),n.onlySelf||this._parent?._updatePristine(n,t),e&&n.emitEvent!==!1&&this._events.next(new yn(!0,t))}markAsPending(n={}){this.status=tn;let e=n.sourceControl??this;n.emitEvent!==!1&&(this._events.next(new nn(this.status,e)),this.statusChanges.emit(this.status)),n.onlySelf||this._parent?.markAsPending(xe(W({},n),{sourceControl:e}))}disable(n={}){let e=this._parentMarkedDirty(n.onlySelf);this.status=bn,this.errors=null,this._forEachChild(i=>{i.disable(xe(W({},n),{onlySelf:!0}))}),this._updateValue();let t=n.sourceControl??this;n.emitEvent!==!1&&(this._events.next(new ri(this.value,t)),this._events.next(new nn(this.status,t)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(xe(W({},n),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(i=>i(!0))}enable(n={}){let e=this._parentMarkedDirty(n.onlySelf);this.status=gn,this._forEachChild(t=>{t.enable(xe(W({},n),{onlySelf:!0}))}),this.updateValueAndValidity({onlySelf:!0,emitEvent:n.emitEvent}),this._updateAncestors(xe(W({},n),{skipPristineCheck:e}),this),this._onDisabledChange.forEach(t=>t(!1))}_updateAncestors(n,e){n.onlySelf||(this._parent?.updateValueAndValidity(n),n.skipPristineCheck||this._parent?._updatePristine({},e),this._parent?._updateTouched({},e))}setParent(n){this._parent=n}getRawValue(){return this.value}updateValueAndValidity(n={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let t=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===gn||this.status===tn)&&this._runAsyncValidator(t,n.emitEvent)}let e=n.sourceControl??this;n.emitEvent!==!1&&(this._events.next(new ri(this.value,e)),this._events.next(new nn(this.status,e)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),n.onlySelf||this._parent?.updateValueAndValidity(xe(W({},n),{sourceControl:e}))}_updateTreeValidity(n={emitEvent:!0}){this._forEachChild(e=>e._updateTreeValidity(n)),this.updateValueAndValidity({onlySelf:!0,emitEvent:n.emitEvent})}_setInitialStatus(){this.status=this._allControlsDisabled()?bn:gn}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(n,e){if(this.asyncValidator){this.status=tn,this._hasOwnPendingAsyncValidator={emitEvent:e!==!1,shouldHaveEmitted:n!==!1};let t=Zr(this.asyncValidator(this));this._asyncValidationSubscription=t.subscribe(i=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(i,{emitEvent:e,shouldHaveEmitted:n})})}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let n=(this._hasOwnPendingAsyncValidator?.emitEvent||this._hasOwnPendingAsyncValidator?.shouldHaveEmitted)??!1;return this._hasOwnPendingAsyncValidator=null,n}return!1}setErrors(n,e={}){this.errors=n,this._updateControlsErrors(e.emitEvent!==!1,this,e.shouldHaveEmitted)}get(n){let e=n;return e==null||(Array.isArray(e)||(e=e.split(".")),e.length===0)?null:e.reduce((t,i)=>t&&t._find(i),this)}getError(n,e){let t=e?this.get(e):this;return t?.errors?t.errors[n]:null}hasError(n,e){return!!this.getError(n,e)}get root(){let n=this;for(;n._parent;)n=n._parent;return n}_updateControlsErrors(n,e,t){this.status=this._calculateStatus(),n&&this.statusChanges.emit(this.status),(n||t)&&this._events.next(new nn(this.status,e)),this._parent&&this._parent._updateControlsErrors(n,e,t)}_initObservables(){this.valueChanges=new v,this.statusChanges=new v}_calculateStatus(){return this._allControlsDisabled()?bn:this.errors?ti:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(tn)?tn:this._anyControlsHaveStatus(ti)?ti:gn}_anyControlsHaveStatus(n){return this._anyControls(e=>e.status===n)}_anyControlsDirty(){return this._anyControls(n=>n.dirty)}_anyControlsTouched(){return this._anyControls(n=>n.touched)}_updatePristine(n,e){let t=!this._anyControlsDirty(),i=this.pristine!==t;this.pristine=t,n.onlySelf||this._parent?._updatePristine(n,e),i&&this._events.next(new yn(this.pristine,e))}_updateTouched(n={},e){this.touched=this._anyControlsTouched(),this._events.next(new Cn(this.touched,e)),n.onlySelf||this._parent?._updateTouched(n,e)}_onDisabledChange=[];_registerOnCollectionChange(n){this._onCollectionChange=n}_setUpdateStrategy(n){mi(n)&&n.updateOn!=null&&(this._updateOn=n.updateOn)}_parentMarkedDirty(n){return!n&&!!this._parent?.dirty&&!this._parent._anyControlsDirty()}_find(n){return null}_assignValidators(n){this._rawValidators=Array.isArray(n)?n.slice():n,this._composedValidatorFn=Hs(this._rawValidators),this._updateHasRequiredValidator()}_assignAsyncValidators(n){this._rawAsyncValidators=Array.isArray(n)?n.slice():n,this._composedAsyncValidatorFn=js(this._rawAsyncValidators)}_updateHasRequiredValidator(){ue(()=>this._hasRequired.set(this.hasValidator(ft.required)))}};function lo(a,n){return Object.hasOwn(a,n)}function Ws(a){return a.tagName==="INPUT"||a.tagName==="SELECT"||a.tagName==="TEXTAREA"}function qs(a,n,e,t){switch(e){case"name":a.setAttribute(n,e,t);break;case"disabled":case"readonly":case"required":t?a.setAttribute(n,e,""):a.removeAttribute(n,e);break;case"max":case"min":case"minLength":case"maxLength":t!==void 0?a.setAttribute(n,e,t.toString()):a.removeAttribute(n,e);break}}var na=class{kind;context;control;message;constructor({kind:n,context:e,control:t}){this.kind=n,this.context=e,this.control=t}};function Us(a){return typeof a=="number"?a:parseFloat(a)}var co=(()=>{class a{_validator=ni;_onChange;_enabled;ngOnChanges(e){if(this.inputName in e){let t=this.normalizeInput(e[this.inputName].currentValue);this._enabled=this.enabled(t),this._validator=this._enabled?this.createValidator(t):ni,this._onChange?.()}}validate(e){return this._validator(e)}registerOnValidatorChange(e){this._onChange=e}enabled(e){return e!=null}static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,features:[ee]})}return a})();var $s={provide:Yt,useExisting:Be(()=>da),multi:!0},da=(()=>{class a extends co{min;inputName="min";normalizeInput=e=>Us(e);createValidator=e=>Xr(e);static \u0275fac=(()=>{let e;return function(i){return(e||(e=Ke(a)))(i||a)}})();static \u0275dir=V({type:a,selectors:[["input","type","number","min","","formControlName",""],["input","type","number","min","","formControl",""],["input","type","number","min","","ngModel",""]],hostVars:1,hostBindings:function(t,i){t&2&&B("min",i._enabled?i.min:null)},inputs:{min:"min"},standalone:!1,features:[K([$s]),re]})}return a})(),Xs={provide:Yt,useExisting:Be(()=>mo),multi:!0};var mo=(()=>{class a extends co{required;inputName="required";normalizeInput=S;createValidator=e=>Kr;enabled(e){return e}static \u0275fac=(()=>{let e;return function(i){return(e||(e=Ke(a)))(i||a)}})();static \u0275dir=V({type:a,selectors:[["","required","","formControlName","",3,"type","checkbox"],["","required","","formControl","",3,"type","checkbox"],["","required","","ngModel","",3,"type","checkbox"]],hostVars:1,hostBindings:function(t,i){t&2&&B("required",i._enabled?"":null)},inputs:{required:"required"},standalone:!1,features:[K([Xs]),re]})}return a})();var Ks=new A(""),ui=new A("",{factory:()=>ca}),ca="always";function Qs(a,n){return[...n.path,a]}function jr(a,n,e=ca){ma(a,n),n.valueAccessor.writeValue(a.value),(a.disabled||e==="always")&&n.valueAccessor.setDisabledState?.(a.disabled),Js(a,n),tl(a,n),el(a,n),Zs(a,n)}function Yr(a,n,e=!0){let t=()=>{};n?.valueAccessor?.registerOnChange(t),n?.valueAccessor?.registerOnTouched(t),di(a,n),a&&(n._invokeOnDestroyCallbacks(),a._registerOnCollectionChange(()=>{}))}function li(a,n){a.forEach(e=>{e.registerOnValidatorChange&&e.registerOnValidatorChange(n)})}function Zs(a,n){if(n.valueAccessor.setDisabledState){let e=t=>{n.valueAccessor.setDisabledState(t)};a.registerOnDisabledChange(e),n._registerOnDestroy(()=>{a._unregisterOnDisabledChange(e)})}}function ma(a,n){let e=ao(a);n.validator!==null?a.setValidators(Br(e,n.validator)):typeof e=="function"&&a.setValidators([e]);let t=ro(a);n.asyncValidator!==null?a.setAsyncValidators(Br(t,n.asyncValidator)):typeof t=="function"&&a.setAsyncValidators([t]);let i=()=>a.updateValueAndValidity();li(n._rawValidators,i),li(n._rawAsyncValidators,i)}function di(a,n){let e=!1;if(a!==null){if(n.validator!==null){let i=ao(a);if(Array.isArray(i)&&i.length>0){let r=i.filter(o=>o!==n.validator);r.length!==i.length&&(e=!0,a.setValidators(r))}}if(n.asyncValidator!==null){let i=ro(a);if(Array.isArray(i)&&i.length>0){let r=i.filter(o=>o!==n.asyncValidator);r.length!==i.length&&(e=!0,a.setAsyncValidators(r))}}}let t=()=>{};return li(n._rawValidators,t),li(n._rawAsyncValidators,t),e}function Js(a,n){n.valueAccessor.registerOnChange(e=>{a._pendingValue=e,a._pendingChange=!0,a._pendingDirty=!0,a.updateOn==="change"&&uo(a,n)})}function el(a,n){n.valueAccessor.registerOnTouched(()=>{a._pendingTouched=!0,a.updateOn==="blur"&&a._pendingChange&&uo(a,n),a.updateOn!=="submit"&&a.markAsTouched()})}function uo(a,n){a._pendingDirty&&a.markAsDirty(),a.setValue(a._pendingValue,{emitModelToViewChange:!1}),n.viewToModelUpdate(a._pendingValue),a._pendingChange=!1}function tl(a,n){let e=(t,i)=>{n.valueAccessor.writeValue(t),i&&n.viewToModelUpdate(t)};a.registerOnChange(e),n._registerOnDestroy(()=>{a._unregisterOnChange(e)})}function po(a,n){a==null,ma(a,n)}function nl(a,n){return di(a,n)}function il(a,n){if(!a.hasOwnProperty("model"))return!1;let e=a.model;return e.isFirstChange()?!0:!Object.is(n,e.currentValue)}function al(a){return Object.getPrototypeOf(a.constructor)===$r}function ho(a,n){a._syncPendingControls(),n.forEach(e=>{let t=e.control;t.updateOn==="submit"&&t._pendingChange&&(e.viewToModelUpdate(t._pendingValue),t._pendingChange=!1)})}function rl(a,n){if(!n)return null;Array.isArray(n);let e,t,i;return n.forEach(r=>{r.constructor===it?e=r:al(r)?t=r:i=r}),i||t||e||null}function ol(a,n){let e=a.indexOf(n);e>-1&&a.splice(e,1)}var sl={provide:Ks,useFactory:()=>{let a=s(nt,{self:!0});return{setParseErrors:n=>{a.setParseErrorSource(n)},set onReset(n){a.onReset=n}}}},nt=class extends ai{_parent=null;name=null;valueAccessor=null;isCustomControlBased=!1;userOnReset;resetSubscription;set onReset(n){this.userOnReset=n,this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.control&&(this.resetSubscription=this.control.events.subscribe(e=>{e instanceof an&&this.control&&this.userOnReset?.(this.control.value)}),this.subscription?.add(this.resetSubscription))}isNativeFormElement=!1;rawValueAccessors;_selectedValueAccessor=null;get selectedValueAccessor(){return this._selectedValueAccessor??=rl(this,this.rawValueAccessors)}parseErrorsValidator=null;renderer;injector;requiredValidatorViaDi;subscription;customControlBindings=null;constructor(n,e,t){super(),this.injector=n,this.renderer=e,this.rawValueAccessors=t,this.injector?.get(Kt)?.onDestroy(()=>{this.removeParseErrorsValidator(this.control),this.subscription?.unsubscribe()})}setupCustomControl(){this.subscription?.unsubscribe();let n=this.injector?.get(Z);if(!this.control||!n)return;let e=n.markForCheck.bind(n);this.subscription=new pe,this.subscription.add(this.control.valueChanges.subscribe(e)),this.subscription.add(this.control.statusChanges.subscribe(e)),this.resetSubscription?.unsubscribe(),this.resetSubscription=void 0,this.userOnReset&&(this.resetSubscription=this.control.events.subscribe(t=>{t instanceof an&&this.control&&this.userOnReset?.(this.control.value)}),this.subscription.add(this.resetSubscription)),this.parseErrorsValidator&&this.control.addValidators(this.parseErrorsValidator)}ngControlCreate(n){!n.nativeElement.hasAttribute?.("ngNoCva")&&(this.rawValueAccessors&&this.rawValueAccessors.length>0||this.valueAccessor!==null)||!n.customControl||(this.isCustomControlBased=!0,n.listenToCustomControlModel(i=>{this.control?.setValue(i,{emitModelToViewChange:!1}),this.control?.markAsDirty(),this.viewToModelUpdate(i)}),n.listenToCustomControlOutput("touch",()=>{this.control?.markAsTouched()}),this.customControlBindings={},this.isNativeFormElement=Ws(n.nativeElement),this.requiredValidatorViaDi=this._rawValidators.find(i=>i instanceof mo))}ngControlUpdate(n,e){if(!this.isCustomControlBased)return;let t=this.control,i=this.customControlBindings;Object.is(i.value,t.value)||(i.value=t.value,n.setCustomControlModelInput(t.value)),this.bindControlProperty(n,i,"touched",t.touched),this.bindControlProperty(n,i,"dirty",t.dirty),this.bindControlProperty(n,i,"valid",t.valid),this.bindControlProperty(n,i,"invalid",t.invalid),this.bindControlProperty(n,i,"pending",t.pending),this.bindControlProperty(n,i,"disabled",t.disabled),this.shouldBindRequired&&this.bindControlProperty(n,i,"required",this.isRequired);let r=t.errors;if(i.errors!==r){i.errors=r;let o=this._convertErrors(r);n.setInputOnDirectives("errors",o)}}get isRequired(){return(this.requiredValidatorViaDi?._enabled||this.control?._hasRequired())??!1}get shouldBindRequired(){return!0}bindControlProperty(n,e,t,i){if(e[t]===i)return;e[t]=i;let r=n.setInputOnDirectives(t,i);this.isNativeFormElement&&!r&&(t==="disabled"||t==="required")&&this.renderer&&qs(this.renderer,n.nativeElement,t,i)}_convertErrors(n){if(n===null)return[];let e=this.control;return Object.entries(n).map(([t,i])=>new na({context:i,kind:t,control:e}))}setParseErrorSource(n){if(n===void 0)return;let e=null,t=M(()=>{let i=n();return i.length===0?null:i.reduce((r,o)=>(r[o.kind]=o,r),{})});this.parseErrorsValidator=(()=>e).bind(this),ve(()=>{e=t(),this.control?.updateValueAndValidity({emitEvent:!1})},{injector:this.injector})}removeParseErrorsValidator(n){this.parseErrorsValidator&&(n?.removeValidators(this.parseErrorsValidator),n?.updateValueAndValidity({emitEvent:!1}))}},ia=class{_cd;constructor(n){this._cd=n}get isTouched(){return this._cd?.control?._touched?.(),!!this._cd?.control?.touched}get isUntouched(){return!!this._cd?.control?.untouched}get isPristine(){return this._cd?.control?._pristine?.(),!!this._cd?.control?.pristine}get isDirty(){return!!this._cd?.control?.dirty}get isValid(){return this._cd?.control?._status?.(),!!this._cd?.control?.valid}get isInvalid(){return!!this._cd?.control?.invalid}get isPending(){return!!this._cd?.control?.pending}get isSubmitted(){return this._cd?._submitted?.(),!!this._cd?.submitted}};var St=(()=>{class a extends ia{constructor(e){super(e)}static \u0275fac=function(t){return new(t||a)(Q(nt,2))};static \u0275dir=V({type:a,selectors:[["","formControlName",""],["","ngModel",""],["","formControl",""]],hostVars:14,hostBindings:function(t,i){t&2&&I("ng-untouched",i.isUntouched)("ng-touched",i.isTouched)("ng-pristine",i.isPristine)("ng-dirty",i.isDirty)("ng-valid",i.isValid)("ng-invalid",i.isInvalid)("ng-pending",i.isPending)},standalone:!1,features:[re]})}return a})();var ci=class extends si{constructor(n,e,t){super(oo(e),so(t,e)),this.controls=n,this._initObservables(),this._setUpdateStrategy(e),this._setUpControls(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator})}controls;registerControl(n,e){let t=this._find(n);return t||(this.controls[n]=e,e.setParent(this),e._registerOnCollectionChange(this._onCollectionChange),e)}addControl(n,e,t={}){this.registerControl(n,e),this.updateValueAndValidity({emitEvent:t.emitEvent}),this._onCollectionChange()}removeControl(n,e={}){let t=this._find(n);t&&t._registerOnCollectionChange(()=>{}),delete this.controls[n],this.updateValueAndValidity({emitEvent:e.emitEvent}),this._onCollectionChange()}setControl(n,e,t={}){let i=this._find(n);i&&i._registerOnCollectionChange(()=>{}),delete this.controls[n],e&&this.registerControl(n,e),this.updateValueAndValidity({emitEvent:t.emitEvent}),this._onCollectionChange()}contains(n){return this._find(n)?.enabled===!0}setValue(n,e={}){ue(()=>{Gs(this,!0,n),Object.keys(n).forEach(t=>{Ys(this,!0,t),this.controls[t].setValue(n[t],{onlySelf:!0,emitEvent:e.emitEvent})}),this.updateValueAndValidity(e)})}patchValue(n,e={}){n!=null&&(Object.keys(n).forEach(t=>{let i=this._find(t);i&&i.patchValue(n[t],{onlySelf:!0,emitEvent:e.emitEvent})}),this.updateValueAndValidity(e))}reset(n={},e={}){this._forEachChild((t,i)=>{t.reset(n?n[i]:null,xe(W({},e),{onlySelf:!0}))}),this._updatePristine(e,this),this._updateTouched(e,this),this.updateValueAndValidity(e),e?.emitEvent!==!1&&this._events.next(new an(this))}getRawValue(){return this._reduceChildren({},(n,e,t)=>(n[t]=e.getRawValue(),n))}_syncPendingControls(){let n=this._reduceChildren(!1,(e,t)=>t._syncPendingControls()?!0:e);return n&&this.updateValueAndValidity({onlySelf:!0}),n}_forEachChild(n){Object.keys(this.controls).forEach(e=>{let t=this.controls[e];t&&n(t,e)})}_setUpControls(){this._forEachChild(n=>{n.setParent(this),n._registerOnCollectionChange(this._onCollectionChange)})}_updateValue(){this.value=this._reduceValue()}_anyControls(n){for(let[e,t]of Object.entries(this.controls))if(this.contains(e)&&n(t))return!0;return!1}_reduceValue(){let n={};return this._reduceChildren(n,(e,t,i)=>((t.enabled||this.disabled)&&(e[i]=t.value),e))}_reduceChildren(n,e){let t=n;return this._forEachChild((i,r)=>{t=e(t,i,r)}),t}_allControlsDisabled(){for(let n of Object.keys(this.controls))if(this.controls[n].enabled)return!1;return Object.keys(this.controls).length>0||this.disabled}_find(n){return lo(this.controls,n)?this.controls[n]:null}};var ll={provide:Ht,useExisting:Be(()=>xn)},vn=Promise.resolve(),xn=(()=>{class a extends Ht{callSetDisabledState;get submitted(){return ue(this.submittedReactive)}_submitted=M(()=>this.submittedReactive());submittedReactive=x(!1);_directives=new Set;form;ngSubmit=new v;options;constructor(e,t,i){super(),this.callSetDisabledState=i,this.form=new ci({},sa(e),la(t))}ngAfterViewInit(){this._setUpdateStrategy()}get formDirective(){return this}get control(){return this.form}get path(){return[]}get controls(){return this.form.controls}addControl(e){vn.then(()=>{let t=this._findContainer(e.path);e.control=t.registerControl(e.name,e.control),e._setupWithForm(this.callSetDisabledState),e.control.updateValueAndValidity({emitEvent:!1}),this._directives.add(e)})}getControl(e){return this.form.get(e.path)}removeControl(e){vn.then(()=>{this._findContainer(e.path)?.removeControl(e.name),this._directives.delete(e)})}addFormGroup(e){vn.then(()=>{let t=this._findContainer(e.path),i=new ci({});po(i,e),t.registerControl(e.name,i),i.updateValueAndValidity({emitEvent:!1})})}removeFormGroup(e){vn.then(()=>{this._findContainer(e.path)?.removeControl?.(e.name)})}getFormGroup(e){return this.form.get(e.path)}updateModel(e,t){vn.then(()=>{this.form.get(e.path).setValue(t)})}setValue(e){this.control.setValue(e)}onSubmit(e){return this.submittedReactive.set(!0),ho(this.form,this._directives),this.ngSubmit.emit(e),this.form._events.next(new oi(this.control)),e?.target?.method==="dialog"}onReset(){this.resetForm()}resetForm(e=void 0){this.form.reset(e),this.submittedReactive.set(!1)}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.form._updateOn=this.options.updateOn)}_findContainer(e){return e.pop(),e.length?this.form.get(e):this.form}static \u0275fac=function(t){return new(t||a)(Q(Yt,10),Q(oa,10),Q(ui,8))};static \u0275dir=V({type:a,selectors:[["form",3,"ngNoForm","",3,"formGroup","",3,"formArray",""],["ng-form"],["","ngForm",""]],hostBindings:function(t,i){t&1&&g("submit",function(o){return i.onSubmit(o)})("reset",function(){return i.onReset()})},inputs:{options:[0,"ngFormOptions","options"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:!1,features:[K([ll]),re]})}return a})();function Gr(a,n){let e=a.indexOf(n);e>-1&&a.splice(e,1)}function Wr(a){return typeof a=="object"&&a!==null&&Object.keys(a).length===2&&"value"in a&&"disabled"in a}var fo=class extends si{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=!1;constructor(n=null,e,t){super(oo(e),so(t,e)),this._applyFormState(n),this._setUpdateStrategy(e),this._initObservables(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator}),mi(e)&&(e.nonNullable||e.initialValueIsDefault)&&(Wr(n)?this.defaultValue=n.value:this.defaultValue=n)}setValue(n,e={}){ue(()=>{this.value=this._pendingValue=n,this._onChange.length&&e.emitModelToViewChange!==!1&&this._onChange.forEach(t=>t(this.value,e.emitViewToModelChange!==!1)),this.updateValueAndValidity(e)})}patchValue(n,e={}){this.setValue(n,e)}reset(n=this.defaultValue,e={}){this._applyFormState(n),this.markAsPristine(e),this.markAsUntouched(e),this.setValue(this.value,e),e.overwriteDefaultValue&&(this.defaultValue=this.value),this._pendingChange=!1,e?.emitEvent!==!1&&this._events.next(new an(this))}_updateValue(){}_anyControls(n){return!1}_allControlsDisabled(){return this.disabled}registerOnChange(n){this._onChange.push(n)}_unregisterOnChange(n){Gr(this._onChange,n)}registerOnDisabledChange(n){this._onDisabledChange.push(n)}_unregisterOnDisabledChange(n){Gr(this._onDisabledChange,n)}_forEachChild(n){}_syncPendingControls(){return this.updateOn==="submit"&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:!0,emitModelToViewChange:!1}),!0):!1}_applyFormState(n){Wr(n)?(this.value=this._pendingValue=n.value,n.disabled?this.disable({onlySelf:!0,emitEvent:!1}):this.enable({onlySelf:!0,emitEvent:!1})):this.value=this._pendingValue=n}};var dl=a=>a instanceof fo;var cl={provide:nt,useExisting:Be(()=>_t)},qr=Promise.resolve(),_t=(()=>{class a extends nt{_changeDetectorRef;callSetDisabledState;control=new fo;static ngAcceptInputType_isDisabled;_registered=!1;viewModel;name="";isDisabled;model;options;update=new v;constructor(e,t,i,r,o,u,h,w){super(h,w,r),this._changeDetectorRef=o,this.callSetDisabledState=u,this._parent=e,this._setValidators(t),this._setAsyncValidators(i)}ngOnChanges(e){if(this._checkForErrors(),!this._registered||"name"in e){if(this._registered&&(this._checkName(),this.formDirective)){let t=e.name.previousValue;this.formDirective.removeControl({name:t,path:this._getPath(t)})}this._setUpControl()}"isDisabled"in e&&this._updateDisabled(e),il(e,this.viewModel)&&(this._updateValue(this.model),this.viewModel=this.model)}ngOnDestroy(){this.formDirective?.removeControl(this)}\u0275ngControlCreate(e){super.ngControlCreate(e)}\u0275ngControlUpdate(e){super.ngControlUpdate(e,!1)}get shouldBindRequired(){return!1}get path(){return this._getPath(this.name)}get formDirective(){return this._parent?this._parent.formDirective:null}viewToModelUpdate(e){this.viewModel=e,this.update.emit(e)}_setUpControl(){this._setUpdateStrategy(),this._isStandalone()?this._setUpStandalone():this.formDirective.addControl(this),this._registered=!0}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.control._updateOn=this.options.updateOn)}_isStandalone(){return!this._parent||!!(this.options&&this.options.standalone)}_setUpStandalone(){this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,jr(this.control,this,this.callSetDisabledState)),this.control.updateValueAndValidity({emitEvent:!1})}_setupWithForm(e){this.isCustomControlBased?this.setupCustomControl():(this.valueAccessor??=this.selectedValueAccessor,jr(this.control,this,e))}_checkForErrors(){this._checkName()}_checkName(){this.options&&this.options.name&&(this.name=this.options.name),!this._isStandalone()&&this.name}_updateValue(e){qr.then(()=>{this.control.setValue(e,{emitViewToModelChange:!1}),this._changeDetectorRef?.markForCheck()})}_updateDisabled(e){let t=e.isDisabled.currentValue,i=t!==0&&S(t);qr.then(()=>{i&&!this.control.disabled?this.control.disable():!i&&this.control.disabled&&this.control.enable(),this._changeDetectorRef?.markForCheck()})}_getPath(e){return this._parent?Qs(e,this._parent):[e]}static \u0275fac=function(t){return new(t||a)(Q(Ht,9),Q(Yt,10),Q(oa,10),Q(jt,10),Q(Z,8),Q(ui,8),Q(X,8),Q($,8))};static \u0275dir=V({type:a,selectors:[["","ngModel","",3,"formControlName","",3,"formControl",""]],inputs:{name:"name",isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"],options:[0,"ngModelOptions","options"]},outputs:{update:"ngModelChange"},exportAs:["ngModel"],standalone:!1,features:[K([cl,sl]),re,ee,nr(null)]})}return a})();var ml={provide:jt,useExisting:Be(()=>ua),multi:!0},ua=(()=>{class a extends $r{writeValue(e){let t=e??"";this.setProperty("value",t)}registerOnChange(e){this.onChange=t=>{e(t==""?null:parseFloat(t))}}static \u0275fac=(()=>{let e;return function(i){return(e||(e=Ke(a)))(i||a)}})();static \u0275dir=V({type:a,selectors:[["input","type","number","formControlName","",3,"ngNoCva",""],["input","type","number","formControl","",3,"ngNoCva",""],["input","type","number","ngModel","",3,"ngNoCva",""]],hostBindings:function(t,i){t&1&&g("input",function(o){return i.onChange(o.target.value)})("blur",function(){return i.onTouched()})},standalone:!1,features:[K([ml]),re]})}return a})();var ul=(()=>{class a extends Ht{callSetDisabledState;get submitted(){return ue(this._submittedReactive)}set submitted(e){this._submittedReactive.set(e)}_submitted=M(()=>this._submittedReactive());_submittedReactive=x(!1);_oldForm;_onCollectionChange=()=>this._updateDomValue();directives=[];constructor(e,t,i){super(),this.callSetDisabledState=i,this._setValidators(e),this._setAsyncValidators(t)}ngOnChanges(e){this.onChanges(e)}ngOnDestroy(){this.onDestroy()}onChanges(e){this._checkFormPresent(),e.hasOwnProperty("form")&&(this._updateValidators(),this._updateDomValue(),this._updateRegistrations(),this._oldForm=this.form)}onDestroy(){this.form&&(di(this.form,this),this.form._onCollectionChange===this._onCollectionChange&&this.form._registerOnCollectionChange(()=>{}))}get formDirective(){return this}get path(){return[]}addControl(e){let t=this.form.get(e.path);return e._setupWithForm(t,this.callSetDisabledState),t.updateValueAndValidity({emitEvent:!1}),this.directives.push(e),t}getControl(e){return this.form.get(e.path)}removeControl(e){Yr(e.control||null,e,!1),ol(this.directives,e)}addFormGroup(e){this._setUpFormContainer(e)}removeFormGroup(e){this._cleanUpFormContainer(e)}getFormGroup(e){return this.form.get(e.path)}getFormArray(e){return this.form.get(e.path)}addFormArray(e){this._setUpFormContainer(e)}removeFormArray(e){this._cleanUpFormContainer(e)}updateModel(e,t){this.form.get(e.path).setValue(t)}onReset(){this.resetForm()}resetForm(e=void 0,t={}){this.form.reset(e,t),this._submittedReactive.set(!1)}onSubmit(e){return this.submitted=!0,ho(this.form,this.directives),this.ngSubmit.emit(e),this.form._events.next(new oi(this.control)),e?.target?.method==="dialog"}_updateDomValue(){this.directives.forEach(e=>{let t=e.control,i=this.form.get(e.path);t!==i&&(Yr(t||null,e),dl(i)&&e._setupWithForm(i,this.callSetDisabledState))}),this.form._updateTreeValidity({emitEvent:!1})}_setUpFormContainer(e){let t=this.form.get(e.path);po(t,e),t.updateValueAndValidity({emitEvent:!1})}_cleanUpFormContainer(e){let t=this.form?.get(e.path);t&&nl(t,e)&&t.updateValueAndValidity({emitEvent:!1})}_updateRegistrations(){this.form._registerOnCollectionChange(this._onCollectionChange),this._oldForm?._registerOnCollectionChange(()=>{})}_updateValidators(){ma(this.form,this),this._oldForm&&di(this._oldForm,this)}_checkFormPresent(){this.form}static \u0275fac=function(t){return new(t||a)(Q(Yt,10),Q(oa,10),Q(ui,8))};static \u0275dir=V({type:a,features:[re,ee]})}return a})();var pl={provide:Ht,useExisting:Be(()=>Dn)},Dn=(()=>{class a extends ul{form=null;ngSubmit=new v;get control(){return this.form}static \u0275fac=(()=>{let e;return function(i){return(e||(e=Ke(a)))(i||a)}})();static \u0275dir=V({type:a,selectors:[["","formGroup",""]],hostBindings:function(t,i){t&1&&g("submit",function(o){return i.onSubmit(o)})("reset",function(){return i.onReset()})},inputs:{form:[0,"formGroup","form"]},outputs:{ngSubmit:"ngSubmit"},exportAs:["ngForm"],standalone:!1,features:[K([pl]),re]})}return a})();var hl=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({})}return a})();var Et=(()=>{class a{static withConfig(e){return{ngModule:a,providers:[{provide:ui,useValue:e.callSetDisabledState??ca}]}}static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({imports:[hl]})}return a})();var fl=["*",[["","progressIndicator",""]]],_l=["*","[progressIndicator]"];function gl(a,n){a&1&&(f(0,"div",1),Y(1,1),_())}var bl=new A("MAT_BUTTON_CONFIG");function _o(a){return a==null?void 0:xt(a)}var pa=(()=>{class a{_elementRef=s(F);_ngZone=s(H);_animationsDisabled=we();_config=s(bl,{optional:!0});_focusMonitor=s(Zt);_cleanupClick;_renderer=s($);_rippleLoader=s(Sr);_isAnchor;_isFab=!1;color;get disableRipple(){return this._disableRipple}set disableRipple(e){this._disableRipple=e,this._updateRippleDisabled()}_disableRipple=!1;get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._updateRippleDisabled()}_disabled=!1;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(e){this.tabIndex=e}showProgress=ie(!1,{transform:S});constructor(){s(Oe).load(Jt);let e=this._elementRef.nativeElement;this._isAnchor=e.tagName==="A",this.disabledInteractive=this._config?.disabledInteractive??!1,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(e,{className:"mat-mdc-button-ripple"})}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0),this._isAnchor&&this._setupAsAnchor()}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement)}focus(e="program",t){e?this._focusMonitor.focusVia(this._elementRef.nativeElement,e,t):this._elementRef.nativeElement.focus(t)}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?!0:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:!0}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled)}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,"click",e=>{this.disabled&&(e.preventDefault(),e.stopImmediatePropagation())}))}static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,hostAttrs:[1,"mat-mdc-button-base"],hostVars:15,hostBindings:function(t,i){t&2&&(B("disabled",i._getDisabledAttribute())("aria-disabled",i._getAriaDisabled())("tabindex",i._getTabIndex()),Je(i.color?"mat-"+i.color:""),I("mat-mdc-button-progress-indicator-shown",i.showProgress())("mat-mdc-button-disabled",i.disabled)("mat-mdc-button-disabled-interactive",i.disabledInteractive)("mat-unthemed",!i.color)("_mat-animation-noopable",i._animationsDisabled))},inputs:{color:"color",disableRipple:[2,"disableRipple","disableRipple",S],disabled:[2,"disabled","disabled",S],ariaDisabled:[2,"aria-disabled","ariaDisabled",S],disabledInteractive:[2,"disabledInteractive","disabledInteractive",S],tabIndex:[2,"tabIndex","tabIndex",_o],_tabindex:[2,"tabindex","_tabindex",_o],showProgress:[1,"showProgress"]}})}return a})(),At=(()=>{class a extends pa{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:!0})}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["button","mat-icon-button",""],["a","mat-icon-button",""],["button","matIconButton",""],["a","matIconButton",""]],hostAttrs:[1,"mdc-icon-button","mat-mdc-icon-button"],exportAs:["matButton","matAnchor"],features:[re],ngContentSelectors:_l,decls:5,vars:1,consts:[[1,"mat-mdc-button-persistent-ripple","mdc-icon-button__ripple"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(t,i){t&1&&(he(fl),Ae(0,"span",0),Y(1),y(2,gl,2,0,"div",1),Ae(3,"span",2)(4,"span",3)),t&2&&(l(2),C(i.showProgress()?2:-1))},styles:[`.mat-mdc-icon-button {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  border: none;
  outline: none;
  background-color: transparent;
  fill: currentColor;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  overflow: visible;
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
  flex-shrink: 0;
  text-align: center;
  width: var(--mat-icon-button-state-layer-size, 40px);
  height: var(--mat-icon-button-state-layer-size, 40px);
  padding: calc(calc(var(--mat-icon-button-state-layer-size, 40px) - var(--mat-icon-button-icon-size, 24px)) / 2);
  font-size: var(--mat-icon-button-icon-size, 24px);
  color: var(--mat-icon-button-icon-color, var(--mat-sys-on-surface-variant));
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-icon-button .mat-mdc-button-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-icon-button .mdc-button__label,
.mat-mdc-icon-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-icon-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-icon-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-ripple-element {
  background-color: var(--mat-icon-button-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface-variant) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-icon-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-icon-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-icon-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-icon-button-touch-target-size, 48px);
  display: var(--mat-icon-button-touch-target-display, block);
  left: 50%;
  width: var(--mat-icon-button-touch-target-size, 48px);
  transform: translate(-50%, -50%);
}
.mat-mdc-icon-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-icon-button[disabled], .mat-mdc-icon-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-icon-button-disabled-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-icon-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-icon-button img,
.mat-mdc-icon-button svg {
  width: var(--mat-icon-button-icon-size, 24px);
  height: var(--mat-icon-button-icon-size, 24px);
  vertical-align: baseline;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__determinate-circle-graphic {
  width: inherit;
  height: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__indeterminate-circle-graphic {
  height: 100%;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
}
.mat-mdc-icon-button[hidden] {
  display: none;
}
.mat-mdc-icon-button.mat-unthemed:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-primary:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-accent:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-warn:not(.mdc-ripple-upgraded):focus::before {
  background: transparent;
  opacity: 1;
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return a})();var vl=[[["",8,"material-icons",3,"iconPositionEnd",""],["mat-icon",3,"iconPositionEnd",""],["","matButtonIcon","",3,"iconPositionEnd",""]],"*",[["","iconPositionEnd","",8,"material-icons"],["mat-icon","iconPositionEnd",""],["","matButtonIcon","","iconPositionEnd",""]],[["","progressIndicator",""]]],yl=[".material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd])","*",".material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd]","[progressIndicator]"];function Cl(a,n){a&1&&(f(0,"div",2),Y(1,3),_())}var go=new Map([["text",["mat-mdc-button"]],["filled",["mdc-button--unelevated","mat-mdc-unelevated-button"]],["elevated",["mdc-button--raised","mat-mdc-raised-button"]],["outlined",["mdc-button--outlined","mat-mdc-outlined-button"]],["tonal",["mat-tonal-button"]]]),Ue=(()=>{class a extends pa{get appearance(){return this._appearance}set appearance(e){this.setAppearance(e||this._config?.defaultAppearance||"text")}_appearance=null;constructor(){super();let e=xl(this._elementRef.nativeElement);e&&this.setAppearance(e)}setAppearance(e){if(e===this._appearance)return;let t=this._elementRef.nativeElement.classList,i=this._appearance?go.get(this._appearance):null,r=go.get(e);i&&t.remove(...i),t.add(...r),this._appearance=e}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["button","matButton",""],["a","matButton",""],["button","mat-button",""],["button","mat-raised-button",""],["button","mat-flat-button",""],["button","mat-stroked-button",""],["a","mat-button",""],["a","mat-raised-button",""],["a","mat-flat-button",""],["a","mat-stroked-button",""]],hostAttrs:[1,"mdc-button"],inputs:{appearance:[0,"matButton","appearance"]},exportAs:["matButton","matAnchor"],features:[re],ngContentSelectors:yl,decls:8,vars:5,consts:[[1,"mat-mdc-button-persistent-ripple"],[1,"mdc-button__label"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(t,i){t&1&&(he(vl),Ae(0,"span",0),Y(1),f(2,"span",1),Y(3,1),_(),Y(4,2),y(5,Cl,2,0,"div",2),Ae(6,"span",3)(7,"span",4)),t&2&&(I("mdc-button__ripple",!i._isFab)("mdc-fab__ripple",i._isFab),l(5),C(i.showProgress()?5:-1))},styles:[`.mat-mdc-button-base {
  text-decoration: none;
}
.mat-mdc-button-base .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
@media (hover: none) {
  .mat-mdc-button-base:hover > span.mat-mdc-button-persistent-ripple::before {
    opacity: 0;
  }
}

.mdc-button {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  border: none;
  outline: none;
  line-height: inherit;
  -webkit-appearance: none;
  overflow: visible;
  vertical-align: middle;
  background: transparent;
  padding: 0 8px;
}
.mdc-button::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.mdc-button:active {
  outline: none;
}
.mdc-button:hover {
  cursor: pointer;
}
.mdc-button:disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-button[hidden] {
  display: none;
}
.mdc-button .mdc-button__label {
  position: relative;
}

.mat-mdc-button {
  padding: 0 var(--mat-button-text-horizontal-padding, 12px);
  height: var(--mat-button-text-container-height, 40px);
  font-family: var(--mat-button-text-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-text-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-text-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-text-label-text-transform);
  font-weight: var(--mat-button-text-label-text-weight, var(--mat-sys-label-large-weight));
}
.mat-mdc-button, .mat-mdc-button .mdc-button__ripple {
  border-radius: var(--mat-button-text-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-button:not(:disabled) {
  color: var(--mat-button-text-label-text-color, var(--mat-sys-primary));
}
.mat-mdc-button[disabled], .mat-mdc-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-text-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-button:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding: 0 var(--mat-button-text-with-icon-horizontal-padding, 16px);
}
.mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
[dir=rtl] .mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
.mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
.mat-mdc-button .mat-ripple-element {
  background-color: var(--mat-button-text-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-text-touch-target-size, 48px);
  display: var(--mat-button-text-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-unelevated-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-filled-container-height, 40px);
  font-family: var(--mat-button-filled-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-filled-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-filled-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-filled-label-text-transform);
  font-weight: var(--mat-button-filled-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-filled-horizontal-padding, 24px);
}
.mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
.mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
.mat-mdc-unelevated-button .mat-ripple-element {
  background-color: var(--mat-button-filled-ripple-color, color-mix(in srgb, var(--mat-sys-on-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-state-layer-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-unelevated-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-unelevated-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-unelevated-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-unelevated-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-filled-touch-target-size, 48px);
  display: var(--mat-button-filled-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-unelevated-button:not(:disabled) {
  color: var(--mat-button-filled-label-text-color, var(--mat-sys-on-primary));
  background-color: var(--mat-button-filled-container-color, var(--mat-sys-primary));
}
.mat-mdc-unelevated-button, .mat-mdc-unelevated-button .mdc-button__ripple {
  border-radius: var(--mat-button-filled-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-unelevated-button .mat-mdc-button-progress-indicator-container {
  --mat-progress-spinner-active-indicator-color: var(--mat-button-filled-progress-active-indicator-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button[disabled], .mat-mdc-unelevated-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-filled-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-filled-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-raised-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--mat-button-protected-container-elevation-shadow, var(--mat-sys-level1));
  height: var(--mat-button-protected-container-height, 40px);
  font-family: var(--mat-button-protected-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-protected-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-protected-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-protected-label-text-transform);
  font-weight: var(--mat-button-protected-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-protected-horizontal-padding, 24px);
}
.mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
.mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
.mat-mdc-raised-button .mat-ripple-element {
  background-color: var(--mat-button-protected-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-raised-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-raised-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-raised-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-raised-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-raised-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-protected-touch-target-size, 48px);
  display: var(--mat-button-protected-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-raised-button:not(:disabled) {
  color: var(--mat-button-protected-label-text-color, var(--mat-sys-primary));
  background-color: var(--mat-button-protected-container-color, var(--mat-sys-surface));
}
.mat-mdc-raised-button, .mat-mdc-raised-button .mdc-button__ripple {
  border-radius: var(--mat-button-protected-container-shape, var(--mat-sys-corner-full));
}
@media (hover: hover) {
  .mat-mdc-raised-button:hover {
    box-shadow: var(--mat-button-protected-hover-container-elevation-shadow, var(--mat-sys-level2));
  }
}
.mat-mdc-raised-button:focus {
  box-shadow: var(--mat-button-protected-focus-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button:active, .mat-mdc-raised-button:focus:active {
  box-shadow: var(--mat-button-protected-pressed-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button[disabled], .mat-mdc-raised-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-protected-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-protected-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-raised-button[disabled].mat-mdc-button-disabled, .mat-mdc-raised-button.mat-mdc-button-disabled.mat-mdc-button-disabled {
  box-shadow: var(--mat-button-protected-disabled-container-elevation-shadow, var(--mat-sys-level0));
}
.mat-mdc-raised-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-outlined-button {
  border-style: solid;
  transition: border 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-outlined-container-height, 40px);
  font-family: var(--mat-button-outlined-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-outlined-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-outlined-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-outlined-label-text-transform);
  font-weight: var(--mat-button-outlined-label-text-weight, var(--mat-sys-label-large-weight));
  border-radius: var(--mat-button-outlined-container-shape, var(--mat-sys-corner-full));
  border-width: var(--mat-button-outlined-outline-width, 1px);
  padding: 0 var(--mat-button-outlined-horizontal-padding, 24px);
}
.mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
.mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
.mat-mdc-outlined-button .mat-ripple-element {
  background-color: var(--mat-button-outlined-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-outlined-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-outlined-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-outlined-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-outlined-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-outlined-touch-target-size, 48px);
  display: var(--mat-button-outlined-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-outlined-button:not(:disabled) {
  color: var(--mat-button-outlined-label-text-color, var(--mat-sys-primary));
  border-color: var(--mat-button-outlined-outline-color, var(--mat-sys-outline));
}
.mat-mdc-outlined-button[disabled], .mat-mdc-outlined-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-outlined-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: var(--mat-button-outlined-disabled-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-tonal-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-tonal-container-height, 40px);
  font-family: var(--mat-button-tonal-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-tonal-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-tonal-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-tonal-label-text-transform);
  font-weight: var(--mat-button-tonal-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-tonal-horizontal-padding, 24px);
}
.mat-tonal-button:not(:disabled) {
  color: var(--mat-button-tonal-label-text-color, var(--mat-sys-on-secondary-container));
  background-color: var(--mat-button-tonal-container-color, var(--mat-sys-secondary-container));
}
.mat-tonal-button, .mat-tonal-button .mdc-button__ripple {
  border-radius: var(--mat-button-tonal-container-shape, var(--mat-sys-corner-full));
}
.mat-tonal-button[disabled], .mat-tonal-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-tonal-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-tonal-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-tonal-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
[dir=rtl] .mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
.mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
[dir=rtl] .mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
.mat-tonal-button .mat-ripple-element {
  background-color: var(--mat-button-tonal-ripple-color, color-mix(in srgb, var(--mat-sys-on-secondary-container) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-state-layer-color, var(--mat-sys-on-secondary-container));
}
.mat-tonal-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-tonal-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-tonal-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-tonal-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-tonal-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-tonal-touch-target-size, 48px);
  display: var(--mat-button-tonal-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-button,
.mat-mdc-unelevated-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button,
.mat-tonal-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-button .mdc-button__label,
.mat-mdc-button .mat-icon,
.mat-mdc-unelevated-button .mdc-button__label,
.mat-mdc-unelevated-button .mat-icon,
.mat-mdc-raised-button .mdc-button__label,
.mat-mdc-raised-button .mat-icon,
.mat-mdc-outlined-button .mdc-button__label,
.mat-mdc-outlined-button .mat-icon,
.mat-tonal-button .mdc-button__label,
.mat-tonal-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-button .mat-focus-indicator,
.mat-mdc-unelevated-button .mat-focus-indicator,
.mat-mdc-raised-button .mat-focus-indicator,
.mat-mdc-outlined-button .mat-focus-indicator,
.mat-tonal-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-unelevated-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-raised-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-outlined-button:focus-visible > .mat-focus-indicator::before,
.mat-tonal-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-button._mat-animation-noopable,
.mat-mdc-unelevated-button._mat-animation-noopable,
.mat-mdc-raised-button._mat-animation-noopable,
.mat-mdc-outlined-button._mat-animation-noopable,
.mat-tonal-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-button > .mat-icon,
.mat-mdc-unelevated-button > .mat-icon,
.mat-mdc-raised-button > .mat-icon,
.mat-mdc-outlined-button > .mat-icon,
.mat-tonal-button > .mat-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 1.125rem;
  height: 1.125rem;
  width: 1.125rem;
}

.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mdc-button__ripple {
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
}

.mat-mdc-unelevated-button .mat-focus-indicator::before,
.mat-tonal-button .mat-focus-indicator::before,
.mat-mdc-raised-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-outlined-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon,
.mat-mdc-button-progress-indicator-shown [matButtonIcon],
.mat-mdc-button-progress-indicator-shown .mdc-button__label {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})}return a})();function xl(a){return a.hasAttribute("mat-raised-button")?"elevated":a.hasAttribute("mat-stroked-button")?"outlined":a.hasAttribute("mat-flat-button")?"filled":a.hasAttribute("mat-button")?"text":null}var Ge=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({imports:[Zn,ge]})}return a})();var ha=class{_box;_destroyed=new L;_resizeSubject=new L;_resizeObserver;_elementObservables=new Map;constructor(n){this._box=n,typeof ResizeObserver<"u"&&(this._resizeObserver=new ResizeObserver(e=>this._resizeSubject.next(e)))}observe(n){return this._elementObservables.has(n)||this._elementObservables.set(n,new Bn(e=>{let t=this._resizeSubject.subscribe(e);return this._resizeObserver?.observe(n,{box:this._box}),()=>{this._resizeObserver?.unobserve(n),t.unsubscribe(),this._elementObservables.delete(n)}}).pipe(Le(e=>e.some(t=>t.target===n)),Yi({bufferSize:1,refCount:!0}),ae(this._destroyed))),this._elementObservables.get(n)}destroy(){this._destroyed.next(),this._destroyed.complete(),this._resizeSubject.complete(),this._elementObservables.clear()}},bo=(()=>{class a{_cleanupErrorListener;_observers=new Map;_ngZone=s(H);constructor(){typeof ResizeObserver<"u"}ngOnDestroy(){for(let[,e]of this._observers)e.destroy();this._observers.clear(),this._cleanupErrorListener?.()}observe(e,t){let i=t?.box||"content-box";return this._observers.has(i)||this._observers.set(i,new ha(i)),this._observers.get(i).observe(e)}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})();var Dl=["notch"],wl=["*"],vo=["iconPrefixContainer"],yo=["textPrefixContainer"],Co=["iconSuffixContainer"],xo=["textSuffixContainer"],kl=["textField"],Ml=["*",[["mat-label"]],[["","matPrefix",""],["","matIconPrefix",""]],[["","matTextPrefix",""]],[["","matTextSuffix",""]],[["","matSuffix",""],["","matIconSuffix",""]],[["mat-error"],["","matError",""]],[["mat-hint",3,"align","end"]],[["mat-hint","align","end"]]],Sl=["*","mat-label","[matPrefix], [matIconPrefix]","[matTextPrefix]","[matTextSuffix]","[matSuffix], [matIconSuffix]","mat-error, [matError]","mat-hint:not([align='end'])","mat-hint[align='end']"];function El(a,n){a&1&&j(0,"span",21)}function Al(a,n){if(a&1&&(d(0,"label",20),Y(1,1),y(2,El,1,0,"span",21),c()),a&2){let e=p(2);b("floating",e._shouldLabelFloat())("monitorResize",e._hasOutline())("id",e._labelId),B("for",e._control.disableAutomaticLabeling?null:e._control.id),l(2),C(!e.hideRequiredMarker&&e._control.required?2:-1)}}function Ol(a,n){if(a&1&&y(0,Al,3,5,"label",20),a&2){let e=p();C(e._hasFloatingLabel()?0:-1)}}function Rl(a,n){a&1&&j(0,"div",7)}function Vl(a,n){}function Fl(a,n){if(a&1&&Ie(0,Vl,0,0,"ng-template",13),a&2){p(2);let e=Ze(1);b("ngTemplateOutlet",e)}}function Il(a,n){if(a&1&&(d(0,"div",9),y(1,Fl,1,1,null,13),c()),a&2){let e=p();b("matFormFieldNotchedOutlineOpen",e._shouldLabelFloat()),l(),C(e._forceDisplayInfixLabel()?-1:1)}}function Pl(a,n){a&1&&(d(0,"div",10,2),Y(2,2),c())}function Tl(a,n){a&1&&(d(0,"div",11,3),Y(2,3),c())}function Nl(a,n){}function Ll(a,n){if(a&1&&Ie(0,Nl,0,0,"ng-template",13),a&2){p();let e=Ze(1);b("ngTemplateOutlet",e)}}function Bl(a,n){a&1&&(d(0,"div",14,4),Y(2,4),c())}function zl(a,n){a&1&&(d(0,"div",15,5),Y(2,5),c())}function Hl(a,n){a&1&&j(0,"div",16)}function jl(a,n){a&1&&(d(0,"div",18),Y(1,6),c())}function Yl(a,n){if(a&1&&(d(0,"mat-hint",22),m(1),c()),a&2){let e=p(2);b("id",e._hintLabelId),l(),N(e.hintLabel)}}function Gl(a,n){if(a&1&&(d(0,"div",19),y(1,Yl,2,2,"mat-hint",22),Y(2,7),j(3,"div",23),Y(4,8),c()),a&2){let e=p();l(),C(e.hintLabel?1:-1)}}var Te=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["mat-label"]]})}return a})(),Wl=new A("MatError");var fa=(()=>{class a{align="start";id=s(_e).getId("mat-mdc-hint-");static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["mat-hint"]],hostAttrs:[1,"mat-mdc-form-field-hint","mat-mdc-form-field-bottom-align"],hostVars:4,hostBindings:function(t,i){t&2&&(De("id",i.id),B("align",null),I("mat-mdc-form-field-hint-end",i.align==="end"))},inputs:{align:"align",id:"id"}})}return a})(),ql=new A("MatPrefix");var Ao=new A("MatSuffix"),kn=(()=>{class a{set _isTextSelector(e){this._isText=!0}_isText=!1;static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["","matSuffix",""],["","matIconSuffix",""],["","matTextSuffix",""]],inputs:{_isTextSelector:[0,"matTextSuffix","_isTextSelector"]},features:[K([{provide:Ao,useExisting:a}])]})}return a})(),Oo=new A("FloatingLabelParent"),Do=(()=>{class a{_elementRef=s(F);get floating(){return this._floating}set floating(e){this._floating=e,this.monitorResize&&this._handleResize()}_floating=!1;get monitorResize(){return this._monitorResize}set monitorResize(e){this._monitorResize=e,this._monitorResize?this._subscribeToResize():this._resizeSubscription.unsubscribe()}_monitorResize=!1;_resizeObserver=s(bo);_ngZone=s(H);_parent=s(Oo);_resizeSubscription=new pe;ngOnDestroy(){this._resizeSubscription.unsubscribe()}getWidth(){return Ul(this._elementRef.nativeElement)}get element(){return this._elementRef.nativeElement}_handleResize(){setTimeout(()=>this._parent._handleLabelResized())}_subscribeToResize(){this._resizeSubscription.unsubscribe(),this._ngZone.runOutsideAngular(()=>{this._resizeSubscription=this._resizeObserver.observe(this._elementRef.nativeElement,{box:"border-box"}).subscribe(()=>this._handleResize())})}static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["label","matFormFieldFloatingLabel",""]],hostAttrs:[1,"mdc-floating-label","mat-mdc-floating-label"],hostVars:2,hostBindings:function(t,i){t&2&&I("mdc-floating-label--float-above",i.floating)},inputs:{floating:"floating",monitorResize:"monitorResize"}})}return a})();function Ul(a){let n=a;if(n.offsetParent!==null)return n.scrollWidth;let e=n.cloneNode(!0);e.style.setProperty("position","absolute"),e.style.setProperty("transform","translate(-9999px, -9999px)"),document.documentElement.appendChild(e);let t=e.scrollWidth;return e.remove(),t}var wo="mdc-line-ripple--active",hi="mdc-line-ripple--deactivating",ko=(()=>{class a{_elementRef=s(F);_cleanupTransitionEnd;constructor(){let e=s(H),t=s($);e.runOutsideAngular(()=>{this._cleanupTransitionEnd=t.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionEnd)})}activate(){let e=this._elementRef.nativeElement.classList;e.remove(hi),e.add(wo)}deactivate(){this._elementRef.nativeElement.classList.add(hi)}_handleTransitionEnd=e=>{let t=this._elementRef.nativeElement.classList,i=t.contains(hi);e.propertyName==="opacity"&&i&&t.remove(wo,hi)};ngOnDestroy(){this._cleanupTransitionEnd()}static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["div","matFormFieldLineRipple",""]],hostAttrs:[1,"mdc-line-ripple"]})}return a})(),Mo=(()=>{class a{_elementRef=s(F);_ngZone=s(H);open=!1;_notch;ngAfterViewInit(){let e=this._elementRef.nativeElement,t=e.querySelector(".mdc-floating-label");t?(e.classList.add("mdc-notched-outline--upgraded"),typeof requestAnimationFrame=="function"&&(t.style.transitionDuration="0s",this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>t.style.transitionDuration="")}))):e.classList.add("mdc-notched-outline--no-label")}_setNotchWidth(e){let t=this._notch.nativeElement;!this.open||!e?t.style.width="":t.style.width=`calc(${e}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + 9px)`}_setMaxWidth(e){this._notch.nativeElement.style.setProperty("--mat-form-field-notch-max-width",`calc(100% - ${e}px)`)}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["div","matFormFieldNotchedOutline",""]],viewQuery:function(t,i){if(t&1&&oe(Dl,5),t&2){let r;O(r=R())&&(i._notch=r.first)}},hostAttrs:[1,"mdc-notched-outline"],hostVars:2,hostBindings:function(t,i){t&2&&I("mdc-notched-outline--notched",i.open)},inputs:{open:[0,"matFormFieldNotchedOutlineOpen","open"]},ngContentSelectors:wl,decls:5,vars:0,consts:[["notch",""],[1,"mat-mdc-notch-piece","mdc-notched-outline__leading"],[1,"mat-mdc-notch-piece","mdc-notched-outline__notch"],[1,"mat-mdc-notch-piece","mdc-notched-outline__trailing"]],template:function(t,i){t&1&&(he(),Ae(0,"div",1),f(1,"div",2,0),Y(3),_(),Ae(4,"div",3))},encapsulation:2})}return a})(),Mn=(()=>{class a{value=null;stateChanges;id;placeholder;ngControl=null;focused=!1;empty=!1;shouldLabelFloat=!1;required=!1;disabled=!1;errorState=!1;controlType;autofilled;userAriaDescribedBy;disableAutomaticLabeling;describedByIds;static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a})}return a})();var Gt=new A("MatFormField"),$l=new A("MAT_FORM_FIELD_DEFAULT_OPTIONS"),So="fill",Xl="auto",Eo="fixed",Kl="translateY(-50%)",We=(()=>{class a{_elementRef=s(F);_changeDetectorRef=s(Z);_platform=s(fe);_idGenerator=s(_e);_ngZone=s(H);_defaults=s($l,{optional:!0});_currentDirection;_textField;_iconPrefixContainer;_textPrefixContainer;_iconSuffixContainer;_textSuffixContainer;_floatingLabel;_notchedOutline;_lineRipple;_iconPrefixContainerSignal=zt("iconPrefixContainer");_textPrefixContainerSignal=zt("textPrefixContainer");_iconSuffixContainerSignal=zt("iconSuffixContainer");_textSuffixContainerSignal=zt("textSuffixContainer");_prefixSuffixContainers=M(()=>[this._iconPrefixContainerSignal(),this._textPrefixContainerSignal(),this._iconSuffixContainerSignal(),this._textSuffixContainerSignal()].map(e=>e?.nativeElement).filter(e=>e!==void 0));_formFieldControl;_prefixChildren;_suffixChildren;_errorChildren;_hintChildren;_labelChild=lr(Te);get hideRequiredMarker(){return this._hideRequiredMarker}set hideRequiredMarker(e){this._hideRequiredMarker=ut(e)}_hideRequiredMarker=!1;color="primary";get floatLabel(){return this._floatLabel||this._defaults?.floatLabel||Xl}set floatLabel(e){e!==this._floatLabel&&(this._floatLabel=e,this._changeDetectorRef.markForCheck())}_floatLabel;get appearance(){return this._appearanceSignal()}set appearance(e){let t=e||this._defaults?.appearance||So;this._appearanceSignal.set(t)}_appearanceSignal=x(So);get subscriptSizing(){return this._subscriptSizing||this._defaults?.subscriptSizing||Eo}set subscriptSizing(e){this._subscriptSizing=e||this._defaults?.subscriptSizing||Eo}_subscriptSizing=null;get hintLabel(){return this._hintLabel}set hintLabel(e){this._hintLabel=e,this._processHints()}_hintLabel="";_hasIconPrefix=!1;_hasTextPrefix=!1;_hasIconSuffix=!1;_hasTextSuffix=!1;_labelId=this._idGenerator.getId("mat-mdc-form-field-label-");_hintLabelId=this._idGenerator.getId("mat-mdc-hint-");_describedByIds;get _control(){return this._explicitFormFieldControl||this._formFieldControl}set _control(e){this._explicitFormFieldControl=e}_destroyed=new L;_isFocused=null;_explicitFormFieldControl;_previousControl=null;_previousControlValidatorFn=null;_stateChanges;_valueChanges;_describedByChanges;_outlineLabelOffsetResizeObserver=null;_animationsDisabled=we();constructor(){let e=this._defaults,t=s(ke);e&&(e.appearance&&(this.appearance=e.appearance),this._hideRequiredMarker=!!e?.hideRequiredMarker,e.color&&(this.color=e.color)),ve(()=>this._currentDirection=t.valueSignal()),this._syncOutlineLabelOffset()}ngAfterViewInit(){this._updateFocusState(),this._animationsDisabled||this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-form-field-animations-enabled")},300)}),this._changeDetectorRef.detectChanges()}ngAfterContentInit(){this._assertFormFieldControl(),this._initializeSubscript(),this._initializePrefixAndSuffix()}ngAfterContentChecked(){this._assertFormFieldControl(),this._control!==this._previousControl&&(this._initializeControl(this._previousControl),this._control.ngControl&&this._control.ngControl.control&&(this._previousControlValidatorFn=this._control.ngControl.control.validator),this._previousControl=this._control),this._control.ngControl&&this._control.ngControl.control&&this._control.ngControl.control.validator!==this._previousControlValidatorFn&&this._changeDetectorRef.markForCheck()}ngOnDestroy(){this._outlineLabelOffsetResizeObserver?.disconnect(),this._stateChanges?.unsubscribe(),this._valueChanges?.unsubscribe(),this._describedByChanges?.unsubscribe(),this._destroyed.next(),this._destroyed.complete()}getLabelId=M(()=>this._hasFloatingLabel()?this._labelId:null);getConnectedOverlayOrigin(){return this._textField||this._elementRef}_animateAndLockLabel(){this._hasFloatingLabel()&&(this.floatLabel="always")}_initializeControl(e){let t=this._control,i="mat-mdc-form-field-type-";e&&this._elementRef.nativeElement.classList.remove(i+e.controlType),t.controlType&&this._elementRef.nativeElement.classList.add(i+t.controlType),this._stateChanges?.unsubscribe(),this._stateChanges=t.stateChanges.subscribe(()=>{this._updateFocusState(),this._changeDetectorRef.markForCheck()}),this._describedByChanges?.unsubscribe(),this._describedByChanges=t.stateChanges.pipe(Xe([void 0,void 0]),be(()=>[t.errorState,t.userAriaDescribedBy]),ji(),Le(([[r,o],[u,h]])=>r!==u||o!==h)).subscribe(()=>this._syncDescribedByIds()),this._valueChanges?.unsubscribe(),t.ngControl&&t.ngControl.valueChanges&&(this._valueChanges=t.ngControl.valueChanges.pipe(ae(this._destroyed)).subscribe(()=>this._changeDetectorRef.markForCheck()))}_checkPrefixAndSuffixTypes(){this._hasIconPrefix=!!this._prefixChildren.find(e=>!e._isText),this._hasTextPrefix=!!this._prefixChildren.find(e=>e._isText),this._hasIconSuffix=!!this._suffixChildren.find(e=>!e._isText),this._hasTextSuffix=!!this._suffixChildren.find(e=>e._isText)}_initializePrefixAndSuffix(){this._checkPrefixAndSuffixTypes(),lt(this._prefixChildren.changes,this._suffixChildren.changes).subscribe(()=>{this._checkPrefixAndSuffixTypes(),this._changeDetectorRef.markForCheck()})}_initializeSubscript(){this._hintChildren.changes.subscribe(()=>{this._processHints(),this._changeDetectorRef.markForCheck()}),this._errorChildren.changes.subscribe(()=>{this._syncDescribedByIds(),this._changeDetectorRef.markForCheck()}),this._validateHints(),this._syncDescribedByIds()}_assertFormFieldControl(){this._control}_updateFocusState(){let e=this._control.focused;e&&!this._isFocused?(this._isFocused=!0,this._lineRipple?.activate()):!e&&(this._isFocused||this._isFocused===null)&&(this._isFocused=!1,this._lineRipple?.deactivate()),this._elementRef.nativeElement.classList.toggle("mat-focused",e),this._textField?.nativeElement.classList.toggle("mdc-text-field--focused",e)}_syncOutlineLabelOffset(){dr({earlyRead:()=>{if(this._appearanceSignal()!=="outline")return this._outlineLabelOffsetResizeObserver?.disconnect(),null;if(globalThis.ResizeObserver){this._outlineLabelOffsetResizeObserver||=new globalThis.ResizeObserver(()=>{this._writeOutlinedLabelStyles(this._getOutlinedLabelOffset())});for(let e of this._prefixSuffixContainers())this._outlineLabelOffsetResizeObserver.observe(e,{box:"border-box"})}return this._getOutlinedLabelOffset()},write:e=>this._writeOutlinedLabelStyles(e())})}_shouldAlwaysFloat(){return this.floatLabel==="always"}_hasOutline(){return this.appearance==="outline"}_forceDisplayInfixLabel(){return!this._platform.isBrowser&&this._prefixChildren.length&&!this._shouldLabelFloat()}_hasFloatingLabel=M(()=>!!this._labelChild());_shouldLabelFloat(){return this._hasFloatingLabel()?this._control.shouldLabelFloat||this._shouldAlwaysFloat():!1}_shouldForward(e){let t=this._control?this._control.ngControl:null;return t&&t[e]}_getSubscriptMessageType(){return this._errorChildren&&this._errorChildren.length>0&&this._control.errorState?"error":"hint"}_handleLabelResized(){this._refreshOutlineNotchWidth()}_refreshOutlineNotchWidth(){!this._hasOutline()||!this._floatingLabel||!this._shouldLabelFloat()?this._notchedOutline?._setNotchWidth(0):this._notchedOutline?._setNotchWidth(this._floatingLabel.getWidth())}_processHints(){this._validateHints(),this._syncDescribedByIds()}_validateHints(){this._hintChildren}_syncDescribedByIds(){if(this._control){let e=[];if(this._control.userAriaDescribedBy&&typeof this._control.userAriaDescribedBy=="string"&&e.push(...this._control.userAriaDescribedBy.split(" ")),this._getSubscriptMessageType()==="hint"){let r=this._hintChildren?this._hintChildren.find(u=>u.align==="start"):null,o=this._hintChildren?this._hintChildren.find(u=>u.align==="end"):null;r?e.push(r.id):this._hintLabel&&e.push(this._hintLabelId),o&&e.push(o.id)}else this._errorChildren&&e.push(...this._errorChildren.map(r=>r.id));let t=this._control.describedByIds,i;if(t){let r=this._describedByIds||e;i=e.concat(t.filter(o=>o&&!r.includes(o)))}else i=e;this._control.setDescribedByIds(i),this._describedByIds=e}}_getOutlinedLabelOffset(){if(!this._hasOutline()||!this._floatingLabel)return null;if(!this._iconPrefixContainer&&!this._textPrefixContainer)return["",null];if(!this._isAttachedToDom())return null;let e=this._iconPrefixContainer?.nativeElement,t=this._textPrefixContainer?.nativeElement,i=this._iconSuffixContainer?.nativeElement,r=this._textSuffixContainer?.nativeElement,o=e?.getBoundingClientRect().width??0,u=t?.getBoundingClientRect().width??0,h=i?.getBoundingClientRect().width??0,w=r?.getBoundingClientRect().width??0,k=this._currentDirection==="rtl"?"-1":"1",z=`${o+u}px`,le=`calc(${k} * (${z} + var(--mat-mdc-form-field-label-offset-x, 0px)))`,de=`var(--mat-mdc-form-field-label-transform, ${Kl} translateX(${le}))`,Ce=o+u+h+w;return[de,Ce]}_writeOutlinedLabelStyles(e){if(e!==null){let[t,i]=e;this._floatingLabel&&(this._floatingLabel.element.style.transform=t),i!==null&&this._notchedOutline?._setMaxWidth(i)}}_isAttachedToDom(){let e=this._elementRef.nativeElement;if(e.getRootNode){let t=e.getRootNode();return t&&t!==e}return document.documentElement.contains(e)}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-form-field"]],contentQueries:function(t,i,r){if(t&1&&(ar(r,i._labelChild,Te,5),yt(r,Mn,5)(r,ql,5)(r,Ao,5)(r,Wl,5)(r,fa,5)),t&2){pn();let o;O(o=R())&&(i._formFieldControl=o.first),O(o=R())&&(i._prefixChildren=o),O(o=R())&&(i._suffixChildren=o),O(o=R())&&(i._errorChildren=o),O(o=R())&&(i._hintChildren=o)}},viewQuery:function(t,i){if(t&1&&(Yn(i._iconPrefixContainerSignal,vo,5)(i._textPrefixContainerSignal,yo,5)(i._iconSuffixContainerSignal,Co,5)(i._textSuffixContainerSignal,xo,5),oe(kl,5)(vo,5)(yo,5)(Co,5)(xo,5)(Do,5)(Mo,5)(ko,5)),t&2){pn(4);let r;O(r=R())&&(i._textField=r.first),O(r=R())&&(i._iconPrefixContainer=r.first),O(r=R())&&(i._textPrefixContainer=r.first),O(r=R())&&(i._iconSuffixContainer=r.first),O(r=R())&&(i._textSuffixContainer=r.first),O(r=R())&&(i._floatingLabel=r.first),O(r=R())&&(i._notchedOutline=r.first),O(r=R())&&(i._lineRipple=r.first)}},hostAttrs:[1,"mat-mdc-form-field"],hostVars:38,hostBindings:function(t,i){t&2&&I("mat-mdc-form-field-label-always-float",i._shouldAlwaysFloat())("mat-mdc-form-field-has-icon-prefix",i._hasIconPrefix)("mat-mdc-form-field-has-icon-suffix",i._hasIconSuffix)("mat-form-field-invalid",i._control.errorState)("mat-form-field-disabled",i._control.disabled)("mat-form-field-autofilled",i._control.autofilled)("mat-form-field-appearance-fill",i.appearance=="fill")("mat-form-field-appearance-outline",i.appearance=="outline")("mat-form-field-hide-placeholder",i._hasFloatingLabel()&&!i._shouldLabelFloat())("mat-primary",i.color!=="accent"&&i.color!=="warn")("mat-accent",i.color==="accent")("mat-warn",i.color==="warn")("ng-untouched",i._shouldForward("untouched"))("ng-touched",i._shouldForward("touched"))("ng-pristine",i._shouldForward("pristine"))("ng-dirty",i._shouldForward("dirty"))("ng-valid",i._shouldForward("valid"))("ng-invalid",i._shouldForward("invalid"))("ng-pending",i._shouldForward("pending"))},inputs:{hideRequiredMarker:"hideRequiredMarker",color:"color",floatLabel:"floatLabel",appearance:"appearance",subscriptSizing:"subscriptSizing",hintLabel:"hintLabel"},exportAs:["matFormField"],features:[K([{provide:Gt,useExisting:a},{provide:Oo,useExisting:a}])],ngContentSelectors:Sl,decls:18,vars:21,consts:[["labelTemplate",""],["textField",""],["iconPrefixContainer",""],["textPrefixContainer",""],["textSuffixContainer",""],["iconSuffixContainer",""],[1,"mat-mdc-text-field-wrapper","mdc-text-field",3,"click"],[1,"mat-mdc-form-field-focus-overlay"],[1,"mat-mdc-form-field-flex"],["matFormFieldNotchedOutline","",3,"matFormFieldNotchedOutlineOpen"],[1,"mat-mdc-form-field-icon-prefix"],[1,"mat-mdc-form-field-text-prefix"],[1,"mat-mdc-form-field-infix"],[3,"ngTemplateOutlet"],[1,"mat-mdc-form-field-text-suffix"],[1,"mat-mdc-form-field-icon-suffix"],["matFormFieldLineRipple",""],["aria-atomic","true","aria-live","polite",1,"mat-mdc-form-field-subscript-wrapper","mat-mdc-form-field-bottom-align"],[1,"mat-mdc-form-field-error-wrapper"],[1,"mat-mdc-form-field-hint-wrapper"],["matFormFieldFloatingLabel","",3,"floating","monitorResize","id"],["aria-hidden","true",1,"mat-mdc-form-field-required-marker","mdc-floating-label--required"],[3,"id"],[1,"mat-mdc-form-field-hint-spacer"]],template:function(t,i){if(t&1&&(he(Ml),Ie(0,Ol,1,1,"ng-template",null,0,Wn),d(2,"div",6,1),g("click",function(o){return i._control.onContainerClick(o)}),y(4,Rl,1,0,"div",7),d(5,"div",8),y(6,Il,2,2,"div",9),y(7,Pl,3,0,"div",10),y(8,Tl,3,0,"div",11),d(9,"div",12),y(10,Ll,1,1,null,13),Y(11),c(),y(12,Bl,3,0,"div",14),y(13,zl,3,0,"div",15),c(),y(14,Hl,1,0,"div",16),c(),d(15,"div",17),y(16,jl,2,0,"div",18)(17,Gl,5,1,"div",19),c()),t&2){let r;l(2),I("mdc-text-field--filled",!i._hasOutline())("mdc-text-field--outlined",i._hasOutline())("mdc-text-field--no-label",!i._hasFloatingLabel())("mdc-text-field--disabled",i._control.disabled)("mdc-text-field--invalid",i._control.errorState),l(2),C(!i._hasOutline()&&!i._control.disabled?4:-1),l(2),C(i._hasOutline()?6:-1),l(),C(i._hasIconPrefix?7:-1),l(),C(i._hasTextPrefix?8:-1),l(2),C(!i._hasOutline()||i._forceDisplayInfixLabel()?10:-1),l(2),C(i._hasTextSuffix?12:-1),l(),C(i._hasIconSuffix?13:-1),l(),C(i._hasOutline()?-1:14),l(),I("mat-mdc-form-field-subscript-dynamic-size",i.subscriptSizing==="dynamic");let o=i._getSubscriptMessageType();l(),C((r=o)==="error"?16:r==="hint"?17:-1)}},dependencies:[Do,Mo,ur,ko,fa],styles:[`.mdc-text-field {
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
`],encapsulation:2})}return a})();var Me=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({imports:[gr,We,ge]})}return a})();var Ql=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["ng-component"]],hostAttrs:["cdk-text-field-style-loader",""],decls:0,vars:0,template:function(t,i){},styles:[`textarea.cdk-textarea-autosize {
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
`],encapsulation:2})}return a})(),Zl={passive:!0},Ro=(()=>{class a{_platform=s(fe);_ngZone=s(H);_renderer=s(ct).createRenderer(null,null);_styleLoader=s(Oe);_monitoredElements=new Map;monitor(e){if(!this._platform.isBrowser)return Wa;this._styleLoader.load(Ql);let t=_n(e),i=this._monitoredElements.get(t);if(i)return i.subject;let r=new L,o="cdk-text-field-autofilled",u=w=>{w.animationName==="cdk-text-field-autofill-start"&&!t.classList.contains(o)?(t.classList.add(o),this._ngZone.run(()=>r.next({target:w.target,isAutofilled:!0}))):w.animationName==="cdk-text-field-autofill-end"&&t.classList.contains(o)&&(t.classList.remove(o),this._ngZone.run(()=>r.next({target:w.target,isAutofilled:!1})))},h=this._ngZone.runOutsideAngular(()=>(t.classList.add("cdk-text-field-autofill-monitored"),this._renderer.listen(t,"animationstart",u,Zl)));return this._monitoredElements.set(t,{subject:r,unlisten:h}),r}stopMonitoring(e){let t=_n(e),i=this._monitoredElements.get(t);i&&(i.unlisten(),i.subject.complete(),t.classList.remove("cdk-text-field-autofill-monitored"),t.classList.remove("cdk-text-field-autofilled"),this._monitoredElements.delete(t))}ngOnDestroy(){this._monitoredElements.forEach((e,t)=>this.stopMonitoring(t))}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})();var Vo=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({})}return a})();var fi=new A("MAT_INPUT_VALUE_ACCESSOR");var Jl=["button","checkbox","file","hidden","image","radio","range","reset","submit"],ed=new A("MAT_INPUT_CONFIG"),at=(()=>{class a{_elementRef=s(F);_platform=s(fe);ngControl=s(nt,{optional:!0,self:!0});_autofillMonitor=s(Ro);_ngZone=s(H);_formField=s(Gt,{optional:!0});_renderer=s($);_uid=s(_e).getId("mat-input-");_previousNativeValue;_inputValueAccessor;_signalBasedValueAccessor;_previousPlaceholder=null;_errorStateTracker;_config=s(ed,{optional:!0});_cleanupIosKeyup;_cleanupWebkitWheel;_isServer=!1;_isNativeSelect=!1;_isTextarea=!1;_isInFormField=!1;focused=!1;stateChanges=new L;controlType="mat-input";autofilled=!1;get disabled(){return this._disabled}set disabled(e){this._disabled=ut(e),this.focused&&(this.focused=!1,this.stateChanges.next())}_disabled=!1;get id(){return this._id}set id(e){this._id=e||this._uid}_id;placeholder;name;get required(){return this._required??this.ngControl?.control?.hasValidator(ft.required)??!1}set required(e){this._required=ut(e)}_required;get type(){return this._type}set type(e){this._type=e||"text",this._validateType(),!this._isTextarea&&Qi().has(this._type)&&(this._elementRef.nativeElement.type=this._type)}_type="text";get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e}userAriaDescribedBy;get value(){return this._signalBasedValueAccessor?this._signalBasedValueAccessor.value():this._inputValueAccessor.value}set value(e){e!==this.value&&(this._signalBasedValueAccessor?this._signalBasedValueAccessor.value.set(e):this._inputValueAccessor.value=e,this.stateChanges.next())}get readonly(){return this._readonly}set readonly(e){this._readonly=ut(e)}_readonly=!1;disabledInteractive;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e}_neverEmptyInputTypes=["date","datetime","datetime-local","month","time","week"].filter(e=>Qi().has(e));constructor(){let e=s(xn,{optional:!0}),t=s(Dn,{optional:!0}),i=s(Un),r=s(fi,{optional:!0,self:!0}),o=this._elementRef.nativeElement,u=o.nodeName.toLowerCase();r?Za(r.value)?this._signalBasedValueAccessor=r:this._inputValueAccessor=r:this._inputValueAccessor=o,this._previousNativeValue=this.value,this.id=this.id,this._platform.IOS&&this._ngZone.runOutsideAngular(()=>{this._cleanupIosKeyup=this._renderer.listen(o,"keyup",this._iOSKeyupListener)}),this._errorStateTracker=new Jn(i,this.ngControl,t,e,this.stateChanges),this._isServer=!this._platform.isBrowser,this._isNativeSelect=u==="select",this._isTextarea=u==="textarea",this._isInFormField=!!this._formField,this.disabledInteractive=this._config?.disabledInteractive||!1,this._isNativeSelect&&(this.controlType=o.multiple?"mat-native-select-multiple":"mat-native-select"),this._signalBasedValueAccessor&&ve(()=>{this._signalBasedValueAccessor.value(),this.stateChanges.next()})}ngAfterViewInit(){this._platform.isBrowser&&this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(e=>{this.autofilled=e.isAutofilled,this.stateChanges.next()})}ngOnChanges(){this.stateChanges.next()}ngOnDestroy(){this.stateChanges.complete(),this._platform.isBrowser&&this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement),this._cleanupIosKeyup?.(),this._cleanupWebkitWheel?.()}ngDoCheck(){this.ngControl&&(this.updateErrorState(),this.ngControl.disabled!==null&&this.ngControl.disabled!==this.disabled&&(this.disabled=this.ngControl.disabled,this.stateChanges.next())),this._dirtyCheckNativeValue(),this._dirtyCheckPlaceholder()}focus(e){this._elementRef.nativeElement.focus(e)}updateErrorState(){this._errorStateTracker.updateErrorState()}_focusChanged(e){if(e!==this.focused){if(!this._isNativeSelect&&e&&this.disabled&&this.disabledInteractive){let t=this._elementRef.nativeElement;t.type==="number"?(t.type="text",t.setSelectionRange(0,0),t.type="number"):t.setSelectionRange(0,0)}this.focused=e,this.stateChanges.next()}}_onInput(){}_dirtyCheckNativeValue(){let e=this._elementRef.nativeElement.value;this._previousNativeValue!==e&&(this._previousNativeValue=e,this.stateChanges.next())}_dirtyCheckPlaceholder(){let e=this._getPlaceholder();if(e!==this._previousPlaceholder){let t=this._elementRef.nativeElement;this._previousPlaceholder=e,e?t.setAttribute("placeholder",e):t.removeAttribute("placeholder")}}_getPlaceholder(){return this.placeholder||null}_validateType(){Jl.indexOf(this._type)>-1}_isNeverEmpty(){return this._neverEmptyInputTypes.indexOf(this._type)>-1}_isBadInput(){let e=this._elementRef.nativeElement.validity;return e&&e.badInput}get empty(){return!this._isNeverEmpty()&&!this._elementRef.nativeElement.value&&!this._isBadInput()&&!this.autofilled}get shouldLabelFloat(){if(this._isNativeSelect){let e=this._elementRef.nativeElement,t=e.options[0];return this.focused||e.multiple||!this.empty||!!(e.selectedIndex>-1&&t&&t.label)}else return this.focused&&!this.disabled||!this.empty}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let t=this._elementRef.nativeElement;e.length?t.setAttribute("aria-describedby",e.join(" ")):t.removeAttribute("aria-describedby")}onContainerClick(){this.focused||this.focus()}_isInlineSelect(){let e=this._elementRef.nativeElement;return this._isNativeSelect&&(e.multiple||e.size>1)}_iOSKeyupListener=e=>{let t=e.target;!t.value&&t.selectionStart===0&&t.selectionEnd===0&&(t.setSelectionRange(1,1),t.setSelectionRange(0,0))};_getReadonlyAttribute(){return this._isNativeSelect?null:this.readonly||this.disabled&&this.disabledInteractive?"true":null}static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["input","matInput",""],["textarea","matInput",""],["select","matNativeControl",""],["input","matNativeControl",""],["textarea","matNativeControl",""]],hostAttrs:[1,"mat-mdc-input-element"],hostVars:21,hostBindings:function(t,i){t&1&&g("focus",function(){return i._focusChanged(!0)})("blur",function(){return i._focusChanged(!1)})("input",function(){return i._onInput()}),t&2&&(De("id",i.id)("disabled",i.disabled&&!i.disabledInteractive)("required",i.required),B("name",i.name||null)("readonly",i._getReadonlyAttribute())("aria-disabled",i.disabled&&i.disabledInteractive?"true":null)("aria-invalid",i.empty&&i.required?null:i.errorState)("aria-required",i.required)("id",i.id),I("mat-input-server",i._isServer)("mat-mdc-form-field-textarea-control",i._isInFormField&&i._isTextarea)("mat-mdc-form-field-input-control",i._isInFormField)("mat-mdc-input-disabled-interactive",i.disabledInteractive)("mdc-text-field__input",i._isInFormField)("mat-mdc-native-select-inline",i._isInlineSelect()))},inputs:{disabled:"disabled",id:"id",placeholder:"placeholder",name:"name",required:"required",type:"type",errorStateMatcher:"errorStateMatcher",userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],value:"value",readonly:"readonly",disabledInteractive:[2,"disabledInteractive","disabledInteractive",S]},exportAs:["matInput"],features:[K([{provide:Mn,useExisting:a}]),ee]})}return a})(),rt=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({imports:[Me,Me,Vo,ge]})}return a})();var An=class{_multiple;_emitChanges;compareWith;_selection=new Set;_deselectedToEmit=[];_selectedToEmit=[];_selected=null;get selected(){return this._selected||(this._selected=Array.from(this._selection.values())),this._selected}changed=new L;bulk={select:n=>this._select(n),deselect:n=>this._deselect(n),setSelection:n=>this._setSelection(n)};constructor(n=!1,e,t=!0,i){this._multiple=n,this._emitChanges=t,this.compareWith=i,e&&e.length&&(n?e.forEach(r=>this._markSelected(r)):this._markSelected(e[0]),this._selectedToEmit.length=0)}select(...n){return this._select(n)}deselect(...n){return this._deselect(n)}setSelection(...n){return this._setSelection(n)}toggle(n){return this.isSelected(n)?this.deselect(n):this.select(n)}clear(n=!0){this._unmarkAll();let e=this._hasQueuedChanges();return n&&this._emitChangeEvent(),e}isSelected(n){return this._selection.has(this._getConcreteValue(n))}isEmpty(){return this._selection.size===0}hasValue(){return!this.isEmpty()}sort(n){this._multiple&&this.selected&&this._selected.sort(n)}isMultipleSelection(){return this._multiple}_select(n){this._verifyValueAssignment(n),n.forEach(t=>this._markSelected(t));let e=this._hasQueuedChanges();return this._emitChangeEvent(),e}_deselect(n){this._verifyValueAssignment(n),n.forEach(t=>this._unmarkSelected(t));let e=this._hasQueuedChanges();return this._emitChangeEvent(),e}_setSelection(n){this._verifyValueAssignment(n);let e=this.selected,t=new Set(n.map(r=>this._getConcreteValue(r)));n.forEach(r=>this._markSelected(r)),e.filter(r=>!t.has(this._getConcreteValue(r,t))).forEach(r=>this._unmarkSelected(r));let i=this._hasQueuedChanges();return this._emitChangeEvent(),i}_emitChangeEvent(){this._selected=null,(this._selectedToEmit.length||this._deselectedToEmit.length)&&(this.changed.next({source:this,added:this._selectedToEmit,removed:this._deselectedToEmit}),this._deselectedToEmit=[],this._selectedToEmit=[])}_markSelected(n){n=this._getConcreteValue(n),this.isSelected(n)||(this._multiple||this._unmarkAll(),this.isSelected(n)||this._selection.add(n),this._emitChanges&&this._selectedToEmit.push(n))}_unmarkSelected(n){n=this._getConcreteValue(n),this.isSelected(n)&&(this._selection.delete(n),this._emitChanges&&this._deselectedToEmit.push(n))}_unmarkAll(){this.isEmpty()||this._selection.forEach(n=>this._unmarkSelected(n))}_verifyValueAssignment(n){n.length>1&&this._multiple}_hasQueuedChanges(){return!!(this._deselectedToEmit.length||this._selectedToEmit.length)}_getConcreteValue(n,e){if(this.compareWith){e=e??this._selection;for(let t of e)if(this.compareWith(n,t))return t;return n}else return n}};var _a=(()=>{class a{_listeners=[];notify(e,t){for(let i of this._listeners)i(e,t)}listen(e){return this._listeners.push(e),()=>{this._listeners=this._listeners.filter(t=>e!==t)}}ngOnDestroy(){this._listeners=[]}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})();var td=20,rn=(()=>{class a{_ngZone=s(H);_platform=s(fe);_renderer=s(ct).createRenderer(null,null);_cleanupGlobalListener;_scrolled=new L;_scrolledCount=0;scrollContainers=new Map;register(e){this.scrollContainers.has(e)||this.scrollContainers.set(e,e.elementScrolled().subscribe(()=>this._scrolled.next(e)))}deregister(e){let t=this.scrollContainers.get(e);t&&(t.unsubscribe(),this.scrollContainers.delete(e))}scrolled(e=td){return this._platform.isBrowser?new Bn(t=>{this._cleanupGlobalListener||(this._cleanupGlobalListener=this._ngZone.runOutsideAngular(()=>this._renderer.listen("document","scroll",()=>this._scrolled.next())));let i=e>0?this._scrolled.pipe(zi(e)).subscribe(t):this._scrolled.subscribe(t);return this._scrolledCount++,()=>{i.unsubscribe(),this._scrolledCount--,this._scrolledCount||(this._cleanupGlobalListener?.(),this._cleanupGlobalListener=void 0)}}):Xt()}ngOnDestroy(){this._cleanupGlobalListener?.(),this._cleanupGlobalListener=void 0,this.scrollContainers.forEach((e,t)=>this.deregister(t)),this._scrolled.complete()}ancestorScrolled(e,t){let i=this.getAncestorScrollContainers(e);return this.scrolled(t).pipe(Le(r=>!r||i.indexOf(r)>-1))}getAncestorScrollContainers(e){let t=[];return this.scrollContainers.forEach((i,r)=>{this._targetContainsElement(r,e)&&t.push(r)}),t}_targetContainsElement(e,t){let i=_n(t),r=e.getElementRef().nativeElement;do if(i==r)return!0;while(i=i.parentElement);return!1}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})();var nd=20,Ot=(()=>{class a{_platform=s(fe);_listeners;_viewportSize=null;_change=new L;_document=s(Se);constructor(){let e=s(H),t=s(ct).createRenderer(null,null);e.runOutsideAngular(()=>{if(this._platform.isBrowser){let i=r=>this._change.next(r);this._listeners=[t.listen("window","resize",i),t.listen("window","orientationchange",i)]}this.change().subscribe(()=>this._viewportSize=null)})}ngOnDestroy(){this._listeners?.forEach(e=>e()),this._change.complete()}getViewportSize(){this._viewportSize||this._updateViewportSize();let e={width:this._viewportSize.width,height:this._viewportSize.height};return this._platform.isBrowser||(this._viewportSize=null),e}getViewportRect(){let e=this.getViewportScrollPosition(),{width:t,height:i}=this.getViewportSize();return{top:e.top,left:e.left,bottom:e.top+i,right:e.left+t,height:i,width:t}}getViewportScrollPosition(){if(!this._platform.isBrowser)return{top:0,left:0};let e=this._document,t=this._getWindow(),i=e.documentElement,r=i.getBoundingClientRect(),o=-r.top||e.body?.scrollTop||t.scrollY||i.scrollTop||0,u=-r.left||e.body?.scrollLeft||t.scrollX||i.scrollLeft||0;return{top:o,left:u}}change(e=nd){return e>0?this._change.pipe(zi(e)):this._change}_getWindow(){return this._document.defaultView||window}_updateViewportSize(){let e=this._getWindow();this._viewportSize=this._platform.isBrowser?{width:e.innerWidth,height:e.innerHeight}:{width:0,height:0}}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})();var gt=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({})}return a})(),ga=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({imports:[ge,gt,ge,gt]})}return a})();var On=class{_attachedHost=null;attach(n){return this._attachedHost=n,n.attach(this)}detach(){let n=this._attachedHost;n!=null&&(this._attachedHost=null,n.detach())}get isAttached(){return this._attachedHost!=null}setAttachedHost(n){this._attachedHost=n}},Wt=class extends On{component;viewContainerRef;injector;projectableNodes;bindings;directives;constructor(n,e,t,i,r,o){super(),this.component=n,this.viewContainerRef=e,this.injector=t,this.projectableNodes=i,this.bindings=r||null,this.directives=o||null}},Rt=class extends On{templateRef;viewContainerRef;context;injector;constructor(n,e,t,i){super(),this.templateRef=n,this.viewContainerRef=e,this.context=t,this.injector=i}get origin(){return this.templateRef.elementRef}attach(n,e=this.context){return this.context=e,super.attach(n)}detach(){return this.context=void 0,super.detach()}},ba=class extends On{element;constructor(n){super(),this.element=n instanceof F?n.nativeElement:n}},_i=class{_attachedPortal=null;_disposeFn=null;_isDisposed=!1;hasAttached(){return!!this._attachedPortal}attach(n){if(n instanceof Wt)return this._attachedPortal=n,this.attachComponentPortal(n);if(n instanceof Rt)return this._attachedPortal=n,this.attachTemplatePortal(n);if(this.attachDomPortal&&n instanceof ba)return this._attachedPortal=n,this.attachDomPortal(n)}attachDomPortal=null;detach(){this._attachedPortal&&(this._attachedPortal.setAttachedHost(null),this._attachedPortal=null),this._invokeDisposeFn()}dispose(){this.hasAttached()&&this.detach(),this._invokeDisposeFn(),this._isDisposed=!0}setDisposeFn(n){this._disposeFn=n}_invokeDisposeFn(){this._disposeFn&&(this._disposeFn(),this._disposeFn=null)}},gi=class extends _i{outletElement;_appRef;_defaultInjector;constructor(n,e,t){super(),this.outletElement=n,this._appRef=e,this._defaultInjector=t}attachComponentPortal(n){let e;if(n.viewContainerRef){let t=n.injector||n.viewContainerRef.injector,i=t.get(Wi,null,{optional:!0})||void 0;e=n.viewContainerRef.createComponent(n.component,{index:n.viewContainerRef.length,injector:t,ngModuleRef:i,projectableNodes:n.projectableNodes||void 0,bindings:n.bindings||void 0,directives:n.directives||void 0}),this.setDisposeFn(()=>e.destroy())}else{let t=this._appRef,i=n.injector||this._defaultInjector||X.NULL,r=i.get(Hn,t.injector);e=cr(n.component,{elementInjector:i,environmentInjector:r,projectableNodes:n.projectableNodes||void 0,bindings:n.bindings||void 0,directives:n.directives||void 0}),t.attachView(e.hostView),this.setDisposeFn(()=>{t.viewCount>0&&t.detachView(e.hostView),e.destroy()})}return this.outletElement.appendChild(this._getComponentRootNode(e)),this._attachedPortal=n,e}attachTemplatePortal(n){let e=n.viewContainerRef,t=e.createEmbeddedView(n.templateRef,n.context,{injector:n.injector});return t.rootNodes.forEach(i=>this.outletElement.appendChild(i)),t.detectChanges(),this.setDisposeFn(()=>{let i=e.indexOf(t);i!==-1&&e.remove(i)}),this._attachedPortal=n,t}attachDomPortal=n=>{let e=n.element;e.parentNode;let t=this.outletElement.ownerDocument.createComment("dom-portal");e.parentNode.insertBefore(t,e),this.outletElement.appendChild(e),this._attachedPortal=n,super.setDisposeFn(()=>{t.parentNode&&t.parentNode.replaceChild(e,t)})};dispose(){super.dispose(),this.outletElement.remove()}_getComponentRootNode(n){return n.hostView.rootNodes[0]}};var va=(()=>{class a extends _i{_moduleRef=s(Wi,{optional:!0});_document=s(Se);_viewContainerRef=s(Qe);_isInitialized=!1;_attachedRef=null;get portal(){return this._attachedPortal}set portal(e){this.hasAttached()&&!e&&!this._isInitialized||(this.hasAttached()&&super.detach(),e&&super.attach(e),this._attachedPortal=e||null)}attached=new v;get attachedRef(){return this._attachedRef}ngOnInit(){this._isInitialized=!0}ngOnDestroy(){super.dispose(),this._attachedRef=this._attachedPortal=null}attachComponentPortal(e){e.setAttachedHost(this);let t=e.viewContainerRef!=null?e.viewContainerRef:this._viewContainerRef,i=t.createComponent(e.component,{index:t.length,injector:e.injector||t.injector,projectableNodes:e.projectableNodes||void 0,ngModuleRef:this._moduleRef||void 0,bindings:e.bindings||void 0,directives:e.directives||void 0});return t!==this._viewContainerRef&&this._getRootNode().appendChild(i.hostView.rootNodes[0]),super.setDisposeFn(()=>i.destroy()),this._attachedPortal=e,this._attachedRef=i,this.attached.emit(i),i}attachTemplatePortal(e){e.setAttachedHost(this);let t=this._viewContainerRef.createEmbeddedView(e.templateRef,e.context,{injector:e.injector});return super.setDisposeFn(()=>this._viewContainerRef.clear()),this._attachedPortal=e,this._attachedRef=t,this.attached.emit(t),t}attachDomPortal=e=>{let t=e.element;t.parentNode;let i=this._document.createComment("dom-portal");e.setAttachedHost(this),t.parentNode.insertBefore(i,t),this._getRootNode().appendChild(t),this._attachedPortal=e,super.setDisposeFn(()=>{i.parentNode&&i.parentNode.replaceChild(t,i)})};_getRootNode(){let e=this._viewContainerRef.element.nativeElement;return e.nodeType===e.ELEMENT_NODE?e:e.parentNode}static \u0275fac=(()=>{let e;return function(i){return(e||(e=Ke(a)))(i||a)}})();static \u0275dir=V({type:a,selectors:[["","cdkPortalOutlet",""]],inputs:{portal:[0,"cdkPortalOutlet","portal"]},outputs:{attached:"attached"},exportAs:["cdkPortalOutlet"],features:[re]})}return a})(),bi=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({})}return a})();var Fo=xr();function xa(a){return new vi(a.get(Ot),a.get(Se))}var vi=class{_viewportRuler;_previousHTMLStyles={top:"",left:""};_previousScrollPosition;_isEnabled=!1;_document;constructor(n,e){this._viewportRuler=n,this._document=e}attach(){}enable(){if(this._canBeEnabled()){let n=this._document.documentElement;this._previousScrollPosition=this._viewportRuler.getViewportScrollPosition(),this._previousHTMLStyles.left=n.style.left||"",this._previousHTMLStyles.top=n.style.top||"",n.style.left=J(-this._previousScrollPosition.left),n.style.top=J(-this._previousScrollPosition.top),n.classList.add("cdk-global-scrollblock"),this._isEnabled=!0}}disable(){if(this._isEnabled){let n=this._document.documentElement,e=this._document.body,t=n.style,i=e.style,r=t.scrollBehavior||"",o=i.scrollBehavior||"";this._isEnabled=!1,t.left=this._previousHTMLStyles.left,t.top=this._previousHTMLStyles.top,n.classList.remove("cdk-global-scrollblock"),Fo&&(t.scrollBehavior=i.scrollBehavior="auto"),window.scroll(this._previousScrollPosition.left,this._previousScrollPosition.top),Fo&&(t.scrollBehavior=r,i.scrollBehavior=o)}}_canBeEnabled(){if(this._document.documentElement.classList.contains("cdk-global-scrollblock")||this._isEnabled)return!1;let e=this._document.documentElement,t=this._viewportRuler.getViewportSize();return e.scrollHeight>t.height||e.scrollWidth>t.width}};function zo(a,n){return new yi(a.get(rn),a.get(H),a.get(Ot),n)}var yi=class{_scrollDispatcher;_ngZone;_viewportRuler;_config;_scrollSubscription=null;_overlayRef;_initialScrollPosition;constructor(n,e,t,i){this._scrollDispatcher=n,this._ngZone=e,this._viewportRuler=t,this._config=i}attach(n){this._overlayRef,this._overlayRef=n}enable(){if(this._scrollSubscription)return;let n=this._scrollDispatcher.scrolled(0).pipe(Le(e=>!e||!this._overlayRef.overlayElement.contains(e.getElementRef().nativeElement)));this._config&&this._config.threshold&&this._config.threshold>1?(this._initialScrollPosition=this._viewportRuler.getViewportScrollPosition().top,this._scrollSubscription=n.subscribe(()=>{let e=this._viewportRuler.getViewportScrollPosition().top;Math.abs(e-this._initialScrollPosition)>this._config.threshold?this._detach():this._overlayRef.updatePosition()})):this._scrollSubscription=n.subscribe(this._detach)}disable(){this._scrollSubscription&&(this._scrollSubscription.unsubscribe(),this._scrollSubscription=null)}detach(){this.disable(),this._overlayRef=null}_detach=()=>{this.disable(),this._overlayRef.hasAttached()&&this._ngZone.run(()=>this._overlayRef.detach())}};var Rn=class{enable(){}disable(){}attach(){}};function ya(a,n){return n.some(e=>{let t=a.bottom<e.top,i=a.top>e.bottom,r=a.right<e.left,o=a.left>e.right;return t||i||r||o})}function Io(a,n){return n.some(e=>{let t=a.top<e.top,i=a.bottom>e.bottom,r=a.left<e.left,o=a.right>e.right;return t||i||r||o})}function ot(a,n){return new Ci(a.get(rn),a.get(Ot),a.get(H),n)}var Ci=class{_scrollDispatcher;_viewportRuler;_ngZone;_config;_scrollSubscription=null;_overlayRef;constructor(n,e,t,i){this._scrollDispatcher=n,this._viewportRuler=e,this._ngZone=t,this._config=i}attach(n){this._overlayRef,this._overlayRef=n}enable(){if(!this._scrollSubscription){let n=this._config?this._config.scrollThrottle:0;this._scrollSubscription=this._scrollDispatcher.scrolled(n).subscribe(()=>{if(this._overlayRef.updatePosition(),this._config&&this._config.autoClose){let e=this._overlayRef.overlayElement.getBoundingClientRect(),{width:t,height:i}=this._viewportRuler.getViewportSize();ya(e,[{width:t,height:i,bottom:i,right:t,top:0,left:0}])&&(this.disable(),this._ngZone.run(()=>this._overlayRef.detach()))}})}}disable(){this._scrollSubscription&&(this._scrollSubscription.unsubscribe(),this._scrollSubscription=null)}detach(){this.disable(),this._overlayRef=null}},Ho=(()=>{class a{_injector=s(X);noop=()=>new Rn;close=e=>zo(this._injector,e);block=()=>xa(this._injector);reposition=e=>ot(this._injector,e);static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})(),on=class{positionStrategy;scrollStrategy=new Rn;panelClass="";hasBackdrop=!1;backdropClass="cdk-overlay-dark-backdrop";disableAnimations;width;height;minWidth;minHeight;maxWidth;maxHeight;direction;disposeOnNavigation=!1;usePopover;eventPredicate;constructor(n){if(n){let e=Object.keys(n);for(let t of e)n[t]!==void 0&&(this[t]=n[t])}}};var xi=class{connectionPair;scrollableViewProperties;constructor(n,e){this.connectionPair=n,this.scrollableViewProperties=e}};var jo=(()=>{class a{_attachedOverlays=[];_document=s(Se);_isAttached=!1;ngOnDestroy(){this.detach()}add(e){this.remove(e),this._attachedOverlays.push(e)}remove(e){let t=this._attachedOverlays.indexOf(e);t>-1&&this._attachedOverlays.splice(t,1),this._attachedOverlays.length===0&&this.detach()}canReceiveEvent(e,t,i){return i.observers.length<1?!1:e.eventPredicate?e.eventPredicate(t):!0}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})(),Yo=(()=>{class a extends jo{_ngZone=s(H);_renderer=s(ct).createRenderer(null,null);_cleanupKeydown;add(e){super.add(e),this._isAttached||(this._ngZone.runOutsideAngular(()=>{this._cleanupKeydown=this._renderer.listen("body","keydown",this._keydownListener)}),this._isAttached=!0)}detach(){this._isAttached&&(this._cleanupKeydown?.(),this._isAttached=!1)}_keydownListener=e=>{let t=this._attachedOverlays;for(let i=t.length-1;i>-1;i--){let r=t[i];if(this.canReceiveEvent(r,e,r._keydownEvents)){this._ngZone.run(()=>r._keydownEvents.next(e));break}}};static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})(),Go=(()=>{class a extends jo{_platform=s(fe);_ngZone=s(H);_renderer=s(ct).createRenderer(null,null);_cursorOriginalValue;_cursorStyleIsSet=!1;_pointerDownEventTarget=null;_cleanups;add(e){if(super.add(e),!this._isAttached){let t=this._document.body,i={capture:!0},r=this._renderer;this._cleanups=this._ngZone.runOutsideAngular(()=>[r.listen(t,"pointerdown",this._pointerDownListener,i),r.listen(t,"click",this._clickListener,i),r.listen(t,"auxclick",this._clickListener,i),r.listen(t,"contextmenu",this._clickListener,i)]),this._platform.IOS&&!this._cursorStyleIsSet&&(this._cursorOriginalValue=t.style.cursor,t.style.cursor="pointer",this._cursorStyleIsSet=!0),this._isAttached=!0}}detach(){this._isAttached&&(this._cleanups?.forEach(e=>e()),this._cleanups=void 0,this._platform.IOS&&this._cursorStyleIsSet&&(this._document.body.style.cursor=this._cursorOriginalValue,this._cursorStyleIsSet=!1),this._isAttached=!1)}_pointerDownListener=e=>{this._pointerDownEventTarget=mt(e)};_clickListener=e=>{let t=mt(e),i=e.type==="click"&&this._pointerDownEventTarget?this._pointerDownEventTarget:t;this._pointerDownEventTarget=null;let r=this._attachedOverlays.slice();for(let o=r.length-1;o>-1;o--){let u=r[o],h=u._outsidePointerEvents;if(!(!u.hasAttached()||!this.canReceiveEvent(u,e,h))){if(Po(u.overlayElement,t)||Po(u.overlayElement,i))break;this._ngZone?this._ngZone.run(()=>h.next(e)):h.next(e)}}};static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})();function Po(a,n){let e=typeof ShadowRoot<"u"&&ShadowRoot,t=n;for(;t;){if(t===a)return!0;t=e&&t instanceof ShadowRoot?t.host:t.parentNode}return!1}var Wo=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["ng-component"]],hostAttrs:["cdk-overlay-style-loader",""],decls:0,vars:0,template:function(t,i){},styles:[`.cdk-overlay-container, .cdk-global-overlay-wrapper {
  pointer-events: none;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.cdk-overlay-container {
  position: fixed;
}
@layer cdk-overlay {
  .cdk-overlay-container {
    z-index: 1000;
  }
}
.cdk-overlay-container:empty {
  display: none;
}

.cdk-global-overlay-wrapper {
  display: flex;
  position: absolute;
}
@layer cdk-overlay {
  .cdk-global-overlay-wrapper {
    z-index: 1000;
  }
}

.cdk-overlay-pane {
  position: absolute;
  pointer-events: auto;
  box-sizing: border-box;
  display: flex;
  max-width: 100%;
  max-height: 100%;
}
@layer cdk-overlay {
  .cdk-overlay-pane {
    z-index: 1000;
  }
}

.cdk-overlay-backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  opacity: 0;
  touch-action: manipulation;
}
@layer cdk-overlay {
  .cdk-overlay-backdrop {
    z-index: 1000;
    transition: opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
  }
}
@media (prefers-reduced-motion) {
  .cdk-overlay-backdrop {
    transition-duration: 1ms;
  }
}

.cdk-overlay-backdrop-showing {
  opacity: 1;
}
@media (forced-colors: active) {
  .cdk-overlay-backdrop-showing {
    opacity: 0.6;
  }
}

@layer cdk-overlay {
  .cdk-overlay-dark-backdrop {
    background: rgba(0, 0, 0, 0.32);
  }
}

.cdk-overlay-transparent-backdrop {
  transition: visibility 1ms linear, opacity 1ms linear;
  visibility: hidden;
  opacity: 1;
}
.cdk-overlay-transparent-backdrop.cdk-overlay-backdrop-showing, .cdk-high-contrast-active .cdk-overlay-transparent-backdrop {
  opacity: 0;
  visibility: visible;
}

.cdk-overlay-backdrop-noop-animation {
  transition: none;
}

.cdk-overlay-connected-position-bounding-box {
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 1px;
  min-height: 1px;
}
@layer cdk-overlay {
  .cdk-overlay-connected-position-bounding-box {
    z-index: 1000;
  }
}

.cdk-global-scrollblock {
  position: fixed;
  width: 100%;
  overflow-y: scroll;
}

.cdk-overlay-popover {
  background: none;
  border: none;
  padding: 0;
  outline: 0;
  overflow: visible;
  position: fixed;
  pointer-events: none;
  white-space: normal;
  color: inherit;
  text-decoration: none;
  width: 100%;
  height: 100%;
  inset: auto;
  top: 0;
  left: 0;
}
.cdk-overlay-popover::backdrop {
  display: none;
}
.cdk-overlay-popover .cdk-overlay-backdrop {
  position: fixed;
  z-index: auto;
}
`],encapsulation:2})}return a})(),qo=(()=>{class a{_platform=s(fe);_containerElement;_document=s(Se);_styleLoader=s(Oe);ngOnDestroy(){this._containerElement?.remove()}getContainerElement(){return this._loadStyles(),this._containerElement||this._createContainer(),this._containerElement}_createContainer(){let e="cdk-overlay-container";if(this._platform.isBrowser||Ki()){let i=this._document.querySelectorAll(`.${e}[platform="server"], .${e}[platform="test"]`);for(let r=0;r<i.length;r++)i[r].remove()}let t=this._document.createElement("div");t.classList.add(e),Ki()?t.setAttribute("platform","test"):this._platform.isBrowser||t.setAttribute("platform","server"),this._document.body.appendChild(t),this._containerElement=t}_loadStyles(){this._styleLoader.load(Wo)}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})(),Ca=class{_renderer;_ngZone;element;_cleanupClick;_cleanupTransitionEnd;_fallbackTimeout;constructor(n,e,t,i){this._renderer=e,this._ngZone=t,this.element=n.createElement("div"),this.element.classList.add("cdk-overlay-backdrop"),this._cleanupClick=e.listen(this.element,"click",i)}detach(){this._ngZone.runOutsideAngular(()=>{let n=this.element;clearTimeout(this._fallbackTimeout),this._cleanupTransitionEnd?.(),this._cleanupTransitionEnd=this._renderer.listen(n,"transitionend",this.dispose),this._fallbackTimeout=setTimeout(this.dispose,500),n.style.pointerEvents="none",n.classList.remove("cdk-overlay-backdrop-showing")})}dispose=()=>{clearTimeout(this._fallbackTimeout),this._cleanupClick?.(),this._cleanupTransitionEnd?.(),this._cleanupClick=this._cleanupTransitionEnd=this._fallbackTimeout=void 0,this.element.remove()}};function Da(a){return a&&a.nodeType===1}var Di=class{_portalOutlet;_host;_pane;_config;_ngZone;_keyboardDispatcher;_document;_location;_outsideClickDispatcher;_animationsDisabled;_injector;_renderer;_backdropClick=new L;_attachments=new L;_detachments=new L;_positionStrategy;_scrollStrategy;_locationChanges=pe.EMPTY;_backdropRef=null;_detachContentMutationObserver;_detachContentAfterRenderRef;_disposed=!1;_previousHostParent;_keydownEvents=new L;_outsidePointerEvents=new L;_afterNextRenderRef;constructor(n,e,t,i,r,o,u,h,w,k=!1,z,se){this._portalOutlet=n,this._host=e,this._pane=t,this._config=i,this._ngZone=r,this._keyboardDispatcher=o,this._document=u,this._location=h,this._outsideClickDispatcher=w,this._animationsDisabled=k,this._injector=z,this._renderer=se,i.scrollStrategy&&(this._scrollStrategy=i.scrollStrategy,this._scrollStrategy.attach(this)),this._positionStrategy=i.positionStrategy}get overlayElement(){return this._pane}get backdropElement(){return this._backdropRef?.element||null}get hostElement(){return this._host}get eventPredicate(){return this._config?.eventPredicate||null}attach(n){if(this._disposed)return null;this._attachHost();let e=this._portalOutlet.attach(n);return this._positionStrategy?.attach(this),this._updateStackingOrder(),this._updateElementSize(),this._updateElementDirection(),this._scrollStrategy&&this._scrollStrategy.enable(),this._afterNextRenderRef?.destroy(),this._afterNextRenderRef=Ee(()=>{this.hasAttached()&&this.updatePosition()},{injector:this._injector}),this._togglePointerEvents(!0),this._config.hasBackdrop&&this._attachBackdrop(),this._config.panelClass&&this._toggleClasses(this._pane,this._config.panelClass,!0),this._attachments.next(),this._completeDetachContent(),this._keyboardDispatcher.add(this),this._config.disposeOnNavigation&&(this._locationChanges=this._location.subscribe(()=>this.dispose())),this._outsideClickDispatcher.add(this),typeof e?.onDestroy=="function"&&e.onDestroy(()=>{this.hasAttached()&&this._ngZone.runOutsideAngular(()=>Promise.resolve().then(()=>this.detach()))}),e}detach(){if(!this.hasAttached())return;this.detachBackdrop(),this._togglePointerEvents(!1),this._positionStrategy&&this._positionStrategy.detach&&this._positionStrategy.detach(),this._scrollStrategy&&this._scrollStrategy.disable();let n=this._portalOutlet.detach();return this._detachments.next(),this._completeDetachContent(),this._keyboardDispatcher.remove(this),this._detachContentWhenEmpty(),this._locationChanges.unsubscribe(),this._outsideClickDispatcher.remove(this),n}dispose(){if(this._disposed)return;let n=this.hasAttached();this._positionStrategy&&this._positionStrategy.dispose(),this._disposeScrollStrategy(),this._backdropRef?.dispose(),this._locationChanges.unsubscribe(),this._keyboardDispatcher.remove(this),this._portalOutlet.dispose(),this._attachments.complete(),this._backdropClick.complete(),this._keydownEvents.complete(),this._outsidePointerEvents.complete(),this._outsideClickDispatcher.remove(this),this._host?.remove(),this._afterNextRenderRef?.destroy(),this._previousHostParent=this._pane=this._host=this._backdropRef=null,n&&this._detachments.next(),this._detachments.complete(),this._completeDetachContent(),this._disposed=!0}hasAttached(){return this._portalOutlet.hasAttached()}backdropClick(){return this._backdropClick}attachments(){return this._attachments}detachments(){return this._detachments}keydownEvents(){return this._keydownEvents}outsidePointerEvents(){return this._outsidePointerEvents}getConfig(){return this._config}updatePosition(){this._positionStrategy&&this._positionStrategy.apply()}updatePositionStrategy(n){n!==this._positionStrategy&&(this._positionStrategy&&this._positionStrategy.dispose(),this._positionStrategy=n,this.hasAttached()&&(n.attach(this),this.updatePosition()))}updateSize(n){this._config=W(W({},this._config),n),this._updateElementSize()}setDirection(n){this._config=xe(W({},this._config),{direction:n}),this._updateElementDirection()}addPanelClass(n){this._pane&&this._toggleClasses(this._pane,n,!0)}removePanelClass(n){this._pane&&this._toggleClasses(this._pane,n,!1)}getDirection(){let n=this._config.direction;return n?typeof n=="string"?n:n.value:"ltr"}updateScrollStrategy(n){n!==this._scrollStrategy&&(this._disposeScrollStrategy(),this._scrollStrategy=n,this.hasAttached()&&(n.attach(this),n.enable()))}_updateElementDirection(){this._host.setAttribute("dir",this.getDirection())}_updateElementSize(){if(!this._pane)return;let n=this._pane.style;n.width=J(this._config.width),n.height=J(this._config.height),n.minWidth=J(this._config.minWidth),n.minHeight=J(this._config.minHeight),n.maxWidth=J(this._config.maxWidth),n.maxHeight=J(this._config.maxHeight)}_togglePointerEvents(n){this._pane.style.pointerEvents=n?"":"none"}_attachHost(){if(!this._host.parentElement){let n=this._config.usePopover?this._positionStrategy?.getPopoverInsertionPoint?.():null;Da(n)?n.after(this._host):n?.type==="parent"?n.element.appendChild(this._host):this._previousHostParent?.appendChild(this._host)}if(this._config.usePopover)try{this._host.showPopover()}catch{}}_attachBackdrop(){let n="cdk-overlay-backdrop-showing";this._backdropRef?.dispose(),this._backdropRef=new Ca(this._document,this._renderer,this._ngZone,e=>{this._backdropClick.next(e)}),this._animationsDisabled&&this._backdropRef.element.classList.add("cdk-overlay-backdrop-noop-animation"),this._config.backdropClass&&this._toggleClasses(this._backdropRef.element,this._config.backdropClass,!0),this._config.usePopover?this._host.prepend(this._backdropRef.element):this._host.parentElement.insertBefore(this._backdropRef.element,this._host),!this._animationsDisabled&&typeof requestAnimationFrame<"u"?this._ngZone.runOutsideAngular(()=>{requestAnimationFrame(()=>this._backdropRef?.element.classList.add(n))}):this._backdropRef.element.classList.add(n)}_updateStackingOrder(){!this._config.usePopover&&this._host.nextSibling&&this._host.parentNode.appendChild(this._host)}detachBackdrop(){this._animationsDisabled?(this._backdropRef?.dispose(),this._backdropRef=null):this._backdropRef?.detach()}_toggleClasses(n,e,t){let i=Xi(e||[]).filter(r=>!!r);i.length&&(t?n.classList.add(...i):n.classList.remove(...i))}_detachContentWhenEmpty(){let n=!1;try{this._detachContentAfterRenderRef=Ee(()=>{n=!0,this._detachContent()},{injector:this._injector})}catch(e){if(n)throw e;this._detachContent()}globalThis.MutationObserver&&this._pane&&(this._detachContentMutationObserver||=new globalThis.MutationObserver(()=>{this._detachContent()}),this._detachContentMutationObserver.observe(this._pane,{childList:!0}))}_detachContent(){(!this._pane||!this._host||this._pane.children.length===0)&&(this._pane&&this._config.panelClass&&this._toggleClasses(this._pane,this._config.panelClass,!1),this._host&&this._host.parentElement&&(this._previousHostParent=this._host.parentElement,this._host.remove()),this._completeDetachContent())}_completeDetachContent(){this._detachContentAfterRenderRef?.destroy(),this._detachContentAfterRenderRef=void 0,this._detachContentMutationObserver?.disconnect()}_disposeScrollStrategy(){let n=this._scrollStrategy;n?.disable(),n?.detach?.()}},To="cdk-overlay-connected-position-bounding-box",id=/([A-Za-z%]+)$/;function Ft(a,n){return new Vn(n,a.get(Ot),a.get(Se),a.get(fe),a.get(qo))}var Vn=class{_viewportRuler;_document;_platform;_overlayContainer;_overlayRef;_isInitialRender=!1;_lastBoundingBoxSize={width:0,height:0};_isPushed=!1;_canPush=!0;_growAfterOpen=!1;_hasFlexibleDimensions=!0;_positionLocked=!1;_originRect;_overlayRect;_viewportRect;_containerRect;_viewportMargin=0;_scrollables=[];_preferredPositions=[];_origin;_pane;_isDisposed=!1;_boundingBox=null;_lastPosition=null;_lastScrollVisibility=null;_positionChanges=new L;_resizeSubscription=pe.EMPTY;_offsetX=0;_offsetY=0;_transformOriginSelector;_appliedPanelClasses=[];_previousPushAmount=null;_popoverLocation="global";positionChanges=this._positionChanges;get positions(){return this._preferredPositions}constructor(n,e,t,i,r){this._viewportRuler=e,this._document=t,this._platform=i,this._overlayContainer=r,this.setOrigin(n)}attach(n){this._overlayRef&&this._overlayRef,this._validatePositions(),n.hostElement.classList.add(To),this._overlayRef=n,this._boundingBox=n.hostElement,this._pane=n.overlayElement,this._isDisposed=!1,this._isInitialRender=!0,this._lastPosition=null,this._resizeSubscription.unsubscribe(),this._resizeSubscription=this._viewportRuler.change().subscribe(()=>{this._isInitialRender=!0,this.apply()})}apply(){if(this._isDisposed||!this._platform.isBrowser)return;if(!this._isInitialRender&&this._positionLocked&&this._lastPosition){this.reapplyLastPosition();return}this._clearPanelClasses(),this._resetOverlayElementStyles(),this._resetBoundingBoxStyles(),this._viewportRect=this._getNarrowedViewportRect(),this._originRect=this._getOriginRect(),this._overlayRect=this._pane.getBoundingClientRect(),this._containerRect=this._getContainerRect();let n=this._originRect,e=this._overlayRect,t=this._viewportRect,i=this._containerRect,r=[],o;for(let u of this._preferredPositions){let h=this._getOriginPoint(n,i,u),w=this._getOverlayPoint(h,e,u),k=this._getOverlayFit(w,e,t,u);if(k.isCompletelyWithinViewport){this._isPushed=!1,this._applyPosition(u,h);return}if(this._canFitWithFlexibleDimensions(k,w,t)){r.push({position:u,origin:h,overlayRect:e,boundingBoxRect:this._calculateBoundingBoxRect(h,u)});continue}(!o||o.overlayFit.visibleArea<k.visibleArea)&&(o={overlayFit:k,overlayPoint:w,originPoint:h,position:u,overlayRect:e})}if(r.length){let u=null,h=-1;for(let w of r){let k=w.boundingBoxRect.width*w.boundingBoxRect.height*(w.position.weight||1);k>h&&(h=k,u=w)}this._isPushed=!1,this._applyPosition(u.position,u.origin);return}if(this._canPush){this._isPushed=!0,this._applyPosition(o.position,o.originPoint);return}this._applyPosition(o.position,o.originPoint)}detach(){this._clearPanelClasses(),this._lastPosition=null,this._previousPushAmount=null,this._resizeSubscription.unsubscribe()}dispose(){this._isDisposed||(this._boundingBox&&qt(this._boundingBox.style,{top:"",left:"",right:"",bottom:"",height:"",width:"",alignItems:"",justifyContent:""}),this._pane&&this._resetOverlayElementStyles(),this._overlayRef&&this._overlayRef.hostElement.classList.remove(To),this.detach(),this._positionChanges.complete(),this._overlayRef=this._boundingBox=null,this._isDisposed=!0)}reapplyLastPosition(){if(this._isDisposed||!this._platform.isBrowser)return;let n=this._lastPosition;n?(this._originRect=this._getOriginRect(),this._overlayRect=this._pane.getBoundingClientRect(),this._viewportRect=this._getNarrowedViewportRect(),this._containerRect=this._getContainerRect(),this._applyPosition(n,this._getOriginPoint(this._originRect,this._containerRect,n))):this.apply()}withScrollableContainers(n){return this._scrollables=n,this}withPositions(n){return this._preferredPositions=n,n.indexOf(this._lastPosition)===-1&&(this._lastPosition=null),this._validatePositions(),this}withViewportMargin(n){return this._viewportMargin=n,this}withFlexibleDimensions(n=!0){return this._hasFlexibleDimensions=n,this}withGrowAfterOpen(n=!0){return this._growAfterOpen=n,this}withPush(n=!0){return this._canPush=n,this}withLockedPosition(n=!0){return this._positionLocked=n,this}setOrigin(n){return this._origin=n,this}withDefaultOffsetX(n){return this._offsetX=n,this}withDefaultOffsetY(n){return this._offsetY=n,this}withTransformOriginOn(n){return this._transformOriginSelector=n,this}withPopoverLocation(n){return this._popoverLocation=n,this}getPopoverInsertionPoint(){return this._popoverLocation==="global"?null:this._popoverLocation!=="inline"?this._popoverLocation:this._origin instanceof F?this._origin.nativeElement:Da(this._origin)?this._origin:null}_getOriginPoint(n,e,t){let i;if(t.originX=="center")i=n.left+n.width/2;else{let o=this._isRtl()?n.right:n.left,u=this._isRtl()?n.left:n.right;i=t.originX=="start"?o:u}e.left<0&&(i-=e.left);let r;return t.originY=="center"?r=n.top+n.height/2:r=t.originY=="top"?n.top:n.bottom,e.top<0&&(r-=e.top),{x:i,y:r}}_getOverlayPoint(n,e,t){let i;t.overlayX=="center"?i=-e.width/2:t.overlayX==="start"?i=this._isRtl()?-e.width:0:i=this._isRtl()?0:-e.width;let r;return t.overlayY=="center"?r=-e.height/2:r=t.overlayY=="top"?0:-e.height,{x:n.x+i,y:n.y+r}}_getOverlayFit(n,e,t,i){let r=Lo(e),{x:o,y:u}=n,h=this._getOffset(i,"x"),w=this._getOffset(i,"y");h&&(o+=h),w&&(u+=w);let k=0-o,z=o+r.width-t.width,se=0-u,le=u+r.height-t.height,de=this._subtractOverflows(r.width,k,z),Ce=this._subtractOverflows(r.height,se,le),$t=de*Ce;return{visibleArea:$t,isCompletelyWithinViewport:r.width*r.height===$t,fitsInViewportVertically:Ce===r.height,fitsInViewportHorizontally:de==r.width}}_canFitWithFlexibleDimensions(n,e,t){if(this._hasFlexibleDimensions){let i=t.bottom-e.y,r=t.right-e.x,o=No(this._overlayRef.getConfig().minHeight),u=No(this._overlayRef.getConfig().minWidth),h=n.fitsInViewportVertically||o!=null&&o<=i,w=n.fitsInViewportHorizontally||u!=null&&u<=r;return h&&w}return!1}_pushOverlayOnScreen(n,e,t){if(this._previousPushAmount&&this._positionLocked)return{x:n.x+this._previousPushAmount.x,y:n.y+this._previousPushAmount.y};let i=Lo(e),r=this._viewportRect,o=Math.max(n.x+i.width-r.width,0),u=Math.max(n.y+i.height-r.height,0),h=Math.max(r.top-t.top-n.y,0),w=Math.max(r.left-t.left-n.x,0),k=0,z=0;return i.width<=r.width?k=w||-o:k=n.x<this._getViewportMarginStart()?r.left-t.left-n.x:0,i.height<=r.height?z=h||-u:z=n.y<this._getViewportMarginTop()?r.top-t.top-n.y:0,this._previousPushAmount={x:k,y:z},{x:n.x+k,y:n.y+z}}_applyPosition(n,e){if(this._setTransformOrigin(n),this._setOverlayElementStyles(e,n),this._setBoundingBoxStyles(e,n),n.panelClass&&this._addPanelClasses(n.panelClass),this._positionChanges.observers.length){let t=this._getScrollVisibility();if(n!==this._lastPosition||!this._lastScrollVisibility||!ad(this._lastScrollVisibility,t)){let i=new xi(n,t);this._positionChanges.next(i)}this._lastScrollVisibility=t}this._lastPosition=n,this._isInitialRender=!1}_setTransformOrigin(n){if(!this._transformOriginSelector)return;let e=this._boundingBox.querySelectorAll(this._transformOriginSelector),t,i=n.overlayY;n.overlayX==="center"?t="center":this._isRtl()?t=n.overlayX==="start"?"right":"left":t=n.overlayX==="start"?"left":"right";for(let r=0;r<e.length;r++)e[r].style.transformOrigin=`${t} ${i}`}_calculateBoundingBoxRect(n,e){let t=this._viewportRect,i=this._isRtl(),r,o,u;if(e.overlayY==="top")o=n.y,r=t.height-o+this._getViewportMarginBottom();else if(e.overlayY==="bottom")u=t.height-n.y+this._getViewportMarginTop()+this._getViewportMarginBottom(),r=t.height-u+this._getViewportMarginTop();else{let le=Math.min(t.bottom-n.y+t.top,n.y),de=this._lastBoundingBoxSize.height;r=le*2,o=n.y-le,r>de&&!this._isInitialRender&&!this._growAfterOpen&&(o=n.y-de/2)}let h=e.overlayX==="start"&&!i||e.overlayX==="end"&&i,w=e.overlayX==="end"&&!i||e.overlayX==="start"&&i,k,z,se;if(w)se=t.width-n.x+this._getViewportMarginStart()+this._getViewportMarginEnd(),k=n.x-this._getViewportMarginStart();else if(h)z=n.x,k=t.right-n.x-this._getViewportMarginEnd();else{let le=Math.min(t.right-n.x+t.left,n.x),de=this._lastBoundingBoxSize.width;k=le*2,z=n.x-le,k>de&&!this._isInitialRender&&!this._growAfterOpen&&(z=n.x-de/2)}return{top:o,left:z,bottom:u,right:se,width:k,height:r}}_setBoundingBoxStyles(n,e){let t=this._calculateBoundingBoxRect(n,e);!this._isInitialRender&&!this._growAfterOpen&&(t.height=Math.min(t.height,this._lastBoundingBoxSize.height),t.width=Math.min(t.width,this._lastBoundingBoxSize.width));let i={};if(this._hasExactPosition())i.top=i.left="0",i.bottom=i.right="auto",i.maxHeight=i.maxWidth="",i.width=i.height="100%";else{let r=this._overlayRef.getConfig().maxHeight,o=this._overlayRef.getConfig().maxWidth;i.width=J(t.width),i.height=J(t.height),i.top=J(t.top)||"auto",i.bottom=J(t.bottom)||"auto",i.left=J(t.left)||"auto",i.right=J(t.right)||"auto",e.overlayX==="center"?i.alignItems="center":i.alignItems=e.overlayX==="end"?"flex-end":"flex-start",e.overlayY==="center"?i.justifyContent="center":i.justifyContent=e.overlayY==="bottom"?"flex-end":"flex-start",r&&(i.maxHeight=J(r)),o&&(i.maxWidth=J(o))}this._lastBoundingBoxSize=t,qt(this._boundingBox.style,i)}_resetBoundingBoxStyles(){qt(this._boundingBox.style,{top:"0",left:"0",right:"0",bottom:"0",height:"",width:"",alignItems:"",justifyContent:""})}_resetOverlayElementStyles(){qt(this._pane.style,{top:"",left:"",bottom:"",right:"",position:"",transform:""})}_setOverlayElementStyles(n,e){let t={},i=this._hasExactPosition(),r=this._hasFlexibleDimensions,o=this._overlayRef.getConfig();if(i){let k=this._viewportRuler.getViewportScrollPosition();qt(t,this._getExactOverlayY(e,n,k)),qt(t,this._getExactOverlayX(e,n,k))}else t.position="static";let u="",h=this._getOffset(e,"x"),w=this._getOffset(e,"y");h&&(u+=`translateX(${h}px) `),w&&(u+=`translateY(${w}px)`),t.transform=u.trim(),o.maxHeight&&(i?t.maxHeight=J(o.maxHeight):r&&(t.maxHeight="")),o.maxWidth&&(i?t.maxWidth=J(o.maxWidth):r&&(t.maxWidth="")),qt(this._pane.style,t)}_getExactOverlayY(n,e,t){let i={top:"",bottom:""},r=this._getOverlayPoint(e,this._overlayRect,n);if(this._isPushed&&(r=this._pushOverlayOnScreen(r,this._overlayRect,t)),n.overlayY==="bottom"){let o=this._document.documentElement.clientHeight;i.bottom=`${o-(r.y+this._overlayRect.height)}px`}else i.top=J(r.y);return i}_getExactOverlayX(n,e,t){let i={left:"",right:""},r=this._getOverlayPoint(e,this._overlayRect,n);this._isPushed&&(r=this._pushOverlayOnScreen(r,this._overlayRect,t));let o;if(this._isRtl()?o=n.overlayX==="end"?"left":"right":o=n.overlayX==="end"?"right":"left",o==="right"){let u=this._document.documentElement.clientWidth;i.right=`${u-(r.x+this._overlayRect.width)}px`}else i.left=J(r.x);return i}_getScrollVisibility(){let n=this._getOriginRect(),e=this._pane.getBoundingClientRect(),t=this._scrollables.map(i=>i.getElementRef().nativeElement.getBoundingClientRect());return{isOriginClipped:Io(n,t),isOriginOutsideView:ya(n,t),isOverlayClipped:Io(e,t),isOverlayOutsideView:ya(e,t)}}_subtractOverflows(n,...e){return e.reduce((t,i)=>t-Math.max(i,0),n)}_getNarrowedViewportRect(){let n=this._document.documentElement.clientWidth,e=this._document.documentElement.clientHeight,t=this._viewportRuler.getViewportScrollPosition();return{top:t.top+this._getViewportMarginTop(),left:t.left+this._getViewportMarginStart(),right:t.left+n-this._getViewportMarginEnd(),bottom:t.top+e-this._getViewportMarginBottom(),width:n-this._getViewportMarginStart()-this._getViewportMarginEnd(),height:e-this._getViewportMarginTop()-this._getViewportMarginBottom()}}_isRtl(){return this._overlayRef.getDirection()==="rtl"}_hasExactPosition(){return!this._hasFlexibleDimensions||this._isPushed}_getOffset(n,e){return e==="x"?n.offsetX==null?this._offsetX:n.offsetX:n.offsetY==null?this._offsetY:n.offsetY}_validatePositions(){}_addPanelClasses(n){this._pane&&Xi(n).forEach(e=>{e!==""&&this._appliedPanelClasses.indexOf(e)===-1&&(this._appliedPanelClasses.push(e),this._pane.classList.add(e))})}_clearPanelClasses(){this._pane&&(this._appliedPanelClasses.forEach(n=>{this._pane.classList.remove(n)}),this._appliedPanelClasses=[])}_getViewportMarginStart(){return typeof this._viewportMargin=="number"?this._viewportMargin:this._viewportMargin?.start??0}_getViewportMarginEnd(){return typeof this._viewportMargin=="number"?this._viewportMargin:this._viewportMargin?.end??0}_getViewportMarginTop(){return typeof this._viewportMargin=="number"?this._viewportMargin:this._viewportMargin?.top??0}_getViewportMarginBottom(){return typeof this._viewportMargin=="number"?this._viewportMargin:this._viewportMargin?.bottom??0}_getOriginRect(){let n=this._origin;if(n instanceof F)return n.nativeElement.getBoundingClientRect();if(n instanceof Element)return n.getBoundingClientRect();let e=n.width||0,t=n.height||0;return{top:n.y,bottom:n.y+t,left:n.x,right:n.x+e,height:t,width:e}}_getContainerRect(){let n=this._overlayRef.getConfig().usePopover&&this._popoverLocation!=="global",e=this._overlayContainer.getContainerElement();n&&(e.style.display="block");let t=e.getBoundingClientRect();return n&&(e.style.display=""),t}};function qt(a,n){for(let e in n)n.hasOwnProperty(e)&&(a[e]=n[e]);return a}function No(a){if(typeof a!="number"&&a!=null){let[n,e]=a.split(id);return!e||e==="px"?parseFloat(n):null}return a||null}function Lo(a){return{top:Math.floor(a.top),right:Math.floor(a.right),bottom:Math.floor(a.bottom),left:Math.floor(a.left),width:Math.floor(a.width),height:Math.floor(a.height)}}function ad(a,n){return a===n?!0:a.isOriginClipped===n.isOriginClipped&&a.isOriginOutsideView===n.isOriginOutsideView&&a.isOverlayClipped===n.isOverlayClipped&&a.isOverlayOutsideView===n.isOverlayOutsideView}var Bo="cdk-global-overlay-wrapper";function wa(a){return new wi}var wi=class{_overlayRef;_cssPosition="static";_topOffset="";_bottomOffset="";_alignItems="";_xPosition="";_xOffset="";_width="";_height="";_isDisposed=!1;attach(n){let e=n.getConfig();this._overlayRef=n,this._width&&!e.width&&n.updateSize({width:this._width}),this._height&&!e.height&&n.updateSize({height:this._height}),n.hostElement.classList.add(Bo),this._isDisposed=!1}top(n=""){return this._bottomOffset="",this._topOffset=n,this._alignItems="flex-start",this}left(n=""){return this._xOffset=n,this._xPosition="left",this}bottom(n=""){return this._topOffset="",this._bottomOffset=n,this._alignItems="flex-end",this}right(n=""){return this._xOffset=n,this._xPosition="right",this}start(n=""){return this._xOffset=n,this._xPosition="start",this}end(n=""){return this._xOffset=n,this._xPosition="end",this}width(n=""){return this._overlayRef?this._overlayRef.updateSize({width:n}):this._width=n,this}height(n=""){return this._overlayRef?this._overlayRef.updateSize({height:n}):this._height=n,this}centerHorizontally(n=""){return this.left(n),this._xPosition="center",this}centerVertically(n=""){return this.top(n),this._alignItems="center",this}apply(){if(!this._overlayRef||!this._overlayRef.hasAttached())return;let n=this._overlayRef.overlayElement.style,e=this._overlayRef.hostElement.style,t=this._overlayRef.getConfig(),{width:i,height:r,maxWidth:o,maxHeight:u}=t,h=(i==="100%"||i==="100vw")&&(!o||o==="100%"||o==="100vw"),w=(r==="100%"||r==="100vh")&&(!u||u==="100%"||u==="100vh"),k=this._xPosition,z=this._xOffset,se=this._overlayRef.getConfig().direction==="rtl",le="",de="",Ce="";h?Ce="flex-start":k==="center"?(Ce="center",se?de=z:le=z):se?k==="left"||k==="end"?(Ce="flex-end",le=z):(k==="right"||k==="start")&&(Ce="flex-start",de=z):k==="left"||k==="start"?(Ce="flex-start",le=z):(k==="right"||k==="end")&&(Ce="flex-end",de=z),n.position=this._cssPosition,n.marginLeft=h?"0":le,n.marginTop=w?"0":this._topOffset,n.marginBottom=this._bottomOffset,n.marginRight=h?"0":de,e.justifyContent=Ce,e.alignItems=w?"flex-start":this._alignItems}dispose(){if(this._isDisposed||!this._overlayRef)return;let n=this._overlayRef.overlayElement.style,e=this._overlayRef.hostElement,t=e.style;e.classList.remove(Bo),t.justifyContent=t.alignItems=n.marginTop=n.marginBottom=n.marginLeft=n.marginRight=n.position="",this._overlayRef=null,this._isDisposed=!0}},Uo=(()=>{class a{_injector=s(X);global(){return wa()}flexibleConnectedTo(e){return Ft(this._injector,e)}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})(),Fn=new A("OVERLAY_DEFAULT_CONFIG");function It(a,n){a.get(Oe).load(Wo);let e=a.get(qo),t=a.get(Se),i=a.get(_e),r=a.get(jn),o=a.get(ke),u=a.get($,null,{optional:!0})||a.get(ct).createRenderer(null,null),h=new on(n),w=a.get(Fn,null,{optional:!0})?.usePopover??!0;h.direction=h.direction||o.value,"showPopover"in t.body?h.usePopover=n?.usePopover??w:h.usePopover=!1;let k=t.createElement("div"),z=t.createElement("div");k.id=i.getId("cdk-overlay-"),k.classList.add("cdk-overlay-pane"),z.appendChild(k),h.usePopover&&(z.setAttribute("popover","manual"),z.classList.add("cdk-overlay-popover"));let se=h.usePopover?h.positionStrategy?.getPopoverInsertionPoint?.():null;return Da(se)?se.after(z):se?.type==="parent"?se.element.appendChild(z):e.getContainerElement().appendChild(z),new Di(new gi(k,r,a),z,k,h,a.get(H),a.get(Yo),t,a.get(mr),a.get(Go),n?.disableAnimations??a.get(Qa,null,{optional:!0})==="NoopAnimations",a.get(Hn),u)}var $o=(()=>{class a{scrollStrategies=s(Ho);_positionBuilder=s(Uo);_injector=s(X);create(e){return It(this._injector,e)}position(){return this._positionBuilder}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})(),rd=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"}],od=new A("cdk-connected-overlay-scroll-strategy",{providedIn:"root",factory:()=>{let a=s(X);return()=>ot(a)}}),Vt=(()=>{class a{elementRef=s(F);static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["","cdk-overlay-origin",""],["","overlay-origin",""],["","cdkOverlayOrigin",""]],exportAs:["cdkOverlayOrigin"]})}return a})(),Xo=new A("cdk-connected-overlay-default-config"),sn=(()=>{class a{_dir=s(ke,{optional:!0});_injector=s(X);_overlayRef;_templatePortal;_backdropSubscription=pe.EMPTY;_attachSubscription=pe.EMPTY;_detachSubscription=pe.EMPTY;_positionSubscription=pe.EMPTY;_offsetX;_offsetY;_position;_scrollStrategyFactory=s(od);_ngZone=s(H);origin;positions;positionStrategy;get offsetX(){return this._offsetX}set offsetX(e){this._offsetX=e,this._position&&this._updatePositionStrategy(this._position)}get offsetY(){return this._offsetY}set offsetY(e){this._offsetY=e,this._position&&this._updatePositionStrategy(this._position)}width;height;minWidth;minHeight;backdropClass;panelClass;viewportMargin=0;scrollStrategy;open=!1;disableClose=!1;transformOriginSelector;hasBackdrop=!1;lockPosition=!1;flexibleDimensions=!1;growAfterOpen=!1;push=!1;disposeOnNavigation=!1;usePopover;matchWidth=!1;set _config(e){typeof e!="string"&&this._assignConfig(e)}backdropClick=new v;positionChange=new v;attach=new v;detach=new v;overlayKeydown=new v;overlayOutsideClick=new v;constructor(){let e=s(un),t=s(Qe),i=s(Xo,{optional:!0}),r=s(Fn,{optional:!0});this.usePopover=r?.usePopover===!1?null:"global",this._templatePortal=new Rt(e,t),this.scrollStrategy=this._scrollStrategyFactory(),i&&this._assignConfig(i)}get overlayRef(){return this._overlayRef}get dir(){return this._dir?this._dir.value:"ltr"}ngOnDestroy(){this._attachSubscription.unsubscribe(),this._detachSubscription.unsubscribe(),this._backdropSubscription.unsubscribe(),this._positionSubscription.unsubscribe(),this._overlayRef?.dispose()}ngOnChanges(e){this._position&&(this._updatePositionStrategy(this._position),this._overlayRef?.updateSize({width:this._getWidth(),minWidth:this.minWidth,height:this.height,minHeight:this.minHeight}),e.origin&&this.open&&this._position.apply()),e.open&&(this.open?this.attachOverlay():this.detachOverlay())}_createOverlay(){(!this.positions||!this.positions.length)&&(this.positions=rd);let e=this._overlayRef=It(this._injector,this._buildConfig());this._attachSubscription=e.attachments().subscribe(()=>this.attach.emit()),this._detachSubscription=e.detachments().subscribe(()=>this.detach.emit()),e.keydownEvents().subscribe(t=>{this.overlayKeydown.next(t),t.keyCode===27&&!this.disableClose&&!Pe(t)&&(t.preventDefault(),this.detachOverlay())}),this._overlayRef.outsidePointerEvents().subscribe(t=>{let i=this._getOriginElement(),r=mt(t);(!i||i!==r&&!i.contains(r))&&this.overlayOutsideClick.next(t)})}_buildConfig(){let e=this._position=this.positionStrategy||this._createPositionStrategy(),t=new on({direction:this._dir||"ltr",positionStrategy:e,scrollStrategy:this.scrollStrategy,hasBackdrop:this.hasBackdrop,disposeOnNavigation:this.disposeOnNavigation,usePopover:!!this.usePopover});return(this.height||this.height===0)&&(t.height=this.height),(this.minWidth||this.minWidth===0)&&(t.minWidth=this.minWidth),(this.minHeight||this.minHeight===0)&&(t.minHeight=this.minHeight),this.backdropClass&&(t.backdropClass=this.backdropClass),this.panelClass&&(t.panelClass=this.panelClass),t}_updatePositionStrategy(e){let t=this.positions.map(i=>({originX:i.originX,originY:i.originY,overlayX:i.overlayX,overlayY:i.overlayY,offsetX:i.offsetX||this.offsetX,offsetY:i.offsetY||this.offsetY,panelClass:i.panelClass||void 0}));return e.setOrigin(this._getOrigin()).withPositions(t).withFlexibleDimensions(this.flexibleDimensions).withPush(this.push).withGrowAfterOpen(this.growAfterOpen).withViewportMargin(this.viewportMargin).withLockedPosition(this.lockPosition).withTransformOriginOn(this.transformOriginSelector).withPopoverLocation(this.usePopover===null?"global":this.usePopover)}_createPositionStrategy(){let e=Ft(this._injector,this._getOrigin());return this._updatePositionStrategy(e),e}_getOrigin(){return this.origin instanceof Vt?this.origin.elementRef:this.origin}_getOriginElement(){return this.origin instanceof Vt?this.origin.elementRef.nativeElement:this.origin instanceof F?this.origin.nativeElement:typeof Element<"u"&&this.origin instanceof Element?this.origin:null}_getWidth(){return this.width?this.width:this.matchWidth?this._getOriginElement()?.getBoundingClientRect?.().width:void 0}attachOverlay(){this._overlayRef||this._createOverlay();let e=this._overlayRef;e.getConfig().hasBackdrop=this.hasBackdrop,e.updateSize({width:this._getWidth()}),e.hasAttached()||e.attach(this._templatePortal),this.hasBackdrop?this._backdropSubscription=e.backdropClick().subscribe(t=>this.backdropClick.emit(t)):this._backdropSubscription.unsubscribe(),this._positionSubscription.unsubscribe(),this.positionChange.observers.length>0&&(this._positionSubscription=this._position.positionChanges.pipe(Xa(()=>this.positionChange.observers.length>0)).subscribe(t=>{this._ngZone.run(()=>this.positionChange.emit(t)),this.positionChange.observers.length===0&&this._positionSubscription.unsubscribe()})),this.open=!0}detachOverlay(){this._overlayRef?.detach(),this._backdropSubscription.unsubscribe(),this._positionSubscription.unsubscribe(),this.open=!1}_assignConfig(e){this.origin=e.origin??this.origin,this.positions=e.positions??this.positions,this.positionStrategy=e.positionStrategy??this.positionStrategy,this.offsetX=e.offsetX??this.offsetX,this.offsetY=e.offsetY??this.offsetY,this.width=e.width??this.width,this.height=e.height??this.height,this.minWidth=e.minWidth??this.minWidth,this.minHeight=e.minHeight??this.minHeight,this.backdropClass=e.backdropClass??this.backdropClass,this.panelClass=e.panelClass??this.panelClass,this.viewportMargin=e.viewportMargin??this.viewportMargin,this.scrollStrategy=e.scrollStrategy??this.scrollStrategy,this.disableClose=e.disableClose??this.disableClose,this.transformOriginSelector=e.transformOriginSelector??this.transformOriginSelector,this.hasBackdrop=e.hasBackdrop??this.hasBackdrop,this.lockPosition=e.lockPosition??this.lockPosition,this.flexibleDimensions=e.flexibleDimensions??this.flexibleDimensions,this.growAfterOpen=e.growAfterOpen??this.growAfterOpen,this.push=e.push??this.push,this.disposeOnNavigation=e.disposeOnNavigation??this.disposeOnNavigation,this.usePopover=e.usePopover??this.usePopover,this.matchWidth=e.matchWidth??this.matchWidth}static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["","cdk-connected-overlay",""],["","connected-overlay",""],["","cdkConnectedOverlay",""]],inputs:{origin:[0,"cdkConnectedOverlayOrigin","origin"],positions:[0,"cdkConnectedOverlayPositions","positions"],positionStrategy:[0,"cdkConnectedOverlayPositionStrategy","positionStrategy"],offsetX:[0,"cdkConnectedOverlayOffsetX","offsetX"],offsetY:[0,"cdkConnectedOverlayOffsetY","offsetY"],width:[0,"cdkConnectedOverlayWidth","width"],height:[0,"cdkConnectedOverlayHeight","height"],minWidth:[0,"cdkConnectedOverlayMinWidth","minWidth"],minHeight:[0,"cdkConnectedOverlayMinHeight","minHeight"],backdropClass:[0,"cdkConnectedOverlayBackdropClass","backdropClass"],panelClass:[0,"cdkConnectedOverlayPanelClass","panelClass"],viewportMargin:[0,"cdkConnectedOverlayViewportMargin","viewportMargin"],scrollStrategy:[0,"cdkConnectedOverlayScrollStrategy","scrollStrategy"],open:[0,"cdkConnectedOverlayOpen","open"],disableClose:[0,"cdkConnectedOverlayDisableClose","disableClose"],transformOriginSelector:[0,"cdkConnectedOverlayTransformOriginOn","transformOriginSelector"],hasBackdrop:[2,"cdkConnectedOverlayHasBackdrop","hasBackdrop",S],lockPosition:[2,"cdkConnectedOverlayLockPosition","lockPosition",S],flexibleDimensions:[2,"cdkConnectedOverlayFlexibleDimensions","flexibleDimensions",S],growAfterOpen:[2,"cdkConnectedOverlayGrowAfterOpen","growAfterOpen",S],push:[2,"cdkConnectedOverlayPush","push",S],disposeOnNavigation:[2,"cdkConnectedOverlayDisposeOnNavigation","disposeOnNavigation",S],usePopover:[0,"cdkConnectedOverlayUsePopover","usePopover"],matchWidth:[2,"cdkConnectedOverlayMatchWidth","matchWidth",S],_config:[0,"cdkConnectedOverlay","_config"]},outputs:{backdropClick:"backdropClick",positionChange:"positionChange",attach:"attach",detach:"detach",overlayKeydown:"overlayKeydown",overlayOutsideClick:"overlayOutsideClick"},exportAs:["cdkConnectedOverlay"],features:[ee]})}return a})(),Ut=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({providers:[$o],imports:[ge,bi,ga,ga]})}return a})();var dd=["trigger"],cd=["panel"],md=[[["mat-select-trigger"]],"*"],ud=["mat-select-trigger","*"];function pd(a,n){if(a&1&&(d(0,"span",4),m(1),c()),a&2){let e=p();l(),N(e.placeholder)}}function hd(a,n){a&1&&Y(0)}function fd(a,n){if(a&1&&(d(0,"span",11),m(1),c()),a&2){let e=p(2);l(),N(e.triggerValue)}}function _d(a,n){if(a&1&&(d(0,"span",5),y(1,hd,1,0)(2,fd,2,1,"span",11),c()),a&2){let e=p();l(),C(e.customTrigger?1:2)}}function gd(a,n){if(a&1){let e=ne();d(0,"div",12,1),g("keydown",function(i){P(e);let r=p();return T(r._handleKeydown(i))}),Y(2,1),c()}if(a&2){let e=p();Je(e.panelClass),I("mat-select-panel-animations-enabled",!e._animationsDisabled)("mat-primary",e._parentFormField?.color==="primary")("mat-accent",e._parentFormField?.color==="accent")("mat-warn",e._parentFormField?.color==="warn")("mat-undefined",!e._parentFormField?.color),B("id",e.id+"-panel")("aria-multiselectable",e.multiple)("aria-label",e.ariaLabel||null)("aria-labelledby",e._getPanelAriaLabelledby())}}var bd=new A("mat-select-scroll-strategy",{providedIn:"root",factory:()=>{let a=s(X);return()=>ot(a)}}),vd=new A("MAT_SELECT_CONFIG"),yd=new A("MatSelectTrigger"),ka=class{source;value;constructor(n,e){this.source=n,this.value=e}},Ko=(()=>{class a{_viewportRuler=s(Ot);_changeDetectorRef=s(Z);_elementRef=s(F);_dir=s(ke,{optional:!0});_idGenerator=s(_e);_renderer=s($);_parentFormField=s(Gt,{optional:!0});ngControl=s(nt,{self:!0,optional:!0});_liveAnnouncer=s(vr);_defaultOptions=s(vd,{optional:!0});_animationsDisabled=we();_popoverLocation;_initialized=new L;_cleanupDetach;options;optionGroups;customTrigger;_positions=[{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"end",originY:"bottom",overlayX:"end",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"},{originX:"end",originY:"top",overlayX:"end",overlayY:"bottom",panelClass:"mat-mdc-select-panel-above"}];_scrollOptionIntoView(e){let t=this.options.toArray()[e];if(t){let i=this.panel.nativeElement,r=kr(e,this.options,this.optionGroups),o=t._getHostElement();e===0&&r===1?i.scrollTop=0:i.scrollTop=Mr(o.offsetTop,o.offsetHeight,i.scrollTop,i.offsetHeight)}}_positioningSettled(){this._scrollOptionIntoView(this._keyManager.activeItemIndex||0)}_getChangeEvent(e){return new ka(this,e)}_scrollStrategyFactory=s(bd);_panelOpen=!1;_compareWith=(e,t)=>e===t;_uid=this._idGenerator.getId("mat-select-");_triggerAriaLabelledBy=null;_previousControl;_destroy=new L;_errorStateTracker;stateChanges=new L;disableAutomaticLabeling=!0;userAriaDescribedBy;_selectionModel;_keyManager;_preferredOverlayOrigin;_overlayWidth;_onChange=()=>{};_onTouched=()=>{};_valueId=this._idGenerator.getId("mat-select-value-");_scrollStrategy;_overlayPanelClass=this._defaultOptions?.overlayPanelClass||"";get focused(){return this._focused||this._panelOpen}_focused=!1;controlType="mat-select";trigger;panel;_overlayDir;panelClass;disabled=!1;get disableRipple(){return this._disableRipple()}set disableRipple(e){this._disableRipple.set(e)}_disableRipple=x(!1);tabIndex=0;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties()}_hideSingleSelectionIndicator=this._defaultOptions?.hideSingleSelectionIndicator??!1;get placeholder(){return this._placeholder}set placeholder(e){this._placeholder=e,this.stateChanges.next()}_placeholder;get required(){return this._required??this.ngControl?.control?.hasValidator(ft.required)??!1}set required(e){this._required=e,this.stateChanges.next()}_required;get multiple(){return this._multiple}set multiple(e){this._selectionModel,this._multiple=e}_multiple=!1;disableOptionCentering=this._defaultOptions?.disableOptionCentering??!1;get compareWith(){return this._compareWith}set compareWith(e){this._compareWith=e,this._selectionModel&&this._initializeSelection()}get value(){return this._value}set value(e){this._assignValue(e)&&this._onChange(e)}_value;ariaLabel="";ariaLabelledby;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e}typeaheadDebounceInterval;sortComparator;get id(){return this._id}set id(e){this._id=e||this._uid,this.stateChanges.next()}_id;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e}panelWidth=this._defaultOptions&&typeof this._defaultOptions.panelWidth<"u"?this._defaultOptions.panelWidth:"auto";canSelectNullableOptions=this._defaultOptions?.canSelectNullableOptions??!1;optionSelectionChanges=Ua(()=>{let e=this.options;return e?e.changes.pipe(Xe(e),zn(()=>lt(...e.map(t=>t.onSelectionChange)))):this._initialized.pipe(zn(()=>this.optionSelectionChanges))});openedChange=new v;_openedStream=this.openedChange.pipe(Le(e=>e),be(()=>{}));_closedStream=this.openedChange.pipe(Le(e=>!e),be(()=>{}));selectionChange=new v;valueChange=new v;constructor(){let e=s(Un),t=s(xn,{optional:!0}),i=s(Dn,{optional:!0}),r=s(new Ct("tabindex"),{optional:!0}),o=s(Fn,{optional:!0});this.ngControl&&(this.ngControl.valueAccessor=this),this._defaultOptions?.typeaheadDebounceInterval!=null&&(this.typeaheadDebounceInterval=this._defaultOptions.typeaheadDebounceInterval),this._errorStateTracker=new Jn(e,this.ngControl,i,t,this.stateChanges),this._scrollStrategy=this._scrollStrategyFactory(),this.tabIndex=r==null?0:parseInt(r)||0,this._popoverLocation=o?.usePopover===!1?null:"inline",this.id=this.id}ngOnInit(){this._selectionModel=new An(this.multiple),this.stateChanges.next(),this._viewportRuler.change().pipe(ae(this._destroy)).subscribe(()=>{this.panelOpen&&(this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._changeDetectorRef.detectChanges())})}ngAfterContentInit(){this._initialized.next(),this._initialized.complete(),this._initKeyManager(),this._selectionModel.changed.pipe(ae(this._destroy)).subscribe(e=>{e.added.forEach(t=>t.select()),e.removed.forEach(t=>t.deselect())}),this.options.changes.pipe(Xe(null),ae(this._destroy)).subscribe(()=>{this._resetOptions(),this._initializeSelection()})}ngDoCheck(){let e=this._getTriggerAriaLabelledby(),t=this.ngControl;if(e!==this._triggerAriaLabelledBy){let i=this._elementRef.nativeElement;this._triggerAriaLabelledBy=e,e?i.setAttribute("aria-labelledby",e):i.removeAttribute("aria-labelledby")}t&&(this._previousControl!==t.control&&(this._previousControl!==void 0&&t.disabled!==null&&t.disabled!==this.disabled&&(this.disabled=t.disabled),this._previousControl=t.control),this.updateErrorState())}ngOnChanges(e){(e.disabled||e.userAriaDescribedBy)&&this.stateChanges.next(),e.typeaheadDebounceInterval&&this._keyManager&&this._keyManager.withTypeAhead(this.typeaheadDebounceInterval),e.panelClass&&this.panelClass instanceof Set&&(this.panelClass=Array.from(this.panelClass))}ngOnDestroy(){this._cleanupDetach?.(),this._keyManager?.destroy(),this._destroy.next(),this._destroy.complete(),this.stateChanges.complete()}toggle(){this.panelOpen?this.close():this.open()}open(){this._canOpen()&&(this._parentFormField&&(this._preferredOverlayOrigin=this._parentFormField.getConnectedOverlayOrigin()),this._cleanupDetach?.(),this._overlayWidth=this._getOverlayWidth(this._preferredOverlayOrigin),this._panelOpen=!0,this._overlayDir.positionChange.pipe(Hi(1)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this._positioningSettled()}),this._overlayDir.attachOverlay(),this._keyManager.withHorizontalOrientation(null),this._highlightCorrectOption(),this._changeDetectorRef.markForCheck(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(!0)))}close(){this._panelOpen&&(this._panelOpen=!1,this._exitAndDetach(),this._keyManager.withHorizontalOrientation(this._isRtl()?"rtl":"ltr"),this._changeDetectorRef.markForCheck(),this._onTouched(),this.stateChanges.next(),Promise.resolve().then(()=>this.openedChange.emit(!1)))}_exitAndDetach(){if(this._animationsDisabled||!this.panel){this._detachOverlay();return}this._cleanupDetach?.(),this._cleanupDetach=()=>{t(),clearTimeout(i),this._cleanupDetach=void 0};let e=this.panel.nativeElement,t=this._renderer.listen(e,"animationend",r=>{r.animationName==="_mat-select-exit"&&(this._cleanupDetach?.(),this._detachOverlay())}),i=setTimeout(()=>{this._cleanupDetach?.(),this._detachOverlay()},200);e.classList.add("mat-select-panel-exit")}_detachOverlay(){this._overlayDir.detachOverlay(),this._changeDetectorRef.markForCheck()}writeValue(e){this._assignValue(e)}registerOnChange(e){this._onChange=e}registerOnTouched(e){this._onTouched=e}setDisabledState(e){this.disabled=e,this._changeDetectorRef.markForCheck(),this.stateChanges.next()}get panelOpen(){return this._panelOpen}get selected(){return this.multiple?this._selectionModel?.selected||[]:this._selectionModel?.selected[0]}get triggerValue(){if(this.empty)return"";if(this._multiple){let e=this._selectionModel.selected.map(t=>t.viewValue);return this._isRtl()&&e.reverse(),e.join(", ")}return this._selectionModel.selected[0].viewValue}updateErrorState(){this._errorStateTracker.updateErrorState()}_isRtl(){return this._dir?this._dir.value==="rtl":!1}_handleKeydown(e){this.disabled||(this.panelOpen?this._handleOpenKeydown(e):this._handleClosedKeydown(e))}_handleClosedKeydown(e){let t=e.keyCode,i=t===40||t===38||t===37||t===39,r=t===13||t===32,o=this._keyManager;if(!o.isTyping()&&r&&!Pe(e)||(this.multiple||e.altKey)&&i)e.preventDefault(),this.open();else if(!this.multiple){let u=this.selected;o.onKeydown(e);let h=this.selected;h&&u!==h&&this._liveAnnouncer.announce(h.viewValue,1e4)}}_handleOpenKeydown(e){let t=this._keyManager,i=e.keyCode,r=i===40||i===38,o=t.isTyping();if(r&&e.altKey)e.preventDefault(),this.close();else if(!o&&(i===13||i===32)&&t.activeItem&&!Pe(e))e.preventDefault(),t.activeItem._selectViaInteraction();else if(!o&&this._multiple&&i===65&&e.ctrlKey){e.preventDefault();let u=this.options.some(h=>!h.disabled&&!h.selected);this.options.forEach(h=>{h.disabled||(u?h.select():h.deselect())})}else{let u=t.activeItemIndex;t.onKeydown(e),this._multiple&&r&&e.shiftKey&&t.activeItem&&t.activeItemIndex!==u&&t.activeItem._selectViaInteraction()}}_handleOverlayKeydown(e){e.keyCode===27&&!Pe(e)&&(e.preventDefault(),this.close())}_onFocus(){this.disabled||(this._focused=!0,this.stateChanges.next())}_onBlur(){this._focused=!1,this._keyManager?.cancelTypeahead(),!this.disabled&&!this.panelOpen&&(this._onTouched(),this._changeDetectorRef.markForCheck(),this.stateChanges.next())}get empty(){return!this._selectionModel||this._selectionModel.isEmpty()}_initializeSelection(){Promise.resolve().then(()=>{this.ngControl&&(this._value=this.ngControl.value),this._setSelectionByValue(this._value),this.stateChanges.next()})}_setSelectionByValue(e){if(this.options.forEach(t=>t.setInactiveStyles()),this._selectionModel.clear(),this.multiple&&e)Array.isArray(e),e.forEach(t=>this._selectOptionByValue(t)),this._sortValues();else{let t=this._selectOptionByValue(e);t?this._keyManager.updateActiveItem(t):this.panelOpen||this._keyManager.updateActiveItem(-1)}this._changeDetectorRef.markForCheck()}_selectOptionByValue(e){let t=this.options.find(i=>{if(this._selectionModel.isSelected(i))return!1;try{return(i.value!=null||this.canSelectNullableOptions)&&this._compareWith(i.value,e)}catch{return!1}});return t&&this._selectionModel.select(t),t}_assignValue(e){return e!==this._value||this._multiple&&Array.isArray(e)?(this.options&&this._setSelectionByValue(e),this._value=e,!0):!1}_skipPredicate=e=>this.panelOpen?!1:e.disabled;_getOverlayWidth(e){return this.panelWidth==="auto"?(e instanceof Vt?e.elementRef:e||this._elementRef).nativeElement.getBoundingClientRect().width:this.panelWidth===null?"":this.panelWidth}_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck()}_initKeyManager(){this._keyManager=new Kn(this.options).withTypeAhead(this.typeaheadDebounceInterval).withVerticalOrientation().withHorizontalOrientation(this._isRtl()?"rtl":"ltr").withHomeAndEnd().withPageUpDown().withAllowedModifierKeys(["shiftKey"]).skipPredicate(this._skipPredicate),this._keyManager.tabOut.subscribe(()=>{this.panelOpen&&(!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction(),this.focus(),this.close())}),this._keyManager.change.subscribe(()=>{this._panelOpen&&this.panel?this._scrollOptionIntoView(this._keyManager.activeItemIndex||0):!this._panelOpen&&!this.multiple&&this._keyManager.activeItem&&this._keyManager.activeItem._selectViaInteraction()})}_resetOptions(){let e=lt(this.options.changes,this._destroy);this.optionSelectionChanges.pipe(ae(e)).subscribe(t=>{this._onSelect(t.source,t.isUserInput),t.isUserInput&&!this.multiple&&this._panelOpen&&(this.close(),this.focus())}),lt(...this.options.map(t=>t._stateChanges)).pipe(ae(e)).subscribe(()=>{this._changeDetectorRef.detectChanges(),this.stateChanges.next()})}_onSelect(e,t){let i=this._selectionModel.isSelected(e);!this.canSelectNullableOptions&&e.value==null&&!this._multiple?(e.deselect(),this._selectionModel.clear(),this.value!=null&&this._propagateChanges(e.value)):(i!==e.selected&&(e.selected?this._selectionModel.select(e):this._selectionModel.deselect(e)),t&&this._keyManager.setActiveItem(e),this.multiple&&(this._sortValues(),t&&this.focus())),i!==this._selectionModel.isSelected(e)&&this._propagateChanges(),this.stateChanges.next()}_sortValues(){if(this.multiple){let e=this.options.toArray();this._selectionModel.sort((t,i)=>this.sortComparator?this.sortComparator(t,i,e):e.indexOf(t)-e.indexOf(i)),this.stateChanges.next()}}_propagateChanges(e){let t;this.multiple?t=this.selected.map(i=>i.value):t=this.selected?this.selected.value:e,this._value=t,this.valueChange.emit(t),this._onChange(t),this.selectionChange.emit(this._getChangeEvent(t)),this._changeDetectorRef.markForCheck()}_highlightCorrectOption(){if(this._keyManager)if(this.empty){let e=-1;for(let t=0;t<this.options.length;t++)if(!this.options.get(t).disabled){e=t;break}this._keyManager.setActiveItem(e)}else this._keyManager.setActiveItem(this._selectionModel.selected[0])}_canOpen(){return!this._panelOpen&&!this.disabled&&this.options?.length>0&&!!this._overlayDir}focus(e){this._elementRef.nativeElement.focus(e)}_getPanelAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||null,t=e?e+" ":"";return this.ariaLabelledby?t+this.ariaLabelledby:e}_getAriaActiveDescendant(){return this.panelOpen&&this._keyManager&&this._keyManager.activeItem?this._keyManager.activeItem.id:null}_getTriggerAriaLabelledby(){if(this.ariaLabel)return null;let e=this._parentFormField?.getLabelId()||"";return this.ariaLabelledby&&(e+=" "+this.ariaLabelledby),e||(e=this._valueId),e}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){let t=this._elementRef.nativeElement;e.length?t.setAttribute("aria-describedby",e.join(" ")):t.removeAttribute("aria-describedby")}onContainerClick(e){let t=mt(e);t&&(t.tagName==="MAT-OPTION"||t.classList.contains("cdk-overlay-backdrop")||t.closest(".mat-mdc-select-panel"))||(this.focus(),this.open())}get shouldLabelFloat(){return this.panelOpen||!this.empty||this.focused&&!!this.placeholder}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-select"]],contentQueries:function(t,i,r){if(t&1&&yt(r,yd,5)(r,kt,5)(r,wr,5),t&2){let o;O(o=R())&&(i.customTrigger=o.first),O(o=R())&&(i.options=o),O(o=R())&&(i.optionGroups=o)}},viewQuery:function(t,i){if(t&1&&oe(dd,5)(cd,5)(sn,5),t&2){let r;O(r=R())&&(i.trigger=r.first),O(r=R())&&(i.panel=r.first),O(r=R())&&(i._overlayDir=r.first)}},hostAttrs:["role","combobox","aria-haspopup","listbox",1,"mat-mdc-select"],hostVars:21,hostBindings:function(t,i){t&1&&g("keydown",function(o){return i._handleKeydown(o)})("focus",function(){return i._onFocus()})("blur",function(){return i._onBlur()}),t&2&&(B("id",i.id)("tabindex",i.disabled?-1:i.tabIndex)("aria-controls",i.panelOpen?i.id+"-panel":null)("aria-expanded",i.panelOpen)("aria-label",i.ariaLabel||null)("aria-required",i.required.toString())("aria-disabled",i.disabled.toString())("aria-invalid",i.errorState)("aria-activedescendant",i._getAriaActiveDescendant()),I("mat-mdc-select-disabled",i.disabled)("mat-mdc-select-invalid",i.errorState)("mat-mdc-select-required",i.required)("mat-mdc-select-empty",i.empty)("mat-mdc-select-multiple",i.multiple)("mat-select-open",i.panelOpen))},inputs:{userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],panelClass:"panelClass",disabled:[2,"disabled","disabled",S],disableRipple:[2,"disableRipple","disableRipple",S],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:xt(e)],hideSingleSelectionIndicator:[2,"hideSingleSelectionIndicator","hideSingleSelectionIndicator",S],placeholder:"placeholder",required:[2,"required","required",S],multiple:[2,"multiple","multiple",S],disableOptionCentering:[2,"disableOptionCentering","disableOptionCentering",S],compareWith:"compareWith",value:"value",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],errorStateMatcher:"errorStateMatcher",typeaheadDebounceInterval:[2,"typeaheadDebounceInterval","typeaheadDebounceInterval",xt],sortComparator:"sortComparator",id:"id",panelWidth:"panelWidth",canSelectNullableOptions:[2,"canSelectNullableOptions","canSelectNullableOptions",S]},outputs:{openedChange:"openedChange",_openedStream:"opened",_closedStream:"closed",selectionChange:"selectionChange",valueChange:"valueChange"},exportAs:["matSelect"],features:[K([{provide:Mn,useExisting:a},{provide:Qn,useExisting:a}]),ee],ngContentSelectors:ud,decls:11,vars:10,consts:[["fallbackOverlayOrigin","cdkOverlayOrigin","trigger",""],["panel",""],["cdk-overlay-origin","",1,"mat-mdc-select-trigger",3,"click"],[1,"mat-mdc-select-value"],[1,"mat-mdc-select-placeholder","mat-mdc-select-min-line"],[1,"mat-mdc-select-value-text"],[1,"mat-mdc-select-arrow-wrapper"],[1,"mat-mdc-select-arrow"],["viewBox","0 0 24 24","width","24px","height","24px","focusable","false","aria-hidden","true"],["d","M7 10l5 5 5-5z"],["cdk-connected-overlay","","cdkConnectedOverlayHasBackdrop","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"detach","backdropClick","overlayKeydown","cdkConnectedOverlayDisableClose","cdkConnectedOverlayPanelClass","cdkConnectedOverlayScrollStrategy","cdkConnectedOverlayOrigin","cdkConnectedOverlayPositions","cdkConnectedOverlayWidth","cdkConnectedOverlayFlexibleDimensions","cdkConnectedOverlayUsePopover"],[1,"mat-mdc-select-min-line"],["role","listbox","tabindex","-1",1,"mat-mdc-select-panel","mdc-menu-surface","mdc-menu-surface--open",3,"keydown"]],template:function(t,i){if(t&1&&(he(md),d(0,"div",2,0),g("click",function(){return i.open()}),d(3,"div",3),y(4,pd,2,1,"span",4)(5,_d,3,1,"span",5),c(),d(6,"div",6)(7,"div",7),dt(),d(8,"svg",8),j(9,"path",9),c()()()(),Ie(10,gd,3,16,"ng-template",10),g("detach",function(){return i.close()})("backdropClick",function(){return i.close()})("overlayKeydown",function(o){return i._handleOverlayKeydown(o)})),t&2){let r=Ze(1);l(3),B("id",i._valueId),l(),C(i.empty?4:5),l(6),b("cdkConnectedOverlayDisableClose",!0)("cdkConnectedOverlayPanelClass",i._overlayPanelClass)("cdkConnectedOverlayScrollStrategy",i._scrollStrategy)("cdkConnectedOverlayOrigin",i._preferredOverlayOrigin||r)("cdkConnectedOverlayPositions",i._positions)("cdkConnectedOverlayWidth",i._overlayWidth)("cdkConnectedOverlayFlexibleDimensions",!0)("cdkConnectedOverlayUsePopover",i._popoverLocation)}},dependencies:[Vt,sn],styles:[`@keyframes _mat-select-enter {
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
`],encapsulation:2})}return a})();var Qo=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({imports:[Ut,Zi,ge,gt,Me,Zi]})}return a})();var Dd=["panelTemplate"],wd=(a,n)=>n.value;function kd(a,n){if(a&1){let e=ne();d(0,"mat-option",3),g("onSelectionChange",function(i){P(e);let r=p(2);return T(r._selectValue(i.source))}),m(1),c()}if(a&2){let e=n.$implicit;b("value",e.value),l(),N(e.label)}}function Md(a,n){if(a&1){let e=ne();d(0,"div",1),g("animationend",function(i){P(e);let r=p();return T(r._handleAnimationEnd(i))}),ce(1,kd,2,2,"mat-option",2,wd),c()}if(a&2){let e=p();I("mat-timepicker-panel-animations-enabled",!e._animationsDisabled)("mat-timepicker-panel-exit",!e.isOpen()),b("id",e.panelId),B("aria-label",e.ariaLabel()||null)("aria-labelledby",e._getAriaLabelledby()),l(),me(e._timeOptions)}}var Sd=[[["","matTimepickerToggleIcon",""]]],Ed=["[matTimepickerToggleIcon]"];function Ad(a,n){a&1&&(dt(),d(0,"svg",1),j(1,"path",2),c())}var Od=/^(\d*\.?\d+)\s*(h|hour|hours|m|min|minute|minutes|s|second|seconds)?$/i,Jo=new A("MAT_TIMEPICKER_CONFIG");function Zo(a){let n;if(a===null)return null;if(typeof a=="number")n=a;else{if(a.trim().length===0)return null;let e=a.match(Od),t=e?parseFloat(e[1]):null,i=e?.[2]?.toLowerCase()||null;if(!e||t===null||isNaN(t))return null;i==="h"||i==="hour"||i==="hours"?n=t*3600:i==="m"||i==="min"||i==="minute"||i==="minutes"?n=t*60:n=t}return n}function Rd(a,n,e,t,i){i=Math.max(i,1);let r=[],o=a.compareTime(e,t)<1?e:t;for(;a.sameDate(o,e)&&a.compareTime(o,t)<1&&a.isValid(o);)r.push({value:o,label:a.format(o,n.display.timeOptionLabel)}),o=a.addSeconds(o,i);return r}var Vd=new A("MAT_TIMEPICKER_SCROLL_STRATEGY",{providedIn:"root",factory:()=>{let a=s(X);return()=>ot(a)}}),Sa=(()=>{class a{_dir=s(ke,{optional:!0});_viewContainerRef=s(Qe);_injector=s(X);_defaultConfig=s(Jo,{optional:!0});_dateAdapter=s(Ye,{optional:!0});_dateFormats=s(wt,{optional:!0});_scrollStrategyFactory=s(Vd);_animationsDisabled=we();_isOpen=x(!1);_activeDescendant=x(null);_input=x(null);_overlayRef=null;_portal=null;_optionsCacheKey=null;_localeChanges;_onOpenRender=null;_panelTemplate=zt.required("panelTemplate");_timeOptions=[];_options=sr(kt);_keyManager=new Kn(this._options,this._injector).withHomeAndEnd(!0).withPageUpDown(!0).withVerticalOrientation(!0);interval=ie(Zo(this._defaultConfig?.interval||null),{transform:Zo});options=ie(null);isOpen=this._isOpen.asReadonly();selected=qn();opened=qn();closed=qn();activeDescendant=this._activeDescendant.asReadonly();panelId=s(_e).getId("mat-timepicker-panel-");disableRipple=ie(this._defaultConfig?.disableRipple??!1,{transform:S});ariaLabel=ie(null,{alias:"aria-label"});ariaLabelledby=ie(null,{alias:"aria-labelledby"});disabled=M(()=>!!this._input()?.disabled());panelClass=ie();constructor(){s(F).nativeElement.setAttribute("mat-timepicker-panel-id",this.panelId),this._handleLocaleChanges(),this._handleInputStateChanges(),this._keyManager.change.subscribe(()=>this._activeDescendant.set(this._keyManager.activeItem?.id||null))}open(){let e=this._input();if(!e||(e.focus(),this._isOpen()))return;this._isOpen.set(!0),this._generateOptions();let t=this._getOverlayRef();t.updateSize({width:e.getOverlayOrigin().nativeElement.offsetWidth}),this._portal??=new Rt(this._panelTemplate(),this._viewContainerRef),t.hasAttached()||t.attach(this._portal),this._onOpenRender?.destroy(),this._onOpenRender=Ee(()=>{let i=this._options();this._syncSelectedState(e.value(),i,i[0]),this._onOpenRender=null},{injector:this._injector}),this.opened.emit()}close(){this._isOpen()&&(this._isOpen.set(!1),this.closed.emit(),this._animationsDisabled&&this._overlayRef?.detach())}registerInput(e){let t=this._input();this._input.set(e)}ngOnDestroy(){this._keyManager.destroy(),this._localeChanges?.unsubscribe(),this._onOpenRender?.destroy(),this._overlayRef?.dispose()}_getOverlayHost(){return this._overlayRef?.hostElement}_selectValue(e){this.close(),this._keyManager.setActiveItem(e),this._options().forEach(t=>{t!==e&&t.deselect(!1)}),this._input()?.timepickerValueAssigned(e.value),this.selected.emit({value:e.value,source:this}),this._input()?.focus()}_getAriaLabelledby(){return this.ariaLabel()?null:this.ariaLabelledby()||this._input()?.getLabelId()||null}_handleAnimationEnd(e){e.animationName==="_mat-timepicker-exit"&&this._overlayRef?.detach()}_getOverlayRef(){if(this._overlayRef)return this._overlayRef;let e=Ft(this._injector,this._input().getOverlayOrigin()).withFlexibleDimensions(!1).withPush(!1).withTransformOriginOn(".mat-timepicker-panel").withPopoverLocation("inline").withPositions([{originX:"start",originY:"bottom",overlayX:"start",overlayY:"top"},{originX:"start",originY:"top",overlayX:"start",overlayY:"bottom",panelClass:"mat-timepicker-above"}]);return this._overlayRef=It(this._injector,{positionStrategy:e,scrollStrategy:this._scrollStrategyFactory(),direction:this._dir||"ltr",hasBackdrop:!1,disableAnimations:this._animationsDisabled,panelClass:this.panelClass()}),this._overlayRef.detachments().subscribe(()=>this.close()),this._overlayRef.keydownEvents().subscribe(t=>this._handleKeydown(t)),this._overlayRef.outsidePointerEvents().subscribe(t=>{let i=mt(t),r=this._input()?.getOverlayOrigin().nativeElement;i&&r&&i!==r&&!r.contains(i)&&this.close()}),this._overlayRef}_generateOptions(){let e=this.interval()??1800,t=this.options();if(t!==null)this._timeOptions=t;else{let i=this._input(),r=this._dateAdapter,o=this._dateFormats.display.timeInput,u=i?.min()||r.setTime(r.today(),0,0,0),h=i?.max()||r.setTime(r.today(),23,59,0),w=e+"/"+r.format(u,o)+"/"+r.format(h,o);w!==this._optionsCacheKey&&(this._optionsCacheKey=w,this._timeOptions=Rd(r,this._dateFormats,u,h,e))}}_syncSelectedState(e,t,i){let r=!1;for(let o of t)e&&this._dateAdapter.sameTime(o.value,e)?(o.select(!1),Ma(o,"center"),ue(()=>this._keyManager.setActiveItem(o)),r=!0):o.deselect(!1);r||(i?(ue(()=>this._keyManager.setActiveItem(i)),Ma(i,"center")):ue(()=>this._keyManager.setActiveItem(-1)))}_handleKeydown(e){let t=e.keyCode;if(t===9)this.close();else if(t===27&&!Pe(e))e.preventDefault(),this.close();else if(t===13)e.preventDefault(),this._keyManager.activeItem?this._selectValue(this._keyManager.activeItem):this.close();else{let i=this._keyManager.activeItem;this._keyManager.onKeydown(e);let r=this._keyManager.activeItem;r&&r!==i&&Ma(r,"nearest")}}_handleLocaleChanges(){this._localeChanges=this._dateAdapter.localeChanges.subscribe(()=>{this._optionsCacheKey=null,this.isOpen()&&this._generateOptions()})}_handleInputStateChanges(){ve(()=>{let e=this._input(),t=this._options();this._isOpen()&&e&&this._syncSelectedState(e.value(),t,null)})}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-timepicker"]],viewQuery:function(t,i){t&1&&Yn(i._panelTemplate,Dd,5)(i._options,kt,5),t&2&&pn(2)},inputs:{interval:[1,"interval"],options:[1,"options"],disableRipple:[1,"disableRipple"],ariaLabel:[1,"aria-label","ariaLabel"],ariaLabelledby:[1,"aria-labelledby","ariaLabelledby"],panelClass:[1,"panelClass"]},outputs:{selected:"selected",opened:"opened",closed:"closed"},exportAs:["matTimepicker"],features:[K([{provide:Qn,useExisting:a}])],decls:2,vars:0,consts:[["panelTemplate",""],["role","listbox",1,"mat-timepicker-panel",3,"animationend","id"],[3,"value"],[3,"onSelectionChange","value"]],template:function(t,i){t&1&&Ie(0,Md,3,7,"ng-template",null,0,Wn)},dependencies:[kt],styles:[`@keyframes _mat-timepicker-enter {
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
`],encapsulation:2})}return a})();function Ma(a,n){a._getHostElement().scrollIntoView({block:n,inline:n})}var es=(()=>{class a{_elementRef=s(F);_dateAdapter=s(Ye,{optional:!0});_dateFormats=s(wt,{optional:!0});_formField=s(Gt,{optional:!0});_onChange;_onTouched;_validatorOnChange;_cleanupClick;_accessorDisabled=x(!1);_localeSubscription;_timepickerSubscription;_validator;_lastValueValid=!0;_minValid=!0;_maxValid=!0;_lastValidDate=null;_ariaActiveDescendant=M(()=>{let e=this.timepicker(),t=e.isOpen(),i=e.activeDescendant();return t&&i?i:null});_ariaExpanded=M(()=>this.timepicker().isOpen()+"");_ariaControls=M(()=>{let e=this.timepicker();return e.isOpen()?e.panelId:null});value=or(null);timepicker=ie.required({alias:"matTimepicker"});min=ie(null,{alias:"matTimepickerMin",transform:e=>this._transformDateInput(e)});max=ie(null,{alias:"matTimepickerMax",transform:e=>this._transformDateInput(e)});openOnClick=ie(!0,{alias:"matTimepickerOpenOnClick",transform:S});disabled=M(()=>this.disabledInput()||this._accessorDisabled());disabledInput=ie(!1,{transform:S,alias:"disabled"});constructor(){let e=s($);this._validator=this._getValidator(),this._updateFormsState(),this._registerTimepicker(),this._localeSubscription=this._dateAdapter.localeChanges.subscribe(()=>{this._hasFocus()||this._formatValue(this.value())}),this._cleanupClick=e.listen(this.getOverlayOrigin().nativeElement,"click",this._handleClick)}writeValue(e){let t=this._dateAdapter.deserialize(e);this.value.set(this._dateAdapter.getValidDateOrNull(t))}registerOnChange(e){this._onChange=e}registerOnTouched(e){this._onTouched=e}setDisabledState(e){this._accessorDisabled.set(e)}validate(e){return this._validator(e)}registerOnValidatorChange(e){this._validatorOnChange=e}getOverlayOrigin(){return this._formField?.getConnectedOverlayOrigin()||this._elementRef}focus(){this._elementRef.nativeElement.focus()}ngOnDestroy(){this._cleanupClick(),this._timepickerSubscription?.unsubscribe(),this._localeSubscription.unsubscribe()}getLabelId(){return this._formField?.getLabelId()||null}_handleClick=e=>{if(this.disabled()||!this.openOnClick())return;let t=mt(e),i=this.timepicker()._getOverlayHost();(!t||!i||!i.contains(t))&&this.timepicker().open()};_handleInput(e){let t=e.target.value,i=this.value(),r=this._dateAdapter.parseTime(t,this._dateFormats.parse.timeInput),o=!this._dateAdapter.sameTime(r,i);!r||o||t&&!i?this._assignUserSelection(r,!0):this._validatorOnChange?.()}_handleBlur(){let e=this.value();e&&this._isValid(e)&&this._formatValue(e),this.timepicker().isOpen()||this._onTouched?.()}_handleKeydown(e){this.timepicker().isOpen()||this.disabled()||(e.keyCode===27&&!Pe(e)&&this.value()!==null?(e.preventDefault(),this.value.set(null),this._formatValue(null)):(e.keyCode===40||e.keyCode===38)&&(e.preventDefault(),this.timepicker().open()))}timepickerValueAssigned(e){this._dateAdapter.sameTime(e,this.value())||(this._assignUserSelection(e,!0),this._formatValue(e))}_updateFormsState(){ve(()=>{let{_dateAdapter:e,_lastValueValid:t,_minValid:i,_maxValid:r}=this,o=e.deserialize(this.value()),u=this.min(),h=this.max(),w=this._lastValueValid=this._isValid(o);this._minValid=!u||!o||!w||e.compareTime(u,o)<=0,this._maxValid=!h||!o||!w||e.compareTime(h,o)>=0;let k=t!==w||i!==this._minValid||r!==this._maxValid;this._hasFocus()||this._formatValue(o),o&&w&&(this._lastValidDate=o),k&&this._validatorOnChange?.()})}_registerTimepicker(){ve(()=>{let e=this.timepicker();e.registerInput(this),e.closed.subscribe(()=>this._onTouched?.())})}_assignUserSelection(e,t){let i;if(e==null||!this._isValid(e))i=e;else{let r=this._dateAdapter,o=r.getValidDateOrNull(this._lastValidDate||this.value()),u=r.getHours(e),h=r.getMinutes(e),w=r.getSeconds(e);i=o?r.setTime(o,u,h,w):e}t&&this._onChange?.(i),this.value.set(i)}_formatValue(e){e=this._dateAdapter.getValidDateOrNull(e),this._elementRef.nativeElement.value=e==null?"":this._dateAdapter.format(e,this._dateFormats.display.timeInput)}_isValid(e){return!e||this._dateAdapter.isValid(e)}_transformDateInput(e){let t=typeof e=="string"?this._dateAdapter.parseTime(e,this._dateFormats.parse.timeInput):this._dateAdapter.deserialize(e);return t&&this._dateAdapter.isValid(t)?t:null}_hasFocus(){return $n()===this._elementRef.nativeElement}_getValidator(){return ft.compose([()=>this._lastValueValid?null:{matTimepickerParse:{text:this._elementRef.nativeElement.value}},e=>this._minValid?null:{matTimepickerMin:{min:this.min(),actual:this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value))}},e=>this._maxValid?null:{matTimepickerMax:{max:this.max(),actual:this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value))}}])}static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["input","matTimepicker",""]],hostAttrs:["role","combobox","type","text","aria-haspopup","listbox",1,"mat-timepicker-input"],hostVars:5,hostBindings:function(t,i){t&1&&g("blur",function(){return i._handleBlur()})("input",function(o){return i._handleInput(o)})("keydown",function(o){return i._handleKeydown(o)}),t&2&&(De("disabled",i.disabled()),B("aria-activedescendant",i._ariaActiveDescendant())("aria-expanded",i._ariaExpanded())("aria-controls",i._ariaControls())("mat-timepicker-id",i.timepicker()?.panelId))},inputs:{value:[1,"value"],timepicker:[1,"matTimepicker","timepicker"],min:[1,"matTimepickerMin","min"],max:[1,"matTimepickerMax","max"],openOnClick:[1,"matTimepickerOpenOnClick","openOnClick"],disabledInput:[1,"disabled","disabledInput"]},outputs:{value:"valueChange"},exportAs:["matTimepickerInput"],features:[K([{provide:jt,useExisting:a,multi:!0},{provide:Yt,useExisting:a,multi:!0},{provide:fi,useExisting:a}])]})}return a})(),Ea=(()=>{class a{_defaultConfig=s(Jo,{optional:!0});_defaultTabIndex=(()=>{let e=s(new Ct("tabindex"),{optional:!0}),t=Number(e);return isNaN(t)?null:t})();_isDisabled=M(()=>{let e=this.timepicker();return this.disabled()||e.disabled()});timepicker=ie.required({alias:"for"});ariaLabel=ie(void 0,{alias:"aria-label"});ariaLabelledby=ie(void 0,{alias:"aria-labelledby"});_defaultAriaLabel="Open timepicker options";disabled=ie(!1,{transform:S,alias:"disabled"});tabIndex=ie(this._defaultTabIndex);disableRipple=ie(this._defaultConfig?.disableRipple??!1,{transform:S});_open(e){this.timepicker()&&!this._isDisabled()&&(this.timepicker().open(),e.stopPropagation())}getAriaLabel(){return this.ariaLabelledby()?null:this.ariaLabel()||this._defaultAriaLabel}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-timepicker-toggle"]],hostAttrs:[1,"mat-timepicker-toggle"],hostVars:1,hostBindings:function(t,i){t&1&&g("click",function(o){return i._open(o)}),t&2&&B("tabindex",null)},inputs:{timepicker:[1,"for","timepicker"],ariaLabel:[1,"aria-label","ariaLabel"],ariaLabelledby:[1,"aria-labelledby","ariaLabelledby"],disabled:[1,"disabled"],tabIndex:[1,"tabIndex"],disableRipple:[1,"disableRipple"]},exportAs:["matTimepickerToggle"],ngContentSelectors:Ed,decls:3,vars:6,consts:[["matIconButton","","type","button","aria-haspopup","listbox",3,"tabIndex","disabled","disableRipple"],["height","24px","width","24px","viewBox","0 -960 960 960","fill","currentColor","focusable","false","aria-hidden","true",1,"mat-timepicker-toggle-default-icon"],["d","m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"]],template:function(t,i){t&1&&(he(Sd),d(0,"button",0),Y(1,0,null,Ad,2,0),c()),t&2&&(b("tabIndex",i._isDisabled()?-1:i.tabIndex())("disabled",i._isDisabled())("disableRipple",i.disableRipple()),B("aria-label",i.getAriaLabel())("aria-labelledby",i.ariaLabelledby())("aria-expanded",i.timepicker().isOpen()))},dependencies:[At],encapsulation:2})}return a})(),ts=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({imports:[Sa,Ea,gt]})}return a})();var Aa={car:["car"],scooter:["scooter","ev"]};function ki(a){return a&&a in Aa?a:void 0}var ns=["\u6A5F\u5834","\u6E2F\u53E3","\u5E97\u8216"],ln="\u6A5F\u5834";var Id=["tooltip"],Pd=20;var Td=new A("mat-tooltip-scroll-strategy",{providedIn:"root",factory:()=>{let a=s(X);return()=>ot(a,{scrollThrottle:Pd})}}),Nd=new A("mat-tooltip-default-options",{providedIn:"root",factory:()=>({showDelay:0,hideDelay:0,touchendHideDelay:1500})});var is="tooltip-panel",Ld={passive:!0},Bd=8,zd=8,Hd=24,jd=200,as=(()=>{class a{_elementRef=s(F);_ngZone=s(H);_platform=s(fe);_ariaDescriber=s(Cr);_focusMonitor=s(Zt);_dir=s(ke);_injector=s(X);_viewContainerRef=s(Qe);_mediaMatcher=s(fr);_document=s(Se);_renderer=s($);_animationsDisabled=we();_defaultOptions=s(Nd,{optional:!0});_overlayRef=null;_tooltipInstance=null;_overlayPanelClass;_portal;_position="below";_positionAtOrigin=!1;_disabled=!1;_tooltipClass;_viewInitialized=!1;_pointerExitEventsInitialized=!1;_tooltipComponent=Yd;_viewportMargin=8;_currentPosition;_cssClassPrefix="mat-mdc";_ariaDescriptionPending=!1;_dirSubscribed=!1;get position(){return this._position}set position(e){e!==this._position&&(this._position=e,this._overlayRef&&(this._updatePosition(this._overlayRef),this._tooltipInstance?.show(0),this._overlayRef.updatePosition()))}get positionAtOrigin(){return this._positionAtOrigin}set positionAtOrigin(e){this._positionAtOrigin=ut(e),this._detach(),this._overlayRef=null}get disabled(){return this._disabled}set disabled(e){let t=ut(e);this._disabled!==t&&(this._disabled=t,t?this.hide(0):this._setupPointerEnterEventsIfNeeded(),this._syncAriaDescription(this.message))}get showDelay(){return this._showDelay}set showDelay(e){this._showDelay=fn(e)}_showDelay;get hideDelay(){return this._hideDelay}set hideDelay(e){this._hideDelay=fn(e),this._tooltipInstance&&(this._tooltipInstance._mouseLeaveHideDelay=this._hideDelay)}_hideDelay;touchGestures="auto";get message(){return this._message}set message(e){let t=this._message;this._message=e!=null?String(e).trim():"",!this._message&&this._isTooltipVisible()?this.hide(0):(this._setupPointerEnterEventsIfNeeded(),this._updateTooltipMessage()),this._syncAriaDescription(t)}_message="";get tooltipClass(){return this._tooltipClass}set tooltipClass(e){this._tooltipClass=e,this._tooltipInstance&&this._setTooltipClass(this._tooltipClass)}_eventCleanups=[];_touchstartTimeout=null;_destroyed=new L;_isDestroyed=!1;constructor(){let e=this._defaultOptions;e&&(this._showDelay=e.showDelay,this._hideDelay=e.hideDelay,e.position&&(this.position=e.position),e.positionAtOrigin&&(this.positionAtOrigin=e.positionAtOrigin),e.touchGestures&&(this.touchGestures=e.touchGestures),e.tooltipClass&&(this.tooltipClass=e.tooltipClass)),this._viewportMargin=Bd}ngAfterViewInit(){this._viewInitialized=!0,this._setupPointerEnterEventsIfNeeded(),this._focusMonitor.monitor(this._elementRef).pipe(ae(this._destroyed)).subscribe(e=>{e?e==="keyboard"&&this._ngZone.run(()=>this.show()):this._ngZone.run(()=>this.hide(0))})}ngOnDestroy(){let e=this._elementRef.nativeElement;this._touchstartTimeout&&clearTimeout(this._touchstartTimeout),this._overlayRef&&(this._overlayRef.dispose(),this._tooltipInstance=null),this._eventCleanups.forEach(t=>t()),this._eventCleanups.length=0,this._destroyed.next(),this._destroyed.complete(),this._isDestroyed=!0,this._ariaDescriber.removeDescription(e,this.message,"tooltip"),this._focusMonitor.stopMonitoring(e)}show(e=this.showDelay,t){if(this.disabled||!this.message||this._isTooltipVisible()){this._tooltipInstance?._cancelPendingAnimations();return}let i=this._createOverlay(t);this._detach(),this._portal=this._portal||new Wt(this._tooltipComponent,this._viewContainerRef);let r=this._tooltipInstance=i.attach(this._portal).instance;r._triggerElement=this._elementRef.nativeElement,r._mouseLeaveHideDelay=this._hideDelay,r.afterHidden().pipe(ae(this._destroyed)).subscribe(()=>this._detach()),this._setTooltipClass(this._tooltipClass),this._updateTooltipMessage(),r.show(e)}hide(e=this.hideDelay){let t=this._tooltipInstance;t&&(t.isVisible()?t.hide(e):(t._cancelPendingAnimations(),this._detach()))}toggle(e){this._isTooltipVisible()?this.hide():this.show(void 0,e)}_isTooltipVisible(){return!!this._tooltipInstance&&this._tooltipInstance.isVisible()}_createOverlay(e){if(this._overlayRef){let o=this._overlayRef.getConfig().positionStrategy;if((!this.positionAtOrigin||!e)&&o._origin instanceof F)return this._overlayRef;this._detach()}let t=this._injector.get(rn).getAncestorScrollContainers(this._elementRef),i=`${this._cssClassPrefix}-${is}`,r=Ft(this._injector,this.positionAtOrigin?e||this._elementRef:this._elementRef).withTransformOriginOn(`.${this._cssClassPrefix}-tooltip`).withFlexibleDimensions(!1).withViewportMargin(this._viewportMargin).withScrollableContainers(t).withPopoverLocation("global");return r.positionChanges.pipe(ae(this._destroyed)).subscribe(o=>{this._updateCurrentPositionClass(o.connectionPair),this._tooltipInstance&&o.scrollableViewProperties.isOverlayClipped&&this._tooltipInstance.isVisible()&&this._ngZone.run(()=>this.hide(0))}),this._overlayRef=It(this._injector,{direction:this._dir,positionStrategy:r,panelClass:this._overlayPanelClass?[...this._overlayPanelClass,i]:i,scrollStrategy:this._injector.get(Td)(),disableAnimations:this._animationsDisabled,eventPredicate:this._overlayEventPredicate}),this._updatePosition(this._overlayRef),this._overlayRef.detachments().pipe(ae(this._destroyed)).subscribe(()=>this._detach()),this._overlayRef.outsidePointerEvents().pipe(ae(this._destroyed)).subscribe(()=>this._tooltipInstance?._handleBodyInteraction()),this._overlayRef.keydownEvents().pipe(ae(this._destroyed)).subscribe(o=>{o.preventDefault(),o.stopPropagation(),this._ngZone.run(()=>this.hide(0))}),this._defaultOptions?.disableTooltipInteractivity&&this._overlayRef.addPanelClass(`${this._cssClassPrefix}-tooltip-panel-non-interactive`),this._dirSubscribed||(this._dirSubscribed=!0,this._dir.change.pipe(ae(this._destroyed)).subscribe(()=>{this._overlayRef&&this._updatePosition(this._overlayRef)})),this._overlayRef}_detach(){this._overlayRef&&this._overlayRef.hasAttached()&&this._overlayRef.detach(),this._tooltipInstance=null}_updatePosition(e){let t=e.getConfig().positionStrategy,i=this._getOrigin(),r=this._getOverlayPosition();t.withPositions([this._addOffset(W(W({},i.main),r.main)),this._addOffset(W(W({},i.fallback),r.fallback))])}_addOffset(e){let t=zd,i=!this._dir||this._dir.value=="ltr";return e.originY==="top"?e.offsetY=-t:e.originY==="bottom"?e.offsetY=t:e.originX==="start"?e.offsetX=i?-t:t:e.originX==="end"&&(e.offsetX=i?t:-t),e}_getOrigin(){let e=!this._dir||this._dir.value=="ltr",t=this.position,i;t=="above"||t=="below"?i={originX:"center",originY:t=="above"?"top":"bottom"}:t=="before"||t=="left"&&e||t=="right"&&!e?i={originX:"start",originY:"center"}:(t=="after"||t=="right"&&e||t=="left"&&!e)&&(i={originX:"end",originY:"center"});let{x:r,y:o}=this._invertPosition(i.originX,i.originY);return{main:i,fallback:{originX:r,originY:o}}}_getOverlayPosition(){let e=!this._dir||this._dir.value=="ltr",t=this.position,i;t=="above"?i={overlayX:"center",overlayY:"bottom"}:t=="below"?i={overlayX:"center",overlayY:"top"}:t=="before"||t=="left"&&e||t=="right"&&!e?i={overlayX:"end",overlayY:"center"}:(t=="after"||t=="right"&&e||t=="left"&&!e)&&(i={overlayX:"start",overlayY:"center"});let{x:r,y:o}=this._invertPosition(i.overlayX,i.overlayY);return{main:i,fallback:{overlayX:r,overlayY:o}}}_updateTooltipMessage(){this._tooltipInstance&&(this._tooltipInstance.message=this.message,this._tooltipInstance._markForCheck(),Ee(()=>{this._tooltipInstance&&this._overlayRef.updatePosition()},{injector:this._injector}))}_setTooltipClass(e){this._tooltipInstance&&(this._tooltipInstance.tooltipClass=e instanceof Set?Array.from(e):e,this._tooltipInstance._markForCheck())}_invertPosition(e,t){return this.position==="above"||this.position==="below"?t==="top"?t="bottom":t==="bottom"&&(t="top"):e==="end"?e="start":e==="start"&&(e="end"),{x:e,y:t}}_updateCurrentPositionClass(e){let{overlayY:t,originX:i,originY:r}=e,o;if(t==="center"?this._dir&&this._dir.value==="rtl"?o=i==="end"?"left":"right":o=i==="start"?"left":"right":o=t==="bottom"&&r==="top"?"above":"below",o!==this._currentPosition){let u=this._overlayRef;if(u){let h=`${this._cssClassPrefix}-${is}-`;u.removePanelClass(h+this._currentPosition),u.addPanelClass(h+o)}this._currentPosition=o}}_setupPointerEnterEventsIfNeeded(){this._disabled||!this.message||!this._viewInitialized||this._eventCleanups.length||(this._isTouchPlatform()?this.touchGestures!=="off"&&(this._disableNativeGesturesIfNecessary(),this._addListener("touchstart",e=>{let t=e.targetTouches?.[0],i=t?{x:t.clientX,y:t.clientY}:void 0;this._setupPointerExitEventsIfNeeded(),this._touchstartTimeout&&clearTimeout(this._touchstartTimeout);let r=500;this._touchstartTimeout=setTimeout(()=>{this._touchstartTimeout=null,this.show(void 0,i)},this._defaultOptions?.touchLongPressShowDelay??r)})):this._addListener("mouseenter",e=>{this._setupPointerExitEventsIfNeeded();let t;e.x!==void 0&&e.y!==void 0&&(t=e),this.show(void 0,t)}))}_setupPointerExitEventsIfNeeded(){if(!this._pointerExitEventsInitialized){if(this._pointerExitEventsInitialized=!0,!this._isTouchPlatform())this._addListener("mouseleave",e=>{let t=e.relatedTarget;(!t||!this._overlayRef?.overlayElement.contains(t))&&this.hide()}),this._addListener("wheel",e=>{if(this._isTooltipVisible()){let t=this._document.elementFromPoint(e.clientX,e.clientY),i=this._elementRef.nativeElement;t!==i&&!i.contains(t)&&this.hide()}});else if(this.touchGestures!=="off"){this._disableNativeGesturesIfNecessary();let e=()=>{this._touchstartTimeout&&clearTimeout(this._touchstartTimeout),this.hide(this._defaultOptions?.touchendHideDelay)};this._addListener("touchend",e),this._addListener("touchcancel",e)}}}_addListener(e,t){this._eventCleanups.push(this._renderer.listen(this._elementRef.nativeElement,e,t,Ld))}_isTouchPlatform(){let e=this._defaultOptions?.detectHoverCapability;return typeof e=="function"?!e():this._platform.IOS||this._platform.ANDROID?!0:this._platform.isBrowser?!!e&&this._mediaMatcher.matchMedia("(any-hover: none)").matches:!1}_disableNativeGesturesIfNecessary(){let e=this.touchGestures;if(e!=="off"){let t=this._elementRef.nativeElement,i=t.style;(e==="on"||t.nodeName!=="INPUT"&&t.nodeName!=="TEXTAREA")&&(i.userSelect=i.msUserSelect=i.webkitUserSelect=i.MozUserSelect="none"),(e==="on"||!t.draggable)&&(i.webkitUserDrag="none"),i.touchAction="none",i.webkitTapHighlightColor="transparent"}}_syncAriaDescription(e){this._ariaDescriptionPending||(this._ariaDescriptionPending=!0,this._ariaDescriber.removeDescription(this._elementRef.nativeElement,e,"tooltip"),this._isDestroyed||Ee({write:()=>{this._ariaDescriptionPending=!1,this.message&&!this.disabled&&this._ariaDescriber.describe(this._elementRef.nativeElement,this.message,"tooltip")}},{injector:this._injector}))}_overlayEventPredicate=e=>e.type==="keydown"?this._isTooltipVisible()&&e.keyCode===27&&!Pe(e):!0;static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["","matTooltip",""]],hostAttrs:[1,"mat-mdc-tooltip-trigger"],hostVars:2,hostBindings:function(t,i){t&2&&I("mat-mdc-tooltip-disabled",i.disabled)},inputs:{position:[0,"matTooltipPosition","position"],positionAtOrigin:[0,"matTooltipPositionAtOrigin","positionAtOrigin"],disabled:[0,"matTooltipDisabled","disabled"],showDelay:[0,"matTooltipShowDelay","showDelay"],hideDelay:[0,"matTooltipHideDelay","hideDelay"],touchGestures:[0,"matTooltipTouchGestures","touchGestures"],message:[0,"matTooltip","message"],tooltipClass:[0,"matTooltipClass","tooltipClass"]},exportAs:["matTooltip"]})}return a})(),Yd=(()=>{class a{_changeDetectorRef=s(Z);_elementRef=s(F);_isMultiline=!1;message;tooltipClass;_showTimeoutId;_hideTimeoutId;_triggerElement;_mouseLeaveHideDelay;_animationsDisabled=we();_tooltip;_closeOnInteraction=!1;_isVisible=!1;_onHide=new L;_showAnimation="mat-mdc-tooltip-show";_hideAnimation="mat-mdc-tooltip-hide";show(e){this._hideTimeoutId!=null&&clearTimeout(this._hideTimeoutId),this._showTimeoutId=setTimeout(()=>{this._toggleVisibility(!0),this._showTimeoutId=void 0},e)}hide(e){this._showTimeoutId!=null&&clearTimeout(this._showTimeoutId),this._hideTimeoutId=setTimeout(()=>{this._toggleVisibility(!1),this._hideTimeoutId=void 0},e)}afterHidden(){return this._onHide}isVisible(){return this._isVisible}ngOnDestroy(){this._cancelPendingAnimations(),this._onHide.complete(),this._triggerElement=null}_handleBodyInteraction(){this._closeOnInteraction&&this.hide(0)}_markForCheck(){this._changeDetectorRef.markForCheck()}_handleMouseLeave({relatedTarget:e}){(!e||!this._triggerElement.contains(e))&&(this.isVisible()?this.hide(this._mouseLeaveHideDelay):this._finalizeAnimation(!1))}_onShow(){this._isMultiline=this._isTooltipMultiline(),this._markForCheck()}_isTooltipMultiline(){let e=this._elementRef.nativeElement.getBoundingClientRect();return e.height>Hd&&e.width>=jd}_handleAnimationEnd({animationName:e}){(e===this._showAnimation||e===this._hideAnimation)&&this._finalizeAnimation(e===this._showAnimation)}_cancelPendingAnimations(){this._showTimeoutId!=null&&clearTimeout(this._showTimeoutId),this._hideTimeoutId!=null&&clearTimeout(this._hideTimeoutId),this._showTimeoutId=this._hideTimeoutId=void 0}_finalizeAnimation(e){e?this._closeOnInteraction=!0:this.isVisible()||this._onHide.next()}_toggleVisibility(e){let t=this._tooltip.nativeElement,i=this._showAnimation,r=this._hideAnimation;if(t.classList.remove(e?r:i),t.classList.add(e?i:r),this._isVisible!==e&&(this._isVisible=e,this._changeDetectorRef.markForCheck()),e&&!this._animationsDisabled&&typeof getComputedStyle=="function"){let o=getComputedStyle(t);(o.getPropertyValue("animation-duration")==="0s"||o.getPropertyValue("animation-name")==="none")&&(this._animationsDisabled=!0)}e&&this._onShow(),this._animationsDisabled&&(t.classList.add("_mat-animation-noopable"),this._finalizeAnimation(e))}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-tooltip-component"]],viewQuery:function(t,i){if(t&1&&oe(Id,7),t&2){let r;O(r=R())&&(i._tooltip=r.first)}},hostAttrs:["aria-hidden","true"],hostBindings:function(t,i){t&1&&g("mouseleave",function(o){return i._handleMouseLeave(o)})},decls:4,vars:5,consts:[["tooltip",""],[1,"mdc-tooltip","mat-mdc-tooltip",3,"animationend"],[1,"mat-mdc-tooltip-surface","mdc-tooltip__surface"]],template:function(t,i){t&1&&(f(0,"div",1,0),Bt("animationend",function(o){return i._handleAnimationEnd(o)}),f(2,"div",2),m(3),_()()),t&2&&(Je(i.tooltipClass),I("mdc-tooltip--multiline",i._isMultiline),l(3),N(i.message))},styles:[`.mat-mdc-tooltip {
  position: relative;
  transform: scale(0);
  display: inline-flex;
}
.mat-mdc-tooltip::before {
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  position: absolute;
}
.mat-mdc-tooltip-panel-below .mat-mdc-tooltip::before {
  top: -8px;
}
.mat-mdc-tooltip-panel-above .mat-mdc-tooltip::before {
  bottom: -8px;
}
.mat-mdc-tooltip-panel-right .mat-mdc-tooltip::before {
  left: -8px;
}
.mat-mdc-tooltip-panel-left .mat-mdc-tooltip::before {
  right: -8px;
}
.mat-mdc-tooltip._mat-animation-noopable {
  animation: none;
  transform: scale(1);
}

.mat-mdc-tooltip-surface {
  word-break: normal;
  overflow-wrap: anywhere;
  padding: 4px 8px;
  min-width: 40px;
  max-width: 200px;
  min-height: 24px;
  max-height: 40vh;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  will-change: transform, opacity;
  background-color: var(--mat-tooltip-container-color, var(--mat-sys-inverse-surface));
  color: var(--mat-tooltip-supporting-text-color, var(--mat-sys-inverse-on-surface));
  border-radius: var(--mat-tooltip-container-shape, var(--mat-sys-corner-extra-small));
  font-family: var(--mat-tooltip-supporting-text-font, var(--mat-sys-body-small-font));
  font-size: var(--mat-tooltip-supporting-text-size, var(--mat-sys-body-small-size));
  font-weight: var(--mat-tooltip-supporting-text-weight, var(--mat-sys-body-small-weight));
  line-height: var(--mat-tooltip-supporting-text-line-height, var(--mat-sys-body-small-line-height));
  letter-spacing: var(--mat-tooltip-supporting-text-tracking, var(--mat-sys-body-small-tracking));
}
.mat-mdc-tooltip-surface::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
.mdc-tooltip--multiline .mat-mdc-tooltip-surface {
  text-align: left;
}
[dir=rtl] .mdc-tooltip--multiline .mat-mdc-tooltip-surface {
  text-align: right;
}

.mat-mdc-tooltip-panel {
  line-height: normal;
}
.mat-mdc-tooltip-panel.mat-mdc-tooltip-panel-non-interactive {
  pointer-events: none;
}

@keyframes mat-mdc-tooltip-show {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes mat-mdc-tooltip-hide {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
.mat-mdc-tooltip-show {
  animation: mat-mdc-tooltip-show 150ms cubic-bezier(0, 0, 0.2, 1) forwards;
}

.mat-mdc-tooltip-hide {
  animation: mat-mdc-tooltip-hide 75ms cubic-bezier(0.4, 0, 1, 1) forwards;
}
`],encapsulation:2})}return a})();function Gd(a,n){return this._trackRow(n)}var cs=(a,n)=>n.id;function Wd(a,n){if(a&1&&(f(0,"tr",0)(1,"td",3),m(2),_()()),a&2){let e=p();l(),hn("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),B("colspan",e.numCols),l(),E(" ",e.label," ")}}function qd(a,n){if(a&1&&(f(0,"td",3),m(1),_()),a&2){let e=p(2);hn("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),B("colspan",e._firstRowOffset),l(),E(" ",e._firstRowOffset>=e.labelMinRequiredCells?e.label:""," ")}}function Ud(a,n){if(a&1){let e=ne();f(0,"td",6)(1,"button",7),Bt("click",function(i){let r=P(e).$implicit,o=p(2);return T(o._cellClicked(r,i))})("focus",function(i){let r=P(e).$implicit,o=p(2);return T(o._emitActiveDateChange(r,i))}),f(2,"span",8),m(3),_(),Ae(4,"span",9),_()()}if(a&2){let e=n.$implicit,t=n.$index,i=p().$index,r=p();hn("width",r._cellWidth)("padding-top",r._cellPadding)("padding-bottom",r._cellPadding),B("data-mat-row",i)("data-mat-col",t),l(),Je(e.cssClasses),I("mat-calendar-body-disabled",!e.enabled)("mat-calendar-body-active",r._isActiveCell(i,t))("mat-calendar-body-range-start",r._isRangeStart(e.compareValue))("mat-calendar-body-range-end",r._isRangeEnd(e.compareValue))("mat-calendar-body-in-range",r._isInRange(e.compareValue))("mat-calendar-body-comparison-bridge-start",r._isComparisonBridgeStart(e.compareValue,i,t))("mat-calendar-body-comparison-bridge-end",r._isComparisonBridgeEnd(e.compareValue,i,t))("mat-calendar-body-comparison-start",r._isComparisonStart(e.compareValue))("mat-calendar-body-comparison-end",r._isComparisonEnd(e.compareValue))("mat-calendar-body-in-comparison-range",r._isInComparisonRange(e.compareValue))("mat-calendar-body-preview-start",r._isPreviewStart(e.compareValue))("mat-calendar-body-preview-end",r._isPreviewEnd(e.compareValue))("mat-calendar-body-in-preview",r._isInPreview(e.compareValue)),De("tabIndex",r._isActiveCell(i,t)?0:-1),B("aria-label",e.ariaLabel)("aria-disabled",!e.enabled||null)("aria-pressed",r._isSelected(e.compareValue))("aria-current",r.todayValue===e.compareValue?"date":null)("aria-describedby",r._getDescribedby(e.compareValue)),l(),I("mat-calendar-body-selected",r._isSelected(e.compareValue))("mat-calendar-body-comparison-identical",r._isComparisonIdentical(e.compareValue))("mat-calendar-body-today",r.todayValue===e.compareValue),l(),E(" ",e.displayValue," ")}}function $d(a,n){if(a&1&&(f(0,"tr",1),y(1,qd,2,6,"td",4),ce(2,Ud,5,49,"td",5,cs),_()),a&2){let e=n.$implicit,t=n.$index,i=p();l(),C(t===0&&i._firstRowOffset?1:-1),l(),me(e)}}function Xd(a,n){if(a&1&&(d(0,"th",2)(1,"span",6),m(2),c(),d(3,"span",3),m(4),c()()),a&2){let e=n.$implicit;l(2),N(e.long),l(2),N(e.narrow)}}var Kd=["*"];function Qd(a,n){}function Zd(a,n){if(a&1){let e=ne();d(0,"mat-month-view",4),je("activeDateChange",function(i){P(e);let r=p();return He(r.activeDate,i)||(r.activeDate=i),T(i)}),g("_userSelection",function(i){P(e);let r=p();return T(r._dateSelected(i))})("dragStarted",function(i){P(e);let r=p();return T(r._dragStarted(i))})("dragEnded",function(i){P(e);let r=p();return T(r._dragEnded(i))}),c()}if(a&2){let e=p();ze("activeDate",e.activeDate),b("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)("comparisonStart",e.comparisonStart)("comparisonEnd",e.comparisonEnd)("startDateAccessibleName",e.startDateAccessibleName)("endDateAccessibleName",e.endDateAccessibleName)("activeDrag",e._activeDrag)}}function Jd(a,n){if(a&1){let e=ne();d(0,"mat-year-view",5),je("activeDateChange",function(i){P(e);let r=p();return He(r.activeDate,i)||(r.activeDate=i),T(i)}),g("monthSelected",function(i){P(e);let r=p();return T(r._monthSelectedInYearView(i))})("selectedChange",function(i){P(e);let r=p();return T(r._goToDateInView(i,"month"))}),c()}if(a&2){let e=p();ze("activeDate",e.activeDate),b("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)}}function ec(a,n){if(a&1){let e=ne();d(0,"mat-multi-year-view",6),je("activeDateChange",function(i){P(e);let r=p();return He(r.activeDate,i)||(r.activeDate=i),T(i)}),g("yearSelected",function(i){P(e);let r=p();return T(r._yearSelectedInMultiYearView(i))})("selectedChange",function(i){P(e);let r=p();return T(r._goToDateInView(i,"year"))}),c()}if(a&2){let e=p();ze("activeDate",e.activeDate),b("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)}}function tc(a,n){}var nc=["button"],ic=[[["","matDatepickerToggleIcon",""]]],ac=["[matDatepickerToggleIcon]"];function rc(a,n){a&1&&(dt(),d(0,"svg",2),j(1,"path",3),c())}var cn=(()=>{class a{changes=new L;calendarLabel="Calendar";openCalendarLabel="Open calendar";closeCalendarLabel="Close calendar";prevMonthLabel="Previous month";nextMonthLabel="Next month";prevYearLabel="Previous year";nextYearLabel="Next year";prevMultiYearLabel="Previous 24 years";nextMultiYearLabel="Next 24 years";switchToMonthViewLabel="Choose date";switchToMultiYearViewLabel="Choose month and year";startDateLabel="Start date";endDateLabel="End date";comparisonDateLabel="Comparison range";formatYearRange(e,t){return`${e} \u2013 ${t}`}formatYearRangeLabel(e,t){return`${e} to ${t}`}static \u0275fac=function(t){return new(t||a)};static \u0275prov=te({token:a,factory:a.\u0275fac})}return a})(),oc=0,Nn=class{value;displayValue;ariaLabel;enabled;compareValue;rawValue;id=oc++;cssClasses;constructor(n,e,t,i,r,o=n,u){this.value=n,this.displayValue=e,this.ariaLabel=t,this.enabled=i,this.compareValue=o,this.rawValue=u,this.cssClasses=r instanceof Set?Array.from(r):r}},sc={passive:!1,capture:!0},Mi={passive:!0,capture:!0},rs={passive:!0},dn=(()=>{class a{_elementRef=s(F);_ngZone=s(H);_platform=s(fe);_intl=s(cn);_eventCleanups;_skipNextFocus=!1;_focusActiveCellAfterViewChecked=!1;label;rows;todayValue;startValue;endValue;labelMinRequiredCells;numCols=7;activeCell=0;ngAfterViewChecked(){this._focusActiveCellAfterViewChecked&&(this._focusActiveCell(),this._focusActiveCellAfterViewChecked=!1)}isRange=!1;cellAspectRatio=1;comparisonStart=null;comparisonEnd=null;previewStart=null;previewEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedValueChange=new v;previewChange=new v;activeDateChange=new v;dragStarted=new v;dragEnded=new v;_firstRowOffset;_cellPadding;_cellWidth;_startDateLabelId;_endDateLabelId;_comparisonStartDateLabelId;_comparisonEndDateLabelId;_didDragSinceMouseDown=!1;_injector=s(X);comparisonDateAccessibleName=this._intl.comparisonDateLabel;_trackRow=e=>e;constructor(){let e=s($),t=s(_e);this._startDateLabelId=t.getId("mat-calendar-body-start-"),this._endDateLabelId=t.getId("mat-calendar-body-end-"),this._comparisonStartDateLabelId=t.getId("mat-calendar-body-comparison-start-"),this._comparisonEndDateLabelId=t.getId("mat-calendar-body-comparison-end-"),s(Oe).load(Jt),this._ngZone.runOutsideAngular(()=>{let i=this._elementRef.nativeElement,r=[e.listen(i,"touchmove",this._touchmoveHandler,sc),e.listen(i,"mouseenter",this._enterHandler,Mi),e.listen(i,"focus",this._enterHandler,Mi),e.listen(i,"mouseleave",this._leaveHandler,Mi),e.listen(i,"blur",this._leaveHandler,Mi),e.listen(i,"mousedown",this._mousedownHandler,rs),e.listen(i,"touchstart",this._mousedownHandler,rs)];this._platform.isBrowser&&r.push(e.listen("window","mouseup",this._mouseupHandler),e.listen("window","touchend",this._touchendHandler)),this._eventCleanups=r})}_cellClicked(e,t){this._didDragSinceMouseDown||e.enabled&&this.selectedValueChange.emit({value:e.value,event:t})}_emitActiveDateChange(e,t){e.enabled&&this.activeDateChange.emit({value:e.value,event:t})}_isSelected(e){return this.startValue===e||this.endValue===e}ngOnChanges(e){let t=e.numCols,{rows:i,numCols:r}=this;(e.rows||t)&&(this._firstRowOffset=i&&i.length&&i[0].length?r-i[0].length:0),(e.cellAspectRatio||t||!this._cellPadding)&&(this._cellPadding=`${50*this.cellAspectRatio/r}%`),(t||!this._cellWidth)&&(this._cellWidth=`${100/r}%`)}ngOnDestroy(){this._eventCleanups.forEach(e=>e())}_isActiveCell(e,t){let i=e*this.numCols+t;return e&&(i-=this._firstRowOffset),i==this.activeCell}_focusActiveCell(e=!0){Ee(()=>{setTimeout(()=>{let t=this._elementRef.nativeElement.querySelector(".mat-calendar-body-active");t&&(e||(this._skipNextFocus=!0),t.focus())})},{injector:this._injector})}_scheduleFocusActiveCellAfterViewChecked(){this._focusActiveCellAfterViewChecked=!0}_isRangeStart(e){return Va(e,this.startValue,this.endValue)}_isRangeEnd(e){return Fa(e,this.startValue,this.endValue)}_isInRange(e){return Ia(e,this.startValue,this.endValue,this.isRange)}_isComparisonStart(e){return Va(e,this.comparisonStart,this.comparisonEnd)}_isComparisonBridgeStart(e,t,i){if(!this._isComparisonStart(e)||this._isRangeStart(e)||!this._isInRange(e))return!1;let r=this.rows[t][i-1];if(!r){let o=this.rows[t-1];r=o&&o[o.length-1]}return r&&!this._isRangeEnd(r.compareValue)}_isComparisonBridgeEnd(e,t,i){if(!this._isComparisonEnd(e)||this._isRangeEnd(e)||!this._isInRange(e))return!1;let r=this.rows[t][i+1];if(!r){let o=this.rows[t+1];r=o&&o[0]}return r&&!this._isRangeStart(r.compareValue)}_isComparisonEnd(e){return Fa(e,this.comparisonStart,this.comparisonEnd)}_isInComparisonRange(e){return Ia(e,this.comparisonStart,this.comparisonEnd,this.isRange)}_isComparisonIdentical(e){return this.comparisonStart===this.comparisonEnd&&e===this.comparisonStart}_isPreviewStart(e){return Va(e,this.previewStart,this.previewEnd)}_isPreviewEnd(e){return Fa(e,this.previewStart,this.previewEnd)}_isInPreview(e){return Ia(e,this.previewStart,this.previewEnd,this.isRange)}_getDescribedby(e){if(!this.isRange)return null;if(this.startValue===e&&this.endValue===e)return`${this._startDateLabelId} ${this._endDateLabelId}`;if(this.startValue===e)return this._startDateLabelId;if(this.endValue===e)return this._endDateLabelId;if(this.comparisonStart!==null&&this.comparisonEnd!==null){if(e===this.comparisonStart&&e===this.comparisonEnd)return`${this._comparisonStartDateLabelId} ${this._comparisonEndDateLabelId}`;if(e===this.comparisonStart)return this._comparisonStartDateLabelId;if(e===this.comparisonEnd)return this._comparisonEndDateLabelId}return null}_enterHandler=e=>{if(this._skipNextFocus&&e.type==="focus"){this._skipNextFocus=!1;return}if(e.target&&this.isRange){let t=this._getCellFromElement(e.target);t&&this._ngZone.run(()=>this.previewChange.emit({value:t.enabled?t:null,event:e}))}};_touchmoveHandler=e=>{if(!this.isRange)return;let t=os(e),i=t?this._getCellFromElement(t):null;t!==e.target&&(this._didDragSinceMouseDown=!0),Ra(e.target)&&e.preventDefault(),this._ngZone.run(()=>this.previewChange.emit({value:i?.enabled?i:null,event:e}))};_leaveHandler=e=>{this.previewEnd!==null&&this.isRange&&(e.type!=="blur"&&(this._didDragSinceMouseDown=!0),e.target&&this._getCellFromElement(e.target)&&!(e.relatedTarget&&this._getCellFromElement(e.relatedTarget))&&this._ngZone.run(()=>this.previewChange.emit({value:null,event:e})))};_mousedownHandler=e=>{if(!this.isRange)return;this._didDragSinceMouseDown=!1;let t=e.target&&this._getCellFromElement(e.target);!t||!this._isInRange(t.compareValue)||this._ngZone.run(()=>{this.dragStarted.emit({value:t.rawValue,event:e})})};_mouseupHandler=e=>{if(!this.isRange)return;let t=Ra(e.target);if(!t){this._ngZone.run(()=>{this.dragEnded.emit({value:null,event:e})});return}t.closest(".mat-calendar-body")===this._elementRef.nativeElement&&this._ngZone.run(()=>{let i=this._getCellFromElement(t);this.dragEnded.emit({value:i?.rawValue??null,event:e})})};_touchendHandler=e=>{let t=os(e);t&&this._mouseupHandler({target:t})};_getCellFromElement(e){let t=Ra(e);if(t){let i=t.getAttribute("data-mat-row"),r=t.getAttribute("data-mat-col");if(i&&r)return this.rows[parseInt(i)]?.[parseInt(r)]||null}return null}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["","mat-calendar-body",""]],hostAttrs:[1,"mat-calendar-body"],inputs:{label:"label",rows:"rows",todayValue:"todayValue",startValue:"startValue",endValue:"endValue",labelMinRequiredCells:"labelMinRequiredCells",numCols:"numCols",activeCell:"activeCell",isRange:"isRange",cellAspectRatio:"cellAspectRatio",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",previewStart:"previewStart",previewEnd:"previewEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedValueChange:"selectedValueChange",previewChange:"previewChange",activeDateChange:"activeDateChange",dragStarted:"dragStarted",dragEnded:"dragEnded"},exportAs:["matCalendarBody"],features:[ee],decls:11,vars:11,consts:[["aria-hidden","true"],["role","row"],[1,"mat-calendar-body-hidden-label",3,"id"],[1,"mat-calendar-body-label"],[1,"mat-calendar-body-label",3,"paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container",3,"width","paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container"],["type","button",1,"mat-calendar-body-cell",3,"click","focus","tabindex"],[1,"mat-calendar-body-cell-content","mat-focus-indicator"],["aria-hidden","true",1,"mat-calendar-body-cell-preview"]],template:function(t,i){t&1&&(y(0,Wd,3,6,"tr",0),ce(1,$d,4,1,"tr",1,Gd,!0),f(3,"span",2),m(4),_(),f(5,"span",2),m(6),_(),f(7,"span",2),m(8),_(),f(9,"span",2),m(10),_()),t&2&&(C(i._firstRowOffset<i.labelMinRequiredCells?0:-1),l(),me(i.rows),l(2),De("id",i._startDateLabelId),l(),E(" ",i.startDateAccessibleName,`
`),l(),De("id",i._endDateLabelId),l(),E(" ",i.endDateAccessibleName,`
`),l(),De("id",i._comparisonStartDateLabelId),l(),et(" ",i.comparisonDateAccessibleName," ",i.startDateAccessibleName,`
`),l(),De("id",i._comparisonEndDateLabelId),l(),et(" ",i.comparisonDateAccessibleName," ",i.endDateAccessibleName,`
`))},styles:[`.mat-calendar-body {
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
`],encapsulation:2})}return a})();function Oa(a){return a?.nodeName==="TD"}function Ra(a){let n;return Oa(a)?n=a:Oa(a.parentNode)?n=a.parentNode:Oa(a.parentNode?.parentNode)&&(n=a.parentNode.parentNode),n?.getAttribute("data-mat-row")!=null?n:null}function Va(a,n,e){return e!==null&&n!==e&&a<e&&a===n}function Fa(a,n,e){return n!==null&&n!==e&&a>=n&&a===e}function Ia(a,n,e,t){return t&&n!==null&&e!==null&&n!==e&&a>=n&&a<=e}function os(a){let n=a.changedTouches[0];return document.elementFromPoint(n.clientX,n.clientY)}var ye=class{start;end;_disableStructuralEquivalency;constructor(n,e){this.start=n,this.end=e}},Si=(()=>{class a{selection;_adapter;_selectionChanged=new L;selectionChanged=this._selectionChanged;constructor(e,t){this.selection=e,this._adapter=t,this.selection=e}updateSelection(e,t){let i=this.selection;this.selection=e,this._selectionChanged.next({selection:e,source:t,oldValue:i})}ngOnDestroy(){this._selectionChanged.complete()}_isValidDateInstance(e){return this._adapter.isDateInstance(e)&&this._adapter.isValid(e)}static \u0275fac=function(t){er()};static \u0275prov=Lt({token:a,factory:a.\u0275fac})}return a})(),lc=(()=>{class a extends Si{constructor(e){super(null,e)}add(e){super.updateSelection(e,this)}isValid(){return this.selection!=null&&this._isValidDateInstance(this.selection)}isComplete(){return this.selection!=null}clone(){let e=new a(this._adapter);return e.updateSelection(this.selection,this),e}static \u0275fac=function(t){return new(t||a)(Ka(Ye))};static \u0275prov=Lt({token:a,factory:a.\u0275fac})}return a})();var dc={provide:Si,useFactory:()=>s(Si,{optional:!0,skipSelf:!0})||new lc(s(Ye))};var ms=new A("MAT_DATE_RANGE_SELECTION_STRATEGY");var Pa=7,cc=0,ss=(()=>{class a{_changeDetectorRef=s(Z);_dateFormats=s(wt,{optional:!0});_dateAdapter=s(Ye,{optional:!0});_dir=s(ke,{optional:!0});_rangeStrategy=s(ms,{optional:!0});_rerenderSubscription=pe.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,i=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(i,this.minDate,this.maxDate),this._hasSameMonthAndYear(t,this._activeDate)||this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof ye?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setRanges(this._selected)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;activeDrag=null;selectedChange=new v;_userSelection=new v;dragStarted=new v;dragEnded=new v;activeDateChange=new v;_matCalendarBody;_monthLabel=x("");_weeks=x([]);_firstWeekOffset=x(0);_rangeStart=x(null);_rangeEnd=x(null);_comparisonRangeStart=x(null);_comparisonRangeEnd=x(null);_previewStart=x(null);_previewEnd=x(null);_isRange=x(!1);_todayDate=x(null);_weekdays=x([]);constructor(){s(Oe).load(Xn),this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Xe(null)).subscribe(()=>this._init())}ngOnChanges(e){let t=e.comparisonStart||e.comparisonEnd;t&&!t.firstChange&&this._setRanges(this.selected),e.activeDrag&&!this.activeDrag&&this._clearPreview()}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_dateSelected(e){let t=e.value,i=this._getDateFromDayOfMonth(t),r,o;this._selected instanceof ye?(r=this._getDateInCurrentMonth(this._selected.start),o=this._getDateInCurrentMonth(this._selected.end)):r=o=this._getDateInCurrentMonth(this._selected),(r!==t||o!==t)&&this.selectedChange.emit(i),this._userSelection.emit({value:i,event:e.event}),this._clearPreview(),this._changeDetectorRef.markForCheck()}_updateActiveDate(e){let t=e.value,i=this._activeDate;this.activeDate=this._getDateFromDayOfMonth(t),this._dateAdapter.compareDate(i,this.activeDate)&&this.activeDateChange.emit(this._activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,i=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,i?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,i?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,-7);break;case 40:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,7);break;case 36:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,1-this._dateAdapter.getDate(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,this._dateAdapter.getNumDaysInMonth(this._activeDate)-this._dateAdapter.getDate(this._activeDate));break;case 33:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,-1):this._dateAdapter.addCalendarMonths(this._activeDate,-1);break;case 34:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,1):this._dateAdapter.addCalendarMonths(this._activeDate,1);break;case 13:case 32:this._selectionKeyPressed=!0,this._canSelect(this._activeDate)&&e.preventDefault();return;case 27:this._previewEnd()!=null&&!Pe(e)&&(this._clearPreview(),this.activeDrag?this.dragEnded.emit({value:null,event:e}):(this.selectedChange.emit(null),this._userSelection.emit({value:null,event:e})),e.preventDefault(),e.stopPropagation());return;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._canSelect(this._activeDate)&&this._dateSelected({value:this._dateAdapter.getDate(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_init(){this._setRanges(this.selected),this._todayDate.set(this._getCellCompareValue(this._dateAdapter.today())),this._monthLabel.set(this._dateFormats.display.monthLabel?this._dateAdapter.format(this.activeDate,this._dateFormats.display.monthLabel):this._dateAdapter.getMonthNames("short")[this._dateAdapter.getMonth(this.activeDate)].toLocaleUpperCase());let e=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),1);this._firstWeekOffset.set((Pa+this._dateAdapter.getDayOfWeek(e)-this._dateAdapter.getFirstDayOfWeek())%Pa),this._initWeekdays(),this._createWeekCells(),this._changeDetectorRef.markForCheck()}_focusActiveCell(e){this._matCalendarBody._focusActiveCell(e)}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_previewChanged({event:e,value:t}){if(this._rangeStrategy){let i=t?t.rawValue:null,r=this._rangeStrategy.createPreview(i,this.selected,e);if(this._previewStart.set(this._getCellCompareValue(r.start)),this._previewEnd.set(this._getCellCompareValue(r.end)),this.activeDrag&&i){let o=this._rangeStrategy.createDrag?.(this.activeDrag.value,this.selected,i,e);o&&(this._previewStart.set(this._getCellCompareValue(o.start)),this._previewEnd.set(this._getCellCompareValue(o.end)))}}}_dragEnded(e){if(this.activeDrag)if(e.value){let t=this._rangeStrategy?.createDrag?.(this.activeDrag.value,this.selected,e.value,e.event);this.dragEnded.emit({value:t??null,event:e.event})}else this.dragEnded.emit({value:null,event:e.event})}_getDateFromDayOfMonth(e){return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),e)}_initWeekdays(){let e=this._dateAdapter.getFirstDayOfWeek(),t=this._dateAdapter.getDayOfWeekNames("narrow"),r=this._dateAdapter.getDayOfWeekNames("long").map((o,u)=>({long:o,narrow:t[u],id:cc++}));this._weekdays.set(r.slice(e).concat(r.slice(0,e)))}_createWeekCells(){let e=this._dateAdapter.getNumDaysInMonth(this.activeDate),t=this._dateAdapter.getDateNames(),i=[[]];for(let r=0,o=this._firstWeekOffset();r<e;r++,o++){o==Pa&&(i.push([]),o=0);let u=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),r+1),h=this._shouldEnableDate(u),w=this._dateAdapter.format(u,this._dateFormats.display.dateA11yLabel),k=this.dateClass?this.dateClass(u,"month"):void 0;i[i.length-1].push(new Nn(r+1,t[r],w,h,k,this._getCellCompareValue(u),u))}this._weeks.set(i)}_shouldEnableDate(e){return!!e&&(!this.minDate||this._dateAdapter.compareDate(e,this.minDate)>=0)&&(!this.maxDate||this._dateAdapter.compareDate(e,this.maxDate)<=0)&&(!this.dateFilter||this.dateFilter(e))}_getDateInCurrentMonth(e){return e&&this._hasSameMonthAndYear(e,this.activeDate)?this._dateAdapter.getDate(e):null}_hasSameMonthAndYear(e,t){return!!(e&&t&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(t)&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t))}_getCellCompareValue(e){if(e){let t=this._dateAdapter.getYear(e),i=this._dateAdapter.getMonth(e),r=this._dateAdapter.getDate(e);return new Date(t,i,r).getTime()}return null}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setRanges(e){e instanceof ye?(this._rangeStart.set(this._getCellCompareValue(e.start)),this._rangeEnd.set(this._getCellCompareValue(e.end)),this._isRange.set(!0)):(this._rangeStart.set(this._getCellCompareValue(e)),this._rangeEnd.set(this._rangeStart()),this._isRange.set(!1)),this._comparisonRangeStart.set(this._getCellCompareValue(this.comparisonStart)),this._comparisonRangeEnd.set(this._getCellCompareValue(this.comparisonEnd))}_canSelect(e){return!this.dateFilter||this.dateFilter(e)}_clearPreview(){this._previewStart.set(null),this._previewEnd.set(null)}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-month-view"]],viewQuery:function(t,i){if(t&1&&oe(dn,5),t&2){let r;O(r=R())&&(i._matCalendarBody=r.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName",activeDrag:"activeDrag"},outputs:{selectedChange:"selectedChange",_userSelection:"_userSelection",dragStarted:"dragStarted",dragEnded:"dragEnded",activeDateChange:"activeDateChange"},exportAs:["matMonthView"],features:[ee],decls:8,vars:14,consts:[["role","grid",1,"mat-calendar-table"],[1,"mat-calendar-table-header"],["scope","col"],["aria-hidden","true"],["colspan","7",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","previewChange","dragStarted","dragEnded","keyup","keydown","label","rows","todayValue","startValue","endValue","comparisonStart","comparisonEnd","previewStart","previewEnd","isRange","labelMinRequiredCells","activeCell","startDateAccessibleName","endDateAccessibleName"],[1,"cdk-visually-hidden"]],template:function(t,i){t&1&&(d(0,"table",0)(1,"thead",1)(2,"tr"),ce(3,Xd,5,2,"th",2,cs),c(),d(5,"tr",3),j(6,"th",4),c()(),d(7,"tbody",5),g("selectedValueChange",function(o){return i._dateSelected(o)})("activeDateChange",function(o){return i._updateActiveDate(o)})("previewChange",function(o){return i._previewChanged(o)})("dragStarted",function(o){return i.dragStarted.emit(o)})("dragEnded",function(o){return i._dragEnded(o)})("keyup",function(o){return i._handleCalendarBodyKeyup(o)})("keydown",function(o){return i._handleCalendarBodyKeydown(o)}),c()()),t&2&&(l(3),me(i._weekdays()),l(4),b("label",i._monthLabel())("rows",i._weeks())("todayValue",i._todayDate())("startValue",i._rangeStart())("endValue",i._rangeEnd())("comparisonStart",i._comparisonRangeStart())("comparisonEnd",i._comparisonRangeEnd())("previewStart",i._previewStart())("previewEnd",i._previewEnd())("isRange",i._isRange())("labelMinRequiredCells",3)("activeCell",i._dateAdapter.getDate(i.activeDate)-1)("startDateAccessibleName",i.startDateAccessibleName)("endDateAccessibleName",i.endDateAccessibleName))},dependencies:[dn],encapsulation:2})}return a})(),Ne=24,Ta=4,ls=(()=>{class a{_changeDetectorRef=s(Z);_dateAdapter=s(Ye,{optional:!0});_dir=s(ke,{optional:!0});_rerenderSubscription=pe.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,i=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(i,this.minDate,this.maxDate),us(this._dateAdapter,t,this._activeDate,this.minDate,this.maxDate)||this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof ye?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedYear(e)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;selectedChange=new v;yearSelected=new v;activeDateChange=new v;_matCalendarBody;_years=x([]);_todayYear=x(0);_selectedYear=x(null);constructor(){this._dateAdapter,this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Xe(null)).subscribe(()=>this._init())}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_init(){this._todayYear.set(this._dateAdapter.getYear(this._dateAdapter.today()));let t=this._dateAdapter.getYear(this._activeDate)-Tn(this._dateAdapter,this.activeDate,this.minDate,this.maxDate),i=[];for(let r=0,o=[];r<Ne;r++)o.push(t+r),o.length==Ta&&(i.push(o.map(u=>this._createCellForYear(u))),o=[]);this._years.set(i),this._changeDetectorRef.markForCheck()}_yearSelected(e){let t=e.value,i=this._dateAdapter.createDate(t,0,1),r=this._getDateFromYear(t);this.yearSelected.emit(i),this.selectedChange.emit(r)}_updateActiveDate(e){let t=e.value,i=this._activeDate;this.activeDate=this._getDateFromYear(t),this._dateAdapter.compareDate(i,this.activeDate)&&this.activeDateChange.emit(this.activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,i=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,i?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,i?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-Ta);break;case 40:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,Ta);break;case 36:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-Tn(this._dateAdapter,this.activeDate,this.minDate,this.maxDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,Ne-Tn(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)-1);break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-Ne*10:-Ne);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?Ne*10:Ne);break;case 13:case 32:this._selectionKeyPressed=!0;break;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked(),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._yearSelected({value:this._dateAdapter.getYear(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_getActiveCell(){return Tn(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)}_focusActiveCell(){this._matCalendarBody._focusActiveCell()}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_getDateFromYear(e){let t=this._dateAdapter.getMonth(this.activeDate),i=this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(e,t,1));return this._dateAdapter.createDate(e,t,Math.min(this._dateAdapter.getDate(this.activeDate),i))}_createCellForYear(e){let t=this._dateAdapter.createDate(e,0,1),i=this._dateAdapter.getYearName(t),r=this.dateClass?this.dateClass(t,"multi-year"):void 0;return new Nn(e,i,i,this._shouldEnableYear(e),r)}_shouldEnableYear(e){if(e==null||this.maxDate&&e>this._dateAdapter.getYear(this.maxDate)||this.minDate&&e<this._dateAdapter.getYear(this.minDate))return!1;if(!this.dateFilter)return!0;let t=this._dateAdapter.createDate(e,0,1);for(let i=t;this._dateAdapter.getYear(i)==e;i=this._dateAdapter.addCalendarDays(i,1))if(this.dateFilter(i))return!0;return!1}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedYear(e){if(this._selectedYear.set(null),e instanceof ye){let t=e.start||e.end;t&&this._selectedYear.set(this._dateAdapter.getYear(t))}else e&&this._selectedYear.set(this._dateAdapter.getYear(e))}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-multi-year-view"]],viewQuery:function(t,i){if(t&1&&oe(dn,5),t&2){let r;O(r=R())&&(i._matCalendarBody=r.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",activeDateChange:"activeDateChange"},exportAs:["matMultiYearView"],decls:5,vars:7,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","rows","todayValue","startValue","endValue","numCols","cellAspectRatio","activeCell"]],template:function(t,i){t&1&&(d(0,"table",0)(1,"thead",1)(2,"tr"),j(3,"th",2),c()(),d(4,"tbody",3),g("selectedValueChange",function(o){return i._yearSelected(o)})("activeDateChange",function(o){return i._updateActiveDate(o)})("keyup",function(o){return i._handleCalendarBodyKeyup(o)})("keydown",function(o){return i._handleCalendarBodyKeydown(o)}),c()()),t&2&&(l(4),b("rows",i._years())("todayValue",i._todayYear())("startValue",i._selectedYear())("endValue",i._selectedYear())("numCols",4)("cellAspectRatio",4/7)("activeCell",i._getActiveCell()))},dependencies:[dn],encapsulation:2})}return a})();function us(a,n,e,t,i){let r=a.getYear(n),o=a.getYear(e),u=ps(a,t,i);return Math.floor((r-u)/Ne)===Math.floor((o-u)/Ne)}function Tn(a,n,e,t){let i=a.getYear(n);return mc(i-ps(a,e,t),Ne)}function ps(a,n,e){let t=0;return e?t=a.getYear(e)-Ne+1:n&&(t=a.getYear(n)),t}function mc(a,n){return(a%n+n)%n}var ds=(()=>{class a{_changeDetectorRef=s(Z);_dateFormats=s(wt,{optional:!0});_dateAdapter=s(Ye,{optional:!0});_dir=s(ke,{optional:!0});_rerenderSubscription=pe.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,i=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(i,this.minDate,this.maxDate),this._dateAdapter.getYear(t)!==this._dateAdapter.getYear(this._activeDate)&&this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof ye?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedMonth(e)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;selectedChange=new v;monthSelected=new v;activeDateChange=new v;_matCalendarBody;_months=x([]);_yearLabel=x("");_todayMonth=x(null);_selectedMonth=x(null);constructor(){this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Xe(null)).subscribe(()=>this._init())}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_monthSelected(e){let t=e.value,i=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),t,1);this.monthSelected.emit(i);let r=this._getDateFromMonth(t);this.selectedChange.emit(r)}_updateActiveDate(e){let t=e.value,i=this._activeDate;this.activeDate=this._getDateFromMonth(t),this._dateAdapter.compareDate(i,this.activeDate)&&this.activeDateChange.emit(this.activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,i=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,i?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,i?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-4);break;case 40:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,4);break;case 36:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-this._dateAdapter.getMonth(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,11-this._dateAdapter.getMonth(this._activeDate));break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-10:-1);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?10:1);break;case 13:case 32:this._selectionKeyPressed=!0;break;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._monthSelected({value:this._dateAdapter.getMonth(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_init(){this._setSelectedMonth(this.selected),this._todayMonth.set(this._getMonthInCurrentYear(this._dateAdapter.today())),this._yearLabel.set(this._dateAdapter.getYearName(this.activeDate));let e=this._dateAdapter.getMonthNames("short");this._months.set([[0,1,2,3],[4,5,6,7],[8,9,10,11]].map(t=>t.map(i=>this._createCellForMonth(i,e[i])))),this._changeDetectorRef.markForCheck()}_focusActiveCell(){this._matCalendarBody._focusActiveCell()}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_getMonthInCurrentYear(e){return e&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(this.activeDate)?this._dateAdapter.getMonth(e):null}_getDateFromMonth(e){let t=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),i=this._dateAdapter.getNumDaysInMonth(t);return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,Math.min(this._dateAdapter.getDate(this.activeDate),i))}_createCellForMonth(e,t){let i=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),r=this._dateAdapter.format(i,this._dateFormats.display.monthYearA11yLabel),o=this.dateClass?this.dateClass(i,"year"):void 0;return new Nn(e,t.toLocaleUpperCase(),r,this._shouldEnableMonth(e),o)}_shouldEnableMonth(e){let t=this._dateAdapter.getYear(this.activeDate);if(e==null||this._isYearAndMonthAfterMaxDate(t,e)||this._isYearAndMonthBeforeMinDate(t,e))return!1;if(!this.dateFilter)return!0;let i=this._dateAdapter.createDate(t,e,1);for(let r=i;this._dateAdapter.getMonth(r)==e;r=this._dateAdapter.addCalendarDays(r,1))if(this.dateFilter(r))return!0;return!1}_isYearAndMonthAfterMaxDate(e,t){if(this.maxDate){let i=this._dateAdapter.getYear(this.maxDate),r=this._dateAdapter.getMonth(this.maxDate);return e>i||e===i&&t>r}return!1}_isYearAndMonthBeforeMinDate(e,t){if(this.minDate){let i=this._dateAdapter.getYear(this.minDate),r=this._dateAdapter.getMonth(this.minDate);return e<i||e===i&&t<r}return!1}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedMonth(e){e instanceof ye?this._selectedMonth.set(this._getMonthInCurrentYear(e.start)||this._getMonthInCurrentYear(e.end)):this._selectedMonth.set(this._getMonthInCurrentYear(e))}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-year-view"]],viewQuery:function(t,i){if(t&1&&oe(dn,5),t&2){let r;O(r=R())&&(i._matCalendarBody=r.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",monthSelected:"monthSelected",activeDateChange:"activeDateChange"},exportAs:["matYearView"],decls:5,vars:9,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","label","rows","todayValue","startValue","endValue","labelMinRequiredCells","numCols","cellAspectRatio","activeCell"]],template:function(t,i){t&1&&(d(0,"table",0)(1,"thead",1)(2,"tr"),j(3,"th",2),c()(),d(4,"tbody",3),g("selectedValueChange",function(o){return i._monthSelected(o)})("activeDateChange",function(o){return i._updateActiveDate(o)})("keyup",function(o){return i._handleCalendarBodyKeyup(o)})("keydown",function(o){return i._handleCalendarBodyKeydown(o)}),c()()),t&2&&(l(4),b("label",i._yearLabel())("rows",i._months())("todayValue",i._todayMonth())("startValue",i._selectedMonth())("endValue",i._selectedMonth())("labelMinRequiredCells",2)("numCols",4)("cellAspectRatio",4/7)("activeCell",i._dateAdapter.getMonth(i.activeDate)))},dependencies:[dn],encapsulation:2})}return a})(),hs=(()=>{class a{_intl=s(cn);calendar=s(Ln);_dateAdapter=s(Ye,{optional:!0});_dateFormats=s(wt,{optional:!0});_periodButtonText;_periodButtonDescription;_periodButtonLabel;_prevButtonLabel;_nextButtonLabel;constructor(){s(Oe).load(Xn);let e=s(Z);this._updateLabels(),this.calendar.stateChanges.subscribe(()=>{this._updateLabels(),e.markForCheck()})}get periodButtonText(){return this._periodButtonText}get periodButtonDescription(){return this._periodButtonDescription}get periodButtonLabel(){return this._periodButtonLabel}get prevButtonLabel(){return this._prevButtonLabel}get nextButtonLabel(){return this._nextButtonLabel}currentPeriodClicked(){this.calendar.currentView=this.calendar.currentView=="month"?"multi-year":"month"}previousClicked(){this.previousEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,-1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?-1:-Ne))}nextClicked(){this.nextEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?1:Ne))}previousEnabled(){return this.calendar.minDate?!this.calendar.minDate||!this._isSameView(this.calendar.activeDate,this.calendar.minDate):!0}nextEnabled(){return!this.calendar.maxDate||!this._isSameView(this.calendar.activeDate,this.calendar.maxDate)}_updateLabels(){let e=this.calendar,t=this._intl,i=this._dateAdapter;e.currentView==="month"?(this._periodButtonText=i.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonDescription=i.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonLabel=t.switchToMultiYearViewLabel,this._prevButtonLabel=t.prevMonthLabel,this._nextButtonLabel=t.nextMonthLabel):e.currentView==="year"?(this._periodButtonText=i.getYearName(e.activeDate),this._periodButtonDescription=i.getYearName(e.activeDate),this._periodButtonLabel=t.switchToMonthViewLabel,this._prevButtonLabel=t.prevYearLabel,this._nextButtonLabel=t.nextYearLabel):(this._periodButtonText=t.formatYearRange(...this._formatMinAndMaxYearLabels()),this._periodButtonDescription=t.formatYearRangeLabel(...this._formatMinAndMaxYearLabels()),this._periodButtonLabel=t.switchToMonthViewLabel,this._prevButtonLabel=t.prevMultiYearLabel,this._nextButtonLabel=t.nextMultiYearLabel)}_isSameView(e,t){return this.calendar.currentView=="month"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t)&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(t):this.calendar.currentView=="year"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t):us(this._dateAdapter,e,t,this.calendar.minDate,this.calendar.maxDate)}_formatMinAndMaxYearLabels(){let t=this._dateAdapter.getYear(this.calendar.activeDate)-Tn(this._dateAdapter,this.calendar.activeDate,this.calendar.minDate,this.calendar.maxDate),i=t+Ne-1,r=this._dateAdapter.getYearName(this._dateAdapter.createDate(t,0,1)),o=this._dateAdapter.getYearName(this._dateAdapter.createDate(i,0,1));return[r,o]}_periodButtonLabelId=s(_e).getId("mat-calendar-period-label-");static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-calendar-header"]],exportAs:["matCalendarHeader"],ngContentSelectors:Kd,decls:17,vars:13,consts:[[1,"mat-calendar-header"],[1,"mat-calendar-controls"],["aria-live","polite",1,"cdk-visually-hidden",3,"id"],["matButton","","type","button",1,"mat-calendar-period-button",3,"click"],["aria-hidden","true"],["viewBox","0 0 10 5","focusable","false","aria-hidden","true",1,"mat-calendar-arrow"],["points","0,0 5,5 10,0"],[1,"mat-calendar-spacer"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-previous-button",3,"click","disabled","matTooltip"],["viewBox","0 0 24 24","focusable","false","aria-hidden","true"],["d","M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-next-button",3,"click","disabled","matTooltip"],["d","M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"]],template:function(t,i){t&1&&(he(),d(0,"div",0)(1,"div",1)(2,"span",2),m(3),c(),d(4,"button",3),g("click",function(){return i.currentPeriodClicked()}),d(5,"span",4),m(6),c(),dt(),d(7,"svg",5),j(8,"polygon",6),c()(),Gi(),j(9,"div",7),Y(10),d(11,"button",8),g("click",function(){return i.previousClicked()}),dt(),d(12,"svg",9),j(13,"path",10),c()(),Gi(),d(14,"button",11),g("click",function(){return i.nextClicked()}),dt(),d(15,"svg",9),j(16,"path",12),c()()()()),t&2&&(l(2),b("id",i._periodButtonLabelId),l(),N(i.periodButtonDescription),l(),B("aria-label",i.periodButtonLabel)("aria-describedby",i._periodButtonLabelId),l(2),N(i.periodButtonText),l(),I("mat-calendar-invert",i.calendar.currentView!=="month"),l(4),b("disabled",!i.previousEnabled())("matTooltip",i.prevButtonLabel),B("aria-label",i.prevButtonLabel),l(3),b("disabled",!i.nextEnabled())("matTooltip",i.nextButtonLabel),B("aria-label",i.nextButtonLabel))},dependencies:[Ue,At,as],encapsulation:2})}return a})(),Ln=(()=>{class a{_dateAdapter=s(Ye,{optional:!0});_dateFormats=s(wt,{optional:!0});_changeDetectorRef=s(Z);_elementRef=s(F);headerComponent;_calendarHeaderPortal;_intlChanges;_moveFocusOnNextTick=!1;get startAt(){return this._startAt}set startAt(e){this._startAt=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_startAt=null;startView="month";get selected(){return this._selected}set selected(e){e instanceof ye?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedChange=new v;yearSelected=new v;monthSelected=new v;viewChanged=new v(!0);_userSelection=new v;_userDragDrop=new v;monthView;yearView;multiYearView;get activeDate(){return this._clampedActiveDate}set activeDate(e){this._clampedActiveDate=this._dateAdapter.clampDate(e,this.minDate,this.maxDate),this.stateChanges.next(),this._changeDetectorRef.markForCheck()}_clampedActiveDate;get currentView(){return this._currentView}set currentView(e){let t=this._currentView!==e?e:null;this._currentView=e,this._moveFocusOnNextTick=!0,this._changeDetectorRef.markForCheck(),t&&(this.stateChanges.next(),this.viewChanged.emit(t))}_currentView;_activeDrag=null;stateChanges=new L;constructor(){this._intlChanges=s(cn).changes.subscribe(()=>{this._changeDetectorRef.markForCheck(),this.stateChanges.next()})}ngAfterContentInit(){this._calendarHeaderPortal=new Wt(this.headerComponent||hs),this.activeDate=this.startAt||this._dateAdapter.today(),this._currentView=this.startView}ngAfterViewChecked(){this._moveFocusOnNextTick&&(this._moveFocusOnNextTick=!1,this.focusActiveCell())}ngOnDestroy(){this._intlChanges.unsubscribe(),this.stateChanges.complete()}ngOnChanges(e){let t=e.minDate&&!this._dateAdapter.sameDate(e.minDate.previousValue,e.minDate.currentValue)?e.minDate:void 0,i=e.maxDate&&!this._dateAdapter.sameDate(e.maxDate.previousValue,e.maxDate.currentValue)?e.maxDate:void 0,r=t||i||e.dateFilter;if(r&&!r.firstChange){let o=this._getCurrentViewComponent();o&&(this._elementRef.nativeElement.contains($n())&&(this._moveFocusOnNextTick=!0),this._changeDetectorRef.detectChanges(),o._init())}this.stateChanges.next()}focusActiveCell(){this._getCurrentViewComponent()?._focusActiveCell(!1)}updateTodaysDate(){this._getCurrentViewComponent()?._init()}_dateSelected(e){let t=e.value;(this.selected instanceof ye||t&&!this._dateAdapter.sameDate(t,this.selected))&&this.selectedChange.emit(t),this._userSelection.emit(e)}_yearSelectedInMultiYearView(e){this.yearSelected.emit(e)}_monthSelectedInYearView(e){this.monthSelected.emit(e)}_goToDateInView(e,t){this.activeDate=e,this.currentView=t}_dragStarted(e){this._activeDrag=e}_dragEnded(e){this._activeDrag&&(e.value&&this._userDragDrop.emit(e),this._activeDrag=null)}_getCurrentViewComponent(){return this.monthView||this.yearView||this.multiYearView}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-calendar"]],viewQuery:function(t,i){if(t&1&&oe(ss,5)(ds,5)(ls,5),t&2){let r;O(r=R())&&(i.monthView=r.first),O(r=R())&&(i.yearView=r.first),O(r=R())&&(i.multiYearView=r.first)}},hostAttrs:[1,"mat-calendar"],inputs:{headerComponent:"headerComponent",startAt:"startAt",startView:"startView",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",monthSelected:"monthSelected",viewChanged:"viewChanged",_userSelection:"_userSelection",_userDragDrop:"_userDragDrop"},exportAs:["matCalendar"],features:[K([dc]),ee],decls:5,vars:2,consts:[[3,"cdkPortalOutlet"],["cdkMonitorSubtreeFocus","","tabindex","-1",1,"mat-calendar-content"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","_userSelection","dragStarted","dragEnded","activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDateChange","monthSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","yearSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"]],template:function(t,i){if(t&1&&(Ie(0,Qd,0,0,"ng-template",0),d(1,"div",1),y(2,Zd,1,11,"mat-month-view",2)(3,Jd,1,6,"mat-year-view",3)(4,ec,1,6,"mat-multi-year-view",3),c()),t&2){let r;b("cdkPortalOutlet",i._calendarHeaderPortal),l(2),C((r=i.currentView)==="month"?2:r==="year"?3:r==="multi-year"?4:-1)}},dependencies:[va,_r,ss,ds,ls],styles:[`.mat-calendar {
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
`],encapsulation:2})}return a})();var uc=(()=>{class a{_elementRef=s(F);_animationsDisabled=we();_changeDetectorRef=s(Z);_globalModel=s(Si);_dateAdapter=s(Ye);_ngZone=s(H);_rangeSelectionStrategy=s(ms,{optional:!0});_stateChanges;_model;_eventCleanups;_animationFallback;_calendar;color;datepicker;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;_isAbove=!1;_animationDone=new L;_isAnimating=!1;_closeButtonText;_closeButtonFocused=!1;_actionsPortal=null;_dialogLabelId=null;constructor(){if(s(Oe).load(Xn),this._closeButtonText=s(cn).closeCalendarLabel,!this._animationsDisabled){let e=this._elementRef.nativeElement,t=s($);this._eventCleanups=this._ngZone.runOutsideAngular(()=>[t.listen(e,"animationstart",this._handleAnimationEvent),t.listen(e,"animationend",this._handleAnimationEvent),t.listen(e,"animationcancel",this._handleAnimationEvent)])}}ngAfterViewInit(){this._stateChanges=this.datepicker.stateChanges.subscribe(()=>{this._changeDetectorRef.markForCheck()}),this._calendar.focusActiveCell()}ngOnDestroy(){clearTimeout(this._animationFallback),this._eventCleanups?.forEach(e=>e()),this._stateChanges?.unsubscribe(),this._animationDone.complete()}_handleUserSelection(e){let t=this._model.selection,i=e.value,r=t instanceof ye;if(r&&this._rangeSelectionStrategy){let o=this._rangeSelectionStrategy.selectionFinished(i,t,e.event);this._model.updateSelection(o,this)}else i&&(r||!this._dateAdapter.sameDate(i,t))&&this._model.add(i);(!this._model||this._model.isComplete())&&!this._actionsPortal&&this.datepicker.close()}_handleUserDragDrop(e){this._model.updateSelection(e.value,this)}_startExitAnimation(){this._elementRef.nativeElement.classList.add("mat-datepicker-content-exit"),this._animationsDisabled?this._animationDone.next():(clearTimeout(this._animationFallback),this._animationFallback=setTimeout(()=>{this._isAnimating||this._animationDone.next()},200))}_handleAnimationEvent=e=>{let t=this._elementRef.nativeElement;e.target!==t||!e.animationName.startsWith("_mat-datepicker-content")||(clearTimeout(this._animationFallback),this._isAnimating=e.type==="animationstart",t.classList.toggle("mat-datepicker-content-animating",this._isAnimating),this._isAnimating||this._animationDone.next())};_getSelected(){return this._model.selection}_applyPendingSelection(){this._model!==this._globalModel&&this._globalModel.updateSelection(this._model.selection,this)}_assignActions(e,t){this._model=e?this._globalModel.clone():this._globalModel,this._actionsPortal=e,t&&this._changeDetectorRef.detectChanges()}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-datepicker-content"]],viewQuery:function(t,i){if(t&1&&oe(Ln,5),t&2){let r;O(r=R())&&(i._calendar=r.first)}},hostAttrs:[1,"mat-datepicker-content"],hostVars:6,hostBindings:function(t,i){t&2&&(Je(i.color?"mat-"+i.color:""),I("mat-datepicker-content-touch",i.datepicker.touchUi)("mat-datepicker-content-animations-enabled",!i._animationsDisabled))},inputs:{color:"color"},exportAs:["matDatepickerContent"],decls:5,vars:26,consts:[["cdkTrapFocus","","role","dialog",1,"mat-datepicker-content-container"],[3,"yearSelected","monthSelected","viewChanged","_userSelection","_userDragDrop","id","startAt","startView","minDate","maxDate","dateFilter","headerComponent","selected","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName"],[3,"cdkPortalOutlet"],["type","button","matButton","elevated",1,"mat-datepicker-close-button",3,"focus","blur","click","color"]],template:function(t,i){t&1&&(d(0,"div",0)(1,"mat-calendar",1),g("yearSelected",function(o){return i.datepicker._selectYear(o)})("monthSelected",function(o){return i.datepicker._selectMonth(o)})("viewChanged",function(o){return i.datepicker._viewChanged(o)})("_userSelection",function(o){return i._handleUserSelection(o)})("_userDragDrop",function(o){return i._handleUserDragDrop(o)}),c(),Ie(2,tc,0,0,"ng-template",2),d(3,"button",3),g("focus",function(){return i._closeButtonFocused=!0})("blur",function(){return i._closeButtonFocused=!1})("click",function(){return i.datepicker.close()}),m(4),c()()),t&2&&(I("mat-datepicker-content-container-with-custom-header",i.datepicker.calendarHeaderComponent)("mat-datepicker-content-container-with-actions",i._actionsPortal),B("aria-modal",!0)("aria-labelledby",i._dialogLabelId??void 0),l(),Je(i.datepicker.panelClass),b("id",i.datepicker.id)("startAt",i.datepicker.startAt)("startView",i.datepicker.startView)("minDate",i.datepicker._getMinDate())("maxDate",i.datepicker._getMaxDate())("dateFilter",i.datepicker._getDateFilter())("headerComponent",i.datepicker.calendarHeaderComponent)("selected",i._getSelected())("dateClass",i.datepicker.dateClass)("comparisonStart",i.comparisonStart)("comparisonEnd",i.comparisonEnd)("startDateAccessibleName",i.startDateAccessibleName)("endDateAccessibleName",i.endDateAccessibleName),l(),b("cdkPortalOutlet",i._actionsPortal),l(),I("cdk-visually-hidden",!i._closeButtonFocused),b("color",i.color||"primary"),l(),N(i._closeButtonText))},dependencies:[br,Ln,va,Ue],styles:[`@keyframes _mat-datepicker-content-dropdown-enter {
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
`],encapsulation:2})}return a})();var pc=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["","matDatepickerToggleIcon",""]]})}return a})(),hc=(()=>{class a{_intl=s(cn);_changeDetectorRef=s(Z);_stateChanges=pe.EMPTY;datepicker;tabIndex=null;ariaLabel;get disabled(){return this._disabled===void 0&&this.datepicker?this.datepicker.disabled:!!this._disabled}set disabled(e){this._disabled=e}_disabled;disableRipple=!1;_customIcon;_button;constructor(){let e=s(new Ct("tabindex"),{optional:!0}),t=Number(e);this.tabIndex=t||t===0?t:null}ngOnChanges(e){e.datepicker&&this._watchStateChanges()}ngOnDestroy(){this._stateChanges.unsubscribe()}ngAfterContentInit(){this._watchStateChanges()}_open(e){this.datepicker&&!this.disabled&&(this.datepicker.open(),e.stopPropagation())}_watchStateChanges(){let e=this.datepicker?this.datepicker.stateChanges:Xt(),t=this.datepicker&&this.datepicker.datepickerInput?this.datepicker.datepickerInput.stateChanges:Xt(),i=this.datepicker?lt(this.datepicker.openedStream,this.datepicker.closedStream):Xt();this._stateChanges.unsubscribe(),this._stateChanges=lt(this._intl.changes,e,t,i).subscribe(()=>this._changeDetectorRef.markForCheck())}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-datepicker-toggle"]],contentQueries:function(t,i,r){if(t&1&&yt(r,pc,5),t&2){let o;O(o=R())&&(i._customIcon=o.first)}},viewQuery:function(t,i){if(t&1&&oe(nc,5),t&2){let r;O(r=R())&&(i._button=r.first)}},hostAttrs:[1,"mat-datepicker-toggle"],hostVars:8,hostBindings:function(t,i){t&1&&g("click",function(o){return i._open(o)}),t&2&&(B("tabindex",null)("data-mat-calendar",i.datepicker?i.datepicker.id:null),I("mat-datepicker-toggle-active",i.datepicker&&i.datepicker.opened)("mat-accent",i.datepicker&&i.datepicker.color==="accent")("mat-warn",i.datepicker&&i.datepicker.color==="warn"))},inputs:{datepicker:[0,"for","datepicker"],tabIndex:"tabIndex",ariaLabel:[0,"aria-label","ariaLabel"],disabled:[2,"disabled","disabled",S],disableRipple:"disableRipple"},exportAs:["matDatepickerToggle"],features:[ee],ngContentSelectors:ac,decls:4,vars:7,consts:[["button",""],["matIconButton","","type","button",3,"tabIndex","disabled","disableRipple"],["viewBox","0 0 24 24","width","24px","height","24px","fill","currentColor","focusable","false","aria-hidden","true",1,"mat-datepicker-toggle-default-icon"],["d","M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"]],template:function(t,i){t&1&&(he(ic),d(0,"button",1,0),y(2,rc,2,0,":svg:svg",2),Y(3),c()),t&2&&(b("tabIndex",i.disabled?-1:i.tabIndex)("disabled",i.disabled)("disableRipple",i.disableRipple),B("aria-haspopup",i.datepicker?"dialog":null)("aria-label",i.ariaLabel||i._intl.openCalendarLabel)("aria-expanded",i.datepicker?i.datepicker.opened:null),l(2),C(i._customIcon?-1:2))},dependencies:[At],styles:[`.mat-datepicker-toggle {
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
`],encapsulation:2})}return a})();var fs=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({providers:[cn],imports:[Ge,Ut,yr,bi,uc,hc,hs,ge,gt]})}return a})();var _c=["leftCal"],gc=["rightCal"];function bc(a,n){if(a&1){let e=ne();d(0,"div",8)(1,"div",9)(2,"div",10)(3,"div",11)(4,"button",12),g("click",function(){P(e);let i=p();return T(i.goPrev())}),d(5,"span",13),m(6,"chevron_left"),c()(),d(7,"span",14),m(8),c(),j(9,"span",15),d(10,"button",16),g("click",function(){P(e);let i=p();return T(i.goNext())}),d(11,"span",13),m(12,"chevron_right"),c()()(),d(13,"mat-calendar",17,1),g("selectedChange",function(i){P(e);let r=p();return T(r.onDateClicked(i))}),c()(),d(15,"div",10)(16,"div",11),j(17,"span",15),d(18,"span",14),m(19),c(),d(20,"button",18),g("click",function(){P(e);let i=p();return T(i.goNext())}),d(21,"span",13),m(22,"chevron_right"),c()()(),d(23,"mat-calendar",17,2),g("selectedChange",function(i){P(e);let r=p();return T(r.onDateClicked(i))}),c()()()()}if(a&2){let e=p();l(8),N(e.monthLabel(e.leftMonth)),l(5),b("startAt",e.leftMonth)("selected",e.selectedRange),l(6),N(e.monthLabel(e.rightMonth)),l(4),b("startAt",e.rightMonth)("selected",e.selectedRange)}}function _s(a){return new Date(a.getFullYear(),a.getMonth(),1)}function gs(a,n){return new Date(a.getFullYear(),a.getMonth()+n,1)}var Ei=class a{start=null;end=null;placeholder="\u9078\u64C7\u65E5\u671F\u7BC4\u570D";rangeSelected=new v;leftCal;rightCal;isOpen=!1;leftMonth=_s(new Date);selectedRange=new ye(null,null);pendingStart=null;pendingEnd=null;ngOnChanges(n){(n.start||n.end)&&(this.pendingStart=this.start,this.pendingEnd=this.end,this.selectedRange=new ye(this.start,this.end),this.start&&(this.leftMonth=_s(this.start)))}get rightMonth(){return gs(this.leftMonth,1)}get displayValue(){return!this.start||!this.end?"":`${this.formatDate(this.start)} - ${this.formatDate(this.end)}`}monthLabel(n){return`${n.getFullYear()}\u5E74${n.getMonth()+1}\u6708`}open(){this.isOpen=!0}close(){this.isOpen=!1}goPrev(){this.shiftMonths(-1)}goNext(){this.shiftMonths(1)}onDateClicked(n){n&&(!this.pendingStart||this.pendingEnd?(this.pendingStart=n,this.pendingEnd=null):n<this.pendingStart?this.pendingStart=n:this.pendingEnd=n,this.selectedRange=new ye(this.pendingStart,this.pendingEnd),this.pendingStart&&this.pendingEnd&&(this.rangeSelected.emit({start:this.pendingStart,end:this.pendingEnd}),this.isOpen=!1))}shiftMonths(n){this.leftMonth=gs(this.leftMonth,n),this.leftCal&&(this.leftCal.activeDate=this.leftMonth),this.rightCal&&(this.rightCal.activeDate=this.rightMonth)}formatDate(n){let e=t=>String(t).padStart(2,"0");return`${n.getFullYear()}/${e(n.getMonth()+1)}/${e(n.getDate())}`}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-dual-month-range-picker"]],viewQuery:function(e,t){if(e&1&&oe(_c,5)(gc,5),e&2){let i;O(i=R())&&(t.leftCal=i.first),O(i=R())&&(t.rightCal=i.first)}},inputs:{start:"start",end:"end",placeholder:"placeholder"},outputs:{rangeSelected:"rangeSelected"},features:[ee],decls:9,vars:5,consts:[["origin","cdkOverlayOrigin"],["leftCal",""],["rightCal",""],["cdkOverlayOrigin","",1,"block","w-full"],["appearance","fill",1,"w-full",3,"click"],["matInput","","readonly","",3,"value","placeholder"],["matIconSuffix","","aria-hidden","true",1,"material-symbols-rounded"],["cdkConnectedOverlay","","cdkConnectedOverlayBackdropClass","cdk-overlay-transparent-backdrop",3,"backdropClick","detach","cdkConnectedOverlayOrigin","cdkConnectedOverlayOpen","cdkConnectedOverlayHasBackdrop"],[1,"dual-calendar-panel"],[1,"calendars-row"],[1,"calendar-pane"],[1,"month-head"],["type","button","mat-icon-button","","aria-label","\u4E0A\u500B\u6708",3,"click"],["aria-hidden","true",1,"material-symbols-rounded"],[1,"month-label"],[1,"head-spacer"],["type","button","mat-icon-button","","aria-label","\u4E0B\u500B\u6708",1,"nav-next-compact",3,"click"],[3,"selectedChange","startAt","selected"],["type","button","mat-icon-button","","aria-label","\u4E0B\u500B\u6708",3,"click"]],template:function(e,t){if(e&1&&(d(0,"div",3,0)(2,"mat-form-field",4),g("click",function(){return t.open()}),d(3,"mat-label"),m(4,"\u79DF\u671F"),c(),j(5,"input",5),d(6,"span",6),m(7,"calendar_month"),c()()(),Ie(8,bc,25,6,"ng-template",7),g("backdropClick",function(){return t.close()})("detach",function(){return t.close()})),e&2){let i=Ze(1);l(5),b("value",t.displayValue)("placeholder",t.placeholder),l(3),b("cdkConnectedOverlayOrigin",i)("cdkConnectedOverlayOpen",t.isOpen)("cdkConnectedOverlayHasBackdrop",!0)}},dependencies:[Ut,sn,Vt,Ge,At,Me,We,Te,kn,rt,at,fs,Ln],styles:[".dual-calendar-panel[_ngcontent-%COMP%]{background:var(--mat-sys-surface-container-high, #fff);border-radius:12px;box-shadow:0 8px 24px #00000026;padding:8px 12px 12px;max-width:calc(100vw - 24px);box-sizing:border-box}.calendars-row[_ngcontent-%COMP%]{display:flex;gap:8px}.calendar-pane[_ngcontent-%COMP%]{width:280px;max-width:100%}.nav-next-compact[_ngcontent-%COMP%]{display:none}@media(max-width:640px){.dual-calendar-panel[_ngcontent-%COMP%]{width:calc(100vw - 24px)}.calendars-row[_ngcontent-%COMP%] > .calendar-pane[_ngcontent-%COMP%] + .calendar-pane[_ngcontent-%COMP%]{display:none}.calendar-pane[_ngcontent-%COMP%]{width:100%}.month-head[_ngcontent-%COMP%]   .head-spacer[_ngcontent-%COMP%]{display:none}.nav-next-compact[_ngcontent-%COMP%]{display:inline-flex}}.month-head[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px}.month-head[_ngcontent-%COMP%]   .month-label[_ngcontent-%COMP%]{flex:1;text-align:center;font-weight:500}.month-head[_ngcontent-%COMP%]   .head-spacer[_ngcontent-%COMP%]{width:40px;flex:none}.dual-calendar-panel[_ngcontent-%COMP%]     .mat-calendar-header{display:none}.dual-calendar-panel[_ngcontent-%COMP%]     .mat-calendar-body-label{opacity:0}"]})};var vc=(a,n)=>n.value;function yc(a,n){if(a&1&&(d(0,"mat-option",5),m(1),c()),a&2){let e=n.$implicit;b("value",e.value),l(),N(e.label)}}var Ai=a=>{let n=new Date;return n.setHours(a,0,0,0),n},Cc=[{value:"scooter",label:"\u6A5F\u8ECA"},{value:"car",label:"\u6C7D\u8ECA"}],Oi=class a{dateRange=null;dateRangeChange=new v;locations=ns;vehicleGroups=Cc;vehicleGroup="car";startDate=null;endDate=null;startTime=Ai(9);endTime=Ai(9);pickupLocation=ln;returnLocation=ln;returnLocationTouched=!1;ngOnChanges(){if(this.dateRange){let n=new Date(this.dateRange.startDateTime),e=new Date(this.dateRange.endDateTime);this.startDate=n,this.endDate=e,this.startTime=n,this.endTime=e,this.pickupLocation=this.dateRange.pickupLocation,this.returnLocation=this.dateRange.returnLocation,this.vehicleGroup=this.dateRange.vehicleGroup??"car",this.returnLocationTouched=!!this.dateRange.returnLocation&&this.dateRange.returnLocation!==this.dateRange.pickupLocation}}get isValid(){return!!(this.startDate&&this.endDate)}onVehicleGroupChange(n){this.vehicleGroup=n}onPickupLocationChange(n){this.pickupLocation=n,this.returnLocationTouched||(this.returnLocation=n)}onReturnLocationChange(n){this.returnLocation=n,this.returnLocationTouched=!0}onRangeSelected(n){this.startDate=n.start,this.endDate=n.end}confirm(){this.isValid&&this.dateRangeChange.emit({startDateTime:this.combine(this.startDate,this.startTime??Ai(9)),endDateTime:this.combine(this.endDate,this.endTime??Ai(9)),pickupLocation:this.pickupLocation,returnLocation:this.returnLocation,vehicleGroup:this.vehicleGroup})}combine(n,e){let t=new Date(n);t.setHours(e.getHours(),e.getMinutes(),0,0);let i=r=>String(r).padStart(2,"0");return`${t.getFullYear()}-${i(t.getMonth()+1)}-${i(t.getDate())}T${i(t.getHours())}:${i(t.getMinutes())}`}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-date-step"]],inputs:{dateRange:"dateRange"},outputs:{dateRangeChange:"dateRangeChange"},features:[ee],decls:27,vars:10,consts:[["startPicker",""],["endPicker",""],[1,"date-step"],["appearance","fill",1,"md:max-w-42"],[3,"ngModelChange","ngModel"],[3,"value"],[1,"min-w-80","xl:max-w-80",3,"rangeSelected","start","end"],[1,"ui-field-group","xl:max-w-82"],["appearance","fill"],["matInput","",3,"ngModelChange","matTimepicker","ngModel"],["matSuffix","","aria-label","\u958B\u555F\u53D6\u8ECA\u6642\u9593\u9078\u64C7\u5668",3,"for"],["matSuffix","","aria-label","\u958B\u555F\u9084\u8ECA\u6642\u9593\u9078\u64C7\u5668",3,"for"],[1,"actions","w-full","xl:w-fit"],["matButton","filled",1,"min-h-14","w-full","xl:w-auto",3,"click","disabled"],["aria-hidden","true",1,"material-symbols-rounded"]],template:function(e,t){if(e&1){let i=ne();d(0,"div",2)(1,"mat-form-field",3)(2,"mat-label"),m(3,"\u8ECA\u8F1B\u985E\u578B"),c(),d(4,"mat-select",4),g("ngModelChange",function(o){return t.onVehicleGroupChange(o)}),ce(5,yc,2,2,"mat-option",5,vc),c(),Ve(),c(),d(7,"app-dual-month-range-picker",6),g("rangeSelected",function(o){return t.onRangeSelected(o)}),c(),d(8,"div",7)(9,"mat-form-field",8)(10,"mat-label"),m(11,"\u53D6\u8ECA\u6642\u9593"),c(),d(12,"input",9),je("ngModelChange",function(o){return P(i),He(t.startTime,o)||(t.startTime=o),T(o)}),c(),Ve(),j(13,"mat-timepicker-toggle",10)(14,"mat-timepicker",null,0),c(),d(16,"mat-form-field",8)(17,"mat-label"),m(18,"\u9084\u8ECA\u6642\u9593"),c(),d(19,"input",9),je("ngModelChange",function(o){return P(i),He(t.endTime,o)||(t.endTime=o),T(o)}),c(),Ve(),j(20,"mat-timepicker-toggle",11)(21,"mat-timepicker",null,1),c()(),d(23,"div",12)(24,"button",13),g("click",function(){return t.confirm()}),d(25,"span",14),m(26,"search"),c()()()()}if(e&2){let i=Ze(15),r=Ze(22);l(4),b("ngModel",t.vehicleGroup),Fe(),l(),me(t.vehicleGroups),l(2),b("start",t.startDate)("end",t.endDate),l(5),b("matTimepicker",i),ze("ngModel",t.startTime),Fe(),l(),b("for",i),l(6),b("matTimepicker",r),ze("ngModel",t.endTime),Fe(),l(),b("for",r),l(4),b("disabled",!t.isValid)}},dependencies:[Et,it,St,_t,Me,We,Te,kn,rt,at,Qo,Ko,kt,ts,Sa,es,Ea,Ge,Ue,Ei],styles:[`.date-step[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:0 8px}.date-step[_ngcontent-%COMP%]   app-dual-month-range-picker[_ngcontent-%COMP%], .date-step[_ngcontent-%COMP%]   .ui-field-group[_ngcontent-%COMP%], .date-step[_ngcontent-%COMP%]   mat-form-field[_ngcontent-%COMP%]{flex:auto}@media(width>=768px){.date-step[_ngcontent-%COMP%]{flex-direction:row;flex-wrap:wrap}}.actions[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;margin-bottom:1rem}
`]})};var xc=(a,n)=>n.id;function Dc(a,n){a&1&&(f(0,"p",1),m(1,"\u8ACB\u5148\u9078\u64C7\u79DF\u671F\u4EE5\u67E5\u770B\u53EF\u79DF\u8ECA\u8F1B\u3002"),_())}function wc(a,n){if(a&1&&Ae(0,"img",6),a&2){let e=p().$implicit;De("src",e.imageUrl,Ja)("alt",e.brand+" "+e.model)}}function kc(a,n){if(a&1&&(f(0,"span",7),m(1),_()),a&2){let e=p().$implicit,t=p();l(),E(" ",t.categoryIcon(e)," ")}}function Mc(a,n){if(a&1&&(f(0,"li")(1,"span",19),m(2,"airline_seat_recline_normal"),_(),m(3),_()),a&2){let e=p().$implicit;l(3),E(" ",e.seats,"\u4EBA\u5EA7 ")}}function Sc(a,n){if(a&1&&(f(0,"li")(1,"span",19),m(2,"luggage"),_(),m(3),_()),a&2){let e=p().$implicit;l(3),E(" ",e.luggage,"\u4EF6\u884C\u674E ")}}function Ec(a,n){a&1&&(f(0,"li")(1,"span",19),m(2,"ac_unit"),_(),m(3," \u7A7A\u8ABF "),_())}function Ac(a,n){if(a&1&&(f(0,"li")(1,"span",20),m(2),_(),m(3),_()),a&2){let e=p().$implicit,t=p();l(2),N(t.transmissionMark(e)),l(),E(" ",t.transmissionLabel(e)," ")}}function Oc(a,n){a&1&&(f(0,"span",14),m(1,"\u7ACB\u5373\u78BA\u8A8D"),_())}function Rc(a,n){a&1&&(f(0,"p",17),m(1,"\u66AB\u7121\u5B9A\u50F9"),_())}function Vc(a,n){if(a&1&&(f(0,"p",21),m(1),qi(2,"number"),f(3,"span",22),m(4,"\xA0/ \u5929"),_()(),f(5,"p",23),m(6),qi(7,"number"),_()),a&2){let e=p().$implicit,t=p();l(),E(" NT$ ",Ui(2,2,t.dailyPrice(e))),l(5),E("\u7E3D\u8A08 NT$ ",Ui(7,4,t.totalPrice(e)))}}function Fc(a,n){if(a&1){let e=ne();f(0,"article",4),Bt("click",function(){let i=P(e).$implicit,r=p();return T(r.select(i))})("keydown.enter",function(){let i=P(e).$implicit,r=p();return T(r.select(i))}),f(1,"div",5),y(2,wc,1,2,"img",6)(3,kc,2,1,"span",7),_(),f(4,"div",8)(5,"p",9),m(6),_(),f(7,"h4",10),m(8),f(9,"span",11),m(10," \u6216\u540C\u7D1A "),f(11,"span",12),m(12,"info"),_()()(),f(13,"ul",13),y(14,Mc,4,1,"li"),y(15,Sc,4,1,"li"),y(16,Ec,4,0,"li"),y(17,Ac,4,2,"li"),_(),y(18,Oc,2,0,"span",14),_(),f(19,"div",15)(20,"div",16),y(21,Rc,2,0,"p",17)(22,Vc,8,6),_(),f(23,"button",18),Bt("click",function(i){let r=P(e).$implicit,o=p();return i.stopPropagation(),T(o.select(r))}),f(24,"span",19),m(25),_()()()()}if(a&2){let e=n.$implicit,t=p();I("selected",t.selectedVehicle?.id===e.id)("unpriced",t.isUnpriced(e)),l(2),C(e.imageUrl?2:3),l(4),N(t.classLabel(e)),l(2),Gn(" ",e.brand," ",e.model," ",e.year," edition "),l(6),C(e.seats?14:-1),l(),C(e.luggage?15:-1),l(),C(e.hasAirConditioner?16:-1),l(),C(e.transmission?17:-1),l(),C(e.instantConfirm?18:-1),l(3),C(t.isUnpriced(e)?21:22),l(2),De("disabled",t.isUnpriced(e)),B("aria-label",t.selectedVehicle?.id===e.id?"\u5DF2\u9078\u64C7 "+e.brand+" "+e.model:"\u9078\u64C7 "+e.brand+" "+e.model),l(2),E(" ",t.selectedVehicle?.id===e.id?"check":"chevron_right"," ")}}var Ic={car:"\u6C7D\u8ECA",scooter:"\u6A5F\u8ECA",ev:"\u96FB\u52D5\u8ECA"},Pc={car:"directions_car",scooter:"two_wheeler",ev:"electric_moped"},Ri=class a{_vehicles=x([]);set vehicles(n){this._vehicles.set(n??[])}get vehicles(){return this._vehicles()}selectedVehicle=null;priceForVehicle=()=>null;days=1;vehicleSelect=new v;select(n){this.priceForVehicle(n)!==null&&this.vehicleSelect.emit(n)}isUnpriced(n){return this.priceForVehicle(n)===null}dailyPrice(n){let e=this.priceForVehicle(n);return e===null?null:Math.round(e/Math.max(1,this.days))}totalPrice(n){return this.priceForVehicle(n)}classLabel(n){return n.classLabel??Ic[n.category]}categoryIcon(n){return Pc[n.category]}transmissionLabel(n){return n.transmission==="manual"?"\u624B\u6392":"\u81EA\u6392"}transmissionMark(n){return n.transmission==="manual"?"M":"A"}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-vehicle-step"]],inputs:{vehicles:"vehicles",selectedVehicle:"selectedVehicle",priceForVehicle:"priceForVehicle",days:"days"},outputs:{vehicleSelect:"vehicleSelect"},decls:5,vars:1,consts:[[1,"vehicle-step"],[1,"empty-hint"],[1,"vehicle-cards"],["role","button","tabindex","0",1,"vehicle-card",3,"selected","unpriced"],["role","button","tabindex","0",1,"vehicle-card",3,"click","keydown.enter"],[1,"v-media"],[3,"src","alt"],["aria-hidden","true",1,"material-symbols-rounded","v-media__placeholder"],[1,"v-body"],[1,"v-class"],[1,"v-title"],[1,"v-similar"],["title","\u5BE6\u969B\u8ECA\u8F1B\u4EE5\u73FE\u5834\u914D\u8ECA\u70BA\u6E96\uFF0C\u5C07\u63D0\u4F9B\u540C\u7B49\u7D1A\u6216\u4EE5\u4E0A\u8ECA\u6B3E","aria-label","\u5BE6\u969B\u8ECA\u8F1B\u4EE5\u73FE\u5834\u914D\u8ECA\u70BA\u6E96\uFF0C\u5C07\u63D0\u4F9B\u540C\u7B49\u7D1A\u6216\u4EE5\u4E0A\u8ECA\u6B3E",1,"material-symbols-rounded","v-info"],[1,"v-specs"],[1,"v-badge"],[1,"v-price"],[1,"v-price__main"],[1,"v-amount","v-amount--none"],["type","button",1,"v-cta",3,"click","disabled"],["aria-hidden","true",1,"material-symbols-rounded"],["aria-hidden","true",1,"v-mark"],[1,"v-amount"],[1,"v-unit"],[1,"v-total"]],template:function(e,t){e&1&&(f(0,"div",0),y(1,Dc,2,0,"p",1),f(2,"div",2),ce(3,Fc,26,18,"article",3,xc),_()()),e&2&&(l(),C(t.vehicles.length===0?1:-1),l(2),me(t.vehicles))},dependencies:[pr],styles:['@charset "UTF-8";.vehicle-step[_ngcontent-%COMP%]{padding:16px 0}.vehicle-step[_ngcontent-%COMP%]   .empty-hint[_ngcontent-%COMP%]{color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .vehicle-cards[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:12px}.vehicle-step[_ngcontent-%COMP%]   .vehicle-card[_ngcontent-%COMP%]{display:grid;grid-template-columns:140px minmax(0,1fr) 200px;align-items:stretch;gap:16px;padding:16px;cursor:pointer;background:var(--mat-sys-surface-container-lowest, #fff);border:1px solid var(--mat-sys-outline-variant);border-radius:var(--mat-sys-corner-medium, 12px);transition:border-color .15s ease,box-shadow .15s ease}.vehicle-step[_ngcontent-%COMP%]   .vehicle-card[_ngcontent-%COMP%]:not(.unpriced):hover{border-color:var(--mat-sys-primary);box-shadow:var(--mat-sys-level1)}.vehicle-step[_ngcontent-%COMP%]   .vehicle-card.selected[_ngcontent-%COMP%]{border-color:var(--mat-sys-primary);box-shadow:0 0 0 1px var(--mat-sys-primary) inset}.vehicle-step[_ngcontent-%COMP%]   .vehicle-card.unpriced[_ngcontent-%COMP%]{cursor:not-allowed;opacity:.55}.vehicle-step[_ngcontent-%COMP%]   .v-media[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;min-width:0}.vehicle-step[_ngcontent-%COMP%]   .v-media[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:100%;height:100%;max-height:92px;object-fit:contain}.vehicle-step[_ngcontent-%COMP%]   .v-media__placeholder[_ngcontent-%COMP%]{font-size:56px;line-height:1;color:var(--mat-sys-on-surface-variant);opacity:.5}.vehicle-step[_ngcontent-%COMP%]   .v-body[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0}.vehicle-step[_ngcontent-%COMP%]   .v-class[_ngcontent-%COMP%]{margin:0;font-size:.8125rem;font-weight:600;color:var(--mat-sys-primary);white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-title[_ngcontent-%COMP%]{margin:0;font-size:1.0625rem;font-weight:700;line-height:1.3;color:var(--mat-sys-on-surface)}.vehicle-step[_ngcontent-%COMP%]   .v-similar[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:2px;margin-left:4px;font-size:.8125rem;font-weight:400;color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .v-info[_ngcontent-%COMP%]{font-size:15px;line-height:1;cursor:help}.vehicle-step[_ngcontent-%COMP%]   .v-specs[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin:2px 0 0;padding:0;list-style:none;font-size:.8125rem;color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .v-specs[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-specs[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:17px;line-height:1}.vehicle-step[_ngcontent-%COMP%]   .v-mark[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border:1px solid currentColor;border-radius:999px;font-size:10px;font-weight:700;line-height:1}.vehicle-step[_ngcontent-%COMP%]   .v-badge[_ngcontent-%COMP%]{display:inline-flex;align-items:center;flex-shrink:0;margin-top:2px;padding:2px 8px;border-radius:4px;background:var(--app-positive-bg, #e6f4ea);color:var(--app-positive-fg, #1e7b40);font-size:.75rem;font-weight:600;white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-price[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto 1fr;align-items:center;column-gap:12px;padding-left:16px;border-left:1px solid var(--mat-sys-outline-variant);text-align:right}.vehicle-step[_ngcontent-%COMP%]   .v-amount[_ngcontent-%COMP%]{margin:0;font-size:1.375rem;font-weight:700;line-height:1.2;color:var(--mat-sys-on-surface);white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-amount--none[_ngcontent-%COMP%]{font-size:.9375rem;font-weight:600;color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .v-unit[_ngcontent-%COMP%]{font-size:.8125rem;font-weight:400;color:var(--mat-sys-on-surface-variant)}.vehicle-step[_ngcontent-%COMP%]   .v-total[_ngcontent-%COMP%]{margin:2px 0 0;font-size:.75rem;color:var(--mat-sys-on-surface-variant);white-space:nowrap}.vehicle-step[_ngcontent-%COMP%]   .v-cta[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;flex-shrink:0;padding:0;border:none;border-radius:var(--mat-sys-corner-small, 8px);background:var(--mat-sys-primary);color:var(--mat-sys-on-primary);cursor:pointer;transition:filter .15s ease}.vehicle-step[_ngcontent-%COMP%]   .v-cta[_ngcontent-%COMP%]   .material-symbols-rounded[_ngcontent-%COMP%]{font-size:24px;line-height:1}.vehicle-step[_ngcontent-%COMP%]   .v-cta[_ngcontent-%COMP%]:hover:not(:disabled){filter:brightness(1.08)}.vehicle-step[_ngcontent-%COMP%]   .v-cta[_ngcontent-%COMP%]:disabled{cursor:not-allowed;background:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface-variant)}@media(max-width:720px){.vehicle-step[_ngcontent-%COMP%]   .vehicle-card[_ngcontent-%COMP%]{grid-template-columns:96px minmax(0,1fr);gap:12px}.vehicle-step[_ngcontent-%COMP%]   .v-price[_ngcontent-%COMP%]{grid-column:1/-1;grid-template-rows:auto auto;padding-left:0;padding-top:12px;border-left:none;border-top:1px solid var(--mat-sys-outline-variant);text-align:left}}']})};var mn=class a{catalog=s(tt);daysBetween(n,e){if(!n||!e)return 0;let t=new Date(e+"T00:00:00").getTime()-new Date(n+"T00:00:00").getTime();return Math.max(0,Math.round(t/864e5))}vehicleTotal(n,e){if(!e.startDate||!e.endDate||!this.catalog.planForCategory(n.category))return null;try{return this.catalog.price({category:n.category,startDate:e.startDate,endDate:e.endDate,addOns:[],partnerDiscountPercent:e.partnerDiscountPercent}).total}catch(t){return console.error("[QuoteService] vehicleTotal \u8A66\u7B97\u5931\u6557",t),null}}validateCoupon(n,e){let t=n.trim();return t?this.catalog.validateCoupon(t,e):null}quote(n){if(!n.startDate||!n.endDate||!this.catalog.planForCategory(n.vehicle.category))return null;try{return this.catalog.price({category:n.vehicle.category,startDate:n.startDate,endDate:n.endDate,addOns:n.addOnLines,coupon:n.coupon,partnerDiscountPercent:n.partnerDiscountPercent})}catch(e){return console.error("[QuoteService] quote \u8A66\u7B97\u5931\u6557",e),null}}static \u0275fac=function(e){return new(e||a)};static \u0275prov=Lt({token:a,factory:a.\u0275fac,providedIn:"root"})};var Tc=(a,n)=>n.addOn.id,Nc=(a,n)=>n.date,Lc=(a,n)=>n.addOnId;function Bc(a,n){if(a&1&&(f(0,"span",5),m(1),_()),a&2){let e=n.$implicit;l(),et("",e.addOn.name," x",e.qty)}}function zc(a,n){if(a&1&&(f(0,"div",4)(1,"span"),m(2,"\u914D\u4EF6"),_(),f(3,"span"),ce(4,Bc,2,2,"span",5,Tc),_()()),a&2){let e=p(2);l(4),me(e.selectedAddOnLines)}}function Hc(a,n){if(a&1&&(f(0,"div",1)(1,"div",4)(2,"span"),m(3,"\u8ECA\u6B3E"),_(),f(4,"span"),m(5),_()(),f(6,"div",4)(7,"span"),m(8,"\u79DF\u671F"),_(),f(9,"span"),m(10),_()(),y(11,zc,6,0,"div",4),_()),a&2){let e=p();l(5),Gn("",e.vehicle.brand," ",e.vehicle.model,"\uFF08",e.vehicle.plateNumber,"\uFF09"),l(5),et("",e.startDate," \uFF5E ",e.endDate),l(),C(e.selectedAddOnLines.length>0?11:-1)}}function jc(a,n){a&1&&(f(0,"p",2),m(1,"\u5C1A\u672A\u9078\u64C7\u8ECA\u8F1B\u3002"),_())}function Yc(a,n){if(a&1&&(f(0,"div",4)(1,"span"),m(2),_(),f(3,"span"),m(4),_()()),a&2){let e=n.$implicit;l(2),et("",e.date,"\uFF08",e.dayType,"\uFF09"),l(2),E("NT$ ",e.price)}}function Gc(a,n){if(a&1&&(f(0,"div",6)(1,"span"),m(2),_(),f(3,"span"),m(4),_()()),a&2){let e=p(2);l(2),E("\u7D2F\u79DF\u6298\u6263\uFF08",e.priceBreakdown.tierDiscountPercent,"%\uFF09"),l(2),E("-NT$ ",e.priceBreakdown.tierDiscountAmount)}}function Wc(a,n){if(a&1&&(f(0,"div",6)(1,"span"),m(2),_(),f(3,"span"),m(4),_()()),a&2){let e=p(2);l(2),E("\u5925\u4F34\u6298\u6263\uFF08",e.priceBreakdown.partnerDiscountPercent,"%\uFF09"),l(2),E("-NT$ ",e.priceBreakdown.partnerDiscount)}}function qc(a,n){if(a&1&&(f(0,"div",4)(1,"span"),m(2),_(),f(3,"span"),m(4),_()()),a&2){let e=n.$implicit;l(2),et("",e.name," x",e.qty),l(2),E("NT$ ",e.amount)}}function Uc(a,n){if(a&1&&(f(0,"div",4)(1,"span"),m(2,"\u914D\u4EF6\u8CBB\u7528\u5C0F\u8A08"),_(),f(3,"span"),m(4),_()()),a&2){let e=p(2);l(4),E("NT$ ",e.priceBreakdown.addOnSubtotal)}}function $c(a,n){if(a&1&&(f(0,"div",6)(1,"span"),m(2),_(),f(3,"span"),m(4),_()()),a&2){let e=p(2);l(2),E("\u512A\u60E0\u6298\u62B5\uFF08",e.priceBreakdown.couponCode,"\uFF09"),l(2),E("-NT$ ",e.priceBreakdown.couponDiscount)}}function Xc(a,n){if(a&1&&(f(0,"div",3)(1,"h3"),m(2,"\u8A66\u7B97\u660E\u7D30"),_(),ce(3,Yc,5,3,"div",4,Nc),f(5,"div",4)(6,"span"),m(7,"\u79DF\u91D1\u539F\u50F9"),_(),f(8,"span"),m(9),_()(),y(10,Gc,5,2,"div",6),f(11,"div",4)(12,"span"),m(13,"\u79DF\u91D1\u5C0F\u8A08"),_(),f(14,"span"),m(15),_()(),y(16,Wc,5,2,"div",6),ce(17,qc,5,3,"div",4,Lc),y(19,Uc,5,1,"div",4),y(20,$c,5,2,"div",6),f(21,"div",7)(22,"span"),m(23,"\u61C9\u4ED8\u7E3D\u8A08"),_(),f(24,"span"),m(25),_()()()),a&2){let e=p();l(3),me(e.priceBreakdown.dailyLines),l(6),E("NT$ ",e.priceBreakdown.rentalRaw),l(),C(e.priceBreakdown.tierDiscountAmount>0?10:-1),l(5),E("NT$ ",e.priceBreakdown.rentalSubtotal),l(),C(e.priceBreakdown.partnerDiscount>0?16:-1),l(),me(e.priceBreakdown.addOnLines),l(2),C(e.priceBreakdown.addOnSubtotal>0?19:-1),l(),C(e.priceBreakdown.couponDiscount>0?20:-1),l(5),E("NT$ ",e.priceBreakdown.total)}}var Vi=class a{vehicle=null;startDate="";endDate="";selectedAddOnLines=[];priceBreakdown=null;static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-order-summary-card"]],inputs:{vehicle:"vehicle",startDate:"startDate",endDate:"endDate",selectedAddOnLines:"selectedAddOnLines",priceBreakdown:"priceBreakdown"},decls:6,vars:2,consts:[[1,"order-summary-card"],[1,"summary-block"],[1,"empty-state"],[1,"summary"],[1,"line"],[1,"add-on-item"],[1,"line","discount"],[1,"line","total"]],template:function(e,t){e&1&&(f(0,"div",0)(1,"h3"),m(2,"\u8CFC\u8CB7\u5167\u5BB9"),_(),y(3,Hc,12,6,"div",1)(4,jc,2,0,"p",2),y(5,Xc,26,7,"div",3),_()),e&2&&(l(3),C(t.vehicle?3:4),l(2),C(t.priceBreakdown?5:-1))},styles:[".order-summary-card[_ngcontent-%COMP%]{align-self:start}@media(min-width:900px){.order-summary-card[_ngcontent-%COMP%]{position:sticky;top:1rem}}.order-summary-card[_ngcontent-%COMP%]   .summary-block[_ngcontent-%COMP%]{margin-bottom:16px}.order-summary-card[_ngcontent-%COMP%]   .add-on-item[_ngcontent-%COMP%]{margin-left:8px}.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]{margin-top:16px;border-top:1px solid rgba(0,0,0,.12);padding-top:12px}.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding:4px 0}.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .discount[_ngcontent-%COMP%]{color:#2e7d32}.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{font-weight:700;font-size:1.1em;border-top:1px solid rgba(0,0,0,.12);margin-top:8px;padding-top:8px}@media(max-width:899.98px){.order-summary-card[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{position:sticky;bottom:0;margin-top:0;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px));background:var(--mat-sys-surface-container-highest, #fff)}}"]})};var Fi=class a{pickupLocation="";returnLocation="";startDate="";endDate="";days=0;edit=new v;get location(){return this.pickupLocation?!this.returnLocation||this.returnLocation===this.pickupLocation?this.pickupLocation:`\u53D6\u8ECA ${this.pickupLocation} \u30FB \u9084\u8ECA ${this.returnLocation}`:""}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-search-criteria-bar"]],inputs:{pickupLocation:"pickupLocation",returnLocation:"returnLocation",startDate:"startDate",endDate:"endDate",days:"days"},outputs:{edit:"edit"},decls:5,vars:4,consts:[[1,"search-criteria-bar"],[1,"criteria"],["mat-stroked-button","","type","button",3,"click"]],template:function(e,t){e&1&&(d(0,"div",0)(1,"span",1),m(2),c(),d(3,"button",2),g("click",function(){return t.edit.emit()}),m(4,"\u4FEE\u6539"),c()()),e&2&&(l(2),rr(" ",t.location," \xB7 ",t.startDate," \uFF5E ",t.endDate," \xB7 \u5171 ",t.days," \u5929 "))},dependencies:[Ge,Ue],styles:[".search-criteria-bar[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.75rem 1rem;border-radius:var(--mat-sys-corner-medium, 12px);background:var(--mat-sys-surface-container);color:var(--mat-sys-on-surface)}.search-criteria-bar[_ngcontent-%COMP%]   .criteria[_ngcontent-%COMP%]{font:var(--mat-sys-body-medium)}"]})};function Kc(a,n){a&1&&(d(0,"div",1),m(1),c()),a&2&&(l(),E("",n.name," \u5C08\u5C6C\u9810\u7D04"))}var bs=class a{route=s(Dt);router=s(Qt);catalog=s(tt);quote=s(mn);context=s(ht);partner=this.context.partner;params=pt(this.route.queryParamMap.pipe(be(n=>({start:n.get("start")??"",end:n.get("end")??"",pickup:n.get("pickup")??"",return:n.get("return")??"",group:ki(n.get("group"))}))),{initialValue:{start:"",end:"",pickup:"",return:"",group:void 0}});dateRange=M(()=>{let{start:n,end:e,pickup:t,return:i,group:r}=this.params();return!n||!e?null:{startDateTime:n,endDateTime:e,pickupLocation:t||ln,returnLocation:i||ln,vehicleGroup:r}});startDate=M(()=>this.params().start.slice(0,10));endDate=M(()=>this.params().end.slice(0,10));days=M(()=>this.quote.daysBetween(this.startDate(),this.endDate()));selectedVehicle=x(null);availableVehicles=M(()=>{let n=this.dateRange();if(!n)return[];let e=this.catalog.availableVehicles(n.startDateTime,n.endDateTime);if(!n.vehicleGroup)return e;let t=Aa[n.vehicleGroup];return e.filter(i=>t.includes(i.category))});priceForVehicle=n=>this.quote.vehicleTotal(n,{startDate:this.startDate(),endDate:this.endDate(),partnerDiscountPercent:this.partner()?.discountPercent});onDateRangeChange(n){this.selectedVehicle.set(null),this.router.navigate([],{relativeTo:this.route,queryParams:{start:n.startDateTime,end:n.endDateTime,pickup:n.pickupLocation,return:n.returnLocation,group:n.vehicleGroup??null},replaceUrl:!0})}onVehicleSelect(n){let e=this.dateRange();e&&this.router.navigate([...this.context.basePath(),"order",n.id],{queryParams:{start:e.startDateTime,end:e.endDateTime,pickup:e.pickupLocation,return:e.returnLocation,group:e.vehicleGroup??null}})}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-search-page"]],decls:8,vars:6,consts:[[1,"search-page"],[1,"partner-banner"],[1,"date-section"],[3,"dateRangeChange","dateRange"],[1,"vehicle-section"],[3,"vehicleSelect","vehicles","selectedVehicle","priceForVehicle","days"]],template:function(e,t){if(e&1&&(d(0,"div",0),y(1,Kc,2,1,"div",1),d(2,"h1"),m(3,"\u79DF\u8ECA\u9810\u7D04"),c(),d(4,"section",2)(5,"app-date-step",3),g("dateRangeChange",function(r){return t.onDateRangeChange(r)}),c()(),d(6,"section",4)(7,"app-vehicle-step",5),g("vehicleSelect",function(r){return t.onVehicleSelect(r)}),c()()()),e&2){let i;l(),C((i=t.partner())?1:-1,i),l(4),b("dateRange",t.dateRange()),l(2),b("vehicles",t.availableVehicles())("selectedVehicle",t.selectedVehicle())("priceForVehicle",t.priceForVehicle)("days",t.days())}},dependencies:[Oi,Ri],styles:[".search-page[_ngcontent-%COMP%]{max-width:960px;margin:0 auto;padding:24px}.search-page[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{margin-bottom:16px}.search-page[_ngcontent-%COMP%]   .date-section[_ngcontent-%COMP%]{margin-bottom:2rem}"]})};var Qc=(a,n)=>n.id;function Zc(a,n){a&1&&(d(0,"p"),m(1,"\u76EE\u524D\u7121\u53EF\u52A0\u8CFC\u914D\u4EF6\u3002"),c())}function Jc(a,n){if(a&1){let e=ne();d(0,"div",1)(1,"div",2)(2,"span",3),m(3),c(),d(4,"span",4),m(5),c()(),d(6,"mat-form-field",5)(7,"mat-label"),m(8,"\u6578\u91CF"),c(),d(9,"input",6),g("ngModelChange",function(i){let r=P(e).$implicit,o=p();return T(o.onQtyInput(r.id,i))}),c(),Ve(),c()()}if(a&2){let e=n.$implicit,t=p();l(3),N(e.name),l(2),et("NT$ ",e.unitPrice," / ",t.unitLabel[e.unit]),l(4),b("ngModel",t.qtyOf(e.id)),Fe()}}var em={per_rental:"\u6BCF\u7B46\u8A02\u55AE",per_day:"\u6BCF\u65E5"},Ii=class a{addOns=[];addOnQty={};addOnQtyChange=new v;unitLabel=em;qtyOf(n){return this.addOnQty[n]??0}onQtyInput(n,e){let t=Math.max(0,Number(e)||0);this.addOnQtyChange.emit({addOnId:n,qty:t})}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-addon-step"]],inputs:{addOns:"addOns",addOnQty:"addOnQty"},outputs:{addOnQtyChange:"addOnQtyChange"},decls:4,vars:1,consts:[[1,"addon-step"],[1,"addon-row"],[1,"addon-info"],[1,"name"],[1,"price"],["appearance","outline",1,"qty-field"],["matInput","","type","number","min","0",3,"ngModelChange","ngModel"]],template:function(e,t){e&1&&(d(0,"div",0),y(1,Zc,2,0,"p"),ce(2,Jc,10,4,"div",1,Qc),c()),e&2&&(l(),C(t.addOns.length===0?1:-1),l(),me(t.addOns))},dependencies:[Et,it,ua,St,da,_t,Me,We,Te,rt,at],styles:[".addon-step[_ngcontent-%COMP%]{padding:16px 0;max-width:480px}.addon-step[_ngcontent-%COMP%]   .addon-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:8px}.addon-step[_ngcontent-%COMP%]   .addon-info[_ngcontent-%COMP%]{display:flex;flex-direction:column}.addon-step[_ngcontent-%COMP%]   .addon-info[_ngcontent-%COMP%]   .name[_ngcontent-%COMP%]{font-weight:600}.addon-step[_ngcontent-%COMP%]   .addon-info[_ngcontent-%COMP%]   .price[_ngcontent-%COMP%]{font-size:.85em;opacity:.7}.addon-step[_ngcontent-%COMP%]   .qty-field[_ngcontent-%COMP%]{width:100px}"]})};function tm(a,n){if(a&1&&(d(0,"p",4),m(1),c()),a&2){let e=p(2);l(),E("\u512A\u60E0\u78BC\u53EF\u7528\uFF1A",e.couponResult.coupon?.code)}}function nm(a,n){if(a&1&&(d(0,"p",5),m(1),c()),a&2){let e=p(2);l(),N(e.couponResult.reason)}}function im(a,n){if(a&1&&y(0,tm,2,1,"p",4)(1,nm,2,1,"p",5),a&2){let e=p();C(e.couponResult.ok?0:1)}}function am(a,n){if(a&1&&(d(0,"div",6)(1,"span"),m(2,"\u914D\u4EF6\u8CBB\u7528"),c(),d(3,"span"),m(4),c()()),a&2){let e=p(2);l(4),E("NT$ ",e.priceBreakdown.addOnSubtotal)}}function rm(a,n){if(a&1&&(d(0,"div",7)(1,"span"),m(2),c(),d(3,"span"),m(4),c()()),a&2){let e=p(2);l(2),E("\u512A\u60E0\u6298\u62B5\uFF08",e.priceBreakdown.couponCode,"\uFF09"),l(2),E("-NT$ ",e.priceBreakdown.couponDiscount)}}function om(a,n){if(a&1&&(d(0,"div",3)(1,"h3"),m(2,"\u8A66\u7B97\u660E\u7D30"),c(),d(3,"div",6)(4,"span"),m(5,"\u79DF\u91D1\u5C0F\u8A08"),c(),d(6,"span"),m(7),c()(),y(8,am,5,1,"div",6),y(9,rm,5,2,"div",7),d(10,"div",8)(11,"span"),m(12,"\u7E3D\u8A08"),c(),d(13,"span"),m(14),c()()()),a&2){let e=p();l(7),E("NT$ ",e.priceBreakdown.rentalSubtotal),l(),C(e.priceBreakdown.addOnSubtotal>0?8:-1),l(),C(e.priceBreakdown.couponDiscount>0?9:-1),l(5),E("NT$ ",e.priceBreakdown.total)}}function sm(a,n){a&1&&(d(0,"p"),m(1,"\u8ACB\u5148\u5B8C\u6210\u524D\u9762\u6B65\u9A5F\u4EE5\u67E5\u770B\u8A66\u7B97\u3002"),c())}var Pi=class a{couponCode="";couponResult=null;priceBreakdown=null;couponCodeChange=new v;onCodeInput(n){this.couponCodeChange.emit(n)}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-coupon-step"]],inputs:{couponCode:"couponCode",couponResult:"couponResult",priceBreakdown:"priceBreakdown"},outputs:{couponCodeChange:"couponCodeChange"},decls:8,vars:3,consts:[[1,"coupon-step"],["appearance","outline"],["matInput","","placeholder","\u8F38\u5165\u512A\u60E0\u78BC",3,"ngModelChange","ngModel"],[1,"summary"],[1,"coupon-ok"],[1,"coupon-error"],[1,"line"],[1,"line","discount"],[1,"line","total"]],template:function(e,t){e&1&&(d(0,"div",0)(1,"mat-form-field",1)(2,"mat-label"),m(3,"\u512A\u60E0\u78BC"),c(),d(4,"input",2),g("ngModelChange",function(r){return t.onCodeInput(r)}),c(),Ve(),c(),y(5,im,2,1),y(6,om,15,4,"div",3)(7,sm,2,0,"p"),c()),e&2&&(l(4),b("ngModel",t.couponCode),Fe(),l(),C(t.couponResult?5:-1),l(),C(t.priceBreakdown?6:7))},dependencies:[Et,it,St,_t,Me,We,Te,rt,at],styles:[".coupon-step[_ngcontent-%COMP%]{padding:16px 0;max-width:400px}.coupon-step[_ngcontent-%COMP%]   .coupon-ok[_ngcontent-%COMP%]{color:#2e7d32}.coupon-step[_ngcontent-%COMP%]   .coupon-error[_ngcontent-%COMP%]{color:#c62828}.coupon-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]{margin-top:16px;border-top:1px solid rgba(0,0,0,.12);padding-top:12px}.coupon-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding:4px 0}.coupon-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .discount[_ngcontent-%COMP%]{color:#2e7d32}.coupon-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{font-weight:700;font-size:1.1em;border-top:1px solid rgba(0,0,0,.12);margin-top:8px;padding-top:8px}"]})};var lm=["input"],dm=["formField"],cm=["*"],Ti=class{source;value;constructor(n,e){this.source=n,this.value=e}},mm={provide:jt,useExisting:Be(()=>Ha),multi:!0},vs=new A("MatRadioGroup"),um=new A("mat-radio-default-options",{providedIn:"root",factory:()=>({color:"accent",disabledInteractive:!1})}),Ha=(()=>{class a{_changeDetector=s(Z);_value=null;_name=s(_e).getId("mat-radio-group-");_selected=null;_isInitialized=!1;_labelPosition="after";_disabled=!1;_required=!1;_buttonChanges;_controlValueAccessorChangeFn=()=>{};onTouched=()=>{};change=new v;_radios;color;get name(){return this._name}set name(e){this._name=e,this._updateRadioButtonNames()}get labelPosition(){return this._labelPosition}set labelPosition(e){this._labelPosition=e==="before"?"before":"after",this._markRadiosForCheck()}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this._updateSelectedRadioFromValue(),this._checkSelectedRadioButton())}_checkSelectedRadioButton(){this._selected&&!this._selected.checked&&(this._selected.checked=!0)}get selected(){return this._selected}set selected(e){this._selected=e,this.value=e?e.value:null,this._checkSelectedRadioButton()}get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._markRadiosForCheck()}get required(){return this._required}set required(e){this._required=e,this._markRadiosForCheck()}get disabledInteractive(){return this._disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e,this._markRadiosForCheck()}_disabledInteractive=!1;ngAfterContentInit(){this._isInitialized=!0,this._buttonChanges=this._radios.changes.subscribe(()=>{this.selected&&!this._radios.find(e=>e===this.selected)&&(this._selected=null)})}ngOnDestroy(){this._buttonChanges?.unsubscribe()}_touch(){this.onTouched&&this.onTouched()}_updateRadioButtonNames(){this._radios&&this._radios.forEach(e=>{e.name=this.name,e._markForCheck()})}_updateSelectedRadioFromValue(){let e=this._selected!==null&&this._selected.value===this._value;this._radios&&!e&&(this._selected=null,this._radios.forEach(t=>{t.checked=this.value===t.value,t.checked&&(this._selected=t)}))}_emitChangeEvent(){this._isInitialized&&this.change.emit(new Ti(this._selected,this._value))}_markRadiosForCheck(){this._radios&&this._radios.forEach(e=>e._markForCheck())}writeValue(e){this.value=e,this._changeDetector.markForCheck()}registerOnChange(e){this._controlValueAccessorChangeFn=e}registerOnTouched(e){this.onTouched=e}setDisabledState(e){this.disabled=e,this._changeDetector.markForCheck()}static \u0275fac=function(t){return new(t||a)};static \u0275dir=V({type:a,selectors:[["mat-radio-group"]],contentQueries:function(t,i,r){if(t&1&&yt(r,Ni,5),t&2){let o;O(o=R())&&(i._radios=o)}},hostAttrs:["role","radiogroup",1,"mat-mdc-radio-group"],inputs:{color:"color",name:"name",labelPosition:"labelPosition",value:"value",selected:"selected",disabled:[2,"disabled","disabled",S],required:[2,"required","required",S],disabledInteractive:[2,"disabledInteractive","disabledInteractive",S]},outputs:{change:"change"},exportAs:["matRadioGroup"],features:[K([mm,{provide:vs,useExisting:a}])]})}return a})(),Ni=(()=>{class a{_elementRef=s(F);_changeDetector=s(Z);_focusMonitor=s(Zt);_radioDispatcher=s(_a);_defaultOptions=s(um,{optional:!0});_ngZone=s(H);_renderer=s($);_uniqueId=s(_e).getId("mat-radio-");_cleanupClick;id=this._uniqueId;name;ariaLabel;ariaLabelledby;ariaDescribedby;disableRipple=!1;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked!==e&&(this._checked=e,e&&this.radioGroup&&this.radioGroup.value!==this.value?this.radioGroup.selected=this:!e&&this.radioGroup&&this.radioGroup.value===this.value&&(this.radioGroup.selected=null),e&&this._radioDispatcher.notify(this.id,this.name),this._changeDetector.markForCheck())}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this.radioGroup!==null&&(this.checked||(this.checked=this.radioGroup.value===e),this.checked&&(this.radioGroup.selected=this)))}get labelPosition(){return this._labelPosition||this.radioGroup&&this.radioGroup.labelPosition||"after"}set labelPosition(e){this._labelPosition=e}_labelPosition;get disabled(){return this._disabled||this.radioGroup!==null&&this.radioGroup.disabled}set disabled(e){this._setDisabled(e)}get required(){return this._required||this.radioGroup&&this.radioGroup.required}set required(e){e!==this._required&&this._changeDetector.markForCheck(),this._required=e}get color(){return this._color||this.radioGroup&&this.radioGroup.color||this._defaultOptions&&this._defaultOptions.color||"accent"}set color(e){this._color=e}_color;get disabledInteractive(){return this._disabledInteractive||this.radioGroup!==null&&this.radioGroup.disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e}_disabledInteractive;change=new v;radioGroup;get inputId(){return`${this.id||this._uniqueId}-input`}_checked=!1;_disabled=!1;_required=!1;_value=null;_removeUniqueSelectionListener=()=>{};_previousTabIndex;_inputElement;_rippleTrigger;_noopAnimations=we();_injector=s(X);constructor(){s(Oe).load(Jt);let e=s(vs,{optional:!0}),t=s(new Ct("tabindex"),{optional:!0});this.radioGroup=e,this._disabledInteractive=this._defaultOptions?.disabledInteractive??!1,t&&(this.tabIndex=xt(t,0))}focus(e,t){t?this._focusMonitor.focusVia(this._inputElement,t,e):this._inputElement.nativeElement.focus(e)}_markForCheck(){this._changeDetector.markForCheck()}ngOnInit(){this.radioGroup&&(this.checked=this.radioGroup.value===this._value,this.checked&&(this.radioGroup.selected=this),this.name=this.radioGroup.name),this._removeUniqueSelectionListener=this._radioDispatcher.listen((e,t)=>{e!==this.id&&t===this.name&&(this.checked=!1)})}ngDoCheck(){this._updateTabIndex()}ngAfterViewInit(){this._updateTabIndex(),this._focusMonitor.monitor(this._elementRef,!0).subscribe(e=>{!e&&this.radioGroup&&this.radioGroup._touch()}),this._ngZone.runOutsideAngular(()=>{this._cleanupClick=this._renderer.listen(this._inputElement.nativeElement,"click",this._onInputClick)})}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._removeUniqueSelectionListener()}_emitChangeEvent(){this.change.emit(new Ti(this,this._value))}_isRippleDisabled(){return this.disableRipple||this.disabled}_onInputInteraction(e){if(e.stopPropagation(),!this.checked&&!this.disabled){let t=this.radioGroup&&this.value!==this.radioGroup.value;this.checked=!0,this._emitChangeEvent(),this.radioGroup&&(this.radioGroup._controlValueAccessorChangeFn(this.value),t&&this.radioGroup._emitChangeEvent())}}_onTouchTargetClick(e){this._onInputInteraction(e),(!this.disabled||this.disabledInteractive)&&this._inputElement?.nativeElement.focus()}_setDisabled(e){this._disabled!==e&&(this._disabled=e,this._changeDetector.markForCheck())}_onInputClick=e=>{this.disabled&&this.disabledInteractive&&e.preventDefault()};_updateTabIndex(){let e=this.radioGroup,t;if(!e||!e.selected||this.disabled?t=this.tabIndex:t=e.selected===this?this.tabIndex:-1,t!==this._previousTabIndex){let i=this._inputElement?.nativeElement;i&&(i.setAttribute("tabindex",t+""),this._previousTabIndex=t,Ee(()=>{queueMicrotask(()=>{e&&e.selected&&e.selected!==this&&document.activeElement===i&&(e.selected?._inputElement.nativeElement.focus(),document.activeElement===i&&this._inputElement.nativeElement.blur())})},{injector:this._injector}))}}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=D({type:a,selectors:[["mat-radio-button"]],viewQuery:function(t,i){if(t&1&&oe(lm,5)(dm,7,F),t&2){let r;O(r=R())&&(i._inputElement=r.first),O(r=R())&&(i._rippleTrigger=r.first)}},hostAttrs:[1,"mat-mdc-radio-button"],hostVars:19,hostBindings:function(t,i){t&1&&g("focus",function(){return i._inputElement.nativeElement.focus()}),t&2&&(B("id",i.id)("tabindex",null)("aria-label",null)("aria-labelledby",null)("aria-describedby",null),I("mat-primary",i.color==="primary")("mat-accent",i.color==="accent")("mat-warn",i.color==="warn")("mat-mdc-radio-checked",i.checked)("mat-mdc-radio-disabled",i.disabled)("mat-mdc-radio-disabled-interactive",i.disabledInteractive)("_mat-animation-noopable",i._noopAnimations))},inputs:{id:"id",name:"name",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],disableRipple:[2,"disableRipple","disableRipple",S],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:xt(e)],checked:[2,"checked","checked",S],value:"value",labelPosition:"labelPosition",disabled:[2,"disabled","disabled",S],required:[2,"required","required",S],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",S]},outputs:{change:"change"},exportAs:["matRadioButton"],ngContentSelectors:cm,decls:13,vars:17,consts:[["formField",""],["input",""],["mat-internal-form-field","",3,"labelPosition"],[1,"mdc-radio"],["aria-hidden","true",1,"mat-mdc-radio-touch-target",3,"click"],["type","radio","aria-invalid","false",1,"mdc-radio__native-control",3,"change","id","checked","disabled","required"],["aria-hidden","true",1,"mdc-radio__background"],[1,"mdc-radio__outer-circle"],[1,"mdc-radio__inner-circle"],["mat-ripple","","aria-hidden","true",1,"mat-radio-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mat-ripple-element","mat-radio-persistent-ripple"],[1,"mdc-label",3,"for"]],template:function(t,i){t&1&&(he(),d(0,"div",2,0)(2,"div",3)(3,"div",4),g("click",function(o){return i._onTouchTargetClick(o)}),c(),d(4,"input",5,1),g("change",function(o){return i._onInputInteraction(o)}),c(),d(6,"div",6),j(7,"div",7)(8,"div",8),c(),d(9,"div",9),j(10,"div",10),c()(),d(11,"label",11),Y(12),c()()),t&2&&(b("labelPosition",i.labelPosition),l(2),I("mdc-radio--disabled",i.disabled),l(2),b("id",i.inputId)("checked",i.checked)("disabled",i.disabled&&!i.disabledInteractive)("required",i.required),B("name",i.name)("value",i.value)("aria-label",i.ariaLabel)("aria-labelledby",i.ariaLabelledby)("aria-describedby",i.ariaDescribedby)("aria-disabled",i.disabled&&i.disabledInteractive?"true":null),l(5),b("matRippleTrigger",i._rippleTrigger.nativeElement)("matRippleDisabled",i._isRippleDisabled())("matRippleCentered",!0),l(2),b("for",i.inputId))},dependencies:[Dr,Er],styles:[`.mat-mdc-radio-button {
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
`],encapsulation:2})}return a})(),ys=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=U({type:a});static \u0275inj=q({imports:[Zn,Ni,ge]})}return a})();function hm(a,n){if(a&1&&(d(0,"mat-radio-button",7),m(1),c()),a&2){let e=n.$implicit,t=p();b("value",e),l(),N(t.paymentMethodLabel[e])}}function fm(a,n){if(a&1&&(d(0,"p",8),m(1),c()),a&2){let e=p();l(),N(e.submitError)}}var _m={credit_card:"\u4FE1\u7528\u5361",line_pay:"LINE Pay",on_site:"\u73FE\u5834\u4ED8\u6B3E",bank_transfer:"\u8F49\u5E33"},Li=class a{vehicle=null;startDate="";endDate="";selectedAddOnLines=[];priceBreakdown=null;submitting=!1;submitError="";confirm=new v;paymentMethodLabel=_m;paymentMethods=["credit_card","line_pay","on_site","bank_transfer"];form={name:"",phone:"",email:"",paymentMethod:"on_site"};get canSubmit(){return!!this.priceBreakdown&&this.form.name.trim().length>0&&this.form.phone.trim().length>0&&this.form.email.trim().length>0&&!this.submitting}onSubmit(){this.canSubmit&&this.confirm.emit(W({},this.form))}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-confirm-step"]],inputs:{vehicle:"vehicle",startDate:"startDate",endDate:"endDate",selectedAddOnLines:"selectedAddOnLines",priceBreakdown:"priceBreakdown",submitting:"submitting",submitError:"submitError"},outputs:{confirm:"confirm"},decls:25,vars:7,consts:[[1,"confirm-step"],[1,"form-grid"],["appearance","outline"],["matInput","","name","name",3,"ngModelChange","ngModel"],["matInput","","name","phone",3,"ngModelChange","ngModel"],["matInput","","type","email","name","email",3,"ngModelChange","ngModel"],["name","paymentMethod",3,"ngModelChange","ngModel"],[3,"value"],[1,"submit-error"],[1,"actions"],["mat-flat-button","","color","primary",3,"click","disabled"]],template:function(e,t){e&1&&(d(0,"div",0)(1,"h3"),m(2,"\u4ED8\u6B3E\u4EBA\u8CC7\u8A0A"),c(),d(3,"div",1)(4,"mat-form-field",2)(5,"mat-label"),m(6,"\u59D3\u540D"),c(),d(7,"input",3),je("ngModelChange",function(r){return He(t.form.name,r)||(t.form.name=r),r}),c(),Ve(),c(),d(8,"mat-form-field",2)(9,"mat-label"),m(10,"\u96FB\u8A71"),c(),d(11,"input",4),je("ngModelChange",function(r){return He(t.form.phone,r)||(t.form.phone=r),r}),c(),Ve(),c(),d(12,"mat-form-field",2)(13,"mat-label"),m(14,"Email"),c(),d(15,"input",5),je("ngModelChange",function(r){return He(t.form.email,r)||(t.form.email=r),r}),c(),Ve(),c()(),d(16,"h3"),m(17,"\u4ED8\u6B3E\u65B9\u5F0F"),c(),d(18,"mat-radio-group",6),je("ngModelChange",function(r){return He(t.form.paymentMethod,r)||(t.form.paymentMethod=r),r}),ce(19,hm,2,2,"mat-radio-button",7,ir),c(),Ve(),y(21,fm,2,1,"p",8),d(22,"div",9)(23,"button",10),g("click",function(){return t.onSubmit()}),m(24),c()()()),e&2&&(l(7),ze("ngModel",t.form.name),Fe(),l(4),ze("ngModel",t.form.phone),Fe(),l(4),ze("ngModel",t.form.email),Fe(),l(3),ze("ngModel",t.form.paymentMethod),Fe(),l(),me(t.paymentMethods),l(2),C(t.submitError?21:-1),l(2),b("disabled",!t.canSubmit),l(),E(" ",t.submitting?"\u8655\u7406\u4E2D\u2026":"\u524D\u5F80\u4ED8\u6B3E"," "))},dependencies:[Et,it,St,_t,Me,We,Te,rt,at,ys,Ha,Ni,Ge,Ue],styles:[".confirm-step[_ngcontent-%COMP%]{padding:16px 0;max-width:480px}.confirm-step[_ngcontent-%COMP%]   .summary-block[_ngcontent-%COMP%]{margin-bottom:16px}.confirm-step[_ngcontent-%COMP%]   .add-on-item[_ngcontent-%COMP%]{margin-left:8px}.confirm-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]{margin-top:16px;border-top:1px solid rgba(0,0,0,.12);padding-top:12px}.confirm-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding:4px 0}.confirm-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .discount[_ngcontent-%COMP%]{color:#2e7d32}.confirm-step[_ngcontent-%COMP%]   .summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{font-weight:700;font-size:1.1em;border-top:1px solid rgba(0,0,0,.12);margin-top:8px;padding-top:8px}.confirm-step[_ngcontent-%COMP%]   .form-grid[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:8px;max-width:320px}.confirm-step[_ngcontent-%COMP%]   .submit-error[_ngcontent-%COMP%]{color:#c62828}.confirm-step[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%]{margin-top:16px}"]})};function gm(a,n){a&1&&(d(0,"div",1),m(1),c()),a&2&&(l(),E("",n.name," \u5C08\u5C6C\u9810\u7D04"))}var Cs=class a{route=s(Dt);router=s(Qt);catalog=s(tt);quote=s(mn);context=s(ht);vehicleRepo=s(ei);partner=this.context.partner;vehicleId=pt(this.route.paramMap.pipe(be(n=>n.get("vehicleId")??"")),{initialValue:""});params=pt(this.route.queryParamMap.pipe(be(n=>({start:n.get("start")??"",end:n.get("end")??"",pickup:n.get("pickup")??"",return:n.get("return")??"",group:ki(n.get("group"))}))),{initialValue:{start:"",end:"",pickup:"",return:"",group:void 0}});vehicle=M(()=>this.vehicleRepo.getById(this.vehicleId())??null);startDate=M(()=>this.params().start.slice(0,10));endDate=M(()=>this.params().end.slice(0,10));pickupLocation=M(()=>this.params().pickup);returnLocation=M(()=>this.params().return);days=M(()=>this.quote.daysBetween(this.startDate(),this.endDate()));addOnQty=x({});couponCode=x("");submitting=x(!1);submitError=x("");addOns=M(()=>this.catalog.addOns());selectedAddOnLines=M(()=>{let n=this.addOnQty();return this.addOns().map(e=>({addOn:e,qty:n[e.id]??0})).filter(e=>e.qty>0)});couponResult=M(()=>{let n=this.vehicle();return n?this.quote.validateCoupon(this.couponCode(),{startDate:this.startDate(),days:this.days(),category:n.category}):null});priceBreakdown=M(()=>{let n=this.vehicle();if(!n)return null;let e=this.couponResult();return this.quote.quote({vehicle:n,startDate:this.startDate(),endDate:this.endDate(),addOnLines:this.selectedAddOnLines(),coupon:e?.ok?e.coupon:void 0,partnerDiscountPercent:this.partner()?.discountPercent})});guardEffect=ve(()=>{this.ensureValidOrRedirect()});ensureValidOrRedirect(){return this.vehicle()&&this.startDate()&&this.endDate()&&this.pickupLocation()&&this.returnLocation()?!0:(this.goToSearch(),!1)}goToSearch(){let{start:n,end:e,pickup:t,return:i,group:r}=this.params();this.router.navigate([...this.context.basePath(),"search"],{queryParams:n&&e?{start:n,end:e,pickup:t,return:i,group:r??null}:{}})}onAddOnQtyChange(n,e){this.addOnQty.update(t=>xe(W({},t),{[n]:e}))}onCouponCodeChange(n){this.couponCode.set(n)}onConfirmSubmit(n){if(!this.ensureValidOrRedirect())return;let e=this.vehicle(),{start:t,end:i,pickup:r,return:o}=this.params();this.submitting.set(!0),this.submitError.set("");try{let u=this.couponResult(),h=this.catalog.submitBooking({vehicleId:e.id,startTime:t,endTime:i,pickupLocation:r,returnLocation:o,customer:{name:n.name,phone:n.phone,email:n.email},category:e.category,startDate:this.startDate(),endDate:this.endDate(),addOns:this.selectedAddOnLines(),couponCode:u?.ok?u.coupon?.code:void 0,paymentMethod:n.paymentMethod,partnerDiscountPercent:this.partner()?.discountPercent,sourcePartnerId:this.partner()?.id});this.router.navigate([...this.context.basePath(),"pay",h.id])}catch(u){this.submitError.set(u instanceof Error?u.message:"\u9001\u51FA\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66")}finally{this.submitting.set(!1)}}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-order-page"]],decls:19,vars:23,consts:[[1,"order-page"],[1,"partner-banner"],[3,"edit","pickupLocation","returnLocation","startDate","endDate","days"],[1,"checkout-layout"],[1,"checkout-main"],[3,"addOnQtyChange","addOns","addOnQty"],[3,"couponCodeChange","couponCode","couponResult","priceBreakdown"],[3,"confirm","vehicle","startDate","endDate","selectedAddOnLines","priceBreakdown","submitting","submitError"],[1,"checkout-aside"],[3,"vehicle","startDate","endDate","selectedAddOnLines","priceBreakdown"]],template:function(e,t){if(e&1&&(d(0,"div",0),y(1,gm,2,1,"div",1),d(2,"h1"),m(3,"\u586B\u5BEB\u8A02\u55AE"),c(),d(4,"app-search-criteria-bar",2),g("edit",function(){return t.goToSearch()}),c(),d(5,"div",3)(6,"div",4)(7,"section")(8,"h2"),m(9,"\u52A0\u8CFC\u914D\u4EF6"),c(),d(10,"app-addon-step",5),g("addOnQtyChange",function(r){return t.onAddOnQtyChange(r.addOnId,r.qty)}),c()(),d(11,"section")(12,"h2"),m(13,"\u512A\u60E0\u5238"),c(),d(14,"app-coupon-step",6),g("couponCodeChange",function(r){return t.onCouponCodeChange(r)}),c()(),d(15,"section")(16,"app-confirm-step",7),g("confirm",function(r){return t.onConfirmSubmit(r)}),c()()(),d(17,"aside",8),j(18,"app-order-summary-card",9),c()()()),e&2){let i;l(),C((i=t.partner())?1:-1,i),l(3),b("pickupLocation",t.pickupLocation())("returnLocation",t.returnLocation())("startDate",t.startDate())("endDate",t.endDate())("days",t.days()),l(6),b("addOns",t.addOns())("addOnQty",t.addOnQty()),l(4),b("couponCode",t.couponCode())("couponResult",t.couponResult())("priceBreakdown",t.priceBreakdown()),l(2),b("vehicle",t.vehicle())("startDate",t.startDate())("endDate",t.endDate())("selectedAddOnLines",t.selectedAddOnLines())("priceBreakdown",t.priceBreakdown())("submitting",t.submitting())("submitError",t.submitError()),l(2),b("vehicle",t.vehicle())("startDate",t.startDate())("endDate",t.endDate())("selectedAddOnLines",t.selectedAddOnLines())("priceBreakdown",t.priceBreakdown())}},dependencies:[Fi,Ii,Pi,Li,Vi],styles:[".order-page[_ngcontent-%COMP%]   .checkout-layout[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr;gap:2rem;margin-top:1.5rem}.order-page[_ngcontent-%COMP%]   .checkout-main[_ngcontent-%COMP%]   section[_ngcontent-%COMP%] + section[_ngcontent-%COMP%]{margin-top:2rem}@media(max-width:899.98px){.order-page[_ngcontent-%COMP%]   .checkout-main[_ngcontent-%COMP%]{padding-bottom:40vh}.order-page[_ngcontent-%COMP%]   .checkout-aside[_ngcontent-%COMP%]{position:fixed;inset:auto 0 0;max-height:40vh;overflow-y:auto;z-index:20;background:var(--mat-sys-surface-container-highest, #fff);border-top:1px solid var(--mat-sys-outline-variant, rgba(0, 0, 0, .12));box-shadow:var(--mat-sys-level2, 0 -2px 8px rgba(0, 0, 0, .12));padding:0 1rem}}@media(min-width:900px){.order-page[_ngcontent-%COMP%]   .checkout-layout[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr) 20rem;align-items:start}}"]})};function bm(a,n){if(a&1&&(d(0,"p",4),m(1),c()),a&2){let e=p(2);l(),N(e.payError())}}function vm(a,n){if(a&1){let e=ne();d(0,"div",1)(1,"div",2)(2,"span"),m(3,"\u8A02\u55AE\u7DE8\u865F"),c(),d(4,"span"),m(5),c()(),d(6,"div",2)(7,"span"),m(8,"\u4ED8\u6B3E\u65B9\u5F0F"),c(),d(9,"span"),m(10),c()(),d(11,"div",3)(12,"span"),m(13,"\u61C9\u4ED8\u91D1\u984D"),c(),d(14,"span"),m(15),c()()(),y(16,bm,2,1,"p",4),d(17,"div",5)(18,"button",6),g("click",function(){P(e);let i=p();return T(i.onPaySuccess())}),m(19," \u6A21\u64EC\u4ED8\u6B3E\u6210\u529F "),c(),d(20,"button",7),g("click",function(){P(e);let i=p();return T(i.onPayFailure())}),m(21," \u6A21\u64EC\u4ED8\u6B3E\u5931\u6557 "),c()(),d(22,"p",8),m(23,"\u6B64\u70BA\u4F54\u4F4D\u4ED8\u6B3E\u9801\uFF0C\u5C1A\u672A\u4E32\u63A5\u91D1\u6D41\u3002"),c()}if(a&2){let e=p();l(5),N(n.id),l(5),N(e.paymentMethodLabel()),l(5),E("NT$ ",e.amount()),l(),C(e.payError()?16:-1),l(2),b("disabled",e.paying()),l(2),b("disabled",e.paying())}}function ym(a,n){a&1&&(d(0,"p"),m(1,"\u67E5\u7121\u6B64\u8A02\u55AE\u3002"),c())}var Cm={credit_card:"\u4FE1\u7528\u5361",line_pay:"LINE Pay",on_site:"\u73FE\u5834\u4ED8\u6B3E",bank_transfer:"\u8F49\u5E33"},xs=class a{route=s(Dt);router=s(Qt);catalog=s(tt);context=s(ht);bookingRepo=s(en);bookingId=pt(this.route.paramMap.pipe(be(n=>n.get("bookingId")??"")),{initialValue:""});booking=M(()=>this.bookingRepo.getById(this.bookingId())??null);amount=M(()=>this.booking()?.priceBreakdown?.total??0);paymentMethodLabel=M(()=>{let n=this.booking()?.paymentMethod;return n?Cm[n]:"\u672A\u6307\u5B9A"});payError=x("");paying=x(!1);guardEffect=ve(()=>{this.redirectIfNotPayable()});redirectIfNotPayable(){let n=this.booking();return n&&n.status==="pending_payment"?!0:(this.goToDone(),!1)}onPaySuccess(){this.paying.set(!0),this.payError.set("");try{this.catalog.markBookingPaid(this.bookingId()),this.goToDone()}catch(n){this.payError.set(n instanceof Error?n.message:"\u4ED8\u6B3E\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66")}finally{this.paying.set(!1)}}onPayFailure(){this.payError.set("\u4ED8\u6B3E\u672A\u5B8C\u6210\uFF0C\u8ACB\u91CD\u65B0\u5617\u8A66\u6216\u6539\u7528\u5176\u4ED6\u4ED8\u6B3E\u65B9\u5F0F\u3002")}goToDone(){let n=[...this.context.basePath(),"done",this.bookingId()];this.router.navigate(n)}static \u0275fac=function(e){return new(e||a)};static \u0275cmp=D({type:a,selectors:[["app-payment-page"]],decls:5,vars:1,consts:[[1,"payment-page"],[1,"pay-summary"],[1,"line"],[1,"line","total"],[1,"pay-error"],[1,"actions"],["mat-flat-button","","color","primary",3,"click","disabled"],["mat-stroked-button","",3,"click","disabled"],[1,"placeholder-note"]],template:function(e,t){if(e&1&&(d(0,"div",0)(1,"h1"),m(2,"\u4ED8\u6B3E"),c(),y(3,vm,24,6)(4,ym,2,0,"p"),c()),e&2){let i;l(3),C((i=t.booking())?3:4,i)}},dependencies:[Ge,Ue],styles:[".payment-page[_ngcontent-%COMP%]   .pay-summary[_ngcontent-%COMP%]{margin:1.5rem 0}.payment-page[_ngcontent-%COMP%]   .pay-summary[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%]{display:flex;justify-content:space-between;padding:.5rem 0}.payment-page[_ngcontent-%COMP%]   .pay-summary[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%]{font:var(--mat-sys-title-medium)}.payment-page[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%]{display:flex;gap:.75rem}.payment-page[_ngcontent-%COMP%]   .pay-error[_ngcontent-%COMP%]{color:var(--mat-sys-error)}.payment-page[_ngcontent-%COMP%]   .placeholder-note[_ngcontent-%COMP%]{margin-top:1rem;color:var(--mat-sys-on-surface-variant);font:var(--mat-sys-body-small)}"]})};export{ht as BOOKING_CONTEXT,tt as CatalogStore,ln as DEFAULT_LOCATION,Oi as DateStepComponent,Lr as DoneComponent,ns as LOCATIONS,Cs as OrderPageComponent,Vi as OrderSummaryCardComponent,xs as PaymentPageComponent,mn as QuoteService,Fi as SearchCriteriaBarComponent,bs as SearchPageComponent,Aa as VEHICLE_GROUP_CATEGORIES,Ri as VehicleStepComponent,As as createPartnerBookingContext,jm as providePartnerBookingContext,ki as toVehicleGroup};

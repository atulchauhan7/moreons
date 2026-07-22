(function(){
var $=document.querySelector.bind(document),$$=document.querySelectorAll.bind(document);
/* Respect the OS "reduce motion" setting — gates decorative JS animations (cursor, parallax, autoplay, confetti, counters) that CSS alone can't stop */
var prefersReduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
if(window.matchMedia){try{window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',function(e){prefersReduced=e.matches})}catch(e){}}
function throttle(fn,lim){let t;return function(){if(!t){fn.apply(this,arguments);t=true;setTimeout(()=>t=false,lim)}}}
function debounce(fn,w){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this,arguments),w)}}

/* === PAGE LOADER — animations init only; loader is hidden by inline script in theme.liquid */
window.addEventListener('load',function(){
setHeaderHeight();
requestAnimationFrame(function(){
  if(!document.body.classList.contains('page-loaded'))document.body.classList.add('page-loaded');
  var lo=document.getElementById('page-loader');
  if(lo&&!lo.classList.contains('loaded'))lo.classList.add('loaded');
  requestAnimationFrame(function(){initScrollAnimations();initSmoothReveal();initParallax();initMagneticButtons();initSplitText();initCustomCursor();initCounterAnimations();initImageReveals()});
});
});

/* === SCROLL PROGRESS === */
(function(){
const b=$('.scroll-progress');if(!b)return;
var progTicking=false;
window.addEventListener('scroll',function(){if(!progTicking){progTicking=true;requestAnimationFrame(function(){const s=document.documentElement.scrollTop;const h=document.documentElement.scrollHeight-document.documentElement.clientHeight;b.style.width=h>0?(s/h)*100+'%':'0%';progTicking=false})}},{passive:true});
})();

/* === HEADER SCROLL === */
const header=$('.site-header');
const announcementBar=$('.announcement-bar');
function getAnnouncementHeight(){
return announcementBar&&!announcementBar.classList.contains('announcement-hidden')?Math.round(announcementBar.getBoundingClientRect().height):0;
}
function setHeaderHeight(){
if(header&&!announcementBar)header.classList.remove('has-announcement');
var annH=getAnnouncementHeight();
var hh=header?Math.round(header.offsetHeight):72;
var cs=$('.category-strip');var sh=cs?cs.offsetHeight:0;
document.documentElement.style.setProperty('--header-height',hh+'px');
document.documentElement.style.setProperty('--strip-height',sh+'px');
document.documentElement.style.setProperty('--announcement-height',annH+'px');
document.documentElement.style.setProperty('--announcement-content-offset',annH+'px');
}
setHeaderHeight();
window.addEventListener('load',function(){requestAnimationFrame(setHeaderHeight)});
window.addEventListener('resize',setHeaderHeight);
let lastScroll=0;
var headerTicking=false;
function handleHeaderScroll(){
const cs=window.pageYOffset||document.documentElement.scrollTop;
const scrollingDown=cs>lastScroll+2;
if(header){
header.classList.toggle('scrolled',cs>40);
if(announcementBar){
if(cs<=5){
announcementBar.classList.remove('announcement-hidden');
header.classList.add('has-announcement');
var annH=Math.round(announcementBar.getBoundingClientRect().height);
document.documentElement.style.setProperty('--announcement-height',annH+'px');
document.documentElement.style.setProperty('--announcement-content-offset',annH+'px');
}else if(scrollingDown&&!announcementBar.classList.contains('announcement-hidden')){
announcementBar.classList.add('announcement-hidden');
header.classList.remove('has-announcement');
document.documentElement.style.setProperty('--announcement-height','0px');
document.documentElement.style.setProperty('--announcement-content-offset','0px');
}
}
}
lastScroll=cs<=0?0:cs;
headerTicking=false;
}
window.addEventListener('scroll',function(){if(!headerTicking){headerTicking=true;requestAnimationFrame(handleHeaderScroll)}},{passive:true});

/* === CATEGORY STRIP SCROLL OVERFLOW === */
(function(){
var catStrip=$('.category-strip');
var catTrack=catStrip?catStrip.querySelector('.category-strip__track'):null;
function updateCatOverflow(){
if(!catStrip||!catTrack)return;
var overflowRight=catTrack.scrollLeft+catTrack.clientWidth<catTrack.scrollWidth-4;
var overflowLeft=catTrack.scrollLeft>4;
catStrip.classList.toggle('category-strip--overflow-right',overflowRight);
catStrip.classList.toggle('category-strip--overflow-left',overflowLeft);
}
if(catTrack){
catTrack.addEventListener('scroll',updateCatOverflow,{passive:true});
window.addEventListener('resize',debounce(updateCatOverflow,80),{passive:true});
updateCatOverflow();
setTimeout(updateCatOverflow,400);
}
})();

/* === MOBILE MENU === */
const menuToggle=$('.menu-toggle');
const mobileNav=$('.site-header__nav');
const navOverlay=$('[data-nav-overlay]');
const navClose=$('[data-nav-close]');
function openMobileNav(){if(menuToggle&&mobileNav){menuToggle.classList.add('active');mobileNav.classList.add('open');if(navOverlay)navOverlay.classList.add('open');document.body.classList.add('overflow-hidden','mobile-nav-open');menuToggle.setAttribute('aria-expanded','true')}}
function closeMobileNav(){if(menuToggle&&mobileNav){menuToggle.classList.remove('active');mobileNav.classList.remove('open');if(navOverlay)navOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden','mobile-nav-open');menuToggle.setAttribute('aria-expanded','false')}}
if(menuToggle&&mobileNav){menuToggle.addEventListener('click',function(){mobileNav.classList.contains('open')?closeMobileNav():openMobileNav()})}
if(navClose)navClose.addEventListener('click',closeMobileNav);
if(navOverlay)navOverlay.addEventListener('click',closeMobileNav);

function closeOtherNavDropdowns(currentItem){
$$('.nav-item').forEach(function(other){
if(other===currentItem)return;
var otherMega=other.querySelector('.mega-menu');
var otherLink=other.querySelector('.site-header__nav-link[data-nav-parent="true"]');
if(otherMega)otherMega.classList.remove('open');
other.classList.remove('is-open');
if(otherLink)otherLink.setAttribute('aria-expanded','false');
var otherArrow=other.querySelector('.nav-arrow');
if(otherArrow)otherArrow.style.transform='';
});
}

/* Parent links with children should open dropdown on click, not redirect */
document.addEventListener('click',function(e){
var link=e.target.closest('.site-header__nav-link[data-nav-parent="true"]');
if(!link)return;

var navItem=link.closest('.nav-item');
if(!navItem)return;
var mega=navItem.querySelector('.mega-menu');
if(!mega)return;

e.preventDefault();
e.stopPropagation();

var isOpen=mega.classList.contains('open')||navItem.classList.contains('is-open');
closeOtherNavDropdowns(navItem);

if(!isOpen){
mega.classList.add('open');
navItem.classList.add('is-open');
link.setAttribute('aria-expanded','true');
var arrow=link.querySelector('.nav-arrow');
if(arrow)arrow.style.transform='rotate(180deg)';
}else{
mega.classList.remove('open');
navItem.classList.remove('is-open');
link.setAttribute('aria-expanded','false');
var closeArrow=link.querySelector('.nav-arrow');
if(closeArrow)closeArrow.style.transform='';
}
});

document.addEventListener('click',function(e){
if(e.target.closest('.nav-item'))return;
closeOtherNavDropdowns(null);
});
/* === CART DRAWER === */
const cartDrawer=$('.cart-drawer');
const cartOverlay=$('.cart-drawer-overlay');
const cartTriggers=$$('[data-cart-trigger]');
const cartClose=$('.cart-drawer__close');
/* FBT product cache — prefetched on PDP, consumed by loadCartFBT() */
var _fbtCache=null;
var _fbtFetching=false;
var _fbtCallbacks=[];
function prefetchFBT(){
  if(_fbtCache||_fbtFetching)return;
  _fbtFetching=true;
  var handle=(window.theme&&window.theme.cartRecsHandle)||'accessories';
  fetch('/collections/'+handle+'/products.json?limit=20&fields=id,handle,title,images,variants')
    .then(function(r){return r.ok?r.json():Promise.reject();})
    .then(function(data){
      _fbtCache=data.products||[];
      _fbtFetching=false;
      _fbtCallbacks.forEach(function(cb){cb(_fbtCache);});
      _fbtCallbacks=[];
    })
    .catch(function(){_fbtFetching=false;_fbtCallbacks=[];});
}
function getFBTProducts(cb){
  if(_fbtCache){cb(_fbtCache);return;}
  _fbtCallbacks.push(cb);
  if(!_fbtFetching)prefetchFBT();
}
function loadCartFBT(){
  var section=document.getElementById('cart-drawer-fbt');
  var scroll=document.getElementById('cart-drawer-fbt-scroll');
  if(!section||!scroll)return;
  /* Show skeleton cards immediately */
  section.style.display='';
  if(!_fbtCache){
    scroll.innerHTML='<div class="cart-drawer__reco-skeleton"><div class="cart-drawer__reco-skel-card"></div><div class="cart-drawer__reco-skel-card"></div><div class="cart-drawer__reco-skel-card"></div></div>';
  }
  var cartIds=Array.from(document.querySelectorAll('.cart-drawer__item[data-product-id]')).map(function(el){return parseInt(el.getAttribute('data-product-id'),10)});
  getFBTProducts(function(products){
    var filtered=products.filter(function(p){return cartIds.indexOf(p.id)===-1;}).slice(0,6);
    if(!filtered.length){section.style.display='none';return;}
    function fmtMoney(price){
      var n=parseFloat(price)||0;
      var formatted=n.toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:0});
      return '&#8377;'+formatted;
    }
    scroll.innerHTML=filtered.map(function(p){
      var v=p.variants&&p.variants[0];
      var price=v?fmtMoney(v.price):'';
      var imgSrc=p.images&&p.images[0]?p.images[0].src.split('?')[0]+'?width=220':'';
      var img=imgSrc?'<img src="'+imgSrc+'" alt="'+p.title.replace(/"/g,'&quot;')+'" loading="lazy" width="220" height="280" class="cart-drawer__reco-img">':'<div class="cart-drawer__reco-img-placeholder"></div>';
      return '<a href="/products/'+p.handle+'" class="cart-drawer__reco-card">'+img+'<div class="cart-drawer__reco-info"><span class="cart-drawer__reco-name">'+p.title+'</span><span class="cart-drawer__reco-price">'+price+'</span></div></a>';
    }).join('');
    section.style.display='';
  });
}
/* Prefetch on PDP so cart open is instant */
if(window.location.pathname.indexOf('/products/')!==-1)prefetchFBT();
function openCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.add('open');cartOverlay.classList.add('open');document.body.classList.add('overflow-hidden');if(cartClose)cartClose.focus();triggerCartCelebration();loadCartFBT();}}
function closeCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.remove('open');cartOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
cartTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();openCartDrawer()}));
if(cartClose)cartClose.addEventListener('click',closeCartDrawer);
if(cartOverlay)cartOverlay.addEventListener('click',closeCartDrawer);

function resolveCheckoutUrl(){
if(window.theme&&window.theme.routes&&window.theme.routes.checkout_url)return window.theme.routes.checkout_url;
return '/checkout';
}

function triggerShopflowCheckout(source,trigger){
var checkoutUrl=resolveCheckoutUrl();
var detail={source:source||'unknown',checkoutUrl:checkoutUrl,trigger:trigger||null};
var checkoutEvent=null;
try{
checkoutEvent=new CustomEvent('shopflow:checkout',{cancelable:true,detail:detail});
document.dispatchEvent(checkoutEvent);
window.dispatchEvent(new CustomEvent('shopflow:checkout',{cancelable:true,detail:detail}));
}catch(e){}
if(checkoutEvent&&checkoutEvent.defaultPrevented)return;

var namespaces=[window.Shopflow,window.Shopflo,window.shopflow,window.shopflo];
var methods=['openFloCheckout','openCheckout','startCheckout','checkout','redirectToCheckout'];
for(var i=0;i<namespaces.length;i++){
var api=namespaces[i];
if(!api)continue;
for(var j=0;j<methods.length;j++){
var method=methods[j];
if(typeof api[method]==='function'){
try{
var isShopfloApi=api===window.Shopflo||api===window.shopflo;
var result=isShopfloApi?api[method]():api[method](detail);
if(result===false)continue;
return;
}catch(err){}
}
}
}
if(typeof window.shopflowCheckout==='function'){
try{
var fallbackResult=window.shopflowCheckout(detail);
if(fallbackResult!==false)return;
}catch(err){}
}
window.location.href=checkoutUrl;
}

function fallbackHandleFloCheckoutBtn(trigger){
return triggerShopflowCheckout('cart',trigger||null);
}

/* Gokwik checkout router — calls SDK directly so button disabled-state never blocks */
function _gkTriggerCheckout(fallbackTrigger){
  /* Find any Gokwik checkout button — could be PDP snippet or cart drawer */
  var gkBtn=document.querySelector('.gokwik-checkout button');
  /* Always enable before use: the snippet renders it disabled until SDK loads,
     but we call onCheckoutClick directly so state management is Gokwik's job */
  if(gkBtn){
    gkBtn.removeAttribute('disabled');
    gkBtn.classList.remove('disabled');
  }
  if(typeof window.onCheckoutClick==='function'){
    try{
      /* Synthesise a detached button if none exists in DOM (non-PDP pages
         before cart drawer has rendered) so SDK never receives null */
      window.onCheckoutClick(gkBtn||document.createElement('button'));
    }catch(err){
      /* If Gokwik SDK throws for any reason, fall back cleanly */
      triggerShopflowCheckout('cart',fallbackTrigger||null);
    }
    return;
  }
  /* Gokwik SDK not loaded yet — fall back to Shopify/Shopflo checkout */
  triggerShopflowCheckout('cart',fallbackTrigger||null);
}

function triggerShopflowBuyNow(trigger){
var btn=trigger||document.activeElement||null;
var productForm=btn&&btn.closest?btn.closest('[data-product-form]'):null;
if(!productForm)productForm=document.querySelector('[data-product-form]');
if(!productForm)return;
var variantInput=productForm.querySelector('input[name="id"]');
var qtyInput=productForm.querySelector('input[name="quantity"]');
if(!variantInput)return;
if(btn&&btn.classList&&btn.classList.contains('is-loading'))return;
window.__buyNowInProgress=true;
setBuyNowState('loading');
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:parseInt(variantInput.value,10),quantity:parseInt(qtyInput?qtyInput.value:1,10)||1}]})}).then(function(r){if(!r.ok)throw new Error('Add failed');return r.json()}).then(function(){
setBuyNowState('redirecting');
_gkTriggerCheckout(btn);
setTimeout(function(){setBuyNowState('reset');window.__buyNowInProgress=false},1500);
}).catch(function(){setBuyNowState('error');window.__buyNowInProgress=false;setTimeout(function(){setBuyNowState('reset')},1500)});
}

function fallbackHandleFloBuyNowBtn(event){
var trigger=event&&event.currentTarget?event.currentTarget:(event&&event.target?event.target:null);
if(event&&typeof event.preventDefault==='function')event.preventDefault();
if(event&&typeof event.stopPropagation==='function')event.stopPropagation();
return triggerShopflowBuyNow(trigger);
}

if(typeof window.handleFloCheckoutBtn!=='function')window.handleFloCheckoutBtn=fallbackHandleFloCheckoutBtn;
// Always override buy-now to ensure add-to-cart + full cart checkout flow
window.handleFloBuyNowBtn=fallbackHandleFloBuyNowBtn;

// pdpBuyNow: called directly from Buy Now button onclick — immune to Shopflo override
// Adds product to cart first, then opens checkout with the full cart
window.pdpBuyNow=function(event){
if(event&&typeof event.preventDefault==='function')event.preventDefault();
if(event&&typeof event.stopPropagation==='function')event.stopPropagation();
var btn=event&&event.currentTarget?event.currentTarget:(event&&event.target?event.target.closest('[data-buy-now]'):null);
if(btn&&btn.classList&&btn.classList.contains('is-loading'))return;
var productForm=btn&&btn.closest?btn.closest('[data-product-form]'):null;
if(!productForm)productForm=document.querySelector('[data-product-form]');
if(!productForm){window.location.href='/checkout';return;}
/* Check size first */
if(productForm._isSizeSelected&&!productForm._isSizeSelected()){
if(productForm._openSizeSheet)productForm._openSizeSheet('buy');
return;
}
/* Check color */
if(typeof hasColorOptionSelected==='function'&&!hasColorOptionSelected(productForm)){
if(productForm._openColorSheet)productForm._openColorSheet('buy');
else if(window.sakhiToast)window.sakhiToast.error('Please select a colour');
return;
}
var variantInput=productForm.querySelector('input[name="id"]');
var qtyInput=productForm.querySelector('input[name="quantity"]');
if(!variantInput){window.location.href='/checkout';return;}
setBuyNowState('loading');
fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},body:JSON.stringify({items:[{id:parseInt(variantInput.value,10),quantity:parseInt(qtyInput?qtyInput.value:1,10)||1}]})})
.then(function(r){if(!r.ok)throw new Error('add failed');return r.json();})
.then(function(){
setBuyNowState('redirecting');
_gkTriggerCheckout(btn);
setTimeout(function(){setBuyNowState('reset');},1500);
})
.catch(function(){setBuyNowState('error');setTimeout(function(){setBuyNowState('reset');},1500);});
};

document.addEventListener('submit',function(e){
var form=e.target.closest('form[data-shopflow-checkout-form]');
if(!form)return;
e.preventDefault();
triggerShopflowCheckout(form.getAttribute('data-shopflow-source')||'cart',form);
});

document.addEventListener('click',function(e){
var btn=e.target.closest('[data-shopflow-checkout-button]');
if(!btn)return;
e.preventDefault();
var source='cart';
var form=btn.form||btn.closest('form[data-shopflow-checkout-form]');
if(form&&form.getAttribute('data-shopflow-source'))source=form.getAttribute('data-shopflow-source');
triggerShopflowCheckout(source,btn);
});

/* Track free-shipping state across refreshes so we can celebrate transitions */
var _prevShippingUnlocked=null;
function readShippingState(){
  var unlocked=!!(cartDrawer&&cartDrawer.querySelector('.cart-drawer__shipping-text--success'));
  return unlocked;
}
function maybeCelebrateShipping(prev,now){
  if(prev===false&&now===true){
    var bar=cartDrawer&&cartDrawer.querySelector('.cart-drawer__shipping-bar');
    if(bar){
      bar.classList.add('is-just-unlocked');
      setTimeout(function(){bar.classList.remove('is-just-unlocked')},2000);
    }
  }
}

/* Refresh cart drawer HTML + count */
function refreshCart(callback){
var done=0,total=2,cartData=null;
if(cartDrawer)cartDrawer._sectionUpdated=false;
if(_prevShippingUnlocked===null)_prevShippingUnlocked=readShippingState();
function check(){
done++;
if(done>=total){
/* If section rendering failed but we have cart data, rebuild drawer client-side */
if(cartData&&cartDrawer&&!cartDrawer._sectionUpdated){
rebuildCartDrawer(cartData);
}
/* Detect shipping-threshold crossing */
var nowUnlocked=readShippingState();
maybeCelebrateShipping(_prevShippingUnlocked,nowUnlocked);
_prevShippingUnlocked=nowUnlocked;
if(typeof callback==='function')callback();
}
}
fetch('/?sections=cart-drawer',{cache:'no-store'}).then(r=>r.json()).then(data=>{
var html=data['cart-drawer'];
if(html){
var tmp=document.createElement('div');tmp.innerHTML=html;
var newDrawer=tmp.querySelector('.cart-drawer');
if(newDrawer&&cartDrawer){
cartDrawer.innerHTML=newDrawer.innerHTML;
cartDrawer._sectionUpdated=true;
/* re-bind close */
var nc=cartDrawer.querySelector('.cart-drawer__close');
if(nc)nc.addEventListener('click',closeCartDrawer);
/* re-bind qty buttons */
initCartQty();
initCartRemoveButtons();
loadCartFBT();
}
}
check();
}).catch(function(){check()});
fetch('/cart.js',{cache:'no-store'}).then(r=>r.json()).then(c=>{
cartData=c;
$$('.cart-count').forEach(el=>{el.textContent=c.item_count;el.classList.add('elastic-scale');setTimeout(()=>el.classList.remove('elastic-scale'),600)});
$$('.cart-drawer__title').forEach(el=>{el.textContent='Your Cart ('+c.item_count+')'});
check();
}).catch(function(){check()});
}
/* Fallback: rebuild cart drawer entirely from /cart.js data */
function rebuildCartDrawer(cart){
if(!cartDrawer)return;
var fmt=window.theme&&window.theme.moneyFormat?window.theme.moneyFormat:'{{amount}}';
function money(cents){return fmt.replace(/\{\{[^}]*\}\}/,(cents/100).toFixed(2))}
function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function escAttr(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
var h='<div class="cart-drawer__header"><span class="cart-drawer__title">Your Cart ('+cart.item_count+')</span>';
h+='<button class="cart-drawer__close" aria-label="Close cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
if(cart.items&&cart.items.length>0){
h+='<div class="cart-drawer__items">';
for(var i=0;i<cart.items.length;i++){
var it=cart.items[i];
h+='<div class="cart-drawer__item" data-line="'+(i+1)+'" data-key="'+escAttr(it.key)+'">';
h+='<div class="cart-drawer__item-image">';
if(it.image){h+='<img src="'+escAttr(it.image)+'" alt="'+escAttr(it.title)+'" loading="lazy" width="200">';}
h+='</div><div class="cart-drawer__item-info">';
h+='<a href="'+escAttr(it.url)+'" class="cart-drawer__item-title">'+esc(it.product_title)+'</a>';
if(it.variant_title&&it.variant_title!=='Default Title'){h+='<div class="cart-drawer__item-variant">'+esc(it.variant_title)+'</div>';}
h+='<div class="cart-drawer__item-price">'+money(it.final_line_price)+'</div>';
h+='<div class="cart-drawer__item-actions">';
h+='<div class="cart-drawer__qty"><button data-qty-minus aria-label="Decrease quantity">&#8722;</button>';
h+='<span>'+it.quantity+'</span>';
h+='<button data-qty-plus aria-label="Increase quantity">+</button></div>';
h+='<button class="cart-drawer__item-remove" data-qty-remove aria-label="Remove item"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>';
h+='</div>';
h+='</div></div>';
}
h+='</div>';
h+='<div class="cart-drawer__footer"><div class="cart-drawer__subtotal"><span>Subtotal</span>';
h+='<span class="cart-drawer__subtotal-price">'+money(cart.total_price)+'</span></div>';
if(window.theme&&window.theme.goEnabled){
  h+='<div class="cart-drawer__checkout-form"><div class="gokwik-checkout"><button type="button" class="button" onclick="_gkTriggerCheckout(this)"><span class="btn-text"><span>Checkout</span></span></button></div></div>';
}else{
  h+='<form action="/cart" method="post" novalidate class="cart-drawer__checkout-form"><button type="button" id="checkout2" name="checkout2" class="btn btn--primary btn--full" onclick="handleFloCheckoutBtn()">Checkout</button></form>';
}
h+='<div class="payment-icons payment-icons--drawer"><div class="payment-icons__list">';
h+='<span class="payment-icon" title="Visa"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#1A1F71"/><path d="M15.6 16.4l1.7-10.3h2.7l-1.7 10.3h-2.7zm11.3-10c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.6 1.4-4.6 3.4 0 1.5 1.4 2.3 2.4 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.1 0-1.6-.2-2.5-.5l-.3-.2-.4 2.1c.6.3 1.8.5 3 .5 2.9 0 4.7-1.4 4.7-3.5 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.4-2zm7 0h-2.1c-.7 0-1.2.2-1.4.8l-4.1 9.6h2.9l.6-1.6h3.5l.3 1.6h2.5l-2.2-10.3zm-3.4 6.6l1.5-3.9.4 3.9h-1.9zM14.2 6.1l-2.6 7-.3-1.4c-.5-1.6-2-3.4-3.7-4.3l2.5 9h2.9l4.3-10.3h-3.1z" fill="#fff"/><path d="M8.4 6.1H4.2l-.1.3c3.4.9 5.7 2.9 6.6 5.4l-1-4.9c-.2-.6-.6-.8-1.3-.8z" fill="#F9A533"/></svg></span>';
h+='<span class="payment-icon" title="Mastercard"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#252525"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M19 7.3a7 7 0 0 1 2.6 4.7A7 7 0 0 1 19 16.7a7 7 0 0 1-2.6-4.7A7 7 0 0 1 19 7.3z" fill="#FF5F00"/></svg></span>';
h+='<span class="payment-icon" title="PayPal"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#fff" stroke="#e8e8e8"/><path d="M25.2 7.8c-.4 2.6-2.4 2.6-4.3 2.6h-1.1l.8-4.8h.6c1.3 0 2.5 0 3.2.4.4.3.6.7.8 1.8z" fill="#003087"/><path d="M13.5 7.8c-.4 2.6-2.4 2.6-4.3 2.6H8.1l.8-4.8h.6c1.3 0 2.5 0 3.2.4.4.3.6.7.8 1.8z" fill="#002F86"/></svg></span>';
h+='<span class="payment-icon" title="Apple Pay"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#000"/><text x="19" y="15" text-anchor="middle" fill="#fff" font-size="8" font-family="sans-serif" font-weight="600">Pay</text></svg></span>';
h+='<span class="payment-icon" title="Shop Pay"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#5A31F4"/><text x="19" y="15" text-anchor="middle" fill="#fff" font-size="8" font-family="sans-serif" font-weight="600">Shop</text></svg></span>';
h+='</div></div>';
h+='<p class="cart-drawer__note">Shipping &amp; taxes calculated at checkout &middot; Coupon codes can be applied at checkout</p></div>';
}else{
h+='<div class="cart-drawer__empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
h+='<p>Your cart is empty</p><a href="/collections/all" class="btn btn--primary">Start Shopping</a></div>';
}
cartDrawer.innerHTML=h;
var nc=cartDrawer.querySelector('.cart-drawer__close');
if(nc)nc.addEventListener('click',closeCartDrawer);
initCartQty();
initCartRemoveButtons();
}

function initCartQty(){
if(!cartDrawer)return;
cartDrawer.querySelectorAll('.cart-drawer__qty').forEach(wrap=>{
var line=wrap.closest('[data-line]');if(!line)return;
var key=line.getAttribute('data-key')||line.getAttribute('data-line');
var minusBtn=wrap.querySelector('[data-qty-minus]');
var plusBtn=wrap.querySelector('[data-qty-plus]');
var qtySpan=wrap.querySelector('span');
if(!qtySpan)return;
if(minusBtn){
var newMinus=minusBtn.cloneNode(true);
minusBtn.parentNode.replaceChild(newMinus,minusBtn);
newMinus.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
var cur=parseInt(qtySpan.textContent)||1;
newMinus.disabled=true;
wrap.classList.add('is-loading');
changeCartLine(key,Math.max(0,cur-1));
});
}
if(plusBtn){
var newPlus=plusBtn.cloneNode(true);
plusBtn.parentNode.replaceChild(newPlus,plusBtn);
newPlus.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
var cur=parseInt(qtySpan.textContent)||1;
newPlus.disabled=true;
wrap.classList.add('is-loading');
changeCartLine(key,cur+1);
});
}
});
}
function initCartRemoveButtons(){
if(!cartDrawer)return;
cartDrawer.querySelectorAll('[data-qty-remove]').forEach(function(btn){
var line=btn.closest('[data-line]');if(!line)return;
var key=line.getAttribute('data-key')||line.getAttribute('data-line');
var newBtn=btn.cloneNode(true);
btn.parentNode.replaceChild(newBtn,btn);
newBtn.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
newBtn.disabled=true;
line.classList.add('is-removing');
changeCartLine(key,0,true);
});
});
}
function changeCartLine(key,qty,skipDrawerLoader){
if(cartDrawer&&!skipDrawerLoader)cartDrawer.classList.add('is-updating');
fetch(window.theme.routes.cart_change_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:qty})}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(()=>refreshCart()).catch(()=>refreshCart()).finally(()=>{if(cartDrawer)cartDrawer.classList.remove('is-updating')});
}
if(cartDrawer){initCartQty();initCartRemoveButtons()}


/* === HEADER INLINE SEARCH === */
const headerSearch=$('[data-header-search]');
const searchTriggers=$$('[data-search-trigger]');
const headerSearchClose=$('[data-header-search-close]');
const headerSearchInput=headerSearch?headerSearch.querySelector('.header-search__input'):null;
const headerSearchForm=headerSearch?headerSearch.querySelector('[data-header-search-form]'):null;
const headerSearchClear=headerSearch?headerSearch.querySelector('[data-header-search-clear]'):null;
const headerSearchDefault=headerSearch?headerSearch.querySelector('[data-header-search-default]'):null;
const headerSearchSuggest=headerSearch?headerSearch.querySelector('[data-header-search-suggest]'):null;
const headerSearchRoute=(window.theme&&window.theme.routes&&window.theme.routes.search_url)||'/search';
/* Recent searches — localStorage backed */
var RECENT_SEARCH_KEY='sakhi_recent_searches';
function getRecentSearches(){try{var a=JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY));return Array.isArray(a)?a:[]}catch(e){return[]}}
function pushRecentSearch(q){q=(q||'').trim();if(!q||q.length<2)return;var list=getRecentSearches().filter(function(x){return x.toLowerCase()!==q.toLowerCase()});list.unshift(q);list=list.slice(0,6);try{localStorage.setItem(RECENT_SEARCH_KEY,JSON.stringify(list))}catch(e){}}
function clearRecentSearches(){try{localStorage.removeItem(RECENT_SEARCH_KEY)}catch(e){}}
function renderRecentSearches(){
  var wrap=headerSearch?headerSearch.querySelector('[data-header-search-recent]'):null;
  var list=headerSearch?headerSearch.querySelector('[data-header-search-recent-list]'):null;
  if(!wrap||!list)return;
  var arr=getRecentSearches();
  if(!arr.length){wrap.hidden=true;list.innerHTML='';return}
  wrap.hidden=false;
  var html='';
  arr.forEach(function(q){
    var safe=q.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    html+='<a class="header-search__recent-item" href="'+headerSearchRoute+'?q='+encodeURIComponent(q)+'&type=product">';
    html+='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    html+='<span>'+safe+'</span>';
    html+='<button type="button" class="header-search__recent-remove" data-recent-remove="'+safe+'" aria-label="Remove">';
    html+='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    html+='</button>';
    html+='</a>';
  });
  list.innerHTML=html;
  list.querySelectorAll('[data-recent-remove]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      var q=this.getAttribute('data-recent-remove');
      var next=getRecentSearches().filter(function(x){return x!==q});
      try{localStorage.setItem(RECENT_SEARCH_KEY,JSON.stringify(next))}catch(e){}
      renderRecentSearches();
    });
  });
}
var clearRecentBtn=headerSearch?headerSearch.querySelector('[data-header-search-clear-recent]'):null;
if(clearRecentBtn){clearRecentBtn.addEventListener('click',function(){clearRecentSearches();renderRecentSearches()})}
if(headerSearchForm){headerSearchForm.addEventListener('submit',function(){if(headerSearchInput)pushRecentSearch(headerSearchInput.value)})}

function showDefaultState(){if(headerSearchDefault)headerSearchDefault.hidden=false;renderRecentSearches();if(headerSearchSuggest){headerSearchSuggest.hidden=true;headerSearchSuggest.innerHTML=''}if(headerSearch)headerSearch.classList.remove('has-results');if(headerSearchInput)headerSearchInput.setAttribute('aria-expanded','false')}
function openSearch(){if(headerSearch){headerSearch.classList.add('open');setTimeout(()=>{if(headerSearchInput)headerSearchInput.focus()},300)}}
function closeSearch(){if(headerSearch){headerSearch.classList.remove('open');if(headerSearchInput)headerSearchInput.value='';if(headerSearchClear)headerSearchClear.hidden=true;showDefaultState()}}
searchTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(headerSearch&&headerSearch.classList.contains('open')){closeSearch()}else{openSearch()}}));
if(headerSearchClose)headerSearchClose.addEventListener('click',closeSearch);
document.addEventListener('click',function(e){if(headerSearch&&headerSearch.classList.contains('open')&&!headerSearch.contains(e.target)&&!e.target.closest('[data-search-trigger]')){closeSearch()}});

/* Predictive search (Shopify /search/suggest.json) */
let predictiveTimer=null;
let predictiveAbort=null;
let predictiveActiveIdx=-1;
function escHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fmtMoney(cents){if(cents==null||isNaN(cents))return'';const fmt=(window.theme&&window.theme.money_format)||'₹{{amount}}';const amt=(cents/100).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2});return fmt.replace(/\{\{\s*amount(_no_decimals)?\s*\}\}/,amt)}
function highlight(text,q){if(!text)return'';if(!q)return escHtml(text);const safe=escHtml(text);const re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').split(/\s+/).filter(Boolean).join('|')+')','ig');return safe.replace(re,'<mark>$1</mark>')}
function renderEmpty(q){
  return '<div class="hs-empty">'
    +'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
    +'<p class="hs-empty__title">No results for &ldquo;'+escHtml(q)+'&rdquo;</p>'
    +'<p class="hs-empty__sub">Try a different keyword or check the spelling.</p>'
    +'</div>';
}
function renderResults(data,q){
  const r=(data&&data.resources&&data.resources.results)||{};
  const queries=r.queries||[];
  const products=r.products||[];
  const collections=r.collections||[];
  if(!queries.length&&!products.length&&!collections.length)return renderEmpty(q);
  let html='';
  let idx=0;
  if(queries.length||collections.length){
    html+='<div class="hs-section"><div class="hs-section__title">Suggestions</div><ul class="hs-queries">';
    queries.slice(0,4).forEach(item=>{
      const text=item.text||'';
      const url=item.url||(headerSearchRoute+'?q='+encodeURIComponent(text)+'&type=product');
      html+='<li><a href="'+escHtml(url)+'" class="hs-row hs-row--query" data-hs-idx="'+(idx++)+'" role="option">'
        +'<svg class="hs-row__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
        +'<span class="hs-row__text">'+highlight(text,q)+'</span>'
        +'<svg class="hs-row__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17 17 7M9 7h8v8"/></svg>'
        +'</a></li>';
    });
    collections.slice(0,3).forEach(c=>{
      html+='<li><a href="'+escHtml(c.url||'#')+'" class="hs-row hs-row--collection" data-hs-idx="'+(idx++)+'" role="option">'
        +'<svg class="hs-row__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
        +'<span class="hs-row__text">'+highlight(c.title||'',q)+'</span>'
        +'<span class="hs-row__badge">Collection</span>'
        +'<svg class="hs-row__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17 17 7M9 7h8v8"/></svg>'
        +'</a></li>';
    });
    html+='</ul></div>';
  }
  if(products.length){
    html+='<div class="hs-section"><div class="hs-section__title">Products</div><ul class="hs-products">';
    products.slice(0,6).forEach(p=>{
      const img=(p.featured_image&&(p.featured_image.url||p.featured_image))||p.image||'';
      const title=p.title||'';
      const vendor=p.vendor||'';
      const price=p.price!=null?fmtMoney(typeof p.price==='string'?Math.round(parseFloat(p.price)*100):p.price):'';
      const compare=p.compare_at_price_max!=null&&p.compare_at_price_max>p.price?fmtMoney(typeof p.compare_at_price_max==='string'?Math.round(parseFloat(p.compare_at_price_max)*100):p.compare_at_price_max):'';
      html+='<li><a href="'+escHtml(p.url||'#')+'" class="hs-row hs-row--product" data-hs-idx="'+(idx++)+'" role="option">'
        +'<div class="hs-row__thumb">'
        +(img?'<img src="'+escHtml(img)+'" alt="" loading="lazy" width="56" height="56">':'<div class="hs-row__thumb-placeholder"></div>')
        +'</div>'
        +'<div class="hs-row__body">'
        +(vendor?'<div class="hs-row__brand">'+escHtml(vendor)+'</div>':'')
        +'<div class="hs-row__title">'+highlight(title,q)+'</div>'
        +'<div class="hs-row__price"><span class="hs-price">'+price+'</span>'+(compare?' <span class="hs-price--strike">'+compare+'</span>':'')+'</div>'
        +'</div>'
        +'</a></li>';
    });
    html+='</ul></div>';
  }
  html+='<a href="'+escHtml(headerSearchRoute)+'?q='+encodeURIComponent(q)+'&type=product" class="hs-viewall" data-hs-idx="'+(idx++)+'" role="option">View all results for &ldquo;'+escHtml(q)+'&rdquo; <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>';
  return html;
}
function renderLoading(){return '<div class="hs-loading"><span></span><span></span><span></span></div>'}
function showResultsState(){if(headerSearchDefault)headerSearchDefault.hidden=true;if(headerSearchSuggest)headerSearchSuggest.hidden=false;if(headerSearch)headerSearch.classList.add('has-results');if(headerSearchInput)headerSearchInput.setAttribute('aria-expanded','true');predictiveActiveIdx=-1}
function fetchPredictive(q){
  if(predictiveAbort)predictiveAbort.abort();
  predictiveAbort=new AbortController();
  const url='/search/suggest.json?q='+encodeURIComponent(q)+'&resources[type]=product,collection,query&resources[limit]=6&resources[options][unavailable_products]=last&resources[options][fields]=title,product_type,variants.title,vendor';
  fetch(url,{signal:predictiveAbort.signal,headers:{Accept:'application/json'}})
    .then(r=>r.json())
    .then(data=>{
      if(!headerSearchSuggest)return;
      headerSearchSuggest.innerHTML=renderResults(data,q);
      showResultsState();
    })
    .catch(e=>{if(e&&e.name==='AbortError')return;if(headerSearchSuggest){headerSearchSuggest.innerHTML=renderEmpty(q);showResultsState()}});
}
function onSearchInput(){
  const q=(headerSearchInput.value||'').trim();
  if(headerSearchClear)headerSearchClear.hidden=q.length===0;
  if(predictiveTimer){clearTimeout(predictiveTimer);predictiveTimer=null}
  if(q.length<2){showDefaultState();return}
  if(headerSearchSuggest){headerSearchSuggest.innerHTML=renderLoading();showResultsState()}
  predictiveTimer=setTimeout(()=>fetchPredictive(q),180);
}
if(headerSearchInput){
  headerSearchInput.addEventListener('input',onSearchInput);
  headerSearchInput.addEventListener('focus',()=>{const q=(headerSearchInput.value||'').trim();if(q.length>=2&&headerSearchSuggest&&headerSearchSuggest.innerHTML){showResultsState()}});
  headerSearchInput.addEventListener('keydown',function(e){
    if(!headerSearchSuggest||headerSearchSuggest.hidden)return;
    const items=headerSearchSuggest.querySelectorAll('[data-hs-idx]');
    if(!items.length)return;
    if(e.key==='ArrowDown'){e.preventDefault();predictiveActiveIdx=(predictiveActiveIdx+1)%items.length}
    else if(e.key==='ArrowUp'){e.preventDefault();predictiveActiveIdx=(predictiveActiveIdx-1+items.length)%items.length}
    else if(e.key==='Enter'&&predictiveActiveIdx>=0){e.preventDefault();items[predictiveActiveIdx].click();return}
    else if(e.key==='Escape'){closeSearch();return}
    else{return}
    items.forEach((it,i)=>{if(i===predictiveActiveIdx){it.classList.add('is-active');it.scrollIntoView({block:'nearest'})}else{it.classList.remove('is-active')}});
  });
}
if(headerSearchClear)headerSearchClear.addEventListener('click',function(){if(headerSearchInput){headerSearchInput.value='';headerSearchInput.focus()}headerSearchClear.hidden=true;showDefaultState()});

/* === WISHLIST (localStorage-based) === */
var wishlistDrawer=$('.wishlist-drawer');
var wishlistOverlay=$('.wishlist-drawer-overlay');
var wishlistClose=wishlistDrawer?wishlistDrawer.querySelector('.wishlist-drawer__close'):null;
var WISHLIST_KEY='luxe_wishlist';

function getWishlist(){try{return JSON.parse(localStorage.getItem(WISHLIST_KEY))||[]}catch(e){return[]}}
function saveWishlist(list){localStorage.setItem(WISHLIST_KEY,JSON.stringify(list))}

function isInWishlist(handle){return getWishlist().some(function(item){return item.handle===handle})}

function addToWishlist(data){
var list=getWishlist();
if(list.some(function(item){return item.handle===data.handle}))return;
list.push({handle:data.handle,title:data.title,url:data.url,price:data.price,image:data.image,addedAt:Date.now()});
saveWishlist(list);
renderWishlistDrawer();
updateWishlistBadges();
updateWishlistButtons();
if(window.sakhiToast){
  window.sakhiToast({type:'heart',title:'Added to wishlist',message:data.title||'Saved for later',
    action:{label:'View',onClick:function(){if(typeof openWishlistDrawer==='function')openWishlistDrawer()}}});
}
}

function removeFromWishlist(handle){
var removed=getWishlist().filter(function(item){return item.handle===handle})[0];
var list=getWishlist().filter(function(item){return item.handle!==handle});
saveWishlist(list);
renderWishlistDrawer();
updateWishlistBadges();
updateWishlistButtons();
if(window.sakhiToast&&removed){
  window.sakhiToast({type:'info',message:'Removed from wishlist'});
}
}

function toggleWishlist(data){
if(isInWishlist(data.handle)){removeFromWishlist(data.handle)}else{addToWishlist(data)}
}

function openWishlistDrawer(){
if(wishlistDrawer&&wishlistOverlay){
renderWishlistDrawer();
wishlistDrawer.classList.add('open');
wishlistOverlay.classList.add('open');
document.body.classList.add('overflow-hidden');
}
}
function closeWishlistDrawer(){
if(wishlistDrawer&&wishlistOverlay){
wishlistDrawer.classList.remove('open');
wishlistOverlay.classList.remove('open');
document.body.classList.remove('overflow-hidden');
}
}

function renderWishlistDrawer(){
if(!wishlistDrawer)return;
var list=getWishlist();
var itemsContainer=wishlistDrawer.querySelector('.wishlist-drawer__items');
var emptyState=wishlistDrawer.querySelector('.wishlist-drawer__empty');
var footer=wishlistDrawer.querySelector('.wishlist-drawer__footer');
function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function escAttr(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

if(list.length===0){
itemsContainer.innerHTML='';
itemsContainer.classList.add('sk-hidden');
emptyState.classList.remove('sk-hidden');
if(footer)footer.classList.add('sk-hidden');
}else{
emptyState.classList.add('sk-hidden');
itemsContainer.classList.remove('sk-hidden');
if(footer)footer.classList.remove('sk-hidden');
var html='';
for(var i=0;i<list.length;i++){
var item=list[i];
html+='<div class="wishlist-drawer__item" data-wishlist-handle="'+escAttr(item.handle)+'">';
html+='<a class="wishlist-drawer__item-image" href="'+escAttr(item.url)+'" aria-label="'+escAttr(item.title)+'">';
if(item.image){html+='<img src="'+escAttr(item.image)+'" alt="'+escAttr(item.title)+'" loading="lazy" width="200">'}
html+='</a>';
html+='<button class="wishlist-drawer__remove" data-wishlist-remove="'+escAttr(item.handle)+'" aria-label="Remove from wishlist">';
html+='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
html+='</button>';
html+='<div class="wishlist-drawer__item-info">';
html+='<a href="'+escAttr(item.url)+'" class="wishlist-drawer__item-title">'+esc(item.title)+'</a>';
html+='<div class="wishlist-drawer__item-price">'+esc(item.price)+'</div>';
html+='<div class="wishlist-drawer__item-actions">';
html+='<a href="'+escAttr(item.url)+'" class="wishlist-drawer__btn wishlist-drawer__btn--primary" data-wishlist-move-to-bag>';
html+='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';
html+='Move to Bag</a>';
html+='</div>';
html+='</div>';
html+='</div>';
}
itemsContainer.innerHTML=html;
/* Bind remove buttons */
itemsContainer.querySelectorAll('[data-wishlist-remove]').forEach(function(btn){
btn.addEventListener('click',function(e){
e.preventDefault();
var handle=this.getAttribute('data-wishlist-remove');
var itemEl=this.closest('.wishlist-drawer__item');
if(itemEl){itemEl.style.transition='opacity 0.3s,transform 0.3s';itemEl.style.opacity='0';itemEl.style.transform='translateX(20px)';
setTimeout(function(){removeFromWishlist(handle)},300);
}else{removeFromWishlist(handle)}
});
});
}
}

function updateWishlistBadges(){
var count=getWishlist().length;
$$('.wishlist-count').forEach(function(el){el.textContent=count});
$$('.wishlist-count-badge').forEach(function(el){
if(count>0){el.textContent=count;el.style.display='flex'}else{el.style.display='none'}
});
$$('[data-wishlist-noun]').forEach(function(el){el.textContent=count===1?'item':'items'});
var drawerBadge=document.querySelector('.wishlist-drawer__count-badge');
if(drawerBadge)drawerBadge.style.display=count>0?'inline-flex':'none';
}

function updateWishlistButtons(){
$$('[data-wishlist-toggle]').forEach(function(btn){
var handle=btn.getAttribute('data-product-handle');
var textEl=btn.querySelector('.pdp-wishlist__text');
if(handle&&isInWishlist(handle)){
btn.classList.add('wishlisted');
btn.setAttribute('aria-label','Remove from wishlist');
if(textEl)textEl.textContent='Wishlisted';
}else{
btn.classList.remove('wishlisted');
btn.setAttribute('aria-label','Add to wishlist');
if(textEl)textEl.textContent='Add to Wishlist';
}
});
}

/* Wishlist trigger — header icon */
$$('[data-wishlist-trigger]').forEach(function(t){t.addEventListener('click',function(e){e.preventDefault();openWishlistDrawer()})});
if(wishlistClose)wishlistClose.addEventListener('click',closeWishlistDrawer);
if(wishlistOverlay)wishlistOverlay.addEventListener('click',closeWishlistDrawer);

/* Wishlist toggle — product card heart buttons (event delegation) */
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-wishlist-toggle]');
if(!btn)return;
e.preventDefault();
e.stopPropagation();
var data={
handle:btn.getAttribute('data-product-handle'),
title:btn.getAttribute('data-product-title'),
url:btn.getAttribute('data-product-url'),
price:btn.getAttribute('data-product-price'),
image:btn.getAttribute('data-product-image')
};
if(!data.handle)return;
toggleWishlist(data);
/* Animate the heart */
btn.classList.remove('wish-pop');
void btn.offsetWidth;
btn.classList.add('wish-pop');
setTimeout(function(){btn.classList.remove('wish-pop')},450);
});

/* Init on load */
updateWishlistBadges();
updateWishlistButtons();

/* === NEWSLETTER POPUP === */
var closeNewsletterPopup=function(){};
function initNewsletterPopup(){
var p=$('.newsletter-popup-overlay');if(!p)return;
var cb=p.querySelector('.newsletter-popup__close');
var closed=sessionStorage.getItem('luxe_newsletter_closed');
closeNewsletterPopup=function(){p.classList.remove('open');document.body.classList.remove('overflow-hidden');sessionStorage.setItem('luxe_newsletter_closed','true')};
if(!closed){var idleCb=window.requestIdleCallback||function(fn){setTimeout(fn,5000)};idleCb(function(){setTimeout(function(){p.classList.add('open');document.body.classList.add('overflow-hidden')},3000)})}
if(cb)cb.addEventListener('click',closeNewsletterPopup);
p.addEventListener('click',function(e){if(e.target===p)closeNewsletterPopup()});
window.closeNewsletterPopup=closeNewsletterPopup;
}
initNewsletterPopup();

/* === ESC KEY === */
document.addEventListener('keydown',function(e){
if(e.key==='Escape'){closeSearch();closeCartDrawer();closeWishlistDrawer();if(typeof closeNewsletterPopup==='function')closeNewsletterPopup();
if(menuToggle&&menuToggle.classList.contains('active')){menuToggle.classList.remove('active');if(mobileNav)mobileNav.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
});

/* === SCROLL ANIMATIONS — All elements visible immediately === */
function initScrollAnimations(){
$$('[data-animate]:not(.animated)').forEach(function(el){el.classList.add('animated')});
}
function initSmoothReveal(){
$$('.shopify-section:not(.revealed)').forEach(function(s){s.classList.add('revealed')});
}
function initSectionReveals(){
$$('[data-stagger-reveal]').forEach(function(g){
Array.from(g.children).forEach(function(it){it.style.opacity='1';it.style.transform='none'});
});
}

/* === BACK TO TOP === */
const backToTop=document.getElementById('back-to-top');
if(backToTop){
window.addEventListener('scroll',throttle(function(){backToTop.classList.toggle('visible',window.pageYOffset>500)},100),{passive:true});
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

/* === HERO SLIDER (dots + arrows + autoplay) === */
function initHeroSlideshow(){
$$('[data-hero-slideshow]').forEach(h=>{
if(h.__hInit)return;h.__hInit=true;
const slides=h.querySelectorAll('.hero-slide');
if(slides.length<=1)return;
let cur=0;const speed=parseInt(h.dataset.heroSpeed)||6000;let timer=null;
const progressBar=h.querySelector('[data-hero-progress]');
function resetProgress(){
if(!progressBar)return;
progressBar.style.animation='none';
progressBar.offsetHeight;/* reflow */
progressBar.style.animation='heroProgress '+speed+'ms linear forwards';
}
function goTo(i){
if(i<0)i=slides.length-1;if(i>=slides.length)i=0;
cur=i;slides.forEach((s,idx)=>s.classList.toggle('hero-slide--active',idx===cur));
h.querySelectorAll('.hero-slider__dot').forEach((d,idx)=>d.classList.toggle('active',idx===cur));
resetProgress();
}
function next(){goTo(cur+1)}
function prev(){goTo(cur-1)}
function startAP(){if(prefersReduced)return;stopAP();timer=setInterval(next,speed);resetProgress()}
function stopAP(){if(timer){clearInterval(timer);timer=null}}
/* Dots */
h.querySelectorAll('.hero-slider__dot').forEach(d=>{d.addEventListener('click',function(){goTo(parseInt(this.getAttribute('data-slide-index')));stopAP();startAP()})});
/* Arrows */
var prevBtn=h.querySelector('.hero-slider__arrow--prev');
var nextBtn=h.querySelector('.hero-slider__arrow--next');
if(prevBtn)prevBtn.addEventListener('click',function(){prev();stopAP();startAP()});
if(nextBtn)nextBtn.addEventListener('click',function(){next();stopAP();startAP()});
/* Touch swipe */
var touchStartX=0;
h.addEventListener('touchstart',function(e){touchStartX=e.touches[0].clientX},{passive:true});
h.addEventListener('touchend',function(e){var diff=touchStartX-e.changedTouches[0].clientX;if(Math.abs(diff)>50){if(diff>0)next();else prev();stopAP();startAP()}},{passive:true});
/* Pause on hover */
h.addEventListener('mouseenter',stopAP);h.addEventListener('mouseleave',startAP);
document.addEventListener('visibilitychange',function(){if(document.hidden)stopAP();else startAP();});
goTo(0);startAP();
});
}
initHeroSlideshow();

/* === QUICK ADD TO CART (product card overlay) === */
function initQuickAdd(){
var cardSheetOverlay=$('#card-size-sheet-overlay');
var cardSheet=$('#card-size-sheet');
var cardSheetSizes=$('#card-size-sheet-sizes');
var cardSheetAdd=$('#card-size-sheet-add');
var cardSheetCloseBtn=cardSheet?cardSheet.querySelector('.size-sheet__close'):null;
var cardSheetState={activeBtn:null,selectedVariantId:null,selections:{}};

function setButtonState(btn,label,disabled){
if(!btn)return;
btn.innerHTML='<span>'+label+'</span>';
btn.disabled=!!disabled;
}

function addVariantToCart(variantId){
return fetch(window.theme.routes.cart_add_url+'.js',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({items:[{id:parseInt(variantId,10),quantity:1}]})
}).then(function(r){if(!r.ok)throw new Error('Add failed');return r.json()});
}

function closeCardSizeSheet(){
if(!cardSheetOverlay||!cardSheet)return;
cardSheetOverlay.classList.remove('open');
cardSheet.classList.remove('open');
cardSheet.setAttribute('aria-hidden','true');
document.body.classList.remove('overflow-hidden');
cardSheetState.selectedVariantId=null;
cardSheetState.selections={};
if(cardSheetSizes){cardSheetSizes.innerHTML='';cardSheetSizes.classList.remove('is-grouped');}
if(cardSheetAdd){cardSheetAdd.disabled=true;cardSheetAdd.textContent='Select options';}
}

function getInlineQuickAddProduct(btn){
if(!btn)return null;
if(btn._quickAddProduct)return btn._quickAddProduct;
var optionsRaw=btn.getAttribute('data-quick-add-options');
var variantsRaw=btn.getAttribute('data-quick-add-variants');
if(!optionsRaw||!variantsRaw)return null;
try{
var payload={options:JSON.parse(optionsRaw),variants:JSON.parse(variantsRaw)};
btn._quickAddProduct=payload;
return payload;
}catch(e){
return null;
}
}

/* ── Quick-add variant selection sheet (supports any options: Color, Size…) ── */
function sheetEsc(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}
function sheetOptionIsColor(name){var n=(name||'').toLowerCase();return n.indexOf('color')>-1||n.indexOf('colour')>-1}
function sheetColorHex(name){
var c=(name||'').toLowerCase().trim();
var map={black:'#222222',white:'#ffffff','off white':'#faf7f0',offwhite:'#faf7f0',beige:'#e8dcc4',cream:'#f3ead3',ivory:'#fffff0',red:'#c0392b',maroon:'#800000',wine:'#722f37',burgundy:'#800020',pink:'#e6749b','dusty pink':'#dcae96','rani pink':'#e91e76',blue:'#2c5fb3',navy:'#1b2a4a','sky blue':'#87ceeb','royal blue':'#4169e1',teal:'#008080',green:'#2e7d32',olive:'#6b8e23','olive green':'#6b8e23',sage:'#9dc183','sage green':'#9dc183','bottle green':'#006a4e',mint:'#98ff98',yellow:'#e1ad01',mustard:'#e1ad01',orange:'#e8772e',peach:'#ffcba4',coral:'#ff7f50',rust:'#b7410e',brown:'#7b4a24',grey:'#808080',gray:'#808080',charcoal:'#36454f',lavender:'#b57edc',purple:'#7e57c2',mauve:'#e0b0ff',turquoise:'#40e0d0',multi:'conic-gradient(red,orange,yellow,green,blue,violet,red)',multicolor:'conic-gradient(red,orange,yellow,green,blue,violet,red)'};
return map[c]||c;
}
function sheetFindVariant(productData){
for(var i=0;i<productData.variants.length;i++){
var v=productData.variants[i];var ok=true;
for(var k=0;k<productData.options.length;k++){
if(cardSheetState.selections[k]==null){ok=false;break}
if((v.options||[])[k]!==cardSheetState.selections[k]){ok=false;break}
}
if(ok)return v;
}
return null;
}
function sheetValueAvailable(productData,optIndex,value){
for(var i=0;i<productData.variants.length;i++){
var v=productData.variants[i];
if(!v.available)continue;
if((v.options||[])[optIndex]!==value)continue;
var ok=true;
for(var k=0;k<productData.options.length;k++){
if(k===optIndex)continue;
var sel=cardSheetState.selections[k];
if(sel!=null&&(v.options||[])[k]!==sel){ok=false;break}
}
if(ok)return true;
}
return false;
}
function sheetUpdateAddState(productData){
var unselected=[];
for(var k=0;k<productData.options.length;k++){if(cardSheetState.selections[k]==null)unselected.push(productData.options[k])}
if(unselected.length){
cardSheetState.selectedVariantId=null;
cardSheetAdd.disabled=true;
cardSheetAdd.textContent='Select '+unselected.join(' & ');
return;
}
var match=sheetFindVariant(productData);
if(match&&match.available){
cardSheetState.selectedVariantId=match.id;
cardSheetAdd.disabled=false;
cardSheetAdd.textContent='Add to Cart';
}else{
cardSheetState.selectedVariantId=null;
cardSheetAdd.disabled=true;
cardSheetAdd.textContent='Unavailable';
}
}
function sheetRender(productData){
cardSheetSizes.innerHTML='';
cardSheetSizes.classList.add('is-grouped');
for(var k=0;k<productData.options.length;k++){
var optName=productData.options[k]||('Option '+(k+1));
var isColor=sheetOptionIsColor(optName);
var sel=cardSheetState.selections[k];
var group=document.createElement('div');
group.className='size-sheet__group';
group.innerHTML='<div class="size-sheet__group-label"><span>'+sheetEsc(optName)+'</span>'+(sel?'<span class="size-sheet__group-value">'+sheetEsc(sel)+'</span>':'')+'</div>';
var values=document.createElement('div');
values.className='size-sheet__values';
var seen={};
for(var i=0;i<productData.variants.length;i++){
var val=(productData.variants[i].options||[])[k];
if(val==null||seen[val])continue;seen[val]=true;
var b=document.createElement('button');
b.type='button';
b.className=isColor?'size-sheet__size size-sheet__size--color':'size-sheet__size';
b.setAttribute('data-option-index',k);
b.setAttribute('data-value',val);
if(isColor){b.innerHTML='<span class="size-sheet__swatch" style="background:'+sheetColorHex(val)+'"></span><span>'+sheetEsc(val)+'</span>'}
else{b.textContent=val}
if(cardSheetState.selections[k]===val)b.classList.add('selected');
if(!sheetValueAvailable(productData,k,val))b.classList.add('unavailable');
values.appendChild(b);
}
group.appendChild(values);
cardSheetSizes.appendChild(group);
}
}
function openCardSizeSheet(productData){
if(!cardSheetOverlay||!cardSheet||!cardSheetSizes||!cardSheetAdd)return false;
if(!productData||!productData.options||!productData.options.length)return false;
if(productData.options.length===1&&(productData.options[0]||'').toLowerCase()==='title')return false;
cardSheetState.selections={};
cardSheetState.selectedVariantId=null;
/* Auto-select any option that has only one possible value */
for(var k=0;k<productData.options.length;k++){
var seen={};var list=[];
for(var i=0;i<productData.variants.length;i++){var vv=(productData.variants[i].options||[])[k];if(vv!=null&&!seen[vv]){seen[vv]=true;list.push(vv)}}
if(list.length===1)cardSheetState.selections[k]=list[0];
}
var sheetTitleEl=cardSheet.querySelector('.size-sheet__title');
if(sheetTitleEl)sheetTitleEl.textContent='Select options';
sheetRender(productData);
sheetUpdateAddState(productData);
cardSheetOverlay.classList.add('open');
cardSheet.classList.add('open');
cardSheet.setAttribute('aria-hidden','false');
document.body.classList.add('overflow-hidden');
return true;
}

if(cardSheetOverlay)cardSheetOverlay.addEventListener('click',closeCardSizeSheet);
if(cardSheetCloseBtn)cardSheetCloseBtn.addEventListener('click',closeCardSizeSheet);

if(cardSheetSizes)cardSheetSizes.addEventListener('click',function(e){
var btn=e.target.closest('.size-sheet__size');
if(!btn||btn.classList.contains('unavailable'))return;
if(!cardSheetState.activeBtn)return;
var productData=cardSheetState.activeBtn._quickAddProduct;
if(!productData)return;
var k=parseInt(btn.getAttribute('data-option-index'),10);
var val=btn.getAttribute('data-value');
if(cardSheetState.selections[k]===val){delete cardSheetState.selections[k]}
else{cardSheetState.selections[k]=val}
sheetRender(productData);
sheetUpdateAddState(productData);
});

if(cardSheetAdd)cardSheetAdd.addEventListener('click',function(){
if(!cardSheetState.selectedVariantId||!cardSheetState.activeBtn)return;
var triggerBtn=cardSheetState.activeBtn;
var original=triggerBtn._quickAddOrigHtml||triggerBtn.innerHTML;
setButtonState(triggerBtn,'Adding...',true);
this.disabled=true;
addVariantToCart(cardSheetState.selectedVariantId).then(function(){
closeCardSizeSheet();
setButtonState(triggerBtn,'Added!',true);
refreshCart(function(){
openCartDrawer();
setTimeout(function(){triggerBtn.innerHTML=original;triggerBtn.disabled=false},500);
});
}).catch(function(){
setButtonState(triggerBtn,'Error',true);
setTimeout(function(){triggerBtn.innerHTML=original;triggerBtn.disabled=false},1500);
if(window.sakhiToast)window.sakhiToast.error('Could not add to cart. Please try again.');
});
});

document.addEventListener('click',function(e){
/* Quick-view: navigate to product page */
var qv=e.target.closest('[data-quick-view]');
if(qv){e.preventDefault();var url=qv.getAttribute('data-quick-view');if(url)window.location.href=url;return}
/* Quick-add with variant selection (product cards with multiple variants) */
var sizeQuickBtn=e.target.closest('[data-quick-add-handle]');
if(sizeQuickBtn){
e.preventDefault();
if(sizeQuickBtn.disabled)return;
var fallbackUrl=sizeQuickBtn.getAttribute('data-quick-add-url');
var productData=getInlineQuickAddProduct(sizeQuickBtn);
if(!productData){if(fallbackUrl)window.location.href=fallbackUrl;return;}
cardSheetState.activeBtn=sizeQuickBtn;
if(!openCardSizeSheet(productData)&&fallbackUrl)window.location.href=fallbackUrl;
return;
}
/* Quick-add to cart */
var btn=e.target.closest('[data-quick-add]');
if(!btn)return;
e.preventDefault();
var variantId=btn.getAttribute('data-quick-add');
if(!variantId)return;
var card=btn.closest('.product-card');
var pTitle=card?(card.querySelector('.product-card__title')||{}).textContent:'';
pTitle=(pTitle||'').trim();
var orig=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span>Adding...</span>';
addVariantToCart(variantId).then(()=>{
btn.innerHTML='<span>Added!</span>';
refreshCart(function(){
openCartDrawer();
setTimeout(function(){btn.innerHTML=orig;btn.disabled=false},400);
});
}).catch(()=>{btn.innerHTML='<span>Error</span>';setTimeout(()=>{btn.innerHTML=orig;btn.disabled=false},1500);
if(window.sakhiToast)window.sakhiToast.error('Could not add to cart. Please try again.');
});
});
}
initQuickAdd();

/* === ADD TO CART FORM (product page) === */
var ATC_ICON='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';
var ATC_CHECK='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
function resetATCBtn(btn){
if(!btn)return;btn.disabled=false;btn.classList.remove('is-loading','is-added');
var isMobile=btn.closest('.product-info__cta-group');
if(isMobile){btn.innerHTML='Add to Cart'}else{btn.innerHTML=ATC_ICON+' Add to Cart'}
}
function setATCBtnsState(form,state){
var btns=form.querySelectorAll('[type="submit"]');
btns.forEach(function(btn){
if(state==='loading'){btn.disabled=true;btn.classList.add('is-loading');btn.innerHTML='<span class="btn-spinner"></span> Adding...';}
else if(state==='added'){btn.classList.remove('is-loading');btn.classList.add('is-added');btn.innerHTML=ATC_CHECK+' Added!';}
else if(state==='error'){btn.classList.remove('is-loading');btn.innerHTML='Error \u2014 Try Again';}
});
}
/* Helper: check if color is selected (inline version for reliability) */
function hasColorOptionSelected(formEl){
var el=formEl||document;
var colorOpt=null;
el.querySelectorAll('.product-option').forEach(function(o){
var n=(o.getAttribute('data-option-name')||'').toLowerCase();
if(n==='color'||n==='colour'||n.indexOf('color')>-1||n.indexOf('colour')>-1)colorOpt=o;
});
if(!colorOpt)return true;/* no color option = no need to select */
var colorVals=colorOpt.querySelectorAll('.product-option__value');
if(colorVals.length===1){/* single color — auto-select silently, skip popup */
if(!colorVals[0].classList.contains('selected'))colorVals[0].click();
return true;
}
var selected=colorOpt.querySelector('.product-option__value.selected');
return !!selected;
}
function initAddToCart(){
$$('[data-add-to-cart],[data-product-form]').forEach(f=>{if(f.__atcInit)return;f.__atcInit=true;f.addEventListener('submit',function(e){e.preventDefault();if(window.__buyNowInProgress)return;var btns=this.querySelectorAll('[type="submit"]');if(!btns.length)return;if(btns[0].classList.contains('is-loading'))return;
var form=this;
var pdpForm=$('[data-product-form]')||form;
/* If size not yet selected, hand off to size sheet and abort — check DOM directly */
var sizeOpt=pdpForm.querySelector('.product-option[data-option-name="Size"]')||pdpForm.querySelector('.product-option[data-option-name="Sizes"]');
if(sizeOpt&&!sizeOpt.querySelector('.product-option__value.selected')){if(pdpForm._openSizeSheet)pdpForm._openSizeSheet('cart');return;}
/* If color not yet selected, hand off to color sheet and abort */
if(!hasColorOptionSelected(pdpForm)){if(pdpForm._openColorSheet)pdpForm._openColorSheet('cart');else if(window.sakhiToast)window.sakhiToast.error('Please select a colour');return;}
var hiddenInput=form.querySelector('input[name="id"]');
var qtyInput=form.querySelector('input[name="quantity"]');
var variantId=hiddenInput?parseInt(hiddenInput.value,10):0;
if(!variantId){setATCBtnsState(form,'error');setTimeout(()=>{form.querySelectorAll('[type="submit"]').forEach(resetATCBtn)},1500);return;}
setATCBtnsState(form,'loading');
var pdpTitle=(document.querySelector('.product-info__title')||{}).textContent||'';
pdpTitle=(pdpTitle||'').trim();
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:variantId,quantity:parseInt(qtyInput&&qtyInput.value||1,10)||1}]})}).then(r=>{if(!r.ok)throw new Error('Add failed');return r.json()}).then(()=>{
setATCBtnsState(form,'added');
refreshCart(function(){openCartDrawer();setTimeout(function(){form.querySelectorAll('[type="submit"]').forEach(resetATCBtn)},500)});
}).catch(()=>{setATCBtnsState(form,'error');setTimeout(()=>{form.querySelectorAll('[type="submit"]').forEach(resetATCBtn)},1500);
if(window.sakhiToast)window.sakhiToast.error('Could not add to bag. Please try again.');
})})});
}
initAddToCart();

/* Add to Cart click intercept — moved inside initSizeSheet for direct isSizeSelected access */

/* === FOOTER MOBILE TOGGLE === */
function initFooterToggle(){
$$('.site-footer__toggle').forEach(btn=>{
if(btn.__ftInit)return;btn.__ftInit=true;
btn.addEventListener('click',function(){
this.closest('.site-footer__menu-col').classList.toggle('open');
});
});
}
initFooterToggle();

/* === PRODUCT GALLERY SLIDER === */
function initProductGallery(){
/* Slider gallery */
$$('.product-gallery--slider').forEach(function(gallery){
var track=gallery.querySelector('.product-gallery__track');
var slides=gallery.querySelectorAll('.product-gallery__slide');
var dots=gallery.querySelectorAll('.product-gallery__dot');
var counterCurrent=gallery.querySelector('[data-gallery-current]');
if(!track||slides.length<2)return;
if(gallery.__galInit)return;gallery.__galInit=true;
var current=0,dragging=false,startX=0,currentTranslate=0,prevTranslate=0;
var DRAG_THRESHOLD=10,isDragged=false;
gallery._isDragged=false;

function goTo(idx,smooth){
if(idx<0)idx=0;
if(idx>=slides.length)idx=slides.length-1;
current=idx;
currentTranslate=-(current*100);
prevTranslate=currentTranslate;
track.style.transition=smooth!==false?'transform 0.5s cubic-bezier(.22,1,.36,1)':'none';
track.style.transform='translate3d('+currentTranslate+'%,0,0)';
dots.forEach(function(d,i){d.classList.toggle('active',i===current)});
if(counterCurrent)counterCurrent.textContent=current+1;
}

/* Dot clicks */
dots.forEach(function(dot){
dot.addEventListener('click',function(){goTo(parseInt(this.getAttribute('data-slide')))});
});

/* Touch swipe */
var startY=0,isHorizontal=null;
track.addEventListener('touchstart',function(e){
dragging=true;isDragged=false;isHorizontal=null;
startX=e.touches[0].clientX;
startY=e.touches[0].clientY;
track.style.transition='none';
},{passive:true});
track.addEventListener('touchmove',function(e){
if(!dragging)return;
var dx=e.touches[0].clientX-startX;
var dy=e.touches[0].clientY-startY;
if(isHorizontal===null&&(Math.abs(dx)>5||Math.abs(dy)>5)){
isHorizontal=Math.abs(dx)>Math.abs(dy);
}
if(isHorizontal===false)return;
if(Math.abs(dx)>DRAG_THRESHOLD){isDragged=true;gallery._isDragged=true}
if(isDragged){
e.preventDefault();
var pct=prevTranslate+(dx/track.parentElement.offsetWidth)*100;
track.style.transform='translate3d('+pct+'%,0,0)';
}
},{passive:false});
track.addEventListener('touchend',function(e){
if(!dragging)return;
dragging=false;
if(!isDragged){gallery._isDragged=false;return}
var dx=e.changedTouches[0].clientX-startX;
var threshold=track.parentElement.offsetWidth*0.2;
if(dx<-threshold)goTo(current+1);
else if(dx>threshold)goTo(current-1);
else goTo(current);
isDragged=false;
setTimeout(function(){gallery._isDragged=false},80);
});

/* Mouse drag */
track.addEventListener('mousedown',function(e){
dragging=true;isDragged=false;
startX=e.clientX;
track.style.transition='none';
track.style.cursor='grabbing';
e.preventDefault();
});
document.addEventListener('mousemove',function(e){
if(!dragging)return;
var dx=e.clientX-startX;
if(Math.abs(dx)>DRAG_THRESHOLD){isDragged=true;gallery._isDragged=true}
if(isDragged){
var pct=prevTranslate+(dx/track.parentElement.offsetWidth)*100;
track.style.transform='translate3d('+pct+'%,0,0)';
}
});
document.addEventListener('mouseup',function(){
if(!dragging)return;
dragging=false;
track.style.cursor='';
if(!isDragged){gallery._isDragged=false;return}
/* snap to nearest */
var rect=track.getBoundingClientRect();
var slideW=track.parentElement.offsetWidth;
var currentOffset=rect.left-track.parentElement.getBoundingClientRect().left;
var idx=Math.round(-currentOffset/slideW);
goTo(Math.max(0,Math.min(idx,slides.length-1)));
isDragged=false;
setTimeout(function(){gallery._isDragged=false},80);
});

/* Prevent click after drag */
track.addEventListener('click',function(e){
if(gallery._isDragged){e.preventDefault();e.stopPropagation()}
},true);

/* Zoom on hover (desktop) */
slides.forEach(function(slide){
var img=slide.querySelector('img');if(!img)return;
slide.addEventListener('mousemove',function(e){
if(window.innerWidth<769)return;
var r=slide.getBoundingClientRect();
img.style.transformOrigin=(e.clientX-r.left)/r.width*100+'% '+(e.clientY-r.top)/r.height*100+'%';
img.style.transform='scale(1.5)';
});
slide.addEventListener('mouseleave',function(){img.style.transform='scale(1)'});
});

/* Arrow navigation */
var prevArr=gallery.querySelector('.product-gallery__arrow--prev');
var nextArr=gallery.querySelector('.product-gallery__arrow--next');
if(prevArr)prevArr.addEventListener('click',function(e){e.stopPropagation();goTo(current-1)});
if(nextArr)nextArr.addEventListener('click',function(e){e.stopPropagation();goTo(current+1)});

goTo(0,false);
gallery._goTo=goTo;
});

/* Legacy thumb gallery */
var mi=$('.product-gallery__main img'),ths=$$('.product-gallery__thumb');
if(mi&&ths.length){
ths.forEach(function(th){th.addEventListener('click',function(){var ns=this.dataset.fullImage||this.querySelector('img').src;mi.style.opacity='0';mi.style.transform='scale(0.95)';setTimeout(function(){mi.src=ns;mi.removeAttribute('srcset');mi.style.opacity='1';mi.style.transform='scale(1)'},300);ths.forEach(function(t){t.classList.remove('active')});this.classList.add('active')})});
if(mi){var ct=mi.parentElement;ct.addEventListener('mousemove',function(e){if(window.innerWidth<769)return;var r=ct.getBoundingClientRect();mi.style.transformOrigin=(e.clientX-r.left)/r.width*100+'% '+(e.clientY-r.top)/r.height*100+'%';mi.style.transform='scale(1.5)'});ct.addEventListener('mouseleave',function(){mi.style.transform='scale(1)'})}
}
}
initProductGallery();

/* === PRODUCT OPTIONS === */
function fmtPrice(n){var s=n.toFixed(2).replace(/\.00$/,'');var p=s.split('.');p[0]=p[0].replace(/\B(?=(\d{2})+(\d)(?!\d))/g,',');return p.join('.')}
function initProductOptions(){
var form=$('[data-product-form]');if(!form||form.__optInit)return;form.__optInit=true;
var variantJson=form.querySelector('[data-product-variants]');
var variants=variantJson?JSON.parse(variantJson.textContent):[];
var hiddenInput=form.querySelector('input[name="id"]');
var addBtn=form.querySelector('[type="submit"]');
var gallery=$('.product-gallery--slider');
var gallerySlides=gallery?gallery.querySelectorAll('.product-gallery__slide'):[];
var galleryDots=gallery?gallery.querySelectorAll('.product-gallery__dot'):[];

function syncVariantImage(match,clickedEl){
var targetIndex=-1;
if(match&&match.featured_image&&match.featured_image.position){
targetIndex=match.featured_image.position-1;
}
if(targetIndex<0&&clickedEl){
var clickedOpt=clickedEl.closest('.product-option');
if(clickedOpt){
var optName=(clickedOpt.getAttribute('data-option-name')||'').toLowerCase();
var isColor=(optName==='color'||optName==='colour'||optName==='colors'||optName==='colours');
if(isColor){
var clickedVal=clickedEl.getAttribute('data-value');
var optIdx=parseInt(clickedOpt.getAttribute('data-option-index')||'0',10);
for(var vi=0;vi<variants.length;vi++){
if(variants[vi].options&&variants[vi].options[optIdx]===clickedVal&&variants[vi].featured_image&&variants[vi].featured_image.position){
targetIndex=variants[vi].featured_image.position-1;break;
}
}
}
}
}
if(targetIndex<0&&gallerySlides.length>1){
var colorOpt=null;
form.querySelectorAll('.product-option').forEach(function(o){
var n=(o.getAttribute('data-option-name')||'').toLowerCase();
if(n==='color'||n==='colour'||n==='colors'||n==='colours'){colorOpt=o;}
});
if(colorOpt){
var colorVals=colorOpt.querySelectorAll('.product-option__value');
var selColor=colorOpt.querySelector('.product-option__value.selected');
if(colorVals.length&&selColor){
var cIdx=Array.prototype.indexOf.call(colorVals,selColor);
if(cIdx>=0&&gallerySlides.length>=colorVals.length){
var perColor=Math.floor(gallerySlides.length/colorVals.length);
targetIndex=cIdx*perColor;
}
}
}
}
if(targetIndex<0)return;
if(gallery&&gallery._goTo){gallery._goTo(targetIndex);return;}
var track=gallery?gallery.querySelector('.product-gallery__track'):null;
if(track){
track.style.transition='transform 0.45s cubic-bezier(.25,.46,.45,.94)';
track.style.transform='translate3d('+(-(targetIndex*100))+'%,0,0)';
if(galleryDots.length){galleryDots.forEach(function(d,i){d.classList.toggle('active',i===targetIndex)});}
var ctr=gallery.querySelector('[data-gallery-current]');
if(ctr)ctr.textContent=targetIndex+1;
}
}

$$('.product-option__value').forEach(function(v){
v.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();this.click()}});
v.addEventListener('click',function(){
this.closest('.product-option__values').querySelectorAll('.product-option__value').forEach(function(x){x.classList.remove('selected');x.setAttribute('aria-pressed','false')});
this.classList.add('selected');
this.setAttribute('aria-pressed','true');
/* Update color label display */
var _optGrp=this.closest('.product-option');
var _selValSpan=_optGrp?_optGrp.querySelector('.product-option__selected-val'):null;
if(_selValSpan)_selValSpan.textContent=': '+this.getAttribute('data-value');
/* Build selected options array */
var selected=[];
form.querySelectorAll('.product-option').forEach(function(opt){
var active=opt.querySelector('.product-option__value.selected');
if(active)selected.push(active.getAttribute('data-value'));
});
/* Find matching variant */
var match=null;
for(var i=0;i<variants.length;i++){
var v=variants[i];var opts=v.options||[];var isMatch=true;
for(var j=0;j<selected.length;j++){if(opts[j]!==selected[j]){isMatch=false;break}}
if(isMatch){match=v;break}
}
/* Always sync gallery image — works even without a full variant match */
syncVariantImage(match,this);
if(match&&hiddenInput){
hiddenInput.value=match.id;
/* Update price display */
var pdpWrap=form.closest('.product-info,.product-page');
var priceWrap=pdpWrap?pdpWrap.querySelector('.product-info__price-wrap'):null;
if(priceWrap&&match.price){
var amt=match.price/100;
var tagMrp=parseInt(priceWrap.getAttribute('data-tag-mrp'),10)||0;
var cmp=match.compare_at_price?(match.compare_at_price/100):0;
var mrpVal=(cmp>amt)?cmp:((tagMrp>amt)?tagMrp:0);
var priceEl=priceWrap.querySelector('.product-info__price');
var compareEl=priceWrap.querySelector('.product-info__compare-price');
var badgeEl=priceWrap.querySelector('.product-info__save-badge');
var savingsEl=priceWrap.querySelector('.product-info__savings');
var priceRow=priceWrap.querySelector('.product-info__price-row');
if(mrpVal>0){
var pctOff=Math.round((mrpVal-amt)*100/mrpVal);
var saveAmt=mrpVal-amt;
/* Ensure row structure exists */
if(!priceRow){
priceRow=document.createElement('div');priceRow.className='product-info__price-row';
if(priceEl){priceWrap.insertBefore(priceRow,priceEl);priceRow.appendChild(priceEl)}
if(!compareEl){compareEl=document.createElement('span');compareEl.className='product-info__compare-price';priceRow.appendChild(compareEl)}
if(!badgeEl){badgeEl=document.createElement('span');badgeEl.className='product-info__save-badge';priceRow.appendChild(badgeEl)}
if(!savingsEl){savingsEl=document.createElement('p');savingsEl.className='product-info__savings';priceWrap.insertBefore(savingsEl,priceRow.nextSibling)}
}else{
if(!compareEl){compareEl=document.createElement('span');compareEl.className='product-info__compare-price';priceRow.appendChild(compareEl)}
if(!badgeEl){badgeEl=document.createElement('span');badgeEl.className='product-info__save-badge';priceRow.appendChild(badgeEl)}
if(!savingsEl){savingsEl=document.createElement('p');savingsEl.className='product-info__savings';priceWrap.insertBefore(savingsEl,priceRow.nextSibling)}
}
if(priceEl){priceEl.textContent='\u20b9'+fmtPrice(amt);priceEl.classList.add('product-info__price--on-sale')}
compareEl.innerHTML='<s>\u20b9'+fmtPrice(mrpVal)+'</s>';compareEl.style.display='';
badgeEl.textContent=pctOff+'% OFF';badgeEl.style.display='';
savingsEl.textContent='You save \u20b9'+fmtPrice(saveAmt)+' on this product';savingsEl.style.display='';
}else{
if(priceEl){priceEl.textContent='\u20b9'+fmtPrice(amt);priceEl.classList.remove('product-info__price--on-sale')}
if(compareEl)compareEl.style.display='none';
if(badgeEl)badgeEl.style.display='none';
if(savingsEl)savingsEl.style.display='none';
}
}
/* Update availability */
if(addBtn){
if(match.available){addBtn.disabled=false;addBtn.textContent='Add to Cart'}
else{addBtn.disabled=true;addBtn.textContent='Sold Out'}
}
}else if(!match&&addBtn){
addBtn.disabled=true;addBtn.textContent='Unavailable';
}
});
});
/* Auto-select any option that has exactly one value (e.g. single-color products) */
form.querySelectorAll('.product-option').forEach(function(opt){
var vals=opt.querySelectorAll('.product-option__value');
if(vals.length===1&&!vals[0].classList.contains('selected'))vals[0].click();
});
}
initProductOptions();

/* === SIZE PICKER BOTTOM SHEET === */
function initSizeSheet(){
var form=$('[data-product-form]');if(!form)return;
var overlay=$('#size-sheet-overlay'),sheet=$('#size-sheet'),sizesWrap=$('#size-sheet-sizes'),sheetAddBtn=$('#size-sheet-add');
if(!overlay||!sheet||!sizesWrap||!sheetAddBtn)return;
var variantJson=form.querySelector('[data-product-variants]');
var variants=variantJson?JSON.parse(variantJson.textContent):[];
var hiddenInput=form.querySelector('input[name="id"]');
var pendingAction=null;/* 'cart' or 'buy' */
var pendingVariantId=null;

/* Find the size option element */
function getSizeOption(){
var opts=form.querySelectorAll('.product-option');
for(var i=0;i<opts.length;i++){
var name=(opts[i].getAttribute('data-option-name')||'').toLowerCase();
if(name==='size'||name==='sizes')return opts[i];
}
return null;
}

function isSizeSelected(){
var sizeOpt=getSizeOption();
if(!sizeOpt)return true;/* no size option = no need to select */
return !!sizeOpt.querySelector('.product-option__value.selected');
}

/* Populate sheet with sizes from the size option */
function populateSheet(){
sizesWrap.innerHTML='';
var sizeOpt=getSizeOption();if(!sizeOpt)return;
var idx=parseInt(sizeOpt.getAttribute('data-option-index'));
sizeOpt.querySelectorAll('.product-option__value').forEach(function(v){
var val=v.getAttribute('data-value');
var btn=document.createElement('button');
btn.type='button';
btn.className='size-sheet__size';
btn.textContent=val;
btn.setAttribute('data-value',val);
/* Check availability: see if ANY variant with this size value is available */
var available=false;
for(var i=0;i<variants.length;i++){
if(variants[i].options&&variants[i].options[idx]===val&&variants[i].available){available=true;break}
}
if(!available)btn.classList.add('unavailable');
sizesWrap.appendChild(btn);
});
sheetAddBtn.disabled=true;
sheetAddBtn.textContent='Select a size';
}

function openSheet(action){
pendingAction=action;
pendingVariantId=null;
populateSheet();
overlay.classList.add('open');
sheet.classList.add('open');
sheet.setAttribute('aria-hidden','false');
document.body.classList.add('overflow-hidden');
}

function closeSheet(){
overlay.classList.remove('open');
sheet.classList.remove('open');
sheet.setAttribute('aria-hidden','true');
document.body.classList.remove('overflow-hidden');
pendingAction=null;
pendingVariantId=null;
}

overlay.addEventListener('click',closeSheet);
var sheetCloseBtn=sheet.querySelector('.size-sheet__close');if(sheetCloseBtn)sheetCloseBtn.addEventListener('click',closeSheet);
/* Expose size helpers so initAddToCart can call them */
form._isSizeSelected=isSizeSelected;
form._openSizeSheet=openSheet;

/* Size selection inside sheet */
sizesWrap.addEventListener('click',function(e){
var btn=e.target.closest('.size-sheet__size');
if(!btn||btn.classList.contains('unavailable'))return;
sizesWrap.querySelectorAll('.size-sheet__size').forEach(function(b){b.classList.remove('selected')});
btn.classList.add('selected');
var sizeValue=btn.getAttribute('data-value');
var sizeOpt=getSizeOption();
var sizeIdx=sizeOpt?parseInt(sizeOpt.getAttribute('data-option-index')):0;
/* Build full options array for direct variant lookup */
var currentOpts=[];
form.querySelectorAll('.product-option').forEach(function(opt){
var i=parseInt(opt.getAttribute('data-option-index'));
if(i===sizeIdx){currentOpts[i]=sizeValue;}
else{var a=opt.querySelector('.product-option__value.selected');if(a)currentOpts[i]=a.getAttribute('data-value');}
});
/* Find matching available variant directly from variants JSON — no hidden-input dependency */
pendingVariantId=null;
for(var vi=0;vi<variants.length;vi++){
var vv=variants[vi];var vopts=vv.options||[];var vMatch=true;
for(var vj=0;vj<currentOpts.length;vj++){if(currentOpts[vj]!==undefined&&vopts[vj]!==currentOpts[vj]){vMatch=false;break}}
if(vMatch&&vv.available){pendingVariantId=vv.id;break}
}
sheetAddBtn.disabled=!pendingVariantId;
sheetAddBtn.textContent=pendingVariantId?(pendingAction==='buy'?'Buy Now':'Add to Cart'):'Unavailable';
/* Also update main form UI (price, availability) via initProductOptions */
if(sizeOpt){
var mainBtn=sizeOpt.querySelector('.product-option__value[data-value="'+sizeValue+'"]');
if(mainBtn)mainBtn.click();
}
});

/* Sheet add button */
sheetAddBtn.addEventListener('click',function(){
if(this.disabled||!pendingVariantId)return;
var action=pendingAction;
if(action==='buy'){
closeSheet();
window.__buyNowInProgress=true;
var buyBtn=document.querySelector('[data-buy-now]');
if(buyBtn)buyBtn.click();
return;
}
/* Check if color is selected before adding to cart */
if(!hasColorOptionSelected(form)){
if(form._openColorSheet){
closeSheet();
form._openColorSheet('cart');
}else{
/* No color sheet available - show error and keep size sheet open */
if(window.sakhiToast)window.sakhiToast.error('Please select a colour');
}
return;
}
var addBtn=sheetAddBtn;
addBtn.disabled=true;
addBtn.textContent='Adding...';
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:pendingVariantId,quantity:1}]})}).then(function(r){if(!r.ok)throw new Error('Add failed');return r.json()}).then(function(){
closeSheet();
var submitBtns=form.querySelectorAll('[type="submit"]');
submitBtns.forEach(function(b){b.classList.add('is-added');b.innerHTML=ATC_CHECK+' Added!'});
refreshCart(function(){openCartDrawer();setTimeout(function(){submitBtns.forEach(resetATCBtn)},700)});
}).catch(function(){addBtn.disabled=false;addBtn.textContent='Add to Cart';});
});

/* Size/color intercepts for both Buy Now and Add to Cart are below */

/* Intercept Buy Now */
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-buy-now]');
if(!btn)return;
var pdpForm=$('[data-product-form]');
if(!isSizeSelected()){
e.preventDefault();
e.stopImmediatePropagation();
openSheet('buy');
return;
}
/* Also check color if needed — use inline check for reliability */
if(!hasColorOptionSelected(pdpForm)){
e.preventDefault();
e.stopImmediatePropagation();
if(pdpForm&&pdpForm._openColorSheet)pdpForm._openColorSheet('buy');
else if(window.sakhiToast)window.sakhiToast.error('Please select a colour');
}
},true);/* capture phase */

/* Intercept Add to Cart — uses isSizeSelected() directly for reliability */
document.addEventListener('click',function(e){
var btn=e.target.closest('[type="submit"]');
if(!btn)return;
var pdpForm=btn.closest('[data-product-form],[data-add-to-cart]');
if(!pdpForm)return;
/* Check size first */
if(!isSizeSelected()){
e.preventDefault();
e.stopImmediatePropagation();
openSheet('cart');
return;
}
/* Check color */
if(!hasColorOptionSelected(pdpForm)){
e.preventDefault();
e.stopImmediatePropagation();
if(pdpForm._openColorSheet)pdpForm._openColorSheet('cart');
else if(window.sakhiToast)window.sakhiToast.error('Please select a colour');
return;
}
},true);/* capture phase */
}
initSizeSheet();

/* === COLOR PICKER BOTTOM SHEET === */
function initColorSheet(){
var form=$('[data-product-form]');if(!form)return;
var overlay=$('#color-sheet-overlay'),sheet=$('#color-sheet'),colorsWrap=$('#color-sheet-colors'),sheetAddBtn=$('#color-sheet-add');
var hasSheetUI=overlay&&sheet&&colorsWrap&&sheetAddBtn;
var variantJson=form.querySelector('[data-product-variants]');
var variants=variantJson?JSON.parse(variantJson.textContent):[];
var hiddenInput=form.querySelector('input[name="id"]');
var pendingAction=null;
var pendingVariantId=null;

function getColorOption(){
var opts=form.querySelectorAll('.product-option');
for(var i=0;i<opts.length;i++){
var name=(opts[i].getAttribute('data-option-name')||'').toLowerCase();
if(name==='color'||name==='colour'||name.indexOf('color')>-1)return opts[i];
}
return null;
}

function isColorSelected(){
var colorOpt=getColorOption();
if(!colorOpt)return true;
return !!colorOpt.querySelector('.product-option__value.selected');
}

/* Always attach the color check to form, even if no sheet UI */
form._isColorSelected=isColorSelected;

/* If no sheet UI, provide a fallback that shows toast */
if(!hasSheetUI){
form._openColorSheet=function(){
if(window.sakhiToast)window.sakhiToast.error('Please select a colour');
};
return;
}

function populateSheet(){
colorsWrap.innerHTML='';
var colorOpt=getColorOption();if(!colorOpt)return;
var idx=parseInt(colorOpt.getAttribute('data-option-index'));
colorOpt.querySelectorAll('.product-option__value').forEach(function(v){
var val=v.getAttribute('data-value');
var swatchBg=v.style.getPropertyValue('--swatch-bg')||'#ccc';
var btn=document.createElement('button');
btn.type='button';
btn.className='color-sheet__color';
btn.setAttribute('data-value',val);
btn.setAttribute('title',val);
btn.style.setProperty('--swatch-bg',swatchBg);
var available=false;
for(var i=0;i<variants.length;i++){
if(variants[i].options&&variants[i].options[idx]===val&&variants[i].available){available=true;break}
}
if(!available)btn.classList.add('unavailable');
colorsWrap.appendChild(btn);
});
sheetAddBtn.disabled=true;
sheetAddBtn.textContent='Select a colour';
}

function openSheet(action){
pendingAction=action;
pendingVariantId=null;
populateSheet();
overlay.classList.add('open');
sheet.classList.add('open');
sheet.setAttribute('aria-hidden','false');
document.body.classList.add('overflow-hidden');
}

function closeSheet(){
overlay.classList.remove('open');
sheet.classList.remove('open');
sheet.setAttribute('aria-hidden','true');
document.body.classList.remove('overflow-hidden');
pendingAction=null;
pendingVariantId=null;
}

overlay.addEventListener('click',closeSheet);
var sheetCloseBtn=sheet.querySelector('.color-sheet__close');if(sheetCloseBtn)sheetCloseBtn.addEventListener('click',closeSheet);

form._openColorSheet=openSheet;

colorsWrap.addEventListener('click',function(e){
var btn=e.target.closest('.color-sheet__color');
if(!btn||btn.classList.contains('unavailable'))return;
colorsWrap.querySelectorAll('.color-sheet__color').forEach(function(b){b.classList.remove('selected')});
btn.classList.add('selected');
var colorValue=btn.getAttribute('data-value');
var colorOpt=getColorOption();
var colorIdx=colorOpt?parseInt(colorOpt.getAttribute('data-option-index')):0;
var currentOpts=[];
form.querySelectorAll('.product-option').forEach(function(opt){
var i=parseInt(opt.getAttribute('data-option-index'));
if(i===colorIdx){currentOpts[i]=colorValue;}
else{var a=opt.querySelector('.product-option__value.selected');if(a)currentOpts[i]=a.getAttribute('data-value');}
});
pendingVariantId=null;
for(var vi=0;vi<variants.length;vi++){
var vv=variants[vi];var vopts=vv.options||[];var vMatch=true;
for(var vj=0;vj<currentOpts.length;vj++){if(currentOpts[vj]!==undefined&&vopts[vj]!==currentOpts[vj]){vMatch=false;break}}
if(vMatch&&vv.available){pendingVariantId=vv.id;break}
}
sheetAddBtn.disabled=!pendingVariantId;
sheetAddBtn.textContent=pendingVariantId?(pendingAction==='buy'?'Buy Now':'Add to Cart'):'Unavailable';
if(colorOpt){
var mainBtn=colorOpt.querySelector('.product-option__value[data-value="'+colorValue+'"]');
if(mainBtn)mainBtn.click();
}
});

sheetAddBtn.addEventListener('click',function(){
if(this.disabled||!pendingVariantId)return;
var action=pendingAction;
if(action==='buy'){
closeSheet();
window.__buyNowInProgress=true;
var buyBtn=document.querySelector('[data-buy-now]');
if(buyBtn)buyBtn.click();
return;
}
/* Check if size is selected before adding to cart */
if(form._isSizeSelected&&!form._isSizeSelected()){
if(form._openSizeSheet){
closeSheet();
form._openSizeSheet('cart');
}else{
/* No size sheet available - show error and keep color sheet open */
if(window.sakhiToast)window.sakhiToast.error('Please select a size');
}
return;
}
var addBtn=sheetAddBtn;
addBtn.disabled=true;
addBtn.textContent='Adding...';
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:pendingVariantId,quantity:1}]})}).then(function(r){if(!r.ok)throw new Error('Add failed');return r.json()}).then(function(){
closeSheet();
var submitBtns=form.querySelectorAll('[type="submit"]');
submitBtns.forEach(function(b){b.classList.add('is-added');b.innerHTML=ATC_CHECK+' Added!'});
refreshCart(function(){openCartDrawer();setTimeout(function(){submitBtns.forEach(resetATCBtn)},700)});
}).catch(function(){addBtn.disabled=false;addBtn.textContent='Add to Cart';});
});
}
initColorSheet();

/* === SIZE CHART TABS + SELECTED SIZE HIGHLIGHT === */
function initSizeChartTabs(){
var tabs=$$('.size-chart-tab');
var panels=$$('.size-chart-panel');
if(!tabs.length)return;
tabs.forEach(function(tab){
if(tab.__scInit)return;tab.__scInit=true;
tab.addEventListener('click',function(){
var target=this.getAttribute('data-sc-tab');
tabs.forEach(function(t){t.classList.remove('active')});
panels.forEach(function(p){p.classList.remove('active')});
this.classList.add('active');
var panel=document.querySelector('[data-sc-panel="'+target+'"]');
if(panel)panel.classList.add('active');
});
});
/* Highlight selected size row in chart */
function highlightSizeRow(){
var table=document.querySelector('[data-size-chart]');
if(!table)return;
var rows=table.querySelectorAll('tbody tr[data-size]');
var sizeOpt=document.querySelector('.product-option[data-option-name="Size"]')||document.querySelector('.product-option[data-option-name="Sizes"]');
var selectedVal='';
if(sizeOpt){
var sel=sizeOpt.querySelector('.product-option__value.selected');
if(sel)selectedVal=sel.getAttribute('data-value');
}
rows.forEach(function(row){
row.classList.toggle('size-active',row.getAttribute('data-size')===selectedVal);
});
}
/* Listen for size selection changes */
$$('.product-option__value').forEach(function(v){
if(v.__scSizeInit)return;v.__scSizeInit=true;
v.addEventListener('click',function(){setTimeout(highlightSizeRow,50)});
});
highlightSizeRow();
/* Close size chart on overlay click */
var overlay=document.getElementById('size-chart-modal');
if(overlay){
overlay.addEventListener('click',function(e){
if(e.target===overlay)overlay.classList.remove('open');
});
}
}
initSizeChartTabs();

/* === SIZE CHART SCROLL LOCK === */
(function(){
var overlay=document.getElementById('size-chart-modal');
if(!overlay)return;
/* Lock body scroll when size chart is open */
var obs=new MutationObserver(function(){
if(overlay.classList.contains('open')){
document.body.classList.add('overflow-hidden');
}else{
document.body.classList.remove('overflow-hidden');
}
});
obs.observe(overlay,{attributes:true,attributeFilter:['class']});
/* Prevent touch scroll on overlay from propagating */
overlay.addEventListener('touchmove',function(e){
var body=overlay.querySelector('.size-chart-modal__body');
if(body&&body.contains(e.target))return;/* allow scroll inside body */
e.preventDefault();
},{passive:false});
})();

/* === QUANTITY SELECTOR === */
function initQuantitySelector(){$$('.quantity-selector').forEach(s=>{if(s.closest('.cart-item[data-line]'))return;if(s.__qtyInit)return;s.__qtyInit=true;const m=s.querySelector('[data-qty-minus]'),p=s.querySelector('[data-qty-plus]'),i=s.querySelector('input');if(m&&p&&i){m.addEventListener('click',()=>{const v=parseInt(i.value)-1;if(v>=1)i.value=v});p.addEventListener('click',()=>{i.value=parseInt(i.value)+1})}})}
initQuantitySelector();

/* === CART PAGE QUANTITY === */
function initCartPageQty(){
$$('.cart-item[data-line] .quantity-selector').forEach(function(s){
var item=s.closest('.cart-item[data-line]');
if(!item)return;
var key=item.getAttribute('data-key')||item.getAttribute('data-line');
var m=s.querySelector('[data-qty-minus]'),p=s.querySelector('[data-qty-plus]'),i=s.querySelector('input');
if(!m||!p||!i)return;
/* Clone to remove stale listeners */
var newM=m.cloneNode(true);m.parentNode.replaceChild(newM,m);m=newM;
var newP=p.cloneNode(true);p.parentNode.replaceChild(newP,p);p=newP;
function setLoading(state){i.disabled=state;m.disabled=state;p.disabled=state;var qs=s;if(state){item.style.opacity='0.5';qs.classList.add('is-loading')}else{item.removeAttribute('style');qs.classList.remove('is-loading');m.blur();p.blur()}}
function updateCartLine(qty){
setLoading(true);
fetch(window.theme.routes.cart_change_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:qty})})
.then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
.then(function(cart){
if(qty===0){item.style.transition='opacity 0.3s,max-height 0.3s';item.style.opacity='0';item.style.maxHeight='0';item.style.overflow='hidden';item.style.padding='0';setTimeout(function(){window.location.reload()},350);
}else{i.value=qty;setLoading(false);
/* Update line total */
var totalEl=item.querySelector('.cart-item__total');
if(totalEl&&cart.items){
var cartItem=null;
for(var ci=0;ci<cart.items.length;ci++){if(cart.items[ci].key===key){cartItem=cart.items[ci];break}}
if(cartItem){totalEl.textContent=window.theme.moneyFormat.replace(/\{\{[^}]*\}\}/,(cartItem.final_line_price/100).toFixed(2))}
}
/* Update subtotal */
var subtotalEl=document.querySelector('.cart-summary__row--total');
if(subtotalEl&&cart.total_price!==undefined){var spans=subtotalEl.querySelectorAll('span');if(spans.length>1)spans[1].textContent=window.theme.moneyFormat.replace(/\{\{[^}]*\}\}/,(cart.total_price/100).toFixed(2))}
/* Update header cart count */
$$('.cart-count').forEach(function(el){el.textContent=cart.item_count});
}
}).catch(function(){setLoading(false)})
}
m.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var cur=parseInt(i.value)||1;updateCartLine(Math.max(0,cur-1))});
p.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var cur=parseInt(i.value)||1;updateCartLine(cur+1)});
i.addEventListener('change',function(){var val=parseInt(this.value);if(!isNaN(val)&&val>=0)updateCartLine(val)});
});
}
initCartPageQty();

/* === ACCORDIONS (v2 — scroll-free, scrollHeight-based) ===
   RCA: CSS max-height transition from 0→2000px causes a large layout
   shift that the browser "corrects" by scrolling. Fix: use explicit
   scrollHeight so the content expands to exactly its real height with
   no layout shift, and close collapses back to 0. */
function initAccordions(){
  $$('.accordion-trigger').forEach(tr=>{
    var ai=tr.closest('.accordion-item');
    if(!ai)return;
    var co=ai.querySelector('.accordion-content');
    if(!co)return;
    if(tr.__accInit)return;tr.__accInit=true;
    // Remove CSS max-height control; drive height via inline style
    co.style.overflow='hidden';
    co.style.transition='height 0.35s cubic-bezier(0.4,0,0.2,1)';
    if(ai.classList.contains('open')){
      co.style.height=co.scrollHeight+'px';
    } else {
      co.style.height='0px';
    }
    tr.setAttribute('aria-expanded',ai.classList.contains('open'));
    tr.addEventListener('click',function(){
      const it=this.closest('.accordion-item');
      if(!it)return;
      const content=it.querySelector('.accordion-content');
      if(!content)return;
      const isOpen=it.classList.contains('open');
      // Close all siblings first
      const pa=it.closest('.product-accordion');
      if(pa) pa.querySelectorAll('.accordion-item.open').forEach(o=>{
        if(o===it)return;
        o.classList.remove('open');
        var oc=o.querySelector('.accordion-content');
        var otr=o.querySelector('.accordion-trigger');
        if(oc)oc.style.height='0px';
        if(otr)otr.setAttribute('aria-expanded','false');
      });
      if(isOpen){
        // Collapse: set explicit px first then animate to 0
        content.style.height=content.scrollHeight+'px';
        requestAnimationFrame(()=>{
          content.style.height='0px';
        });
        it.classList.remove('open');
        this.setAttribute('aria-expanded','false');
      } else {
        var _scrollY=window.scrollY;
        // Freeze height on all ancestors up to .product-accordion so the
        // browser has nothing to scroll-anchor against during expansion
        var _anc=it.closest('.product-accordion');
        if(_anc){_anc.style.minHeight=_anc.offsetHeight+'px'}
        it.classList.add('open');
        this.setAttribute('aria-expanded','true');
        content.style.height=content.scrollHeight+'px';
        // Restore scroll instantly — belt-and-suspenders alongside CSS overflow-anchor:none
        window.scrollTo({top:_scrollY,behavior:'instant'});
        // After transition, release the frozen height and switch to auto
        content.addEventListener('transitionend',function h(){
          if(it.classList.contains('open'))content.style.height='auto';
          if(_anc)_anc.style.minHeight='';
          content.removeEventListener('transitionend',h);
        });
      }
    });
  });
}
initAccordions();

/* === LAZY LOAD === */
function initLazyLoad(){
const imgs=$$('img[data-src]');
if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const i=e.target;i.src=i.dataset.src;if(i.dataset.srcset)i.srcset=i.dataset.srcset;i.classList.add('loaded');obs.unobserve(i)}})},{rootMargin:'100px 0px'});imgs.forEach(i=>obs.observe(i))}
}
initLazyLoad();

/* === CAROUSELS === */
function initCarousels(){
$$('[data-carousel]').forEach(carousel=>{
if(carousel.__cInit)return;carousel.__cInit=true;
const track=carousel.querySelector('[data-carousel-track]');
const slides=carousel.querySelectorAll('[data-carousel-slide]');
const sec=carousel.closest('.section,section,[data-section-id]')||carousel.parentElement;
const prevBtn=carousel.querySelector('[data-carousel-prev]')||sec.querySelector('[data-carousel-prev]');
const nextBtn=carousel.querySelector('[data-carousel-next]')||sec.querySelector('[data-carousel-next]');
const dotsC=carousel.querySelector('[data-carousel-dots]');
const autoplay=carousel.dataset.carouselAutoplay==='true';
const autoSpeed=parseInt(carousel.dataset.carouselSpeed)||5000;
const loop=carousel.dataset.carouselLoop!=='false';
const perView=parseInt(carousel.dataset.carouselPerView)||1;
const center=carousel.dataset.carouselCenter==='true';
if(!track||!slides.length)return;
const vp=carousel.querySelector('.carousel__viewport')||carousel;
let idx=0,timer=null,dragging=false,isDragged=false,justDragged=false,startX=0,curTr=0,prevTr=0,rafId=null,gapPx=0,velX=0,lastX=0,lastT=0;
var DRAG_THRESHOLD=20;
function gpv(){if(window.innerWidth<=480)return Math.min(perView,1);if(window.innerWidth<=768)return Math.min(perView,2);if(window.innerWidth<=1024)return Math.min(perView,3);return perView}
function gsw(){const pv=gpv(),vpW=vp.offsetWidth;return center?(vpW/pv):((vpW-(pv-1)*gapPx)/pv)}
function ssw(){gapPx=parseFloat(getComputedStyle(track).columnGap)||0;const w=gsw();slides.forEach(s=>{s.style.width=w+'px';s.style.flexShrink='0'});if(center){const vpW=vp.offsetWidth,actualTrackW=slides.length*w+(slides.length-1)*gapPx;if(actualTrackW>vpW){const pk=(vpW-w)/2;track.style.paddingLeft=pk+'px';track.style.paddingRight=pk+'px';}else{track.style.paddingLeft='';track.style.paddingRight='';}}else{track.style.paddingLeft='';track.style.paddingRight='';}}
function gaw(){return(slides[0]&&slides[0].offsetWidth>0)?slides[0].offsetWidth:gsw()}function gmi(){if(center)return Math.max(0,slides.length-1);const sw=gaw(),vc=gapPx>0?Math.max(1,Math.round(vp.offsetWidth/(sw+gapPx))):Math.max(1,gpv());return Math.max(0,slides.length-vc);}
function mkDots(){if(!dotsC)return;dotsC.innerHTML='';const mx=gmi();for(let i=0;i<=mx;i++){const d=document.createElement('button');d.classList.add('carousel__dot');if(i===0)d.classList.add('active');d.setAttribute('aria-label','Go to slide '+(i+1));(function(x){d.addEventListener('click',()=>go(x))})(i);dotsC.appendChild(d)}}
function upDots(){if(!dotsC)return;dotsC.querySelectorAll('.carousel__dot').forEach((d,i)=>d.classList.toggle('active',i===idx))}
function upBtns(){if(!loop){if(prevBtn)prevBtn.disabled=idx<=0;if(nextBtn)nextBtn.disabled=idx>=gmi()}}
function go(i,sm){if(sm===undefined)sm=true;const mx=gmi();idx=loop?(i<0?mx:i>mx?0:i):Math.max(0,Math.min(i,mx));const step=gaw();let tx;if(center){const es=step+gapPx;tx=-(idx*es);tx=Math.max(-((slides.length-1)*es),Math.min(0,tx));slides.forEach((s,k)=>s.classList.toggle('is-active',k===idx));}else{const es=step+gapPx;tx=-(idx*es);tx=Math.max(-(gmi()*es),Math.min(0,tx));}if(sm){var dist=Math.abs(tx-curTr);var dur=Math.max(0.25,Math.min(0.55,dist/1200));track.style.transition='transform '+dur+'s cubic-bezier(.22,1,.36,1)';}else{track.style.transition='none';}track.style.transform='translate3d('+tx+'px,0,0)';prevTr=tx;upDots();upBtns()}
function next(){go(idx+1)}function prev(){go(idx-1)}
function startAP(){if(!autoplay||prefersReduced)return;stopAP();timer=setInterval(next,autoSpeed)}
function stopAP(){if(timer){clearInterval(timer);timer=null}}
function dStart(e){dragging=true;isDragged=false;startX=e.type.includes('mouse')?e.pageX:e.touches[0].clientX;velX=0;lastX=startX;lastT=Date.now();stopAP()}
function dMove(e){if(!dragging)return;var cx=e.type.includes('mouse')?e.pageX:e.touches[0].clientX;var now=Date.now();if(!isDragged&&Math.abs(cx-startX)>DRAG_THRESHOLD){isDragged=true;var cs=window.getComputedStyle(track).transform;var mat=cs.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*(-?[\d.]+)/);if(mat){prevTr=parseFloat(mat[1]);track.style.transform='translate3d('+prevTr+'px,0,0)';}track.style.transition='none';track.style.cursor='grabbing'}if(isDragged){if(e.cancelable)e.preventDefault();var dt=now-lastT;if(dt>8){velX=(cx-lastX)/dt;}lastX=cx;lastT=now;curTr=prevTr+(cx-startX);if(rafId)cancelAnimationFrame(rafId);rafId=requestAnimationFrame(function(){track.style.transform='translate3d('+curTr+'px,0,0)';rafId=null;})}}
function dEnd(){if(!dragging)return;dragging=false;track.style.cursor='';if(isDragged){if(rafId){cancelAnimationFrame(rafId);rafId=null;}var mv=curTr-prevTr;if(Math.abs(velX)>0.4||Math.abs(mv)>gaw()/5){justDragged=true;setTimeout(function(){justDragged=false},300);if(velX<-0.4||mv<0)next();else prev();}else{go(idx);}}velX=0;isDragged=false;startAP()}
track.addEventListener('click',function(e){if(justDragged){e.preventDefault();e.stopPropagation();justDragged=false}},true);
if(prevBtn)prevBtn.addEventListener('click',()=>{prev();stopAP();startAP()});
if(nextBtn)nextBtn.addEventListener('click',()=>{next();stopAP();startAP()});
track.addEventListener('touchstart',dStart,{passive:true});track.addEventListener('touchmove',dMove,{passive:false});track.addEventListener('touchend',dEnd);
track.addEventListener('mousedown',dStart);track.addEventListener('mousemove',dMove);track.addEventListener('mouseup',dEnd);track.addEventListener('mouseleave',()=>{if(dragging)dEnd()});
carousel.addEventListener('mouseenter',stopAP);carousel.addEventListener('mouseleave',startAP);
document.addEventListener('visibilitychange',function(){if(document.hidden)stopAP();else if(autoplay)startAP();});
carousel.setAttribute('tabindex','0');carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){prev();stopAP()}if(e.key==='ArrowRight'){next();stopAP()}});
let rTimer;window.addEventListener('resize',()=>{clearTimeout(rTimer);rTimer=setTimeout(()=>{ssw();mkDots();go(Math.min(idx,gmi()),false)},250)});
vp.style.touchAction='pan-y pinch-zoom';ssw();mkDots();upBtns();go(0,false);startAP();
});
}
initCarousels();

/* === VIDEO AUTOPLAY === */
function initVideoAutoplay(){
const vids=Array.from($$('video[data-autoplay-scroll]')).filter(v=>!v.__vaInit);if(!vids.length)return;
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.play().catch(()=>{});else e.target.pause()})},{threshold:0.3});
vids.forEach(v=>{v.__vaInit=true;obs.observe(v)});
}
initVideoAutoplay();

/* === SMOOTH SCROLL ANCHORS === */
$$('a[href^="#"]').forEach(a=>{a.addEventListener('click',function(e){const id=this.getAttribute('href');if(id==='#')return;const t=$(id);if(t){e.preventDefault();const off=header?header.offsetHeight:0;window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-off,behavior:'smooth'})}})});

/* === UTILITY INITS === */
function initAddressToggle(){$$('[data-toggle-address]').forEach(function(b){if(b.__addrInit)return;b.__addrInit=true;b.addEventListener('click',function(){var id=this.getAttribute('data-toggle-address');var el=document.getElementById(id);if(el)el.style.display=el.style.display==='none'?'block':'none'})});
$$('[data-delete-address]').forEach(function(b){if(b.__delInit)return;b.__delInit=true;b.addEventListener('click',function(){if(!confirm('Are you sure you want to delete this address?'))return;var url=this.getAttribute('data-delete-url');if(url)Shopify.postLink(url,{parameters:{_method:'delete'}})})})}
function initCollectionSort(){var sel=$('[data-sort-collection]');if(sel)sel.addEventListener('change',function(){window.location.href=this.value})}

/* === PRODUCT SHARE === */
function initProductShare(){
var btn=document.querySelector('[data-share-copy]');
if(!btn||btn.__shareInit)return;btn.__shareInit=true;
btn.addEventListener('click',function(){
var url=window.location.href;
if(navigator.clipboard&&window.isSecureContext){
navigator.clipboard.writeText(url).then(function(){btn.classList.add('copied');setTimeout(function(){btn.classList.remove('copied')},2000)});
}else{
var ta=document.createElement('textarea');ta.value=url;ta.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);
btn.classList.add('copied');setTimeout(function(){btn.classList.remove('copied')},2000);
}
});
}
initProductShare();

/* === PROMO CODE COPY (handled by initAvailableOffers below) === */
/* Removed duplicate global delegation — initAvailableOffers uses _copyBound
   guard so only one handler fires per button, preventing the double-toast bug. */

/* === SHOPIFY SECTION EVENTS === */
document.addEventListener('shopify:section:load',function(){initScrollAnimations();initSmoothReveal();initSectionReveals();initProductGallery();initProductOptions();initQuantitySelector();initCartPageQty();initAccordions();initLazyLoad();initCarousels();initHeroSlideshow();initVideoAutoplay();initFooterToggle();initAddToCart();initAddressToggle();initCollectionSort();initParallax();initMagneticButtons();initSplitText();initCounterAnimations();initImageReveals();initBuyNow();initProductLightbox();initSizeChartTabs();initProductShare();});

/* === PARALLAX SCROLLING === */
function initParallax(){
if(prefersReduced)return; /* honour reduced-motion: no scroll-linked movement */
if(window.innerWidth<769)return; /* disable on mobile for perf */
function updateParallax(){
var st=window.pageYOffset;
$$('[data-parallax]').forEach(function(el){ /* re-query so newly loaded sections animate too */
var rect=el.getBoundingClientRect();
var speed=parseFloat(el.getAttribute('data-parallax'))||0.06;
if(rect.bottom>0&&rect.top<window.innerHeight){
var yPos=-(st-el.offsetTop+window.innerHeight)*speed;
el.style.transform='translate3d(0,'+yPos+'px,0)';
}
});
window.__parallaxTicking=false;
}
if(!window.__parallaxBound){ /* bind the scroll listener only once */
window.__parallaxBound=true;
window.addEventListener('scroll',function(){if(!window.__parallaxTicking){window.__parallaxTicking=true;requestAnimationFrame(updateParallax)}},{passive:true});
}
updateParallax();
}

/* === MAGNETIC BUTTONS === */
function initMagneticButtons(){
if(window.innerWidth<1025||'ontouchstart' in window)return;
$$('.btn--magnetic').forEach(function(btn){
if(btn.__magInit)return;btn.__magInit=true;
btn.addEventListener('mousemove',function(e){
var rect=this.getBoundingClientRect();
var x=(e.clientX-rect.left-rect.width/2)*0.3;
var y=(e.clientY-rect.top-rect.height/2)*0.3;
this.style.transform='translate3d('+x+'px,'+y+'px,0)';
});
btn.addEventListener('mouseleave',function(){
this.style.transform='translate3d(0,0,0)';
});
});
}

/* === TEXT SPLIT ANIMATIONS === */
function initSplitText(){
$$('.split-words:not(.split-done)').forEach(function(el){
var text=el.textContent.trim();
var words=text.split(/\s+/);
el.innerHTML='';
words.forEach(function(word,i){
var span=document.createElement('span');
span.className='word';
var inner=document.createElement('span');
inner.className='word-inner';
inner.textContent=word;
span.appendChild(inner);
el.appendChild(span);
if(i<words.length-1){el.appendChild(document.createTextNode(' '))}
});
el.classList.add('split-done');
});

$$('.split-chars:not(.split-done)').forEach(function(el){
var text=el.textContent.trim();
el.innerHTML='';
for(var i=0;i<text.length;i++){
if(text[i]===' '){
el.appendChild(document.createTextNode(' '));
}else{
var span=document.createElement('span');
span.className='char';
span.textContent=text[i];
span.style.transitionDelay=(i*30)+'ms';
el.appendChild(span);
}
}
el.classList.add('split-done');
});
}

/* === CUSTOM CURSOR === */
function initCustomCursor(){
if(prefersReduced)return; /* keep the native cursor for reduced-motion users */
if(window.__cursorInit)return;
var cursor=$('.cursor-follower');
var dot=$('.cursor-follower-dot');
if(!cursor||!dot||window.innerWidth<1025||'ontouchstart' in window)return;
window.__cursorInit=true;

var cx=0,cy=0,dx=0,dy=0;
document.addEventListener('mousemove',function(e){cx=e.clientX;cy=e.clientY;
if(!cursor.classList.contains('visible')){cursor.classList.add('visible');dot.classList.add('visible')}
},{passive:true});

function animate(){
dx+=(cx-dx)*0.15;dy+=(cy-dy)*0.15;
cursor.style.transform='translate3d('+(dx-18)+'px,'+(dy-18)+'px,0)';
dot.style.transform='translate3d('+(cx-2.5)+'px,'+(cy-2.5)+'px,0)';
requestAnimationFrame(animate);
}
animate();

/* Hover detection for interactive elements */
var hoverTargets='a,button,.btn,.product-card,.carousel__btn,.hero-slider__arrow,input,textarea,select';
document.addEventListener('mouseover',function(e){
if(e.target.closest(hoverTargets)){cursor.classList.add('hovering')}
},{passive:true});
document.addEventListener('mouseout',function(e){
if(e.target.closest(hoverTargets)){cursor.classList.remove('hovering')}
},{passive:true});
}

/* === COUNTER ANIMATIONS === */
function initCounterAnimations(){
var counters=Array.from($$('[data-count-to]')).filter(function(el){return !el.__countInit});if(!counters.length)return;
counters.forEach(function(el){el.__countInit=true});
if(prefersReduced||!('IntersectionObserver' in window)){
counters.forEach(function(el){el.textContent=el.getAttribute('data-count-to')});
return;
}
var obs=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
var el=entry.target;
var target=parseInt(el.getAttribute('data-count-to'))||0;
var duration=parseInt(el.getAttribute('data-count-duration'))||2000;
var start=0;var startTime=null;
function step(timestamp){
if(!startTime)startTime=timestamp;
var progress=Math.min((timestamp-startTime)/duration,1);
/* easeOutQuart */
var eased=1-Math.pow(1-progress,4);
el.textContent=Math.floor(eased*target);
if(progress<1)requestAnimationFrame(step);
else el.textContent=target;
}
requestAnimationFrame(step);
obs.unobserve(el);
}
});
},{threshold:0.3});
counters.forEach(function(el){obs.observe(el)});
}

/* === IMAGE REVEAL ON SCROLL === */
function initImageReveals(){
var reveals=$$('.image-reveal:not(.animated)');if(!reveals.length)return;
if(!('IntersectionObserver' in window)){
reveals.forEach(function(el){el.classList.add('animated')});
return;
}
var obs=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add('animated');
obs.unobserve(entry.target);
}
});
},{threshold:0.2,rootMargin:'0px 0px -50px 0px'});
reveals.forEach(function(el){obs.observe(el)});
}

/* === CART CELEBRATION — Confetti burst === */
function triggerCartCelebration(){
var container=document.getElementById('cart-celebration');
if(!container||prefersReduced)return;
/* Only trigger once per drawer open cycle */
if(container._celebrating)return;
container._celebrating=true;
var colors=['#d4a853','#c1272d','#0c0c0c','#e5e0d8','#8a8278','#f6f4f0'];
var frag=document.createDocumentFragment();
for(var i=0;i<40;i++){
var p=document.createElement('div');
p.className='confetti-piece';
p.style.left=Math.random()*100+'%';
p.style.top='-10px';
p.style.background=colors[Math.floor(Math.random()*colors.length)];
p.style.animationDelay=(Math.random()*0.6)+'s';
p.style.animationDuration=(1.2+Math.random()*1)+'s';
var size=4+Math.random()*8;
p.style.width=size+'px';
p.style.height=size+'px';
frag.appendChild(p);
}
container.appendChild(frag);
setTimeout(function(){container.innerHTML='';container._celebrating=false},2500);
}

/* === PRODUCT LIGHTBOX === */
function initProductLightbox(){
var gallery=document.querySelector('.product-gallery--slider')||document.querySelector('.product-gallery');
if(!gallery||gallery.__lbInit)return;gallery.__lbInit=true;
var staleLb=document.querySelector('.product-lightbox');if(staleLb)staleLb.remove();
var images=[];
function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
gallery.querySelectorAll('.product-gallery__slide img, .product-gallery__main img').forEach(function(img){
var src=img.getAttribute('src');
if(img.srcset){
var parts=img.srcset.split(',').map(function(s){return s.trim()});
var last=parts[parts.length-1].split(' ')[0];
if(last)src=last;
}
images.push({src:src,alt:img.alt||''});
});
if(!images.length)return;
/* Build lightbox DOM */
var lb=document.createElement('div');
lb.className='product-lightbox';
lb.setAttribute('role','dialog');
lb.setAttribute('aria-label','Product image gallery');
var h='<div class="product-lightbox__toolbar">';
h+='<span class="product-lightbox__counter"><span data-lb-cur>1</span> / '+images.length+'</span>';
h+='<button class="product-lightbox__close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
h+='</div>';
h+='<div class="product-lightbox__main">';
h+='<button class="product-lightbox__arrow product-lightbox__arrow--prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>';
h+='<img class="product-lightbox__image" src="" alt="" draggable="false">';
h+='<button class="product-lightbox__arrow product-lightbox__arrow--next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg></button>';
h+='</div>';
h+='<div class="product-lightbox__thumbs">';
for(var i=0;i<images.length;i++){
h+='<div class="product-lightbox__thumb'+(i===0?' active':'')+'" data-lb-index="'+i+'">';
h+='<img src="'+images[i].src.replace(/width:\d+/,'width:150')+'" alt="'+escAttr(images[i].alt)+'" loading="lazy">';
h+='</div>';
}
h+='</div>';
lb.innerHTML=h;
document.body.appendChild(lb);
var mainImg=lb.querySelector('.product-lightbox__image');
var thumbs=lb.querySelectorAll('.product-lightbox__thumb');
var counter=lb.querySelector('[data-lb-cur]');
var cur=0;
function show(idx){
if(idx<0)idx=images.length-1;
if(idx>=images.length)idx=0;
cur=idx;
mainImg.style.opacity='0';
mainImg.style.transform='scale(0.96)';
setTimeout(function(){
mainImg.src=images[cur].src;
mainImg.alt=images[cur].alt;
mainImg.style.opacity='1';
mainImg.style.transform='scale(1)';
},150);
thumbs.forEach(function(t,ti){t.classList.toggle('active',ti===cur)});
counter.textContent=cur+1;
var activeThumb=thumbs[cur];
if(activeThumb)activeThumb.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}
function open(idx){
show(idx||0);
lb.classList.add('open');
document.body.classList.add('overflow-hidden');
}
function close(){
lb.classList.remove('open');
document.body.classList.remove('overflow-hidden');
}
/* Open on gallery image click */
gallery.querySelectorAll('.product-gallery__slide, .product-gallery__main').forEach(function(el,i){
el.addEventListener('click',function(e){
if(e.target.closest('.product-gallery__dot'))return;
if(gallery._isDragged)return;
var slideIdx=0;
var slide=e.target.closest('.product-gallery__slide');
if(slide){
var allSlides=gallery.querySelectorAll('.product-gallery__slide');
for(var s=0;s<allSlides.length;s++){if(allSlides[s]===slide){slideIdx=s;break}}
}
open(slideIdx);
});
});
/* Close */
lb.querySelector('.product-lightbox__close').addEventListener('click',close);
lb.querySelector('.product-lightbox__main').addEventListener('click',function(e){
if(e.target===this)close();
});
/* Arrows */
lb.querySelector('.product-lightbox__arrow--prev').addEventListener('click',function(e){e.stopPropagation();show(cur-1)});
lb.querySelector('.product-lightbox__arrow--next').addEventListener('click',function(e){e.stopPropagation();show(cur+1)});
/* Thumb clicks */
thumbs.forEach(function(t){
t.addEventListener('click',function(){show(parseInt(this.getAttribute('data-lb-index')))});
});
/* Keyboard */
document.addEventListener('keydown',function(e){
if(!lb.classList.contains('open'))return;
if(e.key==='Escape')close();
if(e.key==='ArrowLeft')show(cur-1);
if(e.key==='ArrowRight')show(cur+1);
});
/* Touch swipe on lightbox main image */
var lbStartX=0,lbStartY=0,lbIsH=null;
lb.querySelector('.product-lightbox__main').addEventListener('touchstart',function(e){
lbStartX=e.touches[0].clientX;
lbStartY=e.touches[0].clientY;
lbIsH=null;
},{passive:true});
lb.querySelector('.product-lightbox__main').addEventListener('touchend',function(e){
var dx=e.changedTouches[0].clientX-lbStartX;
var dy=e.changedTouches[0].clientY-lbStartY;
if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50){
if(dx<0)show(cur+1);else show(cur-1);
}else if(Math.abs(dy)>80&&dy>0){
close();
}
});
}
// Re-enabled: initProductLightbox is the white-bg lightbox user wants
initProductLightbox();

var BUYNOW_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
function setBuyNowState(state,origMap){
document.querySelectorAll('[data-buy-now]').forEach(function(b){
if(state==='loading'){b.disabled=true;b.classList.add('is-loading');b.innerHTML='<span class="btn-spinner"></span> Processing...';}
else if(state==='redirecting'){b.innerHTML='<span class="btn-spinner"></span> Redirecting...';}
else if(state==='error'){b.classList.remove('is-loading');b.innerHTML='Error \u2014 Try Again';}
else if(state==='reset'){b.disabled=false;b.classList.remove('is-loading');b.innerHTML=BUYNOW_ICON+' Buy Now';}
});
}
function initBuyNow(){
if(initBuyNow._bound)return;
initBuyNow._bound=true;
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-buy-now]');
if(!btn)return;
if(btn.hasAttribute('data-inline-buy-now'))return;
e.preventDefault();
e.stopPropagation();
var productForm=btn.closest('[data-product-form]')||document.querySelector('[data-product-form]');
if(!productForm)return;
var variantInput=productForm.querySelector('input[name="id"]');
var qtyInput=productForm.querySelector('input[name="quantity"]');
if(!variantInput)return;
if(btn.classList.contains('is-loading'))return;
triggerShopflowBuyNow(btn);
});
}
initBuyNow();

/* Reset CTA buttons when page is restored from bfcache (back/forward navigation) */
window.addEventListener('pageshow',function(e){
if(e.persisted){
/* Reset all Buy Now buttons */
window.__buyNowInProgress=false;
setBuyNowState('reset');
/* Reset all Add to Cart submit buttons */
document.querySelectorAll('[data-add-to-cart] [type="submit"],[data-product-form] [type="submit"]').forEach(function(btn){resetATCBtn(btn)});
/* Re-trigger hero animations on bfcache restore */
document.querySelectorAll('.hero-slide--active .hero-slide__subtitle, .hero-slide--active .hero-slide__title, .hero-slide--active .hero-slide__btn').forEach(function(el){
el.style.opacity='1';
el.style.transform='none';
el.style.animation='none';
});
/* Clear stuck overlay/drawer state from before navigation */
document.body.classList.remove('overflow-hidden');
var _cdOpen=document.querySelector('.cart-drawer.open');
if(_cdOpen)_cdOpen.classList.remove('open');
var _navOpen=document.querySelector('.site-header__nav.open');
if(_navOpen)_navOpen.classList.remove('open');
var _srchOpen=document.querySelector('.header-search.open');
if(_srchOpen)_srchOpen.classList.remove('open');
var _popOpen=document.querySelector('.newsletter-popup-overlay.open');
if(_popOpen)_popOpen.classList.remove('open');
/* Reset sticky ATC observer so IntersectionObserver re-evaluates on restore */
var _sb=document.querySelector('.product-info__cta-group');
if(_sb&&_sb._observer){_sb._observer.disconnect();_sb._observer=null;}
if(document.body.classList.contains('template-product'))initPdpStickyAtc();
}
});

/* === SMOOTH PAGE TRANSITIONS === */
(function(){
if(!document.startViewTransition)return; /* only for browsers that support View Transitions */
document.addEventListener('click',function(e){
var link=e.target.closest('a[href]');
if(!link)return;
var href=link.getAttribute('href');
if(!href||href.startsWith('#')||href.startsWith('javascript:')||link.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey)return;
/* Only internal same-origin links */
try{var url=new URL(href,window.location.origin);if(url.origin!==window.location.origin)return}catch(err){return}
e.preventDefault();
document.startViewTransition(function(){window.location.href=href});
});
})();

/* === ANNOUNCEMENT COUNTDOWN TIMER === */
function initAnnouncementTimer(){
  var el=document.getElementById('ann-countdown');
  if(!el)return;
  var endStr=el.getAttribute('data-end');
  if(!endStr)return;
  var end=new Date(endStr).getTime();
  if(isNaN(end))return;
  var hEl=document.getElementById('ann-hours');
  var mEl=document.getElementById('ann-mins');
  var sEl=document.getElementById('ann-secs');
  if(!hEl||!mEl||!sEl)return;
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    var diff=end-Date.now();
    if(diff<=0){
      hEl.textContent=mEl.textContent=sEl.textContent='00';
      return;
    }
    hEl.textContent=pad(Math.floor(diff/3600000));
    mEl.textContent=pad(Math.floor((diff%3600000)/60000));
    sEl.textContent=pad(Math.floor((diff%60000)/1000));
  }
  tick();
  setInterval(tick,1000);
}

/* === TOAST NOTIFICATIONS (window.sakhiToast) === */
(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function getStack(){
    var s=document.getElementById('toast-stack');
    if(!s){s=document.createElement('div');s.id='toast-stack';s.className='toast-stack';s.setAttribute('aria-live','polite');document.body.appendChild(s)}
    return s;
  }
  var ICONS={
    success:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    cart:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    heart:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
  };
  window.sakhiToast=function(opts){
    if(typeof opts==='string')opts={message:opts};
    opts=opts||{};
    var type=opts.type||'info';
    var msg=opts.message||'';
    var title=opts.title||'';
    var duration=opts.duration==null?3200:opts.duration;
    var action=opts.action||null;

    var stack=getStack();
    var t=document.createElement('div');
    t.className='toast toast--'+type;
    t.setAttribute('role','status');

    var inner='<span class="toast__icon">'+(ICONS[type]||ICONS.info)+'</span>'
      +'<div class="toast__body">'
      +(title?'<strong class="toast__title">'+esc(title)+'</strong>':'')
      +'<span class="toast__msg">'+esc(msg)+'</span>'
      +'</div>';
    if(action&&action.label){
      inner+='<button type="button" class="toast__action" data-toast-action>'+esc(action.label)+'</button>';
    }
    inner+='<button type="button" class="toast__close" aria-label="Dismiss">'
      +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      +'</button>';
    t.innerHTML=inner;
    stack.appendChild(t);
    requestAnimationFrame(function(){t.classList.add('is-visible')});

    var timer=null;
    function dismiss(){
      if(t._dismissed)return;t._dismissed=true;
      t.classList.remove('is-visible');t.classList.add('is-leaving');
      if(timer){clearTimeout(timer);timer=null}
      setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t)},280);
    }
    t.querySelector('.toast__close').addEventListener('click',dismiss);
    if(action&&action.onClick){
      t.querySelector('[data-toast-action]').addEventListener('click',function(e){
        try{action.onClick(e)}catch(err){}
        dismiss();
      });
    }
    if(duration>0)timer=setTimeout(dismiss,duration);

    /* Pause on hover */
    t.addEventListener('mouseenter',function(){if(timer){clearTimeout(timer);timer=null}});
    t.addEventListener('mouseleave',function(){if(duration>0&&!t._dismissed)timer=setTimeout(dismiss,1200)});

    return{dismiss:dismiss};
  };

  /* Convenience methods */
  ['success','error','info'].forEach(function(type){
    window.sakhiToast[type]=function(message,opts){
      opts=opts||{};opts.type=type;opts.message=message;return window.sakhiToast(opts);
    };
  });
})();

/* === PDP GALLERY ZOOM (desktop hover-pan + mobile lightbox) === */
function initPdpGalleryZoom(){
  if(!document.body.classList.contains('template-product'))return;
  var images=document.querySelectorAll('[data-gallery-zoom]');
  if(!images.length)return;
  var mqDesktop=window.matchMedia('(min-width:1025px) and (hover:hover)');

  /* ----- Desktop hover-pan zoom ----- */
  function bindHoverZoom(img){
    if(img._zoomBound)return;img._zoomBound=true;
    var slide=img.parentElement;
    if(!slide)return;
    slide.style.position=slide.style.position||'relative';
    var hiSrc=img.getAttribute('data-zoom-src')||img.currentSrc||img.src;
    function onMove(e){
      if(!mqDesktop.matches)return;
      var rect=slide.getBoundingClientRect();
      var x=((e.clientX-rect.left)/rect.width)*100;
      var y=((e.clientY-rect.top)/rect.height)*100;
      img.style.transformOrigin=x+'% '+y+'%';
      img.style.transform='scale(2.2)';
    }
    function onLeave(){img.style.transform='';img.style.transformOrigin=''}
    function onEnter(){
      if(!mqDesktop.matches)return;
      /* Preload high-res once and swap src for sharper zoom */
      if(hiSrc&&img.src!==hiSrc&&!img._hiLoaded){
        var pre=new Image();pre.onload=function(){img.src=hiSrc;img._hiLoaded=true};pre.src=hiSrc;
      }
    }
    slide.addEventListener('mouseenter',onEnter);
    slide.addEventListener('mousemove',onMove);
    slide.addEventListener('mouseleave',onLeave);
  }

  /* ----- Lightbox for mobile / click on desktop ----- */
  var lightbox=null;
  function ensureLightbox(){
    if(lightbox)return lightbox;
    lightbox=document.createElement('div');
    lightbox.className='gallery-lightbox';
    lightbox.innerHTML=
      '<button class="gallery-lightbox__close" aria-label="Close">'
      +'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      +'</button>'
      +'<button class="gallery-lightbox__nav gallery-lightbox__nav--prev" aria-label="Previous">'
      +'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>'
      +'</button>'
      +'<div class="gallery-lightbox__stage"><img alt=""></div>'
      +'<button class="gallery-lightbox__nav gallery-lightbox__nav--next" aria-label="Next">'
      +'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>'
      +'</button>'
      +'<div class="gallery-lightbox__counter"><span data-lb-current>1</span> / <span data-lb-total>1</span></div>';
    document.body.appendChild(lightbox);
    var stageImg=lightbox.querySelector('img');
    var prev=lightbox.querySelector('.gallery-lightbox__nav--prev');
    var next=lightbox.querySelector('.gallery-lightbox__nav--next');
    var closeBtn=lightbox.querySelector('.gallery-lightbox__close');
    var curEl=lightbox.querySelector('[data-lb-current]');
    var totalEl=lightbox.querySelector('[data-lb-total]');

    var current=0;
    var srcs=[];
    var alts=[];
    lightbox._open=function(list,index){
      srcs=list;current=index||0;
      totalEl.textContent=srcs.length;
      apply();
      lightbox.classList.add('open');
      document.body.classList.add('overflow-hidden');
    };
    function apply(){
      stageImg.src=srcs[current].src;
      stageImg.alt=srcs[current].alt||'';
      curEl.textContent=current+1;
      /* Reset any zoom transform */
      stageImg.style.transform='';
    }
    function go(d){current=(current+d+srcs.length)%srcs.length;apply()}
    prev.addEventListener('click',function(){go(-1)});
    next.addEventListener('click',function(){go(1)});
    closeBtn.addEventListener('click',close);
    lightbox.addEventListener('click',function(e){if(e.target===lightbox)close()});
    document.addEventListener('keydown',function(e){
      if(!lightbox.classList.contains('open'))return;
      if(e.key==='Escape')close();
      else if(e.key==='ArrowLeft')go(-1);
      else if(e.key==='ArrowRight')go(1);
    });
    /* Desktop click-to-zoom in the lightbox */
    stageImg.addEventListener('click',function(e){
      var z=stageImg.classList.toggle('is-zoomed');
      if(z){
        var rect=stageImg.getBoundingClientRect();
        var x=((e.clientX-rect.left)/rect.width)*100;
        var y=((e.clientY-rect.top)/rect.height)*100;
        stageImg.style.transformOrigin=x+'% '+y+'%';
      }else{
        stageImg.style.transformOrigin='';
      }
    });
    function close(){
      lightbox.classList.remove('open');
      document.body.classList.remove('overflow-hidden');
      stageImg.classList.remove('is-zoomed');
      stageImg.style.transform='';
      stageImg.style.transformOrigin='';
    }
    return lightbox;
  }

  /* Bind */
  var srcList=Array.prototype.map.call(images,function(img){
    return{src:img.getAttribute('data-zoom-src')||img.currentSrc||img.src,alt:img.alt||''};
  });
  Array.prototype.forEach.call(images,function(img,i){
    bindHoverZoom(img);
    /* On click anywhere, open the lightbox at this index */
    img.addEventListener('click',function(e){
      e.preventDefault();
      ensureLightbox();
      lightbox._open(srcList,i);
    });
    img.style.cursor='zoom-in';
  });
}

/* === CART PAGE: Move to Wishlist === */
document.addEventListener('click',function(e){
  var btn=e.target.closest('[data-move-to-wishlist]');
  if(!btn)return;
  e.preventDefault();
  if(btn.disabled)return;
  var data={
    handle:btn.getAttribute('data-handle'),
    title:btn.getAttribute('data-title'),
    url:btn.getAttribute('data-url'),
    price:btn.getAttribute('data-price'),
    image:btn.getAttribute('data-image')
  };
  var itemKey=btn.getAttribute('data-item-key');
  var row=btn.closest('.cart-item');
  if(!data.handle||!itemKey)return;
  btn.disabled=true;
  var origText=btn.innerHTML;
  btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved';
  /* Add to wishlist */
  if(typeof addToWishlist==='function')addToWishlist(data);
  /* Remove from cart via /cart/change */
  fetch((window.theme.routes&&window.theme.routes.cart_change_url||'/cart/change')+'.js',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:itemKey,quantity:0})
  }).then(function(r){return r.json()}).then(function(){
    if(row){
      row.style.transition='opacity 0.3s ease,transform 0.3s ease,max-height 0.4s ease,margin 0.3s ease';
      row.style.opacity='0';
      row.style.transform='translateX(20px)';
      setTimeout(function(){window.location.reload()},400);
    }else{
      window.location.reload();
    }
  }).catch(function(){
    btn.disabled=false;btn.innerHTML=origText;
    if(window.sakhiToast)window.sakhiToast.error('Could not move item. Try again.');
  });
});

/* === CART PAGE: Coupon hint (visual only — actual coupons applied at checkout) === */
document.addEventListener('click',function(e){
  var btn=e.target.closest('[data-cart-apply-coupon]');
  if(!btn)return;
  e.preventDefault();
  var input=document.getElementById('cart-coupon-code');
  if(!input||!input.value.trim())return;
  var code=input.value.trim();
  btn.disabled=true;
  var orig=btn.innerHTML;btn.innerHTML='Saving...';
  /* Persist the code locally so it's visible on the checkout page (Shopflo/checkout reads it) */
  try{sessionStorage.setItem('sakhi_pending_coupon',code)}catch(err){}
  setTimeout(function(){
    btn.disabled=false;btn.innerHTML=orig;
    if(window.sakhiToast){
      window.sakhiToast({type:'success',title:'Code saved',message:'"'+code+'" will be auto-applied at checkout.'});
    }
  },400);
});

/* === PDP BACK-IN-STOCK NOTIFY === */
function initPdpNotify(){
  var wrap=document.querySelector('[data-pdp-notify]');
  if(!wrap)return;
  var form=wrap.querySelector('[data-pdp-notify-form]')||wrap.querySelector('form');
  if(!form)return;
  /* If server-rendered success state is present, mark as submitted */
  if(wrap.querySelector('[data-pdp-notify-posted]')){
    wrap.classList.add('is-submitted');
  }
  form.addEventListener('submit',function(){
    wrap.classList.add('is-submitting');
  });
}

/* === PDP RECENTLY VIEWED === */
function initPdpRecent(){
  if(!document.body.classList.contains('template-product'))return;
  var section=document.querySelector('[data-pdp-recent]');
  if(!section)return;
  var scroll=section.querySelector('[data-recent-scroll]');
  var clearBtn=section.querySelector('[data-recent-clear]');
  var currentHandle=section.getAttribute('data-current-handle');
  var KEY='sakhi_recent_v1';
  var MAX=12;

  function read(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
  function write(list){try{localStorage.setItem(KEY,JSON.stringify(list))}catch(e){}}

  /* Record current product (after a tick so we don't render self) */
  function record(){
    var titleEl=document.querySelector('.product-info__title');
    var imgEl=document.querySelector('.product-gallery__main-image,.product-gallery img,.product-info img');
    var priceEl=document.querySelector('.product-info__price--on-sale,.product-info__price');
    var item={
      handle:currentHandle,
      url:window.location.pathname.split('?')[0].split('#')[0],
      title:titleEl?titleEl.textContent.trim():'',
      image:imgEl?(imgEl.currentSrc||imgEl.src):'',
      price:priceEl?priceEl.textContent.trim():'',
      at:Date.now()
    };
    if(!item.handle||!item.title||!item.image)return;
    var list=read().filter(function(x){return x.handle!==currentHandle});
    list.unshift(item);
    if(list.length>MAX)list=list.slice(0,MAX);
    write(list);
  }

  function render(){
    var list=read().filter(function(x){return x.handle!==currentHandle});
    if(!list.length){section.hidden=true;return}
    var html='';
    list.forEach(function(it){
      var safeTitle=String(it.title||'').replace(/[<>"']/g,'');
      var safeImg=String(it.image||'').replace(/["']/g,'');
      var safeUrl=String(it.url||'').replace(/["']/g,'');
      var safePrice=String(it.price||'').replace(/[<>"']/g,'');
      html+='<a href="'+safeUrl+'" class="pdp-recent__card" role="listitem" data-recent-card="'+it.handle+'">'
        +'<div class="pdp-recent__img-wrap"><img src="'+safeImg+'" alt="'+safeTitle+'" loading="lazy" width="180" height="240"></div>'
        +'<div class="pdp-recent__info">'
          +'<span class="pdp-recent__name">'+safeTitle+'</span>'
          +'<span class="pdp-recent__price">'+safePrice+'</span>'
        +'</div>'
      +'</a>';
    });
    scroll.innerHTML=html;
    section.hidden=false;
  }

  if(clearBtn){
    clearBtn.addEventListener('click',function(){
      write([]);section.hidden=true;
    });
  }

  record();
  render();
}

/* === PDP STICKY ATC (mobile) === */
function initPdpStickyAtc(){
  if(!document.body.classList.contains('template-product'))return;
  var stickyBar=document.querySelector('.product-info__cta-group');
  var inlineCta=document.querySelector('.product-info__cta-desktop')||document.querySelector('[data-product-form]');
  if(!stickyBar||!inlineCta)return;
  /* Only active on mobile breakpoints */
  var mq=window.matchMedia('(max-width:1024px)');
  function apply(){
    if(!mq.matches){stickyBar.classList.remove('is-visible');return}
    /* Use IntersectionObserver — show bar when inline CTA leaves the viewport */
    if(stickyBar._observer)return;
    stickyBar._observer=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){stickyBar.classList.remove('is-visible')}
        else{stickyBar.classList.add('is-visible')}
      });
    },{threshold:0,rootMargin:'-50px 0px 0px 0px'});
    stickyBar._observer.observe(inlineCta);
  }
  apply();
  mq.addEventListener?mq.addEventListener('change',apply):mq.addListener(apply);
}

/* === SIZE GUIDE MODAL === */
function initSizeGuideModal(){
  var modal=document.getElementById('sg-modal');
  if(!modal)return;
  function openModal(){
    modal.hidden=false;
    document.body.classList.add('overflow-hidden');
    setTimeout(function(){modal.querySelector('.sg-modal__close').focus();},100);
  }
  function closeModal(){
    modal.hidden=true;
    document.body.classList.remove('overflow-hidden');
  }
  document.addEventListener('click',function(e){
    var trigger=e.target.closest('[data-open-size-guide]');
    if(trigger&&!trigger.hasAttribute('data-kiwisizing-trigger')){e.preventDefault();openModal();return;}
    var closeBtn=e.target.closest('[data-sg-close]');
    if(closeBtn){e.preventDefault();closeModal();}
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!modal.hidden)closeModal();
  });
}

/* === DOM READY === */
document.addEventListener('DOMContentLoaded',function(){
/* Priority inits */
initAnnouncementTimer();initSizeGuideModal();
initScrollAnimations();initSmoothReveal();initParallax();initMagneticButtons();initSplitText();initCustomCursor();initCounterAnimations();initImageReveals();
/* Defer non-critical inits to idle time */
var idle=window.requestIdleCallback||function(fn){setTimeout(fn,200)};
idle(function(){
initSectionReveals();initAddressToggle();initCollectionSort();initFooterToggle();
initFilterDrawer();initFilterGroups();initFilterCheckboxes();initFilterPriceForms();
initPincodeBar();initBottomNav();initPromoCopy();setStripHeight();initPdpStickyAtc();initPdpRecent();/* initPdpGalleryZoom disabled - using white lightbox */initPdpNotify();
setTimeout(function(){var hasOpen=document.querySelector('.cart-drawer.open')||document.querySelector('.header-search.open')||document.querySelector('.newsletter-popup-overlay.open')||document.querySelector('.site-header__nav.open');if(!hasOpen)document.body.classList.remove('overflow-hidden')},800);
});
window.addEventListener('resize',setStripHeight,{passive:true});
});

/* ============================================================
   MARKETPLACE FEATURES — Filter Drawer, Filter Groups,
   Filter Checkboxes, Price Filter
   ============================================================ */

/* === COLLECTION FILTER DRAWER (mobile) === */
function initFilterDrawer(){
var openBtn=document.getElementById('filter-drawer-open');
var closeBtn=document.getElementById('filter-drawer-close');
var drawer=document.getElementById('filter-drawer');
var overlay=document.getElementById('filter-drawer-overlay');
if(!openBtn||!drawer)return;

/* Set initial active count badge */
var count=window._collectionActiveFilters||0;
var badge=document.getElementById('filter-active-count');
if(badge){
  if(count>0){badge.textContent=count;badge.style.display='inline-flex';}
  else{badge.style.display='none';}
}

function openDrawer(){
  drawer.classList.add('open');
  if(overlay)overlay.classList.add('open');
  document.body.classList.add('overflow-hidden');
  openBtn.setAttribute('aria-expanded','true');
  drawer.setAttribute('aria-hidden','false');
  /* Focus first interactive element */
  var firstEl=drawer.querySelector('button,input,[tabindex]');
  if(firstEl)requestAnimationFrame(function(){firstEl.focus()});
}

function closeDrawer(){
  drawer.classList.remove('open');
  if(overlay)overlay.classList.remove('open');
  document.body.classList.remove('overflow-hidden');
  openBtn.setAttribute('aria-expanded','false');
  drawer.setAttribute('aria-hidden','true');
  openBtn.focus();
}

openBtn.addEventListener('click',openDrawer);
if(closeBtn)closeBtn.addEventListener('click',closeDrawer);
if(overlay)overlay.addEventListener('click',closeDrawer);

/* Escape key closes drawer */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&drawer.classList.contains('open'))closeDrawer();
});

/* Apply button closes drawer and navigates (checkboxes already navigated) */
var applyBtn=document.getElementById('filter-drawer-apply');
if(applyBtn)applyBtn.addEventListener('click',closeDrawer);
}

/* === FILTER GROUP ACCORDION === */
function initFilterGroups(){
document.querySelectorAll('[data-filter-group] .filter-group__toggle').forEach(function(btn){
  btn.addEventListener('click',function(){
    var group=this.closest('[data-filter-group]');
    if(!group)return;
    var isOpen=group.classList.contains('open');
    group.classList.toggle('open',!isOpen);
    this.setAttribute('aria-expanded',String(!isOpen));
  });
});
}

/* === FILTER CHECKBOXES — navigate on change === */
function initFilterCheckboxes(){
document.querySelectorAll('.filter-option__checkbox').forEach(function(cb){
  cb.addEventListener('change',function(){
    var url=this.checked
      ?this.getAttribute('data-filter-url-add')
      :this.getAttribute('data-filter-url-remove');
    if(url)window.location.href=url;
  });
});
}

/* === PRICE RANGE FILTER FORM — build URL and navigate === */
function initFilterPriceForms(){
document.querySelectorAll('[data-filter-price-form]').forEach(function(form){
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var minInput=form.querySelector('input[aria-label="Minimum price"]');
    var maxInput=form.querySelector('input[aria-label="Maximum price"]');
    var url=new URL(window.location.href);
    var minName=minInput?minInput.name:'filter.v.price.gte';
    var maxName=maxInput?maxInput.name:'filter.v.price.lte';
    url.searchParams.delete(minName);
    url.searchParams.delete(maxName);
    if(minInput&&minInput.value!=='')url.searchParams.set(minName,minInput.value);
    if(maxInput&&maxInput.value!=='')url.searchParams.set(maxName,maxInput.value);
    url.searchParams.delete('page');
    window.location.href=url.toString();
  });
});
}

/* === PINCODE BAR === */
function initPincodeBar(){
var bar=document.getElementById('pincode-bar');
var modal=document.getElementById('pincode-modal');
var toggleBtn=document.querySelector('[data-pincode-toggle]');
var checkBtn=document.querySelector('[data-pincode-check]');
var input=document.getElementById('pincode-input');
var result=document.getElementById('pincode-result');
var label=document.querySelector('[data-pincode-label]');
if(!bar||!modal)return;

var saved=localStorage.getItem('sakhi_pincode');
if(saved&&label){label.textContent=saved}

function openModal(){
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  if(toggleBtn)toggleBtn.setAttribute('aria-expanded','true');
  setTimeout(function(){if(input)input.focus();},320);
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  if(toggleBtn){toggleBtn.setAttribute('aria-expanded','false');toggleBtn.focus();}
}

if(toggleBtn)toggleBtn.addEventListener('click',function(){
  modal.classList.contains('open')?closeModal():openModal();
});
document.querySelectorAll('[data-pincode-close]').forEach(function(el){
  el.addEventListener('click',closeModal);
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&modal.classList.contains('open'))closeModal();
});

if(checkBtn&&input&&result&&label){
  function doCheck(){
    var pin=input.value.trim();
    if(!/^\d{6}$/.test(pin)){
      result.textContent='Please enter a valid 6-digit pincode.';
      result.className='pincode-modal__result error';
      return;
    }
    result.textContent='Delivery available to '+pin+' — estimated 3–5 business days.';
    result.className='pincode-modal__result success';
    label.textContent=pin;
    localStorage.setItem('sakhi_pincode',pin);
    setTimeout(closeModal,1400);
  }
  checkBtn.addEventListener('click',doCheck);
  input.addEventListener('keydown',function(e){if(e.key==='Enter')doCheck();});
}
}

/* === BOTTOM NAV — active state === */
function initBottomNav(){
var items=document.querySelectorAll('.bottom-nav__item');
if(!items.length)return;
var path=window.location.pathname.replace(/\/+$/,'');
items.forEach(function(item){
  var href=item.getAttribute('href');
  if(!href)return;
  try{
    var url=new URL(href,window.location.origin);
    var itemPath=url.pathname.replace(/\/+$/,'');
    if(itemPath===''||itemPath==='/'){
      if(path===''||path==='/'){item.classList.add('active');}
    } else if(path.startsWith(itemPath)){
      item.classList.add('active');
    }
  }catch(e){}
});
}

/* === PROMO CODE — copy to clipboard === */
function initPromoCopy(){
document.querySelectorAll('[data-copy-promo]').forEach(function(btn){
  btn.addEventListener('click',function(){
    var code=btn.getAttribute('data-copy-promo');
    if(!code)return;
    var orig=btn.innerHTML;
    navigator.clipboard.writeText(code).then(function(){
      btn.classList.add('copied');
      btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(function(){btn.innerHTML=orig;btn.classList.remove('copied');},1600);
    }).catch(function(){});
  });
});
}

/* === STRIP HEIGHT — re-measures after late render and syncs all spacing vars === */
function setStripHeight(){
setHeaderHeight();
}

/* === GALLERY SIDEBAR THUMBNAILS — desktop sync === */
function initGallerySidebar(){
document.querySelectorAll('.product-gallery--slider').forEach(function(gallery){
  var thumbSide=gallery.querySelectorAll('.product-gallery__thumb-side');
  if(!thumbSide.length)return;
  /* Click on sidebar thumb — navigate gallery */
  thumbSide.forEach(function(btn){
    btn.addEventListener('click',function(){
      var idx=parseInt(this.getAttribute('data-slide')||0);
      if(gallery._goTo)gallery._goTo(idx);
      thumbSide.forEach(function(t){t.classList.remove('active')});
      btn.classList.add('active');
    });
  });
  /* Patch _goTo to also update sidebar active state */
  if(gallery._goTo){
    var origGoTo=gallery._goTo;
    gallery._goTo=function(idx,smooth){
      origGoTo(idx,smooth);
      thumbSide.forEach(function(t,i){t.classList.toggle('active',i===idx)});
      /* Scroll the active thumb into view in the sidebar */
      var activeThumb=gallery.querySelector('.product-gallery__thumb-side.active');
      if(activeThumb){
        var sidebar=gallery.querySelector('.product-gallery__thumbs-sidebar');
        if(sidebar){
          var thumbTop=activeThumb.offsetTop;
          var thumbH=activeThumb.offsetHeight;
          var sidebarH=sidebar.offsetHeight;
          var sidebarScroll=sidebar.scrollTop;
          if(thumbTop<sidebarScroll)sidebar.scrollTop=thumbTop-8;
          else if(thumbTop+thumbH>sidebarScroll+sidebarH)sidebar.scrollTop=thumbTop+thumbH-sidebarH+8;
        }
      }
    };
    /* Also sync when dots are clicked */
    gallery.querySelectorAll('.product-gallery__dot').forEach(function(dot){
      dot.addEventListener('click',function(){
        var idx=parseInt(this.getAttribute('data-slide')||0);
        thumbSide.forEach(function(t,i){t.classList.toggle('active',i===idx)});
      });
    });
  }
});
}
/* Run after gallery forEach has already set _goTo */
initGallerySidebar();

/* Cart recommendations scroller — v13.5 */
function initCartRecs(){
  var scroller=document.querySelector('[data-cart-recs-scroller]');
  if(!scroller) return;
  var prev=document.querySelector('[data-cart-recs-prev]');
  var next=document.querySelector('[data-cart-recs-next]');
  function step(dir){
    var first=scroller.firstElementChild;
    var w=first?first.getBoundingClientRect().width+14:200;
    scroller.scrollBy({left:dir*w*2, behavior:'smooth'});
  }
  function updateNav(){
    if(!prev||!next) return;
    var max=scroller.scrollWidth-scroller.clientWidth-2;
    prev.style.opacity=scroller.scrollLeft<=4?0.35:1;
    prev.style.pointerEvents=scroller.scrollLeft<=4?'none':'auto';
    next.style.opacity=scroller.scrollLeft>=max?0.35:1;
    next.style.pointerEvents=scroller.scrollLeft>=max?'none':'auto';
  }
  if(prev) prev.addEventListener('click',function(){step(-1)});
  if(next) next.addEventListener('click',function(){step(1)});
  scroller.addEventListener('scroll',updateNav,{passive:true});
  updateNav();
}
initCartRecs();

/* Available offers — click-to-copy — v13.7 */
function initAvailableOffers(){
  document.querySelectorAll('[data-copy-code]').forEach(function(btn){
    if(btn._copyBound) return;
    btn._copyBound=true;
    btn.addEventListener('click',function(){
      var code=btn.getAttribute('data-copy-code');
      if(!code) return;
      var done=function(){
        btn.classList.add('is-copied');
        try{sessionStorage.setItem('sakhi_pending_coupon', code);}catch(e){}
        if(window.sakhiToast){
          window.sakhiToast({type:'success', title:'Code copied', message:code+' — apply at checkout'});
        }
        setTimeout(function(){btn.classList.remove('is-copied')}, 2200);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(code).then(done).catch(function(){
          var t=document.createElement('textarea');t.value=code;document.body.appendChild(t);t.select();
          try{document.execCommand('copy')}catch(e){}
          document.body.removeChild(t);done();
        });
      }else{
        var t=document.createElement('textarea');t.value=code;document.body.appendChild(t);t.select();
        try{document.execCommand('copy')}catch(e){}
        document.body.removeChild(t);done();
      }
    });
  });
}
initAvailableOffers();

})();

import { PRODUCTS, CATEGORIES, JOURNAL, INFO, BRAND } from '/data/catalog.js';
import { ASSETS } from '/assets.js';
import { $, $$, esc, money, img, ic, toast, catName, bySlug, RM } from '/js/ui.js';
import { bag, totals } from '/js/store.js';
import * as pages from '/js/pages.js';

document.documentElement.classList.add('js');
const AERIS = (window.AERIS = { hasGLB: !!ASSETS.__glb });

/* ---------------- shell ---------------- */
const shell = `
<div class="atmos" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<div class="grain" aria-hidden="true"></div>
<a href="#main" class="sr" style="position:fixed;left:16px;top:16px;z-index:200">Skip to content</a>
<header class="nav glass" id="nav">
  <a class="logo" href="/" aria-label="AERIS home">AERIS<sup>°</sup></a>
  <nav class="nav-links" aria-label="Main">
    <a href="/shop" data-nav="shop" data-mega>Shop</a>
    <a href="/collection/afterlight" data-nav="collection">Drop 01</a>
    <a href="/journal" data-nav="journal">Journal</a>
    <a href="/about" data-nav="about">About</a>
    <a href="/stores" data-nav="stores">Stores</a>
  </nav>
  <div class="nav-meta mono"><span>SS27 — Afterlight</span><span class="dim">Riga · EUR</span></div>
  <div class="nav-right">
    <button class="circ" id="searchBtn" aria-label="Search">${ic('search')}</button>
    <button class="bag-btn" id="bagBtn" aria-label="Open bag"><span class="lbl">Bag</span><span class="count" id="bagCount">0</span></button>
    <button class="circ menu-btn" id="menuBtn" aria-label="Open menu">${ic('menu')}</button>
  </div>
</header>
<div class="mega glass" id="mega" aria-hidden="true">
  <div class="mega-cats"><span class="mono dim" style="padding:0 12px 8px">Categories</span>
    <a href="/shop"><span class="d">Shop all</span><span class="mono dim">${PRODUCTS.length}</span></a>
    ${CATEGORIES.map((c) => `<a href="/shop/${c.key}"><span class="d">${c.name}</span><span class="mono dim">${PRODUCTS.filter((p) => p.category === c.key).length}</span></a>`).join('')}</div>
  <div class="mega-col2" style="display:grid;gap:10px;align-content:start"><span class="mono dim">Featured</span>
    ${PRODUCTS.filter((p) => p.featured <= 3).sort((a, b) => a.featured - b.featured).map((p) => `<a href="/product/${p.slug}" style="display:flex;gap:14px;align-items:center;text-decoration:none;padding:8px;border-radius:16px"><span style="width:64px;aspect-ratio:4/5;border-radius:12px;overflow:hidden;background:${ASSETS[p.colors[0].img]?.bg || '#dcd7d0'}">${img(p.colors[0].img, { alt: '', sizes: '64px', attrs: 'style="width:100%;height:100%;object-fit:cover"' })}</span><span><span class="d" style="font-size:22px">${p.name}</span><br><span class="mono dim">${money(p.price)}</span></span></a>`).join('')}
    <span class="mono dim" style="margin-top:8px">Help</span><a class="link" href="/help/sizing" style="justify-self:start">Size guide</a><a class="link" href="/help/shipping" style="justify-self:start">Shipping</a></div>
  <a class="mega-feature" href="/collection/afterlight">${img('202', { alt: 'Afterlight campaign', sizes: '33vw' })}<span class="cap glass" style="color:var(--ink)"><span><span class="mono dim">Drop 01</span><br><span class="d d-md">Afterlight</span></span><span class="circ dark">${ic('ne')}</span></span></a>
</div>
<div class="mobile-menu" id="mobileMenu" aria-hidden="true">
  <div class="mm-top"><a class="logo" href="/">AERIS<sup>°</sup></a><button class="circ" data-close-menu aria-label="Close menu">${ic('close')}</button></div>
  <nav class="mm-links" aria-label="Mobile">
    ${[['/shop', 'Shop all', PRODUCTS.length], ['/collection/afterlight', 'Drop 01', 'New'], ...CATEGORIES.map((c) => [`/shop/${c.key}`, c.name, PRODUCTS.filter((p) => p.category === c.key).length]), ['/journal', 'Journal', '04'], ['/about', 'About', ''], ['/stores', 'Stores & contact', '']].map(([h, l, n]) => `<a href="${h}"><span class="d">${l}</span><span class="mono dim">${n}</span></a>`).join('')}
  </nav>
  <div class="mono mid">${BRAND.tagline}</div>
</div>
<div class="search glass" id="search" role="dialog" aria-label="Search" aria-hidden="true">
  <form class="search-bar" id="searchForm" role="search">${ic('search')}<label class="sr" for="q">Search</label><input id="q" placeholder="Search pieces" autocomplete="off"><button type="button" class="circ" data-close-search aria-label="Close search">${ic('close')}</button></form>
  <div class="search-grid"><div><span class="mono dim" data-sr-meta>Popular</span><div class="sr-list" data-sr style="margin-top:12px"></div></div>
    <div style="display:grid;gap:10px;align-content:start"><span class="mono dim">Categories</span><div style="display:flex;flex-wrap:wrap;gap:6px">${CATEGORIES.map((c) => `<a class="chip" href="/shop/${c.key}">${c.name}</a>`).join('')}</div>
    <span class="mono dim" style="margin-top:14px">Journal</span>${JOURNAL.map((j) => `<a class="link" href="/journal/${j.slug}" style="justify-self:start">${j.no} — ${j.title}</a>`).join('')}</div></div>
</div>
<div class="scrim" id="scrim"></div>
<aside class="drawer glass" id="bagDrawer" aria-label="Bag" aria-hidden="true">
  <div class="drawer-head"><span class="d d-md">Bag</span><span class="mono dim" data-bagn></span><button class="circ" data-close-bag aria-label="Close bag">${ic('close')}</button></div>
  <div class="drawer-body" data-baglines></div>
  <div style="display:grid;gap:12px" data-bagfoot><div data-bagsum></div><a class="btn block" href="/checkout"><span>Checkout</span><span class="ic">${ic('right')}</span></a><a class="link" href="/bag" style="justify-self:center">View bag</a></div>
</aside>
<div class="modal glass" id="modal" role="dialog" aria-modal="true" aria-hidden="true"></div>
<div class="lightbox" id="lightbox" aria-hidden="true"><img alt=""><button class="circ" aria-label="Close zoom">${ic('close')}</button></div>
<div class="toast glass" id="toast" role="status" aria-live="polite"><span class="pulse"></span><span class="t"></span><a class="btn" href="/bag" hidden style="height:40px;padding-left:16px"><span>View bag</span><span class="ic" style="width:30px;height:30px">${ic('right')}</span></a></div>
<main id="main" tabindex="-1"></main>
<footer class="foot">
  <div class="foot-in glass">
    <div class="foot-top">
      <div class="news"><span class="d d-md">Drops, first</span><p class="mid" style="margin:0;font-size:14px">Two emails a month: new drops a day early, and stories from the studio.</p>
        <form id="newsForm" novalidate><label class="sr" for="newsEmail">Email</label><input id="newsEmail" type="email" placeholder="Email address" autocomplete="email"><button class="btn" type="submit"><span>Subscribe</span><span class="ic">${ic('right')}</span></button></form>
        <span class="mono dim" data-newsmsg>No spam. Unsubscribe in one click.</span></div>
      <div class="foot-col"><button class="fc-h mono dim" type="button" aria-expanded="false">Shop<span class="fc-i" aria-hidden="true">+</span></button><div class="fc-b"><a href="/shop">All pieces</a><a href="/collection/afterlight">Drop 01 — Afterlight</a>${CATEGORIES.slice(0, 4).map((c) => `<a href="/shop/${c.key}">${c.name}</a>`).join('')}</div></div>
      <div class="foot-col"><button class="fc-h mono dim" type="button" aria-expanded="false">Brand<span class="fc-i" aria-hidden="true">+</span></button><div class="fc-b"><a href="/about">About</a><a href="/journal">Journal</a><a href="/stores">Stores</a><a href="/help/care">Repairs & take-back</a></div></div>
      <div class="foot-col"><button class="fc-h mono dim" type="button" aria-expanded="false">Help<span class="fc-i" aria-hidden="true">+</span></button><div class="fc-b"><a href="/help/shipping">Shipping</a><a href="/help/returns">Returns</a><a href="/help/sizing">Size guide</a><a href="/stores">Contact</a></div></div>
      <div class="foot-col"><button class="fc-h mono dim" type="button" aria-expanded="false">Follow<span class="fc-i" aria-hidden="true">+</span></button><div class="fc-b"><span class="mid" style="font-size:14px">Instagram — @aeris.studio</span><span class="mid" style="font-size:14px">Pinterest — aeris</span><span class="mid" style="font-size:14px">Newsletter — above</span></div></div>
    </div>
    <p class="foot-mark" aria-hidden="true">AERIS<sup>°</sup></p>
    <div class="foot-bottom mono"><span>© 2027 AERIS Studio SIA · Riga, Latvia</span><nav aria-label="Legal"><a href="/legal/privacy">Privacy</a><a href="/legal/terms">Terms</a><span>EU · EUR · English</span><span>Visa · Mastercard · Amex · Apple Pay</span></nav></div>
  </div>
</footer>`;
document.body.insertAdjacentHTML('afterbegin', shell);

/* ---------------- routes ---------------- */
const ROUTES = [
  [/^\/$/, () => pages.home(), 'home'],
  [/^\/shop\/?$/, (m, q) => pages.shop({}, q), 'shop'],
  [/^\/shop\/([\w-]+)\/?$/, (m, q) => pages.shop({ cat: m[1] }, q), 'shop'],
  [/^\/collection\/?$/, () => pages.collection({}), 'collection'],
  [/^\/collection\/([\w-]+)\/?$/, (m) => pages.collection({ key: m[1] }), 'collection'],
  [/^\/product\/([\w-]+)\/?$/, (m, q) => pages.product({ slug: m[1] }, q), 'shop'],
  [/^\/journal\/?$/, () => pages.journal(), 'journal'],
  [/^\/journal\/([\w-]+)\/?$/, (m) => pages.article({ slug: m[1] }), 'journal'],
  [/^\/about\/?$/, () => pages.about(), 'about'],
  [/^\/stores\/?$/, () => pages.stores(), 'stores'],
  [/^\/(?:help|legal)\/([\w-]+)\/?$/, (m) => pages.info({ key: m[1] }), ''],
  [/^\/bag\/?$/, () => pages.bagPage(), ''],
  [/^\/checkout\/?$/, () => pages.checkout(), ''],
  [/^\/checkout\/confirmation\/?$/, () => pages.confirmation(), ''],
];
const main = $('#main');
let cleanup = null;

function resolve(url) {
  const u = new URL(url, location.origin);
  for (const [re, fn, nav] of ROUTES) { const m = u.pathname.match(re); if (m) return { page: fn(m, u.searchParams), nav }; }
  return { page: pages.notFound(), nav: '' };
}

function render(url, { restore = 0 } = {}) {
  closeAll();
  if (cleanup) { try { cleanup(); } catch (e) { console.warn(e); } cleanup = null; }
  const { page, nav } = resolve(url);
  document.title = page.title;
  main.className = page.flush ? 'flush' : '';
  main.innerHTML = page.html;
  $$('[data-nav]').forEach((a) => (a.dataset.nav === nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  window.scrollTo(0, restore);
  cleanup = page.mount ? page.mount(main) : null;
  reveal();
  parallax();
}

export function navigate(href, { replace = false } = {}) {
  const go = () => render(href);
  if (replace) history.replaceState({ y: 0 }, '', href); else { history.replaceState({ y: scrollY }, '', location.href); history.pushState({ y: 0 }, '', href); }
  if (document.startViewTransition && !RM) document.startViewTransition(go); else go();
}
AERIS.navigate = navigate;

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
  const href = a.getAttribute('href'); if (!href || !href.startsWith('/') || href.startsWith('//')) return;
  if (href.startsWith('#')) return;
  e.preventDefault();
  // shared-element morph from card / rail into the product page
  if (a.matches('[data-piece]')) { const im = a.closest('.card,.rail-item')?.querySelector('.main, img'); if (im) im.style.viewTransitionName = 'piece'; }
  const target = new URL(href, location.origin);
  if (target.pathname + target.search === location.pathname + location.search && !target.hash) { closeAll(); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); return; }
  navigate(href);
});
addEventListener('popstate', (e) => { const go = () => render(location.href, { restore: e.state?.y || 0 }); if (document.startViewTransition && !RM) document.startViewTransition(go); else go(); });

/* ---------------- quick add from cards ---------------- */
document.addEventListener('click', (e) => {
  const q = e.target.closest('[data-quick]'); if (!q) return;
  e.preventDefault(); e.stopPropagation();
  const [slug, color, size] = q.dataset.quick.split('|'); const p = bySlug(slug);
  const r = bag.add(slug, color, size);
  if (r.ok) { toast(`Added · ${p.name} / ${p.colors.find((c) => c.key === color).name} / ${size}`, { href: '/bag', label: 'View bag' }); bump(); } else toast(r.reason);
});

/* ---------------- overlays ---------------- */
const scrim = $('#scrim'); let scrimClose = null;
AERIS.scrim = (on, onClose) => { scrim.classList.toggle('on', on); scrimClose = on ? onClose : null; document.documentElement.style.overflow = on ? 'hidden' : ''; };
scrim.addEventListener('click', () => scrimClose && scrimClose());
const panels = { bag: $('#bagDrawer'), search: $('#search'), menu: $('#mobileMenu'), modal: $('#modal') };
function setPanel(name, on) {
  const el = panels[name]; el.classList.toggle('on', on); el.setAttribute('aria-hidden', String(!on));
  if (on) { Object.keys(panels).forEach((k) => k !== name && panels[k].classList.contains('on') && setPanel(k, false)); }
  if (name !== 'menu') AERIS.scrim(on, () => setPanel(name, false)); else document.documentElement.style.overflow = on ? 'hidden' : '';
  if (on) setTimeout(() => (name === 'search' ? $('#q') : $('.circ', el))?.focus({ preventScroll: true }), 60);
}
function closeAll() { Object.keys(panels).forEach((k) => panels[k].classList.contains('on') && setPanel(k, false)); mega(false); lightboxClose(); AERIS.scrim(false); }
$('#bagBtn').addEventListener('click', () => setPanel('bag', true));
$('[data-close-bag]').addEventListener('click', () => setPanel('bag', false));
$('#searchBtn').addEventListener('click', () => setPanel('search', true));
$('[data-close-search]').addEventListener('click', () => setPanel('search', false));
$('#menuBtn').addEventListener('click', () => setPanel('menu', true));
$('[data-close-menu]').addEventListener('click', () => setPanel('menu', false));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
  if (e.key === '/' && !e.target.matches('input,textarea,select')) { e.preventDefault(); setPanel('search', true); }
});

/* mega menu */
const megaEl = $('#mega'); let megaT;
function mega(on) { clearTimeout(megaT); megaEl.classList.toggle('on', on); megaEl.setAttribute('aria-hidden', String(!on)); }
$('[data-mega]').addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') mega(true); });
$('#nav').addEventListener('pointerleave', () => { megaT = setTimeout(() => mega(false), 220); });
megaEl.addEventListener('pointerenter', () => clearTimeout(megaT));
megaEl.addEventListener('pointerleave', () => { megaT = setTimeout(() => mega(false), 220); });
$('[data-mega]').addEventListener('focus', () => mega(true));

/* search */
const runSearch = () => {
  const v = $('#q').value.trim().toLowerCase(), toks = v.split(/\s+/).filter(Boolean);
  const list = (toks.length ? PRODUCTS.filter((p) => { const h = [p.name, p.type, catName(p.category), ...p.tags, ...p.colors.map((c) => c.name)].join(' ').toLowerCase(); return toks.every((t) => h.includes(t)); }) : PRODUCTS.filter((p) => p.featured <= 4).sort((a, b) => a.featured - b.featured)).slice(0, 8);
  $('[data-sr-meta]').textContent = toks.length ? `${list.length} ${list.length === 1 ? 'result' : 'results'} — press Enter to see all` : 'Popular';
  $('[data-sr]').innerHTML = list.length ? list.map((p) => `<a class="sr-item" href="/product/${p.slug}"><span class="m" style="background:${ASSETS[p.colors[0].img]?.bg || '#dcd7d0'}">${img(p.colors[0].img, { alt: '', sizes: '200px' })}</span><span class="d" style="font-size:20px">${esc(p.name)}</span><span class="mono dim">${money(p.price)}</span></a>`).join('') : '<p class="mid">Nothing matches. Try “shell”, “wool” or “graphite”.</p>';
};
$('#q').addEventListener('input', runSearch);
$('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#q').value.trim(); navigate(v ? `/shop?q=${encodeURIComponent(v)}` : '/shop'); });
runSearch();

/* bag drawer */
function paintBag() {
  const items = bag.items(), n = bag.count();
  $('#bagCount').textContent = n; $('[data-bagn]').textContent = `${n} ${n === 1 ? 'item' : 'items'}`;
  $('[data-baglines]').innerHTML = pages.lineItems(items);
  $('[data-bagfoot]').hidden = !items.length;
  $('[data-bagsum]').innerHTML = items.length ? pages.summary(totals()) : '';
}
pages.bindLines($('#bagDrawer')); bag.on(paintBag); paintBag();
function bump() { const c = $('#bagCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
AERIS.bump = bump;

/* size guide modal */
AERIS.sizeGuide = (p) => {
  const t = INFO.sizing.table;
  $('#modal').innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><span class="d d-md">Size guide${p ? ` · ${esc(p.name)}` : ''}</span><button class="circ" data-close-modal aria-label="Close">${ic('close')}</button></div>
    ${p ? `<p class="mid" style="margin:0 0 14px">${esc(p.fit.note)} ${esc(p.fit.model || '')}</p><dl class="kv mono" style="margin-bottom:18px">${p.dimensions.rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><span class="mono dim">Garment measured on size ${esc(p.dimensions.size)}</span>` : ''}
    ${p && p.category === 'footwear' ? '<p class="mid" style="margin-top:14px">Shoes are EU sizes and true to size. For half sizes, size up.</p>' : `<div class="tbl-wrap" style="margin-top:16px"><table class="tbl"><thead><tr>${t.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}`;
  $('[data-close-modal]', $('#modal')).addEventListener('click', () => setPanel('modal', false));
  setPanel('modal', true);
};

/* lightbox with pan */
const lb = $('#lightbox'), lbImg = $('img', lb);
AERIS.lightbox = (url, alt) => {
  lbImg.src = url; lbImg.alt = alt || ''; lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
  const pan = (x, y) => { const w = lbImg.offsetWidth, h = lbImg.offsetHeight; lbImg.style.transform = `translate(${-(w - innerWidth) * (x / innerWidth)}px, ${-(h - innerHeight) * (y / innerHeight)}px)`; };
  lb.onpointermove = (e) => pan(e.clientX, e.clientY); pan(innerWidth / 2, innerHeight / 2);
};
function lightboxClose() { if (!lb.classList.contains('on')) return; lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = ''; }
lb.addEventListener('click', lightboxClose);

/* footer accordion (mobile only) */
$$('.fc-h').forEach((b) => b.addEventListener('click', () => { if (!matchMedia('(max-width:760px)').matches) return; const c = b.parentElement, on = !c.classList.contains('open'); c.classList.toggle('open', on); b.setAttribute('aria-expanded', String(on)); }));

/* newsletter */
$('#newsForm').addEventListener('submit', (e) => {
  e.preventDefault(); const v = $('#newsEmail').value.trim(), msg = $('[data-newsmsg]');
  if (!/\S+@\S+\.\S+/.test(v)) { msg.textContent = 'Enter a valid email address.'; msg.style.color = 'var(--warn)'; return; }
  msg.style.color = ''; msg.textContent = `Subscribed: ${v}. Watch for the next drop.`; e.target.reset();
});

/* ---------------- scroll: nav hide, reveal, parallax ---------------- */
let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY, down = y > lastY && y > 140;
  if (Math.abs(y - lastY) > 6) { $('#nav').classList.toggle('hide', down && !megaEl.classList.contains('on')); document.body.classList.toggle('nav-hidden', down); lastY = y; }
}, { passive: true });

let io;
function reveal() {
  io?.disconnect();
  io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]', main).forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); else io.observe(el); });
}
let pEls = [], pRaf = 0;
function parallax() { pEls = $$('[data-parallax]', main); }
addEventListener('scroll', () => { if (RM || pRaf || !pEls.length) return; pRaf = requestAnimationFrame(() => { pRaf = 0; pEls.forEach((el) => { const k = parseFloat(el.dataset.parallax) || 0.14; const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; el.style.transform = `translate3d(0, ${(-r.top) * k}px, 0)`; }); }); }, { passive: true });

/* ---------------- boot ---------------- */
history.scrollRestoration = 'manual';
render(location.href);

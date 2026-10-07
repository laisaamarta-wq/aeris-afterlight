import { PRODUCTS, CATEGORIES, COLLECTIONS, JOURNAL, STORES, INFO, BRAND } from '/data/catalog.js';
import { $, $$, esc, pad, clamp, money, img, src, bg, ic, card, bySlug, catName, colorOf, stockOf, totalStock, availability, toast, RM, SHIP_FREE } from '/js/ui.js';
import { bag, totals } from '/js/store.js';
import { createOrder, checkDiscount, lastOrder } from '/js/commerce.js';

const byFeatured = (a, b) => a.featured - b.featured;
const rv = 'data-reveal';

/* ======================================================================
   SHARED BLOCKS
   ====================================================================== */
function rail(list) {
  return `<div class="rail-wrap"><div class="rail" data-rail>${list.map((p) => {
    const c = p.colors[0];
    return `<a class="rail-item" href="/product/${p.slug}" data-piece>
      <div class="stage"><span class="ghostno" aria-hidden="true">${p.no}</span><span class="orb"></span>${img(c.img, { cut: true, alt: `${p.name} in ${c.name}`, sizes: '(max-width:760px) 72vw, 26vw' })}</div>
      <div class="lbl"><span class="d">${esc(p.name)}</span><span class="mono">${money(p.price)}</span></div>
      <div class="lbl mono dim" style="padding-top:0"><span>${esc(p.type)}</span><span>${p.no} / 12</span></div>
    </a>`;
  }).join('')}</div></div>`;
}
function railCtrl() {
  return `<div class="rail-ctrl"><div class="rail-progress" aria-hidden="true"><i data-rail-bar></i></div>
    <button class="circ" data-rail-prev aria-label="Previous pieces">${ic('left')}</button>
    <button class="circ dark" data-rail-next aria-label="Next pieces">${ic('right')}</button></div>`;
}
function mountRail(root) {
  const el = $('[data-rail]', root); if (!el) return () => {};
  const items = $$('.rail-item', el), bar = $('[data-rail-bar]', root);
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2;
    items.forEach((it) => {
      const ir = it.getBoundingClientRect(), d = clamp(((ir.left + ir.width / 2) - cx) / r.width, -1, 1);
      const im = $('img', it), no = $('.ghostno', it);
      if (!RM) { im.style.transform = `translate3d(${d * -18}px, ${Math.abs(d) * 26}px, 0) rotate(${d * -4}deg)`; no.style.transform = `translateX(${d * 40}px)`; }
      it.style.opacity = String(1 - Math.abs(d) * 0.35);
    });
    const max = el.scrollWidth - el.clientWidth, p = max > 0 ? el.scrollLeft / max : 0;
    if (bar) { bar.style.width = `${clamp(el.clientWidth / el.scrollWidth * 100, 8, 100)}%`; bar.style.left = `${p * (100 - parseFloat(bar.style.width))}%`; }
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };
  el.addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); update();
  // mouse drag (touch scrolls natively)
  let drag = null;
  el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, s: el.scrollLeft, moved: false }; });
  addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) { drag.moved = true; el.classList.add('dragging'); } el.scrollLeft = drag.s - dx; });
  const end = () => { if (!drag) return; const moved = drag.moved; drag = null; el.classList.remove('dragging'); if (moved) { const stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); }; el.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => el.removeEventListener('click', stop, { capture: true }), 50); } };
  addEventListener('pointerup', end);
  const step = () => (items[0]?.getBoundingClientRect().width || 300) + 24;
  $('[data-rail-prev]', root)?.addEventListener('click', () => el.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('[data-rail-next]', root)?.addEventListener('click', () => el.scrollBy({ left: step(), behavior: 'smooth' }));
  return () => { removeEventListener('resize', req); removeEventListener('pointerup', end); };
}

function dataList(p, open = 1) {
  return `<ol class="data-list">${p.specs.map(([k, v], i) => `<li><button class="dl-row" aria-expanded="${i === open}"><span class="dl-n">${pad(i + 1)}</span><span class="dl-k">${esc(k)}</span><span class="dl-hint" aria-hidden="true">+</span></button><div class="dl-v"><div><p class="mono">${esc(v)}</p></div></div></li>`).join('')}</ol>`;
}
function mountDataList(root) {
  $$('.data-list', root).forEach((list) => list.addEventListener('click', (e) => {
    const b = e.target.closest('.dl-row'); if (!b) return;
    const was = b.getAttribute('aria-expanded') === 'true';
    $$('.dl-row', list).forEach((x) => x.setAttribute('aria-expanded', 'false'));
    b.setAttribute('aria-expanded', String(!was));
  }));
}

/* buy controls shared by signature block and product page */
function buyControls(p, state) {
  return `<div><div class="vp-title mono"><span>Colour</span><span data-colorname>${esc(colorOf(p, state.color).name)}</span></div>
    <div class="swatches" role="radiogroup" aria-label="Colour">${p.colors.map((c) => `<button class="sw" role="radio" aria-checked="${c.key === state.color}" data-color="${c.key}" aria-label="${c.name}"><i style="background:${c.hex}"></i><span class="mono">${c.name}</span></button>`).join('')}</div></div>
    <div><div class="vp-title mono"><span>Size</span><button class="mono link" data-sizeguide style="border:0;text-decoration:underline">Size guide</button></div>
    <div class="sizes" role="radiogroup" aria-label="Size" data-sizes>${sizeButtons(p, state)}</div></div>
    <div class="avail" data-avail></div>`;
}
function sizeButtons(p, state) {
  return p.sizes.map((s) => { const n = stockOf(p, state.color, s); return `<button class="sz ${n === 0 ? 'out' : n <= 2 ? 'low' : ''}" role="radio" aria-checked="${s === state.size}" data-size="${esc(s)}" ${n === 0 ? 'aria-disabled="true"' : ''} aria-label="${esc(s)}${n === 0 ? ', sold out' : n <= 2 ? `, ${n} left` : ''}">${esc(s.replace('One size', 'One size'))}</button>`; }).join('');
}
function mountBuy(root, p, state, { onColor } = {}) {
  const paint = () => {
    $$('[data-color]', root).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.color === state.color)));
    $$('[data-colorname]', root).forEach((e) => (e.textContent = colorOf(p, state.color).name));
    $$('[data-sizes]', root).forEach((e) => (e.innerHTML = sizeButtons(p, state)));
    const a = availability(p, state.color, state.size);
    $$('[data-avail]', root).forEach((e) => { e.className = `avail ${a.cls}`; e.innerHTML = `<i></i><span>${esc(state.size ? a.text : 'Select a size')}</span>`; });
    $$('[data-add]', root).forEach((b) => { const out = state.size && stockOf(p, state.color, state.size) === 0; b.disabled = !!out; $('.lbl', b).textContent = out ? 'Sold out' : state.size ? `Add to bag — ${state.size}` : 'Add to bag'; });
  };
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-color]'); if (c) { state.color = c.dataset.color; if (state.size && !stockOf(p, state.color, state.size)) {/* keep, shows sold out */} paint(); onColor && onColor(state.color); return; }
    const s = e.target.closest('[data-size]'); if (s) { state.size = s.dataset.size; paint(); return; }
    if (e.target.closest('[data-sizeguide]')) { window.AERIS.sizeGuide(p); return; }
    const add = e.target.closest('[data-add]');
    if (add) {
      if (!state.size) { const sz = $('[data-sizes]', root); sz?.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 320 }); $$('[data-avail]', root).forEach((e2) => { e2.className = 'avail low'; e2.innerHTML = '<i></i><span>Select a size first</span>'; }); return; }
      const r = bag.add(p.slug, state.color, state.size);
      if (r.ok) { toast(`Added · ${p.name} / ${colorOf(p, state.color).name} / ${state.size}`, { href: '/bag', label: 'View bag' }); window.AERIS.bump(); }
      else toast(r.reason);
    }
  });
  paint();
  return paint;
}

/* ======================================================================
   HOME
   ====================================================================== */
export function home() {
  const sig = bySlug('meridian-shell');
  const feat = [...PRODUCTS].sort(byFeatured).slice(0, 8);
  const words = 'Clothing for the hour after. Made to be worn for years, repaired when it tears, and handed on when you are done.'.split(' ');
  return {
    title: 'AERIS° — Technical clothing from Riga', flush: true,
    html: `
<section class="hero">
  <div class="hero-frame">
    ${img('200', { alt: 'Three models on a salt flat after sunset, wearing the Afterlight drop', eager: true, sizes: '(max-width:760px) 560vw, 200vw', attrs: 'data-parallax="0.06"' })}
    <div class="hero-ui">
      <p class="hm hm-drop mono">Drop 01 — SS27<br>12 pieces</p>
      <h1 class="d hero-word">Afterlight</h1>
      <div class="hero-card glass">
        <div class="top"><span class="mono">01 · Signature piece</span><span class="mono">${money(sig.price)}</span></div>
        <div class="hc-main">
          <div class="hc-thumb">${img('10', { cut: true, alt: '', sizes: '96px' })}</div>
          <div class="hc-txt"><div class="d d-sm">${sig.name}</div><p class="mid hc-tag">${esc(sig.tagline)}</p><span class="mono hc-price">${money(sig.price)} · Signature piece</span></div>
          <a class="hc-go" href="/product/${sig.slug}" aria-label="View the ${esc(sig.name)}">${ic('ne')}</a>
        </div>
        <div class="acts"><a class="btn" href="/collection/afterlight">Explore the drop<span class="ic">${ic('ne')}</span></a><a class="btn-line" href="/shop">Shop all</a></div>
      </div>
      <p class="hm hm-shot mono">Shot on a salt flat,<br>twenty minutes after sunset</p>
      <p class="hm hm-pal mono">Stone · Sand · Bone · Graphite</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap sec-head" ${rv}>
    <div class="left"><div class="eyebrow"><b>02</b><span class="mono dim">New drop</span></div><h2 class="d d-lg" style="margin:0">Drop 01 — Afterlight</h2><p class="lede mid" style="margin:0">${esc(COLLECTIONS[0].lede)}</p></div>
    <div style="display:grid;gap:14px;justify-items:end">${railCtrl()}<a class="link" href="/collection/afterlight">Explore all 12 pieces</a></div>
  </div>
  ${rail([...PRODUCTS].sort((a, b) => a.no.localeCompare(b.no)))}
</section>

<section class="section-tight wrap">
  <div class="sec-head" ${rv}>
    <div class="left"><div class="eyebrow"><b>03</b><span class="mono dim">Shop the collection</span></div><h2 class="d d-lg" style="margin:0">Pieces to live in</h2></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${CATEGORIES.slice(0, 5).map((c) => `<a class="chip" href="/shop/${c.key}">${c.name}</a>`).join('')}</div>
  </div>
  <div class="grid" ${rv}>${feat.map((p) => card(p)).join('')}</div>
  <div style="display:flex;justify-content:center;margin-top:36px"><a class="btn" href="/shop">View all 12 pieces<span class="ic">${ic('ne')}</span></a></div>
</section>

<section class="section wrap" id="explore">
  <div class="sec-head" ${rv}>
    <div class="left"><div class="eyebrow"><b>04</b><span class="mono dim">Explore the piece</span></div><h2 class="d d-lg" style="margin:0">Meridian Shell in 360°</h2></div>
    <p class="mid" style="max-width:38ch;margin:0">Turn it, zoom in, tap the jacket to inspect its construction, then choose a colour and size without leaving the page.</p>
  </div>
  ${signatureBlock(sig)}
</section>

<section class="section wrap">
  <div class="campaign" data-clip ${rv}>
    ${img('202', { alt: 'Two models in long coats walking toward the horizon at blue hour', sizes: '100vw', attrs: 'data-parallax="0.08"' })}
    <div class="cap">
      <div class="glass" style="border-radius:var(--r-lg);padding:18px 20px;max-width:420px;display:grid;gap:10px">
        <span class="mono dim">05 · Campaign</span>
        <span class="d d-md">Twenty minutes of light</span>
        <p class="mid" style="margin:0;font-size:14px">We shot Afterlight across four evenings on a salt flat, only in the window after the sun had gone. No artificial light.</p>
        <a class="link" href="/journal/afterlight" style="justify-self:start">Read the story</a>
      </div>
      <span class="mono" style="color:#fbf6f0">Photographed on film stock look · 35mm</span>
    </div>
  </div>
  <div class="split" style="margin-top:clamp(12px,1.6vw,24px)">
    <a class="frame-img" href="/product/meridian-shell" style="grid-column:1/6;aspect-ratio:4/5" ${rv}>${img('201', { alt: 'Model with the hood up on a graphite Meridian Shell', sizes: '(max-width:760px) 100vw, 40vw' })}<span class="lab glass mono">Meridian Shell · Graphite</span></a>
    <div style="grid-column:6/9;align-self:center;display:grid;gap:16px;padding:20px 0" ${rv}>
      <p class="d d-md" style="margin:0">Colour drains from the landscape. The horizon stays warm.</p>
      <p class="mid" style="margin:0">The palette of the drop sits inside those colours: stone, sand, bone and graphite. Any two pieces work together.</p>
      <a class="btn-line" href="/collection/afterlight" style="justify-self:start">See the lookbook</a>
    </div>
    <a class="frame-img" href="/shop" style="grid-column:9/13;aspect-ratio:4/5" ${rv}>${img('203', { alt: 'Folded garments and a sneaker on a stone block on the salt flat', sizes: '(max-width:760px) 100vw, 33vw' })}</a>
  </div>
</section>

<section class="section wrap">
  <div class="sec-head" ${rv}>
    <div class="left"><div class="eyebrow"><b>06</b><span class="mono dim">Material & craft</span></div><h2 class="d d-lg" style="margin:0">Measured, not described</h2></div>
    <p class="mid" style="max-width:40ch;margin:0">Every fabric is tested before it is cut. These are the numbers behind three of them.</p>
  </div>
  <div class="materials">
    ${[
      ['13', '20,000', 'mm', 'Water column', '3-layer recycled nylon', 'The Meridian Shell keeps out 20 m of water pressure while breathing at 30,000 g/m² over 24 hours. No PFAS.', 'meridian-shell'],
      ['33', '620', 'g/m²', 'Wool-cashmere', 'Milled in Biella', 'A dense 80/20 wool-cashmere, brushed on the face. Heavy enough to block wind, soft enough to wear without a scarf.', 'dusk-coat'],
      ['63', '480', 'g/m²', 'Loopback cotton', 'Knitted in Porto', 'Organic cotton knitted on loopback machines and garment-washed. It holds its shape for years, not washes.', 'halo-hoodie'],
    ].map(([k, n, u, t, s, d, slug]) => `<a class="mat" href="/product/${slug}" style="text-decoration:none" ${rv}>
      <div class="frame-img">${img(k, { alt: `${t} close-up`, sizes: '(max-width:900px) 50vw, 33vw' })}<span class="lab glass mono">${s}</span></div>
      <div style="display:grid;gap:10px"><div class="fig"><span class="num">${n}</span><span class="mono" style="padding-bottom:8px">${u}</span></div><span class="d d-sm">${t}</span><p class="mid" style="margin:0;font-size:14px;max-width:40ch">${d}</p></div>
    </a>`).join('')}
  </div>
</section>

<section class="section-tight wrap">
  <div class="sec-head" ${rv}>
    <div class="left"><div class="eyebrow"><b>07</b><span class="mono dim">Journal</span></div><h2 class="d d-lg" style="margin:0">Notes from the studio</h2></div>
    <a class="link" href="/journal">All stories</a>
  </div>
  <div class="journal-grid">${JOURNAL.map((j) => journalCard(j)).join('')}</div>
</section>

<section class="statement wrap" data-statement>
  <div class="eyebrow" style="margin-bottom:24px"><b>08</b><span class="mono dim">Statement</span></div>
  <p>${words.map((w) => `<span class="w">${esc(w)}</span>`).join(' ')}</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:36px"><a class="btn" href="/about">About AERIS<span class="ic">${ic('ne')}</span></a><a class="btn-line" href="/stores">Visit a store</a></div>
</section>`,
    mount(root) {
      const cleanups = [mountRail(root), mountSignature(root, sig)];
      // statement word reveal
      const st = $('[data-statement]', root), ws = $$('.w', st);
      const onScroll = () => {
        const r = st.getBoundingClientRect(), p = clamp((innerHeight * 0.85 - r.top) / (r.height * 0.9), 0, 1);
        const n = Math.round(p * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n || RM));
        const c = $('[data-clip]', root); if (c) { const cr = c.getBoundingClientRect(); const q = clamp((innerHeight - cr.top) / (innerHeight * 0.8), 0, 1); c.style.setProperty('--clip', `${(1 - q) * 6}%`); }
      };
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
      cleanups.push(() => removeEventListener('scroll', onScroll));
      return () => cleanups.forEach((f) => f && f());
    },
  };
}

function journalCard(j) {
  return `<a class="jcard" href="/journal/${j.slug}" ${rv}>
    <div class="frame-img">${img(j.img, { alt: j.title, sizes: '(max-width:1080px) 50vw, 25vw' })}<span class="lab glass mono">${esc(j.kicker)} · ${esc(j.read)}</span></div>
    <div class="t"><span class="num">${j.no}</span><span class="d d-sm">${esc(j.title)}</span></div>
    <p class="mid" style="margin:0;font-size:14px">${esc(j.lede)}</p>
  </a>`;
}

/* ---------- signature (interactive 3D) ---------- */
function signatureBlock(p) {
  const env = src(p.media.model);
  return `<div class="sig" data-sig style="--env-img:url('${env}')">
    <div class="env"></div>
    <canvas aria-label="Interactive 3D view of the ${esc(p.name)}. Drag to rotate."></canvas>
    <div class="fallback" hidden>${img(p.colors[0].img, { cut: true, alt: p.name, sizes: '40vw' })}</div>
    <div class="sig-ui">
      <div class="sig-head glass">
        <div class="row"><span class="num">${p.no}</span><div><div class="mono dim">${esc(catName(p.category))}</div><div class="d d-md">${esc(p.name)}</div></div></div>
        <div class="sh-meta" style="display:flex;justify-content:space-between;align-items:baseline"><span class="mono mid">${esc(p.type)}</span><span class="d" style="font-size:28px;font-weight:300">${money(p.price)}</span></div>
        <div class="sh-comp mono mid" style="border-top:1px solid var(--line);padding-top:10px">${esc(p.composition)}</div>
      </div>
      <div class="sig-hint glass mono" data-hint><span class="pulse"></span><span data-hint-t>Drag to rotate · tap to inspect</span></div>
      <div class="sig-data glass"><div class="vp-title mono" style="padding:4px 12px 0"><span>Object data</span><span class="dim">06</span></div>${dataList(p)}</div>
      <div class="sig-bar glass" data-sheet-open role="button" tabindex="0" aria-label="Choose colour and size for the ${esc(p.name)}">
        <span class="p"><span class="mono dim">${p.no} · ${esc(catName(p.category))}</span><span class="d">${esc(p.name)}</span></span>
        <span class="mono">${money(p.price)}</span><span class="circ dark" aria-hidden="true">${ic('plus')}</span>
      </div>
      <div class="sig-buy glass" data-buy role="dialog" aria-label="Choose colour and size">
        <div class="sheet-head"><span class="grab" aria-hidden="true"></span><div><div class="d d-sm">${esc(p.name)}</div><span class="mono mid">${money(p.price)} · ${esc(p.type)}</span></div><button class="circ sm" data-sheet-close aria-label="Close">${ic('close')}</button></div>
        ${buyControls(p, { color: p.colors[0].key, size: null })}
        <button class="btn block" data-add><span class="lbl">Add to bag</span><span class="ic">${ic('plus')}</span></button>
        <a class="link" href="/product/${p.slug}" style="justify-self:start">Full product page</a>
      </div>
      <div class="sig-tools glass" role="toolbar" aria-label="View controls">
        <button class="circ" data-t="rotate" aria-label="Rotate 90 degrees">${ic('rotate')}</button>
        <span class="mono readout" data-readout>AZ 000°</span>
        <span class="sep" style="width:1px;height:24px;background:var(--line)"></span>
        <button class="circ" data-t="out" aria-label="Zoom out">${ic('minus')}</button>
        <button class="circ" data-t="in" aria-label="Zoom in">${ic('plus')}</button>
        <button class="circ" data-t="reset" aria-label="Reset view">${ic('reset')}</button>
        <button class="circ" data-t="inspect" aria-pressed="false" aria-label="Inspect mode">${ic('eye')}</button>
      </div>
    </div>
  </div>`;
}
function mountSignature(root, p) {
  const el = $('[data-sig]', root); if (!el) return () => {};
  const state = { color: p.colors[0].key, size: null };
  let viewer = null, disposed = false;
  const tint = (key) => viewer?.setTint(key === 'graphite' ? '#545257' : key === 'stone' ? null : null);
  const sheet = (on) => { el.classList.toggle('sheet-open', on); window.AERIS.scrim(on, () => sheet(false)); };
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-sheet-open]')) return sheet(true);
    if (e.target.closest('[data-sheet-close]')) return sheet(false);
  });
  $('[data-sheet-open]', el).addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sheet(true); } });
  const before = () => bag.count();
  mountBuy($('[data-buy]', el), p, state, { onColor: tint });
  // after a successful add on mobile, close the sheet so the garment is back in view
  $('[data-buy]', el).addEventListener('click', (e) => { if (!e.target.closest('[data-add]') || !el.classList.contains('sheet-open')) return; const n = before(); setTimeout(() => { if (bag.count() > n) sheet(false); }, 250); }, true);
  mountDataList(el);
  const fallback = () => { $('canvas', el).hidden = true; $('.fallback', el).hidden = false; $('[data-hint-t]', el).textContent = '3D view unavailable — showing the product photo'; };
  const io = new IntersectionObserver(async ([en]) => {
    if (!en.isIntersecting) return; io.disconnect();
    if (!p.model3d?.glb || !window.AERIS.hasGLB) return fallback();
    try {
      const { createViewer } = await import('/js/viewer3d.js');
      if (disposed) return;
      viewer = createViewer({
        canvas: $('canvas', el), host: el, glb: p.model3d.glb, hotspots: p.model3d.hotspots,
        onError: fallback,
        onTick: ({ yaw }) => { const r = $('[data-readout]', el); if (r) r.textContent = `AZ ${pad(Math.round(((yaw * 180 / Math.PI) % 360 + 360) % 360), 3)}°`; },
      });
      el.addEventListener('inspect', (e) => { $('[data-t="inspect"]', el).setAttribute('aria-pressed', String(e.detail)); $('[data-hint-t]', el).textContent = e.detail ? 'Inspect mode · select a marker' : 'Drag to rotate · tap to inspect'; });
    } catch (err) { console.warn(err); fallback(); }
  }, { rootMargin: '300px' });
  io.observe(el);
  $('.sig-tools', el).addEventListener('click', (e) => {
    const t = e.target.closest('[data-t]')?.dataset.t; if (!t || !viewer) return;
    if (t === 'rotate') viewer.rotate90(); if (t === 'in') viewer.zoomBy(1.2); if (t === 'out') viewer.zoomBy(1 / 1.2); if (t === 'reset') viewer.reset();
    if (t === 'inspect') viewer.setInspect($('[data-t="inspect"]', el).getAttribute('aria-pressed') !== 'true');
  });
  return () => { disposed = true; io.disconnect(); viewer?.dispose(); if (el.classList.contains('sheet-open')) sheet(false); };
}

/* ======================================================================
   SHOP
   ====================================================================== */
const FEATURES = { water: ['Water-resistant', ['waterproof', 'water-repellent', 'water-resistant']], recycled: ['Recycled', ['recycled']], wool: ['Wool & merino', ['wool', 'merino', 'cashmere']], organic: ['Organic cotton', ['organic', 'cotton']] };
const PRICES = { u250: ['Under €250', (p) => p.price < 250], m: ['€250–€400', (p) => p.price >= 250 && p.price <= 400], o400: ['Over €400', (p) => p.price > 400] };
const SORTS = { featured: 'Featured', new: 'Newest', asc: 'Price, low to high', desc: 'Price, high to low' };
const ALL_COLORS = [...new Map(PRODUCTS.flatMap((p) => p.colors).map((c) => [c.name, c])).values()];

export function shop({ cat }, q) {
  const cur = CATEGORIES.find((c) => c.key === cat);
  if (cat && !cur) return notFound();
  const f = { q: q.get('q') || '', color: q.getAll('color'), size: q.getAll('size'), price: q.get('price') || '', feat: q.getAll('feat'), isNew: q.get('new') === '1', sort: q.get('sort') || 'featured' };
  return {
    title: `${cur ? cur.name : 'Shop'} — AERIS°`,
    html: `<div class="wrap">
  <div class="page-head">
    <div><nav class="crumbs mono" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop">Shop</a>${cur ? `<span>/</span><span>${cur.name}</span>` : ''}</nav>
    <h1 class="d d-xl" style="margin:0">${cur ? cur.name : 'Shop all'}</h1></div>
    <div style="display:grid;gap:6px;justify-items:end;text-align:right"><span class="mono dim">Drop 01 — Afterlight</span><span class="mono" data-count></span></div>
  </div>
  <div class="toolbar glass">
    <nav class="cats" aria-label="Categories"><a class="chip" href="/shop" ${!cur ? 'aria-current="page"' : ''}>All</a>${CATEGORIES.map((c) => `<a class="chip" href="/shop/${c.key}" ${cur?.key === c.key ? 'aria-current="page"' : ''}>${c.name}</a>`).join('')}</nav>
    <div class="tools">
      <label class="tsearch"><span class="sr">Search the shop</span>${ic('search')}<input type="search" id="shopSearch" placeholder="Search" value="${esc(f.q)}" autocomplete="off"></label>
      <button class="chip" data-open-filters>${ic('filter')}<span>Filter</span><span class="mono" data-fcount></span></button>
      <label class="sr" for="shopSort">Sort</label><select class="tselect" id="shopSort">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${f.sort === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <div class="density" role="group" aria-label="Grid density">${[2, 3, 4].map((n) => `<button data-cols="${n}" aria-label="${n} columns" aria-pressed="false">${ic('grid' + n)}</button>`).join('')}</div>
    </div>
  </div>
  <div class="active-filters" data-active></div>
  <div class="grid" data-grid></div>
  <div class="empty glass" data-empty hidden><span class="d d-md">No pieces match</span><p class="mid" style="margin:0">Try removing a filter or searching for something broader.</p><button class="btn-line" data-clear>Clear all filters</button></div>
</div>
<aside class="drawer left glass" id="filters" aria-label="Filters" aria-hidden="true">
  <div class="drawer-head"><span class="d d-md">Filter</span><button class="circ" data-close-filters aria-label="Close filters">${ic('close')}</button></div>
  <div class="drawer-body">
    <div class="fgroup"><span class="mono">Colour</span><div class="opts">${ALL_COLORS.map((c) => `<button class="chip" data-f="color" data-v="${c.name.toLowerCase()}" aria-pressed="false"><span style="width:12px;height:12px;border-radius:50%;background:${c.hex};box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)"></span>${c.name}</button>`).join('')}</div></div>
    <div class="fgroup"><span class="mono">Size in stock</span><div class="opts">${['XS', 'S', 'M', 'L', 'XL'].map((s) => `<button class="chip" data-f="size" data-v="${s}" aria-pressed="false">${s}</button>`).join('')}</div></div>
    <div class="fgroup"><span class="mono">Price</span><div class="opts">${Object.entries(PRICES).map(([k, [l]]) => `<button class="chip" data-f="price" data-v="${k}" aria-pressed="false">${l}</button>`).join('')}</div></div>
    <div class="fgroup"><span class="mono">Material</span><div class="opts">${Object.entries(FEATURES).map(([k, [l]]) => `<button class="chip" data-f="feat" data-v="${k}" aria-pressed="false">${l}</button>`).join('')}</div></div>
    <div class="fgroup" style="border:0"><label class="check"><input type="checkbox" id="fNew"> New in this drop</label></div>
  </div>
  <div style="display:grid;grid-template-columns:auto 1fr;gap:8px"><button class="btn-line" data-clear>Clear</button><button class="btn block" data-close-filters><span data-showlbl>Show results</span><span class="ic">${ic('right')}</span></button></div>
</aside>`,
    mount(root) {
      const grid = $('[data-grid]', root), drawer = $('#filters', root);
      let cols = 0; try { cols = +localStorage.getItem('aeris:cols') || 0; } catch {}
      const setCols = (n) => { if (n) grid.style.setProperty('--cols', n); else grid.style.removeProperty('--cols'); $$('[data-cols]', root).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.cols === n))); };
      setCols(cols);
      const filter = () => {
        const toks = f.q.toLowerCase().split(/\s+/).filter(Boolean);
        let list = PRODUCTS.filter((p) => {
          if (cur && p.category !== cur.key) return false;
          if (toks.length) { const hay = [p.name, p.type, catName(p.category), ...p.tags, ...p.colors.map((c) => c.name), p.composition].join(' ').toLowerCase(); if (!toks.every((t) => hay.includes(t))) return false; }
          if (f.color.length && !p.colors.some((c) => f.color.includes(c.name.toLowerCase()))) return false;
          if (f.size.length && !f.size.some((s) => p.colors.some((c) => stockOf(p, c.key, s) > 0))) return false;
          if (f.price && !PRICES[f.price][1](p)) return false;
          if (f.feat.length && !f.feat.every((k) => FEATURES[k][1].some((t) => p.tags.includes(t) || p.composition.toLowerCase().includes(t)))) return false;
          if (f.isNew && !p.isNew) return false;
          return true;
        });
        list.sort(f.sort === 'asc' ? (a, b) => a.price - b.price : f.sort === 'desc' ? (a, b) => b.price - a.price : f.sort === 'new' ? (a, b) => b.date.localeCompare(a.date) || byFeatured(a, b) : byFeatured);
        return list;
      };
      const sync = () => {
        const u = new URLSearchParams(); if (f.q) u.set('q', f.q); f.color.forEach((v) => u.append('color', v)); f.size.forEach((v) => u.append('size', v)); if (f.price) u.set('price', f.price); f.feat.forEach((v) => u.append('feat', v)); if (f.isNew) u.set('new', '1'); if (f.sort !== 'featured') u.set('sort', f.sort);
        const s = u.toString(); history.replaceState(history.state, '', location.pathname + (s ? '?' + s : ''));
      };
      const render = () => {
        const list = filter();
        grid.innerHTML = list.map((p) => card(p)).join('');
        $('[data-empty]', root).hidden = list.length > 0;
        $('[data-count]', root).textContent = `${pad(list.length)} ${list.length === 1 ? 'piece' : 'pieces'}`;
        $('[data-showlbl]', root).textContent = `Show ${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
        const chips = [...f.color.map((v) => ['color', v, v]), ...f.size.map((v) => ['size', v, `Size ${v}`]), ...(f.price ? [['price', f.price, PRICES[f.price][0]]] : []), ...f.feat.map((v) => ['feat', v, FEATURES[v][0]]), ...(f.isNew ? [['new', '1', 'New in']] : []), ...(f.q ? [['q', f.q, `“${f.q}”`]] : [])];
        $('[data-active]', root).innerHTML = chips.length ? chips.map(([k, v, l]) => `<button class="chip" data-rm="${k}|${esc(v)}">${esc(l[0].toUpperCase() + l.slice(1))} <span class="x">${ic('close')}</span></button>`).join('') + '<button class="link mono" data-clear style="border:0;text-decoration:underline;margin-left:6px">Clear all</button>' : '';
        $('[data-fcount]', root).textContent = chips.filter((c) => c[0] !== 'q').length ? `(${chips.filter((c) => c[0] !== 'q').length})` : '';
        $$('[data-f]', drawer).forEach((b) => { const k = b.dataset.f, v = b.dataset.v; b.setAttribute('aria-pressed', String(Array.isArray(f[k]) ? f[k].includes(v) : f[k] === v)); });
        $('#fNew', drawer).checked = f.isNew;
        sync();
      };
      const open = (on) => { drawer.classList.toggle('on', on); drawer.setAttribute('aria-hidden', String(!on)); window.AERIS.scrim(on, () => open(false)); if (on) $('.circ', drawer).focus(); };
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-open-filters]')) return open(true);
        if (e.target.closest('[data-close-filters]')) return open(false);
        const fb = e.target.closest('[data-f]');
        if (fb) { const k = fb.dataset.f, v = fb.dataset.v; if (Array.isArray(f[k])) f[k] = f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]; else f[k] = f[k] === v ? '' : v; return render(); }
        const rm = e.target.closest('[data-rm]');
        if (rm) { const [k, v] = rm.dataset.rm.split('|'); if (k === 'new') f.isNew = false; else if (k === 'q') { f.q = ''; $('#shopSearch', root).value = ''; } else if (Array.isArray(f[k])) f[k] = f[k].filter((x) => x !== v); else f[k] = ''; return render(); }
        if (e.target.closest('[data-clear]')) { Object.assign(f, { q: '', color: [], size: [], price: '', feat: [], isNew: false }); $('#shopSearch', root).value = ''; return render(); }
        const cb = e.target.closest('[data-cols]'); if (cb) { const n = +cb.dataset.cols; setCols(n); try { localStorage.setItem('aeris:cols', n); } catch {} }
      });
      $('#fNew', drawer).addEventListener('change', (e) => { f.isNew = e.target.checked; render(); });
      $('#shopSort', root).addEventListener('change', (e) => { f.sort = e.target.value; render(); });
      let t; $('#shopSearch', root).addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { f.q = e.target.value.trim(); render(); }, 160); });
      render();
      return () => window.AERIS.scrim(false);
    },
  };
}

/* ======================================================================
   PRODUCT
   ====================================================================== */
export function product({ slug }, q) {
  const p = bySlug(slug); if (!p) return notFound();
  const state = { color: p.colors.some((c) => c.key === q.get('color')) ? q.get('color') : p.colors[0].key, size: p.sizes.length === 1 ? p.sizes[0] : null, mode: 'image' };
  const has3d = !!(p.model3d?.glb && window.AERIS.hasGLB);
  const related = PRODUCTS.filter((x) => x.slug !== p.slug && x.category !== p.category).sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4);
  const stories = JOURNAL.filter((j) => j.products.includes(p.slug)).slice(0, 2);
  const c = colorOf(p, state.color);
  return {
    title: `${p.name} — ${p.type} — AERIS°`,
    html: `<div class="wrap">
  <nav class="crumbs mono" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop">Shop</a><span>/</span><a href="/shop/${p.category}">${catName(p.category)}</a><span>/</span><span>${esc(p.name)}</span></nav>
  <section class="pdp">
    <div class="pdp-media">
      <div class="pdp-stage" data-stage style="--bg:${bg(c.img)}">
        <div class="pdp-modes glass" role="group" aria-label="View mode">
          <button data-mode="image" aria-pressed="true">Image</button><button data-mode="model" aria-pressed="false">Model</button><button data-mode="detail" aria-pressed="false">Detail</button><button data-mode="space" aria-pressed="false">${has3d ? '3D · 360°' : 'Float'}</button>
        </div>
        <div data-stage-in style="position:absolute;inset:0"></div>
        <span class="no" aria-hidden="true">${p.no}</span>
      </div>
      <div class="pdp-thumbs" data-thumbs></div>
    </div>
    <aside class="pdp-panel glass" data-buy>
      <div class="pdp-title"><span class="num">${p.no}</span><div><div class="mono dim">${esc(catName(p.category))} · Drop 01</div><h1>${esc(p.name)}</h1><div class="mono mid">${esc(p.type)}</div></div></div>
      <div class="pdp-price"><span class="p">${money(p.price)}</span><span style="display:flex;gap:6px;flex-wrap:wrap">${p.tech.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span></div>
      <p style="margin:0" class="mid">${esc(p.tagline)}</p>
      ${buyControls(p, state)}
      <button class="btn block" data-add id="pdpAdd"><span class="lbl">Add to bag</span><span class="ic">${ic('plus')}</span></button>
      <div class="mono mid" style="display:grid;gap:4px"><span>Free shipping over ${money(SHIP_FREE)} · 30-day returns</span><span>Free repairs for two years</span></div>
      <div>
        ${acc('Description', `<p style="margin:0">${esc(p.description)}</p><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`, true)}
        ${acc('Material & care', `<p style="margin:0">${esc(p.composition)}</p><ul>${p.care.map((d) => `<li>${esc(d)}</li>`).join('')}</ul><p class="mono mid" style="margin:0">${esc(p.origin)}</p>`)}
        ${acc('Fit & dimensions', `<p style="margin:0">${esc(p.fit.note)}${p.fit.model ? ` ${esc(p.fit.model)}` : ''}</p><dl class="kv mono">${p.dimensions.rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><span class="mono dim">Measured on size ${esc(p.dimensions.size)}</span><button class="link" data-sizeguide style="border:0;text-decoration:underline;justify-self:start">Open size guide</button>`)}
        ${acc('Shipping & returns', `<p style="margin:0">Ships from Riga in 1–2 working days. Standard delivery €${BRAND.shipping.standard}, free over ${money(SHIP_FREE)}. Express €${BRAND.shipping.express}.</p><p style="margin:0">Return unworn pieces within 30 days for a full refund. <a href="/help/returns">Returns policy</a></p>`)}
      </div>
    </aside>
  </section>

  <section class="section-tight">
    <div class="sec-head"><div class="left"><div class="eyebrow"><b>${p.no}</b><span class="mono dim">Object data</span></div><h2 class="d d-lg" style="margin:0">${esc(p.name)}, measured</h2></div></div>
    <div class="specs">${p.specs.map(([k, v], i) => `<div class="spec" ${rv}><span class="num">${pad(i + 1)}</span><span class="k">${esc(k)}</span><span class="mono mid">${esc(v)}</span></div>`).join('')}</div>
  </section>

  <section class="section-tight">
    <div class="sec-head"><div class="left"><span class="mono dim">Complete the look</span><h2 class="d d-lg" style="margin:0">Wear it with</h2></div><a class="link" href="/shop">Shop all</a></div>
    <div class="grid">${related.map((r) => card(r)).join('')}</div>
  </section>
  ${stories.length ? `<section class="section-tight"><div class="sec-head"><div class="left"><span class="mono dim">In the journal</span><h2 class="d d-lg" style="margin:0">Read more</h2></div></div><div class="journal-grid">${stories.map(journalCard).join('')}</div></section>` : ''}
</div>
<div class="mobile-buy glass" data-mobilebuy><div class="p"><span class="d" style="font-size:20px">${esc(p.name)}</span><span class="mono">${money(p.price)}</span></div><a class="btn" href="#pdpAdd" data-jump>Choose size<span class="ic">${ic('plus')}</span></a></div>`,
    mount(root) {
      const stage = $('[data-stage]', root), inner = $('[data-stage-in]', root), thumbs = $('[data-thumbs]', root);
      let viewer = null, raf = 0;
      const shots = () => { const col = colorOf(p, state.color); return [
        { mode: 'image', key: col.img, alt: `${p.name} in ${col.name}, product photo` },
        { mode: 'model', key: p.media.model, alt: `${p.name} worn by a model` },
        { mode: 'detail', key: p.media.detail, alt: `${p.name} construction detail` },
        { mode: 'space', key: col.img, cut: true, alt: `${p.name} floating` },
      ]; };
      const paintThumbs = () => { thumbs.innerHTML = shots().map((s) => `<button data-mode="${s.mode}" aria-pressed="${s.mode === state.mode}" aria-label="${s.mode} view" style="background:${bg(s.key)}">${img(s.key, { cut: !!s.cut, alt: '', sizes: '72px' })}</button>`).join(''); };
      const show = (mode) => {
        state.mode = mode; viewer?.dispose(); viewer = null;
        $$('[data-mode]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
        const s = shots().find((x) => x.mode === mode), col = colorOf(p, state.color);
        stage.classList.toggle('env', mode === 'space');
        stage.style.setProperty('--bg', bg(s.key));
        if (mode !== 'space') {
          inner.innerHTML = `${img(s.key, { alt: s.alt, eager: true, sizes: '(max-width:1080px) 100vw, 60vw', attrs: `data-zoom="${s.key}" style="view-transition-name:piece"` })}<button class="circ zoom-hint glass" data-zoombtn aria-label="Zoom image">${ic('zoom')}</button>`;
          return;
        }
        if (has3d) {
          inner.innerHTML = `<canvas style="position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y" aria-label="3D view of the ${esc(p.name)}. Drag to rotate, tap to inspect."></canvas>
            <div class="v3d-ctl glass mono"><span class="pulse"></span><span data-h>Drag · pinch · tap to inspect</span><button class="circ sm" data-v="inspect" aria-pressed="false" aria-label="Inspect mode">${ic('eye')}</button><button class="circ sm" data-v="in" aria-label="Zoom in">${ic('plus')}</button><button class="circ sm" data-v="out" aria-label="Zoom out">${ic('minus')}</button></div>`;
          import('/js/viewer3d.js').then(({ createViewer }) => {
            if (state.mode !== 'space') return;
            viewer = createViewer({ canvas: $('canvas', inner), host: inner, glb: p.model3d.glb, hotspots: p.model3d.hotspots, onError: () => { show('image'); toast('The 3D view could not load. Showing photos instead.'); } });
            viewer.setTint(state.color === 'graphite' ? '#545257' : null);
            inner.addEventListener('inspect', (e) => { $('[data-v="inspect"]', inner)?.setAttribute('aria-pressed', String(e.detail)); const h = $('[data-h]', inner); if (h) h.textContent = e.detail ? 'Select a marker' : 'Drag · pinch · tap to inspect'; });
          });
          inner.onclick = (e) => { const v = e.target.closest('[data-v]')?.dataset.v; if (!v || !viewer) return; if (v === 'in') viewer.zoomBy(1.2); if (v === 'out') viewer.zoomBy(1 / 1.2); if (v === 'inspect') viewer.setInspect($('[data-v="inspect"]', inner).getAttribute('aria-pressed') !== 'true'); };
        } else {
          inner.innerHTML = `<span class="orb"></span><span class="bubble" style="width:70px;height:70px;left:12%;top:22%"></span><span class="bubble" style="width:34px;height:34px;right:16%;top:16%;animation-duration:24s"></span><span class="bubble" style="width:52px;height:52px;right:12%;bottom:22%;animation-duration:30s"></span>
            ${img(col.img, { cut: true, alt: s.alt, sizes: '(max-width:1080px) 100vw, 60vw', attrs: 'class="cut" data-tilt style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:6% 10%;filter:drop-shadow(0 34px 30px rgba(40,30,25,.24));transition:transform .6s var(--ease)"' })}
            <span class="v3d-ctl glass mono" style="padding-right:14px"><span class="pulse"></span><span data-h>Move to tilt</span></span>`;
          const tilt = $('[data-tilt]', inner);
          stage.onpointermove = (e) => { if (state.mode !== 'space' || RM) return; const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { tilt.style.transform = `perspective(1200px) rotateY(${x * 16}deg) rotateX(${-y * 10}deg) translate3d(${x * 14}px,${y * 10}px,0)`; }); };
          stage.onpointerleave = () => { tilt.style.transform = ''; };
        }
      };
      root.addEventListener('click', (e) => {
        const m = e.target.closest('[data-mode]'); if (m) return show(m.dataset.mode);
        const z = e.target.closest('[data-zoom]') || (e.target.closest('[data-zoombtn]') && $('[data-zoom]', inner)); if (z) return window.AERIS.lightbox(src(z.dataset.zoom), z.alt);
        const j = e.target.closest('[data-jump]'); if (j) { e.preventDefault(); $('[data-buy]', root).scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); }
        const ac = e.target.closest('.acc > button'); if (ac) ac.setAttribute('aria-expanded', String(ac.getAttribute('aria-expanded') !== 'true'));
      });
      mountBuy($('[data-buy]', root), p, state, { onColor: (k) => { paintThumbs(); if (state.mode === 'space' && viewer) viewer.setTint(k === 'graphite' ? '#545257' : null); else show(state.mode); const u = new URL(location.href); u.searchParams.set('color', k); history.replaceState(history.state, '', u.pathname + u.search); } });
      paintThumbs(); show('image');
      // mobile sticky buy
      const mb = $('[data-mobilebuy]', root);
      const io = new IntersectionObserver(([en]) => mb.classList.toggle('on', !en.isIntersecting && en.boundingClientRect.top < 0), { threshold: 0 });
      io.observe($('#pdpAdd', root));
      return () => { viewer?.dispose(); io.disconnect(); };
    },
  };
}
function acc(title, body, open = false) {
  return `<div class="acc"><button aria-expanded="${open}"><span class="d" style="font-size:20px">${title}</span><span class="mono">+</span></button><div class="body"><div><div class="inner">${body}</div></div></div></div>`;
}

/* ======================================================================
   COLLECTION
   ====================================================================== */
export function collection({ key = 'afterlight' }) {
  const c = COLLECTIONS.find((x) => x.key === key); if (!c) return notFound();
  const list = PRODUCTS.filter((p) => p.collection === c.key).sort((a, b) => a.no.localeCompare(b.no));
  const spans = ['1/6', '6/9', '9/13', '1/4', '4/8', '8/13', '1/5', '5/9', '9/13', '1/7', '7/10', '10/13'];
  return {
    title: `Drop ${c.no} — ${c.name} — AERIS°`,
    html: `<div class="wrap">
  <section class="drop-hero">
    ${img(c.wide, { alt: 'Afterlight campaign at blue hour', eager: true, sizes: '100vw' })}
    <div class="in">
      <span class="mono">Drop ${c.no} — ${c.season} · ${c.pieces} pieces</span>
      <h1 class="d d-mega" style="margin:0">${c.name}</h1>
      <div class="row"><p class="lede" style="margin:0;color:rgba(251,246,240,.92)">${esc(c.lede)}</p>
        <div class="drop-cta glass"><span class="mono">Released 12.03.2027</span><a class="btn" href="/shop">Shop the drop<span class="ic">${ic('ne')}</span></a></div></div>
    </div>
  </section>
  <section class="section-tight"><div class="split">
    <div style="grid-column:1/5" class="mono dim">01 · The drop</div>
    <div class="prose" style="grid-column:5/13">${c.body.map((b) => `<p class="lede" style="max-width:60ch">${esc(b)}</p>`).join('')}</div>
  </div></section>
</div>
<section class="section-tight">
  <div class="wrap sec-head"><div class="left"><div class="eyebrow"><b>02</b><span class="mono dim">The sequence</span></div><h2 class="d d-lg" style="margin:0">Twelve pieces, in order</h2></div>${railCtrl()}</div>
  ${rail(list)}
</section>
<div class="wrap">
  <section class="section-tight">
    <div class="sec-head"><div class="left"><div class="eyebrow"><b>03</b><span class="mono dim">Lookbook</span></div><h2 class="d d-lg" style="margin:0">On the salt flat</h2></div></div>
    <div class="lookbook">${list.map((p, i) => `<a href="/product/${p.slug}" style="grid-column:${spans[i]}" ${rv}><div class="frame-img">${img(p.media.model, { alt: `${p.name} on the salt flat`, sizes: '(max-width:760px) 50vw, 33vw' })}<span class="lab glass mono">${p.no} · ${esc(p.name)}</span></div><div style="display:flex;justify-content:space-between" class="mono"><span>${esc(p.type)}</span><span>${money(p.price)}</span></div></a>`).join('')}</div>
  </section>
  <section class="section-tight">
    <div class="sec-head"><div class="left"><div class="eyebrow"><b>04</b><span class="mono dim">Shop the drop</span></div><h2 class="d d-lg" style="margin:0">All pieces</h2></div></div>
    <div class="grid">${list.map((p) => card(p)).join('')}</div>
  </section>
</div>`,
    mount(root) { return mountRail(root); },
  };
}

/* ======================================================================
   JOURNAL
   ====================================================================== */
export function journal() {
  return {
    title: 'Journal — AERIS°',
    html: `<div class="wrap"><div class="page-head"><div><span class="mono dim">Journal</span><h1 class="d d-xl" style="margin:0">Notes from the studio</h1></div><p class="mid" style="max-width:36ch;margin:0">Materials, campaigns and the design decisions behind each piece.</p></div>
    <div style="display:grid;gap:0">${JOURNAL.map((j, i) => `<a class="jrow" href="/journal/${j.slug}" ${rv}>
      <span class="num" style="font-size:clamp(48px,6vw,90px)">${j.no}</span>
      <div style="display:grid;gap:10px;min-width:0"><span class="mono dim">${esc(j.kicker)} · ${new Date(j.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · ${esc(j.read)}</span><span class="d d-lg">${esc(j.title)}</span><p class="mid" style="margin:0;max-width:56ch">${esc(j.lede)}</p></div>
      <div class="frame-img">${img(j.img, { alt: j.title, sizes: '(max-width:760px) 100vw, 300px' })}</div></a>`).join('')}</div></div>`,
  };
}
export function article({ slug }) {
  const j = JOURNAL.find((x) => x.slug === slug); if (!j) return notFound();
  const prods = j.products.map(bySlug).filter(Boolean);
  const next = JOURNAL[(JOURNAL.indexOf(j) + 1) % JOURNAL.length];
  return {
    title: `${j.title} — Journal — AERIS°`,
    html: `<div class="wrap"><nav class="crumbs mono"><a href="/journal">Journal</a><span>/</span><span>${esc(j.kicker)}</span></nav>
    <header style="display:grid;gap:14px;margin-bottom:clamp(24px,4vw,56px)"><span class="mono dim">${j.no} · ${esc(j.kicker)} · ${esc(j.read)}</span><h1 class="d d-xl" style="margin:0">${esc(j.title)}</h1><p class="lede mid" style="margin:0">${esc(j.lede)}</p></header>
    <article class="article"><div class="frame-img">${img(j.img, { alt: j.title, eager: true, sizes: '(max-width:900px) 100vw, 40vw' })}</div>
      <div class="body prose">${j.body.map((b) => `<p>${esc(b)}</p>`).join('')}
        <div style="margin-top:36px"><span class="mono dim">Pieces in this story</span><div class="grid g3" style="margin-top:14px">${prods.map((p) => card(p, { quick: false })).join('')}</div></div>
      </div></article>
    <a href="/journal/${next.slug}" class="glass" style="display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:clamp(36px,5vw,72px);padding:22px 26px;border-radius:var(--r-xl);text-decoration:none"><div><span class="mono dim">Next story · ${next.no}</span><div class="d d-lg">${esc(next.title)}</div></div><span class="circ dark">${ic('right')}</span></a></div>`,
  };
}

/* ======================================================================
   ABOUT
   ====================================================================== */
export function about() {
  const ch = (n, k, html) => `<section class="chapter" ${rv}><div class="k"><span class="num">${n}</span><span class="d d-md">${k}</span></div><div class="prose">${html}</div></section>`;
  return {
    title: 'About — AERIS°',
    html: `<div class="wrap">
  <section class="about-hero">
    <div style="grid-column:1/-1;display:grid;gap:16px"><span class="mono dim">About AERIS · Riga, since 2021</span><h1 class="d d-xl" style="margin:0;max-width:14ch">A studio for clothing that lasts</h1></div>
    <div class="frame-img" style="grid-column:1/9;aspect-ratio:16/10">${img('220', { alt: 'The AERIS design studio in a Riga warehouse loft', eager: true, sizes: '(max-width:760px) 100vw, 66vw' })}<span class="lab glass mono">Studio · Miera iela, Riga</span></div>
    <div style="grid-column:9/13;display:grid;gap:14px;padding-bottom:6px"><p class="lede" style="margin:0">AERIS is a small team of designers, pattern cutters and textile engineers in Riga. We make technical clothing for everyday life in cities with real weather.</p><p class="mid" style="margin:0">We release two drops a year, keep the core pieces in production for as long as people wear them, and repair everything we sell.</p></div>
  </section>
  ${ch('01', 'Who we are', `<p>We started in 2021 with one shell jacket and a repair desk. Today there are fourteen of us: four designers, three pattern cutters, a textile engineer, and the people who pack, ship and fix what we make.</p><p>Everything is designed in Riga and sampled within a day's drive of the studio or at mills we visit every season.</p>`)}
  ${ch('02', 'Philosophy', `<p>Fewer pieces, made better, worn longer. A garment is only sustainable if it gets worn — so we design for daily use first and for the photograph second.</p><p>The palette stays narrow on purpose. Stone, sand, bone and graphite return every drop, so new pieces work with the ones you already own.</p>`)}
  ${ch('03', 'Design approach', `<p>Every pattern is fitted on a person in motion — walking, cycling, reaching for a rail on the tram. We change the pattern until it moves the way the body does, then we take things away until only what is needed remains.</p><p>Technical features are there because they work: taped seams, articulated knees, a longer back hem. If a detail does not earn its place in a week of wear, it goes.</p>`)}
  ${ch('04', 'Materials', `<p>We choose fabrics we can measure, and we publish the numbers on every product page.</p><div class="figures">${[['92', '%', 'recycled or natural fibre across Drop 01'], ['0', '', 'PFAS in any finish we use'], ['6', '', 'partner mills and factories in Europe'], ['2', 'yrs', 'free repairs on every piece']].map(([n, u, t]) => `<div class="f glass"><span><span class="num">${n}</span><span class="mono"> ${u}</span></span><span class="mono mid">${t}</span></div>`).join('')}</div>`)}
  ${ch('05', 'Production', `<p>We work with six partners, all in Europe, all visited at least twice a year. Each one specialises in what it makes for us.</p><div class="partners">${[['Vilnius, LT', 'Outerwear and liners'], ['Biella, IT', 'Wool, merino and knitwear'], ['Porto, PT', 'Jersey and loopback'], ['Łódź, PL', 'Shirts and trousers'], ['Kaunas, LT', 'Bags and small goods'], ['Felgueiras, PT', 'Footwear']].map(([c, t]) => `<div class="p glass"><span class="d d-sm">${c}</span><span class="mono mid">${t}</span></div>`).join('')}</div><div class="frame-img" style="aspect-ratio:16/10;margin-top:16px">${img('221', { alt: 'A seamstress sewing graphite technical fabric', sizes: '(max-width:900px) 100vw, 60vw' })}</div>`)}
  ${ch('06', 'What comes next', `<p>By 2030 every AERIS garment will carry a digital passport with its full supply chain, from fibre to finished piece. Our take-back programme already resells wearable pieces and recycles the rest.</p><p>We will keep the collection small. Growth, for us, means more people wearing the same pieces for longer.</p><a class="btn" href="/stores" style="margin-top:8px">Visit the studio<span class="ic">${ic('ne')}</span></a>`)}
</div>`,
  };
}

/* ======================================================================
   STORES
   ====================================================================== */
export function stores() {
  return {
    title: 'Stores & contact — AERIS°',
    html: `<div class="wrap">
  <div class="page-head"><div><span class="mono dim">Stores & contact</span><h1 class="d d-xl" style="margin:0">Come and try it on</h1></div><p class="mid" style="max-width:38ch;margin:0">Two stores, one repair desk, and a team that answers emails within a working day.</p></div>
  <div class="stores">${STORES.map((s) => `<div class="store" ${rv}><div class="frame-img">${img(s.img, { alt: `AERIS ${s.city} store interior`, sizes: '(max-width:900px) 100vw, 50vw' })}<span class="lab glass mono">${s.label} · ${s.city}</span></div>
    <div class="info glass"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><span class="d d-lg">${s.city}</span><span class="mono dim">${s.label}</span></div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px">
        <div><span class="mono dim">Address</span><p style="margin:6px 0 0">${s.address.join('<br>')}</p></div>
        <div><span class="mono dim">Hours</span><dl class="kv" style="margin-top:6px">${s.hours.map(([d, h]) => `<dt>${d}</dt><dd>${h}</dd>`).join('')}</dl></div>
        <div><span class="mono dim">Phone</span><p style="margin:6px 0 0" class="copyable">${s.phone}</p></div>
        <div><span class="mono dim">Email</span><p style="margin:6px 0 0;display:flex;gap:8px;align-items:center"><span class="copyable">${s.email}</span><button class="circ sm" data-copy="${s.email}" aria-label="Copy email address">${ic('copy')}</button></p></div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${s.services.map((x) => `<span class="tag">${x}</span>`).join('')}</div></div></div>`).join('')}</div>

  <section class="section-tight split" style="align-items:start">
    <div style="grid-column:1/6;display:grid;gap:14px"><span class="mono dim">Customer care</span><h2 class="d d-lg" style="margin:0">Write to us</h2><p class="mid" style="margin:0">Questions about an order, sizing or a repair. We reply within one working day, Monday to Friday.</p>
      <p style="margin:0"><span class="mono dim">Email</span><br><span class="copyable">${BRAND.care}</span></p><p style="margin:0"><span class="mono dim">Phone</span><br><span class="copyable">${BRAND.phone}</span> · Mon–Fri 10–18 EET</p></div>
    <form class="co-card glass" style="grid-column:6/13" data-contact novalidate>
      <div class="fgrid">
        <div class="field"><label for="cName">Name</label><input class="input" id="cName" name="name" required autocomplete="name"></div>
        <div class="field"><label for="cEmail">Email</label><input class="input" id="cEmail" name="email" type="email" required autocomplete="email"></div>
        <div class="field"><label for="cTopic">Topic</label><select class="input select" id="cTopic" name="topic"><option>Order</option><option>Sizing</option><option>Repair</option><option>Returns</option><option>Something else</option></select></div>
        <div class="field"><label for="cOrder">Order number (optional)</label><input class="input" id="cOrder" name="order" placeholder="AER-…"></div>
        <div class="field full"><label for="cMsg">Message</label><textarea class="input" id="cMsg" name="message" required></textarea></div>
      </div>
      <p class="err" data-err hidden>Add your name, a valid email and a message.</p>
      <button class="btn" type="submit" style="justify-self:start">Send message<span class="ic">${ic('right')}</span></button>
    </form>
  </section>
  <section class="section-tight"><div class="sec-head"><div class="left"><span class="mono dim">Help</span><h2 class="d d-lg" style="margin:0">Before you write</h2></div></div>
    <div style="max-width:880px">${['shipping', 'returns', 'care', 'sizing'].map((k) => acc(INFO[k].title, INFO[k].sections.map(([h, t]) => `<p style="margin:0"><strong>${h}.</strong> ${t}</p>`).join('') + `<a class="link" href="/help/${k}" style="justify-self:start">Full ${INFO[k].title.toLowerCase()} page</a>`)).join('')}</div></section>
</div>`,
    mount(root) {
      root.addEventListener('click', (e) => {
        const c = e.target.closest('[data-copy]'); if (c) { navigator.clipboard?.writeText(c.dataset.copy).then(() => toast('Email address copied'), () => toast(c.dataset.copy)); }
        const ac = e.target.closest('.acc > button'); if (ac) ac.setAttribute('aria-expanded', String(ac.getAttribute('aria-expanded') !== 'true'));
      });
      const f = $('[data-contact]', root);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const ok = f.name.value.trim() && /\S+@\S+\.\S+/.test(f.email.value) && f.message.value.trim();
        [f.name, f.email, f.message].forEach((x) => x.setAttribute('aria-invalid', String(!x.value.trim() || (x.type === 'email' && !/\S+@\S+\.\S+/.test(x.value)))));
        $('[data-err]', f).hidden = !!ok; if (!ok) return;
        f.innerHTML = `<div style="display:grid;gap:12px"><span class="circ dark">${ic('check')}</span><span class="d d-md">Message received</span><p class="mid" style="margin:0">Thanks, ${esc(f.name?.value || '')}. We'll reply to you within one working day.</p></div>`;
      });
    },
  };
}

/* ======================================================================
   INFO (help + legal)
   ====================================================================== */
export function info({ key }) {
  const d = INFO[key]; if (!d) return notFound();
  return {
    title: `${d.title} — AERIS°`,
    html: `<div class="wrap" style="max-width:980px"><nav class="crumbs mono"><a href="/">Home</a><span>/</span><a href="/stores">Help</a><span>/</span><span>${d.title}</span></nav>
    <h1 class="d d-xl" style="margin:0 0 clamp(20px,3vw,40px)">${d.title}</h1>
    ${d.sections.map(([h, t], i) => `<section class="chapter" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)"><div class="k"><span class="num" style="font-size:44px">${pad(i + 1)}</span><span class="d d-sm">${h}</span></div><div class="prose"><p>${t}</p></div></section>`).join('')}
    ${d.table ? `<div class="tbl-wrap glass" style="border-radius:var(--r-lg);padding:8px 16px"><table class="tbl"><thead><tr>${d.table.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${d.table.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}</div>`,
  };
}

/* ======================================================================
   BAG + CHECKOUT
   ====================================================================== */
export function lineItems(items, { compact = false } = {}) {
  if (!items.length) return `<div class="empty" style="padding:30px 10px"><span class="d d-md">Your bag is empty</span><p class="mid" style="margin:0">Start with the drop — twelve pieces, made to layer.</p><a class="btn" href="/collection/afterlight">Explore Afterlight<span class="ic">${ic('ne')}</span></a></div>`;
  return items.map((it, i) => { const p = it.product, c = colorOf(p, it.color); return `<div class="line">
    <a class="m" href="/product/${p.slug}?color=${c.key}" style="--bg:${bg(c.img)}">${img(c.img, { alt: '', sizes: '84px' })}</a>
    <div style="min-width:0"><a href="/product/${p.slug}?color=${c.key}" class="nm" style="text-decoration:none">${esc(p.name)}</a><div class="mono mid" style="margin-top:4px">${c.name} · ${esc(it.size)}</div>
      ${compact ? `<div class="mono dim" style="margin-top:4px">Qty ${it.qty}</div>` : `<div style="display:flex;align-items:center;flex-wrap:wrap"><div class="qty"><button data-q="${i}|-1" aria-label="Decrease quantity">−</button><span>${it.qty}</span><button data-q="${i}|1" aria-label="Increase quantity">+</button></div><button class="rm" data-rmline="${i}">Remove</button></div>`}</div>
    <span class="mono">${money(p.price * it.qty)}</span></div>`; }).join('');
}
export function bindLines(root) {
  root.addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]'); if (q) { const [i, d] = q.dataset.q.split('|').map(Number); const it = bag.items()[i]; if (it) { const before = it.qty; bag.setQty(i, it.qty + d); if (d > 0 && bag.items()[i]?.qty === before) toast('No more stock in this size'); } }
    const r = e.target.closest('[data-rmline]'); if (r) bag.remove(+r.dataset.rmline);
  });
}
export function summary(t, { discount } = {}) {
  const remaining = Math.max(0, SHIP_FREE - (t.sub - t.disc));
  return `<div class="totals">
    <div class="ship-meter"><span class="mono">${remaining > 0 ? `${money(remaining)} away from free shipping` : 'Free standard shipping unlocked'}</span><div class="bar"><i style="width:${clamp((t.sub - t.disc) / SHIP_FREE * 100, 0, 100)}%"></i></div></div>
    <div class="row"><span class="mid">Subtotal</span><span class="mono">${money(t.sub)}</span></div>
    ${t.disc ? `<div class="row"><span class="mid">Discount${discount ? ` · ${discount}` : ''}</span><span class="mono">−${money(t.disc)}</span></div>` : ''}
    <div class="row"><span class="mid">Shipping</span><span class="mono">${t.ship ? money(t.ship) : 'Free'}</span></div>
    <div class="row grand"><span class="mono">Total · incl. VAT ${money(t.vat)}</span><span class="d">${money(t.total)}</span></div></div>`;
}

export function bagPage() {
  return {
    title: 'Bag — AERIS°',
    html: `<div class="wrap"><div class="page-head"><div><span class="mono dim">Your bag</span><h1 class="d d-xl" style="margin:0">Bag</h1></div></div>
      <div class="co"><div data-lines></div><aside class="co-card glass" style="position:sticky;top:calc(var(--nav-h) + 30px)"><span class="d d-md">Summary</span><div data-sum></div><a class="btn block" href="/checkout" data-go><span>Checkout</span><span class="ic">${ic('right')}</span></a><p class="mono dim" style="margin:0">Secure checkout · 30-day returns · free repairs for two years</p></aside></div></div>`,
    mount(root) {
      const paint = () => { const items = bag.items(); $('[data-lines]', root).innerHTML = lineItems(items); $('[data-sum]', root).innerHTML = summary(totals()); $('[data-go]', root).toggleAttribute('hidden', !items.length); };
      bindLines(root); paint(); return bag.on(paint);
    },
  };
}

export function checkout() {
  if (!bag.count()) return { title: 'Checkout — AERIS°', html: `<div class="wrap" style="max-width:760px">${lineItems([])}</div>` };
  let saved = {}; try { saved = JSON.parse(sessionStorage.getItem('aeris:co') || '{}'); } catch {}
  const st = { step: 1, ship: saved.ship || 'standard', discount: null, data: saved };
  const COUNTRIES = ['Latvia', 'Lithuania', 'Estonia', 'Finland', 'Sweden', 'Germany', 'France', 'Netherlands', 'Denmark', 'Poland', 'Italy', 'Spain', 'United Kingdom', 'Norway', 'Switzerland', 'United States'];
  const field = (id, label, opts = '') => `<div class="field ${opts.includes('full') ? 'full' : ''}"><label for="co_${id}">${label}</label><input class="input" id="co_${id}" name="${id}" value="${esc(saved[id] || '')}" ${opts.replace('full', '')}></div>`;
  return {
    title: 'Checkout — AERIS°',
    html: `<div class="wrap"><div class="page-head"><div><span class="mono dim">Secure checkout</span><h1 class="d d-xl" style="margin:0">Checkout</h1></div><a class="link" href="/bag">Back to bag</a></div>
    <div class="co">
      <div>
        <div class="co-steps" data-steps><span data-s="1">01 Information</span><span data-s="2">02 Delivery</span><span data-s="3">03 Payment</span></div>
        <form class="co-card glass" data-step="1" novalidate>
          <span class="d d-md">Contact</span>
          <div class="fgrid">${field('email', 'Email', 'type="email" autocomplete="email" required full')}
            <label class="check full"><input type="checkbox" name="news" ${saved.news ? 'checked' : ''}> Email me about new drops and journal stories</label></div>
          <span class="d d-md">Shipping address</span>
          <div class="fgrid">${field('first', 'First name', 'autocomplete="given-name" required')}${field('last', 'Last name', 'autocomplete="family-name" required')}
            ${field('address', 'Address', 'autocomplete="address-line1" required full')}${field('apt', 'Apartment, floor (optional)', 'autocomplete="address-line2" full')}
            ${field('city', 'City', 'autocomplete="address-level2" required')}${field('zip', 'Postal code', 'autocomplete="postal-code" required')}
            <div class="field"><label for="co_country">Country</label><select class="input select" id="co_country" name="country" autocomplete="country-name">${COUNTRIES.map((c) => `<option ${saved.country === c || (!saved.country && c === 'Latvia') ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
            ${field('phone', 'Phone (for the courier)', 'type="tel" autocomplete="tel" required')}</div>
          <p class="err" data-err hidden>Fill in the highlighted fields.</p>
          <button class="btn" type="submit" style="justify-self:start">Continue to delivery<span class="ic">${ic('right')}</span></button>
        </form>
        <form class="co-card glass" data-step="2" hidden>
          <span class="d d-md">Delivery</span>
          <div style="display:grid;gap:8px" data-shipopts></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="submit">Continue to payment<span class="ic">${ic('right')}</span></button><button class="btn-line" type="button" data-back="1">Back</button></div>
        </form>
        <form class="co-card glass" data-step="3" hidden>
          <span class="d d-md">Payment</span>
          <div class="note"><strong>Test mode.</strong> No payment provider is connected yet, so no card is charged. Placing the order runs the full flow and shows the confirmation. To go live, connect Stripe or Shopify in <span class="mono">js/commerce.js</span>.</div>
          <label class="radio-card"><input type="radio" name="pay" value="card" checked><span class="grow"><strong>Card</strong><br><span class="mid" style="font-size:13px">Visa, Mastercard, Amex — handled by the payment provider</span></span></label>
          <label class="radio-card"><input type="radio" name="pay" value="wallet"><span class="grow"><strong>Apple Pay / Google Pay</strong><br><span class="mid" style="font-size:13px">Shown when your device supports it</span></span></label>
          <label class="check"><input type="checkbox" name="terms" required> I accept the <a href="/legal/terms">terms</a> and <a href="/legal/privacy">privacy policy</a></label>
          <p class="err" data-err hidden>Accept the terms to place your order.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="submit" data-place><span>Place order</span><span class="ic">${ic('check')}</span></button><button class="btn-line" type="button" data-back="2">Back</button></div>
        </form>
      </div>
      <aside class="co-card glass" style="position:sticky;top:calc(var(--nav-h) + 30px)">
        <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="d d-md">Order</span><span class="mono dim" data-n></span></div>
        <div data-lines style="max-height:42vh;overflow:auto"></div>
        <form data-disc style="display:flex;gap:6px"><label class="sr" for="disc">Discount code</label><input class="input" id="disc" placeholder="Discount code" style="height:44px"><button class="btn-line" type="submit">Apply</button></form>
        <p class="mono dim" style="margin:-8px 0 0">Try AFTERLIGHT10 in this preview</p>
        <div data-sum></div>
      </aside>
    </div></div>`,
    mount(root) {
      const forms = $$('form[data-step]', root);
      const save = () => { try { sessionStorage.setItem('aeris:co', JSON.stringify({ ...st.data, ship: st.ship })); } catch {} };
      const paintSide = () => { $('[data-lines]', root).innerHTML = lineItems(bag.items(), { compact: true }); $('[data-sum]', root).innerHTML = summary(totals({ shipping: st.ship, discount: st.discount?.rate || 0 }), { discount: st.discount?.code }); $('[data-n]', root).textContent = `${bag.count()} ${bag.count() === 1 ? 'item' : 'items'}`; };
      const paintShip = () => { const t = totals({ discount: st.discount?.rate || 0 }); $('[data-shipopts]', root).innerHTML = [['standard', 'Standard', '2–4 working days', t.free ? 'Free' : money(BRAND.shipping.standard)], ['express', 'Express', '1–2 working days', money(BRAND.shipping.express)], ['store', 'Collect in Riga', 'Tērbatas iela 32 · ready next day', 'Free']].map(([k, l, d, pr]) => `<label class="radio-card"><input type="radio" name="ship" value="${k}" ${st.ship === k ? 'checked' : ''}><span class="grow"><strong>${l}</strong><br><span class="mid" style="font-size:13px">${d}</span></span><span class="mono">${pr}</span></label>`).join(''); };
      const go = (n) => { st.step = n; forms.forEach((f) => (f.hidden = +f.dataset.step !== n)); $$('[data-s]', root).forEach((s) => { s.className = +s.dataset.s === n ? 'on' : +s.dataset.s < n ? 'done' : ''; }); if (n === 2) paintShip(); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); };
      forms[0].addEventListener('submit', (e) => {
        e.preventDefault(); const f = e.target; let ok = true;
        $$('input[required]', f).forEach((i) => { const bad = !i.value.trim() || (i.type === 'email' && !/\S+@\S+\.\S+/.test(i.value)); i.setAttribute('aria-invalid', String(bad)); if (bad) ok = false; });
        $('[data-err]', f).hidden = ok; if (!ok) return $('[aria-invalid="true"]', f)?.focus();
        st.data = Object.fromEntries(new FormData(f)); st.data.news = !!f.news.checked; save(); go(2);
      });
      forms[1].addEventListener('change', (e) => { if (e.target.name === 'ship') { st.ship = e.target.value === 'store' ? 'store' : e.target.value; save(); paintSide(); } });
      forms[1].addEventListener('submit', (e) => { e.preventDefault(); go(3); });
      forms[2].addEventListener('submit', async (e) => {
        e.preventDefault(); const f = e.target;
        if (!f.terms.checked) { $('[data-err]', f).hidden = false; return; }
        const b = $('[data-place]', f); b.disabled = true; $('span', b).textContent = 'Placing order…';
        const t = totals({ shipping: st.ship, discount: st.discount?.rate || 0 });
        const order = await createOrder({ customer: st.data, shipping: st.ship, payment: f.pay.value, items: bag.items().map(({ slug, color, size, qty, product: p }) => ({ slug, name: p.name, color, size, qty, price: p.price })), totals: t, discount: st.discount?.code || null });
        bag.clear(); try { sessionStorage.removeItem('aeris:co'); } catch {}
        window.AERIS.navigate('/checkout/confirmation');
        void order;
      });
      $$('[data-back]', root).forEach((b) => b.addEventListener('click', () => go(+b.dataset.back)));
      $('[data-disc]', root).addEventListener('submit', (e) => { e.preventDefault(); const d = checkDiscount($('#disc', root).value); if (d) { st.discount = d; toast(`${d.code} applied — ${d.rate * 100}% off`); } else toast('That code is not valid'); paintSide(); });
      paintSide(); go(1);
      return bag.on(paintSide);
    },
  };
}
export function confirmation() {
  const o = lastOrder();
  if (!o) return { title: 'Order — AERIS°', html: `<div class="wrap" style="max-width:760px"><div class="empty glass"><span class="d d-md">No recent order</span><a class="btn" href="/shop">Go to the shop<span class="ic">${ic('ne')}</span></a></div></div>` };
  return {
    title: `Order ${o.id} — AERIS°`,
    html: `<div class="wrap" style="max-width:980px"><div class="co-card glass" style="gap:22px">
      <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-end"><div><span class="mono dim">Order confirmed · test mode</span><h1 class="d d-xl" style="margin:6px 0 0">Thank you${o.customer?.first ? `, ${esc(o.customer.first)}` : ''}</h1></div><div style="text-align:right"><span class="mono dim">Order number</span><div class="d d-lg">${o.id}</div></div></div>
      <p class="mid" style="margin:0">A confirmation would now go to <strong>${esc(o.customer?.email || '')}</strong>. ${o.shipping === 'store' ? 'Your order will be ready to collect at Tērbatas iela 32 tomorrow.' : `It ships from Riga within one working day by ${o.shipping} delivery.`}</p>
      <div>${o.items.map((it) => { const p = bySlug(it.slug), c = colorOf(p, it.color); return `<div class="line"><a class="m" href="/product/${p.slug}" style="--bg:${bg(c.img)}">${img(c.img, { alt: '', sizes: '84px' })}</a><div><span class="nm">${esc(p.name)}</span><div class="mono mid" style="margin-top:4px">${c.name} · ${esc(it.size)} · Qty ${it.qty}</div></div><span class="mono">${money(it.price * it.qty)}</span></div>`; }).join('')}</div>
      <div class="totals"><div class="row"><span class="mid">Subtotal</span><span class="mono">${money(o.totals.sub)}</span></div>${o.totals.disc ? `<div class="row"><span class="mid">Discount</span><span class="mono">−${money(o.totals.disc)}</span></div>` : ''}<div class="row"><span class="mid">Shipping</span><span class="mono">${o.totals.ship ? money(o.totals.ship) : 'Free'}</span></div><div class="row grand"><span class="mono">Total</span><span class="d">${money(o.totals.total)}</span></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="/shop">Keep shopping<span class="ic">${ic('ne')}</span></a><a class="btn-line" href="/journal">Read the journal</a></div></div></div>`,
  };
}

export function notFound() {
  return { title: 'Not found — AERIS°', status: 404, html: `<div class="wrap" style="max-width:900px;min-height:50vh;display:grid;align-content:center;gap:18px"><span class="num" style="font-size:clamp(120px,20vw,280px)">404</span><h1 class="d d-lg" style="margin:0">This page has moved or never existed</h1><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="/shop">Go to the shop<span class="ic">${ic('ne')}</span></a><a class="btn-line" href="/">Home</a></div></div>` };
}

import { ASSETS } from '/assets.js';
import { PRODUCTS, CATEGORIES, BRAND } from '/data/catalog.js';

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const pad = (n, l = 2) => String(n).padStart(l, '0');
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const money = (n) => `€${Number(n).toLocaleString('en-IE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- assets ---------- */
export function src(key, variant = '') {
  const a = ASSETS[key];
  if (!a) return '';
  if (variant.startsWith('cut') && !a.cut) variant = variant.replace('cut', '').replace(/^-/, '');
  if (a.remote) return variant.startsWith('cut') && a.cutRemote ? a.cutRemote : a.remote;
  return `/img/${key}${variant ? '-' + variant : ''}.webp`;
}
export const bg = (key) => ASSETS[key]?.bg || '#dcd7d0';
export function img(key, { alt = '', cls = '', sizes = '(max-width:760px) 100vw, 50vw', cut = false, eager = false, attrs = '' } = {}) {
  const a = ASSETS[key] || {};
  const base = cut && a.cut ? 'cut' : '';
  const full = src(key, base);
  const sm = a.remote ? '' : src(key, base ? base + '-sm' : 'sm');
  const set = sm ? ` srcset="${sm} 640w, ${full} ${a.w || 1200}w" sizes="${sizes}"` : '';
  const wh = a.w ? ` width="${a.w}" height="${a.h}"` : '';
  return `<img class="${cls}" src="${full}"${set}${wh} alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" ${attrs}>`;
}

/* ---------- icons ---------- */
const P = {
  ne: '<path d="M7 17 17 7M9 7h8v8"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.8"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  rotate: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
  reset: '<circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  grid2: '<rect x="4" y="4" width="7" height="16" rx="2"/><rect x="13" y="4" width="7" height="16" rx="2"/>',
  grid3: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="9.5" y="4" width="5" height="16" rx="1.5"/><rect x="16" y="4" width="5" height="16" rx="1.5"/>',
  grid4: '<rect x="3" y="4" width="3.6" height="16" rx="1"/><rect x="7.8" y="4" width="3.6" height="16" rx="1"/><rect x="12.6" y="4" width="3.6" height="16" rx="1"/><rect x="17.4" y="4" width="3.6" height="16" rx="1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  zoom: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8v6M8 11h6"/>',
};
export const ic = (name, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ''}</svg>`;

/* ---------- catalog helpers ---------- */
export const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const catName = (key) => CATEGORIES.find((c) => c.key === key)?.name || key;
export const colorOf = (p, key) => p.colors.find((c) => c.key === key) || p.colors[0];
export const stockOf = (p, colorKey, size) => p.stock?.[colorKey]?.[size] ?? 0;
export const totalStock = (p, colorKey) => Object.values(p.stock?.[colorKey] || {}).reduce((a, b) => a + b, 0);
export function availability(p, colorKey, size) {
  if (size) {
    const n = stockOf(p, colorKey, size);
    if (n === 0) return { cls: 'out', text: `${size} is sold out in ${colorOf(p, colorKey).name}` };
    if (n <= 2) return { cls: 'low', text: `Only ${n} left in ${size} — ships in 1–2 days` };
    return { cls: '', text: 'In stock — ships from Riga in 1–2 days' };
  }
  const t = totalStock(p, colorKey);
  if (t === 0) return { cls: 'out', text: 'Sold out in this colour' };
  return { cls: '', text: 'In stock — ships from Riga in 1–2 days' };
}

/* ---------- product card ---------- */
export function card(p, { sizes = '(max-width:760px) 50vw, (max-width:1280px) 33vw, 25vw', quick = true } = {}) {
  const c = p.colors[0];
  const low = totalStock(p, c.key) <= 6;
  return `<article class="card has-alt" data-slug="${p.slug}">
    <div class="card-media" style="--bg:${bg(c.img)}">
      <span class="shadow"></span>
      ${img(c.img, { cls: 'main', alt: `${p.name} in ${c.name}`, sizes })}
      ${img(p.media.model, { cls: 'alt', alt: `${p.name} worn on the salt flat`, sizes })}
      <span class="card-no" aria-hidden="true">${p.no}</span>
      ${p.badge ? `<span class="card-badge tag">${esc(p.badge)}</span>` : p.isNew ? '<span class="card-badge tag">New</span>' : ''}
      <a class="card-link" href="/product/${p.slug}" aria-label="${esc(p.name)}, ${money(p.price)}" data-piece></a>
      ${quick ? `<div class="card-quick glass" aria-label="Quick add">
        <div class="mono mid">Quick add · ${esc(c.name)}</div>
        <div class="sizes">${p.sizes.map((s) => `<button class="sz" data-quick="${p.slug}|${c.key}|${esc(s)}" ${stockOf(p, c.key, s) ? '' : 'disabled'} aria-label="Add size ${esc(s)} to bag">${esc(s.replace('One size', 'One'))}</button>`).join('')}</div>
      </div>` : ''}
    </div>
    <div class="card-meta">
      <span class="name">${esc(p.name)}</span><span class="price">${money(p.price)}</span>
      <span class="sub mono"><span>${esc(p.tech[0])}</span><span>${esc(p.tech[1] || '')}</span></span>
      <span class="sub"><span class="dots" aria-label="Colours: ${p.colors.map((x) => x.name).join(', ')}">${p.colors.map((x) => `<i style="background:${x.hex}"></i>`).join('')}</span>${low ? '<span class="mono stock-low">Low stock</span>' : ''}</span>
    </div>
  </article>`;
}

/* ---------- toast ---------- */
let toastTimer;
export function toast(text, action) {
  const t = $('#toast');
  $('.t', t).textContent = text;
  const a = $('a', t);
  if (action) { a.hidden = false; a.href = action.href; $('span', a).textContent = action.label; } else a.hidden = true;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 3600);
}

export const SHIP_FREE = BRAND.freeShippingFrom;

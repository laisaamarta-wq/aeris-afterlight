/* Bag state. Swap this module's internals for a commerce backend
   (Shopify Storefront cart, Medusa, etc.) — the page code only calls the API below. */
import { PRODUCTS, BRAND } from '/data/catalog.js';

const KEY = 'aeris:bag:v1';
const subs = new Set();
const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
let items = read().filter((it) => PRODUCTS.some((p) => p.slug === it.slug));

const emit = () => { write(items); subs.forEach((f) => f(items)); };
const product = (slug) => PRODUCTS.find((p) => p.slug === slug);
const maxQty = (it) => product(it.slug)?.stock?.[it.color]?.[it.size] ?? 0;

export const bag = {
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  items: () => items.map((it) => ({ ...it, product: product(it.slug) })),
  count: () => items.reduce((a, b) => a + b.qty, 0),
  subtotal: () => items.reduce((a, it) => a + (product(it.slug)?.price || 0) * it.qty, 0),
  add(slug, color, size, qty = 1) {
    const ex = items.find((x) => x.slug === slug && x.color === color && x.size === size);
    const cap = maxQty({ slug, color, size });
    if (cap <= 0) return { ok: false, reason: 'Sold out' };
    if (ex) {
      if (ex.qty + qty > cap) return { ok: false, reason: `Only ${cap} available` };
      ex.qty += qty;
    } else items.push({ slug, color, size, qty: Math.min(qty, cap) });
    emit(); return { ok: true };
  },
  setQty(i, q) {
    const it = items[i]; if (!it) return;
    it.qty = Math.max(0, Math.min(q, maxQty(it)));
    if (!it.qty) items.splice(i, 1);
    emit();
  },
  remove(i) { items.splice(i, 1); emit(); },
  clear() { items = []; emit(); },
};

export function totals({ shipping = 'standard', discount = 0 } = {}) {
  const sub = bag.subtotal();
  const disc = Math.round(sub * discount);
  const free = sub - disc >= BRAND.freeShippingFrom;
  const ship = !sub || shipping === 'store' ? 0 : shipping === 'express' ? BRAND.shipping.express : free ? 0 : BRAND.shipping.standard;
  const total = sub - disc + ship;
  const vat = Math.round((total - total / 1.21) * 100) / 100;
  return { sub, disc, ship, total, vat, free };
}

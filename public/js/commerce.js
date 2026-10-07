/* =====================================================================
   Commerce adapter — the one place a real backend plugs in.
   ---------------------------------------------------------------------
   createOrder() currently simulates an order so the full flow can be
   tested end to end. To go live, replace the body with one of:
   • Stripe Checkout: POST the bag to a serverless function that creates
     a Checkout Session, then window.location = session.url
   • Shopify: create a cart via the Storefront API and redirect to
     cart.checkoutUrl
   The checkout page only depends on the shape returned here.
   ===================================================================== */
const DISCOUNTS = { AFTERLIGHT10: 0.1 };

export function checkDiscount(code) {
  const k = String(code || '').trim().toUpperCase();
  return DISCOUNTS[k] ? { code: k, rate: DISCOUNTS[k] } : null;
}

export async function createOrder(payload) {
  await new Promise((r) => setTimeout(r, 900));
  const id = 'AER-' + Date.now().toString(36).toUpperCase().slice(-6);
  const order = { id, createdAt: new Date().toISOString(), ...payload, status: 'confirmed', test: true };
  try { sessionStorage.setItem('aeris:lastOrder', JSON.stringify(order)); } catch {}
  return order;
}

export function lastOrder() {
  try { return JSON.parse(sessionStorage.getItem('aeris:lastOrder') || 'null'); } catch { return null; }
}

/* Demo storefront. State in localStorage; no backend. */
const CATALOG = [
  { id: 'anvil',     name: 'Reinforced Anvil',   price: 29.99, desc: 'Heavy, dependable, and surprisingly quiet.' },
  { id: 'lantern',   name: 'Storm Lantern',      price: 18.5,  desc: 'Burns steady in weather that puts others out.' },
  { id: 'satchel',   name: 'Field Satchel',      price: 46.0,  desc: 'Waxed canvas. Holds more than it looks like it should.' },
  { id: 'compass',   name: 'Brass Compass',      price: 12.25, desc: 'Points north. Asks nothing else of you.' },
  { id: 'kettle',    name: 'Copper Kettle',      price: 34.75, desc: 'Whistles on key.' },
  { id: 'rope',      name: 'Braided Rope',       price: 9.99,  desc: 'Thirty metres of well-behaved tension.' },
];

const CART_KEY = 'demo.cart';
const AUTH_KEY = 'demo.user';
const CONSENT_KEY = 'demo.consent';
const VALID = { 'standard_user': 'demo_password', 'locked_out_user': 'demo_password' };

const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } };
const writeCart = (c) => localStorage.setItem(CART_KEY, JSON.stringify(c));
const cartCount = () => Object.values(readCart()).reduce((a, b) => a + b, 0);
const currentUser = () => localStorage.getItem(AUTH_KEY);
const money = (n) => `$${n.toFixed(2)}`;

function requireAuth() {
  if (!currentUser()) { location.href = '/index.html'; return false; }
  return true;
}

function renderHeader() {
  const el = document.querySelector('[data-test="cart-count"]');
  if (el) {
    const n = cartCount();
    el.textContent = String(n);
    el.hidden = n === 0;
  }
  const out = document.querySelector('[data-test="logout"]');
  if (out) out.addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    location.href = '/index.html';
  });
}

/* Consent banner appears after a beat, the way a real one does — this is what
   the framework's locator handler is built to survive. */
function maybeShowConsent() {
  const banner = document.getElementById('consent-banner');
  if (!banner || localStorage.getItem(CONSENT_KEY)) return;
  setTimeout(() => banner.classList.add('show'), 600);
  document.getElementById('consent-banner-button-primary')?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    banner.classList.remove('show');
  });
}

function initLogin() {
  document.querySelector('[data-test="login-form"]').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.querySelector('[data-test="username"]').value.trim();
    const p = document.querySelector('[data-test="password"]').value;
    const err = document.querySelector('[data-test="error"]');

    const show = (msg) => { err.textContent = msg; err.hidden = false; };

    if (!u || !p) return show('Username and password are required');
    if (VALID[u] !== p) return show('Username and password do not match any user in this service');
    if (u === 'locked_out_user') return show('Sorry, this user has been locked out');

    err.hidden = true;
    localStorage.setItem(AUTH_KEY, u);
    location.href = '/inventory.html';
  });
}

function initInventory() {
  if (!requireAuth()) return;
  const grid = document.querySelector('[data-test="inventory-list"]');
  const sort = document.querySelector('[data-test="product-sort"]');

  const draw = () => {
    const items = [...CATALOG];
    const mode = sort.value;
    if (mode === 'name-asc') items.sort((a, b) => a.name.localeCompare(b.name));
    if (mode === 'name-desc') items.sort((a, b) => b.name.localeCompare(a.name));
    if (mode === 'price-asc') items.sort((a, b) => a.price - b.price);
    if (mode === 'price-desc') items.sort((a, b) => b.price - a.price);

    const cart = readCart();
    grid.innerHTML = items.map((i) => `
      <article class="card" data-test="item-${i.id}">
        <h3 data-test="item-name">${i.name}</h3>
        <p class="desc" data-test="item-desc">${i.desc}</p>
        <div class="row">
          <span class="price" data-test="item-price">${money(i.price)}</span>
          <button data-test="${cart[i.id] ? 'remove' : 'add-to-cart'}-${i.id}" data-id="${i.id}">
            ${cart[i.id] ? 'Remove' : 'Add to cart'}
          </button>
        </div>
      </article>`).join('');

    grid.querySelectorAll('button[data-id]').forEach((b) => b.addEventListener('click', () => {
      const c = readCart(); const id = b.dataset.id;
      if (c[id]) delete c[id]; else c[id] = 1;
      writeCart(c); draw(); renderHeader();
    }));
  };

  sort.addEventListener('change', draw);
  draw();
}

function lineItems() {
  const cart = readCart();
  return CATALOG.filter((i) => cart[i.id]).map((i) => ({ ...i, qty: cart[i.id] }));
}

function initCart() {
  if (!requireAuth()) return;
  const list = document.querySelector('[data-test="cart-list"]');
  const empty = document.querySelector('[data-test="cart-empty"]');
  const checkout = document.querySelector('[data-test="checkout"]');

  const draw = () => {
    const items = lineItems();
    empty.hidden = items.length > 0;
    checkout.disabled = items.length === 0;
    list.innerHTML = items.map((i) => `
      <div class="line-item" data-test="cart-item-${i.id}">
        <div><strong data-test="cart-item-name">${i.name}</strong>
          <div class="muted" data-test="cart-item-qty">Qty ${i.qty}</div></div>
        <div style="display:flex;gap:14px;align-items:center">
          <span data-test="cart-item-price">${money(i.price * i.qty)}</span>
          <button class="secondary" data-test="cart-remove-${i.id}" data-id="${i.id}">Remove</button>
        </div>
      </div>`).join('');

    list.querySelectorAll('button[data-id]').forEach((b) => b.addEventListener('click', () => {
      const c = readCart(); delete c[b.dataset.id]; writeCart(c); draw(); renderHeader();
    }));
  };

  checkout.addEventListener('click', () => { location.href = '/checkout.html'; });
  draw();
}

function initCheckout() {
  if (!requireAuth()) return;
  const items = lineItems();
  if (items.length === 0) { location.href = '/cart.html'; return; }

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  document.querySelector('[data-test="subtotal"]').textContent = money(subtotal);
  document.querySelector('[data-test="tax"]').textContent = money(tax);
  document.querySelector('[data-test="total"]').textContent = money(subtotal + tax);

  document.querySelector('[data-test="checkout-form"]').addEventListener('submit', (e) => {
    e.preventDefault();
    const err = document.querySelector('[data-test="error"]');
    const get = (n) => document.querySelector(`[data-test="${n}"]`).value.trim();
    const missing = ['first-name', 'last-name', 'postal-code'].filter((n) => !get(n));

    if (missing.length) {
      err.textContent = `Required: ${missing.join(', ').replace(/-/g, ' ')}`;
      err.hidden = false;
      return;
    }
    err.hidden = true;
    const ref = 'DM-' + String(Date.now()).slice(-8);
    sessionStorage.setItem('demo.order', JSON.stringify({ ref, total: subtotal + tax }));
    writeCart({});
    location.href = '/complete.html';
  });
}

function initComplete() {
  if (!requireAuth()) return;
  let order;
  try { order = JSON.parse(sessionStorage.getItem('demo.order')); } catch { order = null; }
  if (!order) { location.href = '/inventory.html'; return; }
  document.querySelector('[data-test="order-ref"]').textContent = order.ref;
  document.querySelector('[data-test="order-total"]').textContent = money(order.total);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  maybeShowConsent();
  const page = document.body.dataset.page;
  ({ login: initLogin, inventory: initInventory, cart: initCart,
     checkout: initCheckout, complete: initComplete }[page] || (() => {}))();
});

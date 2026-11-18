import { shop } from './config.js';

const byId = (id) => document.getElementById(id);
const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const quantities = new Map();
const filterButtons = [...document.querySelectorAll('[data-category]')];
const products = byId('products');
const productCards = new Map();
const orderList = byId('order-items');
const orderForm = byId('order-form');
const orderButton = byId('send-order');
const paymentError = byId('payment-error');
const miniOrder = byId('floating-order');
const dialog = byId('message-dialog');
const whatsappNumber = /^\d{8,15}$/.test(shop.whatsappNumber) && !shop.sampleMenu ? shop.whatsappNumber : '';
const receiptRows = new Map();
let totalQuantity = 0;
let orderInView = false;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function quantityButton(symbol, label, onClick) {
  const button = element('button', 'icon-button', symbol);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.addEventListener('click', onClick);
  return button;
}

function updateQuantity(product, change) {
  const quantity = Math.max(0, Math.min(99, (quantities.get(product.id) || 0) + change));
  if (quantity > 0) quantities.set(product.id, quantity);
  else quantities.delete(product.id);
  renderOrder();
  byId('menu-status').textContent = `${product.name}: ${quantity} en tu pedido.`;
}

for (const product of shop.products) {
  const card = element('article', 'product-card');
  const image = element('img', 'product-image');
  Object.assign(image, { src: `assets/${product.image}`, alt: product.alt, width: 600, height: 600, loading: 'lazy' });
  const details = element('div', 'product-details');
  const title = element('h3', '', product.name);
  const description = element('p', '', product.description);
  const bottom = element('div', 'product-bottom');
  const price = element('strong', '', money.format(product.price));
  const add = quantityButton('+', `Sumar ${product.name}`, () => updateQuantity(product, 1));
  const quantity = element('span', 'selected-quantity');
  const selection = element('div', 'product-selection');
  selection.append(quantity, add);
  bottom.append(price, selection);
  details.append(title, description, bottom);
  card.append(image, details);
  products.append(card);
  productCards.set(product.id, { card, quantity, add });
}
byId('sample-note').hidden = !shop.sampleMenu;

function applyFilter(category) {
  let count = 0;
  for (const product of shop.products) {
    const visible = category === 'todos' || category === product.category;
    productCards.get(product.id).card.hidden = !visible;
    if (visible) count++;
  }
  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.category === category));
  }
  byId('menu-status').textContent = `${count} ${count === 1 ? 'producto' : 'productos'} en el menú.`;
}

for (const button of filterButtons) {
  button.addEventListener('click', () => applyFilter(button.dataset.category));
}

function updateMiniOrder() {
  miniOrder.hidden = totalQuantity === 0 || orderInView;
}

const orderObserver = new IntersectionObserver(([entry]) => {
  orderInView = entry.intersectionRatio >= 0.3;
  updateMiniOrder();
}, { threshold: 0.3 });
orderObserver.observe(orderForm);

function receiptRow(product) {
  if (receiptRows.has(product.id)) return receiptRows.get(product.id);
  const row = element('li', 'receipt-row');
  const label = element('span', 'item-label', product.name);
  const controls = element('div', 'quantity-controls');
  const amount = element('span', 'quantity-value');
  const minus = quantityButton('−', `Quitar una unidad de ${product.name}`, () => {
    const removingLast = quantities.get(product.id) === 1;
    updateQuantity(product, -1);
    if (removingLast) (orderList.querySelector('button') || byId('back-to-menu')).focus();
  });
  const plus = quantityButton('+', `Sumar una unidad de ${product.name}`, () => updateQuantity(product, 1));
  controls.append(minus, amount, plus);
  row.append(label, controls);
  const result = { row, amount, plus };
  receiptRows.set(product.id, result);
  return result;
}

function renderOrder() {
  totalQuantity = 0;
  let subtotal = 0;
  for (const product of shop.products) {
    const quantity = quantities.get(product.id) || 0;
    const card = productCards.get(product.id);
    card.quantity.textContent = quantity ? `${quantity}×` : '';
    card.add.disabled = quantity === 99;
    if (quantity === 0) {
      receiptRows.get(product.id)?.row.remove();
      continue;
    }
    totalQuantity += quantity;
    subtotal += product.price * quantity;
    const item = receiptRow(product);
    item.amount.textContent = quantity;
    item.plus.disabled = quantity === 99;
    if (!item.row.isConnected) orderList.append(item.row);
  }
  const empty = totalQuantity === 0;
  byId('bag-count').textContent = totalQuantity;
  byId('floating-count').textContent = `${totalQuantity} ${totalQuantity === 1 ? 'producto' : 'productos'} · ${money.format(subtotal)}`;
  byId('empty-order').hidden = !empty;
  byId('back-to-menu').hidden = !empty;
  orderList.hidden = empty;
  byId('order-total').hidden = empty;
  byId('total-amount').textContent = money.format(subtotal);
  byId('payment').hidden = empty;
  for (const input of orderForm.querySelectorAll('[name="payment"]')) {
    input.required = !empty;
  }
  if (empty) paymentError.hidden = true;
  orderButton.disabled = empty;
  updateMiniOrder();
}

for (const method of shop.paymentMethods) {
  const label = element('label', 'payment-option');
  const input = element('input');
  Object.assign(input, { type: 'radio', name: 'payment', value: method });
  label.append(input, element('span', '', method));
  byId('payment-options').append(label);
}

byId('payment-options').addEventListener('change', () => { paymentError.hidden = true; });

if (whatsappNumber) orderButton.firstChild.textContent = 'Continuar en WhatsApp ';

function buildMessage(payment) {
  let subtotal = 0;
  const lines = shop.products.flatMap((product) => {
    const quantity = quantities.get(product.id);
    if (!quantity) return [];
    const lineTotal = quantity * product.price;
    subtotal += lineTotal;
    return [`• ${quantity} × ${product.name} — ${money.format(lineTotal)}`];
  });
  return [
    '¡Hola, cafito! Quiero hacer un pedido para retirar.',
    '', ...lines, '',
    `Total estimado: ${money.format(subtotal)}`,
    `Forma de pago: ${payment}`,
    '', '¿Me confirman cuánto demora y cuándo puedo pasar a buscarlo? Gracias.',
  ].join('\n');
}

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const payment = new FormData(orderForm).get('payment');
  if (!totalQuantity) return;
  if (!payment) {
    paymentError.hidden = false;
    orderForm.querySelector('[name="payment"]').focus();
    return;
  }
  const message = buildMessage(payment);
  if (whatsappNumber) {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    return;
  }
  byId('message-text').textContent = message;
  byId('copy-status').textContent = '';
  dialog.showModal();
});

byId('copy-message').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(byId('message-text').textContent);
    byId('copy-status').textContent = 'Mensaje copiado.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(byId('message-text'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    byId('copy-status').textContent = 'Mensaje seleccionado para copiar.';
  }
});

function instagramUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && ['www.instagram.com', 'instagram.com'].includes(url.hostname)) return url.href;
  } catch {
    return '';
  }
  return '';
}

const profileUrl = instagramUrl(shop.instagramProfile);
if (profileUrl) {
  byId('instagram-profile').href = profileUrl;
  byId('instagram-profile').hidden = false;
}
byId('social-note').hidden = shop.instagramPosts.length > 0 && shop.instagramPosts.every((post) => instagramUrl(post.url));
for (const post of shop.instagramPosts) {
  const url = instagramUrl(post.url);
  const card = element(url ? 'a' : 'div', 'social-card');
  const image = element('img');
  Object.assign(image, { src: `assets/${post.image}`, alt: post.alt, width: 508, height: 715, loading: 'lazy' });
  card.append(image);
  if (url) {
    Object.assign(card, { href: url, target: '_blank', rel: 'noopener noreferrer' });
    const arrow = element('span', 'social-arrow');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.append(element('span', 'arrow arrow-out'));
    card.append(arrow);
  }
  byId('social-grid').append(card);
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
let animationFrame = 0;
function paintParallax() {
  animationFrame = 0;
  const rect = hero.getBoundingClientRect();
  const strength = matchMedia('(max-width: 700px)').matches ? 22 : 65;
  const distance = reducedMotion.matches ? 0 : Math.max(0, Math.min(1, -rect.top / rect.height)) * strength;
  hero.style.setProperty('--parallax', `${distance}px`);
}
function scheduleParallax() {
  if (!animationFrame) animationFrame = requestAnimationFrame(paintParallax);
}
window.addEventListener('scroll', scheduleParallax, { passive: true });
reducedMotion.addEventListener('change', scheduleParallax);
paintParallax();
renderOrder();

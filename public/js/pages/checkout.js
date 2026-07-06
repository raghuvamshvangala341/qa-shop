async function loadSummary() {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html?next=checkout.html';
    return;
  }
  const wrap = document.getElementById('checkout-summary');
  const { ok, data } = await Api.getCart();
  if (!ok) {
    wrap.innerHTML = `<div class="banner banner-error">Could not load your cart.</div>`;
    return;
  }
  const cart = data.cart;

  if (cart.items.length === 0) {
    document.getElementById('checkout-banner').innerHTML =
      `<div class="banner banner-error" data-testid="checkout-empty-cart-banner">Your cart is empty. <a href="index.html">Continue shopping</a>.</div>`;
    document.getElementById('place-order-btn').disabled = true;
  }

  wrap.innerHTML = `
    <h3>Order summary</h3>
    ${cart.items.map(i => `
      <div class="summary-row" data-testid="checkout-line-${i.productId}">
        <span>${escapeHtml(i.name)} &times; ${i.quantity}</span>
        <span>${money(i.lineTotal)}</span>
      </div>
    `).join('')}
    <div class="summary-row"><span>Subtotal</span><span>${money(cart.subtotal)}</span></div>
    ${cart.coupon ? `<div class="summary-row discount"><span>Discount (${escapeHtml(cart.coupon)})</span><span>-${money(cart.discount)}</span></div>` : ''}
    <div class="summary-row"><span>Tax</span><span>${money(cart.tax)}</span></div>
    <div class="summary-row total"><span>Total</span><span data-testid="checkout-total">${money(cart.total)}</span></div>
  `;
}

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const banner = document.getElementById('checkout-banner');
  banner.innerHTML = '';
  showFieldErrors({});

  const shipping = {
    fullName: document.getElementById('fullName').value,
    addressLine: document.getElementById('addressLine').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zip: document.getElementById('zip').value,
    country: document.getElementById('country').value
  };
  const payment = {
    nameOnCard: document.getElementById('nameOnCard').value,
    cardNumber: document.getElementById('cardNumber').value,
    expiry: document.getElementById('expiry').value,
    cvv: document.getElementById('cvv').value
  };

  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.textContent = 'Placing order…';

  const { ok, status, data } = await Api.checkout(shipping, payment);

  btn.disabled = false;
  btn.textContent = 'Place order';

  if (ok) {
    window.location.href = `order-confirmation.html?id=${data.order.id}`;
    return;
  }

  if (data.errors) {
    showFieldErrors(data.errors);
    banner.innerHTML = `<div class="banner banner-error" data-testid="checkout-validation-banner">Please fix the highlighted fields.</div>`;
  } else if (status === 409 && data.details) {
    banner.innerHTML = `<div class="banner banner-error" data-testid="checkout-stock-error">
      ${escapeHtml(data.error)}<ul style="margin:8px 0 0 18px">${data.details.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
    </div>`;
  } else {
    banner.innerHTML = `<div class="banner banner-error" data-testid="checkout-error-banner">${escapeHtml(data.error || 'Could not place order')}</div>`;
  }
});

document.addEventListener('DOMContentLoaded', loadSummary);

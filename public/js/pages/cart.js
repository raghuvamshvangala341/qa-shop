async function requireLogin() {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html?next=cart.html';
    return false;
  }
  return true;
}

async function loadCart() {
  if (!(await requireLogin())) return;

  const itemsWrap = document.getElementById('cart-items-wrap');
  const { ok, data } = await Api.getCart();
  if (!ok) {
    itemsWrap.innerHTML = `<div class="banner banner-error" data-testid="cart-load-error">Could not load your cart.</div>`;
    return;
  }

  const cart = data.cart;

  if (cart.items.length === 0) {
    itemsWrap.innerHTML = `
      <div class="empty-state" data-testid="empty-cart">
        <div class="emoji">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse the <a href="index.html">catalog</a> to add something.</p>
      </div>`;
  } else {
    itemsWrap.innerHTML = cart.items.map(item => `
      <div class="cart-line" data-testid="cart-line-${item.productId}">
        <div class="product-emoji">${item.image}</div>
        <div class="cart-line-info">
          <div class="product-name" data-testid="cart-item-name-${item.productId}">${escapeHtml(item.name)}</div>
          <div class="subtitle" style="margin:0">${money(item.price)} each &middot; ${item.stock} in stock</div>
        </div>
        <div class="qty-control">
          <button type="button" data-testid="cart-decrement-${item.productId}" onclick="changeQty('${item.productId}', ${item.quantity - 1})">-</button>
          <input type="number" min="1" max="${item.stock}" value="${item.quantity}" data-testid="cart-qty-input-${item.productId}"
                 onchange="changeQty('${item.productId}', this.value)" />
          <button type="button" data-testid="cart-increment-${item.productId}" onclick="changeQty('${item.productId}', ${item.quantity + 1})">+</button>
        </div>
        <div class="product-price" data-testid="cart-line-total-${item.productId}">${money(item.lineTotal)}</div>
        <button class="btn btn-danger btn-sm" data-testid="cart-remove-${item.productId}" onclick="removeItem('${item.productId}')">Remove</button>
      </div>
    `).join('');
  }

  const rows = document.getElementById('summary-rows');
  rows.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span data-testid="summary-subtotal">${money(cart.subtotal)}</span></div>
    ${cart.coupon ? `
      <div class="summary-row discount">
        <span>Discount (${escapeHtml(cart.coupon)}) <button class="link-btn" data-testid="coupon-remove-btn" onclick="removeCoupon()">remove</button></span>
        <span data-testid="summary-discount">-${money(cart.discount)}</span>
      </div>` : ''}
    <div class="summary-row"><span>Tax (8%)</span><span data-testid="summary-tax">${money(cart.tax)}</span></div>
    <div class="summary-row total"><span>Total</span><span data-testid="summary-total">${money(cart.total)}</span></div>
  `;

  const checkoutBtn = document.getElementById('checkout-btn');
  checkoutBtn.disabled = cart.items.length === 0;

  if (cart.couponError) {
    document.getElementById('coupon-message').innerHTML =
      `<div class="banner banner-error" data-testid="coupon-error">${escapeHtml(cart.couponError)}</div>`;
  }

  refreshCartCount();
}

async function changeQty(productId, rawQty) {
  const qty = Number(rawQty);
  const msgHost = document.getElementById('cart-items-wrap');
  if (!Number.isInteger(qty) || qty < 1) {
    await removeItem(productId, true);
    return;
  }
  const { ok, data } = await Api.updateCartItem(productId, qty);
  if (!ok) {
    const banner = document.createElement('div');
    banner.className = 'banner banner-error';
    banner.setAttribute('data-testid', 'cart-update-error');
    banner.textContent = data.error || 'Could not update quantity';
    msgHost.prepend(banner);
    setTimeout(() => banner.remove(), 3500);
  }
  loadCart();
}

async function removeItem(productId) {
  await Api.removeCartItem(productId);
  loadCart();
}

document.getElementById('clear-cart-btn').addEventListener('click', async () => {
  if (!confirm('Remove all items from your cart?')) return;
  await Api.clearCart();
  loadCart();
});

document.getElementById('coupon-apply-btn').addEventListener('click', async () => {
  const code = document.getElementById('coupon-input').value.trim();
  const msg = document.getElementById('coupon-message');
  msg.innerHTML = '';
  if (!code) {
    msg.innerHTML = `<div class="banner banner-error" data-testid="coupon-error">Enter a coupon code</div>`;
    return;
  }
  const { ok, data } = await Api.applyCoupon(code);
  if (!ok) {
    msg.innerHTML = `<div class="banner banner-error" data-testid="coupon-error">${escapeHtml(data.error)}</div>`;
    return;
  }
  msg.innerHTML = `<div class="banner banner-success" data-testid="coupon-success">Coupon applied.</div>`;
  loadCart();
});

async function removeCoupon() {
  await Api.removeCoupon();
  loadCart();
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  window.location.href = 'checkout.html';
});

document.addEventListener('DOMContentLoaded', loadCart);

async function loadConfirmation() {
  const container = document.getElementById('confirmation-content');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  if (!id) {
    container.innerHTML = `<div class="banner banner-error">No order specified.</div>`;
    return;
  }

  const { ok, data } = await Api.getOrder(id);
  if (!ok) {
    container.innerHTML = `<div class="banner banner-error" data-testid="order-not-found">${escapeHtml(data.error || 'Order not found')}</div>`;
    return;
  }

  const o = data.order;
  container.innerHTML = `
    <div class="banner banner-success" data-testid="order-success-banner">Your order has been placed.</div>
    <div class="card" style="padding:24px">
      <h2>Order <span data-testid="order-id">${escapeHtml(o.id)}</span></h2>
      <p class="subtitle">Status: <span class="badge badge-status-${o.status}" data-testid="order-status">${o.status}</span></p>

      <h3>Items</h3>
      ${o.items.map(i => `
        <div class="summary-row">
          <span>${escapeHtml(i.name)} &times; ${i.quantity}</span>
          <span>${money(i.lineTotal)}</span>
        </div>
      `).join('')}
      <div class="summary-row"><span>Subtotal</span><span>${money(o.subtotal)}</span></div>
      ${o.coupon ? `<div class="summary-row discount"><span>Discount (${escapeHtml(o.coupon)})</span><span>-${money(o.discount)}</span></div>` : ''}
      <div class="summary-row"><span>Tax</span><span>${money(o.tax)}</span></div>
      <div class="summary-row total"><span>Total</span><span data-testid="order-total">${money(o.total)}</span></div>

      <h3 style="margin-top:20px">Shipping to</h3>
      <p data-testid="order-shipping-address">
        ${escapeHtml(o.shipping.fullName)}<br/>
        ${escapeHtml(o.shipping.addressLine)}<br/>
        ${escapeHtml(o.shipping.city)}, ${escapeHtml(o.shipping.state)} ${escapeHtml(o.shipping.zip)}<br/>
        ${escapeHtml(o.shipping.country)}
      </p>
      <p class="subtitle">Paid with card ending in ${escapeHtml(o.payment.last4)}</p>

      <div style="display:flex; gap:12px; margin-top:20px">
        <a class="btn btn-primary" href="orders.html" data-testid="view-orders-link">View my orders</a>
        <a class="btn btn-secondary" href="index.html" data-testid="continue-shopping-link">Continue shopping</a>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadConfirmation);

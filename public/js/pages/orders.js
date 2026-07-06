async function loadOrders() {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html?next=orders.html';
    return;
  }
  const list = document.getElementById('orders-list');
  const { ok, data } = await Api.getOrders();
  if (!ok) {
    list.innerHTML = `<div class="banner banner-error">Could not load your orders.</div>`;
    return;
  }

  if (data.orders.length === 0) {
    list.innerHTML = `
      <div class="empty-state" data-testid="empty-orders">
        <div class="emoji">📦</div>
        <h3>You haven't placed any orders yet</h3>
        <p><a href="index.html">Start shopping</a> to place your first order.</p>
      </div>`;
    return;
  }

  list.innerHTML = data.orders.map(o => `
    <div class="card" style="padding:18px; margin-bottom:14px" data-testid="order-row-${o.id}">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px">
        <div>
          <div class="product-name" data-testid="order-row-id-${o.id}">${escapeHtml(o.id)}</div>
          <div class="subtitle" style="margin:0">${new Date(o.createdAt).toLocaleString()}</div>
        </div>
        <span class="badge badge-status-${o.status}" data-testid="order-row-status-${o.id}">${o.status}</span>
        <div class="product-price" data-testid="order-row-total-${o.id}">${money(o.total)}</div>
        <div style="display:flex; gap:8px">
          <button class="btn btn-secondary btn-sm" data-testid="order-toggle-${o.id}" onclick="toggleDetail('${o.id}')">Details</button>
          ${o.status === 'Pending' ? `<button class="btn btn-danger btn-sm" data-testid="order-cancel-${o.id}" onclick="cancelOrder('${o.id}')">Cancel</button>` : ''}
        </div>
      </div>
      <div id="detail-${o.id}" style="display:none; margin-top:14px; border-top:1px solid var(--border); padding-top:14px"></div>
    </div>
  `).join('');
}

async function toggleDetail(orderId) {
  const el = document.getElementById(`detail-${orderId}`);
  if (el.style.display === 'block') { el.style.display = 'none'; return; }

  el.style.display = 'block';
  el.innerHTML = `<div class="spinner-text">Loading…</div>`;
  const { ok, data } = await Api.getOrder(orderId);
  if (!ok) { el.innerHTML = `<div class="banner banner-error">Could not load order details.</div>`; return; }

  const o = data.order;
  el.innerHTML = `
    ${o.items.map(i => `<div class="summary-row"><span>${escapeHtml(i.name)} &times; ${i.quantity}</span><span>${money(i.lineTotal)}</span></div>`).join('')}
    <div class="summary-row"><span>Subtotal</span><span>${money(o.subtotal)}</span></div>
    ${o.coupon ? `<div class="summary-row discount"><span>Discount (${escapeHtml(o.coupon)})</span><span>-${money(o.discount)}</span></div>` : ''}
    <div class="summary-row"><span>Tax</span><span>${money(o.tax)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${money(o.total)}</span></div>
    <p class="subtitle" style="margin-top:10px">Ship to: ${escapeHtml(o.shipping.fullName)}, ${escapeHtml(o.shipping.city)}, ${escapeHtml(o.shipping.state)} ${escapeHtml(o.shipping.zip)}</p>
  `;
}

async function cancelOrder(orderId) {
  if (!confirm('Cancel this order?')) return;
  const { ok, data } = await Api.cancelOrder(orderId);
  if (!ok) {
    alert(data.error || 'Could not cancel order');
    return;
  }
  loadOrders();
}

document.addEventListener('DOMContentLoaded', loadOrders);

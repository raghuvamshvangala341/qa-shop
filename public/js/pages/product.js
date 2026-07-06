async function loadProduct() {
  const container = document.getElementById('product-detail');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = `<div class="banner banner-error" data-testid="product-not-found">No product specified.</div>`;
    return;
  }

  const { ok, data } = await Api.getProduct(id);
  if (!ok) {
    container.innerHTML = `<div class="banner banner-error" data-testid="product-not-found">${escapeHtml(data.error || 'Product not found')}</div>`;
    return;
  }

  const p = data.product;
  const outOfStock = p.stock <= 0;
  const lowStock = p.stock > 0 && p.stock <= 3;
  let badge = `<span class="badge badge-ok" data-testid="stock-badge">In stock (${p.stock})</span>`;
  if (outOfStock) badge = `<span class="badge badge-out" data-testid="stock-badge">Out of stock</span>`;
  else if (lowStock) badge = `<span class="badge badge-low" data-testid="stock-badge">Only ${p.stock} left</span>`;

  container.innerHTML = `
    <a href="index.html" data-testid="back-to-shop-link">&larr; Back to shop</a>
    <div class="grid-2" style="margin-top:18px">
      <div class="card" style="padding:40px; text-align:center;">
        <div style="font-size:110px" data-testid="product-image">${p.image}</div>
      </div>
      <div>
        <span class="sku-tag" data-testid="product-sku">${escapeHtml(p.sku)}</span>
        <h1 data-testid="product-name" style="margin-top:10px">${escapeHtml(p.name)}</h1>
        <p class="subtitle" data-testid="product-category">${escapeHtml(p.category)}</p>
        <div style="margin-bottom:14px">${badge}</div>
        <p data-testid="product-description">${escapeHtml(p.description)}</p>
        <div class="product-price" data-testid="product-price" style="font-size:28px; margin:18px 0">${money(p.price)}</div>
        <div id="add-form" style="display:flex; gap:10px; align-items:center; margin-bottom:14px">
          <div class="qty-control">
            <button type="button" data-testid="qty-decrement" onclick="stepQty(-1)">-</button>
            <input type="number" id="qty-input" min="1" max="${p.stock}" value="1" data-testid="qty-input" ${outOfStock ? 'disabled' : ''} />
            <button type="button" data-testid="qty-increment" onclick="stepQty(1)">+</button>
          </div>
          <button class="btn btn-primary" id="add-btn" data-testid="add-to-cart-btn" ${outOfStock ? 'disabled' : ''} onclick="addThis('${p.id}', ${p.stock})">
            ${outOfStock ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
        <div id="add-message"></div>
      </div>
    </div>
  `;
}

function stepQty(delta) {
  const input = document.getElementById('qty-input');
  const max = Number(input.max) || 999;
  let val = Number(input.value) + delta;
  if (val < 1) val = 1;
  if (val > max) val = max;
  input.value = val;
}

async function addThis(productId, stock) {
  const msg = document.getElementById('add-message');
  msg.innerHTML = '';

  if (!Auth.isLoggedIn()) {
    window.location.href = `login.html?next=product.html?id=${productId}`;
    return;
  }

  const qty = Number(document.getElementById('qty-input').value);
  if (!Number.isInteger(qty) || qty < 1) {
    msg.innerHTML = `<div class="banner banner-error" data-testid="add-to-cart-error">Enter a valid quantity of at least 1.</div>`;
    return;
  }

  const btn = document.getElementById('add-btn');
  btn.disabled = true;
  const { ok, data } = await Api.addToCart(productId, qty);
  btn.disabled = false;

  if (ok) {
    msg.innerHTML = `<div class="banner banner-success" data-testid="add-to-cart-success">Added ${qty} item(s) to your cart.</div>`;
    refreshCartCount();
  } else {
    msg.innerHTML = `<div class="banner banner-error" data-testid="add-to-cart-error">${escapeHtml(data.error || 'Could not add item to cart')}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadProduct);

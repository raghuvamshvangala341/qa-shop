let categoriesLoaded = false;

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  const params = new URLSearchParams(window.location.search);

  const query = {};
  if (params.get('q')) query.q = params.get('q');
  const category = document.getElementById('filter-category').value;
  if (category && category !== 'all') query.category = category;
  const sort = document.getElementById('filter-sort').value;
  if (sort) query.sort = sort;

  const { ok, data } = await Api.getProducts(query);
  if (!ok) {
    grid.innerHTML = `<div class="banner banner-error" data-testid="product-load-error">Could not load products.</div>`;
    return;
  }

  if (!categoriesLoaded) {
    const select = document.getElementById('filter-category');
    data.categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
    categoriesLoaded = true;
  }

  document.getElementById('result-count').textContent = `${data.count} item${data.count === 1 ? '' : 's'}`;

  if (data.products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" data-testid="empty-products" style="grid-column:1/-1">
        <div class="emoji">🔍</div>
        <h3>No products match your search</h3>
        <p>Try a different keyword or clear your filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = data.products.map(p => {
    const outOfStock = p.stock <= 0;
    const lowStock = p.stock > 0 && p.stock <= 3;
    let badge = `<span class="badge badge-ok" data-testid="stock-badge-${p.id}">In stock</span>`;
    if (outOfStock) badge = `<span class="badge badge-out" data-testid="stock-badge-${p.id}">Out of stock</span>`;
    else if (lowStock) badge = `<span class="badge badge-low" data-testid="stock-badge-${p.id}">Only ${p.stock} left</span>`;

    return `
      <div class="card product-card" data-testid="product-card-${p.id}">
        <div class="product-emoji">${p.image}</div>
        <div class="product-name">
          <a href="product.html?id=${p.id}" data-testid="product-link-${p.id}">${escapeHtml(p.name)}</a>
        </div>
        <div class="product-desc">${escapeHtml(p.description)}</div>
        <div>${badge} <span class="sku-tag">${escapeHtml(p.sku)}</span></div>
        <div class="product-meta">
          <span class="product-price" data-testid="product-price-${p.id}">${money(p.price)}</span>
          <button class="btn btn-primary btn-sm" data-testid="add-to-cart-${p.id}" ${outOfStock ? 'disabled' : ''} onclick="quickAdd('${p.id}', this)">
            ${outOfStock ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>`;
  }).join('');
}

async function quickAdd(productId, btn) {
  if (!Auth.isLoggedIn()) {
    window.location.href = `login.html?next=index.html`;
    return;
  }
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Adding…';
  const { ok, data } = await Api.addToCart(productId, 1);
  if (ok) {
    btn.textContent = 'Added ✓';
    refreshCartCount();
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1200);
  } else {
    alert(data.error || 'Could not add item to cart');
    btn.textContent = original;
    btn.disabled = false;
  }
}

document.getElementById('filter-category').addEventListener('change', loadProducts);
document.getElementById('filter-sort').addEventListener('change', loadProducts);
document.addEventListener('DOMContentLoaded', loadProducts);

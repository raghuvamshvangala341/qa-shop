let currentTab = 'products';
let editingProductId = null;
let loadedProducts = [];

const TRANSITIONS = {
  Pending: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: []
};

async function initAdmin() {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html?next=admin.html';
    return;
  }
  if (!Auth.isAdmin()) {
    document.getElementById('admin-root').innerHTML = `
      <div class="banner banner-error" data-testid="admin-access-denied">
        Access denied. This area requires an admin account. Try logging in as <code>admin / Admin123</code>.
      </div>`;
    return;
  }
  switchTab('products');
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-testid="admin-tab-${tab}"]`).classList.add('active');
  if (tab === 'products') renderProducts();
  else if (tab === 'orders') renderOrders();
  else renderUsers();
}

async function renderProducts() {
  const host = document.getElementById('admin-content');
  host.innerHTML = `<div class="spinner-text">Loading products…</div>`;
  const { ok, data } = await Api.adminGetProducts();
  if (!ok) { host.innerHTML = `<div class="banner banner-error">Could not load products.</div>`; return; }
  loadedProducts = data.products;

  host.innerHTML = `
    <div class="card" style="padding:20px; margin-bottom:20px">
      <h3 id="product-form-title">Add a product</h3>
      <div id="product-form-banner"></div>
      <form id="product-form" novalidate>
        <input type="hidden" id="product-id" />
        <div class="field-row">
          <div class="field"><label for="p-name">Name</label><input type="text" id="p-name" name="name" data-testid="admin-product-name-input" /></div>
          <div class="field"><label for="p-category">Category</label><input type="text" id="p-category" name="category" data-testid="admin-product-category-input" /></div>
        </div>
        <div class="field"><label for="p-description">Description</label><input type="text" id="p-description" name="description" data-testid="admin-product-description-input" /></div>
        <div class="field-row">
          <div class="field"><label for="p-price">Price</label><input type="text" id="p-price" name="price" data-testid="admin-product-price-input" /></div>
          <div class="field"><label for="p-stock">Stock</label><input type="text" id="p-stock" name="stock" data-testid="admin-product-stock-input" /></div>
          <div class="field"><label for="p-image">Emoji icon</label><input type="text" id="p-image" name="image" placeholder="📦" data-testid="admin-product-image-input" /></div>
        </div>
        <div style="display:flex; gap:10px">
          <button type="submit" class="btn btn-primary" data-testid="admin-product-save-btn">Save product</button>
          <button type="button" class="btn btn-secondary" id="product-form-cancel" data-testid="admin-product-cancel-btn" style="display:none">Cancel edit</button>
        </div>
      </form>
    </div>

    <div class="card table-wrap">
      <table data-testid="admin-products-table">
        <thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.products.map(p => `
            <tr data-testid="admin-product-row-${p.id}">
              <td>${escapeHtml(p.sku)}</td>
              <td>${escapeHtml(p.name)}</td>
              <td>${escapeHtml(p.category)}</td>
              <td>${money(p.price)}</td>
              <td>${p.stock}</td>
              <td style="display:flex; gap:6px">
                <button class="btn btn-secondary btn-sm" data-testid="admin-edit-${p.id}" onclick="startEditProduct('${p.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" data-testid="admin-delete-${p.id}" onclick="deleteProduct('${p.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('product-form').addEventListener('submit', submitProductForm);
  document.getElementById('product-form-cancel').addEventListener('click', resetProductForm);
}

function startEditProduct(productId) {
  const p = loadedProducts.find(prod => prod.id === productId);
  if (!p) return;
  editingProductId = p.id;
  document.getElementById('product-form-title').textContent = `Edit ${p.name}`;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-category').value = p.category;
  document.getElementById('p-description').value = p.description;
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('p-image').value = p.image;
  document.getElementById('product-form-cancel').style.display = 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetProductForm() {
  editingProductId = null;
  document.getElementById('product-form-title').textContent = 'Add a product';
  document.getElementById('product-form').reset();
  document.getElementById('product-form-cancel').style.display = 'none';
  showFieldErrors({});
}

async function submitProductForm(e) {
  e.preventDefault();
  showFieldErrors({});
  const banner = document.getElementById('product-form-banner');
  banner.innerHTML = '';

  const body = {
    name: document.getElementById('p-name').value,
    category: document.getElementById('p-category').value,
    description: document.getElementById('p-description').value,
    price: document.getElementById('p-price').value,
    stock: document.getElementById('p-stock').value,
    image: document.getElementById('p-image').value
  };

  const result = editingProductId
    ? await Api.adminUpdateProduct(editingProductId, body)
    : await Api.adminCreateProduct(body);

  if (!result.ok) {
    if (result.data.errors) showFieldErrors(result.data.errors);
    else banner.innerHTML = `<div class="banner banner-error" data-testid="admin-product-error">${escapeHtml(result.data.error || 'Could not save product')}</div>`;
    return;
  }

  resetProductForm();
  renderProducts();
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  const { ok, data } = await Api.adminDeleteProduct(id);
  if (!ok) { alert(data.error || 'Could not delete product'); return; }
  renderProducts();
}

async function renderOrders() {
  const host = document.getElementById('admin-content');
  host.innerHTML = `<div class="spinner-text">Loading orders…</div>`;
  const { ok, data } = await Api.adminGetOrders();
  if (!ok) { host.innerHTML = `<div class="banner banner-error">Could not load orders.</div>`; return; }

  host.innerHTML = `
    <div class="card table-wrap">
      <table data-testid="admin-orders-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.orders.map(o => `
            <tr data-testid="admin-order-row-${o.id}">
              <td>${escapeHtml(o.id)}</td>
              <td>${escapeHtml(o.username)}</td>
              <td>${money(o.total)}</td>
              <td><span class="badge badge-status-${o.status}" data-testid="admin-order-status-${o.id}">${o.status}</span></td>
              <td style="display:flex; gap:6px">
                ${(TRANSITIONS[o.status] || []).map(next => `
                  <button class="btn btn-secondary btn-sm" data-testid="admin-order-${o.id}-to-${next}" onclick="updateOrderStatus('${o.id}', '${next}')">${next}</button>
                `).join('') || '<span class="subtitle" style="margin:0">No actions</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function updateOrderStatus(orderId, status) {
  const { ok, data } = await Api.adminUpdateOrderStatus(orderId, status);
  if (!ok) { alert(data.error || 'Could not update order status'); return; }
  renderOrders();
}

async function renderUsers() {
  const host = document.getElementById('admin-content');
  host.innerHTML = `<div class="spinner-text">Loading users…</div>`;
  const { ok, data } = await Api.adminGetUsers();
  if (!ok) { host.innerHTML = `<div class="banner banner-error">Could not load users.</div>`; return; }

  host.innerHTML = `
    <div class="card table-wrap">
      <table data-testid="admin-users-table">
        <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>
          ${data.users.map(u => `
            <tr data-testid="admin-user-row-${u.id}">
              <td>${escapeHtml(u.username)}</td>
              <td>${escapeHtml(u.email)}</td>
              <td>${escapeHtml(u.role)}</td>
              <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', initAdmin);

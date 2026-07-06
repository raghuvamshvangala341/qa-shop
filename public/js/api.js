const API_BASE = '/api';

const Auth = {
  getToken() { return localStorage.getItem('qa_shop_token'); },
  setToken(t) { localStorage.setItem('qa_shop_token', t); },
  clearToken() { localStorage.removeItem('qa_shop_token'); },
  getUser() {
    const raw = localStorage.getItem('qa_shop_user');
    return raw ? JSON.parse(raw) : null;
  },
  setUser(u) { localStorage.setItem('qa_shop_user', JSON.stringify(u)); },
  clearUser() { localStorage.removeItem('qa_shop_user'); },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin() {
    const u = this.getUser();
    return !!u && u.role === 'admin';
  },
  logout() {
    this.clearToken();
    this.clearUser();
    window.location.href = 'index.html';
  }
};

async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (networkErr) {
    return { ok: false, status: 0, data: { success: false, error: 'Could not reach the server. Is it running?' } };
  }

  let data = {};
  try { data = await res.json(); } catch (e) { data = {}; }

  if (res.status === 401 && (path !== '/auth/login')) {
    // Token invalid/expired - clear it so the UI reflects logged-out state
    Auth.clearToken();
    Auth.clearUser();
  }

  return { ok: res.ok, status: res.status, data };
}

const Api = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiRequest('/auth/me'),

  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/products${qs ? '?' + qs : ''}`);
  },
  getProduct: (id) => apiRequest(`/products/${id}`),

  getCart: () => apiRequest('/cart'),
  addToCart: (productId, quantity) => apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId, quantity) => apiRequest(`/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (productId) => apiRequest(`/cart/items/${productId}`, { method: 'DELETE' }),
  clearCart: () => apiRequest('/cart', { method: 'DELETE' }),
  applyCoupon: (code) => apiRequest('/cart/coupon', { method: 'POST', body: JSON.stringify({ code }) }),
  removeCoupon: () => apiRequest('/cart/coupon', { method: 'DELETE' }),

  checkout: (shipping, payment) => apiRequest('/orders', { method: 'POST', body: JSON.stringify({ shipping, payment }) }),
  getOrders: () => apiRequest('/orders'),
  getOrder: (id) => apiRequest(`/orders/${id}`),
  cancelOrder: (id) => apiRequest(`/orders/${id}/cancel`, { method: 'POST' }),

  adminGetProducts: () => apiRequest('/admin/products'),
  adminCreateProduct: (body) => apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateProduct: (id, body) => apiRequest(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  adminGetOrders: () => apiRequest('/admin/orders'),
  adminUpdateOrderStatus: (id, status) => apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminGetUsers: () => apiRequest('/admin/users'),

  resetDemoData: () => apiRequest('/reset-demo-data', { method: 'POST' })
};

function showFieldErrors(errors) {
  document.querySelectorAll('.field-error').forEach(el => el.remove());
  document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  Object.entries(errors || {}).forEach(([field, message]) => {
    const input = document.querySelector(`[name="${field}"]`);
    if (!input) return;
    input.classList.add('invalid');
    const err = document.createElement('div');
    err.className = 'field-error';
    err.setAttribute('data-testid', `error-${field}`);
    err.textContent = message;
    input.closest('.field').appendChild(err);
  });
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

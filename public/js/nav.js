function renderNav() {
  const mount = document.getElementById('app-header');
  if (!mount) return;
  const user = Auth.getUser();

  mount.innerHTML = `
    <header class="site-header">
      <div class="container">
        <a href="index.html" class="logo" data-testid="logo-home-link">qa<span>://</span>shop</a>
        <form class="nav-search" id="nav-search-form">
          <input type="text" id="nav-search-input" name="q" placeholder="Search products..." data-testid="nav-search-input" autocomplete="off" />
          <button type="submit" data-testid="nav-search-btn">Search</button>
        </form>
        <nav class="nav-links">
          <button class="testid-toggle" id="testid-toggle" data-testid="testid-toggle-btn" title="Show data-testid attributes on the page">#ids</button>
          <a href="index.html" data-testid="nav-shop-link">Shop</a>
          ${user ? `<a href="orders.html" data-testid="nav-orders-link">Orders</a>` : ''}
          ${user && user.role === 'admin' ? `<a href="admin.html" data-testid="nav-admin-link">Admin</a>` : ''}
          <a href="cart.html" data-testid="nav-cart-link">Cart<span class="cart-count" id="nav-cart-count" data-testid="nav-cart-count" style="display:none">0</span></a>
          ${user
            ? `<button class="linklike" id="nav-logout-btn" data-testid="nav-logout-btn">Log out (${escapeHtml(user.username)})</button>`
            : `<a href="login.html" data-testid="nav-login-link">Log in</a>`
          }
        </nav>
      </div>
    </header>
  `;

  const form = document.getElementById('nav-search-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('nav-search-input').value.trim();
    window.location.href = `index.html${q ? '?q=' + encodeURIComponent(q) : ''}`;
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) document.getElementById('nav-search-input').value = params.get('q');

  const logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());

  const toggle = document.getElementById('testid-toggle');
  const active = localStorage.getItem('qa_shop_show_testids') === '1';
  if (active) { document.body.classList.add('show-testids'); toggle.classList.add('active'); }
  toggle.addEventListener('click', () => {
    const isOn = document.body.classList.toggle('show-testids');
    toggle.classList.toggle('active', isOn);
    localStorage.setItem('qa_shop_show_testids', isOn ? '1' : '0');
  });

  refreshCartCount();
}

async function refreshCartCount() {
  const badge = document.getElementById('nav-cart-count');
  if (!badge) return;
  if (!Auth.isLoggedIn()) { badge.style.display = 'none'; return; }
  const { ok, data } = await Api.getCart();
  if (ok && data.cart) {
    const count = data.cart.itemCount || 0;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', renderNav);

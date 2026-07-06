document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const banner = document.getElementById('login-banner');
  banner.innerHTML = '';
  showFieldErrors({});

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const submitBtn = document.getElementById('login-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in…';

  const { ok, status, data } = await Api.login({ username, password });

  submitBtn.disabled = false;
  submitBtn.textContent = 'Log in';

  if (ok) {
    Auth.setToken(data.token);
    Auth.setUser(data.user);
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get('next') || 'index.html';
    return;
  }

  if (data.errors) {
    showFieldErrors(data.errors);
    return;
  }

  if (status === 423) {
    banner.innerHTML = `<div class="banner banner-lock" data-testid="login-locked-banner">${escapeHtml(data.error)}</div>`;
  } else {
    banner.innerHTML = `<div class="banner banner-error" data-testid="login-error-banner">${escapeHtml(data.error || 'Login failed')}</div>`;
  }
});

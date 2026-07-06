document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const banner = document.getElementById('register-banner');
  banner.innerHTML = '';
  showFieldErrors({});

  const body = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value,
    acceptTerms: document.getElementById('acceptTerms').checked
  };

  const submitBtn = document.getElementById('register-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account…';

  const { ok, data } = await Api.register(body);

  submitBtn.disabled = false;
  submitBtn.textContent = 'Create account';

  if (ok) {
    Auth.setToken(data.token);
    Auth.setUser(data.user);
    window.location.href = 'index.html';
    return;
  }

  if (data.errors) {
    showFieldErrors(data.errors);
  } else {
    banner.innerHTML = `<div class="banner banner-error" data-testid="register-error-banner">${escapeHtml(data.error || 'Registration failed')}</div>`;
  }
});

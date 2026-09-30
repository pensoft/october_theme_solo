// Show/hide password
  (function () {
    const t = document.getElementById('toggle-pwd');
    const p = document.getElementById('password');
    if (!t || !p) return;
    t.addEventListener('click', () => {
      const isPwd = p.type === 'password';
      p.type = isPwd ? 'text' : 'password';
      t.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
    });
  })();
  // Prevent placeholder form submit
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit');
    btn.innerHTML = 'Signing in…';
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.innerHTML = 'Demo only — wire to your auth provider';
      btn.style.background = 'var(--soil)';
    }, 700);
  });

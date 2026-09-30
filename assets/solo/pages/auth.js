/* SOLO — auth pages: show/hide password (adapted from login.inline0.js).
   The design's placeholder submit handler is intentionally dropped; forms
   submit through the October AJAX framework (data-request). */
(function () {
  document.querySelectorAll('.toggle-pwd[data-target]').forEach(function (btn) {
    var input = document.getElementById(btn.getAttribute('data-target'));
    if (!input) return;
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
    });
  });
})();

/* SOLO — Resources / Library pages: server-side filter form auto-submit */
(function () {
  'use strict';
  function init() {
    document.querySelectorAll('[data-lib-form]').forEach(function (form) {
      form.querySelectorAll('[data-lib-auto]').forEach(function (sel) {
        sel.addEventListener('change', function () {
          // Changing a filter starts again from the first page
          if (form.requestSubmit) form.requestSubmit(); else form.submit();
        });
      });
      // Drop empty/default params so URLs stay short (?type=0&search=… links keep working)
      form.addEventListener('submit', function () {
        form.querySelectorAll('select, input').forEach(function (el) {
          if (!el.name) return;
          if ((el.name === 'year' && el.value === 'all') || (el.name === 'search' && !el.value.trim())) {
            el.disabled = true;
          }
        });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

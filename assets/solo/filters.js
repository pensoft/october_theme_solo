/* SOLO — shared dropdown filters (Target audience / Topic)

   Owns a `.f-hide` class only, so it can coexist with any page-specific
   filter (e.g. the promo category buttons, which own `.promo-hide`).
   Regions opt in with [data-filters]; items carry data-audience / data-topic. */

(function () {
  'use strict';

  function initRegion(root) {
    var selects = Array.prototype.slice.call(root.querySelectorAll('[data-f]'));
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-fitem]'));
    var countEl = root.querySelector('[data-fcount]');
    var emptyEl = root.querySelector('[data-fempty]');
    if (!selects.length || !items.length) return;

    var noun = root.getAttribute('data-f-noun') || 'item';

    function apply() {
      var shown = 0;
      items.forEach(function (item) {
        var ok = selects.every(function (sel) {
          var want = sel.value;
          if (!want || want === 'all') return true;
          var have = item.getAttribute('data-' + sel.getAttribute('data-f')) || '';
          // Items may belong to several audiences/topics.
          return have.split(/\s+/).indexOf(want) !== -1;
        });
        item.classList.toggle('f-hide', !ok);
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown + ' ' + noun + (shown === 1 ? '' : 's');
      if (emptyEl) emptyEl.hidden = shown !== 0;
      root.dispatchEvent(new CustomEvent('filters:change', { bubbles: true }));
    }

    selects.forEach(function (s) { s.addEventListener('change', apply); });
    apply();
  }

  function init() {
    Array.prototype.slice.call(document.querySelectorAll('[data-filters]')).forEach(initRegion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

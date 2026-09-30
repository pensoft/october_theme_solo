/* SOLO — Resources: Impact Assessment Framework category drill-down
   CMS version: each category button carries data-iaf-group="<slug>" and the
   detail view holds one [data-iaf-grid="<slug>"] block per category. */

(function () {
  'use strict';

  function init() {
    var root = document.querySelector('[data-iaf]');
    if (!root) return;

    var catsView = root.querySelector('.iaf-cats-view');
    var detail = root.querySelector('.iaf-detail');
    if (!catsView || !detail) return;

    var cats = Array.prototype.slice.call(root.querySelectorAll('.iaf-cat'));
    var grids = Array.prototype.slice.call(detail.querySelectorAll('[data-iaf-grid]'));
    var titleEl = detail.querySelector('[data-iaf-title]');
    var icoEl = detail.querySelector('[data-iaf-ico]');
    var back = detail.querySelector('.iaf-back');
    var lastFocus = null;

    function openCat(btn) {
      lastFocus = btn;
      var slug = btn.getAttribute('data-iaf-group');
      if (titleEl) titleEl.textContent = btn.getAttribute('data-title') || '';
      var src = btn.querySelector('.iaf-cat-ico');
      if (icoEl && src) icoEl.innerHTML = src.innerHTML;
      grids.forEach(function (g) { g.hidden = g.getAttribute('data-iaf-grid') !== slug; });
      catsView.classList.add('hidden');
      detail.classList.add('active');
      if (back) back.focus();
    }

    function closeCat() {
      detail.classList.remove('active');
      catsView.classList.remove('hidden');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
    }

    cats.forEach(function (btn) {
      if (btn.tagName !== 'BUTTON') return;
      btn.addEventListener('click', function () { openCat(btn); });
    });
    if (back) back.addEventListener('click', closeCat);

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && detail.classList.contains('active')) closeCat();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* SOLO — News list: client-side pagination (12 items per page) */

(function () {
  'use strict';
  var PER_PAGE = 12;

  function init() {
    var grid = document.querySelector('[data-news-grid]');
    var pager = document.querySelector('[data-news-pager]');
    if (!grid || !pager) return;

    var all = Array.prototype.slice.call(grid.querySelectorAll('.news-list-card'));
    var cards = all;
    var pages = 1;
    var current = 1;

    // Dropdown filters own .f-hide; pagination pages whatever survives them.
    function resync() {
      cards = all.filter(function (c) { return !c.classList.contains('f-hide'); });
      pages = Math.max(1, Math.ceil(cards.length / PER_PAGE));
      all.forEach(function (c) { if (c.classList.contains('f-hide')) c.style.display = 'none'; });
      show(Math.min(current, pages));
      pager.hidden = pages <= 1;
    }

    function show(page) {
      current = Math.min(Math.max(1, page), pages);
      var from = (current - 1) * PER_PAGE;
      var to = from + PER_PAGE;
      cards.forEach(function (c, i) {
        c.style.display = (i >= from && i < to) ? '' : 'none';
      });
      render();
    }

    function render() {
      pager.innerHTML = '';

      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'nav-btn' + (current === 1 ? ' disabled' : '');
      prev.textContent = 'Prev';
      if (current === 1) prev.setAttribute('aria-disabled', 'true');
      else prev.addEventListener('click', function () { go(current - 1); });
      pager.appendChild(prev);

      for (var p = 1; p <= pages; p++) {
        if (p === current) {
          var cur = document.createElement('span');
          cur.className = 'current';
          cur.setAttribute('aria-current', 'page');
          cur.textContent = String(p);
          pager.appendChild(cur);
        } else {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = String(p);
          btn.setAttribute('aria-label', 'Go to page ' + p);
          (function (n) {
            btn.addEventListener('click', function () { go(n); });
          })(p);
          pager.appendChild(btn);
        }
      }

      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'nav-btn' + (current === pages ? ' disabled' : '');
      next.textContent = 'Next';
      if (current === pages) next.setAttribute('aria-disabled', 'true');
      else next.addEventListener('click', function () { go(current + 1); });
      pager.appendChild(next);
    }

    function go(page) {
      show(page);
      var top = grid.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }

    resync();
    document.addEventListener('filters:change', resync);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

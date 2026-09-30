/* SOLO — Think Tanks: logo tile drill-down
   Each tile ([data-tt-open="<id>"]) opens the matching .tt-detail#<id>.
   The id is mirrored in the URL hash so /think-tanks#<id> deep links work. */

(function () {
  'use strict';

  function init() {
    var root = document.querySelector('[data-tt]');
    if (!root) return;

    var listView = root.querySelector('.tt-list-view');
    var details = Array.prototype.slice.call(root.querySelectorAll('.tt-detail'));
    if (!listView || !details.length) return;

    var tiles = Array.prototype.slice.call(root.querySelectorAll('.tt-tile[data-tt-open]'));
    var lastFocus = null;

    function findDetail(id) {
      for (var i = 0; i < details.length; i++) if (details[i].id === id) return details[i];
      return null;
    }
    function tileFor(id) {
      for (var i = 0; i < tiles.length; i++) if (tiles[i].getAttribute('data-tt-open') === id) return tiles[i];
      return null;
    }
    function scrollToRoot() {
      var top = root.getBoundingClientRect().top + window.pageYOffset - 110;
      if (window.pageYOffset > top) window.scrollTo(0, Math.max(0, top));
    }

    function open(id, opts) {
      var d = findDetail(id);
      if (!d) return false;
      opts = opts || {};
      lastFocus = tileFor(id);
      details.forEach(function (x) { x.classList.toggle('active', x === d); });
      tiles.forEach(function (t) { t.setAttribute('aria-expanded', t.getAttribute('data-tt-open') === id ? 'true' : 'false'); });
      listView.classList.add('hidden');
      if (opts.updateHash !== false && window.history && history.replaceState) {
        history.replaceState(null, '', '#' + id);
      }
      scrollToRoot();
      var back = d.querySelector('.tt-back');
      if (back) back.focus({ preventScroll: true });
      return true;
    }

    function close() {
      details.forEach(function (x) { x.classList.remove('active'); });
      tiles.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
      listView.classList.remove('hidden');
      if (window.history && history.replaceState) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      scrollToRoot();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }

    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () { open(tile.getAttribute('data-tt-open')); });
    });
    details.forEach(function (d) {
      var back = d.querySelector('.tt-back');
      if (back) back.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      for (var i = 0; i < details.length; i++) {
        if (details[i].classList.contains('active')) { close(); return; }
      }
    });

    function fromHash() {
      var id = decodeURIComponent((window.location.hash || '').slice(1));
      if (id && findDetail(id)) open(id, { updateHash: false });
    }
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

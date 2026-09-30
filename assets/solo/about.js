/* SOLO — About: Work Package circles (tab-style, panel underneath) */

(function () {
  'use strict';

  function init() {
    var circles = Array.prototype.slice.call(document.querySelectorAll('.wp-circle'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.wp-panel'));
    if (!circles.length || !panels.length) return;

    function select(id) {
      circles.forEach(function (c) {
        var on = c.getAttribute('data-wp-trigger') === id;
        c.classList.toggle('active', on);
        c.setAttribute('aria-selected', on ? 'true' : 'false');
        c.setAttribute('tabindex', on ? '0' : '-1');
      });
      panels.forEach(function (p) {
        var on = p.getAttribute('data-wp-panel') === id;
        p.classList.toggle('active', on);
        if (on) { p.removeAttribute('hidden'); } else { p.setAttribute('hidden', ''); }
      });
    }

    circles.forEach(function (c, i) {
      c.addEventListener('click', function () {
        select(c.getAttribute('data-wp-trigger'));
      });
      c.addEventListener('keydown', function (ev) {
        var next = null;
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') next = circles[(i + 1) % circles.length];
        else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') next = circles[(i - 1 + circles.length) % circles.length];
        else if (ev.key === 'Home') next = circles[0];
        else if (ev.key === 'End') next = circles[circles.length - 1];
        if (!next) return;
        ev.preventDefault();
        select(next.getAttribute('data-wp-trigger'));
        next.focus();
      });
    });

    select(circles[0].getAttribute('data-wp-trigger'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

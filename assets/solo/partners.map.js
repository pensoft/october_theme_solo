/* ============================================================
   SOLO — Partners: interactive Europe map
   Real country geometry (world-atlas TopoJSON) projected with d3.
   Partner countries are highlighted; hover shows the country name
   and its consortium members.
   ============================================================ */

(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }

  // Keyed by ISO-3166 numeric (the TopoJSON feature id).
  var PARTNERS = {
    246: { code: 'FI', name: 'Finland', members: ['National Resources Institute Finland'] },
    276: { code: 'DE', name: 'Germany', members: ['University of Leipzig', 'Leibniz Centre for Agricultural Landscape Research'] },
     56: { code: 'BE', name: 'Belgium', members: ['Pesticide Action Network', 'Agroecology Europe', 'University of Antwerp'] },
    724: { code: 'ES', name: 'Spain', members: ['Leitat Technological Centre'] },
    528: { code: 'NL', name: 'Netherlands', members: ['Netherlands Institute of Ecology'] },
    100: { code: 'BG', name: 'Bulgaria', members: ['Pensoft Publishers'] },
    752: { code: 'SE', name: 'Sweden', members: ['Lund University'] },
    620: { code: 'PT', name: 'Portugal', members: ['University of Évora'] },
    348: { code: 'HU', name: 'Hungary', members: ['Institute of Advanced Studies Kőszeg'] },
    300: { code: 'GR', name: 'Greece', members: ['National Observatory of Athens'] },
    578: { code: 'NO', name: 'Norway', members: ['Norwegian University of Life Sciences'] }
  };

  // CMS data: the page prints {"DE": {"name": "Germany", "members": [...]}, ...}
  // in #partners-map-data; it replaces the static list above when present.
  var ISO_NUM = {
    AL: 8, AD: 20, AT: 40, BY: 112, BE: 56, BA: 70, BG: 100, HR: 191, CY: 196, CZ: 203,
    DK: 208, EE: 233, FI: 246, FR: 250, DE: 276, GR: 300, EL: 300, HU: 348, IS: 352, IE: 372,
    IT: 380, XK: 383, LV: 428, LI: 438, LT: 440, LU: 442, MT: 470, MD: 498, MC: 492, ME: 499,
    NL: 528, MK: 807, NO: 578, PL: 616, PT: 620, RO: 642, RU: 643, SM: 674, RS: 688, SK: 703,
    SI: 705, ES: 724, SE: 752, CH: 756, TR: 792, UA: 804, GB: 826, UK: 826
  };
  (function loadCmsData() {
    var el = document.getElementById('partners-map-data');
    if (!el) return;
    var data;
    try { data = JSON.parse(el.textContent || '{}'); } catch (e) { return; }
    if (!data || typeof data !== 'object') return;
    var next = {};
    Object.keys(data).forEach(function (code) {
      var num = ISO_NUM[String(code).toUpperCase()];
      var c = data[code] || {};
      if (!num) return;
      next[num] = { code: String(code).toUpperCase(), name: c.name || code, members: c.members || [] };
    });
    PARTNERS = next;
  })();

  var MAP_W = 640, MAP_H = 700;
  // MultiPoint corners: a hand-written polygon ring is subject to spherical
  // winding rules and d3 can read it as the whole sphere minus Europe.
  var EXTENT = {
    type: 'MultiPoint',
    coordinates: [[-11, 34], [30, 34], [30, 71], [-11, 71]]
  };

  function isoKey(v) { return String(parseInt(v, 10)); }

  function build() {
    var stage = $('.map-stage');
    var canvas = $('.map-canvas');
    if (!stage || !canvas) return;
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') {
      stage.classList.add('map-failed');
      return;
    }
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json')
      .then(function (r) { return r.json(); })
      .then(function (topo) { draw(topo, stage, canvas); })
      .catch(function () { stage.classList.add('map-failed'); });
  }

  function draw(topo, stage, canvas) {
    var feats = topojson.feature(topo, topo.objects.countries).features.filter(function (f) {
      try {
        var c = d3.geoCentroid(f);
        return c[0] > -32 && c[0] < 46 && c[1] > 33 && c[1] < 75;
      } catch (e) { return false; }
    });

    var projection = d3.geoMercator().fitExtent([[0, 0], [MAP_W, MAP_H]], EXTENT);
    projection.clipExtent([[0, 0], [MAP_W, MAP_H]]);
    var path = d3.geoPath(projection);

    var byIso = {};
    Object.keys(PARTNERS).forEach(function (k) { byIso[isoKey(k)] = PARTNERS[k]; });

    var tip = $('.map-tip', stage);
    var tName = $('.t-country', tip);
    var tMembers = $('.t-members', tip);

    function showTip(d, ev) {
      var p = byIso[isoKey(d.id)];
      if (!p) return;
      tName.textContent = p.name;
      tMembers.textContent = p.members.join(' · ');
      tip.classList.add('show');
      moveTip(ev);
    }
    function moveTip(ev) {
      var box = stage.getBoundingClientRect();
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = ev.clientX - box.left + 14;
      var y = ev.clientY - box.top + 14;
      if (x + tw > box.width - 8) x = ev.clientX - box.left - tw - 14;
      if (y + th > box.height - 8) y = ev.clientY - box.top - th - 14;
      tip.style.left = Math.max(8, x) + 'px';
      tip.style.top = Math.max(8, y) + 'px';
    }
    function hideTip() { tip.classList.remove('show'); }

    var svg = d3.select(canvas).append('svg')
      .attr('viewBox', '0 0 ' + MAP_W + ' ' + MAP_H)
      .attr('role', 'img')
      .attr('aria-label', 'Map of Europe with the SOLO consortium partner countries highlighted');

    svg.append('g').selectAll('path').data(feats).enter().append('path')
      .attr('d', path)
      .attr('class', function (d) { return 'land' + (byIso[isoKey(d.id)] ? ' is-partner' : ''); })
      .attr('data-code', function (d) {
        var p = byIso[isoKey(d.id)];
        return p ? p.code : null;
      })
      .attr('tabindex', function (d) { return byIso[isoKey(d.id)] ? 0 : null; })
      .attr('aria-label', function (d) {
        var p = byIso[isoKey(d.id)];
        return p ? p.name + ': ' + p.members.join(', ') : null;
      })
      .on('mouseenter', function (ev, d) { showTip(d, ev); })
      .on('mousemove', function (ev, d) { if (byIso[isoKey(d.id)]) moveTip(ev); })
      .on('mouseleave', hideTip)
      .on('focus', function (ev, d) {
        var p = byIso[isoKey(d.id)];
        if (!p) return;
        tName.textContent = p.name;
        tMembers.textContent = p.members.join(' · ');
        var b = this.getBoundingClientRect(), box = stage.getBoundingClientRect();
        tip.classList.add('show');
        tip.style.left = Math.max(8, Math.min(b.left - box.left, box.width - tip.offsetWidth - 8)) + 'px';
        tip.style.top = Math.max(8, b.bottom - box.top + 8) + 'px';
      })
      .on('blur', hideTip)
      .on('click', function (ev, d) {
        var p = byIso[isoKey(d.id)];
        if (p) jumpToCountry(p.code);
      })
      .on('keydown', function (ev, d) {
        if (ev.key !== 'Enter' && ev.key !== ' ') return;
        ev.preventDefault();
        var p = byIso[isoKey(d.id)];
        if (p) jumpToCountry(p.code);
      });
  }

  // Reveal the first card for a country without scrollIntoView.
  function jumpToCountry(code) {
    var card = document.querySelector('.partner-card[data-code="' + code + '"]');
    if (!card) return;
    var top = card.getBoundingClientRect().top + window.pageYOffset - 110;
    window.scrollTo({ top: top, behavior: 'smooth' });
    document.querySelectorAll('.partner-card.is-flash').forEach(function (c) {
      c.classList.remove('is-flash');
    });
    card.classList.add('is-flash');
    setTimeout(function () { card.classList.remove('is-flash'); }, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

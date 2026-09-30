/* SOLO — Home: animated Europe visual for the Regionalisation section.
   Renders real geography (same source as the Regionalisation page). */

(function () {
  'use strict';

  var W = 560, H = 620;

  // ISO-3166 numeric ids of the 12 SOLO countries (same list as the Regionalisation page)
  var SOLO_ISO = [56, 100, 246, 276, 300, 348, 380, 528, 578, 620, 724, 752];

  var EXTENT = {
    type: 'MultiPoint',
    coordinates: [[-11, 34], [32, 34], [32, 71], [-11, 71]]
  };

  function init() {
    var host = document.querySelector('[data-home-map]');
    if (!host) return;
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') {
      host.classList.add('is-fallback');
      return;
    }
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json')
      .then(function (r) { return r.json(); })
      .then(function (topo) { draw(host, topo); })
      .catch(function () { host.classList.add('is-fallback'); });
  }

  function draw(host, topo) {
    var feats = topojson.feature(topo, topo.objects.countries).features.filter(function (f) {
      try {
        var c = d3.geoCentroid(f);
        return c[0] > -28 && c[0] < 44 && c[1] > 32 && c[1] < 73;
      } catch (e) { return false; }
    });

    var projection = d3.geoMercator().fitExtent([[10, 10], [W - 10, H - 10]], EXTENT);
    var path = d3.geoPath(projection);

    var svg = d3.select(host).append('svg')
      .attr('viewBox', '0 0 ' + W + ' ' + H)
      .attr('role', 'img')
      .attr('aria-label', 'Map of Europe showing the twelve countries taking part in SOLO Soil Weeks and Regional Nodes');

    svg.append('g').attr('class', 'hm-land')
      .selectAll('path').data(feats).enter().append('path')
      .attr('d', path)
      .attr('class', function (d) {
        return SOLO_ISO.indexOf(parseInt(d.id, 10)) > -1 ? 'is-solo' : null;
      });

    host.classList.add('is-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

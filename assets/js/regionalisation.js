/* ============================================================
   SOLO — Regionalisation interactive map
   Dark-mode Europe map · pulsing pins on the 12 SOLO countries ·
   pin pop-up card · comparison panel (up to 4) · details modal.

   DATA: countries, sections (Soil week / Regional node) and events come
   from the Pensoft.Regionalisation plugin (Backend > Regionalisation),
   printed by the page as JSON in <script type="application/json" id="reg-data">.
   Blank cells are rendered as "—"; no values are inferred.
   ============================================================ */
(function () {
  'use strict';

  // Image base URL is supplied by the page (data-asset-base on .solo-reg) so the
  // theme path resolves correctly whatever the site root is.
  var ROOT_EL = document.querySelector('.solo-reg');
  var ASSET_BASE = ((ROOT_EL && ROOT_EL.getAttribute('data-asset-base')) || '').replace(/\/?$/, '/');

  var MAX_COMPARE = 4;

  var REGION_NAMES = {
    eastern: 'Eastern macro-region',
    northern: 'Northern macro-region',
    southern: 'Southern macro-region',
    western: 'Western macro-region'
  };
  // Kept in sync with the --m-* region tokens in regionalisation.page.css
  var REGION_COLORS = {
    eastern: '#F5873C',
    northern: '#7FC6EC',
    southern: '#FFC53D',
    western: '#92D26B'
  };

  var PARAMS = [
    { key: 'objective', label: 'Priority Mission Objective' },
    { key: 'kg', label: 'Nr of KG identified', num: true },
    { key: 'eventType', label: 'Event type' },
    { key: 'stakeholders', label: 'Typology of stakeholders' },
    { key: 'participants', label: 'Nr of participants', num: true },
    { key: 'date', label: 'Date of event', num: true }
  ];

  // Countries / sections / events from Pensoft.Regionalisation (see the page template).
  //   COUNTRIES[code] = { name, flag, iso, region, capital: [lng, lat] }
  //   DATA[code] = { sections: [{ name, columns: { <param key>: [one value per event] }, chart }] }
  var COUNTRIES = {};
  var ORDER = [];
  var DATA = {};
  (function loadData() {
    var el = document.getElementById('reg-data');
    var raw = null;
    try { raw = el ? JSON.parse(el.textContent || 'null') : null; } catch (e) { raw = null; }
    if (!raw) return;
    if (raw.regions) {
      Object.keys(raw.regions).forEach(function (key) {
        REGION_NAMES[key] = raw.regions[key].name;
        REGION_COLORS[key] = raw.regions[key].color;
      });
    }
    (raw.countries || []).forEach(function (c) {
      if (!c.code || !REGION_NAMES[c.region]) return;
      COUNTRIES[c.code] = {
        name: c.name,
        // Uploaded flag, else the theme flag for the ISO code
        flag: c.flag || (ASSET_BASE + 'flags/' + c.code + '.png'),
        iso: c.iso,
        region: c.region,
        capital: c.capital
      };
      ORDER.push(c.code);
      DATA[c.code] = { sections: c.sections || [] };
    });
  })();

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // Flag image, sized by the CSS class it is given.
  function flagImg(code, cls) {
    var c = COUNTRIES[code];
    return '<img class="flag-img ' + cls + '" src="' + c.flag + '" alt="" width="84" height="60" decoding="async" />';
  }
  // Zip a section's columns into rows; short columns yield blank cells.
  function rowsOf(section) {
    var cols = section.columns;
    var len = 0;
    PARAMS.forEach(function (p) { len = Math.max(len, (cols[p.key] || []).length); });
    var rows = [];
    for (var i = 0; i < len; i++) {
      var row = {};
      PARAMS.forEach(function (p) {
        var v = (cols[p.key] || [])[i];
        row[p.key] = (v == null || v === '') ? '' : v;
      });
      row.newsUrl = (cols.newsUrl || [])[i] || '';
      rows.push(row);
    }
    return rows;
  }

  var state = { basket: [], open: null, details: null };

  /* ============================================================
     MAP
     ============================================================ */
  var MAP_W = 720, MAP_H = 760;
  // Fit extent as a MultiPoint of corners: a hand-written Polygon ring is subject to
  // spherical winding rules and d3 can read it as the whole sphere minus Europe.
  var EUROPE_EXTENT = {
    type: 'MultiPoint',
    coordinates: [[-11, 35], [30, 35], [30, 69], [-11, 69]]
  };

  function buildMap() {
    var stage = $('.map-stage');
    var canvas = $('.map-canvas');
    if (!stage || !canvas) return;
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') {
      stage.classList.add('map-failed');
      return;
    }

    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json')
      .then(function (r) { return r.json(); })
      .then(function (topo) { drawMap(topo, stage, canvas); })
      .catch(function () { stage.classList.add('map-failed'); });
  }

  function drawMap(topo, stage, canvas) {
    var feats = topojson.feature(topo, topo.objects.countries).features.filter(function (f) {
      try {
        var c = d3.geoCentroid(f);
        return c[0] > -32 && c[0] < 46 && c[1] > 33 && c[1] < 75;
      } catch (e) { return false; }
    });

    // Full-bleed: fit the extent to the entire viewBox so land reaches every edge.
    var projection = d3.geoMercator()
      .fitExtent([[0, 0], [MAP_W, MAP_H]], EUROPE_EXTENT);
    projection.clipExtent([[0, 0], [MAP_W, MAP_H]]);
    var path = d3.geoPath(projection);

    var isoToCode = {};
    // world-atlas feature ids are zero-padded strings ('056'); normalise both sides.
    var isoKey = function (v) { return String(parseInt(v, 10)); };
    ORDER.forEach(function (c) { isoToCode[isoKey(COUNTRIES[c].iso)] = c; });

    var svg = d3.select(canvas).append('svg')
      .attr('viewBox', '0 0 ' + MAP_W + ' ' + MAP_H)
      .attr('role', 'img')
      .attr('aria-label', 'Map of Europe with the 12 SOLO Soil Week and Regional Node countries marked');

    // Land
    svg.append('g').selectAll('path').data(feats).enter().append('path')
      .attr('d', path)
      .attr('class', function (d) {
        var code = isoToCode[isoKey(d.id)];
        return 'land' + (code ? ' solo' : '');
      })
      .attr('data-code', function (d) { return isoToCode[isoKey(d.id)] || null; })
      .on('mousemove', function (ev, d) {
        var code = isoToCode[isoKey(d.id)];
        var name = code ? COUNTRIES[code].name : (d.properties && d.properties.name) || '';
        showTip(ev, name, code);
        if (code) d3.select(this).classed('hot', true);
      })
      .on('mouseleave', function () { hideTip(); d3.select(this).classed('hot', false); })
      .on('click', function (ev, d) {
        var code = isoToCode[isoKey(d.id)];
        if (code) openPop(code);
      });

    // Pins
    var pinLayer = svg.append('g').attr('class', 'pin-layer');
    ORDER.forEach(function (code) {
      var c = COUNTRIES[code];
      var xy = projection(c.capital);
      if (!xy) return;
      var color = REGION_COLORS[c.region];
      var g = pinLayer.append('g')
        .attr('class', 'pin')
        .attr('data-code', code)
        .attr('transform', 'translate(' + xy[0] + ',' + xy[1] + ')')
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', c.name + ' — ' + REGION_NAMES[c.region]);
      g.append('circle').attr('class', 'halo').attr('r', 7).attr('fill', color);
      g.append('circle').attr('class', 'halo2').attr('r', 7).attr('fill', color);
      g.append('circle').attr('class', 'dot').attr('r', 6).attr('fill', color);
      g.on('mousemove', function (ev) { showTip(ev, c.name, code); })
        .on('mouseleave', hideTip)
        .on('click', function (ev) { ev.stopPropagation(); openPop(code); })
        .on('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openPop(code); }
        });
    });

    syncMap();
  }

  /* ---------- tooltip ---------- */
  function showTip(ev, name, code) {
    var tip = $('.map-tip');
    var canvas = $('.map-canvas');
    if (!tip || !canvas) return;
    var box = canvas.getBoundingClientRect();
    tip.style.left = (ev.clientX - box.left) + 'px';
    tip.style.top = (ev.clientY - box.top) + 'px';
    tip.innerHTML = esc(name) + (code ? '<span class="tip-region">' + esc(REGION_NAMES[COUNTRIES[code].region]) + '</span>' : '');
    tip.classList.add('show');
  }
  function hideTip() {
    var tip = $('.map-tip');
    if (tip) tip.classList.remove('show');
  }

  /* ---------- pin pop-up ---------- */
  function openPop(code) {
    var pop = $('.country-pop');
    var canvas = $('.map-canvas');
    var pin = canvas && canvas.querySelector('.pin[data-code="' + code + '"]');
    if (!pop || !canvas || !pin) return;

    var c = COUNTRIES[code];
    var picked = state.basket.indexOf(code) !== -1;
    var full = state.basket.length >= MAX_COMPARE && !picked;

    pop.innerHTML = [
      '<button class="pop-close" type="button" aria-label="Close">',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      '</button>',
      '<div class="pop-top">' + flagImg(code, 'flag-lg'),
      '<h4>' + esc(c.name) + '</h4></div>',
      '<span class="region-tag"><span class="swatch" style="background:' + REGION_COLORS[c.region] + '"></span>' + esc(REGION_NAMES[c.region]) + '</span>',
      '<div class="pop-actions">',
      '<button class="pop-btn primary" type="button" data-details="' + code + '">View Details</button>',
      '<button class="pop-btn ghost" type="button" data-toggle="' + code + '"' + (full ? ' disabled' : '') + '>' + (picked ? 'Remove' : 'Compare') + '</button>',
      '</div>'
    ].join('');

    // Position the card above the pin, clamped inside the canvas.
    var pinBox = pin.getBoundingClientRect();
    var box = canvas.getBoundingClientRect();
    var x = pinBox.left + pinBox.width / 2 - box.left;
    var y = pinBox.top + pinBox.height / 2 - box.top;
    var half = 134;
    x = Math.max(half + 6, Math.min(box.width - half - 6, x));
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    pop.classList.add('show');
    state.open = code;

    canvas.querySelectorAll('.pin').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-code') === code);
    });

    var closeBtn = pop.querySelector('.pop-close');
    if (closeBtn) closeBtn.focus();
  }

  function closePop() {
    var pop = $('.country-pop');
    if (pop) pop.classList.remove('show');
    state.open = null;
    var canvas = $('.map-canvas');
    if (canvas) canvas.querySelectorAll('.pin.active').forEach(function (p) { p.classList.remove('active'); });
  }

  /* ---------- comparison basket ---------- */
  function toggleCountry(code) {
    var i = state.basket.indexOf(code);
    if (i !== -1) state.basket.splice(i, 1);
    else if (state.basket.length < MAX_COMPARE) state.basket.push(code);
    syncAll();
  }

  function syncMap() {
    var canvas = $('.map-canvas');
    if (!canvas) return;
    canvas.querySelectorAll('.pin').forEach(function (p) {
      p.classList.toggle('picked', state.basket.indexOf(p.getAttribute('data-code')) !== -1);
    });
  }

  function syncPicker() {
    var picker = $('.cmp-picker');
    if (!picker) return;
    var full = state.basket.length >= MAX_COMPARE;
    picker.querySelectorAll('.cmp-chip').forEach(function (b) {
      var code = b.getAttribute('data-code');
      var on = state.basket.indexOf(code) !== -1;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.disabled = full && !on;
    });
  }

  function syncSelected() {
    var wrap = $('.cmp-selected');
    var count = $('.cmp-count');
    var hint = $('.cmp-hint');
    var compareBtn = $('.cmp-btn.primary');
    var clearBtn = $('.cmp-btn.ghost');
    if (count) count.textContent = state.basket.length + ' / ' + MAX_COMPARE + ' selected';
    if (hint) hint.hidden = state.basket.length > 0;
    if (compareBtn) compareBtn.disabled = state.basket.length < 2;
    if (clearBtn) clearBtn.disabled = state.basket.length === 0;
    if (!wrap) return;
    wrap.innerHTML = state.basket.map(function (code) {
      var c = COUNTRIES[code];
      return '<span class="sel-pill">' + flagImg(code, 'flag-sm') + esc(c.name) +
        '<button type="button" data-remove="' + code + '" aria-label="Remove ' + esc(c.name) + ' from comparison" title="Remove ' + esc(c.name) + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button></span>';
    }).join('');
  }

  function syncAll() {
    syncMap(); syncPicker(); syncSelected();
    var modal = $('.cmp-modal');
    if (modal && modal.classList.contains('open')) {
      if (state.basket.length < 2) closeCompare();
      else renderMatrix(false);
    }
    if (state.open) openPop(state.open);
  }

  /* ---------- comparison matrix ---------- */
  // Union of section names across the selected countries, in first-seen order.
  // Comparing a Soil-week-only country with one that also has a Regional node
  // must still line both sections up, so every column renders the same blocks.
  function sectionUnion(codes) {
    var names = [];
    codes.forEach(function (code) {
      var d = DATA[code];
      if (!d) return;
      d.sections.forEach(function (s) {
        if (names.indexOf(s.name) === -1) names.push(s.name);
      });
    });
    return names;
  }

  function sectionByName(code, name) {
    var d = DATA[code];
    if (!d) return null;
    for (var i = 0; i < d.sections.length; i++) {
      if (d.sections[i].name === name) return d.sections[i];
    }
    return null;
  }

  function cellValue(v, isNum) {
    var cls = v === '' ? 'val-empty' : (isNum ? 'val-num' : '');
    return '<span class="' + cls + '">' + esc(v === '' ? '—' : v) + '</span>';
  }

  function renderMatrix(open) {
    var modal = $('.cmp-modal');
    var wrap = $('.cmp-matrix-body');
    var head = $('.cmp-matrix-head');
    var sub = $('.cmp-result-sub');
    if (!modal || !wrap || !head) return;

    // Horizontal layout: countries are row headers on the left, each with one
    // row per event; the six parameters run across as columns.
    head.innerHTML = '<tr>' +
      '<th scope="col" class="col-country-head">Country</th>' +
      '<th scope="col" class="col-event">Event</th>' +
      PARAMS.map(function (p) {
        var cls = p.key === 'objective' ? ' col-obj' : (p.key === 'stakeholders' ? ' col-stake' : (p.key === 'eventType' ? ' col-etype' : (p.num ? ' col-num' : '')));
        return '<th scope="col" class="col-param' + cls + '">' + esc(p.label) + '</th>';
      }).join('') + '</tr>';

    var names = sectionUnion(state.basket);

    wrap.innerHTML = state.basket.map(function (code) {
      var c = COUNTRIES[code];
      var d = DATA[code];

      // Every country shows the same categories; each category expands to one
      // row per event so values align across columns by construction.
      var groups = names.map(function (name) {
        var section = d ? sectionByName(code, name) : null;
        var rows = section ? rowsOf(section) : [];
        return { name: name, section: section, rows: rows, span: rows.length };
      }).filter(function (g) { return g.span > 0; });
      if (!groups.length) return '';
      var total = groups.reduce(function (n, g) { return n + g.span; }, 0);

      var countryCell = '<th scope="row" class="col-country" rowspan="' + total + '">' +
        '<span class="ch-top">' + flagImg(code, 'flag-md') + esc(c.name) + '</span>' +
        '<span class="ch-region"><span class="swatch" style="background:' + REGION_COLORS[c.region] + '"></span>' + esc(REGION_NAMES[c.region]) + '</span>' +
        '</th>';

      var emitted = 0;
      return groups.map(function (g, gi) {
        var eventCell = '<td class="col-event" rowspan="' + g.span + '">' +
          '<span class="sec-name">' + esc(g.name) + '</span></td>';

        return g.rows.map(function (r, ri) {
          var cls = emitted === 0 ? 'country-start' : (ri === 0 ? 'cat-start' : '');
          var html = '<tr class="' + cls + '">' +
            (emitted === 0 ? countryCell : '') +
            (ri === 0 ? eventCell : '') +
            PARAMS.map(function (p) {
              var pc = p.key === 'objective' ? ' class="col-obj"' : (p.key === 'stakeholders' ? ' class="col-stake"' : (p.key === 'eventType' ? ' class="col-etype"' : (p.num ? ' class="col-num"' : '')));
              return '<td' + pc + '>' + cellValue(r[p.key], p.num) + '</td>';
            }).join('') + '</tr>';
          emitted += 1;
          return html;
        }).join('');
      }).join('');
    }).join('');

    if (sub) {
      sub.textContent = 'One row per event, in the original order of each country table. Blank source cells show as “—”.';
    }
    if (open) openCompare();
  }

  function openCompare() {
    var modal = $('.cmp-modal');
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('data-was-open', 'true');
    document.body.style.overflow = 'hidden';
    var close = $('.cmp-modal-close', modal);
    if (close) close.focus();
  }

  function closeCompare() {
    var modal = $('.cmp-modal');
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.removeAttribute('data-was-open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  /* ---------- details modal ---------- */
  var lastFocus = null;

  function detailTable(section) {
    var rows = rowsOf(section);
    var hasNews = rows.some(function (r) { return /^https?:\/\//i.test(r.newsUrl); });
    var head = '<tr>' + PARAMS.map(function (p) {
      var cls = p.key === 'objective' ? ' class="c-obj"' : (p.key === 'stakeholders' ? ' class="c-stake"' : '');
      return '<th scope="col"' + cls + '>' + esc(p.label) + '</th>';
    }).join('') + (hasNews ? '<th scope="col">News</th>' : '') + '</tr>';
    var body = rows.map(function (r) {
      return '<tr>' + PARAMS.map(function (p) {
        var v = r[p.key];
        var cls = [];
        if (p.num) cls.push('num');
        if (v === '') cls.push('empty');
        if (p.key === 'objective') cls.push('c-obj');
        if (p.key === 'stakeholders') cls.push('c-stake');
        return '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + esc(v === '' ? '—' : v) + '</td>';
      }).join('') + (hasNews ? '<td>' + (/^https?:\/\//i.test(r.newsUrl)
        ? '<a class="detail-news" href="' + esc(r.newsUrl) + '" target="_blank" rel="noopener">Read the news</a>'
        : '<span class="empty">—</span>') + '</td>' : '') + '</tr>';
    }).join('');
    return '<div class="detail-table-scroll"><table class="detail-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  }

  function renderDetails(code) {
    var modal = $('.reg-modal');
    if (!modal) return false;
    var c = COUNTRIES[code];
    var d = DATA[code];
    if (!c || !d) return false;
    if (!$('.modal-title', modal) || !$('.modal-body', modal)) return false;

    $('.modal-flag', modal).innerHTML = flagImg(code, 'flag-lg');
    $('.modal-title', modal).textContent = c.name;
    var reg = $('.modal-region', modal);
    reg.innerHTML = '<span class="swatch" style="background:' + REGION_COLORS[c.region] + '"></span>' + esc(REGION_NAMES[c.region]);

    var body = $('.modal-body', modal);
    body.innerHTML = d.sections.map(function (section) {
      return '<div class="detail-section"><h4>' + esc(section.name) + '</h4>' +
        detailTable(section) +
        (section.chart ? '<div class="detail-chart"><h5>' + esc(section.chart.title) + '</h5>' +
          '<figure><img src="' + section.chart.img + '" alt="' + esc(section.chart.title) + '" width="549" height="417" decoding="async" /></figure></div>' : '') +
        '</div>';
    }).join('');

    modal.classList.add('open');
    return true;
  }

  function openDetails(code) {
    lastFocus = document.activeElement;
    if (!renderDetails(code)) return;
    state.details = code;
    document.body.style.overflow = 'hidden';
    var close = $('.modal-close', $('.reg-modal'));
    if (close) close.focus();
  }

  function closeDetails() {
    var modal = $('.reg-modal');
    if (!modal) return;
    state.details = null;
    modal.classList.remove('open');
    modal.removeAttribute('data-was-open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  /* ---------- picker + legend ---------- */
  function buildPicker() {
    var picker = $('.cmp-picker');
    if (!picker) return;
    picker.innerHTML = ORDER.map(function (code) {
      var c = COUNTRIES[code];
      return '<button class="cmp-chip" type="button" data-code="' + code + '" aria-pressed="false">' +
        flagImg(code, 'flag-sm') + esc(c.name) + '</button>';
    }).join('');
  }

  function buildLegend() {
    var legend = $('.map-legend');
    if (!legend) return;
    legend.innerHTML = Object.keys(REGION_NAMES).map(function (key) {
      var label = REGION_NAMES[key].replace(' macro-region', '');
      return '<button type="button" data-region="' + key + '" aria-pressed="false">' +
        '<span class="swatch" style="background:' + REGION_COLORS[key] + '"></span>' + label + '</button>';
    }).join('');
  }

  function filterRegion(key) {
    var canvas = $('.map-canvas');
    var legend = $('.map-legend');
    if (!canvas || !legend) return;
    var btn = legend.querySelector('[data-region="' + key + '"]');
    var on = btn.getAttribute('aria-pressed') !== 'true';
    legend.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    if (on) btn.setAttribute('aria-pressed', 'true');
    canvas.querySelectorAll('.pin').forEach(function (p) {
      var code = p.getAttribute('data-code');
      p.classList.toggle('dim', on && COUNTRIES[code].region !== key);
    });
    canvas.querySelectorAll('.land.solo').forEach(function (l) {
      var code = l.getAttribute('data-code');
      l.classList.toggle('dim', on && code && COUNTRIES[code].region !== key);
    });
  }

  /* ---------- wire up ---------- */
  function init() {
    if (!$('.map-section') || window.__soloRegInit) return;
    window.__soloRegInit = true;
    buildPicker();
    buildLegend();
    syncAll();
    buildMap();

    document.addEventListener('click', function (ev) {
      var t = ev.target;
      var hit = function (sel) { return t.closest ? t.closest(sel) : null; };

      var chip = hit('.cmp-chip');
      if (chip) { toggleCountry(chip.getAttribute('data-code')); return; }

      var rm = hit('[data-remove]');
      if (rm) { toggleCountry(rm.getAttribute('data-remove')); return; }

      var tog = hit('[data-toggle]');
      if (tog) { toggleCountry(tog.getAttribute('data-toggle')); return; }

      var det = hit('[data-details]');
      if (det) { closePop(); openDetails(det.getAttribute('data-details')); return; }

      if (hit('.pop-close')) { closePop(); return; }

      var legendBtn = hit('.map-legend button');
      if (legendBtn) { filterRegion(legendBtn.getAttribute('data-region')); return; }

      var cmpBtn = hit('.cmp-btn.primary');
      if (cmpBtn && !cmpBtn.disabled) { closePop(); renderMatrix(true); return; }

      var clr = hit('.cmp-btn.ghost');
      if (clr && !clr.disabled) {
        state.basket = [];
        closeCompare();
        closePop();
        syncAll();
        return;
      }

      if (hit('.cmp-modal-close') || t === $('.cmp-modal')) { closeCompare(); return; }

      if (hit('.modal-close') || t === $('.reg-modal')) { closeDetails(); return; }

      // Click outside the pop-up closes it (pins and SOLO territories open it instead)
      if (state.open && !hit('.country-pop') && !hit('.pin') && !hit('.land.solo')) closePop();
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      var modal = $('.reg-modal');
      if (modal && modal.classList.contains('open')) { closeDetails(); return; }
      var cmp = $('.cmp-modal');
      if (cmp && cmp.classList.contains('open')) { closeCompare(); return; }
      if (state.open) closePop();
    });

    window.addEventListener('resize', function () {
      if (state.open) closePop();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

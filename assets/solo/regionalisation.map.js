/* ============================================================
   SOLO — Regionalisation interactive map
   Dark-mode Europe map · pulsing pins on the 12 SOLO countries ·
   pin pop-up card · comparison panel (up to 4) · details modal.

   DATA INTEGRITY: every value below is reproduced verbatim from the
   supplied country tables. Columns with fewer entries than the longest
   column are left blank (rendered as "—") — no values are inferred,
   averaged or invented. Countries without supplied tables use the
   supplied template placeholders.
   ============================================================ */
(function () {
  'use strict';

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

  // iso = ISO-3166 numeric (TopoJSON id) · capital = real [lng, lat]
  var COUNTRIES = {
    BE: { name: 'Belgium', flag: 'assets/flags/BE.png', iso: 56, region: 'western', capital: [4.35, 50.85] },
    BG: { name: 'Bulgaria', flag: 'assets/flags/BG.png', iso: 100, region: 'eastern', capital: [23.32, 42.70] },
    FI: { name: 'Finland', flag: 'assets/flags/FI.png', iso: 246, region: 'northern', capital: [24.94, 60.17] },
    DE: { name: 'Germany', flag: 'assets/flags/DE.png', iso: 276, region: 'western', capital: [13.40, 52.52] },
    GR: { name: 'Greece', flag: 'assets/flags/GR.png', iso: 300, region: 'southern', capital: [23.73, 37.98] },
    HU: { name: 'Hungary', flag: 'assets/flags/HU.png', iso: 348, region: 'eastern', capital: [19.04, 47.50] },
    IT: { name: 'Italy', flag: 'assets/flags/IT.png', iso: 380, region: 'southern', capital: [12.50, 41.90] },
    NL: { name: 'Netherlands', flag: 'assets/flags/NL.png', iso: 528, region: 'western', capital: [4.90, 52.37] },
    NO: { name: 'Norway', flag: 'assets/flags/NO.png', iso: 578, region: 'northern', capital: [10.75, 59.91] },
    PT: { name: 'Portugal', flag: 'assets/flags/PT.png', iso: 620, region: 'southern', capital: [-9.14, 38.72] },
    ES: { name: 'Spain', flag: 'assets/flags/ES.png', iso: 724, region: 'southern', capital: [-3.70, 40.42] },
    SE: { name: 'Sweden', flag: 'assets/flags/SE.png', iso: 752, region: 'northern', capital: [18.07, 59.33] }
  };
  var ORDER = ['BE', 'BG', 'FI', 'DE', 'GR', 'HU', 'IT', 'NL', 'NO', 'PT', 'ES', 'SE'];

  var PARAMS = [
    { key: 'objective', label: 'Priority Mission Objective' },
    { key: 'kg', label: 'Nr of KG identified', num: true },
    { key: 'eventType', label: 'Event type' },
    { key: 'stakeholders', label: 'Typology of stakeholders' },
    { key: 'participants', label: 'Nr of participants', num: true },
    { key: 'date', label: 'Date of event', num: true }
  ];

  var CHART_SOIL = {
    title: 'Nr of KG allocated to each overarching theme during the soil week events',
    img: 'assets/chart-kg-themes-soil-week.png'
  };
  var CHART_NODE = {
    title: 'Nr of KG allocated to each overarching theme during the regional nodes events',
    img: 'assets/chart-kg-themes-regional-node.png'
  };

  // Template values for countries whose tables were not supplied.
  function templateSection(name) {
    return {
      name: name,
      template: true,
      columns: {
        objective: ['[Insert Priority Mission Objective]'],
        kg: ['0'],
        eventType: ['[Insert Event Type]'],
        stakeholders: ['[Insert Typology of Stakeholders]'],
        participants: ['0'],
        date: ['[DD/MM/YYYY]']
      }
    };
  }

  var GR_STAKE = 'Scientists - Soil/Agronomy and Forestry/Environment, Geology and Biodiversity, Practitioners - Spatial planners, Practitioners and Sector organisation - Agriculture, Industry - Agri-food companies, Administration - Economy';
  var HU_NODE_OBJ = 'Pollution and restoration, Land degradation and desertification, Nature conservation of soil biodiversity';

  var DATA = {
    BE: {
      sections: [{
        name: 'Soil week',
        columns: {
          objective: [
            'Reduce EU Footprint on Soils, Increase Soil Literacy',
            'Reduce EU Footprint on Soils, Conserve and Increase Soil Carbon Organic Stocks',
            'Stop Soil Sealing, Enhance Soil Biodiversity, Increase Soil Literacy'
          ],
          kg: ['2', '3', '3'],
          eventType: ['Workshop', 'Forum', 'Field visit'],
          stakeholders: [
            'Policy makers and administration - Focus land use/Environment, Practitioners and Sector organisations - Focus land use/Environment, Practitioners - Advisory services/Spatial planners, Scientists - Soil/Environment and Biodiversity, Civil society',
            'Policy makers and administration - Focus land use/Environment/Other, Practitioners and Sector organisations - Focus land use/Environment/Other, Practitioners - Advisory services/Spatial planners, Industry - Agri-food companies, Scientists - Soil/Focus land use/Environment and Biodiversity, Civil society',
            'Policy makers and administration - Environment/Other, Practitioners and Sector organisations - Environment/Other, Practitioners - Spatial planners, Scientists - Soil/Environment and Biodiversity, Civil society',
            'Students, policy, academia, research institutions, private sector, civil society'
          ],
          participants: ['685', '175', '45', '75'],
          date: ['30 workshop year-round + 10/02/2023', '05/12/2024', '23/09/2025', '20-24/04/2026']
        },
        chart: CHART_SOIL
      }]
    },
    BG: {
      sections: [{
        name: 'Soil week',
        columns: {
          objective: [
            'Enhance Soil Biodiversity',
            'Reduce Soil Pollution, Prevent Erosion',
            'Stop Soil Sealing, Reduce EU Footprint on Soils'
          ],
          kg: ['6', '6', '6'],
          eventType: ['One-day conference', 'Scientific symposium', 'Webinar', 'Webinar'],
          stakeholders: [
            'Soil experts, Researchers, University lecturers, Farmers, NGOs, SME, media',
            'Researchers, Government officials, Industry representatives',
            'Academics, Researchers, Policy advisors, Technical experts',
            'Academics, Researchers, Ministry representatives, Technical Experts'
          ],
          participants: ['20', '20', '5', '10'],
          date: ['30/01/2024', '03/12/2024', '28/10/2025', '23/04/2026']
        }
      }]
    },
    FI: {
      sections: [{
        name: 'Soil week',
        columns: {
          objective: [
            'Improve Soil Structure, Enhance Soil Biodiversity',
            'Improve Soil Structure, Enhance Soil Biodiversity',
            'Improve Soil Structure, Enhance Soil Biodiversity'
          ],
          kg: ['1', '5', '6'],
          eventType: ['Workshop', 'Flash talk + poster in conference, survey', 'Seminar, survey', 'Seminar + panel discussion'],
          stakeholders: [
            'Policy makers and administration, Practitioners, Industry representatives, Scientists, Civil society',
            'Policy makers and administration, Practitioners, Industry representatives, Scientists, Civil society',
            'Civil society',
            'Policy and public administration, ministry representatives, scientists, NGOs, private sector'
          ],
          participants: ['25', '200', '~ 100', '28'],
          date: ['07/05/2024', '07-08/01/2025', '15/11/2025', '23/04/2026']
        }
      }]
    },
    DE: {
      sections: [{
        name: 'Soil week',
        columns: {
          objective: [
            'Increase Soil Literacy, Reduce Land Degradation',
            'Increase Soil Literacy',
            'Reduce Land Degradation, Soil Organic Carbon Stocks, Increase Soil Literacy'
          ],
          kg: ['4', '2', '2'],
          eventType: ['Workshop', 'Session in Conference', 'Field visit', 'Workshop'],
          stakeholders: [
            'Farmers, Civil society, Public sector, Science',
            'Researchers, Students, Scientists, Civil society',
            'Scientists, Farmers, Public sectors, Civil society',
            'Researchers and specialists'
          ],
          participants: ['29', '~ 16', '~ 150', '12'],
          date: ['25/10/2023', '18/09/2024', '04/09/2025', '23/04/2026']
        }
      }]
    },
    GR: {
      sections: [{
        name: 'Soil week',
        columns: {
          objective: [
            'Reduce Land Degradation, Prevent Erosion',
            'Reduce Land Degradation, Reduce Soil Pollution',
            'Conserve and Increase Soil Organic Carbon Stocks, Soil Sealing and urban soils'
          ],
          kg: ['6', '7', '4'],
          eventType: ['Conference', 'Webinar', 'Webinar', 'Webinar'],
          stakeholders: [GR_STAKE, GR_STAKE, GR_STAKE, 'Academia (professors, researchers, students), business'],
          participants: ['29', '30', '25', '18'],
          date: ['13/05/2024', '26/02/2025', '21/10/2025', '22/04/2026']
        }
      }]
    },
    HU: {
      sections: [
        {
          name: 'Soil week',
          columns: {
            objective: ['Reduce Soil Pollution', 'Conserve and Increase Soil Organic Carbon Stocks', 'Prevent Erosion'],
            kg: ['7', '10', '10'],
            eventType: ['Workshop', 'Hybrid workshop', 'Hybrid workshop'],
            stakeholders: [
              'Public sectors - Institutions on public health, Spatial planning, Water management, Project financing, and the secretariat of the Ombudsman for Future Generations, Science, Private sector and industry, Relevant practices',
              'Academics, Stakeholders, NGOs, Farmers',
              'Policy makers and administration, Practitioners, Industry, Scientists, Civil society'
            ],
            participants: ['25', '56', '46'],
            date: ['14/12/2023', '04/12/2024', '0/10/2025']
          },
          chart: CHART_SOIL
        },
        {
          name: 'Regional node',
          columns: {
            objective: [HU_NODE_OBJ, HU_NODE_OBJ, HU_NODE_OBJ, HU_NODE_OBJ],
            kg: ['0', '53', '0', '0'],
            eventType: ['Workshop', 'Workshop', 'Workshop', 'Workshop'],
            stakeholders: [
              'Practitioners and sector organization (focus land use), practitioners (advisory services), scientists (focus land use)',
              'Policy makers and administration (focus land use, environment, other), practitioners and sector organization (focus land use), practitioners (advisory services), scientists (soil, environment and biodiversity), other (civil society)',
              'Policy makers and administration (focus land use, environment, other), practitioners and sector organization (focus land use, other), practitioners (advisory services), industry (agri-food companies), scientists (soil, environment and biodiversity), other (civil society)'
            ],
            participants: ['5', '14', '17', '0'],
            date: ['10/09/2024', '06/03/2025', '23/09/2025', '23/09/2025']
          },
          chart: CHART_NODE
        }
      ]
    },
    IT: { sections: [templateSection('Soil week')] },
    NO: { sections: [templateSection('Soil week')] },
    ES: { sections: [templateSection('Soil week')] },
    // Regional Nodes named in the page text: Netherlands, Portugal, Sweden, Hungary
    NL: { sections: [templateSection('Soil week'), templateSection('Regional node')] },
    PT: { sections: [templateSection('Soil week'), templateSection('Regional node')] },
    SE: { sections: [templateSection('Soil week'), templateSection('Regional node')] }
  };

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
    var head = '<tr>' + PARAMS.map(function (p) {
      var cls = p.key === 'objective' ? ' class="c-obj"' : (p.key === 'stakeholders' ? ' class="c-stake"' : '');
      return '<th scope="col"' + cls + '>' + esc(p.label) + '</th>';
    }).join('') + '</tr>';
    var body = rows.map(function (r) {
      return '<tr>' + PARAMS.map(function (p) {
        var v = r[p.key];
        var cls = [];
        if (p.num) cls.push('num');
        if (v === '') cls.push('empty');
        if (p.key === 'objective') cls.push('c-obj');
        if (p.key === 'stakeholders') cls.push('c-stake');
        return '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + esc(v === '' ? '—' : v) + '</td>';
      }).join('') + '</tr>';
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
    if (!$('.map-section')) return;
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

    // The modals are filled imperatively. If the host re-renders the page it can
    // wipe the injected markup and the .open class, leaving an empty/invisible
    // modal — re-assert the current state whenever that happens.
    var restoring = false;
    var root = document.querySelector('.map-section') && document.body;
    if (root && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (restoring) return;
        var reg = $('.reg-modal');
        var cmp = $('.cmp-modal');
        var needDetails = state.details && reg &&
          (!reg.classList.contains('open') || !$('.modal-body', reg).innerHTML);
        var needCompare = cmp && cmp.classList.contains('open') === false &&
          state.basket.length > 1 && cmp.getAttribute('data-was-open') === 'true';
        if (!needDetails && !needCompare) return;
        restoring = true;
        try {
          if (needDetails) { renderDetails(state.details); document.body.style.overflow = 'hidden'; }
          if (needCompare) { renderMatrix(true); }
        } finally {
          setTimeout(function () { restoring = false; }, 0);
        }
      });
      mo.observe(root, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

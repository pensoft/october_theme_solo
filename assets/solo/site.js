// SOLO site — shared interactions

(function () {
  // Mobile drawer
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.mobile-nav');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Mobile nav: collapsible groups (About + Partners)
  document.querySelectorAll('.mobile-nav .m-group').forEach(group => {
    const trig = group.querySelector('.m-trigger');
    if (!trig) return;
    trig.addEventListener('click', (e) => {
      e.preventDefault();
      group.classList.toggle('open');
    });
  });

  // Over-hero header: switch to solid state on scroll
  const overHero = document.querySelector('.site-header.over-hero');
  if (overHero) {
    const setScrolled = () => {
      overHero.classList.toggle('scrolled', window.scrollY > 24);
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  // Reveal on scroll (robust: works even where IntersectionObserver callbacks don't fire)
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    const reveal = el => {
      el.classList.add('in');
      // Lock in the visible end-state after the entrance animation. JS timers run
      // even in environments that freeze the CSS animation clock, so this guarantees
      // content is never left stuck at opacity:0 while preserving the fade elsewhere.
      setTimeout(() => { el.style.animation = 'none'; el.style.opacity = '1'; el.style.transform = 'none'; }, 900);
    };
    const vh = () => window.innerHeight || document.documentElement.clientHeight;
    const inView = el => { const r = el.getBoundingClientRect(); return r.top < vh() - 40 && r.bottom > 0; };
    const checkInView = () => reveals.forEach(el => { if (!el.classList.contains('in') && inView(el)) reveal(el); });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(el => io.observe(el));
    }
    // Fallbacks: reveal what's already visible, then anything scrolled into view.
    // Use setTimeout (rAF/IntersectionObserver can be frozen in some preview/capture contexts).
    setTimeout(checkInView, 30);
    setTimeout(checkInView, 400);
    window.addEventListener('scroll', checkInView, { passive: true });
    window.addEventListener('resize', checkInView);
  }

  // Work Package circles: click → show that WP's detail panel
  const wpButtons = document.querySelectorAll('[data-wp-trigger]');
  if (wpButtons.length) {
    const panels = document.querySelectorAll('[data-wp-panel]');
    const activate = (id) => {
      wpButtons.forEach(b => b.classList.toggle('active', b.dataset.wpTrigger === id));
      panels.forEach(p => p.classList.toggle('active', p.dataset.wpPanel === id));
    };
    wpButtons.forEach(b => {
      b.addEventListener('click', () => activate(b.dataset.wpTrigger));
    });
    const first = wpButtons[0]?.dataset.wpTrigger;
    if (first) activate(first);
  }

  // Tabs (Resources page). Supports deep-link via #tab-id
  const tablist = document.querySelector('[role="tablist"]');
  const tabs = tablist ? Array.from(tablist.querySelectorAll('[role="tab"][aria-controls]')) : [];
  // Only run the ARIA tab logic for real tablists (tabs bound to panels). The
  // promo-materials filter also uses role=tab but has no panels — handled separately below.
  if (tablist && tabs.length) {
    const selectTab = (tab) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('active', on);
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { selectTab(tab); history.replaceState(null, '', '#' + tab.id); });
      tab.addEventListener('keydown', (e) => {
        let ni = null;
        if (e.key === 'ArrowRight') ni = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') ni = (i - 1 + tabs.length) % tabs.length;
        if (ni !== null) { e.preventDefault(); tabs[ni].focus(); selectTab(tabs[ni]); }
      });
    });
    const hash = location.hash.replace('#', '');
    const initial = tabs.find(t => t.id === hash) ||
      tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    if (initial) selectTab(initial);
    // React to in-page hash navigation (e.g. Resources dropdown links)
    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#', '');
      const t = tabs.find(x => x.id === h);
      if (t) selectTab(t);
    });
  }

  // Authors: prepend author icon + truncation.
  //  ≤10 authors → show all;  >10 → show first 10 then "+ N more" to reveal the rest.
  const AUTHOR_ICON = '<svg class="author-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  document.querySelectorAll('[data-authors]').forEach(el => {
    const raw = (el.getAttribute('data-authors') || '').trim();
    if (!raw) return;
    const authors = raw.split(',').map(s => s.trim()).filter(Boolean);
    const LIMIT = 10;
    const render = (expanded) => {
      const truncated = authors.length > LIMIT && !expanded;
      const shown = truncated ? authors.slice(0, LIMIT) : authors;
      el.innerHTML = AUTHOR_ICON + '<span class="names">' + shown.join(', ') + '</span>';
      if (truncated) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'more';
        btn.textContent = '+ ' + (authors.length - LIMIT) + ' more';
        btn.addEventListener('click', () => render(true));
        el.appendChild(btn);
      }
    };
    render(false);
  });

  // Publications filtering (type + year + search)
  const pubRoot = document.querySelector('[data-pub-filter]');
  if (pubRoot) {
    const typeSel = pubRoot.querySelector('[data-filter="type"]');
    const audSel = pubRoot.querySelector('[data-f="audience"]');
    const yearSel = pubRoot.querySelector('[data-filter="year"]');
    const search = pubRoot.querySelector('[data-filter="search"]');
    const cards = Array.from(pubRoot.querySelectorAll('[data-pub]'));
    const countEl = pubRoot.querySelector('[data-count]');
    const emptyEl = pubRoot.querySelector('[data-empty]');
    const apply = () => {
      const t = typeSel ? typeSel.value : 'all';
      const y = yearSel ? yearSel.value : 'all';
      const q = search ? search.value.trim().toLowerCase() : '';
      const a = audSel ? audSel.value : 'all';
      let shown = 0;
      cards.forEach(c => {
        const okT = t === 'all' || c.dataset.type === t;
        const okY = y === 'all' || c.dataset.year === y;
        const okQ = !q || c.dataset.search.includes(q);
        const okA = a === 'all' || (c.dataset.audience || '').split(/\s+/).indexOf(a) !== -1;
        const vis = okT && okY && okQ && okA;
        c.style.display = vis ? '' : 'none';
        if (vis) shown++;
      });
      if (countEl) countEl.textContent = shown + (shown === 1 ? ' document' : ' documents');
      if (emptyEl) emptyEl.hidden = shown !== 0;
    };
    [typeSel, yearSel, audSel].forEach(s => s && s.addEventListener('change', apply));
    if (search) search.addEventListener('input', apply);
    apply();
  }

  // Event listing sort + year filter
  const evRoot = document.querySelector('[data-event-filter]');
  if (evRoot) {
    const sortSel = evRoot.querySelector('[data-ev="sort"]');
    const yearSel = evRoot.querySelector('[data-ev="year"]');
    const list = evRoot.querySelector('[data-ev-list]');
    const emptyEl = evRoot.querySelector('[data-empty]');
    const rows = Array.from(list.querySelectorAll('[data-ev-row]'));
    const apply = () => {
      const y = yearSel ? yearSel.value : 'all';
      let shown = 0;
      rows.forEach(r => {
        const vis = y === 'all' || r.dataset.year === y;
        r.style.display = vis ? '' : 'none';
        if (vis) shown++;
      });
      const dir = sortSel && sortSel.value === 'asc' ? 1 : -1;
      rows.slice().sort((a, b) => dir * (Number(a.dataset.ts) - Number(b.dataset.ts)))
        .forEach(r => list.appendChild(r));
      if (emptyEl) emptyEl.hidden = shown !== 0;
    };
    [sortSel, yearSel].forEach(s => s && s.addEventListener('change', apply));
    apply();
  }

  // Promo materials: category filter (buttons ↔ [data-cat] cards)
  const promoRoot = document.querySelector('[data-promo]');
  if (promoRoot) {
    const btns = Array.from(promoRoot.querySelectorAll('.promo-filter button'));
    const items = Array.from(promoRoot.querySelectorAll('[data-cat]'));
    const applyPromo = (cat) => {
      btns.forEach(b => {
        const on = b.dataset.filter === cat;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      items.forEach(it => {
        it.classList.toggle('promo-hide', cat !== 'all' && it.dataset.cat !== cat);
      });
    };
    btns.forEach(b => b.addEventListener('click', () => applyPromo(b.dataset.filter)));
    const initial = btns.find(b => b.classList.contains('active')) || btns[0];
    if (initial) applyPromo(initial.dataset.filter);
  }

  // Social share buttons (event details)
  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const net = btn.dataset.share;
      const url = encodeURIComponent(location.href);
      const text = encodeURIComponent(document.title);
      const map = {
        x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      };
      if (map[net]) window.open(map[net], '_blank', 'noopener,width=640,height=560');
    });
  });
})();

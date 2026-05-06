// =====================================================================
// Index of Cultivars — interactive script
// Reads embedded JSON data from #varieties-data, manages all UI state
// =====================================================================

(function() {
  // Read embedded data
  const dataEl = document.getElementById('varieties-data');
  if (!dataEl) { console.warn('No varieties data found'); return; }
  const ENTRIES = JSON.parse(dataEl.textContent);

  const COLOR_DOTS = {
    red: 'dot-red', pink: 'dot-pink', yellow: 'dot-yellow', orange: 'dot-orange',
    black: 'dot-black', chocolate: 'dot-chocolate', purple: 'dot-purple',
    green: 'dot-green', white: 'dot-white', bicolor: 'dot-bicolor',
    unspecified: 'dot-unspecified'
  };

  const MAX_COMPARE = 4;
  const activeFilters = { color: new Set(), cat: new Set(), shape: new Set(), size: new Set(), habit: new Set() };
  const compareSet = new Set();
  let searchQuery = '';
  let sortMode = 'name';
  let sortDir = 'asc';
  let verifiedOnly = false;

  // DOM refs
  const tbody = document.getElementById('table-body');
  const visibleCountEl = document.getElementById('visible-count');
  const resetBtn = document.getElementById('reset-btn');
  const emptyState = document.getElementById('empty-state');
  const tableEl = document.querySelector('.var-table');
  const alphaNavEl = document.getElementById('alpha-nav');
  const searchInput = document.getElementById('search-input');
  const compareDrawer = document.getElementById('compare-drawer');
  const compareChips = document.getElementById('compare-chips');
  const compareCount = document.getElementById('compare-count');
  const compareOpenBtn = document.getElementById('compare-open');
  const compareClearBtn = document.getElementById('compare-clear');
  const compareModal = document.getElementById('compare-modal');
  const compareCloseBtn = document.getElementById('compare-close-btn');
  const compareFooterCloseBtn = document.getElementById('compare-footer-close');
  const verifiedToggle = document.getElementById('verified-toggle');
  const verifiedCheckbox = document.getElementById('verified-checkbox');
  const emptyClearBtn = document.getElementById('empty-clear-btn');

  function entryMatches(entry) {
    for (const group of Object.keys(activeFilters)) {
      const active = activeFilters[group];
      if (active.size === 0) continue;
      let groupMatch = false;
      for (const value of active) {
        if (entry.tags.includes(`${group}:${value}`)) { groupMatch = true; break; }
      }
      if (!groupMatch) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const haystack = (entry.name_en + ' ' + entry.name_uk + ' ' + entry.id).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (verifiedOnly && !entry.has_canonical_en) return false;
    return true;
  }

  function sortEntries(arr) {
    const sorted = [...arr];
    if (sortMode === 'name') {
      sorted.sort((a, b) => a.name_en.localeCompare(b.name_en));
    } else if (sortMode === 'height') {
      sorted.sort((a, b) => {
        const av = a.h ?? -1, bv = b.h ?? -1;
        return sortDir === 'asc' ? av - bv : bv - av;
      });
    } else if (sortMode === 'weight') {
      sorted.sort((a, b) => {
        const av = a.w ?? -1, bv = b.w ?? -1;
        return sortDir === 'asc' ? av - bv : bv - av;
      });
    }
    return sorted;
  }

  function escapeHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, ch =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])
    );
  }

  function render() {
    const filtered = ENTRIES.filter(entryMatches);
    const sorted = sortEntries(filtered);

    let html = '';
    let currentLetter = null;
    for (const e of sorted) {
      if (sortMode === 'name') {
        const letter = (e.name_en[0] || '').toUpperCase();
        if (letter !== currentLetter) {
          currentLetter = letter;
          html += `<tr class="alpha-marker" id="letter-${letter}"><td colspan="9">${letter}</td></tr>`;
        }
      }
      const colorDots = (e.colors || []).slice(0, 2).map(c =>
        `<span class="swatch-dot ${COLOR_DOTS[c] || 'dot-unspecified'}" title="${c}"></span>`
      ).join('');
      const isChecked = compareSet.has(e.id);
      const canCheck = isChecked || compareSet.size < MAX_COMPARE;
      const verifiedBadge = e.has_canonical_en
        ? '<span class="verified-badge" title="Canonical English heirloom name verified">✓ verified</span>'
        : '';
      html += `
        <tr class="entry${isChecked ? ' checked' : ''}" data-entry-id="${e.id}">
          <td class="compare-cell"><input type="checkbox" class="compare-checkbox" data-entry-id="${e.id}" ${isChecked ? 'checked' : ''} ${!canCheck ? 'disabled' : ''}></td>
          <td class="var-id">${e.id}</td>
          <td class="var-name"><a href="/varieties/${e.slug}/">${escapeHTML(e.name_en)}${verifiedBadge}<span class="uk">${escapeHTML(e.name_uk)}</span></a></td>
          <td class="var-cat">${escapeHTML(e.cat_label)}</td>
          <td class="num-cell ${e.h == null ? 'empty' : ''}">${e.h ?? '—'}</td>
          <td class="num-cell ${e.w == null ? 'empty' : ''}">${e.w ?? '—'}</td>
          <td class="var-shape">${escapeHTML(e.shape || '—')}</td>
          <td><div class="var-color-mini">${colorDots}</div></td>
          <td class="var-arrow">→</td>
        </tr>`;
    }
    tbody.innerHTML = html;

    tbody.querySelectorAll('.compare-checkbox').forEach(cb => {
      cb.addEventListener('change', () => toggleCompare(cb.dataset.entryId));
    });

    visibleCountEl.textContent = sorted.length;
    if (sorted.length === 0) {
      tableEl.style.display = 'none';
      emptyState.classList.add('visible');
    } else {
      tableEl.style.display = '';
      emptyState.classList.remove('visible');
    }

    const totalActive = Object.values(activeFilters).reduce((s, set) => s + set.size, 0)
      + (searchQuery ? 1 : 0) + (verifiedOnly ? 1 : 0);
    resetBtn.classList.toggle('hidden', totalActive === 0);

    updateAlphaNav(sorted);
    updateAvailableFilters();
    updateSortHeaders();
    updateURL();
  }

  function updateAlphaNav(visibleEntries) {
    const presentLetters = new Set(visibleEntries.map(e => (e.name_en[0] || '').toUpperCase()));
    let html = '';
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      html += presentLetters.has(letter)
        ? `<a href="#letter-${letter}" class="alpha">${letter}</a>`
        : `<span class="alpha disabled">${letter}</span>`;
    }
    alphaNavEl.innerHTML = html;
  }

  function updateAvailableFilters() {
    const filterButtons = document.querySelectorAll('.filter[data-filter-group]');
    filterButtons.forEach(btn => {
      const g = btn.dataset.filterGroup;
      const v = btn.dataset.filterValue;
      if (activeFilters[g].has(v)) { btn.dataset.disabled = 'false'; return; }
      const sim = {};
      for (const k of Object.keys(activeFilters)) sim[k] = new Set(activeFilters[k]);
      sim[g].add(v);
      let any = false;
      for (const e of ENTRIES) {
        let match = true;
        for (const grp of Object.keys(sim)) {
          const a = sim[grp];
          if (a.size === 0) continue;
          let gm = false;
          for (const val of a) {
            if (e.tags.includes(`${grp}:${val}`)) { gm = true; break; }
          }
          if (!gm) { match = false; break; }
        }
        if (match
          && (!searchQuery || (e.name_en + ' ' + e.name_uk + ' ' + e.id).toLowerCase().includes(searchQuery.toLowerCase()))
          && (!verifiedOnly || e.has_canonical_en)
        ) {
          any = true; break;
        }
      }
      btn.dataset.disabled = any ? 'false' : 'true';
    });
  }

  function updateSortHeaders() {
    document.querySelectorAll('th.sortable').forEach(th => {
      const isActive = th.dataset.sort === sortMode;
      th.classList.toggle('sorted', isActive);
      const arrow = th.querySelector('.sort-arrow');
      if (arrow) arrow.textContent = isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕';
    });
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sort === sortMode);
    });
    verifiedToggle.classList.toggle('active', verifiedOnly);
  }

  function updateURL() {
    const params = new URLSearchParams();
    for (const [g, set] of Object.entries(activeFilters)) {
      if (set.size > 0) params.set(g, [...set].join(','));
    }
    if (searchQuery) params.set('q', searchQuery);
    if (sortMode !== 'name') params.set('sort', sortMode);
    if (verifiedOnly) params.set('verified', '1');
    if (compareSet.size > 0) params.set('compare', [...compareSet].join(','));
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    history.replaceState(null, '', newURL);
  }

  function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    for (const g of Object.keys(activeFilters)) {
      const v = params.get(g);
      if (v) v.split(',').forEach(val => activeFilters[g].add(val));
    }
    if (params.get('q')) searchQuery = params.get('q');
    if (params.get('sort')) sortMode = params.get('sort');
    if (params.get('verified') === '1') {
      verifiedOnly = true;
      verifiedCheckbox.checked = true;
    }
    if (params.get('compare')) {
      params.get('compare').split(',').forEach(id => {
        if (compareSet.size < MAX_COMPARE && ENTRIES.some(e => e.id === id)) {
          compareSet.add(id);
        }
      });
    }
    document.querySelectorAll('.filter[data-filter-group]').forEach(btn => {
      const g = btn.dataset.filterGroup;
      const v = btn.dataset.filterValue;
      if (activeFilters[g] && activeFilters[g].has(v)) btn.classList.add('active');
    });
    if (searchQuery) searchInput.value = searchQuery;
  }

  function clearAllFilters() {
    Object.values(activeFilters).forEach(s => s.clear());
    document.querySelectorAll('.filter.active').forEach(b => b.classList.remove('active'));
    searchQuery = '';
    searchInput.value = '';
    verifiedOnly = false;
    verifiedCheckbox.checked = false;
    render();
  }

  function toggleCompare(entryId) {
    if (compareSet.has(entryId)) {
      compareSet.delete(entryId);
    } else {
      if (compareSet.size >= MAX_COMPARE) return;
      compareSet.add(entryId);
    }
    renderDrawer();
    render();
  }

  function renderDrawer() {
    const count = compareSet.size;
    compareCount.textContent = count;
    compareOpenBtn.disabled = count < 2;

    if (count === 0) {
      compareDrawer.classList.remove('visible');
      return;
    }
    compareDrawer.classList.add('visible');

    let html = '';
    for (const id of compareSet) {
      const e = ENTRIES.find(x => x.id === id);
      if (!e) continue;
      html += `
        <span class="compare-chip">
          <span class="chip-id">${e.id}</span>
          <span>${escapeHTML(e.name_en)}</span>
          <button class="chip-remove" data-entry-id="${e.id}" title="Remove">✕</button>
        </span>`;
    }
    if (count < MAX_COMPARE) {
      html += `<span class="compare-chip-empty">${MAX_COMPARE - count} more available</span>`;
    }
    compareChips.innerHTML = html;

    compareChips.querySelectorAll('.chip-remove').forEach(btn => {
      btn.addEventListener('click', () => toggleCompare(btn.dataset.entryId));
    });
  }

  function clearCompare() {
    compareSet.clear();
    renderDrawer();
    render();
  }

  function openCompare() {
    if (compareSet.size < 2) return;
    const entries = [...compareSet].map(id => ENTRIES.find(e => e.id === id)).filter(Boolean);
    renderCompareModal(entries);
    compareModal.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeCompare() {
    compareModal.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function renderCompareModal(entries) {
    const subtitleEl = document.getElementById('compare-modal-subtitle');
    subtitleEl.textContent = `Comparing ${entries.length} cultivars · row highlights show distinguishing values`;

    const colgroup = document.getElementById('compare-colgroup');
    let cgHtml = '<col>';
    for (let i = 0; i < entries.length; i++) {
      cgHtml += `<col style="width: ${Math.floor(80 / entries.length)}%;">`;
    }
    colgroup.innerHTML = cgHtml;

    const thead = document.getElementById('compare-thead');
    let theadHtml = '<tr><th></th>';
    for (const e of entries) {
      const dominantColor = (e.colors && e.colors[0]) || 'unspecified';
      theadHtml += `
        <th>
          <div class="compare-cultivar-image col-${dominantColor}"></div>
          <div class="compare-cultivar-id">${e.id}</div>
          <div class="compare-cultivar-name"><a href="/varieties/${e.slug}/">${escapeHTML(e.name_en)}</a></div>
          <div class="compare-cultivar-uk">${escapeHTML(e.name_uk)}</div>
        </th>`;
    }
    theadHtml += '</tr>';
    thead.innerHTML = theadHtml;

    const tbody = document.getElementById('compare-tbody');
    const rows = [
      { label: 'Category', getter: e => e.cat_label, type: 'text' },
      { label: 'Plant habit', getter: e => habitLabel(e.h), type: 'text' },
      { label: 'Plant height', getter: e => e.h != null ? `${e.h}<span class="secondary">m</span>` : null, type: 'numeric' },
      { label: 'Fruit weight', getter: e => e.w != null ? `${e.w}<span class="secondary">g</span>` : null, type: 'numeric' },
      { label: 'Size class', getter: e => sizeClassLabel(e.w), type: 'text' },
      { label: 'Fruit form', getter: e => e.shape || null, type: 'text' },
      { label: 'Colour', getter: e => colorRender(e.colors), type: 'html' },
      { label: 'Notes', getter: e => e.note, type: 'text' },
    ];

    let bodyHtml = '';
    for (const row of rows) {
      const values = entries.map(row.getter);
      const allSame = values.every(v => v === values[0]);
      bodyHtml += '<tr>';
      bodyHtml += `<td class="compare-row-label">${row.label}</td>`;
      for (const v of values) {
        const isEmpty = v == null || v === '';
        const isHighlighted = !allSame && !isEmpty;
        const cellClass = `compare-cell-value ${row.type === 'numeric' ? 'numeric' : ''} ${isEmpty ? 'empty' : ''} ${isHighlighted ? 'highlight' : ''}`;
        bodyHtml += `<td><div class="${cellClass}">${isEmpty ? '—' : v}</div></td>`;
      }
      bodyHtml += '</tr>';
    }

    bodyHtml += '<tr class="compare-shop-row"><td class="compare-row-label">Order seeds</td>';
    for (const e of entries) {
      bodyHtml += `<td><a class="compare-shop-link" href="https://en.seed.ua/products/${e.slug}">en.seed.ua →</a></td>`;
    }
    bodyHtml += '</tr>';

    tbody.innerHTML = bodyHtml;
  }

  function habitLabel(h) {
    if (h == null) return null;
    if (h < 1.0) return 'Compact';
    if (h <= 1.2) return 'Standard';
    return 'Tall';
  }

  function sizeClassLabel(w) {
    if (w == null) return null;
    if (w < 100) return 'Cherry / plum';
    if (w < 400) return 'Medium';
    return 'Beefsteak';
  }

  function colorRender(colors) {
    if (!colors || colors.length === 0) return null;
    const dots = colors.map(c =>
      `<span class="swatch-dot ${COLOR_DOTS[c] || 'dot-unspecified'}" style="display:inline-block; vertical-align:middle; margin-right:4px;"></span>`
    ).join('');
    const labels = colors.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
    return `${dots}<span style="vertical-align:middle;">${labels}</span>`;
  }

  // === Event listeners ===

  document.querySelectorAll('.filter[data-filter-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const g = btn.dataset.filterGroup;
      const v = btn.dataset.filterValue;
      if (activeFilters[g].has(v)) {
        activeFilters[g].delete(v);
        btn.classList.remove('active');
      } else {
        activeFilters[g].add(v);
        btn.classList.add('active');
      }
      render();
    });
  });

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newSort = btn.dataset.sort;
      if (newSort === sortMode) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortMode = newSort; sortDir = 'asc'; }
      render();
    });
  });

  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const newSort = th.dataset.sort;
      if (newSort === sortMode) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortMode = newSort; sortDir = 'asc'; }
      render();
    });
  });

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      render();
    }, 150);
  });

  verifiedCheckbox.addEventListener('change', () => {
    verifiedOnly = verifiedCheckbox.checked;
    render();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape' && compareModal.classList.contains('visible')) {
      closeCompare();
    }
  });

  resetBtn.addEventListener('click', clearAllFilters);
  compareClearBtn.addEventListener('click', clearCompare);
  compareOpenBtn.addEventListener('click', openCompare);
  compareCloseBtn.addEventListener('click', closeCompare);
  compareFooterCloseBtn.addEventListener('click', closeCompare);
  emptyClearBtn.addEventListener('click', clearAllFilters);

  compareModal.addEventListener('click', (e) => {
    if (e.target === compareModal) closeCompare();
  });

  // Initialize
  loadFromURL();
  renderDrawer();
  render();
})();

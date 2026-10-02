/**
 * RECIPE: Category pill slider on the category page. See README.md in this folder.
 * Shows a horizontally scrollable row of "pill" links (e.g. sub-categories or
 * popular filters) above the product grid. A different set can be shown per
 * category URL. Pure CSS scroll-snap, so no slider library is needed.
 */
(function () {
  'use strict';

  /* ================================= CONFIG =================================
   * The only place to change values. Fill in everything marked [LIKE_THIS].
   * Positions: beforebegin = before the target, afterbegin = inside, at the start,
   *            beforeend = inside, at the end, afterend = after the target
   * ========================================================================= */
  const CONFIG = {
    testId: 'hh-exp-123',                           // [TEST_ID]
    debug: false,                                   // true = log to console. Or add ?hh_debug=1 to the URL
    selectors: {
      filterButton: '.filter-title strong'          // [SELECTOR] filter button to rename (null = don't rename)
    },
    insert: {
      pills: { target: '.products.wrapper', position: 'beforebegin' } // [SELECTOR] where the pills go
    },
    copy: {
      filterButton: 'Refine your selection',        // [COPY] new filter button text
      navLabel: 'Categories',                       // accessible name of the pill row
      prev: 'Previous',                             // accessible labels of the arrow buttons
      next: 'Next'
    },
    pillsByPath: {                                  // [CONFIG] URL path → pills
      '/category-a.html': [
        { label: 'Pill 1', href: '/category-a/sub-1.html' },
        { label: 'Pill 2', href: '/category-a/sub-2.html' }
      ],
      '/category-b.html': [
        { label: 'Pill 3', href: '/category-b/sub-3.html' }
      ]
    },
    settings: {
      scrollStep: 0.8,                              // arrow click scrolls this share of the visible width
      timeout: 10000                                // ms to wait for the insertion target
    }
  };

  /* ================================= DEBUG ================================== */
  const DEBUG = CONFIG.debug || new URLSearchParams(window.location.search).has('hh_debug');
  const LOG_STYLES = {
    intro: 'color: #fff; background: #0077b6; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
    tag: 'color: #000; background: #caf0f8; padding: 2px 5px; font-weight: bold;',
    text: 'color: inherit;'
  };
  function log(msg, ...args) {
    if (!DEBUG) return;
    console.log(`%cAB-TEST%c${CONFIG.testId}%c ${msg}`, LOG_STYLES.intro, LOG_STYLES.tag, LOG_STYLES.text, ...args);
  }

  /* ================================ HELPERS ================================= */
  const POSITIONS = ['beforebegin', 'afterbegin', 'beforeend', 'afterend'];

  function insertAt(el, where, root = document) {
    if (!POSITIONS.includes(where.position)) {
      log(`Invalid position "${where.position}". Use one of: ${POSITIONS.join(', ')}`);
      return null;
    }
    const target = root.querySelector(where.target);
    if (!target) {
      log('Insert target not found:', where.target);
      return null;
    }
    target.insertAdjacentElement(where.position, el);
    log(`Inserted ${where.position} ${where.target}`, el);
    return el;
  }

  function waitForElement(selector, root = document) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function poll() {
        const el = root.querySelector(selector);
        if (el) return resolve(el);
        if (Date.now() - start >= CONFIG.settings.timeout) return reject(new Error(`Not found: ${selector}`));
        setTimeout(poll, 50);
      })();
    });
  }

  /* =============================== VARIATION ================================ */
  const ID = `${CONFIG.testId}-pills`;

  function getPillsForPage() {
    const pills = CONFIG.pillsByPath[window.location.pathname];
    if (!pills) log('No pills configured for this path:', window.location.pathname);
    return pills ?? null;
  }

  function isAlreadyApplied() {
    return Boolean(document.getElementById(ID));
  }

  function addTestClass() {
    document.documentElement.classList.add(CONFIG.testId);
  }

  function buildPillList(track, pills) {
    pills.forEach((pill) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = `${ID}__pill`;
      a.href = pill.href;
      a.textContent = pill.label;
      li.insertAdjacentElement('beforeend', a);
      track.insertAdjacentElement('beforeend', li);
    });
  }

  function addArrowBehaviour(track, prev, next) {
    const scrollBy = (dir) => track.scrollBy({ left: dir * track.clientWidth * CONFIG.settings.scrollStep, behavior: 'smooth' });
    prev.addEventListener('click', () => scrollBy(-1));
    next.addEventListener('click', () => scrollBy(1));

    // Hide arrows when there is nothing to scroll in that direction
    function updateArrows() {
      prev.hidden = track.scrollLeft <= 0;
      next.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    }
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    requestAnimationFrame(updateArrows);
  }

  function buildSlider(pills) {
    const nav = document.createElement('nav');
    nav.id = ID;
    nav.className = ID;
    nav.setAttribute('aria-label', CONFIG.copy.navLabel);
    nav.innerHTML = `
      <button type="button" class="${ID}__arrow ${ID}__arrow--prev"></button>
      <ul class="${ID}__track"></ul>
      <button type="button" class="${ID}__arrow ${ID}__arrow--next"></button>`;

    const track = nav.querySelector(`.${ID}__track`);
    const prev = nav.querySelector(`.${ID}__arrow--prev`);
    const next = nav.querySelector(`.${ID}__arrow--next`);
    prev.setAttribute('aria-label', CONFIG.copy.prev);
    next.setAttribute('aria-label', CONFIG.copy.next);

    buildPillList(track, pills);
    addArrowBehaviour(track, prev, next);
    return nav;
  }

  function renameFilterButton() {
    if (!CONFIG.selectors.filterButton) return;
    const btn = document.querySelector(CONFIG.selectors.filterButton);
    if (!btn) {
      log('Filter button not found:', CONFIG.selectors.filterButton);
      return;
    }
    btn.textContent = CONFIG.copy.filterButton;
    log('Filter button renamed');
  }

  function init() {
    try {
      log('Variation started');
      const pills = getPillsForPage();
      if (!pills) return;
      if (isAlreadyApplied()) {
        log('Pills already present, skipping');
        return;
      }
      addTestClass();
      waitForElement(CONFIG.insert.pills.target)
        .then(() => {
          insertAt(buildSlider(pills), CONFIG.insert.pills);
          renameFilterButton();
        })
        .catch((err) => log(err.message));
    } catch (err) {
      log('Error', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

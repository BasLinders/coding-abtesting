/**
 * RECIPE: Grid switch on product listing pages. See README.md in this folder.
 * Adds buttons that switch the product grid between column counts (e.g. 1 or 2 on
 * mobile). The choice is remembered across pages. Does nothing if the site already
 * has its own grid switch. Survives AJAX updates of the listing (filters, sorting, paging).
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
      grid: '.products-grid .grid',                 // [SELECTOR] element with the column classes (e.g. grid-cols-2)
      existingSwitch: null                          // [SELECTOR] the site's own grid switch. If found, the test does nothing
    },
    insert: {
      // Every element matching `target` gets a switch (e.g. a desktop and a mobile toolbar)
      switch: { target: '[SELECTOR]', position: 'afterend' }  // [SELECTOR] e.g. the toolbar above the grid
    },
    observers: {
      listing: {
        enabled: true,                              // false = no re-insert after filtering, sorting or paging
        root: 'body',                               // [SELECTOR] container to watch, e.g. the listing column
        childList: true,                            // AJAX updates replace the toolbar and grid
        subtree: true,                              // also watch everything inside the root
        attributes: false,                          // attribute changes are not needed here
        attributeFilter: [],
        stopAfter: 0                                // stop after this many ms (0 = keep watching)
      }
    },
    copy: {
      groupLabel: 'Products per row'                // [COPY] accessible name of the button group
    },
    options: [                                      // one button per option, in this order
      {
        cols: 1,
        label: 'Show 1 column',                     // [COPY] accessible label of the button
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="18" height="18"/></svg>'
      },
      {
        cols: 2,
        label: 'Show 2 columns',                    // [COPY]
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>'
      }
    ],
    goals: {
      tool: 'convert',                              // convert | kameleoon | varify
      switchClick: null                             // [GOAL_ID] fired when the visitor switches (null = no goal)
    },
    settings: {
      defaultCols: 2,                               // columns before the visitor chooses (must be one of the options)
      maxWidth: 599,                                // only show and apply the switch up to this width (px). null = all widths
      storageKey: 'hh-exp-123-cols',                // where the choice is remembered (localStorage)
      reinsertDelay: 50                             // ms to wait after an AJAX update before re-inserting
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

  function observe(settings, callback) {
    if (!settings.enabled) {
      log('Observer disabled in CONFIG');
      return null;
    }
    const root = document.querySelector(settings.root);
    if (!root) {
      log('Observer root not found:', settings.root);
      return null;
    }
    const options = { childList: settings.childList, subtree: settings.subtree, attributes: settings.attributes };
    if (settings.attributes && settings.attributeFilter?.length) options.attributeFilter = settings.attributeFilter;
    if (!options.childList && !options.attributes) {
      log('Observer needs childList or attributes set to true');
      return null;
    }
    const observer = new MutationObserver((mutations) => {
      try {
        callback(mutations);
      } catch (err) {
        log('Error in observer', err);
      }
    });
    observer.observe(root, options);
    log(`Observer started on ${settings.root}`);
    if (settings.stopAfter > 0) {
      setTimeout(() => {
        observer.disconnect();
        log(`Observer on ${settings.root} stopped after ${settings.stopAfter} ms`);
      }, settings.stopAfter);
    }
    return observer;
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /* =============================== VARIATION ================================ */
  const ID = CONFIG.testId;
  const SWITCH_CLASS = `${ID}-switch`;
  const GRID_CLASS = `${ID}-grid`;
  const ACTIVE_CLASS = `${ID}-active`;           // on <html> when the screen is within maxWidth
  const COLS_PROPERTY = `--${ID}-cols`;          // read by variant.css
  const VALID_COLS = CONFIG.options.map((o) => String(o.cols));
  const switches = new WeakMap();                // toolbar → its switch, to re-insert removed switches
  const grids = new WeakSet();                   // grid elements that already have GRID_CLASS
  let observer = null;
  let disabled = false;                          // true once the site's own switch was found
  let toolbarsSeen = null;                       // only log found/missing when it changes

  function isAlreadyInitialised() {
    window.__hhExp = window.__hhExp || {};
    if (window.__hhExp[ID]) return true;
    window.__hhExp[ID] = true;
    return false;
  }

  function hasNativeSwitch() {
    const { existingSwitch } = CONFIG.selectors;
    return Boolean(existingSwitch && document.querySelector(existingSwitch));
  }

  // Undo everything when the site turns out to have its own switch (e.g. rendered later)
  function disable() {
    disabled = true;
    observer?.disconnect();
    document.querySelectorAll(`.${SWITCH_CLASS}`).forEach((el) => el.remove());
    document.documentElement.classList.remove(ID, ACTIVE_CLASS);
    log('The site has its own grid switch, test disabled:', CONFIG.selectors.existingSwitch);
  }

  function addTestClass() {
    document.documentElement.classList.add(ID);
  }

  // Switch and column override only apply within maxWidth; follows rotation and resizing
  function watchBreakpoint() {
    const { maxWidth } = CONFIG.settings;
    if (maxWidth === null) {
      document.documentElement.classList.add(ACTIVE_CLASS);
      return;
    }
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => {
      if (disabled) return;
      document.documentElement.classList.toggle(ACTIVE_CLASS, mql.matches);
      log(`Screen ${mql.matches ? 'within' : 'wider than'} ${maxWidth}px`);
    };
    update();
    mql.addEventListener('change', update);
  }

  function getStoredCols() {
    const fallback = String(CONFIG.settings.defaultCols);
    try {
      const stored = localStorage.getItem(CONFIG.settings.storageKey);
      if (stored === null) return fallback;
      if (VALID_COLS.includes(stored)) return stored;
      log('Ignoring unexpected stored value:', stored);
    } catch (err) {
      log('localStorage not available, using default', err);
    }
    return fallback;
  }

  function storeCols(cols) {
    try {
      localStorage.setItem(CONFIG.settings.storageKey, cols);
    } catch (err) {
      log('localStorage not available, choice not remembered', err);
    }
  }

  function getActiveCols() {
    return document.documentElement.style.getPropertyValue(COLS_PROPERTY).trim();
  }

  function applyCols(cols) {
    document.documentElement.style.setProperty(COLS_PROPERTY, cols);
    document.querySelectorAll(`.${SWITCH_CLASS} button[data-cols]`).forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.cols === cols));
    });
  }

  function buildSwitch() {
    const wrap = document.createElement('div');
    wrap.className = SWITCH_CLASS;
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', CONFIG.copy.groupLabel);
    CONFIG.options.forEach((option) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.cols = String(option.cols);
      btn.setAttribute('aria-label', option.label);
      btn.setAttribute('aria-pressed', String(String(option.cols) === getActiveCols()));
      btn.innerHTML = option.icon; // icon markup comes from CONFIG only
      wrap.insertAdjacentElement('beforeend', btn);
    });
    return wrap;
  }

  // Inserts a switch at every toolbar that doesn't have one (anymore)
  function addSwitches() {
    const { target, position } = CONFIG.insert.switch;
    if (!POSITIONS.includes(position)) {
      log(`Invalid position "${position}". Use one of: ${POSITIONS.join(', ')}`);
      return;
    }
    const toolbars = document.querySelectorAll(target);
    if (Boolean(toolbars.length) !== toolbarsSeen) {
      toolbarsSeen = Boolean(toolbars.length);
      log(toolbarsSeen ? `Toolbar found (${toolbars.length}x)` : `Toolbar not found: ${target}`);
    }
    let added = 0;
    toolbars.forEach((toolbar) => {
      if (switches.get(toolbar)?.isConnected) return;
      const el = buildSwitch();
      toolbar.insertAdjacentElement(position, el);
      switches.set(toolbar, el);
      added++;
    });
    if (added) log(`Switch inserted ${position} ${added} toolbar(s)`);
  }

  // Marks the grid(s) so variant.css can override the columns
  function tagGrids() {
    const found = document.querySelectorAll(CONFIG.selectors.grid);
    found.forEach((grid) => {
      if (grids.has(grid)) return;
      grids.add(grid);
      grid.classList.add(GRID_CLASS);
      log('Grid found', grid.className);
    });
    if (!found.length && toolbarsSeen) log('Grid not found, columns will not change:', CONFIG.selectors.grid);
  }

  function trackGoal(goalId) {
    if (!goalId) return;
    const { tool } = CONFIG.goals;
    if (tool === 'convert') {
      window._conv_q = window._conv_q || [];
      window._conv_q.push({ what: 'triggerConversion', params: { goalId: String(goalId) } });
    } else if (tool === 'kameleoon') {
      window.Kameleoon?.API?.Goals?.processConversion(goalId);
    } else if (tool === 'varify') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: goalId });
    } else {
      log(`Unknown goal tool "${tool}"`);
      return;
    }
    log(`Goal fired (${tool}):`, goalId);
  }

  // One delegated listener: keeps working when the switch is re-rendered
  function listenForClicks() {
    document.addEventListener('click', (event) => {
      try {
        const btn = event.target.closest?.(`.${SWITCH_CLASS} button[data-cols]`);
        if (!btn) return;
        event.preventDefault();
        event.stopPropagation(); // keep the site's toolbar handlers out of it
        const cols = btn.dataset.cols;
        if (cols === getActiveCols()) {
          log('Already active, ignored:', cols);
          return;
        }
        applyCols(cols);
        storeCols(cols);
        log(`Switched to ${cols} column(s)`);
        trackGoal(CONFIG.goals.switchClick);
      } catch (err) {
        log('Error in click handler', err);
      }
    }, true); // capture: runs before handlers that stop propagation
  }

  function refresh() {
    if (hasNativeSwitch()) {
      disable();
      return;
    }
    addSwitches();
    tagGrids();
  }

  function init() {
    try {
      log('Variation started');
      if (isAlreadyInitialised()) {
        log('Already initialised, skipping');
        return;
      }
      if (!VALID_COLS.includes(String(CONFIG.settings.defaultCols))) {
        log(`defaultCols ${CONFIG.settings.defaultCols} is not one of the options`);
        return;
      }
      if (hasNativeSwitch()) {
        log('The site has its own grid switch, not running:', CONFIG.selectors.existingSwitch);
        return;
      }
      addTestClass();
      watchBreakpoint();
      applyCols(getStoredCols());
      refresh();                                                            // toolbars and grid that exist now
      listenForClicks();
      observer = observe(CONFIG.observers.listing, debounce(refresh, CONFIG.settings.reinsertDelay)); // after AJAX updates
      log(`Active columns: ${getActiveCols()}`);
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

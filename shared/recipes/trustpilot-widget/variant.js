/**
 * RECIPE: Trustpilot widget. See README.md in this folder.
 * Loads the Trustpilot bootstrap script and inserts a TrustBox at a chosen place.
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
    insert: {
      widget: { target: '#payment-methods', position: 'afterend' } // [SELECTOR] where the widget goes
    },
    copy: {
      fallbackLink: 'Trustpilot'                    // link text shown until the widget has loaded
    },
    settings: {
      locale: 'en-GB',                              // [LOCALE] e.g. nl-NL, de-DE
      templateId: '[TEMPLATE_ID]',                  // from the Trustpilot business account
      businessUnitId: '[BUSINESS_UNIT_ID]',
      reviewUrl: 'https://www.trustpilot.com/review/[DOMAIN]',
      height: '20px',
      theme: 'light',                               // light | dark
      scriptUrl: 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
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
  const ID = `${CONFIG.testId}-trustpilot`;

  function isAlreadyApplied() {
    return Boolean(document.getElementById(ID));
  }

  function addTestClass() {
    document.documentElement.classList.add(CONFIG.testId);
  }

  function buildWidget() {
    const s = CONFIG.settings;
    const wrapper = document.createElement('div');
    wrapper.id = ID;
    wrapper.className = `${ID} trustpilot-widget`;
    Object.assign(wrapper.dataset, {
      locale: s.locale,
      templateId: s.templateId,
      businessunitId: s.businessUnitId,
      styleHeight: s.height,
      styleWidth: '100%',
      theme: s.theme
    });
    const link = document.createElement('a');
    link.href = s.reviewUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = CONFIG.copy.fallbackLink;
    wrapper.insertAdjacentElement('beforeend', link);
    return wrapper;
  }

  function loadTrustpilotScript() {
    const src = CONFIG.settings.scriptUrl;
    return new Promise((resolve) => {
      if (window.Trustpilot) return resolve();
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return existing.addEventListener('load', () => resolve(), { once: true });
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      document.head.insertAdjacentElement('beforeend', script);
      log('Loading Trustpilot script');
    });
  }

  // If the bootstrap script was already on the page, it won't scan for new widgets by itself
  function renderWidget(widget) {
    if (window.Trustpilot) {
      window.Trustpilot.loadFromElement(widget, true);
      log('Trustpilot widget rendered');
    } else {
      log('Trustpilot script did not load');
    }
  }

  function init() {
    try {
      log('Variation started');
      if (isAlreadyApplied()) {
        log('Widget already present, skipping');
        return;
      }
      addTestClass();
      waitForElement(CONFIG.insert.widget.target)
        .then(() => {
          const widget = insertAt(buildWidget(), CONFIG.insert.widget);
          if (!widget) return null;
          return loadTrustpilotScript().then(() => renderWidget(widget));
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

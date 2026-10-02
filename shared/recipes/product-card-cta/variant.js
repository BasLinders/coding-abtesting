/**
 * RECIPE: Add a CTA button to every product card. See README.md in this folder.
 * Handles cards that load later (infinite scroll, filters) and multi-language sites.
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
      card: '.product-card'                         // [SELECTOR] one product card
    },
    insert: {
      // target is relative to each card. Keep the CTA INSIDE the card's link,
      // so the card stays one link (no nested links, one link for screen readers).
      cta: { target: 'a[href]', position: 'beforeend' } // [SELECTOR]
    },
    observers: {
      cards: {
        enabled: true,                              // false = only cards that exist at the start get a CTA
        root: 'body',                               // [SELECTOR] container to watch, e.g. the product grid
        childList: true,                            // watch cards being added (infinite scroll, filters)
        subtree: true,                              // also watch everything inside the root
        attributes: false,                          // attribute changes are not needed here
        attributeFilter: [],
        stopAfter: 0                                // stop after this many ms (0 = keep watching)
      }
    },
    copy: {
      cta: {                                        // [COPY] per language, see fallbackLocale
        en: 'View this product',
        es: 'Ver este producto',
        de: 'Dieses Produkt ansehen',
        fr: 'Voir ce produit'
      },
      fallbackLocale: 'en'                          // used when the page language has no copy
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
      log('Insert target not found:', where.target, root);
      return null;
    }
    target.insertAdjacentElement(where.position, el);
    return el;
  }

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

  /* =============================== VARIATION ================================ */
  const CTA_CLASS = `${CONFIG.testId}-cta`;
  const handled = new WeakSet(); // cards that already have a CTA

  function addTestClass() {
    document.documentElement.classList.add(CONFIG.testId);
  }

  // Page language from <html lang>, falling back to the first URL path segment (/de/...)
  function getLocale() {
    const lang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    return lang || (window.location.pathname.split('/')[1] || '').slice(0, 2).toLowerCase();
  }

  function getCtaText() {
    const locale = getLocale();
    const text = CONFIG.copy.cta[locale] ?? CONFIG.copy.cta[CONFIG.copy.fallbackLocale];
    log(`Locale "${locale}", CTA text "${text}"`);
    return text;
  }

  function buildCta(text) {
    const cta = document.createElement('span');
    cta.className = CTA_CLASS;
    cta.textContent = text;
    cta.setAttribute('aria-hidden', 'true'); // the link already has the product name
    return cta;
  }

  function addCtas(text) {
    let added = 0;
    document.querySelectorAll(CONFIG.selectors.card).forEach((card) => {
      if (handled.has(card)) return;
      handled.add(card);
      if (card.querySelector(`.${CTA_CLASS}`)) return; // already has one (code ran twice)
      if (insertAt(buildCta(text), CONFIG.insert.cta, card)) added++;
    });
    if (added) log(`Added ${added} CTA(s)`);
  }

  function logMissingCards() {
    if (!document.querySelector(CONFIG.selectors.card)) log('No cards found yet:', CONFIG.selectors.card);
  }

  function init() {
    try {
      log('Variation started');
      addTestClass();
      const text = getCtaText();
      addCtas(text);                                         // cards that exist now
      logMissingCards();
      observe(CONFIG.observers.cards, () => addCtas(text));  // cards added later
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

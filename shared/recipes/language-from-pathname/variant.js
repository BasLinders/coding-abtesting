/**
 * RECIPE: Show copy in the visitor's language, based on the URL path. See README.md in this folder.
 * Reads the language from a path segment like /gb-en/ or /de-de/, picks the matching
 * copy from CONFIG.copy, and sets it on the configured elements. Elements rendered
 * later (or re-rendered) get the right copy too.
 */
(function () {
    'use strict';

    /* ================================= CONFIG =================================
     * The only place to change values. Fill in everything marked [LIKE_THIS].
     * ========================================================================= */
    const CONFIG = {
        testId: 'hh-exp-123',                               // [TEST_ID]
        debug: false,                                       // true = log to console. Or add ?hh_debug=1 to the URL
        selectors: {                                        // [SELECTOR] elements whose text changes. Names match CONFIG.copy
            cta: '[SELECTOR]',
            usp: '[SELECTOR]'
        },
        observers: {
            texts: {
                enabled: true,                              // false = only change elements that exist at the start
                root: 'body',                               // [SELECTOR] container to watch (smallest one that isn't replaced)
                childList: true,                            // watch elements being added or removed
                subtree: true,                              // also watch everything inside the root
                attributes: false,                          // attribute changes are not needed here
                attributeFilter: [],
                stopAfter: 0                                // stop after this many ms (0 = keep watching)
            }
        },
        copy: {                                             // [COPY] one block per language code from the URL
            'gb-en': { cta: 'Add to basket', usp: 'Free delivery over £50' },
            'us-en': { cta: 'Add to cart', usp: 'Free shipping over $60' },
            'de-de': { cta: 'In den Warenkorb', usp: 'Kostenloser Versand ab 50 €' },
            'fr-fr': { cta: 'Ajouter au panier', usp: 'Livraison gratuite dès 50 €' }
        },
        settings: {
            defaultLanguage: 'gb-en',                       // used when the URL has no (known) language code
            // Language code in the path: /gb-en/... or /gb-en at the end. Change only if the site uses another format.
            languagePattern: /\/([a-z]{2}-[a-z]{2})(?:\/|$)/i
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
    function addTestClass() {
        document.documentElement.classList.add(CONFIG.testId);
    }

    // '/gb-en/products/shoe' → 'gb-en'. Falls back to the default when the code is missing or unknown.
    function getCurrentLanguage() {
        const { languagePattern, defaultLanguage } = CONFIG.settings;
        const match = window.location.pathname.match(languagePattern);
        const lang = match ? match[1].toLowerCase() : defaultLanguage;
        if (!CONFIG.copy[lang]) {
            log(`No copy for "${lang}", using "${defaultLanguage}"`);
            return defaultLanguage;
        }
        return lang;
    }

    // Sets the copy on every matching element. Safe to run on every mutation:
    // it only writes when the text differs, so it can't loop and it also restores
    // text that the site re-rendered.
    function applyCopy(copy) {
        Object.entries(CONFIG.selectors).forEach(([name, selector]) => {
            const text = copy[name];
            if (typeof text !== 'string') return; // no copy for this element in this language: leave it unchanged
            document.querySelectorAll(selector).forEach((el) => {
                if (el.textContent.trim() === text) return;
                el.textContent = text;
                log(`Set "${name}" to "${text}"`, el);
            });
        });
    }

    function logMissingElements() {
        Object.entries(CONFIG.selectors).forEach(([name, selector]) => {
            if (!document.querySelector(selector)) log(`"${name}" not found (yet):`, selector);
        });
    }

    function init() {
        try {
            log('Variation started');
            addTestClass();
            const lang = getCurrentLanguage();
            const copy = CONFIG.copy[lang];
            log(`Language: ${lang}`);
            applyCopy(copy);                                        // elements that exist now
            logMissingElements();
            observe(CONFIG.observers.texts, () => applyCopy(copy)); // elements rendered later
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

/**
 * RECIPE: Totals summary above the checkout agreements. See README.md in this folder.
 * Shows subtotal (excl. tax) and grand total (incl. tax) right above the place-order
 * area, and keeps it in sync and in place when Knockout re-renders the payment step.
 */
(function () {
    'use strict';

    /* ================================= CONFIG =================================
     * The only place to change values. Fill in everything marked [LIKE_THIS].
     * Positions: beforebegin = before the target, afterbegin = inside, at the start,
     *            beforeend = inside, at the end, afterend = after the target
     * ========================================================================= */
    const CONFIG = {
        testId: 'hh-exp-123',                               // [TEST_ID]
        debug: false,                                       // true = log to console. Or add ?hh_debug=1 to the URL
        insert: {
            // One agreements block exists per payment method; a totals block goes next to each
            totals: { target: '[data-role^="checkout-agreements"]', position: 'beforebegin' } // [SELECTOR]
        },
        observers: {
            agreements: {
                enabled: true,                              // false = only agreements blocks that exist at the start
                root: 'body',                               // [SELECTOR] container to watch, e.g. '#checkout'
                childList: true,                            // Knockout adds/replaces blocks when switching payment method
                subtree: true,                              // also watch everything inside the root
                attributes: false,                          // attribute changes are not needed here
                attributeFilter: [],
                stopAfter: 0                                // stop after this many ms (0 = keep watching)
            }
        },
        copy: {
            subtotal: 'Subtotal excl. VAT',                 // [COPY]
            total: 'Total incl. VAT'                        // [COPY]
        },
        settings: {
            fallbackCurrency: 'EUR',                        // used if the checkout config has no currency
            timeout: 15000                                  // ms to wait for the checkout to load
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

    // Variant of insertAt() that takes the target element itself, because each
    // agreements block found by the observer gets its own totals block.
    function insertAtElement(el, target, position) {
        if (!POSITIONS.includes(position)) {
            log(`Invalid position "${position}". Use one of: ${POSITIONS.join(', ')}`);
            return null;
        }
        target.insertAdjacentElement(position, el);
        log(`Inserted ${position}`, target);
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
    const BLOCK = `${CONFIG.testId}-totals`;
    const handled = new WeakSet(); // agreements blocks that already have a totals block
    let latestTotals = null;

    function addTestClass() {
        document.documentElement.classList.add(CONFIG.testId);
    }

    function formatPrice(value) {
        const currency = window.checkoutConfig?.totalsData?.quote_currency_code || CONFIG.settings.fallbackCurrency;
        return new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency }).format(value);
    }

    // The 'grand_total' segment matches what the order summary sidebar shows
    function getValues(totals) {
        const segment = (code) => (totals.total_segments || []).find((s) => s.code === code);
        return {
            subtotal: totals.subtotal,
            total: segment('grand_total')?.value ?? totals.grand_total
        };
    }

    function renderBlock(block) {
        if (!latestTotals) return;
        const values = getValues(latestTotals);
        block.innerHTML = `
            <div class="${BLOCK}__row"><div class="${BLOCK}__label"></div><div class="${BLOCK}__value"></div></div>
            <div class="${BLOCK}__row"><div class="${BLOCK}__label"></div><div class="${BLOCK}__value"></div></div>`;
        const labels = block.querySelectorAll(`.${BLOCK}__label`);
        const amounts = block.querySelectorAll(`.${BLOCK}__value`);
        labels[0].textContent = CONFIG.copy.subtotal;
        amounts[0].textContent = formatPrice(values.subtotal);
        labels[1].textContent = CONFIG.copy.total;
        amounts[1].textContent = formatPrice(values.total);
    }

    function renderAllBlocks() {
        document.querySelectorAll(`.${BLOCK}`).forEach(renderBlock);
    }

    // Keep totals in sync (see magento/snippets/checkout-quote-totals.js)
    function subscribeToTotals() {
        const start = Date.now();
        (function poll() {
            if (typeof window.require === 'function' && window.checkoutConfig) {
                window.require(['Magento_Checkout/js/model/quote'], (quote) => {
                    latestTotals = quote.totals();
                    log('Totals loaded', latestTotals);
                    renderAllBlocks();
                    quote.totals.subscribe((totals) => {
                        latestTotals = totals;
                        log('Totals updated', totals);
                        renderAllBlocks();
                    });
                });
                return;
            }
            if (Date.now() - start < CONFIG.settings.timeout) {
                setTimeout(poll, 100);
                return;
            }
            log('Checkout model not found (no RequireJS/checkoutConfig). Third-party checkout?');
        })();
    }

    // Inserts a totals block next to every (re-)rendered agreements block (WeakSet pattern)
    function addTotalsBlocks() {
        const { target, position } = CONFIG.insert.totals;
        document.querySelectorAll(target).forEach((anchor) => {
            if (handled.has(anchor)) return;
            handled.add(anchor);
            if (anchor.previousElementSibling?.classList.contains(BLOCK)) return; // already there
            const block = document.createElement('div');
            block.className = BLOCK;
            if (insertAtElement(block, anchor, position)) renderBlock(block);
        });
    }

    function init() {
        try {
            log('Variation started');
            addTestClass();
            subscribeToTotals();
            addTotalsBlocks();                                         // blocks that exist now
            observe(CONFIG.observers.agreements, addTotalsBlocks);     // blocks Knockout renders later
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

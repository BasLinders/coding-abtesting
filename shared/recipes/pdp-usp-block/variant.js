/**
 * RECIPE: USP block on the product page. See README.md in this folder.
 * Reuses the site's existing USP list (e.g. from the header), keeps the chosen
 * items, adds new ones, and places the result near the add-to-cart button.
 */
(function () {
    'use strict';

    /* ================================= CONFIG =================================
     * The only place to change values. Fill in everything marked [LIKE_THIS].
     * Positions: beforebegin = before the target, afterbegin = inside, at the start,
     *            beforeend = inside, at the end, afterend = after the target
     * ========================================================================= */
    const CONFIG = {
        testId: 'hh-exp-123',                             // [TEST_ID]
        debug: false,                                     // true = log to console. Or add ?hh_debug=1 to the URL
        selectors: {
            source: '.header-usps ul'                     // [SELECTOR] existing USP list to copy (null = build from scratch)
            // Blocks the new list replaces are hidden in variant.css
        },
        insert: {
            usps: { target: '.product-add-form', position: 'afterend' } // [SELECTOR] where the USP block goes
        },
        copy: {
            extraItems: [                                 // [COPY] new USPs, added after the copied ones
                { text: 'Customers rate us 9.3', href: null },
                { text: 'Questions? Call [PHONE]', href: 'tel:[PHONE]' }
            ]
        },
        settings: {
            keep: [2, 4],                                 // 1-based positions of source items to keep (empty = keep all)
            timeout: 10000                                // ms to wait for the elements
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
    const ID = `${CONFIG.testId}-usps`;

    function isAlreadyApplied() {
        return Boolean(document.getElementById(ID));
    }

    // The class on <html> is what variant.css uses to hide the old USP blocks
    function addTestClass() {
        document.documentElement.classList.add(CONFIG.testId);
    }

    function waitForRequiredElements() {
        const waits = [waitForElement(CONFIG.insert.usps.target)];
        if (CONFIG.selectors.source) waits.push(waitForElement(CONFIG.selectors.source));
        return Promise.all(waits).then(([, source]) => source ?? null);
    }

    function copySourceItems(list, source) {
        const { keep } = CONFIG.settings;
        Array.from(source.children).forEach((li, i) => {
            if (keep.length && !keep.includes(i + 1)) return;
            const clone = li.cloneNode(true);
            clone.removeAttribute('id'); // avoid duplicate IDs
            clone.classList.add(`${ID}__item`);
            list.insertAdjacentElement('beforeend', clone);
        });
    }

    function addExtraItems(list) {
        CONFIG.copy.extraItems.forEach((item) => {
            const li = document.createElement('li');
            li.className = `${ID}__item ${ID}__item--new`;
            const inner = document.createElement(item.href ? 'a' : 'span');
            if (item.href) inner.href = item.href;
            inner.textContent = item.text;
            li.insertAdjacentElement('beforeend', inner);
            list.insertAdjacentElement('beforeend', li);
        });
    }

    function buildList(source) {
        const list = document.createElement('ul');
        list.id = ID;
        list.className = ID;
        if (source) copySourceItems(list, source);
        addExtraItems(list);
        return list;
    }

    function init() {
        try {
            log('Variation started');
            if (isAlreadyApplied()) {
                log('USP block already present, skipping');
                return;
            }
            addTestClass();
            waitForRequiredElements()
                .then((source) => insertAt(buildList(source), CONFIG.insert.usps))
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

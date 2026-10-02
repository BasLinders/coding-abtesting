/**
 * SNIPPET: Debug logging
 *
 * WHEN TO USE
 *   In EVERY test build. This is mandatory (see "Mandatory code structure" in
 *   _base-context.md). It gives styled console messages you can switch on and off
 *   without touching the rest of the code.
 *
 * HOW TO USE
 *   - CONFIG.testId names the test in every message.
 *   - Logging is on when CONFIG.debug is true, or when the URL contains ?hh_debug=1.
 *     Leave CONFIG.debug false before launch. With the URL flag you can still debug a live test.
 *   - Use log() instead of console.log. Log the start, found/missing elements,
 *     insertions and goals.
 *
 * WORKS WITH: all platforms
 */

(function () {
    'use strict';

    const CONFIG = {
        testId: 'hh-exp-123',   // [TEST_ID]
        debug: false            // true = log to console. Or add ?hh_debug=1 to the URL
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

    // Usage
    try {
        log('Variation started');
        log('Found element', document.querySelector('h1'));
    } catch (err) {
        log('Error', err);
    }
})();

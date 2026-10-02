/**
 * SNIPPET: Debug logging
 *
 * WHEN TO USE
 *   In every test build. It gives styled console messages you can switch on and off
 *   without touching the rest of the code.
 *
 * HOW TO USE
 *   - Set TEST_NAME to the test ID (e.g. 'hh-exp-123').
 *   - Logging is on when the URL contains ?hh_debug=1, or when isEnabled is true.
 *     Set isEnabled to false before launch. With the URL flag you can still debug in production.
 *
 * WORKS WITH: all platforms
 */

/* --------------------- DEBUGGING ------------------------------*/
const TEST_NAME = 'hh-exp-123';

const debug = {
  isEnabled: false || new URLSearchParams(window.location.search).has('hh_debug'),
  styles: {
    intro: 'color: #fff; background: #0077b6; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
    tag: 'color: #000; background: #caf0f8; padding: 2px 5px; font-weight: bold;',
    text: 'color: inherit;'
  }
};

function log(msg, ...args) {
  if (debug.isEnabled) {
    console.log(`%cAB-TEST%c${TEST_NAME}%c ${msg}`,
      debug.styles.intro, debug.styles.tag, debug.styles.text, ...args);
  }
}

// Usage
log('Variation loaded');
log('Found element', document.querySelector('h1'));

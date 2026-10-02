/**
 * SNIPPET: DOM ready
 *
 * WHEN TO USE
 *   You need to run code once the HTML has been parsed, but the A/B testing tool
 *   may load your variation code before OR after that moment.
 *
 * WHY NOT JUST 'DOMContentLoaded'?
 *   A/B testing tools often inject variation code after DOMContentLoaded has already
 *   fired. A listener added at that point never runs. This helper checks
 *   document.readyState first and only falls back to the event when needed.
 *
 * PITFALLS
 *   - "DOM ready" does not mean your element exists. Content rendered by JavaScript
 *     (Alpine, Knockout, React, cart drawers, ...) can appear much later.
 *     Use wait-for-element.js or mutation-observer.js for that.
 *
 * WORKS WITH: all platforms
 */

function domReady(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }
}

// Usage
domReady(() => {
  // Call the code or functions here
});

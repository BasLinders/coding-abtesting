/**
 * SNIPPET: Wait for condition
 *
 * WHEN TO USE
 *   You need something that is not a DOM element: a global object or library
 *   (window.Alpine, window.require, window.Shopify, window.dataLayer), a value in
 *   that object, or any custom check that returns something truthy.
 *
 * HOW TO USE
 *   waitFor(() => window.Alpine).then((Alpine) => { ... });
 *   The value returned by the check is passed to .then().
 *
 * PITFALLS
 *   - Return the value you need, not `true`, so you don't have to look it up again.
 *   - Always keep a timeout (see wait-for-element.js).
 *   - Wrap risky property access in the check: () => window.a?.b
 *
 * WORKS WITH: all platforms
 */

function waitFor(check, { interval = 50, timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function poll() {
      let result;
      try {
        result = check();
      } catch (e) {
        result = undefined;
      }
      if (result) return resolve(result);
      if (Date.now() - start >= timeout) return reject(new Error('waitFor: condition not met within ' + timeout + 'ms'));
      setTimeout(poll, interval);
    })();
  });
}

// Usage: wait for a library
waitFor(() => window.dataLayer).then((dataLayer) => {
  // dataLayer is available
});

// Usage: wait for a specific state
waitFor(() => document.querySelectorAll('.product-card').length >= 4 && document.querySelectorAll('.product-card'))
  .then((cards) => {
    // At least 4 product cards rendered
  });

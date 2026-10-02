/**
 * SNIPPET: Wait for element (polling)
 *
 * WHEN TO USE
 *   The element you want to change is not in the HTML right away. It is rendered
 *   later by JavaScript (lazy loading, sliders, reviews widgets, checkout steps).
 *   Use this when you need the element ONCE and it stays on the page after it appears.
 *
 * WHEN NOT TO USE
 *   If the element is removed and re-rendered (Alpine, React, Shopify cart drawers,
 *   Knockout checkout steps), use mutation-observer.js instead. Polling only
 *   catches the first render, so the change is lost after a re-render.
 *
 * HOW TO USE
 *   waitForElement('.product-info .price').then((el) => { ... });
 *   The promise rejects after `timeout` ms, so a missing element cannot keep a
 *   timer running forever.
 *
 * PITFALLS
 *   - Always set a timeout. A forgotten interval that never clears slows down the page.
 *   - Keep `interval` at 50–100 ms. Lower values cost CPU and barely speed things up.
 *
 * WORKS WITH: all platforms
 */

function waitForElement(selector, { interval = 50, timeout = 10000, root = document } = {}) {
  return new Promise((resolve, reject) => {
    const found = root.querySelector(selector);
    if (found) return resolve(found);

    const start = Date.now();
    const timer = setInterval(() => {
      const el = root.querySelector(selector);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if (Date.now() - start >= timeout) {
        clearInterval(timer);
        reject(new Error(`waitForElement: "${selector}" not found within ${timeout}ms`));
      }
    }, interval);
  });
}

// Usage
waitForElement('.element')
  .then((el) => {
    // Apply the experiment changes here
  })
  .catch((err) => console.warn(err.message));

// Wait for several elements at once
Promise.all([waitForElement('.product-title'), waitForElement('.add-to-cart')])
  .then(([title, button]) => {
    // Both elements exist
  });

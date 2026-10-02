/**
 * SNIPPET: Mutation observer (apply changes to every element, including re-renders)
 *
 * WHEN TO USE
 *   - Elements appear, disappear and re-appear: cart drawers, filters, infinite
 *     scroll, checkout steps, Alpine/React/Knockout components.
 *   - You need to react to a class or attribute change (e.g. a step becomes "active").
 *
 * HOW IT WORKS
 *   onElements(selector, callback) runs `callback` once for every matching element:
 *   the ones on the page now AND any that are added later. A WeakSet remembers which
 *   element objects were already handled. When a framework throws an element away
 *   and renders a new one, the new one is a different object, so it gets handled
 *   again automatically. That is exactly what you want after a re-render.
 *
 * WHY WEAKSET AND NOT A CLASS OR DATA ATTRIBUTE AS A MARKER?
 *   Frameworks that re-render can also overwrite `class` and `data-*` attributes,
 *   which silently removes your marker and makes your code run twice on the same element.
 *   A WeakSet lives in your own code, so the framework cannot touch it, and it
 *   does not leak memory when elements are removed.
 *
 * PITFALLS
 *   - Never change the DOM inside the observer in a way that matches your own
 *     selector again. That causes an infinite loop. The WeakSet prevents this for
 *     the same element, but not for new elements you create yourself.
 *   - Observe the smallest stable container you can, not document.body, when possible.
 *   - Call the returned stop() function when the change is no longer needed.
 *
 * WORKS WITH: all platforms
 */

function onElements(selector, callback, { root = document.documentElement, attributes = false } = {}) {
  const handled = new WeakSet();

  function scan() {
    root.querySelectorAll(selector).forEach((el) => {
      if (handled.has(el)) return;
      handled.add(el);
      callback(el);
    });
  }

  scan();
  const observer = new MutationObserver(scan);
  observer.observe(root, { childList: true, subtree: true, attributes });

  return function stop() {
    observer.disconnect();
  };
}

// Usage: change every product card, including cards loaded by infinite scroll
const stopCards = onElements('.product-card', (card) => {
  card.classList.add('hh-exp-123-card');
});

// Usage: run once when a checkout step becomes active, then stop observing
const stopStep = onElements('.checkout-step.active', (step) => {
  // Apply changes to the active step
  stopStep();
}, { attributes: true });

/* -----------------------------------------------------------------------------
 * Lower-level version: react to a specific attribute change on one element
 * --------------------------------------------------------------------------- */
function onAttributeChange(el, attributeName, callback) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.attributeName === attributeName) callback(el.getAttribute(attributeName), m.oldValue);
    });
  });
  observer.observe(el, { attributes: true, attributeOldValue: true, attributeFilter: [attributeName] });
  return () => observer.disconnect();
}

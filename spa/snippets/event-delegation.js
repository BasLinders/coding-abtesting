/**
 * SNIPPET: Event delegation for elements that get re-rendered
 *
 * WHEN TO USE
 *   Tracking clicks (goals) or adding behaviour to elements on an SPA or any
 *   re-rendering component (cart drawers, Alpine lists, Knockout checkout).
 *
 * WHY
 *   A listener added directly to an element is lost when the framework replaces
 *   that element. One listener on `document` keeps working forever, because the
 *   click bubbles up from whichever element exists at that moment.
 *
 * PITFALLS
 *   - Some frameworks call event.stopPropagation(). Use capture mode
 *     ({ capture: true }) so your listener runs before theirs.
 *   - Register the delegate once. Guard with a window flag if the variation code
 *     can run more than once (SPA route changes).
 *
 * WORKS WITH: all platforms (essential on spa)
 */

function delegate(eventType, selector, handler, { capture = true } = {}) {
  const listener = (event) => {
    const match = event.target.closest && event.target.closest(selector);
    if (match) handler(event, match);
  };
  document.addEventListener(eventType, listener, { capture });
  return () => document.removeEventListener(eventType, listener, { capture });
}

// Usage: track clicks on the add-to-cart button, however often it is re-rendered
if (!window.__hhExp123Delegated) {
  window.__hhExp123Delegated = true;
  delegate('click', '[data-testid="add-to-cart"], form[action*="cart"] button[type="submit"]', () => {
    // Fire the testing tool's goal here (see _base-context.md)
  });
}

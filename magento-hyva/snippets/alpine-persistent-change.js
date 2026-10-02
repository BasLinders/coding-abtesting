/**
 * SNIPPET: Changes that survive Alpine.js re-renders (WeakSet pattern)
 *
 * WHEN TO USE
 *   Any change to elements that Alpine controls or renders: product swatches,
 *   price boxes, items in `x-for` lists (minicart items, product sliders), blocks
 *   inside `x-if`, and anything in Hyvä Checkout.
 *
 * THE PROBLEM
 *   Alpine throws elements away and renders new ones when its data changes
 *   (x-for, x-if), and overwrites content of x-text / x-html elements. Code that
 *   ran once on page load loses its change, without any error.
 *
 * THE SOLUTION
 *   1. A MutationObserver notices every time Alpine changes the DOM.
 *   2. A WeakSet remembers which element OBJECTS were already changed.
 *      - New element rendered by Alpine → not in the WeakSet → change it again.
 *      - Element we already changed → in the WeakSet → skip, so it never runs twice.
 *   A WeakSet is invisible to Alpine (unlike a class or data attribute marker,
 *   which a binding can remove), and it forgets removed elements automatically,
 *   so there is no memory leak.
 *
 * TWO PATTERNS
 *   A. persist(): insert your own element NEXT TO an Alpine-controlled element.
 *   B. replaceBoundText(): change text that Alpine controls via x-text, by hiding
 *      the original (CSS) and showing your own copy next to it, updating it
 *      whenever Alpine updates the original.
 *
 * PITFALLS
 *   - Never write into an element with x-text / x-html. Use pattern B.
 *   - Do not create elements that match your own selector inside the callback,
 *     or the observer keeps triggering itself.
 *   - Observe the smallest container that is NOT replaced itself (e.g. the
 *     product info column, not the swatch).
 *
 * WORKS WITH: magento-hyva (and any Alpine.js / reactive framework site)
 */

const TEST_ID = 'hh-exp-123';

/* A. Apply a change to every current and future match ---------------------- */
function persist(selector, apply, { root = document.body } = {}) {
  const done = new WeakSet();
  const run = () => {
    root.querySelectorAll(selector).forEach((el) => {
      if (done.has(el)) return;
      done.add(el);
      apply(el);
    });
  };
  run();
  const observer = new MutationObserver(run);
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}

// Usage A: a message below every swatch group, also after Alpine re-renders it
persist('.swatch-attribute', (swatches) => {
  const note = document.createElement('p');
  note.className = `${TEST_ID}-swatch-note`;
  note.textContent = 'Not sure about your size? Free returns within 30 days.';
  swatches.insertAdjacentElement('afterend', note); // next to, not inside
});

/* B. Replace text that Alpine binds with x-text ------------------------------ */
function replaceBoundText(selector, transform, { root = document.body } = {}) {
  const done = new WeakSet();

  function attach(original) {
    const copy = document.createElement(original.tagName);
    copy.className = `${original.className} ${TEST_ID}-text`;
    original.classList.add(`${TEST_ID}-hidden-original`); // hidden via CSS
    original.insertAdjacentElement('afterend', copy);

    const sync = () => { copy.textContent = transform(original.textContent.trim()); };
    sync();
    // Alpine updates the original's text → update our copy
    new MutationObserver(sync).observe(original, { childList: true, characterData: true, subtree: true });
  }

  const run = () => {
    root.querySelectorAll(selector).forEach((el) => {
      // Skip our own copies: they inherit the original's classes and could match the selector
      if (done.has(el) || el.classList.contains(`${TEST_ID}-text`)) return;
      done.add(el);
      attach(el);
    });
  };
  run();
  new MutationObserver(run).observe(root, { childList: true, subtree: true });
}

// Usage B: rewrite the stock label that Alpine renders with x-text
replaceBoundText('.product-info-main .stock span[x-text]', (text) =>
  text.toLowerCase().includes('in stock') ? 'In stock, ordered before 22:00 = shipped today' : text
);

/* CSS that goes with pattern B (put this in the CSS field):
   .hh-exp-123-hidden-original { display: none !important; }
*/

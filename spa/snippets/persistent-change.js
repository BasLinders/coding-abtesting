/**
 * SNIPPET: Persistent changes on an SPA (WeakSet + MutationObserver + route scope)
 *
 * WHEN TO USE
 *   Any DOM change on an SPA. It combines the three things an SPA change needs:
 *   1. Re-apply when the framework re-renders the element (WeakSet + observer)
 *   2. Only on the right route
 *   3. Clean up when leaving the route
 *
 * HOW TO USE
 *   const stop = persist(findTarget, apply);
 *   - findTarget() returns the element(s) to change. Use robust selectors
 *     (spa/snippets/robust-selectors.js), not hashed class names.
 *   - apply(el) makes the change. It returns an optional cleanup function.
 *   - stop() disconnects the observer and runs all cleanups.
 *
 * REACT/VUE SAFETY (see spa/_platform-context.md, rule 3)
 *   - Insert NEXT TO framework elements, don't remove or move them.
 *   - Hide framework elements with CSS, don't change their text.
 *
 * WORKS WITH: spa
 */

function persist(findTarget, apply, { root = document.body } = {}) {
  const done = new WeakSet();
  const cleanups = [];
  let scheduled = false;

  function run() {
    scheduled = false;
    let targets = findTarget();
    if (!targets) return;
    if (!(targets instanceof NodeList || Array.isArray(targets))) targets = [targets];
    targets.forEach((el) => {
      if (!el || done.has(el)) return;
      done.add(el);
      const cleanup = apply(el);
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    });
  }

  // Batch bursts of mutations into one run per frame (SPAs mutate a lot)
  const observer = new MutationObserver(() => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(run); }
  });
  run();
  observer.observe(root, { childList: true, subtree: true });

  return function stop() {
    observer.disconnect();
    cleanups.splice(0).forEach((fn) => fn());
  };
}

// Usage with onRoute() from spa/snippets/url-change-listener.js
let stopBadge;
onRoute(/^\/products\//, {
  enter: () => {
    stopBadge = persist(
      () => document.querySelector('[data-testid="product-price"]'),
      (price) => {
        const badge = document.createElement('div');
        badge.className = 'hh-exp-123-badge';
        badge.textContent = 'Free delivery today';
        price.insertAdjacentElement('afterend', badge); // next to, not inside
        return () => badge.remove();                     // cleanup
      }
    );
  },
  leave: () => stopBadge && stopBadge()
});

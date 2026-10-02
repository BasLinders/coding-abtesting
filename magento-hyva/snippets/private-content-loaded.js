/**
 * SNIPPET: Read the cart / customer data and react to updates (Hyvä)
 *
 * WHEN TO USE
 *   Free-shipping bars, cart-value messages, logged-in vs guest variations.
 *
 * HOW IT WORKS
 *   Hyvä loads customer sections after the page is loaded and dispatches
 *   `private-content-loaded` on window, with the sections in event.detail.data.
 *   It fires again after every cart change (add to cart, remove, qty update).
 *
 *   Your code may run AFTER the first event, so we also read the cached copy
 *   in localStorage ('mage-cache-storage') straight away.
 *
 * DATA YOU GET (data.cart, verify in the console. Extensions add fields.)
 *   summary_count, subtotalAmount, subtotal (HTML), items[]
 *   data.customer.firstname is set when the visitor is logged in
 *
 * PITFALLS
 *   - The cached copy can be outdated or missing (first visit, cleared storage).
 *     Treat it as a first guess. The event always delivers the real data.
 *   - Do not call Luma's customer-data module. It doesn't exist on Hyvä.
 *
 * WORKS WITH: magento-hyva
 */

function onHyvaSections(callback) {
  // 1. Cached data, if present
  try {
    const cached = JSON.parse(localStorage.getItem('mage-cache-storage') || '{}');
    if (cached?.cart) callback(cached);
  } catch (e) { /* storage unavailable or invalid JSON */ }

  // 2. Fresh data now and after every update
  window.addEventListener('private-content-loaded', (event) => {
    callback(event.detail.data || {});
  });
}

// Usage
onHyvaSections((data) => {
  const cart = data.cart || {};
  const subtotal = Number(cart.subtotalAmount || 0);
  console.log('Cart subtotal:', subtotal, 'items:', cart.summary_count || 0);
});

// Ask Hyvä to fetch fresh section data (e.g. after your test added a product with fetch)
// window.dispatchEvent(new CustomEvent('reload-customer-section-data'));

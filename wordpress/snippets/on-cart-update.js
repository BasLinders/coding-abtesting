/**
 * SNIPPET: React to cart updates without jQuery (WooCommerce)
 *
 * WHEN TO USE
 *   Anything that must update when the cart changes: free-shipping bar, cart-value
 *   message, upsell in the mini cart.
 *
 * WHY NOT LISTEN TO 'added_to_cart' / 'updated_cart_totals'?
 *   WooCommerce triggers those with jQuery. Native addEventListener never receives
 *   them, and the team doesn't write jQuery. Instead:
 *     - Block cart/checkout: subscribe to the 'wc/store/cart' data store.
 *     - Everywhere else: watch the containers that WooCommerce replaces after an
 *       update (mini cart fragments, cart totals, checkout review) and re-read the
 *       cart through the Store API.
 *
 * HOW TO USE
 *   onWooCartUpdate(() => { ...re-read cart and update your UI... });
 *   The callback is debounced, so a burst of DOM updates calls it once.
 *
 * PITFALLS
 *   - Themes can render the mini cart in their own markup. If updates are missed,
 *     add the theme's mini-cart container to WATCH.
 *
 * WORKS WITH: wordpress (WooCommerce)
 */

function onWooCartUpdate(callback, { delay = 300 } = {}) {
  let t;
  const fire = () => { clearTimeout(t); t = setTimeout(callback, delay); };

  // 1. Block-based cart/checkout: wp.data store (select() can throw for an unregistered store)
  let hasCartStore = false;
  try { hasCartStore = !!window.wp?.data?.select('wc/store/cart'); } catch (e) { /* not a blocks page */ }
  if (hasCartStore) {
    let last = '';
    window.wp.data.subscribe(() => {
      const totals = window.wp.data.select('wc/store/cart').getCartTotals();
      const key = JSON.stringify(totals);
      if (key !== last) { last = key; fire(); }
    });
  }

  // 2. Classic: containers WooCommerce replaces after a cart update
  const WATCH = '.widget_shopping_cart_content, .cart_totals, #order_review, .woocommerce-cart-form';
  const seen = new WeakSet();
  let initialised = false;
  new MutationObserver(() => {
    let changed = false;
    document.querySelectorAll(WATCH).forEach((el) => {
      if (!seen.has(el)) { seen.add(el); changed = true; }
    });
    // A new container object = WooCommerce replaced it = the cart changed
    if (changed && initialised) fire();
  }).observe(document.body, { childList: true, subtree: true });

  document.querySelectorAll(WATCH).forEach((el) => seen.add(el));
  initialised = true;
}

// Usage (with wordpress/snippets/store-api-cart.js)
onWooCartUpdate(() => {
  getWooCart().then((cart) => console.log('Cart updated, subtotal:', cart.subtotal));
});

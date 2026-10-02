/**
 * SNIPPET: Read the cart and react to cart updates (Magento Luma)
 *
 * WHEN TO USE
 *   Free-shipping bars, cart-value messages, "you have X items" nudges: anything
 *   that needs the cart contents on a cached page.
 *
 * HOW IT WORKS
 *   Magento loads the cart as a "customer section" (JSON) after the page loads and
 *   keeps it in the Knockout observable customerData.get('cart'). Subscribing
 *   gives you every update: add to cart, remove from minicart, qty change.
 *
 * DATA YOU GET (cart section)
 *   cart.summary_count   number of items
 *   cart.subtotalAmount  subtotal as a number (string in some versions, so use Number())
 *   cart.subtotal        subtotal as formatted HTML
 *   cart.items           array of items (product_name, qty, product_price_value, ...)
 *
 * PITFALLS
 *   - The section can be empty ({}) on first load before the AJAX call returns.
 *     Always handle a missing value.
 *   - Inspect the real data first: run the usage example in the console and log `cart`.
 *     Extensions often add or rename fields.
 *
 * WORKS WITH: magento (Luma). Not Hyvä (see magento-hyva/snippets/private-content-loaded.js).
 */

function onMagentoCart(callback) {
  const start = Date.now();
  (function poll() {
    if (typeof window.require === 'function') {
      return window.require(['Magento_Customer/js/customer-data'], (customerData) => {
        const cart = customerData.get('cart');
        callback(cart());          // current value
        cart.subscribe(callback);  // every update
      });
    }
    if (Date.now() - start < 10000) setTimeout(poll, 50);
  })();
}

// Usage
onMagentoCart((cart) => {
  if (!cart || cart.subtotalAmount === undefined) return;
  const subtotal = Number(cart.subtotalAmount);
  console.log('Cart subtotal:', subtotal, 'items:', cart.summary_count);
});

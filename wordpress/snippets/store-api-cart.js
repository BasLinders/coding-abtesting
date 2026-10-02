/**
 * SNIPPET: Read the cart as JSON through the WooCommerce Store API
 *
 * WHEN TO USE
 *   You need cart totals or items on any page (free-shipping bar, cart-value
 *   message) and don't want to scrape them from the DOM.
 *
 * DATA YOU GET
 *   cart.items_count
 *   cart.totals.total_items     subtotal of items, as an integer string in minor units ("4995")
 *   cart.totals.total_price     grand total, in minor units
 *   cart.totals.currency_code, cart.totals.currency_minor_unit (e.g. 2)
 *   cart.items[]                name, quantity, prices, ...
 *
 * PITFALLS
 *   - Amounts are in minor units. Divide by 10 ** currency_minor_unit.
 *   - total_items is excl. tax if the shop shows prices excl. tax. total_items_tax
 *     holds the tax. Check which number the free-shipping rule uses.
 *   - This is a read-only GET. Changing the cart through the Store API needs a nonce.
 *     Don't do that in a test unless a developer has confirmed it.
 *   - Some security plugins block /wp-json/. If you get a 401/403, fall back to the DOM.
 *
 * WORKS WITH: wordpress (WooCommerce 6+, classic and blocks)
 */

function getWooCart() {
  const root = window.wcSettings?.storeApiRoot || '/wp-json/wc/store/v1/';
  return fetch(root.replace(/\/?$/, '/') + 'cart', { credentials: 'same-origin' })
    .then((res) => {
      if (!res.ok) throw new Error('Store API ' + res.status);
      return res.json();
    })
    .then((cart) => {
      const unit = 10 ** (cart.totals.currency_minor_unit || 0);
      return {
        raw: cart,
        count: cart.items_count,
        subtotal: Number(cart.totals.total_items) / unit,
        total: Number(cart.totals.total_price) / unit,
        currency: cart.totals.currency_code
      };
    });
}

// Usage
getWooCart()
  .then((cart) => console.log('Subtotal:', cart.subtotal, cart.currency, 'items:', cart.count))
  .catch((err) => console.warn(err.message));

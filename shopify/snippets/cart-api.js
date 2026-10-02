/**
 * SNIPPET: Read and change the cart with the Shopify Cart AJAX API
 *
 * WHEN TO USE
 *   Free-shipping bars, upsells ("add this product"), cart-value messages.
 *
 * DATA YOU GET (getCart())
 *   item_count, total_price (cents), items_subtotal_price (cents),
 *   currency, items[] (title, variant_id, quantity, final_line_price, ...)
 *
 * PITFALLS
 *   - Amounts are in cents. Divide by 100 (see format-money.js).
 *   - After addToCart() the theme's cart drawer and cart count do NOT update by
 *     themselves. Either reload the page, open the theme's drawer the theme's own way,
 *     or use the theme's add-to-cart form instead of the API (ask the developer).
 *   - Always use Shopify.routes.root, because of Markets locale prefixes.
 *
 * WORKS WITH: shopify
 */

const cartRoot = () => window.Shopify?.routes?.root ?? '/';

function getCart() {
  return fetch(cartRoot() + 'cart.js', { credentials: 'same-origin' }).then((r) => r.json());
}

function addToCart(variantId, quantity = 1) {
  return fetch(cartRoot() + 'cart/add.js', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ items: [{ id: variantId, quantity }] })
  }).then((r) => {
    if (!r.ok) return r.json().then((err) => { throw new Error(err.description || 'add to cart failed'); });
    return r.json();
  });
}

// Usage
getCart().then((cart) => {
  console.log('Items:', cart.item_count, 'Subtotal:', cart.items_subtotal_price / 100, cart.currency);
});

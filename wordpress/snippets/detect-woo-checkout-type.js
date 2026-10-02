/**
 * SNIPPET: Detect classic vs block-based cart/checkout (WooCommerce)
 *
 * WHEN TO USE
 *   At the start of every cart or checkout test. The two types need different code,
 *   and a shop can switch between them.
 *
 * WORKS WITH: wordpress (WooCommerce)
 */

function getWooCartType() {
    if (document.querySelector('.wp-block-woocommerce-cart, .wp-block-woocommerce-checkout')) return 'blocks';
    if (document.querySelector('form.woocommerce-cart-form, form.woocommerce-checkout')) return 'classic';
    return null; // not a cart/checkout page, or not rendered yet
}

// Usage
const cartType = getWooCartType();
if (cartType === 'blocks') {
    // React-based: see wordpress/snippets/on-cart-update.js and spa/_platform-context.md
} else if (cartType === 'classic') {
    // PHP + AJAX-replaced blocks: use the WeakSet observer pattern
}

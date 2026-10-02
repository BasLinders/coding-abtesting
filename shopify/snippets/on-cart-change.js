/**
 * SNIPPET: React to cart changes on any Shopify theme
 *
 * WHEN TO USE
 *   Anything that must update when the cart changes: free-shipping bar in the cart
 *   drawer, upsell that hides once the product is in the cart.
 *
 * HOW IT WORKS
 *   Every theme changes the cart through Shopify's endpoints (/cart/add, /cart/change,
 *   /cart/update, /cart/clear). A PerformanceObserver tells us when such a
 *   request has finished, whatever theme or app code made it. We don't need to
 *   wrap fetch or know the theme's events.
 *
 * PITFALLS
 *   - The callback runs after the request finishes, but the theme may still be
 *     re-rendering the cart drawer. If you change the drawer, use the WeakSet
 *     observer pattern as well, so your change is re-applied to the new drawer HTML.
 *   - Requests from inside iframes are not seen (rare for carts).
 *
 * WORKS WITH: shopify
 */

function onShopifyCartChange(callback) {
    const CART_CHANGE = /\/cart\/(add|change|update|clear)(\.js)?(\?|$)/;
    const observer = new PerformanceObserver((list) => {
        const changed = list.getEntries().some((entry) => CART_CHANGE.test(new URL(entry.name).pathname));
        if (changed) callback();
    });
    observer.observe({ type: 'resource', buffered: false });
    return () => observer.disconnect();
}

// Usage (with shopify/snippets/cart-api.js)
onShopifyCartChange(() => {
    getCart().then((cart) => console.log('Cart changed, subtotal:', cart.items_subtotal_price / 100));
});

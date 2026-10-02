/**
 * SNIPPET: React when the visitor picks a different variant (Shopify)
 *
 * WHEN TO USE
 *   Messages or UI that depend on the selected variant: stock messages, delivery
 *   times, price-per-unit, "only X left".
 *
 * HOW IT WORKS
 *   Most themes update ?variant=<id> in the URL with history.replaceState when a
 *   variant is selected, and replaceState fires no event. We listen for `change` on
 *   the product form (bubbling, so it survives re-rendered inputs) and then read
 *   the variant ID from the URL, or from the form's hidden [name="id"] input.
 *
 * WORKS WITH: shopify
 */

function onVariantChange(callback) {
    let last = null;
    const read = () => {
        const fromUrl = new URLSearchParams(window.location.search).get('variant');
        const input = document.querySelector('form[action*="/cart/add"] [name="id"]');
        return fromUrl || input?.value;
    };
    const check = () => {
        // Wait a tick so the theme can update the URL / hidden input first
        setTimeout(() => {
            const id = read();
            if (id && id !== last) { last = id; callback(id); }
        }, 50);
    };
    document.addEventListener('change', (e) => {
        if (e.target.closest('variant-selects, variant-radios, form[action*="/cart/add"], .product-form')) check();
    });
    check();
}

// Usage
onVariantChange((variantId) => {
    console.log('Selected variant:', variantId);
});

/**
 * SNIPPET: Inject styles from JavaScript
 *
 * WHEN TO USE
 *   Normally the variation CSS goes in the testing tool's CSS field. Inject CSS
 *   from JavaScript only when:
 *   - the styles may only apply under a condition the CSS field can't express
 *     (one page variant, an element being present, a value in the cart), or
 *   - the site renders the same page type in different ways and the CSS must not
 *     touch the other version.
 *
 * PREFERRED ALTERNATIVE
 *   Keep the CSS in the CSS field, scoped under a class, and let JS add that
 *   class when the condition is true:
 *     JS:  document.documentElement.classList.add('hh-exp-123');
 *     CSS: .hh-exp-123 .product-price { ... }
 *   This keeps CSS readable for colleagues and is usually enough.
 *
 * PITFALLS
 *   - Give the <style> tag an ID so it is never injected twice.
 *
 * WORKS WITH: all platforms
 */

function injectStyles(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.insertAdjacentElement('beforeend', style);
}

// Usage: only restyle the price block when the tiered-price table exists
if (document.querySelector('.product-tier-prices')) {
    injectStyles('hh-exp-123-styles', `
        .product-price-container {
            display: inline-flex;
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 18px;
        }
        @media (max-width: 991px) {
            .product-price-amount { font-size: 2.5rem; }
        }
    `);
}

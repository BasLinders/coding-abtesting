/**
 * SNIPPET: Use Magento (Luma) JS modules with RequireJS
 *
 * WHEN TO USE
 *   You need data or behaviour that only lives in Magento's JS modules: customer
 *   sections (cart), checkout quote/totals, price formatting.
 *
 * HOW TO USE
 *   magentoRequire(['Magento_Checkout/js/model/quote'], (quote) => { ... });
 *   This waits until RequireJS exists (variation code can run before it does),
 *   then loads the modules.
 *
 * PITFALLS
 *   - Do not require 'jquery' to manipulate the DOM. Use vanilla JS.
 *   - A module that is not used on the current page (e.g. checkout modules on the
 *     PDP) will be downloaded just for your test, or fail. Only require checkout
 *     modules on the checkout.
 *   - External libraries that support AMD (most UMD builds) register with RequireJS
 *     instead of `window`. Load them through require.config (see below) or they
 *     may throw "Mismatched anonymous define()".
 *
 * WORKS WITH: magento (Luma). Not Hyvä.
 */

function magentoRequire(modules, callback, { timeout = 10000 } = {}) {
    const start = Date.now();
    (function poll() {
        if (typeof window.require === 'function' && window.require.defined) {
            return window.require(modules, callback);
        }
        if (Date.now() - start < timeout) setTimeout(poll, 50);
    })();
}

// Usage: format a price the same way Magento does
magentoRequire(['Magento_Catalog/js/price-utils'], (priceUtils) => {
    const format = window.checkoutConfig?.priceFormat;
    if (format) console.log(priceUtils.formatPrice(49.95, format));
});

// Usage: load an external AMD/UMD library through RequireJS
magentoRequire([], () => {
    window.require.config({
        paths: { hhExpLib: 'https://cdn.example.com/library.min' } // no ".js" at the end
    });
    window.require(['hhExpLib'], (lib) => {
        // library is available here
    });
});

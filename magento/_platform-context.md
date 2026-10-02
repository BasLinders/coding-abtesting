# Platform context: Magento 2 (Luma and Luma-based themes)

> Use this file for Magento 2 sites with the default **Luma** frontend (RequireJS + Knockout + jQuery widgets).
> For **Hyvä** themes, use `magento-hyva/_platform-context.md` instead. Signs that a site is Hyvä: no RequireJS, `x-data` attributes everywhere, Tailwind classes.

## How to recognise a Luma site
- `window.require` and `window.requirejs` exist
- `<script type="text/x-magento-init">` blocks in the HTML
- The checkout lives at `/checkout/` and is built from Knockout templates (`data-bind="..."` attributes)

## Rules for the LLM
1. **Write vanilla JavaScript for the DOM.** jQuery is on the page, but the team does not use it. Do not use `$`, `jQuery`, `.on()`, `.hide()` or jQuery plugins (slick, owl).
2. **Magento's own JS modules may be loaded with `require()`** when they give you data that is not in the DOM, such as cart contents or checkout totals. These modules return Knockout observables: read them with `quote.totals()` and listen with `.subscribe(fn)`. That is not jQuery and is allowed. Wait for `window.require` before calling it (see `snippets/requirejs-load-module.js`).
3. **Content is loaded late.** Many blocks (minicart, customer name, checkout steps, related products, swatches) render after DOMContentLoaded. Always wait for the element.
4. **The checkout re-renders.** Knockout re-renders parts of the checkout when the shipping method, payment method or address changes, and your inserted elements disappear. Use the WeakSet observer pattern (`shared/snippets/timing/mutation-observer.js`) so changes are re-applied.
5. **Full page cache.** Pages are cached HTML. Customer-specific data (cart, name, wishlist) comes from "customer sections" through `Magento_Customer/js/customer-data`, not from the HTML. See `snippets/customer-data-cart.js`.
6. **Prices.** Read them from `window.checkoutConfig.priceFormat` (checkout) or format them with `Intl.NumberFormat`. Don't hardcode the currency symbol.

## Common pitfalls
- **Third-party checkouts** (OneStepCheckout, Amasty, MaxServ, Mageplaza, ...) change the checkout's DOM and JS structure and often add their own config object to `window`. Ask which checkout the site uses and ask for the HTML.
- **Swatches/configurable products** re-render the price box when an option is chosen. Observe `.price-box`.
- **Minicart** content is a Knockout template inside `[data-block="minicart"]`. It re-renders on every cart update.
- `require()` calls run asynchronously. Code after a `require([...], fn)` call runs before `fn`.

## Useful selectors (default Luma, verify on the site)
| What | Selector |
|---|---|
| Add-to-cart form (PDP) | `#product_addtocart_form` |
| Add-to-cart button | `#product-addtocart-button` |
| Price box | `.product-info-main .price-box` |
| Minicart | `[data-block="minicart"]` |
| Checkout agreements | `[data-role^="checkout-agreements"]` |
| Page type | `body` classes: `catalog-product-view`, `catalog-category-view`, `checkout-cart-index`, `checkout-index-index` |

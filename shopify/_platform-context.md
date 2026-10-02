# Platform context: Shopify (Online Store 2.0 themes)

## Rules for the LLM
1. **Vanilla JavaScript only.** Most modern Shopify themes (Dawn and themes based on it, Horizon) contain no jQuery. Older themes may, but don't use it.
2. **Every theme is different.** Shopify has no standard storefront markup. Selectors, cart drawer behaviour and JS events depend on the theme. Always ask for the HTML, and ask which theme it is (`window.Shopify.theme.name` in the console).
3. **Use the Cart AJAX API for cart data**, not the DOM: `GET /cart.js` returns the cart as JSON (`snippets/cart-api.js`). Always prefix URLs with `window.Shopify.routes.root`. On sites with Shopify Markets the root is `/nl/`, `/de/`, etc., and `/cart.js` without the prefix can return the wrong locale.
4. **Money is in cents.** The Cart API returns integers in the smallest currency unit (`4995` = 49.95). Format with `Intl.NumberFormat` and `window.Shopify.currency.active` (`snippets/format-money.js`).
5. **Sections re-render.** Themes refresh parts of the page by fetching new HTML from Shopify (the Section Rendering API) and swapping it in: the cart drawer after every add/remove, the product info after a variant change, the collection grid after filtering. Your changes inside those parts disappear. Use the WeakSet observer pattern (`shared/snippets/timing/mutation-observer.js`).
6. **Detect cart changes theme-independently** with `snippets/on-cart-change.js`. It watches network requests to `/cart/add`, `/cart/change`, `/cart/update` and `/cart/clear`, whatever theme code made them.
7. **Web components.** Dawn-based themes use custom elements: `<cart-drawer>`, `<cart-items>`, `<variant-selects>`, `<product-info>`, `<quantity-input>`. They make good, stable selectors. Don't replace these elements, because they hold the theme's JS logic.

## What you cannot test client-side
- **Checkout** (`/checkouts/...`) and the **thank-you page**: A/B testing tools' scripts don't run there. Checkout changes need Checkout Extensibility (Shopify Plus) or Shopify's own tools. Tell the user if a hypothesis targets the checkout.
- **Shopify-hosted apps' iframes** (some reviews or upsell apps): you cannot change content inside a cross-origin iframe.

## Common pitfalls
- **Variant changes** update the URL (`?variant=123`) with `history.replaceState` and re-render the price/button. To react to a variant change, listen for `change` events on the variant form, or observe the product-info section.
- **Theme editor preview**: `window.Shopify.designMode` is `true` inside the theme editor. Make sure your code does nothing there.
- **App blocks** (reviews, BNPL, upsells) load late and often re-render. Wait for them.
- **Prices on the page** are formatted with the shop's money format. Don't parse them. Get the number from the Cart API or the product JSON (`/products/<handle>.js`).

## Useful globals
| | |
|---|---|
| `Shopify.routes.root` | locale-aware root URL, e.g. `/` or `/nl/` |
| `Shopify.currency.active` | active currency, e.g. `EUR` |
| `Shopify.locale` | active language, e.g. `nl` |
| `Shopify.theme` | theme name and ID |
| `ShopifyAnalytics.meta.page.pageType` | `product`, `collection`, `home`, `cart`, ... (not on every theme) |

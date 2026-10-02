# Platform context: WordPress + WooCommerce

## First question: classic or block-based cart/checkout?
WooCommerce has two completely different cart and checkout implementations, and code for one does not work on the other. Check which one the page uses (see `snippets/detect-woo-checkout-type.js`):

| | Classic (shortcode) | Blocks (default for new shops since WooCommerce 8.3) |
|---|---|---|
| Recognise by | `form.woocommerce-cart-form`, `form.checkout.woocommerce-checkout` | `.wp-block-woocommerce-cart`, `.wp-block-woocommerce-checkout`, `.wc-block-components-*` classes |
| Rendered by | PHP, then partly replaced by AJAX | React, so it re-renders constantly (treat it like an SPA) |
| Cart data | Store API or DOM | `wp.data.select('wc/store/cart')` or Store API |

Product pages and category pages are classic PHP templates in both cases, unless the theme is a block theme with product blocks.

## Rules for the LLM
1. **Vanilla JavaScript only.** WooCommerce loads jQuery, but the team does not use it. No `$`, `jQuery`, `.on()` or jQuery plugins.
2. **WooCommerce's own events are jQuery events.** `added_to_cart`, `updated_cart_totals`, `updated_checkout`, `wc_fragments_refreshed` and others are triggered with jQuery. **`addEventListener` does not receive them.** Use one of these vanilla alternatives:
   - **MutationObserver + WeakSet** on the containers WooCommerce replaces (see below). This works for every theme and both checkout types.
   - **The Store API** (`/wp-json/wc/store/v1/cart`) to read the cart as JSON (`snippets/store-api-cart.js`).
   - **`wp.data.subscribe()`** on block-based cart/checkout pages (`snippets/on-cart-update.js`).
3. **AJAX replaces whole blocks.** On the classic pages, WooCommerce swaps out the HTML of these containers after an update, and your changes inside them are lost:
   - Cart page: `.woocommerce-cart-form`, `.cart_totals` (after "Update cart" and coupon actions)
   - Checkout: `#order_review` / `.woocommerce-checkout-review-order-table` (after every address/shipping change), and the payment methods `#payment`
   - Mini cart: `.widget_shopping_cart_content` (cart fragments)
   Re-apply with the WeakSet observer pattern (`shared/snippets/timing/mutation-observer.js`).
4. **Block cart/checkout = React.** Do not remove or move React-rendered elements. React may throw errors or put them back. Hide them with CSS and insert your own elements next to the block's outer container. See `spa/_platform-context.md` for React-safe patterns.
5. **Prices** are pre-formatted HTML (`.woocommerce-Price-amount`). The Store API returns prices as integers in the smallest currency unit, with `currency_minor_unit` (e.g. `4995` + `2` = 49.95).

## Common pitfalls
- **Page builders** (Elementor, Divi, WPBakery) generate classes like `elementor-element-3f2a1b`. These are stable until someone edits the page in the builder. Prefer structural or text-based selectors for important elements, and tell the client the test depends on that layout.
- **Caching/optimisation plugins** (WP Rocket "Delay JavaScript", LiteSpeed, Autoptimize) can delay or combine scripts. If the testing tool's snippet is delayed, the variation flickers or loads late. Ask for the testing tool's script to be excluded.
- **Body classes** are great for targeting: `single-product`, `post-type-archive-product`, `tax-product_cat`, `woocommerce-cart`, `woocommerce-checkout`, `woocommerce-order-received`, `logged-in`.
- **Variable products**: the price and the add-to-cart button change when a variation is selected. The variation form updates `.woocommerce-variation` with new HTML, so observe that element.

## Useful selectors (default WooCommerce templates, verify on the site)
| What | Selector |
|---|---|
| Add-to-cart form (PDP) | `form.cart` |
| Add-to-cart button | `.single_add_to_cart_button` |
| PDP price | `.summary .price` |
| Product cards | `ul.products li.product` |
| Classic cart totals | `.cart_totals` |
| Classic checkout order review | `#order_review` |

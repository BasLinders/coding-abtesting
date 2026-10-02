# Shared recipes

Complete test builds that use only plain JavaScript and the DOM, so they work on every platform. When you use one on Hyvä, WooCommerce blocks, Shopify or an SPA, tell the LLM the platform. It will apply that platform's rules too (e.g. WeakSet re-apply for re-rendered content).

| Recipe | Status |
|---|---|
| `countdown-banner`: countdown to the end of a weekly promotion, with alternating promo code | ready |
| `trustpilot-widget`: TrustBox next to any element | ready |
| `product-card-cta`: CTA button on every product card, multi-language | ready |
| `pdp-usp-block`: USP list near the add-to-cart button | ready |
| `language-from-pathname`: copy per language, detected from `/gb-en/`-style URL paths | ready |
| `mobile-menu-rebuild`: three-layer mobile menu (categories → groups → original links), multi-language | ready |
| `cookie-page-variant`: serve a server-side page version by setting/removing a cookie | ready |
| `plp-grid-switch`: column switch (e.g. 1 / 2 columns) on listing pages, unless the site has one | ready |
| `cta-copy-change`: change button/CTA text (simplest recipe, good for learning the workflow) | to do |
| `mobile-sticky-add-to-cart`: sticky bar that clicks the real add-to-cart button | to do |
| `reorder-pdp-sections`: move sections (e.g. reviews) higher on the product page | to do |

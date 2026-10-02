/**
 * SNIPPET: Format Shopify cents as a price
 *
 * WHEN TO USE
 *   Showing an amount from the Cart API or product JSON, e.g. "Only € 12,50 to free shipping".
 *
 * PITFALLS
 *   - Use the active currency and locale, since Shopify Markets can show a different
 *     currency per country.
 *   - Thresholds set in the shop's base currency (e.g. free shipping from €50) are
 *     converted per market. Ask the client what the threshold is per currency.
 *
 * WORKS WITH: shopify
 */

function formatMoney(cents) {
  const currency = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'EUR';
  const locale = (window.Shopify && window.Shopify.locale) || document.documentElement.lang || 'en';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}

// Usage
formatMoney(1250); // "€ 12,50" on a Dutch store

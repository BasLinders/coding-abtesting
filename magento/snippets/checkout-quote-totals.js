/**
 * SNIPPET: Read checkout totals and react when they change (Magento Luma checkout)
 *
 * WHEN TO USE
 *   Show subtotal/tax/shipping information in a new place in the checkout, or
 *   change messaging based on the order total or chosen shipping method.
 *
 * HOW IT WORKS
 *   'Magento_Checkout/js/model/quote' holds the checkout state as Knockout
 *   observables. quote.totals() returns the current totals, and .subscribe() fires
 *   when shipping, discounts or payment methods change them.
 *
 * DATA YOU GET (quote.totals())
 *   subtotal, subtotal_incl_tax, grand_total, tax_amount, shipping_amount,
 *   discount_amount, quote_currency_code, total_segments (array with code/title/value)
 *
 * PITFALLS
 *   - Only works on the standard Luma checkout (and checkouts built on it). Third-party
 *     one-step checkouts may use their own model or a window config object.
 *     Log quote.totals() in the console first.
 *   - grand_total excludes tax in some tax configurations. Use total_segments
 *     ('grand_total' segment) for what the customer actually sees.
 *
 * WORKS WITH: magento (Luma checkout)
 */

function onCheckoutTotals(callback) {
    const start = Date.now();
    (function poll() {
        if (typeof window.require === 'function' && window.checkoutConfig) {
            return window.require(['Magento_Checkout/js/model/quote'], (quote) => {
                if (quote.totals()) callback(quote.totals());
                quote.totals.subscribe(callback);
            });
        }
        if (Date.now() - start < 15000) setTimeout(poll, 100);
    })();
}

// Usage
onCheckoutTotals((totals) => {
    const segment = (code) => (totals.total_segments || []).find((s) => s.code === code);
    const grandTotal = segment('grand_total') ? segment('grand_total').value : totals.grand_total;
    console.log('Subtotal excl. tax:', totals.subtotal, 'Grand total:', grandTotal);
});

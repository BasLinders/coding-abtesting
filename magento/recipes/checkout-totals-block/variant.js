/**
 * RECIPE: Totals summary above the checkout agreements. See README.md in this folder.
 * Shows subtotal (excl. tax) and grand total (incl. tax) right above the place-order
 * area, and keeps it in sync and in place when Knockout re-renders the payment step.
 */
(function () {
  const TEST_ID = 'hh-exp-123';
  const CONFIG = {
    anchor: '[data-role^="checkout-agreements"]',     // [SELECTOR] block is inserted before this
    labels: {                                          // [COPY]
      subtotal: '<strong>Subtotal</strong> excl. VAT',
      total: '<strong>Total</strong> incl. VAT'
    }
  };

  document.documentElement.classList.add(TEST_ID);
  let latestTotals = null;

  function formatPrice(value) {
    const cfg = window.checkoutConfig || {};
    const currency = (cfg.totalsData && cfg.totalsData.quote_currency_code) || 'EUR';
    return new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency }).format(value);
  }

  function getValues(totals) {
    const segment = (code) => (totals.total_segments || []).find((s) => s.code === code);
    return {
      subtotal: totals.subtotal,
      total: segment('grand_total') ? segment('grand_total').value : totals.grand_total
    };
  }

  function render(block) {
    if (!latestTotals) return;
    const v = getValues(latestTotals);
    block.innerHTML = `
      <div class="${TEST_ID}-totals__row">
        <div class="${TEST_ID}-totals__label">${CONFIG.labels.subtotal}:</div>
        <div class="${TEST_ID}-totals__value">${formatPrice(v.subtotal)}</div>
      </div>
      <div class="${TEST_ID}-totals__row">
        <div class="${TEST_ID}-totals__label">${CONFIG.labels.total}:</div>
        <div class="${TEST_ID}-totals__value">${formatPrice(v.total)}</div>
      </div>`;
  }

  function insert(anchor) {
    // Each payment method renders its own agreements block inside its own (hidden)
    // container, so a block next to each one only shows for the selected method.
    const block = document.createElement('div');
    block.className = `${TEST_ID}-totals`;
    anchor.parentNode.insertBefore(block, anchor);
    render(block);
  }

  function renderAll() {
    document.querySelectorAll(`.${TEST_ID}-totals`).forEach(render);
  }

  // 1. Keep totals in sync (see magento/snippets/checkout-quote-totals.js)
  const start = Date.now();
  (function poll() {
    if (typeof window.require === 'function' && window.checkoutConfig) {
      return window.require(['Magento_Checkout/js/model/quote'], (quote) => {
        latestTotals = quote.totals();
        renderAll();
        quote.totals.subscribe((totals) => {
          latestTotals = totals;
          renderAll();
        });
      });
    }
    if (Date.now() - start < 15000) setTimeout(poll, 100);
  })();

  // 2. Insert next to every (re-)rendered agreements block (WeakSet pattern)
  const handled = new WeakSet();
  function scan() {
    document.querySelectorAll(CONFIG.anchor).forEach((anchor) => {
      if (handled.has(anchor)) return;
      if (anchor.previousElementSibling && anchor.previousElementSibling.classList.contains(`${TEST_ID}-totals`)) return;
      handled.add(anchor);
      insert(anchor);
    });
  }
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();

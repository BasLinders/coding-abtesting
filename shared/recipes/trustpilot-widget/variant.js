/**
 * RECIPE: Trustpilot widget. See README.md in this folder.
 * Loads the Trustpilot bootstrap script and inserts a TrustBox next to a target element.
 */
(function () {
  const TEST_ID = 'hh-exp-123';
  const CONFIG = {
    target: '#payment-methods',          // [SELECTOR]
    position: 'afterend',                // beforebegin | afterbegin | beforeend | afterend
    locale: 'en-GB',                     // [LOCALE] e.g. nl-NL, de-DE
    templateId: '[TEMPLATE_ID]',         // from the Trustpilot business account
    businessUnitId: '[BUSINESS_UNIT_ID]',
    reviewUrl: 'https://www.trustpilot.com/review/[DOMAIN]',
    height: '20px',
    theme: 'light'
  };

  if (document.getElementById(`${TEST_ID}-trustpilot`)) return;
  document.documentElement.classList.add(TEST_ID);

  function loadBootstrap() {
    const src = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
    return new Promise((resolve) => {
      if (window.Trustpilot) return resolve();
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return existing.addEventListener('load', () => resolve(), { once: true });
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  function insert(target) {
    const wrapper = document.createElement('div');
    wrapper.id = `${TEST_ID}-trustpilot`;
    wrapper.className = `${TEST_ID}-trustpilot trustpilot-widget`;
    Object.assign(wrapper.dataset, {
      locale: CONFIG.locale,
      templateId: CONFIG.templateId,
      businessunitId: CONFIG.businessUnitId,
      styleHeight: CONFIG.height,
      styleWidth: '100%',
      theme: CONFIG.theme
    });
    wrapper.innerHTML = `<a href="${CONFIG.reviewUrl}" target="_blank" rel="noopener">Trustpilot</a>`;
    target.insertAdjacentElement(CONFIG.position, wrapper);

    // If the bootstrap script was already on the page, it won't scan for new widgets
    loadBootstrap().then(() => {
      if (window.Trustpilot) window.Trustpilot.loadFromElement(wrapper, true);
    });
  }

  const start = Date.now();
  (function poll() {
    const target = document.querySelector(CONFIG.target);
    if (target) return insert(target);
    if (Date.now() - start < 10000) setTimeout(poll, 50);
  })();
})();

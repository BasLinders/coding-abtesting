/**
 * RECIPE: Add a CTA button to every product card. See README.md in this folder.
 * Handles cards that load later (infinite scroll, filters) and multi-language sites.
 */
(function () {
  const TEST_ID = 'hh-exp-123';
  const CONFIG = {
    card: '.product-card',        // [SELECTOR] one product card
    link: 'a[href]',              // [SELECTOR] the product link inside the card
    insertInto: null,             // [SELECTOR] optional: element inside the card to append to (default: the link)
    copy: {                       // [COPY] per language, 'en' is the fallback
      en: 'View this product',
      es: 'Ver este producto',
      de: 'Dieses Produkt ansehen',
      fr: 'Voir ce produit'
    }
  };

  document.documentElement.classList.add(TEST_ID);

  function getLocale() {
    const lang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    return lang || (window.location.pathname.split('/')[1] || '').slice(0, 2).toLowerCase();
  }
  const ctaText = CONFIG.copy[getLocale()] || CONFIG.copy.en;

  function addCta(card) {
    if (card.querySelector(`.${TEST_ID}-cta`)) return;
    const link = card.querySelector(CONFIG.link);
    if (!link) return;

    // A <span> inside the existing link: the whole card stays one link,
    // so screen readers don't hear two links to the same page.
    const cta = document.createElement('span');
    cta.className = `${TEST_ID}-cta`;
    cta.textContent = ctaText;
    cta.setAttribute('aria-hidden', 'true');

    const container = (CONFIG.insertInto && card.querySelector(CONFIG.insertInto)) || link;
    container.appendChild(cta);
  }

  // Handle current cards + cards added later (see shared/snippets/timing/mutation-observer.js)
  const handled = new WeakSet();
  function scan() {
    document.querySelectorAll(CONFIG.card).forEach((card) => {
      if (handled.has(card)) return;
      handled.add(card);
      addCta(card);
    });
  }
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();

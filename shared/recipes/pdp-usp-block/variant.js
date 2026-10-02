/**
 * RECIPE: USP block on the product page. See README.md in this folder.
 * Reuses the site's existing USP list (e.g. from the header), keeps the chosen
 * items, adds new ones, and places the result near the add-to-cart button.
 */
(function () {
  const TEST_ID = 'hh-exp-123';
  const CONFIG = {
    source: '.header-usps ul',              // [SELECTOR] existing USP list to copy (null = build from scratch)
    keep: [2, 4],                           // 1-based positions of source items to keep (empty = keep all)
    extraItems: [                           // [COPY] new USPs, appended in this order
      { text: 'Customers rate us 9.3', href: null },
      { text: 'Questions? Call [PHONE]', href: 'tel:[PHONE]' }
    ],
    insertAfter: '.product-add-form',      // [SELECTOR] the block goes after this element
    hide: ['.product-page .usps']           // [SELECTORS] existing blocks the new one replaces
  };

  if (document.getElementById(`${TEST_ID}-usps`)) return;
  document.documentElement.classList.add(TEST_ID); // CSS uses this class to hide CONFIG.hide

  function buildList() {
    const list = document.createElement('ul');
    list.id = `${TEST_ID}-usps`;
    list.className = `${TEST_ID}-usps`;

    const source = CONFIG.source && document.querySelector(CONFIG.source);
    if (source) {
      Array.from(source.children).forEach((li, i) => {
        if (CONFIG.keep.length && !CONFIG.keep.includes(i + 1)) return;
        const clone = li.cloneNode(true);
        clone.removeAttribute('id'); // avoid duplicate IDs
        clone.classList.add(`${TEST_ID}-usps__item`);
        list.appendChild(clone);
      });
    }

    CONFIG.extraItems.forEach((item) => {
      const li = document.createElement('li');
      li.className = `${TEST_ID}-usps__item ${TEST_ID}-usps__item--new`;
      const inner = document.createElement(item.href ? 'a' : 'span');
      if (item.href) inner.href = item.href;
      inner.textContent = item.text;
      li.appendChild(inner);
      list.appendChild(li);
    });
    return list;
  }

  const start = Date.now();
  (function poll() {
    const anchor = document.querySelector(CONFIG.insertAfter);
    const sourceReady = !CONFIG.source || document.querySelector(CONFIG.source);
    if (anchor && sourceReady) return anchor.insertAdjacentElement('afterend', buildList());
    if (Date.now() - start < 10000) setTimeout(poll, 50);
  })();
})();

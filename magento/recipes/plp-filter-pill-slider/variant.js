/**
 * RECIPE: Category pill slider on the category page. See README.md in this folder.
 * Shows a horizontally scrollable row of "pill" links (e.g. sub-categories or
 * popular filters) above the product grid. A different set can be shown per
 * category URL. Pure CSS scroll-snap, so no slider library is needed.
 */
(function () {
  const TEST_ID = 'hh-exp-123';
  const CONFIG = {
    insertBefore: '.products.wrapper',                  // [SELECTOR] pills go above the product grid
    filterButton: '.filter-title strong',               // [SELECTOR] optional: rename the filter button (null to skip)
    filterButtonText: 'Refine your selection',          // [COPY]
    pillsByPath: {                                      // [CONFIG] URL path → pills
      '/category-a.html': [
        { label: 'Pill 1', href: '/category-a/sub-1.html' },
        { label: 'Pill 2', href: '/category-a/sub-2.html' }
      ],
      '/category-b.html': [
        { label: 'Pill 3', href: '/category-b/sub-3.html' }
      ]
    },
    arrows: { prev: 'Previous', next: 'Next' }          // [COPY] accessible labels
  };

  const pills = CONFIG.pillsByPath[window.location.pathname];
  if (!pills || document.getElementById(`${TEST_ID}-pills`)) return;
  document.documentElement.classList.add(TEST_ID);

  function build() {
    const wrap = document.createElement('nav');
    wrap.id = `${TEST_ID}-pills`;
    wrap.className = `${TEST_ID}-pills`;
    wrap.setAttribute('aria-label', 'Categories');
    wrap.innerHTML = `
      <button type="button" class="${TEST_ID}-pills__arrow ${TEST_ID}-pills__arrow--prev" aria-label="${CONFIG.arrows.prev}"></button>
      <ul class="${TEST_ID}-pills__track">
        ${pills.map((p) => `<li><a class="${TEST_ID}-pills__pill" href="${p.href}">${p.label}</a></li>`).join('')}
      </ul>
      <button type="button" class="${TEST_ID}-pills__arrow ${TEST_ID}-pills__arrow--next" aria-label="${CONFIG.arrows.next}"></button>`;

    const track = wrap.querySelector(`.${TEST_ID}-pills__track`);
    const prev = wrap.querySelector(`.${TEST_ID}-pills__arrow--prev`);
    const next = wrap.querySelector(`.${TEST_ID}-pills__arrow--next`);

    const scrollBy = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: 'smooth' });
    prev.addEventListener('click', () => scrollBy(-1));
    next.addEventListener('click', () => scrollBy(1));

    // Hide arrows when there is nothing to scroll in that direction
    function updateArrows() {
      prev.hidden = track.scrollLeft <= 0;
      next.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    }
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    requestAnimationFrame(updateArrows);
    return wrap;
  }

  const start = Date.now();
  (function poll() {
    const target = document.querySelector(CONFIG.insertBefore);
    if (target) {
      target.parentNode.insertBefore(build(), target);
      const btn = CONFIG.filterButton && document.querySelector(CONFIG.filterButton);
      if (btn) btn.textContent = CONFIG.filterButtonText;
      return;
    }
    if (Date.now() - start < 10000) setTimeout(poll, 50);
  })();
})();

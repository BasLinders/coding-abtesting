/**
 * RECIPE: Countdown banner. See README.md in this folder.
 * Counts down to Sunday 23:59:59 (local time) and shows a promo code that
 * alternates per week number.
 */
(function () {
  const TEST_ID = 'hh-exp-123';
  const CONFIG = {
    insertBefore: 'main',          // [SELECTOR] the banner is inserted before this element
    text: 'Sale ends in',          // [COPY]
    promoCodes: ['CODE-EVEN', 'CODE-ODD'], // even week, odd week
    labels: { days: 'd', hours: 'h', minutes: 'm', seconds: 's' }
  };

  if (document.getElementById(`${TEST_ID}-banner`)) return; // never insert twice
  document.documentElement.classList.add(TEST_ID);

  function getWeekNum(date) {
    const janFirst = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - janFirst) / 86400000);
    return Math.ceil((janFirst.getDay() + 1 + days) / 7);
  }

  function getEnd(now) {
    const end = new Date(now);
    end.setDate(now.getDate() + ((7 - now.getDay()) % 7)); // Sunday = 0 → tonight
    end.setHours(23, 59, 59, 999);
    return end;
  }

  function build() {
    const banner = document.createElement('div');
    banner.id = `${TEST_ID}-banner`;
    banner.className = `${TEST_ID}-banner`;
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', CONFIG.text);
    banner.innerHTML = `
      <span class="${TEST_ID}-banner__text">${CONFIG.text}</span>
      <span class="${TEST_ID}-banner__timer" aria-live="off">
        ${['days', 'hours', 'minutes', 'seconds'].map((unit) =>
          `<span class="${TEST_ID}-banner__unit"><span data-unit="${unit}">0</span>${CONFIG.labels[unit]}</span>`
        ).join('')}
      </span>
      <span class="${TEST_ID}-banner__code"></span>
    `;
    return banner;
  }

  function init(target) {
    const banner = build();
    target.parentNode.insertBefore(banner, target);

    const now = new Date();
    banner.querySelector(`.${TEST_ID}-banner__code`).textContent =
      CONFIG.promoCodes[getWeekNum(now) % 2 === 0 ? 0 : 1];

    const units = {};
    banner.querySelectorAll('[data-unit]').forEach((el) => { units[el.dataset.unit] = el; });

    function tick() {
      const diff = Math.max(0, getEnd(new Date()) - new Date());
      units.days.textContent = Math.floor(diff / 86400000);
      units.hours.textContent = Math.floor((diff % 86400000) / 3600000);
      units.minutes.textContent = Math.floor((diff % 3600000) / 60000);
      units.seconds.textContent = Math.floor((diff % 60000) / 1000);
      if (diff === 0) clearInterval(timer);
    }

    tick(); // run immediately to avoid a 1-second empty state
    const timer = setInterval(tick, 1000);
  }

  // Wait for the insertion point (see shared/snippets/timing/wait-for-element.js)
  const start = Date.now();
  (function poll() {
    const target = document.querySelector(CONFIG.insertBefore);
    if (target) return init(target);
    if (Date.now() - start < 10000) setTimeout(poll, 50);
  })();
})();

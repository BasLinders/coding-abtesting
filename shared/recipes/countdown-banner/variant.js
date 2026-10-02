/**
 * RECIPE: Countdown banner. See README.md in this folder.
 * Counts down to the end of a weekly promotion (default: Sunday 23:59:59, local time)
 * and shows a promo code that alternates per week number.
 */
(function () {
    'use strict';

    /* ================================= CONFIG =================================
     * The only place to change values. Fill in everything marked [LIKE_THIS].
     * Positions: beforebegin = before the target, afterbegin = inside, at the start,
     *            beforeend = inside, at the end, afterend = after the target
     * ========================================================================= */
    const CONFIG = {
        testId: 'hh-exp-123',                             // [TEST_ID]
        debug: false,                                     // true = log to console. Or add ?hh_debug=1 to the URL
        insert: {
            banner: { target: 'main', position: 'beforebegin' } // [SELECTOR] where the banner goes
        },
        copy: {
            text: 'Sale ends in',                         // [COPY] text before the timer
            promoCodes: ['[CODE_EVEN_WEEKS]', '[CODE_ODD_WEEKS]'],
            labels: { days: 'd', hours: 'h', minutes: 'm', seconds: 's' }
        },
        settings: {
            endDay: 0,                                    // day the promotion ends: 0 = Sunday ... 6 = Saturday
            endTime: [23, 59, 59],                        // hours, minutes, seconds
            timeout: 10000                                // ms to wait for the insertion target
        }
    };

    /* ================================= DEBUG ================================== */
    const DEBUG = CONFIG.debug || new URLSearchParams(window.location.search).has('hh_debug');
    const LOG_STYLES = {
        intro: 'color: #fff; background: #0077b6; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
        tag: 'color: #000; background: #caf0f8; padding: 2px 5px; font-weight: bold;',
        text: 'color: inherit;'
    };
    function log(msg, ...args) {
        if (!DEBUG) return;
        console.log(`%cAB-TEST%c${CONFIG.testId}%c ${msg}`, LOG_STYLES.intro, LOG_STYLES.tag, LOG_STYLES.text, ...args);
    }

    /* ================================ HELPERS ================================= */
    const POSITIONS = ['beforebegin', 'afterbegin', 'beforeend', 'afterend'];

    function insertAt(el, where, root = document) {
        if (!POSITIONS.includes(where.position)) {
            log(`Invalid position "${where.position}". Use one of: ${POSITIONS.join(', ')}`);
            return null;
        }
        const target = root.querySelector(where.target);
        if (!target) {
            log('Insert target not found:', where.target);
            return null;
        }
        target.insertAdjacentElement(where.position, el);
        log(`Inserted ${where.position} ${where.target}`, el);
        return el;
    }

    function waitForElement(selector, root = document) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            (function poll() {
                const el = root.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() - start >= CONFIG.settings.timeout) return reject(new Error(`Not found: ${selector}`));
                setTimeout(poll, 50);
            })();
        });
    }

    /* =============================== VARIATION ================================ */
    const ID = `${CONFIG.testId}-banner`;
    const UNITS = ['days', 'hours', 'minutes', 'seconds'];

    function isAlreadyApplied() {
        return Boolean(document.getElementById(ID));
    }

    function addTestClass() {
        document.documentElement.classList.add(CONFIG.testId);
    }

    function getWeekNum(date) {
        const janFirst = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - janFirst) / 86400000);
        return Math.ceil((janFirst.getDay() + 1 + days) / 7);
    }

    function getPromoCode() {
        return CONFIG.copy.promoCodes[getWeekNum(new Date()) % 2 === 0 ? 0 : 1];
    }

    function getEndDate(now) {
        const end = new Date(now);
        end.setDate(now.getDate() + ((7 + CONFIG.settings.endDay - now.getDay()) % 7));
        end.setHours(...CONFIG.settings.endTime, 999);
        return end;
    }

    function buildBanner() {
        const banner = document.createElement('div');
        banner.id = ID;
        banner.className = ID;
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', CONFIG.copy.text);
        banner.innerHTML = `
            <span class="${ID}__text"></span>
            <span class="${ID}__timer">
                ${UNITS.map((unit) => `<span class="${ID}__unit"><span data-unit="${unit}">0</span>${CONFIG.copy.labels[unit]}</span>`).join('')}
            </span>
            <span class="${ID}__code"></span>`;
        banner.querySelector(`.${ID}__text`).textContent = CONFIG.copy.text;
        banner.querySelector(`.${ID}__code`).textContent = getPromoCode();
        return banner;
    }

    function startTimer(banner) {
        const els = {};
        banner.querySelectorAll('[data-unit]').forEach((el) => { els[el.dataset.unit] = el; });

        function tick() {
            const diff = Math.max(0, getEndDate(new Date()) - new Date());
            els.days.textContent = Math.floor(diff / 86400000);
            els.hours.textContent = Math.floor((diff % 86400000) / 3600000);
            els.minutes.textContent = Math.floor((diff % 3600000) / 60000);
            els.seconds.textContent = Math.floor((diff % 60000) / 1000);
            if (diff === 0) {
                clearInterval(timer);
                log('Countdown finished');
            }
        }
        tick(); // run immediately to avoid a 1-second empty state
        const timer = setInterval(tick, 1000);
        log('Timer started');
    }

    function init() {
        try {
            log('Variation started');
            if (isAlreadyApplied()) {
                log('Banner already present, skipping');
                return;
            }
            addTestClass();
            waitForElement(CONFIG.insert.banner.target)
                .then(() => {
                    const banner = insertAt(buildBanner(), CONFIG.insert.banner);
                    if (banner) startTimer(banner);
                })
                .catch((err) => log(err.message));
        } catch (err) {
            log('Error', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

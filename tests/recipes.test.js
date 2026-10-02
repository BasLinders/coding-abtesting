'use strict';

/**
 * Behaviour tests: every recipe runs in a simulated browser (jsdom) on a small
 * page that mimics the real site. Run with: npm test
 *
 * Adding a recipe? Add a describe() block here with at least:
 *   - the change appears in the right place
 *   - running the code twice doesn't duplicate anything
 *   - the most important CONFIG options / edge cases (missing elements, fallbacks)
 */

const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const { runRecipe, wait, text, closeAll } = require('./helpers');

after(closeAll);

describe('shared/recipes/countdown-banner/variant.js', () => {
    const FILE = 'shared/recipes/countdown-banner/variant.js';

    test('inserts the banner before <main> with a promo code', async () => {
        const page = runRecipe(FILE, { html: '<body><main>content</main></body>' });
        await wait(100);
        const banner = page.document.getElementById('hh-exp-123-banner');
        assert.ok(banner, 'banner missing');
        assert.equal(banner.nextElementSibling.tagName, 'MAIN');
        assert.match(text(banner.querySelector('.hh-exp-123-banner__code')), /CODE_(EVEN|ODD)_WEEKS/);
        assert.deepEqual(page.errors, []);
    });

    test('running twice inserts one banner', async () => {
        const page = runRecipe(FILE, { html: '<body><main></main></body>' });
        await wait(100);
        page.rerun();
        await wait(100);
        assert.equal(page.document.querySelectorAll('#hh-exp-123-banner').length, 1);
        assert.ok(page.logs.some((l) => l.includes('already present')));
    });

    test('also works when the code runs while the page is still loading', async () => {
        const { JSDOM } = require('jsdom');
        const { readSource } = require('./helpers');
        const dom = new JSDOM(`<!doctype html><html><head><script>${readSource(FILE)}</script></head><body><main></main></body></html>`,
            { url: 'https://shop.test/', runScripts: 'dangerously', pretendToBeVisual: true });
        await wait(150);
        assert.ok(dom.window.document.getElementById('hh-exp-123-banner'));
        dom.window.close();
    });
});

describe('shared/recipes/trustpilot-widget/variant.js', () => {
    const FILE = 'shared/recipes/trustpilot-widget/variant.js';

    test('inserts the widget after the target and loads the script once', async () => {
        const page = runRecipe(FILE, { html: '<body><div id="payment-methods"></div></body>' });
        await wait(100);
        assert.equal(page.document.getElementById('payment-methods').nextElementSibling?.id, 'hh-exp-123-trustpilot');
        assert.equal(page.document.querySelectorAll('script[src*="trustpilot"]').length, 1);
        assert.deepEqual(page.errors, []);
    });

    test('an invalid position is logged and nothing is inserted', async () => {
        const page = runRecipe(FILE, {
            html: '<body><div id="payment-methods"></div></body>',
            edits: [["position: 'afterend'", "position: 'after'"]]
        });
        await wait(100);
        assert.equal(page.document.getElementById('hh-exp-123-trustpilot'), null);
        assert.ok(page.logs.some((l) => l.includes('Invalid position "after"')));
    });
});

describe('shared/recipes/product-card-cta/variant.js', () => {
    const FILE = 'shared/recipes/product-card-cta/variant.js';

    test('adds a CTA in the page language to existing and later cards', async () => {
        const page = runRecipe(FILE, { html: '<html lang="de"><body><div class="grid"><div class="product-card"><a href="/p1">P1</a></div></div></body></html>' });
        await wait();
        page.document.querySelector('.grid').insertAdjacentHTML('beforeend', '<div class="product-card"><a href="/p2">P2</a></div>');
        await wait();
        const ctas = [...page.document.querySelectorAll('.hh-exp-123-cta')];
        assert.equal(ctas.length, 2);
        assert.ok(ctas.every((cta) => cta.parentElement.tagName === 'A'), 'CTA must be inside the card link');
        assert.equal(text(ctas[0]), 'Dieses Produkt ansehen');
    });

    test('falls back to English for an unknown language', async () => {
        const page = runRecipe(FILE, { html: '<html lang="pt"><body><div class="product-card"><a href="/p1">P1</a></div></body></html>' });
        await wait();
        assert.equal(text(page.document.querySelector('.hh-exp-123-cta')), 'View this product');
    });

    test('observer stops after stopAfter and logs a missing root', async () => {
        const page = runRecipe(FILE, {
            html: '<body><div class="product-card"><a href="/1">1</a></div></body>',
            edits: [['stopAfter: 0', 'stopAfter: 30']]
        });
        await wait(80);
        page.document.body.insertAdjacentHTML('beforeend', '<div class="product-card"><a href="/2">2</a></div>');
        await wait();
        assert.equal(page.document.querySelectorAll('.hh-exp-123-cta').length, 1);

        const missingRoot = runRecipe(FILE, { edits: [["root: 'body'", "root: '.grid'"]] });
        await wait();
        assert.ok(missingRoot.logs.some((l) => l.includes('Observer root not found: .grid')));
    });
});

describe('shared/recipes/pdp-usp-block/variant.js', () => {
    const FILE = 'shared/recipes/pdp-usp-block/variant.js';
    const HTML = '<body><div class="header-usps"><ul><li id="a">One</li><li>Two</li><li>Three</li><li>Four</li></ul></div><form class="product-add-form"></form></body>';

    test('keeps the configured items, adds new ones, inserts after the form', async () => {
        const page = runRecipe(FILE, { html: HTML });
        await wait(150);
        const list = page.document.getElementById('hh-exp-123-usps');
        assert.deepEqual([...list.children].map(text), ['Two', 'Four', 'Customers rate us 9.3', 'Questions? Call [PHONE]']);
        assert.equal(list.previousElementSibling.className, 'product-add-form');
        assert.equal(page.document.querySelectorAll('#a').length, 1, 'cloned IDs must be removed');
    });
});

describe('shared/recipes/language-from-pathname/variant.js', () => {
    const FILE = 'shared/recipes/language-from-pathname/variant.js';
    const EDITS = [["cta: '[SELECTOR]'", "cta: '.btn span'"], ["usp: '[SELECTOR]'", "usp: '.usp'"]];
    const HTML = '<body><div id="pd"><button class="btn"><span>Add</span></button><p class="usp">old</p></div></body>';

    const cases = [
        ['/de-de/p/shoe', 'In den Warenkorb'],
        ['/FR-FR', 'Ajouter au panier'],          // no trailing slash, upper case
        ['/es-es/x', 'Add to basket'],            // language without copy → default
        ['/products/shoe', 'Add to basket']       // no language code → default
    ];
    cases.forEach(([pathname, expected]) => {
        test(`${pathname} → "${expected}"`, async () => {
            const page = runRecipe(FILE, { html: HTML, url: `https://shop.test${pathname}`, edits: EDITS });
            await wait();
            assert.equal(text(page.document.querySelector('.btn span')), expected);
        });
    });

    test('re-rendered and late elements get the copy too', async () => {
        const page = runRecipe(FILE, { html: '<body><div id="pd"><button class="btn"><span>Add</span></button></div></body>', url: 'https://shop.test/de-de/', edits: EDITS });
        await wait();
        page.document.getElementById('pd').innerHTML = '<button class="btn"><span>Add</span></button><p class="usp">old</p>';
        await wait();
        assert.equal(text(page.document.querySelector('.btn span')), 'In den Warenkorb');
        assert.equal(text(page.document.querySelector('.usp')), 'Kostenloser Versand ab 50 €');
    });
});

describe('shared/recipes/mobile-menu-rebuild/variant.js', () => {
    const FILE = 'shared/recipes/mobile-menu-rebuild/variant.js';
    const HTML = `<body><ul class="nav navbar-nav">
        <li class="nav-item dropdown"><a id="old-indoor" class="nav-link">Old indoor</a>
            <ul class="dropdown-menu">
                <li class="dropdown-item"><a id="beanbags" href="/bean-bags" data-attribute-name="cat">Bean bags</a></li>
                <li class="dropdown-item"><a id="1chairs" href="/chairs">Chairs</a></li>
                <li class="dropdown-item"><a id="lamps" href="/lamps">Lamps</a></li>
            </ul></li>
        <li class="nav-item"><a id="sale" class="nav-link" href="/sale">Sale</a></li></ul></body>`;
    const EDITS = [
        ["topLevelIds: ['[ORIGINAL_TOP_LEVEL_LINK_ID]']", "topLevelIds: ['old-indoor']"],
        ["{ heading: 'seating', items: ['[LINK_ID]', '[LINK_ID]'] }", "{ heading: 'seating', items: ['beanbags', '1chairs', 'not-there'] }"],
        ["{ heading: 'lighting', items: ['[LINK_ID]', '[LINK_ID]'] }", "{ heading: 'lighting', items: ['lamps'] }"],
        ["{ heading: 'seating-outdoor', items: ['[LINK_ID]'] }", "{ heading: 'seating-outdoor', items: ['nope'] }"],
        ["{ heading: 'lighting-outdoor', items: ['[LINK_ID]'] }", "{ heading: 'lighting-outdoor', items: ['nope'] }"]
    ];

    test('builds the three layers in the current language and hides the originals', async () => {
        const page = runRecipe(FILE, { html: HTML, url: 'https://shop.test/de-de', edits: EDITS });
        await wait(100);
        const menu = page.document.querySelector('ul.nav');
        const category = page.document.getElementById('hh-exp-123-menu-indoor');
        assert.equal(menu.firstElementChild, category);
        assert.equal(page.document.getElementById('hh-exp-123-menu-outdoor'), null, 'empty category must be skipped');
        assert.deepEqual([...category.querySelectorAll('.hh-exp-123-group-link')].map(text), ['Sitzen', 'Beleuchtung']);
        const links = [...category.querySelectorAll('.dropdown-link')];
        assert.deepEqual(links.map(text), ['Bean bags', 'Chairs', 'Lamps']);
        assert.equal(links[0].dataset.attributeName, 'cat', 'tracking data attribute must be copied');
        assert.ok(page.document.getElementById('old-indoor').closest('li').classList.contains('hh-exp-123-hidden'));
        assert.ok(!page.document.getElementById('sale').closest('li').classList.contains('hh-exp-123-hidden'));
    });

    test('opens and closes one layer at a time', async () => {
        const page = runRecipe(FILE, { html: HTML, url: 'https://shop.test/de-de', edits: EDITS });
        await wait(100);
        const category = page.document.getElementById('hh-exp-123-menu-indoor');
        const categoryLink = category.querySelector(':scope > a');
        const groupLink = category.querySelector('.hh-exp-123-group-link');
        categoryLink.click();
        groupLink.click();
        assert.ok(category.classList.contains('show'));
        assert.equal(categoryLink.getAttribute('aria-expanded'), 'true');
        assert.ok(groupLink.parentElement.classList.contains('show'));
        groupLink.parentElement.querySelector('button').click();
        assert.ok(category.classList.contains('show'), 'back closes only the group');
        assert.ok(!groupLink.parentElement.classList.contains('show'));
    });

    test('runs once, not on desktop, and falls back to the default language', async () => {
        const page = runRecipe(FILE, { html: HTML, edits: EDITS });
        await wait(100);
        page.rerun();
        await wait(100);
        assert.equal(page.document.querySelectorAll('.hh-exp-123-category').length, 1);
        assert.equal(text(page.document.querySelector('.hh-exp-123-group-link')), 'Seating');

        const desktop = runRecipe(FILE, { html: HTML, width: 1200, edits: EDITS });
        await wait(100);
        assert.equal(desktop.document.querySelectorAll('.hh-exp-123-category').length, 0);
    });
});

describe('shared/recipes/cookie-page-variant/variant.js', () => {
    const FILE = 'shared/recipes/cookie-page-variant/variant.js';
    const EDITS = [["name: '[COOKIE_NAME]'", "name: 'AB_TEST1'"], ["endDate: '[YYYY-MM-DD]'", "endDate: '2099-12-31'"]];
    const CONTROL = [...EDITS, ["assignment: 'variant'", "assignment: 'control'"]];

    test('variant sets the cookie and reloads once', async () => {
        const page = runRecipe(FILE, { edits: EDITS });
        await wait();
        assert.equal(page.document.cookie, 'AB_TEST1=b');
        assert.equal(page.reloads(), 1);
        page.rerun();
        await wait();
        assert.equal(page.reloads(), 1, 'no second reload when the cookie is already set');
    });

    test('control removes an existing cookie and reloads, but not twice per session', async () => {
        const page = runRecipe(FILE, { edits: CONTROL, before: (w) => { w.document.cookie = 'AB_TEST1=b; path=/'; } });
        await wait();
        assert.equal(page.document.cookie, '');
        assert.equal(page.reloads(), 1);

        const again = runRecipe(FILE, {
            edits: CONTROL,
            before: (w) => {
                w.document.cookie = 'AB_TEST1=b; path=/';
                w.sessionStorage.setItem('hh-exp-123-reloaded', '1');
            }
        });
        await wait();
        assert.equal(again.reloads(), 0);
    });

    test('no reload on pages outside pathPattern', async () => {
        const page = runRecipe(FILE, { url: 'https://shop.test/c/sale', edits: [...EDITS, ['pathPattern: null', 'pathPattern: /\\/p\\//']] });
        await wait();
        assert.equal(page.document.cookie, 'AB_TEST1=b');
        assert.equal(page.reloads(), 0);
    });

    test('refuses a past end date, an invalid date and a wrong assignment', async () => {
        const past = runRecipe(FILE, { edits: [EDITS[0], ["endDate: '[YYYY-MM-DD]'", "endDate: '2020-01-01'"]] });
        const invalid = runRecipe(FILE, { edits: [EDITS[0], ["endDate: '[YYYY-MM-DD]'", "endDate: '31-12-2026'"]] });
        const wrong = runRecipe(FILE, { edits: [...EDITS, ["assignment: 'variant'", "assignment: 'B'"]] });
        await wait();
        assert.equal(past.document.cookie, '');
        assert.ok(past.logs.some((l) => l.includes('has passed')));
        assert.ok(invalid.logs.some((l) => l.includes('Invalid CONFIG.cookie.endDate')));
        assert.ok(wrong.logs.some((l) => l.includes("must be 'control' or 'variant'")));
    });
});

describe('shared/recipes/plp-grid-switch/variant.js', () => {
    const FILE = 'shared/recipes/plp-grid-switch/variant.js';
    const LISTING = '<div class="toolbar">top</div><div class="products-grid"><div class="grid grid-cols-2"><div>p1</div></div></div><div class="toolbar">bottom</div>';
    const HTML = `<body><main id="l">${LISTING}</main></body>`;
    const EDITS = [["switch: { target: '[SELECTOR]'", "switch: { target: '.toolbar'"], ["switchClick: null", "switchClick: '1001'"], ['existingSwitch: null', "existingSwitch: '.modes'"]];
    const cols = (page) => page.document.documentElement.style.getPropertyValue('--hh-exp-123-cols');

    test('adds a switch per toolbar; clicking changes and stores the columns and fires the goal once', async () => {
        const page = runRecipe(FILE, { html: HTML, edits: EDITS });
        await wait();
        assert.equal(page.document.querySelectorAll('.hh-exp-123-switch').length, 2);
        assert.ok(page.document.querySelector('.grid').classList.contains('hh-exp-123-grid'));
        assert.equal(cols(page), '2');
        page.document.querySelector('.hh-exp-123-switch [data-cols="1"]').click();
        page.document.querySelector('.hh-exp-123-switch [data-cols="1"]').click();
        assert.equal(cols(page), '1');
        assert.equal(page.window.localStorage.getItem('hh-exp-123-cols'), '1');
        // JSON comparison: objects created inside jsdom have a different prototype than test objects
        assert.equal(JSON.stringify(page.window._conv_q), JSON.stringify([{ what: 'triggerConversion', params: { goalId: '1001' } }]));
    });

    test('re-inserts once after an AJAX update and respects the breakpoint', async () => {
        const page = runRecipe(FILE, { html: HTML, edits: EDITS });
        await wait();
        page.document.getElementById('l').innerHTML = LISTING;
        await wait(150);
        assert.equal(page.document.querySelectorAll('.hh-exp-123-switch').length, 2);
        page.resize(800);
        assert.ok(!page.document.documentElement.classList.contains('hh-exp-123-active'));
        page.resize(375);
        assert.ok(page.document.documentElement.classList.contains('hh-exp-123-active'));
    });

    test('does nothing when the site has its own switch, also when it appears later', async () => {
        const atStart = runRecipe(FILE, { html: `<body><main id="l">${LISTING}<div class="modes"></div></main></body>`, edits: EDITS });
        await wait();
        assert.equal(atStart.document.querySelectorAll('.hh-exp-123-switch').length, 0);

        const later = runRecipe(FILE, { html: HTML, edits: EDITS });
        await wait();
        later.document.getElementById('l').insertAdjacentHTML('beforeend', '<div class="modes"></div>');
        await wait(150);
        later.resize(800);
        later.resize(375);
        assert.equal(later.document.querySelectorAll('.hh-exp-123-switch').length, 0);
        assert.ok(!later.document.documentElement.classList.contains('hh-exp-123-active'), 'must stay disabled after resizing');
    });

    test('uses a stored choice and ignores invalid stored values', async () => {
        const stored = runRecipe(FILE, { html: HTML, edits: EDITS, before: (w) => w.localStorage.setItem('hh-exp-123-cols', '1') });
        const invalid = runRecipe(FILE, { html: HTML, edits: EDITS, before: (w) => w.localStorage.setItem('hh-exp-123-cols', '7') });
        await wait();
        assert.equal(cols(stored), '1');
        assert.equal(cols(invalid), '2');
    });
});

describe('magento/recipes/plp-filter-pill-slider/variant.js', () => {
    const FILE = 'magento/recipes/plp-filter-pill-slider/variant.js';
    const HTML = '<body><div class="filter-title"><strong>Filter</strong></div><div class="products wrapper"></div></body>';

    test('shows the pills for the current path and renames the filter button', async () => {
        const page = runRecipe(FILE, { html: HTML, url: 'https://shop.test/category-a.html' });
        await wait(100);
        const pills = page.document.getElementById('hh-exp-123-pills');
        assert.equal(page.document.querySelector('.products.wrapper').previousElementSibling, pills);
        assert.deepEqual([...pills.querySelectorAll('a')].map(text), ['Pill 1', 'Pill 2']);
        assert.equal(text(page.document.querySelector('.filter-title strong')), 'Refine your selection');
    });

    test('does nothing on paths without pills', async () => {
        const page = runRecipe(FILE, { html: HTML, url: 'https://shop.test/other.html' });
        await wait(100);
        assert.equal(page.document.getElementById('hh-exp-123-pills'), null);
    });
});

describe('magento/recipes/checkout-totals-block/variant.js', () => {
    const FILE = 'magento/recipes/checkout-totals-block/variant.js';

    // Fake Magento: RequireJS + a Knockout-like totals observable
    function fakeMagento(state) {
        return (w) => {
            const totals = () => state.totals;
            totals.subscribe = (fn) => { state.subscribers.push(fn); };
            w.checkoutConfig = { totalsData: { quote_currency_code: 'EUR' } };
            w.require = (modules, callback) => callback({ totals });
        };
    }
    const totals = (subtotal, grand) => ({ subtotal, grand_total: grand, total_segments: [{ code: 'grand_total', value: grand }] });

    test('shows the totals, updates them, and survives a Knockout re-render', async () => {
        const state = { totals: totals(40, 48.4), subscribers: [] };
        const page = runRecipe(FILE, { html: '<html lang="nl"><body><div class="pm"><div data-role="checkout-agreements"></div></div></body></html>', before: fakeMagento(state) });
        await wait();
        const block = () => page.document.querySelector('.hh-exp-123-totals');
        assert.equal(text(block()), 'Subtotal excl. VAT€ 40,00 Total incl. VAT€ 48,40');

        state.totals = totals(50, 60.5);
        state.subscribers.forEach((fn) => fn(state.totals));
        assert.match(text(block()), /€ 60,50/);

        page.document.querySelector('.pm').innerHTML = '<div data-role="checkout-agreements"></div>';
        await wait();
        assert.equal(page.document.querySelectorAll('.hh-exp-123-totals').length, 1);
        assert.equal(page.document.querySelector('[data-role="checkout-agreements"]').previousElementSibling, block());
        assert.match(text(block()), /€ 60,50/);
    });
});

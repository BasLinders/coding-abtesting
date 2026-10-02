/**
 * RECIPE: Rebuild the mobile menu into three layers. See README.md in this folder.
 * Layer 1 = new top-level categories, layer 2 = groups (headings), layer 3 = the
 * site's ORIGINAL menu links, moved into the new structure by their ID. The originals
 * are hidden, so links, link texts and tracking attributes keep working.
 */
(function () {
    'use strict';

    /* ================================= CONFIG =================================
     * The only place to change values. Fill in everything marked [LIKE_THIS].
     * Positions: beforebegin = before the target, afterbegin = inside, at the start,
     *            beforeend = inside, at the end, afterend = after the target
     * ========================================================================= */
    const CONFIG = {
        testId: 'hh-exp-123',                               // [TEST_ID]
        debug: false,                                       // true = log to console. Or add ?hh_debug=1 to the URL
        selectors: {
            menu: 'ul.nav.navbar-nav',                      // [SELECTOR] list that holds the top-level menu items
            originalLink: 'a[id="{id}"]',                   // finds an original menu link by ID ({id} is filled in)
            originalItem: '.dropdown-item, .nav-item'       // container of an original link, hidden once the link moved
        },
        insert: {
            categories: { target: 'ul.nav.navbar-nav', position: 'afterbegin' } // [SELECTOR] where the new layer 1 goes
        },
        hide: {
            topLevelIds: ['[ORIGINAL_TOP_LEVEL_LINK_ID]'] // IDs of original top-level links whose menu item is hidden
        },
        // The new menu. Layer 1 key → layer 2 groups → layer 3 original link IDs.
        // Titles and links of layers 1 and 2 are in CONFIG.copy, per language.
        structure: {
            indoor: [
                { heading: 'seating', items: ['[LINK_ID]', '[LINK_ID]'] },
                { heading: 'lighting', items: ['[LINK_ID]', '[LINK_ID]'] }
            ],
            outdoor: [
                { heading: 'seating-outdoor', items: ['[LINK_ID]'] },
                { heading: 'lighting-outdoor', items: ['[LINK_ID]'] }
            ]
        },
        copy: {                                             // [COPY] one block per language code in the URL
            'gb-en': {
                back: 'Back',                               // read out before the panel title on the back button
                viewAll: 'View all',
                categories: {                               // layer 1: same keys as CONFIG.structure
                    indoor: { title: 'Indoor', href: '/indoor' },
                    outdoor: { title: 'Outdoor', href: '/outdoor' }
                },
                headings: {                                 // layer 2: same keys as `heading` in CONFIG.structure
                    seating: { title: 'Seating', href: '/indoor-seating' },
                    lighting: { title: 'Lighting', href: '/indoor-lighting' },
                    'seating-outdoor': { title: 'Seating', href: '/outdoor-seating' },
                    'lighting-outdoor': { title: 'Lighting', href: '/outdoor-lighting' }
                }
            },
            'de-de': {
                back: 'Zurück',
                viewAll: 'Alle ansehen',
                categories: {
                    indoor: { title: 'Indoor', href: '/de-de/indoor' },
                    outdoor: { title: 'Outdoor', href: '/de-de/outdoor' }
                },
                headings: {
                    seating: { title: 'Sitzen', href: '/de-de/sitzmoebel-innen' },
                    lighting: { title: 'Beleuchtung', href: '/de-de/beleuchtung-innen' },
                    'seating-outdoor': { title: 'Sitzen', href: '/de-de/sitzmoebel-aussen' },
                    'lighting-outdoor': { title: 'Beleuchtung', href: '/de-de/aussenbeleuchtung' }
                }
            }
        },
        // Classes copied from the site's own mobile menu, so the new menu looks and opens like the original.
        // Inspect an open submenu of the original menu and copy its classes here.
        siteClasses: {
            open: 'show',                                   // class the site uses for an open submenu
            dropdownItem: 'nav-item dropdown',              // <li> that has a submenu
            categoryLink: 'nav-link dropdown-toggle text-uppercase p font-weight-bold',
            groupLink: 'nav-link dropdown-toggle font-weight-bold p',
            dropdownMenu: 'dropdown-menu',                  // submenu <ul>
            categoryPanel: 'py-0',                          // extra class on the layer 1 submenu <ul>
            panelWrappers: ['menu-container', 'menu-container__items', 'dropdown-items container-md'], // nested <div>s inside it
            caretRight: 'caret-right',
            caretLeft: 'caret-left',
            backItem: 'nav-menu',
            backWrappers: ['close-menu clearfix d-lg-none', 'back pull-left'],
            backButton: 'd-flex align-items-center btn--no-focus text-primary font-weight-bold bg-transparent border-0 text-uppercase p pl-0',
            backText: 'text-back',
            viewAllItem: 'dropdown-item top-category',
            viewAllLink: 'nav-link p font-weight-bold text-primary',
            item: 'dropdown-item p',                        // layer 3 <li>
            itemLink: 'dropdown-link'                       // layer 3 <a>
        },
        settings: {
            maxWidth: 1023,                                 // only run when the screen is at most this wide (px)
            defaultLanguage: 'gb-en',                       // used when the URL has no (known) language code
            languagePattern: /\/([a-z]{2}-[a-z]{2})(?:\/|$)/i, // language code in the path: /gb-en/...
            copyDataAttributes: ['attributeName', 'attributeText'], // data-* attributes copied from original links
                                                                    // (camelCase: data-attribute-name → attributeName)
            timeout: 10000                                  // ms to wait for the menu
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

    // createElement with a class string that may contain several classes
    function createEl(tag, classes = '') {
        const el = document.createElement(tag);
        if (classes) el.className = classes;
        return el;
    }

    /* =============================== VARIATION ================================ */
    const ID_PREFIX = `${CONFIG.testId}-menu`;
    const HIDDEN = `${CONFIG.testId}-hidden`;
    const C = CONFIG.siteClasses;

    function isMobile() {
        return window.matchMedia(`(max-width: ${CONFIG.settings.maxWidth}px)`).matches;
    }

    function isAlreadyApplied() {
        return Boolean(document.querySelector(`[id^="${ID_PREFIX}-"]`));
    }

    function addTestClass() {
        document.documentElement.classList.add(CONFIG.testId);
    }

    function getCurrentLanguage() {
        const { languagePattern, defaultLanguage } = CONFIG.settings;
        const match = window.location.pathname.match(languagePattern);
        const lang = match ? match[1].toLowerCase() : defaultLanguage;
        if (!CONFIG.copy[lang]) {
            log(`No copy for "${lang}", using "${defaultLanguage}"`);
            return defaultLanguage;
        }
        return lang;
    }

    // Looks up layer 1/2 copy in the current language, then in the default language
    function getText(lang, type, key) {
        const text = CONFIG.copy[lang]?.[type]?.[key] ?? CONFIG.copy[CONFIG.settings.defaultLanguage]?.[type]?.[key];
        if (!text) log(`No ${type} copy for "${key}"`);
        return text ?? null;
    }

    function getUiText(lang, key) {
        return CONFIG.copy[lang]?.[key] ?? CONFIG.copy[CONFIG.settings.defaultLanguage][key];
    }

    function findOriginalLink(id) {
        return document.querySelector(CONFIG.selectors.originalLink.replace('{id}', CSS.escape(id)));
    }

    function setOpen(li, panel, link, open) {
        li.classList.toggle(C.open, open);
        panel.classList.toggle(C.open, open);
        link?.setAttribute('aria-expanded', String(open));
    }

    // Opens a submenu when its link is tapped
    function addOpenBehaviour(link, li, panel) {
        link.setAttribute('aria-expanded', 'false');
        link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation(); // keep the site's own menu script from handling this click
            setOpen(li, panel, link, true);
            log(`Opened "${link.textContent.trim()}"`);
        });
    }

    // Back button + "view all" link at the top of every submenu
    function buildPanelHeader(title, href, lang, close) {
        const back = getUiText(lang, 'back');
        const backLi = createEl('li', C.backItem);
        let wrapper = backLi;
        C.backWrappers.forEach((classes) => {
            const div = createEl('div', classes);
            wrapper.insertAdjacentElement('beforeend', div);
            wrapper = div;
        });

        const button = createEl('button', C.backButton);
        button.type = 'button';
        button.setAttribute('aria-label', `${back}: ${title}`); // includes the visible title, so voice control works
        const caret = createEl('span', C.caretLeft);
        const text = createEl('span', C.backText);
        text.textContent = title;
        button.insertAdjacentElement('beforeend', caret);
        button.insertAdjacentElement('beforeend', text);
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            close();
            log(`Closed "${title}"`);
        });
        wrapper.insertAdjacentElement('beforeend', button);

        const items = [backLi];
        if (href) {
            const viewAllLi = createEl('li', C.viewAllItem);
            const viewAll = createEl('a', C.viewAllLink);
            viewAll.href = href;
            viewAll.textContent = getUiText(lang, 'viewAll');
            viewAllLi.insertAdjacentElement('beforeend', viewAll);
            items.push(viewAllLi);
        }
        return items;
    }

    // Layer 3: a new menu item that copies an original link
    function buildItem(original) {
        const li = createEl('li', C.item);
        li.setAttribute('role', 'presentation');
        const link = createEl('a', C.itemLink);
        link.href = original.href;
        link.textContent = original.textContent.trim();
        link.setAttribute('role', 'menuitem');
        CONFIG.settings.copyDataAttributes.forEach((name) => {
            if (original.dataset[name] !== undefined) link.dataset[name] = original.dataset[name];
        });
        li.insertAdjacentElement('beforeend', link);
        return li;
    }

    // Layer 2: a group heading that opens a list of original links. Returns null when none of its links exist.
    function buildGroup(group, categoryHref, lang, moved) {
        const originals = group.items.map((id) => ({ id, link: findOriginalLink(id) }));
        originals.filter((o) => !o.link).forEach((o) => log(`Link not found, skipped: #${o.id}`));
        const found = originals.filter((o) => o.link).map((o) => o.link);
        if (!found.length) {
            log(`Group "${group.heading}" has no links on this page, skipped`);
            return null;
        }

        const heading = getText(lang, 'headings', group.heading);
        const title = heading?.title ?? group.heading;
        const href = heading?.href ?? categoryHref;

        const li = createEl('li', C.dropdownItem);
        const link = createEl('a', `${C.groupLink} ${CONFIG.testId}-group-link`);
        link.href = '#';
        link.textContent = title;
        link.insertAdjacentElement('beforeend', createEl('span', C.caretRight));
        const panel = createEl('ul', C.dropdownMenu);

        buildPanelHeader(title, href, lang, () => setOpen(li, panel, link, false))
            .forEach((item) => panel.insertAdjacentElement('beforeend', item));
        found.forEach((original) => {
            panel.insertAdjacentElement('beforeend', buildItem(original));
            const originalItem = original.closest(CONFIG.selectors.originalItem);
            if (originalItem) moved.add(originalItem);
        });

        li.insertAdjacentElement('beforeend', link);
        li.insertAdjacentElement('beforeend', panel);
        addOpenBehaviour(link, li, panel);
        return li;
    }

    // Layer 1: a top-level category with its groups. Returns null when it has no groups with links.
    function buildCategory(key, groups, lang, moved) {
        const category = getText(lang, 'categories', key);
        const title = category?.title ?? key;
        const href = category?.href ?? null;

        const groupItems = groups.map((group) => buildGroup(group, href, lang, moved)).filter(Boolean);
        if (!groupItems.length) {
            log(`Category "${key}" has no groups with links, skipped`);
            return null;
        }

        const li = createEl('li', `${C.dropdownItem} ${CONFIG.testId}-category`);
        li.id = `${ID_PREFIX}-${key}`;
        const link = createEl('a', C.categoryLink);
        link.href = href ?? '#';
        link.textContent = title;
        const panel = createEl('ul', `${C.dropdownMenu} ${C.categoryPanel}`);

        // Nested wrappers from the site's markup; the items go in the innermost one
        let container = panel;
        C.panelWrappers.forEach((classes) => {
            const div = createEl('div', classes);
            container.insertAdjacentElement('beforeend', div);
            container = div;
        });

        buildPanelHeader(title, href, lang, () => setOpen(li, panel, link, false))
            .forEach((item) => container.insertAdjacentElement('beforeend', item));
        groupItems.forEach((item) => container.insertAdjacentElement('beforeend', item));

        li.insertAdjacentElement('beforeend', link);
        li.insertAdjacentElement('beforeend', panel);
        addOpenBehaviour(link, li, panel);
        log(`Built category "${key}" with ${groupItems.length} group(s)`);
        return li;
    }

    function buildCategories(lang, moved) {
        return Object.entries(CONFIG.structure)
            .map(([key, groups]) => buildCategory(key, groups, lang, moved))
            .filter(Boolean);
    }

    // The first category goes to CONFIG.insert.categories, the others follow it in order
    function insertCategories(categories) {
        let previous = null;
        categories.forEach((li) => {
            if (previous) {
                previous.insertAdjacentElement('afterend', li);
            } else if (!insertAt(li, CONFIG.insert.categories)) {
                return;
            }
            previous = li;
        });
        return Boolean(previous);
    }

    function hideMovedItems(moved) {
        moved.forEach((item) => item.classList.add(HIDDEN));
        log(`Hid ${moved.size} original item(s)`);
    }

    function hideTopLevelItems(menu) {
        CONFIG.hide.topLevelIds.forEach((id) => {
            const item = menu.querySelector(CONFIG.selectors.originalLink.replace('{id}', CSS.escape(id)))
                ?.closest(CONFIG.selectors.originalItem);
            if (item) {
                item.classList.add(HIDDEN);
            } else {
                log(`Top-level item not found: #${id}`);
            }
        });
    }

    function rebuildMenu(menu) {
        const lang = getCurrentLanguage();
        log(`Language: ${lang}`);
        const moved = new Set(); // original items whose links moved into the new menu
        const categories = buildCategories(lang, moved);
        if (!categories.length) {
            log('Nothing to build: no configured links found on this page');
            return;
        }
        // Only hide the originals once the new menu is on the page
        if (!insertCategories(categories)) return;
        hideMovedItems(moved);
        hideTopLevelItems(menu);
        log('Mobile menu rebuilt');
    }

    function init() {
        try {
            log('Variation started');
            if (!isMobile()) {
                log(`Screen wider than ${CONFIG.settings.maxWidth}px, not running`);
                return;
            }
            if (isAlreadyApplied()) {
                log('Menu already rebuilt, skipping');
                return;
            }
            addTestClass();
            waitForElement(CONFIG.selectors.menu)
                .then(rebuildMenu)
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

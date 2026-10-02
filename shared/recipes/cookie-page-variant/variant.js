/**
 * RECIPE: Serve a server-side page variant through a cookie. See README.md in this folder.
 *
 * The testing tool splits visitors into control and variant and runs this script.
 * The cookie is what the SERVER reads to decide which template/page version to render.
 * Paste the SAME code into both variations, and only change CONFIG.assignment:
 *   control → the cookie is removed  → the server renders the current page
 *   variant → the cookie is set      → the server renders the new page
 */
(function () {
  'use strict';

  /* ================================= CONFIG =================================
   * The only place to change values. Fill in everything marked [LIKE_THIS].
   * Keep everything except `assignment` identical in both variations.
   * ========================================================================= */
  const CONFIG = {
    testId: 'hh-exp-123',                           // [TEST_ID]
    debug: false,                                   // true = log to console. Or add ?hh_debug=1 to the URL
    assignment: 'variant',                          // 'control' in the control variation, 'variant' in the variant
    cookie: {
      name: '[COOKIE_NAME]',                        // the name the server checks, agreed with the developer
      value: 'b',                                   // the value that switches the server to the new page
      endDate: '[YYYY-MM-DD]',                      // planned last day of the test. The cookie expires at the end
                                                    // of this day, so nobody sees the variant after the test
      domain: '',                                   // '' = this host only. '.example.com' if the server reads it on subdomains
      path: '/',
      sameSite: 'Lax'
    },
    reload: {
      enabled: true,                                // reload once when the cookie changed, so the server renders the right version
      pathPattern: null,                            // pages where the server renders a different version, e.g. /\/p\// for
                                                    // product pages. null = reload on every page where the cookie changed
      hideTimeout: 3000                             // ms the page stays hidden while reloading (safety net)
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
  function readCookie(name) {
    const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
  }

  function cookieAttributes(expires, domain) {
    const { path, sameSite } = CONFIG.cookie;
    const parts = [`expires=${expires.toUTCString()}`, `path=${path}`, `SameSite=${sameSite}`];
    if (domain) parts.push(`domain=${domain}`);
    if (window.location.protocol === 'https:') parts.push('Secure');
    return parts.join('; ');
  }

  function writeCookie(name, value, expires) {
    document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieAttributes(expires, CONFIG.cookie.domain)}`;
  }

  // Removes the cookie for this host AND for the configured domain: a cookie can only be
  // deleted with the same domain/path it was set with, and it may have been set either way.
  function deleteCookie(name) {
    const past = new Date(0);
    document.cookie = `${name}=; ${cookieAttributes(past, '')}`;
    if (CONFIG.cookie.domain) document.cookie = `${name}=; ${cookieAttributes(past, CONFIG.cookie.domain)}`;
  }

  /* =============================== VARIATION ================================ */
  const RELOAD_KEY = `${CONFIG.testId}-reloaded`;
  const HIDE_CLASS = `${CONFIG.testId}-reloading`;

  function isConfigValid() {
    const { name, endDate } = CONFIG.cookie;
    if (!name || name.startsWith('[')) {
      log('Fill in CONFIG.cookie.name');
      return false;
    }
    if (!['control', 'variant'].includes(CONFIG.assignment)) {
      log(`CONFIG.assignment must be 'control' or 'variant', not "${CONFIG.assignment}"`);
      return false;
    }
    if (CONFIG.assignment === 'variant' && Number.isNaN(getExpiryDate().getTime())) {
      log(`Invalid CONFIG.cookie.endDate "${endDate}". Use YYYY-MM-DD`);
      return false;
    }
    return true;
  }

  // End of the configured last day, in the visitor's local time
  function getExpiryDate() {
    return new Date(`${CONFIG.cookie.endDate}T23:59:59`);
  }

  // Variant: (re)write the cookie on every page view, so a changed endDate (test extended)
  // reaches visitors who already have the cookie. Returns true if the server saw a different value.
  function applyVariant() {
    const { name, value } = CONFIG.cookie;
    const before = readCookie(name);
    const expires = getExpiryDate();
    if (expires < new Date()) {
      log(`endDate ${CONFIG.cookie.endDate} has passed. Cookie not set. Stop the test or update endDate`);
      return false;
    }
    writeCookie(name, value, expires);
    const after = readCookie(name);
    if (after !== value) {
      log('Cookie could not be set (blocked by the browser or a consent tool?)');
      return false;
    }
    log(`Cookie ${name}=${value} set until ${expires.toString()}${before === value ? ' (already set)' : ''}`);
    return before !== value;
  }

  // Control: remove the cookie, so visitors who were in the variant before get the current page.
  // Returns true if the server saw the cookie on this request.
  function applyControl() {
    const { name } = CONFIG.cookie;
    const before = readCookie(name);
    if (before === null) {
      log(`No ${name} cookie present, nothing to remove`);
      return false;
    }
    deleteCookie(name);
    if (readCookie(name) !== null) {
      log(`Cookie ${name} could not be removed. Check CONFIG.cookie.domain and path`);
      return false;
    }
    log(`Cookie ${name} (was "${before}") removed`);
    return true;
  }

  function isReloadPage() {
    const { pathPattern } = CONFIG.reload;
    return !pathPattern || pathPattern.test(window.location.pathname);
  }

  // Never reload more than once per session: if the server ignores the cookie,
  // a second reload would turn into a loop.
  function hasReloadedThisSession() {
    try {
      return sessionStorage.getItem(RELOAD_KEY) === '1';
    } catch (err) {
      return true; // no sessionStorage = no way to guard against a loop, so don't reload
    }
  }

  function reloadOnce() {
    try {
      sessionStorage.setItem(RELOAD_KEY, '1');
    } catch (err) {
      return;
    }
    document.documentElement.classList.add(HIDE_CLASS); // variant.css hides the page meanwhile
    setTimeout(() => document.documentElement.classList.remove(HIDE_CLASS), CONFIG.reload.hideTimeout);
    log('Reloading so the server can render the right version');
    window.location.reload();
  }

  function reloadIfNeeded(cookieChanged) {
    if (!cookieChanged) return;
    if (!CONFIG.reload.enabled) {
      log('Cookie changed. Reload disabled, the next page view shows the right version');
      return;
    }
    if (!isReloadPage()) {
      log('Cookie changed, but this page has no server-side variant. No reload needed');
      return;
    }
    if (hasReloadedThisSession()) {
      log('Already reloaded once this session, not reloading again');
      return;
    }
    reloadOnce();
  }

  function init() {
    try {
      log(`Variation started as "${CONFIG.assignment}"`);
      if (!isConfigValid()) return;
      const cookieChanged = CONFIG.assignment === 'variant' ? applyVariant() : applyControl();
      reloadIfNeeded(cookieChanged);
    } catch (err) {
      log('Error', err);
    }
  }

  // Standard start-up (rule 5). Cookies don't need the DOM, so this only delays the
  // reload until DOMContentLoaded, which is usually a fraction of a second.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

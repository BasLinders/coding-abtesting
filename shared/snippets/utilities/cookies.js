/**
 * SNIPPET: Read and write cookies
 *
 * WHEN TO USE
 *   - Remember something across page views: a dismissed banner, or which variant
 *     a visitor saw, so a preloaded/server-side experience can pick it up.
 *   - Run a change only on the first visit, or only after a certain action.
 *
 * PITFALLS
 *   - Cookies count as storage under GDPR/ePrivacy. Functional cookies for the
 *     test itself are usually fine, but check the client's cookie policy.
 *   - Prefix the name with the test ID so it never clashes with site cookies.
 *   - For values that only the variation needs, localStorage is often simpler
 *     (wrap it in try/catch, since it can throw in private mode).
 *
 * WORKS WITH: all platforms
 */

function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.split('; ').find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Usage: store the variant for a preloaded experience, only the first time
const COOKIE_NAME = 'hh_exp_123_variant';
if (getCookie(COOKIE_NAME) === null) {
  setCookie(COOKIE_NAME, 'A', 60);
}

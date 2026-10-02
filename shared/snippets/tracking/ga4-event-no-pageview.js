/**
 * SNIPPET: Send a GA4 event without an extra page view
 *
 * WHEN TO USE
 *   You need a GA4 event (e.g. to build an audience per variant) on a site where
 *   gtag is not loaded, or is loaded by GTM without a direct gtag() function.
 *
 * PITFALLS
 *   - `send_page_view: false` is essential. Without it every visitor in the test
 *     sends a second page view and inflates the site's analytics.
 *   - If the site already has gtag set up, you only need the last line.
 *   - If GA4 runs through GTM, a dataLayer push and a GTM trigger is usually
 *     cleaner. Check with whoever manages the GTM container.
 *   - Track conversion goals for the experiment with the testing tool's own goal
 *     API (see _base-context.md), not with GA4.
 *
 * WORKS WITH: all platforms
 */

window.dataLayer = window.dataLayer || [];
// gtag needs the real `arguments` object (a ...rest array is ignored by GA), so this one function stays old-style
function gtag() { window.dataLayer.push(arguments); } // eslint-disable-line prefer-rest-params
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX', { send_page_view: false });
gtag('event', 'hh_exp_123_variant_1');

// Alternative through GTM (needs a matching trigger in the container)
window.dataLayer.push({ event: 'hh_experiment', experiment_id: 'hh_exp_123', variant: 'variant_1' });

# Recipe: Serve a server-side page variant through a cookie

**Works with:** all platforms, as long as a developer has built a server-side switch that reads a cookie · **Difficulty:** medium (the code is simple, the setup and QA are not)

## When to use this
The change is too big for client-side JavaScript: a new product page template, a different checkout flow, a redesigned page. A developer builds the new version on the server and makes it switchable with a cookie (e.g. `AB_TEST1=b` → new template). The testing tool only decides **who** gets which version, and sets or removes the cookie.

```
Testing tool assigns visitor (50/50)
  ├─ control → this script removes the cookie → server renders the current page
  └─ variant → this script sets the cookie    → server renders the new page
```
Analytics (e.g. BigQuery) can read the same cookie for attribution, which is why the control **actively removes** it: the cookie must always match the testing tool's current assignment.

## Hypothesis example
> Because the current product page buries the key product information below the fold on mobile, we expect that the new product page template (with the information next to the image) will increase the add-to-cart rate.

## How to set it up
1. **Agree with the developer** on the cookie name, the value that triggers the new version, which pages it affects, and whether the cookie must work across subdomains (`domain`). Ask whether the server sets or reads the cookie as `HttpOnly`. JavaScript can't see or remove `HttpOnly` cookies.
2. **Paste the same `variant.js` into both variations.** Change only `assignment`: `'control'` in the control, `'variant'` in the variant. Use the same `CONFIG` everywhere else.
3. **Paste `variant.css` into both variations.**
4. Set **`endDate`** to the planned last day of the test, and **`pathPattern`** to the pages that have a server-side variant.
5. **Target the test on every page** where a visitor can enter the site, not only on the pages that change. The cookie should be set before the visitor reaches the changed page.

## Prompt
```
Set up a cookie-based page variant using the cookie-page-variant recipe.

Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Cookie name: [NAME]   Value for the new version: [VALUE]
Planned last day of the test: [YYYY-MM-DD]
Cookie domain: [this host only / .example.com]
Pages with a server-side variant: [e.g. all product pages: URLs look like ...]
Reload on the first page view: [yes / no]
```

## Analysis of the original test
This recipe was extracted from a working two-variant setup. These are the changes and why:

| Original | In this recipe | Why |
|---|---|---|
| Control called `deleteCookie()` without defining it | Each variation is self-contained, with the same code and helpers | Unless `deleteCookie` happened to exist globally, the control threw a `ReferenceError` and never removed the cookie |
| Cookie lifetime: `60` days (advice: test duration − 1 day) | Fixed **end date** (`endDate`) | Days count from **each visitor's** first visit. A visitor who first arrives on the last day kept the new template for ~60 days after the test. An end date expires every cookie at the same moment. |
| Cookie only set when missing | Re-written on every page view | An outdated value was never corrected, and if the test is extended, existing cookies now get the new end date |
| First page view in the variant showed the **old** page | Optional one-time reload (`reload`) | The server renders the page **before** the script runs, so it only sees the new cookie on the next request. Visitors who bounce after one page were counted as variant but saw the control. The same happened in reverse after reassignment to the control. |
| Two separate scripts | One script, `assignment` switch | Cookie name, end date and domain can't drift apart between the variations |
| No check whether the cookie was really set or removed | Checked and logged | A consent tool, browser setting or wrong `domain` fails without any error |
| No `Secure` attribute | Added automatically on HTTPS | Best practice for cookies on HTTPS sites |

## The first page view and the reload
Without a reload, the first page a new visitor sees is always the current version, even in the variant. Whether that matters depends on the test:
- **Changed page is usually not the entry page** (e.g. checkout): set `reload.enabled: false`. By the time visitors reach it, the cookie is there.
- **Changed page is often the entry page** (e.g. product pages from ads): keep the reload on and set `pathPattern`. The script reloads **once per session**, only when the cookie actually changed and only on matching pages. `variant.css` hides the page meanwhile.

Costs of the reload to discuss with the team:
- **An extra page view in analytics** for the reloaded page. Filter it out or accept it, but treat it the same way in both variations. The control reloads too, after a reassignment.
- **Slower first page view** in the reloaded case. Check that the server-side variant is cached separately per cookie value, so the reload is fast.
- **The guard against loops:** if the server ignores the cookie, the script reloads once and then stops. With sessionStorage unavailable, it never reloads.

## Pitfalls
- **Caching (CDN / full page cache).** If the cache doesn't vary on this cookie, visitors get whichever version was cached first. The developer must exclude the cookie from caching, or make the cache vary on it. This is the most common reason "the test doesn't work".
- **Consent tools** may block or delete non-essential cookies. Check with the client whether this cookie is classed as functional, and test with consent both accepted and refused.
- **`HttpOnly` cookies** can't be read or removed by JavaScript. The server must not set the cookie as `HttpOnly`.
- **Subdomains.** If the shop and the checkout are on different subdomains, set `domain: '.example.com'` and check that removing it works (the debug log reports a failed removal).
- **After the test:** stop the test **before** `endDate`, or update `endDate` if the test runs longer. When the winner is the new version, the developer makes it the default and removes the cookie switch.
- **Don't run other tests on the changed pages** that depend on the old template's HTML.

## QA
- [ ] Variant: on the first page view the cookie is set (DevTools → Application → Cookies) with the right value, domain and expiry date
- [ ] Variant: the changed page shows the new version, also when it's the entry page (if `reload` is on)
- [ ] Control: an existing cookie is removed and the current version is shown
- [ ] Switch variations with the tool's preview/force options: the cookie follows every switch
- [ ] No reload loop: with `?hh_debug=1`, the console shows at most one "Reloading" per session
- [ ] Logged in and logged out, consent accepted and refused
- [ ] Analytics/BigQuery receives the cookie value as expected

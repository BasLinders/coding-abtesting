# QA checklist: before every launch

Go through this list for **every** test, in addition to the test-specific steps the LLM gives you. If an item fails and you don't know why, ask a developer before launching.

## 1. It works
- [ ] The change is visible in the variant preview, on every page/template it targets (e.g. several product pages: simple, configurable/variable, on sale, out of stock)
- [ ] The **control** looks exactly like the live site
- [ ] It still works after a **hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) and in a **private window**
- [ ] It still works after **interacting**: choosing a variant/size, adding to cart, opening the cart drawer, filtering, "load more", switching payment/shipping method
- [ ] Nothing appears **twice**. Navigate back and forth, and, if you can, run the variation JS again in the console

## 2. Nothing broke
- [ ] **Console** (F12 → Console): no new red errors
- [ ] The site's own key actions still work: add to cart, search, menu, checkout, forms
- [ ] No **flicker**: the original version doesn't flash before the change
- [ ] No **layout jump** when the change appears
- [ ] Pages outside the test's targeting are unchanged

## 3. Devices and browsers
- [ ] Mobile (375px wide; use a real phone for touch/scroll behaviour)
- [ ] Tablet and desktop
- [ ] Chrome, Safari (especially iOS Safari) and Firefox
- [ ] Logged in and logged out (if the site has accounts)

## 4. Content and accessibility
- [ ] Copy is correct and in the right language(s), with no placeholders like `[COPY]` left
- [ ] Claims are true (prices, delivery times, ratings, deadlines)
- [ ] Keyboard: you can Tab to new buttons/links and the focus is visible
- [ ] Text is readable (contrast) and not cut off

## 5. Tracking
- [ ] Goals fire. Check in the testing tool's preview/debug mode, or with the network tab / GA4 DebugView
- [ ] Goals fire **once** per action, not twice
- [ ] The site's own analytics still work (no extra page views)

## 6. Housekeeping
- [ ] Debug logging is off (`isEnabled: false`), or only enabled through `?hh_debug=1`
- [ ] Test ID and naming are consistent (`hh-exp-123` in classes, IDs, goals)
- [ ] Code and CSS are saved in the test documentation / ticket
- [ ] If you improved the code or found a new pitfall: add it to this repository

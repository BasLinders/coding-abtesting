# Recipe: Trustpilot widget

**Works with:** all platforms · **Difficulty:** easy

## Hypothesis example
> Because visitors hesitate at the payment step when they are unsure whether the shop is trustworthy, we expect that showing the Trustpilot rating next to the payment methods will increase checkout completion.

## What it does
Loads Trustpilot's bootstrap script (only if the site doesn't load it already) and inserts a TrustBox at a chosen place.

## What you need before you start
- [ ] Trustpilot **template ID** and **business unit ID** (from the client's Trustpilot account, or copy them from an existing TrustBox on the site)
- [ ] Locale (`nl-NL`, `de-DE`, …)
- [ ] The selector of the element to place the widget next to, and where (before/after/inside)

## Prompt
```
Add a Trustpilot widget using the trustpilot-widget recipe.

Platform: [PLATFORM]
Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Place it [after / before / inside] this element: [SELECTOR]
Template ID: [ID]   Business unit ID: [ID]   Locale: [LOCALE]
Review page URL: [URL]

HTML around the target element:
[PASTE HTML]
```

## Pitfalls
- **The script is already on the page.** Trustpilot only scans for widgets once. The recipe calls `Trustpilot.loadFromElement()` so a widget added later still renders.
- **CSP.** Some checkouts block third-party scripts. Check the console for "Refused to load".
- **Checkout pages on Shopify** cannot be changed by A/B testing tools. See `shopify/_platform-context.md`.
- **Layout shift.** The CSS reserves height, so adjust `min-height` to match the template.

## QA
- [ ] The widget renders (not just the "Trustpilot" fallback link)
- [ ] Correct language
- [ ] Inserted once only
- [ ] No console errors

# Recipe: Copy in the visitor's language, based on the URL path

**Works with:** all platforms · **Difficulty:** easy

## Hypothesis example
> Because the "Add to cart" button and USP texts are generic, we expect that market-specific copy (e.g. "basket" for UK visitors, local free-shipping thresholds) will increase the add-to-cart rate in every market.

## What it does
Reads the language code from the URL path (for example `/gb-en/`, `/de-de/`, `/fr-fr/`), picks that language's copy from `CONFIG.copy`, and puts it in the configured elements. If the code is missing or there is no copy for it, it uses `CONFIG.settings.defaultLanguage`. Elements that appear later, or that the site re-renders, get the right copy as well.

Use this as the starting point for any test that runs on several language versions of a site whose URLs contain a `country-language` code. To **insert** new elements with localised copy, keep `getCurrentLanguage()` and add an insertion as in the skeleton in `_base-context.md`.

## What you need before you start
- [ ] The URL format. Open the site in two languages and compare the paths. This recipe expects `/xx-xx/` (e.g. `/gb-en/`). For other formats, see Pitfalls.
- [ ] The selectors of the elements whose text should change
- [ ] The copy for every language the test runs in
- [ ] Which language is the fallback

## Prompt
```
Build a multi-language copy test using the language-from-pathname recipe.

Platform: [PLATFORM]
Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Example URLs: [https://www.example.com/gb-en/..., https://www.example.com/de-de/...]
Default language: [gb-en]
Elements and copy per language:
  [name]: [SELECTOR]
    gb-en: "[COPY]"
    de-de: "[COPY]"

HTML of the elements:
[PASTE HTML]
```

## How the language is detected
```js
CONFIG.settings.languagePattern = /\/([a-z]{2}-[a-z]{2})(?:\/|$)/i
```
| Path | Result |
|---|---|
| `/gb-en/products/shoe` | `gb-en` |
| `/DE-DE/` | `de-de` (case doesn't matter) |
| `/fr-fr` (no slash at the end) | `fr-fr` |
| `/products/shoe` | default language |
| `/es-es/` but no `es-es` in `CONFIG.copy` | default language |

## Pitfalls
- **Other URL formats.** Change `languagePattern` and keep one capture group:
  - `/en/` (language only): `/\/([a-z]{2})(?:\/|$)/i`
  - `/en-gb/` (language first): same pattern, but use `en-gb` style keys in `CONFIG.copy`
  - Subdomains (`de.example.com`) or `?lang=de` aren't in the path. Ask the LLM to read `location.hostname` or `URLSearchParams` instead.
- **False matches.** A product URL like `/products/ab-cd/` would also match `[a-z]{2}-[a-z]{2}`. The fallback check (no copy for `ab-cd` → default) prevents wrong copy, but if the site has such URLs, anchor the pattern to the start of the path: `/^\/([a-z]{2}-[a-z]{2})(?:\/|$)/i`.
- **Text controlled by a framework** (Alpine on Hyvä, React on SPAs) should not be changed directly. Use the hide-and-replace pattern from `magento-hyva/snippets/alpine-persistent-change.js` instead.
- **Elements with child elements** (an icon inside the button): setting `textContent` removes the icon. Point the selector at the inner text element (e.g. `button span`).
- **SPA language switch without a page load**: the language is read once at start-up. Use `spa/snippets/url-change-listener.js` to re-run it.

## QA
- [ ] Every configured language shows its own copy (check one URL per language)
- [ ] A URL without a language code shows the default copy
- [ ] Copy is also correct in elements that load later (e.g. after choosing a variant, opening the cart drawer)
- [ ] With `?hh_debug=1`, the console shows the detected language and every text change

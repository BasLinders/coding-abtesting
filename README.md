# A/B test problem-solving repository

Building blocks for coding client-side A/B tests with the help of AI. You don't have to be a developer to use it. Describe the change, paste the site's HTML, and an LLM writes the JavaScript and CSS for you, based on solutions that have been tested on real client sites.

## How it works
| | What it is | Example |
|---|---|---|
| **`_base-context.md`** | Team conventions for the LLM: output format, code rules, testing tools (Convert, Varify, Kameleoon) | "vanilla JS only", "goal code for Kameleoon" |
| **`_platform-context.md`** (per platform) | The rules and pitfalls of that platform | "Alpine re-renders: use a WeakSet" |
| **Recipes** | Complete test builds, with a ready-made prompt | countdown banner, checkout totals block |
| **Snippets** | Solutions to one specific problem | wait for an element, debounce, detect cart changes |
| **`qa-checklist.md`** | What to check before every launch | |

## Structure
```
_base-context.md          ← instructions for every Claude Project
qa-checklist.md           ← check before every launch
_templates/               ← templates for new recipes and snippets
docs/                     ← roadmap

shared/                   ← works on every platform
  snippets/               timing · performance · debugging · tracking · dom · utilities
  recipes/
magento/                  ← Magento 2 with Luma (RequireJS, Knockout)
magento-hyva/             ← Magento 2 with Hyvä (Alpine.js, Tailwind)
wordpress/                ← WordPress + WooCommerce
shopify/                  ← Shopify Online Store 2.0 themes
spa/                      ← single-page apps (React, Next.js, Vue, ...): no reliable class names
```
Each platform folder contains `_platform-context.md`, `snippets/` and `recipes/`.

## Setting up the Claude Projects (one-time, per platform)
Create **one Claude Project per platform** so the LLM only sees the solutions that apply:

1. In Claude, go to **Projects → Create project**, e.g. "A/B tests – Shopify".
2. **Instructions**: paste the contents of `_base-context.md`, followed by the platform's `_platform-context.md`.
3. **Project knowledge**: upload the files from `shared/` and from the platform folder (e.g. `shopify/`), plus `qa-checklist.md`.
4. When this repository changes, update the project knowledge files (or re-upload the changed files).

For a site that is both a platform and an SPA (e.g. a headless Shopify front-end), add the `spa/` files as well.

## Building a test (every time)
1. Open the Claude Project for the site's platform.
2. Find a matching recipe and copy its **Prompt** block, or simply describe what you want. Claude will look for matching recipes and snippets itself.
3. Fill in the placeholders. Always include:
   - **testing tool** and **test ID** (`hh-exp-123`)
   - the **HTML** of the area you want to change: right-click the element → *Inspect* → right-click the highlighted element in DevTools → *Copy* → *Copy outerHTML*
   - the exact **copy** and the **goal** to track
4. Paste the **JavaScript** into the variation's JS field and the **CSS** into the CSS field.
5. Preview, and work through `qa-checklist.md` plus the test-specific steps Claude gives you.
6. Something doesn't work? Tell Claude exactly what you see (and paste console errors). If you're stuck, ask a developer.

## Team conventions (short version)
- **Vanilla JavaScript only.** No jQuery, no Angular, even if the site loads them.
- **Test ID everywhere**: class on `<html>` (`hh-exp-123`), and as prefix for every new class/ID (`hh-exp-123-banner`).
- **JS and CSS separate**, in the tool's own fields.
- **Re-rendered content** (Alpine, React, cart drawers, checkouts) uses the **MutationObserver + WeakSet** pattern.

## Roadmap
See [docs/roadmap.md](docs/roadmap.md) for what's done and what's next.

## Contributing
Found a better solution, or a new pitfall? Add it, so the next test benefits.
- **New snippet**: copy `_templates/snippet-template.js` into the right `snippets/` folder. Platform-independent code goes in `shared/`.
- **New recipe**: create a folder in `recipes/` with `README.md` (from `_templates/recipe-template.md`), `variant.js` and `variant.css`.
- Remove client names, client copy and client-specific URLs before committing. Use placeholders like `[SELECTOR]` and `[COPY]`.
- Update the recipe table in the folder's `recipes/README.md`.

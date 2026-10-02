# Recipe: Grid switch on product listing pages

**Works with:** all platforms where the product grid uses CSS grid (originally built for a Magento Hyvä shop with Tweakwise navigation) · **Difficulty:** medium

## Hypothesis example
> Because product images on mobile category pages are small in the two-column grid, visitors can't judge products without opening them. We expect that letting visitors switch to a one-column view will increase the click-through rate to product pages and the add-to-cart rate.

## What it does
- Adds a button group (one button per option in `CONFIG.options`, e.g. 1 and 2 columns) next to every toolbar above the product grid.
- Clicking a button changes the number of columns. The choice is stored in `localStorage` and applied on every listing page.
- **Does nothing if the site already has its own grid switch** (`selectors.existingSwitch`), also when that switch is rendered later.
- Only shows and applies the switch up to `settings.maxWidth` (e.g. mobile only). It follows rotation and resizing, and `null` means all widths.
- Re-inserts the switch after AJAX updates of the listing (filtering, sorting, paging), and fires an optional goal on every switch.

## What you need before you start
- [ ] Selector of the **toolbar** (or other element) the switch should appear next to, and where (`position`)
- [ ] Selector of the **grid element**: the element whose classes set the columns (e.g. `grid grid-cols-2`). In DevTools, it's the parent of the product cards and has `display: grid`.
- [ ] Selector of the site's **own grid switch**, if it has one on some pages or devices
- [ ] The column options and the breakpoint
- [ ] Goal ID for switch clicks (optional)

## Prompt
```
Add a grid switch to the product listing pages using the plp-grid-switch recipe.

Platform: [PLATFORM]
Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Place the switch [after / before / inside] the toolbar: [SELECTOR]
Grid element: [SELECTOR]
Site's own grid switch (if any): [SELECTOR or "none"]
Options: [1 and 2 columns]   Default: [2]   Only up to: [599 px / all screen sizes]
Goal for switch clicks: [GOAL_ID or "none"]

HTML of the toolbar and the start of the product grid:
[PASTE HTML]
```

## Analysis of the original test
This recipe was extracted from a working test. That test already handled the hard parts well: a delegated click handler, re-inserting after Tweakwise AJAX updates, safe `localStorage` access and a guard against running twice. These are the changes made for the recipe:

| Original | In this recipe | Why |
|---|---|---|
| No check for an existing grid switch | `selectors.existingSwitch`: the test does nothing, or switches itself off if the native switch appears later | The recipe's goal: only add a switch where the site has none |
| CSS injected from JS, with the grid selector and breakpoint inside it ("keep in sync with the media query") | `variant.css` with no site selectors or numbers in it: JS marks the grid with a class and sets an "active" class below `maxWidth` | One place for every value (`CONFIG`), and CSS stays in the CSS field |
| Fixed CSS rules for 1 and 2 columns | `CONFIG.options` + a CSS custom property (`--hh-exp-123-cols`) | Adding a 3-column option is one line in `CONFIG` |
| Mobile check only logged once, CSS media query for the rest | `matchMedia` listener | Rotating a tablet or resizing switches the test on/off correctly |
| Duplicate check via `nextElementSibling` | Map of toolbar → switch, re-inserted when removed | Works for every `position`, and also when the toolbar's content is re-rendered |
| Convert goal: `_conv_q.push(['triggerConversion', id])` | Documented `{ what: 'triggerConversion', params: { goalId } }`, plus Kameleoon and Varify | Older syntax; check your existing tests. Works with all three tools. |
| Global `window.__abColSwitch` | `window.__hhExp['hh-exp-123']` | One namespaced global for all tests |
| Debug `isEnabled: true`, English aria-labels in the markup | `debug: false` + `?hh_debug=1`, labels in `CONFIG` | Team conventions; labels can be translated |
| Separate warn/error log styles | The standard `log()` | One debug mechanism for every test (rule 3) |
| Inactive icon `#d1d5db` (1.5:1 contrast on white) | `#6b7280` (4.8:1) + an underline on the active option | The inactive option was barely visible, and the active state relied on colour alone |
| `localStorage` key `plpMobileCols` | `hh-exp-123-cols` (`settings.storageKey`) | Prefixed with the test ID. **When moving a live test to this recipe, keep the old key**, or returning visitors lose their choice. |

## Pitfalls
- **The grid selector.** Point it at the element with `display: grid`, not at a wrapper. If the columns don't change, the debug log says whether the grid was found.
- **Layout of the cards in one column.** Product cards are designed for narrow columns. Check image ratio, title length, price and badges in the one-column view, and add CSS under `.hh-exp-123-active .hh-exp-123-grid` if needed.
- **Lazy-loaded images.** Images may load at the small size and look blurry when the column gets wider. Check `srcset`/`sizes` on the site, and test on a real phone.
- **Tweakwise / Alpine / AJAX navigation** replaces the toolbar and grid. The observer re-inserts the switch and re-tags the grid. If it doesn't, set `observers.listing.root` to the listing container.
- **Infinite scroll / "load more"** adds cards to the existing grid. That works automatically, because the CSS applies to the whole grid.
- **The choice persists across the session and later visits** (`localStorage`). For a clean test, the control must not have the switch, and the goal must only fire on actual switches. Both are covered by the recipe.

## QA
- [ ] The switch appears next to every configured toolbar, within `maxWidth` only, and not at all on pages with the site's own switch
- [ ] Both options change the grid, and the active option is visibly marked
- [ ] The choice is kept on the next page, and after reloading
- [ ] Filtering, sorting and paging: the switch stays (once) and the column choice stays applied
- [ ] Rotating the phone / resizing past `maxWidth` hides the switch and restores the site's own columns
- [ ] Keyboard: Tab to the buttons, the focus outline is visible, and Enter/Space switches
- [ ] Goal fires once per switch, and not when tapping the already active option

# Recipe: Category pill slider

**Works with:** magento (Luma). Easy to adapt to any platform, since it uses no Magento APIs · **Difficulty:** easy

## Hypothesis example
> Because visitors on broad category pages struggle to narrow down the assortment with the filter sidebar (especially on mobile), we expect that showing popular sub-categories as tappable pills above the product grid will increase product page views and add-to-cart rate.

## What it does
Adds a horizontally scrollable row of pill links above the product grid, with a different set per category URL. It uses CSS scroll-snap: swipe on touch devices, arrow buttons on desktop. Optionally renames the filter button.

The previous version of this recipe used the slick (jQuery) slider through RequireJS. That is no longer needed.

## What you need before you start
- [ ] The category URLs and, per URL, the pills (label + link)
- [ ] Selector of the element the pills should appear above
- [ ] Optional: new copy for the filter button

## Prompt
```
Build a category pill slider using the magento plp-filter-pill-slider recipe.

Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Insert above: [SELECTOR]
Pills per category:
  [URL PATH] → [label: link], [label: link], ...
Rename filter button to: [COPY or "no"]
Design: [match the site's buttons / describe]

HTML around the product grid:
[PASTE HTML]
```

## Pitfalls
- **Links vs filters.** Pills that link to sub-category pages are simple. Pills that apply a layered-navigation filter need the filter URL (`?color=12`). Copy it from the address bar after applying the filter manually.
- **Layered navigation via AJAX** (some extensions): the product grid is replaced without a page load. Check whether the pills are still there after filtering.
- **Scroll position on iOS.** Keep `-webkit-overflow-scrolling: touch` and test on a real device.

## QA
- [ ] The right pills on each configured URL, and none elsewhere
- [ ] Swipe works on mobile, arrows work on desktop and hide at the ends
- [ ] Keyboard: Tab moves through the pills
- [ ] Filter button copy changed (if configured)

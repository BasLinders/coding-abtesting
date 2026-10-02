# Recipe: CTA button on product cards

**Works with:** all platforms (for Hyvä and SPAs, also read that folder's `_platform-context.md`) · **Difficulty:** easy

## Hypothesis example
> Because visitors on the category page don't recognise that a product card is clickable, we expect that adding a visible "View this product" button to each card will increase the click-through rate to product pages.

## What it does
Adds a button-styled label to every product card, including cards that appear later through infinite scroll, "load more" or filters. The copy follows the page language.

## What you need before you start
- [ ] Selector for **one product card**
- [ ] Selector for the product link inside the card
- [ ] CTA copy, per language if the site has several
- [ ] HTML of one product card (right-click → Inspect → right-click the card element → Copy → Copy outerHTML)

## Prompt
```
Add a CTA button to every product card using the product-card-cta recipe.

Platform: [PLATFORM]
Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Card selector: [SELECTOR]
CTA copy: [COPY, per language]
Where in the card: [below the price / bottom of the card / ...]
Design: [describe or match the site's primary button]
Goal to track: [clicks on the CTA / clicks on the card]

HTML of one product card:
[PASTE HTML]
```

## Pitfalls
- **Nested links.** Never put an `<a>` or `<button>` inside the existing product link. That is invalid HTML and breaks keyboard navigation. The recipe uses a `<span>` inside the link.
- **Cards that load later.** Polling only catches the first batch. The recipe uses a MutationObserver with a WeakSet.
- **Equal card heights.** Adding a button can make cards uneven. Check the grid with long and short product names.

## QA
- [ ] Button on every card, including after "load more", filtering and sorting
- [ ] Only one button per card
- [ ] Clicking the button goes to the product page
- [ ] Correct language on each locale
- [ ] Keyboard: Tab through the cards, the focus style is visible

# Recipe: USP block on the product page

**Works with:** all platforms · **Difficulty:** easy

## Hypothesis example
> Because visitors on the product page miss the shop's key benefits (shown only in the header), we expect that showing a USP list right below the add-to-cart button will increase the add-to-cart rate.

## What it does
Builds a USP list near the add-to-cart button. It can copy items from an existing USP list on the site (so icons and wording match) and add new ones. Existing USP blocks that it replaces are hidden with CSS.

## What you need before you start
- [ ] Selector of the existing USP list to copy, if there is one, and which items to keep
- [ ] New USP copy (and phone number/links)
- [ ] Selector of the element the block should appear after (usually the add-to-cart form)
- [ ] Selectors of blocks to hide

## Prompt
```
Build a USP block on the product page using the pdp-usp-block recipe.

Platform: [PLATFORM]
Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Copy USPs from: [SELECTOR or "none"], keep items: [positions]
New USPs: [list]
Place after: [SELECTOR]
Hide: [SELECTORS]

HTML of the add-to-cart area and the existing USP list:
[PASTE HTML]
```

## Pitfalls
- **Cloned IDs.** Cloning an element that has an `id` creates duplicate IDs. The recipe removes them.
- **Claims must be true.** "Customers rate us 9.3" needs a current, verifiable source.
- **Hiding through CSS scoped under the test class** means nothing is hidden if the JS fails. That's safer than hiding it unconditionally.

## QA
- [ ] Block appears once, in the right place, on several product types (simple, configurable, out of stock)
- [ ] Old blocks hidden in the variant, still visible in the control
- [ ] Links (tel:, review page) work
- [ ] Mobile layout

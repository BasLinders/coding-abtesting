# Recipe: Totals summary above the place-order button

**Works with:** magento (Luma checkout) · **Difficulty:** medium

## Hypothesis example
> Because B2B buyers want to check the amount excluding VAT right before ordering, and the totals sidebar is far from the place-order button, we expect that showing subtotal excl. VAT and total incl. VAT above the order button will increase checkout completion.

## What it does
Inserts a small totals block above the checkout agreements, just before the place-order button. Values come from Magento's checkout model (`quote.totals()`), so they update when the shipping method or a discount changes. The block survives Knockout re-renders when the visitor switches payment method.

## What you need before you start
- [ ] Which checkout the site uses: the standard Luma checkout or a third-party one (OneStepCheckout, Amasty, MaxServ, …)
- [ ] The HTML around the place-order button for one payment method
- [ ] Labels and the values to show

## Prompt
```
Build a checkout totals block using the magento checkout-totals-block recipe.

Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Checkout: [Luma default / name of third-party checkout]
Show: [subtotal excl. VAT, total incl. VAT, shipping, ...]
Labels: [COPY]
Insert before: [SELECTOR, default: the checkout agreements]

Output of `require('Magento_Checkout/js/model/quote').totals()` in the console on the payment step:
[PASTE JSON]

HTML around the place-order button:
[PASTE HTML]
```

## Pitfalls
- **Third-party checkouts.** Some do not use `Magento_Checkout/js/model/quote`, or wrap it. Paste the console output into the prompt so the LLM uses the real data. (The original version of this recipe read the totals from a checkout extension's `window` config object. Check `window` for an object like that.)
- **One agreements block per payment method.** Luma renders one inside each payment method's content and hides the unselected ones. The recipe inserts a block next to each, so only the selected method's block is visible.
- **Tax display settings.** Whether `grand_total` includes tax depends on the store config. The recipe uses the `grand_total` total segment, which matches what the sidebar shows.

## QA
- [ ] Values match the order summary sidebar
- [ ] They update after changing the shipping method and after applying a discount code
- [ ] The block stays when switching between payment methods, and is not duplicated
- [ ] Logged in and guest checkout

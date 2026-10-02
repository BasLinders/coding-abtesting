# Recipe: Countdown banner

**Works with:** all platforms · **Difficulty:** easy

## Hypothesis example
> Because visitors postpone purchases when there is no reason to act now, we expect that showing a countdown to the end of the weekly promotion will increase the conversion rate.

## What it does
Inserts a banner with a live countdown to Sunday 23:59:59 (visitor's local time) and a promo code that alternates between even and odd weeks.

## What you need before you start
- [ ] The selector of the element the banner should appear **above** (e.g. `main`, `.page-header`)
- [ ] Banner copy and promo code(s)
- [ ] Brand colours / font, or a screenshot of the site

## Prompt
```
Build a countdown banner A/B test using the countdown-banner recipe.

Platform: [PLATFORM]
Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Insert the banner above: [SELECTOR]
Banner copy: "[COPY]"
Promo code even weeks: [CODE] / odd weeks: [CODE]
Count down to: [Sunday 23:59 / a fixed date and time]
Design: [colours, font, or describe the screenshot]

HTML around the insertion point:
[PASTE HTML]
```

## Pitfalls
- **Time zone.** The countdown uses the visitor's clock. For a fixed deadline (e.g. a Black Friday end time), use a fixed ISO date with a time zone offset: `new Date('2026-11-30T23:59:59+01:00')`.
- **Layout shift.** A banner inserted above the content pushes the page down. Keep it on a single line on mobile if possible, and check CLS.
- **Sticky headers.** If the header is `position: sticky/fixed`, decide whether the banner goes inside or above it.
- **Fake urgency.** The promotion must really end at that time. A countdown that resets is misleading, and in the EU that can be unlawful.

## QA
- [ ] Shows the correct remaining time, and the numbers don't jump in width
- [ ] Correct promo code for the current week
- [ ] Not inserted twice (navigate back and forth, run the code twice in the console)
- [ ] Mobile: no horizontal scroll, the text fits

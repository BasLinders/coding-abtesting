# Recipe: [Name]

<!-- Copy this folder structure for a new recipe:
     <platform>/recipes/<recipe-name>/README.md   ← this file
     <platform>/recipes/<recipe-name>/variant.js
     <platform>/recipes/<recipe-name>/variant.css
     Use "shared/recipes/" when the recipe uses no platform-specific APIs. -->

**Works with:** [platforms] · **Difficulty:** [easy / medium / advanced]

## Hypothesis example
> Because [observation / data], we expect that [change] will [improve metric].

## What it does
[Two to four sentences in plain language. Mention how it handles re-rendering, if relevant.]

## What you need before you start
- [ ] [Selector / HTML of ...]
- [ ] [Copy]
- [ ] [IDs, thresholds, URLs, ...]

## Prompt
```
Build [what] using the [recipe-name] recipe.

Platform: [PLATFORM]
Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
[Recipe-specific inputs]

HTML of [area]:
[PASTE HTML]
```

## Pitfalls
- **[Pitfall].** [Why it happens and how the recipe avoids it.]

## QA
- [ ] [Test-specific check]
- [ ] Inserted once only
- [ ] Mobile

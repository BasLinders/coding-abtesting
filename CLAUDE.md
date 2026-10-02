# Commit conventions
When creating git commits in this repository, do not add a `Co-Authored-By: Claude` (or any Anthropic/Claude) trailer to the commit message, and do not set the commit author to Claude. Use the repository's configured git identity (`git config user.name` / `user.email`) as-is.

## Adding new recipies
Found a better solution, or a new pitfall? Add it, so the next test benefits.
- **New snippet**: copy `_templates/snippet-template.js` into the right `snippets/` folder. Platform-independent code goes in `shared/`.
- **New recipe**: create a folder in `recipes/` with `README.md` (from `_templates/recipe-template.md`), `variant.js` and `variant.css`.
- Remove client names, client copy and client-specific URLs before committing. Use placeholders like `[SELECTOR]` and `[COPY]`.
- Update the recipe table in the folder's `recipes/README.md`.
- **Add a behaviour test** for every new recipe in `tests/recipes.test.js` (one `describe()` block named after the recipe's path). Cover at least: the change appears in the right place, running the code twice doesn't duplicate anything, and the main edge cases (missing elements, fallbacks).

## Tests
Run `npm test` after **every** change to a recipe, snippet, `_base-context.md` or the tests, and only report the work as done when all tests pass. Run `npm install` first if `node_modules/` is missing.
- `tests/rules.test.js` checks every recipe and the skeleton in `_base-context.md` against the seven structure rules, and every JS/CSS file against the code rules (syntax, no `var`, no `==`, no jQuery, no forbidden insertion methods, 4-space indentation). It also fails when a recipe has no README, CSS, table entry or behaviour test.
- `tests/recipes.test.js` runs every recipe in a simulated browser (jsdom). Use `runRecipe()` from `tests/helpers.js`. Fill in `[PLACEHOLDERS]` with `edits`, and fake platform globals (RequireJS, Shopify, ...) with `before`.
- Never weaken or delete a test to make it pass. Fix the code, or explain to the user why the test is wrong.

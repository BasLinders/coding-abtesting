# Commit conventions
When creating git commits in this repository, do not add a `Co-Authored-By: Claude` (or any Anthropic/Claude) trailer to the commit message, and do not set the commit author to Claude. Use the repository's configured git identity (`git config user.name` / `user.email`) as-is.

## Adding new recipies
Found a better solution, or a new pitfall? Add it, so the next test benefits.
- **New snippet**: copy `_templates/snippet-template.js` into the right `snippets/` folder. Platform-independent code goes in `shared/`.
- **New recipe**: create a folder in `recipes/` with `README.md` (from `_templates/recipe-template.md`), `variant.js` and `variant.css`.
- Remove client names, client copy and client-specific URLs before committing. Use placeholders like `[SELECTOR]` and `[COPY]`.
- Update the recipe table in the folder's `recipes/README.md`.

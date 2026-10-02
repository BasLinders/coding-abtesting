# Recipe: Rebuild the mobile menu into three layers

**Works with:** all platforms with a server-rendered mobile menu (the example classes in `CONFIG.siteClasses` are Bootstrap 4; replace them with the site's own) · **Difficulty:** advanced

## Hypothesis example
> Because mobile visitors have to scroll through a long, flat list of categories to find the right product type, we expect that grouping the menu into a few main categories (layer 1), product groups (layer 2) and product types (layer 3) will increase the share of visitors who reach a category page, and with it the conversion rate.

## What it does
```
Layer 1  Indoor ›                 ← new, title + "view all" link from CONFIG.copy.categories
Layer 2    Seating ›              ← new, title + "view all" link from CONFIG.copy.headings
Layer 3      Bean bags            ← the site's ORIGINAL link, found by its ID
             Chairs
```
- Builds new layer 1 and layer 2 items using the site's own menu classes, so the menu looks and opens like the original.
- Layer 3 reuses the site's existing links (by ID). Their URL, text and tracking `data-*` attributes are copied, so nothing has to be maintained per language for layer 3.
- Every submenu gets a back button (showing the panel title) and a "view all" link.
- The original items that were moved, and the original top-level items listed in `CONFIG.hide.topLevelIds`, are hidden with a CSS class. They're only hidden once the new menu is on the page, so if something fails, visitors still see the original menu.
- Groups whose links don't exist on the current site/language are skipped, and so are categories left without groups.
- Only runs at screen widths up to `CONFIG.settings.maxWidth`.

## What you need before you start
- [ ] **The new structure**: which main categories, which groups per category, which links per group. A spreadsheet works well.
- [ ] **The IDs of the original links** for layer 3. Open the mobile menu, right-click a link → *Inspect*, and copy the `id` of the `<a>` element. If the links have no ID, give the LLM another attribute that identifies them (e.g. `data-category-id`) and it will change `selectors.originalLink`.
- [ ] **The IDs of the original top-level links** that the new menu replaces (`hide.topLevelIds`).
- [ ] **Titles and URLs** of the new layer 1 and 2 items, per language, plus the words for "Back" and "View all".
- [ ] **The HTML of the open mobile menu** with one open submenu, so the classes in `siteClasses` can be checked.
- [ ] The mobile breakpoint of the site (`maxWidth`)

## Prompt
```
Rebuild the mobile menu using the mobile-menu-rebuild recipe.

Platform: [PLATFORM]
Testing tool: [Convert / Varify / Kameleoon]
Test ID: [hh-exp-123]
Mobile up to: [1023] px
Languages: [gb-en (default), de-de, ...]

New structure:
  [Category title] → [view-all URL per language]
    [Group title] → [view-all URL per language]: [original link IDs]
    ...
Original top-level items to hide: [IDs]
"Back" / "View all" per language: [...]

HTML of the mobile menu with one submenu open:
[PASTE HTML]
```

## Pitfalls
- **The site's own menu script.** If the site's JS also reacts to clicks on `.dropdown-toggle` links, both scripts may open/close panels. The recipe calls `stopPropagation()` on its own links. If panels still behave oddly, check whether the site uses `data-toggle` attributes or event delegation on the menu.
- **Shared desktop and mobile menu.** Many sites use the same `<ul>` for both. The recipe only runs below `maxWidth` **at page load**. Rotating a tablet past the breakpoint keeps the mobile structure until the next page load. Test on tablets.
- **Links that only exist in some languages** are skipped automatically. Check every language in QA, because a group may be missing.
- **Tracking.** Analytics often reads `data-*` attributes from menu links. Add them to `copyDataAttributes`. Check in the network tab or GA4 DebugView that menu clicks are still tracked.
- **Menus that are rendered by JavaScript** (Alpine on Hyvä, React on SPAs) may re-render and remove the new items. This recipe assumes a server-rendered menu. For those platforms, ask the LLM to add an observer (`CONFIG.observers`) and read that platform's `_platform-context.md`.
- **Keyboard and screen readers.** The recipe sets `aria-expanded` on the toggles and gives the back buttons a label. Check with VoiceOver/TalkBack that you can open and close every layer.

## QA
- [ ] Every category, group and link appears in the right place, in every language
- [ ] All links go to the right page (including "view all" on layers 1 and 2)
- [ ] Back buttons close one layer at a time
- [ ] Original items that were moved are hidden, and items that were not moved still show
- [ ] Desktop (above `maxWidth`) is completely unchanged
- [ ] Menu click tracking still works
- [ ] Opening, closing and reopening the menu several times works, with no duplicate items
- [ ] With `?hh_debug=1`, the console lists skipped links and groups. Check that nothing important is missing.

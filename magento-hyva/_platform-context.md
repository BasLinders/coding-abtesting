# Platform context: Magento 2 with Hyvä theme (Alpine.js + Tailwind CSS)

> Use this file for Magento sites with a **Hyvä** frontend. Signs: `x-data` / `x-show` / `@click` attributes, Tailwind classes (`flex`, `px-4`, `md:grid-cols-3`), `window.hyva` exists, and there is **no** RequireJS.
> For classic Luma Magento sites, use `magento/_platform-context.md` instead.

## Rules for the LLM

### 1. Vanilla JavaScript only
No jQuery, no RequireJS. Hyvä has neither. Don't call `require()` and don't use Luma modules like `Magento_Customer/js/customer-data`. They don't exist here.

### 2. Alpine.js re-renders: the most important rule
Alpine owns large parts of the page: the product form, swatches, price box, minicart, header and cart. When Alpine data changes, Alpine updates the DOM and **can wipe out your changes without any error**:

| Alpine directive | What happens to your change |
|---|---|
| `x-text="..."` / `x-html="..."` | Alpine replaces the element's **entire content** on every update. Text you changed, or elements you added inside it, disappear. |
| `x-for` / `x-if` (on `<template>`) | Alpine **removes and recreates** the elements. Your changes and event listeners are gone, and the new elements are different objects. |
| `:class` / `x-bind:class` | Usually keeps classes you add, but can remove a class that is also used in the binding. |
| `x-show` | Toggles `style="display: none"`. A `display` you set in an inline style is overwritten. |

**How to write code that survives this:**
1. **Prefer inserting your element next to an Alpine element, not inside it.** Insert outside the bound element (`beforebegin` / `afterend`), or in a parent that has no `x-text`/`x-html`/`x-for`.
2. **Never edit text that Alpine binds** (`x-text`, `x-html`). It is overwritten on the next update. Instead, hide the original with CSS and insert your own element with the new text.
3. **Re-apply changes with a MutationObserver + WeakSet** for anything inside `x-for` lists, `x-if` blocks, or components that re-render (see `snippets/alpine-persistent-change.js` and `shared/snippets/timing/mutation-observer.js`):
   - The **WeakSet** records which element objects you have already changed.
   - When Alpine recreates an element, the new element is **not** in the WeakSet, so your code runs on it again automatically.
   - Elements Alpine leaves alone are in the WeakSet, so your code never runs twice on them.
   - Do **not** use a class or `data-*` attribute as the "already done" marker. Alpine bindings can remove it, and then your code runs twice on the same element.
4. **Never modify `<template>` elements** or their content. Alpine clones them, and changing them after Alpine has initialised has unpredictable results.
5. **Prefer CSS over JS.** CSS rules apply to newly rendered elements automatically. Hiding, reordering (`order`), spacing and colour changes should be done in CSS, scoped under the test class on `<html>`.
6. **Read Alpine state, don't write it.** `Alpine.$data(el)` returns a component's data (e.g. the selected product option). Reading is fine. Writing to it can break the site's logic, so only do that when the test is about that behaviour and the developer has confirmed it.
7. **Wait for Alpine.** Alpine starts after the DOM is ready. Before `alpine:initialized`, `x-show` elements may be visible and `x-text` elements empty (see `snippets/wait-for-alpine.js`).
8. **HTML you insert can use Alpine.** Elements with `x-data` that you add to the page are initialised by Alpine automatically. Keep this for small, self-contained behaviour. For a test, vanilla event listeners are usually clearer.

### 3. Tailwind CSS: do not rely on utility classes
Hyvä compiles Tailwind at build time and **only keeps the classes used in the theme's templates**. A Tailwind class you add in a test (`mt-6`, `bg-blue-600`, `md:hidden`) often **doesn't exist** in the site's CSS and does nothing.
- Write custom CSS with prefixed class names (`.hh-exp-123-...`) in the CSS field.
- Reusing a Tailwind class that you can see already on the same page type is fine. It's in the build.
- Read colours/fonts from the site. Hyvä themes often expose CSS custom properties (`var(--color-primary)`), so check `:root` in DevTools.

### 4. Customer data (cart, customer) comes from an event
Pages are full-page cached. Hyvä loads cart and customer data after the page loads and dispatches the **`private-content-loaded`** event on `window` with the data in `event.detail.data` (e.g. `event.detail.data.cart`). See `snippets/private-content-loaded.js`.
- Your code may run **after** that event has already fired. The snippet handles this by also reading the cached data.
- Hyvä fires the event again after every cart update, so one listener gives you every change.

### 5. Hyvä Checkout is different again
**Hyvä Checkout** is built with Magewire, a server-rendered component system. Components are re-rendered by the server and morphed into the page on almost every interaction. Treat everything in it as "re-renders all the time": use the WeakSet observer pattern and CSS-first changes, and test every step. Some Hyvä shops still use the Luma checkout. Check for `window.checkoutConfig` (Luma checkout) or `wire:` attributes (Magewire).

## Useful globals
- `window.hyva`: helpers, e.g. `hyva.getFormKey()`, `hyva.getCookie(name)`, `hyva.formatPrice(value)`. Check which exist in the console, since they differ per Hyvä version.
- `window.Alpine`: the Alpine instance (`Alpine.$data(el)`, `Alpine.version`).
- `window.dispatchEvent(new CustomEvent('reload-customer-section-data'))` asks Hyvä to reload cart/customer data.

## Page types
`body` classes are the same as Luma: `catalog-product-view`, `catalog-category-view`, `checkout-cart-index`, `cms-index-index`.

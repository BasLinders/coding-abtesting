# Platform context: Single-page applications (React, Next.js, Vue, Nuxt, Angular, Svelte, ...)

> Use this file for sites where pages change without a full page load, or where the HTML is rendered by a JavaScript framework. Signs: the URL changes but the page does not reload. Class names look random (`css-1x2y3z`, `sc-bdfBwQ`, `Button_primary__a1b2c`). There is a root `<div id="__next">`, `<div id="root">`, `<div id="app">` or `<div data-reactroot>`.
>
> The team writes **vanilla JavaScript only**, even when the site itself is built with React, Vue or Angular. We change the page from the outside. We don't write framework code.

## Rule 1: Selectors. Class names are not reliable.
CSS-in-JS and CSS modules generate class names at build time. They change with every deploy, so a test built on them can break overnight. Choose selectors in this order (see `snippets/robust-selectors.js`):

1. **Test or data attributes**: `[data-testid="add-to-cart"]`, `[data-test]`, `[data-qa]`, `[data-cy]`, `[data-component="ProductCard"]`. Developers add these for their own tests, so they are the most stable.
2. **IDs and form names**: `#checkout-form`, `input[name="email"]`, `[for="email"]`.
3. **ARIA and semantic HTML**: `[role="dialog"]`, `[aria-label="Close"]`, `nav[aria-label="Breadcrumb"]`, `main h1`, `button[type="submit"]`.
4. **Links and attributes with meaning**: `a[href="/cart"]`, `a[href*="/products/"]`, `img[alt*="logo" i]`.
5. **The stable part of a generated class**: CSS modules keep the readable part, so `[class*="ProductCard_title"]` survives a deploy where `ProductCard_title__x7Yz2` changes. Don't use fully random classes like `css-1x2y3z` or `sc-bdfBwQ`.
6. **Visible text** (`shared/snippets/dom/select-by-text.js`): stable across deploys, but language-specific and editable by content editors.
7. **Structure** from a stable anchor: `findStable(...)` then `.closest()` / `.querySelector()` relative to it. Never long chains like `div > div:nth-child(3) > div > span`.

Write down in the code comment **why** a selector was chosen, so the next person knows what may break it.

## Rule 2: The framework re-renders. Make every change re-apply itself.
The framework can replace any element at any time: on state changes, data loading, hover states, route changes. Use the **MutationObserver + WeakSet** pattern (`snippets/persistent-change.js`, `shared/snippets/timing/mutation-observer.js`):
- The WeakSet remembers which element objects have been changed.
- New elements rendered by the framework are not in it, so your change is applied to them.
- A WeakSet can't be wiped by the framework (unlike a class or data attribute marker), and it releases removed elements automatically.

## Rule 3: Don't fight the framework.
- **Never remove or move elements the framework rendered.** React/Vue keep a virtual copy of the DOM. When the real DOM no longer matches, they throw errors (`Failed to execute 'removeChild' on 'Node'`) and can crash the whole page or put the element back. **Hide with CSS** (scoped under the test class on `<html>`) instead.
- **Never change text the framework rendered.** It will be overwritten on the next render, and in React it can break later updates. Hide the original with CSS and insert your own element next to it.
- **Insert your elements next to framework elements** (`beforebegin` / `afterend`) rather than inside lists the framework manages.
- **Use event delegation.** Add one listener on `document` and check `event.target.closest(selector)`. Listeners on framework elements disappear when the element is re-rendered.
- **Clicking framework buttons from code** (`el.click()`) is fine and is the safest way to trigger site behaviour.
- **Setting input values from code** does not update React state. Ask a developer, or avoid changing input values.

## Rule 4: Wait for hydration on server-rendered sites (Next.js, Nuxt).
The HTML arrives server-rendered, then the framework "hydrates" it. Changing the DOM before hydration finishes causes hydration errors, and React may throw away and re-render the whole tree, taking your changes with it. Wait until the page is interactive: wait for the element, then wait one more frame/idle period (`requestIdleCallback`), or wait for a sign of interactivity the site gives (e.g. a button that becomes enabled). The WeakSet pattern also covers this, because it re-applies after the re-render.

## Rule 5: Route changes. Re-run, clean up, and don't run twice.
On an SPA, "a new page" is only a URL change. Your code must:
- **Run on the right routes**: check `location.pathname` on every route change (`snippets/url-change-listener.js`), not only once.
- **Clean up when leaving the route**: remove inserted elements, disconnect observers, remove the class on `<html>`.
- **Guard against running twice**: testing tools re-run variation code on route changes (see `_base-context.md` → testing tools). Before inserting, check whether your element already exists.

## Common pitfalls
- **Shadow DOM** (web components): `document.querySelector` does not see inside a shadow root. Use `host.shadowRoot.querySelector(...)` if the root is open. A closed root can't be accessed at all.
- **Virtualised lists** (long product lists, tables): only visible rows exist in the DOM, and they are reused when scrolling. The WeakSet pattern alone is not enough, because a reused row is the same object with different content. Re-check the content, not just the element.
- **Hashed class names in your CSS**: the same rule applies to the CSS field. Use the selectors from Rule 1 there too.

/**
 * SNIPPET: Robust selectors for sites without stable class names
 *
 * WHEN TO USE
 *   SPAs and sites with CSS-in-JS / CSS modules (class names like css-1x2y3z,
 *   sc-bdfBwQ, Button_primary__a1b2c) that change with every deploy.
 *
 * HOW TO USE
 *   findStable([...candidates]) tries each selector strategy in order and returns
 *   the first match. List the most stable strategy first. If the site changes, the
 *   fallbacks keep the test working, and the debug log tells you which one matched.
 *
 *   Each candidate is either a CSS selector string or a function returning an element.
 *
 * PITFALLS
 *   - The fallbacks are a safety net, not a replacement for QA. If the primary
 *     selector stops matching, find out why.
 *   - Avoid matching too broadly: [aria-label*="cart" i] can match several buttons.
 *     Combine with a container: 'header [aria-label*="cart" i]'.
 *
 * WORKS WITH: spa (and any site with unreliable class names)
 */

// Matches the readable part of a CSS-modules class: 'ProductCard_title' → [class*="ProductCard_title"]
const byModuleClass = (name) => `[class*="${name}"]`;

// Matches by test attribute, trying the common naming conventions
const byTestId = (id) => ['data-testid', 'data-test', 'data-test-id', 'data-qa', 'data-cy']
  .map((attr) => `[${attr}="${id}"]`).join(', ');

// Matches the innermost element whose own text equals / contains `text`
function byText(text, { selector = '*', exact = false, root = document } = {}) {
  const needle = text.trim().toLowerCase();
  return Array.from(root.querySelectorAll(selector)).find((el) => {
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim().toLowerCase();
    return exact ? own === needle : own.includes(needle);
  }) || null;
}

function findStable(candidates, { root = document } = {}) {
  for (const candidate of candidates) {
    let el = null;
    try {
      el = typeof candidate === 'function' ? candidate(root) : root.querySelector(candidate);
    } catch (e) { /* invalid selector, try the next one */ }
    if (el) return el;
  }
  return null;
}

// Usage: the add-to-cart button, from most to least stable
const addToCart = findStable([
  byTestId('add-to-cart'),                          // 1. test attribute
  'form[action*="cart"] button[type="submit"]',     // 2. semantic HTML
  'button[aria-label*="add to cart" i]',            // 3. ARIA
  byModuleClass('AddToCart_button'),                // 5. stable part of CSS-module class
  () => byText('Add to cart', { selector: 'button' }) // 6. visible text
]);

/**
 * SNIPPET: Select elements by their text
 *
 * WHEN TO USE
 *   The element has no usable class or ID (common on SPAs, page builders, and
 *   checkouts), but it has a stable visible text such as "Shipping" or "Add to cart".
 *
 * HOW TO USE
 *   findByText('Shipping')                              → all elements whose OWN text contains it
 *   findByText('Shipping', { selector: 'th, td' })      → limit to certain tags
 *   findByText('Shipping', { exact: true })             → whole text must match
 *   el.closest('tr')                                    → then walk up to the container you need
 *
 * PITFALLS
 *   - Text is language-specific. On multi-language sites, pass the text for each
 *     language, or combine this with a URL/locale check.
 *   - Text changes are invisible to developers. A copywriter can break your test.
 *     Prefer a stable attribute when one exists (see spa/snippets/robust-selectors.js).
 *   - Matching is on the element's OWN text nodes, so you get the innermost
 *     element, not <body> (which also "contains" the text).
 *
 * WORKS WITH: all platforms
 */

function findByText(text, { selector = '*', exact = false, root = document } = {}) {
    const needle = text.trim().toLowerCase();
    return Array.from(root.querySelectorAll(selector)).filter((el) => {
        const ownText = Array.from(el.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent)
            .join('')
            .trim()
            .toLowerCase();
        return exact ? ownText === needle : ownText.includes(needle);
    });
}

// Usage: hide the shipping-costs row on the cart page
if (window.location.pathname === '/cart') {
    const label = findByText('Shipping', { selector: 'th, td, span, div' })[0];
    const row = label?.closest('tr, .totals-row');
    if (row) row.classList.add('hh-exp-123-hidden');
}

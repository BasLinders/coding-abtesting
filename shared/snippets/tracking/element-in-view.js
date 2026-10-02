/**
 * SNIPPET: Element in view trigger
 *
 * WHEN TO USE
 *   Fire a goal, an event or an activation when a visitor actually SEES an
 *   element (e.g. a USP block below the fold, a recommendations slider).
 *
 * HOW IT WORKS
 *   IntersectionObserver lets the browser report visibility. That is much cheaper
 *   than checking positions on every scroll event, and it also works when the
 *   element becomes visible without scrolling (accordions, tabs).
 *
 * HOW TO USE
 *   onInView(el, callback, { threshold: 0.5 }) runs callback once, when at least
 *   50% of the element is visible.
 *
 * WORKS WITH: all platforms
 */

function onInView(el, callback, { threshold = 0.5, once = true } = {}) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            callback(entry.target);
            if (once) observer.unobserve(entry.target);
        });
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
}

// Usage
const target = document.querySelector('.featured-products');
if (target) {
    onInView(target, () => {
        // Fire the goal / event here (see _base-context.md for the tool's goal API)
    });
}

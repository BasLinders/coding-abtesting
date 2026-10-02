/**
 * SNIPPET: Detect route changes in a single-page application
 *
 * WHEN TO USE
 *   The test should only apply on certain routes of an SPA, and has to switch on and
 *   off as the visitor navigates without page loads.
 *
 * HOW IT WORKS
 *   SPAs change the URL with history.pushState / replaceState, which fire no event.
 *   We wrap both methods and also listen for popstate (back/forward), then call
 *   the callback with the new URL whenever it actually changed.
 *
 * ROUTE-SCOPED TESTS
 *   onRoute(match, { enter, leave }) runs enter() when the visitor arrives on a
 *   matching route and leave() when they navigate away. Put cleanup in leave():
 *   remove inserted elements, disconnect observers, remove the <html> class.
 *
 * PITFALLS
 *   - Check whether the testing tool already re-runs the variation on route changes
 *     (see _base-context.md). If it does, you may only need a duplicate guard and
 *     cleanup, not this listener. Don't build both.
 *   - The new route's content is usually rendered AFTER the URL changes. Wait for
 *     elements inside enter().
 *   - Wrap history only once per page, even if the variation code runs again.
 *     The window flag below handles that.
 *
 * WORKS WITH: spa
 */

function onUrlChange(callback) {
    if (!window.__hhUrlChange) {
        window.__hhUrlChange = { listeners: [], last: location.href };
        const notify = () => {
            if (location.href === window.__hhUrlChange.last) return;
            window.__hhUrlChange.last = location.href;
            window.__hhUrlChange.listeners.forEach((fn) => fn(location.href));
        };
        ['pushState', 'replaceState'].forEach((method) => {
            const original = history[method];
            history[method] = function (...args) {
                const result = original.apply(this, args);
                notify();
                return result;
            };
        });
        window.addEventListener('popstate', notify);
    }
    window.__hhUrlChange.listeners.push(callback);
}

function onRoute(match, { enter, leave }) {
    const test = typeof match === 'function' ? match : (url) => match.test(new URL(url).pathname);
    let active = false;
    const check = (url) => {
        const matches = test(url);
        if (matches && !active) { active = true; enter?.(); }
        else if (!matches && active) { active = false; leave?.(); }
    };
    check(location.href);
    onUrlChange(check);
}

// Usage: only on product pages
onRoute(/^\/products\//, {
    enter: () => document.documentElement.classList.add('hh-exp-123'),
    leave: () => {
        document.documentElement.classList.remove('hh-exp-123');
        document.querySelectorAll('.hh-exp-123-inserted').forEach((el) => el.remove());
    }
});

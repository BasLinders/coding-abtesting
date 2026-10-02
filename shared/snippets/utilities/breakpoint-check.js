/**
 * SNIPPET: Run code only on certain screen sizes
 *
 * WHEN TO USE
 *   A change should only happen on mobile (or only on desktop), and it should
 *   switch correctly when the screen size changes (rotating a tablet, resizing a window).
 *
 * WHY matchMedia?
 *   It uses the same rules as CSS media queries and only fires when the breakpoint
 *   is actually crossed, not on every pixel of a resize.
 *
 * PITFALLS
 *   - If the change is purely visual, do it in CSS with a media query instead.
 *   - Write both directions: what happens when you enter the breakpoint AND what is
 *     undone when you leave it. Otherwise resizing leaves the page half-changed.
 *   - Most testing tools can target devices in the audience settings. Use that when
 *     the whole test is mobile-only.
 *
 * WORKS WITH: all platforms
 */

function onBreakpoint(query, { enter, leave }) {
    const mql = window.matchMedia(query);
    const handle = (e) => (e.matches ? enter?.() : leave?.());
    handle(mql);
    mql.addEventListener('change', handle);
    return () => mql.removeEventListener('change', handle);
}

// Usage: sticky add-to-cart only on mobile
onBreakpoint('(max-width: 767px)', {
    enter: () => document.documentElement.classList.add('hh-exp-123-mobile'),
    leave: () => document.documentElement.classList.remove('hh-exp-123-mobile')
});

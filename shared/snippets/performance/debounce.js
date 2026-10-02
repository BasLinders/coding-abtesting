/**
 * SNIPPET: Debounce
 *
 * WHEN TO USE
 *   An event fires many times in a row and you only care about the LAST one:
 *   window resize, typing in a search field, a MutationObserver that fires in bursts.
 *
 * DEBOUNCE VS THROTTLE
 *   debounce: wait until the events stop, then run once.        (resize, input)
 *   throttle: run at most once every X ms while the events go on. (scroll position)
 *
 * WORKS WITH: all platforms
 */

function debounce(fn, delay = 200) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Usage
window.addEventListener('resize', debounce(() => {
    // Runs 200 ms after the user stops resizing
}, 200));

/**
 * SNIPPET: Throttle
 *
 * WHEN TO USE
 *   An event fires constantly and you need to keep responding WHILE it happens,
 *   but not hundreds of times per second: scroll position, mousemove, sticky bars.
 *
 * PITFALLS
 *   - To check whether an element is visible, don't throttle scroll.
 *     Use IntersectionObserver instead (see tracking/element-in-view.js).
 *   - Pass { passive: true } on scroll/touch listeners so scrolling stays smooth.
 *
 * WORKS WITH: all platforms
 */

function throttle(fn, wait = 100) {
  let last = 0;
  let trailing;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    clearTimeout(trailing);
    if (remaining <= 0) {
      last = now;
      fn.apply(this, args);
    } else {
      // Make sure the final call (e.g. the end of a scroll) still runs
      trailing = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// Usage
window.addEventListener('scroll', throttle(() => {
  document.documentElement.classList.toggle('hh-exp-123-scrolled', window.scrollY > 400);
}, 100), { passive: true });

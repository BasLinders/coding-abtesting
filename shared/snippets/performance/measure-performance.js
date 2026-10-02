/**
 * SNIPPET: Measure how long variation code takes
 *
 * WHEN TO USE
 *   QA: check that your variation does not slow the page down, or find out how
 *   long it takes before an element you wait for appears.
 *
 * HOW TO USE
 *   Call measureStart() at the top of your code and measureEnd() where the change
 *   is visible. The duration is logged to the console. Remove both before launch,
 *   or keep them behind the debug flag from debugging/debug-logging.js.
 *
 * WORKS WITH: all platforms
 */

const PERF_ID = 'hh-exp-123';

function measureStart(label = PERF_ID) {
  performance.mark(`${label}-start`);
}

function measureEnd(label = PERF_ID) {
  performance.mark(`${label}-end`);
  const m = performance.measure(label, `${label}-start`, `${label}-end`);
  console.log(`[${label}] ${Math.round(m.duration)} ms`);
  return m.duration;
}

// Usage
measureStart();
// ... variation code ...
measureEnd();

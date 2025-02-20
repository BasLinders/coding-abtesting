// A/B testing tools don't listen to 'DOMContentLoaded', since the experience code is loaded when that event has passed.
// Listen for readyState 'complete' or 'interactive', instead

function domReady(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn); // Use as fallback in edge cases
  }
}

domReady(() => {
  // Call the code or functions here
});

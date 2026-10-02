/**
 * SNIPPET: Load an external script
 *
 * WHEN TO USE
 *   A test needs a third-party script that the site does not load itself, such as a
 *   review widget or a small library from a CDN.
 *
 * PITFALLS
 *   - Every external script costs load time and adds risk. Ask whether the test
 *     really needs it. Most sliders and accordions can be built with plain CSS
 *     (scroll-snap, <details>).
 *   - Check that the site's Content Security Policy allows the domain. If the
 *     console shows "Refused to load the script", the CSP is blocking it.
 *   - Never load jQuery for a test. Write vanilla JS instead.
 *   - On Magento Luma (RequireJS), a library that supports AMD may register itself
 *     with RequireJS instead of on window. See magento/snippets/requirejs-load-module.js.
 *
 * WORKS WITH: all platforms
 */

function loadScript(src, { async = true } = {}) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('loadScript: failed to load ' + src));
    document.head.insertAdjacentElement('beforeend', script);
  });
}

// Usage
loadScript('https://widget.example.com/widget.min.js')
  .then(() => {
    // Script is loaded and can be used here
  })
  .catch((err) => console.warn(err.message));

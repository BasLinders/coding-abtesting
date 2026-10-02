/**
 * SNIPPET: Wait until Alpine.js has initialised the page (Hyvä)
 *
 * WHEN TO USE
 *   Before you read Alpine component data, or before you change elements Alpine
 *   controls. Until Alpine is ready, `x-text` elements may be empty and `x-show`
 *   elements may still be visible.
 *
 * HOW IT WORKS
 *   Alpine dispatches `alpine:initialized` on document when it has finished
 *   initialising. Variation code may run before or after that. If Alpine is
 *   already running we resolve immediately, otherwise we wait for the event.
 *
 * READING COMPONENT DATA
 *   Alpine.$data(el) returns the reactive data of the component that `el` belongs
 *   to (the closest x-data). Log it in the console to see what's available.
 *   Read it, don't write to it (see _platform-context.md, rule 2.6).
 *
 * WORKS WITH: magento-hyva (and any Alpine.js v3 site)
 */

function whenAlpineReady({ timeout = 10000 } = {}) {
    return new Promise((resolve, reject) => {
        // Alpine adds an internal `_x_dataStack` property to each component once it is initialised
        const isReady = () => window.Alpine && document.querySelector('[x-data]')?._x_dataStack;
        if (isReady()) return resolve(window.Alpine);

        const timer = setTimeout(() => reject(new Error('whenAlpineReady: timeout')), timeout);
        document.addEventListener('alpine:initialized', () => {
            clearTimeout(timer);
            resolve(window.Alpine);
        }, { once: true });
    });
}

// Usage: read the selected configurable option on the product page
whenAlpineReady().then((Alpine) => {
    const form = document.querySelector('#product_addtocart_form');
    if (!form) return;
    const data = Alpine.$data(form);
    console.log('Product form component data:', data);
});

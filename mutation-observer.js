// Custom DOM ready function for vanilla Javascript
function domReady() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


// Mutation Observer jQuery quickstart
const observer = new MutationObserver(function(mutationsList) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            let addedNodes = jQuery(mutation.addedNodes);
            let myElement = addedNodes.hasClass('[class]');

            if (myElement) {
                replaceErrorMsg();
                break;
            }
        }
    }
});

// Mutation Observer vanilla Javascript
const observer = new MutationObserver(function (mutationsList) {
    let foundNode = false;
    for (let mutation of mutationsList) {
        // Handle 'childList' changes (if elements are added)
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                // Only process element nodes (skip text/comment nodes)
                if (node.nodeType === 1 && node.classList.contains('...') && node.classList.contains('...')) {
                    foundNode = true;
                    const firstElement = document.querySelector('[data-label="..."]');
                    if (firstElement) {
                        domReady(() => {
                            moveProductCards(); // Perform your actions
                        });
                    }
                }
            });
        }
        
        // Handle 'attributes' changes
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const node = mutation.target;
            if (node.classList.contains('step1') && node.classList.contains('active')) {
                foundNode = true;
                const firstElement = document.querySelector('[data-label="..."]');
                if (firstElement) {
                    domReady(() => {
                        moveProductCards(); // Perform your actions
                    });
                }
            }
        }
    }
    if (foundNode) {
        observer.disconnect();
    }
});

// General observer start
observer.observe(document.body, {
    childList: true,
    subtree: true
});

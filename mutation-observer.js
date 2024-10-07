//Mutation Observer	jQuery
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
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                // Only process element nodes (skip text/comment nodes)
                if (node.nodeType === 1 && node.classList.contains('step1') && node.classList.contains('active')) {
                    domReady(moveProductCards); // execute when document is ready
                    observer.disconnect(); // disconnect after execution has been completed
                }
            });
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

//Mutation Observer	
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

observer.observe(document.body, {
    childList: true,
    subtree: true
});
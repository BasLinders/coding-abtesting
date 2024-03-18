jQuery(document).ready(function() {
    const maxInterval = 30;
    let myInterval = 0;

    function checkAndExecute() {
        const elementToCheck = jQuery('.element');
        if (elementToCheck.length > 0) {
            myFunction();
            clearInterval(intervalId); // Stop further checks once the element is found and myFunction is executed
        } else if (myInterval >= maxInterval) {
            clearInterval(intervalId); // Stops the interval if maxInterval is reached without finding the element
        }
        myInterval++; // Increment after checking conditions but before exiting the function
    }

    function myFunction() {
        // De wijzigingen in het experiment worden hier uitgevoerd.
    }

    let intervalId = setInterval(checkAndExecute, 500);
});

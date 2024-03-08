jQuery(document).ready(function() {
  
    function myFunction() {
     /*do stuff */
    }

    function checkScreenSize() {
        var newWindowWidth = jQuery(window).width();
        if (newWindowWidth < 481) {
            myFunction();
        }
    }

    jQuery(window).on("resize", function(e) {
        checkScreenSize();
    });

    checkScreenSize();
});

// If used in conjunction with a checkAndExecute function:

    let intervalId; // Declaring it outside of all functions to be globally accessible
    
    function checkScreenSize() {
        let newWindowWidth = jQuery(window).width();
        if (newWindowWidth > 992) {
            if (!intervalId) { // Only set the interval if it's not already set
                intervalId = setInterval(checkAndExecute, 500);
            }
        } else {
            if (intervalId) {
                clearInterval(intervalId); // Clear the interval if the screen is smaller
                intervalId = null; // Reset the intervalId
            }
        }
    }

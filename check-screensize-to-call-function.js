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
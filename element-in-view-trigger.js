//Element in view trigger
var scrollEventSent = false;
//element in view
$.fn.isInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
};
$(window).on('resize scroll', function() {
    if (!scrollEventSent && $('.featuredProdName').isInViewport()) {
        //place experiment trigger or GA event here
        
        scrollEventSent = true;
        console.log('element in view');
    }
});
(function () {
  var $;

  /** LIBRARY FUNCTIONS */
  // Function to wait for jQuery to load
  function waitForjQuery(trigger, delayInterval, delayTimeout) {
    if (!delayInterval) {
      delayInterval = 50;
    }

    if (!delayTimeout) {
      delayInterval = 15000;
    }

    var interval = setInterval(function () {
      if (typeof window.jQuery != "undefined") {
        clearInterval(interval);
        trigger(window.jQuery);
      }
    }, delayInterval);
    setTimeout(function () {
      clearInterval(interval);
    }, delayTimeout);
  }

  // Function to wait for an element to be available in the DOM
  function waitForElement(selector, trigger, delayInterval, delayTimeout) {
    if (!delayInterval) {
      delayInterval = 50;
    }

    if (!delayTimeout) {
      delayInterval = 15000;
    }

    var interval = setInterval(function () {
      if (
        document &&
        document.querySelector(selector) &&
        document.querySelectorAll(selector).length > 0
      ) {
        clearInterval(interval);
        trigger();
      }
    }, delayInterval);
    setTimeout(function () {
      clearInterval(interval);
    }, delayTimeout);
  }


  // Function to make changes to the DOM once jQuery and the element are available
  function changeUspBlock() {
    $(".product-page .contentmanager-usps").hide();
    $(".product-page .image-list-block").hide();
    $(".page-header .contentmanager-usps")
      .clone()
      .addClass("new-usps")
      .appendTo($(".product-page .usps-wrapper").eq(0));
    $(".new-usps li:nth-child(1)").hide();
    $(".new-usps li:nth-child(3)").hide();

    $(".new-usps").append(
      '<li><a href="#" rel="follow" target="_self"><span class="icon-usp"><span></span></span><span> Klanten beoordelen ons met een 9.3</span></a></li><li><a href="tel:TEL" rel="follow" target="_self"><span class="icon-usp"><span></span></span><span> Vragen? Bel: TEL</span></a></li>'
    );
  }

  // Wait for jquery
  waitForjQuery(function (jQuery) {
    $ = jQuery;
    // Wait for element
    waitForElement(".page-header .contentmanager-usps", function () {
      changeUspBlock();
    });
  });

})();
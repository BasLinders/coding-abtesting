  /* js voor horizontale navigatie */
  function sliderJs() {
      require.config({
          paths: {
              slick: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min'
          },
          shim: {
              slick: {
                  exports: 'Slick'
              }
          }
      });
  }

  /* execute function above*/
  sliderJs();

  require(['jquery', 'slick'], function($, Slick) {

      function filterBtn() {

          var filterButton = $('.dummy-filter-btn');

          $(filterButton).text(function() {
              return $(this).text().replace("Filteren", "Verfijn je selectie");
          });
      }

      filterBtn();

      function loadEvoSlider() {
          var myUrl = window.location.href;
          if (myUrl == "URL") {
              console.log("myUrl: " + myUrl);
              //console.log(Slick);
              $('.evo-accu-machines').appendTo('.category-content.category-view');
              $('.evo-machines').hide();
              $('.evo-accu-machines').css('display', 'block');
              $('.evo-accu-machines').slick({
                  variableWidth: true,
                  dots: false,
                  infinite: true,
                  speed: 300,
                  slidesToShow: 4,
                  slidesToScroll: 1,
                  touchMove: true,
                  responsive: [{
                          breakpoint: 1024,
                          settings: {
                              slidesToShow: 3,
                              slidesToScroll: 1,
                              //infinite: true,
                              dots: false
                          }
                      },
                      {
                          breakpoint: 600,
                          settings: {
                              slidesToShow: 3,
                              slidesToScroll: 1
                          }
                      },
                      {
                          breakpoint: 480,
                          settings: {
                              slidesToShow: 2,
                              slidesToScroll: 1,
                              arrows: false

                          }
                      }
                  ]
              });

          }
          if (myUrl == "URL2") {

              $('.evo-machines').appendTo('.category-content.category-view');
              $('.evo-accu-machines').hide();
              $('.evo-machines').css('display', 'block');
              $('.evo-machines').slick({
                  variableWidth: true,
                  dots: false,
                  infinite: true,
                  speed: 300,
                  slidesToShow: 4,
                  slidesToScroll: 1,
                  touchMove: true,
                  responsive: [{
                          breakpoint: 1024,
                          settings: {
                              slidesToShow: 3,
                              slidesToScroll: 1,
                              //infinite: true,
                              dots: false
                          }
                      },
                      {
                          breakpoint: 600,
                          settings: {
                              slidesToShow: 3,
                              slidesToScroll: 1
                          }
                      },
                      {
                          breakpoint: 480,
                          settings: {
                              slidesToShow: 2,
                              slidesToScroll: 1,
                              arrows: false

                          }
                      }
                  ]
              });
          }
      }

      /* execute code above */
      loadEvoSlider();
  });
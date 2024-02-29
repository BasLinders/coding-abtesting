function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.onload = function() {
    callback($);
  };
  document.head.appendChild(script);
}

loadScript('https://code.jquery.com/jquery-3.6.0.min.js', function() {
  // jQuery is now loaded and can be used in the code that follows in this function.
});

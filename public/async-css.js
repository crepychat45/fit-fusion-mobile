/**
 * Async CSS Loading Polyfill
 * Ensures CSS loads without blocking render on all browsers
 * This file is loaded inline in index.html for maximum performance
 */

(function(window, document) {
  'use strict';
  
  // Check if browser supports the media trick
  var testLink = document.createElement('link');
  var supportsMediaTrick = 'onload' in testLink;
  
  if (supportsMediaTrick) {
    // Modern browsers - use media trick
    var links = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
    links.forEach(function(link) {
      // Wait for load, then switch media
      link.addEventListener('load', function() {
        this.media = 'all';
      });
      
      // Fallback timeout in case load event doesn't fire
      setTimeout(function() {
        if (link.media === 'print') {
          link.media = 'all';
        }
      }, 3000);
    });
  } else {
    // Older browsers - immediate fallback
    var printLinks = document.querySelectorAll('link[media="print"]');
    printLinks.forEach(function(link) {
      link.media = 'all';
    });
  }
  
  // Alternative: Force load CSS if it takes too long
  window.addEventListener('load', function() {
    setTimeout(function() {
      var allLinks = document.querySelectorAll('link[rel="stylesheet"]');
      allLinks.forEach(function(link) {
        if (!link.sheet) {
          // CSS not loaded, force reload
          var href = link.href;
          link.href = '';
          link.href = href;
        }
      });
    }, 100);
  });
  
})(window, document);

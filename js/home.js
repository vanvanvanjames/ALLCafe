/* ==========================================================================
   ALL Cafe — home.js
   Renders the featured strip from menu-data.js so the Home page can never
   advertise a price the menu no longer charges.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe;
  var grid = document.querySelector('[data-featured-grid]');
  if (!grid) return;

  var featured = AllCafe.featuredItems();

  /* The strip is designed for four cards; if the flags in menu-data.js ever
     mark fewer, top it up with whatever is next on the board. */
  if (featured.length < 4) {
    AllCafe.MENU.forEach(function (item) {
      if (featured.length < 4 && featured.indexOf(item) === -1) featured.push(item);
    });
  }

  AllCafe.renderCards(grid, featured.slice(0, 4));
}());

/* ==========================================================================
   ALL Cafe — contact.js
   Loads the map only when asked.

   A Google share-embed needs no API key, which is why it won over Leaflet +
   OpenStreetMap here — zero dependencies, nothing to bundle. The trade-off
   is a third-party request, so the iframe is held behind a button: the page
   stays light, works offline until someone wants the map, and nobody is
   silently handed to Google just for reading the opening hours.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe;
  var figure = document.querySelector('[data-map]');
  if (!figure) return;

  var placeholder = figure.querySelector('[data-map-placeholder]');
  var button = figure.querySelector('[data-map-load]');
  if (!button) return;

  button.addEventListener('click', function () {
    var query = encodeURIComponent(AllCafe.SITE.address + ', Philippines');

    var frame = document.createElement('iframe');
    frame.src = 'https://www.google.com/maps?q=' + query + '&z=16&output=embed';
    frame.title = 'Map showing ALL Cafe on Taas Rd., Barangay 171, Caloocan City';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.setAttribute('allowfullscreen', '');

    placeholder.replaceWith(frame);

    AllCafe.toast({
      html: 'Map loaded from Google &mdash; <b>67 Taas Rd., Barangay 171</b>.',
      actionLabel: 'Get directions',
      actionHref: AllCafe.SITE.mapsUrl
    });
  });
}());

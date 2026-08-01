/* ==========================================================================
   ALL Cafe — menu.js
   Builds the board from menu-data.js and keeps the sticky category pills in
   step with the scroll position.

   Anchors rather than filters: tapping a pill jumps, it never re-flows the
   grid under your thumb, and the whole menu stays scannable in one scroll.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe;
  var tabsHost = document.querySelector('[data-tabs]');
  var sectionsHost = document.querySelector('[data-menu-sections]');
  if (!tabsHost || !sectionsHost) return;

  var esc = AllCafe.escapeHTML;

  /* ---- render --------------------------------------------------------- */
  tabsHost.innerHTML = AllCafe.CATEGORIES.map(function (category, index) {
    return '<a class="tab' + (index === 0 ? ' is-active' : '') + '" href="#cat-' + esc(category.id) + '">' +
      esc(category.label) + '</a>';
  }).join('');

  sectionsHost.innerHTML = AllCafe.CATEGORIES.map(function (category) {
    var items = AllCafe.itemsIn(category.id);
    return '' +
    '<section class="menu-section" id="cat-' + esc(category.id) + '" aria-labelledby="h-' + esc(category.id) + '">' +
      '<div class="menu-section__head">' +
        '<h2 id="h-' + esc(category.id) + '">' + esc(category.label) + '</h2>' +
        '<p class="menu-section__note">' + esc(category.note) + '</p>' +
      '</div>' +
      '<div class="card-grid">' + items.map(AllCafe.cardHTML).join('') + '</div>' +
    '</section>';
  }).join('');

  /* ---- scroll-spy ------------------------------------------------------ */
  var tabs = Array.prototype.slice.call(tabsHost.querySelectorAll('.tab'));
  var sections = AllCafe.CATEGORIES.map(function (category) {
    return document.getElementById('cat-' + category.id);
  });

  function setActive(index) {
    tabs.forEach(function (tab, i) {
      var active = i === index;
      tab.classList.toggle('is-active', active);
      if (active) { tab.setAttribute('aria-current', 'true'); } else { tab.removeAttribute('aria-current'); }
    });
  }

  /* The line a section has to cross to count as "the one you're reading":
     just under the sticky header and the pill bar. */
  function threshold() {
    var header = document.querySelector('.site-header');
    var headerH = header ? header.offsetHeight : 68;
    return headerH + tabsHost.offsetHeight + 16;
  }

  function spy() {
    var line = threshold();
    var index = 0;
    sections.forEach(function (section, i) {
      if (section && section.getBoundingClientRect().top <= line + 4) index = i;
    });
    /* At the very bottom the last section may never reach the line — if the
       page is scrolled out, highlight the last one anyway. */
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      index = sections.length - 1;
    }
    setActive(index);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { spy(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* Reflect the tap immediately; the spy confirms once the scroll lands. */
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { setActive(index); });
  });

  spy();
}());

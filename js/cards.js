/* ==========================================================================
   ALL Cafe — cards.js
   One menu-card template and one add-to-cart handler, shared by the Home
   page's featured strip and the full Menu page. Adding is delegated from
   the document, so cards rendered at any time are wired automatically.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe = window.AllCafe || {};
  var esc = AllCafe.escapeHTML;

  var TAG_CLASS = { 'Iced': 'tag--iced', 'Best-seller': 'tag--best' };

  AllCafe.cardHTML = function (item) {
    var tags = (item.tags || []).map(function (tag) {
      return '<span class="tag ' + (TAG_CLASS[tag] || '') + '">' + esc(tag) + '</span>';
    }).join('');

    return '' +
    '<article class="card tasa">' +
      '<div class="card__media">' +
        '<img src="' + esc(item.img) + '" alt="' + esc(item.alt) + '" width="400" height="300" loading="lazy">' +
      '</div>' +
      '<div class="card__body">' +
        (tags ? '<div class="card__tags">' + tags + '</div>' : '') +
        '<h3 class="card__title">' + esc(item.name) + '</h3>' +
        '<p class="card__desc">' + esc(item.desc) + '</p>' +
        '<div class="card__foot">' +
          '<span class="price card__price">' + AllCafe.peso(item.price) + '</span>' +
          '<button class="btn btn--primary btn--sm add-btn" type="button" data-add-id="' + esc(item.id) + '">' +
            '<span class="add-btn__label">Add to cart</span>' +
            '<span class="visually-hidden">&nbsp;— ' + esc(item.name) + ', ' + AllCafe.peso(item.price) + '</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  };

  AllCafe.renderCards = function (target, items) {
    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return;
    host.innerHTML = items.map(AllCafe.cardHTML).join('');
  };

  /* ---- add to cart ---------------------------------------------------- */
  document.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('[data-add-id]') : null;
    if (!button) return;

    var id = button.getAttribute('data-add-id');
    var item = AllCafe.findItem(id);
    if (!item) return;

    var before = AllCafe.cart.count();
    var qty = AllCafe.cart.add(id, 1);
    var label = button.querySelector('.add-btn__label');

    if (AllCafe.cart.count() === before) {
      /* already at the per-item ceiling */
      AllCafe.toast({
        html: 'That is the most we can prep per order — <b>' + esc(item.name) +
              ' &times;' + AllCafe.cart.MAX_QTY + '</b>. Give us a call for bigger batches.',
        actionLabel: 'Call us', actionHref: AllCafe.SITE.mobileHref
      });
      return;
    }

    if (label) {
      button.classList.add('is-added');
      label.textContent = '✓ Added';
      window.setTimeout(function () {
        button.classList.remove('is-added');
        label.textContent = 'Add to cart';
      }, 1400);
    }

    AllCafe.toast({
      html: '<b>' + esc(item.name) + '</b> added' + (qty > 1 ? ' (&times;' + qty + ')' : '') + '.',
      actionLabel: 'View order',
      actionHref: 'order.html'
    });
  });
}());

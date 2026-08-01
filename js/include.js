/* ==========================================================================
   ALL Cafe — include.js
   The shared shell. Injects the header and footer into every page from one
   place, marks the active nav item, and exposes the small cross-page
   primitives (storage, peso formatting, opening hours, toasts) that the
   other scripts build on.

   Loaded first, with `defer`, so the DOM is parsed and the shell exists
   before cart.js / chat.js / page controllers run.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe = window.AllCafe || {};

  /* ---------------------------------------------------------------------
     Shop facts. Single source of truth — the footer, contact page, chat
     widget and time pickers all read from here.
     --------------------------------------------------------------------- */
  AllCafe.SITE = {
    name: 'ALL Cafe',
    tagline: 'Kape para sa lahat.',
    address: '123 P. Zamora St., Barangay 15, Caloocan City',
    addressExtra: 'Monumento area — 2 tricycle minutes from LRT-1',
    mobile: '0917 555 0142',
    mobileHref: 'tel:+639175550142',
    email: 'hello@allcafe.ph',
    facebook: 'facebook.com/allcafeph',
    instagram: '@allcafe.ph',
    leadTimeMins: 30
  };

  /* Opening hours, keyed by JS day number. 24-hour minutes from midnight. */
  AllCafe.HOURS = {
    0: { label: 'Sunday',           open: 8 * 60,  close: 20 * 60 },
    1: { label: 'Monday',           open: 7 * 60,  close: 21 * 60 },
    2: { label: 'Tuesday',          open: 7 * 60,  close: 21 * 60 },
    3: { label: 'Wednesday',        open: 7 * 60,  close: 21 * 60 },
    4: { label: 'Thursday',         open: 7 * 60,  close: 21 * 60 },
    5: { label: 'Friday',           open: 7 * 60,  close: 22 * 60 },
    6: { label: 'Saturday',         open: 7 * 60,  close: 22 * 60 }
  };
  AllCafe.HOURS_SUMMARY = [
    { days: 'Mon – Thu', time: '7:00 AM – 9:00 PM' },
    { days: 'Fri – Sat', time: '7:00 AM – 10:00 PM' },
    { days: 'Sunday',    time: '8:00 AM – 8:00 PM' }
  ];

  /* ---------------------------------------------------------------------
     Storage. sessionStorage can be unavailable (private modes, or a
     browser that walls off file:// pages), and the whole prototype is
     meant to survive a double-click on index.html — so every read and
     write goes through here, with an in-memory fallback.
     --------------------------------------------------------------------- */
  var memoryStore = {};
  var hasSession = (function () {
    try {
      var k = '__allcafe_probe__';
      window.sessionStorage.setItem(k, '1');
      window.sessionStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }());

  AllCafe.store = {
    persistent: hasSession,
    get: function (key, fallback) {
      var raw;
      try {
        raw = hasSession ? window.sessionStorage.getItem(key) : memoryStore[key];
      } catch (e) { raw = memoryStore[key]; }
      if (raw == null) return fallback;
      try { return JSON.parse(raw); } catch (e) { return fallback; }
    },
    set: function (key, value) {
      var raw = JSON.stringify(value);
      memoryStore[key] = raw;
      if (hasSession) {
        try { window.sessionStorage.setItem(key, raw); } catch (e) { /* quota or blocked — memory still holds it */ }
      }
    },
    remove: function (key) {
      delete memoryStore[key];
      if (hasSession) {
        try { window.sessionStorage.removeItem(key); } catch (e) {}
      }
    }
  };

  /* ---------------------------------------------------------------------
     Formatting + time helpers
     --------------------------------------------------------------------- */
  AllCafe.peso = function (amount) {
    return '₱' + Number(amount || 0).toLocaleString('en-PH');
  };

  /* 930 -> "3:30 PM" */
  AllCafe.formatTime = function (minutes) {
    var h = Math.floor(minutes / 60), m = minutes % 60;
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + suffix;
  };

  /* "2026-08-01" for <input type="date"> and order codes */
  AllCafe.toISODate = function (date) {
    var m = date.getMonth() + 1, d = date.getDate();
    return date.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  };

  AllCafe.parseISODate = function (value) {
    var parts = String(value || '').split('-');
    if (parts.length !== 3) return null;
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(date.getTime()) ? null : date;
  };

  AllCafe.formatLongDate = function (value) {
    var date = typeof value === 'string' ? AllCafe.parseISODate(value) : value;
    if (!date) return '';
    return date.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  AllCafe.hoursFor = function (date) { return AllCafe.HOURS[date.getDay()]; };

  AllCafe.isOpenNow = function () {
    var now = new Date();
    var today = AllCafe.hoursFor(now);
    var mins = now.getHours() * 60 + now.getMinutes();
    return {
      open: mins >= today.open && mins < today.close,
      opensAt: AllCafe.formatTime(today.open),
      closesAt: AllCafe.formatTime(today.close)
    };
  };

  /* ---------------------------------------------------------------------
     Icons — inlined so they inherit currentColor on navy and on enamel.
     --------------------------------------------------------------------- */
  var ICONS = AllCafe.ICONS = {
    /* the enamel tasa: our mark, drawn once and reused everywhere */
    mug: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<path d="M13.5 25 16 49c.4 4.5 3.5 7 8 7h12c4.5 0 7.6-2.5 8-7l2.5-24Z" fill="currentColor" opacity=".18"/>' +
      '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M46.5 30.5C54.5 30.5 58.5 34 58.5 38.5S54.5 46.5 47.5 46.5"/>' +
      '<path d="M13.5 25 16 49c.4 4.5 3.5 7 8 7h12c4.5 0 7.6-2.5 8-7l2.5-24"/></g>' +
      '<rect x="10" y="14.5" width="40" height="9" rx="4.5" fill="currentColor"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M4.5 8h15l-1.1 11.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8Z"/><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2"/></svg>',
    bars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false">' +
      '<path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false">' +
      '<path d="m6 6 12 12M18 6 6 18"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="m9 5 7 7-7 7"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M4 12 20 4l-4 16-4.5-6.2Z"/><path d="m11.5 13.8 8.5-9.8"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
      '<path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5H16.6V4.4A21 21 0 0 0 14.3 4C12 4 10.5 5.4 10.5 8v2.5H8v3h2.5V21Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">' +
      '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none"/></svg>'
  };

  /* ---------------------------------------------------------------------
     Navigation model. Add a page here and it appears in the header, the
     mobile sheet and the footer at once — the reason the shell is injected
     rather than pasted into six files.
     --------------------------------------------------------------------- */
  var NAV = [
    { href: 'index.html', label: 'Home' },
    { href: 'menu.html', label: 'Menu' },
    { href: 'reservation.html', label: 'Reserve' },
    { href: 'contact.html', label: 'Visit Us' }
  ];
  var ORDER_PAGE = { href: 'order.html', label: 'Your Order' };

  var currentPage = (function () {
    var file = window.location.pathname.split('/').pop();
    return (!file || file === '') ? 'index.html' : file;
  }());
  AllCafe.currentPage = currentPage;

  function isCurrent(href) { return href === currentPage; }
  function aria(href) { return isCurrent(href) ? ' aria-current="page"' : ''; }

  /* ---------------------------------------------------------------------
     Header + footer markup
     --------------------------------------------------------------------- */
  function headerHTML() {
    return '' +
    '<a class="skip-link" href="#main">Skip to content</a>' +
    '<header class="site-header">' +
      '<div class="wrap header__inner">' +
        '<a class="logo" href="index.html"' + (isCurrent('index.html') ? ' aria-current="page"' : '') + '>' +
          ICONS.mug +
          '<span class="logo__word"><b>ALL</b> Cafe</span>' +
        '</a>' +
        '<nav class="nav" aria-label="Main">' +
          '<ul class="nav__list">' +
            NAV.map(function (item) {
              return '<li><a class="nav__link" href="' + item.href + '"' + aria(item.href) + '>' + item.label + '</a></li>';
            }).join('') +
          '</ul>' +
        '</nav>' +
        '<div class="header__actions">' +
          '<a class="cart-btn" href="order.html"' + aria('order.html') + ' data-cart-link>' +
            ICONS.bag +
            '<span class="cart-btn__label">Order</span>' +
            '<span class="cart-btn__count" data-cart-count hidden>0</span>' +
            '<span class="visually-hidden" data-cart-label>Advance order, cart is empty</span>' +
          '</a>' +
          '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" data-nav-toggle>' +
            ICONS.bars +
            '<span class="visually-hidden">Open menu</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<div class="mobile-nav" id="mobile-nav" hidden>' +
      '<div class="wrap">' +
        '<ul class="mobile-nav__list">' +
          NAV.concat([ORDER_PAGE]).map(function (item) {
            return '<li><a class="mobile-nav__link" href="' + item.href + '"' + aria(item.href) + '>' +
              item.label + ICONS.chevron + '</a></li>';
          }).join('') +
        '</ul>' +
        '<p class="mobile-nav__foot">' + AllCafe.SITE.address + '<br>' +
          '<a href="' + AllCafe.SITE.mobileHref + '">' + AllCafe.SITE.mobile + '</a></p>' +
      '</div>' +
    '</div>';
  }

  function footerHTML() {
    var s = AllCafe.SITE;
    return '' +
    '<footer class="site-footer">' +
      '<div class="wrap footer">' +
        '<div class="footer__grid">' +
          '<div class="footer__brand">' +
            '<a class="logo" href="index.html">' + ICONS.mug + '<span class="logo__word"><b>ALL</b> Cafe</span></a>' +
            '<p class="footer__tagline">' + s.tagline + '</p>' +
            '<div class="footer__social">' +
              '<a href="https://' + s.facebook + '" rel="noopener nofollow">' + ICONS.facebook +
                '<span class="visually-hidden">ALL Cafe on Facebook (demo link)</span></a>' +
              '<a href="https://instagram.com/allcafe.ph" rel="noopener nofollow">' + ICONS.instagram +
                '<span class="visually-hidden">ALL Cafe on Instagram (demo link)</span></a>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h2>Explore</h2>' +
            '<ul>' +
              NAV.concat([ORDER_PAGE]).map(function (item) {
                return '<li><a href="' + item.href + '">' + item.label + '</a></li>';
              }).join('') +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h2>Hours</h2>' +
            '<ul>' +
              AllCafe.HOURS_SUMMARY.map(function (row) {
                return '<li>' + row.days + '<br>' + row.time + '</li>';
              }).join('') +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h2>Find Us</h2>' +
            '<ul>' +
              '<li>' + s.address + '</li>' +
              '<li><a href="' + s.mobileHref + '">' + s.mobile + '</a></li>' +
              '<li><a href="mailto:' + s.email + '">' + s.email + '</a></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer__bar">' +
          '<span>&copy; ' + new Date().getFullYear() + ' ' + s.name + '. Caloocan City.</span>' +
          '<span class="footer__demo">Demo prototype &mdash; not a real store (yet)</span>' +
        '</div>' +
      '</div>' +
    '</footer>';
  }

  /* ---------------------------------------------------------------------
     Mount
     --------------------------------------------------------------------- */
  function mount() {
    var headerSlot = document.querySelector('[data-include="header"]');
    var footerSlot = document.querySelector('[data-include="footer"]');
    if (headerSlot) headerSlot.outerHTML = headerHTML();
    if (footerSlot) footerSlot.outerHTML = footerHTML();

    wireMobileNav();
    ensureToastRegion();
    renderOpenStatus();
    fillSiteDetails();
  }

  /* Shop details are written once here and stamped into any page that asks
     for them, so the address and phone number can never disagree. */
  function fillSiteDetails() {
    var s = AllCafe.SITE;
    var mapsQuery = encodeURIComponent(s.address + ', Philippines');

    each('[data-address]', function (node) {
      node.innerHTML = AllCafe.escapeHTML(s.address) + '<br><span class="field__hint">' +
        AllCafe.escapeHTML(s.addressExtra) + '</span>';
    });
    each('[data-hours-list]', function (node) {
      node.innerHTML = AllCafe.HOURS_SUMMARY.map(function (row) {
        return '<li><strong>' + row.days + '</strong> &middot; ' + row.time + '</li>';
      }).join('');
    });
    each('[data-site-phone]', function (node) {
      node.href = s.mobileHref;
      if (!node.dataset.keepText) node.textContent = s.mobile;
    });
    each('[data-site-email]', function (node) {
      node.href = 'mailto:' + s.email;
      if (!node.dataset.keepText) node.textContent = s.email;
    });
    each('[data-maps-link]', function (node) {
      node.href = 'https://www.google.com/maps/search/?api=1&query=' + mapsQuery;
    });
  }

  function each(selector, fn) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) fn(nodes[i]);
  }
  AllCafe.each = each;

  /* Any element marked [data-open-status] gets a live open/closed pill —
     used on the hero and on the contact page's hours card. */
  function renderOpenStatus() {
    var nodes = document.querySelectorAll('[data-open-status]');
    if (!nodes.length) return;
    var status = AllCafe.isOpenNow();
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].innerHTML = '<span class="dot' + (status.open ? ' dot--open' : '') + '"></span>' +
        (status.open
          ? 'Open today until ' + status.closesAt
          : 'Closed now &mdash; opens ' + status.opensAt);
    }
  }
  AllCafe.renderOpenStatus = renderOpenStatus;

  function wireMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var sheet = document.getElementById('mobile-nav');
    if (!toggle || !sheet) return;

    function setOpen(open) {
      sheet.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = (open ? ICONS.close : ICONS.bars) +
        '<span class="visually-hidden">' + (open ? 'Close menu' : 'Open menu') + '</span>';
      document.body.classList.toggle('nav-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    /* A resize past the breakpoint should not leave the sheet stuck open. */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------
     Toasts — shared by the cart, the undo flow and the forms.
     --------------------------------------------------------------------- */
  function ensureToastRegion() {
    if (document.querySelector('.toast-region')) return;
    var region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }

  AllCafe.toast = function (options) {
    ensureToastRegion();
    var region = document.querySelector('.toast-region');
    var config = options || {};
    var duration = config.duration || 4200;

    var toast = document.createElement('div');
    toast.className = 'toast';

    var text = document.createElement('p');
    text.className = 'toast__text';
    text.innerHTML = config.html || config.text || '';
    toast.appendChild(text);

    if (config.actionLabel) {
      var action = document.createElement(config.actionHref ? 'a' : 'button');
      action.className = 'toast__action';
      action.textContent = config.actionLabel;
      if (config.actionHref) {
        action.href = config.actionHref;
      } else {
        action.type = 'button';
        action.addEventListener('click', function () {
          if (config.onAction) config.onAction();
          dismiss();
        });
      }
      toast.appendChild(action);
    }

    region.appendChild(toast);

    var timer = window.setTimeout(dismiss, duration);
    function dismiss() {
      window.clearTimeout(timer);
      if (!toast.isConnected) return;
      toast.classList.add('is-leaving');
      window.setTimeout(function () { if (toast.isConnected) toast.remove(); }, 220);
    }
    return { dismiss: dismiss };
  };

  /* ---------------------------------------------------------------------
     Small shared DOM helpers used by the page controllers.
     --------------------------------------------------------------------- */
  AllCafe.escapeHTML = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* A short, human-readable reference code: ALL-20260801-047 / RSV-0472 */
  AllCafe.orderCode = function () {
    var n = Math.floor(Math.random() * 900) + 100;
    return 'ALL-' + AllCafe.toISODate(new Date()).replace(/-/g, '') + '-' + n;
  };
  AllCafe.reservationCode = function () {
    return 'RSV-' + String(Math.floor(Math.random() * 9000) + 1000);
  };

  mount();
}());

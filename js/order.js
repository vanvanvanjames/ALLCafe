/* ==========================================================================
   ALL Cafe — order.js
   Drives the three states of the advance-order page — empty, cart, and
   confirmation — swapping views in place rather than reloading.

   After a successful order the cart is cleared but a snapshot is kept in
   sessionStorage, so a refresh still shows the code the customer is meant
   to quote at the counter. Adding new items afterwards returns the page to
   the cart view: the snapshot is history, not a wall.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe;
  var form = document.querySelector('[data-order-form]');
  if (!form) return;

  var Forms = AllCafe.forms;
  var esc = AllCafe.escapeHTML;
  var SNAPSHOT_KEY = 'allcafe.order';
  var LEAD_MINS = AllCafe.SITE.leadTimeMins;   /* 30 */
  var LAST_SLOT_BEFORE_CLOSE = 30;
  var DAYS_AHEAD = 7;

  var views = {
    empty: document.querySelector('[data-view="empty"]'),
    cart: form,
    confirm: document.querySelector('[data-view="confirm"]')
  };

  var cartList = document.querySelector('[data-cart-list]');
  var chitRows = document.querySelector('[data-chit-rows]');
  var chitSubtotal = document.querySelector('[data-chit-subtotal]');
  var chitTotal = document.querySelector('[data-chit-total]');
  var submitBtn = form.querySelector('[data-submit]');

  var dateInput = document.getElementById('order-date');
  var timeSelect = document.getElementById('order-time');
  var slotHint = document.querySelector('[data-slot-hint]');

  /* ---------------------------------------------------------------------
     View switching
     --------------------------------------------------------------------- */
  function show(name) {
    Object.keys(views).forEach(function (key) {
      if (views[key]) views[key].hidden = key !== name;
    });
  }

  function decideView() {
    var snapshot = AllCafe.store.get(SNAPSHOT_KEY, null);
    if (snapshot && AllCafe.cart.isEmpty()) {
      renderConfirmation(snapshot);
      show('confirm');
      return;
    }
    if (AllCafe.cart.isEmpty()) { show('empty'); return; }
    renderCart();
    show('cart');
  }

  /* ---------------------------------------------------------------------
     Cart rendering
     --------------------------------------------------------------------- */
  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/>' +
    '<path d="M6.5 7 7.6 19.2a2 2 0 0 0 2 1.8h4.8a2 2 0 0 0 2-1.8L17.5 7"/><path d="M10.5 11v6M13.5 11v6"/></svg>';

  function renderCart() {
    var lines = AllCafe.cart.detailed();

    cartList.innerHTML = lines.map(function (line) {
      return '' +
      '<li class="cart-row" data-row="' + esc(line.id) + '">' +
        '<div class="cart-row__media">' +
          '<img src="' + esc(line.img) + '" alt="' + esc(line.alt) + '" width="84" height="84" loading="lazy">' +
        '</div>' +
        '<div>' +
          '<p class="cart-row__name">' + esc(line.name) + '</p>' +
          '<p class="cart-row__unit">' + AllCafe.peso(line.price) + ' each</p>' +
        '</div>' +
        '<div class="cart-row__qty">' +
          '<div class="stepper">' +
            '<button type="button" data-step="-1" data-id="' + esc(line.id) + '"' +
              (line.qty <= 1 ? '' : '') + '>' +
              '&minus;<span class="visually-hidden">Remove one ' + esc(line.name) + '</span></button>' +
            '<input type="number" min="1" max="' + AllCafe.cart.MAX_QTY + '" step="1" value="' + line.qty + '" ' +
              'data-qty-input="' + esc(line.id) + '" aria-label="Quantity of ' + esc(line.name) + '">' +
            '<button type="button" data-step="1" data-id="' + esc(line.id) + '"' +
              (line.qty >= AllCafe.cart.MAX_QTY ? ' disabled' : '') + '>' +
              '+<span class="visually-hidden">Add one ' + esc(line.name) + '</span></button>' +
          '</div>' +
        '</div>' +
        '<p class="cart-row__total">' + AllCafe.peso(line.lineTotal) + '</p>' +
        '<button class="cart-row__remove" type="button" data-remove="' + esc(line.id) + '">' +
          TRASH + '<span class="visually-hidden">Remove ' + esc(line.name) + ' from your order</span>' +
        '</button>' +
      '</li>';
    }).join('');

    renderChit(lines);
  }

  function renderChit(lines) {
    var subtotal = AllCafe.cart.subtotal();
    chitRows.innerHTML = lines.map(function (line) {
      return '<p class="chit__row"><span>' + line.qty + ' &times; ' + esc(line.name) + '</span>' +
        '<span>' + AllCafe.peso(line.lineTotal) + '</span></p>';
    }).join('');
    chitSubtotal.textContent = AllCafe.peso(subtotal);
    chitTotal.textContent = AllCafe.peso(subtotal);
  }

  /* ---- quantity + removal --------------------------------------------- */
  cartList.addEventListener('click', function (event) {
    var stepBtn = event.target.closest('[data-step]');
    if (stepBtn) {
      var id = stepBtn.getAttribute('data-id');
      var delta = Number(stepBtn.getAttribute('data-step'));
      var current = 0;
      AllCafe.cart.lines().forEach(function (line) { if (line.id === id) current = line.qty; });

      if (current + delta < 1) { removeWithUndo(id); return; }
      AllCafe.cart.setQty(id, current + delta);
      return;
    }

    var removeBtn = event.target.closest('[data-remove]');
    if (removeBtn) removeWithUndo(removeBtn.getAttribute('data-remove'));
  });

  cartList.addEventListener('change', function (event) {
    var input = event.target.closest('[data-qty-input]');
    if (!input) return;
    var id = input.getAttribute('data-qty-input');
    var next = Math.round(Number(input.value));
    if (!isFinite(next) || next < 1) { removeWithUndo(id); return; }
    AllCafe.cart.setQty(id, next);
  });

  function removeWithUndo(id) {
    var item = AllCafe.findItem(id);
    var entry = AllCafe.cart.remove(id);
    if (!entry) return;

    AllCafe.toast({
      html: '<b>' + esc(item ? item.name : 'Item') + '</b> removed.',
      actionLabel: 'Undo',
      duration: 5000,
      onAction: function () { AllCafe.cart.restore(entry); }
    });
  }

  /* Any change to the cart — from this page or the chat widget — re-renders. */
  document.addEventListener('allcafe:cart', function () {
    if (AllCafe.cart.isEmpty()) {
      var snapshot = AllCafe.store.get(SNAPSHOT_KEY, null);
      show(snapshot ? 'confirm' : 'empty');
      return;
    }
    renderCart();
    show('cart');
  });

  /* ---------------------------------------------------------------------
     Pickup details
     --------------------------------------------------------------------- */
  Forms.boundDateInput(dateInput, DAYS_AHEAD);

  /* Default to the first day that still has a usable slot — after closing
     time, that is tomorrow, and offering today would be a dead end. */
  (function seedDate() {
    var probe = new Date();
    for (var i = 0; i <= DAYS_AHEAD; i++) {
      var iso = AllCafe.toISODate(probe);
      if (Forms.slotsFor(iso, { leadMins: LEAD_MINS, endOffsetMins: LAST_SLOT_BEFORE_CLOSE }).length) {
        dateInput.value = iso;
        return;
      }
      probe.setDate(probe.getDate() + 1);
    }
    dateInput.value = AllCafe.toISODate(new Date());
  }());

  function refreshSlots() {
    var slots = Forms.fillSlots(timeSelect, dateInput.value, {
      leadMins: LEAD_MINS,
      endOffsetMins: LAST_SLOT_BEFORE_CLOSE
    });
    if (!slotHint) return;
    slotHint.textContent = slots.length
      ? '30-minute slots · earliest ' + slots[0].label + ' · at least ' + LEAD_MINS + ' minutes from now.'
      : 'Nothing left for that day — try the next one.';
  }
  refreshSlots();
  dateInput.addEventListener('change', function () {
    refreshSlots();
    validate('date');
    validate('time');
  });

  Forms.wireCounter(document.getElementById('order-notes'), document.querySelector('[data-counter]'));

  /* ---------------------------------------------------------------------
     Validation
     --------------------------------------------------------------------- */
  var RULES = {
    name: function (value) {
      if (!value.trim()) return 'Please tell us who is picking this up.';
      if (value.trim().length < 2) return 'That looks a little short — at least 2 characters.';
      return '';
    },
    mobile: function (value) {
      if (!value.trim()) return 'We need a number in case the bar has a question.';
      if (!Forms.isValidMobile(value)) return 'Use a PH mobile number — 09XXXXXXXXX or +639XXXXXXXXX.';
      return '';
    },
    date: function (value) {
      if (!value) return 'Pick a day for your pickup.';
      var picked = AllCafe.parseISODate(value);
      var today = AllCafe.parseISODate(AllCafe.toISODate(new Date()));
      if (!picked) return 'That date did not read properly.';
      if (picked < today) return 'That day has already passed.';
      var limit = new Date(today.getTime());
      limit.setDate(limit.getDate() + DAYS_AHEAD);
      if (picked > limit) return 'We only take orders up to ' + DAYS_AHEAD + ' days ahead.';
      return '';
    },
    time: function (value) {
      if (!value) return 'Choose a pickup time.';
      var valid = Forms.slotsFor(dateInput.value, {
        leadMins: LEAD_MINS, endOffsetMins: LAST_SLOT_BEFORE_CLOSE
      }).some(function (slot) { return slot.value === value; });
      if (!valid) return 'That slot has passed — pick another one.';
      return '';
    }
  };

  function valueOf(name) {
    var input = form.querySelector('[name="' + name + '"]');
    return input ? input.value : '';
  }

  function validate(name) {
    var rule = RULES[name];
    if (!rule) return true;
    var message = rule(valueOf(name));
    var fieldEl = Forms.field(form, name);
    if (message) { Forms.setError(fieldEl, message); return false; }
    Forms.clearError(fieldEl);
    return true;
  }

  Object.keys(RULES).forEach(function (name) {
    var input = form.querySelector('[name="' + name + '"]');
    if (!input) return;
    input.addEventListener('blur', function () { validate(name); });
    input.addEventListener('input', function () {
      if (Forms.field(form, name).classList.contains('is-invalid')) validate(name);
    });
  });

  /* ---------------------------------------------------------------------
     Submit
     --------------------------------------------------------------------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (AllCafe.cart.isEmpty()) { decideView(); return; }

    var failed = Object.keys(RULES).filter(function (name) { return !validate(name); });
    Forms.showSummary(form, failed.length);
    if (failed.length) { Forms.focusFirstInvalid(form); return; }

    Forms.pretendToSend(submitBtn, function () {
      var snapshot = {
        code: AllCafe.orderCode(),
        name: valueOf('name').trim(),
        mobile: Forms.formatMobile(valueOf('mobile')),
        date: valueOf('date'),
        time: valueOf('time'),
        notes: valueOf('notes').trim(),
        total: AllCafe.cart.subtotal(),
        items: AllCafe.cart.detailed().map(function (line) {
          return { name: line.name, qty: line.qty, lineTotal: line.lineTotal };
        })
      };

      AllCafe.store.set(SNAPSHOT_KEY, snapshot);
      AllCafe.cart.clear();          /* fires allcafe:cart → falls through to the snapshot */

      renderConfirmation(snapshot);
      show('confirm');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      var heading = views.confirm.querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    });
  });

  /* ---------------------------------------------------------------------
     Confirmation
     --------------------------------------------------------------------- */
  function renderConfirmation(snapshot) {
    var target = views.confirm;
    if (!target || !snapshot) return;

    target.querySelector('[data-confirm-code]').textContent = snapshot.code;
    target.querySelector('[data-confirm-name]').textContent = snapshot.name;
    target.querySelector('[data-confirm-mobile]').textContent = snapshot.mobile;
    target.querySelector('[data-confirm-when]').textContent = Forms.describeSlot(snapshot.date, snapshot.time);
    target.querySelector('[data-confirm-total]').textContent = AllCafe.peso(snapshot.total);

    target.querySelector('[data-confirm-items]').innerHTML = (snapshot.items || []).map(function (line) {
      return '<p class="chit__row"><span>' + line.qty + ' &times; ' + esc(line.name) + '</span>' +
        '<span>' + AllCafe.peso(line.lineTotal) + '</span></p>';
    }).join('') +
      '<hr class="chit__rule"><p class="chit__row"><span><strong>Total</strong></span>' +
      '<span><strong>' + AllCafe.peso(snapshot.total) + '</strong></span></p>';

    var notes = target.querySelector('[data-confirm-notes]');
    if (snapshot.notes) {
      notes.textContent = '“' + snapshot.notes + '”';
      notes.hidden = false;
    } else {
      notes.hidden = true;
    }
  }

  decideView();
}());

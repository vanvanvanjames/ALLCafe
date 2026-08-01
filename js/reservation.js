/* ==========================================================================
   ALL Cafe — reservation.js
   Table booking: validation on blur and on submit, a confirmation view
   swapped in without a reload, and a banner that remembers a pending
   request for the rest of the tab session.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe;
  var form = document.querySelector('[data-reservation-form]');
  if (!form) return;

  var Forms = AllCafe.forms;
  var esc = AllCafe.escapeHTML;
  var KEY = 'allcafe.reservation';
  var DAYS_AHEAD = 30;
  var LEAD_MINS = 30;
  var LAST_SEATING_BEFORE_CLOSE = 60;

  var formView = document.querySelector('[data-view="form"]');
  var confirmView = document.querySelector('[data-view="confirm"]');
  var submitBtn = form.querySelector('[data-submit]');
  var submitHint = form.querySelector('[data-submit-hint]');
  var defaultHint = submitHint ? submitHint.innerHTML : '';

  var dateInput = document.getElementById('rsv-date');
  var timeSelect = document.getElementById('rsv-time');
  var partySelect = document.getElementById('rsv-party');
  var slotHint = form.querySelector('[data-slot-hint]');

  var banner = document.querySelector('[data-pending-banner]');

  /* ---------------------------------------------------------------------
     Views
     --------------------------------------------------------------------- */
  function showForm() {
    formView.hidden = false;
    confirmView.hidden = true;
    refreshBanner();
  }

  function showConfirm(booking) {
    renderConfirmation(booking);
    formView.hidden = true;
    confirmView.hidden = false;
  }

  function refreshBanner() {
    var booking = AllCafe.store.get(KEY, null);
    if (!banner) return;
    if (!booking) { banner.hidden = true; return; }
    banner.hidden = false;
    banner.querySelector('[data-pending-code]').textContent = booking.code;
    banner.querySelector('[data-pending-when]').textContent =
      ' for ' + Forms.describeSlot(booking.date, booking.time);
  }

  if (banner) {
    banner.querySelector('[data-pending-view]').addEventListener('click', function () {
      var booking = AllCafe.store.get(KEY, null);
      if (booking) showConfirm(booking);
    });
    banner.querySelector('[data-pending-cancel]').addEventListener('click', function () {
      var booking = AllCafe.store.get(KEY, null);
      if (!booking) return;
      AllCafe.store.remove(KEY);
      showForm();
      AllCafe.toast({
        html: 'Request <b>' + esc(booking.code) + '</b> cancelled.',
        actionLabel: 'Undo',
        duration: 5000,
        onAction: function () { AllCafe.store.set(KEY, booking); refreshBanner(); }
      });
    });
  }

  var newBookingBtn = confirmView.querySelector('[data-new-booking]');
  if (newBookingBtn) {
    newBookingBtn.addEventListener('click', function () {
      form.reset();
      Forms.clearAll(form);
      seedDate();
      refreshSlots();
      onPartyChange();
      showForm();
      var first = document.getElementById('rsv-name');
      if (first) first.focus();
    });
  }

  /* ---------------------------------------------------------------------
     Date, slots and the policy strip
     --------------------------------------------------------------------- */
  Forms.boundDateInput(dateInput, DAYS_AHEAD);

  function seedDate() {
    var probe = new Date();
    for (var i = 0; i <= DAYS_AHEAD; i++) {
      var iso = AllCafe.toISODate(probe);
      if (Forms.slotsFor(iso, { leadMins: LEAD_MINS, endOffsetMins: LAST_SEATING_BEFORE_CLOSE }).length) {
        dateInput.value = iso;
        return;
      }
      probe.setDate(probe.getDate() + 1);
    }
    dateInput.value = AllCafe.toISODate(new Date());
  }
  seedDate();

  function refreshSlots() {
    var slots = Forms.fillSlots(timeSelect, dateInput.value, {
      leadMins: LEAD_MINS,
      endOffsetMins: LAST_SEATING_BEFORE_CLOSE
    });
    if (!slotHint) return;
    slotHint.textContent = slots.length
      ? 'Last seating ' + slots[slots.length - 1].label + ' — an hour before we close.'
      : 'No seatings left that day — try the next one.';
  }
  refreshSlots();

  dateInput.addEventListener('change', function () {
    refreshSlots();
    validate('date');
    validate('time');
  });

  /* The policy strip sits beside the form, not inside it — query the page. */
  (function fillPolicyHours() {
    var node = document.querySelector('[data-policy-hours]');
    if (!node) return;
    var today = AllCafe.hoursFor(new Date());
    node.textContent = 'Today: ' + AllCafe.formatTime(today.open) + ' – ' + AllCafe.formatTime(today.close);
  }());

  Forms.wireCounter(document.getElementById('rsv-notes'), form.querySelector('[data-counter]'));

  /* Big groups get routed to a human rather than silently accepted. */
  function onPartyChange() {
    if (!submitHint) return;
    if (partySelect.value === '9+') {
      submitHint.innerHTML = '<span aria-hidden="true">👋</span> Parties over eight need a quick word — ' +
        'send this and we\'ll ring you to arrange the space, or ' +
        '<button class="link-arrow" type="button" data-open-chat style="background:none;border:0;padding:0;font:inherit;cursor:pointer">ask the mug now</button>.';
    } else {
      submitHint.innerHTML = defaultHint;
    }
  }
  partySelect.addEventListener('change', onPartyChange);

  /* ---------------------------------------------------------------------
     Validation
     --------------------------------------------------------------------- */
  var RULES = {
    name: function (value) {
      if (!value.trim()) return 'Whose name is the table under?';
      if (value.trim().length < 2) return 'That looks a little short — at least 2 characters.';
      return '';
    },
    mobile: function (value) {
      if (!value.trim()) return 'We need a number to confirm your table.';
      if (!Forms.isValidMobile(value)) return 'Use a PH mobile number — 09XXXXXXXXX or +639XXXXXXXXX.';
      return '';
    },
    date: function (value) {
      if (!value) return 'Pick a date.';
      var picked = AllCafe.parseISODate(value);
      var today = AllCafe.parseISODate(AllCafe.toISODate(new Date()));
      if (!picked) return 'That date did not read properly.';
      if (picked < today) return 'That day has already passed.';
      var limit = new Date(today.getTime());
      limit.setDate(limit.getDate() + DAYS_AHEAD);
      if (picked > limit) return 'We take bookings up to ' + DAYS_AHEAD + ' days ahead.';
      return '';
    },
    time: function (value) {
      if (!value) return 'Choose a seating time.';
      var valid = Forms.slotsFor(dateInput.value, {
        leadMins: LEAD_MINS, endOffsetMins: LAST_SEATING_BEFORE_CLOSE
      }).some(function (slot) { return slot.value === value; });
      if (!valid) return 'That seating has passed — pick another one.';
      return '';
    },
    party: function (value) {
      if (!value) return 'How many of you are coming?';
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
    input.addEventListener('change', function () { validate(name); });
    input.addEventListener('input', function () {
      if (Forms.field(form, name).classList.contains('is-invalid')) validate(name);
    });
  });

  /* ---------------------------------------------------------------------
     Submit
     --------------------------------------------------------------------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var failed = Object.keys(RULES).filter(function (name) { return !validate(name); });
    Forms.showSummary(form, failed.length);
    if (failed.length) { Forms.focusFirstInvalid(form); return; }

    Forms.pretendToSend(submitBtn, function () {
      var booking = {
        code: AllCafe.reservationCode(),
        name: valueOf('name').trim(),
        mobile: Forms.formatMobile(valueOf('mobile')),
        date: valueOf('date'),
        time: valueOf('time'),
        party: valueOf('party'),
        notes: valueOf('notes').trim()
      };

      AllCafe.store.set(KEY, booking);
      showConfirm(booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      var heading = confirmView.querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    });
  });

  /* ---------------------------------------------------------------------
     Confirmation
     --------------------------------------------------------------------- */
  function renderConfirmation(booking) {
    confirmView.querySelector('[data-confirm-code]').textContent = booking.code;
    confirmView.querySelector('[data-confirm-name]').textContent = booking.name;
    confirmView.querySelector('[data-confirm-mobile]').textContent = booking.mobile;
    confirmView.querySelector('[data-confirm-when]').textContent = Forms.describeSlot(booking.date, booking.time);
    confirmView.querySelector('[data-confirm-party]').textContent =
      booking.party === '9+' ? '9 or more — we\'ll call to arrange' :
      booking.party + (booking.party === '1' ? ' person' : ' people');

    var notes = confirmView.querySelector('[data-confirm-notes]');
    if (booking.notes) {
      notes.textContent = '“' + booking.notes + '”';
      notes.hidden = false;
    } else {
      notes.hidden = true;
    }
  }

  showForm();
}());

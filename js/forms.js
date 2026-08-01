/* ==========================================================================
   ALL Cafe — forms.js
   Shared validation plumbing for the two forms on the site (pickup details
   and table booking). Both need the same things — Philippine mobile
   numbers, opening-hours-aware time slots, errors tied to their inputs via
   aria-describedby — so it lives in one place.

   Not in the original file plan: it was added once the second form proved
   it would otherwise copy ~120 lines from the first.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe = window.AllCafe || {};

  /* 09XXXXXXXXX, +639XXXXXXXXX or 639XXXXXXXXX, spaces and dashes allowed. */
  var PH_MOBILE = /^(?:\+?63|0)9\d{9}$/;

  var Forms = AllCafe.forms = {

    field: function (form, name) {
      return form.querySelector('[data-field="' + name + '"]');
    },

    setError: function (fieldEl, message) {
      if (!fieldEl) return;
      fieldEl.classList.add('is-invalid');
      var slot = fieldEl.querySelector('[data-error]');
      if (slot) slot.textContent = message;
      var input = fieldEl.querySelector('input, select, textarea');
      if (input) input.setAttribute('aria-invalid', 'true');
    },

    clearError: function (fieldEl) {
      if (!fieldEl) return;
      fieldEl.classList.remove('is-invalid');
      var slot = fieldEl.querySelector('[data-error]');
      if (slot) slot.textContent = '';
      var input = fieldEl.querySelector('input, select, textarea');
      if (input) input.removeAttribute('aria-invalid');
    },

    clearAll: function (form) {
      var fields = form.querySelectorAll('[data-field]');
      for (var i = 0; i < fields.length; i++) Forms.clearError(fields[i]);
      var summary = form.querySelector('[data-error-summary]');
      if (summary) summary.hidden = true;
    },

    isValidMobile: function (value) {
      return PH_MOBILE.test(String(value || '').replace(/[\s-]/g, ''));
    },

    /* 09171234567 -> 0917 123 4567, for the confirmation recap */
    formatMobile: function (value) {
      var digits = String(value || '').replace(/[\s-]/g, '').replace(/^\+?63/, '0');
      return digits.length === 11
        ? digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7)
        : String(value || '');
    },

    /* ------------------------------------------------------------------
       Time slots, generated from the opening hours in include.js.
         leadMins     — how far ahead of *now* the first slot may be (today)
         endOffsetMins— how long before closing the last slot sits
       ------------------------------------------------------------------ */
    slotsFor: function (isoDate, options) {
      var config = options || {};
      var step = config.step || 30;
      var lead = config.leadMins || 0;
      var endOffset = config.endOffsetMins || 0;

      var date = AllCafe.parseISODate(isoDate);
      if (!date) return [];

      var now = new Date();
      var todayISO = AllCafe.toISODate(now);
      /* A day that has already gone has no slots left, whatever the
         opening hours say for that weekday. */
      if (isoDate < todayISO) return [];

      var hours = AllCafe.hoursFor(date);
      var isToday = todayISO === isoDate;
      var earliest = hours.open;

      if (isToday) {
        var minutesNow = now.getHours() * 60 + now.getMinutes();
        earliest = Math.max(earliest, minutesNow + lead);
      }

      var first = Math.ceil(earliest / step) * step;
      var last = hours.close - endOffset;
      var slots = [];
      for (var m = first; m <= last; m += step) {
        var h = Math.floor(m / 60), mm = m % 60;
        slots.push({
          value: (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm,
          label: AllCafe.formatTime(m),
          minutes: m
        });
      }
      return slots;
    },

    /* Repopulates a <select> with slots, keeping the choice if it survives. */
    fillSlots: function (select, isoDate, options) {
      if (!select) return [];
      var previous = select.value;
      var slots = Forms.slotsFor(isoDate, options);

      select.innerHTML = '<option value="">' +
        (slots.length ? 'Choose a slot' : 'No slots left for this day') + '</option>' +
        slots.map(function (slot) {
          return '<option value="' + slot.value + '">' + slot.label + '</option>';
        }).join('');

      var stillThere = slots.some(function (slot) { return slot.value === previous; });
      select.value = stillThere ? previous : '';
      select.disabled = slots.length === 0;
      return slots;
    },

    /* "Friday, August 7 at 3:30 PM" */
    describeSlot: function (isoDate, timeValue) {
      var parts = String(timeValue || '').split(':');
      var minutes = (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
      return AllCafe.formatLongDate(isoDate) + ' at ' + AllCafe.formatTime(minutes);
    },

    /* ------------------------------------------------------------------
       Submission helpers
       ------------------------------------------------------------------ */
    showSummary: function (form, count) {
      var summary = form.querySelector('[data-error-summary]');
      if (!summary) return;
      summary.hidden = count === 0;
      if (count > 0) {
        summary.textContent = count === 1
          ? 'One field needs a look before we can send this.'
          : count + ' fields need a look before we can send this.';
      }
    },

    focusFirstInvalid: function (form) {
      var invalid = form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
      if (!invalid) return;
      invalid.focus();
      if (invalid.scrollIntoView) invalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },

    /* A short pause on submit — the prototype has no server, but the wait
       is what makes the confirmation feel like it was earned. */
    pretendToSend: function (button, done) {
      var original = button ? button.innerHTML : '';
      if (button) {
        button.classList.add('is-loading');
        button.setAttribute('aria-busy', 'true');
        button.innerHTML = 'Sending…';
      }
      window.setTimeout(function () {
        if (button) {
          button.classList.remove('is-loading');
          button.removeAttribute('aria-busy');
          button.innerHTML = original;
        }
        done();
      }, 620);
    },

    /* Live "n / max" counter under a textarea. */
    wireCounter: function (textarea, counter) {
      if (!textarea || !counter) return;
      var max = Number(textarea.getAttribute('maxlength')) || 200;
      function update() {
        var used = textarea.value.length;
        counter.textContent = used + ' / ' + max;
        counter.classList.toggle('is-near', used > max - 20);
      }
      textarea.addEventListener('input', update);
      update();
    },

    /* Date input bounds: today through today + days. */
    boundDateInput: function (input, days) {
      if (!input) return;
      var today = new Date();
      var max = new Date();
      max.setDate(max.getDate() + days);
      input.min = AllCafe.toISODate(today);
      input.max = AllCafe.toISODate(max);
    }
  };
}());

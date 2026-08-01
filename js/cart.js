/* ==========================================================================
   ALL Cafe — cart.js
   The advance-order cart, shared by every page.

   Storage holds ids and quantities only:
       sessionStorage["allcafe.cart"] = [{ id: "spanish-latte", qty: 2 }]
   Names, prices and images are always re-derived from menu-data.js, so a
   price change on the menu can never leave a stale total in a cart. It
   lives in sessionStorage on purpose: the order should follow you across
   pages and then disappear when the tab closes.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe = window.AllCafe || {};
  var KEY = 'allcafe.cart';
  var MAX_QTY = 10;

  /* ---- read / write --------------------------------------------------- */

  /* Anything unrecognised is dropped on read, so a stale or hand-edited
     session can never crash a page or invent an item. */
  function read() {
    var raw = AllCafe.store.get(KEY, []);
    if (!Array.isArray(raw)) return [];
    var seen = {};
    return raw.reduce(function (lines, line) {
      if (!line || typeof line.id !== 'string') return lines;
      if (seen[line.id] || !AllCafe.findItem(line.id)) return lines;
      var qty = Math.round(Number(line.qty));
      if (!isFinite(qty) || qty < 1) return lines;
      seen[line.id] = true;
      lines.push({ id: line.id, qty: Math.min(qty, MAX_QTY) });
      return lines;
    }, []);
  }

  function write(lines, reason) {
    AllCafe.store.set(KEY, lines);
    syncBadge();
    document.dispatchEvent(new CustomEvent('allcafe:cart', {
      detail: { lines: lines, reason: reason || 'change' }
    }));
  }

  /* ---- public API ----------------------------------------------------- */
  var Cart = AllCafe.cart = {
    MAX_QTY: MAX_QTY,

    lines: read,

    /* Cart lines joined to their menu entries, ready to render. */
    detailed: function () {
      return read().map(function (line) {
        var item = AllCafe.findItem(line.id);
        return {
          id: line.id,
          qty: line.qty,
          item: item,
          name: item.name,
          price: item.price,
          img: item.img,
          alt: item.alt,
          lineTotal: item.price * line.qty
        };
      });
    },

    count: function () {
      return read().reduce(function (sum, line) { return sum + line.qty; }, 0);
    },

    subtotal: function () {
      return Cart.detailed().reduce(function (sum, line) { return sum + line.lineTotal; }, 0);
    },

    isEmpty: function () { return read().length === 0; },

    /* Returns the resulting quantity, or null when the item is unknown. */
    add: function (id, qty) {
      if (!AllCafe.findItem(id)) return null;
      var lines = read();
      var amount = Math.max(1, Math.round(Number(qty) || 1));
      var existing = null;
      lines.forEach(function (line) { if (line.id === id) existing = line; });

      if (existing) {
        existing.qty = Math.min(existing.qty + amount, MAX_QTY);
      } else {
        existing = { id: id, qty: Math.min(amount, MAX_QTY) };
        lines.push(existing);
      }
      write(lines, 'add');
      return existing.qty;
    },

    setQty: function (id, qty) {
      var next = Math.round(Number(qty));
      if (!isFinite(next)) return null;
      if (next < 1) return Cart.remove(id);

      var lines = read();
      var found = false;
      lines.forEach(function (line) {
        if (line.id === id) { line.qty = Math.min(next, MAX_QTY); found = true; }
      });
      if (!found) return null;
      write(lines, 'qty');
      return Math.min(next, MAX_QTY);
    },

    /* Returns the removed line and its position so the caller can offer undo. */
    remove: function (id) {
      var lines = read();
      var index = -1;
      lines.forEach(function (line, i) { if (line.id === id) index = i; });
      if (index === -1) return null;
      var removed = lines.splice(index, 1)[0];
      write(lines, 'remove');
      return { id: removed.id, qty: removed.qty, index: index };
    },

    /* Puts a removed line back where it was — the undo half of remove(). */
    restore: function (entry) {
      if (!entry || !AllCafe.findItem(entry.id)) return;
      var lines = read();
      var duplicate = false;
      lines.forEach(function (line) {
        if (line.id === entry.id) { line.qty = Math.min(line.qty + entry.qty, MAX_QTY); duplicate = true; }
      });
      if (!duplicate) {
        lines.splice(Math.min(entry.index, lines.length), 0, { id: entry.id, qty: entry.qty });
      }
      write(lines, 'restore');
    },

    clear: function () { write([], 'clear'); }
  };

  /* ---- header badge --------------------------------------------------- */
  function syncBadge() {
    var count = Cart.count();
    var badges = document.querySelectorAll('[data-cart-count]');
    var labels = document.querySelectorAll('[data-cart-label]');

    for (var i = 0; i < badges.length; i++) {
      var badge = badges[i];
      var previous = badge.textContent;
      badge.textContent = String(count);
      badge.hidden = count === 0;
      if (count > 0 && previous !== String(count)) {
        var button = badge.closest('.cart-btn');
        if (button) {
          button.classList.remove('is-bumped');
          void button.offsetWidth;           /* restart the animation */
          button.classList.add('is-bumped');
        }
      }
    }
    for (var j = 0; j < labels.length; j++) {
      labels[j].textContent = count === 0
        ? 'Advance order, cart is empty'
        : 'Advance order, ' + count + (count === 1 ? ' item' : ' items');
    }
  }
  AllCafe.syncCartBadge = syncBadge;

  syncBadge();
}());

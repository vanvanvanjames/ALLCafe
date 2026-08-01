/* ==========================================================================
   ALL Cafe — chat.js
   A front-end-only chat widget: no server, no model, just an intent
   dictionary matched against what the visitor typed.

   Matching order
     1. a quick-reply chip (exact intent, no guessing)
     2. keyword scan across all intents — best score wins
     3. small talk (hi / salamat / bye)
     4. fallback, which re-offers the chips

   Answers about hours, prices and the address are generated from
   include.js and menu-data.js rather than written out again here, so the
   widget cannot contradict the rest of the site.
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe;
  var esc = AllCafe.escapeHTML;
  var KEY = 'allcafe.chat';
  var SEEN_KEY = 'allcafe.chat.seen';

  /* ---------------------------------------------------------------------
     Answers
     --------------------------------------------------------------------- */
  function hoursAnswer() {
    var status = AllCafe.isOpenNow();
    var rows = AllCafe.HOURS_SUMMARY.map(function (row) {
      return row.days + ' &middot; ' + row.time;
    }).join('<br>');
    return {
      html: (status.open
        ? '<b>Bukas kami ngayon</b> — open until ' + status.closesAt + '.'
        : '<b>Sarado muna kami</b> — we open at ' + status.opensAt + '.') +
        '<br><br>' + rows,
      actions: [{ label: 'Visit us', href: 'contact.html' }]
    };
  }

  function locationAnswer() {
    return {
      html: 'We\'re at <b>' + esc(AllCafe.SITE.address) + '</b> — ' +
        AllCafe.SITE.addressExtra.toLowerCase() + '. ' +
        'Any Camarin–Zabarte jeep drops you at the corner; look for the green shopfront '+
        'with the chairs out front.',
      actions: [
        { label: 'Directions', href: 'contact.html' },
        { label: 'Open in Maps', href: AllCafe.SITE.mapsUrl, external: true }
      ]
    };
  }

  function menuAnswer() {
    var cheapest = AllCafe.MENU.slice().sort(function (a, b) { return a.price - b.price; })[0];
    var picks = AllCafe.featuredItems().slice(0, 3).map(function (item) {
      return item.name + ' ' + AllCafe.peso(item.price);
    }).join(' · ');
    return {
      html: 'Drinks start at <b>' + AllCafe.peso(cheapest.price) + '</b> (' + esc(cheapest.name) + ').<br><br>' +
        'Paboritong-pabo: ' + esc(picks) + '. Iced versions of hot espresso drinks are +₱15.',
      actions: [{ label: 'See the full menu', href: 'menu.html' }]
    };
  }

  function reservationAnswer() {
    return {
      html: 'We hold tables for parties of up to eight, 15 minutes past your slot. ' +
        'Bigger group? Give us a ring and we\'ll sort it. Walk-ins are always welcome — ' +
        'you never <em>need</em> a booking.',
      actions: [
        { label: 'Reserve a table', href: 'reservation.html' },
        { label: 'Call us', href: AllCafe.SITE.mobileHref, external: true }
      ]
    };
  }

  function orderAnswer() {
    var count = AllCafe.cart.count();
    return {
      html: 'Add what you want from the menu, pick a slot at least <b>30 minutes</b> ahead, ' +
        'then pay at the counter when you arrive.' +
        (count ? '<br><br>May laman na ang tasa mo — <b>' + count +
          (count === 1 ? ' item' : ' items') + '</b> waiting in your order.' : ''),
      actions: count
        ? [{ label: 'View your order', href: 'order.html' }, { label: 'Add more', href: 'menu.html' }]
        : [{ label: 'Start an order', href: 'menu.html' }]
    };
  }

  function paymentAnswer() {
    return {
      html: 'Cash or GCash at the counter — we don\'t take cards yet, and advance orders are ' +
        'paid on pickup, hindi online.<br><br><em>This is a demo site, so nothing is ever charged.</em>',
      actions: [{ label: 'How ordering works', href: 'index.html#main' }]
    };
  }

  function parkingAnswer() {
    return {
      html: 'Two slots right out front, plus street parking on the side road after 9 AM. ' +
        'Weekends get tight — most suki just take a tricycle in from Camarin Road.',
      actions: [{ label: 'Getting here', href: 'contact.html' }]
    };
  }

  function humanAnswer() {
    return {
      html: 'Ako lang ang nandito — I\'m a scripted demo bot, walang tao sa likod. ' +
        'For a real human: <b>' + esc(AllCafe.SITE.mobile) + '</b> or ' +
        '<b>' + esc(AllCafe.SITE.email) + '</b>. Fair warning, they\'re dummy details too. 😄',
      actions: [
        { label: 'Call the shop', href: AllCafe.SITE.mobileHref, external: true },
        { label: 'Email us', href: 'mailto:' + AllCafe.SITE.email, external: true }
      ]
    };
  }

  /* ---------------------------------------------------------------------
     Intent dictionary. A trailing * matches the start of a word, so
     "reserv*" catches reserve / reservation / reserving.
     --------------------------------------------------------------------- */
  var INTENTS = [
    { id: 'hours', chip: 'Hours', answer: hoursAnswer, patterns: [
      'hour*', 'open*', 'clos*', 'bukas', 'sarado', 'anong oras', 'what time', 'schedule',
      'until', 'hanggang', 'gising', 'tulog', 'operating'
    ] },
    { id: 'location', chip: 'Location', answer: locationAnswer, patterns: [
      'where', 'saan', 'nasaan', 'address', 'locat*', 'direction*', 'map', 'papunta', 'punta',
      'caloocan', 'camarin', 'taas', 'barangay 171', 'branch', 'malapit', 'near',
      'how do i get', 'pano pumunta'
    ] },
    { id: 'menu', chip: 'Menu', answer: menuAnswer, patterns: [
      'menu', 'price*', 'magkano', 'presyo', 'how much', 'cost', 'coffee', 'kape', 'drink*',
      'food', 'pastr*', 'pandesal', 'latte', 'matcha', 'ube', 'sandwich', 'merienda', 'kain',
      'best sell*', 'recommend', 'masarap'
    ] },
    { id: 'reservation', chip: 'Reserve', answer: reservationAnswer, patterns: [
      'reserv*', 'book*', 'table', 'mesa', 'okasyon', 'birthday', 'party', 'barkada', 'group',
      'magpareserve', 'magpa reserve', 'seat*', 'upuan'
    ] },
    { id: 'order', chip: 'Advance order', answer: orderAnswer, patterns: [
      'order*', 'advance', 'pickup', 'pick up', 'takeout', 'take out', 'umorder', 'paorder',
      'pa order', 'pano umorder', 'cart', 'deliver*', 'grab', 'foodpanda'
    ] },
    { id: 'payment', chip: null, answer: paymentAnswer, patterns: [
      'pay*', 'gcash', 'g cash', 'cash', 'card', 'maya', 'bayad', 'magbayad', 'credit', 'debit',
      'online payment', 'bank'
    ] },
    { id: 'parking', chip: null, answer: parkingAnswer, patterns: [
      'park*', 'sasakyan', 'kotse', 'garahe', 'motor', 'bike'
    ] },
    { id: 'human', chip: null, answer: humanAnswer, patterns: [
      'human', 'tao', 'staff', 'talk to', 'agent', 'person', 'manager', 'owner', 'tawag',
      'call', 'contact', 'email', 'complain*', 'reklamo', 'real person'
    ] }
  ];

  var SMALL_TALK = [
    { patterns: ['hi', 'hello', 'hey', 'yo', 'kumusta', 'kamusta', 'musta', 'good morning', 'good afternoon', 'good evening'],
      html: 'Kumusta! ☕ Ask me about hours, prices, directions, advance orders or bookings.' },
    { patterns: ['salamat', 'thank*', 'thanks', 'ty', 'maraming salamat'],
      html: 'Walang anuman! Anything else you need?' },
    { patterns: ['bye', 'paalam', 'goodbye', 'see you', 'sige'],
      html: 'Sige, ingat! See you sa tindahan. 👋' },
    { patterns: ['who are you', 'sino ka', 'bot ka', 'are you real', 'ai ka'],
      html: 'I\'m a scripted demo bot for this prototype — rule-based, no AI behind me. ' +
            'Try one of the chips below and I\'ll do my best.' }
  ];

  var FALLBACK = 'Di ko sure iyan — I only know a handful of things. Try one of these:';

  /* ---------------------------------------------------------------------
     Matching
     --------------------------------------------------------------------- */
  function normalize(text) {
    return ' ' + String(text || '').toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim() + ' ';
  }

  function hits(haystack, patterns) {
    var score = 0;
    patterns.forEach(function (pattern) {
      var stem = pattern.charAt(pattern.length - 1) === '*';
      var word = stem ? pattern.slice(0, -1) : pattern;
      var probe = ' ' + word;
      var index = haystack.indexOf(probe);
      while (index !== -1) {
        var after = haystack.charAt(index + probe.length);
        if (stem || after === ' ') { score += word.length > 3 ? 2 : 1; break; }
        index = haystack.indexOf(probe, index + 1);
      }
    });
    return score;
  }

  function respond(text) {
    var haystack = normalize(text);

    var best = null, bestScore = 0;
    INTENTS.forEach(function (intent) {
      var score = hits(haystack, intent.patterns);
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    if (best) return best.answer();

    for (var i = 0; i < SMALL_TALK.length; i++) {
      if (hits(haystack, SMALL_TALK[i].patterns) > 0) return { html: SMALL_TALK[i].html };
    }

    return { html: FALLBACK, showChips: true };
  }

  /* ---------------------------------------------------------------------
     UI
     --------------------------------------------------------------------- */
  var fab, panel, log, input, liveRegion;
  var isOpen = false;
  var lastFocus = null;

  var CHIPS = INTENTS.filter(function (intent) { return intent.chip; });

  function build() {
    fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'chat-fab';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'chat-panel');
    fab.innerHTML =
      '<span class="chat-fab__open">' + AllCafe.ICONS.mug + '</span>' +
      '<span class="chat-fab__close">' + AllCafe.ICONS.close + '</span>' +
      '<span class="visually-hidden">Ask ALL Cafe — chat</span>';

    panel = document.createElement('div');
    panel.className = 'chat-panel';
    panel.id = 'chat-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with ALL Cafe');
    panel.innerHTML = '' +
      '<div class="chat-head">' +
        AllCafe.ICONS.mug +
        '<div>' +
          '<p class="chat-head__title">ALL Cafe</p>' +
          '<p class="chat-head__sub"><span class="dot dot--open"></span> replies in seconds (demo)</p>' +
        '</div>' +
        '<button class="chat-close" type="button" data-chat-close>' + AllCafe.ICONS.close +
          '<span class="visually-hidden">Close chat</span></button>' +
      '</div>' +
      '<div class="chat-log" id="chat-log" role="log" aria-live="polite" aria-label="Conversation"></div>' +
      '<div class="chat-chips" data-chat-chips>' +
        CHIPS.map(function (intent) {
          return '<button class="chat-chip" type="button" data-intent="' + intent.id + '">' +
            esc(intent.chip) + '</button>';
        }).join('') +
      '</div>' +
      '<form class="chat-form" data-chat-form>' +
        '<label class="visually-hidden" for="chat-input">Type your question</label>' +
        '<input id="chat-input" type="text" autocomplete="off" placeholder="Bukas ba kayo ngayon?">' +
        '<button class="chat-send" type="submit">' + AllCafe.ICONS.send +
          '<span class="visually-hidden">Send</span></button>' +
      '</form>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    log = panel.querySelector('.chat-log');
    input = panel.querySelector('#chat-input');

    fab.addEventListener('click', toggle);
    panel.querySelector('[data-chat-close]').addEventListener('click', close);
    panel.querySelector('[data-chat-form]').addEventListener('submit', function (event) {
      event.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      say(text);
    });
    panel.querySelector('[data-chat-chips]').addEventListener('click', function (event) {
      var chip = event.target.closest('[data-intent]');
      if (!chip) return;
      var intent = null;
      INTENTS.forEach(function (candidate) {
        if (candidate.id === chip.getAttribute('data-intent')) intent = candidate;
      });
      if (!intent) return;
      push({ role: 'user', html: esc(intent.chip) });
      reply(intent.answer());
    });

    panel.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { close(); return; }
      if (event.key === 'Tab') trapFocus(event);
    });

    /* Any button on any page can open the chat. */
    document.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('[data-open-chat]')) open();
    });

    /* The contact page shows the mark in a circle — fill it from here so
       the icon is defined in exactly one place. */
    AllCafe.each('[data-faster-mug]', function (node) { node.innerHTML = AllCafe.ICONS.mug; });
  }

  function trapFocus(event) {
    var focusables = panel.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])');
    var visible = Array.prototype.filter.call(focusables, function (node) { return node.offsetParent !== null; });
    if (!visible.length) return;
    var first = visible[0], last = visible[visible.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  /* ---------------------------------------------------------------------
     Transcript — kept in sessionStorage so the conversation follows the
     visitor from page to page and disappears when the tab closes.
     --------------------------------------------------------------------- */
  function transcript() {
    var saved = AllCafe.store.get(KEY, []);
    return Array.isArray(saved) ? saved : [];
  }

  function push(message) {
    var messages = transcript();
    messages.push(message);
    AllCafe.store.set(KEY, messages.slice(-40));
    render();
  }

  function bubbleHTML(message) {
    var actions = (message.actions || []).map(function (action) {
      var attrs = action.external ? ' rel="noopener"' : '';
      return '<a class="chat-msg__action" href="' + esc(action.href) + '"' + attrs + '>' +
        esc(action.label) + '</a>';
    }).join('');

    return '<div class="chat-msg chat-msg--' + (message.role === 'user' ? 'user' : 'bot') + '">' +
      '<div class="chat-msg__bubble">' + message.html + '</div>' +
      (actions ? '<div class="chat-msg__actions">' + actions + '</div>' : '') +
    '</div>';
  }

  function render(extraHTML) {
    log.innerHTML = transcript().map(bubbleHTML).join('') + (extraHTML || '');
    log.scrollTop = log.scrollHeight;
  }

  /* ---------------------------------------------------------------------
     Conversation
     --------------------------------------------------------------------- */
  function say(text) {
    push({ role: 'user', html: esc(text) });
    reply(respond(text));
  }

  function reply(answer) {
    render('<div class="chat-msg chat-msg--bot"><div class="chat-msg__bubble chat-typing">' +
      '<span></span><span></span><span></span></div></div>');
    log.scrollTop = log.scrollHeight;

    var delay = 400 + Math.floor(Math.random() * 400);
    window.setTimeout(function () {
      push({ role: 'bot', html: answer.html, actions: answer.actions });
      if (answer.showChips) flashChips();
    }, delay);
  }

  function flashChips() {
    var chips = panel.querySelector('[data-chat-chips]');
    if (!chips) return;
    chips.animate
      ? chips.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 500 })
      : null;
  }

  function greet() {
    if (transcript().length) return;
    push({
      role: 'bot',
      html: 'Kumusta! I\'m the ALL Cafe mug. ☕ Tap a chip or type a question — ' +
        'hours, directions, prices, advance orders, bookings. English or Taglish, pareho lang.'
    });
  }

  /* ---------------------------------------------------------------------
     Open / close
     --------------------------------------------------------------------- */
  function open() {
    if (isOpen) return;
    lastFocus = document.activeElement;
    isOpen = true;
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    fab.classList.remove('is-pulsing');
    AllCafe.store.set(SEEN_KEY, true);
    greet();
    render();
    window.setTimeout(function () { input.focus(); }, 60);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toggle() { isOpen ? close() : open(); }

  /* `match` is exposed so the intent engine can be exercised without
     driving the UI — see _selftest.html during development. */
  AllCafe.chat = { open: open, close: close, toggle: toggle, ask: say, match: respond, intents: INTENTS };

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  build();
  render();

  /* One gentle nudge per tab, and only for a first-time visitor. */
  if (!AllCafe.store.get(SEEN_KEY, false)) {
    window.setTimeout(function () { fab.classList.add('is-pulsing'); }, 1600);
  }
}());

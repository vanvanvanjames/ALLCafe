# ALL Cafe — demo walkthrough

A front-end prototype for a fictional neighborhood kapihan in Caloocan City.
Static HTML, CSS and vanilla JS. No build step, no server, no backend.

**To run it: double-click `index.html`.** That's the whole setup.

> Everything here is a demo. No payment is processed, no SMS is sent, no table is
> held, and no order reaches a kitchen. The address, phone number, email and
> social handles are invented.

---

## The five-minute script

Run this in order and the whole prototype gets exercised. It takes about four
minutes and works the same on a laptop and a phone.

### 1 · Land (30s)
Open `index.html`.

- The pill under the hero reads **"Open today until 10:00 PM"** — that's computed
  from the real clock against the shop's opening hours, so it says "Closed now —
  opens 7:00 AM" if you try it late at night.
- Scroll past the brand story to **Suki favourites**. Those four cards are
  rendered from `js/menu-data.js`, not hardcoded in the page.

### 2 · Add three items (45s)
Click **Browse the Menu**.

- Tap the sticky category pills — **Espresso-Based · Non-Coffee · Pastries &
  Snacks**. They scroll rather than filter, and the active pill tracks your
  position as you scroll back by hand.
- **Add to cart** on *Spanish Latte* twice, then *Ube-Cheese Pandesal* once.
- Watch three things happen at once: the button flashes **✓ Added**, a toast
  offers **View order**, and the cart badge in the header ticks up and bumps.
- Click **Home** in the nav. The badge still reads **3** — the cart follows you
  across pages.

### 3 · Place the advance order (90s)
Click the cart button in the header.

- Try the **−/+ steppers**; the line totals and the receipt chit recalculate live.
- Hit the **trash icon** on a row, then **Undo** in the toast that appears. The
  item comes back in its original position.
- Now submit the form while it's still empty, or with a bad number like `12345`.
  Every field gets its own specific message, the summary at the top counts them,
  and focus jumps to the first problem. Nothing is submitted.
- Fill it properly — a name, `09171234567`, and a pickup slot. The slot list only
  ever offers times inside opening hours, at least 30 minutes out, ending 30
  minutes before close.
- **Place advance order.** After a brief pause you get a code like
  `ALL-20260801-047`, a recap, and your items. The cart is now empty (check the
  badge) — but **refresh the page** and the confirmation is still there.

### 4 · Book a table (45s)
Click **Reserve**.

- Set **Party size** to **9+ (chat with us)** and watch the hint under the form
  change — big groups get routed to a human instead of silently accepted.
- Set it back to 6, fill the rest, and submit. You get an `RSV-####` reference.
- Click **Reserve** in the nav again. A green banner remembers your pending
  request, with **View details** and **Cancel request**. Cancel it — that toast
  has an undo too.

### 5 · Ask the mug (60s)
Tap the round mug button at the bottom-right, on any page.

Try these three, in this order:

| Type this | What it shows |
|---|---|
| `bukas ba kayo ngayon?` | Taglish keyword matching, and hours read from the same source as the footer |
| `magkano ang ube latte` | The answer quotes a real price out of `menu-data.js` |
| `do you sell bicycles` | The fallback — it admits it doesn't know and re-offers the chips |

Then click **Menu** in the nav and reopen the chat: **the conversation is still
there.** It follows you across pages and clears when you close the tab.

Also worth a try: `may parking ba kayo`, `saan kayo banda`, `pwede bang gcash`,
`can i talk to a human`.

### 6 · The edges (30s)
- **Visit Us** → the map holds behind a **Load the map** button. Click it and the
  Google embed drops in. Until then the page makes no third-party request.
- Open `404.html` directly for the spilled-mug page.
- Empty the cart and open `order.html` for the empty state.

---

## Verifying it yourself

Three test pages ship with the prototype and can be opened like any other:

| File | What it covers | Result |
|---|---|---|
| `_selftest.html` | Unit checks — cart maths, storage sanitising, PH mobile validation, slot generation against opening hours, all 8 chat intents plus Taglish triggers and the fallback | 82 / 82 |
| `_e2e.html` | Flow checks — adding to cart, persistence across navigation, steppers, undo, blocked submits, confirmation, refresh persistence, reservations, the pending banner, chat transcript across pages | 77 / 77 |
| `_a11y.html` | Structure on all six pages — landmarks, one `h1`, heading order, duplicate ids, alt text, labelled controls, accessible names, 40px targets | 102 / 102 |

`_selftest.html` runs on a double-click. The other two drive the real pages inside
an iframe, so they need Chrome started with `--allow-file-access-from-files`:

```
chrome --allow-file-access-from-files "path/to/_e2e.html"
```

Not run here, because both need network access: the W3C HTML validator and a
Lighthouse audit. The checks in `_a11y.html` cover the rules Lighthouse's
accessibility category would flag, and the contrast audit in `styleguide.html`
covers the colour half — but neither is a substitute for the real tools.

`styleguide.html` is the Phase 2 style tile — palette, type scale, components,
and a WCAG contrast audit that measures the live tokens from `base.css`
(currently 24 pairs, 0 failures, lowest body-text ratio 5.57:1).

Delete `_selftest.html`, `_e2e.html`, `_a11y.html` and `styleguide.html` before
handing the site to anyone as a finished thing — they're development scaffolding.

---

## How it's put together

```
index · menu · order · reservation · contact · 404 · styleguide
├─ css/
│  ├─ base.css         design tokens, reset, type scale
│  ├─ components.css   header, footer, buttons, cards, forms, toasts, chat
│  └─ pages.css        per-page section layouts
├─ js/
│  ├─ include.js       injects header + footer, shop facts, hours, storage, toasts
│  ├─ menu-data.js     the 20-item menu — single source of truth
│  ├─ cart.js          sessionStorage cart engine
│  ├─ cards.js         one card template + the add-to-cart handler
│  ├─ forms.js         shared validation, PH mobile, opening-hours time slots
│  ├─ chat.js          rule-based intent engine + transcript
│  └─ home · menu · order · reservation · contact .js   page controllers
├─ images/  hero · menu · story    (SVG illustrations)
└─ assets/  logos · favicon · speckle · icons
```

### Decisions worth knowing

**The header and footer are injected by JS, not pasted into six files.**
`include.js` holds them as template strings, marks the active nav item from
`location.pathname`, and mounts the cart badge and chat button. Add a page to the
`NAV` array and it appears in the header, the mobile sheet and the footer at once.
The cost is honest: with JS off there is no nav, so every page carries a
`<noscript>` block with plain links to all five pages.

**The cart stores ids and quantities only.** Names, prices and images are always
re-read from `menu-data.js`, so a price edit can never leave a stale total in
somebody's cart. Anything unrecognised is dropped on read.

**Storage is `sessionStorage`, wrapped.** The order should follow you between
pages and then disappear when the tab closes. Every read and write goes through a
wrapper with an in-memory fallback, so the prototype still works if storage is
blocked.

**The map loads on request.** A Google share-embed needs no API key, which is why
it beat Leaflet + OpenStreetMap here. Holding it behind a button keeps the page
light, keeps it working offline until someone wants the map, and avoids handing a
visitor to Google just for reading the opening hours.

**The illustrations are hand-built SVG, not stock photos.** That keeps the folder
offline-safe and licence-free. To swap in photography, point the `img` field of an
item in `menu-data.js` at a JPEG — the card template, the cart row and the
confirmation recap all follow automatically.

### Known limits

- No backend: nothing persists past the tab, and no data leaves the browser.
- The 30-minute lead time, the 15-minute courtesy hold, the ₱15 iced surcharge
  and the "9+ needs a call" rule are demo rules, not a real operating policy.
- Fonts come from Google Fonts. Offline, the pages fall back to Arial
  Black / Segoe UI / Courier New and still lay out correctly.

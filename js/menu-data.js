/* ==========================================================================
   ALL Cafe — menu-data.js
   The single source of truth for the menu. The cart stores nothing but ids
   and quantities, so names and prices are always re-read from here and can
   never drift out of sync with what the menu page shows.

   All prices are dummy pesos, VAT-inclusive. Iced versions of hot espresso
   drinks add ₱15 at the counter (a demo rule, not modelled in the cart).
   ========================================================================== */
(function () {
  'use strict';

  var AllCafe = window.AllCafe = window.AllCafe || {};

  AllCafe.CATEGORIES = [
    { id: 'espresso',   label: 'Espresso-Based', note: 'Iced versions +₱15' },
    { id: 'non-coffee', label: 'Non-Coffee',     note: 'For the hindi-mahilig-sa-kape' },
    { id: 'pastry',     label: 'Pastries & Snacks', note: 'Baked fresh every morning' }
  ];

  AllCafe.MENU = [
    /* ---- Espresso-Based ---- */
    {
      id: 'americano', name: 'Americano', price: 110, category: 'espresso',
      desc: 'Double shot over hot water — walang arte, bold and clean.',
      img: 'images/menu/americano.webp',
      alt: 'A white cup of black americano on a saucer',
      tags: ['Hot']
    },
    {
      id: 'cafe-latte', name: 'Café Latte', price: 135, category: 'espresso',
      desc: 'Espresso and steamed milk, poured with a leaf on top.',
      img: 'images/menu/cafe-latte.webp',
      alt: 'A cafe latte with a rosetta poured into the foam',
      tags: ['Hot']
    },
    {
      id: 'spanish-latte', name: 'Spanish Latte', price: 150, category: 'espresso',
      desc: 'Condensed milk under a dark shot. Our best-seller, always iced.',
      img: 'images/menu/spanish-latte.webp',
      alt: 'An iced Spanish latte layered in a tall glass',
      tags: ['Iced', 'Best-seller'], featured: true
    },
    {
      id: 'caramel-macchiato', name: 'Caramel Macchiato', price: 165, category: 'espresso',
      desc: 'Vanilla milk, espresso, and a proper caramel drizzle on top.',
      img: 'images/menu/caramel-macchiato.webp',
      alt: 'A caramel macchiato with caramel drizzled over the foam',
      tags: ['Hot']
    },
    {
      id: 'tablea-mocha', name: 'Tablea Mocha', price: 160, category: 'espresso',
      desc: 'Batangas tablea melted into espresso and milk. Sakto sa malamig na umaga.',
      img: 'images/menu/tablea-mocha.webp',
      alt: 'A tablea mocha topped with an intricate poured pattern',
      tags: ['Hot'], featured: true
    },
    {
      id: 'dirty-matcha', name: 'Dirty Matcha', price: 170, category: 'espresso',
      desc: 'Stone-ground matcha over ice with a shot poured straight through it.',
      img: 'images/menu/dirty-matcha.webp',
      alt: 'Two tall glasses of layered iced matcha and coffee on a wooden table',
      tags: ['Iced']
    },

    /* ---- Non-Coffee ---- */
    {
      id: 'ube-latte', name: 'Ube Latte', price: 150, category: 'non-coffee',
      desc: 'Real ube halaya blended with cold fresh milk.',
      img: 'images/menu/ube-latte.webp',
      alt: 'A tall cup of purple ube milk tea',
      tags: ['Iced'], featured: true
    },
    {
      id: 'matcha-latte', name: 'Matcha Latte', price: 155, category: 'non-coffee',
      desc: 'Ceremonial-grade matcha whisked to order, lightly sweetened.',
      img: 'images/menu/matcha-latte.webp',
      alt: 'A cup of whisked matcha latte seen from above',
      tags: ['Hot']
    },
    {
      id: 'tsokolate', name: 'Tsokolate', price: 120, category: 'non-coffee',
      desc: 'Batirol-style tablea, whisked thick and frothy the old way.',
      img: 'images/menu/tsokolate.webp',
      alt: 'Two glass mugs of thick hot chocolate topped with cream',
      tags: ['Hot']
    },
    {
      id: 'strawberry-milk', name: 'Strawberry Milk', price: 135, category: 'non-coffee',
      desc: 'Fresh strawberry purée and cold milk. Panalo sa bata.',
      img: 'images/menu/strawberry-milk.webp',
      alt: 'A strawberry dropping into a glass of milk',
      tags: ['Iced']
    },
    {
      id: 'calamansi-iced-tea', name: 'Calamansi Iced Tea', price: 95, category: 'non-coffee',
      desc: 'Brewed black tea, squeezed calamansi, not too sweet.',
      img: 'images/menu/calamansi-iced-tea.webp',
      alt: 'A tall glass of iced tea with a citrus slice on the rim',
      tags: ['Iced']
    },
    {
      id: 'blue-lemonade', name: 'Blue Lemonade', price: 100, category: 'non-coffee',
      desc: 'Bright, fizzy, and unreasonably blue.',
      img: 'images/menu/blue-lemonade.webp',
      alt: 'A tall glass of blue lemonade on a wooden table',
      tags: ['Iced']
    },

    /* ---- Pastries & Snacks ---- */
    {
      id: 'ube-cheese-pandesal', name: 'Ube-Cheese Pandesal', price: 75, category: 'pastry',
      desc: 'Three warm pandesal stuffed with ube halaya and queso.',
      img: 'images/menu/ube-cheese-pandesal.webp',
      alt: 'Purple ube pandesal rolls coated in cheese and crumbs',
      tags: ['3 pcs', 'Best-seller'], featured: true
    },
    {
      id: 'classic-ensaymada', name: 'Classic Ensaymada', price: 85, category: 'pastry',
      desc: 'Buttered, sugared, and buried under grated cheese.',
      img: 'images/menu/classic-ensaymada.webp',
      alt: 'A swirled ensaymada dusted with sugar',
      tags: []
    },
    {
      id: 'cheese-roll', name: 'Cheese Roll', price: 65, category: 'pastry',
      desc: 'Soft roll with a cheese centre, dusted with sugar.',
      img: 'images/menu/cheese-roll.webp',
      alt: 'Golden cheese bread rolls piled in a basket',
      tags: []
    },
    {
      id: 'butter-croissant', name: 'Butter Croissant', price: 110, category: 'pastry',
      desc: 'Laminated by hand, flaky all the way through.',
      img: 'images/menu/butter-croissant.webp',
      alt: 'A flaky butter croissant on a white plate',
      tags: []
    },
    {
      id: 'ham-cheese-croissant', name: 'Ham & Cheese Croissant', price: 145, category: 'pastry',
      desc: 'The same croissant, now with ham, cheese and lettuce.',
      img: 'images/menu/ham-cheese-croissant.webp',
      alt: 'A ham and cheese croissant served with salad',
      tags: []
    },
    {
      id: 'banana-loaf', name: 'Banana Loaf Slice', price: 80, category: 'pastry',
      desc: 'Thick slice, extra saging, no nuts.',
      img: 'images/menu/banana-loaf.webp',
      alt: 'A sliced banana loaf on a wooden board',
      tags: []
    },
    {
      id: 'chocolate-crinkles', name: 'Chocolate Crinkles', price: 70, category: 'pastry',
      desc: 'Fudgy inside, snowed under powdered sugar outside.',
      img: 'images/menu/chocolate-crinkles.webp',
      alt: 'Powdered chocolate crinkle cookies on a plate',
      tags: ['2 pcs']
    },
    {
      id: 'clubhouse-sandwich', name: 'Clubhouse Sandwich', price: 185, category: 'pastry',
      desc: 'Triple-decker with ham, egg, cheese and lettuce. Sakto sa merienda.',
      img: 'images/menu/clubhouse-sandwich.webp',
      alt: 'A toasted clubhouse sandwich cut into halves',
      tags: []
    }
  ];

  /* Lookup used by the cart to re-hydrate stored ids. */
  var byId = {};
  AllCafe.MENU.forEach(function (item) { byId[item.id] = item; });

  AllCafe.findItem = function (id) { return byId[id] || null; };
  AllCafe.itemsIn = function (category) {
    return AllCafe.MENU.filter(function (item) { return item.category === category; });
  };
  AllCafe.featuredItems = function () {
    return AllCafe.MENU.filter(function (item) { return item.featured; });
  };
}());

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
      img: 'images/menu/americano.svg',
      alt: 'A black americano in an enamel mug, seen from above',
      tags: ['Hot']
    },
    {
      id: 'cafe-latte', name: 'Café Latte', price: 135, category: 'espresso',
      desc: 'Espresso and steamed milk, poured with a leaf on top.',
      img: 'images/menu/cafe-latte.svg',
      alt: 'A café latte with a poured leaf in the foam',
      tags: ['Hot']
    },
    {
      id: 'spanish-latte', name: 'Spanish Latte', price: 150, category: 'espresso',
      desc: 'Condensed milk under a dark shot. Our best-seller, always iced.',
      img: 'images/menu/spanish-latte.svg',
      alt: 'An iced Spanish latte layered over condensed milk in a tall glass',
      tags: ['Iced', 'Best-seller'], featured: true
    },
    {
      id: 'caramel-macchiato', name: 'Caramel Macchiato', price: 165, category: 'espresso',
      desc: 'Vanilla milk, espresso, and a proper caramel drizzle on top.',
      img: 'images/menu/caramel-macchiato.svg',
      alt: 'A caramel macchiato with caramel drizzled across the foam',
      tags: ['Hot']
    },
    {
      id: 'tablea-mocha', name: 'Tablea Mocha', price: 160, category: 'espresso',
      desc: 'Batangas tablea melted into espresso and milk. Sakto sa malamig na umaga.',
      img: 'images/menu/tablea-mocha.svg',
      alt: 'A tablea mocha dusted with cocoa',
      tags: ['Hot'], featured: true
    },
    {
      id: 'dirty-matcha', name: 'Dirty Matcha', price: 170, category: 'espresso',
      desc: 'Stone-ground matcha with a shot poured straight through it.',
      img: 'images/menu/dirty-matcha.svg',
      alt: 'A dirty matcha with espresso poured over green tea',
      tags: ['Hot']
    },

    /* ---- Non-Coffee ---- */
    {
      id: 'ube-latte', name: 'Ube Latte', price: 150, category: 'non-coffee',
      desc: 'Real ube halaya blended with cold fresh milk.',
      img: 'images/menu/ube-latte.svg',
      alt: 'An iced ube latte in a tall glass',
      tags: ['Iced'], featured: true
    },
    {
      id: 'matcha-latte', name: 'Matcha Latte', price: 155, category: 'non-coffee',
      desc: 'Ceremonial-grade matcha, lightly sweetened, over milk.',
      img: 'images/menu/matcha-latte.svg',
      alt: 'An iced matcha latte in a tall glass',
      tags: ['Iced']
    },
    {
      id: 'tsokolate', name: 'Tsokolate', price: 120, category: 'non-coffee',
      desc: 'Batirol-style tablea, whisked thick and frothy the old way.',
      img: 'images/menu/tsokolate.svg',
      alt: 'Batirol-style tsokolate with a wooden stirrer',
      tags: ['Hot']
    },
    {
      id: 'strawberry-milk', name: 'Strawberry Milk', price: 135, category: 'non-coffee',
      desc: 'Fresh strawberry purée and cold milk. Panalo sa bata.',
      img: 'images/menu/strawberry-milk.svg',
      alt: 'Strawberry milk with a fresh strawberry on the rim',
      tags: ['Iced']
    },
    {
      id: 'calamansi-iced-tea', name: 'Calamansi Iced Tea', price: 95, category: 'non-coffee',
      desc: 'Brewed black tea, squeezed calamansi, not too sweet.',
      img: 'images/menu/calamansi-iced-tea.svg',
      alt: 'Calamansi iced tea with a calamansi wedge',
      tags: ['Iced']
    },
    {
      id: 'blue-lemonade', name: 'Blue Lemonade', price: 100, category: 'non-coffee',
      desc: 'Bright, fizzy, and unreasonably blue.',
      img: 'images/menu/blue-lemonade.svg',
      alt: 'Blue lemonade with a lemon wheel on the rim',
      tags: ['Iced']
    },

    /* ---- Pastries & Snacks ---- */
    {
      id: 'ube-cheese-pandesal', name: 'Ube-Cheese Pandesal', price: 75, category: 'pastry',
      desc: 'Three warm pandesal stuffed with ube halaya and queso.',
      img: 'images/menu/ube-cheese-pandesal.svg',
      alt: 'Three ube-cheese pandesal rolls on an enamel plate',
      tags: ['3 pcs', 'Best-seller'], featured: true
    },
    {
      id: 'classic-ensaymada', name: 'Classic Ensaymada', price: 85, category: 'pastry',
      desc: 'Buttered, sugared, and buried under grated cheese.',
      img: 'images/menu/classic-ensaymada.svg',
      alt: 'A classic ensaymada topped with butter and grated cheese',
      tags: []
    },
    {
      id: 'cheese-roll', name: 'Cheese Roll', price: 65, category: 'pastry',
      desc: 'Soft roll with a cheese centre, dusted with sugar.',
      img: 'images/menu/cheese-roll.svg',
      alt: 'Two sugar-dusted cheese rolls on an enamel plate',
      tags: []
    },
    {
      id: 'butter-croissant', name: 'Butter Croissant', price: 110, category: 'pastry',
      desc: 'Laminated by hand, flaky all the way through.',
      img: 'images/menu/butter-croissant.svg',
      alt: 'A flaky butter croissant on an enamel plate',
      tags: []
    },
    {
      id: 'ham-cheese-croissant', name: 'Ham & Cheese Croissant', price: 145, category: 'pastry',
      desc: 'The same croissant, now with ham, cheese and lettuce.',
      img: 'images/menu/ham-cheese-croissant.svg',
      alt: 'A ham and cheese croissant with the filling peeking out',
      tags: []
    },
    {
      id: 'banana-loaf', name: 'Banana Loaf Slice', price: 80, category: 'pastry',
      desc: 'Thick slice, extra saging, no nuts.',
      img: 'images/menu/banana-loaf.svg',
      alt: 'A thick slice of banana loaf on an enamel plate',
      tags: []
    },
    {
      id: 'chocolate-crinkles', name: 'Chocolate Crinkles', price: 70, category: 'pastry',
      desc: 'Fudgy inside, snowed under powdered sugar outside.',
      img: 'images/menu/chocolate-crinkles.svg',
      alt: 'Two powdered chocolate crinkle cookies on an enamel plate',
      tags: ['2 pcs']
    },
    {
      id: 'clubhouse-sandwich', name: 'Clubhouse Sandwich', price: 185, category: 'pastry',
      desc: 'Triple-decker with ham, egg, cheese and lettuce. Sakto sa merienda.',
      img: 'images/menu/clubhouse-sandwich.svg',
      alt: 'A stacked clubhouse sandwich cut into triangles',
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

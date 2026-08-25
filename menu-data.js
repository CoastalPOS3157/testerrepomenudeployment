/*
  This file holds the entire menu. It is loaded by both the live website
  (index.html) and the editor (editor.html) as a plain script tag, so it
  works with no server and no build step — just open a file or push it to
  GitHub Pages.

  You will normally never hand-edit this file directly — use editor.html
  instead. It's plain JavaScript (not JSON) on purpose: browsers can load a
  <script src="menu-data.js"> file straight off a USB drive with no CORS
  restrictions, which a fetch() of a .json file cannot do reliably.

  Every item has a "sizes" list. Most items have just one size (leave its
  label blank) — items with more than one size (like drink cups) show a
  little size/price table instead of a single price.

  "settings.cardSurchargePercent" is the card-price surcharge, e.g. 3.99
  means a card price 3.99% above the cash price. Only the cash price is
  ever entered directly — the card price is always calculated from it.

  "settings.branding" holds the logo and color scheme. "colorMode" is
  either "preset" (colors come from one of app.js's PRESET_THEMES) or
  "auto" (colors were calculated once in the editor from the uploaded
  logo). Either way, "colors" holds the final hex values actually used —
  the site just applies them, it never re-analyzes the logo itself.
*/
window.MENU_DATA = {
  restaurantName: "Sample Restaurant",
  tagline: "Fresh food, made simple",
  updatedAt: "2026-08-21",
  settings: {
    cardSurchargePercent: 3.99,
    branding: {
      logoDataUrl: null,
      colorMode: "preset",
      presetId: "warm",
      colors: { accent: "#b3552f", accentText: "#ffffff", bg: "#faf8f5", border: "#e6ddd3" }
    }
  },
  categories: [
    {
      id: "appetizers",
      name: "Appetizers",
      items: [
        {
          id: "chips-salsa",
          name: "Chips & Salsa",
          description: "House-made tortilla chips with fresh salsa.",
          tags: ["vegetarian"],
          available: true,
          sizes: [{ label: "", cashPrice: "5.99" }]
        },
        {
          id: "loaded-nachos",
          name: "Loaded Nachos",
          description: "Cheese, jalapenos, sour cream, pico de gallo.",
          tags: ["vegetarian", "spicy"],
          available: true,
          sizes: [{ label: "", cashPrice: "9.99" }]
        }
      ]
    },
    {
      id: "entrees",
      name: "Entrees",
      items: [
        {
          id: "grilled-chicken",
          name: "Grilled Chicken Plate",
          description: "Grilled chicken breast, rice, and seasonal veggies.",
          tags: ["gluten-free"],
          available: true,
          sizes: [{ label: "", cashPrice: "13.99" }]
        },
        {
          id: "veggie-bowl",
          name: "Veggie Bowl",
          description: "Rice, black beans, roasted vegetables, avocado.",
          tags: ["vegetarian", "vegan", "gluten-free"],
          available: false,
          sizes: [{ label: "", cashPrice: "11.99" }]
        }
      ]
    },
    {
      id: "drinks",
      name: "Drinks",
      items: [
        {
          id: "iced-tea",
          name: "Iced Tea",
          description: "Sweet or unsweet.",
          tags: [],
          available: true,
          sizes: [
            { label: "Small", cashPrice: "1.99" },
            { label: "Medium", cashPrice: "2.49" },
            { label: "Large", cashPrice: "2.99" }
          ]
        }
      ]
    }
  ]
};

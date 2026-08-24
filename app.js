/*
  Shared rendering logic for the public menu site AND the editor's live
  preview pane. Keeping one renderer means the preview always matches
  exactly what customers see online.
*/
(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function itemMatches(item, query) {
    if (!query) return true;
    const sizeLabels = (item.sizes || []).map(function (s) { return s.label || ""; });
    const haystack = [item.name, item.description, ...(item.tags || []), ...sizeLabels]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function itemSizes(item) {
    return item.sizes && item.sizes.length ? item.sizes : [{ label: "", cashPrice: "0.00" }];
  }

  // Card price is the cash price plus a surcharge percentage (e.g. 3.99),
  // rounded to the nearest cent — set once in the editor's Settings panel
  // and applied to every price on the menu.
  function cardPriceFromCash(cashPrice, surchargePercent) {
    const cashCents = Math.round(parseFloat(cashPrice || "0") * 100);
    const cardCents = Math.round(cashCents * (1 + (parseFloat(surchargePercent) || 0) / 100));
    return (cardCents / 100).toFixed(2);
  }

  function renderPriceLine(cashPrice, surchargePercent) {
    const cardPrice = cardPriceFromCash(cashPrice, surchargePercent);
    return (
      "<span class='price-line'>" +
        "<span class='cash-price'>$" + escapeHtml(cashPrice) + " Cash</span>" +
        "<span class='card-price'>$" + escapeHtml(cardPrice) + " Card</span>" +
      "</span>"
    );
  }

  function renderPriceBlock(item, surchargePercent) {
    const sizes = itemSizes(item);
    if (sizes.length === 1) {
      return "<div class='price-block single'>" + renderPriceLine(sizes[0].cashPrice, surchargePercent) + "</div>";
    }
    const rows = sizes
      .map(function (s) {
        return (
          "<div class='size-row'>" +
            "<span class='size-label'>" + escapeHtml(s.label || "Size") + "</span>" +
            renderPriceLine(s.cashPrice, surchargePercent) +
          "</div>"
        );
      })
      .join("");
    return "<div class='price-block multi'>" + rows + "</div>";
  }

  function renderMenu(data, rootEl, opts) {
    opts = opts || {};
    const query = opts.query || "";
    const activeCategory = opts.activeCategory || "all";
    const surchargePercent = (data.settings && data.settings.cardSurchargePercent) || 0;

    rootEl.innerHTML = "";

    const branding = (data.settings && data.settings.branding) || {};

    const header = document.createElement("div");
    header.className = "menu-header";
    header.innerHTML =
      (branding.logoDataUrl ? "<img class='menu-logo' src='" + branding.logoDataUrl + "' alt='logo' />" : "") +
      "<h1>" + escapeHtml(data.restaurantName || "") + "</h1>" +
      (data.tagline ? "<p class='tagline'>" + escapeHtml(data.tagline) + "</p>" : "");
    rootEl.appendChild(header);

    const categories = data.categories || [];

    categories.forEach(function (category) {
      if (activeCategory !== "all" && activeCategory !== category.id) return;

      const visibleItems = (category.items || []).filter(function (item) {
        return itemMatches(item, query);
      });

      if (query && visibleItems.length === 0) return;

      const section = document.createElement("section");
      section.className = "menu-category";
      section.id = "cat-" + category.id;

      const heading = document.createElement("h2");
      heading.textContent = category.name;
      section.appendChild(heading);

      const list = document.createElement("div");
      list.className = "menu-items";

      visibleItems.forEach(function (item) {
        const card = document.createElement("div");
        card.className = "menu-item" + (item.available === false ? " sold-out" : "");

        const isSingleSize = itemSizes(item).length === 1;
        const priceBlockHtml = renderPriceBlock(item, surchargePercent);

        const tagsHtml = (item.tags || [])
          .map(function (t) { return "<span class='tag'>" + escapeHtml(t) + "</span>"; })
          .join("");

        card.innerHTML =
          "<div class='menu-item-top'>" +
            "<span class='menu-item-name'>" + escapeHtml(item.name) + "</span>" +
            (isSingleSize ? priceBlockHtml : "") +
          "</div>" +
          (item.description ? "<p class='menu-item-desc'>" + escapeHtml(item.description) + "</p>" : "") +
          (isSingleSize ? "" : priceBlockHtml) +
          (tagsHtml ? "<div class='menu-item-tags'>" + tagsHtml + "</div>" : "") +
          (item.available === false ? "<span class='sold-out-badge'>Sold Out</span>" : "");

        list.appendChild(card);
      });

      section.appendChild(list);
      rootEl.appendChild(section);
    });
  }

  // ---- Branding / color theme helpers -------------------------------
  // A color scheme is either picked from PRESET_THEMES or derived once
  // (in the editor) from an uploaded logo, then stored in menu-data.js as
  // plain hex values. The site never re-analyzes an image itself — it
  // just applies whatever colors were saved, so there's no extra work or
  // extra library on every page view.

  const PRESET_THEMES = [
    { id: "warm", name: "Warm Terracotta", colors: { accent: "#b3552f", accentText: "#ffffff", bg: "#faf8f5", border: "#e6ddd3" } },
    { id: "navy", name: "Classic Navy", colors: { accent: "#2c4a6e", accentText: "#ffffff", bg: "#f5f7fa", border: "#d9e1ea" } },
    { id: "green", name: "Fresh Green", colors: { accent: "#2f7a46", accentText: "#ffffff", bg: "#f4f9f4", border: "#d9ebdc" } },
    { id: "red", name: "Bold Red", colors: { accent: "#b3261e", accentText: "#ffffff", bg: "#fbf5f4", border: "#efd9d6" } },
    { id: "gold", name: "Charcoal & Gold", colors: { accent: "#8a6d1d", accentText: "#ffffff", bg: "#f7f5ef", border: "#e8e1cf" } }
  ];

  function hexToRgb(hex) {
    const m = hex.replace("#", "");
    return { r: parseInt(m.substr(0, 2), 16), g: parseInt(m.substr(2, 2), 16), b: parseInt(m.substr(4, 2), 16) };
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(function (v) {
      return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    }).join("");
  }

  function mixHex(hexA, hexB, amount) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    return rgbToHex(
      a.r * (1 - amount) + b.r * amount,
      a.g * (1 - amount) + b.g * amount,
      a.b * (1 - amount) + b.b * amount
    );
  }

  function relativeLuminance(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Builds a full theme (accent/background/border) from one extracted
  // logo color. Text/muted/card colors stay fixed in CSS on purpose —
  // deriving those too risks unreadable combinations.
  function themeFromAccent(accentHex) {
    let accent = accentHex;
    let rgb = hexToRgb(accent);
    if (relativeLuminance(rgb.r, rgb.g, rgb.b) > 160) {
      accent = mixHex(accentHex, "#000000", 0.35);
      rgb = hexToRgb(accent);
    }
    const accentText = relativeLuminance(rgb.r, rgb.g, rgb.b) > 150 ? "#2b2320" : "#ffffff";
    const bg = mixHex("#faf8f5", accent, 0.07);
    const border = mixHex("#faf8f5", accent, 0.22);
    return { accent: accent, accentText: accentText, bg: bg, border: border };
  }

  // Samples a small canvas already drawn with the logo and picks the
  // most plausible "brand color" — the most saturated color among the
  // most frequent non-white, non-black pixel buckets.
  function extractDominantColor(canvas) {
    const ctx = canvas.getContext("2d");
    let data;
    try {
      data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch (e) {
      return null;
    }
    const buckets = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 200) continue;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max > 240 && min > 225) continue; // near white
      if (max < 25) continue; // near black
      const key = [Math.round(r / 24) * 24, Math.round(g / 24) * 24, Math.round(b / 24) * 24].join(",");
      if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
      buckets[key].count++;
      buckets[key].r += r;
      buckets[key].g += g;
      buckets[key].b += b;
    }
    const candidates = Object.keys(buckets).map(function (key) {
      const bucket = buckets[key];
      return { r: bucket.r / bucket.count, g: bucket.g / bucket.count, b: bucket.b / bucket.count, count: bucket.count };
    });
    if (!candidates.length) return null;
    candidates.sort(function (a, b) { return b.count - a.count; });
    const top = candidates.slice(0, 6);
    function saturation(c) {
      const max = Math.max(c.r, c.g, c.b), min = Math.min(c.r, c.g, c.b);
      return max === 0 ? 0 : (max - min) / max;
    }
    top.sort(function (a, b) { return saturation(b) - saturation(a); });
    const chosen = top[0];
    return rgbToHex(chosen.r, chosen.g, chosen.b);
  }

  // Applies theme colors as CSS variables on the given element (defaults
  // to the whole page). Anything not set falls back to style.css's
  // defaults, so a missing/incomplete theme never breaks the page.
  function applyTheme(colors, el) {
    el = el || document.documentElement;
    if (!colors) return;
    if (colors.accent) el.style.setProperty("--accent", colors.accent);
    if (colors.accentText) el.style.setProperty("--accent-text", colors.accentText);
    if (colors.bg) el.style.setProperty("--bg", colors.bg);
    if (colors.border) el.style.setProperty("--border", colors.border);
  }

  window.MenuRenderer = {
    renderMenu: renderMenu,
    cardPriceFromCash: cardPriceFromCash,
    presetThemes: PRESET_THEMES,
    themeFromAccent: themeFromAccent,
    extractDominantColor: extractDominantColor,
    applyTheme: applyTheme
  };
})();

// Only runs on the public site page (index.html), not inside the editor.
if (document.getElementById("menu-root")) {
  (function () {
    const data = window.MENU_DATA;
    const root = document.getElementById("menu-root");
    const searchInput = document.getElementById("menu-search");
    const pillsEl = document.getElementById("category-pills");

    let state = { query: "", activeCategory: "all" };

    window.MenuRenderer.applyTheme(data.settings && data.settings.branding && data.settings.branding.colors);

    function rerender() {
      window.MenuRenderer.renderMenu(data, root, state);
    }

    function renderPills() {
      const cats = [{ id: "all", name: "All" }].concat(data.categories.map(function (c) {
        return { id: c.id, name: c.name };
      }));
      pillsEl.innerHTML = "";
      cats.forEach(function (c) {
        const btn = document.createElement("button");
        btn.className = "pill" + (state.activeCategory === c.id ? " active" : "");
        btn.textContent = c.name;
        btn.addEventListener("click", function () {
          state.activeCategory = c.id;
          renderPills();
          rerender();
        });
        pillsEl.appendChild(btn);
      });
    }

    searchInput.addEventListener("input", function (e) {
      state.query = e.target.value;
      rerender();
    });

    renderPills();
    rerender();
  })();
}

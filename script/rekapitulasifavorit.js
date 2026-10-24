(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const summaryCards = document.getElementById("summary-cards");
  const summaryUpdated = document.getElementById("summary-updated");
  const favoriteTotal = document.getElementById("favorite-total");
  const favoriteSearch = document.getElementById("favorite-search");
  const clearSearch = document.getElementById("clear-search");
  const resultStatus = document.getElementById("result-status");
  const favoriteList = document.getElementById("favorite-list");

  if (
    !summaryCards || !summaryUpdated || !favoriteTotal || !favoriteSearch ||
    !clearSearch || !resultStatus || !favoriteList
  ) {
    throw new Error("Elemen rekap favorit tidak ditemukan di rekapitulasifavorit.html.");
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>\"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function loadData() {
    let saved;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Data favorit gagal dibaca dari localStorage:", error);
      return { error: "Data resep favorit tidak dapat dibaca dari browser." };
    }

    if (!saved) return { data: { categories: [], recipes: [] } };

    try {
      const data = JSON.parse(saved);
      if (!data || !Array.isArray(data.categories) || !Array.isArray(data.recipes)) {
        throw new Error("Format data kategori atau resep tidak sesuai.");
      }
      return { data };
    } catch (error) {
      console.error("Data MASAKin tidak valid:", error);
      return { error: "Data MASAKin tidak valid. Periksa data yang tersimpan." };
    }
  }

  function getFavoriteRecipes(recipes) {
    return recipes.filter(recipe => recipe.favorite === true);
  }

  function readIngredient(item) {
    if (typeof item !== "string") return {
      name: String(item?.name || item?.ingredient || "Bahan"),
      quantity: String(item?.quantity ?? item?.amount ?? "secukupnya"),
      unit: String(item?.unit || "")
    };
    const match = item.trim().match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?)\s+(\S+)\s+(.+)$/);
    return match ? { name: match[3], quantity: match[1], unit: match[2] }
      : { name: item.trim(), quantity: "secukupnya", unit: "" };
  }

  function scaleQuantity(quantity, factor) {
    const value = String(quantity || "").trim();
    const fraction = value.match(/^(\d+)\/(\d+)$/);
    const decimal = value.match(/^\d+(?:[.,]\d+)?$/);
    let amount;
    if (fraction && Number(fraction[2])) amount = Number(fraction[1]) / Number(fraction[2]);
    else if (decimal) amount = Number(value.replace(",", "."));
    else return value || "secukupnya";
    return (Math.round(amount * factor * 100) / 100).toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }

  function updatePortions(recipe, panel, servings) {
    const original = Math.max(1, Number(recipe.servings) || 1);
    const target = Math.min(100, Math.max(1, Number(servings) || original));
    panel.querySelector("[data-serving-value]").value = target;
    panel.querySelector("[data-portion-ingredients]").innerHTML = (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
      .map(item => {
        const ingredient = readIngredient(item);
        return `<li><span>${escapeHTML(ingredient.name)}</span><strong>${escapeHTML([scaleQuantity(ingredient.quantity, target / original), ingredient.unit].filter(Boolean).join(" "))}</strong></li>`;
      }).join("");
  }

  function renderSummary(data) {
    const recipes = data.recipes || [];
    const favorites = getFavoriteRecipes(recipes);
    const totalCategories = new Set(recipes
      .filter(recipe => typeof recipe.category === "string" && recipe.category.trim())
      .map(recipe => recipe.category.trim()))
      .size;
    const favoriteCategories = new Set(favorites
      .filter(recipe => typeof recipe.category === "string" && recipe.category.trim())
      .map(recipe => recipe.category.trim()))
      .size;
    const share = recipes.length ? Math.round((favorites.length / recipes.length) * 100) : 0;

    summaryCards.innerHTML = `
      <article class="summary-card"><strong>${recipes.length}</strong><span>Total resep</span></article>
      <article class="summary-card"><strong>${favorites.length}</strong><span>Resep favorit</span></article>
      <article class="summary-card"><strong>${favoriteCategories}</strong><span>Kategori favorit</span></article>
      <article class="summary-card"><strong>${share}%</strong><span>Persentase favorit</span></article>
    `;

    summaryUpdated.textContent = `Diperbarui ${new Date().toLocaleString("id-ID")}`;
    favoriteTotal.textContent = `${favorites.length} menu`;
    if (totalCategories === 0 && favorites.length === 0) {
      favoriteTotal.textContent = "0 menu";
    }
  }

  function renderFavorites(data) {
    const recipes = data.recipes || [];
    const favorites = getFavoriteRecipes(recipes);
    const query = favoriteSearch.value.trim().toLocaleLowerCase("id");
    const matching = favorites.filter(recipe => {
      const searchableText = `${recipe.name || ""} ${recipe.category || ""} ${recipe.description || ""}`
        .toLocaleLowerCase("id");
      return searchableText.includes(query);
    });

    resultStatus.textContent = `${matching.length} dari ${favorites.length} resep favorit ditampilkan.`;

    if (!favorites.length) {
      favoriteList.innerHTML = `
        <li class="empty-state">
          Belum ada menu favorit. Buka daftar resep, lalu tekan ☆ Favorit pada resep pilihanmu.
       </li>
      `;
      return;
    }

    if (!matching.length) {
      favoriteList.innerHTML = `<li class="empty-state">Resep favorit tidak ditemukan. Coba kata kunci lain.</li>`;
      return;
    }

    favoriteList.innerHTML = matching.map(recipe => `
      <li class="recipe-item favorite-card">
        <div class="recipe-details">
          <strong>${escapeHTML(recipe.name || "Resep tanpa nama")}</strong>
          <span class="recipe-meta">${escapeHTML(recipe.category || "Tanpa kategori")} · ${Number(recipe.time) || 0} menit</span>
          <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
        </div>
        <div class="item-actions">
          <button class="btn btn-outline-secondary secondary" type="button" data-portions="${Number(recipe.id)}" aria-expanded="false">Atur porsi</button>
          <span class="favorite-count">★ Favorit</span>
        </div>
        <section class="favorite-portions" data-portion-panel="${Number(recipe.id)}" hidden>
          <label for="favorite-portion-${Number(recipe.id)}">Porsi yang diinginkan</label>
          <div class="favorite-portion-control"><button type="button" data-serving-step="-1" aria-label="Kurangi porsi">-</button><input id="favorite-portion-${Number(recipe.id)}" class="form-control" type="number" min="1" max="100" value="${Math.max(1, Number(recipe.servings) || 1)}" data-serving-value><button type="button" data-serving-step="1" aria-label="Tambah porsi">+</button></div>
          <p>Takaran dihitung dari resep asli (${Math.max(1, Number(recipe.servings) || 1)} porsi).</p>
          <ul data-portion-ingredients>${(Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(item => { const ingredient = readIngredient(item); return `<li><span>${escapeHTML(ingredient.name)}</span><strong>${escapeHTML([ingredient.quantity, ingredient.unit].filter(Boolean).join(" "))}</strong></li>`; }).join("")}</ul>
        </section>
      </li>
    `).join("");
  }

  function render() {
    const result = loadData();
    if (result.error) {
      summaryCards.innerHTML = `<p class="empty-state">${escapeHTML(result.error)}</p>`;
      summaryUpdated.textContent = "";
      favoriteTotal.textContent = "0 menu";
      resultStatus.textContent = "";
      favoriteList.innerHTML = `<li class="empty-state">${escapeHTML(result.error)}</li>`;
      return;
    }

    renderSummary(result.data);
    renderFavorites(result.data);
  }

  favoriteSearch.addEventListener("input", render);
  favoriteList.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const panel = button.closest("li")?.querySelector("[data-portion-panel]");
    if (button.dataset.portions !== undefined && panel) {
      const recipe = loadData().data?.recipes.find(item => Number(item.id) === Number(button.dataset.portions));
      if (!recipe) return;
      panel.hidden = !panel.hidden;
      button.setAttribute("aria-expanded", String(!panel.hidden));
      updatePortions(recipe, panel, panel.querySelector("[data-serving-value]").value);
      return;
    }
    if (button.dataset.servingStep !== undefined && panel) {
      const input = panel.querySelector("[data-serving-value]");
      input.value = Math.min(100, Math.max(1, Number(input.value || 1) + Number(button.dataset.servingStep)));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  favoriteList.addEventListener("input", event => {
    const input = event.target.closest("[data-serving-value]");
    if (!input) return;
    const panel = input.closest("[data-portion-panel]");
    const recipe = loadData().data?.recipes.find(item => Number(item.id) === Number(panel.dataset.portionPanel));
    if (recipe) updatePortions(recipe, panel, input.value);
  });
  clearSearch.addEventListener("click", () => {
    favoriteSearch.value = "";
    render();
    favoriteSearch.focus();
  });


  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) render();
  });

  render();
})();

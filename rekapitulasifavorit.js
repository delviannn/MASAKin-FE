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
  const printButton = document.getElementById("print-summary");

  if (
    !summaryCards || !summaryUpdated || !favoriteTotal || !favoriteSearch ||
    !clearSearch || !resultStatus || !favoriteList || !printButton
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
          <span class="favorite-count">★ Favorit</span>
        </div>
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
  clearSearch.addEventListener("click", () => {
    favoriteSearch.value = "";
    render();
    favoriteSearch.focus();
  });

  printButton.addEventListener("click", () => window.print());

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) render();
  });

  render();
})();

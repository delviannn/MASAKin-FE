(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const favoritesList = document.getElementById("favorites-list");
  const favoriteCount = document.getElementById("favorite-count");

  if (!favoritesList || !favoriteCount) {
    throw new Error("Elemen daftar menu favorit tidak ditemukan di favorit.html.");
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
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
      favoritesList.innerHTML = `<li class="empty-state">Data favorit tidak dapat dibaca dari browser.</li>`;
      favoriteCount.textContent = "Gagal dimuat";
      return null;
    }

    if (!saved) return { categories: [], recipes: [] };

    try {
      const data = JSON.parse(saved);
      if (!data || !Array.isArray(data.categories) || !Array.isArray(data.recipes)) {
        throw new Error("Format data MASAKin tidak sesuai.");
      }
      return data;
    } catch (error) {
      console.error("Data favorit MASAKin tidak valid:", error);
      favoritesList.innerHTML = `<li class="empty-state">Data favorit tidak valid. Periksa data MASAKin yang tersimpan.</li>`;
      favoriteCount.textContent = "Data tidak valid";
      return null;
    }
  }

  function renderFavorites() {
    const data = loadData();
    if (!data) return;

    const favorites = data.recipes.filter(recipe => recipe.favorite === true);
    favoriteCount.textContent = `${favorites.length} menu`;

    if (!favorites.length) {
      favoritesList.innerHTML = `
        <li class="empty-state">
          Belum ada menu favorit. Buka daftar resep, lalu tekan ☆ Favorit pada resep pilihanmu.
        </li>
      `;
      return;
    }

    favoritesList.innerHTML = favorites.map(recipe => `
      <li class="recipe-item favorite-card">
        <div class="recipe-details">
          <strong>${escapeHTML(recipe.name)}</strong>
          <span class="recipe-meta">${escapeHTML(recipe.category)} · ${Number(recipe.time) || 0} menit</span>
          <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
        </div>
        <div class="item-actions">
          <button class="favorite-button is-favorite" type="button"
            data-remove-favorite="${Number(recipe.id)}"
            aria-pressed="true"
            aria-label="Hapus ${escapeHTML(recipe.name)} dari menu favorit">
            ★ Hapus dari favorit
          </button>
        </div>
      </li>
    `).join("");
  }

  favoritesList.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-favorite]");
    if (!button || !favoritesList.contains(button)) return;

    const recipeId = Number(button.dataset.removeFavorite);
    const data = loadData();
    if (!data) return;

    const recipeExists = data.recipes.some(recipe => recipe.id === recipeId);
    if (!recipeExists) {
      renderFavorites();
      alert("Resep tidak ditemukan. Daftar favorit telah diperbarui.");
      return;
    }

    const recipe = data.recipes.find(item => item.id === recipeId);
    if (!confirm(`Hapus "${recipe.name}" dari daftar favorit?`)) return;

    const nextData = {
      categories: data.categories,
      recipes: data.recipes.map(recipe => recipe.id === recipeId
        ? { ...recipe, favorite: false }
        : recipe)
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    } catch (error) {
      console.error("Perubahan favorit gagal disimpan:", error);
      alert("Perubahan favorit gagal disimpan. Periksa ruang penyimpanan browser.");
      return;
    }

    renderFavorites();
  });

  renderFavorites();
})();

(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const summaryCards = document.getElementById("summary-cards");
  const summaryUpdated = document.getElementById("summary-updated");
  const favoriteSearch = document.getElementById("favorite-search");
  const clearSearch = document.getElementById("clear-search");
  const favoriteStatus = document.getElementById("favorite-status");
  const favoriteList = document.getElementById("favorite-list");

  if (
    !summaryCards || !summaryUpdated || !favoriteSearch || !clearSearch ||
    !favoriteStatus || !favoriteList
  ) {
    throw new Error("Elemen rekap favorit tidak ditemukan di rekapfavorit.html.");
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
      console.error("Data rekap favorit gagal dibaca dari localStorage:", error);
      return { error: "Data resep tidak dapat dibaca dari browser." };
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

  function renderFavorites(favorites) {
    const query = favoriteSearch.value.trim().toLocaleLowerCase("id");
    const matching = favorites.filter(recipe =>
      `${recipe.name || ""} ${recipe.category || ""} ${recipe.description || ""}`
        .toLocaleLowerCase("id").includes(query)
    );

    favoriteStatus.textContent = `${matching.length} dari ${favorites.length} resep favorit ditampilkan.`;
    favoriteList.innerHTML = matching.length
      ? matching.map(recipe => `
          <li class="recipe-item favorite-card">
            <div class="recipe-details">
              <strong>${escapeHTML(recipe.name || "Resep tanpa nama")}</strong>
              <span class="recipe-meta">${escapeHTML(recipe.category || "Tanpa kategori")} · ${Number(recipe.servings) || 1} porsi · ${Number(recipe.time) || 0} menit</span>
              <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
            </div>
            <span class="favorite-count">★ Favorit</span>
          </li>
        `).join("")
      : `<li class="empty-state">${
          favorites.length
            ? "Resep favorit tidak ditemukan."
            : "Belum ada resep favorit. Tandai resep sebagai favorit terlebih dahulu."
        }</li>`;
  }

  function render() {
    const result = loadData();
    if (result.error) {
      summaryCards.innerHTML = `<p class="empty-state">${escapeHTML(result.error)}</p>`;
      summaryUpdated.textContent = "";
      favoriteStatus.textContent = "";
      favoriteList.replaceChildren();
      return;
    }

    const favorites = result.data.recipes.filter(recipe => recipe.favorite === true);
    const categoryCount = new Set(favorites.map(recipe =>
      typeof recipe.category === "string" && recipe.category.trim()
        ? recipe.category.trim()
        : "Tanpa kategori"
    )).size;

    summaryCards.innerHTML = `
      <article class="summary-card"><strong>${favorites.length}</strong><span>Total resep favorit</span></article>
      <article class="summary-card"><strong>${categoryCount}</strong><span>Kategori favorit</span></article>
    `;
    summaryUpdated.textContent = `Diperbarui ${new Date().toLocaleString("id-ID")}`;
    renderFavorites(favorites);
  }

  favoriteSearch.addEventListener("input", render);
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

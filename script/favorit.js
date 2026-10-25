(() => {
  "use strict";

  const KEY = "masakin_mahasiswa1_v1";
  const list = document.getElementById("favorites-list");
  const count = document.getElementById("favorite-count");
  const status = document.getElementById("favorite-status");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function load() {
    const data = JSON.parse(localStorage.getItem(KEY) || '{"categories":[],"recipes":[]}');
    if (!data || !Array.isArray(data.recipes)) throw new Error("Format data resep tidak valid.");
    return data;
  }

  function render(message = "") {
    try {
      const data = load();
      const items = data.recipes.filter(recipe => recipe.favorite === true);
      count.textContent = `${items.length} resep`;
      list.innerHTML = items.length ? items.map(recipe => `<article class="recipe-card favorite-card col-12 col-md-6 col-xl-4" data-recipe-detail="${Number(recipe.id)}" tabindex="0" role="button" aria-label="Lihat detail ${esc(recipe.name)}"><div class="recipe-image image-rice" aria-hidden="true"></div><div class="recipe-card-body"><span class="badge rounded-pill bg-light text-secondary recipe-category">${esc(recipe.category)}</span><strong class="recipe-title">${esc(recipe.name)}</strong><span class="recipe-description">${esc(recipe.description || "Belum ada deskripsi.")}</span><span class="recipe-meta">◷ ${Number(recipe.time) || 0} menit · ${Number(recipe.servings) || 1} porsi</span></div></article>`).join("") : '<div class="empty-state">Belum ada resep favorit. Buka halaman Resep dan tandai pilihanmu.</div>';
      status.textContent = message;
    } catch (error) {
      console.error("Daftar favorit gagal dimuat:", error);
      count.textContent = "";
      list.innerHTML = '<div class="empty-state">Data favorit tidak dapat dibaca.</div>';
      status.textContent = "Periksa data resep yang tersimpan di browser.";
    }
  }

  render();
  document.addEventListener("masakin:recipes-updated", () => render());
  window.addEventListener("storage", event => {
    if (event.key === KEY) render("Daftar favorit diperbarui dari tab lain.");
  });
})();

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
      list.innerHTML = items.length ? items.map(recipe => `<article class="recipe-card favorite-card"><div class="recipe-image image-rice" aria-hidden="true"></div><div class="recipe-card-body"><span class="badge rounded-pill bg-light text-secondary recipe-category">${esc(recipe.category)}</span><strong class="recipe-title">${esc(recipe.name)}</strong><span class="recipe-description">${esc(recipe.description || "Belum ada deskripsi.")}</span><span class="recipe-meta">◷ ${Number(recipe.time) || 0} menit · ${Number(recipe.servings) || 1} porsi</span></div><div class="recipe-card-actions"><button class="btn btn-outline-secondary recipe-favorite-button" type="button" data-remove-favorite="${Number(recipe.id)}" aria-pressed="true">★ Hapus dari favorit</button></div></article>`).join("") : '<div class="empty-state">Belum ada resep favorit. Buka halaman Resep dan tandai pilihanmu.</div>';
      status.textContent = message;
    } catch (error) {
      console.error("Daftar favorit gagal dimuat:", error);
      count.textContent = "";
      list.innerHTML = '<div class="empty-state">Data favorit tidak dapat dibaca.</div>';
      status.textContent = "Periksa data resep yang tersimpan di browser.";
    }
  }

  list.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-favorite]");
    if (!button) return;
    const id = Number(button.dataset.removeFavorite);
    try {
      const data = load();
      const recipe = data.recipes.find(item => Number(item.id) === id);
      if (!recipe) return;
      const next = {
        ...data,
        recipes: data.recipes.map(item => item.id === id ? { ...item, favorite: false } : item)
      };
      localStorage.setItem(KEY, JSON.stringify(next));
      render(`Resep “${recipe.name}” dihapus dari favorit.`);
    } catch (error) {
      console.error("Perubahan favorit gagal disimpan:", error);
      status.textContent = "Perubahan favorit gagal disimpan. Periksa ruang penyimpanan browser.";
    }
  });

  render();
  window.addEventListener("storage", event => {
    if (event.key === KEY) render("Daftar favorit diperbarui dari tab lain.");
  });
})();

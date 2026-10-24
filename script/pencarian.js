(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const DEFAULT_CATEGORIES = ["Masakan Utama", "Camilan", "Sayuran", "Minuman"];
  const form = document.getElementById("search-form");
  const queryInput = document.getElementById("search-query");
  const categorySelect = document.getElementById("search-category");
  const status = document.getElementById("search-status");
  const results = document.getElementById("search-results");
  const clearButton = document.getElementById("clear-search");

  if (!form || !queryInput || !categorySelect || !status || !results || !clearButton) {
    throw new Error("Elemen pencarian resep tidak ditemukan di pencarian.html.");
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
      console.error("Data resep gagal dibaca dari localStorage:", error);
      status.textContent = "Data resep tidak dapat dibaca dari browser.";
      results.innerHTML = "";
      return null;
    }

    if (!saved) return { categories: DEFAULT_CATEGORIES, recipes: [] };

    try {
      const data = JSON.parse(saved);
      if (!data || !Array.isArray(data.categories) || !Array.isArray(data.recipes)) {
        throw new Error("Format data kategori atau resep tidak sesuai.");
      }
      return data;
    } catch (error) {
      console.error("Data resep MASAKin tidak valid:", error);
      status.textContent = "Data resep tidak valid. Periksa data MASAKin yang tersimpan.";
      results.innerHTML = "";
      return null;
    }
  }

  function renderCategoryOptions(categories) {
    const currentValue = categorySelect.value;
    categorySelect.innerHTML = `<option value="">Semua kategori</option>${
      categories.map(category =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
      ).join("")
    }`;
    if (categories.includes(currentValue)) categorySelect.value = currentValue;
  }

  function renderResults() {
    const data = loadData();
    if (!data) return;

    renderCategoryOptions(data.categories);
    const query = queryInput.value.trim().toLocaleLowerCase("id");
    const category = categorySelect.value;
    const matchingRecipes = data.recipes.filter(recipe => {
      const text = `${recipe.name || ""} ${recipe.description || ""} ${recipe.category || ""}`
        .toLocaleLowerCase("id");
      return text.includes(query) && (!category || recipe.category === category);
    });

    status.textContent = `${matchingRecipes.length} dari ${data.recipes.length} resep ditemukan.`;

    if (!matchingRecipes.length) {
      results.innerHTML = `<li class="empty-state">${
        data.recipes.length
          ? "Resep tidak ditemukan. Coba kata kunci atau kategori lain."
          : "Belum ada resep. Tambahkan resep terlebih dahulu di halaman pengelolaan resep."
      }</li>`;
      return;
    }

    results.innerHTML = matchingRecipes.map(recipe => `
      <li class="recipe-item">
        <div class="recipe-details">
          <strong>${escapeHTML(recipe.name)}</strong>
          <span class="recipe-meta">${escapeHTML(recipe.category)} · ${Number(recipe.time) || 0} menit</span>
          <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
        </div>
        ${recipe.favorite === true ? `<span class="favorite-count">★ Menu Favorit</span>` : ""}
      </li>
    `).join("");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    renderResults();
  });

  categorySelect.addEventListener("change", renderResults);

  clearButton.addEventListener("click", () => {
    form.reset();
    renderResults();
    queryInput.focus();
  });

  renderResults();
})();

(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const DEFAULT_CATEGORIES = ["Masakan Utama", "Camilan", "Sayuran", "Minuman"];
  const summaryCards = document.getElementById("summary-cards");
  const summaryUpdated = document.getElementById("summary-updated");
  const categorySearch = document.getElementById("category-search");
  const clearSearch = document.getElementById("clear-search");
  const resultStatus = document.getElementById("result-status");
  const categoryRecipeList = document.getElementById("category-recipe-list");
  const printButton = document.getElementById("print-summary");

  if (
    !summaryCards || !summaryUpdated || !categorySearch || !clearSearch ||
    !resultStatus || !categoryRecipeList || !printButton
  ) {
    throw new Error("Elemen rekap kategori dan resep tidak ditemukan di rekapitulasikategori.html.");
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
      console.error("Data rekap kategori gagal dibaca dari localStorage:", error);
      return { error: "Data kategori dan resep tidak dapat dibaca dari browser." };
    }

    if (!saved) return { data: { categories: DEFAULT_CATEGORIES, recipes: [] } };

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

  function getCategoryName(recipe) {
    return typeof recipe.category === "string" && recipe.category.trim()
      ? recipe.category.trim()
      : "Tanpa kategori";
  }

  function createCategorySummary(data) {
    const categories = new Map();
    data.categories.forEach(category => {
      if (typeof category === "string" && category.trim() && !categories.has(category)) {
        categories.set(category, []);
      }
    });

    data.recipes.forEach(recipe => {
      const category = getCategoryName(recipe);
      if (!categories.has(category)) categories.set(category, []);
      categories.get(category).push(recipe);
    });

    return [...categories.entries()]
      .map(([name, recipes]) => ({ name, recipes }))
      .sort((first, second) => first.name.localeCompare(second.name, "id"));
  }

  function renderCategorySummary(categories) {
    const query = categorySearch.value.trim().toLocaleLowerCase("id");
    const matchingCategories = categories.map(category => {
      const categoryMatches = category.name.toLocaleLowerCase("id").includes(query);
      const matchingRecipes = category.recipes.filter(recipe =>
        String(recipe.name || "").toLocaleLowerCase("id").includes(query)
      );
      return {
        ...category,
        visibleRecipes: !query || categoryMatches ? category.recipes : matchingRecipes
      };
    }).filter(category => category.visibleRecipes.length || !query);
    const visibleRecipeCount = matchingCategories.reduce(
      (count, category) => count + category.visibleRecipes.length,
      0
    );

    resultStatus.textContent =
      `${matchingCategories.length} kategori dan ${visibleRecipeCount} resep ditampilkan.`;

    if (!matchingCategories.length) {
      categoryRecipeList.innerHTML = `<p class="empty-state">Kategori atau resep tidak ditemukan.</p>`;
      return;
    }

    categoryRecipeList.innerHTML = matchingCategories.map(category => `
      <section class="category-recipe-card" aria-label="Kategori ${escapeHTML(category.name)}">
        <div class="section-heading">
          <h3>${escapeHTML(category.name)}</h3>
          <span class="favorite-count">${category.recipes.length} resep</span>
        </div>
        ${category.visibleRecipes.length
          ? `<ul class="recipe-list">${category.visibleRecipes.map(recipe => `
              <li class="recipe-item">
                <div class="recipe-details">
                  <strong>${escapeHTML(recipe.name || "Resep tanpa nama")}</strong>
                  <span class="recipe-meta">${Number(recipe.servings) || 1} porsi · ${Number(recipe.time) || 0} menit</span>
                  <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
                </div>
                ${recipe.favorite === true
                  ? `<span class="favorite-count">★ Favorit</span>`
                  : ""}
              </li>
            `).join("")}</ul>`
          : `<p class="empty-state">Belum ada resep dalam kategori ini.</p>`}
      </section>
    `).join("");
  }

  function render() {
    const result = loadData();
    if (result.error) {
      summaryCards.innerHTML = `<p class="empty-state">${escapeHTML(result.error)}</p>`;
      summaryUpdated.textContent = "";
      resultStatus.textContent = "";
      categoryRecipeList.replaceChildren();
      return;
    }

    const { data } = result;
    const categories = createCategorySummary(data);
    const categoriesWithRecipes = categories.filter(category => category.recipes.length).length;
    summaryCards.innerHTML = `
      <article class="summary-card"><strong>${categories.length}</strong><span>Total kategori</span></article>
      <article class="summary-card"><strong>${data.recipes.length}</strong><span>Total resep</span></article>
      <article class="summary-card"><strong>${categoriesWithRecipes}</strong><span>Kategori berisi resep</span></article>
      <article class="summary-card"><strong>${categories.length - categoriesWithRecipes}</strong><span>Kategori tanpa resep</span></article>
    `;
    summaryUpdated.textContent = `Diperbarui ${new Date().toLocaleString("id-ID")}`;
    renderCategorySummary(categories);
  }

  categorySearch.addEventListener("input", render);
  clearSearch.addEventListener("click", () => {
    categorySearch.value = "";
    render();
    categorySearch.focus();
  });
  printButton.addEventListener("click", () => window.print());
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) render();
  });

  render();
})();

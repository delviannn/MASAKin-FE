(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const summaryCards = document.getElementById("summary-cards");
  const summaryUpdated = document.getElementById("summary-updated");
  const categorySummary = document.getElementById("category-summary");
  const ingredientFilter = document.getElementById("ingredient-filter");
  const clearIngredientFilter = document.getElementById("clear-ingredient-filter");
  const ingredientStatus = document.getElementById("ingredient-status");
  const ingredientSummary = document.getElementById("ingredient-summary");
  const recipeStatus = document.getElementById("recipe-status");
  const recipeIngredientSummary = document.getElementById("recipe-ingredient-summary");
  const printButton = document.getElementById("print-summary");

  if (
    !summaryCards || !summaryUpdated || !categorySummary || !ingredientFilter ||
    !clearIngredientFilter || !ingredientStatus || !ingredientSummary ||
    !recipeStatus || !recipeIngredientSummary || !printButton
  ) {
    throw new Error("Elemen rekapitulasi tidak ditemukan di rekapitulasibahan.html.");
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
      console.error("Data rekap gagal dibaca dari localStorage:", error);
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

  function ingredientsOf(recipe) {
    if (!Array.isArray(recipe.ingredients)) return [];
    return recipe.ingredients.map(ingredient => {
      if (typeof ingredient === "string") return ingredient.trim();
      return String(ingredient?.name || ingredient?.ingredient || "").trim();
    }).filter(Boolean);
  }

  function createIngredientSummary(recipes) {
    const ingredients = new Map();
    recipes.forEach(recipe => {
      const seenInRecipe = new Set();
      ingredientsOf(recipe).forEach(name => {
        const key = name.toLocaleLowerCase("id");
        if (seenInRecipe.has(key)) return;
        seenInRecipe.add(key);
        if (!ingredients.has(key)) {
          ingredients.set(key, { name, recipes: [] });
        }
        ingredients.get(key).recipes.push(recipe.name || "Resep tanpa nama");
      });
    });
    return [...ingredients.values()].sort((first, second) =>
      first.name.localeCompare(second.name, "id")
    );
  }

  function renderCategorySummary(data) {
    const counts = new Map();
    data.categories.forEach(category => {
      if (typeof category === "string" && category.trim()) counts.set(category, 0);
    });
    data.recipes.forEach(recipe => {
      const category = typeof recipe.category === "string" && recipe.category.trim()
        ? recipe.category
        : "Tanpa kategori";
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    const entries = [...counts.entries()].sort((first, second) =>
      first[0].localeCompare(second[0], "id")
    );
    categorySummary.innerHTML = entries.length
      ? entries.map(([category, count]) => `
          <li class="recipe-item">
            <div class="recipe-details"><strong>${escapeHTML(category)}</strong></div>
            <span class="favorite-count">${count} resep</span>
          </li>
        `).join("")
      : `<li class="empty-state">Belum ada kategori atau resep.</li>`;
  }

  function renderIngredientSummary(ingredients) {
    const query = ingredientFilter.value.trim().toLocaleLowerCase("id");
    const matching = ingredients.filter(item =>
      item.name.toLocaleLowerCase("id").includes(query) ||
      item.recipes.some(name => name.toLocaleLowerCase("id").includes(query))
    );

    ingredientStatus.textContent = `${matching.length} dari ${ingredients.length} bahan ditampilkan.`;
    ingredientSummary.innerHTML = matching.length
      ? matching.map(item => `
          <li class="recipe-item">
            <div class="recipe-details">
              <strong>${escapeHTML(item.name)}</strong>
              <span class="recipe-meta">Digunakan pada ${item.recipes.length} resep</span>
              <p>${item.recipes.map(escapeHTML).join(", ")}</p>
            </div>
          </li>
        `).join("")
      : `<li class="empty-state">${
          ingredients.length
            ? "Bahan atau resep tidak ditemukan."
            : "Belum ada bahan. Tambahkan bahan pada form kelola resep terlebih dahulu."
        }</li>`;
  }

  function renderRecipeIngredients(recipes) {
    const query = ingredientFilter.value.trim().toLocaleLowerCase("id");
    const matchingRecipes = recipes.filter(recipe => {
      const ingredients = ingredientsOf(recipe);
      const searchable = [
        recipe.name || "",
        recipe.category || "",
        recipe.description || "",
        ...ingredients
      ].join(" ").toLocaleLowerCase("id");
      return searchable.includes(query);
    });

    recipeStatus.textContent = `${matchingRecipes.length} dari ${recipes.length} resep ditampilkan.`;
    recipeIngredientSummary.innerHTML = matchingRecipes.length
      ? matchingRecipes.map(recipe => {
          const ingredients = ingredientsOf(recipe);
          return `
            <li class="recipe-item">
              <div class="recipe-details">
                <strong>${escapeHTML(recipe.name || "Resep tanpa nama")}</strong>
                <span class="recipe-meta">${escapeHTML(recipe.category || "Tanpa kategori")} · ${Number(recipe.time) || 0} menit</span>
                <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
                <p><strong>Bahan untuk resep ini:</strong> ${ingredients.length
                  ? ingredients.map(escapeHTML).join(", ")
                  : "Belum ada bahan yang dicatat."}</p>
              </div>
            </li>
          `;
        }).join("")
      : `<li class="empty-state">${
          recipes.length
            ? "Resep atau bahan tidak ditemukan."
            : "Belum ada resep. Tambahkan resep terlebih dahulu."
        }</li>`;
  }

  function render() {
    const result = loadData();
    if (result.error) {
      summaryCards.innerHTML = `<p class="empty-state">${escapeHTML(result.error)}</p>`;
      summaryUpdated.textContent = "";
      categorySummary.replaceChildren();
      ingredientStatus.textContent = "";
      ingredientSummary.replaceChildren();
      recipeStatus.textContent = "";
      recipeIngredientSummary.replaceChildren();
      return;
    }

    const { data } = result;
    const ingredients = createIngredientSummary(data.recipes);
    const ingredientUses = ingredients.reduce(
      (total, ingredient) => total + ingredient.recipes.length,
      0
    );
    const favoriteCount = data.recipes.filter(recipe => recipe.favorite === true).length;

    summaryCards.innerHTML = `
      <article class="summary-card"><strong>${data.recipes.length}</strong><span>Resep</span></article>
      <article class="summary-card"><strong>${ingredients.length}</strong><span>Jenis bahan</span></article>
      <article class="summary-card"><strong>${ingredientUses}</strong><span>Jumlah penggunaan bahan</span></article>
      <article class="summary-card"><strong>${favoriteCount}</strong><span>Resep favorit</span></article>
    `;
    summaryUpdated.textContent = `Diperbarui ${new Date().toLocaleString("id-ID")}`;
    renderCategorySummary(data);
    renderRecipeIngredients(data.recipes);
    renderIngredientSummary(ingredients);
  }

  ingredientFilter.addEventListener("input", render);
  clearIngredientFilter.addEventListener("click", () => {
    ingredientFilter.value = "";
    render();
    ingredientFilter.focus();
  });
  printButton.addEventListener("click", () => window.print());
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) render();
  });

  render();
})();

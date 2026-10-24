(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const DEFAULT_CATEGORIES = ["Masakan Utama", "Camilan", "Sayuran", "Minuman"];
  const form = document.getElementById("filter-form");
  const recipeQueryInput = document.getElementById("recipe-query");
  const ingredientQueryInput = document.getElementById("ingredient-query");
  const categorySelect = document.getElementById("category-filter");
  const status = document.getElementById("filter-status");
  const results = document.getElementById("filter-results");
  const resetButton = document.getElementById("reset-filter");

  if (
    !form || !recipeQueryInput || !ingredientQueryInput || !categorySelect ||
    !status || !results || !resetButton
  ) {
    throw new Error("Elemen pencarian bahan dan resep tidak ditemukan di filterbahan.html.");
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
      results.replaceChildren();
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
      console.error("Data MASAKin tidak valid:", error);
      status.textContent = "Data resep tidak valid. Periksa data MASAKin yang tersimpan.";
      results.replaceChildren();
      return null;
    }
  }

  function ingredientsOf(recipe) {
    if (!Array.isArray(recipe.ingredients)) return [];
    return recipe.ingredients.map(ingredient => {
      if (typeof ingredient === "string") return ingredient;
      if (!ingredient || typeof ingredient !== "object") return "";
      return [
        ingredient.quantity ?? ingredient.amount ?? "",
        ingredient.unit || "",
        ingredient.name || ingredient.ingredient || ""
      ].filter(Boolean).join(" ");
    }).filter(Boolean);
  }

  function renderCategoryOptions(categories) {
    const currentValue = categorySelect.value;
    categorySelect.replaceChildren(new Option("Semua kategori", ""));
    categories.forEach(category => {
      categorySelect.add(new Option(category, category));
    });
    if (categories.includes(currentValue)) categorySelect.value = currentValue;
  }

  function renderResults() {
    const data = loadData();
    if (!data) return;

    const categories = data.categories.filter(category =>
      typeof category === "string" && category.trim()
    );
    renderCategoryOptions(categories);

    const recipeQuery = recipeQueryInput.value.trim().toLocaleLowerCase("id");
    const ingredientQuery = ingredientQueryInput.value.trim().toLocaleLowerCase("id");
    const selectedCategory = categorySelect.value;
    const matchingRecipes = data.recipes.filter(recipe => {
      const recipeText = [
        recipe.name || "",
        recipe.description || "",
        recipe.category || ""
      ].join(" ").toLocaleLowerCase("id");
      const ingredientText = ingredientsOf(recipe).join(" ").toLocaleLowerCase("id");
      return (!recipeQuery || recipeText.includes(recipeQuery)) &&
        (!ingredientQuery || ingredientText.includes(ingredientQuery)) &&
        (!selectedCategory || recipe.category === selectedCategory);
    });

    status.textContent = `${matchingRecipes.length} dari ${data.recipes.length} resep ditemukan.`;
    if (!matchingRecipes.length) {
      results.innerHTML = `<li class="empty-state">${
        data.recipes.length
          ? "Resep tidak ditemukan. Coba kata kunci, bahan, atau kategori lain."
          : "Belum ada resep. Tambahkan resep terlebih dahulu."
      }</li>`;
      return;
    }

    results.innerHTML = matchingRecipes.map(recipe => {
      const ingredients = ingredientsOf(recipe);
      const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
      return `
        <li class="recipe-item">
          <div class="recipe-details">
            <strong>${escapeHTML(recipe.name)}</strong>
            <span class="recipe-meta">${escapeHTML(recipe.category)} · ${Number(recipe.time) || 0} menit</span>
            <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
            <p><strong>Bahan:</strong> ${ingredients.length
              ? ingredients.map(escapeHTML).join(", ")
              : "Belum ada bahan yang dicatat."}</p>
            ${steps.length
              ? `<p><strong>Langkah:</strong> ${steps.length} langkah memasak.</p>`
              : ""}
          </div>
          ${recipe.favorite === true ? `<span class="favorite-count">★ Menu Favorit</span>` : ""}
        </li>
      `;
    }).join("");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    renderResults();
  });

  categorySelect.addEventListener("change", renderResults);
  recipeQueryInput.addEventListener("input", renderResults);
  ingredientQueryInput.addEventListener("input", renderResults);

  resetButton.addEventListener("click", () => {
    form.reset();
    renderResults();
    recipeQueryInput.focus();
  });

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) renderResults();
  });

  renderResults();
})();

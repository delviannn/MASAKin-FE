(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const summaryCards = document.getElementById("summary-cards");
  const summaryUpdated = document.getElementById("summary-updated");
  const recipeSelect = document.getElementById("recipe-select");
  const ingredientList = document.getElementById("ingredient-list");
  const ingredientCount = document.getElementById("ingredient-count");
  const ingredientForm = document.getElementById("ingredient-form");
  const ingredientNameInput = document.getElementById("ingredient-name");
  const refreshButton = document.getElementById("refresh-data");

  if (
    !summaryCards || !summaryUpdated || !recipeSelect || !ingredientList ||
    !ingredientCount || !ingredientForm || !ingredientNameInput || !refreshButton
  ) {
    throw new Error("Elemen kelola bahan resep tidak ditemukan di kelola-bahan.html.");
  }

  let appData = loadData();

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
      console.error("Data bahan gagal dibaca dari localStorage:", error);
      return { categories: [], recipes: [] };
    }

    if (!saved) return { categories: [], recipes: [] };

    try {
      const data = JSON.parse(saved);
      if (!data || !Array.isArray(data.categories) || !Array.isArray(data.recipes)) {
        throw new Error("Format data kategori atau resep tidak sesuai.");
      }
      return data;
    } catch (error) {
      console.error("Data MASAKin tidak valid:", error);
      return { categories: [], recipes: [] };
    }
  }

  function saveData(nextData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      appData = nextData;
      return true;
    } catch (error) {
      console.error("Perubahan bahan gagal disimpan:", error);
      alert("Perubahan bahan gagal disimpan. Periksa ruang penyimpanan browser.");
      return false;
    }
  }

  function getSelectedRecipeId() {
    return Number(recipeSelect.value) || null;
  }

  function getSelectedRecipe() {
    const id = getSelectedRecipeId();
    return appData.recipes.find(recipe => recipe.id === id) || null;
  }

  function renderSummary() {
    const totalRecipes = appData.recipes.length;
    const totalIngredients = appData.recipes.reduce((count, recipe) => {
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      return count + ingredients.length;
    }, 0);

    summaryCards.innerHTML = `
      <article class="summary-card"><strong>${totalRecipes}</strong><span>Resep</span></article>
      <article class="summary-card"><strong>${totalIngredients}</strong><span>Total bahan</span></article>
      <article class="summary-card"><strong>${appData.categories.length}</strong><span>Kategori</span></article>
      <article class="summary-card"><strong>${totalRecipes ? Math.round(totalIngredients / totalRecipes) : 0}</strong><span>Bahan per resep</span></article>
    `;
    summaryUpdated.textContent = `Diperbarui ${new Date().toLocaleString("id-ID")}`;
  }

  function renderRecipeOptions() {
    const currentValue = getSelectedRecipeId();
    recipeSelect.replaceChildren();

    if (!appData.recipes.length) {
      recipeSelect.add(new Option("Belum ada resep", ""));
      recipeSelect.disabled = true;
      ingredientForm.querySelector('button[type="submit"]').disabled = true;
      ingredientList.innerHTML = `<li class="empty-state">Belum ada resep. Tambahkan resep terlebih dahulu di halaman kelola resep.</li>`;
      ingredientCount.textContent = "0 bahan";
      return;
    }

    recipeSelect.disabled = false;
    appData.recipes.forEach(recipe => {
      const option = new Option(`${recipe.name} (${recipe.category || "Tanpa kategori"})`, String(recipe.id));
      recipeSelect.add(option);
    });

    const nextValue = appData.recipes.some(recipe => recipe.id === currentValue)
      ? currentValue
      : appData.recipes[0].id;

    recipeSelect.value = String(nextValue);
    ingredientForm.querySelector('button[type="submit"]').disabled = false;
    renderIngredients();
  }

  function renderIngredients() {
    const recipe = getSelectedRecipe();
    if (!recipe) {
      ingredientList.innerHTML = `<li class="empty-state">Resep tidak tersedia.</li>`;
      ingredientCount.textContent = "0 bahan";
      return;
    }

    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    ingredientCount.textContent = `${ingredients.length} bahan`;

    if (!ingredients.length) {
      ingredientList.innerHTML = `<li class="empty-state">Belum ada bahan di resep ini. Tambahkan bahan baru di bawah.</li>`;
      return;
    }

    ingredientList.innerHTML = ingredients.map((ingredient, index) => `
      <li class="recipe-item">
        <div class="recipe-details">
          <strong>${escapeHTML(ingredient)}</strong>
          <span class="recipe-meta">Item bahan ke-${index + 1}</span>
        </div>
        <div class="item-actions">
          <button type="button" data-ingredient-edit="${index}">Ubah</button>
          <button class="secondary" type="button" data-ingredient-delete="${index}">Hapus</button>
        </div>
      </li>
    `).join("");
  }

  function updateSelectedRecipeIngredients(nextIngredients) {
    const recipe = getSelectedRecipe();
    if (!recipe) return;

    const nextData = {
      ...appData,
      recipes: appData.recipes.map(item => item.id === recipe.id
        ? { ...item, ingredients: nextIngredients }
        : item)
    };

    if (saveData(nextData)) {
      renderSummary();
      renderIngredients();
    }
  }

  recipeSelect.addEventListener("change", renderIngredients);

  ingredientForm.addEventListener("submit", event => {
    event.preventDefault();
    const recipe = getSelectedRecipe();
    if (!recipe) {
      alert("Pilih resep terlebih dahulu sebelum menambah bahan.");
      return;
    }

    const value = ingredientNameInput.value.trim();
    if (!value) {
      ingredientNameInput.focus();
      return;
    }

    const ingredients = Array.isArray(recipe.ingredients) ? [...recipe.ingredients] : [];
    ingredients.push(value);
    updateSelectedRecipeIngredients(ingredients);
    ingredientForm.reset();
    ingredientNameInput.focus();
  });

  ingredientList.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || !ingredientList.contains(button)) return;

    const recipe = getSelectedRecipe();
    if (!recipe) return;

    const ingredients = Array.isArray(recipe.ingredients) ? [...recipe.ingredients] : [];
    const index = Number(button.dataset.ingredientEdit ?? button.dataset.ingredientDelete);
    if (!Number.isInteger(index) || index < 0 || index >= ingredients.length) {
      renderIngredients();
      alert("Bahan tidak ditemukan. Daftar telah diperbarui.");
      return;
    }

    if (button.dataset.ingredientEdit !== undefined) {
      const nextValue = prompt("Ubah nama bahan:", ingredients[index]);
      if (nextValue === null) return;
      const cleaned = nextValue.trim();
      if (!cleaned) {
        alert("Nama bahan tidak boleh kosong.");
        return;
      }
      ingredients[index] = cleaned;
      updateSelectedRecipeIngredients(ingredients);
      return;
    }

    if (button.dataset.ingredientDelete !== undefined) {
      if (!confirm(`Hapus bahan "${ingredients[index]}" dari resep "${recipe.name}"?`)) return;
      ingredients.splice(index, 1);
      updateSelectedRecipeIngredients(ingredients);
    }
  });

  refreshButton.addEventListener("click", () => {
    appData = loadData();
    renderSummary();
    renderRecipeOptions();
  });

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
      appData = loadData();
      renderSummary();
      renderRecipeOptions();
    }
  });

  renderSummary();
  renderRecipeOptions();
})();

(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const DEFAULT_DATA = {
    categories: ["Masakan Utama", "Camilan", "Sayuran", "Minuman"],
    recipes: []
  };

  const categoryForm = document.getElementById("category-form");
  const categoryInput = document.getElementById("category-name");
  const categorySubmit = document.getElementById("category-submit");
  const categoryList = document.getElementById("category-list");
  const cancelCategoryEdit = document.getElementById("cancel-category-edit");
  const recipeForm = document.getElementById("recipe-form");
  const recipeCategory = document.getElementById("recipe-category");
  const categoryFilter = document.getElementById("category-filter");
  const recipeFilterForm = document.getElementById("recipe-filter-form");
  const recipeSearch = document.getElementById("recipe-search");
  const recipeList = document.getElementById("recipe-list");
  const resultCount = document.getElementById("recipe-result-count");
  const cancelRecipeEdit = document.getElementById("cancel-recipe-edit");
  const recipeSubmit = document.getElementById("recipe-submit");

  const requiredElements = [
    categoryForm, categoryInput, categorySubmit, categoryList, cancelCategoryEdit,
    recipeForm, recipeCategory, categoryFilter, recipeFilterForm, recipeSearch,
    recipeList, resultCount, cancelRecipeEdit, recipeSubmit
  ];
  if (requiredElements.some(element => !element)) {
    throw new Error("Elemen pengelolaan kategori atau resep tidak ditemukan di kategori.html.");
  }

  let editingCategoryIndex = null;
  let editingRecipeId = null;
  let searchTerm = "";
  let selectedCategory = "";

  function copyDefaultData() {
    return {
      categories: [...DEFAULT_DATA.categories],
      recipes: [...DEFAULT_DATA.recipes]
    };
  }

  function loadData() {
    let saved;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Data MASAKin gagal dibaca dari localStorage:", error);
      alert("Data MASAKin tidak dapat dibaca dari browser ini.");
      return copyDefaultData();
    }

    if (!saved) return copyDefaultData();

    try {
      const data = JSON.parse(saved);
      if (!data || !Array.isArray(data.categories) || !Array.isArray(data.recipes)) {
        throw new Error("Format data kategori atau resep tidak sesuai.");
      }
      return data;
    } catch (error) {
      console.error("Data MASAKin tidak valid:", error);
      alert("Data MASAKin tidak valid. Data contoh ditampilkan; data lama belum diubah.");
      return copyDefaultData();
    }
  }

  let appData = loadData();

  function saveData(nextData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      appData = nextData;
      return true;
    } catch (error) {
      console.error("Perubahan MASAKin gagal disimpan:", error);
      alert("Perubahan gagal disimpan. Periksa ruang penyimpanan browser.");
      return false;
    }
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

  function renderCategories() {
    categoryList.innerHTML = appData.categories.map((category, index) => {
      const recipeCount = appData.recipes.filter(
        recipe => recipe.category === category
      ).length;

      return `
        <li class="category-item">
          <div><strong>${escapeHTML(category)}</strong><span>${recipeCount} resep</span></div>
          <div class="item-actions">
            <button type="button" data-category-edit="${index}">Ubah</button>
            <button class="secondary" type="button" data-category-delete="${index}">Hapus</button>
          </div>
        </li>
      `;
    }).join("");

    const previousRecipeCategory = recipeCategory.value;
    const previousFilterCategory = categoryFilter.value;
    recipeCategory.innerHTML = appData.categories.map(category =>
      `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
    ).join("");
    categoryFilter.innerHTML = `<option value="">Semua kategori</option>${
      appData.categories.map(category =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
      ).join("")
    }`;

    if (appData.categories.includes(previousRecipeCategory)) {
      recipeCategory.value = previousRecipeCategory;
    }
    if (appData.categories.includes(previousFilterCategory)) {
      categoryFilter.value = previousFilterCategory;
    } else {
      categoryFilter.value = "";
      selectedCategory = "";
    }
    recipeForm.querySelector('button[type="submit"]').disabled = appData.categories.length === 0;
  }

  function getFilteredRecipes() {
    const query = searchTerm.toLocaleLowerCase("id");
    return appData.recipes.filter(recipe => {
      const searchableText = `${recipe.name} ${recipe.description || ""} ${recipe.category}`.toLocaleLowerCase("id");
      return searchableText.includes(query) &&
        (!selectedCategory || recipe.category === selectedCategory);
    });
  }

  function renderRecipes() {
    const filteredRecipes = getFilteredRecipes();
    resultCount.textContent = `${filteredRecipes.length} dari ${appData.recipes.length} resep ditampilkan.`;

    if (!filteredRecipes.length) {
      recipeList.innerHTML = `<li class="empty-state">${
        appData.recipes.length
          ? "Resep tidak ditemukan. Coba kata kunci atau kategori lain."
          : "Belum ada resep. Tambahkan resep pertama menggunakan form di atas."
      }</li>`;
      return;
    }

    recipeList.innerHTML = filteredRecipes.map(recipe => `
      <li class="recipe-item">
        <div class="recipe-details">
          <strong>${escapeHTML(recipe.name)}</strong>
          <span class="recipe-meta">${escapeHTML(recipe.category)} · ${Number(recipe.servings) || 1} porsi · ${Number(recipe.time) || 0} menit</span>
          <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
        </div>
        <div class="item-actions">
          <button class="favorite-button ${recipe.favorite ? "is-favorite" : ""}" type="button"
            data-recipe-favorite="${Number(recipe.id)}"
            aria-pressed="${recipe.favorite === true}"
            aria-label="${recipe.favorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}">
            ${recipe.favorite ? "★ Favorit" : "☆ Favorit"}
          </button>
          <button type="button" data-recipe-edit="${Number(recipe.id)}">Ubah</button>
          <button class="secondary" type="button" data-recipe-delete="${Number(recipe.id)}">Hapus</button>
        </div>
      </li>
    `).join("");
  }

  function render() {
    renderCategories();
    renderRecipes();
  }

  function resetCategoryForm() {
    categoryForm.reset();
    editingCategoryIndex = null;
    categorySubmit.textContent = "Tambah kategori";
    cancelCategoryEdit.hidden = true;
  }

  function resetRecipeForm() {
    recipeForm.reset();
    document.getElementById("recipe-id").value = "";
    editingRecipeId = null;
    recipeSubmit.textContent = "Tambah resep";
    cancelRecipeEdit.hidden = true;
    document.getElementById("recipe-time").value = "30";
    if (appData.categories.length) recipeCategory.value = appData.categories[0];
  }

  categoryForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = categoryInput.value.trim();
    if (!name) {
      categoryInput.focus();
      return;
    }

    const duplicate = appData.categories.some((category, index) =>
      category.toLocaleLowerCase("id") === name.toLocaleLowerCase("id") &&
      index !== editingCategoryIndex
    );
    if (duplicate) {
      alert("Kategori tersebut sudah ada.");
      categoryInput.focus();
      return;
    }

    const nextData = {
      categories: [...appData.categories],
      recipes: appData.recipes.map(recipe => ({ ...recipe }))
    };

    if (editingCategoryIndex === null) {
      nextData.categories.push(name);
    } else {
      const oldName = nextData.categories[editingCategoryIndex];
      if (oldName === undefined) {
        resetCategoryForm();
        render();
        alert("Kategori yang akan diubah tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      nextData.categories[editingCategoryIndex] = name;
      nextData.recipes.forEach(recipe => {
        if (recipe.category === oldName) recipe.category = name;
      });
    }

    if (saveData(nextData)) {
      resetCategoryForm();
      render();
    }
  });

  categoryList.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || !categoryList.contains(button)) return;

    if (button.dataset.categoryEdit !== undefined) {
      const index = Number(button.dataset.categoryEdit);
      const category = appData.categories[index];
      if (category === undefined) {
        render();
        alert("Kategori tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      editingCategoryIndex = index;
      categoryInput.value = category;
      categorySubmit.textContent = "Simpan perubahan";
      cancelCategoryEdit.hidden = false;
      categoryInput.focus();
      return;
    }

    if (button.dataset.categoryDelete !== undefined) {
      const index = Number(button.dataset.categoryDelete);
      const category = appData.categories[index];
      if (category === undefined) {
        render();
        alert("Kategori tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      if (appData.recipes.some(recipe => recipe.category === category)) {
        alert("Kategori masih digunakan oleh resep. Ubah kategori resep terkait terlebih dahulu.");
        return;
      }
      if (!confirm(`Hapus kategori "${category}"?`)) return;

      const nextData = {
        categories: appData.categories.filter((_, itemIndex) => itemIndex !== index),
        recipes: appData.recipes
      };
      if (saveData(nextData)) {
        if (editingCategoryIndex === index) resetCategoryForm();
        else if (editingCategoryIndex !== null && editingCategoryIndex > index) editingCategoryIndex -= 1;
        render();
      }
    }
  });

  cancelCategoryEdit.addEventListener("click", resetCategoryForm);

  recipeForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!appData.categories.length) {
      alert("Tambahkan kategori terlebih dahulu sebelum membuat resep.");
      return;
    }

    const formData = new FormData(recipeForm);
    const name = String(formData.get("name") || "").trim();
    const category = String(formData.get("category") || "");
    const time = Number(formData.get("time"));
    if (!name || !appData.categories.includes(category) || !Number.isInteger(time) || time < 1 || time > 1440) {
      alert("Periksa nama, kategori, dan waktu memasak resep.");
      return;
    }

    const existingRecipe = appData.recipes.find(recipe => recipe.id === editingRecipeId);
    const recipe = {
      id: existingRecipe?.id ?? Math.max(0, ...appData.recipes.map(item => Number(item.id) || 0)) + 1,
      name,
      category,
      description: String(formData.get("description") || "").trim(),
      time,
      favorite: existingRecipe?.favorite ?? false
    };
    const nextData = {
      categories: [...appData.categories],
      recipes: existingRecipe
        ? appData.recipes.map(item => item.id === existingRecipe.id ? recipe : item)
        : [recipe, ...appData.recipes]
    };

    if (saveData(nextData)) {
      resetRecipeForm();
      render();
    }
  });

  recipeList.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || !recipeList.contains(button)) return;

    if (button.dataset.recipeEdit !== undefined) {
      const recipe = appData.recipes.find(item => item.id === Number(button.dataset.recipeEdit));
      if (!recipe) {
        renderRecipes();
        alert("Resep tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      editingRecipeId = recipe.id;
      document.getElementById("recipe-id").value = String(recipe.id);
      document.getElementById("recipe-name").value = recipe.name;
      recipeCategory.value = recipe.category;
      document.getElementById("recipe-description").value = recipe.description || "";
      document.getElementById("recipe-time").value = String(recipe.time || 30);
      recipeSubmit.textContent = "Simpan perubahan";
      cancelRecipeEdit.hidden = false;
      document.getElementById("recipe-name").focus();
      return;
    }

    if (button.dataset.recipeDelete !== undefined) {
      const id = Number(button.dataset.recipeDelete);
      const recipe = appData.recipes.find(item => item.id === id);
      if (!recipe) {
        renderRecipes();
        alert("Resep tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      if (!confirm(`Hapus resep "${recipe.name}"?`)) return;

      const nextData = {
        categories: [...appData.categories],
        recipes: appData.recipes.filter(item => item.id !== id)
      };
      if (saveData(nextData)) {
        if (editingRecipeId === id) resetRecipeForm();
        render();
      }
    }
  });

  recipeList.addEventListener("click", event => {
    const button = event.target.closest("[data-recipe-favorite]");
    if (!button || !recipeList.contains(button)) return;

    const id = Number(button.dataset.recipeFavorite);
    const recipe = appData.recipes.find(item => item.id === id);
    if (!recipe) {
      renderRecipes();
      alert("Resep tidak ditemukan. Daftar telah diperbarui.");
      return;
    }

    const nextData = {
      categories: [...appData.categories],
      recipes: appData.recipes.map(item => item.id === id
        ? { ...item, favorite: item.favorite !== true }
        : item)
    };
    if (saveData(nextData)) renderRecipes();
  });

  cancelRecipeEdit.addEventListener("click", resetRecipeForm);

  recipeFilterForm.addEventListener("submit", event => {
    event.preventDefault();
    searchTerm = recipeSearch.value.trim();
    selectedCategory = categoryFilter.value;
    renderRecipes();
  });

  document.getElementById("reset-filter").addEventListener("click", () => {
    recipeSearch.value = "";
    categoryFilter.value = "";
    searchTerm = "";
    selectedCategory = "";
    renderRecipes();
  });

  render();
})();

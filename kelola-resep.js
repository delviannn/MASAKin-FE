(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const DEFAULT_CATEGORIES = ["Masakan Utama", "Camilan", "Sayuran", "Minuman"];
  const recipeFormPanel = document.getElementById("recipe-form-panel");
  const addRecipeButton = document.getElementById("add-recipe");
  const recipeForm = document.getElementById("recipe-form");
  const recipeIdInput = document.getElementById("recipe-id");
  const recipeNameInput = document.getElementById("recipe-name");
  const recipeCategory = document.getElementById("recipe-category");
  const recipeDescriptionInput = document.getElementById("recipe-description");
  const recipeIngredientsInput = document.getElementById("recipe-ingredients");
  const recipeTimeInput = document.getElementById("recipe-time");
  const recipeSubmit = document.getElementById("recipe-submit");
  const cancelRecipeEdit = document.getElementById("cancel-recipe-edit");
  const recipeList = document.getElementById("recipe-list");

  if (
    !recipeFormPanel || !addRecipeButton || !recipeForm || !recipeIdInput ||
    !recipeNameInput || !recipeCategory || !recipeDescriptionInput ||
    !recipeIngredientsInput || !recipeTimeInput || !recipeSubmit ||
    !cancelRecipeEdit || !recipeList
  ) {
    throw new Error("Elemen pengelolaan resep tidak ditemukan di kelola-resep.html.");
  }

  let appData;
  let editingRecipeId = null;

  function loadData() {
    let saved;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Data MASAKin gagal dibaca dari localStorage:", error);
      throw new Error("Data resep tidak dapat dibaca dari browser.");
    }

    if (!saved) return { categories: [...DEFAULT_CATEGORIES], recipes: [] };

    try {
      const data = JSON.parse(saved);
      if (!data || !Array.isArray(data.categories) || !Array.isArray(data.recipes)) {
        throw new Error("Format data kategori atau resep tidak sesuai.");
      }
      return data;
    } catch (error) {
      console.error("Data MASAKin tidak valid:", error);
      throw new Error("Data MASAKin tidak valid. Data tersimpan tidak diubah.");
    }
  }

  function saveData(nextData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      appData = nextData;
      return true;
    } catch (error) {
      console.error("Perubahan resep gagal disimpan:", error);
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
    const previousCategory = recipeCategory.value;
    recipeCategory.replaceChildren(...appData.categories.map(category =>
      new Option(category, category)
    ));
    if (appData.categories.includes(previousCategory)) {
      recipeCategory.value = previousCategory;
    }
    recipeCategory.disabled = appData.categories.length === 0;
    recipeSubmit.disabled = appData.categories.length === 0;
    if (appData.categories.length === 0) {
      recipeCategory.add(new Option("Tambahkan kategori terlebih dahulu", ""));
    }
  }

  function renderRecipes() {
    if (!appData.recipes.length) {
      recipeList.innerHTML = `<li class="empty-state">Belum ada resep. Tekan Tambah resep untuk menambahkan resep pertama.</li>`;
      return;
    }

    recipeList.innerHTML = appData.recipes.map(recipe => {
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      return `
      <li class="recipe-item">
        <div class="recipe-details">
          <strong>${escapeHTML(recipe.name)}</strong>
          <span class="recipe-meta">${escapeHTML(recipe.category)} · ${Number(recipe.time) || 0} menit</span>
          <p>${escapeHTML(recipe.description || "Belum ada deskripsi.")}</p>
          <details class="recipe-ingredients-editor">
            <summary>Bahan (${ingredients.length})</summary>
            <ul class="editable-list ingredient-list">
              ${ingredients.length ? ingredients.map((ingredient, index) => `
                <li class="ingredient-item">
                  <span>${escapeHTML(ingredient)}</span>
                  <span class="item-actions">
                    <button type="button" data-ingredient-edit="${Number(recipe.id)}" data-ingredient-index="${index}">Ubah</button>
                    <button class="secondary" type="button" data-ingredient-delete="${Number(recipe.id)}" data-ingredient-index="${index}">Hapus</button>
                  </span>
                </li>
              `).join("") : `<li class="empty-state">Belum ada bahan.</li>`}
            </ul>
            <form class="ingredient-add-form" data-ingredient-add="${Number(recipe.id)}">
              <label class="field-label" for="ingredient-${Number(recipe.id)}">Tambah bahan</label>
              <div class="form-row">
                <input class="text-input" id="ingredient-${Number(recipe.id)}" name="ingredient" type="text" maxlength="160" placeholder="Contoh: 2 siung bawang putih" required>
                <button type="submit">Tambah</button>
              </div>
            </form>
          </details>
        </div>
        <div class="item-actions">
          <button class="favorite-button ${recipe.favorite === true ? "is-favorite" : ""}" type="button"
            data-recipe-favorite="${Number(recipe.id)}"
            aria-pressed="${recipe.favorite === true}"
            aria-label="${recipe.favorite === true ? "Hapus dari favorit" : "Tambahkan ke favorit"}">
            ${recipe.favorite === true ? "★ Favorit" : "☆ Favorit"}
          </button>
          <button type="button" data-recipe-edit="${Number(recipe.id)}">Ubah</button>
          <button class="secondary" type="button" data-recipe-delete="${Number(recipe.id)}">Hapus</button>
        </div>
      </li>
    `;
    }).join("");
  }

  function saveRecipeIngredients(recipeId, ingredients) {
    const nextData = {
      ...appData,
      recipes: appData.recipes.map(recipe => recipe.id === recipeId
        ? { ...recipe, ingredients }
        : recipe)
    };
    if (saveData(nextData)) renderRecipes();
  }

  function render() {
    renderCategories();
    renderRecipes();
  }

  function resetRecipeForm() {
    recipeForm.reset();
    recipeIdInput.value = "";
    editingRecipeId = null;
    recipeSubmit.textContent = "Simpan resep";
    cancelRecipeEdit.hidden = true;
    recipeTimeInput.value = "30";
    if (appData.categories.length) recipeCategory.value = appData.categories[0];
  }

  function closeRecipeForm() {
    resetRecipeForm();
    recipeFormPanel.hidden = true;
  }

  function showLoadError(error) {
    console.error(error);
    addRecipeButton.disabled = true;
    recipeForm.querySelectorAll("input, select, textarea, button").forEach(element => {
      element.disabled = true;
    });
    recipeList.innerHTML = `<li class="empty-state">${escapeHTML(error.message)}</li>`;
  }

  try {
    appData = loadData();
    render();
  } catch (error) {
    showLoadError(error);
    return;
  }

  addRecipeButton.addEventListener("click", () => {
    resetRecipeForm();
    cancelRecipeEdit.hidden = false;
    recipeFormPanel.hidden = false;
    recipeNameInput.focus();
  });

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
    if (!name || !appData.categories.includes(category) ||
      !Number.isInteger(time) || time < 1 || time > 1440) {
      alert("Periksa nama, kategori, dan waktu memasak resep.");
      return;
    }

    const existingRecipe = appData.recipes.find(recipe => recipe.id === editingRecipeId);
    if (editingRecipeId !== null && !existingRecipe) {
      closeRecipeForm();
      renderRecipes();
      alert("Resep yang akan diubah tidak ditemukan. Daftar telah diperbarui.");
      return;
    }

    const recipe = {
      id: existingRecipe?.id ?? Math.max(0, ...appData.recipes.map(item => Number(item.id) || 0)) + 1,
      name,
      category,
      description: String(formData.get("description") || "").trim(),
      ingredients: String(formData.get("ingredients") || "")
        .split(/\r?\n/)
        .map(ingredient => ingredient.trim())
        .filter(Boolean),
      time,
      favorite: existingRecipe?.favorite ?? false,
      ...(existingRecipe?.steps ? { steps: existingRecipe.steps } : {})
    };
    const nextData = {
      categories: [...appData.categories],
      recipes: existingRecipe
        ? appData.recipes.map(item => item.id === existingRecipe.id ? recipe : item)
        : [recipe, ...appData.recipes]
    };

    if (saveData(nextData)) {
      closeRecipeForm();
      render();
    }
  });

  recipeList.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || !recipeList.contains(button)) return;

    if (button.dataset.ingredientEdit !== undefined || button.dataset.ingredientDelete !== undefined) {
      const recipeId = Number(button.dataset.ingredientEdit ?? button.dataset.ingredientDelete);
      const recipe = appData.recipes.find(item => item.id === recipeId);
      const ingredients = Array.isArray(recipe?.ingredients) ? [...recipe.ingredients] : [];
      const index = Number(button.dataset.ingredientIndex);
      if (!recipe || !Number.isInteger(index) || index < 0 || index >= ingredients.length) {
        renderRecipes();
        alert("Bahan tidak ditemukan. Daftar telah diperbarui.");
        return;
      }

      if (button.dataset.ingredientEdit !== undefined) {
        const value = prompt("Ubah nama bahan:", ingredients[index]);
        if (value === null) return;
        const updatedIngredient = value.trim();
        if (!updatedIngredient) {
          alert("Nama bahan tidak boleh kosong.");
          return;
        }
        ingredients[index] = updatedIngredient;
      } else {
        if (!confirm(`Hapus bahan \"${ingredients[index]}\" dari resep \"${recipe.name}\"?`)) return;
        ingredients.splice(index, 1);
      }

      saveRecipeIngredients(recipe.id, ingredients);
      return;
    }

    if (button.dataset.recipeFavorite !== undefined) {
      const id = Number(button.dataset.recipeFavorite);
      const recipe = appData.recipes.find(item => item.id === id);
      if (!recipe) {
        renderRecipes();
        alert("Resep tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      const nextData = {
        ...appData,
        recipes: appData.recipes.map(item => item.id === id
          ? { ...item, favorite: item.favorite !== true }
          : item)
      };
      if (saveData(nextData)) renderRecipes();
      return;
    }

    if (button.dataset.recipeEdit !== undefined) {
      const recipe = appData.recipes.find(item => item.id === Number(button.dataset.recipeEdit));
      if (!recipe) {
        renderRecipes();
        alert("Resep tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      editingRecipeId = recipe.id;
      recipeFormPanel.hidden = false;
      recipeIdInput.value = String(recipe.id);
      recipeNameInput.value = recipe.name;
      recipeCategory.value = recipe.category;
      recipeDescriptionInput.value = recipe.description || "";
      recipeIngredientsInput.value = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join("\n")
        : "";
      recipeTimeInput.value = String(recipe.time || 30);
      recipeSubmit.textContent = "Simpan perubahan";
      cancelRecipeEdit.hidden = false;
      recipeNameInput.focus();
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
        if (editingRecipeId === id) closeRecipeForm();
        renderRecipes();
      }
    }
  });

  recipeList.addEventListener("submit", event => {
    const form = event.target.closest("[data-ingredient-add]");
    if (!form || !recipeList.contains(form)) return;
    event.preventDefault();

    const recipeId = Number(form.dataset.ingredientAdd);
    const recipe = appData.recipes.find(item => item.id === recipeId);
    const value = new FormData(form).get("ingredient");
    const ingredient = typeof value === "string" ? value.trim() : "";
    if (!recipe || !ingredient) return;

    const ingredients = Array.isArray(recipe.ingredients) ? [...recipe.ingredients] : [];
    ingredients.push(ingredient);
    saveRecipeIngredients(recipe.id, ingredients);
  });

  cancelRecipeEdit.addEventListener("click", closeRecipeForm);

  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    try {
      appData = loadData();
      closeRecipeForm();
      render();
    } catch (error) {
      showLoadError(error);
    }
  });
})();

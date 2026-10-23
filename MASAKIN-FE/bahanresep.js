(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const recipeSelect = document.getElementById("recipe-select");
  const ingredientForm = document.getElementById("ingredient-form");
  const ingredientInput = document.getElementById("ingredient-name");
  const ingredientSubmit = document.getElementById("ingredient-submit");
  const cancelIngredientEdit = document.getElementById("cancel-ingredient-edit");
  const ingredientStatus = document.getElementById("ingredient-status");
  const ingredientList = document.getElementById("ingredient-list");

  if (
    !recipeSelect || !ingredientForm || !ingredientInput || !ingredientSubmit ||
    !cancelIngredientEdit || !ingredientStatus || !ingredientList
  ) {
    throw new Error("Elemen pengelolaan bahan tidak ditemukan di bahanresep.html.");
  }

  let appData;
  let editingIngredientIndex = null;

  function loadData() {
    let saved;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Data resep gagal dibaca dari localStorage:", error);
      throw new Error("Data resep tidak dapat dibaca dari browser.");
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
      throw new Error("Data MASAKin tidak valid. Data tersimpan tidak diubah.");
    }
  }

  function saveData(nextData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      appData = nextData;
      return true;
    } catch (error) {
      console.error("Perubahan bahan resep gagal disimpan:", error);
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

  function ingredientLabel(ingredient) {
    if (typeof ingredient === "string") return ingredient.trim();
    if (!ingredient || typeof ingredient !== "object") return "";
    const quantity = String(ingredient.quantity || "").trim();
    const unit = String(ingredient.unit || "").trim();
    const name = String(ingredient.name || ingredient.ingredient || "").trim();
    return [quantity, unit, name].filter(Boolean).join(" ");
  }

  function selectedRecipe() {
    return appData.recipes.find(recipe => String(recipe.id) === recipeSelect.value);
  }

  function selectedIngredients(recipe) {
    return Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map(ingredientLabel).filter(Boolean)
      : [];
  }

  function resetForm() {
    ingredientInput.value = "";
    editingIngredientIndex = null;
    ingredientSubmit.textContent = "Tambah bahan";
    cancelIngredientEdit.hidden = true;
  }

  function renderIngredients() {
    const recipe = selectedRecipe();
    if (!recipe) {
      ingredientStatus.textContent = "";
      ingredientList.innerHTML = `<li class="empty-state">Belum ada resep. Tambahkan resep terlebih dahulu sebelum mengelola bahan.</li>`;
      return;
    }

    const ingredients = selectedIngredients(recipe);
    ingredientStatus.textContent = `${ingredients.length} bahan untuk resep "${recipe.name}".`;
    ingredientList.innerHTML = ingredients.length
      ? ingredients.map((ingredient, index) => `
          <li class="recipe-item">
            <div class="recipe-details">
              <strong>Bahan ${index + 1}</strong>
              <p>${escapeHTML(ingredient)}</p>
            </div>
            <div class="item-actions">
              <button type="button" data-ingredient-edit="${index}">Ubah</button>
              <button class="secondary" type="button" data-ingredient-delete="${index}">Hapus</button>
            </div>
          </li>
        `).join("")
      : `<li class="empty-state">Belum ada bahan untuk resep ini. Tambahkan bahan beserta takarannya di atas.</li>`;
  }

  function renderRecipes() {
    const previousRecipeId = recipeSelect.value;
    recipeSelect.replaceChildren(...appData.recipes.map(recipe =>
      new Option(recipe.name || "Resep tanpa nama", String(recipe.id))
    ));
    recipeSelect.disabled = appData.recipes.length === 0;
    ingredientInput.disabled = appData.recipes.length === 0;
    ingredientSubmit.disabled = appData.recipes.length === 0;

    if (appData.recipes.some(recipe => String(recipe.id) === previousRecipeId)) {
      recipeSelect.value = previousRecipeId;
    }
    if (!appData.recipes.length) {
      recipeSelect.add(new Option("Tambahkan resep terlebih dahulu", ""));
    }
    renderIngredients();
  }

  function showLoadError(error) {
    console.error(error);
    ingredientForm.querySelectorAll("select, input, button").forEach(element => {
      element.disabled = true;
    });
    ingredientStatus.textContent = error.message;
    ingredientList.replaceChildren();
  }

  try {
    appData = loadData();
    renderRecipes();
  } catch (error) {
    showLoadError(error);
    return;
  }

  recipeSelect.addEventListener("change", () => {
    resetForm();
    renderIngredients();
  });

  ingredientForm.addEventListener("submit", event => {
    event.preventDefault();
    const recipe = selectedRecipe();
    if (!recipe) {
      alert("Pilih resep terlebih dahulu.");
      return;
    }

    const name = ingredientInput.value.trim();
    if (!name) {
      ingredientInput.focus();
      return;
    }

    const ingredients = selectedIngredients(recipe);
    const duplicateIndex = ingredients.findIndex((ingredient, index) =>
      index !== editingIngredientIndex &&
      ingredient.toLocaleLowerCase("id") === name.toLocaleLowerCase("id")
    );
    if (duplicateIndex !== -1) {
      alert("Bahan tersebut sudah ada di resep ini.");
      ingredientInput.focus();
      return;
    }

    if (editingIngredientIndex !== null) {
      if (editingIngredientIndex < 0 || editingIngredientIndex >= ingredients.length) {
        resetForm();
        renderIngredients();
        alert("Bahan yang akan diubah tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      ingredients[editingIngredientIndex] = name;
    } else {
      ingredients.push(name);
    }

    const nextData = {
      ...appData,
      recipes: appData.recipes.map(item =>
        item.id === recipe.id ? { ...item, ingredients } : item
      )
    };
    if (saveData(nextData)) {
      resetForm();
      renderIngredients();
    }
  });

  ingredientList.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || !ingredientList.contains(button)) return;

    const recipe = selectedRecipe();
    if (!recipe) return;
    const ingredients = selectedIngredients(recipe);

    if (button.dataset.ingredientEdit !== undefined) {
      const index = Number(button.dataset.ingredientEdit);
      if (!Number.isInteger(index) || index < 0 || index >= ingredients.length) {
        renderIngredients();
        alert("Bahan tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      editingIngredientIndex = index;
      ingredientInput.value = ingredients[index];
      ingredientSubmit.textContent = "Simpan perubahan";
      cancelIngredientEdit.hidden = false;
      ingredientInput.focus();
      return;
    }

    if (button.dataset.ingredientDelete !== undefined) {
      const index = Number(button.dataset.ingredientDelete);
      if (!Number.isInteger(index) || index < 0 || index >= ingredients.length) {
        renderIngredients();
        alert("Bahan tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      if (!confirm(`Hapus bahan "${ingredients[index]}" dari resep "${recipe.name}"?`)) return;

      const nextData = {
        ...appData,
        recipes: appData.recipes.map(item =>
          item.id === recipe.id
            ? { ...item, ingredients: ingredients.filter((_, ingredientIndex) => ingredientIndex !== index) }
            : item
        )
      };
      if (saveData(nextData)) {
        if (editingIngredientIndex === index) resetForm();
        else if (editingIngredientIndex !== null && editingIngredientIndex > index) {
          editingIngredientIndex -= 1;
        }
        renderIngredients();
      }
    }
  });

  cancelIngredientEdit.addEventListener("click", resetForm);

  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    try {
      appData = loadData();
      resetForm();
      renderRecipes();
    } catch (error) {
      showLoadError(error);
    }
  });
})();

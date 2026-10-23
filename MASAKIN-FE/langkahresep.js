(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const recipeSelect = document.getElementById("recipe-select");
  const stepForm = document.getElementById("step-form");
  const stepInput = document.getElementById("step-description");
  const stepSubmit = document.getElementById("step-submit");
  const cancelStepEdit = document.getElementById("cancel-step-edit");
  const stepList = document.getElementById("step-list");

  if (!recipeSelect || !stepForm || !stepInput || !stepSubmit ||
    !cancelStepEdit || !stepList) {
    throw new Error("Elemen pengelolaan langkah resep tidak ditemukan di langkahresep.html.");
  }

  let appData;
  let editingStepIndex = null;

  function loadData() {
    let saved;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Data MASAKin gagal dibaca dari localStorage:", error);
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
      console.error("Perubahan langkah resep gagal disimpan:", error);
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

  function getSelectedRecipe() {
    return appData.recipes.find(recipe => String(recipe.id) === recipeSelect.value);
  }

  function getSteps(recipe) {
    return Array.isArray(recipe.steps) ? recipe.steps : [];
  }

  function resetStepForm() {
    stepInput.value = "";
    editingStepIndex = null;
    stepSubmit.textContent = "Tambah langkah";
    cancelStepEdit.hidden = true;
  }

  function renderRecipes() {
    const previousRecipeId = recipeSelect.value;
    recipeSelect.replaceChildren(...appData.recipes.map(recipe =>
      new Option(recipe.name, String(recipe.id))
    ));
    recipeSelect.disabled = appData.recipes.length === 0;
    stepSubmit.disabled = appData.recipes.length === 0;

    if (appData.recipes.some(recipe => String(recipe.id) === previousRecipeId)) {
      recipeSelect.value = previousRecipeId;
    }
    if (!appData.recipes.length) {
      recipeSelect.add(new Option("Tambahkan resep terlebih dahulu", ""));
    }
    renderSteps();
  }

  function renderSteps() {
    const recipe = getSelectedRecipe();
    const steps = recipe ? getSteps(recipe) : [];

    if (!recipe) {
      stepList.innerHTML = `<li class="empty-state">Belum ada resep. Tambahkan resep terlebih dahulu.</li>`;
      return;
    }
    if (!steps.length) {
      stepList.innerHTML = `<li class="empty-state">Belum ada langkah untuk ${escapeHTML(recipe.name)}.</li>`;
      return;
    }

    stepList.innerHTML = steps.map((step, index) => `
      <li class="recipe-item">
        <div class="recipe-details">
          <strong>Langkah ${index + 1}</strong>
          <p>${escapeHTML(step)}</p>
        </div>
        <div class="item-actions">
          <button type="button" data-step-edit="${index}">Ubah</button>
          <button class="secondary" type="button" data-step-delete="${index}">Hapus</button>
        </div>
      </li>
    `).join("");
  }

  function showLoadError(error) {
    console.error(error);
    stepForm.querySelectorAll("select, textarea, button").forEach(element => {
      element.disabled = true;
    });
    stepList.innerHTML = `<li class="empty-state">${escapeHTML(error.message)}</li>`;
  }

  try {
    appData = loadData();
    renderRecipes();
  } catch (error) {
    showLoadError(error);
    return;
  }

  recipeSelect.addEventListener("change", () => {
    resetStepForm();
    renderSteps();
  });

  stepForm.addEventListener("submit", event => {
    event.preventDefault();
    const recipe = getSelectedRecipe();
    if (!recipe) {
      alert("Pilih resep terlebih dahulu.");
      return;
    }

    const text = stepInput.value.trim();
    if (!text) {
      stepInput.focus();
      return;
    }

    const steps = [...getSteps(recipe)];
    if (editingStepIndex !== null) {
      if (editingStepIndex >= steps.length) {
        resetStepForm();
        renderSteps();
        alert("Langkah yang akan diubah tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      steps[editingStepIndex] = text;
    } else {
      steps.push(text);
    }

    const nextData = {
      ...appData,
      recipes: appData.recipes.map(item =>
        item.id === recipe.id ? { ...item, steps } : item
      )
    };
    if (saveData(nextData)) {
      resetStepForm();
      renderSteps();
    }
  });

  stepList.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || !stepList.contains(button)) return;

    const recipe = getSelectedRecipe();
    if (!recipe) return;
    const steps = getSteps(recipe);

    if (button.dataset.stepEdit !== undefined) {
      const index = Number(button.dataset.stepEdit);
      if (!Number.isInteger(index) || index < 0 || index >= steps.length) {
        renderSteps();
        alert("Langkah tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      editingStepIndex = index;
      stepInput.value = steps[index];
      stepSubmit.textContent = "Simpan perubahan";
      cancelStepEdit.hidden = false;
      stepInput.focus();
      return;
    }

    if (button.dataset.stepDelete !== undefined) {
      const index = Number(button.dataset.stepDelete);
      if (!Number.isInteger(index) || index < 0 || index >= steps.length) {
        renderSteps();
        alert("Langkah tidak ditemukan. Daftar telah diperbarui.");
        return;
      }
      if (!confirm(`Hapus langkah ${index + 1} dari resep "${recipe.name}"?`)) return;

      const nextData = {
        ...appData,
        recipes: appData.recipes.map(item =>
          item.id === recipe.id
            ? { ...item, steps: steps.filter((_, stepIndex) => stepIndex !== index) }
            : item
        )
      };
      if (saveData(nextData)) {
        if (editingStepIndex === index) resetStepForm();
        else if (editingStepIndex !== null && editingStepIndex > index) editingStepIndex -= 1;
        renderSteps();
      }
    }
  });

  cancelStepEdit.addEventListener("click", resetStepForm);

  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    try {
      appData = loadData();
      resetStepForm();
      renderRecipes();
    } catch (error) {
      showLoadError(error);
    }
  });
})();

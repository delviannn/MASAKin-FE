(() => {
  "use strict";

  const KEY = "masakin_mahasiswa1_v1";
  const DEFAULT_CATEGORIES = ["Masakan Utama", "Camilan", "Sayuran", "Minuman"];
  const form = document.getElementById("recipe-form");
  const panel = document.getElementById("recipe-form-panel");
  const list = document.getElementById("recipe-list");
  const category = document.getElementById("recipe-category");
  const categoryManagement = document.getElementById("category-management");
  const categoryForm = document.getElementById("category-form");
  const ingredientList = document.getElementById("ingredient-list");
  const stepList = document.getElementById("step-list");
  const title = document.getElementById("recipe-form-heading");
  const status = document.getElementById("recipe-status");
  let data;
  let editingId = null;
  let editingCategory = null;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const parseLines = value => String(value || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  function load() {
    const saved = localStorage.getItem(KEY);
    if (!saved) return { categories: [...DEFAULT_CATEGORIES], recipes: [] };
    const parsed = JSON.parse(saved);
    if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.recipes) ||
      parsed.recipes.some(recipe => !recipe || typeof recipe !== "object") ||
      parsed.categories.some(item => typeof item !== "string")) {
      throw new Error("Data resep tidak valid.");
    }
    return parsed;
  }

  function save(next) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      data = next;
      return true;
    } catch (error) {
      console.error("Perubahan MASAKin gagal disimpan:", error);
      showMessage("Perubahan gagal disimpan. Periksa ruang penyimpanan browser.");
      return false;
    }
  }

  function showMessage(message) {
    status.textContent = message;
  }

  function renderCategories(selected = category.value) {
    category.replaceChildren(...data.categories.map(item => new Option(item, item)));
    if (data.categories.includes(selected)) category.value = selected;
    renderCategoryManagement();
  }

  function openCategoryForm(name = null) {
    editingCategory = name;
    $("category-name").value = name || "";
    $("category-submit").textContent = name ? "Simpan perubahan" : "Simpan kategori";
    categoryForm.hidden = false;
    $("category-name").focus();
  }

  function renderCategoryManagement() {
    categoryManagement.replaceChildren();
    if (!data.categories.length) {
      categoryManagement.textContent = "Belum ada kategori. Tambahkan kategori terlebih dahulu.";
      return;
    }
    data.categories.forEach(name => {
      const row = document.createElement("div");
      row.className = "category-management-row";
      const label = document.createElement("span");
      label.textContent = `${name} (${data.recipes.filter(recipe => recipe.category === name).length} resep)`;
      const renameButton = document.createElement("button");
      renameButton.className = "btn btn-outline-secondary button button-secondary";
      renameButton.type = "button";
      renameButton.dataset.renameCategory = name;
      renameButton.textContent = "Ubah";
      const deleteButton = document.createElement("button");
      deleteButton.className = "btn btn-outline-secondary button button-secondary";
      deleteButton.type = "button";
      deleteButton.dataset.deleteCategory = name;
      deleteButton.textContent = "Hapus";
      row.append(label, renameButton, deleteButton);
      categoryManagement.append(row);
    });
  }

  function readIngredient(item) {
    if (typeof item === "string") {
      const match = item.trim().match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?)\s+(\S+)\s+(.+)$/);
      return match
        ? { name: match[3], quantity: match[1], unit: match[2] }
        : { name: item.trim(), quantity: "secukupnya", unit: "" };
    }
    return {
      name: String(item?.name || item?.ingredient || ""),
      quantity: String(item?.quantity ?? item?.amount ?? ""),
      unit: String(item?.unit || "")
    };
  }

  function createInput(label, value, placeholder, required, maxLength) {
    const wrapper = document.createElement("label");
    wrapper.className = "item-editor-field";
    wrapper.append(document.createTextNode(label));
    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control";
    input.value = value;
    input.placeholder = placeholder;
    input.maxLength = maxLength;
    input.required = required;
    wrapper.append(input);
    return { wrapper, input };
  }

  function renderIngredients(ingredients = []) {
    ingredientList.replaceChildren();
    ingredients.forEach(item => {
      const ingredient = readIngredient(item);
      const row = document.createElement("div");
      row.className = "item-editor-row ingredient-row";
      const name = createInput("Nama bahan", ingredient.name, "Contoh: telur", true, 80);
      name.input.dataset.ingredientName = "";
      const quantity = createInput("Jumlah", ingredient.quantity, "Contoh: 2", true, 40);
      quantity.input.dataset.ingredientQuantity = "";
      const unit = createInput("Satuan", ingredient.unit, "Contoh: butir", false, 30);
      unit.input.dataset.ingredientUnit = "";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button button-secondary item-remove";
      remove.dataset.removeIngredient = "";
      remove.setAttribute("aria-label", `Hapus bahan ${ingredient.name || "baru"}`);
      remove.textContent = "Hapus";
      row.append(name.wrapper, quantity.wrapper, unit.wrapper, remove);
      ingredientList.append(row);
    });
  }

  function renderSteps(steps = []) {
    stepList.replaceChildren();
    steps.forEach((step, index) => {
      const row = document.createElement("li");
      row.className = "item-editor-row step-row";
      const instruction = createInput(`Langkah ${index + 1}`, String(step), "Tulis instruksi memasak", true, 240);
      instruction.input.dataset.stepInstruction = "";
      const actions = document.createElement("div");
      actions.className = "step-actions";
      const up = document.createElement("button");
      up.type = "button";
      up.className = "btn btn-outline-secondary button button-secondary";
      up.dataset.moveStep = "-1";
      up.disabled = index === 0;
      up.setAttribute("aria-label", `Pindahkan langkah ${index + 1} ke atas`);
      up.textContent = "↑";
      const down = document.createElement("button");
      down.type = "button";
      down.className = "btn btn-outline-secondary button button-secondary";
      down.dataset.moveStep = "1";
      down.disabled = index === steps.length - 1;
      down.setAttribute("aria-label", `Pindahkan langkah ${index + 1} ke bawah`);
      down.textContent = "↓";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-outline-secondary button button-secondary";
      remove.dataset.removeStep = "";
      remove.setAttribute("aria-label", `Hapus langkah ${index + 1}`);
      remove.textContent = "Hapus";
      actions.append(up, down, remove);
      row.append(instruction.wrapper, actions);
      stepList.append(row);
    });
  }

  function ingredientValues() {
    return [...ingredientList.querySelectorAll(".ingredient-row")].map(row => ({
      name: row.querySelector("[data-ingredient-name]").value.trim(),
      quantity: row.querySelector("[data-ingredient-quantity]").value.trim(),
      unit: row.querySelector("[data-ingredient-unit]").value.trim()
    }));
  }

  function stepValues() {
    return [...stepList.querySelectorAll("[data-step-instruction]")]
      .map(input => input.value.trim());
  }

  function scaleQuantity(quantity, factor) {
    const value = String(quantity || "").trim();
    const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    const fraction = value.match(/^(\d+)\/(\d+)$/);
    const decimal = value.match(/^\d+(?:[.,]\d+)?$/);
    let amount;
    if (mixed && Number(mixed[3])) amount = Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
    else if (fraction && Number(fraction[2])) amount = Number(fraction[1]) / Number(fraction[2]);
    else if (decimal) amount = Number(value.replace(",", "."));
    else return value || "secukupnya";
    return (Math.round(amount * factor * 100) / 100).toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }

  function updatePortionPanel(recipe, servings) {
    const panel = list.querySelector(`[data-portion-panel="${Number(recipe.id)}"]`);
    if (!panel) return;
    const original = Math.max(1, Number(recipe.servings) || 1);
    const target = Math.min(100, Math.max(1, Number(servings) || original));
    panel.querySelector("[data-serving-value]").value = target;
    panel.querySelector("[data-portion-ingredients]").innerHTML = (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
      .map(item => {
        const ingredient = readIngredient(item);
        return `<li><span>${esc(ingredient.name || "Bahan")}</span><strong>${esc([scaleQuantity(ingredient.quantity, target / original), ingredient.unit].filter(Boolean).join(" "))}</strong></li>`;
      }).join("");
  }

  function render() {
    renderCategories();
    $("recipe-count").textContent = `${data.recipes.length} resep`;
    if (!data.recipes.length) {
      list.innerHTML = '<div class="empty-state">Belum ada resep. Tekan “Tambah resep” untuk menambahkan resep pertama.</div>';
      return;
    }
    list.innerHTML = data.recipes.map(recipe => {
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
      return `<article class="card recipe-card"><div class="recipe-image image-rice" aria-hidden="true"></div><div class="recipe-card-body"><span class="badge rounded-pill bg-light text-secondary recipe-category">${esc(recipe.category || "Tanpa kategori")}</span><strong class="recipe-title">${esc(recipe.name)}</strong><span class="recipe-description">${esc(recipe.description || "Belum ada deskripsi.")}</span><span class="recipe-meta"><span>◷ ${Number(recipe.time) || 0} menit</span><span>·</span><span>${Number(recipe.servings) || 1} porsi</span></span><span class="recipe-description recipe-details-preview">${ingredients.length} bahan · ${steps.length} langkah</span></div><div class="recipe-card-actions"><button class="btn btn-outline-secondary recipe-favorite-button" type="button" data-favorite="${Number(recipe.id)}" aria-pressed="${recipe.favorite === true}">${recipe.favorite === true ? "★ Favorit" : "☆ Tambah favorit"}</button><button class="btn btn-outline-secondary button button-secondary" type="button" data-portions="${Number(recipe.id)}" aria-expanded="false" aria-controls="portion-panel-${Number(recipe.id)}">Atur porsi &amp; bahan</button><button class="btn btn-outline-secondary button button-secondary" type="button" data-edit="${Number(recipe.id)}">Ubah resep</button><button class="btn btn-outline-secondary button button-secondary" type="button" data-delete="${Number(recipe.id)}">Hapus</button></div><section id="portion-panel-${Number(recipe.id)}" class="portion-panel" data-portion-panel="${Number(recipe.id)}" hidden><h3>Sesuaikan porsi</h3><label for="portion-value-${Number(recipe.id)}">Porsi yang diinginkan</label><div class="portion-control"><button type="button" data-serving-step="-1" aria-label="Kurangi porsi">−</button><input id="portion-value-${Number(recipe.id)}" class="form-control" type="number" min="1" max="100" value="${Number(recipe.servings) || 1}" data-serving-value aria-label="Jumlah porsi"><button type="button" data-serving-step="1" aria-label="Tambah porsi">+</button></div><p class="portion-note">Takaran dihitung dari resep asli (${Number(recipe.servings) || 1} porsi).</p><ul data-portion-ingredients>${ingredients.map(item => { const ingredient = readIngredient(item); return `<li><span>${esc(ingredient.name || "Bahan")}</span><strong>${esc([ingredient.quantity || "secukupnya", ingredient.unit].filter(Boolean).join(" "))}</strong></li>`; }).join("")}</ul></section></article>`;
    }).join("");
  }

  function reset() {
    form.reset();
    editingId = null;
    $("recipe-id").value = "";
    $("recipe-servings").value = "2";
    $("recipe-time").value = "30";
    title.textContent = "Tambah resep";
    $("recipe-submit").textContent = "Simpan resep";
    renderIngredients();
    renderSteps();
  }

  function openForm(recipe) {
    reset();
    if (recipe) {
      editingId = recipe.id;
      $("recipe-id").value = recipe.id;
      $("recipe-name").value = recipe.name || "";
      renderCategories(recipe.category);
      $("recipe-description").value = recipe.description || "";
      $("recipe-servings").value = recipe.servings || 2;
      $("recipe-time").value = recipe.time || 30;
      renderIngredients(Array.isArray(recipe.ingredients) ? recipe.ingredients : []);
      renderSteps(Array.isArray(recipe.steps) ? recipe.steps : []);
      title.textContent = "Ubah resep";
      $("recipe-submit").textContent = "Simpan perubahan";
    } else {
      renderCategories(data.categories[0]);
      renderIngredients([{ name: "", quantity: "", unit: "" }]);
      renderSteps([""]);
    }
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    $("recipe-name").focus();
  }

  try {
    data = load();
    render();
  } catch (error) {
    console.error("Data MASAKin gagal dimuat:", error);
    list.textContent = error.message;
    $("add-recipe").disabled = true;
    return;
  }

  $("add-recipe").addEventListener("click", () => openForm());
  $("cancel-recipe-edit").addEventListener("click", () => {
    panel.hidden = true;
    reset();
  });

  $("add-category").addEventListener("click", () => openCategoryForm());
  $("cancel-category").addEventListener("click", () => {
    categoryForm.hidden = true;
    editingCategory = null;
    $("category-name").value = "";
  });

  $("category-submit").addEventListener("click", () => {
    if (!$("category-name").reportValidity()) return;
    const name = $("category-name").value.trim();
    if (!name || name.length > 40) {
      showMessage("Nama kategori harus berisi 1–40 karakter.");
      return;
    }
    if (data.categories.some(item =>
      item !== editingCategory && item.toLocaleLowerCase("id") === name.toLocaleLowerCase("id")
    )) {
      showMessage("Kategori tersebut sudah tersedia.");
      return;
    }

    if (editingCategory) {
      const oldName = editingCategory;
      const next = {
        categories: data.categories.map(item => item === oldName ? name : item),
        recipes: data.recipes.map(recipe => recipe.category === oldName ? { ...recipe, category: name } : recipe)
      };
      if (save(next)) {
        categoryForm.hidden = true;
        editingCategory = null;
        render();
        category.value = name;
        showMessage(`Kategori “${oldName}” berhasil diubah menjadi “${name}”.`);
      }
      return;
    }

    if (save({ ...data, categories: [...data.categories, name] })) {
      categoryForm.hidden = true;
      renderCategories(name);
      showMessage(`Kategori “${name}” berhasil ditambahkan.`);
    }
  });

  $("toggle-categories").addEventListener("click", event => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    categoryManagement.hidden = expanded;
  });

  categoryManagement.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const oldName = button.dataset.renameCategory ?? button.dataset.deleteCategory;
    if (!oldName) return;
    if (button.dataset.renameCategory !== undefined) {
      openCategoryForm(oldName);
      return;
    }
    const uses = data.recipes.some(recipe => recipe.category === oldName);
    if (uses) {
      showMessage(`Kategori “${oldName}” masih digunakan resep. Ubah kategorinya sebelum menghapus.`);
      return;
    }
    if (!confirm(`Hapus kategori “${oldName}”?`)) return;
    const next = { ...data, categories: data.categories.filter(name => name !== oldName) };
    if (save(next)) {
      render();
      showMessage(`Kategori “${oldName}” berhasil dihapus.`);
    }
  });

  $("add-ingredient").addEventListener("click", () => {
    renderIngredients([...ingredientValues(), { name: "", quantity: "", unit: "" }]);
    ingredientList.querySelector(".ingredient-row:last-child [data-ingredient-name]").focus();
  });

  ingredientList.addEventListener("click", event => {
    if (!event.target.closest("[data-remove-ingredient]")) return;
    const values = ingredientValues();
    const index = [...ingredientList.querySelectorAll(".ingredient-row")].indexOf(event.target.closest(".ingredient-row"));
    values.splice(index, 1);
    renderIngredients(values);
    showMessage("Bahan dihapus dari formulir. Simpan resep untuk menerapkan perubahan.");
  });

  $("add-step").addEventListener("click", () => {
    renderSteps([...stepValues(), ""]);
    stepList.querySelector(".step-row:last-child [data-step-instruction]").focus();
  });

  stepList.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const rows = [...stepList.querySelectorAll(".step-row")];
    const index = rows.indexOf(button.closest(".step-row"));
    const values = stepValues();
    if (button.dataset.removeStep !== undefined) {
      values.splice(index, 1);
      renderSteps(values);
      showMessage("Langkah dihapus dari formulir. Simpan resep untuk menerapkan perubahan.");
      return;
    }
    if (button.dataset.moveStep !== undefined) {
      const target = index + Number(button.dataset.moveStep);
      if (target < 0 || target >= values.length) return;
      [values[index], values[target]] = [values[target], values[index]];
      renderSteps(values);
      stepList.querySelectorAll("[data-step-instruction]")[target].focus();
    }
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const selectedCategory = String(values.get("category") || "");
    const servings = Number(values.get("servings"));
    const time = Number(values.get("time"));
    const ingredients = ingredientValues();
    const steps = stepValues();
    if (!name || !data.categories.includes(selectedCategory) ||
      !Number.isInteger(servings) || servings < 1 || servings > 20 ||
      !Number.isInteger(time) || time < 1 || time > 1440) {
      showMessage("Periksa nama, kategori, porsi, dan waktu memasak resep.");
      return;
    }
    if (!ingredients.length || ingredients.some(item => !item.name || !item.quantity) || !steps.length || steps.some(step => !step)) {
      showMessage("Tambahkan minimal satu bahan (nama dan jumlah) serta satu langkah memasak.");
      return;
    }
    const previous = data.recipes.find(item => item.id === editingId);
    const recipe = {
      id: previous?.id ?? Math.max(0, ...data.recipes.map(item => Number(item.id) || 0)) + 1,
      name,
      category: selectedCategory,
      description: String(values.get("description") || "").trim(),
      servings,
      time,
      ingredients,
      steps,
      favorite: previous?.favorite === true
    };
    const next = {
      ...data,
      recipes: previous
        ? data.recipes.map(item => item.id === previous.id ? recipe : item)
        : [recipe, ...data.recipes]
    };
    if (save(next)) {
      panel.hidden = true;
      reset();
      render();
      showMessage(`Resep “${name}” berhasil ${previous ? "diperbarui" : "ditambahkan"}.`);
    }
  });

  list.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.portions !== undefined) {
      const recipe = data.recipes.find(item => Number(item.id) === Number(button.dataset.portions));
      const panel = list.querySelector(`[data-portion-panel="${Number(button.dataset.portions)}"]`);
      if (!recipe || !panel) return;
      panel.hidden = !panel.hidden;
      button.setAttribute("aria-expanded", String(!panel.hidden));
      updatePortionPanel(recipe, panel.querySelector("[data-serving-value]").value);
      return;
    }
    if (button.dataset.servingStep !== undefined) {
      const panel = button.closest("[data-portion-panel]");
      const input = panel?.querySelector("[data-serving-value]");
      if (!input) return;
      input.value = Math.min(100, Math.max(1, Number(input.value || 1) + Number(button.dataset.servingStep)));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    const id = Number(button.dataset.edit ?? button.dataset.delete ?? button.dataset.favorite);
    if (button.dataset.edit !== undefined) {
      const recipe = data.recipes.find(item => Number(item.id) === id);
      if (recipe) openForm(recipe);
      return;
    }
    if (button.dataset.favorite !== undefined) {
      const recipe = data.recipes.find(item => Number(item.id) === id);
      const next = {
        ...data,
        recipes: data.recipes.map(item => item.id === id ? { ...item, favorite: item.favorite !== true } : item)
      };
      if (save(next)) {
        render();
        showMessage(`Resep “${recipe?.name || ""}” ${recipe?.favorite === true ? "dihapus dari" : "ditambahkan ke"} favorit.`);
      }
      return;
    }
    if (button.dataset.delete !== undefined) {
      const recipe = data.recipes.find(item => Number(item.id) === id);
      if (!recipe || !confirm(`Hapus resep “${recipe.name}”?`)) return;
      if (save({ ...data, recipes: data.recipes.filter(item => item.id !== id) })) {
        render();
        showMessage(`Resep “${recipe.name}” berhasil dihapus.`);
      }
    }
  });

  list.addEventListener("input", event => {
    const input = event.target.closest("[data-serving-value]");
    if (!input) return;
    const recipeId = Number(input.closest("[data-portion-panel]").dataset.portionPanel);
    const recipe = data.recipes.find(item => Number(item.id) === recipeId);
    if (recipe) updatePortionPanel(recipe, input.value);
  });

  window.addEventListener("storage", event => {
    if (event.key !== KEY) return;
    try {
      data = load();
      render();
      showMessage("Data resep diperbarui dari tab lain.");
    } catch (error) {
      console.error("Data perubahan dari tab lain tidak valid:", error);
      showMessage("Data resep dari tab lain tidak valid dan tidak dapat dimuat.");
    }
  });
})();

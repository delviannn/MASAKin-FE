(() => {
  "use strict";

  const KEY = "masakin_shopping_list_v1";
  const RECIPE_KEY = "masakin_mahasiswa1_v1";
  const recipeSelect = document.getElementById("shopping-recipe");
  const list = document.getElementById("shopping-items");
  const status = document.getElementById("shopping-status");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  let recipes;
  let items;

  function ingredientText(ingredient) {
    if (typeof ingredient === "string") return ingredient.trim();
    if (!ingredient || typeof ingredient !== "object") return "";
    return [
      ingredient.quantity ?? ingredient.amount ?? "",
      ingredient.unit || "",
      ingredient.name || ingredient.ingredient || ""
    ].filter(Boolean).join(" ").trim();
  }

  function render() {
    list.innerHTML = items.length
      ? items.map((item, index) => `<li><input type="checkbox" data-check="${index}" ${item.checked ? "checked" : ""} aria-label="Tandai ${esc(item.name)} selesai"><span>${esc(item.name)}${item.source ? ` <span class="field-hint">· ${esc(item.source)}</span>` : ""}</span><button class="button-secondary" type="button" data-remove="${index}" aria-label="Hapus ${esc(item.name)}">Hapus</button></li>`).join("")
      : '<li class="empty-state">Pilih resep untuk menambahkan bahannya ke daftar.</li>';
  }

  function save(nextItems, message) {
    try {
      localStorage.setItem(KEY, JSON.stringify(nextItems));
      items = nextItems;
      render();
      status.textContent = message;
      return true;
    } catch (error) {
      console.error("Daftar belanja gagal disimpan:", error);
      status.textContent = "Perubahan gagal disimpan. Periksa ruang penyimpanan browser.";
      return false;
    }
  }

  try {
    const recipeData = JSON.parse(localStorage.getItem(RECIPE_KEY) || '{"recipes":[]}');
    if (!recipeData || !Array.isArray(recipeData.recipes)) throw new Error("Data resep tidak valid.");
    recipes = recipeData.recipes;
    const savedItems = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(savedItems)) throw new Error("Format daftar belanja tidak valid.");
    items = savedItems;
  } catch (error) {
    console.error("Daftar belanja gagal dimuat:", error);
    recipes = [];
    items = [];
    status.textContent = "Data daftar belanja tidak dapat dibaca. Periksa data yang tersimpan di browser.";
  }

  recipes.forEach(recipe => recipeSelect.add(new Option(recipe.name, String(recipe.id))));
  recipeSelect.addEventListener("change", () => {
    const recipe = recipes.find(item => String(item.id) === recipeSelect.value);
    if (!recipe) return;
    const nextItems = [...items];
    (recipe.ingredients || []).map(ingredientText).filter(Boolean).forEach(name => {
      if (!nextItems.some(item => item.name.toLocaleLowerCase("id") === name.toLocaleLowerCase("id"))) {
        nextItems.push({ name, source: recipe.name, checked: false });
      }
    });
    recipeSelect.value = "";
    save(nextItems, `Bahan dari resep “${recipe.name}” ditambahkan ke daftar belanja.`);
  });

  document.getElementById("shopping-add-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("shopping-custom");
    const name = input.value.trim();
    if (!name) {
      status.textContent = "Nama item tidak boleh kosong.";
      input.focus();
      return;
    }
    if (save([...items, { name, source: "Tambahan", checked: false }], `“${name}” ditambahkan ke daftar belanja.`)) {
      input.value = "";
    }
  });

  list.addEventListener("change", event => {
    if (event.target.dataset.check === undefined) return;
    const index = Number(event.target.dataset.check);
    const nextItems = items.map((item, itemIndex) => itemIndex === index
      ? { ...item, checked: event.target.checked }
      : item);
    save(nextItems, event.target.checked ? "Item ditandai selesai." : "Tanda selesai dihapus.");
  });

  list.addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const index = Number(button.dataset.remove);
    const removed = items[index];
    save(items.filter((_, itemIndex) => itemIndex !== index), `“${removed?.name || "Item"}” dihapus dari daftar belanja.`);
  });

  document.getElementById("clear-shopping").addEventListener("click", () => {
    if (save([], "Daftar belanja dibersihkan.")) recipeSelect.value = "";
  });

  render();
})();

(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const dialog = document.createElement("dialog");
  dialog.className = "recipe-detail-dialog";
  dialog.setAttribute("aria-labelledby", "recipe-detail-title");
  dialog.innerHTML = `
    <div class="recipe-detail-dialog__header">
      <div>
        <p class="eyebrow">DETAIL RESEP</p>
        <h2 id="recipe-detail-title"></h2>
      </div>
      <button class="recipe-detail-dialog__close" type="button" aria-label="Tutup detail resep">&times;</button>
    </div>
    <p class="recipe-detail-dialog__meta"></p>
    <p class="recipe-detail-dialog__description"></p>
    <div class="recipe-detail-dialog__columns">
      <section>
        <h3>Bahan</h3>
        <ul class="recipe-detail-dialog__ingredients"></ul>
      </section>
      <section>
        <h3>Langkah memasak</h3>
        <ol class="recipe-detail-dialog__steps"></ol>
      </section>
    </div>
    <button class="btn btn-outline-secondary recipe-detail-dialog__favorite" type="button" aria-pressed="false"></button>
    <p class="recipe-detail-dialog__status" role="status" aria-live="polite"></p>
  `;
  document.body.append(dialog);

  const title = dialog.querySelector("#recipe-detail-title");
  const meta = dialog.querySelector(".recipe-detail-dialog__meta");
  const description = dialog.querySelector(".recipe-detail-dialog__description");
  const ingredients = dialog.querySelector(".recipe-detail-dialog__ingredients");
  const steps = dialog.querySelector(".recipe-detail-dialog__steps");
  const favoriteButton = dialog.querySelector(".recipe-detail-dialog__favorite");
  const status = dialog.querySelector(".recipe-detail-dialog__status");
  let selectedRecipeId = null;

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
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : { categories: [], recipes: [] };
    if (!data || !Array.isArray(data.recipes)) {
      throw new Error("Format data resep tidak valid.");
    }
    return data;
  }

  function ingredientText(item) {
    if (typeof item === "string") return item;
    if (!item || typeof item !== "object") return String(item ?? "");
    return [
      item.quantity ?? item.amount ?? "",
      item.unit || "",
      item.name || item.ingredient || ""
    ].filter(Boolean).join(" ");
  }

  function render(recipe) {
    selectedRecipeId = recipe.id;
    title.textContent = recipe.name || "Resep tanpa nama";
    meta.textContent = [
      recipe.category || "Tanpa kategori",
      `${Number(recipe.time) || 0} menit`,
      `${Number(recipe.servings) || 1} porsi`
    ].join(" · ");
    description.textContent = recipe.description || "Belum ada deskripsi.";
    ingredients.innerHTML = Array.isArray(recipe.ingredients) && recipe.ingredients.length
      ? recipe.ingredients.map(item => `<li>${escapeHTML(ingredientText(item))}</li>`).join("")
      : "<li>Bahan belum dicatat.</li>";
    steps.innerHTML = Array.isArray(recipe.steps) && recipe.steps.length
      ? recipe.steps.map(item => `<li>${escapeHTML(item)}</li>`).join("")
      : "<li>Langkah memasak belum dicatat.</li>";
    favoriteButton.setAttribute("aria-pressed", String(recipe.favorite === true));
    favoriteButton.textContent = recipe.favorite === true ? "★ Hapus dari favorit" : "☆ Tambah ke favorit";
    status.textContent = "";
  }

  function openRecipe(recipeId) {
    try {
      const data = loadData();
      const recipe = data.recipes.find(item => String(item.id) === String(recipeId));
      if (!recipe) {
        console.error("Detail resep tidak ditemukan:", recipeId);
        return;
      }
      render(recipe);
      dialog.showModal();
    } catch (error) {
      console.error("Detail resep gagal dimuat:", error);
    }
  }

  function activateCard(card) {
    if (card && !card.contains(document.activeElement)) card.focus();
    openRecipe(card?.dataset.recipeDetail);
  }

  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-recipe-detail]");
    if (!trigger || event.target.closest("button, a, input, select, textarea, label")) return;
    openRecipe(trigger.dataset.recipeDetail);
  });

  document.addEventListener("keydown", event => {
    if (!event.target.matches("[data-recipe-detail]") ||
        !["Enter", " "].includes(event.key) ||
        event.target.matches("button, a, input, select, textarea")) return;
    event.preventDefault();
    activateCard(event.target);
  });

  dialog.querySelector(".recipe-detail-dialog__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });

  favoriteButton.addEventListener("click", () => {
    if (selectedRecipeId === null) return;
    try {
      const data = loadData();
      const recipe = data.recipes.find(item => String(item.id) === String(selectedRecipeId));
      if (!recipe) throw new Error("Resep tidak ditemukan.");
      const favorite = recipe.favorite !== true;
      const next = {
        ...data,
        recipes: data.recipes.map(item => String(item.id) === String(selectedRecipeId)
          ? { ...item, favorite }
          : item)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      render({ ...recipe, favorite });
      document.dispatchEvent(new CustomEvent("masakin:recipes-updated", {
        detail: { recipeId: selectedRecipeId }
      }));
    } catch (error) {
      console.error("Perubahan favorit gagal disimpan:", error);
      status.textContent = "Perubahan favorit gagal disimpan. Periksa penyimpanan browser.";
    }
  });
})();

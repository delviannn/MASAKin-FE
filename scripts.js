const main = document.querySelector("main");
const landingPage = main.innerHTML;
let selectedRecipeId = null;
let editingIngredientIndex = null;
let ingredientSearchTerm = "";

const recipes = {
  "nasi-goreng": {
    name: "Nasi goreng sederhana",
    description: "Resep cepat untuk makan malam.",
    time: "20 menit",
    difficulty: "Mudah",
    ingredients: [
      "1 piring nasi putih",
      "1 butir telur",
      "2 siung bawang putih",
      "2 sendok makan kecap manis"
    ],
    steps: [
      "Cincang bawang putih.",
      "Tumis bawang putih sampai harum.",
      "Masukkan telur, lalu orak-arik.",
      "Masukkan nasi dan kecap, lalu aduk sampai rata."
    ]
  },
  "sup-ayam": {
    name: "Sup ayam",
    description: "Sup hangat dengan sayuran segar.",
    time: "45 menit",
    difficulty: "Sedang",
    ingredients: [
      "250 gram daging ayam",
      "1 buah wortel",
      "1 buah kentang",
      "1 batang daun bawang",
      "750 ml air"
    ],
    steps: [
      "Potong ayam dan sayuran menjadi ukuran kecil.",
      "Rebus ayam sampai matang dan kaldunya keluar.",
      "Masukkan wortel dan kentang, lalu masak sampai empuk.",
      "Tambahkan daun bawang, lalu bumbui sesuai selera."
    ]
  },
  "pisang-goreng": {
    name: "Pisang goreng",
    description: "Camilan manis dan renyah untuk keluarga.",
    time: "15 menit",
    difficulty: "Mudah",
    ingredients: [
      "3 buah pisang",
      "100 gram tepung terigu",
      "1 sendok makan gula",
      "Air secukupnya",
      "Minyak untuk menggoreng"
    ],
    steps: [
      "Campur tepung, gula, dan air sampai menjadi adonan.",
      "Potong pisang sesuai selera.",
      "Celupkan pisang ke dalam adonan.",
      "Goreng sampai kuning keemasan, lalu tiriskan."
    ]
  }
};

function showRecipe(recipe) {
  selectedRecipeId = Object.keys(recipes).find(id => recipes[id] === recipe);
  editingIngredientIndex = null;
  ingredientSearchTerm = "";
  renderRecipeDetail();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function renderRecipeDetail(shouldScrollToTop = true) {
  const recipe = recipes[selectedRecipeId];
  if (!recipe) return;
  const visibleIngredients = recipe.ingredients
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.toLowerCase().includes(ingredientSearchTerm.toLowerCase()));

  main.dataset.view = "detail";
  main.innerHTML = `
    <section class="recipe-detail-page">
      <button class="back-button" type="button" data-back-to-list>
        &larr; Kembali ke daftar resep
      </button>
      <h1>${escapeHtml(recipe.name)}</h1>
      <p class="recipe-info">${escapeHtml(recipe.time)} · ${escapeHtml(recipe.difficulty)}</p>
      <p>${escapeHtml(recipe.description)}</p>

      <div class="detail-columns">
        <section class="detail-panel" id="detail-bahan">
          <h2>Bahan</h2>
          <label class="field-label" for="ingredient-search">Cari bahan</label>
          <input
            class="text-input"
            id="ingredient-search"
            type="search"
            placeholder="Ketik nama bahan"
            value="${escapeHtml(ingredientSearchTerm)}"
            data-ingredient-search
          >
          <ul class="editable-list ingredient-list">
            ${visibleIngredients.length ? visibleIngredients.map(({ item, index }) => {
              if (editingIngredientIndex === index) {
                return `<li class="ingredient-item">
                  <form class="inline-form" data-edit-ingredient="${index}">
                    <input class="text-input" name="ingredient" value="${escapeHtml(item)}" required>
                    <button class="small-button" type="submit">Simpan</button>
                    <button class="small-button" type="button" data-cancel-edit>Batal</button>
                  </form>
                </li>`;
              }
              return `<li class="ingredient-item">
                <span>${escapeHtml(item)}</span>
                <span class="item-actions">
                  <button class="small-button" type="button" data-edit-ingredient="${index}">Edit</button>
                  <button class="small-button" type="button" data-delete-ingredient="${index}">Hapus</button>
                </span>
              </li>`;
            }).join("") : `<li class="empty-result">Bahan tidak ditemukan.</li>`}
          </ul>
          <form class="add-form" data-add-ingredient>
            <label class="field-label" for="new-ingredient">Tambah bahan</label>
            <div class="form-row">
              <input class="text-input" id="new-ingredient" name="ingredient" placeholder="Contoh: 1 sdt garam" required>
              <button class="small-button primary-button" type="submit">Tambah</button>
            </div>
          </form>
        </section>
        <section class="detail-panel" id="detail-langkah">
          <h2>Langkah memasak</h2>
          <ol class="editable-list">
            ${recipe.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
        </section>
      </div>
      <section class="detail-panel detail-summary" id="detail-rekap">
        <h2>Rekapitulasi resep</h2>
        <p><strong>${recipe.ingredients.length}</strong> bahan</p>
        <p><strong>${recipe.steps.length}</strong> langkah memasak</p>
      </section>
    </section>
  `;
  if (shouldScrollToTop) window.scrollTo(0, 0);
}

main.addEventListener("click", event => {
  const recipeButton = event.target.closest("[data-recipe-id]");
  if (recipeButton) {
    const recipe = recipes[recipeButton.dataset.recipeId];
    if (recipe) showRecipe(recipe);
    return;
  }

  if (event.target.closest("[data-back-to-list]")) {
    main.innerHTML = landingPage;
    delete main.dataset.view;
    selectedRecipeId = null;
    window.scrollTo(0, 0);
    return;
  }

  const editButton = event.target.closest("[data-edit-ingredient]");
  if (editButton && editButton.tagName === "BUTTON") {
    editingIngredientIndex = Number(editButton.dataset.editIngredient);
    renderRecipeDetail(false);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-ingredient]");
  if (deleteButton) {
    recipes[selectedRecipeId].ingredients.splice(Number(deleteButton.dataset.deleteIngredient), 1);
    editingIngredientIndex = null;
    renderRecipeDetail();
    return;
  }

  if (event.target.closest("[data-cancel-edit]")) {
    editingIngredientIndex = null;
    renderRecipeDetail();
  }
});

document.querySelector(".sidebar nav").addEventListener("click", event => {
  const sectionLink = event.target.closest("[data-section]");
  if (main.dataset.view === "detail" && sectionLink) {
    event.preventDefault();
    document.getElementById(sectionLink.dataset.section).scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (main.dataset.view === "detail" && event.target.closest('a[href^="#"]')) {
    main.innerHTML = landingPage;
    delete main.dataset.view;
    selectedRecipeId = null;
  }
});

main.addEventListener("submit", event => {
  const addForm = event.target.closest("[data-add-ingredient]");
  if (addForm) {
    event.preventDefault();
    const value = new FormData(addForm).get("ingredient");
    if (typeof value !== "string") return;
    const ingredient = value.trim();
    if (!ingredient) return;
    recipes[selectedRecipeId].ingredients.push(ingredient);
    ingredientSearchTerm = "";
    renderRecipeDetail();
    return;
  }

  const editForm = event.target.closest("form[data-edit-ingredient]");
  if (editForm) {
    event.preventDefault();
    const index = Number(editForm.dataset.editIngredient);
    const value = new FormData(editForm).get("ingredient");
    if (typeof value !== "string") return;
    const ingredient = value.trim();
    if (!ingredient) return;
    recipes[selectedRecipeId].ingredients[index] = ingredient;
    editingIngredientIndex = null;
    renderRecipeDetail(false);
  }
});

main.addEventListener("input", event => {
  if (event.target.matches("[data-ingredient-search]")) {
    ingredientSearchTerm = event.target.value;
    const cursorPosition = event.target.selectionStart;
    renderRecipeDetail(false);
    const searchInput = main.querySelector("[data-ingredient-search]");
    searchInput.focus();
    searchInput.setSelectionRange(cursorPosition, cursorPosition);
  }
});

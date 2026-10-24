(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const categorySelect = document.getElementById("recipe-category");

  if (!categorySelect) {
    throw new Error("Dropdown kategori tidak ditemukan di resep.html.");
  }

  function loadCategories() {
    let savedData;
    try {
      savedData = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Kategori MASAKin gagal dibaca dari localStorage:", error);
      return null;
    }

    if (!savedData) return null;

    try {
      const data = JSON.parse(savedData);
      if (!data || !Array.isArray(data.categories)) {
        throw new Error("Format daftar kategori MASAKin tidak sesuai.");
      }
      return data.categories.filter(category =>
        typeof category === "string" && category.trim()
      );
    } catch (error) {
      console.error("Daftar kategori MASAKin tidak valid:", error);
      return null;
    }
  }

  const categories = loadCategories();
  if (!categories) return;

  if (categories.length === 0) {
    categorySelect.replaceChildren(new Option("Tambahkan kategori terlebih dahulu", ""));
    categorySelect.disabled = true;
    return;
  }

  const previousValue = categorySelect.value;
  categorySelect.replaceChildren(...categories.map(category =>
    new Option(category, category)
  ));
  if (categories.includes(previousValue)) {
    categorySelect.value = previousValue;
  }
})();

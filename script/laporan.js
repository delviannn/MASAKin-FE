(() => {
  const data = JSON.parse(localStorage.getItem("masakin_mahasiswa1_v1") || '{"categories":[],"recipes":[]}');
  const recipes = Array.isArray(data.recipes) ? data.recipes : [];
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const favorites = recipes.filter(recipe => recipe.favorite === true);
  document.getElementById("report-recipes").textContent = String(recipes.length).padStart(2,"0");
  document.getElementById("report-favorites").textContent = String(favorites.length).padStart(2,"0");
  const escape = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const categoryReport = document.getElementById("category-report");
  const counts = categories.map(name => ({ name, count: recipes.filter(recipe => recipe.category === name).length }));
  const max = Math.max(1, ...counts.map(item => item.count));
  categoryReport.innerHTML = counts.length ? counts.map(item => `<div class="report-row"><span>${escape(item.name)}</span><span class="report-track"><span style="width:${Math.round(item.count/max*100)}%"></span></span><strong>${item.count}</strong></div>`).join("") : '<p class="empty-state">Kategori akan tampil setelah kamu menambahkan resep.</p>';
  const favoriteReport = document.getElementById("favorite-report");
  favoriteReport.innerHTML = favorites.length ? favorites.map(recipe => `<div class="report-row"><span>${escape(recipe.name)}</span><span class="report-track"><span style="width:100%"></span></span><strong>★</strong></div>`).join("") : '<p class="empty-state">Belum ada resep favorit.</p>';
})();

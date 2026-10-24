(() => {
  const KEY = "masakin_mahasiswa1_v1";
  const root = document.querySelector("main");
  if (!root) return;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY) || '{"categories":[],"recipes":[]}'); } catch { return; }
  const recipes = Array.isArray(data.recipes) ? data.recipes : [];
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const set = (key, value) => { const el = root.querySelector(`[data-stat="${key}"]`); if (el) el.textContent = String(value).padStart(2,"0"); };
  set("recipes", recipes.length); set("favorites", recipes.filter(r => r.favorite === true).length);
  set("ingredients", recipes.reduce((sum,r) => sum + (Array.isArray(r.ingredients) ? r.ingredients.length : 0),0));
  set("categories", categories.length);
  const heading = [...root.querySelectorAll("h2")].find(el => el.id === "features-title");
  if (heading) { heading.textContent = "Resep terbaru"; const copy = heading.parentElement.querySelector(".section-copy"); if (copy) copy.textContent = "Resep yang terakhir ditambahkan ke koleksi dapurmu."; }
  const recent = root.querySelector("[data-recent-recipes]");
  const card = recipe => `<article class="recipe-card"><div class="recipe-image image-rice" aria-hidden="true"></div><div class="recipe-card-body"><span class="recipe-category">${esc(recipe.category || "Tanpa kategori")}</span><strong class="recipe-title">${esc(recipe.name)}</strong><span class="recipe-description">${esc(recipe.description || "Belum ada deskripsi.")}</span><span class="recipe-meta">◷ ${Number(recipe.time)||0} menit · ${Number(recipe.servings)||1} porsi</span></div></article>`;
  if (recent) recent.innerHTML = recipes.length ? recipes.slice(0,3).map(card).join("") : '<div class="empty-state">Resep yang kamu tambahkan akan tampil di sini.</div>';
  const favorites = recipes.filter(r => r.favorite === true).slice(0,3);
  const section = document.createElement("section"); section.className = "content-section"; section.innerHTML = `<div class="section-heading"><div><p class="eyebrow">PILIHAN KELUARGA</p><h2>Resep favorit</h2><p class="section-copy">Resep yang kamu tandai untuk dimasak lagi.</p></div><a class="text-link" href="favorit.html">Semua favorit →</a></div><div class="recipe-list">${favorites.length ? favorites.map(card).join("") : '<div class="empty-state">Tandai resep favorit agar mudah ditemukan di sini.</div>'}</div>`;
  const feature = root.querySelector(".feature-section"); if (feature) feature.replaceWith(section); else root.append(section);
  window.addEventListener("storage", event => { if (event.key === KEY) window.location.reload(); });
})();

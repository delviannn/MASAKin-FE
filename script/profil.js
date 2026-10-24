(() => {
  const KEY = "masakin_profile_name_v1";
  const form = document.getElementById("profile-form");
  const input = document.getElementById("profile-name");
  const initial = document.getElementById("profile-initial");
  const message = document.getElementById("profile-message");
  function render() { const name = localStorage.getItem(KEY) || "Dapur keluarga"; input.value = name; initial.textContent = name.trim().charAt(0).toLocaleUpperCase("id") || "D"; }
  form.addEventListener("submit", event => { event.preventDefault(); const name = input.value.trim(); if (!name) return; localStorage.setItem(KEY,name); message.textContent = "Profil tersimpan."; render(); });
  render();
})();

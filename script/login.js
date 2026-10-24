(() => {
  "use strict";

  const form = document.getElementById("preview-login-form");
  const password = document.getElementById("password");
  const togglePassword = document.getElementById("toggle-password");
  const status = document.getElementById("login-status");

  togglePassword.addEventListener("click", () => {
    const visible = password.type === "password";
    password.type = visible ? "text" : "password";
    togglePassword.textContent = visible ? "Sembunyikan" : "Lihat";
    togglePassword.setAttribute("aria-label", visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
    togglePassword.setAttribute("aria-pressed", String(visible));
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = "Preview siap dibuka…";
    window.location.href = "index.html";
  });
})();

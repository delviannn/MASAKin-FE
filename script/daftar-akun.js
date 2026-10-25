(() => {
  "use strict";

  const form = document.getElementById("register-form");
  const password = document.getElementById("register-password");
  const confirmation = document.getElementById("register-confirm-password");
  const status = document.getElementById("register-status");

  confirmation.addEventListener("input", () => {
    confirmation.setCustomValidity(
      confirmation.value && confirmation.value !== password.value
        ? "Konfirmasi kata sandi belum sama."
        : ""
    );
  });
  password.addEventListener("input", () => {
    confirmation.setCustomValidity(
      confirmation.value && confirmation.value !== password.value
        ? "Konfirmasi kata sandi belum sama."
        : ""
    );
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = "Formulir preview berhasil diisi. Tidak ada akun atau data yang disimpan.";
  });
})();

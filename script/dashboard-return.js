(() => {
  "use strict";

  const link = document.createElement("a");
  link.className = "btn btn-primary dashboard-return";
  link.href = "index.html";
  link.setAttribute("aria-label", "Kembali ke Dashboard MASAKin");
  link.innerHTML = '<span aria-hidden="true">←</span> Kembali ke Dashboard';
  document.body.append(link);
})();

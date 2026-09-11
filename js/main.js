// =====================================================
// Barbearia Corte de Ouro — scripts
// =====================================================

// ----- Menu hambúrguer (celular) -----
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("aberto");
  menuToggle.classList.toggle("aberto");
});

// Fecha o menu ao clicar em um link (no celular)
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("aberto");
    menuToggle.classList.remove("aberto");
  });
});

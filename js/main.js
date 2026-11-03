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

// ----- Scroll suave para seções -----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ----- Botão "voltar ao topo" -----
const topoBtn = document.createElement('button');
topoBtn.textContent = "↑";
topoBtn.className = "btn-topo";
document.body.appendChild(topoBtn);

window.addEventListener('scroll', () => {
  topoBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

topoBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ----- Animação de entrada nos serviços -----
const servicos = document.querySelectorAll('.servico');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visivel');
    }
  });
}, { threshold: 0.2 });

servicos.forEach(servico => observer.observe(servico));

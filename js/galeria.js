const carrossel = document.querySelector('.galeria__carrossel');
const prevBtn = document.querySelector('.galeria__prev');
const nextBtn = document.querySelector('.galeria__next');
const cardWidth = 320;

// Navegação manual
nextBtn.addEventListener('click', () => {
  carrossel.scrollBy({ left: cardWidth, behavior: 'smooth' });
});

prevBtn.addEventListener('click', () => {
  carrossel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
});

// Autoplay suave
let autoScroll = setInterval(() => {
  carrossel.scrollBy({ left: cardWidth, behavior: 'smooth' });
}, 4000);

// Pausa o autoplay quando o usuário interage
[prevBtn, nextBtn, carrossel].forEach(el => {
    el.addEventListener('mouseenter', () => clearInterval(autoScroll));
    el.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => {
        carrossel.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }, 4000); // aqui fecha o setInterval
    });
  });
  
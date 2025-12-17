// Subtle parallax scroll effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const elements = document.querySelectorAll('.fade-in-element');
    elements.forEach(el => {
        el.style.transform = 'translateY(' + scrolled * 0.3 + 'px)';
    });
});

//Footer laden
document.addEventListener('DOMContentLoaded', () => {
const footerPlaceholder = document.querySelector('.footer-placeholder');
fetch('footer.html')
    .then(response => response.text())
    .then(data => {
        footerPlaceholder.innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));
});


//Entfernt Skeletons nach 8 Sekunden, wenn Inhalt nicht geladen wurde
document.addEventListener('DOMContentLoaded', () => {
  const skeletons = document.querySelectorAll('.skeleton');

  skeletons.forEach(el => {
    // 8 Sekunden Timer pro Element
    setTimeout(() => {
      // Wenn das Element immer noch leer ist
      if (!el.textContent.trim()) {
        // Skeleton entfernen
        el.classList.remove('skeleton');

        // Fehlertext einfügen
        el.textContent = 'Laden fehlgeschlagen';

        // Optional: Fehlerklasse für Styling
        el.classList.add('error');
      }
    }, 8000);
  });
});

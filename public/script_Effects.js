// Subtle parallax scroll effect
/*
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const elements = document.querySelectorAll('.fade-in-element');
    elements.forEach(el => {
        el.style.transform = 'translateY(' + scrolled * 0.3 + 'px)';
    });
});
*/

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const elements = document.getElementsByClassName('fade-in-element');

  for (const el of elements) {
    el.style.transform = 'translateY(' + scrolled * 0.3 + 'px)';
  }
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

        // Fehlerklasse für Styling
        el.classList.add('error');
      }
    }, 8000);
  });
});

function showAlert(message, type = 'blue', duration = 3000) {
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('custom-alert');

  // Neue Klasse je nach Typ hinzufügen
  alertDiv.classList.add(`custom-alert-${type}`);

  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  requestAnimationFrame(() => {
    alertDiv.classList.add('show');
  });

  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => alertDiv.remove(), 300);
  }, duration);
}

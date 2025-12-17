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
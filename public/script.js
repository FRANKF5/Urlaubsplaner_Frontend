// Simulierter Server-Abruf
async function mockFetchProfile() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: "Kevin (Aus Datenbank)",
                email: "kevin@firma.de"
            });
        }, 800); 
    });
}

// Profil laden
async function loadProfile() {
    const nameElement = document.getElementById('profile-name');
    const emailElement = document.getElementById('profile-email');

    // Sicherheitscheck: Sind wir überhaupt auf der Profilseite?
    if (!nameElement || !emailElement) return; 

    try {
        const data = await mockFetchProfile();
        nameElement.textContent = data.name;
        emailElement.textContent = data.email;
    } catch (error) {
        console.error("Fehler:", error);
    }
}

function logout() {
    localStorage.removeItem('token');
    alert("Ausgeloggt! Weiterleitung zur Startseite.");
    window.location.href = 'index.html'; // Leitet zurück zur Startseite
}

function handleNameChange(event) {
    event.preventDefault();
    const input = document.getElementById('new-name-input');
    const nameDisplay = document.getElementById('profile-name');
    
    if (input && input.value) {
        nameDisplay.textContent = input.value;
        alert("Name geändert!");
        input.value = '';
    }
}

// Event Listener beim Start
document.addEventListener('DOMContentLoaded', () => {
    // Versuche Profil zu laden (passiert nur auf profile.html)
    loadProfile();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const form = document.getElementById('update-name-form');
    if (form) form.addEventListener('submit', handleNameChange);
});

//Footer laden
document.addEventListener('DOMContentLoaded', function() {
    fetch('footer.html') // Pfad zu deiner Footer-Datei anpassen
        .then(response => response.text())
        .then(html => {
            // Finde alle Elemente, die einen Footer benötigen (z.B. mit einer Klasse)
            document.querySelectorAll('.footer-placeholder').forEach(placeholder => {
                placeholder.innerHTML = html;
            });
        })
        .catch(error => console.error('Fehler beim Laden des Footers:', error));
});
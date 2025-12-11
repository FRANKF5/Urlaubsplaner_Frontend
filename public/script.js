// Simulierter "Server-Abruf" (da wir noch kein echtes Backend haben)
async function mockFetchProfile() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: "Kevin (Aus Datenbank)",
                email: "kevin@firma.de"
            });
        }, 1000); // Simuliert 1 Sekunde Ladezeit
    });
}

// 1. Daten laden und anzeigen
async function loadProfile() {
    const nameElement = document.getElementById('profile-name');
    const emailElement = document.getElementById('profile-email');

    // Zeige zuerst "Laden..." an
    if(nameElement) nameElement.textContent = "Lade Daten...";
    
    try {
        // Hier würden wir normalerweise fetch('/users/me') machen
        // Stattdessen nutzen wir unsere Mock-Funktion:
        const data = await mockFetchProfile();

        // Daten ins HTML schreiben
        if(nameElement) nameElement.textContent = data.name;
        if(emailElement) emailElement.textContent = data.email;
        
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
}

// 2. Logout Funktion
function logout() {
    // Token löschen (Simulation)
    localStorage.removeItem('token');
    alert("Sie wurden ausgeloggt! (Redirect zum Login)");
    // window.location.href = 'login.html'; // Später aktivieren
}

// 3. Namen ändern (Formular)
function handleNameChange(event) {
    event.preventDefault(); // Verhindert Seite-Neuladen
    const input = document.getElementById('new-name-input');
    const nameDisplay = document.getElementById('profile-name');
    
    if (input.value) {
        // Update der Anzeige
        nameDisplay.textContent = input.value;
        alert(`Name erfolgreich zu "${input.value}" geändert!`);
        input.value = ''; // Feld leeren
    }
}

// Starten, sobald die Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
    // Profil laden starten
    loadProfile();

    // Logout Button verknüpfen
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Formular verknüpfen
    const form = document.getElementById('update-name-form');
    if (form) {
        form.addEventListener('submit', handleNameChange);
    }
}); 

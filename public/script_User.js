/*
This script contains functions for user profile management, including loading profile data,
logging out, and updating the user's name.
*/

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


// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    
    // Versuche Profil zu laden (passiert nur auf profile.html)
    loadProfile();
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const form = document.getElementById('update-name-form');
    if (form) form.addEventListener('submit', handleNameChange);
});


//Funktion für Registrierungsseite
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('birthdate');
    
    // 1. Heutiges Datum ermitteln
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Monat ist 0-basiert, daher +1
    const day = String(today.getDate()).padStart(2, '0');
    
    // Format für HTML input date ist immer: YYYY-MM-DD
    const maxDate = `${year}-${month}-${day}`;
    
    // 2. Minimales Datum ermitteln (Vor 150 Jahren)
    const minYear = year - 125;
    const minDate = `${minYear}-${month}-${day}`;

    // 3. Attribute setzen
    dateInput.max = maxDate; // Niemand aus der Zukunft
    dateInput.min = minDate; // Niemand älter als 150 Jahre

    //Passwortmatch Listener
    const confirmPasswordInput = document.getElementById('confirm_password');
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
});

//Check if Password an Confirm Password match
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const errorMessage = document.getElementById('passwordError');
    
    if (password !== confirmPassword && confirmPassword.length > 0) {
        errorMessage.style.display = 'block';
        return false;
    } else {
        errorMessage.style.display = 'none';
        return true;
    }
}

// Function to validate entire form
function validateForm(event) {
    event.preventDefault();
    
    if (!validatePasswordMatch()) {
        alert('Passwörter stimmen nicht überein!');
        return false;
    }
    
    alert('Daten sind valide und werden (simuliert) gesendet!');
    return false;
}
//Function to check if password and confirm_password match
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Hier sollte die Authentifizierung erfolgen
    if (username === 'admin' && password === 'password') {
        window.location.href = 'dashboard.html';
    } else {
        var errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = 'Ungültiger Benutzername oder Passwort.';
        errorMessage.style.display = 'block';
    }
});
/* script_User.js
   SIMULIERTES BACKEND FÜR DAS FRONTEND-TEAM
   Nutzt localStorage, um Daten zwischen den HTML-Seiten zu speichern.
*/

// --- HILFSFUNKTIONEN (MOCK DATABASE) ---

// Simuliert das Speichern eines Users in der Datenbank
function saveUserToDB(user) {
    // Hole alle existierenden User oder erstelle leere Liste
    let users = JSON.parse(localStorage.getItem('mock_users_db')) || [];
    users.push(user);
    localStorage.setItem('mock_users_db', JSON.stringify(users));
}

// Simuliert die Suche nach einem User in der Datenbank
function findUserInDB(username, password) {
    let users = JSON.parse(localStorage.getItem('mock_users_db')) || [];
    // Sucht User, wo Name UND Passwort übereinstimmen
    return users.find(u => u.username === username && u.password === password);
}

// Prüft, ob der Username schon vergeben ist
function userExists(username) {
    let users = JSON.parse(localStorage.getItem('mock_users_db')) || [];
    return users.some(u => u.username === username);
}

// --- HAUPTFUNKTIONEN FÜR DIE SEITEN ---

// 1. REGISTRIERUNG (wird in user_registration.html genutzt)
function registerUser(event) {
    event.preventDefault(); // Verhindert Neuladen

    const usernameInput = document.getElementById('username').value;
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    const confirmInput = document.getElementById('confirm_password').value;
    const birthdateInput = document.getElementById('birthdate').value;

<<<<<<< HEAD
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
=======
    // Validierung: Passwörter
    if (passwordInput !== confirmInput) {
        document.getElementById('passwordError').style.display = 'block';
>>>>>>> e249f7a77e3b05691665899b0cb72cd9dcaa6b02
        return false;
    }

    // Validierung: Existiert der User schon?
    if (userExists(usernameInput)) {
        alert("Dieser Benutzername ist leider schon vergeben.");
        return false;
    }

    // User Objekt erstellen
    const newUser = {
        username: usernameInput,
        email: emailInput,
        password: passwordInput, // Hinweis: Im echten Backend niemals Klartext speichern!
        birthdate: birthdateInput
    };

    // Speichern (Mock)
    saveUserToDB(newUser);

    alert("Konto erfolgreich erstellt! Du wirst zum Login weitergeleitet.");
    window.location.href = 'login.html';
    return false;
}
<<<<<<< HEAD
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
=======

// 2. LOGIN (wird in login.html genutzt)
function loginUser(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorBox = document.getElementById('errorMessage');

    // Suchen in der Mock-DB
    const foundUser = findUserInDB(usernameInput, passwordInput);

    if (foundUser) {
        // ERFOLG: Wir speichern den "aktuellen User" in der Session
        // Das simuliert das eingeloggte Cookie
        localStorage.setItem('current_session_user', JSON.stringify(foundUser));
        
        window.location.href = 'profile.html';
    } else {
        // FEHLER
        if(errorBox) {
            errorBox.textContent = "Benutzername oder Passwort falsch.";
            errorBox.style.display = 'block';
        } else {
            alert("Login fehlgeschlagen.");
        }
    }
}

// 3. PROFIL LADEN (wird in profile.html genutzt)
function loadProfile() {
    const nameDisplay = document.getElementById('profile-name');
    const emailDisplay = document.getElementById('profile-email');

    // Nur ausführen, wenn wir auf der Profilseite sind
    if (!nameDisplay) return;

    // Prüfen, wer eingeloggt ist
    const currentUser = JSON.parse(localStorage.getItem('current_session_user'));

    if (currentUser) {
        nameDisplay.textContent = currentUser.username;
        emailDisplay.textContent = currentUser.email;
    } else {
        // Niemand eingeloggt? Rauswerfen!
        alert("Bitte erst einloggen.");
        window.location.href = 'login.html';
    }
}

// 4. LOGOUT
function logout() {
    localStorage.removeItem('current_session_user');
    window.location.href = 'index.html';
}

// --- INITIALISIERUNG BEIM LADEN ---
document.addEventListener('DOMContentLoaded', function() {
    
    // Prüfen, ob wir Profil laden müssen
    loadProfile();

    // Event Listener für Logout Button (falls vorhanden)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Datums-Grenzen setzen (dein bestehender Code)
    const dateInput = document.getElementById('birthdate');
    if(dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.max = `${year}-${month}-${day}`;
        dateInput.min = `${year - 125}-${month}-${day}`;
>>>>>>> e249f7a77e3b05691665899b0cb72cd9dcaa6b02
    }
});
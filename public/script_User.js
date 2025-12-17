/* script_User.js
   Zentrale Steuerung für Login, Registrierung und Profil
   Nutzt LocalStorage als "Datenbank".
*/

// --- HILFSFUNKTIONEN ---

// User in "Datenbank" speichern
function saveUserToDB(user) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    users.push(user);
    localStorage.setItem('users_db', JSON.stringify(users));
}

// User finden (für Login)
function findUser(username, password) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    return users.find(u => u.username === username && u.password === password);
}

// Prüfen ob Username existiert (für Registrierung)
function userExists(username) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    return users.some(u => u.username === username);
}

// --- HAUPTFUNKTIONEN ---

// 1. REGISTRIERUNG
function registerUser(event) {
    event.preventDefault(); // Stoppt das normale Absenden

    // Daten aus dem Formular holen
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    // Prüfungen
    if (password !== confirm) {
        document.getElementById('passwordError').style.display = 'block';
        return false;
    }
    if (userExists(username)) {
        alert("Benutzername ist bereits vergeben!");
        return false;
    }

    // Speichern
    const newUser = { username, email, birthdate, password };
    saveUserToDB(newUser);

    alert("Erfolgreich registriert! Bitte jetzt einloggen.");
    window.location.href = 'login.html';
    return false;
}

// 2. LOGIN
function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorBox = document.getElementById('errorMessage');

    const user = findUser(username, password);

    if (user) {
        // Session starten (User merken)
        localStorage.setItem('current_user', JSON.stringify(user));
        window.location.href = 'profile.html';
    } else {
        if (errorBox) {
            errorBox.textContent = "Falscher Benutzername oder Passwort.";
            errorBox.style.display = 'block';
        } else {
            alert("Login fehlgeschlagen!");
        }
    }
}

// 3. PROFIL ANZEIGEN
function loadProfile() {
    // Nur machen, wenn wir auf der Profilseite sind
    const nameField = document.getElementById('profile-name');
    if (!nameField) return; 

    const currentUser = JSON.parse(localStorage.getItem('current_user'));

    if (currentUser) {
        // Daten in die HTML Elemente schreiben
        document.getElementById('profile-name').textContent = currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email;
        
        // Falls du das Geburtsdatum anzeigen willst, brauchst du ein Element mit id="profile-birthdate"
        // document.getElementById('profile-birthdate').textContent = currentUser.birthdate;
    } else {
        // Nicht eingeloggt? Weg hier!
        alert("Bitte erst einloggen.");
        window.location.href = 'login.html';
    }
}

// 4. LOGOUT
function logout() {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}

// --- INIT (Startet automatisch) ---
document.addEventListener('DOMContentLoaded', () => {
    // Prüft bei jedem Seitenaufruf, ob wir auf der Profilseite sind
    loadProfile();

    // Logout Button aktivieren
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Datums-Grenzen setzen (für Registrierung)
    const dateInput = document.getElementById('birthdate');
    if(dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;
    }
});
/* script_User.js
   Zentrale Steuerung für Login, Registrierung und Profil
   MIT VORNAME UND NACHNAME
*/

// --- HILFSFUNKTIONEN ---

function saveUserToDB(user) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    users.push(user);
    localStorage.setItem('users_db', JSON.stringify(users));
}

function findUser(username, password) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    return users.find(u => u.username === username && u.password === password);
}

function userExists(username) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    return users.some(u => u.username === username);
}

// --- HAUPTFUNKTIONEN ---

// 1. REGISTRIERUNG
function registerUser(event) {
    event.preventDefault();

    // NEU: Vorname und Nachname holen
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    if (password !== confirm) {
        document.getElementById('passwordError').style.display = 'block';
        return false;
    }
    if (userExists(username)) {
        alert("Benutzername ist bereits vergeben!");
        return false;
    }

    // NEU: firstname und lastname mit speichern
    const newUser = { 
        firstname, 
        lastname, 
        username, 
        email, 
        birthdate, 
        password 
    };
    
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
    const nameField = document.getElementById('profile-name');
    if (!nameField) return; 

    const currentUser = JSON.parse(localStorage.getItem('current_user'));

    if (currentUser) {
        // NEU: Wir zeigen jetzt "Vorname Nachname" anstatt nur Username
        // Der Username wird klein in Klammern dahinter gesetzt
        nameField.innerHTML = `${currentUser.firstname} ${currentUser.lastname} <small class="text-muted">(${currentUser.username})</small>`;
        
        document.getElementById('profile-email').textContent = currentUser.email;
    } else {
        alert("Bitte erst einloggen.");
        window.location.href = 'login.html';
    }
}

// 4. LOGOUT
function logout() {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}

// ... (dein bestehender Code oben) ...

// 5. NAMEN ÄNDERN (Neu)
function updateName(event) {
    event.preventDefault();

    const newFirstname = document.getElementById('edit-firstname').value;
    const newLastname = document.getElementById('edit-lastname').value;

    if (!newFirstname || !newLastname) {
        alert("Bitte beide Felder ausfüllen.");
        return;
    }

    // 1. Aktuellen User holen
    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    // 2. Werte ändern
    currentUser.firstname = newFirstname;
    currentUser.lastname = newLastname;

    // 3. Im "Session"-Speicher aktualisieren
    localStorage.setItem('current_user', JSON.stringify(currentUser));

    // 4. In der Haupt-Datenbank suchen und auch dort aktualisieren
    // (Sonst sind die alten Namen beim nächsten Login wieder da)
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    const index = users.findIndex(u => u.username === currentUser.username);
    if (index !== -1) {
        users[index].firstname = newFirstname;
        users[index].lastname = newLastname;
        localStorage.setItem('users_db', JSON.stringify(users));
    }

    // 5. Profil neu laden (damit man die Änderung sofort sieht)
    loadProfile();
    alert("Namen erfolgreich geändert!");
    
    // Felder leeren
    document.getElementById('edit-firstname').value = "";
    document.getElementById('edit-lastname').value = "";
}


// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Profil laden
    loadProfile();

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // NEU: Update Formular aktivieren
    const updateForm = document.getElementById('update-name-form');
    if (updateForm) {
        updateForm.addEventListener('submit', updateName);
    }
    
    // Datums-Grenzen für Registrierung
    const dateInput = document.getElementById('birthdate');
    if(dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;
    }
});
/* script_User.js
   Zentrale Steuerung für Login, Registrierung und Profil
   INKLUSIVE: Adresse, Alter, Traumziel & Aktivitäten
   Nutzt LocalStorage als Simulation für die Datenbank.
*/

// --- 1. HILFSFUNKTIONEN (Datenbank-Simulation) ---

// Speichert einen User dauerhaft in der "Datenbank" (LocalStorage)
function saveUserToDB(user) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    
    // Prüfen, ob User schon existiert (Update), sonst hinzufügen
    const index = users.findIndex(u => u.username === user.username);
    if (index !== -1) {
        users[index] = user; // Update
    } else {
        users.push(user); // Neu
    }
    
    localStorage.setItem('users_db', JSON.stringify(users));
}

// Sucht User für Login
function findUser(username, password) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    return users.find(u => u.username === username && u.password === password);
}

// Prüft bei Registrierung, ob Username schon weg ist
function userExists(username) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    return users.some(u => u.username === username);
}

// Berechnet das Alter basierend auf dem Geburtsdatum
function calculateAge(birthdateString) {
    if (!birthdateString) return "Unbekannt";
    const today = new Date();
    const birthDate = new Date(birthdateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    // Korrektur, falls Geburtstag dieses Jahr noch nicht war
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}


// --- 2. HAUPTFUNKTIONEN (Seiten-Logik) ---

// A. REGISTRIERUNG
function registerUser(event) {
    event.preventDefault();

    // Daten aus Formular holen
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    // Validierung
    if (password !== confirm) {
        document.getElementById('passwordError').style.display = 'block';
        return false;
    }
    if (userExists(username)) {
        alert("Benutzername ist bereits vergeben!");
        return false;
    }

    // User Objekt erstellen (inklusive leerer Felder für die neuen Profil-Infos)
    const newUser = { 
        firstname, 
        lastname, 
        username, 
        email, 
        birthdate, 
        password,
        address: "", 
        destination: "", 
        activities: [] 
    };
    
    saveUserToDB(newUser);

    alert("Registrierung erfolgreich! Du wirst zum Login weitergeleitet.");
    window.location.href = 'login.html';
    return false;
}

// B. LOGIN
function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorBox = document.getElementById('errorMessage');

    const user = findUser(username, password);

    if (user) {
        // Erfolgreich: User in "Session" speichern
        localStorage.setItem('current_user', JSON.stringify(user));
        window.location.href = 'profile.html';
    } else {
        // Fehler anzeigen
        if (errorBox) {
            errorBox.textContent = "Falscher Benutzername oder Passwort.";
            errorBox.style.display = 'block';
        } else {
            alert("Login fehlgeschlagen!");
        }
    }
}

// C. PROFIL LADEN (Anzeigen & Formular füllen)
function loadProfile() {
    const nameField = document.getElementById('profile-name');
    
    // Abbruch, wenn wir nicht auf der Profilseite sind
    if (!nameField) return; 

    const currentUser = JSON.parse(localStorage.getItem('current_user'));

    if (!currentUser) {
        // Nicht eingeloggt? Zurück zum Login
        window.location.href = 'login.html';
        return;
    }

    // 1. Kopfbereich befüllen (Name, Email, Alter)
    const age = calculateAge(currentUser.birthdate);
    nameField.innerHTML = `${currentUser.firstname} ${currentUser.lastname} <small class="text-muted">(${currentUser.username})</small>`;
    
    const infoField = document.getElementById('profile-info');
    if(infoField) {
        infoField.innerHTML = `📧 ${currentUser.email} &nbsp;|&nbsp; 🎂 ${age} Jahre alt`;
    } else {
        // Fallback für alte HTML Version
        const emailField = document.getElementById('profile-email');
        if(emailField) emailField.textContent = currentUser.email;
    }

    // 2. Formularfelder mit gespeicherten Daten füllen
    const editFirst = document.getElementById('edit-firstname');
    const editLast = document.getElementById('edit-lastname');
    const editAddr = document.getElementById('edit-address');
    const editDest = document.getElementById('edit-destination');
    const editAct = document.getElementById('edit-activities');

    if (editFirst) editFirst.value = currentUser.firstname || "";
    if (editLast) editLast.value = currentUser.lastname || "";
    if (editAddr) editAddr.value = currentUser.address || "";
    if (editDest) editDest.value = currentUser.destination || "";

    // 3. Aktivitäten im Dropdown markieren
    if (editAct) {
        const myActivities = currentUser.activities || [];
        for (let i = 0; i < editAct.options.length; i++) {
            const opt = editAct.options[i];
            if (myActivities.includes(opt.value)) {
                opt.selected = true;
            }
        }
    }
}

// D. PROFIL SPEICHERN (Update)
function updateProfile(event) {
    event.preventDefault();

    let currentUser = JSON.parse(localStorage.getItem('current_user'));

    // Textfelder auslesen
    currentUser.firstname = document.getElementById('edit-firstname').value;
    currentUser.lastname = document.getElementById('edit-lastname').value;
    currentUser.address = document.getElementById('edit-address').value;
    currentUser.destination = document.getElementById('edit-destination').value;

    // Multi-Select (Aktivitäten) auslesen
    const activitiesSelect = document.getElementById('edit-activities');
    const selectedActivities = [];
    if (activitiesSelect) {
        for (let i = 0; i < activitiesSelect.options.length; i++) {
            if (activitiesSelect.options[i].selected) {
                selectedActivities.push(activitiesSelect.options[i].value);
            }
        }
    }
    currentUser.activities = selectedActivities;

    // Speichern (Sowohl in der Session als auch in der DB)
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    saveUserToDB(currentUser);

    // Ansicht aktualisieren
    loadProfile();
    alert("Profil erfolgreich aktualisiert!");
}

// E. LOGOUT
function logout() {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}


// --- 3. INITIALISIERUNG BEIM LADEN DER SEITE ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Versuche Profil zu laden (passiert nur auf profile.html)
    loadProfile();

    // Event Listener für Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Event Listener für Profil-Update Formular
    const updateForm = document.getElementById('update-profile-form');
    if (updateForm) updateForm.addEventListener('submit', updateProfile);
    
    // Hilfsfunktion: Datums-Grenzen für Registrierung setzen
    const dateInput = document.getElementById('birthdate');
    if(dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today; // Kein Datum in der Zukunft
    }
});
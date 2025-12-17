/* script_User.js
   Zentrale Steuerung für Login, Registrierung und Profil
   Kommunikation mit REST API über Fetch
*/

// API Base URL - Anpassen falls nötig
const API_BASE_URL = 'http://localhost:3000/api';

// --- HILFSFUNKTIONEN ---

function showAlert(message) {
    alert(message);
}

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

// --- HAUPTFUNKTIONEN ---

// 1. REGISTRIERUNG
async function registerUser(event) {
    event.preventDefault();

    const firstname = document.getElementById('firstname')?.value || '';
    const lastname = document.getElementById('lastname')?.value || '';
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    if (password !== confirm) {
        const errorElement = document.getElementById('passwordError');
        if (errorElement) errorElement.style.display = 'block';
        return false;
    }

    try {
        const response = await apiCall('/auth/register', 'POST', {
            firstname,
            lastname,
            username,
            email,
            birthdate,
            password
        });

        showAlert("Erfolgreich registriert! Bitte jetzt einloggen.");
        window.location.href = 'login.html';
    } catch (error) {
        showAlert(`Registrierung fehlgeschlagen: ${error.message}`);
    }
    return false;
}

// 2. LOGIN
async function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorBox = document.getElementById('errorMessage');

    try {
        const response = await apiCall('/auth/login', 'POST', {
            username,
            password
        });

        // Token speichern
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
        
        window.location.href = 'profile.html';
    } catch (error) {
        if (errorBox) {
            errorBox.textContent = error.message || "Falscher Benutzername oder Passwort.";
            errorBox.style.display = 'block';
        } else {
            showAlert(error.message || "Login fehlgeschlagen!");
        }
    }
    return false;
}

// 3. PROFIL ANZEIGEN
async function loadProfile() {
    const nameField = document.getElementById('profile-name');
    if (!nameField) return;

    try {
        const response = await apiCall('/user/profile', 'GET');
        
        // Speichern für lokale Nutzung
        localStorage.setItem('current_user', JSON.stringify(response.user));

        nameField.innerHTML = `${response.user.firstname} ${response.user.lastname} <small class="text-muted">(${response.user.username})</small>`;
        
        const emailField = document.getElementById('profile-email');
        if (emailField) {
            emailField.textContent = response.user.email;
        }
    } catch (error) {
        const currentUser = JSON.parse(localStorage.getItem('current_user'));
        
        if (currentUser) {
            nameField.innerHTML = `${currentUser.firstname} ${currentUser.lastname} <small class="text-muted">(${currentUser.username})</small>`;
            const emailField = document.getElementById('profile-email');
            if (emailField) {
                emailField.textContent = currentUser.email;
            }
        } else {
            showAlert("Bitte erst einloggen.");
            window.location.href = 'login.html';
        }
    }
}

// 4. LOGOUT
async function logout() {
    try {
        await apiCall('/auth/logout', 'POST');
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}

// 5. NAMEN ÄNDERN
async function updateName(event) {
    event.preventDefault();

    const newFirstname = document.getElementById('edit-firstname').value;
    const newLastname = document.getElementById('edit-lastname').value;

    if (!newFirstname || !newLastname) {
        showAlert("Bitte beide Felder ausfüllen.");
        return;
    }

    try {
        const response = await apiCall('/user/profile', 'PUT', {
            firstname: newFirstname,
            lastname: newLastname
        });

        localStorage.setItem('current_user', JSON.stringify(response.user));
        loadProfile();
        showAlert("Namen erfolgreich geändert!");
        
        document.getElementById('edit-firstname').value = "";
        document.getElementById('edit-lastname').value = "";
    } catch (error) {
        showAlert(`Fehler beim Ändern der Namen: ${error.message}`);
    }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Prüfen ob User angemeldet ist (Token vorhanden)
    const token = localStorage.getItem('auth_token');
    
    // Profil laden
    if (token) {
        loadProfile();
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Update Formular aktivieren
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
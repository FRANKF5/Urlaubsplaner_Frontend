/* script_User.js
   Zentrale Steuerung INKLUSIVE Löschen & Bearbeiten von Reisen
*/

// --- 1. HILFSFUNKTIONEN (Datenbank) ---
// API-Konfiguration: passe `API_BASE` an dein Backend an
const API_BASE = 'http://192.168.178.201:8080'; // z.B. 'http://localhost:3000' oder ''
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

async function apiRequest(path, method = 'GET', body = null, auth = true) {
    const headers = {};
    let token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (body) headers['Content-Type'] = 'application/json';
    if (auth && token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        const text = await res.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }
        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        return { ok: false, status: 0, error: err };
    }
}

function saveTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function saveUserToDB(user) {
    let users = JSON.parse(localStorage.getItem('users_db')) || [];
    const index = users.findIndex(u => u.username === user.username);
    if (index !== -1) {
        users[index] = user;
    } else {
        users.push(user);
    }
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

function calculateAge(birthdateString) {
    if (!birthdateString) return "Unbekannt";
    const today = new Date();
    const birthDate = new Date(birthdateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

// --- 2. REISE-FUNKTIONEN (NEU) ---

// A. Löschen
function deleteTrip(tripId) {
    if(!confirm("Möchtest du diese Reise wirklich löschen?")) return;

    let currentUser = JSON.parse(localStorage.getItem('current_user'));

    // Versuche API-Call, sonst lokal löschen
    (async () => {
        const token = getAccessToken();
        if (token) {
            const res = await apiRequest('/api/user/trips', 'DELETE', { id: tripId });
            if (res.ok) {
                // Trip wurde gelöscht, Profil neu laden
                await loadProfile();
                return;
            }
        }

        // Fallback: lokal löschen
        currentUser = currentUser || {};
        currentUser.trips = (currentUser.trips || []).filter(t => t.id != tripId);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        saveUserToDB(currentUser);
        loadProfile();
    })();
}

// B. Bearbeiten vorbereiten (Modal öffnen)
function openEditTripModal(tripId) {
    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    const trip = currentUser.trips.find(t => t.id == tripId);

    if (trip) {
        // Daten in das Modal füllen
        document.getElementById('edit-trip-id').value = trip.id;
        document.getElementById('edit-trip-dest').value = trip.destination;
        document.getElementById('edit-trip-budget').value = trip.budget;

        // Modal per Bootstrap öffnen
        const modal = new bootstrap.Modal(document.getElementById('editTripModal'));
        modal.show();
    }
}

// C. Bearbeiten speichern
function saveEditedTrip(event) {
    event.preventDefault(); // Kein Neuladen der Seite

    const tripId = document.getElementById('edit-trip-id').value;
    const newDest = document.getElementById('edit-trip-dest').value;
    const newBudget = document.getElementById('edit-trip-budget').value;

    let currentUser = JSON.parse(localStorage.getItem('current_user'));

    // Reise im Array finden und aktualisieren
    const tripIndex = currentUser.trips.findIndex(t => t.id == tripId);
    if (tripIndex !== -1) {
        currentUser.trips[tripIndex].destination = newDest;
        currentUser.trips[tripIndex].budget = newBudget;

        (async () => {
            const token = getAccessToken();
            if (token) {
                const tripData = currentUser.trips[tripIndex];
                const res = await apiRequest('/api/user/trips', 'PATCH', tripData);
                if (res.ok) {
                    window.location.reload();
                    alert('Reise geändert!');
                    return;
                }
            }

            // Fallback: lokal speichern
            localStorage.setItem('current_user', JSON.stringify(currentUser));
            saveUserToDB(currentUser);
            window.location.reload();
            alert('Reise geändert!');
        })();
    }
}

// --- 3. HAUPTFUNKTIONEN ---

function saveTrip(event) {
    event.preventDefault();
    const dest = document.getElementById('trip-destination').value;
    const budget = document.getElementById('trip-budget').value;
    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return window.location.href = 'login.html';

    if (!currentUser.trips) currentUser.trips = [];

    const newTrip = {
        destination: dest,
        budget: budget,
        id: Date.now()
    };

    (async () => {
        const token = getAccessToken();
        if (token) {
            const res = await apiRequest('/api/user/trips', 'POST', newTrip);
            if (res.ok) {
                alert('Reise gespeichert!');
                window.location.href = 'profile.html';
                return false;
            }
        }

        // Fallback lokal
        currentUser.trips.push(newTrip);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        saveUserToDB(currentUser);
        alert('Reise gespeichert!');
        window.location.href = 'profile.html';
        return false;
    })();
}

async function registerUser(event) {
    event.preventDefault();
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    if (password !== confirm) {
        document.getElementById('passwordError').style.display = 'block';
        return false;
    }

    const newUser = {
        email, password, firstname, lastname, birthdate
    };

    // API-Call zur Registrierung: POST /auth/register
    const res = await apiRequest('/auth/register', 'POST', newUser, false);
    if (res.ok) {
        alert('Registrierung erfolgreich! Bitte überprüfen Sie Ihre Email zur Verifizierung.');
        window.location.href = 'login.html';
        return false;
    }

    // Fehlerbehandlung
    if (res.data && res.data.message) {
        alert('Fehler: ' + res.data.message);
    } else {
        alert('Registrierung fehlgeschlagen!');
    }
    return false;
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value || document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // API-Login: POST /auth/login
    const res = await apiRequest('/auth/login', 'POST', { email, password }, false);
    if (res.ok && res.data) {
        const accessToken = res.data.accessToken;
        const refreshToken = res.data.refreshToken;
        if (accessToken) {
            saveTokens(accessToken, refreshToken);
            // Hole die Nutzerdaten mit dem Access Token
            const userRes = await apiRequest('/api/user/info', 'GET', null, true);
            if (userRes.ok && userRes.data) {
                localStorage.setItem('current_user', JSON.stringify(userRes.data));
                saveUserToDB(userRes.data);
                window.location.href = 'profile.html';
                return false;
            }
        }
    }

    // Fehlerbehandlung
    if (res.data && res.data.message) {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = res.data.message;
    } else {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = 'Login fehlgeschlagen.';
    }
}

async function loadProfile() {
    const nameField = document.getElementById('profile-name');
    if (!nameField) return; 
    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    const token = getAccessToken();

    if (token) {
        const res = await apiRequest('/api/user/info', 'GET', null, true);
        if (res.ok && res.data) {
            currentUser = res.data;
            localStorage.setItem('current_user', JSON.stringify(currentUser));
            saveUserToDB(currentUser);
        }
    }

    if (!currentUser) return window.location.href = 'login.html';

    // A) Profil Header
    const age = calculateAge(currentUser.birthdate);
    nameField.innerHTML = `${currentUser.firstname} ${currentUser.lastname} <small class="text-muted">(${currentUser.username})</small>`;
    
    const infoField = document.getElementById('profile-info');
    if(infoField) infoField.innerHTML = `📧 ${currentUser.email} &nbsp;|&nbsp; 🎂 ${age} Jahre alt`;

    // B) Formular füllen
    const editFirst = document.getElementById('edit-firstname');
    if (editFirst) {
        editFirst.value = currentUser.firstname || "";
        document.getElementById('edit-lastname').value = currentUser.lastname || "";
        document.getElementById('edit-address').value = currentUser.address || "";
        document.getElementById('edit-destination').value = currentUser.destination || "";
        
        const editAct = document.getElementById('edit-activities');
        if (editAct) {
            const myActivities = currentUser.activities || [];
            for (let i = 0; i < editAct.options.length; i++) {
                if (myActivities.includes(editAct.options[i].value)) editAct.options[i].selected = true;
            }
        }
    }

    // C) Reisen anzeigen (MIT BUTTONS)
    const tripList = document.getElementById('trip-list');
    if (tripList) {
        const myTrips = currentUser.trips || [];
        tripList.innerHTML = ""; 
        
        if (myTrips.length === 0) {
            tripList.innerHTML = '<p class="text-muted text-center fst-italic">Noch keine Reisen geplant.</p>';
        } else {
            myTrips.forEach(trip => {
                const item = document.createElement('div');
                item.className = "list-group-item d-flex justify-content-between align-items-center";
                
                // Wir fügen hier die Buttons ein mit onclick Events
                item.innerHTML = `
                    <div>
                        <h5 class="mb-1">✈️ ${trip.destination}</h5>
                        <small class="text-muted">Budget: <strong>${trip.budget} €</strong></small>
                    </div>
                    <div>
                        <button onclick="openEditTripModal(${trip.id})" class="btn btn-outline-warning btn-sm me-1">✏️</button>
                        <button onclick="deleteTrip(${trip.id})" class="btn btn-outline-danger btn-sm">🗑️</button>
                    </div>
                `;
                tripList.appendChild(item);
            });
        }
    }
}

function updateProfile(event) {
    event.preventDefault();
    let currentUser = JSON.parse(localStorage.getItem('current_user'));

    const updateData = {
        firstname: document.getElementById('edit-firstname').value,
        lastname: document.getElementById('edit-lastname').value,
        address: document.getElementById('edit-address').value,
        destination: document.getElementById('edit-destination').value
    };

    const activitiesSelect = document.getElementById('edit-activities');
    if (activitiesSelect) {
        const selectedActivities = [];
        for (let i = 0; i < activitiesSelect.options.length; i++) {
            if (activitiesSelect.options[i].selected) selectedActivities.push(activitiesSelect.options[i].value);
        }
        updateData.activities = selectedActivities;
    }

    (async () => {
        const token = getAccessToken();
        if (token) {
            const res = await apiRequest('/api/user/info', 'PATCH', updateData);
            if (res.ok) {
                // Wenn Response User-Daten enthält, diese speichern
                if (res.data && res.data.id) {
                    localStorage.setItem('current_user', JSON.stringify(res.data));
                    saveUserToDB(res.data);
                } else {
                    // Sonst lokale Daten + update kombinieren
                    Object.assign(currentUser, updateData);
                    localStorage.setItem('current_user', JSON.stringify(currentUser));
                    saveUserToDB(currentUser);
                }
                await loadProfile();
                alert('Profil aktualisiert!');
                return;
            }
        }

        // Fallback lokal
        Object.assign(currentUser, updateData);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        saveUserToDB(currentUser);
        loadProfile();
        alert('Profil aktualisiert!');
    })();
}

async function logout() {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();

    // Versuche API-Logout: POST /api/user/logout
    if (accessToken && refreshToken) {
        await apiRequest('/api/user/logout', 'POST', { refreshToken }, true);
    }

    // Tokens und Benutzerdaten löschen
    clearTokens();
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const updateForm = document.getElementById('update-profile-form');
    if (updateForm) updateForm.addEventListener('submit', updateProfile);
    
    const dateInput = document.getElementById('birthdate');
    if(dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;
    }
});
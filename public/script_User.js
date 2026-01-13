/* script_User.js
   Backend-Integration für Urlaubsplaner
   Verbindung zum Spring Boot Backend auf localhost:8080
*/

// Backend URL Konstante
const API_BASE_URL = 'http://localhost:8080';

// --- 1. TOKEN MANAGEMENT ---

function getToken() {
    return localStorage.getItem('accessToken');
}

function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

function setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

// --- 2. API REQUEST HILFSFUNKTIONEN ---

async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        
        // Wenn Token abgelaufen, Refresh versuchen
        if (response.status === 401) {
            if (await refreshToken()) {
                return apiCall(endpoint, method, body); // Retry mit neuem Token
            } else {
                clearTokens();
                window.location.href = 'login.html';
                return null;
            }
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Call Error:', error);
        return null;
    }
}

async function refreshToken() {
    const refreshTok = getRefreshToken();
    if (!refreshTok) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refreshTok })
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.accessToken, data.refreshToken);
            return true;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }
    return false;
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

// --- 5. REISE FUNKTIONEN ---

// TODO: Trip-API-Endpoints vom Backend implementieren
function saveTrip(event) {
    event.preventDefault();
    alert("Trip-Speicherung wird vom Backend verwaltet - noch zu implementieren");
    return false;
}

function deleteTrip(tripId) {
    if(!confirm("Möchtest du diese Reise wirklich löschen?")) return;

    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    // Wir filtern die Reise mit der passenden ID raus
    currentUser.trips = currentUser.trips.filter(t => t.id != tripId);

    // Speichern & Neu laden
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    saveUserToDB(currentUser);
    loadProfile(); // Liste aktualisieren ohne Reload
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

        // Speichern
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        saveUserToDB(currentUser);
        
        // Modal schließen (Trick: Overlay entfernen und neu laden)
        // Einfacher: Seite neu laden oder loadProfile aufrufen
        alert("Reise geändert!");
        window.location.reload(); 
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
    currentUser.trips.push(newTrip);

    localStorage.setItem('current_user', JSON.stringify(currentUser));
    saveUserToDB(currentUser);

    alert("Reise gespeichert!");
    window.location.href = 'profile.html';
    return false;
}

function registerUser(event) {
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
    if (userExists(username)) {
        alert("Benutzername ist vergeben!");
        return false;
    }

    const newUser = { 
        firstname, lastname, username, email, birthdate, password,
        address: "", destination: "", activities: [], trips: [] 
    };
    
    saveUserToDB(newUser);
    alert("Registrierung erfolgreich!");
    window.location.href = 'login.html';
    return false;
}

async function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const user = findUser(username, password);

    if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        window.location.href = 'profile.html';
    } else {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = "Falsche Daten.";
    }
}

function loadProfile() {
    const nameField = document.getElementById('profile-name');
    if (!nameField) return; 

    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return window.location.href = 'login.html';

    // A) Profil Header
    const age = calculateAge(user.personalData?.birthdate);
    nameField.innerHTML = `${user.personalData?.firstname || ''} ${user.personalData?.lastname || ''} <small class="text-muted">(${user.email})</small>`;
    
    const infoField = document.getElementById('profile-info');
    if(infoField) infoField.innerHTML = `📧 ${user.email} &nbsp;|&nbsp; 🎂 ${age} Jahre alt`;

    // B) Formular füllen
    const editFirst = document.getElementById('edit-firstname');
    if (editFirst) {
        editFirst.value = user.personalData?.firstname || "";
        document.getElementById('edit-lastname').value = user.personalData?.lastname || "";
        document.getElementById('edit-address').value = user.personalData?.address || "";
        document.getElementById('edit-destination').value = user.personalData?.destination || "";
        
        const editAct = document.getElementById('edit-activities');
        if (editAct) {
            const myActivities = user.personalData?.activities || [];
            for (let i = 0; i < editAct.options.length; i++) {
                editAct.options[i].selected = myActivities.includes(editAct.options[i].value);
            }
        }
    }

    // C) Reisen anzeigen
    const tripList = document.getElementById('trip-list');
    if (tripList) {
        // TODO: Trips vom Backend laden
        tripList.innerHTML = '<p class="text-muted text-center fst-italic">Trip-Loading in Entwicklung...</p>';
    }
}

async function updateProfile(event) {
    event.preventDefault();
    let currentUser = JSON.parse(localStorage.getItem('current_user'));

    currentUser.firstname = document.getElementById('edit-firstname').value;
    currentUser.lastname = document.getElementById('edit-lastname').value;
    currentUser.address = document.getElementById('edit-address').value;
    currentUser.destination = document.getElementById('edit-destination').value;

    const activitiesSelect = document.getElementById('edit-activities');
    if (activitiesSelect) {
        const selectedActivities = [];
        for (let i = 0; i < activitiesSelect.options.length; i++) {
            if (activitiesSelect.options[i].selected) {
                personalData.activities.push(activitiesSelect.options[i].value);
            }
        }
    }
    currentUser.activities = selectedActivities;

    localStorage.setItem('current_user', JSON.stringify(currentUser));
    saveUserToDB(currentUser);
    loadProfile();
    alert("Profil aktualisiert!");
}

function logout() {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}

// --- 6. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadTripDetails();
    
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

// D. MITREISENDE HINZUFÜGEN
function addParticipant(event) {
    event.preventDefault();
    const inputField = document.getElementById('participant-input');
    const usernameToAdd = inputField.value.trim();
    
    // TODO: POST /api/trip/{id}/participant mit usernameToAdd
    alert("Teilnehmer-Verwaltung wird vom Backend verwaltet - noch zu implementieren");
    return false;
}
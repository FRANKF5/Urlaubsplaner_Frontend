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
    // TODO: DELETE /api/trip/{id}
    alert("Trip-Löschung wird vom Backend verwaltet - noch zu implementieren");
}

function loadTripDetails() {
    const titleElement = document.getElementById('detail-title');
    if (!titleElement) return;
    // TODO: Trip-Details vom Backend laden
    titleElement.textContent = "Trip-Details werden vom Backend geladen...";
}

function removeParticipant(tripId, nameToRemove) {
    // TODO: DELETE /api/trip/{id}/participant
    alert("Teilnehmer-Verwaltung wird vom Backend verwaltet - noch zu implementieren");
}

function addParticipant(event) {
    event.preventDefault();
    // TODO: POST /api/trip/{id}/participant
    alert("Teilnehmer-Verwaltung wird vom Backend verwaltet - noch zu implementieren");
    return false;
}

// --- 3. AUTHENTIFIZIERUNG ---

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

    const registrationData = {
        personalData: {
            firstName: firstname,
            lastName: lastname,
            birthDate: birthdate,
            address: "",
            destination: "",
            activities: []
        },
        authData: {
            mail: email,
            password
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
        });

        if (response.status === 201) {
            alert("Registrierung erfolgreich! Bitte überprüfe deine E-Mail zur Verifizierung.");
            window.location.href = 'login.html';
        } else {
            alert("Registrierung fehlgeschlagen. Email möglicherweise bereits registriert.");
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert("Fehler bei der Registrierung");
    }
    return false;
}

async function loginUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('email')?.value || document.getElementById('username')?.value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mail: email,
                password
            })
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.accessToken, data.refreshToken);
            window.location.href = 'profile.html';
        } else {
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = "Falsche Anmeldedaten.";
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        alert("Fehler beim Login");
    }
    return false;
}

// --- 4. PROFIL FUNKTIONEN ---

async function loadProfile() {
    const nameField = document.getElementById('profile-name');
    if (!nameField) return;

    const token = getToken();
    if (!token) return window.location.href = 'login.html';

    const user = await apiCall('/api/user/info');
    if (!user) return window.location.href = 'login.html';

    // A) Profil Header
    const age = calculateAge(user.personalData?.birthDate);
    nameField.innerHTML = `${user.personalData?.firstName || ''} ${user.personalData?.lastName || ''} <small class="text-muted">(${user.email})</small>`;

    const infoField = document.getElementById('profile-info');
    if(infoField) infoField.innerHTML = `📧 ${user.email} &nbsp;|&nbsp; 🎂 ${age} Jahre alt`;

    // B) Formular füllen
    const editFirst = document.getElementById('edit-firstname');
    if (editFirst) {
        editFirst.value = user.personalData?.firstName || "";
        document.getElementById('edit-lastname').value = user.personalData?.lastName || "";
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
    
    const personalData = {
        firstName: document.getElementById('edit-firstname').value,
        lastName: document.getElementById('edit-lastname').value,
        address: document.getElementById('edit-address').value,
        destination: document.getElementById('edit-destination').value,
        activities: []
    };

    const activitiesSelect = document.getElementById('edit-activities');
    if (activitiesSelect) {
        for (let i = 0; i < activitiesSelect.options.length; i++) {
            if (activitiesSelect.options[i].selected) {
                personalData.activities.push(activitiesSelect.options[i].value);
            }
        }
    }

    const success = await apiCall('/api/user/info', 'PATCH', personalData);
    if (success) {
        alert("Profil aktualisiert!");
        loadProfile();
    } else {
        alert("Fehler beim Update");
    }
}

async function logout() {
    try {
        const refreshTok = getRefreshToken();
        if (refreshTok) {
            await apiCall('/api/user/logout', 'POST', { refreshToken: refreshTok });
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
    clearTokens();
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
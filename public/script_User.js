/* script_User.js
   Backend-Integration für Urlaubsplaner
   Verbindung zum Spring Boot Backend auf localhost:8080
*/

// Backend URL aus CONFIG (config.js muss vor diesem Script geladen werden)
const API_BASE_URL = CONFIG.API_BASE_URL;

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

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// --- 5. REISE FUNKTIONEN ---

// Alle Trips laden
async function getAllTrips() {
    return await apiCall('/api/trips');
}

// Eigene Trips laden
async function getOwnedTrips() {
    return await apiCall('/api/trips/owned');
}

// Geteilte Trips laden
async function getSharedTrips() {
    return await apiCall('/api/trips/shared');
}

// Trip erstellen
async function createTrip(tripData) {
    return await apiCall('/api/trips', 'POST', tripData);
}

// Trip aktualisieren
async function updateTrip(tripId, tripData) {
    return await apiCall('/api/trips', 'PATCH', { trip_id: tripId, ...tripData });
}

// Trip speichern (Formular-Handler)
async function saveTrip(event) {
    event.preventDefault();

    const tripData = {
        title: document.getElementById('trip-title')?.value,
        destination: document.getElementById('trip-destination')?.value,
        startDate: document.getElementById('trip-start')?.value,
        endDate: document.getElementById('trip-end')?.value,
        budget: parseFloat(document.getElementById('trip-budget')?.value) || 0
    };

    const result = await createTrip(tripData);

    if (result && result.id) {
        alert('Reise erfolgreich erstellt!');
        window.location.href = 'profile.html';
    } else {
        alert('Fehler beim Erstellen der Reise.');
    }
    return false;
}

// Trip löschen/verlassen
async function deleteTrip(tripId) {
    if (!confirm("Möchtest du diese Reise wirklich löschen/verlassen?")) return;

    const result = await leaveTrip(tripId);

    if (result) {
        alert('Reise verlassen.');
        window.location.href = 'profile.html';
    } else {
        alert('Fehler beim Verlassen der Reise.');
    }
}

// --- 6. AKTIVITÄTEN FUNKTIONEN ---

// Aktivitäten eines Trips laden
async function getTripActivities(tripId) {
    return await apiCall(`/api/trip/activities/${tripId}`);
}

// Aktivität erstellen
async function createActivity(activityData) {
    return await apiCall('/api/activities', 'POST', activityData);
}

// Aktivität aktualisieren
async function updateActivity(activityData) {
    return await apiCall('/api/activities', 'PATCH', activityData);
}

// --- 7. GRUPPEN/TEILNEHMER FUNKTIONEN ---

// User zu Trip hinzufügen
async function addUserToTrip(tripId, userEmail) {
    return await apiCall('/api/groups/user', 'POST', {
        trip_id: tripId,
        email: userEmail
    });
}

// User von Trip entfernen
async function removeUserFromTrip(tripId, userEmail) {
    return await apiCall('/api/groups/user', 'DELETE', {
        trip_id: tripId,
        email: userEmail
    });
}

// Trip verlassen
async function leaveTrip(tripId) {
    return await apiCall('/api/groups/leave', 'POST', { trip_id: tripId });
}

// Teilnehmer eines Trips laden
async function getTripParticipants(tripId) {
    return await apiCall(`/api/groups/group/${tripId}`);
}

// Trip-Details laden
async function loadTripDetails() {
    const titleElement = document.getElementById('detail-title');
    if (!titleElement) return;

    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id');

    if (!tripId) {
        titleElement.textContent = 'Keine Reise ausgewählt';
        return;
    }

    const trips = await getAllTrips();
    const trip = trips?.find(t => t.id == tripId);

    if (!trip) {
        titleElement.textContent = 'Reise nicht gefunden';
        return;
    }

    titleElement.textContent = trip.title || 'Reisedetails';

    const destEl = document.getElementById('detail-destination');
    if (destEl) destEl.textContent = trip.destination || '-';

    const datesEl = document.getElementById('detail-dates');
    if (datesEl) datesEl.textContent = `${formatDate(trip.startDate)} bis ${formatDate(trip.endDate)}`;

    const budgetEl = document.getElementById('detail-budget');
    if (budgetEl) budgetEl.textContent = `${trip.budget || 0} €`;

    await loadTripParticipants(tripId);

    const deleteBtn = document.getElementById('delete-trip-btn');
    if (deleteBtn) {
        deleteBtn.onclick = () => deleteTrip(tripId);
    }
}

// Teilnehmer-Liste laden
async function loadTripParticipants(tripId) {
    const participantList = document.getElementById('participant-list');
    if (!participantList) return;

    const participants = await getTripParticipants(tripId);

    if (participants && participants.length > 0) {
        participantList.innerHTML = participants.map(p => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${p.email || p.name || 'Unbekannt'}
                <button class="btn btn-sm btn-outline-danger"
                        onclick="removeParticipant('${tripId}', '${p.email}')">
                    Entfernen
                </button>
            </li>
        `).join('');
    } else {
        participantList.innerHTML = '<li class="list-group-item text-muted">Keine Teilnehmer</li>';
    }
}

// Teilnehmer entfernen
async function removeParticipant(tripId, emailToRemove) {
    if (!confirm(`Möchtest du ${emailToRemove} wirklich entfernen?`)) return;

    const result = await removeUserFromTrip(tripId, emailToRemove);

    if (result) {
        alert('Teilnehmer entfernt.');
        await loadTripParticipants(tripId);
    } else {
        alert('Fehler beim Entfernen des Teilnehmers.');
    }
}

// Teilnehmer hinzufügen (Formular-Handler)
async function addParticipant(event) {
    event.preventDefault();
    const inputField = document.getElementById('participant-input');
    const emailToAdd = inputField.value.trim();

    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id');

    if (!tripId) {
        alert('Fehler: Keine Reise-ID gefunden.');
        return false;
    }

    const result = await addUserToTrip(tripId, emailToAdd);

    if (result) {
        alert('Teilnehmer erfolgreich hinzugefügt!');
        inputField.value = '';
        await loadTripParticipants(tripId);
    } else {
        alert('Fehler beim Hinzufügen des Teilnehmers.');
    }
    return false;
}

// --- 8. SETTINGS FUNKTIONEN ---

async function getAllSettings() {
    return await apiCall('/api/settings');
}

async function getSetting(option) {
    return await apiCall(`/api/settings/${option}`);
}

async function updateSetting(option, value) {
    return await apiCall('/api/user/config', 'PATCH', { option, value });
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
            const data = await response.json();
            // Speichere E-Mail für Verifizierungsseite
            localStorage.setItem('pendingVerificationEmail', email);
            // Falls der Server einen Verifizierungscode zurückgibt, speichere ihn
            if (data.verificationCode) {
                localStorage.setItem('verificationCode', data.verificationCode);
            }
            // Weiterleitung zur Verifizierungsseite
            window.location.href = 'verify.html';
        } else {
            alert("Registrierung fehlgeschlagen. Email möglicherweise bereits registriert.");
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert("Fehler bei der Registrierung");
    }
    return false;
}

// E-Mail verifizieren
async function verifyUser(event) {
    event.preventDefault();

    const email = document.getElementById('verify-email').value;
    const code = document.getElementById('verify-code').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                verificationCode: code
            })
        });

        if (response.ok) {
            // Lösche temporäre Daten
            localStorage.removeItem('pendingVerificationEmail');
            localStorage.removeItem('verificationCode');
            alert("Verifizierung erfolgreich! Du kannst dich jetzt einloggen.");
            window.location.href = 'login.html';
        } else {
            alert("Verifizierung fehlgeschlagen. Bitte prüfe den Code.");
        }
    } catch (error) {
        console.error('Verification error:', error);
        alert("Fehler bei der Verifizierung");
    }
    return false;
}

// Verifizierungsseite initialisieren
function initVerifyPage() {
    const emailField = document.getElementById('verify-email');
    const codeDisplay = document.getElementById('code-display');

    if (emailField) {
        // E-Mail aus localStorage laden
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        if (pendingEmail) {
            emailField.value = pendingEmail;
        }
    }

    if (codeDisplay) {
        // Falls Verifizierungscode vorhanden, anzeigen
        const code = localStorage.getItem('verificationCode');
        if (code) {
            codeDisplay.textContent = code;
            codeDisplay.parentElement.style.display = 'block';
        }
    }
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
        const trips = await getAllTrips();

        if (trips && trips.length > 0) {
            tripList.innerHTML = trips.map(trip => `
                <a href="trip_details.html?id=${trip.id}"
                   class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${trip.title || trip.destination || 'Unbenannte Reise'}</strong>
                        <br><small class="text-muted">${trip.destination || ''} | ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</small>
                    </div>
                    <span class="badge bg-success">${trip.budget || 0}€</span>
                </a>
            `).join('');
        } else {
            tripList.innerHTML = '<p class="text-muted text-center fst-italic">Noch keine Reisen geplant.</p>';
        }
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


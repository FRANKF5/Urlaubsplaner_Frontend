/* script_User.js
   Backend-Integration für Urlaubsplaner
   Verbindung zum Spring Boot Backend auf localhost:8080
*/

// Import configuration
/*const CONFIG = window.CONFIG || {
    API_BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            REFRESH: '/auth/refresh',
            VERIFY: '/auth/verify'
        },
        USER: {
            INFO: '/api/user/info',
            LOGOUT: '/api/user/logout',
            LOGOUT_ALL: '/api/user/logoutAll'
        },
        TRIP: {
            LIST: '/api/trip',
            CREATE: '/api/trip',
            GET: (id) => `/api/trip/${id}`,
            UPDATE: (id) => `/api/trip/${id}`,
            DELETE: (id) => `/api/trip/${id}`,
            PARTICIPANTS: (id) => `/api/trip/${id}/participant`,
            EXPENSES: (id) => `/api/trip/${id}/expense`
        }
    }
};
*/
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

// --- 5. REISE FUNKTIONEN ---

async function saveTrip(event) {
    event.preventDefault();
    const dest = document.getElementById('trip-destination').value;
    const budget = document.getElementById('trip-budget').value;
    const startDate = document.getElementById('trip-start-date')?.value;
    const endDate = document.getElementById('trip-end-date')?.value;

    if (!dest) {
        alert('Bitte geben Sie ein Reiseziel ein.');
        return;
    }

    try {
        const tripData = {
            destination: dest,
            budget: budget ? parseInt(budget) : null,
            startDate: startDate || null,
            endDate: endDate || null,
            maxBudget: null
        };

        const response = await apiCall(CONFIG.ENDPOINTS.TRIP.CREATE, 'POST', tripData);

        if (response) {
            alert('Reise erfolgreich erstellt!');
            // Redirect to profile or close modal
            window.location.href = 'profile.html';
        } else {
            alert('Fehler beim Erstellen der Reise');
        }
    } catch (error) {
        console.error('Error saving trip:', error);
        alert('Fehler beim Speichern der Reise');
    }
}

async function deleteTrip(tripId) {
    if (!confirm("Möchtest du diese Reise wirklich löschen?")) return;

    try {
        const response = await apiCall(CONFIG.ENDPOINTS.TRIP.DELETE(tripId), 'DELETE');
        
        if (response !== null) {
            alert('Reise erfolgreich gelöscht!');
            await loadTrips(); // Reload trips without page refresh
        } else {
            alert('Fehler beim Löschen der Reise');
        }
    } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Fehler beim Löschen der Reise');
    }
}

// B. Bearbeiten vorbereiten (Modal öffnen)
async function openEditTripModal(tripId) {
    try {
        const trip = await apiCall(CONFIG.ENDPOINTS.TRIP.GET(tripId));
        
        if (trip) {
            // Daten in das Modal füllen
            document.getElementById('edit-trip-id').value = trip.id;
            document.getElementById('edit-trip-dest').value = trip.destination || '';
            document.getElementById('edit-trip-budget').value = trip.budget || '';
            
            if (document.getElementById('edit-trip-start-date')) {
                document.getElementById('edit-trip-start-date').value = trip.startDate || '';
            }
            if (document.getElementById('edit-trip-end-date')) {
                document.getElementById('edit-trip-end-date').value = trip.endDate || '';
            }

            // Modal per Bootstrap öffnen
            const modal = new bootstrap.Modal(document.getElementById('editTripModal'));
            modal.show();
        } else {
            alert('Reise nicht gefunden');
        }
    } catch (error) {
        console.error('Error loading trip for edit:', error);
        alert('Fehler beim Laden der Reise');
    }
}

// C. Bearbeiten speichern
async function saveEditedTrip(event) {
    event.preventDefault();

    const tripId = document.getElementById('edit-trip-id').value;
    const newDest = document.getElementById('edit-trip-dest').value;
    const newBudget = document.getElementById('edit-trip-budget').value;
    const newStartDate = document.getElementById('edit-trip-start-date')?.value;
    const newEndDate = document.getElementById('edit-trip-end-date')?.value;

    if (!newDest) {
        alert('Bitte geben Sie ein Reiseziel ein.');
        return;
    }

    try {
        const tripData = {
            destination: newDest,
            budget: newBudget ? parseInt(newBudget) : null,
            startDate: newStartDate || null,
            endDate: newEndDate || null,
            maxBudget: null
        };

        const response = await apiCall(CONFIG.ENDPOINTS.TRIP.UPDATE(tripId), 'PUT', tripData);
        
        if (response) {
            alert('Reise erfolgreich aktualisiert!');
            
            // Modal schließen und Reisen neu laden
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTripModal'));
            if (modal) modal.hide();
            
            await loadTrips();
        } else {
            alert('Fehler beim Aktualisieren der Reise');
        }
    } catch (error) {
        console.error('Error updating trip:', error);
        alert('Fehler beim Aktualisieren der Reise');
    }
}

// Funktion zum Anzeigen von Trip-Details
async function viewTripDetails(tripId) {
    try {
        const trip = await apiCall(CONFIG.ENDPOINTS.TRIP.GET(tripId));
        
        if (trip) {
            // Detail-Modal füllen
            document.getElementById('detail-trip-destination').textContent = trip.destination || 'Nicht angegeben';
            document.getElementById('detail-trip-budget').textContent = trip.budget ? '€' + trip.budget : 'Nicht festgelegt';
            document.getElementById('detail-trip-start-date').textContent = trip.startDate ? new Date(trip.startDate).toLocaleDateString('de-DE') : 'Nicht angegeben';
            document.getElementById('detail-trip-end-date').textContent = trip.endDate ? new Date(trip.endDate).toLocaleDateString('de-DE') : 'Nicht angegeben';
            
            // Modal öffnen
            const modal = new bootstrap.Modal(document.getElementById('tripDetailModal'));
            modal.show();
        } else {
            alert('Reise nicht gefunden');
        }
    } catch (error) {
        console.error('Error loading trip details:', error);
        alert('Fehler beim Laden der Reise-Details');
    }
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
        return;
    }

    try {
        const registrationData = {
            personalData: {
                firstname,
                lastname,
                birthdate
            },
            authData: {
                mail: email,
                password
            }
        };

        const response = await apiCall(CONFIG.ENDPOINTS.AUTH.REGISTER, 'POST', registrationData);

        if (response) {
            alert('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail für die Verifikation.');
            window.location.href = 'login.html';
        } else {
            alert('Registrierung fehlgeschlagen');
        }

    } catch (error) {
        console.error('Registration error:', error);
        alert('Serverfehler bei der Registrierung');
    }
}


async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const authData = {
            mail: email,
            password: password
        };

        const tokenResponse = await apiCall(CONFIG.ENDPOINTS.AUTH.LOGIN, 'POST', authData);

        if (tokenResponse && tokenResponse.accessToken) {
            // Store tokens
            setTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
            
            // Get user info
            const userInfo = await apiCall(CONFIG.ENDPOINTS.USER.INFO);
            
            if (userInfo) {
                // Store user data
                localStorage.setItem('current_user', JSON.stringify(userInfo));
                window.location.href = 'profile.html';
            } else {
                alert('Benutzerinformationen konnten nicht geladen werden');
            }
        } else {
            document.getElementById('errorMessage').style.display = 'block';
            document.getElementById('errorMessage').textContent = "Falsche E-Mail oder Passwort.";
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = "Login fehlgeschlagen. Bitte versuchen Sie es später erneut.";
    }
}

async function loadProfile() {
    const nameField = document.getElementById('profile-name');
    if (!nameField) return; 

    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return window.location.href = 'login.html';

    // A) Profil Header
    const age = calculateAge(currentUser.personalData?.birthdate);
    nameField.innerHTML = `${currentUser.personalData?.firstname || ''} ${currentUser.personalData?.lastname || ''} <small class="text-muted">(${currentUser.mail})</small>`;
    
    const infoField = document.getElementById('profile-info');
    if(infoField) infoField.innerHTML = `📧 ${currentUser.mail} &nbsp;|&nbsp; 🎂 ${age} Jahre alt`;

    // B) Formular füllen
    const editFirst = document.getElementById('edit-firstname');
    if (editFirst) {
        editFirst.value = currentUser.personalData?.firstname || "";
        document.getElementById('edit-lastname').value = currentUser.personalData?.lastname || "";
        document.getElementById('edit-address').value = currentUser.personalData?.address || "";
        document.getElementById('edit-destination').value = currentUser.personalData?.destination || "";
        
        const editAct = document.getElementById('edit-activities');
        if (editAct) {
            const myActivities = currentUser.personalData?.activities || [];
            for (let i = 0; i < editAct.options.length; i++) {
                editAct.options[i].selected = myActivities.includes(editAct.options[i].value);
            }
        }
    }

    // C) Reisen vom Backend laden
    await loadTrips();
}

async function loadTrips() {
    const tripList = document.getElementById('trip-list');
    if (!tripList) return;

    try {
        const trips = await apiCall(CONFIG.ENDPOINTS.TRIP.LIST);
        
        if (trips && trips.length > 0) {
            let tripsHTML = '';
            trips.forEach(trip => {
                const startDate = trip.startDate ? new Date(trip.startDate).toLocaleDateString('de-DE') : '';
                const endDate = trip.endDate ? new Date(trip.endDate).toLocaleDateString('de-DE') : '';
                const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : 'Keine Daten';
                
                tripsHTML += `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${trip.destination}</h5>
                                <p class="card-text">
                                    <small class="text-muted">${dateRange}</small><br>
                                    Budget: ${trip.budget ? '€' + trip.budget : 'Nicht festgelegt'}
                                </p>
                                <div class="btn-group" role="group">
                                    <button class="btn btn-sm btn-outline-primary" onclick="viewTripDetails(${trip.id})">Details</button>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="openEditTripModal(${trip.id})">Bearbeiten</button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTrip(${trip.id})">Löschen</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            tripList.innerHTML = tripsHTML;
        } else {
            tripList.innerHTML = '<p class="text-muted text-center fst-italic">Noch keine Reisen vorhanden. Erstellen Sie Ihre erste Reise!</p>';
        }
    } catch (error) {
        console.error('Error loading trips:', error);
        tripList.innerHTML = '<p class="text-danger text-center">Fehler beim Laden der Reisen</p>';
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    try {
        const personalData = {
            firstname: document.getElementById('edit-firstname').value,
            lastname: document.getElementById('edit-lastname').value,
            address: document.getElementById('edit-address').value,
            destination: document.getElementById('edit-destination').value
        };

        const activitiesSelect = document.getElementById('edit-activities');
        if (activitiesSelect) {
            const selectedActivities = [];
            for (let i = 0; i < activitiesSelect.options.length; i++) {
                if (activitiesSelect.options[i].selected) {
                    selectedActivities.push(activitiesSelect.options[i].value);
                }
            }
            personalData.activities = selectedActivities;
        }

        const response = await apiCall(CONFIG.ENDPOINTS.USER.INFO, 'PATCH', personalData);
        
        if (response) {
            // Update stored user data
            localStorage.setItem('current_user', JSON.stringify(response));
            await loadProfile();
            alert("Profil erfolgreich aktualisiert!");
        } else {
            alert("Fehler beim Aktualisieren des Profils");
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert("Fehler beim Aktualisieren des Profils");
    }
}

function logout() {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
}

// --- 6. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    //loadTripDetails();
    
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

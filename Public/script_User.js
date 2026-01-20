/* script_User.js
   Frontend-Logik für lokalen Backend-Server
   Backend: http://localhost:8080
*/

// --- KONFIGURATION ---
const API_BASE_URL = 'https://maz-nas-ma.synology.me:7039';

// --- 1. HILFSFUNKTIONEN (API & Token) ---

async function apiCall(endpoint, method = 'GET', body = null) {
    // 1. Token holen
    const token = localStorage.getItem('auth_token');
    
    // DEBUG: Zeig mir in der Konsole (F12), was wir haben
    console.log("Sende Anfrage an:", endpoint);
    console.log("Mein gespeicherter Token:", token);
    const headers = {
        'Content-Type': 'application/json'
    };
    // 2. Header richtig bauen (WICHTIG!)
    if (token && token !== "undefined" && token !== "null") {
        // Hier nutzen wir einfache Anführungszeichen und ein + um sicherzugehen
        headers['Authorization'] = 'Bearer ' + token;
    } else {
        console.warn("ACHTUNG: Kein gültiger Token gefunden! Bin ich eingeloggt?");
    }
    const config = {
        method: method,
        headers: headers
    };
    if (body) {
        config.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        // Spezielle Behandlung für 401 (Nicht eingeloggt / Token falsch)
        if (response.status === 401) {
            console.error("Server sagt 401 Unauthorized. Token wurde abgelehnt.");
            // Optional: logout(); 
            throw new Error("Sitzung abgelaufen oder Token ungültig (401).");
        }
        if (response.status === 204) {
            return {};
        }
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        if (!response.ok) {
            throw new Error(data.message || `Server-Fehler: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error("API Error im Catch-Block:", error);
        
        // ÄNDERUNG: Wir zeigen den Alert nur, wenn es wirklich wichtig ist (z.B. beim Login)
        // Auf der Profilseite ignorieren wir Fehler im Hintergrund (wie Settings), solange die Seite läuft.
        const isLoginPage = window.location.pathname.includes('login.html');
        const isRegistration = endpoint.includes('/auth/register');
        
        if (isLoginPage || isRegistration) {
             alert("Fehler: " + error.message);
        } else {
             // Auf der Profilseite nur in die Konsole schreiben, kein nerviges Popup!
             console.warn("Hintergrund-Fehler (ignoriert):", error.message);
        }
        
        throw error;
    }
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
// --- 2. AUTHENTIFIZIERUNG ---

async function registerUser(event) {
    event.preventDefault();
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;
    if (password !== confirm) {
        alert("Passwörter stimmen nicht überein!");
        return false;
    }
    if (!birthdate) {
        alert("Bitte Geburtsdatum wählen!");
        return false;
    }
    // WICHTIG: Struktur für den Java-Konstruktor angepasst
    const registrationData = {
        authData: {
            mail: email,
            password: password,   // Das braucht die Logik (AuthApi)
            pass_hash: ""         // TRICK: Das braucht der Auth-Konstruktor zwingend!
        },
        personalData: {
            firstName: firstname,
            lastName: lastname,
            userName: username,
            birthDate: birthdate,
            gender: "diverse", 
            avatarUrl: ""
        }
    };
    try {
        await apiCall('/auth/register', 'POST', registrationData);
        alert("Registrierung erfolgreich! Bitte einloggen.");
        window.location.href = 'verify.html?email=' + encodeURIComponent(email);
    } catch (error) {
        console.error("Fehler:", error);
        // Da du die Mail gelöscht hast, sollte 400 jetzt nur kommen, wenn Daten fehlen
        alert("Fehler bei der Registrierung: " + error.message);
    }
    return false;
}

async function verifyUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('verify-email').value;
    const code = document.getElementById('verify-code').value;
    // Backend erwartet Klasse "Verification": { email, verificationCode }
    const verifyData = {
        email: email,
        verificationCode: code
    };
    try {
        await apiCall('/auth/verify', 'POST', verifyData);
        alert("🎉 Erfolg! Dein Konto ist jetzt aktiv. Du kannst dich einloggen.");
        window.location.href = 'login.html';
    } catch (error) {
        console.error(error);
        alert("Fehler: " + error.message);
    }
    return false;
}

async function loginUser(event) {
    event.preventDefault();
    // Wir holen den Wert aus dem Feld "username", nutzen ihn aber als mail
    const usernameInput = document.getElementById('username').value; 
    const passwordInput = document.getElementById('password').value;
    try {
        // Backend erwartet das "Auth"-Objekt.
        // WICHTIG: "pass_hash" muss dabei sein, sonst stürzt der Java-Konstruktor ab!
        const loginData = { 
            mail: usernameInput, 
            password: passwordInput,
            pass_hash: "" // <--- DIESE ZEILE IST ENTSCHEIDEND
        };
        const response = await apiCall('/auth/login', 'POST', loginData);
        if (response && response.accessToken) { 
            localStorage.setItem('auth_token', response.accessToken);
            window.location.href = 'profile.html';
        } else {
            throw new Error("Kein Token empfangen.");
        }
    } catch (error) {
        const errorDiv = document.getElementById('errorMessage');
        if(errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = "Login fehlgeschlagen: " + error.message;
        }
        console.error("Login Fehler:", error);
    }
    return false;
}

function logout() {
    localStorage.removeItem('auth_token');
    window.location.href = 'login.html';
}

// --- 3. PROFIL & SETTINGS ---

async function loadProfile() {
    const nameField = document.getElementById('profile-name');
    if (!nameField) return; 

    if (!localStorage.getItem('auth_token')) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // A) Basis-Daten laden: Backend UserApi -> getUserInfo (/api/user/info)
        const user = await apiCall('/api/user/info', 'GET');
        
        if (user && user.personalData) {
            const pd = user.personalData;
            const age = calculateAge(pd.birthDate);
            nameField.innerHTML = `${pd.firstName} ${pd.lastName} <small class="text-muted">(${pd.userName})</small>`;
            
            const infoField = document.getElementById('profile-info');
            if(infoField) infoField.innerHTML = `📧 ${user.email} &nbsp;|&nbsp; 🎂 ${age} Jahre alt`;
            
            // Formular Basisdaten füllen
            const editFirst = document.getElementById('edit-firstname');
            if (editFirst) {
                editFirst.value = pd.firstName || "";
                document.getElementById('edit-lastname').value = pd.lastName || "";
            }
        }

        // B) Settings laden: Backend SettingsApi -> getAllSettings (/api/settings)
        try {
            const settings = await apiCall('/api/settings', 'GET');
            
            if (Array.isArray(settings)) {
                const settingsMap = {};
                settings.forEach(item => {
                    settingsMap[item.option] = item.value;
                });

                if (document.getElementById('edit-address')) {
                    document.getElementById('edit-address').value = settingsMap['address'] || "";
                }
                if (document.getElementById('edit-destination')) {
                    document.getElementById('edit-destination').value = settingsMap['destination'] || "";
                }

                const editAct = document.getElementById('edit-activities');
                if (editAct && settingsMap['activities']) {
                    let myActivities = [];
                    try {
                        myActivities = JSON.parse(settingsMap['activities']);
                    } catch (e) {
                        myActivities = [settingsMap['activities']];
                    }
                    
                    if (Array.isArray(myActivities)) {
                        for (let i = 0; i < editAct.options.length; i++) {
                            if (myActivities.includes(editAct.options[i].value)) {
                                editAct.options[i].selected = true;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("Settings konnten nicht geladen werden.");
        }

        loadTripsList(); 

    } catch (error) {
        console.error("Profil-Fehler", error);
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    // 1. Basis-Daten Update: Backend UserApi -> updateUserInfo (PATCH /api/user/info)
    try {
        const firstname = document.getElementById('edit-firstname').value;
        const lastname = document.getElementById('edit-lastname').value;
        
        // Backend erwartet PersonalData Objekt
        await apiCall('/api/user/info', 'PATCH', { 
            firstName: firstname, 
            lastName: lastname 
        });
    } catch (e) {
        console.log("Basis-Daten Update fehlgeschlagen.");
    }

    // 2. Settings Update: Backend SettingsApi -> updateSetting (PATCH /api/settings/{option})
    try {
        const address = document.getElementById('edit-address').value;
        const destination = document.getElementById('edit-destination').value;
        
        const activitiesSelect = document.getElementById('edit-activities');
        const selectedActivities = [];
        if (activitiesSelect) {
            for (let i = 0; i < activitiesSelect.options.length; i++) {
                if (activitiesSelect.options[i].selected) selectedActivities.push(activitiesSelect.options[i].value);
            }
        }

        // Parallel senden. Body muss UserConfig entsprechen (value, optional dataType)
        const updateRequests = [
            apiCall('/api/settings/address', 'PATCH', { value: address }),
            apiCall('/api/settings/destination', 'PATCH', { value: destination }),
            apiCall('/api/settings/activities', 'PATCH', { value: JSON.stringify(selectedActivities) })
        ];

        await Promise.all(updateRequests);

        alert("Profil aktualisiert!");
        loadProfile(); 
    } catch (error) {
        console.error("Settings Update Fehler:", error);
    }
}

// --- 4. REISE-MANAGEMENT ---

async function loadTripsList() {
    const tripList = document.getElementById('trip-list');
    if (!tripList) return;

    try {
        // Backend TripApi -> getAllTrips (/api/trips)
        const trips = await apiCall('/api/trips', 'GET'); 

        tripList.innerHTML = ""; 
        
        if (!trips || trips.length === 0) {
            tripList.innerHTML = '<p class="text-muted text-center fst-italic">Noch keine Reisen geplant.</p>';
        } else {
            trips.forEach(trip => {
                const item = document.createElement('div');
                item.className = "list-group-item d-flex justify-content-between align-items-center list-group-item-action";
                
                const tripId = trip.id; // Trip.java hat "id"

                item.innerHTML = `
                    <a href="trip_details.html?id=${tripId}" class="text-decoration-none text-body flex-grow-1">
                        <div>
                            <h5 class="mb-1">✈️ ${trip.destination || "Unbekanntes Ziel"}</h5>
                            <small class="text-muted">Budget: <strong>${trip.budget} €</strong></small>
                        </div>
                    </a>
                    `;
                tripList.appendChild(item);
            });
        }
    } catch (error) {
        tripList.innerHTML = '<p class="text-danger text-center">Konnte Reisen nicht laden.</p>';
    }
}

async function saveTrip(event) {
    event.preventDefault();

    const newTrip = {
        destination: document.getElementById('trip-destination').value,
        startDate: document.getElementById('trip-start').value, // Muss Format YYYY-MM-DD haben (SQL Date)
        endDate: document.getElementById('trip-end').value,
        budget: document.getElementById('trip-budget').value
    };

    try {
        // Backend TripApi -> createTrip (POST /api/trips)
        await apiCall('/api/trips', 'POST', newTrip);
        alert("Reise erfolgreich angelegt!");
        window.location.href = 'profile.html';
    } catch (error) {
        // Fehler wird in apiCall gefangen
    }
    return false;
}

// Hinweis: TripApi.java hat aktuell KEINE Delete-Methode exposed.
// Daher ist diese Funktion vorerst deaktiviert oder muss im Backend ergänzt werden.
async function deleteTrip(tripId) {
    alert("Löschen ist serverseitig noch nicht implementiert.");
}

// --- 5. REISE-DETAILS & TEILNEHMER ---

async function loadTripDetails() {
    // Details Laden wie gehabt, über Trip Objekt filtern aus der Liste oder Einzelabruf fehlt in TripApi (nur getAll, getOwned, getShared)
    // WORKAROUND: Wir laden alle und suchen die richtige raus, da TripApi kein GET /api/trips/{id} hat.
    
    const titleElement = document.getElementById('detail-title');
    if (!titleElement) return; 

    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');
    if (!tripId) return;

    try {
        // Abruf aller Trips, dann filtern (da Backend keinen Single-Endpoint hat laut TripApi.java)
        const allTrips = await apiCall('/api/trips', 'GET');
        const trip = allTrips.find(t => String(t.id) === String(tripId));

        if(!trip) throw new Error("Reise nicht gefunden");

        document.getElementById('detail-title').textContent = `Reise nach ${trip.destination}`;
        document.getElementById('detail-destination').textContent = trip.destination;
        document.getElementById('detail-budget').textContent = `${trip.budget} €`;
        
        let dateText = "Kein Zeitraum";
        if (trip.startDate && trip.endDate) {
            dateText = `${trip.startDate} - ${trip.endDate}`;
        }
        document.getElementById('detail-dates').textContent = dateText;

        // Mitreisende laden: GroupApi -> getTripMembers (/api/groups/group?trip_id=...)
        const partList = document.getElementById('participant-list');
        partList.innerHTML = "Lade Teilnehmer..."; 
        
        try {
            const members = await apiCall(`/api/groups/group?trip_id=${tripId}`, 'GET');
            partList.innerHTML = "";

            if (members && members.length > 0) {
                members.forEach(member => {
                    const li = document.createElement('li');
                    li.className = "list-group-item d-flex justify-content-between align-items-center";
                    // TripMember hat firstName, name, email
                    li.innerHTML = `
                        <span>👤 ${member.firstName} ${member.name} (${member.role})</span>
                        ${member.role !== 'owner' ? `<button class="btn btn-sm btn-link text-danger" onclick="removeParticipant('${tripId}', '${member.email}')">&times;</button>` : ''}
                    `;
                    partList.appendChild(li);
                });
            } else {
                partList.innerHTML = '<li class="list-group-item">Keine Teilnehmer gefunden.</li>';
            }
        } catch(e) {
            partList.innerHTML = '<li class="list-group-item text-danger">Teilnehmer konnten nicht geladen werden.</li>';
        }

    } catch (error) {
        console.error("Details konnten nicht geladen werden", error);
    }
}

async function addParticipant(event) {
    event.preventDefault();
    
    const inputField = document.getElementById('participant-input');
    const emailToAdd = inputField.value.trim(); // Backend GroupApi add nutzt E-Mail
    
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');
    
    if (!tripId) return;

    try {
        // GroupApi -> addUserToTrip (POST /api/groups/user)
        // Body: AddUserRequest { tripId, email }
        await apiCall('/api/groups/user', 'POST', { tripId: tripId, email: emailToAdd });
        
        alert(`${emailToAdd} wurde eingeladen!`);
        inputField.value = ""; 
        loadTripDetails(); 
    } catch (error) {
        // Fehlerhandling
    }
}

async function removeParticipant(tripId, email) {
    if(!confirm(`Soll ${email} wirklich entfernt werden?`)) return;

    try {
        // GroupApi -> removeUserFromTrip (DELETE /api/groups/user)
        // ACHTUNG: fetch mit Body bei DELETE ist nicht Standard, aber Backend erwartet @RequestBody.
        // Falls das Probleme macht, muss Backend auf @RequestParam umgestellt werden.
        await apiCall('/api/groups/user', 'DELETE', { tripId: tripId, email: email });
        loadTripDetails();
    } catch (error) {
        console.error(error);
    }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profile-name')) loadProfile();
    if (document.getElementById('detail-title')) loadTripDetails();

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
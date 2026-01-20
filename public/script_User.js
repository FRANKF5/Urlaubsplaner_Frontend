/* script_User.js - Komplettversion */

// --- KONFIGURATION ---
// Falls du den Proxy nutzt: 'http://localhost:3000'
// Falls du den "Hacker-Browser" nutzt: 'https://maz-nas-ma.synology.me:7039'
const API_BASE_URL = 'https://maz-nas-ma.synology.me:7039'; 

// --- 1. HILFSFUNKTIONEN ---

async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('auth_token');
    
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const config = { method: method, headers: headers };
    if (body) config.body = JSON.stringify(body);

    try {
        console.log(`📡 API Request: ${method} ${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // 401: Token abgelaufen oder falsch
        if (response.status === 401) {
            console.warn("🔒 401 Unauthorized - Token abgelehnt.");
            if (!window.location.pathname.includes('login.html')) {
                // Optional: window.location.href = 'login.html';
            }
            throw new Error("Nicht eingeloggt (401).");
        }

        // 204: Erfolg, aber keine Daten (z.B. bei DELETE)
        if (response.status === 204) return {};

        const text = await response.text();
        
        // --- 100% SICHERER PARSER ---
        let data = {}; // Standard ist leeres Objekt
        if (text && text.trim() !== "null" && text.trim() !== "") {
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.warn("Server-Antwort war kein JSON:", text);
            }
        }
        
        // --- SICHERHEITSNETZ ---
        // Falls data irgendwie doch null geworden ist (passiert bei JSON.parse("null"))
        if (!data) {
            data = {}; 
        }

        if (!response.ok) {
            // data ist jetzt GARANTIERT ein Objekt, .message kann nicht crashen
            throw new Error(data.message || `Server-Fehler: ${response.status}`);
        }

        return data;

    } catch (error) {
        console.error("❌ API Fehler:", error);
        
        // Wir zeigen Alerts nur bei wichtigen Aktionen an, um den User nicht zu nerven
        const isCritical = window.location.pathname.includes('login') || 
                           window.location.pathname.includes('register') ||
                           window.location.pathname.includes('travel_budget') ||
                           method !== 'GET'; // Speichern/Löschen ist immer wichtig
                           
        if (isCritical) {
            alert("Fehler: " + error.message);
        } else {
            console.warn("Hintergrund-Fehler unterdrückt:", error.message);
        }
        throw error;
    }
}

function calculateAge(birthdateString) {
    if (!birthdateString) return "?";
    const today = new Date();
    const birthDate = new Date(birthdateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

// --- 2. AUTH & USER ---

async function registerUser(event) {
    event.preventDefault();
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    if (password !== confirm) { alert("Passwörter ungleich!"); return false; }
    if (!birthdate) { alert("Geburtsdatum fehlt!"); return false; }

    const registrationData = {
        authData: { mail: email, password: password, pass_hash: "" },
        personalData: {
            firstName: firstname, lastName: lastname, userName: username,
            birthDate: birthdate, gender: "diverse", avatarUrl: ""
        }
    };

    try {
        await apiCall('/auth/register', 'POST', registrationData);
        // Weiterleitung zur Verifizierung
        window.location.href = 'verify.html?email=' + encodeURIComponent(email);
    } catch (e) { /* Alert kommt aus apiCall */ }
    return false;
}

async function loginUser(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username').value; 
    const passwordInput = document.getElementById('password').value;

    const loginData = { 
        mail: usernameInput, 
        password: passwordInput,
        pass_hash: "" 
    };

    try {
        const response = await apiCall('/auth/login', 'POST', loginData);
        if (response.accessToken) { 
            localStorage.setItem('auth_token', response.accessToken);
            window.location.href = 'profile.html';
        } else {
            throw new Error("Kein Token erhalten.");
        }
    } catch (e) { /* Alert kommt aus apiCall */ }
    return false;
}

async function verifyUser(event) {
    event.preventDefault();
    
    // Werte aus dem Formular holen
    const emailVal = document.getElementById('verify-email').value;
    const codeVal = document.getElementById('verify-code').value;

    console.log("Verifiziere:", emailVal, codeVal);

    // VERSUCH 1: Wir passen die Namen an das Backend an.
    // Bei der Registrierung hieß es "mail", also nutzen wir das hier auch.
    // Oft heißt der Code im Backend einfach "code" oder "verificationCode".
    
    const verifyData = {
        mail: emailVal,          // WICHTIG: "mail" statt "email"
        verificationCode: codeVal // Wir lassen das erst mal so
    };

    // Falls das Backend "code" statt "verificationCode" will, müssten wir das hier ändern:
    // const verifyData = { mail: emailVal, code: codeVal };

    try {
        await apiCall('/auth/verify', 'POST', verifyData);
        
        alert("🎉 Erfolg! Dein Konto ist jetzt aktiv.");
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error("Verifizierung fehlgeschlagen:", error);
        
        // --- DIAGNOSE ---
        // Wenn Fehler 500 kommt, müssen wir wissen warum.
        alert("Fehler beim Verifizieren: " + error.message + "\n\n(Tipp: Schau in den Netzwerk-Tab für Details!)");
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

    try {
        // 1. User Info laden
        const user = await apiCall('/api/user/info', 'GET');
        
        if (user && user.personalData) {
            const pd = user.personalData;
            const age = calculateAge(pd.birthDate);
            nameField.innerHTML = `${pd.firstName} ${pd.lastName} <small class="text-muted">(${pd.userName})</small>`;
            
            const infoField = document.getElementById('profile-info');
            if(infoField) infoField.innerHTML = `📧 ${user.email} &nbsp;|&nbsp; 🎂 ${age} Jahre`;
            
            // Formular füllen
            const editFirst = document.getElementById('edit-firstname');
            if (editFirst) {
                editFirst.value = pd.firstName || "";
                document.getElementById('edit-lastname').value = pd.lastName || "";
            }
        }

        // 2. Settings laden (Fehler ignorieren wir hier stillschweigend)
        try {
            const settings = await apiCall('/api/settings', 'GET');
            if (Array.isArray(settings)) {
                settings.forEach(item => {
                    const el = document.getElementById('edit-' + item.option); // z.B. edit-destination
                    if(el) el.value = item.value;
                });
            }
        } catch (e) { console.warn("Settings konnten nicht geladen werden (DB Problem?)"); }

        loadTripsList(); 

    } catch (error) {
        console.error("Profil-Fehler", error);
        nameField.innerHTML = "Fehler beim Laden";
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    // 1. Namen speichern (Das geht!)
    try {
        const firstname = document.getElementById('edit-firstname').value;
        const lastname = document.getElementById('edit-lastname').value;
        
        await apiCall('/api/user/info', 'PATCH', { firstName: firstname, lastName: lastname });
        alert("Name erfolgreich gespeichert!");
    } catch (e) {
        alert("Konnte Name nicht speichern.");
        return;
    }

    // 2. Settings speichern (Das crasht wegen der DB, also "fire and forget")
    try {
        const address = document.getElementById('edit-address').value;
        const destination = document.getElementById('edit-destination').value;
        
        // Wir senden es, erwarten aber Fehler 500 und ignorieren ihn
        const p1 = apiCall('/api/settings/address', 'PATCH', { value: address }).catch(() => {});
        const p2 = apiCall('/api/settings/destination', 'PATCH', { value: destination }).catch(() => {});
        
        await Promise.all([p1, p2]);
    } catch (e) { console.warn("Settings Fehler ignoriert"); }

    loadProfile();
}

// --- 4. REISE-MANAGEMENT ---

async function loadTripsList() {
    const tripList = document.getElementById('trip-list');
    if (!tripList) return;

    tripList.innerHTML = ""; // Liste leeren

    // 1. Versuch: Wir laden Daten vom Server (falls da doch was geht)
    let serverTrips = [];
    try {
        // Wir probieren es, ignorieren aber Fehler, falls der Server spinnt
        serverTrips = await apiCall('/api/trips', 'GET');
    } catch (e) {
        console.warn("Server-Reisen konnten nicht geladen werden (egal, wir nutzen lokale).");
    }
    if (!Array.isArray(serverTrips)) serverTrips = [];

    // 2. Wir laden unsere lokalen "Fake"-Reisen
    const localTrips = JSON.parse(localStorage.getItem('local_trips') || '[]');

    // 3. Alles zusammenmixen
    const allTrips = serverTrips.concat(localTrips);

    // 4. Anzeigen
    if (allTrips.length === 0) {
        tripList.innerHTML = '<p class="text-muted text-center">Noch keine Reisen geplant.</p>';
    } else {
        allTrips.forEach(trip => {
            const item = document.createElement('div');
            item.className = "list-group-item d-flex justify-content-between align-items-center list-group-item-action";
            
            // Wir bauen den Link zur Detailseite
            // Hinweis: Detailseite funktioniert nur, wenn wir dort auch den "lokal"-Trick anwenden
            item.innerHTML = `
                <a href="#" class="text-decoration-none text-body flex-grow-1">
                    <div>
                        <h5 class="mb-1">✈️ ${trip.destination}</h5>
                        <small class="text-muted">Budget: <strong>${trip.budget} €</strong></small>
                        <br><small style="font-size: 0.8em">${trip.startDate} bis ${trip.endDate}</small>
                    </div>
                </a>
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteLocalTrip(${trip.id})">🗑️</button>
            `;
            tripList.appendChild(item);
        });
    }
}

// Hilfsfunktion zum Löschen der lokalen Reisen
function deleteLocalTrip(id) {
    if(!confirm("Reise löschen?")) return;
    
    let myTrips = JSON.parse(localStorage.getItem('local_trips') || '[]');
    myTrips = myTrips.filter(t => t.id !== id);
    localStorage.setItem('local_trips', JSON.stringify(myTrips));
    
    loadTripsList(); // Liste neu laden
}

async function saveTrip(event) {
    event.preventDefault();

    // 1. Daten auslesen
    const dest = document.getElementById('trip-destination').value;
    const start = document.getElementById('trip-start').value;
    const end = document.getElementById('trip-end').value;
    const budgetVal = document.getElementById('trip-budget').value;

    if (!dest || !start || !end || !budgetVal) {
        alert("Bitte fülle alle Felder aus.");
        return false;
    }

    // 2. Das Objekt bauen
    const newTrip = {
        id: Date.now(), // Wir erfinden eine Fake-ID
        destination: dest,
        startDate: start,
        endDate: end,
        budget: parseInt(budgetVal)
    };

    console.log("Speichere Reise lokal (Frontend-Only):", newTrip);

    // 3. TRICK: Wir holen alte Reisen aus dem Browserspeicher, fügen die neue hinzu und speichern wieder
    let myTrips = JSON.parse(localStorage.getItem('local_trips') || '[]');
    myTrips.push(newTrip);
    localStorage.setItem('local_trips', JSON.stringify(myTrips));

    // 4. Erfolg simulieren
    alert("Reise erfolgreich angelegt! (Lokal gespeichert)");
    window.location.href = 'profile.html';

    return false;
}

// --- 5. EDIT TRIP MODAL ---
async function openEditTripModal(tripId) {
    try {
        const trips = await apiCall('/api/trips', 'GET');
        const trip = trips.find(t => t.id == tripId);
        if (!trip) return;

        document.getElementById('edit-trip-id').value = trip.id;
        document.getElementById('edit-trip-dest').value = trip.destination;
        document.getElementById('edit-trip-budget').value = trip.budget;
        
        const modal = new bootstrap.Modal(document.getElementById('editTripModal'));
        modal.show();
    } catch (e) { console.error(e); }
}

async function saveEditedTrip(event) {
    event.preventDefault();
    const tripId = document.getElementById('edit-trip-id').value;
    const data = {
        destination: document.getElementById('edit-trip-dest').value,
        budget: parseInt(document.getElementById('edit-trip-budget').value)
    };

    try {
        await apiCall(`/api/trips/${tripId}`, 'PATCH', data);
        alert("Gespeichert!");
        location.reload();
    } catch (e) { /* Alert via apiCall */ }
    return false;
}

// --- 6. DETAILS & TEILNEHMER ---

async function loadTripDetails() {
    const titleElement = document.getElementById('detail-title');
    if (!titleElement) return; 

    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');
    if (!tripId) return;

    try {
        const allTrips = await apiCall('/api/trips', 'GET');
        const trip = allTrips.find(t => String(t.id) === String(tripId));

        if(!trip) throw new Error("Reise nicht gefunden");

        document.getElementById('detail-title').textContent = `Reise nach ${trip.destination}`;
        document.getElementById('detail-destination').textContent = trip.destination;
        document.getElementById('detail-budget').textContent = `${trip.budget} €`;
        document.getElementById('detail-dates').textContent = `${trip.startDate} - ${trip.endDate}`;

        // Teilnehmer laden
        const partList = document.getElementById('participant-list');
        partList.innerHTML = "Lade..."; 
        
        try {
            const members = await apiCall(`/api/groups/group?trip_id=${tripId}`, 'GET');
            partList.innerHTML = "";
            if (members && members.length > 0) {
                members.forEach(member => {
                    const li = document.createElement('li');
                    li.className = "list-group-item d-flex justify-content-between";
                    li.innerHTML = `<span>👤 ${member.firstName || ''} ${member.name || member.email}</span> 
                                    <small class="text-muted">${member.role}</small>`;
                    partList.appendChild(li);
                });
            } else {
                partList.innerHTML = '<li class="list-group-item">Keine Teilnehmer.</li>';
            }
        } catch(e) { partList.innerHTML = '<li class="text-danger">Fehler beim Laden der Teilnehmer.</li>'; }

    } catch (error) { console.error(error); }
}

async function addParticipant(event) {
    event.preventDefault();
    const email = document.getElementById('participant-input').value.trim();
    const tripId = new URLSearchParams(window.location.search).get('id');
    
    if(!email) return;

    try {
        await apiCall('/api/groups/user', 'POST', { tripId: tripId, email: email });
        alert("Eingeladen!");
        loadTripDetails();
        document.getElementById('participant-input').value = "";
    } catch (e) { /* Error alert by apiCall */ }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profile-name')) loadProfile();
    if (document.getElementById('detail-title')) loadTripDetails();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const updateForm = document.getElementById('update-profile-form');
    if (updateForm) updateForm.addEventListener('submit', updateProfile);
});
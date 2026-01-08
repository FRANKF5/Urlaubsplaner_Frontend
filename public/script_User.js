/* script_User.js
   Zentrale Steuerung INKLUSIVE Detailansicht und erweiterter Reise-Daten
*/

// --- 1. HILFSFUNKTIONEN (Datenbank) ---

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

// --- 2. REISE-FUNKTIONEN ---

// A. REISE SPEICHERN (mit neuen Feldern)
function saveTrip(event) {
    event.preventDefault();

    // Neue Felder abrufen
    const title = document.getElementById('trip-title').value;
    const dest = document.getElementById('trip-destination').value;
    const start = document.getElementById('trip-start').value;
    const end = document.getElementById('trip-end').value;
    const budget = document.getElementById('trip-budget').value;

    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return window.location.href = 'login.html';

    if (!currentUser.trips) currentUser.trips = [];

    // Reise Objekt mit allen Daten
    const newTrip = {
        id: Date.now(), // Eindeutige ID
        title: title,
        destination: dest,
        startDate: start,
        endDate: end,
        budget: budget
    };
    
    currentUser.trips.push(newTrip);

    localStorage.setItem('current_user', JSON.stringify(currentUser));
    saveUserToDB(currentUser);

    alert("Reise erfolgreich angelegt!");
    window.location.href = 'profile.html';
    return false;
}

// B. LÖSCHEN
function deleteTrip(tripId) {
    if(!confirm("Möchtest du diese Reise wirklich löschen?")) return;

    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    currentUser.trips = currentUser.trips.filter(t => t.id != tripId);

    localStorage.setItem('current_user', JSON.stringify(currentUser));
    saveUserToDB(currentUser);
    
    // Wenn wir auf der Profilseite sind: Liste neu laden
    if(document.getElementById('trip-list')) {
        loadProfile(); 
    } else {
        // Wenn wir auf der Detailseite sind: Zurück zum Profil
        window.location.href = 'profile.html';
    }
}

// C. DETAILANSICHT LADEN (Aktualisiert)
function loadTripDetails() {
    const titleElement = document.getElementById('detail-title');
    if (!titleElement) return; 

    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');

    if (!tripId) return;

    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser || !currentUser.trips) return;

    const trip = currentUser.trips.find(t => String(t.id) === String(tripId));

    if (trip) {
        // Basis-Daten
        document.getElementById('detail-title').textContent = trip.title || "Ohne Titel";
        document.getElementById('detail-destination').textContent = trip.destination;
        document.getElementById('detail-budget').textContent = `${trip.budget} €`;
        
        let dateText = "Kein Zeitraum";
        if (trip.startDate && trip.endDate) {
            const start = new Date(trip.startDate).toLocaleDateString('de-DE');
            const end = new Date(trip.endDate).toLocaleDateString('de-DE');
            dateText = `${start} - ${end}`;
        }
        document.getElementById('detail-dates').textContent = dateText;

        // NEU: Mitreisende anzeigen
        const partList = document.getElementById('participant-list');
        partList.innerHTML = ""; // Liste leeren
        
        if (trip.participants && trip.participants.length > 0) {
            trip.participants.forEach(name => {
                const li = document.createElement('li');
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.innerHTML = `
                    <span>👤 ${name}</span>
                    <button class="btn btn-sm btn-link text-danger text-decoration-none" onclick="removeParticipant('${trip.id}', '${name}')">&times;</button>
                `;
                partList.appendChild(li);
            });
        } else {
            partList.innerHTML = '<li class="list-group-item text-muted fst-italic">Noch keine Mitreisenden.</li>';
        }

        // Löschen-Button
        const delBtn = document.getElementById('delete-trip-btn');
        if(delBtn) delBtn.onclick = function() { deleteTrip(trip.id); };
    }
}

// E. ZUSATZ: Mitreisenden entfernen (Optional, aber nützlich)
function removeParticipant(tripId, nameToRemove) {
    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    const trip = currentUser.trips.find(t => String(t.id) === String(tripId));
    
    if (trip && trip.participants) {
        trip.participants = trip.participants.filter(name => name !== nameToRemove);
        
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        saveUserToDB(currentUser);
        loadTripDetails(); // Neu laden
    }
}

// --- 3. HAUPTFUNKTIONEN (User) ---

function registerUser(event) {
    event.preventDefault();
    /* ... (Identisch zu vorher, gekürzt für Übersicht) ... */
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

function loginUser(event) {
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

// PROFIL LADEN (Erstellt jetzt Links zu den Details)
function loadProfile() {
    const nameField = document.getElementById('profile-name');
    if (!nameField) return; 

    const currentUser = JSON.parse(localStorage.getItem('current_user'));
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

    // C) Reisen anzeigen (KLICKBAR!)
    const tripList = document.getElementById('trip-list');
    if (tripList) {
        const myTrips = currentUser.trips || [];
        tripList.innerHTML = ""; 
        
        if (myTrips.length === 0) {
            tripList.innerHTML = '<p class="text-muted text-center fst-italic">Noch keine Reisen geplant.</p>';
        } else {
            myTrips.forEach(trip => {
                // Wir erstellen ein DIV als Container
                const item = document.createElement('div');
                item.className = "list-group-item d-flex justify-content-between align-items-center list-group-item-action";
                
                // Link zum Draufklicken (spannt über den Text)
                // Wir nutzen HTML im innerHTML, um den Link zu bauen
                item.innerHTML = `
                    <a href="trip_details.html?id=${trip.id}" class="text-decoration-none text-body flex-grow-1">
                        <div>
                            <h5 class="mb-1">✈️ ${trip.title || trip.destination}</h5>
                            <small class="text-muted">Ziel: ${trip.destination} | Budget: <strong>${trip.budget} €</strong></small>
                        </div>
                    </a>
                    <div class="ms-2">
                        <button onclick="event.preventDefault(); deleteTrip(${trip.id})" class="btn btn-outline-danger btn-sm">🗑️</button>
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

    currentUser.firstname = document.getElementById('edit-firstname').value;
    currentUser.lastname = document.getElementById('edit-lastname').value;
    currentUser.address = document.getElementById('edit-address').value;
    currentUser.destination = document.getElementById('edit-destination').value;

    const activitiesSelect = document.getElementById('edit-activities');
    const selectedActivities = [];
    if (activitiesSelect) {
        for (let i = 0; i < activitiesSelect.options.length; i++) {
            if (activitiesSelect.options[i].selected) selectedActivities.push(activitiesSelect.options[i].value);
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

// D. MITREISENDE HINZUFÜGEN
function addParticipant(event) {
    event.preventDefault();
    
    const inputField = document.getElementById('participant-input');
    const usernameToAdd = inputField.value.trim();
    
    // 1. Reise-ID holen
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');
    
    // 2. Aktuellen User & Reise laden
    let currentUser = JSON.parse(localStorage.getItem('current_user'));
    const trip = currentUser.trips.find(t => String(t.id) === String(tripId));
    
    if (!trip) return;

    // 3. Validierung: Existiert der User in der Datenbank?
    // Wir nutzen die Hilfsfunktion userExists(), die wir schon haben
    if (!userExists(usernameToAdd)) {
        alert(`Der Benutzer "${usernameToAdd}" wurde nicht gefunden. Bitte prüfe die Schreibweise.`);
        return false;
    }

    // 4. Validierung: Ist er schon dabei?
    // Wir initialisieren das Array, falls es noch nicht existiert
    if (!trip.participants) trip.participants = [];
    
    if (trip.participants.includes(usernameToAdd)) {
        alert("Diese Person ist bereits hinzugefügt.");
        return false;
    }
    
    if (usernameToAdd === currentUser.username) {
        alert("Du bist automatisch dabei, du musst dich nicht hinzufügen :)");
        return false;
    }

    // 5. Hinzufügen & Speichern
    trip.participants.push(usernameToAdd);
    
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    saveUserToDB(currentUser); // Auch in der DB aktualisieren
    
    alert(`${usernameToAdd} wurde hinzugefügt!`);
    inputField.value = ""; // Feld leeren
    loadTripDetails(); // Ansicht aktualisieren
}
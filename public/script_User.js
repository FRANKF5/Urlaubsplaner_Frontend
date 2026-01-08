/* script_User.js
   Zentrale Steuerung INKLUSIVE Löschen & Bearbeiten von Reisen
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

// --- 2. REISE-FUNKTIONEN (NEU) ---

// A. Löschen
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
        showAlert("Reise geändert!");
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
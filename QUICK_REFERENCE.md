# Quick Reference - Urlaubsplaner Frontend Integration

## API Basis
```javascript
// In config.js definiert:
API_BASE_URL = 'http://localhost:8080'
```

## Token Management
```javascript
// Token speichern
setTokens(accessToken, refreshToken)

// Token abrufen
getToken()           // accessToken
getRefreshToken()    // refreshToken

// Token löschen
clearTokens()

// Token automatisch refreshed bei 401
```

## Authentifizierung

### Login
```javascript
loginUser(event)
// Erwartet: email, password Input-Felder
// Speichert: accessToken, refreshToken
// Redirect zu: profile.html
```

### Register
```javascript
registerUser(event)
// Erwartet: firstname, lastname, email, birthdate, password, confirm_password Input-Felder
// Backend-Anfrage an: POST /auth/register
// Redirect zu: login.html
```

### Logout
```javascript
logout()
// Invalidiert Token auf Backend
// Löscht localStorage Tokens
// Redirect zu: index.html
```

## Profil

### Profil laden
```javascript
loadProfile()
// GET /api/user/info
// Füllt Formulare mit Benutzerdaten
```

### Profil aktualisieren
```javascript
updateProfile(event)
// PATCH /api/user/info
// Sendet: firstname, lastname, address, destination, activities
```

## API Aufrufe

### Grundgerüst
```javascript
const result = await apiCall('/endpoint', 'METHOD', optionalBody);
// Beispiel:
const user = await apiCall('/api/user/info', 'GET');
```

## LocalStorage Keys
```javascript
'accessToken'    // JWT Access Token
'refreshToken'   // JWT Refresh Token
'userCache'      // (Optional) Gecachte Benutzerdaten
```

## Error Handling
```javascript
// Automatisch im apiCall():
// - 401: Refresh Token + Retry
// - 4xx: Fehler anzeigen
// - 5xx: Server-Fehler anzeigen
```

## HTML Input-IDs (Auth)

### Login (login.html)
- `email` - E-Mail-Adresse
- `password` - Passwort
- `errorMessage` - Fehleranzeige

### Register (user_registration.html)
- `firstname`, `lastname` - Name
- `email` - E-Mail
- `birthdate` - Geburtsdatum
- `password`, `confirm_password` - Passwort
- `passwordError` - Passwort-Fehleranzeige

### Profil (profile.html)
- `profile-name` - Name anzeigen
- `profile-info` - Info-Text
- `edit-firstname` bis `edit-destination` - Editier-Felder
- `edit-activities` - Aktivitäten-Select
- `update-profile-form` - Form
- `logout-btn` - Logout-Button

## Reisen (TODO - Backend erforderlich)

### Trip Create (travel_budget.html)
```javascript
saveTrip(event)
// POST /api/trip
// TODO: Implementierung erforderlich
```

### Trip Delete (trip_details.html)
```javascript
deleteTrip(tripId)
// DELETE /api/trip/{tripId}
// TODO: Implementierung erforderlich
```

### Trip Details (trip_details.html)
```javascript
loadTripDetails()
// GET /api/trip/{tripId}
// TODO: Implementierung erforderlich
```

### Teilnehmer (trip_details.html)
```javascript
addParticipant(event)
// POST /api/trip/{tripId}/participant
// TODO: Implementierung erforderlich

removeParticipant(tripId, nameToRemove)
// DELETE /api/trip/{tripId}/participant/{userId}
// TODO: Implementierung erforderlich
```

## CORS Fehler?
Konfigurieren Sie im Backend:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("*")
            .allowCredentials(true);
    }
}
```

## Browser DevTools Tipps
1. **Application Tab**: localStorage → accessToken/refreshToken prüfen
2. **Network Tab**: API-Calls mit Auth-Headers verfolgen
3. **Console**: API Errors anschauen
4. **Device Mode**: Mobile responsive testing

## Environment Setup
```bash
# Backend (Terminal 1)
cd Backend-Repo/Backend-Code-backend/Backend-Code-backend/uniprojekt
./mvnw spring-boot:run
# Läuft auf http://localhost:8080

# Frontend (Terminal 2)
# Einfach die HTML-Dateien im Browser öffnen:
# file:///c:/Urlaubspalner Frontend/public/index.html
```

# Backend Integration für Urlaubsplaner Frontend

## Status
Das Frontend wurde an das Spring Boot Backend angepasst. Die Anwendung verbindet sich nun mit dem Backend auf `http://localhost:8080`.

## Implementierte Änderungen

### 1. **script_User.js - Vollständige Neuschreibung**
   - ✅ Token-Management (accessToken, refreshToken)
   - ✅ API Request-Hilfsfunktionen mit automatischem Token-Refresh
   - ✅ Login mit E-Mail (statt Username)
   - ✅ Registrierung mit Backend-API
   - ✅ Profil laden und aktualisieren
   - ✅ Logout mit Token-Invalidierung

### 2. **login.html - Anpassung**
   - ✅ E-Mail-Feld statt Username
   - ✅ Verbindung zur `loginUser()` Funktion

### 3. **user_registration.html - Anpassung**
   - ✅ Username-Feld entfernt
   - ✅ E-Mail-basierte Registrierung

## API-Verbindungen

### Authentifizierung
```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/verify
```

### Benutzer
```
GET /api/user/info          - Benutzerdaten abrufen
PATCH /api/user/info        - Benutzerdaten aktualisieren
POST /api/user/logout       - Abmelden
POST /api/user/logoutAll    - Überall abmelden
```

## Noch zu implementieren

### Backend API (erforderlich)
- [ ] Trip API Endpoints (GET/POST/DELETE /api/trip)
- [ ] Participant Management (/api/trip/{id}/participant)
- [ ] Trip Budget und Expenses (/api/trip/{id}/expense)

### Frontend Funktionen
- [ ] `saveTrip()` - Trip erstellen
- [ ] `deleteTrip()` - Trip löschen
- [ ] `loadTripDetails()` - Trip-Details laden
- [ ] `addParticipant()` - Mitreisende hinzufügen
- [ ] `removeParticipant()` - Mitreisende entfernen

## Token Handling

Das Frontend speichert zwei Tokens in localStorage:
- `accessToken` - Für API-Anfragen
- `refreshToken` - Für Token-Erneuerung

Automatisches Refresh bei 401 Responses:
```javascript
if (response.status === 401) {
    if (await refreshToken()) {
        return apiCall(endpoint, method, body); // Retry
    }
}
```

## CORS Hinweis

Wenn CORS-Fehler auftreten, muss das Backend konfiguriert werden:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000", "file://")
            .allowedMethods("*")
            .allowCredentials(true);
    }
}
```

## Testing

1. Backend starten: `java -jar target/uniprojekt-0.0.1-SNAPSHOT.jar`
2. Frontend öffnen: `file:///c:/Urlaubspalner%20Frontend/public/index.html`
3. Registrierung testen
4. Login mit E-Mail testen
5. Profil laden und aktualisieren

## Fehlerbehebung

### "Fehler beim Login"
- Backend läuft nicht auf `localhost:8080`
- CORS-Fehler in Browser Console prüfen
- E-Mail Format überprüfen

### Token nicht gespeichert
- localStorage in Browser prüfen (DevTools → Application)
- Cookies/Storage nicht blockiert?

### 401 Unauthorized
- Token abgelaufen - sollte automatisch refreshed werden
- Falls nicht: Logout und erneut Login

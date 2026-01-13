# Urlaubsplaner Frontend - Backend Integration ABGESCHLOSSEN

## Was wurde geändert?

### 1. **Authentifizierung & User Management** ✅
- Login/Register nun Backend-basiert
- JWT Token Management implementiert
- Automatisches Token-Refresh bei 401
- localStorage für Token-Speicherung

### 2. **Dateiänderungen**

#### Neue Dateien:
- `config.js` - Zentrale Konfiguration mit API-Endpoints
- `BACKEND_INTEGRATION.md` - Dokumentation
- `BACKEND_API_CHECKLIST.md` - Backend-Implementierungs-Anforderungen

#### Modifizierte Dateien:
- `script_User.js` - Vollständige Neuschreibung mit Backend-Integration
- `login.html` - E-Mail statt Username
- `user_registration.html` - Username-Feld entfernt
- `index.html`, `profile.html`, `trip_details.html`, `travel_budget.html` - config.js hinzugefügt

### 3. **Frontend-Backend Mapping**

| Frontend | Backend API |
|----------|-------------|
| registerUser() | POST /auth/register |
| loginUser() | POST /auth/login |
| loadProfile() | GET /api/user/info |
| updateProfile() | PATCH /api/user/info |
| logout() | POST /api/user/logout |

### 4. **Noch zu implementieren (Frontend)**

Die folgenden Funktionen benötigen Backend-API-Endpoints:
- `saveTrip()` → POST /api/trip
- `deleteTrip()` → DELETE /api/trip/{id}
- `loadTripDetails()` → GET /api/trip/{id}
- `addParticipant()` → POST /api/trip/{id}/participant
- `removeParticipant()` → DELETE /api/trip/{id}/participant/{userId}

## Verwendung des Frontends

### Lokale Entwicklung
```bash
# Backend starten
cd Backend-Repo/Backend-Code-backend/Backend-Code-backend/uniprojekt
./mvnw spring-boot:run

# Frontend öffnen (im Browser)
file:///c:/Urlaubspalner Frontend/public/index.html
```

### Backend-Anforderungen
- Server läuft auf `http://localhost:8080`
- CORS aktiviert (siehe BACKEND_API_CHECKLIST.md)
- PostgreSQL Datenbank verbunden

## Token Management

Tokens werden automatisch verwaltet:
```javascript
// Gespeicherte Keys in localStorage:
localStorage.getItem('accessToken')    // Für API-Anfragen
localStorage.getItem('refreshToken')   // Für Token-Erneuerung
```

## Fehlerbehandlung

Das Frontend hat automatische Fehlerbehandlung:
- 401 Unauthorized → Token Refresh + Retry
- 403 Forbidden → Redirect zu Login
- 500 Server Error → Error Message anzeigen

## Nächste Schritte

1. **Backend**: Trip API Endpoints implementieren (siehe BACKEND_API_CHECKLIST.md)
2. **Frontend**: Trip-Funktionen mit Backend verbinden
3. **Testing**: Alle Flows testen (Login, Register, Trip CRUD)
4. **Sicherheit**: CORS, HTTPS in Production

## Wichtige URLs

- **Frontend**: file:///c:/Urlaubspalner%20Frontend/public/
- **Backend API**: http://localhost:8080
- **API Docs**: (Falls Swagger/OpenAPI konfiguriert)

## Support

Bei Fragen siehe:
- `BACKEND_INTEGRATION.md` - Technische Details
- `BACKEND_API_CHECKLIST.md` - Was Backend implementieren muss
- `script_User.js` - TODO-Kommentare für nächste Schritte

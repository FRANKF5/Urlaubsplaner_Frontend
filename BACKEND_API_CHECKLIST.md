# Urlaubsplaner Backend API - Implementierungs-Checkliste

Das Frontend erwartet folgende API-Endpoints vom Backend. Bitte implementieren:

## 1. Authentifizierung (BEREITS VORHANDEN)
- ✅ `POST /auth/login` - Benutzer anmelden
- ✅ `POST /auth/register` - Benutzer registrieren  
- ✅ `POST /auth/refresh` - Token erneuern
- ✅ `POST /auth/verify` - E-Mail verifizieren

## 2. Benutzer (BEREITS VORHANDEN)
- ✅ `GET /api/user/info` - Benutzerdaten abrufen
- ✅ `PATCH /api/user/info` - Benutzerdaten aktualisieren
- ✅ `POST /api/user/logout` - Abmelden
- ✅ `POST /api/user/logoutAll` - Überall abmelden

## 3. Reisen (NOCH ZU IMPLEMENTIEREN) ⚠️

### Trip Management
```
GET /api/trip                    - Alle Reisen des Benutzers abrufen
POST /api/trip                   - Neue Reise erstellen
GET /api/trip/{tripId}           - Reise-Details abrufen
PATCH /api/trip/{tripId}         - Reise aktualisieren
DELETE /api/trip/{tripId}        - Reise löschen
```

**Request/Response Beispiel für `POST /api/trip`:**
```json
// Request Body
{
  "destination": "Mallorca",
  "budget": 2000,
  "startDate": "2026-06-15",
  "endDate": "2026-06-22"
}

// Response (201 Created)
{
  "id": 1,
  "destination": "Mallorca",
  "budget": 2000,
  "startDate": "2026-06-15",
  "endDate": "2026-06-22",
  "ownerAuthId": 123,
  "createdAt": "2026-01-13T10:30:00Z",
  "activities": []
}
```

### Teilnehmer Management
```
GET /api/trip/{tripId}/participants           - Alle Teilnehmer abrufen
POST /api/trip/{tripId}/participant           - Teilnehmer hinzufügen
DELETE /api/trip/{tripId}/participant/{userId} - Teilnehmer entfernen
```

**Request Beispiel für `POST /api/trip/{tripId}/participant`:**
```json
{
  "email": "john@example.de"  // oder "userId": 456
}
```

## 4. Ausgaben/Budget (OPTIONAL - NOCH ZU IMPLEMENTIEREN)

```
GET /api/trip/{tripId}/expense                      - Alle Ausgaben
POST /api/trip/{tripId}/expense                     - Neue Ausgabe
PATCH /api/trip/{tripId}/expense/{expenseId}        - Ausgabe aktualisieren
DELETE /api/trip/{tripId}/expense/{expenseId}       - Ausgabe löschen
GET /api/trip/{tripId}/expense/settlement           - Abrechnung
```

## Sicherheit & Authentifizierung

### JWT Token Header
Alle Anfragen außer Login/Register müssen den Bearer-Token enthalten:
```
Authorization: Bearer <accessToken>
```

### CORS Konfiguration
Das Frontend wird vom `file://` Protokoll geladen - CORS muss konfiguriert sein:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:8080")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

## Frontend Fehlerbehandlung

Das Frontend erwartet folgende HTTP Status Codes:
- `200 OK` - Erfolgreich
- `201 Created` - Ressource erstellt
- `400 Bad Request` - Validierungsfehler
- `401 Unauthorized` - Token ungültig/abgelaufen
- `403 Forbidden` - Keine Berechtigung
- `404 Not Found` - Ressource nicht gefunden
- `409 Conflict` - Ressource existiert bereits
- `500 Internal Server Error` - Serverfehler

## Hinweise

1. **Token Expiration**: Frontend erwartet 9000000 Sekunden aus Backend
2. **Datum Format**: ISO 8601 (`yyyy-MM-dd` für Dates)
3. **Response Format**: Immer JSON
4. **Fehler Format**:
   ```json
   {
     "error": "Fehlermeldung",
     "status": 400
   }
   ```

## Testing-Tipps

### Login Test
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mail":"test@example.de","password":"pass123"}'
```

### Trip Create Test (mit Token)
```bash
curl -X POST http://localhost:8080/api/trip \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Berlin",
    "budget": 1000,
    "startDate": "2026-05-01",
    "endDate": "2026-05-05"
  }'
```

## Frontend Migration

Die aktuelle Frontend-Version benutzt:
- `script_User.js` - Alle Benutzer- und Auth-Funktionen
- `config.js` - Konfiguration (API_BASE_URL etc.)
- `localStorage` - Token-Speicherung

Alle `TODO` Kommentare in `script_User.js` markieren die zu implementierenden Trip-Funktionen.

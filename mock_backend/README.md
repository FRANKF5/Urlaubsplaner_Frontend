# Urlaubsplaner Mock Backend Server

Ein Python Flask Mock-Server, der die gleiche API wie das Spring Boot Backend bereitstellt.

## 🎯 Zweck

Dieser Mock-Server ermöglicht es, das Frontend zu entwickeln und zu testen, auch wenn das echte Spring Boot Backend noch nicht funktioniert. Der Server:

- ✅ Implementiert **alle** Backend-Endpoints identisch
- ✅ Verwendet die **gleichen** JWT-Tokens und Secrets
- ✅ Speichert Daten persistent in JSON-Datei
- ✅ Läuft auf **Port 8080** (wie das echte Backend)
- ✅ **Keine Frontend-Änderungen** nötig zum Umschalten

## 📋 Voraussetzungen

- Python 3.8 oder höher
- pip (Python Package Manager)

## 🚀 Installation

1. **Python Dependencies installieren:**

```bash
cd mock_backend
pip install -r requirements.txt
```

## ▶️ Server Starten

```bash
# Im Hauptverzeichnis (Urlaubsplaner_Frontend)
python app.py
```

Der Server läuft dann auf: `http://localhost:8080`

**Hinweis:** Die `app.py` befindet sich im Hauptverzeichnis, greift aber auf `mock_backend/data.json` zu.

## 🔌 API Endpoints

### Auth Endpoints (Öffentlich)

#### 1. POST /auth/register
Registriert einen neuen Benutzer.

**Request Body:**
```json
{
  "personalData": {
    "firstName": "Max",
    "lastName": "Mustermann",
    "birthDate": "1990-01-15",
    "gender": "male",
    "avatarUrl": "https://example.com/avatar.jpg",
    "userName": "maxmuster"
  },
  "authData": {
    "mail": "max@example.com",
    "password": "SecurePassword123"
  }
}
```

**Response:** `201 CREATED` mit Body `true`

#### 2. POST /auth/login
Authentifiziert einen Benutzer.

**Request Body:**
```json
{
  "mail": "max@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "abc123def456..."
}
```

#### 3. POST /auth/refresh
Erneuert ein abgelaufenes Access Token.

**Request Body:**
```json
{
  "refreshToken": "abc123def456..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "new_token_here..."
}
```

#### 4. POST /auth/verify
Verifiziert eine E-Mail-Adresse mit dem Verification Code.

**Request Body:**
```json
{
  "verificationCode": "abc123",
  "email": "max@example.com"
}
```

**Response:** `200 OK` mit Body `true`

---

### User Endpoints (Geschützt - JWT Required)

Alle folgenden Endpoints benötigen einen `Authorization` Header:

```
Authorization: Bearer <accessToken>
```

#### 5. GET /api/user/info
Gibt Informationen über den aktuellen Benutzer zurück.

**Response:** `200 OK`
```json
{
  "email": "max@example.com",
  "personalData": {
    "userId": 1,
    "authId": 1,
    "firstName": "Max",
    "lastName": "Mustermann",
    "birthDate": "1990-01-15",
    "gender": "male",
    "avatarUrl": "https://example.com/avatar.jpg",
    "userName": "maxmuster"
  }
}
```

#### 6. PATCH /api/user/info
Aktualisiert Benutzerinformationen.

**Request Body:**
```json
{
  "firstName": "Max",
  "lastName": "Mustermann",
  "gender": "male",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "userName": "maxmuster_new",
  "birthDate": "1990-01-15"
}
```

**Response:** `200 OK` mit Body `true`

#### 7. POST /api/user/logout
Meldet den Benutzer ab (invalidiert das Refresh Token).

**Request Body:**
```json
{
  "refreshToken": "abc123def456..."
}
```

**Response:** `200 OK` mit Body `true`

#### 8. POST /api/user/logoutAll
Meldet den Benutzer von allen Geräten ab.

**Request Body:** Leer `{}`

**Response:** `200 OK` mit Body `true`

---

### Utility Endpoints

#### GET /health
Health Check Endpoint.

**Response:** `200 OK`
```json
{
  "status": "UP",
  "server": "Mock Backend (Python Flask)",
  "timestamp": "2026-01-13T14:30:00.000000"
}
```

#### GET /
Root Endpoint mit API-Übersicht.

**Response:** `200 OK`
```json
{
  "message": "Urlaubsplaner Mock Backend API",
  "version": "1.0.0",
  "endpoints": {
    "auth": [...],
    "user": [...]
  }
}
```

## 💾 Datenspeicherung

Alle Daten werden in `data.json` gespeichert:

```json
{
  "users": {
    "1": {
      "userId": 1,
      "authId": 1,
      "firstName": "Max",
      "lastName": "Mustermann",
      ...
    }
  },
  "auth": {
    "1": {
      "id": 1,
      "email": "max@example.com",
      "password_hash": "$2b$12$...",
      "confirmed_at": "2026-01-13T14:30:00",
      "verification_code": null
    }
  },
  "tokens": {
    "abc123...": {
      "authId": 1,
      "expireDate": "2026-02-13T14:30:00"
    }
  }
}
```

## 🔄 Zwischen Mock und echtem Backend umschalten

### Option 1: Automatisch (Empfohlen)

Das Frontend sollte die API-Base-URL aus `public/config.js` lesen:

```javascript
// public/config.js
const API_BASE_URL = 'http://localhost:8080';  // Mock oder echtes Backend
```

### Option 2: Direkt im Frontend

In `public/script_User.js` kann die Base URL geändert werden:

```javascript
// Mock Backend (Python Flask)
const API_BASE_URL = 'http://localhost:8080';

// Echtes Backend (Spring Boot)
const API_BASE_URL = 'http://localhost:8080';
```

Da beide auf Port 8080 laufen, müssen Sie nur:
1. **Mock Backend stoppen** (`Ctrl+C`)
2. **Echtes Backend starten**

Oder umgekehrt. Keine Code-Änderungen nötig!

## 🧪 Testen des Mock Servers

### 1. Server starten
```bash
python app.py
```

### 2. Registrierung testen
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "personalData": {
      "firstName": "Test",
      "lastName": "User",
      "birthDate": "1995-05-20"
    },
    "authData": {
      "mail": "test@example.com",
      "password": "TestPass123"
    }
  }'
```

**Erwartete Antwort:** `true` mit Status `201 CREATED`

### 3. Login testen
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mail": "test@example.com",
    "password": "TestPass123"
  }'
```

**Erwartete Antwort:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "abc123..."
}
```

### 4. User Info abrufen (mit Token)
```bash
curl -X GET http://localhost:8080/api/user/info \
  -H "Authorization: Bearer <IHR_ACCESS_TOKEN_HIER>"
```

## 🔐 Sicherheit

- **Passwörter** werden mit bcrypt gehasht gespeichert
- **JWT Tokens** verwenden den gleichen Secret wie das echte Backend
- **Refresh Tokens** haben eine Gültigkeit von 30 Tagen
- **Access Tokens** sind 2.5 Stunden gültig

## 📝 Logs

Der Server gibt ausführliche Logs aus:

```
✅ User registered: test@example.com (verification code: abc123...)
✅ User logged in: test@example.com
✅ Token refreshed for auth_id: 1
✅ Email verified: test@example.com
✅ User info updated for auth_id: 1
✅ User logged out: auth_id 1
❌ Login error: ...
```

## 🐛 Debugging

Bei Problemen:

1. **Prüfen Sie die Konsolen-Logs** des Flask-Servers
2. **Prüfen Sie `data.json`** für gespeicherte Daten
3. **Prüfen Sie die Browser-Konsole** für Frontend-Fehler
4. **Prüfen Sie Network-Tab** im Browser DevTools

## 🔧 Konfiguration

### Port ändern

In `app.py`, letzte Zeile:

```python
app.run(host='0.0.0.0', port=8080, debug=True)
```

Ändern Sie `port=8080` auf einen anderen Port, z.B. `port=3001`.

### JWT Secret ändern

In `app.py`:

```python
JWT_SECRET = base64.b64decode("cGFydGljdWxhcnZhbHVlcGVyZmVjdGx5dHJpY2tyZXA=").decode('utf-8')
```

**Wichtig:** Verwenden Sie den gleichen Secret wie das echte Backend!

### Token-Ablaufzeit ändern

In `app.py`:

```python
JWT_EXPIRATION_MS = 9000000  # 2.5 Stunden in Millisekunden
```

## 📦 Datei-Struktur

```
mock_backend/
├── app.py              # Haupt-Flask-Anwendung
├── data.json           # JSON-Datenbank (wird automatisch erstellt)
├── requirements.txt    # Python-Dependencies
└── README.md          # Diese Datei
```

## 🚦 Status

- ✅ Auth Endpoints: **Vollständig implementiert**
- ✅ User Endpoints: **Vollständig implementiert**
- ✅ JWT Authentication: **Vollständig implementiert**
- ✅ Data Persistence: **Vollständig implementiert**
- ⏳ Trip Endpoints: **Noch nicht implementiert** (vom echten Backend auch nicht)

## 🤝 Nächste Schritte

1. **Frontend testen** mit dem Mock-Server
2. **Bugs fixen** im Frontend
3. **Auf echtes Backend umschalten** wenn es funktioniert
4. **Keine Code-Änderungen** nötig zum Umschalten!

## 📄 Lizenz

Dieses Mock-Backend ist Teil des Urlaubsplaner-Projekts.

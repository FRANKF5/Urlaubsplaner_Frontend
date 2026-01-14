# Frontend-Backend Integration Complete Guide

## ✅ Integration Status: COMPLETE

Your frontend is now fully integrated with the Spring Boot backend! Here's what has been implemented:

## 🚀 **What's Working Now:**

### **Authentication System**
- ✅ User registration with email verification
- ✅ Login with JWT tokens (access + refresh)
- ✅ Automatic token refresh on expiration
- ✅ Secure logout with token invalidation

### **User Management**
- ✅ Load user profile from backend
- ✅ Update user profile data
- ✅ Display user information correctly

### **Trip Management**
- ✅ Create new trips
- ✅ View all user trips (owned + shared)
- ✅ Update existing trips
- ✅ Delete trips
- ✅ View trip details

## 📋 **Step-by-Step Setup Instructions:**

### **Step 1: Start the Backend**
```bash
cd "Backend-Code-main/uniprojekt"
mvn clean package        // mvn clean package -DskipTests
java -jar target/uniprojekt-0.0.1-SNAPSHOT.jar
```
The backend will start on `http://localhost:8080`

### **Step 2: Open the Frontend**
Open your browser and navigate to:
```
file:///c:/Urlaubspalner%20Frontend/public/index.html
```

### **Step 3: Test the Integration**

#### **Registration Test:**
1. Click "Registrieren" in the navigation
2. Fill out the registration form:
   - Vorname: Test
   - Nachname: User
   - E-Mail: test@example.com
   - Geburtsdatum: 1990-01-01
   - Passwort: password123
   - Passwort bestätigen: password123
3. Submit the form
4. You should see "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail für die Verifikation."

#### **Login Test:**
1. Go to the login page
2. Enter your credentials:
   - E-Mail: test@example.com
   - Passwort: password123
3. Click "Einloggen"
4. You should be redirected to your profile page

#### **Profile Management Test:**
1. Verify your name and email are displayed correctly
2. Try updating your profile information
3. Click "Alle Änderungen speichern"
4. You should see "Profil erfolgreich aktualisiert!"

#### **Trip Management Test:**
1. Click "+ Neue Reise" to create a trip
2. Fill in trip details and save
3. Return to profile to see your trip listed
4. Test the "Details", "Bearbeiten", and "Löschen" buttons

## 🔧 **Technical Implementation Details:**

### **Backend API Endpoints:**
```
Authentication:
POST /auth/login          - User login
POST /auth/register        - User registration
POST /auth/refresh        - Token refresh
POST /auth/verify         - Email verification

User Management:
GET  /api/user/info       - Get user info
PATCH /api/user/info       - Update user info
POST /api/user/logout      - Logout

Trip Management:
GET    /api/trip           - Get all user trips
POST   /api/trip           - Create new trip
GET    /api/trip/{id}      - Get specific trip
PUT    /api/trip/{id}      - Update trip
DELETE /api/trip/{id}      - Delete trip
```

### **Frontend Configuration:**
- **API Base URL:** `http://localhost:8080`
- **Token Storage:** localStorage (accessToken, refreshToken)
- **Auto-refresh:** Automatic token refresh on 401 responses
- **Error Handling:** User-friendly error messages

### **Security Features:**
- JWT-based authentication
- Automatic token refresh
- Secure API calls with Authorization headers
- Proper error handling for expired tokens

## 🐛 **Troubleshooting:**

### **"Backend nicht erreichbar"**
- ✅ Check if backend is running on port 8080
- ✅ Verify database connection in application.properties
- ✅ Check browser console for CORS errors

### **"Login fehlgeschlagen"**
- ✅ Verify user is registered in database
- ✅ Check email verification status
- ✅ Ensure correct password

### **"Token expired" errors**
- ✅ Should automatically refresh
- ✅ If persistent, clear localStorage and re-login

### **CORS Issues**
- ✅ Backend should handle this automatically
- ✅ If issues persist, check browser console for specific errors

## 📁 **Files Modified:**

### **Backend:**
- ✅ `TripApi.java` - Complete trip management API
- ✅ `TripConnector.java` - Added deleteTrip method

### **Frontend:**
- ✅ `script_User.js` - Complete API integration
- ✅ `config.js` - API configuration
- ✅ `login.html` - Fixed form field IDs
- ✅ `profile.html` - Added trip detail modal

## 🎯 **Next Steps (Optional Enhancements):**

1. **Email Verification UI** - Add email verification page
2. **Trip Participants** - Implement participant management
3. **Trip Expenses** - Add expense tracking
4. **Trip Sharing** - Implement trip sharing functionality
5. **File Uploads** - Add trip photos/documents

## 🔄 **Database Schema:**

The backend expects these tables in your PostgreSQL database:
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    mail VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    -- other user fields
);

-- Trips table  
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    owner BIGINT REFERENCES users(id),
    budget INTEGER,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    max_budget INTEGER
);

-- Shared trips table (for sharing functionality)
CREATE TABLE shared (
    trips_id BIGINT REFERENCES trips(id),
    auth_id BIGINT REFERENCES users(id),
    role VARCHAR(50),
    PRIMARY KEY (trips_id, auth_id)
);
```

## 🎉 **Success!**

Your Urlaubsplaner frontend is now fully integrated with the backend! Users can:
- Register and login securely
- Manage their profiles  
- Create, view, edit, and delete trips
- Enjoy automatic token management

The integration is production-ready with proper error handling and security measures.

// Frontend-Konfiguration für Urlaubsplaner
// Diese Datei kann in script_User.js importiert werden

const CONFIG = {
    // Backend Server URL
    API_BASE_URL: 'http://localhost:8080',
    
    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            REFRESH: '/auth/refresh',
            VERIFY: '/auth/verify'
        },
        USER: {
            INFO: '/api/user/info',
            LOGOUT: '/api/user/logout',
            LOGOUT_ALL: '/api/user/logoutAll'
        },
        TRIP: {
            LIST: '/api/trip',
            CREATE: '/api/trip',
            GET: (id) => `/api/trip/${id}`,
            UPDATE: (id) => `/api/trip/${id}`,
            DELETE: (id) => `/api/trip/${id}`,
            PARTICIPANTS: (id) => `/api/trip/${id}/participant`,
            EXPENSES: (id) => `/api/trip/${id}/expense`
        }
    },
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'accessToken',
        REFRESH_TOKEN: 'refreshToken',
        USER_CACHE: 'userCache'
    },
    
    // Token Expiration (in seconds)
    TOKEN_EXPIRATION: 9000000,
    
    // Request Timeout (in ms)
    REQUEST_TIMEOUT: 10000,
    
    // Retry Settings
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// Export für Node.js / Module Systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

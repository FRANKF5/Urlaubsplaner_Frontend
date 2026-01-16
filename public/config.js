// Frontend-Konfiguration für Urlaubsplaner
// Diese Datei kann in script_User.js importiert werden

const CONFIG = {
    // Backend Server URL
    API_BASE_URL: 'https://maz-nas-ma.synology.me:7039', //'http://localhost:8080',
    
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
            LIST: '/api/trips',
            CREATE: '/api/trips',
            GET: (id) => `/api/trips/${id}`,
            UPDATE: (id) => `/api/trips/${id}`,
            DELETE: (id) => `/api/trips/${id}`,
            PARTICIPANTS: (id) => `/api/trips/${id}/participant`,
            EXPENSES: (id) => `/api/trips/${id}/expense`
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

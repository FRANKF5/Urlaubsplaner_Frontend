// Frontend-Konfiguration für Urlaubsplaner
// Diese Datei kann in script_User.js importiert werden

const CONFIG = {
    // Backend Server URL - Produktions-Backend
    API_BASE_URL: 'https://maz-nas-ma.synology.me:7039',

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
            LOGOUT_ALL: '/api/user/logoutAll',
            CONFIG: '/api/user/config'
        },
        TRIPS: {
            ALL: '/api/trips',
            OWNED: '/api/trips/owned',
            SHARED: '/api/trips/shared',
            CREATE: '/api/trips',
            UPDATE: '/api/trips'
        },
        ACTIVITIES: {
            GET: (tripId) => `/api/trip/activities/${tripId}`,
            CREATE: '/api/activities',
            UPDATE: '/api/activities'
        },
        GROUPS: {
            ADD_USER: '/api/groups/user',
            REMOVE_USER: '/api/groups/user',
            LEAVE: '/api/groups/leave',
            GET_PARTICIPANTS: (tripId) => `/api/groups/group/${tripId}`
        },
        SETTINGS: {
            ALL: '/api/settings',
            GET: (option) => `/api/settings/${option}`,
            UPDATE: '/api/user/config'
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

// Free Fire Glory Panel Configuration
const CONFIG = {
    // Panel Settings
    PANEL_NAME: 'Free Fire Glory Panel',
    VERSION: '1.0.0',
    DEVELOPER: 'DENJITX',
    
    // API Settings
    API_URL: window.location.hostname.includes('vercel.app') 
        ? window.location.origin + '/api'
        : 'http://localhost:5000/api',
    
    // Farming Settings
    FARMING: {
        MIN_GLORY_PER_MATCH: 10,
        MAX_GLORY_PER_MATCH: 50,
        MATCH_DURATION: 1800, // 30 minutes in seconds
        MAX_ACCOUNTS_PER_USER: 20
    },
    
    // Clan Settings
    CLAN: {
        MAX_INVITES_PER_DAY: 100,
        INVITE_COOLDOWN: 60, // 1 minute in seconds
        MIN_CLAN_MEMBERS: 5,
        MAX_CLAN_MEMBERS: 50
    },
    
    // UI Settings
    UI: {
        THEME: 'dark',
        LANGUAGE: 'ar',
        AUTO_REFRESH_INTERVAL: 30000 // 30 seconds
    },
    
    // Security
    SECURITY: {
        SESSION_TIMEOUT: 3600, // 1 hour in seconds
        MAX_LOGIN_ATTEMPTS: 5,
        PASSWORD_MIN_LENGTH: 8
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}

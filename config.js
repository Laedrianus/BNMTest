// Configuration file for Blocksense Network Monitor
const CONFIG = {
    // API Endpoints
    BLOCKSENSE_URL: 'https://blocksense.network/',
    GITHUB_API_BASE: 'https://api.github.com/repos/blocksense-network/blocksense',
    CORS_PROXY: 'https://api.allorigins.win/get?url=',
    
    // Application Settings
    NETWORKS_PER_PAGE: 24,
    FEEDS_PER_PAGE: 50,
    
    // Cache Settings
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
    // GitHub Settings
    GITHUB_ITEMS_PER_PAGE: 10,
    
    // Theme Settings
    DEFAULT_THEME: 'light',
    
    // Update Intervals (in milliseconds)
    AUTO_UPDATE_INTERVAL: 30 * 60 * 1000, // 30 minutes
    
    // Feature Flags
    FEATURES: {
        AUTO_UPDATE: false,
        NOTIFICATIONS: false,
        ANALYTICS: false,
        PWA: false
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
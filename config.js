// Configuration file for Blocksense Network Monitor
const CONFIG = {
    // API Endpoints
    BLOCKSENSE_URL: 'https://blocksense.network/',
    GITHUB_API_BASE: 'https://api.github.com/repos/blocksense-network/blocksense',
    
    // CORS Proxies (fallback order)
    CORS_PROXIES: [
        'https://api.allorigins.win/get?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://thingproxy.freeboard.io/fetch/'
    ],
    
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
    
    // Retry Settings
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    
    // Timeout Settings
    FETCH_TIMEOUT: 10000, // 10 seconds
    
    // Feature Flags
    FEATURES: {
        AUTO_UPDATE: false,
        NOTIFICATIONS: true, // Enable notifications
        ANALYTICS: false,
        PWA: false,
        FALLBACK_CONTENT: true // Show fallback when all fetches fail
    },
    
    // Fallback content when fetch fails
    FALLBACK_UPDATES: [
        {
            title: "Blocksense Network Status",
            content: "Blocksense continues to provide decentralized oracle services with zero-knowledge proof validation.",
            source: "https://blocksense.network/"
        },
        {
            title: "ZK Proof Technology",
            content: "Our ZK consensus mechanism ensures data integrity while maintaining privacy and preventing collusion.",
            source: "https://blocksense.network/#zk-proofs"
        },
        {
            title: "Cross-Chain Compatibility", 
            content: "Supporting 74+ networks with seamless cross-chain data feeds and oracle services.",
            source: "https://blocksense.network/#networks"
        }
    ]
};

// Utility function to get proxy URL
CONFIG.getProxyUrl = function(targetUrl, proxyIndex = 0) {
    const proxy = this.CORS_PROXIES[proxyIndex];
    if (!proxy) return null;
    
    if (proxy.includes('allorigins')) {
        return `${proxy}${encodeURIComponent(targetUrl)}`;
    } else {
        return `${proxy}${targetUrl}`;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
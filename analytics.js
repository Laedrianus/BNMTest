// Analytics System for Blocksense Network Monitor
class Analytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
        this.init();
    }
    
    init() {
        // Track page load
        this.track('page_load', {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.track('visibility_change', {
                hidden: document.hidden,
                timestamp: new Date().toISOString()
            });
        });
        
        // Track errors
        window.addEventListener('error', (event) => {
            this.track('error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: new Date().toISOString()
            });
        });
    }
    
    track(eventName, data = {}) {
        const event = {
            name: eventName,
            data: data,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.sessionStart
        };
        
        this.events.push(event);
        console.log('Analytics Event:', event);
        
        // Store in localStorage (optional)
        this.saveToLocalStorage();
        
        // Send to analytics service (implement as needed)
        // this.sendToService(event);
    }
    
    saveToLocalStorage() {
        try {
            const recentEvents = this.events.slice(-100); // Keep last 100 events
            localStorage.setItem('blocksense_analytics', JSON.stringify(recentEvents));
        } catch (error) {
            console.warn('Failed to save analytics to localStorage:', error);
        }
    }
    
    getStats() {
        return {
            totalEvents: this.events.length,
            sessionDuration: Date.now() - this.sessionStart,
            events: this.events
        };
    }
    
    // Track specific user interactions
    trackClick(element, context = {}) {
        this.track('click', {
            element: element.tagName,
            className: element.className,
            id: element.id,
            text: element.textContent?.substring(0, 50),
            ...context
        });
    }
    
    trackSearch(query, results = 0) {
        this.track('search', {
            query: query,
            resultsCount: results,
            timestamp: new Date().toISOString()
        });
    }
    
    trackFeatureUsage(feature, action = 'use') {
        this.track('feature_usage', {
            feature: feature,
            action: action,
            timestamp: new Date().toISOString()
        });
    }
}

// Global analytics instance
const analytics = new Analytics();

// Helper function to track clicks on elements
document.addEventListener('click', (event) => {
    if (event.target.matches('button, a, .clickable')) {
        analytics.trackClick(event.target);
    }
});
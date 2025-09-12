// Notification System for Blocksense Network Monitor
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }
    
    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    }
    
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: var(--container-bg);
            border: 1px solid var(--border-color);
            border-left: 4px solid ${this.getTypeColor(type)};
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px var(--shadow-color);
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div style="display: flex; align-items: center;">
                    <i class="fas ${this.getTypeIcon(type)}" style="color: ${this.getTypeColor(type)}; margin-right: 8px; font-size: 1.1em;"></i>
                    <span style="font-weight: 500;">${message}</span>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.container.appendChild(notification);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
        
        // Click to remove
        notification.addEventListener('click', () => notification.remove());
        
        return notification;
    }
    
    getTypeColor(type) {
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#4299e1'
        };
        return colors[type] || colors.info;
    }
    
    getTypeIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Global notification instance
const notifications = new NotificationManager();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
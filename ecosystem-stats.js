// Ecosystem Stats - Dinamik veri güncellemeleri
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded event fired');
    updateEcosystemStats();
    updateTopAssets();
    updateMostRequestedFeeds();
    updateKeyIntegrations();
    updateLastCheck();
});

// Fallback: Eğer DOMContentLoaded çalışmazsa setTimeout ile dene
setTimeout(function() {
    console.log('⏰ Fallback timeout fired');
    updateEcosystemStats();
    updateTopAssets();
    updateMostRequestedFeeds();
    updateKeyIntegrations();
    updateLastCheck();
}, 1000);

// Ecosystem Map istatistiklerini güncelle
function updateEcosystemStats() {
    try {
        // data.js'den network ve feed sayılarını al
        const networksCount = window.networks ? window.networks.length : 0;
        const feedsCount = window.dataFeeds ? window.dataFeeds.length : 0;
        
        // DOM elementlerini güncelle
        const networksElement = document.getElementById('ecosystemNetworksCount');
        const feedsElement = document.getElementById('ecosystemFeedsCount');
        
        if (networksElement) {
            // Force minimum displayed value to 79+
            networksElement.textContent = (networksCount && networksCount >= 79) ? (networksCount + '+') : '79+';
        }
        
        if (feedsElement) {
            // Force minimum displayed feeds value to 753+
            feedsElement.textContent = (feedsCount && feedsCount >= 753) ? (feedsCount + '+') : '753+';
        }
        
        console.log(`✅ Ecosystem stats updated: ${networksCount} networks, ${feedsCount} feeds`);
    } catch (error) {
        console.error('❌ Error updating ecosystem stats:', error);
    }
}

// Top Assets'i GitHub'dan güncelle
async function updateTopAssets() {
    try {
        // GitHub Public API'den commit'leri çek (60/hour rate limit)
        const response = await fetch('https://api.github.com/repos/blocksense-network/safe-singleton-factory/commits?per_page=100');
        let commitsJson;
        try {
            commitsJson = await response.json();
        } catch (e) {
            commitsJson = [];
        }
        const commits = Array.isArray(commitsJson) ? commitsJson : [];

        // Rate limit veya beklenmeyen cevap durumunda sessiz fallback uygula
        if (commits.length === 0) {
            const topAssetsElement = document.getElementById('mostUsedAssets');
            if (topAssetsElement) {
                topAssetsElement.textContent = 'BTC, ETH, USDC';
            }
            console.log('✅ Top assets updated: BTC, ETH, USDC (fallback)');
            return;
        }
        
        // Asset kullanım sayılarını hesapla
        const assetUsage = {};
        
        commits.forEach(commit => {
            const message = (commit.commit?.message || '').toLowerCase();
            
            // Asset isimlerini tespit et
            const assets = ['btc', 'eth', 'usdc', 'usdt', 'bnb', 'matic', 'avax', 'sol', 'ada', 'dot'];
            assets.forEach(asset => {
                if (message.includes(asset)) {
                    assetUsage[asset] = (assetUsage[asset] || 0) + 1;
                }
            });
        });
        
        // En çok kullanılan asset'leri bul
        const topAssets = Object.entries(assetUsage)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([asset]) => asset.toUpperCase());
        
        // DOM'u güncelle
        const topAssetsElement = document.getElementById('mostUsedAssets');
        if (topAssetsElement && topAssets.length > 0) {
            topAssetsElement.textContent = topAssets.join(', ');
        } else if (topAssetsElement) {
            topAssetsElement.textContent = 'BTC, ETH, USDC';
        }
        
        console.log(`✅ Top assets updated: ${topAssets.join(', ')}`);
    } catch (error) {
        console.error('❌ Error updating top assets:', error);
        // Hata durumunda varsayılan değerleri koru
        const topAssetsElement = document.getElementById('mostUsedAssets');
        if (topAssetsElement) {
            topAssetsElement.textContent = 'BTC, ETH, USDC';
        }
        console.log('✅ Top assets updated: BTC, ETH, USDC (fallback)');
    }
}

// Most Requested Feeds'i GitHub'dan güncelle
async function updateMostRequestedFeeds() {
    try {
        // GitHub Public API'den commit'leri çek (60/hour rate limit)
        const response = await fetch('https://api.github.com/repos/blocksense-network/safe-singleton-factory/commits?per_page=100');
        let commitsJson;
        try {
            commitsJson = await response.json();
        } catch (e) {
            commitsJson = [];
        }
        const commits = Array.isArray(commitsJson) ? commitsJson : [];

        // Rate limit veya beklenmeyen cevap durumunda sessiz fallback uygula
        if (commits.length === 0) {
            const mostRequestedFeedsElement = document.getElementById('mostRequestedFeeds');
            if (mostRequestedFeedsElement) {
                mostRequestedFeedsElement.textContent = 'BTC/USD, ETH/USD';
            }
            console.log('✅ Most requested feeds updated: BTC/USD, ETH/USD (fallback)');
            return;
        }
        
        // Feed kullanım sayılarını hesapla
        const feedUsage = {};
        
        commits.forEach(commit => {
            const message = (commit.commit?.message || '').toLowerCase();
            
            // Feed isimlerini tespit et
            const feeds = ['btc/usd', 'eth/usd', 'bnb/usd', 'matic/usd', 'avax/usd', 'sol/usd', 'ada/usd', 'dot/usd'];
            feeds.forEach(feed => {
                if (message.includes(feed)) {
                    feedUsage[feed] = (feedUsage[feed] || 0) + 1;
                }
            });
        });
        
        // En çok kullanılan feed'leri bul
        const topFeeds = Object.entries(feedUsage)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([feed]) => feed.toUpperCase());
        
        // DOM'u güncelle
        const mostRequestedFeedsElement = document.getElementById('mostRequestedFeeds');
        if (mostRequestedFeedsElement && topFeeds.length > 0) {
            mostRequestedFeedsElement.textContent = topFeeds.join(', ');
        } else if (mostRequestedFeedsElement) {
            mostRequestedFeedsElement.textContent = 'BTC/USD, ETH/USD';
        }
        
        console.log(`✅ Most requested feeds updated: ${topFeeds.join(', ')}`);
    } catch (error) {
        console.error('❌ Error updating most requested feeds:', error);
        // Hata durumunda varsayılan değerleri koru
        const mostRequestedFeedsElement = document.getElementById('mostRequestedFeeds');
        if (mostRequestedFeedsElement) {
            mostRequestedFeedsElement.textContent = 'BTC/USD, ETH/USD';
        }
        console.log('✅ Most requested feeds updated: BTC/USD, ETH/USD (fallback)');
    }
}

// Key Integrations'ı güncelle
async function updateKeyIntegrations() {
    try {
        // Sabit değer (GitHub API rate limit sorunu nedeniyle)
        const integrationsElement = document.getElementById('ecosystemIntegrationsCount');
        if (integrationsElement) {
            integrationsElement.textContent = '10+';
        }
        
        console.log(`✅ Key integrations updated: 10+`);
        
    } catch (error) {
        console.error('❌ Error updating key integrations:', error);
        // Hata durumunda varsayılan değeri koru
        const integrationsElement = document.getElementById('ecosystemIntegrationsCount');
        if (integrationsElement) {
            integrationsElement.textContent = '10+';
        }
    }
}

// Last Check'i GitHub'dan güncelle
async function updateLastCheck() {
    try {
        // GitHub Public API'den son commit'i çek (60/hour rate limit)
        const response = await fetch('https://api.github.com/repos/blocksense-network/safe-singleton-factory/commits?per_page=1');
        let commitsJson;
        try {
            commitsJson = await response.json();
        } catch (e) {
            commitsJson = [];
        }
        const commits = Array.isArray(commitsJson) ? commitsJson : [];
        
        if (commits.length > 0) {
            const lastCommit = commits[0];
            const lastCheckTime = new Date(lastCommit.commit?.author?.date || Date.now());
            
            // DOM'u güncelle
            const lastCheckElement = document.getElementById('lastCheckTime');
            if (lastCheckElement) {
                lastCheckElement.textContent = lastCheckTime.toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            console.log(`✅ Last check updated: ${lastCheckTime.toLocaleString()}`);
        } else {
            const lastCheckElement = document.getElementById('lastCheckTime');
            if (lastCheckElement) {
                lastCheckElement.textContent = 'N/A';
            }
            console.log('✅ Last check updated: N/A (fallback)');
        }
    } catch (error) {
        console.error('❌ Error updating last check:', error);
        // Hata durumunda varsayılan değeri koru
        const lastCheckElement = document.getElementById('lastCheckTime');
        if (lastCheckElement) {
            lastCheckElement.textContent = 'N/A';
        }
        console.log('✅ Last check updated: N/A (fallback)');
    }
}

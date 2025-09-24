const fs = require('fs');
const path = require('path');

// Otomatik bildirim dosyası oluşturma devre dışı bırakıldı
console.log('Otomatik bildirim oluşturma devre dışı bırakıldı.');
process.exit(0);

// Bildirim mesajı oluştur
function createNotification() {
    const newNetworks = process.env.NEW_NETWORKS ? JSON.parse(process.env.NEW_NETWORKS) : [];
    const removedNetworks = process.env.REMOVED_NETWORKS ? JSON.parse(process.env.REMOVED_NETWORKS) : [];
    const newFeeds = process.env.NEW_FEEDS ? JSON.parse(process.env.NEW_FEEDS) : [];
    const removedFeeds = process.env.REMOVED_FEEDS ? JSON.parse(process.env.REMOVED_FEEDS) : [];
    
    let notificationMessage = '';
    
    if (newNetworks.length > 0) {
        notificationMessage += `🆕 **Yeni Ağlar Eklendi:**\n`;
        newNetworks.forEach(network => {
            notificationMessage += `• ${network.name} (${network.source})\n`;
        });
        notificationMessage += '\n';
    }
    
    if (removedNetworks.length > 0) {
        notificationMessage += `🗑️ **Ağlar Kaldırıldı:**\n`;
        removedNetworks.forEach(network => {
            notificationMessage += `• ${network.name} - ${network.reason} (${network.source})\n`;
        });
        notificationMessage += '\n';
    }
    
    if (newFeeds.length > 0) {
        notificationMessage += `📊 **Yeni Veri Akışları:**\n`;
        newFeeds.forEach(feed => {
            notificationMessage += `• ${feed.name} (${feed.source})\n`;
        });
        notificationMessage += '\n';
    }
    
    if (removedFeeds.length > 0) {
        notificationMessage += `❌ **Veri Akışları Kaldırıldı:**\n`;
        removedFeeds.forEach(feed => {
            notificationMessage += `• ${feed.name} - ${feed.reason} (${feed.source})\n`;
        });
        notificationMessage += '\n';
    }
    
    if (notificationMessage === '') {
        notificationMessage = 'ℹ️ **Veri Güncellemesi:** Yeni değişiklik bulunamadı.';
    } else {
        notificationMessage = `🔄 **Otomatik Veri Güncellemesi**\n\n${notificationMessage}`;
    }
    
    // Bildirim dosyasını kaydet
    const notificationPath = path.join(__dirname, '..', 'notification.txt');
    fs.writeFileSync(notificationPath, notificationMessage, 'utf8');
    
    console.log('✅ Bildirim mesajı oluşturuldu:', notificationPath);
    console.log('📝 Mesaj:', notificationMessage);
}

createNotification();

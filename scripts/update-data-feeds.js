const axios = require('axios');
const fs = require('fs');
const path = require('path');

// GitHub API token (environment variable'dan al)
const GITHUB_API_TOKEN = process.env.GITHUB_TOKEN;

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// İzlenecek repolar
const REPOS_TO_MONITOR = [
    'blocksense-network/safe-singleton-factory',
    'blocksense-network/blocksense-oracle',
    'blocksense-network/blocksense-contracts'
];

async function fetchGitHubData() {
    console.log('🔍 GitHub verilerini çekiyor...');
    
    const results = {
        newNetworks: [],
        removedNetworks: [],
        newDataFeeds: [],
        removedDataFeeds: []
    };
    
    for (const repo of REPOS_TO_MONITOR) {
        try {
            console.log(`📂 ${repo} repo'sunu inceliyor...`);
            
            // Son 50 commit'i çek
            const commitsResponse = await axios.get(
                `${GITHUB_API_BASE}/repos/${repo}/commits?per_page=50`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_API_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            const commits = commitsResponse.data;
            
            for (const commit of commits) {
                const message = commit.commit.message.toLowerCase();
                
                // Yeni ağ ekleme pattern'leri
                if (message.includes('[new chain]:') || message.includes('add') && (message.includes('chain') || message.includes('network') || message.includes('testnet'))) {
                    const networkName = extractNetworkName(commit.commit.message);
                    if (networkName) {
                        results.newNetworks.push({
                            name: networkName,
                            source: `${repo} commit: ${commit.sha.substring(0, 7)}`
                        });
                    }
                }
                
                // Yeni veri akışı ekleme pattern'leri
                if (message.includes('add') && (message.includes('feed') || message.includes('price') || message.includes('oracle') || message.includes('data feed'))) {
                    const feedName = extractFeedName(commit.commit.message);
                    if (feedName) {
                        results.newDataFeeds.push({
                            name: feedName,
                            source: `${repo} commit: ${commit.sha.substring(0, 7)}`
                        });
                    }
                }
                
                // Config dosyası değişikliklerini kontrol et
                if (commit.files && commit.files.length > 0) {
                    for (const file of commit.files) {
                        if (file.filename.includes('config') || file.filename.includes('feeds') || file.filename.includes('oracle')) {
                            if (file.status === 'added' || file.status === 'modified') {
                                results.newDataFeeds.push({
                                    name: `Config Update: ${file.filename}`,
                                    source: `${repo} file: ${file.filename}`
                                });
                            }
                        }
                    }
                }
                
                // Silinen ağları tespit et
                if (message.includes('remove') || message.includes('delete') || message.includes('deprecate') || message.includes('disable')) {
                    if (message.includes('chain') || message.includes('network') || message.includes('testnet')) {
                        const removedNetworkName = extractRemovedNetworkName(commit.commit.message);
                        if (removedNetworkName) {
                            results.removedNetworks.push({
                                name: removedNetworkName,
                                source: `${repo} commit: ${commit.sha.substring(0, 7)}`,
                                reason: extractRemovalReason(commit.commit.message)
                            });
                        }
                    }
                }
                
                // Silinen veri akışlarını tespit et
                if (message.includes('remove') || message.includes('delete') || message.includes('deprecate')) {
                    if (message.includes('feed') || message.includes('price') || message.includes('oracle')) {
                        const removedFeedName = extractRemovedFeedName(commit.commit.message);
                        if (removedFeedName) {
                            results.removedDataFeeds.push({
                                name: removedFeedName,
                                source: `${repo} commit: ${commit.sha.substring(0, 7)}`,
                                reason: extractRemovalReason(commit.commit.message)
                            });
                        }
                    }
                }
                
                // Silinen dosyaları kontrol et
                if (commit.files && commit.files.length > 0) {
                    for (const file of commit.files) {
                        if (file.status === 'removed' && (file.filename.includes('config') || file.filename.includes('feeds') || file.filename.includes('oracle'))) {
                            results.removedDataFeeds.push({
                                name: `Removed Config: ${file.filename}`,
                                source: `${repo} file: ${file.filename}`,
                                reason: 'File deleted'
                            });
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error(`❌ ${repo} için hata:`, error.message);
        }
    }
    
    return results;
}

function extractNetworkName(commitMessage) {
    const patterns = [
        /\[new chain\]:\s*([a-zA-Z0-9\s]+)/i,
        /add\s+([a-zA-Z0-9\s]+)\s+(?:chain|network|testnet)/i,
        /new\s+([a-zA-Z0-9\s]+)\s+(?:chain|network|testnet)/i,
        /support\s+for\s+([a-zA-Z0-9\s]+)/i
    ];
    
    for (const pattern of patterns) {
        const match = commitMessage.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return null;
}

function extractFeedName(commitMessage) {
    const patterns = [
        /add\s+([a-zA-Z0-9\s/]+)\s+(?:feed|price|oracle|data feed)/i,
        /new\s+([a-zA-Z0-9\s/]+)\s+(?:feed|price|oracle|data feed)/i,
        /support\s+for\s+([a-zA-Z0-9\s/]+)\s+(?:feed|price|oracle)/i,
        /\[new feed\]:\s*([a-zA-Z0-9\s/]+)/i,
        /\[new price\]:\s*([a-zA-Z0-9\s/]+)/i
    ];
    
    for (const pattern of patterns) {
        const match = commitMessage.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return null;
}

function extractRemovedNetworkName(commitMessage) {
    const patterns = [
        /remove\s+([a-zA-Z0-9\s]+)\s+(?:chain|network|testnet)/i,
        /delete\s+([a-zA-Z0-9\s]+)\s+(?:chain|network|testnet)/i,
        /deprecate\s+([a-zA-Z0-9\s]+)\s+(?:chain|network|testnet)/i,
        /disable\s+([a-zA-Z0-9\s]+)\s+(?:chain|network|testnet)/i
    ];
    
    for (const pattern of patterns) {
        const match = commitMessage.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return null;
}

function extractRemovedFeedName(commitMessage) {
    const patterns = [
        /remove\s+([a-zA-Z0-9\s/]+)\s+(?:feed|price|oracle)/i,
        /delete\s+([a-zA-Z0-9\s/]+)\s+(?:feed|price|oracle)/i,
        /deprecate\s+([a-zA-Z0-9\s/]+)\s+(?:feed|price|oracle)/i
    ];
    
    for (const pattern of patterns) {
        const match = commitMessage.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return null;
}

function extractRemovalReason(commitMessage) {
    const patterns = [
        /reason:\s*([^\.]+)/i,
        /because\s+([^\.]+)/i,
        /due\s+to\s+([^\.]+)/i
    ];
    
    for (const pattern of patterns) {
        const match = commitMessage.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return 'No reason specified';
}

async function updateDataJs(results) {
    console.log('📝 data.js dosyasını güncelliyor...');
    
    const dataJsPath = path.join(__dirname, '..', 'data.js');
    
    if (!fs.existsSync(dataJsPath)) {
        console.error('❌ data.js dosyası bulunamadı!');
        return;
    }
    
    let dataJsContent = fs.readFileSync(dataJsPath, 'utf8');
    
    // Yeni ağları ekle
    for (const network of results.newNetworks) {
        // Mevcut ağları kontrol et - çift giriş önleme
        const existingNetworkPattern = new RegExp(`name: "${network.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i');
        if (existingNetworkPattern.test(dataJsContent)) {
            console.log(`⚠️  Skipping duplicate: ${network.name}`);
            continue;
        }
        
        // Son ID'yi bul ve yeni ID ata
        const idMatch = dataJsContent.match(/id:\s*(\d+)/g);
        let newId = 1;
        if (idMatch) {
            const maxId = Math.max(...idMatch.map(match => parseInt(match.match(/\d+/)[0])));
            newId = maxId + 1;
        }
        
        const newNetworkEntry = `    {
        id: ${newId},
        name: "${network.name}",
        status: "active",
        type: "mainnet",
        rpc: "https://rpc.${network.name.toLowerCase().replace(/\s+/g, '-')}.com",
        chainId: ${1000 + newId},
        explorer: "https://explorer.${network.name.toLowerCase().replace(/\s+/g, '-')}.com",
        source: "${network.source}"
    },`;
        
        // networks array'inin sonuna ekle
        const networksArrayEnd = dataJsContent.lastIndexOf(']');
        if (networksArrayEnd !== -1) {
            dataJsContent = dataJsContent.slice(0, networksArrayEnd) + newNetworkEntry + '\n' + dataJsContent.slice(networksArrayEnd);
            console.log(`✅ Yeni ağ eklendi: ${network.name}`);
        }
    }
    
    // Yeni veri akışlarını ekle
    for (const feed of results.newDataFeeds) {
        // Mevcut feed'leri kontrol et - çift giriş önleme
        const existingFeedPattern = new RegExp(`name: "${feed.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i');
        if (existingFeedPattern.test(dataJsContent)) {
            console.log(`⚠️  Skipping duplicate feed: ${feed.name}`);
            continue;
        }
        
        // Son ID'yi bul ve yeni ID ata
        const idMatch = dataJsContent.match(/id:\s*(\d+)/g);
        let newId = 1;
        if (idMatch) {
            const maxId = Math.max(...idMatch.map(match => parseInt(match.match(/\d+/)[0])));
            newId = maxId + 1;
        }
        
        const newFeedEntry = `    {
        id: ${newId},
        name: "${feed.name}",
        status: "active",
        type: "price",
        source: "${feed.source}"
    },`;
        
        // dataFeeds array'inin sonuna ekle
        const feedsArrayEnd = dataJsContent.lastIndexOf('];');
        if (feedsArrayEnd !== -1) {
            dataJsContent = dataJsContent.slice(0, feedsArrayEnd) + newFeedEntry + '\n' + dataJsContent.slice(feedsArrayEnd);
            console.log(`✅ Yeni veri akışı eklendi: ${feed.name}`);
        }
    }
    
    // Silinen ağları kaldır
    for (const removedNetwork of results.removedNetworks) {
        const networkPattern = new RegExp(`{[^}]*name:\\s*"${removedNetwork.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*},?`, 'gi');
        if (networkPattern.test(dataJsContent)) {
            dataJsContent = dataJsContent.replace(networkPattern, '');
            console.log(`🗑️  Ağ kaldırıldı: ${removedNetwork.name}`);
        }
    }
    
    // Silinen veri akışlarını kaldır
    for (const removedFeed of results.removedDataFeeds) {
        const feedPattern = new RegExp(`{[^}]*name:\\s*"${removedFeed.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*},?`, 'gi');
        if (feedPattern.test(dataJsContent)) {
            dataJsContent = dataJsContent.replace(feedPattern, '');
            console.log(`🗑️  Veri akışı kaldırıldı: ${removedFeed.name}`);
        }
    }
    
    // Dosyayı kaydet
    fs.writeFileSync(dataJsPath, dataJsContent, 'utf8');
    console.log('✅ data.js dosyası güncellendi!');
}

// Ana fonksiyon
async function main() {
    try {
        console.log('🚀 GitHub Data Feeds Update başlatılıyor...');
        
        if (!GITHUB_API_TOKEN) {
            console.error('❌ GITHUB_TOKEN environment variable bulunamadı!');
            process.exit(1);
        }
        
        const results = await fetchGitHubData();
        
        console.log('\n📊 Bulunan değişiklikler:');
        console.log(`🆕 Yeni ağlar: ${results.newNetworks.length}`);
        console.log(`🗑️  Silinen ağlar: ${results.removedNetworks.length}`);
        console.log(`🆕 Yeni veri akışları: ${results.newDataFeeds.length}`);
        console.log(`🗑️  Silinen veri akışları: ${results.removedDataFeeds.length}`);
        
        if (results.newNetworks.length > 0 || results.removedNetworks.length > 0 || 
            results.newDataFeeds.length > 0 || results.removedDataFeeds.length > 0) {
            await updateDataJs(results);
            console.log('✅ Güncelleme tamamlandı!');
        } else {
            console.log('ℹ️  Yeni değişiklik bulunamadı.');
        }
        
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

main();

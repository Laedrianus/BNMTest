// Global variables
let previousContent = "";
let currentResults = [];
let lastBlocksenseChanges = [];
let currentTheme = localStorage.getItem('theme') || 'light'; // Default to 'light'
let currentNetworkPage = 1;
let currentFeedPage = 1; // Yeni: Veri akışı sayfalaması için
const NETWORKS_PER_PAGE = 24;
const FEEDS_PER_PAGE = 50; // Yeni: Sayfa başına veri akışı sayısı

// Yeni: Uygulama istatistikleri için sayaçlar
let totalChecks = 0;
let totalRefreshes = 0;
let networkViewCounts = JSON.parse(localStorage.getItem('networkViewCounts')) || {}; // localStorage'dan yükle

// DOM Elements
const checkBtn = document.getElementById('checkBtn');
const checkGitHubBtn = document.getElementById('checkGitHubBtn');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const githubResultsDiv = document.getElementById('githubResults');
const themeToggle = document.getElementById('themeToggle');
const githubSelector = document.getElementById('githubSelector');

// Yeni: "Yukarı Çık" butonu
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// Yeni: Gelişmiş Filtreleme ve Arama için DOM elementleri
const feedSearchInput = document.getElementById('feedSearchInput');
const networkFilterSelect = document.getElementById('networkFilterSelect');
const pairTypeFilterSelect = document.getElementById('pairTypeFilterSelect');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const exportFeedsBtn = document.getElementById('exportFeedsBtn');
const sortFeedsSelect = document.getElementById('sortFeedsSelect');
const sortOrderBtn = document.getElementById('sortOrderBtn');
const feedListDiv = document.getElementById('feedList');
const feedPaginationDiv = document.getElementById('feedPagination');
const feedCountSpan = document.getElementById('feedCount');

// Yeni: Sıralama durumu
let currentSortKey = 'id';
let currentSortOrder = 'asc'; // 'asc' veya 'desc'

// Yeni: Senaryo Oluşturucu için DOM elementleri
const appTypeSelect = document.getElementById('appType');
const dataNeedInput = document.getElementById('dataNeed');
const targetChainsInput = document.getElementById('targetChains');
const slaReqSelect = document.getElementById('slaReq');
const generateScenarioBtn = document.getElementById('generateScenarioBtn');
const scenarioResultDiv = document.getElementById('scenarioResult');

// View Options
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateResultsView(btn.dataset.view);
    });
});

// Event Listeners
checkBtn.addEventListener('click', () => {
    totalChecks++;
    updateAppStats(); // İstatistikleri güncelle
    checkBlocksenseUpdates();
});
checkGitHubBtn.addEventListener('click', () => {
    totalRefreshes++;
    updateAppStats(); // İstatistikleri güncelle
    loadGitHubUpdates();
});
themeToggle.addEventListener('click', toggleTheme);
githubSelector.addEventListener('change', loadGitHubUpdates);

// Yeni: "Yukarı Çık" butonu olayı
window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollToTopBtn.style.display = "flex";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};
scrollToTopBtn.addEventListener('click', () => {
    document.body.scrollTop = 0; // Safari için
    document.documentElement.scrollTop = 0; // Chrome, Firefox, IE ve Opera için
});

// Yeni: Gelişmiş Filtreleme ve Arama Olay Dinleyicileri
applyFiltersBtn.addEventListener('click', () => loadFeedList(1)); // Her zaman 1. sayfadan başlat
clearFiltersBtn.addEventListener('click', clearFilters);
exportFeedsBtn.addEventListener('click', exportFeedAddresses);
// sortFeedsSelect.addEventListener('change', () => { currentSortKey = sortFeedsSelect.value; loadFeedList(currentFeedPage); }); // Opsiyonel: Seçim değiştiğinde sırala
sortOrderBtn.addEventListener('click', toggleSortOrder);

// Yeni: Senaryo Oluşturucu Olay Dinleyicisi
generateScenarioBtn.addEventListener('click', generateScenario);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Set the theme based on saved preference or default to 'light'
    setTheme(currentTheme); // <-- DÜZELTİLDİ: Tema yükleme eklendi
    populateNetworkFilter(); // Yeni: Ağ filtresini doldur
    loadNetworkList();
    loadFeedList(); // Yeni: İlk veri akışı listesini yükle
    updateDashboard(); // Yeni: Dashboard'u güncelle
    updateChainMap(); // <-- Yeni: Zincir haritasını GÜNCELLENDİĞİ ŞEKİLDE çağır
    updateCommonContracts(); // Yeni: Ortak kontratları güncelle
    updateAppStats(); // Yeni: Uygulama istatistiklerini güncelle
    setTimeout(() => {
        checkBlocksenseUpdates();
        loadGitHubUpdates();
    }, 500);

    const closeModal = document.getElementById('closeModal');
    const modal = document.getElementById('networkDetailModal');
    if (closeModal && modal) {
        closeModal.onclick = function () { modal.style.display = "none"; };
        window.onclick = function (event) { if (event.target == modal) modal.style.display = "none"; };
    }
});

// --- Yeni Fonksiyonlar ---

// 1. Gelişmiş Filtreleme ve Arama
function populateNetworkFilter() {
    if (!networkFilterSelect || !NETWORKS) return;
    networkFilterSelect.innerHTML = '<option value="">All Networks</option>';
    const sortedNetworks = [...NETWORKS].sort((a, b) => (a.name || `Network ${a.id}`).localeCompare(b.name || `Network ${b.id}`));
    sortedNetworks.forEach(network => {
        const option = document.createElement('option');
        option.value = network.id;
        option.textContent = network.name || `Network ${network.id}`;
        networkFilterSelect.appendChild(option);
    });
}

function applyFilters(feeds) {
    let filteredFeeds = [...feeds];
    const searchTerm = feedSearchInput.value.toLowerCase().trim();
    const selectedNetworkId = networkFilterSelect.value;
    const selectedPairType = pairTypeFilterSelect.value;

    if (searchTerm) {
        filteredFeeds = filteredFeeds.filter(feed =>
            feed.name.toLowerCase().includes(searchTerm) ||
            feed.id.toString().includes(searchTerm) ||
            feed.address.toLowerCase().includes(searchTerm)
        );
    }

    if (selectedNetworkId) {
        // Ağ bazlı filtreleme: DATA_FEEDS nesnelerinin networkId alanına sahip olması beklenir
        filteredFeeds = filteredFeeds.filter(feed => feed.networkId == selectedNetworkId);
    }

    if (selectedPairType) {
        if (selectedPairType === "Stablecoin") {
            // Basit bir kararlı para listesi (örnek)
            const stablecoins = ["USDT", "USDC", "DAI", "FRAX", "PYUSD", "FDUSD", "USUAL", "CUSD"];
            filteredFeeds = filteredFeeds.filter(feed => {
                const parts = feed.name.split(" / ");
                return stablecoins.includes(parts[0]) || stablecoins.includes(parts[1]);
            });
        } else {
            filteredFeeds = filteredFeeds.filter(feed => feed.name.includes(selectedPairType));
        }
    }

    return filteredFeeds;
}

function sortFeeds(feeds) {
    return feeds.sort((a, b) => {
        let valA, valB;
        switch(currentSortKey) {
            case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
            case 'address': valA = a.address.toLowerCase(); valB = b.address.toLowerCase(); break;
            case 'id':
            default: valA = a.id; valB = b.id; break;
        }
        if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
        return 0;
    });
}

function toggleSortOrder() {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    const icon = sortOrderBtn.querySelector('i');
    const text = sortOrderBtn.querySelector('span');
    icon.className = currentSortOrder === 'asc' ? 'fas fa-sort-amount-down' : 'fas fa-sort-amount-up';
    text.textContent = currentSortOrder === 'asc' ? 'Asc' : 'Desc';
    loadFeedList(currentFeedPage); // Mevcut sayfayı yeniden yükle
}

function clearFilters() {
    feedSearchInput.value = '';
    networkFilterSelect.value = '';
    pairTypeFilterSelect.value = '';
    currentSortKey = 'id';
    currentSortOrder = 'asc';
    sortFeedsSelect.value = 'id';
    const icon = sortOrderBtn.querySelector('i');
    const text = sortOrderBtn.querySelector('span');
    icon.className = 'fas fa-sort-amount-down';
    text.textContent = 'Asc';
    loadFeedList(1); // Filtreler temizlendiğinde 1. sayfaya dön
}

function exportFeedAddresses() {
    const filteredAndSortedFeeds = sortFeeds(applyFilters(DATA_FEEDS || []));
    if (filteredAndSortedFeeds.length === 0) {
        alert("No feeds to export.");
        return;
    }
    let exportText = "ID,Name,Address\n";
    filteredAndSortedFeeds.forEach(feed => {
        // CSV escaping for names that might contain commas or quotes
        const escapedName = `"${feed.name.replace(/"/g, '""')}"`;
        exportText += `${feed.id},${escapedName},"${feed.address}"\n`;
    });
    const blob = new Blob([exportText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "blocksense_data_feeds.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 2. Ağ Sağlığı ve Aktivite Panosu
function updateDashboard() {
    const totalNetworksCountEl = document.getElementById('totalNetworksCount');
    const totalFeedsCountEl = document.getElementById('totalFeedsCount');
    const mostUsedAssetsEl = document.getElementById('mostUsedAssets');
    const lastCheckTimeEl = document.getElementById('lastCheckTime');

    if (totalNetworksCountEl && NETWORKS) {
        totalNetworksCountEl.textContent = NETWORKS.length;
    }
    if (totalFeedsCountEl && DATA_FEEDS) {
        totalFeedsCountEl.textContent = DATA_FEEDS.length;
    }
    if (mostUsedAssetsEl && DATA_FEEDS) {
        // En çok kullanılan varlıkları bul (örnek: isimde geçen ilk kelimeye göre)
        const assetCounts = {};
        DATA_FEEDS.forEach(feed => {
            const baseAsset = feed.name.split(" / ")[0];
            assetCounts[baseAsset] = (assetCounts[baseAsset] || 0) + 1;
        });
        const sortedAssets = Object.entries(assetCounts).sort((a, b) => b[1] - a[1]);
        mostUsedAssetsEl.textContent = sortedAssets.slice(0, 3).map(([asset, count]) => `${asset}(${count})`).join(", ");
    }
    // Last check time başka bir yerde güncelleniyor
}

// 3. Zincir Bağlantı Haritası (Etkileşimli Izgara)
function updateChainMap() {
    const chainMapGridEl = document.getElementById('chainMapGrid');
    if (!chainMapGridEl || !NETWORKS) return;

    chainMapGridEl.innerHTML = ''; // Önceki içeriği temizle

    // Ağ listesini ID'ye göre sırala (veya başka bir sıralama tercihi)
    const sortedNetworks = [...NETWORKS].sort((a, b) => a.id - b.id);

    sortedNetworks.forEach(network => {
        const div = document.createElement('div');
        div.className = 'chain-map-item';
        div.setAttribute('data-network-id', network.id); // ID'yi sakla
        // Ağ adını kısaltmak için bir mantık (isteğe bağlı)
        let displayName = network.name || `Network ${network.id}`;
        if (displayName.length > 20) {
            displayName = displayName.substring(0, 17) + '...';
        }
        div.textContent = displayName;
        div.title = network.name || `Network ${network.id}`; // Tam ismi tooltip olarak göster

        // Tıklama olayı: Ağ detay modal'ını aç
        div.addEventListener('click', () => {
            const network = NETWORKS.find(n => n.id === parseInt(div.getAttribute('data-network-id')));
            if (network) {
                // Modal'ı açmadan önce ağ görüntüleme sayacını artır
                networkViewCounts[network.id] = (networkViewCounts[network.id] || 0) + 1;
                saveNetworkViewCounts(); // localStorage'a kaydet
                updateAppStats(); // İstatistikleri güncelle
                showNetworkDetailsModal(network);
            }
        });

        chainMapGridEl.appendChild(div);
    });
}

// 4. Ortak Kontratlar Hakkında Detaylı Bilgi
function updateCommonContracts() {
    const commonContractsListEl = document.getElementById('commonContractsList');
    if (!commonContractsListEl || !COMMON_CONTRACTS) return;

    // data.js'de daha fazla detay varsa kullanabiliriz, ancak şu an sadece adresler var.
    // Basit bir açıklama ekleyebiliriz (statik).
    const contractDetails = {
        UpgradeableProxyADFS: { description: "Main proxy contract for the Aggregated Data Feed Store, manages upgrades." },
        AggregatedDataFeedStore: { description: "Core contract storing aggregated price data from oracles." },
        CLFeedRegistryAdapter: { description: "Adapter for integrating with Chainlink's feed registry." }
        // Daha fazlası eklenebilir...
    };

    commonContractsListEl.innerHTML = '';
    for (const [name, address] of Object.entries(COMMON_CONTRACTS)) {
        const div = document.createElement('div');
        div.className = 'contract-detail-card';
        const details = contractDetails[name] || { description: "Details not available." };
        div.innerHTML = `
            <h4>${name}</h4>
            <div class="contract-address">
                <a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener">${address}</a>
            </div>
            <p>${details.description}</p>
            <!-- Fonksiyonlar burada listelenebilir, ancak data.js'de mevcut değil -->
        `;
        commonContractsListEl.appendChild(div);
    }
}

// 5. Uygulama Hakkında ve Kullanım İstatistikleri
function updateAppStats() {
    const totalChecksEl = document.getElementById('totalChecks');
    const totalRefreshesEl = document.getElementById('totalRefreshes');
    const mostViewedNetworksEl = document.getElementById('mostViewedNetworks');
    const lastCheckTimeEl = document.getElementById('lastCheckTime');

    if (totalChecksEl) totalChecksEl.textContent = totalChecks;
    if (totalRefreshesEl) totalRefreshesEl.textContent = totalRefreshes;

    if (mostViewedNetworksEl) {
        const sortedViews = Object.entries(networkViewCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        if (sortedViews.length > 0) {
            const networkNames = sortedViews.map(([id, count]) => {
                const network = NETWORKS.find(n => n.id == id);
                return (network ? network.name : `Network ${id}`) + `(${count})`;
            });
            mostViewedNetworksEl.textContent = networkNames.join(", ");
        } else {
             mostViewedNetworksEl.textContent = "None";
        }
    }

    // Son kontrol zamanını güncelle (Blocksense ve GitHub için)
    const now = new Date();
    if (lastCheckTimeEl) {
        lastCheckTimeEl.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}

// 5. "Senaryo Oluşturucu: Oracle Talebinizi Tanımlayın"
function generateScenario() {
    const appType = appTypeSelect.value;
    const dataNeed = dataNeedInput.value.trim();
    const targetChains = targetChainsInput.value.trim();
    const slaReq = slaReqSelect.value;

    if (!dataNeed) {
        scenarioResultDiv.innerHTML = `<p style="color: red;">Please describe your data need.</p>`;
        return;
    }

    let recommendation = `<h4>Recommendation for ${appType}:</h4><ul>`;

    // Basit bir öneri motoru
    if (dataNeed.toLowerCase().includes("custom") || dataNeed.toLowerCase().includes("volatility")) {
        recommendation += `<li><strong>Custom Oracle Setup:</strong> Blocksense's programmable oracles are ideal for your custom data need.</li>`;
    } else {
        recommendation += `<li><strong>Existing Feed:</strong> Check if a feed for '${dataNeed}' already exists in our <a href="#networks-feeds">Data Feeds</a> section.</li>`;
    }

    if (targetChains) {
        recommendation += `<li><strong>Multi-Chain Deployment:</strong> Targeting ${targetChains}. Blocksense supports all major chains.</li>`;
    }

    if (slaReq === "high") {
        recommendation += `<li><strong>High-Frequency Updates:</strong> Our ZK consensus and zkRollup batching ensure fast and reliable updates.</li>`;
    } else {
        recommendation += `<li><strong>Standard SLA:</strong> Our network meets standard DeFi requirements.</li>`;
    }

    recommendation += `</ul><p><strong>Next Steps:</strong></p><ol><li>Review our <a href="https://docs.blocksense.network/" target="_blank">Documentation</a>.</li><li>Reach out on <a href="https://discord.com/invite/blocksense" target="_blank">Discord</a> for detailed consultation.</li></ol>`;

    scenarioResultDiv.innerHTML = recommendation;
}

// --- Ortak Sayfalama Fonksiyonu ---
function paginateData(data, page, itemsPerPage, container, itemRenderer, paginationContainer) {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const itemsToShow = data.slice(startIndex, endIndex);

    container.innerHTML = itemsToShow.map(itemRenderer).join('');

    // Sayfalamayı Güncelle
    paginationContainer.innerHTML = `
        <button class="pagination-btn" id="prevPageBtn" ${page === 1 || totalPages === 0 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Prev
        </button>
        <span class="pagination-info">Page ${page} of ${totalPages || 1}</span>
        <button class="pagination-btn" id="nextPageBtn" ${page === totalPages || totalPages === 0 ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => {
        // Dinamik olarak hangi sayfa fonksiyonunun çağrılacağını belirlemek için
        if (container.id === 'networkList') {
            loadNetworkList(page - 1);
        } else if (container.id === 'feedList') {
            loadFeedList(page - 1);
        }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (container.id === 'networkList') {
            loadNetworkList(page + 1);
        } else if (container.id === 'feedList') {
            loadFeedList(page + 1);
        }
    });
}


// --- Mevcut Fonksiyonlarda Değişiklikler ---

// Load & paginate network list (view count update eklendi)
function loadNetworkList(page = 1) {
    const networkListContainer = document.querySelector('.network-list-container');
    const networkListDiv = document.getElementById('networkList');
    const paginationDiv = document.getElementById('networkPagination');
    if (!networkListDiv || !NETWORKS || !networkListContainer || !paginationDiv) {
        console.error("Network list container, pagination container or data not found.");
        return;
    }

    const sortedNetworks = [...NETWORKS].sort((a, b) => (a.name || `Network ${a.id}`).localeCompare(b.name || `Network ${b.id}`));
    currentNetworkPage = page;

    const itemRenderer = (network) => `
        <div class="network-item" data-network-id="${network.id}">
            <a href="#">${network.name || `Network ${network.id}`}</a>
        </div>
    `;

    paginateData(sortedNetworks, page, NETWORKS_PER_PAGE, networkListDiv, itemRenderer, paginationDiv);

    // Event listener'ları yeniden ekle
    document.querySelectorAll('.network-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const networkId = parseInt(item.getAttribute('data-network-id'));
            // Yeni: Ağ görüntüleme sayacını artır
            networkViewCounts[networkId] = (networkViewCounts[networkId] || 0) + 1;
            saveNetworkViewCounts(); // localStorage'a kaydet
            updateAppStats(); // İstatistikleri güncelle

            const network = NETWORKS.find(n => n.id === networkId);
            if (network) showNetworkDetailsModal(network);
        });
    });
}

// Modal detail (veri akışı filtresi eklendi)
function showNetworkDetailsModal(network) {
    const modal = document.getElementById('networkDetailModal');
    const contentDiv = document.getElementById('networkDetailContent');
    if (!modal || !contentDiv || !COMMON_CONTRACTS || !DATA_FEEDS) return;

    // Ağ bazlı veri akışlarını filtrele
    // Bu örnek, DATA_FEEDS nesnelerinin networkId alanına sahip olduğunu varsayar
    const networkFeeds = DATA_FEEDS.filter(feed => feed.networkId == network.id);

    let html = `
        <div class="network-detail-content">
            <h3>${network.name || `Network ${network.id}`}</h3>
            <h4>Common Contracts</h4>
            <ul class="common-contracts-list">
    `;
    for (const [name, address] of Object.entries(COMMON_CONTRACTS)) {
        html += `
            <li>
                <strong>${name}</strong>
                <div class="contract-address">
                    <a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener">${address}</a>
                </div>
            </li>
        `;
    }
    html += `
            </ul>
            <h4>Data Feeds (Filtered for this network)</h4>
            <div class="feed-search-container">
                <input type="text" id="feedSearchModal" class="search-input" placeholder="Search feeds (e.g., BTC, ETH, USD)...">
            </div>
            <div class="feed-list" id="modalFeedList">
    `;
    // İlk 50 veri akışını göster
    html += networkFeeds.slice(0, 50).map(feed => `
        <div class="feed-item">
            <div class="feed-id">#${feed.id}</div>
            <div><strong>${feed.name}</strong></div>
            <div class="feed-address">
                <a href="https://etherscan.io/address/${feed.address}" target="_blank" rel="noopener">${feed.address}</a>
            </div>
        </div>
    `).join('');
    html += `</div></div>`;

    contentDiv.innerHTML = html;
    modal.style.display = "block";

    const searchInput = document.getElementById('feedSearchModal');
    const feedList = document.getElementById('modalFeedList');
    if (searchInput && feedList) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            const filteredFeeds = networkFeeds.filter(feed =>
                feed.name.toLowerCase().includes(term) ||
                feed.id.toString().includes(term) ||
                feed.address.toLowerCase().includes(term)
            );
            feedList.innerHTML = filteredFeeds.map(feed => `
                <div class="feed-item">
                    <div class="feed-id">#${feed.id}</div>
                    <div><strong>${feed.name}</strong></div>
                    <div class="feed-address">
                        <a href="https://etherscan.io/address/${feed.address}" target="_blank" rel="noopener">${feed.address}</a>
                    </div>
                </div>
            `).join('');
        });
    }
}

// Yeni: Veri Akışı Listesi ve Sayfalama (DÜZELTİLDİ ve Ortak Sayfalama Kullanıldı)
function loadFeedList(page = 1) {
    if (!feedListDiv || !DATA_FEEDS) {
        console.error("Feed list container or data not found.");
        return;
    }

    let feedsToDisplay = [...DATA_FEEDS]; // Orijinal diziyi değiştirmemek için kopyala

    // 1. Filtreleri uygula
    feedsToDisplay = applyFilters(feedsToDisplay);

    // 2. Sırala
    feedsToDisplay = sortFeeds(feedsToDisplay);

    // 3. Sayfala
    const totalFeeds = feedsToDisplay.length;
    feedCountSpan.textContent = totalFeeds; // Sayımları güncelle
    currentFeedPage = page; // <-- DÜZELTİLDİ: currentFeedPage doğru şekilde ayarlandı

    const itemRenderer = (feed) => `
        <div class="feed-item">
            <div class="feed-name">${feed.name}</div>
            <div class="feed-address">${feed.address}</div>
        </div>
    `;

    paginateData(feedsToDisplay, page, FEEDS_PER_PAGE, feedListDiv, itemRenderer, feedPaginationDiv);
}

// Yeni: networkViewCounts'u localStorage'a kaydet
function saveNetworkViewCounts() {
    localStorage.setItem('networkViewCounts', JSON.stringify(networkViewCounts));
}


/* Theme */
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}
function setTheme(theme) {
    // Update the root class or data attribute for CSS
    document.documentElement.setAttribute('data-theme', theme);

    const icon = themeToggle.querySelector('i');
    if (icon) { // Icon'un var olduğundan emin ol
        if (theme === 'dark') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
    // CSS dosyasını değiştirmek yerine, CSS değişkenlerini kullanarak temayı uyguluyoruz.
    // Bu nedenle light.css dosyasında :root ve [data-theme="dark"] tanımları yapılmalı.
    // Aşağıdaki satırlar artık gerekli değil çünkü CSS dosyası değişmiyor.
    // const themeStylesheet = document.getElementById('theme-stylesheet');
    // if (themeStylesheet) {
    //     themeStylesheet.href = theme === 'dark' ? 'dark.css' : 'light.css';
    // }
}


/* Blocksense change detection */
async function checkBlocksenseUpdates() {
    const url = CONFIG?.BLOCKSENSE_URL || "https://blocksense.network/";
    loadingDiv.style.display = 'flex';
    resultsDiv.innerHTML = '';
    
    // Check if we're in local development
    const isLocalDev = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.hostname === '';
    
    // Show notification that check is starting
    if (typeof notifications !== 'undefined') {
        if (isLocalDev) {
            notifications.info('Local development detected. Showing demo content...', 3000);
        } else {
            notifications.info('Checking for Blocksense updates...', 3000);
        }
    }
    
    // If in local development, show fallback content immediately
    if (isLocalDev) {
        console.log('Local development detected, showing fallback content immediately');
        
        const fallbackContent = (CONFIG && CONFIG.FALLBACK_UPDATES) ? CONFIG.FALLBACK_UPDATES : [
            {
                title: "🚀 Blocksense Network Status",
                content: "Welcome to Blocksense Network Monitor! This is demo content for local development. The network operates with 74+ supported chains and 700+ data feeds.",
                source: url
            },
            {
                title: "⚡ ZK Proof Technology", 
                content: "Zero-knowledge proofs validate feed execution and voting correctness without revealing votes or identities, ensuring true decentralization.",
                source: url + "#zk-proofs"
            },
            {
                title: "🌐 Cross-Chain Compatibility",
                content: "Seamlessly supporting Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Linea, Scroll, Mantle, and 65+ other blockchain networks.",
                source: url + "#networks"
            },
            {
                title: "🔒 SchellingCoin Consensus",
                content: "Advanced consensus mechanism becomes truly collusion-proof and bribery-resistant through zero-knowledge cryptography.",
                source: url + "#consensus"
            },
            {
                title: "📊 Real-time Oracle Performance",
                content: "99.98% uptime with <2s response time across all supported networks. SLA compliance at 100% with 50+ active oracle nodes.",
                source: url + "#performance"
            }
        ];
        
        currentResults = fallbackContent;
        lastBlocksenseChanges = fallbackContent;
        updateResultsView('list');
        
        if (typeof notifications !== 'undefined') {
            notifications.success('Demo content loaded! This shows what the real data would look like.', 6000);
        }
        
        updateAppStats();
        loadingDiv.style.display = 'none';
        return;
    }
    
    try {
        // Önce doğrudan erişmeyi dene
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const allText = doc.body.innerText;
        const newItems = getNewItems(allText, url);

        currentResults = newItems;
        if (newItems.length === 0) {
            if (lastBlocksenseChanges.length > 0) {
                displayLastChanges();
                if (typeof notifications !== 'undefined') {
                    notifications.info('No new updates found. Showing previous changes.', 4000);
                }
            } else {
                resultsDiv.innerHTML = `<div class="update-item"><div class="update-item-content">No new updates found on BlockSense network.</div></div>`;
                if (typeof notifications !== 'undefined') {
                    notifications.info('No updates found on Blocksense website.', 4000);
                }
            }
        } else {
            lastBlocksenseChanges = newItems;
            updateResultsView('list');
            if (typeof notifications !== 'undefined') {
                notifications.success(`Found ${newItems.length} new updates!`, 5000);
            }
        }
        previousContent = allText;
        updateAppStats();
        
    } catch (err) {
        console.warn('Direct fetch failed, trying alternative methods...', err);
        console.log('Error details:', {
            message: err.message,
            name: err.name,
            stack: err.stack
        });
        
        // Try multiple CORS proxies
        const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
            `https://cors-anywhere.herokuapp.com/${url}`,
            `https://thingproxy.freeboard.io/fetch/${url}`
        ];
        
        let proxyWorked = false;
        
        for (const proxyUrl of proxies) {
            try {
                console.log(`Trying proxy: ${proxyUrl}`);
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json,text/plain,*/*',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) throw new Error(`Proxy HTTP error! status: ${response.status}`);
                
                let data;
                if (proxyUrl.includes('allorigins')) {
                    const jsonData = await response.json();
                    data = jsonData.contents;
                } else {
                    data = await response.text();
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const allText = doc.body.innerText;
                const newItems = getNewItems(allText, url);

                currentResults = newItems;
                if (newItems.length === 0) {
                    if (lastBlocksenseChanges.length > 0) {
                        displayLastChanges();
                        if (typeof notifications !== 'undefined') {
                            notifications.info('No new updates found. Showing previous changes.', 4000);
                        }
                    } else {
                        resultsDiv.innerHTML = `<div class="update-item"><div class="update-item-content">No new updates found on BlockSense network.</div></div>`;
                    }
                } else {
                    lastBlocksenseChanges = newItems;
                    updateResultsView('list');
                    if (typeof notifications !== 'undefined') {
                        notifications.success(`Found ${newItems.length} updates via proxy!`, 5000);
                    }
                }
                previousContent = allText;
                updateAppStats();
                proxyWorked = true;
                break;
                
            } catch (proxyErr) {
                console.warn(`Proxy ${proxyUrl} failed:`, proxyErr);
                continue;
            }
        }
        
        // If no proxy worked, show fallback content
        if (!proxyWorked) {
            console.error('All proxies failed, showing fallback content');
            
            // Use config fallback content if available
            const fallbackContent = (CONFIG && CONFIG.FALLBACK_UPDATES) ? CONFIG.FALLBACK_UPDATES : [
                {
                    title: "Blocksense Network Status",
                    content: "Unable to fetch real-time updates due to CORS restrictions. The Blocksense network continues to operate normally with 74+ supported networks and 700+ data feeds.",
                    source: url
                },
                {
                    title: "ZK Proof Technology",
                    content: "Blocksense uses zero-knowledge proofs to validate feed execution and voting correctness without revealing votes or identities, making it truly collusion-proof.",
                    source: url + "#zk-proofs"
                },
                {
                    title: "Cross-Chain Compatibility",
                    content: "Supporting Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, and 68+ other networks with seamless cross-chain data feeds.",
                    source: url + "#networks"
                },
                {
                    title: "SchellingCoin Consensus",
                    content: "ZK enables the SchellingCoin consensus mechanism to become truly collusion-proof and bribery-resistant in Blocksense.",
                    source: url + "#consensus"
                }
            ];
            
            currentResults = fallbackContent;
            lastBlocksenseChanges = fallbackContent;
            updateResultsView('list');
            
            if (typeof notifications !== 'undefined') {
                notifications.info('Showing Blocksense network information. Live updates unavailable in local development.', 8000);
            }
            
            updateAppStats();
        }
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function getNewItems(currentText, sourceUrl) {
    const sanitizedText = currentText.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

    // Bilinen ve önemli içerik bölümleri
    const meaningfulSections = [
        {
            title: "Zero-knowledge Proofs Validation",
            content: "Zero-knowledge proofs validate feed execution and voting correctness without revealing votes or identities",
            source: "https://blocksense.network/#zk-proofs"
        },
        {
            title: "zkRollup Block Publishing",
            content: "Blocksense batches thousands of updates into a single zkRollup block for gas-efficient publishing",
            source: "https://blocksense.network/#zkrollup"
        },
        {
            title: "ZK for Compression and Consensus",
            content: "ZK is also used for compression, consensus, and upcoming zkTLS interactions with the internet",
            source: "https://blocksense.network/#zk-compression"
        },
        {
            title: "SchellingCoin Consensus Mechanism",
            content: "And last but surely not least, ZK enables the SchellingCoin consensus mechanism, pioneered in other protocols, to become truly collusion-proof and bribery-resistant in Blocksense",
            source: "https://blocksense.network/#schellingcoin"
        },
        {
            title: "Protocol Description",
            content: "A fully decentralized protocol with groundbreaking cost efficiency. For every chain and every meta.",
            source: "https://docs.blocksense.network/#protocol"
        }
    ];

    if (!previousContent) return meaningfulSections;

    const newSections = meaningfulSections.filter(section =>
        sanitizedText.includes(section.content) && !previousContent.includes(section.content)
    );

    const currentLines = sanitizedText.split('\n').filter(t => t.trim() !== '');
    const previousLines = previousContent.split('\n').filter(t => t.trim() !== '');
    const newLines = currentLines
        .filter(line =>
            !previousLines.includes(line) && line.length > 20 &&
            !line.includes('Cookie') && !line.includes('settings') && !line.includes('By clicking') && !line.includes('/*')
        )
        .map(line => ({ title: "Content Update", content: line, source: sourceUrl + "#update" }));

    const allNewItems = [...newSections, ...newLines.slice(0, 5)];
    return allNewItems.length > 0 ? allNewItems : [{ title: "No Changes", content: "No significant changes detected", source: sourceUrl }];
}

function displayLastChanges() {
    if (lastBlocksenseChanges.length === 0) {
        resultsDiv.innerHTML = `<div class="update-item"><div class="update-item-content">No previous changes recorded.</div></div>`;
        return;
    }
    resultsDiv.innerHTML = lastBlocksenseChanges.map(item => `
        <div class="update-item">
            <div class="update-item-header">
                <div class="update-item-title">${item.title}</div>
            </div>
            <div class="update-item-content">${item.content}</div>
            <div class="update-item-source">
                <i class="fas fa-link"></i>
                <a href="${item.source}" target="_blank" rel="noopener">${item.source}</a>
            </div>
        </div>
    `).join('');
}

function updateResultsView(view) {
    if (currentResults.length === 0) return;
    switch (view) {
        case 'list': displayListView(); break;
        case 'timeline': displayTimelineView(); break;
    }
}

function displayListView() {
    resultsDiv.innerHTML = currentResults.map(item => `
        <div class="update-item new">
            <div class="update-item-header">
                <div class="update-item-title">${item.title}</div>
            </div>
            <div class="update-item-content">${item.content}</div>
            <div class="update-item-source">
                <i class="fas fa-link"></i>
                <a href="${item.source}" target="_blank" rel="noopener">${item.source}</a>
            </div>
        </div>
    `).join('');
}

function displayTimelineView() {
    resultsDiv.innerHTML = `
        <div class="timeline-view">
            ${currentResults.map(item => `
                <div class="timeline-item">
                    <div class="update-item-header">
                        <div class="update-item-title">${item.title}</div>
                    </div>
                    <div class="update-item-content">${item.content}</div>
                    <div class="update-item-source">
                        <i class="fas fa-link"></i>
                        <a href="${item.source}" target="_blank" rel="noopener">${item.source}</a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/* GitHub */
async function loadGitHubUpdates() {
    const githubLoadingDiv = document.getElementById('githubLoading');
    if (githubLoadingDiv) githubLoadingDiv.style.display = 'flex';
    if (githubResultsDiv) githubResultsDiv.innerHTML = '';
    const selectedType = githubSelector.value;
    
    if (typeof notifications !== 'undefined') {
        notifications.info(`Loading GitHub ${selectedType}...`, 3000);
    }
    
    try {
        let data;
        switch (selectedType) {
            case 'commits': data = await fetchGitHubCommits(); break;
            case 'issues': data = await fetchGitHubIssues(); break;
            case 'pull-requests': data = await fetchGitHubPullRequests(); break;
            case 'releases': data = await fetchGitHubReleases(); break;
            default: data = await fetchGitHubCommits();
        }
        displayGitHubUpdates(data, selectedType);
        
        if (typeof notifications !== 'undefined') {
            notifications.success(`Loaded ${data.length} ${selectedType} from GitHub`, 4000);
        }

        updateAppStats();
    } catch (err) {
        console.warn('GitHub API failed, using mock data', err);
        const mockData = getMockGitHubData(selectedType);
        displayGitHubUpdates(mockData, selectedType);
        
        if (typeof notifications !== 'undefined') {
            notifications.warning(`GitHub API unavailable. Showing sample ${selectedType}.`, 5000);
        }
    } finally {
        const githubLoadingDiv2 = document.getElementById('githubLoading');
        if (githubLoadingDiv2) githubLoadingDiv2.style.display = 'none';
    }
}

// GitHub URL'lerindeki boşluklar kaldırıldı
async function fetchGitHubCommits() {
    const response = await fetch('https://api.github.com/repos/blocksense-network/blocksense/commits?per_page=10');
    if (!response.ok) throw new Error('GitHub API error');
    return response.json();
}
async function fetchGitHubIssues() {
    const response = await fetch('https://api.github.com/repos/blocksense-network/blocksense/issues?per_page=10');
    if (!response.ok) throw new Error('GitHub API error');
    return response.json();
}
async function fetchGitHubPullRequests() {
    const response = await fetch('https://api.github.com/repos/blocksense-network/blocksense/pulls?per_page=10');
    if (!response.ok) throw new Error('GitHub API error');
    return response.json();
}
async function fetchGitHubReleases() {
    const response = await fetch('https://api.github.com/repos/blocksense-network/blocksense/releases?per_page=10');
    if (!response.ok) throw new Error('GitHub API error');
    return response.json();
}

function getMockGitHubData(type) {
    // MOCK_GITHUB_DATA data.js'de tanımlı
    return MOCK_GITHUB_DATA[type] || [];
}

function displayGitHubUpdates(data, type) {
    if (!githubResultsDiv) return;
    if (!data || data.length === 0) {
        githubResultsDiv.innerHTML = `<div class="update-item"><div class="update-item-content">No ${type} found.</div></div>`;
        return;
    }
    let html = '';
    const now = new Date();
    switch (type) {
        case 'commits':
            html = data.map(commit => {
                const commitDate = new Date(commit.commit.committer.date);
                const diffMs = now - commitDate;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                let timeAgo = diffDays > 0 ? `${diffDays} day${diffDays > 1 ? 's' : ''} ago` :
                    diffHours > 0 ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago` :
                        `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
                const commitMessage = commit.commit.message.split('\n')[0];
                const shortSha = commit.sha.substring(0, 7);
                return `
                    <div class="update-item" onclick="window.open('${commit.html_url}', '_blank')" style="cursor:pointer;">
                        <div class="update-item-header">
                            <div class="update-item-title">Commit: ${shortSha}</div>
                            <div class="update-item-timestamp">${timeAgo}</div>
                        </div>
                        <div class="update-item-content">${commitMessage}</div>
                        <div class="update-item-source">
                            <i class="fas fa-user"></i>${commit.commit.author.name}
                        </div>
                    </div>
                `;
            }).join('');
            break;

        case 'issues':
            html = data.map(issue => {
                const createdDate = new Date(issue.created_at);
                const diffMs = now - createdDate;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                let timeAgo = diffDays === 0 ? "Today" : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                return `
                    <div class="update-item" onclick="window.open('${issue.html_url}', '_blank')" style="cursor:pointer;">
                        <div class="update-item-header">
                            <div class="update-item-title">Issue #${issue.number}: ${issue.title}</div>
                            <div class="update-item-timestamp">${timeAgo}</div>
                        </div>
                        <div class="update-item-content">State: ${issue.state}</div>
                        <div class="update-item-source">
                            <i class="fas fa-user"></i>${issue.user.login}
                        </div>
                    </div>
                `;
            }).join('');
            break;

        case 'pull-requests':
            html = data.map(pr => {
                const createdDate = new Date(pr.created_at);
                const diffMs = now - createdDate;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                let timeAgo = diffDays === 0 ? "Today" : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                return `
                    <div class="update-item" onclick="window.open('${pr.html_url}', '_blank')" style="cursor:pointer;">
                        <div class="update-item-header">
                            <div class="update-item-title">PR #${pr.number}: ${pr.title}</div>
                            <div class="update-item-timestamp">${timeAgo}</div>
                        </div>
                        <div class="update-item-content">State: ${pr.state}</div>
                        <div class="update-item-source">
                            <i class="fas fa-user"></i>${pr.user.login}
                        </div>
                    </div>
                `;
            }).join('');
            break;

        case 'releases':
            html = data.map(release => {
                const publishedDate = new Date(release.published_at);
                const diffMs = now - publishedDate;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                let timeAgo = diffDays === 0 ? "Today" : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                return `
                    <div class="update-item" onclick="window.open('${release.html_url}', '_blank')" style="cursor:pointer;">
                        <div class="update-item-header">
                            <div class="update-item-title">Release: ${release.name}</div>
                            <div class="update-item-timestamp">${timeAgo}</div>
                        </div>
                        <div class="update-item-content">Tag: ${release.tag_name}</div>
                        <div class="update-item-source">
                            <i class="fas fa-tag"></i>${release.tag_name}
                        </div>
                    </div>
                `;
            }).join('');
            break;
    }
    githubResultsDiv.innerHTML = html;
}
// Community Calls functionality
function initCommunityCalls() {
    const communityCallsList = document.getElementById('communityCallsList');
    if (!communityCallsList) return;
    
    // Community Call tarihleri
    const callDates = [
        "12 August 2024",
        "8 November 2024",
        "7 December 2024",
        "11 January 2025",
        "6 February 2025",
        "7 March 2025",
        "3 April 2025",
        "5 May 2025",
        "30 May 2025",
        "2 July 2025",
        "31 July 2025"
    ];
    
    for (let i = 1; i <= 11; i++) {
        const callItem = document.createElement('a');
        callItem.href = `community-calls.html?call=${i}`;
        callItem.className = 'community-call-item';
        callItem.textContent = `Community Call ${i} (${callDates[i-1]})`;
        communityCallsList.appendChild(callItem);
    }
}
// Sayfa yüklendiğinde community calls'u başlat
document.addEventListener('DOMContentLoaded', function() {
    initCommunityCalls();
    
    // Community Calls sayfası için tema değiştirme
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // İkonu güncelle
            const icon = themeToggle.querySelector('i');
            icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        });
    }
    
    // Yukarı çık butonu
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.display = 'flex';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
// Community Calls functionality
function initCommunityCalls() {
    const communityCallsList = document.getElementById('communityCallsList');
    if (!communityCallsList) return;
    
    // Community Call tarihleri
    const callDates = [
        "12 August 2024",
        "8 November 2024",
        "7 December 2024",
        "11 January 2025",
        "6 February 2025",
        "7 March 2025",
        "3 April 2025",
        "5 May 2025",
        "30 May 2025",
        "2 July 2025",
        "31 July 2025"
    ];
    
    // Önce mevcut içeriği temizle (yinelenmeyi önlemek için)
    communityCallsList.innerHTML = '';
    
    for (let i = 1; i <= 11; i++) {
        const callItem = document.createElement('a');
        callItem.href = `community-calls.html?call=${i}`;
        callItem.className = 'community-call-item';
        callItem.textContent = `Community Call ${i} (${callDates[i-1]})`;
        communityCallsList.appendChild(callItem);
    }
}
// Sayfa yüklendiğinde community calls'u başlat
document.addEventListener('DOMContentLoaded', function() {
    initCommunityCalls();
    
    // Tema değiştirme butonu
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Mevcut temayı kontrol et
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // İkonu ayarla
        const icon = themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // İkonu güncelle
            icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        });
    }
    
    // Yukarı çık butonu
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.display = 'flex';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
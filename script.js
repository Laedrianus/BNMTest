let previousContent = "";

document.getElementById('checkBtn').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    const resultsDiv = document.getElementById('results');

    if (!url) {
        alert("Lütfen bir URL girin.");
        return;
    }

    resultsDiv.innerHTML = "<p>Kontrol ediliyor...</p>";
    
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        const allText = doc.body.innerText;
        const newItems = getNewItems(allText);

        if (newItems.length === 0) {
            resultsDiv.innerHTML = "<p>Yeni içerik yok.</p>";
        } else {
            resultsDiv.innerHTML = newItems.map(i => `<div class="update-item">${i}</div>`).join('');
        }

        previousContent = allText;
    } catch (err) {
        resultsDiv.innerHTML = "<p style='color:red;'>Bir hata oluştu. URL geçerli mi?</p>";
        console.error(err);
    }
});

function getNewItems(currentText) {
    if (!previousContent) return currentText.split('\n').filter(t => t.trim() !== '');
    const prevSet = new Set(previousContent.split('\n').map(t => t.trim()));
    return currentText.split('\n').map(t => t.trim()).filter(t => t && !prevSet.has(t));
}

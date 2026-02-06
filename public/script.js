let currentData = null;
let isJson = false;

async function fetchQuote() {
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    const metaEl = document.getElementById('quote-meta');
    const jsonEl = document.getElementById('json-mode');
    
    textEl.style.opacity = '0.5';

    try {
        const res = await fetch('/quotes/random');
        const data = await res.json();
        currentData = data;
        
        // Visual Update
        textEl.innerText = `"${data.content}"`;
        authorEl.innerText = data.author;
        metaEl.innerText = `${data.era} • ${data.field}`;
        
        // JSON Update
        jsonEl.innerText = JSON.stringify(data, null, 2);
        
        textEl.style.opacity = '1';
    } catch (err) {
        textEl.innerText = "Error loading wisdom.";
        console.error(err);
    }
}

function toggleView() {
    const visual = document.getElementById('visual-mode');
    const json = document.getElementById('json-mode');
    const toggleBtn = document.querySelector('.toggle-view');

    isJson = !isJson;

    if (isJson) {
        visual.style.display = 'none';
        json.style.display = 'block';
        toggleBtn.innerText = "View Visual Card";
    } else {
        visual.style.display = 'block';
        json.style.display = 'none';
        toggleBtn.innerText = "View JSON Response";
    }
}

// Load intent - Using DOMContentLoaded for safety in external script
document.addEventListener('DOMContentLoaded', () => {
    fetchQuote();
});

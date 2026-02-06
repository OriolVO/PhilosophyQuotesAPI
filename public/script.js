const staticData = {
    "id": 1,
    "content": "The only true wisdom is in knowing you know nothing.",
    "author": "Socrates",
    "field": "Epistemology",
    "era": "Classical Greece",
    "source": "Apology"
};

let isJson = false;

function initDisplay() {
    const jsonEl = document.getElementById('json-mode');
    if (jsonEl) {
        jsonEl.innerText = JSON.stringify(staticData, null, 2);
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

document.addEventListener('DOMContentLoaded', () => {
    initDisplay();
});

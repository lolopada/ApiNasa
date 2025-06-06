const API_KEY = 'Qla9pKf0eAhpLr3QbIuTsUckLI8Lc8YXYqUoY5ir';

// Gestion des onglets
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => content.classList.add('hidden'));
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
});

function getApiUrl(params = {}) {
    const baseUrl = 'https://api.nasa.gov/planetary/apod';
    const queryParams = new URLSearchParams({ api_key: API_KEY, ...params });
    return `${baseUrl}?${queryParams}`;
}

async function getAPODSingle() {
    try {
        const date = document.getElementById('singleDatePicker').value;
        const container = document.getElementById('apod-container');
        container.innerHTML = '<div class="loading">Chargement...</div>';
        
        const response = await fetch(getApiUrl({ date }));
        const data = await response.json();
        displayAPOD([data]);
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('apod-container').innerHTML = 'Erreur lors du chargement des données.';
    }
}

async function getAPODRange() {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            alert('Veuillez sélectionner une date de début et de fin');
            return;
        }
        
        const container = document.getElementById('apod-container');
        container.innerHTML = '<div class="loading">Chargement...</div>';
        
        const response = await fetch(getApiUrl({ start_date: startDate, end_date: endDate }));
        const data = await response.json();
        displayAPOD(data);
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('apod-container').innerHTML = 'Erreur lors du chargement des données.';
    }
}

function displayAPOD(data) {
    const container = document.getElementById('apod-container');
    container.innerHTML = data.map(item => `
        <div class="apod-item">
            <h2>${item.title}</h2>
            <img class="apod-image" src="${item.url}" alt="${item.title}">
            <p><strong>Date:</strong> ${item.date}</p>
            <p>${item.explanation}</p>
            ${item.copyright ? `<p><small>Copyright: ${item.copyright}</small></p>` : ''}
        </div>
    `).join('<hr>');
}

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.max = today;
    });
    
    document.getElementById('singleDatePicker').value = today;
    getAPODSingle();
});
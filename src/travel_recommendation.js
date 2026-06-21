// Global data store
let travelData = null;

// Timezone mapping for recommended places
const timezoneMap = {
    "sydney, australia": "Australia/Sydney",
    "melbourne, australia": "Australia/Melbourne",
    "tokyo, japan": "Asia/Tokyo",
    "kyoto, japan": "Asia/Tokyo",
    "rio de janeiro, brazil": "America/Sao_Paulo",
    "são paulo, brazil": "America/Sao_Paulo",
    "angkor wat, cambodia": "Asia/Phnom_Penh",
    "taj mahal, india": "Asia/Kolkata",
    "bora bora, french polynesia": "Pacific/Tahiti",
    "copacabana beach, brazil": "America/Sao_Paulo"
};

// Fetch data from local API JSON
async function fetchRecommendations() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        travelData = await response.json();
        console.log("Travel recommendation data loaded successfully:", travelData);
    } catch (error) {
        console.error("Error fetching travel recommendations:", error);
    }
}

// Format local time based on timezone mapping
function getLocalTime(placeName) {
    const key = placeName.toLowerCase().trim();
    const tz = timezoneMap[key];
    if (!tz) return "";

    try {
        const options = {
            timeZone: tz,
            hour12: true,
            hour: 'numeric',
            minute: 'numeric'
        };
        const localTimeStr = new Date().toLocaleTimeString('en-US', options);
        return `Local Time: ${localTimeStr}`;
    } catch (e) {
        console.error(`Error formatting time for timezone ${tz}:`, e);
        return "";
    }
}

// Render recommendations to the grid
function renderResults(titleText, items) {
    const resultsPanel = document.getElementById('results-panel');
    const container = document.getElementById('recommendations-container');
    const titleEl = document.getElementById('results-title');
    const countEl = document.getElementById('results-count');

    // Clean previous items
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        titleEl.textContent = 'No Results Found';
        countEl.textContent = '';
        container.innerHTML = `
            <div class="results-empty">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <p>We couldn't find any recommendations matching your search.<br>Try keywords like <strong>beach</strong>, <strong>temple</strong>, or specific country names.</p>
            </div>
        `;
        resultsPanel.style.display = 'block';
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    titleEl.textContent = titleText;
    countEl.textContent = `${items.length} destination${items.length > 1 ? 's' : ''} found`;

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        const localTimeText = getLocalTime(item.name);
        const timeBadgeHtml = localTimeText ? `<span class="time-badge">${localTimeText}</span>` : '';

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${item.imageUrl}" alt="${item.name}" class="card-img">
                ${timeBadgeHtml}
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-desc">${item.description}</p>
                <button class="card-btn">Explore Details</button>
            </div>
        `;
        container.appendChild(card);
    });

    resultsPanel.style.display = 'block';
    resultsPanel.scrollIntoView({ behavior: 'smooth' });
}

// Perform keyword search logic
function handleSearch() {
    const input = document.getElementById('search-input');
    const query = input.value.trim().toLowerCase();

    if (!query) {
        return;
    }

    if (!travelData) {
        console.error("Data not loaded yet. Retrying fetch...");
        fetchRecommendations().then(() => handleSearch());
        return;
    }

    let results = [];
    let titleText = 'Search Results';

    // Check keyword variations
    if (query === 'beach' || query === 'beaches') {
        results = travelData.beaches;
        titleText = 'Beach Recommendations';
    } else if (query === 'temple' || query === 'temples') {
        results = travelData.temples;
        titleText = 'Temple Recommendations';
    } else if (query === 'country' || query === 'countries') {
        // Collect all cities of all countries
        travelData.countries.forEach(country => {
            results = results.concat(country.cities);
        });
        titleText = 'Country Recommendations';
    } else {
        // Check if query matches specific country names in JSON
        const matchedCountry = travelData.countries.find(
            country => country.name.toLowerCase() === query
        );

        if (matchedCountry) {
            results = matchedCountry.cities;
            titleText = `${matchedCountry.name} Recommendations`;
        } else {
            // Fallback search in names and descriptions of all places
            // Search beaches
            const matchedBeaches = travelData.beaches.filter(
                item => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
            );
            // Search temples
            const matchedTemples = travelData.temples.filter(
                item => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
            );
            // Search cities
            let matchedCities = [];
            travelData.countries.forEach(country => {
                const cities = country.cities.filter(
                    city => city.name.toLowerCase().includes(query) || city.description.toLowerCase().includes(query)
                );
                matchedCities = matchedCities.concat(cities);
            });

            results = [...matchedBeaches, ...matchedTemples, ...matchedCities];
            titleText = `Recommendations for "${input.value}"`;
        }
    }

    renderResults(titleText, results);
}

// Clear/Reset input and hide results
function handleReset() {
    const input = document.getElementById('search-input');
    input.value = '';
    
    const resultsPanel = document.getElementById('results-panel');
    const container = document.getElementById('recommendations-container');
    const countEl = document.getElementById('results-count');
    
    if (container) container.innerHTML = '';
    if (countEl) countEl.textContent = '';
    if (resultsPanel) resultsPanel.style.display = 'none';
}

// Register DOM event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial data fetch
    fetchRecommendations();

    const btnSearch = document.getElementById('btn-search');
    const btnReset = document.getElementById('btn-reset');
    const searchInput = document.getElementById('search-input');
    const btnCta = document.getElementById('btn-cta');

    if (btnSearch) {
        btnSearch.addEventListener('click', handleSearch);
    }

    if (btnReset) {
        btnReset.addEventListener('click', handleReset);
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    if (btnCta) {
        btnCta.addEventListener('click', (e) => {
            if (searchInput) {
                searchInput.focus();
            }
        });
    }
});

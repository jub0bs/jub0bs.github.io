document.addEventListener('DOMContentLoaded', () => {
    /**
     * Elements from the DOM
     */
    const searchInput = document.getElementById('search');
    const resultsList = document.getElementById('results');

    /**
     * Data variables
     */
    let tsvData = [];
    let debounceTimeout;

    /**
     * Encodes a string to prevent HTML injection.
     * @param {string} str - The string to encode.
     * @returns {string} - The encoded string.
     */
    const htmlEncode = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    /**
     * Debounces a function to limit the rate at which it can fire.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {Function} - The debounced function.
     */
    const debounce = (func, delay) => {
        return (...args) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => func(...args), delay);
        };
    };

    /**
     * Displays the search results in the results list.
     * @param {Array} data - The data to display.
     */
    const displayResults = (data) => {
        resultsList.innerHTML = data.length
            ? data.map(item => `<li><strong>${htmlEncode(item.platform)}</strong><br><br>Valid: ${htmlEncode(item.valid)}<br>Available: ${htmlEncode(item.available)}</li>`).join('')
            : '<li>No results found</li>';
    };

    /**
     * Applies the search logic based on the query.
     * @param {string} query - The search query.
     */
    const applySearch = (query) => {
        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery) {
            resultsList.innerHTML = '';
            return;
        }

        const results = tsvData;
        displayResults(results);
    };

    /**
     * Initializes the application by fetching data and setting up event listeners.
     */
    const initialize = async () => {
        try {
            const response = await fetch('https://api.github.com/repos/jub0bs/jub0bs.github.io/contents/data.json?ref=main', {
                headers: { 'Accept': 'application/vnd.github.v3.raw' }
            });
            const data = await response.json();
            
            tsvData = data;

            if (window.location.hash) {
                const query = decodeURIComponent(window.location.hash.substring(1));
                searchInput.value = query;
                applySearch(query);
            }
        } catch (error) {
            console.error('Error fetching TSV data:', error);
        }

        searchInput.addEventListener('input', debounce(() => {
            const query = searchInput.value;
            applySearch(query);
            window.location.hash = encodeURIComponent(query);
        }, 300));
    };

    // Start the application
    initialize();
});

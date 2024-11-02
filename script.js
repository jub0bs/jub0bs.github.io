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

    const displayBool = (b) => {
        return b ? '✅' : '❌';
    }

    /**
     * Displays the search results in the results list.
     * @param {Array} data - The data to display.
     */
    const displayResults = (data) => {
        resultsList.innerHTML = data.length
            ? data.map(item => `<tr><th scope="row">${htmlEncode(item.platform)}</th><td>${htmlEncode(displayBool(item.valid))}</td><td>${htmlEncode(displayBool(item.available))}</td></tr>`).join('')
            : '';
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

    const runSearch = async (username) => {
        const url = 'https://api.github.com/repos/jub0bs/jub0bs.github.io/contents/data.json?ref=main';
        const opts = {
            headers: {
                'Accept': 'application/vnd.github.v3.raw'
            }
        }
        const response = await fetch(url, opts);
        const data = await response.json();
        resultsList.innerHTML = data.length
        ? data.map(item => `<tr><th scope="row">${htmlEncode(item.platform)}</th><td>${htmlEncode(displayBool(item.valid))}</td><td>${htmlEncode(displayBool(item.available))}</td></tr>`).join('')
        : '';
        window.location.hash = encodeURIComponent(username);
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

    const initialize2 = async () => {
        try {
            if (window.location.hash) {
                const username = decodeURIComponent(window.location.hash.substring(1));
                searchInput.value = username;
                runSearch(username);
            }
        } catch (error) {
            console.error('Error fetching TSV data:', error);
        }

        searchInput.addEventListener('input', debounce(() => {
            resultsList.innerHTML = '';
            const username = searchInput.value;
            runSearch(username);
            window.location.hash = encodeURIComponent(username);
        }, 300));
    };

    // Start the application
    initialize2();
});

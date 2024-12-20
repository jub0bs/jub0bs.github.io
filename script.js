document.addEventListener('DOMContentLoaded', () => {
    /**
     * Elements from the DOM
     */
    const searchInput = document.getElementById('search');
    const resultsList = document.getElementById('results');

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

    const displayValid = (b) => {
        return b ? '✅' : '❌';
    }

    const displayAvail = (err, b) => {
        return err ? '⚠️' : (b ? '✅' : '❌');
    }

    const runSearch = async (username) => {
        const params = new URLSearchParams(location.search);
        let port;
            let raw = params.get("port");
            if (!raw) {
                port = "8080";
            } else {
                try {
                    parseInt(raw);
                    port = raw;
                } catch(e) {
                    alert("invalid port")
                    return
                }
            }
        const url = `http://localhost:${port}/check?username=${encodeURIComponent(username)}`;
        const response = await fetch(url);
        const data = await response.json();
        resultsList.innerHTML = data.results.length
        ? data.results
        .sort((a,b) => a.platform < b.platform)
        .map(item => `<tr><th scope="row">${htmlEncode(item.platform)}</th><td>${htmlEncode(displayValid(item.valid))}</td><td>${htmlEncode(displayAvail(item.error, item.available))}</td></tr>`).join('')
        : '';
        window.location.hash = encodeURIComponent(data.username);
    };

    const initialize = async () => {
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
    initialize();
});

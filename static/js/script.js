document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsSection = document.getElementById('results-section');
    const searchAnimation = document.querySelector('.search-animation');
    const searchContainer = document.querySelector('.search-container');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            searchContainer.style.position = 'fixed';
            searchContainer.style.top = '20px';
            searchContainer.style.left = '50%';
            searchContainer.style.transform = 'translateX(-50%)';
            searchContainer.style.width = '80%';
            searchContainer.style.maxWidth = '500px';
        } else {
            searchContainer.style.position = 'sticky';
            searchContainer.style.top = '20px';
            searchContainer.style.left = '0';
            searchContainer.style.transform = 'none';
            searchContainer.style.width = '100%';
            searchContainer.style.maxWidth = '500px';
        }
    });

    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            searchButton.disabled = true;
            searchButton.style.display = 'none';
            searchAnimation.style.display = 'block';

            fetch(`/search?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    displayResults(data);
                    searchButton.disabled = false;
                    searchButton.style.display = 'block';
                    searchAnimation.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error:', error);
                    searchButton.disabled = false;
                    searchButton.style.display = 'block';
                    searchAnimation.style.display = 'none';
                });
        }
    }

    function displayResults(results) {
        resultsSection.innerHTML = '';
        results.forEach(item => {
            if (item && isValidResult(item)) {
                const contentItem = document.createElement('div');
                contentItem.className = 'content-item';
                contentItem.innerHTML = `
                    <img src="${item.poster || 'https://via.placeholder.com/150'}" alt="${item.title}">
                    <h3>${item.title}</h3>
                    <p>Type: ${item.type}</p>
                    <p>IMDb Rating: ${item.imdb_rating || 'N/A'}</p>
                    <p>Platforms: ${item.platforms.join(', ') || 'N/A'}</p>
                    <p>Languages: ${item.languages.join(', ') || 'N/A'}</p>
                    ${item.trailer ? `<a href="${item.trailer}" target="_blank">Watch Trailer</a>` : ''}
                `;
                resultsSection.appendChild(contentItem);
            }
        });
    }

    function isValidResult(item) {
        const requiredFields = ['title', 'type', 'imdb_rating'];
        const missingFields = requiredFields.filter(field => !item[field]);
        return missingFields.length <= 1;
    }
});

        const stagger = 2; // Adjust the timing for the animation
const tl = gsap.timeline({ repeat: -1 });

tl.from('.words span', {
    duration: 1.5,
    yPercent: 100,
    ease: "power4",
    stagger: stagger
});

tl.to('.words span', {
    duration: 1.5,
    yPercent: -100,
    ease: "power4",
    stagger: stagger
}, stagger);
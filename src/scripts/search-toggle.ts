export function initSearchToggle() {
    const headerSearch = document.getElementById('header-search-container');
    const heroSearch = document.getElementById('hero-search');

    if (headerSearch && heroSearch) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    headerSearch.classList.remove('opacity-0', 'pointer-events-none');
                    headerSearch.classList.add('opacity-100', 'pointer-events-auto');
                } else {
                    headerSearch.classList.add('opacity-0', 'pointer-events-none');
                    headerSearch.classList.remove('opacity-100', 'pointer-events-auto');
                }
            });
        }, {
            threshold: 0.1
        });

        observer.observe(heroSearch);
    }
}

// Data Data
// Projects
const projects = [
    {
        title: "NRF24 Wireless Sensor Node",
        tags: ["Arduino", "Embedded C", "SPI"],
        image: "https://via.placeholder.com/400x300/1a1a1a/3b82f6?text=NRF24+Arduino",
        desc: "Low-power wireless communication implementation using NRF24L01+ and Arduino Nano for sensor data telemetry.",
        link: "https://github.com/Vivekpkd/NRF24_Arduino"
    },
    {
        title: "Mongocxx Singleton Pattern",
        tags: ["C++", "MongoDB", "Architecture"],
        image: "https://via.placeholder.com/400x300/1a1a1a/06b6d4?text=Mongocxx+Singleton",
        desc: "Professional C++ implementation of the Singleton design pattern for efficient MongoDB client management in distributed systems.",
        link: "https://github.com/Vivekpkd/Mongocxx_Singleton"
    },
    {
        title: "Jetson Nano IoT Gateway",
        tags: ["Python", "Jetson Nano", "NRF24"],
        image: "https://via.placeholder.com/400x300/1a1a1a/8b5cf6?text=Jetson+NRF24",
        desc: "Automotive-grade IoT gateway connecting NRF24L01+ sensor networks to high-performance NVIDIA Jetson edge computing platforms.",
        link: "https://github.com/Vivekpkd/Jetson_NRF24"
    }
];

// App Logic
document.addEventListener('DOMContentLoaded', () => {

    // Render Projects
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        projects.forEach(project => {
            const card = document.createElement('a');
            card.href = project.link;
            card.target = "_blank";
            card.className = 'project-card fade-in';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';
            card.innerHTML = `
                <img src="${project.image}" alt="${project.title}" class="card-img">
                <div class="card-content">
                    <div class="card-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <h3>${project.title}</h3>
                    <p style="margin-top: 10px; font-size: 0.9rem;">${project.desc}</p>
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    }

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const searchToggle = document.getElementById('search-toggle');
    const searchClose = document.getElementById('search-close');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (themeToggle) {
        // Initial sync of icon based on current theme (set by head script)
        const currentTheme = document.documentElement.getAttribute('data-theme');
        updateThemeIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                updateThemeIcon('dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                updateThemeIcon('light');
            }
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        if (theme === 'light') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    // --- Search Logic ---
    if (searchToggle && searchOverlay) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            searchInput.focus();
        });

        searchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            if (term.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            if (typeof articlesData === 'undefined') {
                searchResults.innerHTML = '<p style="padding:10px; color:var(--text-muted)">Search data loading...</p>';
                return;
            }

            const matches = articlesData.filter(a =>
                a.title.toLowerCase().includes(term) ||
                a.excerpt.toLowerCase().includes(term) ||
                (a.tags && a.tags.some(t => t.toLowerCase().includes(term)))
            );

            searchResults.innerHTML = matches.map(match => `
                <a href="${match.link}" class="search-item">
                    <h4>${match.title}</h4>
                    <p>${match.excerpt}</p>
                    <small style="color:var(--primary)">${match.category}</small>
                </a>
            `).join('');
        });
    }

    // Render Blog Posts (with Show More logic)
    const blogContainer = document.getElementById('blog-container');

    if (blogContainer) {
        const articles = (typeof articlesData !== 'undefined') ? articlesData : [];
        const INITIAL_COUNT = 8;
        let visibleCount = INITIAL_COUNT;

        function renderArticles(count) {
            blogContainer.innerHTML = '';
            const toShow = articles.slice(0, count);

            toShow.forEach(article => {
                const card = document.createElement('div');
                card.className = 'blog-card fade-in';
                card.innerHTML = `
                    <div class="card-content">
                        <span class="tag" style="margin-bottom: 10px; display:inline-block;">${article.date}</span>
                        <h3>${article.title}</h3>
                        <p>${article.excerpt}</p>
                        <div class="card-tags" style="margin-top:auto; font-size:0.8rem; color:var(--text-muted);">
                            ${article.tags.map(tag => `#${tag}`).join(' ')}
                        </div>
                        <a href="${article.link}" class="btn-small" style="margin-top:15px">Read More</a>
                    </div>
                `;
                blogContainer.appendChild(card);
            });

            // Re-apply Intersection Observer for new elements
            if (window.observer) {
                document.querySelectorAll('.fade-in').forEach(el => window.observer.observe(el));
            }
        }

        renderArticles(visibleCount);

        // Add Show More button if needed
        if (articles.length > INITIAL_COUNT) {
            const btnContainer = document.createElement('div');
            btnContainer.style.textAlign = 'center';
            btnContainer.style.marginTop = '40px';
            btnContainer.style.width = '100%';

            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'btn btn-outline';
            showMoreBtn.id = 'show-more-blog';
            showMoreBtn.textContent = 'View More Articles';

            btnContainer.appendChild(showMoreBtn);
            blogContainer.after(btnContainer);

            showMoreBtn.addEventListener('click', () => {
                visibleCount = articles.length; // Show all for now, or could increment
                renderArticles(visibleCount);
                btnContainer.remove(); // Remove button once all shown
            });
        }
    }

    // Mobile Menu
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.mobile-menu');
    const navLinks = document.querySelectorAll('.mobile-menu a');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
            burger.classList.toggle('toggle');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
            });
        });
    }

    // Theme Toggle Logic

    // Intersection Observer for Animation
    window.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        window.observer.observe(el);
    });
});

// Modal Logic Removed (Using static pages for SEO)

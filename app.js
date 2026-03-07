// Data Data
// Projects
const projects = [
    {
        title: "NRF24 Wireless Sensor Node",
        tags: ["Arduino", "Embedded C", "SPI"],
        background: "linear-gradient(135deg, #3b82f6 0%, #172554 100%)",
        icon: "fa-microchip",
        desc: "Low-power wireless communication implementation using NRF24L01+ and Arduino Nano for sensor data telemetry.",
        link: "https://github.com/Vivekpkd/NRF24_Arduino"
    },
    {
        title: "Mongocxx Singleton Pattern",
        tags: ["C++", "MongoDB", "Architecture"],
        background: "linear-gradient(135deg, #06b6d4 0%, #164e63 100%)",
        icon: "fa-database",
        desc: "Professional C++ implementation of the Singleton design pattern for efficient MongoDB client management in distributed systems.",
        link: "https://github.com/Vivekpkd/Mongocxx_Singleton"
    },
    {
        title: "Jetson Nano IoT Gateway",
        tags: ["Python", "Jetson Nano", "NRF24"],
        background: "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)",
        icon: "fa-network-wired",
        desc: "Automotive-grade IoT gateway connecting NRF24L01+ sensor networks to high-performance NVIDIA Jetson edge computing platforms.",
        link: "https://github.com/Vivekpkd/Jetson_NRF24"
    }
];

// App Logic
document.addEventListener('DOMContentLoaded', () => {

    // Render Projects (Carousel - top section)
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
                <div class="card-img" style="background: ${project.background}; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid ${project.icon}" style="font-size: 3.5rem; color: rgba(255,255,255,0.2);"></i>
                </div>
                <div class="card-body">
                    <div class="card-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <h3 class="card-title">${project.title}</h3>
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    }

    // Render Projects (Modern List - below articles)
    const worksListContainer = document.getElementById('works-list-container');
    if (worksListContainer) {
        projects.forEach((project, index) => {
            const item = document.createElement('a');
            item.href = project.link;
            item.target = "_blank";
            item.className = 'work-list-item fade-in';
            item.innerHTML = `
                <div class="work-list-num">${String(index + 1).padStart(2, '0')}</div>
                <div class="work-list-icon" style="background: ${project.background};">
                    <i class="fa-solid ${project.icon}"></i>
                </div>
                <div class="work-list-info">
                    <h3 class="work-list-title">${project.title}</h3>
                    <p class="work-list-desc">${project.desc}</p>
                    <div class="work-list-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="work-list-arrow">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </div>
            `;
            worksListContainer.appendChild(item);
        });
    }

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        // Initial sync of icon based on current theme (set by head script)
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        updateThemeIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const newTheme = isLight ? 'dark' : 'light';

            if (newTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }

            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle?.querySelector('i');
        if (!icon) return;
        if (theme === 'light') {
            icon.className = 'fa-solid fa-moon';
        } else {
            icon.className = 'fa-solid fa-sun';
        }
    }

    // --- Search Logic (Universal) ---
    const searchElements = {
        toggle: document.getElementById('search-toggle'),
        close: document.getElementById('search-close'),
        overlay: document.getElementById('search-overlay'),
        input: document.getElementById('search-input'),
        results: document.getElementById('search-results')
    };

    if (searchElements.toggle && searchElements.overlay) {
        searchElements.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            searchElements.overlay.classList.remove('hidden', 'active');
            searchElements.overlay.classList.add('active');
            searchElements.input?.focus();
        });

        const closeSearch = () => {
            searchElements.overlay.classList.remove('active');
            searchElements.overlay.classList.add('hidden');
        };

        searchElements.close?.addEventListener('click', closeSearch);

        searchElements.overlay.addEventListener('click', (e) => {
            if (e.target === searchElements.overlay) closeSearch();
        });

        searchElements.input?.addEventListener('input', async (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term.length < 2) {
                if (searchElements.results) searchElements.results.innerHTML = '';
                return;
            }

            if (typeof searchEngine !== 'undefined' && searchElements.results) {
                try {
                    const matches = await searchEngine.advancedSearch(term);
                    if (matches.length === 0) {
                        searchElements.results.innerHTML = `<p style="padding:10px; color:var(--text-muted)">No articles found matching "<strong>${term}</strong>"</p>`;
                        return;
                    }
                    searchElements.results.innerHTML = matches.slice(0, 10).map(match => `
                        <a href="${match.link}" class="search-item">
                            <h4>${match.title}</h4>
                            <p>${match.excerpt}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                <small style="color:var(--primary); font-weight: 600;">${match.category}</small>
                                <small style="color:var(--text-muted);">${match.date}</small>
                            </div>
                        </a>
                    `).join('');
                } catch (error) {
                    searchElements.results.innerHTML = '<p style="padding:10px; color:var(--text-muted)">Search temporarily unavailable</p>';
                }
            }
        });
    }

    // Render Blog Posts (with Show More logic)
    const blogContainer = document.getElementById('blog-container');

    if (blogContainer) {
        const isHome = blogContainer.classList.contains('home-latest-cards');
        const targetCategory = blogContainer.dataset.category;

        const articles = (typeof articlesData !== 'undefined')
            ? (targetCategory
                ? articlesData.filter(a => a.category === targetCategory)
                : articlesData)
            : [];

        const INITIAL_COUNT = isHome ? 6 : (targetCategory ? 20 : 8);
        const INCREMENT = 4;
        let visibleCount = INITIAL_COUNT;

        // Category Styles
        const categoryStyles = {
            'AUTOSAR': { gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', icon: 'fa-microchip', color: '#f59e0b' },
            'Embedded C': { gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', icon: 'fa-code', color: '#10b981' },
            'Automotive Security': { gradient: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', icon: 'fa-shield-halved', color: '#ef4444' },
            'C++': { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', icon: 'fa-c', color: '#3b82f6' },
            'Python': { gradient: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)', icon: 'fa-python', color: '#eab308' },
            'General': { gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', icon: 'fa-file-lines', color: '#6366f1' },
            'Experience': { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)', icon: 'fa-user-tie', color: '#8b5cf6' },
            'Update': { gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', icon: 'fa-bullhorn', color: '#06b6d4' }
        };

        function renderArticles(count) {
            blogContainer.innerHTML = '';
            const toShow = articles.slice(0, count);

            toShow.forEach(article => {
                const style = categoryStyles[article.category] || categoryStyles['General'];

                const card = document.createElement('div');
                card.className = 'blog-card fade-in';

                if (isHome) {
                    const headerBg = article.image
                        ? `background-image: url('${article.image}'); background-size: cover; background-position: center;`
                        : `background: linear-gradient(135deg, ${style.gradient.split(',')[1].trim()}, ${style.gradient.split(',')[2].trim().replace(')', '')});`;

                    card.innerHTML = `
                        <div class="gfg-course-card">
                            <div class="gfg-course-thumb" style="${headerBg}">
                                ${!article.image ? `<i class="fa-solid ${style.icon}"></i>` : ''}
                                <div class="gfg-rating">⭐ 4.9</div>
                                <div class="gfg-badge">LATEST</div>
                            </div>
                            <div class="gfg-course-body">
                                <h3 class="gfg-course-title">${article.title}</h3>
                                <div class="gfg-course-level"><span>${article.category}</span> &nbsp;•&nbsp; Beginner to Advanced</div>
                                <div class="gfg-course-meta">
                                    <div class="gfg-interested"><b>${Math.floor(Math.random() * 50) + 10}k+</b> interested</div>
                                    <a href="${article.link}" class="gfg-btn-explore">Read now</a>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (blogContainer.classList.contains('gfg-courses-grid')) {
                    card.className = 'explore-roadmap-item fade-in';
                    card.innerHTML = `
                        <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px 0; border-bottom: 1px solid var(--border);">
                            <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--primary-glow); display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0;">
                                <i class="fa-solid ${style.icon}"></i>
                            </div>
                            <div style="flex: 1;">
                                <h3 style="font-size: 1.1rem; margin: 0 0 5px; font-weight: 600;">
                                    <a href="${article.link}" style="color: inherit; text-decoration: none; transition: 0.2s;">${article.title}</a>
                                </h3>
                                <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 8px;">${article.excerpt || 'Comprehensive guide on ' + article.title + ' for automotive engineers.'}</p>
                                <div style="display: flex; gap: 15px; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                                    <span><i class="fa-regular fa-clock" style="margin-right: 5px;"></i> ${article.readingTime || '10 min'}</span>
                                    <span style="color: var(--primary); font-weight: 600;">#${article.category}</span>
                                </div>
                            </div>
                            <a href="${article.link}" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: 0.3s; margin-top: 5px;">
                                <i class="fa-solid fa-chevron-right" style="font-size: 0.8rem;"></i>
                            </a>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="card-img-small" style="background: ${style.gradient}; height: 6px; width: 100%;"></div>
                        <div class="card-content" style="padding: 15px; display: flex; flex-direction: column; justify-content: center;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span class="tag" style="font-size: 0.7rem; padding: 3px 8px; background: var(--primary-glow); color: var(--primary); margin:0;">${article.category}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${article.date}</span>
                            </div>
                            <h3 style="font-size: 1.1rem; margin: 5px 0 10px; line-height: 1.4; font-weight: 600;">
                                <a href="${article.link}" style="color: inherit; text-decoration: none;">${article.title}</a>
                            </h3>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                                <div class="card-tags" style="font-size:0.75rem; color:var(--text-muted);">
                                    <i class="fa-solid ${style.icon}" style="margin-right: 5px; color: ${style.color}"></i>
                                    ${article.tags.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                                </div>
                                <a href="${article.link}" style="font-size: 0.8rem; color: var(--primary); font-weight: 500;">Read <i class="fa-solid fa-arrow-right" style="font-size: 0.7rem; margin-left: 3px;"></i></a>
                            </div>
                        </div>
                    `;
                }

                blogContainer.appendChild(card);
            });

            if (window.observer) {
                document.querySelectorAll('.fade-in').forEach(el => window.observer.observe(el));
            }

            const btn = document.getElementById('show-more-blog');
            if (btn) {
                if (visibleCount >= articles.length) {
                    btn.parentElement.style.display = 'none';
                } else {
                    btn.parentElement.style.display = 'block';
                }
            }
        }

        if (isHome || (articles.length > INITIAL_COUNT && !isHome)) {
            const placeholder = document.getElementById('blog-view-all-placeholder');
            if (placeholder) {
                const viewAllBtn = document.createElement('a');
                viewAllBtn.className = 'btn-more-articles';
                viewAllBtn.href = 'blog.html';
                viewAllBtn.textContent = isHome ? 'View all' : 'View more Articles';
                placeholder.appendChild(viewAllBtn);
            }
        }

        renderArticles(visibleCount);
    }

    // Universal Mobile Menu
    const burger = document.querySelector('.burger') || document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            const isFlex = window.getComputedStyle(mobileMenu).display === 'flex';
            mobileMenu.style.display = isFlex ? 'none' : 'flex';
            burger.classList.toggle('toggle');
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.style.display = 'none';
                burger.classList.remove('toggle');
            });
        });
    }

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

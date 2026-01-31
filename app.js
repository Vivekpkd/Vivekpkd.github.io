// Data Data
// Projects
const projects = [
    {
        title: "E-Commerce Dashboard",
        tags: ["React", "Node.js", "MongoDB"],
        image: "https://via.placeholder.com/400x300/1a1a1a/8b5cf6?text=Dashboard",
        desc: "A full-stack analytics dashboard for online retailers with real-time data visualization."
    },
    {
        title: "AI Chat Interface",
        tags: ["OpenAI API", "Next.js", "Tailwind"],
        image: "https://via.placeholder.com/400x300/1a1a1a/06b6d4?text=AI+Chat",
        desc: "Modern chat UI interacting with GPT-4, featuring streaming responses and code highlighting."
    },
    {
        title: "Crypto Portfolio Tracker",
        tags: ["Vue.js", "CoinGecko API"],
        image: "https://via.placeholder.com/400x300/1a1a1a/8b5cf6?text=Crypto",
        desc: "Real-time cryptocurrency tracking app with portfolio balancing features."
    }
];

// App Logic
document.addEventListener('DOMContentLoaded', () => {

    // Render Projects
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card fade-in';
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
        // Initial sync of icon based on current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        updateThemeIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('theme', targetTheme);
            updateThemeIcon(targetTheme);
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
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

            const matches = articlesData.filter(a =>
                a.title.toLowerCase().includes(term) ||
                a.excerpt.toLowerCase().includes(term) ||
                a.tags.some(t => t.toLowerCase().includes(term))
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

    // Render Blog Posts
    const blogContainer = document.getElementById('blog-container');

    if (blogContainer) {
        // Use data from articles.js, fallback to empty array if not loaded
        const articles = (typeof articlesData !== 'undefined') ? articlesData : [];

        articles.forEach(article => {
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
    const themeBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    if (themeBtn) {
        const icon = themeBtn.querySelector('i');

        // Sync icon on load (theme already applied by head script)
        const currentTheme = html.getAttribute('data-theme');
        if (currentTheme === 'light') {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }

        themeBtn.addEventListener('click', () => {
            if (html.getAttribute('data-theme') === 'light') {
                html.removeAttribute('data-theme');
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'dark');
            } else {
                html.setAttribute('data-theme', 'light');
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Intersection Observer for Animation
    const observer = new IntersectionObserver((entries) => {
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
        observer.observe(el);
    });
});

// Modal Logic Removed (Using static pages for SEO)

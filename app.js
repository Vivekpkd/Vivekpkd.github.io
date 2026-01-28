// Data Data
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

const articles = [
    {
        id: 1,
        title: "How to Build a Monetized Portfolio in 2026",
        excerpt: "Learn the exact strategy I used to get Google Adsense approval for my personal developer site.",
        date: "Jan 28, 2026",
        content: `
            <h1>How to Build a Monetized Portfolio</h1>
            <p>Monetizing a developer portfolio is a smart way to earn passive income while showcasing your skills. However, most portfolios get rejected by ad networks like Google Adsense. Why? Because they lack content.</p>
            <h2>The "Content First" Approach</h2>
            <p>Ad networks need text to analyze. A gallery of images isn't enough. You need technical articles.</p>
            <pre><code>// Example Strategy
const portfolio = {
  projects: "High Quality",
  blog: "Essential for Ads"
};</code></pre>
            <p>In this article, we explore how to integrate a blog engine directly into your portfolio without using a heavy CMS like WordPress.</p>
        `
    },
    {
        id: 2,
        title: "Mastering CSS Grid: A Deep Dive",
        excerpt: "Stop struggling with layout. This comprehensive guide explains Grid vs Flexbox with examples.",
        date: "Jan 15, 2026",
        content: `
            <h1>Mastering CSS Grid</h1>
            <p>CSS Grid has revolutionized web layout. It allows for two-dimensional layout systems that were previously impossible with floats or flexbox.</p>
            <h2>Grid vs Flexbox</h2>
            <p>Use Flexbox for alignment in one direction (row or column). Use Grid for 2D layout (rows AND columns).</p>
        `
    },
    {
        id: 3,
        title: "The Future of React: Server Components",
        excerpt: "Understanding RSCs and how they change the way we build web applications.",
        date: "Jan 02, 2026",
        content: `
            <h1>The Future of React</h1>
            <p>React Server Components (RSC) are changing the game by allowing components to render exclusively on the server, reducing bundle size.</p>
        `
    }
];

// App Logic
document.addEventListener('DOMContentLoaded', () => {
    
    // Render Projects
    const projectsContainer = document.getElementById('projects-container');
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
                <p style="margin-top: 10px; color: #888; font-size: 0.9rem;">${project.desc}</p>
            </div>
        `;
        projectsContainer.appendChild(card);
    });

    // Render Blog Posts
    const blogContainer = document.getElementById('blog-container');
    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'blog-card fade-in';
        card.innerHTML = `
            <div class="card-content">
                <span class="tag" style="margin-bottom: 10px; display:inline-block;">${article.date}</span>
                <h3>${article.title}</h3>
                <p style="margin-top: 10px; color: #888; font-size: 0.9rem;">${article.excerpt}</p>
                <button class="btn-small" style="margin-top: 15px; border: none; background: rgba(255,255,255,0.1); color: white; cursor: pointer;">Read More</button>
            </div>
        `;
        card.onclick = () => openArticle(article);
        blogContainer.appendChild(card);
    });

    // Mobile Menu
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.mobile-menu');
    const navLinks = document.querySelectorAll('.mobile-menu a');

    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.classList.toggle('toggle');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    });

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

// Modal Logic
const modal = document.getElementById('blog-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-modal');

function openArticle(article) {
    modalBody.innerHTML = article.content;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Disable scroll
}

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Enable scroll
});

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
});

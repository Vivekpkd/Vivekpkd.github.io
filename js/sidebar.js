document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('article-sidebar');
    const currentPath = window.location.pathname.split('/').pop();

    if (sidebarContainer && typeof articlesData !== 'undefined') {
        // 1. Group Articles by Category
        const categories = {};
        articlesData.forEach(article => {
            const cat = article.category || 'General';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(article);
        });

        // Sort categories (optional)
        const sortedCats = Object.keys(categories).sort();

        // 2. Build Category-based Tree Menu
        let menuHtml = '<div class="course-sidebar-content">';

        sortedCats.forEach(cat => {
            const isActiveCategory = categories[cat].some(a => a.link === currentPath);

            menuHtml += `
                <div class="course-section ${isActiveCategory ? 'active' : ''}">
                    <div class="course-section-header">
                        <span class="course-section-title">${cat}</span>
                        <i class="fa-solid fa-chevron-right toggle-icon"></i>
                    </div>
                    <ul class="course-article-list">
                        ${categories[cat].map(article => `
                            <li>
                                <a href="${article.link}" class="course-article-link ${article.link === currentPath ? 'active' : ''}">
                                    <i class="fa-regular ${article.link === currentPath ? 'fa-circle-dot' : 'fa-circle'}"></i>
                                    <span>${article.title}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });

        menuHtml += '</div>';
        sidebarContainer.innerHTML = menuHtml;

        // 3. Accordion Logic
        sidebarContainer.querySelectorAll('.course-section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.parentElement;
                section.classList.toggle('active');
            });
        });
    }
});

/**
 * Advanced Right-Side Documentation TOC Sidebar
 * Features:
 *  - Collapsible nested headings (H2 > H3)
 *  - Reading progress indicator bar
 *  - Active section auto-expand
 *  - IntersectionObserver scroll tracking
 *  - URL hash update on scroll
 *  - Copy link button on headings
 *  - Dark/light theme support (CSS vars)
 */

(function () {
    'use strict';

    /* ─── Config ─────────────────────────────── */
    const HEADINGS = 'h2, h3';          // selectors to index
    const OFFSET = 90;               // px from top when section is "active"
    const ROOT_MARGIN = `-${OFFSET}px 0px -60% 0px`;

    /* ─── Helpers ─────────────────────────────── */
    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }

    function createId(el, idx) {
        if (!el.id) {
            el.id = slugify(el.textContent) || `section-${idx}`;
        }
        return el.id;
    }

    /* ─── Reading Progress Bar ──────────────── */
    function buildProgressBar() {
        const bar = document.createElement('div');
        bar.id = 'toc-progress-bar';
        document.body.appendChild(bar);

        window.addEventListener('scroll', () => {
            const doc = document.documentElement;
            const scrolled = doc.scrollTop;
            const total = doc.scrollHeight - doc.clientHeight;
            bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
        }, { passive: true });
    }

    /* ─── Copy-Link Button on Headings ──────── */
    function attachCopyLinks(headings) {
        headings.forEach(h => {
            const btn = document.createElement('button');
            btn.className = 'heading-copy-btn';
            btn.title = 'Copy link';
            btn.innerHTML = '&#128279;'; // 🔗
            btn.setAttribute('aria-label', 'Copy link to section');

            btn.addEventListener('click', () => {
                const url = `${location.origin}${location.pathname}#${h.id}`;
                navigator.clipboard.writeText(url).then(() => {
                    btn.innerHTML = '&#10003;'; // ✓
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.innerHTML = '&#128279;';
                        btn.classList.remove('copied');
                    }, 1500);
                });
            });

            h.style.position = 'relative';
            h.appendChild(btn);
        });
    }

    /* ─── Build TOC Tree ─────────────────────── */
    function buildTocTree(headings) {
        const root = document.createElement('ul');
        root.className = 'rtoc-list';

        let currentH2Li = null;
        let currentH2Ul = null;

        headings.forEach((h, idx) => {
            const id = createId(h, idx);
            const text = h.textContent.replace(/\s*🔗\s*$/, '').trim();
            const level = parseInt(h.tagName[1], 10); // 2 or 3

            const li = document.createElement('li');
            li.className = `rtoc-item rtoc-h${level}`;
            li.dataset.id = id;

            const row = document.createElement('div');
            row.className = 'rtoc-row';

            if (level === 2) {
                // H2 — possibly has children, add toggle
                const toggle = document.createElement('span');
                toggle.className = 'rtoc-toggle';
                toggle.textContent = '▶';
                row.appendChild(toggle);

                const link = document.createElement('a');
                link.href = `#${id}`;
                link.className = 'rtoc-link rtoc-h2-link';
                link.textContent = text;
                row.appendChild(link);
                li.appendChild(row);

                // Nested list for H3s
                const sub = document.createElement('ul');
                sub.className = 'rtoc-sub collapsed';
                li.appendChild(sub);

                root.appendChild(li);
                currentH2Li = li;
                currentH2Ul = sub;

            } else if (level === 3) {
                const link = document.createElement('a');
                link.href = `#${id}`;
                link.className = 'rtoc-link rtoc-h3-link';
                link.textContent = text;
                row.appendChild(link);
                li.appendChild(row);

                // Append to nearest parent H2, or root if none
                const target = currentH2Ul || root;
                target.appendChild(li);
            }
        });

        // Toggle collapse on h2 rows
        root.querySelectorAll('.rtoc-h2.rtoc-item').forEach(li => {
            const toggle = li.querySelector('.rtoc-toggle');
            const sub = li.querySelector('.rtoc-sub');
            if (!toggle || !sub) return;

            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const collapsed = sub.classList.toggle('collapsed');
                toggle.textContent = collapsed ? '▶' : '▼';
                toggle.classList.toggle('open', !collapsed);
            });
        });

        return root;
    }

    /* ─── ScrollSpy via IntersectionObserver ── */
    function setupScrollSpy(headings, tocEl) {
        let activeId = null;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    if (id === activeId) return;
                    activeId = id;

                    // Update URL hash without scrolling
                    history.replaceState(null, '', `#${id}`);

                    // Highlight active link
                    tocEl.querySelectorAll('.rtoc-link').forEach(a => {
                        a.classList.toggle('rtoc-active', a.hash === `#${id}`);
                    });

                    // Auto-expand parent H2 group of active H3
                    const activeItem = tocEl.querySelector(`.rtoc-item[data-id="${id}"]`);
                    if (activeItem && activeItem.classList.contains('rtoc-h3')) {
                        const parentLi = activeItem.closest('.rtoc-h2');
                        if (parentLi) {
                            const sub = parentLi.querySelector('.rtoc-sub');
                            const toggle = parentLi.querySelector('.rtoc-toggle');
                            if (sub && sub.classList.contains('collapsed')) {
                                sub.classList.remove('collapsed');
                                if (toggle) {
                                    toggle.textContent = '▼';
                                    toggle.classList.add('open');
                                }
                            }
                        }
                    }

                    // Scroll active link into view within the TOC panel
                    const activeLink = tocEl.querySelector(`.rtoc-link[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                }
            });
        }, { rootMargin: ROOT_MARGIN, threshold: 0 });

        headings.forEach(h => observer.observe(h));
    }

    /* ─── Smooth scroll on link click ─────── */
    function setupSmoothScroll(tocEl) {
        tocEl.addEventListener('click', e => {
            const link = e.target.closest('a.rtoc-link');
            if (!link) return;
            e.preventDefault();
            const target = document.getElementById(link.hash.slice(1));
            if (target) {
                window.scrollTo({ top: target.offsetTop - OFFSET, behavior: 'smooth' });
            }
        });
    }

    /* ─── Main Init ──────────────────────────── */
    function init() {
        const article = document.querySelector('.article-content');
        const layout = document.querySelector('.article-layout');
        if (!article || !layout) return;

        const headings = Array.from(article.querySelectorAll(HEADINGS));
        if (headings.length < 2) return; // not worth showing

        // 1. Progress bar
        buildProgressBar();

        // 2. Copy-link buttons
        attachCopyLinks(headings);

        // 3. Build sidebar
        const sidebar = document.createElement('aside');
        sidebar.id = 'toc-right';
        sidebar.className = 'toc-right-sidebar';

        const header = document.createElement('div');
        header.className = 'rtoc-header';
        header.innerHTML = '<span class="rtoc-title">On This Page</span>';
        sidebar.appendChild(header);

        const scrollWrap = document.createElement('div');
        scrollWrap.className = 'rtoc-scroll';
        const tocTree = buildTocTree(headings);
        scrollWrap.appendChild(tocTree);
        sidebar.appendChild(scrollWrap);

        // 4. Append sidebar after article-container
        layout.appendChild(sidebar);

        // 5. ScrollSpy
        setupScrollSpy(headings, sidebar);

        // 6. Smooth scroll
        setupSmoothScroll(sidebar);

        // 7. Activate entry matching current hash on load
        if (location.hash) {
            const initLink = sidebar.querySelector(`.rtoc-link[href="${location.hash}"]`);
            if (initLink) initLink.classList.add('rtoc-active');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

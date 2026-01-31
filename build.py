import os
import re
import json
import datetime

CONTENT_DIR = 'content'
OUTPUT_DIR = '.'
TEMPLATE_FILE = 'blog-template.html'

def parse_markdown(content):
    """
    Enhanced Markdown parser supporting: Frontmatter, H1-H3, Bold, Links, 
    Images, Lists, GitHub-style Alerts, and Code Blocks.
    """
    metadata = {}
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            yaml_text = parts[1]
            for line in yaml_text.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    metadata[key.strip()] = value.strip().strip('"')
            content = parts[2]

    # Defaults
    metadata['category'] = metadata.get('category', 'General')
    tags_raw = metadata.get('tags', '')
    if isinstance(tags_raw, str):
        metadata['tags'] = [t.strip() for t in tags_raw.split(',')] if tags_raw else []
    else:
        metadata['tags'] = tags_raw if isinstance(tags_raw, list) else []

    text = content.strip()

    # 1. Block Level: Code Blocks (Triple backticks)
    def repl_code(match):
        lang = match.group(1).strip()
        code = match.group(2).replace('<', '&lt;').replace('>', '&gt;')
        return f'<pre><code class="language-{lang}">{code}</code></pre>'
    text = re.sub(r'```(\w*)\n?(.*?)```', repl_code, text, flags=re.DOTALL)

    # 2. Block Level: Ad Placeholder
    ad_html = """<div class="ad-slot-container"><div class="ad-placeholder"><small>Advertisement Space (Google Adsense)</small></div></div>"""
    text = text.replace('<!-- ad-placeholder -->', ad_html)

    # 3. Block Level: Headers
    text = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', text, flags=re.MULTILINE)
    text = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', text, flags=re.MULTILINE)
    text = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', text, flags=re.MULTILINE)

    # 4. Block Level: Horizontal Rules
    text = re.sub(r'^---$', r'<hr>', text, flags=re.MULTILINE)

    # 5. Inline Level: Bold, Images, Links
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    # Images: ![alt](url) -> Centered image with fixed width
    def repl_img(match):
        alt = match.group(1)
        url = match.group(2)
        return f'<p align="center"><img src="{url}" alt="{alt}" width="700"></p>'
    text = re.sub(r'\!\[(.*?)\]\((.*?)\)', repl_img, text)
    # Links: [text](url) (must not be preceded by !)
    text = re.sub(r'(?<!\!)\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', text)

    # 6. Advanced Block Level: Lists, Alerts, and Paragraphs
    lines = text.split('\n')
    processed_lines = []
    in_list = False
    in_alert = False
    alert_type = ""

    for line in lines:
        stripped = line.strip()
        
        # Handle Alerts (> [!NOTE])
        alert_match = re.match(r'^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]', stripped)
        if alert_match:
            if in_list: processed_lines.append('</ul>'); in_list = False
            alert_type = alert_match.group(1).lower()
            processed_lines.append(f'<div class="alert alert-{alert_type}">')
            in_alert = True
            continue
        
        if in_alert and stripped.startswith('>'):
            content_line = stripped[1:].strip()
            processed_lines.append(content_line)
            continue
        elif in_alert and not stripped.startswith('>'):
            processed_lines.append('</div>')
            in_alert = False

        # Handle Lists
        list_match = re.match(r'^[\-\*\+] (.*)$', stripped)
        if list_match:
            if not in_list:
                processed_lines.append('<ul>')
                in_list = True
            processed_lines.append(f'<li>{list_match.group(1)}</li>')
        else:
            if in_list:
                processed_lines.append('</ul>')
                in_list = False
            
            # Paragraphs (if not a tag)
            if stripped and not stripped.startswith('<'):
                processed_lines.append(f'<p>{stripped}</p>')
            else:
                processed_lines.append(line)

    if in_list: processed_lines.append('</ul>')
    if in_alert: processed_lines.append('</div>')

    return metadata, '\n'.join(processed_lines)

def generate_site():
    print("Starting Build...")
    
    articles = []
    
    # Get Template
    # We will create a template string here to avoid needing a separate file initially
    # or we can read from existing HTML if we want to be fancy.
    # Let's use a hardcoded template structure based on the existing design.
    
    files = os.listdir(CONTENT_DIR)
    for filename in files:
        if not filename.endswith('.md'): continue
        
        print(f"Processing {filename}...")
        
        with open(os.path.join(CONTENT_DIR, filename), 'r', encoding='utf-8') as f:
            content = f.read()
            
        metadata, html_content = parse_markdown(content)
        
        # Create Slug
        slug = 'article-' + filename.replace('.md', '.html')
        
        # Add to articles list
        articles.append({
            'title': metadata.get('title', 'Untitled'),
            'date': metadata.get('date', ''),
            'excerpt': metadata.get('excerpt', ''),
            'link': 'article-' + filename.replace('.md', '.html'),
            'category': metadata.get('category', 'General'),
            'tags': metadata.get('tags', [])
        })
        
        # HTML Template
        full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{metadata.get('title')} - Autodevv</title>
    <meta name="description" content="{metadata.get('excerpt')}">
    <meta name="author" content="Autodevv">
    <meta property="og:title" content="{metadata.get('title')}">
    <meta property="og:description" content="{metadata.get('excerpt')}">
    <meta property="og:type" content="article">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
    <script>
        (function() {{
            const theme = localStorage.getItem('theme');
            const isArticle = window.location.pathname.includes('article-');
            if (theme === 'light' || (!theme && isArticle)) {{
                document.documentElement.setAttribute('data-theme', 'light');
            }} else {{
                document.documentElement.removeAttribute('data-theme');
            }}
        }})();
    </script>
    <!-- Adsense Placeholder -->
    <!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script> -->
</head>
<body>
    <nav class="navbar">
        <div class="container nav-content">
            <a href="index.html" class="logo">Autodevv<span style="color:var(--primary)">.</span></a>
            <ul class="nav-links">
                <li><a href="index.html#home">Home</a></li>
                <li><a href="index.html#about">About</a></li>
                <li><a href="index.html#portfolio">Work</a></li>
                <li><a href="index.html#blog">Blog</a></li>
                <li><a href="categories.html">Categories</a></li>
            </ul>
            <div class="nav-actions">
                <button id="search-toggle" class="theme-btn" title="Search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
                <button id="theme-toggle" class="theme-btn" title="Toggle Theme">
                    <i class="fa-solid fa-moon"></i>
                </button>
            </div>
            <div class="burger">
                <div class="line1"></div>
                <div class="line2"></div>
                <div class="line3"></div>
            </div>
        </div>
    </nav>

    <!-- Search Overlay -->
    <div id="search-overlay" class="search-overlay hidden">
        <div class="search-container">
            <div class="search-header">
                <input type="text" id="search-input" placeholder="Search technical articles..." autocomplete="off">
                <button id="search-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="search-results" class="search-results"></div>
        </div>
    </div>
    <!-- Mobile Menu -->
    <div class="mobile-menu">
        <a href="index.html#home">Home</a>
        <a href="index.html#about">About</a>
        <a href="index.html#portfolio">Work</a>
        <a href="index.html#blog">Blog</a>
        <a href="categories.html">Categories</a>
    </div>

    <section class="section article-page">
        <div class="article-container">
            <header class="article-header">
                <span class="tag">{metadata.get('date')}</span>
                <h1>{metadata.get('title')}</h1>
            </header>
            <article class="article-content">
                {html_content}
            </article>
            <div class="ad-slot-container" style="margin-top: 40px;">
                <div class="ad-placeholder">
                    <small>Advertisement Space (Google Adsense)</small>
                </div>
            </div>
            <footer class="article-footer">
                <a href="index.html#blog" class="btn btn-outline">← Back to Articles</a>
            </footer>
        </div>
    </section>
    <footer>
        <div class="container">
            <p>&copy; 2026 Autodevv. Professional Automotive Software Systems.</p>
            <div style="margin-top: 10px; font-size: 0.9em;">
                <a href="privacy.html">Privacy Policy</a>
                <a href="terms.html">Terms of Service</a>
            </div>
        </div>
    </footer>
    <script src="articles.js"></script>
    <script src="app.js"></script>
</body>
</html>"""
        
        with open(slug, 'w', encoding='utf-8') as f:
            f.write(full_html)

    # Generate articles.js
    print("Generating articles.js...")
    js_content = f"const articlesData = {json.dumps(articles, indent=4)};"
    with open('articles.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    # Generate Sitemap
    print("Generating sitemap.xml...")
    base_url = "https://vivekpkd.github.io"
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Static pages
    for p in ['index.html', 'privacy.html', 'terms.html']:
        sitemap += f'  <url><loc>{base_url}/{p}</loc></url>\n'
        
    # Article pages
    for a in articles:
        sitemap += f'  <url><loc>{base_url}/{a["link"]}</loc></url>\n'
        
    sitemap += '</urlset>'
    with open('sitemap.xml', 'w') as f:
        f.write(sitemap)
        
    # Generate Robots.txt
    print("Generating robots.txt...")
    robots = f"User-agent: *\nAllow: /\nSitemap: {base_url}/sitemap.xml"
    with open('robots.txt', 'w') as f:
        f.write(robots)
        
    print("Build Complete!")

if __name__ == "__main__":
    generate_site()

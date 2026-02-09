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
    metadata['title'] = metadata.get('title', 'Untitled')
    metadata['date'] = metadata.get('date', datetime.datetime.now().strftime("%b %d, %Y"))
    
    tags_raw = metadata.get('tags', '')
    if isinstance(tags_raw, str):
        # Handle cases like ["tag1", "tag2"] or tag1, tag2
        tags_raw = tags_raw.strip('[]').replace('"', '').replace("'", "")
        metadata['tags'] = [t.strip() for t in tags_raw.split(',')] if tags_raw else []
    else:
        metadata['tags'] = tags_raw if isinstance(tags_raw, list) else []

    text = content.strip()

    # 1. Block Level: Code Blocks (Premium IDE Style)
    def repl_code(match):
        lang = match.group(1).strip()
        code_content = match.group(2).strip()
        
        # Add line numbers
        lines = code_content.split('\n')
        highlighted_code = []
        for i, line in enumerate(lines, 1):
            line = line.replace('<', '&lt;').replace('>', '&gt;')
            # Basic syntax highlighting (keywords)
            keywords = ['void', 'int', 'char', 'uint32_t', 'uint8_t', 'static', 'extern', 'volatile', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'return', '#define', '#include']
            for kw in keywords:
                line = re.sub(rf'\b{kw}\b', f'<span class="keyword">{kw}</span>', line)
            
            highlighted_code.append(f'<span class="line-num">{i}</span>{line}')
            
        inner_html = "\n".join(highlighted_code)
        return f'<div class="code-ide">{inner_html}</div>'
        
    text = re.sub(r'```(\w*)\n?(.*?)```', repl_code, text, flags=re.DOTALL)

    # 2. Block Level: Ad Placeholder
    ad_html = """<div class="ad-slot-container"><div class="ad-placeholder"><small>Advertisement Space (Google Adsense)</small></div></div>"""
    text = text.replace('<!-- ad-placeholder -->', ad_html)

    # 3. Block Level: Headers
    text = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', text, flags=re.MULTILINE)
    text = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', text, flags=re.MULTILINE)
    text = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', text, flags=re.MULTILINE)
    text = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', text, flags=re.MULTILINE)
    text = re.sub(r'^##### (.*?)$', r'<h5>\1</h5>', text, flags=re.MULTILINE)

    # 4. Block Level: Horizontal Rules
    text = re.sub(r'^---$', r'<hr>', text, flags=re.MULTILINE)

    # 5. Inline Level: Bold, Images, Links
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    # Images: ![alt](url)
    def repl_img(match):
        alt = match.group(1)
        url = match.group(2)
        return f'<p align="center"><img src="{url}" alt="{alt}" style="max-width:100%; border-radius:12px; margin: 20px 0;"></p>'
    text = re.sub(r'\!\[(.*?)\]\((.*?)\)', repl_img, text)
    # Links
    text = re.sub(r'(?<!\!)\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', text)

    # 6. Advanced Block Level: Lists, Alerts, and Paragraphs
    lines = text.split('\n')
    processed_lines = []
    in_list = False
    in_alert = False
    alert_type = ""

    for line in lines:
        stripped = line.strip()
        
        # Handle Alerts
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
            
            # Paragraphs
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
            'title': metadata.get('title'),
            'date': metadata.get('date'),
            'excerpt': metadata.get('excerpt', ''),
            'link': slug,
            'category': metadata.get('category'),
            'tags': metadata.get('tags')
        })
        
        # HTML Template
        full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{metadata.get('title')} - Autodevv</title>
    <meta name="description" content="{metadata.get('excerpt')}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css?v=1.2">
    <script>
        (function() {{
            const theme = localStorage.getItem('theme');
            if (theme === 'dark') {{
                document.documentElement.removeAttribute('data-theme');
            }} else {{
                document.documentElement.setAttribute('data-theme', 'light');
            }}
        }})();
    </script>
    <style>
        .code-ide {{
            background-color: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-left: 4px solid var(--primary);
            color: #24292e;
            font-family: var(--font-mono);
            font-size: 0.9rem;
            line-height: 1.6;
            margin: 1.5rem 0;
            padding: 1.5rem;
            border-radius: 8px;
            overflow: auto;
        }}
        [data-theme="dark"] .code-ide {{
            background-color: #24292e;
            border: 1px solid #444;
            color: #e1e4e8;
        }}
        .line-num {{
            color: var(--text-muted);
            display: inline-block;
            width: 2rem;
            user-select: none;
            border-right: 1px solid var(--border);
            margin-right: 1rem;
        }}
        .keyword {{ color: #d73a49; font-weight: bold; }}
        [data-theme="dark"] .keyword {{ color: #ff7b72; }}
    </style>
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
                <button id="search-toggle" class="theme-btn"><i class="fa-solid fa-magnifying-glass"></i></button>
                <button id="theme-toggle" class="theme-btn"><i class="fa-solid fa-sun"></i></button>
            </div>
            <div class="burger">
                <div class="line1"></div><div class="line2"></div><div class="line3"></div>
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
            
            <!-- Pagination -->
            <div class="pagination" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border);">
                {f'<a href="{metadata.get("prev_link")}" class="pg-item pg-btn" style="padding: 0 20px; width: auto; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border); font-weight: 600; transition: 0.3s;"><i class="fa-solid fa-chevron-left"></i> Prev</a>' if metadata.get("prev_link") else ''}
                {f'<a href="{metadata.get("next_link")}" class="pg-item pg-btn" style="padding: 0 20px; width: auto; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border); font-weight: 600; transition: 0.3s;">Next <i class="fa-solid fa-chevron-right"></i></a>' if metadata.get("next_link") else ''}
            </div>

            <footer class="article-footer" style="margin-top: 2rem; text-align: center;">
                <a href="blog.html" class="btn btn-outline">← Back to Articles List</a>
            </footer>
        </div>
    </section>

    <footer>
        <div class="container" style="text-align: center; padding: 40px 0; border-top: 1px solid var(--border); color: var(--text-muted);">
            <p>&copy; 2026 Autodevv. Master the Machine.</p>
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

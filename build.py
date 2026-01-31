import os
import re
import json
import datetime

CONTENT_DIR = 'content'
OUTPUT_DIR = '.'
TEMPLATE_FILE = 'blog-template.html'

def parse_markdown(content):
    """
    Simple Regex-based Markdown parser to avoid dependencies.
    Supports: Frontmatter, H1/H2, Paragraphs, Code Blocks, Links, Bold.
    """
    # Parse Frontmatter
    frontmatter = {}
    body = content
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            yaml_text = parts[1]
            body = parts[2]
            for line in yaml_text.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    frontmatter[key.strip()] = value.strip().strip('"')

    # Convert Markdown to HTML
    html = body
    
    # Code Blocks (Triple backticks)
    def repl_code(match):
        code = match.group(1).replace('<', '&lt;').replace('>', '&gt;')
        return f'<pre><code>{code}</code></pre>'
    html = re.sub(r'```(.*?)```', repl_code, html, flags=re.DOTALL)
    
    # Headers
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    
    # Bold
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    
    # Links
    html = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', html)
    
    # Ad Placeholder
    html = html.replace('<!-- ad-placeholder -->', 
        '<div class="ad-placeholder in-article" style="margin: 30px 0;"><small>Advertisement Space (Google Adsense)</small></div>')
    
    # Paragraphs (Simple split by double newline)
    lines = html.split('\n\n')
    final_lines = []
    for line in lines:
        line = line.strip()
        if not line: continue
        if line.startswith('<h') or line.startswith('<pre') or line.startswith('<div'):
            final_lines.append(line)
        else:
            final_lines.append(f'<p>{line}</p>')
            
    return frontmatter, '\n'.join(final_lines)

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
            'excerpt': metadata.get('excerpt', ''),
            'date': metadata.get('date', ''),
            'link': slug
        })
        
        # HTML Template
        full_html = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{metadata.get('title')} - Vivek A</title>
    <meta name="description" content="{metadata.get('excerpt')}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
    <!-- AdSense Placeholder -->
</head>
<body>
    <nav class="navbar">
        <div class="container nav-content">
            <a href="index.html" class="logo">VIVEK A<span style="color:var(--primary)">.</span></a>
            <ul class="nav-links">
                <li><a href="index.html#home">Home</a></li>
                <li><a href="index.html#blog" class="active">Blog</a></li>
                <li><a href="index.html#contact">Contact</a></li>
                <li><button id="theme-toggle" class="theme-btn"><i class="fas fa-moon"></i></button></li>
            </ul>
        </div>
    </nav>
    <main style="padding-top: var(--nav-height); padding-bottom: 80px;">
        <article class="container">
            <header>
                <div class="tag">{metadata.get('date')}</div>
                <h1>{metadata.get('title')}</h1>
                <p class="excerpt" style="font-size: 1.25rem; color: var(--text-muted); margin-bottom: 3rem;">{metadata.get('excerpt')}</p>
            </header>
            <div class="content">
                {html_content}
            </div>
            <footer style="margin-top: 5rem; padding-top: 2rem; border-top: 1px solid var(--border); text-align: left;">
                <a href="index.html#blog" class="btn btn-outline">← Back to Blog</a>
            </footer>
        </article>
    </main>
    <footer>
        <div class="container">
            <p>&copy; 2026 Vivek A. Professional Automotive Software Portfolio.</p>
            <div style="margin-top: 10px;">
                <a href="privacy.html">Privacy Policy</a>
                <a href="terms.html">Terms of Service</a>
            </div>
        </div>
    </footer>
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

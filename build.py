import os
import markdown
import re
import json
from datetime import datetime

# Paths
TUTORIAL_TEMPLATE_PATH = 'tutorial-template.html'
DOWNLOAD_TEMPLATE_PATH = 'download-template.html'
TUTORIALS_DIRS = ['tutorials', 'content']
OUTPUT_DIR = '.'
ARTICLES_JS_PATH = 'articles.js'

# Category Mapping (File basename -> Category Name)
CATEGORY_MAPPING = {
    'stm32intro.md': 'Embedded Systems',
    'image-sample.md': 'Basics',
    'download.md': 'Resources',
    'tutorial.md': 'General'
}

# Sidebar Category Mapping (for the accordion)
SIDEBAR_CATEGORY_MAPPING = {
    'stm32intro.md': 'Embedded Systems',
    'image-sample.md': 'Basics',
    'download.md': 'Resources',
    'tutorial.md': 'Main Hub'
}

# Load templates
def load_template(path):
    if not os.path.exists(path):
        print(f"Error: Template not found at {path}")
        exit(1)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

tutorial_template = load_template(TUTORIAL_TEMPLATE_PATH)
download_template = load_template(DOWNLOAD_TEMPLATE_PATH)

def get_title(md_content):
    match = re.search(r'^#\s+(.*)', md_content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return "Untitled Tutorial"

def get_first_image(md_content):
    # Match markdown images ![alt](url)
    match = re.search(r'!\[.*?\]\((.*?)\)', md_content)
    if match:
        return match.group(1)
    # Match HTML images <img src="url">
    match = re.search(r'<img.*?src=["\'](.*?)["\']', md_content)
    if match:
        return match.group(1)
    return ""

def get_excerpt(md_content):
    # Remove title
    content = re.sub(r'^#\s+.*', '', md_content, flags=re.MULTILINE).strip()
    # Take first 150 chars of text, remove markdown formatting
    excerpt = re.sub(r'[#*`\[\]]', '', content)
    excerpt = re.sub(r'!.*?\)', '', excerpt) # Remove images
    return excerpt[:150].strip() + "..."

def parse_frontmatter(content):
    """
    Separates YAML frontmatter from markdown content.
    Returns (metadata_dict, stripped_content)
    """
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        frontmatter_str = match.group(1)
        remaining_content = content[match.end():]
        metadata = {}
        for line in frontmatter_str.split('\n'):
            if ':' in line:
                key, val = line.split(':', 1)
                metadata[key.strip().lower()] = val.strip().strip('"').strip("'")
        return metadata, remaining_content
    return {}, content

# Collect all markdown files
md_files = []
for d in TUTORIALS_DIRS:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith('.md'):
                if f == 'sample.md':
                    continue
                md_files.append(os.path.join(d, f))

# Process each file
all_items = []
articles_data = []

for md_path in md_files:
    with open(md_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()
    
    # Parse YAML frontmatter if present
    metadata, content = parse_frontmatter(raw_content)
    
    title = metadata.get('title') or get_title(content)
    basename = os.path.basename(md_path)
    
    # Priority mapping
    if basename == 'tutorial.md':
        filename = 'tutorial.html'
    elif basename == 'download.md':
        filename = 'download.html'
    else:
        filename = basename.replace('.md', '.html')
    
    # Determine type: Tutorial or Download
    page_type = metadata.get('type', 'Tutorial').capitalize()
    if basename == 'download.md':
        page_type = 'Download'
    
    sidebar_category = metadata.get('category') or SIDEBAR_CATEGORY_MAPPING.get(basename, 'Other Topics')
    main_category = metadata.get('category') or CATEGORY_MAPPING.get(basename, 'General')
    
    image = get_first_image(content)
    excerpt = get_excerpt(content)
    # Using standard format: Mar 07, 2026
    date_str = metadata.get('date') or datetime.now().strftime("%b %d, %Y")
    
    item = {
        'path': md_path,
        'title': title,
        'filename': filename,
        'content': content,
        'category': sidebar_category,
        'basename': basename,
        'type': page_type
    }
    all_items.append(item)
    
    # Don't add hub/download to articles list if desired, or filter in JS
    if basename not in ['tutorial.md', 'download.md'] and page_type != 'Download':
        articles_data.insert(0, {
            "title": title,
            "date": date_str,
            "excerpt": excerpt,
            "link": filename,
            "category": main_category,
            "tags": metadata.get('tags') if isinstance(metadata.get('tags'), list) else [main_category, "Automotive"],
            "image": image
        })

# Deduplicate items
unique_items = {}
for item in all_items:
    if item['filename'] not in unique_items:
        unique_items[item['filename']] = item
    else:
        if item['basename'] in ['tutorial.md', 'download.md']:
             unique_items[item['filename']] = item

all_items = list(unique_items.values())

def generate_sidebar(items_list):
    # Organize by Category
    organized = {}
    for t in items_list:
        cat = t['category']
        if cat not in organized:
            organized[cat] = []
        organized[cat].append(t)

    # Sort categories (Main Hub first, then others)
    cat_order = ['Main Hub', 'AUTOSAR Stack', 'Embedded mastery', 'Modern Tooling', 'Resources']
    sorted_categories = sorted(organized.keys(), key=lambda x: (cat_order.index(x) if x in cat_order else 999, x))

    # Generate Sidebar HTML
    sidebar_html = ""
    for cat in sorted_categories:
        cat_safe = cat.lower().replace(" ", "-")
        sidebar_html += f'<div class="sidebar-category" data-category="{cat_safe}">\n'
        sidebar_html += f'    <button class="category-header">\n'
        sidebar_html += f'        <span>{cat}</span>\n'
        sidebar_html += f'        <i class="fa-solid fa-chevron-down toggle-icon"></i>\n'
        sidebar_html += f'    </button>\n'
        sidebar_html += f'    <div class="category-content">\n'
        
        items = sorted(organized[cat], key=lambda x: x['title'])
        for item in items:
            sidebar_html += f'        <a href="{item["filename"]}" data-file="{item["filename"]}">{item["title"]}</a>\n'
        
        sidebar_html += f'    </div>\n'
        sidebar_html += f'</div>\n'
    return sidebar_html

# Separate tutorials and downloads for sidebar generation
tutorials_list = [i for i in all_items if i['type'] == 'Tutorial']
downloads_list = [i for i in all_items if i['type'] == 'Download']

tutorial_sidebar_html = generate_sidebar(tutorials_list)
download_sidebar_html = generate_sidebar(downloads_list)

# Generate HTML for each item
for item in all_items:
    body_html = markdown.markdown(item['content'], extensions=['fenced_code', 'tables', 'codehilite', 'nl2br', 'attr_list'])
    
    # Select template and sidebar based on type
    if item['type'] == 'Download':
        template_to_use = download_template
        sidebar_to_use = download_sidebar_html
    else:
        template_to_use = tutorial_template
        sidebar_to_use = tutorial_sidebar_html
    
    page_html = template_to_use.replace('{{TITLE}}', item['title'])
    page_html = page_html.replace('{{CONTENT}}', body_html)
    
    current_sidebar = sidebar_to_use.replace(f'href="{item["filename"]}"', f'href="{item["filename"]}" class="active"')
    page_html = page_html.replace('{{SIDEBAR}}', current_sidebar)
    
    output_path = os.path.join(OUTPUT_DIR, item['filename'])
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(page_html)
    print(f"Generated ({item['type']}): {output_path}")

# Update articles.js
with open(ARTICLES_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(f"const articlesData = {json.dumps(articles_data, indent=4)};")
print(f"Updated: {ARTICLES_JS_PATH}")

print("Done! All pages and articles metadata updated.")

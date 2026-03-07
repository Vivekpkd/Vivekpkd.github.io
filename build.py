import os
import markdown
import re
import json
from datetime import datetime

# Paths
TEMPLATE_PATH = 'tutorial-template.html'
TUTORIALS_DIRS = ['tutorials', 'content']
OUTPUT_DIR = '.'
ARTICLES_JS_PATH = 'articles.js'

# Category Mapping (File basename -> Category Name)
CATEGORY_MAPPING = {
    'autosar-tutorial.md': 'AUTOSAR',
    'autosar-basics.md': 'AUTOSAR',
    'c-programming.md': 'Embedded C',
    'embedded-systems.md': 'Embedded C',
    'embedded-tutorial.md': 'Embedded C',
    'python-tutorial.md': 'Python',
    'download.md': 'Resources',
    'tutorial.md': 'General'
}

# Sidebar Category Mapping (for the accordion)
SIDEBAR_CATEGORY_MAPPING = {
    'autosar-tutorial.md': 'AUTOSAR Stack',
    'autosar-basics.md': 'AUTOSAR Stack',
    'c-programming.md': 'Embedded mastery',
    'embedded-systems.md': 'Embedded mastery',
    'embedded-tutorial.md': 'Embedded mastery',
    'python-tutorial.md': 'Modern Tooling',
    'download.md': 'Resources',
    'tutorial.md': 'Main Hub'
}

# Load template
if not os.path.exists(TEMPLATE_PATH):
    print(f"Error: Template not found at {TEMPLATE_PATH}")
    exit(1)

with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
    template = f.read()

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
tutorials = []
articles_data = []

for md_path in md_files:
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    title = get_title(content)
    basename = os.path.basename(md_path)
    
    # Priority mapping
    if basename == 'tutorial.md':
        filename = 'tutorial.html'
    elif basename == 'download.md':
        filename = 'download.html'
    else:
        filename = basename.replace('.md', '.html')
    
    sidebar_category = SIDEBAR_CATEGORY_MAPPING.get(basename, 'Other Topics')
    main_category = CATEGORY_MAPPING.get(basename, 'General')
    
    image = get_first_image(content)
    excerpt = get_excerpt(content)
    # Using standard format: Mar 07, 2026
    date_str = datetime.now().strftime("%b %d, %Y")
    
    tutorial_item = {
        'path': md_path,
        'title': title,
        'filename': filename,
        'content': content,
        'category': sidebar_category,
        'basename': basename
    }
    tutorials.append(tutorial_item)
    
    # Don't add hub/download to articles list if desired, or filter in JS
    if basename not in ['tutorial.md', 'download.md']:
        articles_data.insert(0, {
            "title": title,
            "date": datetime.now().strftime("%b %d, %Y"),
            "excerpt": excerpt,
            "link": filename,
            "category": main_category,
            "tags": [main_category, "Automotive"],
            "image": image
        })

# Deduplicate Tutorials for Sidebar
unique_tutorials = {}
for t in tutorials:
    if t['filename'] not in unique_tutorials:
        unique_tutorials[t['filename']] = t
    else:
        if t['basename'] in ['tutorial.md', 'download.md']:
             unique_tutorials[t['filename']] = t

tutorials = list(unique_tutorials.values())

# Organize by Category
organized = {}
for t in tutorials:
    cat = t['category']
    if cat not in organized:
        organized[cat] = []
    organized[cat].append(t)

# Sort categories (Main Hub first, then others)
cat_order = ['Main Hub', 'AUTOSAR Stack', 'Embedded mastery', 'Modern Tooling', 'Resources']
sorted_categories = sorted(organized.keys(), key=lambda x: (cat_order.index(x) if x in cat_order else 999, x))

# Generate Sidebar HTML (Accordion Structure)
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

# Generate HTML for each tutorial
for t in tutorials:
    body_html = markdown.markdown(t['content'], extensions=['fenced_code', 'tables', 'codehilite', 'nl2br'])
    page_html = template.replace('{{TITLE}}', t['title'])
    page_html = page_html.replace('{{CONTENT}}', body_html)
    current_sidebar = sidebar_html.replace(f'href="{t["filename"]}"', f'href="{t["filename"]}" class="active"')
    page_html = page_html.replace('{{SIDEBAR}}', current_sidebar)
    
    output_path = os.path.join(OUTPUT_DIR, t['filename'])
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(page_html)
    print(f"Generated: {output_path}")

# Update articles.js
with open(ARTICLES_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(f"const articlesData = {json.dumps(articles_data, indent=4)};")
print(f"Updated: {ARTICLES_JS_PATH}")

print("Done! All pages and articles metadata updated.")

import glob

for f in glob.glob('article-*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        c = file.read()
    print(f"{f[:35]:<35} | sidebar.js: {c.count('js/sidebar.js')} | articles.js: {c.count('articles.js')} | toc-right.js: {c.count('js/toc-right.js')}")

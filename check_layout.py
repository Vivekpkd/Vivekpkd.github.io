import glob

for file in glob.glob('article-*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    div_start = content.count('<div')
    div_end = content.count('</div')
    sect_end = content.count('</section>')
    article_layout = content.count('<div class="article-layout">')
    article_container = content.count('<div class="article-container">')
    article_sidebar = content.count('<aside class="article-sidebar"')
    
    print(f"{file[:35]:<35} | layout:{article_layout} container:{article_container} sidebar:{article_sidebar} section_ends:{sect_end} div_diff:{div_start-div_end}")

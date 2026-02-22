import os

directory = r'c:\Users\Vivek A\.gemini\antigravity\scratch\Vivekpkd.github.io'
files_to_process = [
    'article-automotive-bootloader.html',
    'article-autosar-masterclass-1.html',
    'article-autosar-masterclass-2.html',
    'article-autosar-masterclass-3.html',
    'article-autosar-masterclass-4.html',
    'article-autosar-masterclass-5.html',
    'article-autosar-masterclass-6.html',
    'article-autosar.html',
    'article-autosar_stacks.html',
    'article-embedded-c-basics-1.html',
    'article-embedded-c-basics-2.html',
    'article-embedded-c-basics-3.html',
    'article-embedded-c-basics-4.html',
    'article-embedded-c-basics-5.html',
    'article-embedded-c-basics-6.html',
    'article-fee-autosar.html',
    'article-hardware-security-module-hsm.html'
]

wrapper_start = '    <div class="article-layout">\n        <aside class="article-sidebar" id="article-sidebar"></aside>'
wrapper_end = '    </div>'

for filename in files_to_process:
    filepath = os.path.join(directory, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already processed
        if 'article-layout' in content:
            print(f"Skipping {filename}, already processed.")
            continue

        # Wrap article-container
        container_start = '<div class="article-container">'
        if container_start in content:
            new_content = content.replace(container_start, f'{wrapper_start}\n        {container_start}')
            
            # Find the closing tag for the section containing the container
            # The structure is usually: <section class="section article-page"><div class="article-container">...</div></section>
            # We want to insert </div> before </section>
            if '</section>' in new_content:
                # Find the last occurrence before </body> or just before the next script
                parts = new_content.split('</section>')
                # Assuming the first </section> after the container is the right one
                new_content = parts[0] + f'        {wrapper_end}\n    </section>' + '</section>'.join(parts[1:])
                
                # Add the script before </body>
                script_tag = '<script src="js/sidebar.js"></script>'
                if script_tag not in new_content:
                    new_content = new_content.replace('</body>', f'    {script_tag}\n</body>')

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Processed {filename}")
            else:
                print(f"Could not find </section> in {filename}")
        else:
            print(f"Could not find container start in {filename}")
    else:
        print(f"File not found: {filename}")

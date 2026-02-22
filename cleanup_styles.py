import os
import re

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

# Regex to match the entire <style> block containing .code-ide
style_pattern = re.compile(r'\s*<style>\s*\.code-ide.*?</style>', re.DOTALL)

for filename in files_to_process:
    filepath = os.path.join(directory, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = style_pattern.sub('', content)
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Processed {filename}")
        else:
            print(f"No match in {filename}")
    else:
        print(f"File not found: {filename}")

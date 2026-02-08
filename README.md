# Monetized Portfolio Project

This is a premium, animated portfolio website designed for Google Adsense monetization.
It is built with **Vanilla HTML, CSS, and JavaScript**, making it incredibly fast and easy to host.

## Quick Start (Run Locally)
1.  Open the folder `monetized-portfolio`.
2.  Double-click `index.html`.
3.  The site will open in your default browser.

## Deployment to GitHub Pages (Free Hosting)
To get this site live so you can apply for Adsense:

### Option 1: The Easy Way (Web Upload)
1.  Go to [GitHub.com](https://github.com) and create a new repository (e.g., `my-portfolio`).
2.  Click "Upload files".
3.  Drag and drop all files from this folder (`index.html`, `styles.css`, `app.js`) into GitHub.
4.  Commit changes.
5.  Go to **Settings** > **Pages**.
6.  Select "Source: Deploy from branch" and choose `main` / `root`.
7.  Your site will be live at `yourusername.github.io/my-portfolio`.

### Option 2: The Pro Way (Git)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## How to Monetize
1.  **Write Content**: I have included a Blog section. Adsense requires TEXT. Replace the dummy articles in `app.js` with your own real tutorials.
2.  **Apply for Adsense**: Go to Google Adsense, add your GitHub Pages URL.
3.  **Insert Ad Codes**: Once approved, Google will give you a script. Paste it into the `<head>` of `index.html`. I have also marked "Ad Placeholders" in the HTML where you can put specific ad units.

## How to Update Content (MD-to-HTML Workflow)

The site now uses an automated build system. All articles are managed in Markdown (`.md`) and converted to high-quality HTML.

### 1. Adding a New Article
1. Create a new `.md` file in the `content/` directory.
2. Add the required frontmatter at the top:
   ```yaml
   ---
   title: "Your Article Title"
   date: "Feb 08, 2026"
   excerpt: "A short summary for the home page."
   category: "Embedded Systems"
   tags: ["Tag1", "Tag2"]
   prev_link: "article-prev.html" (Optional)
   next_link: "article-next.html" (Optional)
   ---
   ```
3. Write your content using standard Markdown. Code blocks will automatically get IDE-style styling and line numbers.

### 2. Generating the HTML
After updating or adding Markdown files, run the build script to update the site:
```bash
python build.py
```
This script will:
- Generate the corresponding `article-*.html` pages.
- Update `articles.js` (the central registry used for search and the blog list).
- Update `sitemap.xml` and `robots.txt`.

## Project Structure
- `content/`: Source Markdown files for all articles.
- `build.py`: Python script to generate site assets.
- `articles.js`: Generated registry of all posts (managed by build script).
- `index.html`: Main home page.
- `styles.css`: Global styles (including premium code layouts).
- `app.js`: Client-side logic for search, theme toggle, and animations.



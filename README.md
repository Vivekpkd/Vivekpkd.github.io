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

## How to Customize Content (Detailed Guide)
All your content is stored in `app.js`. You don't need to touch the HTML to add new projects or articles!

### 1. Editing Projects
Open `app.js` and look for the `const projects` array.
Top replace a project, just change the text inside the quotes:
```javascript
{
    title: "YOUR PROJECT NAME HERE",
    tags: ["React", "Python", "etc"], // List your tools here
    image: "https://your-image-url.com/image.png", // Link to your screenshot
    desc: "Short description of what you built."
},
```

### 2. Adding Blog Posts
Look for the `const articles` array.
To add a new article, copy and paste an existing block and change the details:
```javascript
{
    id: 4, // Make sure this is unique
    title: "My New Article",
    excerpt: "Short summary shown on the home page.",
    date: "Feb 01, 2026",
    content: `
        <h1>My New Article Title</h1>
        <p>Write your article content here. You can use HTML tags!</p>
        <p>This is another paragraph.</p>
    `
},
```
**Tip**: Since you are writing HTML inside the `content` backticks (`` ` ``), you can use `<h2>` for subheadings, `<p>` for paragraphs, and `<pre><code>` for code blocks.


# Autodevv - Automotive Software Development Learning Platform

Autodevv is a premium online learning platform dedicated to Automotive Software Development. We provide tutorials, guides, and resources for AUTOSAR, Embedded C, CAN, Diagnostics, and Automotive Embedded Systems.

## 🚀 Recent Updates: Mobile Responsiveness Overhaul

We have recently completed a major update to ensure the site is fully responsive and premium across all devices (Mobile, Tablet, and Desktop).

### Key Fixes:
- **Mobile Navigation**: Added a smooth burger menu animation and centralized navigation logic in `styles.css`.
- **Tutorial Sidebar**: Replaced the hidden mobile sidebar with a collapsible "Explore Topics" accordion for better navigation on phones.
- **Centering & Layout**: 
    - Fixed Latest Article cards to be perfectly centered on mobile grids.
    - Centered Hero CTA buttons (Start Learning, Project Portfolio).
    - Implemented fluid typography using CSS `clamp()`.
- **Theme Support**: Consistent Dark/Light mode support across all generated pages.

## 🛠 Tech Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript.
- **Icons**: FontAwesome 6.
- **Fonts**: Inter, Outfit, Source Code Pro.
- **Build System**: Custom Python script (`build.py`) for generating tutorial pages from templates.

## 📁 Project Structure
- `index.html`: Main landing page.
- `styles.css`: Centralized site-wide styles.
- `app.js`: Core site logic (Theme switching, Menu, Blog rendering).
- `build.py`: Site generator for tutorial content.
- `tutorial-template.html`: Layout engine for all tutorial pages.
- `articles.js`: Metadata for blog articles and tutorials.

## 👨‍💻 Development
To update the site content and regenerate tutorial pages:
1. Modify `tutorial-template.html` or existing content files.
2. Update `articles.js` with new article metadata.
3. Run the build script:
   ```bash
   python build.py
   ```
4. Commit and push to GitHub for deployment.

---
*Engineered for Safety & Reliability.*

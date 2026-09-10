# Vivekpkd.github.io — Site Study

> Complete study of the `Vivekpkd.github.io` repository: the local source of the
> **Autodevv** automotive software learning platform / portfolio site.
>
> - **Repo / Local path**: `c:\Users\Vivek A\Documents\AI_Tools\P_Site\Vivekpkd.github.io`
> - **Live URL**: `https://Vivekpkd.github.io`
> - **Custom domain (CNAME)**: `autodevv.in`
> - **Captured**: Sep 10, 2026

---

## 1. Overview / Identity

- GitHub Pages static site serving a personal portfolio + online learning platform.
- Brand name: **Autodevv** — "Automotive Software Engineer Portfolio" / "Automotive Software Development Learning Platform".
- Tagline: *"Architecting Safe & Reliable Automotive Systems"* and footer *"Engineered for Safety & Reliability."*
- CNAME file contains `autodevv.in`; canonical link in the `<head>` references `https://autodevv.com/index.html`.

### Expertise areas promoted
- **AUTOSAR** (Classic & Adaptive platforms)
- **Embedded C**
- **CAN / Diagnostics** (UDS, Dcm, Dem)
- **Automotive Cybersecurity** (SecOC, HSM, Secure Boot, IDS)
- **Safety-critical / ISO 26262** concepts

---

## 2. Purpose & Positioning

Presents itself as a **premium automotive software learning platform** with "latest articles", "explore topics" hubs, a "project portfolio" section, and downloads.

Homepage marketing stats (aspirational scaffolding, no page behind them):
- 5+ Years Exp
- 14+ Articles (only 2 published articles exist)
- 100k+ Reading Hours
- 100% Safety Critical

---

## 3. Page Structure — Homepage (`index.html`, 1530 lines)

1. **Navbar** — Home, Explore Topics, Tutorials, Downloads, About, Contact + search overlay + theme toggle.
2. **Hero section** — animated orbit visual (microchip / car / shield / gauge icons) with floating badges:
   - "ISO 26262 Compliant"
   - "Real-Time Systems"
   - CTAs: *Start Learning* and *Project Portfolio*.
3. **Ad slot #1** — 728×90 leaderboard placeholder (AdSense `ca-pub-XXXXXXXX` not yet configured).
4. **Explore Topics grid** — 4 cards:
   - AUTOSAR Architecture → `explore-autosar.html`
   - Embedded C Mastery → `explore-embedded.html`
   - Cybersecurity & HSM → `explore-security.html`
   - Bootloaders & Updates → `blog.html?category=General`
5. **Latest Articles** — cards injected dynamically by `app.js` from `articles.js`; skeleton placeholders shown until JS renders.
6. **Selected Works / Portfolio** section.
7. **Ad slots** (more placeholders) + **footer**:
   - Brand about text
   - Social links: LinkedIn (`https://linkedin.com`) and GitHub (`https://github.com/Vivekpkd`)
   - Nav columns (Pages + Topics)
   - Privacy Policy & Terms
   - "© 2026 Autodevv"

---

## 4. Other Pages

| File | Purpose |
|------|---------|
| `tutorial.html` | Main tutorials hub (Embedded Systems / Modern Tooling / Documentation). |
| `stm32intro.html` | **STM32 Microcontroller** tutorial — Core / Peripherals / Memory + bare-metal GPIO code. |
| `image-sample.html` | Markdown image syntax demo (how to size images). |
| `download.html` | **Resources & Downloads** page (templates, reference guides, sample code). |
| `contact.html` | Contact page. |
| `privacy.html` / `terms.html` | Legal pages. |
| `explore-autosar.html` / `explore-embedded.html` / `explore-security.html` | Learning hub pages (JSON-driven). |

---

## 5. Learning Hubs (JSON-driven "Explore" pages)

Three hub JSON files define full course pages, each with intro, sections with code, syllabus, left sidebar (tracks + read-times), and right sidebar (standards + trending).

### `hubs/autosar.json` — "AUTOSAR Mastery"
- Intro: AUTOSAR open standardized software architecture for ECUs.
- Sections: SWC Runnable (headlight controller code via RTE), Classic vs Adaptive Platform.
- Syllabus: SOA, SOME/IP, SecOC, Diagnostic Stack (Dem/Dcm), Comm Stack (Can/Eth/Lin), OS & Scheduler.
- Left sidebar tracks: Core Architecture, Software Layers (BSW/MCAL/RTE/SWC), Methodology (V-Model/ARXML/Tools).
- Right sidebar: ISO 26262, ASPICE, ISO 21434, MISRA C; trending (OTA, Zonal Architecture, ML in ECUs).

### `hubs/embedded.json` — "Embedded C Tutorial"
- Intro: Embedded C for microcontrollers — hardware registers, memory mapping, real-time constraints.
- Sections: LED-blink "Hello World" (register-level GPIO toggle with `volatile`), Embedded C vs Standard C.
- Syllabus: program structure, fixed-point arithmetic, inline assembly, memory management, DMA, watchdog timers.
- Left sidebar: Getting Started, Core Concepts (bitwise, volatile, pointers, ISR), Hardware Interfacing (GPIO, UART, I2C/SPI, Timers).
- Right sidebar: STM32, Arduino, ESP32, PIC; trending (FreeRTOS, CAN Bus, Low Power).

### `hubs/security.json` — "Automotive CyberSecurity"
- Intro: CyberSecurity for connected vehicles — CAN/Ethernet protection, data integrity (SecOC), secure lifecycle.
- Sections: SecOC MAC verification concept using HSM (`Csm_MacVerify`).
- Syllabus: HSM, Secure Diagnostics (UDS + Seed/Key), Vulnerability Management, Pen Testing ECUs, PKI, OTA Updates.
- Left sidebar: Fundamentals (ISO/SAE 21434, TARA), Hardware Security (HSM, Secure Boot, Crypto Stack, Key Mgmt), Network Security (SecOC, IDS, TLS/DTLS).
- Right sidebar: UN R155/R156, NIST CSF, GDPR; trending (Post-Quantum Crypto, Zero Trust, Cyber Resilience in SDV).

---

## 6. Tech Stack

- **Frontend**: HTML5, Vanilla CSS, Vanilla JS.
  - `styles.css` (~70 KB) — centralized site-wide styles; theme system (light/dark).
  - `docs.css` (~2.7 KB), `src/index.css` (~2.5 KB).
- **Icons**: FontAwesome 6.
- **Fonts**: Google Fonts — Inter, IBM Plex Mono, Sedan SC (Outfit sources also seen).
- **Features**:
  - Dark/Light theme toggle (localStorage; inline pre-render script avoids flash).
  - Mobile-responsive overhaul (burger menu, collapsible "Explore Topics" accordion, fluid typography with `clamp()`).
  - Search (`search-engine.js` + `search-index.json`).
  - PWA (`manifest.json`, `service-worker.js`).
  - Skeleton loading placeholders.
- **Build system**: Python `build.py` generates HTML pages from Markdown (`content/*.md`) using templates (`tutorial-template.html`, `download-template.html`), outputs `articles.js` metadata.
- **CI/CD**: GitHub Actions workflow `build.yml` on push → `pip install markdown pygments && python build.py`, auto-commits + pushes generated files.

---

## 7. Content Authoring Flow

Content is written as **Markdown** in `content/` with YAML front-matter (title / category / date / tags). Then `build.py`:
- Uses `CATEGORY_MAPPING`: `stm32intro.md → Embedded Systems`, `image-sample.md → Basics`, `download.md → Resources`, `tutorial.md → General`.
- Parallel `SIDEBAR_CATEGORY_MAPPING` for the accordion: `stm32intro.md → Embedded Systems`, `image-sample.md → Basics`, `download.md → Resources`, `tutorial.md → Main Hub`.
- Extracts title, excerpt, and first image via regex.
- Renders markdown with `markdown` + `pygments` (code highlighting) into templates.

### Current content Markdown files
- `stm32intro.md` — STM32 intro (Core/Peripherals/Memory), GPIO init code.
- `image-sample.md` — Markdown image sizing syntax demo.
- `tutorial.md` — Tutorials overview / hub.
- `download.md` — Resources & Downloads hub.

### Current `articles.js` metadata (2 articles)
| Title | Date | Category | File |
|-------|------|----------|------|
| Markdown Image Sample | Mar 08, 2026 | Basics | `image-sample.html` |
| STM32 Microcontroller | Mar 07, 2026 | Embedded Systems | `stm32intro.html` |

---

## 8. SEO / Metadata

- `robots.txt` — `Allow: /` + Sitemap reference.
- `sitemap.xml` — lists homepage, privacy, terms, plus older `article-*` slugs:
  - `article-autosar-intro.html`
  - `article-embedded-c-volatile.html`
  - `article-my-journey-as-automotive-engineer.html`
  - `article-secoc-intro.html`
  - `article-site-restructuring-update.html`
- Open Graph tags, meta description/keywords, canonical URL, AdSense placeholder, PWA manifest — set up for AdSense / SEO monetization.
- `status.txt` — "Node.js not found. Switching to Static Site" (UTF-16).

---

## 9. Known Observations / Issues

1. **Broken links**: Many hub sidebar/syllabus links point to `"#"` placeholders; not yet built out.
2. **Dead references**: Explore cards & footer link to `explore-autosar.html`, `blog.html`, and sitemap references `article-*` pages that don't exist in the directory (stale from an older architecture).
3. **Leftover test content**:
   - `image-sample` article (an example, not real content).
   - `chatgpt://generic-entity` link inside `stm32intro.md`.
   - Example `.continue/agents/new-config.yaml` config.
   - `status.txt` debug file.
4. **Inconsistent branding**:
   - Title = "Portfolio", body/footer = "learning platform".
   - Canonical mixes `autodevv.com` vs CNAME `autodevv.in`.
   - `og:image` references `profile.jpg` while the actual file is `vivek.png` (jpeg `profile.jpg` does exist).
5. **Content volume**: Only 2 published articles vs. "14+ Articles" claim; hub pages and portfolio stats are aspirational scaffolding.

---

## 10. Git History (origin/main)

Recent commits show an active iterative build workflow:
- `ccdd7d5` chore: restore hub pages and cleanup sidebar mappings
- `bce0fa3` chore: auto build HTML from Markdown [skip ci]
- `de7b887` chore: sync generated files and articles metadata
- `f44827c` chore: auto build HTML from Markdown [skip ci]
- `bdc3ac7` chore: sync generated tutorial files and articles metadata
- `e361596` chore: auto build HTML from Markdown [skip ci]
- `802be80` style: Fix mobile layout for article cards
- `92861c0` chore: auto build HTML from Markdown [skip ci]
- `263e438` feat: Separate Tutorial/Download templates, fix image layout, and restructuring

---

## 11. Suggested Next Steps (optional)

1. **Repair broken links / remove stale content** (`explore-*.html`, `blog.html`, `article-*`).
2. **Write more real articles** to fill the hubs and justify the "14+ articles" stat.
3. **Regenerate / reorganize** — run `python build.py`, clean test files, unify metadata (domain, og:image, branding).
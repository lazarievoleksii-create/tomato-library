# Catalogue of *Solanum lycopersicum*

> A scientific catalogue of 331 heirloom and open-pollinated tomato cultivars
> from the Lazariev collection — Volume I, Edition 2026.01.

This repository builds the static website at **library.en.seed.ua** — a public,
SEO-optimized, AI-agent-indexable catalogue of the heirloom tomato library
maintained by Seed.ua (Lazariev family seed company, Ukraine, est. 1991).

## Quick start

```bash
npm install
npm run dev
```

Visit `http://localhost:4321/` in your browser.

## Architecture

| Layer | Tech |
|------|------|
| **Source data** | `src/data/source-catalog.xlsx` (master catalog, 331 cultivars × 26 columns) |
| **Build pipeline** | `scripts/import-from-excel.mjs` → JSON → Astro static generation |
| **Static site** | [Astro 4.16](https://astro.build) |
| **Hosting** | GitHub Pages (free), custom domain via DNS CNAME |
| **CI/CD** | GitHub Actions (`.github/workflows/deploy.yml`) |

## Project structure

```
.
├── src/
│   ├── data/
│   │   ├── source-catalog.xlsx        # Master Excel catalog (edit this)
│   │   ├── varieties.json             # Generated index data
│   │   └── varieties-full.json        # Generated full data
│   ├── layouts/
│   │   └── BaseLayout.astro           # Page wrapper (masthead, footer, fonts)
│   ├── pages/
│   │   ├── index.astro                # Homepage (title page)
│   │   ├── about.astro                # Colophon
│   │   ├── 404.astro                  # Not-found page
│   │   ├── rss.xml.js                 # RSS feed
│   │   ├── varieties/
│   │   │   ├── index.astro            # A–Z master index (with search/filter/compare)
│   │   │   └── [slug].astro           # Variety detail (generates 331 pages)
│   │   └── categories/
│   │       ├── index.astro            # Categories listing
│   │       └── [cat].astro            # Category page (generates 11 pages)
│   ├── styles/
│   │   └── global.css                 # Design system: tokens, typography, swatches
│   └── utils/
│       └── varieties.ts               # Data helpers, JSON-LD schemas
├── public/
│   ├── CNAME                          # library.en.seed.ua
│   ├── favicon.svg
│   ├── robots.txt                     # Allows GPTBot, ClaudeBot, etc.
│   └── index-script.js                # A–Z index interactivity
├── scripts/
│   └── import-from-excel.mjs          # Excel → JSON regenerator
├── .github/workflows/deploy.yml       # Auto-deploy on push to main
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Editing content

### To update cultivar data

1. Open `src/data/source-catalog.xlsx` in Excel or LibreOffice.
2. Edit the `varieties` sheet.
3. Yellow-highlighted cells (`name_en`, `description_en`, `shop_url`,
   `hero_image`) indicate fields awaiting completion.
4. Set `confidence_en` to `HIGH` once an English canonical name is verified
   from Tatiana TOMATObase, Baker Creek, or the Dwarf Tomato Project.
5. Run:

```bash
npm run import-data
```

This regenerates `src/data/varieties.json` and `src/data/varieties-full.json`
from the Excel source.

6. Then:

```bash
npm run dev
```

To preview the changes.

### To update page templates

- Homepage copy → `src/pages/index.astro`
- Variety detail layout → `src/pages/varieties/[slug].astro`
- A–Z index page → `src/pages/varieties/index.astro` (+ `public/index-script.js`)
- Colophon → `src/pages/about.astro`
- Design tokens (colors, fonts, spacing) → `src/styles/global.css`

## Deployment to GitHub Pages

### One-time setup

1. **Create a GitHub repository** (recommended name: `library.en.seed.ua` or `tomato-library`).

2. **Push this directory to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Catalogue Vol. I Ed. 2026.01"
   git branch -M main
   git remote add origin git@github.com:YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

4. **Configure DNS for `library.en.seed.ua`:**
   In your DNS provider for `seed.ua` (currently Hostinger), add:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | CNAME | `library.en` | `YOUR-USERNAME.github.io.` | 3600 |

   *(If your DNS provider doesn't accept CNAME on a subdomain, use four A
   records pointing to GitHub's IPs: `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153`, `185.199.111.153`.)*

5. **Verify the custom domain in GitHub:**
   - **Settings** → **Pages** → **Custom domain** → enter `library.en.seed.ua`
   - GitHub will check DNS propagation (may take up to 24h, usually ≤ 1h).
   - Once verified, check **Enforce HTTPS**.

### Subsequent deployments

Every push to `main` triggers `.github/workflows/deploy.yml`, which:

1. Installs dependencies
2. Builds the Astro site to `dist/`
3. Uploads to GitHub Pages
4. Publishes to `library.en.seed.ua`

Typical build time: 30–90 seconds.

## SEO & AI-agent indexability

The catalogue is built to be discoverable by both traditional search engines
and AI agents (ChatGPT, Claude, Perplexity, Google AI Overviews):

- **JSON-LD structured data** on every page:
  - `Product` schema for varieties (with `additionalProperty` array for
    morphological data)
  - `BreadcrumbList` schema
  - `CollectionPage` schema for categories
  - `Book` and `Dataset` schema on the homepage
  - `Organization`, `WebSite`, `WebPage`, and visible `FAQPage` schema where applicable
- **Sitemap** auto-generated at `/sitemap-index.xml` via `@astrojs/sitemap`
- **RSS feed** at `/rss.xml`
- **Structured AI index** at `/llms.json`
- **Human-readable provenance file** at `/humans.txt`
- **AI-agent allowlist** in `robots.txt` (GPTBot, ClaudeBot, anthropic-ai,
  PerplexityBot, Google-Extended, etc.)
- **Canonical URLs**, OG tags, Twitter cards on every page
- **Trailing-slash URLs** (configured in `astro.config.mjs`) for stable
  GitHub Pages routing
- **SEO/GEO audit workflow** via `npm run seo:audit`

See `docs/seo-geo-playbook.md` and `AGENTS.md` for the local SEO/GEO operating
rules adapted from the public `seo-geo-claude-skills` workflows.

## Design system

| Token | Value | Use |
|-------|-------|-----|
| `--paper` | `#fafaf7` | Background (cream) |
| `--ink` | `#181614` | Body text |
| `--accent` | `#6b1818` | Wine red — links, IDs, accents |
| `--green` | `#2d5a2d` | Verified-name badge |
| `--serif` | EB Garamond | Headings, body |
| `--mono` | JetBrains Mono | Labels, IDs, captions |

The aesthetic is intentionally **scientific catalogue**, not e-commerce —
laconic, typographically rigorous, academic in tone.

## Local commands

```bash
npm run dev          # Start dev server at http://localhost:4321
npm run build        # Build static site to dist/
npm run preview      # Preview the build locally
npm run import-data  # Regenerate JSON from src/data/source-catalog.xlsx
npm run seo:audit    # Build and run SEO/GEO checks
```

## License & citation

© 2026 Seed.ua / Lazariev family. All catalogue content is provided for
reference and educational use.

**Citation:**

> Lazariev, O., Lazarieva, O. (2026). *Catalogue of Solanum lycopersicum:
> Lazariev Heirloom Tomato Library, Volume I, Edition 2026.01.*
> Seed.ua, Ukraine. Retrieved from https://library.en.seed.ua/

## Contact

- **Catalogue editorial:** elena@lazareva.info
- **International seed orders:** https://en.seed.ua
- **Ukraine seed orders:** https://seed.ua

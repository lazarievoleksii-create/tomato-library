# Seed.ua SEO/GEO Operating Rules

This project publishes the static catalogue at `https://library.en.seed.ua`.
Treat every content or template change as both a search-engine change and an
AI-citation change.

## Canonical Project Facts

- Publisher: Seed.ua / Lazariev family seed company, Ukraine, founded 1991.
- Catalogue: `Catalogue of Solanum lycopersicum`, also called `Lazariev Heirloom Tomato Library`.
- Edition: `2026.01`.
- Canonical site: `https://library.en.seed.ua`.
- International shop: `https://en.seed.ua`.
- Ukrainian shop: `https://seed.ua`.
- Editorial contact: `elena@lazareva.info`.

## Before Publishing

Every public page should have:

- One clear `h1`.
- A concise title and meta description.
- Absolute canonical URL.
- Open Graph and Twitter card metadata.
- JSON-LD with the right entity type:
  - `Product` for cultivar pages.
  - `CollectionPage` for category and index pages.
  - `Dataset` and `Book` for the catalogue homepage.
  - `FAQPage` where the answer block is visible on the page.
- Links into the AI index layer: `llms.txt`, `llms-full.txt`, `llms.json`,
  sitemap, RSS, and `humans.txt`.

## GEO Answer Pattern

For pages intended to answer AI/search questions, prefer:

1. A direct answer in the first visible section.
2. A data table or structured facts.
3. A source/provenance note.
4. A short FAQ block matching the `FAQPage` schema.
5. A canonical URL and citation path.

Do not invent availability, medical/gardening guarantees, awards, or cultivar
origin claims that are not present in the source catalogue or cited references.

## Verification

Run this before handoff:

```bash
npm run seo:audit
```

For an already-built `dist/`, run:

```bash
npm run seo:audit:built
```

The audit writes:

- `reports/seo-geo-audit.md`
- `reports/seo-geo-audit.json`

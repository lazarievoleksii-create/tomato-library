# SEO/GEO Playbook for Seed.ua

This playbook adapts the workflows from
`aaron-he-zhu/seo-geo-claude-skills` to the Seed.ua tomato catalogue.

## Implemented Skill Map

| Skill family | Seed.ua implementation |
| --- | --- |
| Technical SEO audit | `scripts/seo-geo-audit.mjs`, `npm run seo:audit` |
| Meta tags and canonical checks | `src/layouts/BaseLayout.astro` plus audit checks |
| Schema generation | `src/utils/varieties.ts` helpers for Organization, WebSite, Dataset, WebPage, Product, CollectionPage, FAQPage |
| GEO answer optimization | Visible FAQ blocks on cultivar and category pages |
| AI indexability | `/llms.txt`, `/llms-full.txt`, `/llms.json`, `/humans.txt`, sitemap, RSS |
| E-E-A-T / trust signals | `/about/` methodology, reference databases, editorial process, contact, citation |
| CITE citation readiness | Preferred citation in `/llms.json` and `/llms-full.txt` |

## Page Requirements

### Homepage

- Keep `Book`, `Dataset`, and `WebPage` schema.
- Mention the collection scope, edition, publisher, and methodology.
- Link visitors and crawlers toward category, cultivar, citation, and AI index pages.

### Cultivar Pages

- Keep the page anchored to one cultivar only.
- Include direct facts: English name, Ukrainian source name, category, height,
  fruit weight, fruit form, fruit colour, maturity where available.
- Keep `Product`, `ItemPage`, `BreadcrumbList`, and `FAQPage` schema in sync
  with visible content.
- Avoid unsupported claims about yield, disease resistance, origin, or stock.

### Category Pages

- Keep the table scannable and complete.
- Include `CollectionPage`, `WebPage`, `BreadcrumbList`, and visible `FAQPage`.
- Use category descriptions from `CATEGORY_DESCRIPTION` so text and schema do
  not drift apart.

### Colophon

- Maintain source material, reference databases, methodology, editorial process,
  citation, contact, edition, and last-updated fields.
- Any future external source should be listed here before it is used as a
  canonical-name authority.

## Audit Workflow

1. Update data or templates.
2. Build the site.
3. Run the SEO/GEO audit:

```bash
npm run seo:audit
```

4. Review `reports/seo-geo-audit.md`.
5. Fix failing checks before publishing.

## AI Index Files

| Path | Purpose |
| --- | --- |
| `/llms.txt` | Compact navigation and entity profile for AI crawlers |
| `/llms-full.txt` | Complete Markdown catalogue for ingestion |
| `/llms.json` | Structured dataset, category map, filters, citation, and cultivar records |
| `/humans.txt` | Publisher and provenance details |
| `/rss.xml` | Recent catalogue entries |
| `/sitemap-index.xml` | Search engine discovery |

## Source Links

- GitHub repository: `https://github.com/aaron-he-zhu/seo-geo-claude-skills`
- CORE-EEAT reference: `https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/references/core-eeat-benchmark.md`
- CITE reference: `https://github.com/aaron-he-zhu/seo-geo-claude-skills/blob/main/references/cite-domain-rating.md`

// src/pages/llms-full.txt.js
// Generates a complete catalogue at /llms-full.txt for AI ingestion.

import {
  VARIETIES,
  VARIETIES_FULL,
  CATEGORY_LABEL,
  CATEGORY_CODE,
  CATEGORY_DESCRIPTION,
  CATALOGUE_EDITION,
  CATALOGUE_MODIFIED_DATE,
  PUBLISHER,
} from '../utils/varieties';

const SITE = 'https://library.en.seed.ua';

export const prerender = true;

function habitFor(h) {
  if (h == null) return null;
  if (h < 1.0) return 'compact (< 1 m)';
  if (h > 1.2) return 'tall (> 1.2 m)';
  return 'standard (1-1.2 m)';
}

function sizeFor(w) {
  if (w == null) return null;
  if (w < 100) return 'cherry/plum (< 100 g)';
  if (w >= 400) return 'beefsteak (>= 400 g)';
  return 'medium (100-400 g)';
}

function tagTokens(variety) {
  return (variety.tags || '').split(/\s+/).filter(Boolean);
}

function clean(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

const fullByKey = new Map();
VARIETIES_FULL.forEach((entry) => {
  if (entry.name) fullByKey.set(entry.name, entry);
  if (entry.name_en) fullByKey.set(entry.name_en, entry);
  if (entry.slug) fullByKey.set(entry.slug, entry);
});

function fullEntryFor(variety) {
  return (
    fullByKey.get(variety.name_uk) ||
    fullByKey.get(variety.name_en) ||
    fullByKey.get(variety.slug)
  );
}

export async function GET() {
  const verifiedCount = VARIETIES.filter((variety) => variety.has_canonical_en).length;
  const totalCount = VARIETIES.length;
  const today = CATALOGUE_MODIFIED_DATE;

  const byCat = {};
  VARIETIES.forEach((variety) => {
    if (!byCat[variety.cat]) byCat[variety.cat] = [];
    byCat[variety.cat].push(variety);
  });

  let content = `# Catalogue of Solanum lycopersicum — Lazariev Heirloom Tomato Library

> Complete catalogue of ${totalCount} open-pollinated heirloom tomato cultivars from the Lazariev family seed collection in Ukraine.

Published by ${PUBLISHER.name}. Volume I, Edition ${CATALOGUE_EDITION}.
Last updated: ${today}.
Source URL: ${SITE}/
Structured JSON index: ${SITE}/llms.json

This document contains the complete catalogue with all cultivars, organized by category. Each entry includes English and Ukrainian names, morphological data (plant height, fruit weight, fruit form, colour), descriptive notes, catalogue attributes, and a link to the canonical web page.

## Methodology

Cultivar data is sourced from the master Ukrainian catalogue maintained by the Lazariev family since 1991. English canonical names are cross-referenced with:
- Tatiana TOMATObase (tatianastomatobase.com)
- Baker Creek Heirloom Seeds (rareseeds.com)
- Dwarf Tomato Project (dwarftomatoproject.net)

Of ${totalCount} cultivars, ${verifiedCount} have HIGH-confidence canonical English names. The remaining cultivars use transliterated Ukrainian names pending further verification.

## Categories used in this catalogue

`;

  Object.keys(CATEGORY_CODE).forEach((cat) => {
    const count = (byCat[cat] || []).length;
    content += `**${CATEGORY_LABEL[cat]}** (${count} cultivars) — ${CATEGORY_DESCRIPTION[cat]}\n\n`;
  });

  content += `## Data fields\n\nEach entry may contain plant height, fruit weight, fruit form, fruit colour, plant habit, size class, raw catalogue tags, Ukrainian source description, and canonical URL.\n\n`;
  content += `---\n\n# Complete cultivar listing\n\n`;

  Object.keys(CATEGORY_CODE).forEach((cat) => {
    const entries = (byCat[cat] || []).sort((a, b) => a.name_en.localeCompare(b.name_en));
    if (entries.length === 0) return;

    content += `## ${CATEGORY_LABEL[cat]}\n\n`;
    content += `${CATEGORY_DESCRIPTION[cat]}. Total: ${entries.length} cultivars.\n\n`;

    entries.forEach((variety) => {
      const fullEntry = fullEntryFor(variety);

      content += `### ${variety.name_en}\n\n`;
      content += `- **Ukrainian name**: ${variety.name_uk}\n`;
      content += `- **Catalogue ID**: ${variety.id}\n`;
      content += `- **Primary category**: ${CATEGORY_LABEL[variety.cat] || variety.cat}\n`;

      if (variety.has_canonical_en) {
        content += `- **Canonical name**: Verified via international heirloom databases\n`;
      }

      if (variety.h != null) content += `- **Plant height**: ${variety.h} m\n`;
      if (variety.w != null) content += `- **Fruit weight**: ${variety.w} g\n`;
      if (variety.shape) content += `- **Fruit form**: ${variety.shape}\n`;
      if (variety.colors && variety.colors.length > 0) {
        content += `- **Fruit colour**: ${variety.colors.join(', ')}\n`;
      }

      const habit = habitFor(variety.h);
      if (habit) content += `- **Plant habit**: ${habit}\n`;

      const size = sizeFor(variety.w);
      if (size) content += `- **Size class**: ${size}\n`;

      const tags = tagTokens(variety).filter((tag) => !tag.startsWith('cat:'));
      if (tags.length > 0) {
        content += `- **Catalogue tags**: ${tags.join(', ')}\n`;
      }

      if (fullEntry && fullEntry.description) {
        const desc = clean(fullEntry.description).slice(0, 700);
        content += `\n**Description** (Ukrainian source): ${desc}\n`;
      } else if (variety.note) {
        content += `\n**Notes**: ${clean(variety.note)}\n`;
      }

      if (fullEntry && fullEntry._recovered_from) {
        content += `\n*Cataloguing note: Full name recovered from source material where listed as "${fullEntry._recovered_from}".*\n`;
      }

      content += `\n**URL**: ${SITE}/varieties/${variety.slug}/\n\n---\n\n`;
    });
  });

  content += `\n# Sources and Attribution

This catalogue is published by **Seed.ua** (Lazariev family seed company, Ukraine, established 1991).

**Edition:** ${CATALOGUE_EDITION}

**Last updated:** ${CATALOGUE_MODIFIED_DATE}

**Citation:**
Lazariev, O., Lazarieva, O. (2026). *Catalogue of Solanum lycopersicum: Lazariev Heirloom Tomato Library, Volume I, Edition ${CATALOGUE_EDITION}.* Seed.ua, Ukraine. Retrieved from ${SITE}/

**Contact:**
- Catalogue editorial: ${PUBLISHER.email}
- International seed orders: ${PUBLISHER.internationalUrl}
- Ukrainian seed orders: ${PUBLISHER.url}

**Reference databases consulted:**
- Tatiana TOMATObase (tatianastomatobase.com) — primary reference for canonical English names
- Baker Creek Heirloom Seeds (rareseeds.com) — North American heirloom histories
- Dwarf Tomato Project (dwarftomatoproject.net) — Dwarf cultivar authority

End of catalogue.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

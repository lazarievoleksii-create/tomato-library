// src/pages/llms.txt.js
// Generates a compact llms.txt at /llms.txt for AI crawlers.

import {
  VARIETIES,
  CATEGORY_LABEL,
  CATEGORY_CODE,
  CATEGORY_DESCRIPTION,
  CATALOGUE_EDITION,
  CATALOGUE_MODIFIED_DATE,
  PUBLISHER,
} from '../utils/varieties';

const SITE = 'https://library.en.seed.ua';

export const prerender = true;

function tagTokens(variety) {
  return (variety.tags || '').split(/\s+/).filter(Boolean);
}

function countByTag(tag) {
  return VARIETIES.filter((variety) => tagTokens(variety).includes(tag)).length;
}

function excerpt(text, length = 120) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, length);
}

export async function GET() {
  const verifiedCount = VARIETIES.filter((variety) => variety.has_canonical_en).length;
  const totalCount = VARIETIES.length;

  let content = `# Catalogue of Solanum lycopersicum — Lazariev Heirloom Tomato Library

> A scientific catalogue of ${totalCount} open-pollinated heirloom tomato cultivars from the Lazariev family seed collection in Ukraine (established 1991). Each entry documents plant height, fruit weight, fruit form, colour profile, and growth notes. ${verifiedCount} cultivars have canonical English heirloom names verified via Tatiana TOMATObase, Baker Creek, and the Dwarf Tomato Project.

The Lazariev collection documents Ukrainian and other Eastern European heirloom tomato cultivars alongside international varieties. See individual catalogue records for recorded measurements and name verification. International seed enquiries: en.seed.ua.

## Entity profile

- **Publisher**: ${PUBLISHER.name}, Lazariev family seed company, Ukraine
- **Founded**: ${PUBLISHER.foundingDate}
- **Primary domain**: ${PUBLISHER.url}
- **International shop**: ${PUBLISHER.internationalUrl}
- **Catalogue domain**: ${SITE}
- **Edition**: ${CATALOGUE_EDITION}
- **Last updated**: ${CATALOGUE_MODIFIED_DATE}
- **Editorial contact**: ${PUBLISHER.email}

## Complete catalogue

- [Full catalogue as Markdown](${SITE}/llms-full.txt): All ${totalCount} cultivars with descriptions, measurements, and classifications in a single file
- [Structured AI index as JSON](${SITE}/llms.json): Entity profile, category map, filter dimensions, and cultivar records
- [Master Index (A-Z)](${SITE}/varieties/): Searchable alphabetical index of all cultivars
- [Category index](${SITE}/categories/): Browse the catalogue by morphological and collection category
- [Title page](${SITE}/): Catalogue overview with statistics and contents

## Categories

`;

  Object.keys(CATEGORY_CODE).forEach((cat) => {
    const count = VARIETIES.filter((variety) => variety.cat === cat).length;
    content += `- [${CATEGORY_LABEL[cat]}](${SITE}/categories/${cat}/): ${CATEGORY_DESCRIPTION[cat]} (${count} cultivars)\n`;
  });

  const filters = [
    ['Tall plants (> 1.2 m)', 'habit:tall'],
    ['Standard plants (1-1.2 m)', 'habit:standard'],
    ['Compact plants (< 1 m)', 'habit:compact'],
    ['Beefsteak fruit (>= 400 g)', 'size:beefsteak'],
    ['Medium fruit (100-400 g)', 'size:medium'],
    ['Cherry or plum fruit (< 100 g)', 'size:cherry-plum'],
    ['Heart-shaped fruit', 'shape:heart-shaped'],
    ['Round fruit', 'shape:round'],
    ['Plum fruit', 'shape:plum'],
    ['Red fruit', 'color:red'],
    ['Pink fruit', 'color:pink'],
    ['Yellow fruit', 'color:yellow'],
    ['Black fruit', 'color:black'],
    ['Bicolor fruit', 'color:bicolor'],
  ];

  content += `\n## Filter dimensions\n\nThe master index supports filtering by colour, category, fruit form, fruit size, and plant habit. Useful data slices include:\n\n`;

  filters.forEach(([label, tag]) => {
    const count = countByTag(tag);
    if (count > 0) content += `- ${label}: ${count} cultivars\n`;
  });

  content += `\n## Notable cultivars\n\nThe following cultivars are particularly significant in the collection:\n\n`;

  const notableNames = [
    'Black Krim',
    'Cherokee Purple',
    'Red Brandywine',
    'Paul Robeson',
    "Bull's Heart",
    'Amana Orange',
    'Azoychka',
    'Belyi Naliv',
    'Black Vernissage',
    'Japanese Black Trifele',
    'Tarasenko Legend',
    'Adelaide Festival',
  ];

  const notable = VARIETIES
    .filter((variety) => variety.has_canonical_en)
    .filter((variety) => notableNames.includes(variety.name_en))
    .slice(0, 12);

  notable.forEach((variety) => {
    content += `- [${variety.name_en}](${SITE}/varieties/${variety.slug}/): ${excerpt(variety.note)}\n`;
  });

  content += `\n## About

- [Colophon](${SITE}/about/): Methodology, sources, and citation
- [Order seeds (international)](https://en.seed.ua): Lazariev family seed shop with worldwide shipping
- [Ukrainian shop](https://seed.ua): Domestic Ukrainian shop

## Optional

- [RSS feed](${SITE}/rss.xml)
- [Contact: editorial](mailto:elena@lazareva.info)
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

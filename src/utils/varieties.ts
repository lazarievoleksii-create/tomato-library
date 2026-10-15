import varieties from '../data/varieties.json';
import varietiesFull from '../data/varieties-full.json';

export const SITE_URL = 'https://library.en.seed.ua';
export const SITE_NAME = 'Catalogue of Solanum lycopersicum';
export const SITE_ALTERNATE_NAME = 'Lazariev Heirloom Tomato Library';
export const CATALOGUE_EDITION = '2026.01';
export const CATALOGUE_PUBLICATION_DATE = '2026-01-15';
export const CATALOGUE_MODIFIED_DATE = '2026-06-12';

export const PUBLISHER = {
  name: 'Seed.ua',
  url: 'https://seed.ua',
  internationalUrl: 'https://en.seed.ua',
  foundingDate: '1991',
  email: 'elena@lazareva.info',
};

export interface Variety {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  cat: string;
  cat_label: string;
  h: number | null;
  w: number | null;
  shape: string;
  colors: string[];
  note: string;
  tags: string;
  has_canonical_en: boolean;
}

export interface VarietyFull {
  name: string;
  name_en?: string;
  category: string;
  height_m: number | null;
  weight_g: number | null;
  description: string;
  colors: string[];
  shapes: string[];
  taste_notes: string[];
  resistance_notes: string[];
  days_to_maturity: number | null;
  habit: string;
  leaf_type: string;
  slug?: string;
  _recovered_from?: string;
}

export const VARIETIES: Variety[] = varieties as Variety[];
export const VARIETIES_FULL: VarietyFull[] = varietiesFull as VarietyFull[];

export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_URL).toString();
}

export const CATEGORY_LABEL: Record<string, string> = {
  collectible: 'Collectible',
  red: 'Red-fruited',
  pink: 'Pink-fruited',
  yellow: 'Yellow-fruited',
  black: 'Black-fruited',
  bicolor: 'Bicolor',
  cherry: 'Cherry',
  dwarf: 'Dwarf',
  stem: 'Stem (compact)',
  'long-bearing': 'Long-bearing',
  promo: 'Established',
};

export const CATEGORY_CODE: Record<string, string> = {
  collectible: 'C-01',
  red: 'C-02',
  dwarf: 'C-03',
  stem: 'C-04',
  cherry: 'C-05',
  pink: 'C-06',
  bicolor: 'C-07',
  yellow: 'C-08',
  black: 'C-09',
  'long-bearing': 'C-10',
  promo: 'C-11',
};

export const CATEGORY_DESCRIPTION: Record<string, string> = {
  collectible: 'Rare and unusual cultivars from international heirloom collections, including Tatiana TOMATObase originals and Eastern European specialties.',
  red: 'Classic red-fruited indeterminate varieties — the canonical tomato profile in heart, beefsteak, and round forms.',
  pink: 'Pink-fruited cultivars including Bull\'s Heart, Brandywine line, and Eastern European heirlooms with sweet, mild flavor.',
  yellow: 'Yellow and orange-fruited varieties — fruity-sweet flavor profiles, low acidity, distinctive coloration.',
  black: 'Anthocyanin-rich dark-fruited cultivars — purples, deep mahogany, and brown-shouldered varieties with complex umami flavors.',
  bicolor: 'Two-toned cultivars with striped, marbled, or gradient flesh — visually striking with diverse flavor profiles.',
  cherry: 'Small-fruited cocktail and grape tomatoes (under 100 g) — high-yield, high-flavor, perfect for fresh eating.',
  dwarf: 'Compact-growing cultivars from the Dwarf Tomato Project (Australia/USA) — full-size fruit on dense, manageable plants.',
  stem: 'Standard-type compact varieties (under 1 m) — sturdy stems, no staking required, ideal for containers.',
  'long-bearing': 'Extended-harvest varieties with thick-walled fruits suitable for storage into winter.',
  promo: 'Time-tested established varieties — proven productivity, reliable performance across diverse climates.',
};

export const COLOR_HEX: Record<string, string> = {
  red: 'linear-gradient(135deg, #c43232, #7a1818)',
  pink: 'linear-gradient(135deg, #d8588f, #a02856)',
  yellow: 'linear-gradient(135deg, #f4c430, #c69010)',
  orange: 'linear-gradient(135deg, #e88828, #a85810)',
  black: 'linear-gradient(135deg, #4a1a1a, #1a0808)',
  bicolor: 'conic-gradient(from 90deg, #f4c430, #d8588f, #c43232, #f4c430)',
  chocolate: 'linear-gradient(135deg, #6b3a1a, #2d1808)',
  purple: 'linear-gradient(135deg, #6b3a8a, #2a1a4a)',
  green: 'linear-gradient(135deg, #5a7a3a, #2a4a1a)',
  white: 'linear-gradient(135deg, #f5f1e8, #d4cfc0)',
  unspecified: 'linear-gradient(135deg, #d4d1c8, #8a847c)',
};

export function getVarietyBySlug(slug: string): Variety | undefined {
  return VARIETIES.find(v => v.slug === slug);
}

export function getFullVarietyByName(name: string): VarietyFull | undefined {
  return VARIETIES_FULL.find(v => v.name === name);
}

export function getFullVariety(variety: Variety): VarietyFull | undefined {
  return VARIETIES_FULL.find(v =>
    v.name === variety.name_uk ||
    v.name === variety.name_en ||
    v.name_en === variety.name_en ||
    v.slug === variety.slug
  );
}

export function getVarietiesByCategory(cat: string): Variety[] {
  return VARIETIES.filter(v => v.cat === cat);
}

export function getRelatedVarieties(variety: Variety, limit = 4): Variety[] {
  return VARIETIES
    .filter(v => v.cat === variety.cat && v.id !== variety.id)
    .slice(0, limit);
}

export function sizeClass(w: number | null): string {
  if (w == null) return '';
  if (w < 100) return 'cherry-plum';
  if (w < 400) return 'medium';
  return 'beefsteak';
}

export function sizeClassLabel(w: number | null): string {
  if (w == null) return '';
  if (w < 100) return 'Cherry / plum';
  if (w < 400) return 'Medium';
  return 'Beefsteak';
}

export function habitClass(h: number | null): string {
  if (h == null) return '';
  if (h < 1.0) return 'compact';
  if (h <= 1.2) return 'standard';
  return 'tall';
}

export function habitLabel(h: number | null): string {
  if (h == null) return '';
  if (h < 1.0) return 'Compact (< 1 m)';
  if (h <= 1.2) return 'Standard (1–1.2 m)';
  return 'Tall (> 1.2 m)';
}

export function compactDescription(text: string, maxLength = 160): string {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const truncated = normalized.slice(0, maxLength - 1).replace(/\s+\S*$/, '');
  return `${truncated}…`;
}

export function publisherSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${PUBLISHER.url}/#organization`,
    name: PUBLISHER.name,
    alternateName: ['Seed UA', 'Lazariev family seed company'],
    url: PUBLISHER.url,
    sameAs: [
      PUBLISHER.internationalUrl,
      SITE_URL,
    ],
    foundingDate: PUBLISHER.foundingDate,
    email: PUBLISHER.email,
    areaServed: ['Ukraine', 'Europe', 'Worldwide'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'catalogue editorial',
      email: PUBLISHER.email,
      availableLanguage: ['en', 'uk', 'ru'],
    },
  };
}

export function websiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'en',
    publisher: {
      '@id': `${PUBLISHER.url}/#organization`,
    },
    about: {
      '@type': 'Thing',
      name: 'Solanum lycopersicum',
      alternateName: 'tomato',
    },
  };
}

export function datasetSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${SITE_URL}/#dataset`,
    name: `${SITE_NAME}: ${SITE_ALTERNATE_NAME}, Volume I`,
    alternateName: SITE_ALTERNATE_NAME,
    description: `Structured catalogue of ${VARIETIES.length} open-pollinated heirloom tomato cultivars from the Lazariev family seed collection in Ukraine.`,
    url: `${SITE_URL}/`,
    version: CATALOGUE_EDITION,
    inLanguage: 'en',
    datePublished: CATALOGUE_PUBLICATION_DATE,
    dateModified: CATALOGUE_MODIFIED_DATE,
    isAccessibleForFree: true,
    creator: {
      '@id': `${PUBLISHER.url}/#organization`,
    },
    publisher: {
      '@id': `${PUBLISHER.url}/#organization`,
    },
    keywords: [
      'Solanum lycopersicum',
      'heirloom tomatoes',
      'open-pollinated tomato cultivars',
      'Ukrainian seed collection',
      'Eastern European tomato varieties',
      'Lazariev collection',
    ],
    variableMeasured: [
      'cultivar name',
      'plant height',
      'fruit weight',
      'fruit form',
      'fruit colour',
      'growth habit',
      'days to maturity',
      'canonical English name verification',
    ],
    measurementTechnique: 'Manual cultivar observations and editorial cross-reference against heirloom tomato databases.',
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'Complete catalogue for LLM ingestion',
        contentUrl: `${SITE_URL}/llms-full.txt`,
        encodingFormat: 'text/plain',
      },
      {
        '@type': 'DataDownload',
        name: 'Structured catalogue JSON for AI agents',
        contentUrl: `${SITE_URL}/llms.json`,
        encodingFormat: 'application/json',
      },
      {
        '@type': 'DataDownload',
        name: 'RSS feed',
        contentUrl: `${SITE_URL}/rss.xml`,
        encodingFormat: 'application/rss+xml',
      },
    ],
  };
}

export function webPageSchema({
  path,
  name,
  description,
  type = 'WebPage',
  mainEntity,
}: {
  path: string;
  name: string;
  description: string;
  type?: string;
  mainEntity?: object;
}): object {
  const url = absoluteUrl(path);

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'en',
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    publisher: {
      '@id': `${PUBLISHER.url}/#organization`,
    },
    datePublished: CATALOGUE_PUBLICATION_DATE,
    dateModified: CATALOGUE_MODIFIED_DATE,
    ...(mainEntity ? { mainEntity } : {}),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function varietyFaq(variety: Variety, full?: VarietyFull): Array<{ question: string; answer: string }> {
  const color = variety.colors.length > 0 ? variety.colors.join(', ') : 'not yet specified';
  const height = variety.h != null ? `${variety.h} m` : 'not yet recorded in the public catalogue';
  const weight = variety.w != null ? `${variety.w} g` : 'not yet recorded in the public catalogue';
  const form = variety.shape || 'not yet specified';
  const maturity = full?.days_to_maturity ? `${full.days_to_maturity} days from transplant` : 'not yet recorded in the public catalogue';

  return [
    {
      question: `What is ${variety.name_en}?`,
      answer: `${variety.name_en} is a ${variety.cat_label.toLowerCase()} tomato cultivar documented in the Lazariev Heirloom Tomato Library, a Seed.ua catalogue of open-pollinated tomato cultivars from Ukraine.`,
    },
    {
      question: `What are the recorded fruit traits for ${variety.name_en}?`,
      answer: `${variety.name_en} is recorded with ${color} fruit, ${form} fruit form, and an average fruit weight of ${weight}.`,
    },
    {
      question: `How tall does ${variety.name_en} grow?`,
      answer: `The public catalogue records ${variety.name_en} plant height as ${height}. Its maturity timing is ${maturity}.`,
    },
    {
      question: `Where can ${variety.name_en} seeds be ordered?`,
      answer: `Seed links for ${variety.name_en} point to the international Seed.ua shop at https://en.seed.ua/products/${variety.slug}. Availability should be confirmed on the shop page before ordering.`,
    },
  ];
}

export function categoryFaq(cat: string, count: number): Array<{ question: string; answer: string }> {
  const label = CATEGORY_LABEL[cat];
  const description = CATEGORY_DESCRIPTION[cat];

  return [
    {
      question: `What are ${label.toLowerCase()} tomato cultivars?`,
      answer: `${label} tomato cultivars in this catalogue are grouped by their dominant morphological or collection trait. ${description}`,
    },
    {
      question: `How many ${label.toLowerCase()} cultivars are listed?`,
      answer: `The Lazariev Heirloom Tomato Library currently lists ${count} ${label.toLowerCase()} cultivars in Volume I, Edition ${CATALOGUE_EDITION}.`,
    },
    {
      question: `How should this category be used?`,
      answer: `Use this category page to compare cultivar names, plant height, fruit weight, fruit form, colour, and links to the canonical detail pages before choosing varieties for a garden or collection.`,
    },
  ];
}

/**
 * Generate JSON-LD Product schema for a variety.
 */
export function varietySchema(v: Variety, full?: VarietyFull): object {
  const altNames: string[] = [];
  if (v.name_uk && v.name_uk !== v.name_en) altNames.push(v.name_uk);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/varieties/${v.slug}/#cultivar`,
    name: v.name_en,
    alternateName: altNames,
    description: full?.description || v.note,
    url: `${SITE_URL}/varieties/${v.slug}/`,
    category: v.cat_label,
    additionalType: 'https://schema.org/Plant',
    brand: {
      '@id': `${PUBLISHER.url}/#organization`,
    },
    manufacturer: {
      '@id': `${PUBLISHER.url}/#organization`,
    },
    productID: v.id,
    identifier: v.id,
    isPartOf: {
      '@id': `${SITE_URL}/#dataset`,
    },
    mainEntityOfPage: {
      '@id': `${SITE_URL}/varieties/${v.slug}/#webpage`,
    },
    additionalProperty: [
      v.h != null && {
        '@type': 'PropertyValue',
        name: 'Plant height',
        value: v.h,
        unitCode: 'MTR',
        unitText: 'meters',
      },
      v.w != null && {
        '@type': 'PropertyValue',
        name: 'Average fruit weight',
        value: v.w,
        unitCode: 'GRM',
        unitText: 'grams',
      },
      v.shape && {
        '@type': 'PropertyValue',
        name: 'Fruit form',
        value: v.shape,
      },
      v.colors.length > 0 && {
        '@type': 'PropertyValue',
        name: 'Fruit colour',
        value: v.colors.join(', '),
      },
      full?.habit && {
        '@type': 'PropertyValue',
        name: 'Growth habit',
        value: full.habit,
      },
      full?.days_to_maturity && {
        '@type': 'PropertyValue',
        name: 'Days to maturity',
        value: full.days_to_maturity,
        unitText: 'days',
      },
    ].filter(Boolean),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function categorySchema(cat: string, varieties: Variety[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/categories/${cat}/#collection`,
    url: `${SITE_URL}/categories/${cat}/`,
    name: `${CATEGORY_LABEL[cat]} tomato cultivars`,
    description: CATEGORY_DESCRIPTION[cat],
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    publisher: {
      '@id': `${PUBLISHER.url}/#organization`,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: varieties.length,
      itemListElement: varieties.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: v.name_en,
          url: `${SITE_URL}/varieties/${v.slug}/`,
        },
      })),
    },
  };
}

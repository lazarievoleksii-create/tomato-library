// Generates a structured AI index at /llms.json.

import {
  VARIETIES,
  CATEGORY_LABEL,
  CATEGORY_CODE,
  CATEGORY_DESCRIPTION,
  CATALOGUE_EDITION,
  CATALOGUE_MODIFIED_DATE,
  CATALOGUE_PUBLICATION_DATE,
  PUBLISHER,
  SITE_NAME,
  SITE_URL,
  datasetSchema,
  habitLabel,
  sizeClassLabel,
} from '../utils/varieties';

export const prerender = true;

function tagTokens(variety) {
  return (variety.tags || '').split(/\s+/).filter(Boolean);
}

function countByTag(tag) {
  return VARIETIES.filter((variety) => tagTokens(variety).includes(tag)).length;
}

function cultivarRecord(variety) {
  return {
    id: variety.id,
    url: `${SITE_URL}/varieties/${variety.slug}/`,
    slug: variety.slug,
    name_en: variety.name_en,
    name_uk: variety.name_uk,
    category: {
      slug: variety.cat,
      label: variety.cat_label,
      url: `${SITE_URL}/categories/${variety.cat}/`,
    },
    measurements: {
      plant_height_m: variety.h,
      fruit_weight_g: variety.w,
      plant_habit: habitLabel(variety.h) || null,
      size_class: sizeClassLabel(variety.w) || null,
    },
    morphology: {
      fruit_form: variety.shape || null,
      fruit_colours: variety.colors || [],
    },
    canonical_english_name_verified: Boolean(variety.has_canonical_en),
    note: variety.note || null,
    tags: tagTokens(variety),
  };
}

export async function GET() {
  const verifiedCount = VARIETIES.filter((variety) => variety.has_canonical_en).length;

  const categories = Object.keys(CATEGORY_CODE).map((slug) => ({
    slug,
    code: CATEGORY_CODE[slug],
    label: CATEGORY_LABEL[slug],
    description: CATEGORY_DESCRIPTION[slug],
    url: `${SITE_URL}/categories/${slug}/`,
    cultivar_count: VARIETIES.filter((variety) => variety.cat === slug).length,
  }));

  const filterDimensions = [
    ['habit:tall', 'Tall plants (> 1.2 m)'],
    ['habit:standard', 'Standard plants (1-1.2 m)'],
    ['habit:compact', 'Compact plants (< 1 m)'],
    ['size:beefsteak', 'Beefsteak fruit (>= 400 g)'],
    ['size:medium', 'Medium fruit (100-400 g)'],
    ['size:cherry-plum', 'Cherry or plum fruit (< 100 g)'],
    ['shape:heart-shaped', 'Heart-shaped fruit'],
    ['shape:round', 'Round fruit'],
    ['shape:plum', 'Plum fruit'],
    ['color:red', 'Red fruit'],
    ['color:pink', 'Pink fruit'],
    ['color:yellow', 'Yellow fruit'],
    ['color:black', 'Black fruit'],
    ['color:bicolor', 'Bicolor fruit'],
  ].map(([tag, label]) => ({
    tag,
    label,
    cultivar_count: countByTag(tag),
  })).filter((item) => item.cultivar_count > 0);

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${SITE_URL}/#dataset`,
    name: SITE_NAME,
    alternateName: 'Lazariev Heirloom Tomato Library',
    url: `${SITE_URL}/`,
    version: CATALOGUE_EDITION,
    datePublished: CATALOGUE_PUBLICATION_DATE,
    dateModified: CATALOGUE_MODIFIED_DATE,
    publisher: {
      name: PUBLISHER.name,
      url: PUBLISHER.url,
      international_url: PUBLISHER.internationalUrl,
      founding_date: PUBLISHER.foundingDate,
      email: PUBLISHER.email,
    },
    ai_index: {
      preferred_citation: `Lazariev, O., Lazarieva, O. (2026). Catalogue of Solanum lycopersicum: Lazariev Heirloom Tomato Library, Volume I, Edition ${CATALOGUE_EDITION}. Seed.ua, Ukraine. Retrieved from ${SITE_URL}/`,
      llms_txt: `${SITE_URL}/llms.txt`,
      llms_full_txt: `${SITE_URL}/llms-full.txt`,
      sitemap: `${SITE_URL}/sitemap-index.xml`,
      rss: `${SITE_URL}/rss.xml`,
      humans: `${SITE_URL}/humans.txt`,
    },
    metrics: {
      total_cultivars: VARIETIES.length,
      verified_canonical_english_names: verifiedCount,
      category_count: categories.length,
    },
    schema_summary: datasetSchema(),
    categories,
    filter_dimensions: filterDimensions,
    cultivars: VARIETIES
      .slice()
      .sort((a, b) => a.name_en.localeCompare(b.name_en))
      .map(cultivarRecord),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

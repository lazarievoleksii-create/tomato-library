#!/usr/bin/env node
/**
 * Import varieties data from the source Excel catalog.
 * Reads src/data/source-catalog.xlsx and regenerates src/data/varieties.json.
 *
 * Usage: npm run import-data
 *
 * The script reads from the 'varieties' sheet, applies confidence-based
 * verified-flag, and outputs a clean JSON suitable for Astro static generation.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCE_XLSX = resolve(ROOT, 'src/data/source-catalog.xlsx');
const OUTPUT_JSON = resolve(ROOT, 'src/data/varieties.json');
const OUTPUT_FULL_JSON = resolve(ROOT, 'src/data/varieties-full.json');

const CATEGORY_LABEL = {
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

function transliterate(name) {
  if (!name) return '';
  const table = {
    а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ie',ж:'zh',
    з:'z',и:'y',і:'i',ї:'i',й:'i',к:'k',л:'l',м:'m',н:'n',
    о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',
    ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'iu',я:'ia',"'":'',
    А:'A',Б:'B',В:'V',Г:'H',Ґ:'G',Д:'D',Е:'E',Є:'Ye',Ж:'Zh',
    З:'Z',И:'Y',І:'I',Ї:'Yi',Й:'Y',К:'K',Л:'L',М:'M',Н:'N',
    О:'O',П:'P',Р:'R',С:'S',Т:'T',У:'U',Ф:'F',Х:'Kh',Ц:'Ts',
    Ч:'Ch',Ш:'Sh',Щ:'Shch',Ь:'',Ю:'Yu',Я:'Ya',
  };
  return [...name].map(ch => table[ch] ?? ch).join('').trim();
}

function slugify(s) {
  if (!s) return 'unknown';
  return transliterate(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function sizeBucket(w) {
  if (w == null) return null;
  if (w < 100) return 'cherry-plum';
  if (w < 400) return 'medium';
  return 'beefsteak';
}

function heightBucket(h) {
  if (h == null) return null;
  if (h < 1.0) return 'compact';
  if (h <= 1.2) return 'standard';
  return 'tall';
}

console.log('Reading source catalog from:', SOURCE_XLSX);
const wb = XLSX.readFile(SOURCE_XLSX);
const sheet = wb.Sheets['varieties'];
if (!sheet) {
  console.error('No "varieties" sheet found in source catalog');
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
console.log(`Read ${rows.length} rows from "varieties" sheet`);

const entries = [];
const fullEntries = [];

for (const row of rows) {
  const name_uk = row.name_uk;
  if (!name_uk) continue;

  const name_en = row.name_en || transliterate(name_uk);
  const cat = row.category || 'promo';
  const cat_label = CATEGORY_LABEL[cat] || cat;
  const slug = row.slug || (row.name_en ? slugify(row.name_en) : slugify(name_uk));
  const has_canonical_en = row.confidence_en === 'HIGH';

  const colors = (row.colors_all || '').split(';').map(s => s.trim()).filter(Boolean);
  if (colors.length === 0) colors.push('unspecified');
  const shapes = (row.shapes_all || '').split(';').map(s => s.trim()).filter(Boolean);

  const tags = [];
  shapes.forEach(s => tags.push(`shape:${s}`));
  colors.forEach(c => tags.push(`color:${c}`));
  if (sizeBucket(row.weight_g)) tags.push(`size:${sizeBucket(row.weight_g)}`);
  if (heightBucket(row.height_m)) tags.push(`habit:${heightBucket(row.height_m)}`);
  tags.push(`cat:${cat}`);

  const desc = row.description_uk || '';
  const note = desc.split('.')[0].slice(0, 90).trim();

  entries.push({
    id: row.id,
    slug,
    name_en,
    name_uk,
    cat,
    cat_label,
    h: row.height_m,
    w: row.weight_g,
    shape: row.shape || (shapes[0] || ''),
    colors,
    note,
    tags: tags.join(' '),
    has_canonical_en,
  });

  fullEntries.push({
    name: name_uk,
    name_en,
    category: cat,
    height_m: row.height_m,
    weight_g: row.weight_g,
    description: desc,
    description_en: row.description_en || '',
    colors,
    shapes,
    days_to_maturity: row.days_to_maturity,
    habit: row.habit_growth || 'indeterminate',
    leaf_type: row.leaf_type || 'regular',
    slug,
    shop_url: row.shop_url || '',
    hero_image: row.hero_image || '',
    breeder_origin: row.breeder_origin || '',
    _recovered_from: row.recovered_from || '',
  });
}

// Sort entries by English name
entries.sort((a, b) => a.name_en.localeCompare(b.name_en));

writeFileSync(OUTPUT_JSON, JSON.stringify(entries, null, 0));
writeFileSync(OUTPUT_FULL_JSON, JSON.stringify(fullEntries, null, 0));

console.log(`✓ Wrote ${entries.length} entries to ${OUTPUT_JSON}`);
console.log(`✓ Wrote ${fullEntries.length} full entries to ${OUTPUT_FULL_JSON}`);
console.log(`  ${entries.filter(e => e.has_canonical_en).length} with canonical English names`);

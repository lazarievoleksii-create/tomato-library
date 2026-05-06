import rss from '@astrojs/rss';
import { VARIETIES } from '../utils/varieties';

export async function GET(context) {
  // Most recently added/recovered first (for RSS)
  const items = VARIETIES.slice(0, 50).map(v => ({
    title: `${v.name_en} · ${v.cat_label}`,
    description: `${v.name_en} (${v.name_uk}) — ${v.note}`,
    link: `/varieties/${v.slug}/`,
    pubDate: new Date('2026-01-15'), // Catalogue publication date
  }));

  return rss({
    title: 'Catalogue of Solanum lycopersicum — Latest entries',
    description: 'Recently catalogued heirloom tomato cultivars from the Lazariev collection.',
    site: context.site,
    items,
    customData: '<language>en-us</language>',
  });
}

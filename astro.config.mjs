import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://library.en.seed.ua',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(page) })],
  build: {
    format: 'directory',
  },
});

import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://library.en.seed.ua',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});

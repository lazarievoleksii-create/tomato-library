import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const reportsDir = path.join(root, 'reports');
const varietiesPath = path.join(root, 'src/data/varieties.json');
const siteUrl = 'https://library.en.seed.ua';

const checks = [];

function addCheck(id, label, pass, details = '', severity = 'error') {
  checks.push({ id, label, pass: Boolean(pass), severity, details });
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=(["'])([\\s\\S]*?)\\1`, 'i'));
  return match ? match[2] : '';
}

function findMeta(html, key, attrName = 'name') {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const found = tags.find((tag) => attr(tag, attrName) === key);
  return found ? attr(found, 'content') : '';
}

function findLink(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  return tags.find((tag) => attr(tag, 'rel') === rel) || '';
}

function extractSchemas(html, source) {
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const schemas = [];

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1].trim());
      if (Array.isArray(parsed)) {
        schemas.push(...parsed);
      } else {
        schemas.push(parsed);
      }
    } catch (error) {
      addCheck(`schema-json:${source}`, `${source} has parseable JSON-LD`, false, error.message);
    }
  }

  return schemas;
}

function schemaTypes(schema) {
  const type = schema && schema['@type'];
  if (Array.isArray(type)) return type;
  return type ? [type] : [];
}

function relPath(filePath) {
  return path.relative(distDir, filePath).replaceAll(path.sep, '/');
}

async function main() {
  if (!await exists(distDir)) {
    addCheck('dist-present', 'Built dist directory exists', false, 'Run npm run build before npm run seo:audit:built.');
  }

  const varieties = JSON.parse(await readFile(varietiesPath, 'utf8'));
  const files = await exists(distDir) ? await walk(distDir) : [];
  const htmlFiles = files
    .filter((file) => file.endsWith('.html'))
    .filter((file) => relPath(file) !== '404.html');

  addCheck('html-pages', 'Generated HTML pages exist', htmlFiles.length > 0, `${htmlFiles.length} HTML pages found`);

  const allSchemas = [];

  for (const file of htmlFiles) {
    const page = relPath(file);
    const html = await readFile(file, 'utf8');
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const description = findMeta(html, 'description');
    const robots = findMeta(html, 'robots');
    const canonicalTag = findLink(html, 'canonical');
    const canonical = attr(canonicalTag, 'href');
    const ogTitle = findMeta(html, 'og:title', 'property');
    const ogDescription = findMeta(html, 'og:description', 'property');
    const ogImage = findMeta(html, 'og:image', 'property');
    const ogImagePath = ogImage.startsWith(siteUrl)
      ? path.join(distDir, new URL(ogImage).pathname.replace(/^\//, ''))
      : '';
    const twitterCard = findMeta(html, 'twitter:card');
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    const schemas = extractSchemas(html, page);

    allSchemas.push(...schemas);

    addCheck(`title:${page}`, `${page} has SEO title`, title.length >= 10 && title.length <= 90, `${title.length} chars`);
    addCheck(`description:${page}`, `${page} has meta description`, description.length >= 45 && description.length <= 170, `${description.length} chars`);
    addCheck(`canonical:${page}`, `${page} has absolute canonical`, canonical.startsWith(siteUrl), canonical || 'missing');
    addCheck(`robots:${page}`, `${page} is indexable`, robots && !robots.includes('noindex'), robots || 'missing');
    addCheck(`og:${page}`, `${page} has Open Graph basics`, Boolean(ogTitle && ogDescription && ogImage), 'og:title, og:description, og:image');
    addCheck(`og-image-file:${page}`, `${page} has generated OG image asset`, ogImagePath ? await exists(ogImagePath) : /^https?:\/\//.test(ogImage), ogImage || 'missing');
    addCheck(`twitter:${page}`, `${page} has Twitter card`, Boolean(twitterCard), twitterCard || 'missing');
    addCheck(`h1:${page}`, `${page} has one h1`, h1Count === 1, `${h1Count} h1 elements`);
    addCheck(`jsonld:${page}`, `${page} has JSON-LD`, schemas.length > 0, `${schemas.length} schema blocks`);
  }

  const typeCounts = {};
  for (const schema of allSchemas) {
    for (const type of schemaTypes(schema)) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  }

  addCheck('schema-product-count', 'Product schema exists for cultivar pages', (typeCounts.Product || 0) >= varieties.length, `${typeCounts.Product || 0}/${varieties.length}`);
  addCheck('schema-faq-count', 'FAQ schema exists for GEO answer blocks', (typeCounts.FAQPage || 0) >= varieties.length, `${typeCounts.FAQPage || 0}/${varieties.length}`);
  addCheck('schema-dataset', 'Dataset schema is present', (typeCounts.Dataset || 0) >= 1, `${typeCounts.Dataset || 0} Dataset schemas`);
  addCheck('schema-organization', 'Organization schema is present', (typeCounts.Organization || 0) >= 1, `${typeCounts.Organization || 0} Organization schemas`);
  addCheck('schema-website', 'WebSite schema is present', (typeCounts.WebSite || 0) >= 1, `${typeCounts.WebSite || 0} WebSite schemas`);

  const requiredAssets = [
    ['robots', 'robots.txt'],
    ['humans', 'humans.txt'],
    ['llms', 'llms.txt'],
    ['llms-full', 'llms-full.txt'],
    ['llms-json', 'llms.json'],
    ['og-default', 'og-default.png'],
    ['sitemap', 'sitemap-index.xml'],
    ['rss', 'rss.xml'],
  ];

  for (const [id, fileName] of requiredAssets) {
    const filePath = path.join(distDir, fileName);
    addCheck(`asset:${id}`, `${fileName} is generated`, await exists(filePath), fileName);
  }

  if (await exists(path.join(distDir, 'robots.txt'))) {
    const robots = await readFile(path.join(distDir, 'robots.txt'), 'utf8');
    addCheck('robots-ai-bots', 'robots.txt allows AI crawlers', /GPTBot[\s\S]*Allow:\s*\//.test(robots) && /ClaudeBot[\s\S]*Allow:\s*\//.test(robots) && /PerplexityBot[\s\S]*Allow:\s*\//.test(robots), 'GPTBot, ClaudeBot, PerplexityBot');
    addCheck('robots-sitemap', 'robots.txt points to sitemap', robots.includes(`${siteUrl}/sitemap-index.xml`), 'Sitemap directive');
  }

  if (await exists(path.join(distDir, 'llms.json'))) {
    try {
      const llms = JSON.parse(await readFile(path.join(distDir, 'llms.json'), 'utf8'));
      addCheck('llms-json-records', 'llms.json includes all cultivars', Array.isArray(llms.cultivars) && llms.cultivars.length === varieties.length, `${llms.cultivars?.length || 0}/${varieties.length}`);
      addCheck('llms-json-citation', 'llms.json includes preferred citation', Boolean(llms.ai_index?.preferred_citation), 'preferred_citation');
    } catch (error) {
      addCheck('llms-json-parse', 'llms.json is parseable', false, error.message);
    }
  }

  const failed = checks.filter((check) => !check.pass);
  const errors = failed.filter((check) => check.severity === 'error');
  const passed = checks.length - failed.length;
  const score = Math.round((passed / checks.length) * 100);

  const report = {
    generated_at: new Date().toISOString(),
    site: siteUrl,
    score,
    totals: {
      checks: checks.length,
      passed,
      failed: failed.length,
      errors: errors.length,
      html_pages: htmlFiles.length,
    },
    schema_type_counts: typeCounts,
    checks,
  };

  await mkdir(reportsDir, { recursive: true });
  await writeFile(path.join(reportsDir, 'seo-geo-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

  const markdown = [
    '# SEO/GEO Audit',
    '',
    `Site: ${siteUrl}`,
    `Score: ${score}/100`,
    `Generated HTML pages: ${htmlFiles.length}`,
    '',
    '## Schema Coverage',
    '',
    ...Object.keys(typeCounts).sort().map((type) => `- ${type}: ${typeCounts[type]}`),
    '',
    '## Failed Checks',
    '',
    ...(failed.length
      ? failed.map((check) => `- [${check.severity}] ${check.label}: ${check.details}`)
      : ['No failed checks.']),
    '',
  ].join('\n');

  await writeFile(path.join(reportsDir, 'seo-geo-audit.md'), markdown);

  console.log(`SEO/GEO audit score: ${score}/100 (${passed}/${checks.length} checks passed)`);
  console.log(`Report: ${path.join(reportsDir, 'seo-geo-audit.md')}`);

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

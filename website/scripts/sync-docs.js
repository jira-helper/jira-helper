const fs = require('fs');
const path = require('path');

const MAP = require('./feature-map.json');
const SRC_BASE = path.resolve(__dirname, '../../src/features');
const DOCS_EN = path.resolve(__dirname, '../docs/features');
const DOCS_RU = path.resolve(__dirname, '../i18n/ru/docusaurus-plugin-content-docs/current/features');

const MULTI_DOC = {
  'additional-card-elements': {
    'days-in-column': { en: 'card-information/days-in-column.md', ru: 'card-information/days-in-column.md' },
    'days-to-deadline': { en: 'card-information/days-to-deadline.md', ru: 'card-information/days-to-deadline.md' },
    'issue-links-display': { en: 'card-information/issue-links-display.md', ru: 'card-information/issue-links-display.md' },
    'issue-condition-checks': { en: 'card-information/issue-condition-checks.md', ru: 'card-information/issue-condition-checks.md' },
  },
  'charts': {
    'sla-line': { en: 'control-chart/sla-line.md', ru: 'control-chart/sla-line.md' },
    'scale-ruler': { en: 'control-chart/scale-ruler.md', ru: 'control-chart/scale-ruler.md' },
  },
  'issue': {
    'flag-issue': { en: 'flag-issue/index.md', ru: 'flag-issue/index.md' },
  },
};

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

for (const [mod, targetPath] of Object.entries(MAP)) {
  if (targetPath === null) continue;

  const srcEn = path.join(SRC_BASE, mod, 'docs', 'user-guide.md');
  const srcRu = path.join(SRC_BASE, mod, 'docs', 'user-guide.ru.md');
  const destEn = path.join(DOCS_EN, targetPath + '.md');
  const destRu = path.join(DOCS_RU, targetPath + '.md');

  if (fs.existsSync(srcEn)) {
    ensureDir(destEn);
    fs.copyFileSync(srcEn, destEn);
    console.log(`OK  EN: ${mod} → ${targetPath}.md`);
  } else {
    console.log(`SKIP EN: ${srcEn} not found`);
  }

  if (fs.existsSync(srcRu)) {
    ensureDir(destRu);
    fs.copyFileSync(srcRu, destRu);
    console.log(`OK  RU: ${mod} → ${targetPath}.md`);
  } else {
    console.log(`SKIP RU: ${srcRu} not found`);
  }
}

for (const [mod, mapping] of Object.entries(MULTI_DOC)) {
  for (const [docName, paths] of Object.entries(mapping)) {
    const srcEn = path.join(SRC_BASE, mod, 'docs', docName, 'user-guide.md');
    const srcRu = path.join(SRC_BASE, mod, 'docs', docName, 'user-guide.ru.md');
    const destEn = path.join(DOCS_EN, paths.en);
    const destRu = path.join(DOCS_RU, paths.ru);

    if (fs.existsSync(srcEn)) {
      ensureDir(destEn);
      fs.copyFileSync(srcEn, destEn);
      console.log(`OK  EN: ${mod}/${docName} → ${paths.en}`);
    } else {
      console.log(`SKIP EN: ${srcEn} not found`);
    }

    if (fs.existsSync(srcRu)) {
      ensureDir(destRu);
      fs.copyFileSync(srcRu, destRu);
      console.log(`OK  RU: ${mod}/${docName} → ${paths.ru}`);
    } else {
      console.log(`SKIP RU: ${srcRu} not found`);
    }
  }
}

console.log('Done.');

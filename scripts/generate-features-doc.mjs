#!/usr/bin/env node
// Generates features.md (EN) and features.ru.md (RU) from per-feature docs.
// Usage: node scripts/generate-features-doc.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const CATEGORY_ORDER = [
  'column-limits-module',
  'person-limits-module',
  'wiplimit-on-cells',
  'swimlane-wip-limits-module',
  'features/field-limits-module',
  'card-colors',
  'swimlane-histogram-module',
  'blur-for-sensitive',
  'features/additional-card-elements',
  'features/sub-tasks-progress',
  'issue',
  'charts',
  'bug-template',
  'board-settings',
  'features/local-settings',
];

function findFiles(dir, fileName) {
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...findFiles(fullPath, fileName));
    } else if (entry.isFile() && entry.name === fileName) {
      results.push(fullPath);
    }
  }

  return results;
}

function sortKey(filePath) {
  const dir = path.dirname(path.relative(SRC, filePath));
  const idx = CATEGORY_ORDER.indexOf(dir);
  return idx >= 0 ? idx : 100;
}

function assemble(files, title, sourcePattern) {
  const sections = files.map(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    const rel = path.relative(ROOT, filePath);
    return `<!-- source: ${rel} -->\n${content}`;
  });

  const header = [
    `# ${title}`,
    '',
    `> Auto-generated from \`${sourcePattern}\` files. Do not edit manually.`,
    '> Run `npm run docs:features` to regenerate.',
    '',
    '---',
    '',
  ].join('\n');

  return header + sections.join('\n\n---\n\n') + '\n';
}

function generate(fileName, outputName, title, sourcePattern) {
  const files = findFiles(SRC, fileName).sort((a, b) => sortKey(a) - sortKey(b));

  if (files.length === 0) {
    console.warn(`No ${fileName} files found — skipping ${outputName}`);
    return;
  }

  const outputFile = path.resolve(ROOT, outputName);
  fs.writeFileSync(outputFile, assemble(files, title, sourcePattern), 'utf-8');
  console.log(`${outputName}: ${files.length} features`);
}

generate('feature.md', 'features.md', 'Jira Helper — Features', 'src/**/feature.md');
generate('feature.ru.md', 'features.ru.md', 'Jira Helper — Возможности', 'src/**/feature.ru.md');

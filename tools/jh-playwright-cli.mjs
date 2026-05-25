#!/usr/bin/env node
/**
 * Wrapper for playwright-cli that always loads jira-helper from dist/.
 *
 * Resolves repo-root absolute paths (dist, chrome profile, output) and passes
 * --config to playwright-cli. Use via: npm run jh:cli -- -s=jh open ...
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = path.join(root, '.playwright/cli.config.json');
const resolvedPath = path.join(root, '.playwright/cli.config.resolved.json');
const distPath = path.join(root, 'dist');

function buildResolvedConfig() {
  const template = JSON.parse(readFileSync(templatePath, 'utf8'));
  const profileDir = path.join(root, '.playwright/chrome-profile');
  const outputDir = path.join(root, '.playwright/output');

  mkdirSync(profileDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });

  return {
    ...template,
    outputDir,
    browser: {
      ...template.browser,
      userDataDir: profileDir,
      launchOptions: {
        ...template.browser.launchOptions,
        args: template.browser.launchOptions.args.map(arg =>
          arg.startsWith('--load-extension=') ? `--load-extension=${distPath}` : arg
        ),
      },
    },
  };
}

function main() {
  if (!existsSync(distPath)) {
    console.error('jh-playwright-cli: dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }

  writeFileSync(resolvedPath, `${JSON.stringify(buildResolvedConfig(), null, 2)}\n`);

  const args = process.argv.slice(2);
  const hasConfig = args.some(arg => arg === '--config' || arg.startsWith('--config='));

  if (!hasConfig) {
    args.push(`--config=${resolvedPath}`);
  }

  const result = spawnSync('playwright-cli', args, { stdio: 'inherit', cwd: root });
  process.exit(result.status ?? (result.error ? 1 : 0));
}

main();

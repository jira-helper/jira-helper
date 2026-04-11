import { execSync } from 'node:child_process';

const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf-8' });
const files = staged.trim().split('\n').filter(Boolean);
const srcFiles = files.filter(f => /^src\/.*\.(ts|tsx|js|jsx)$/.test(f));

if (srcFiles.length === 0) {
  console.log('No source files staged, skipping heavy checks.');
  process.exit(0);
}

const commands = [
  'npm run lint:typescript',
  'npm run lint:eslint',
  'npm run test',
  'npm run test:storybook',
];

for (const cmd of commands) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

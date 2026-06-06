import { execSync, spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

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

const logDir = '.logs';
const logPath = join(logDir, `precommit-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

mkdirSync(logDir, { recursive: true });
appendFileSync(logPath, `precommit started at ${new Date().toISOString()}\n\n`);
console.log(`Precommit log: ${logPath}`);

function runCommand(cmd) {
  const startedAt = Date.now();
  console.log(`\n> ${cmd}`);
  appendFileSync(logPath, `$ ${cmd}\n`);

  const result = spawnSync(cmd, {
    shell: true,
    encoding: 'utf-8',
    env: process.env,
  });

  if (result.stdout) appendFileSync(logPath, result.stdout);
  if (result.stderr) appendFileSync(logPath, result.stderr);

  const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  if (result.error || result.status !== 0) {
    const exitCode = result.status ?? 1;
    const reason = result.error ? ` (${result.error.message})` : '';
    console.error(`FAIL ${cmd}${reason} [${elapsedSeconds}s]`);
    console.error(`Full log: ${logPath}`);
    process.exit(exitCode);
  }

  console.log(`PASS ${cmd} [${elapsedSeconds}s]`);
}

for (const cmd of commands) {
  runCommand(cmd);
}

console.log(`\nPrecommit passed. Full log: ${logPath}`);

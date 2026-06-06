#!/usr/bin/env node

/**
 * Generates CHANGELOG entries from git commits between tags.
 *
 * Usage:
 *   node scripts/generate-changelog.mjs [from-tag] [to-tag]
 *
 * Examples:
 *   node scripts/generate-changelog.mjs 2.29.0 2.30.0
 *   node scripts/generate-changelog.mjs 2.29.0 HEAD
 *   node scripts/generate-changelog.mjs  # uses last tag to HEAD
 *
 * Commit format expected: [#issue] type(scope): message
 * Or: type(scope): message
 * Or: type: message
 */

import { execSync } from 'child_process';

const COMMIT_TYPES = {
  feat: 'Added',
  fix: 'Fixed',
  refactor: 'Changed',
  perf: 'Performance',
  docs: 'Documentation',
  style: 'Style',
  test: 'Tests',
  chore: 'Chore',
  build: 'Build',
  ci: 'CI',
};

function exec(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

function getLastTag() {
  try {
    return exec('git describe --tags --abbrev=0 2>/dev/null');
  } catch {
    return null;
  }
}

function getCommits(fromRef, toRef) {
  const range = fromRef ? `${fromRef}..${toRef}` : toRef;
  const format = '%H|%s|%an|%ad';
  const cmd = `git log ${range} --pretty=format:"${format}" --date=short`;

  try {
    const output = exec(cmd);
    if (!output) return [];

    return output.split('\n').map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash: hash.slice(0, 7), subject, author, date };
    });
  } catch {
    return [];
  }
}

function parseCommit(subject) {
  const patterns = [
    /^\[#?(\d+)\]\s*\[?#?\d*\]?\s*(\w+)(?:\(([^)]+)\))?:\s*(.+)$/,
    /^\[#?(\d+)\]\s*(.+)$/,
    /^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/,
  ];

  for (const pattern of patterns) {
    const match = subject.match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        return {
          issue: match[1],
          type: match[2].toLowerCase(),
          scope: match[3] || null,
          message: match[4],
        };
      } else if (pattern === patterns[1]) {
        return {
          issue: match[1],
          type: 'other',
          scope: null,
          message: match[2],
        };
      } else {
        return {
          issue: null,
          type: match[1].toLowerCase(),
          scope: match[2] || null,
          message: match[3],
        };
      }
    }
  }

  return {
    issue: null,
    type: 'other',
    scope: null,
    message: subject,
  };
}

function groupByType(commits) {
  const groups = {};

  for (const commit of commits) {
    const parsed = parseCommit(commit.subject);
    const category = COMMIT_TYPES[parsed.type] || 'Other';

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push({
      ...commit,
      ...parsed,
    });
  }

  return groups;
}

function formatChangelog(version, date, groups) {
  const lines = [`## [${version}] - ${date}`, ''];

  const order = ['Added', 'Fixed', 'Changed', 'Performance', 'Documentation'];

  for (const category of order) {
    if (!groups[category] || groups[category].length === 0) continue;

    lines.push(`### ${category}`, '');

    const seen = new Set();
    for (const item of groups[category]) {
      const key = item.message.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const scope = item.scope ? `**${item.scope}**: ` : '';
      const issue = item.issue ? ` [#${item.issue}]` : '';
      lines.push(`- ${scope}${item.message}${issue}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  let fromTag = args[0];
  let toRef = args[1] || 'HEAD';

  if (!fromTag) {
    fromTag = getLastTag();
    if (!fromTag) {
      console.error('No tags found. Please specify a range.');
      process.exit(1);
    }
    console.log(`Using last tag: ${fromTag}`);
  }

  const commits = getCommits(fromTag, toRef);

  if (commits.length === 0) {
    console.log('No commits found in the specified range.');
    process.exit(0);
  }

  console.log(`Found ${commits.length} commits from ${fromTag} to ${toRef}\n`);

  const groups = groupByType(commits);
  const today = new Date().toISOString().slice(0, 10);
  const version = toRef === 'HEAD' ? 'Unreleased' : toRef;

  const changelog = formatChangelog(version, today, groups);

  console.log('--- Generated CHANGELOG entry ---\n');
  console.log(changelog);
  console.log('--- End ---\n');
  console.log('Copy the above to CHANGELOG.md and edit as needed.');
}

main();

#!/usr/bin/env node

/**
 * Validates that Cypress .feature.cy.tsx test files cover all scenarios and steps
 * from the corresponding .feature files.
 *
 * Convention: for every `x.feature` there must be `x.feature.cy.tsx` in the same directory.
 *
 * Usage:
 *   node scripts/validate-feature-tests.mjs                          # auto-discover all .feature files in src/
 *   node scripts/validate-feature-tests.mjs <feature-file>           # validate one (test file inferred)
 *   node scripts/validate-feature-tests.mjs <feature-file> <cy-file> # validate explicit pair
 *
 * Exit codes:
 *   0 — all scenarios and steps are covered
 *   1 — missing scenarios or steps found
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, relative } from 'path';

// ── Auto-discovery ──────────────────────────────────────────────────────────

/**
 * Recursively find all .feature files under a directory.
 */
function findFeatureFiles(dir) {
  const results = [];

  function walk(d) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = resolve(d, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(full);
      } else if (entry.name.endsWith('.feature')) {
        results.push(full);
      }
    }
  }

  walk(resolve(dir));
  return results;
}

/**
 * Infer the test file path from a .feature path.
 * Convention: x.feature → x.feature.cy.tsx
 */
function inferTestPath(featurePath) {
  return featurePath + '.cy.tsx';
}

// ── Feature parser ──────────────────────────────────────────────────────────

function parseFeature(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const scenarios = [];
  let currentScenario = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines, comments, tags, Feature, Background
    if (!line || line.startsWith('#') || line.startsWith('@') || line.startsWith('Feature:') || line.startsWith('As a') || line.startsWith('I want') || line.startsWith('So that')) {
      continue;
    }

    // Background steps — skip (they are in beforeEach)
    if (line.startsWith('Background:')) {
      currentScenario = { name: '__background__', steps: [] };
      continue;
    }

    if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
      const name = line.replace(/^Scenario( Outline)?:\s*/, '');
      currentScenario = { name, steps: [] };
      scenarios.push(currentScenario);
      continue;
    }

    // Steps: Given, When, Then, And, But
    if (/^(Given|When|Then|And|But)\s/.test(line) && currentScenario) {
      if (currentScenario.name === '__background__') {
        // Skip background steps — they are in beforeEach
        continue;
      }
      currentScenario.steps.push(line);
    }
  }

  return scenarios;
}

// ── Test parser ─────────────────────────────────────────────────────────────

function parseTestFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');

  const scenarios = [];

  // Match Scenario('name', ...) calls
  const scenarioRegex = /Scenario\(\s*'([^']+)'/g;
  let match;
  while ((match = scenarioRegex.exec(content)) !== null) {
    scenarios.push({
      name: match[1],
      steps: [],
      offset: match.index,
    });
  }

  // Match Step('name', ...) calls
  const stepRegex = /Step\(\s*'([^']+)'/g;
  while ((match = stepRegex.exec(content)) !== null) {
    const stepName = match[1];
    const stepOffset = match.index;

    // Find which scenario this step belongs to (the last scenario before this offset)
    let ownerScenario = null;
    for (const sc of scenarios) {
      if (sc.offset <= stepOffset) {
        ownerScenario = sc;
      }
    }

    if (ownerScenario) {
      ownerScenario.steps.push(stepName);
    }
  }

  return scenarios;
}

// ── Validator ───────────────────────────────────────────────────────────────

function validate(featurePath, testPath) {
  const absFeature = resolve(featurePath);
  const absTest = resolve(testPath);

  if (!existsSync(absFeature)) {
    console.error(`  ERROR: Feature file not found: ${featurePath}`);
    return false;
  }

  if (!existsSync(absTest)) {
    console.error(`  ERROR: Test file not found: ${testPath}`);
    console.error(`  Expected: ${relative(process.cwd(), absTest)}`);
    return false;
  }

  const featureScenarios = parseFeature(absFeature);
  const testScenarios = parseTestFile(absTest);

  const featureNames = new Set(featureScenarios.map(s => s.name));
  const testNames = new Set(testScenarios.map(s => s.name));

  let hasErrors = false;

  // Check missing scenarios
  const missingScenarios = [...featureNames].filter(n => !testNames.has(n));
  if (missingScenarios.length > 0) {
    console.error(`  MISSING SCENARIOS in test file:`);
    for (const name of missingScenarios) {
      console.error(`    - ${name}`);
    }
    hasErrors = true;
  }

  // Check extra scenarios (in test but not in feature)
  const extraScenarios = [...testNames].filter(n => !featureNames.has(n));
  if (extraScenarios.length > 0) {
    console.warn(`  EXTRA SCENARIOS in test file (not in .feature):`);
    for (const name of extraScenarios) {
      console.warn(`    + ${name}`);
    }
  }

  // Check steps for each matching scenario
  for (const featureScenario of featureScenarios) {
    const testScenario = testScenarios.find(t => t.name === featureScenario.name);
    if (!testScenario) continue;

    const featureSteps = featureScenario.steps;
    const testSteps = testScenario.steps;

    const missingSteps = featureSteps.filter(step => !testSteps.includes(step));
    const extraSteps = testSteps.filter(step => !featureSteps.includes(step));

    if (missingSteps.length > 0) {
      console.error(`  MISSING STEPS in "${featureScenario.name}":`);
      for (const step of missingSteps) {
        console.error(`    - ${step}`);
      }
      hasErrors = true;
    }

    if (extraSteps.length > 0) {
      console.warn(`  EXTRA STEPS in "${featureScenario.name}":`);
      for (const step of extraSteps) {
        console.warn(`    + ${step}`);
      }
    }
  }

  if (!hasErrors && missingScenarios.length === 0) {
    console.log(`  ✓ All ${featureScenarios.length} scenarios covered`);
    console.log(`  ✓ All steps match`);
  }

  return !hasErrors;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  let pairs;

  if (args.length === 2) {
    // Explicit pair
    pairs = [{ feature: args[0], test: args[1] }];
  } else if (args.length === 1) {
    // Single .feature file — infer test path
    const feature = args[0];
    const test = inferTestPath(feature);
    pairs = [{ feature, test }];
  } else if (args.length === 0) {
    // Auto-discover: find all .feature files in src/, infer test paths
    const featureFiles = findFeatureFiles('src');
    pairs = featureFiles.map(f => ({
      feature: f,
      test: inferTestPath(f),
    }));

    if (pairs.length === 0) {
      console.log('No .feature files found in src/');
      process.exit(0);
    }

    console.log(`Found ${pairs.length} .feature file(s)\n`);
  } else {
    console.error('Usage:');
    console.error('  node scripts/validate-feature-tests.mjs                          # auto-discover');
    console.error('  node scripts/validate-feature-tests.mjs <feature-file>           # infer test');
    console.error('  node scripts/validate-feature-tests.mjs <feature-file> <cy-file> # explicit pair');
    process.exit(1);
  }

  let allPassed = true;

  for (const { feature, test } of pairs) {
    const relFeature = relative(process.cwd(), resolve(feature));
    const relTest = relative(process.cwd(), resolve(test));
    console.log(`── ${relFeature} ↔ ${relTest} ──`);

    const passed = validate(feature, test);
    if (!passed) allPassed = false;
    console.log('');
  }

  if (allPassed) {
    console.log('All feature tests are in sync');
  } else {
    console.log('Some feature tests are out of sync');
    process.exit(1);
  }
}

main();

#!/usr/bin/env node

/**
 * Validates that Cypress .cy.tsx test files cover all scenarios and steps
 * from the corresponding .feature files.
 *
 * Usage:
 *   node scripts/validate-feature-tests.mjs <feature-file> <cy-file>
 *   node scripts/validate-feature-tests.mjs  # runs all known pairs
 *
 * Exit codes:
 *   0 — all scenarios and steps are covered
 *   1 — missing scenarios or steps found
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, relative } from 'path';

// ── Known feature ↔ test pairs ──────────────────────────────────────────────

const PAIRS = [
  {
    feature: 'src/person-limits/SettingsPage/settings-page.feature',
    test: 'src/person-limits/SettingsPage/SettingsPage.cy.tsx',
  },
  {
    feature: 'src/column-limits/SettingsPage/settings-page.feature',
    test: 'src/column-limits/SettingsPage/SettingsPage.cy.tsx',
  },
];

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
    pairs = [{ feature: args[0], test: args[1] }];
  } else if (args.length === 0) {
    pairs = PAIRS;
  } else {
    console.error('Usage:');
    console.error('  node scripts/validate-feature-tests.mjs <feature-file> <test-file>');
    console.error('  node scripts/validate-feature-tests.mjs  # validate all known pairs');
    process.exit(1);
  }

  let allPassed = true;

  for (const { feature, test } of pairs) {
    console.log(`\n── ${relative(process.cwd(), feature)} ↔ ${relative(process.cwd(), test)} ──`);

    if (!existsSync(feature) && !existsSync(test)) {
      console.log(`  SKIP: files not found`);
      continue;
    }

    const passed = validate(feature, test);
    if (!passed) allPassed = false;
  }

  console.log('');

  if (allPassed) {
    console.log('✅ All feature tests are in sync');
  } else {
    console.log('❌ Some feature tests are out of sync');
    process.exit(1);
  }
}

main();

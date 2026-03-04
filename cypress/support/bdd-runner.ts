/**
 * BDD Runner for Cypress component tests.
 *
 * Parses .feature files and matches steps to registered step definitions.
 *
 * Usage:
 *   import { defineFeature, Given, When, Then } from './bdd-runner';
 *
 *   defineFeature('path/to/feature.feature', ({ Background, Scenario }) => {
 *     Background(() => {
 *       // setup code
 *     });
 *
 *     Given('there is a limit for {string} ({string})', (login, displayName) => {
 *       // step implementation
 *     });
 *
 *     When('I click {string}', (buttonText) => {
 *       cy.contains('button', buttonText).click();
 *     });
 *
 *     Scenario('SC-DELETE-1: Delete a limit');
 *   });
 */

import { Parser, AstBuilder, GherkinClassicTokenMatcher } from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';

/** Parsed DataTable: array of row objects, first row = headers */
export type DataTableRows = Record<string, string>[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StepFn = (...args: any[]) => void;

interface StepDefinition {
  pattern: string | RegExp;
  fn: StepFn;
}

interface ParsedStep {
  keyword: string;
  text: string;
  dataTable?: DataTableRows;
}

interface ParsedScenario {
  name: string;
  tags: string[];
  steps: ParsedStep[];
}

interface ParsedFeature {
  name: string;
  background: ParsedStep[];
  scenarios: ParsedScenario[];
}

const stepDefinitions: StepDefinition[] = [];

function parseDataTable(dataTable: { rows: Array<{ cells: Array<{ value: string }> }> }): DataTableRows {
  const { rows } = dataTable;
  if (rows.length < 2) return [];
  const headers = rows[0].cells.map(c => c.value.trim());
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    row.cells.forEach((cell, i) => {
      obj[headers[i]] = cell.value.trim();
    });
    return obj;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStep(s: any): ParsedStep {
  const step: ParsedStep = {
    keyword: s.keyword.trim(),
    text: s.text,
  };
  if (s.dataTable?.rows) {
    step.dataTable = parseDataTable(s.dataTable);
  }
  return step;
}

function parseFeatureFile(featureText: string): ParsedFeature {
  const uuidFn = IdGenerator.uuid();
  const builder = new AstBuilder(uuidFn);
  const matcher = new GherkinClassicTokenMatcher();
  const parser = new Parser(builder, matcher);

  const gherkinDoc = parser.parse(featureText);
  const { feature } = gherkinDoc;

  if (!feature) {
    throw new Error('No feature found in file');
  }

  let background: ParsedStep[] = [];
  const scenarios: ParsedScenario[] = [];

  for (const child of feature.children) {
    if (child.background) {
      background = child.background.steps.map(mapStep);
    }
    if (child.scenario) {
      scenarios.push({
        name: child.scenario.name,
        tags: child.scenario.tags.map(t => t.name),
        steps: child.scenario.steps.map(mapStep),
      });
    }
  }

  return {
    name: feature.name,
    background,
    scenarios,
  };
}

function convertPatternToRegex(pattern: string): RegExp {
  const regexStr = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\{string\\}/g, '"([^"]*)"')
    .replace(/\\{word\\}/g, '([^\\s]+)')
    .replace(/\\{text\\}/g, '([^)]+)')
    .replace(/\\{int\\}/g, '(\\d+)')
    .replace(/\\{float\\}/g, '([\\d.]+)')
    .replace(/\\{ordinal\\}/g, '(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)');
  return new RegExp(`^${regexStr}$`);
}

function matchStep(stepText: string, definitions: StepDefinition[]): { def: StepDefinition; args: string[] } | null {
  for (const def of definitions) {
    const regex = typeof def.pattern === 'string' ? convertPatternToRegex(def.pattern) : def.pattern;
    const match = stepText.match(regex);
    if (match) {
      return { def, args: match.slice(1) };
    }
  }
  return null;
}

function runStep(step: ParsedStep) {
  const { keyword, text, dataTable } = step;
  const fullStep = `${keyword} ${text}`;
  const result = matchStep(text, stepDefinitions);

  if (!result) {
    throw new Error(`No step definition found for: "${fullStep}"\nStep text: "${text}"`);
  }

  cy.log(`**${fullStep}**`);
  const args: (string | DataTableRows)[] = [...result.args];
  if (dataTable) {
    args.push(dataTable);
  }
  result.def.fn(...args);
}

export function Given(pattern: string | RegExp, fn: StepFn) {
  stepDefinitions.push({ pattern, fn });
}

export function When(pattern: string | RegExp, fn: StepFn) {
  stepDefinitions.push({ pattern, fn });
}

export function Then(pattern: string | RegExp, fn: StepFn) {
  stepDefinitions.push({ pattern, fn });
}

export function And(pattern: string | RegExp, fn: StepFn) {
  stepDefinitions.push({ pattern, fn });
}

interface FeatureContext {
  Background: (fn: () => void) => void;
  BeforeScenario: (fn: () => void) => void;
  AfterScenario: (fn: () => void) => void;
}

export function defineFeature(featureText: string, defineFn?: (ctx: FeatureContext) => void) {
  const feature = parseFeatureFile(featureText);
  let backgroundFn: (() => void) | null = null;
  let beforeScenarioFn: (() => void) | null = null;
  let afterScenarioFn: (() => void) | null = null;

  if (defineFn) {
    const ctx: FeatureContext = {
      Background: (fn: () => void) => {
        backgroundFn = fn;
      },
      BeforeScenario: (fn: () => void) => {
        beforeScenarioFn = fn;
      },
      AfterScenario: (fn: () => void) => {
        afterScenarioFn = fn;
      },
    };

    defineFn(ctx);
  }

  const runScenario = (
    scenario: ParsedScenario,
    scenarioBeforeFn: (() => void) | null,
    scenarioAfterFn: (() => void) | null
  ) => {
    it(`Scenario: ${scenario.name}`, () => {
      if (scenarioBeforeFn) {
        scenarioBeforeFn();
      }

      for (const step of feature.background) {
        runStep(step);
      }

      for (const step of scenario.steps) {
        runStep(step);
      }

      if (scenarioAfterFn) {
        scenarioAfterFn();
      }
    });
  };

  describe(`Feature: ${feature.name}`, () => {
    beforeEach(() => {
      if (backgroundFn) {
        backgroundFn();
      }
    });

    for (const scenario of feature.scenarios) {
      runScenario(scenario, beforeScenarioFn, afterScenarioFn);
    }
  });
}

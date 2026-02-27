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

type StepFn = (...args: string[]) => void;

interface StepDefinition {
  pattern: string | RegExp;
  fn: StepFn;
}

interface ParsedScenario {
  name: string;
  tags: string[];
  steps: Array<{ keyword: string; text: string }>;
}

interface ParsedFeature {
  name: string;
  background: Array<{ keyword: string; text: string }>;
  scenarios: ParsedScenario[];
}

const stepDefinitions: StepDefinition[] = [];

function parseFeatureFile(featureText: string): ParsedFeature {
  const uuidFn = IdGenerator.uuid();
  const builder = new AstBuilder(uuidFn);
  const matcher = new GherkinClassicTokenMatcher();
  const parser = new Parser(builder, matcher);

  const gherkinDoc = parser.parse(featureText);
  const feature = gherkinDoc.feature;

  if (!feature) {
    throw new Error('No feature found in file');
  }

  let background: Array<{ keyword: string; text: string }> = [];
  const scenarios: ParsedScenario[] = [];

  for (const child of feature.children) {
    if (child.background) {
      background = child.background.steps.map(s => ({
        keyword: s.keyword.trim(),
        text: s.text,
      }));
    }
    if (child.scenario) {
      scenarios.push({
        name: child.scenario.name,
        tags: child.scenario.tags.map(t => t.name),
        steps: child.scenario.steps.map(s => ({
          keyword: s.keyword.trim(),
          text: s.text,
        })),
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
  let regexStr = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\{string\\}/g, '"([^"]*)"')
    .replace(/\\{word\\}/g, '([^\\s]+)')
    .replace(/\\{text\\}/g, '([^)]+)')
    .replace(/\\{int\\}/g, '(\\d+)')
    .replace(/\\{float\\}/g, '([\\d.]+)');
  return new RegExp(`^${regexStr}$`);
}

function matchStep(
  stepText: string,
  definitions: StepDefinition[]
): { def: StepDefinition; args: string[] } | null {
  for (const def of definitions) {
    const regex = typeof def.pattern === 'string' ? convertPatternToRegex(def.pattern) : def.pattern;
    const match = stepText.match(regex);
    if (match) {
      return { def, args: match.slice(1) };
    }
  }
  return null;
}

function runStep(keyword: string, text: string) {
  const fullStep = `${keyword} ${text}`;
  const result = matchStep(text, stepDefinitions);

  if (!result) {
    throw new Error(`No step definition found for: "${fullStep}"\nStep text: "${text}"`);
  }

  cy.log(`**${fullStep}**`);
  result.def.fn(...result.args);
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
}

export function defineFeature(featureText: string, defineFn?: (ctx: FeatureContext) => void) {
  const feature = parseFeatureFile(featureText);
  let backgroundFn: (() => void) | null = null;
  let beforeScenarioFn: (() => void) | null = null;

  if (defineFn) {
    const ctx: FeatureContext = {
      Background: (fn: () => void) => {
        backgroundFn = fn;
      },
      BeforeScenario: (fn: () => void) => {
        beforeScenarioFn = fn;
      },
    };

    defineFn(ctx);
  }

  describe(`Feature: ${feature.name}`, () => {
    beforeEach(() => {
      if (backgroundFn) {
        backgroundFn();
      }
    });

    for (const scenario of feature.scenarios) {
      it(`Scenario: ${scenario.name}`, () => {
        if (beforeScenarioFn) {
          beforeScenarioFn();
        }

        for (const step of feature.background) {
          runStep(step.keyword, step.text);
        }

        for (const step of scenario.steps) {
          runStep(step.keyword, step.text);
        }
      });
    }
  });
}

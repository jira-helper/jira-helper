import { Given, type DataTableRows, Then, When } from '../../../../../../cypress/support/bdd-runner';
import { globalContainer } from 'dioma';
import { ganttQuickFiltersModelToken } from '../../../tokens';
import {
  bddQuickFilterIdFromName,
  mountIssueViewWithGantt,
  reloadGanttPreservingStorage,
  seedCustomQuickFiltersFromTable,
} from '../helpers';

const { expect } = chai; // global chai from Cypress

function qfSearchInput(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('[data-testid="gantt-quick-filters-search"]').filter(':visible').first();
}

/**
 * Resolves the native `input` for quick filter search. `data-testid` may be on the affix wrapper
 * or the input itself; placeholder-based selectors are brittle (locale, error/Tooltip branch).
 */
function qfNativeInput(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy
    .get('[data-testid="gantt-quick-filters-search"]', { timeout: 20000 })
    .filter(':visible')
    .first()
    .then($root => {
      if ($root.is('input, textarea')) {
        return cy.wrap($root);
      }
      const $in = $root.find('input, textarea').first();
      if ($in.length) {
        return cy.wrap($in);
      }
      throw new Error('gantt-quick-filters-search: no input element');
    });
}

function qfInputChain(): Cypress.Chainable<JQuery<HTMLElement>> {
  return qfNativeInput();
}

function setQuickFilterSearchMode(mode: string): void {
  const want = mode.toLowerCase() === 'jql' ? 'jql' : 'text';
  cy.get('[data-testid="gantt-search-mode-toggle"]').then($t => {
    const cur = $t.attr('data-mode') ?? 'text';
    if (cur !== want) {
      const label = want === 'jql' ? 'JQL' : 'Text';
      cy.get('[data-testid="gantt-quick-filters-search-mode"]')
        .find('.ant-segmented-item')
        .contains(label)
        .click({ force: true });
    }
  });
  cy.get('[data-testid="gantt-search-mode-toggle"]').should('have.attr', 'data-mode', want);
  if (want === 'jql') {
    qfNativeInput().should('be.visible');
  }
}

function parseVisibleBarKeys(): Cypress.Chainable<string[]> {
  return cy.get('[data-issue-key]', { timeout: 20000 }).then($els => {
    const keys = $els
      .toArray()
      .map(el => el.getAttribute('data-issue-key'))
      .filter((k): k is string => typeof k === 'string' && k.length > 0);
    return [...new Set(keys)];
  });
}

Given(/^the Gantt chart is displayed with bars for (.+)$/, (list: string) => {
  const keys = (list.match(/PROJ-\d+|[A-Z]+-\d+/g) ?? []).filter(Boolean);
  if (keys.length === 0) {
    throw new Error(`No issue keys found in: ${list}`);
  }
  mountIssueViewWithGantt({ withIssueDetails: true });
  for (const k of keys) {
    cy.get(`[data-issue-key="${k}"]`, { timeout: 20000 }).should('exist');
  }
});

Given('a custom quick filter exists:', (table: DataTableRows) => {
  seedCustomQuickFiltersFromTable(table);
});

Given(/^a custom quick filter exists with invalid JQL "([^"]*)":$/, (_jql: string, table: DataTableRows) => {
  void _jql;
  seedCustomQuickFiltersFromTable(table);
});

Given(/^a custom quick filter "([^"]*)" exists and is active$/, (name: string) => {
  const fixtures: Record<string, { mode: 'jql'; jql: string }> = {
    'Team Alpha': { mode: 'jql', jql: 'team = "Alpha"' },
  };
  const f = fixtures[name];
  if (!f) {
    throw new Error(`Add BDD fixture for quick filter name: ${name}`);
  }
  seedCustomQuickFiltersFromTable([{ name, ...f }] as unknown as DataTableRows);
  mountIssueViewWithGantt({ withIssueDetails: true });
  for (const k of ['PROJ-101', 'PROJ-102', 'PROJ-103', 'PROJ-104', 'PROJ-105']) {
    cy.get(`[data-issue-key="${k}"]`, { timeout: 20000 }).should('exist');
  }
  cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]')
    .filter((_, el) => (Cypress.$(el).text() as string).trim() === name)
    .first()
    .click({ force: true });
  cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]')
    .filter((_, el) => (Cypress.$(el).text() as string).trim() === name)
    .first()
    .should('have.attr', 'data-active', 'true');
});

Given(/^the search mode toggle is set to "([^"]*)"$/, (mode: string) => {
  setQuickFilterSearchMode(mode);
});

When(/^I click the chip "([^"]*)"$/, (name: string) => {
  cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]')
    .filter((_, el) => (Cypress.$(el).text() as string).trim() === name)
    .first()
    .click({ force: true });
});

When(/^I activate the chips "([^"]*)" and "([^"]*)"$/, (a: string, b: string) => {
  for (const name of [a, b]) {
    cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]')
      .filter((_, el) => (Cypress.$(el).text() as string).trim() === name)
      .first()
      .click({ force: true });
  }
});

When(
  /^I activate the chip "([^"]*)" and I type "([^"]*)" into the quick filters search input$/,
  (chip: string, text: string) => {
    cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]')
      .filter((_, el) => (Cypress.$(el).text() as string).trim() === chip)
      .first()
      .click({ force: true });
    qfInputChain().clear().type(text, { force: true });
  }
);

When(/^I open the Gantt settings modal at the "([^"]*)" section$/, (_section: string) => {
  void _section;
  cy.get('[data-testid="gantt-toolbar-settings-button"]', { timeout: 20000 }).click({ force: true });
  cy.get('[role="dialog"]', { timeout: 20000 }).should('be.visible');
  cy.get('[id*="tab-filters"]', { timeout: 20000 }).click({ force: true });
});

When(/^I open the Gantt settings modal and remove the "([^"]*)" preset$/, (presetName: string) => {
  cy.get('[data-testid="gantt-toolbar-settings-button"]', { timeout: 20000 }).click({ force: true });
  cy.get('[role="dialog"]', { timeout: 20000 }).should('be.visible');
  cy.get('[id*="tab-filters"]', { timeout: 20000 }).click({ force: true });
  const id = bddQuickFilterIdFromName(presetName);
  cy.get(`[data-testid="gantt-quick-filter-row-delete-${id}"]`, { timeout: 20000 }).click({ force: true });
});

When('I save and close the modal', () => {
  cy.get('[data-testid="gantt-settings-save"]', { timeout: 20000 }).click({ force: true });
  cy.get('[role="dialog"]', { timeout: 20000 }).should('not.exist');
});

When('I close the settings modal', () => {
  cy.get('[role="dialog"]', { timeout: 20000 })
    .find('.ant-modal-footer button')
    .contains(/^Cancel$/)
    .click({ force: true });
  cy.get('[role="dialog"]', { timeout: 20000 }).should('not.exist');
});

When(/^I close the settings modal and activate the chip "([^"]*)"$/, (chip: string) => {
  cy.get('[role="dialog"]', { timeout: 20000 })
    .find('.ant-modal-footer button')
    .contains(/^Cancel$/)
    .click({ force: true });
  cy.get('[role="dialog"]', { timeout: 20000 }).should('not.exist');
  cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]')
    .filter((_, el) => (Cypress.$(el).text() as string).trim() === chip)
    .first()
    .click({ force: true });
});

When(/^I click "Save as quick filter"$/, () => {
  cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]').then($els => {
    cy.wrap($els.length).as('ganttChipCountBeforeSave');
  });
  cy.get('[data-testid="gantt-save-as-quick-filter-button"]', { timeout: 20000 }).click({ force: true });
});

When(/^I click "Cancel" in the popover$/, () => {
  cy.get('[data-testid="gantt-quick-filters-save-cancel"]', { timeout: 20000 }).click({ force: true });
});

When('I set the quick filters JQL search to:', (table: DataTableRows) => {
  const v = (table[0] as { value: string }).value;
  if (v === undefined) {
    throw new Error('table needs | value |');
  }
  cy.wrap(null).then(() => {
    const m = globalContainer.inject(ganttQuickFiltersModelToken).model;
    m.setSearchMode('jql');
    m.setSearch(v);
    expect(m.searchQuery).to.eq(v);
  });
});

When('the page is reloaded and the Gantt chart is displayed again', () => {
  reloadGanttPreservingStorage();
  cy.get('[data-testid="gantt-chart-body"]', { timeout: 20000 }).should('be.visible');
});

Given(/^the chip "([^"]*)" is active$/, (name: string) => {
  cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]')
    .filter((_, el) => (Cypress.$(el).text() as string).trim() === name)
    .first()
    .then($t => {
      if ($t.attr('data-active') === 'true') {
        return;
      }
      cy.wrap($t).click({ force: true });
    });
});

Given(/^the search input value is "([^"]*)"$/, (value: string) => {
  qfInputChain().clear().type(value, { force: true });
});

Given('the search input value is:', (table: DataTableRows) => {
  const v = (table[0] as { value: string }).value;
  if (!v) {
    throw new Error('search input value table needs | value |');
  }
  // JQL: character-by-character typing remounts the Input (invalid → valid branch); one-shot on model.
  cy.wrap(null).then(() => {
    const m = globalContainer.inject(ganttQuickFiltersModelToken).model;
    m.setSearchMode('jql');
    m.setSearch(v);
  });
  qfInputChain().should($el => {
    expect(($el[0] as HTMLInputElement).value).to.equal(v);
  });
});

Given(/^the search mode is "([^"]*)"$/, (mode: string) => {
  setQuickFilterSearchMode(mode);
});

When(/^I set the search mode to "([^"]*)"$/, (mode: string) => {
  setQuickFilterSearchMode(mode);
});

When(/^I type "([^"]*)" into the quick filters search input$/, (value: string) => {
  qfInputChain().clear().type(value, { force: true });
});

When('I type the following into the quick filters search input:', (table: DataTableRows) => {
  const v = (table[0] as { value: string }).value;
  if (!v) {
    throw new Error('quick filters search input table needs | value |');
  }
  // Same as table Given: JQL in one shot — incremental typing remounts Ant Input (invalid/valid jql branch).
  // Always force JQL: scenario order can leave the model in "text" while the long query only works as JQL.
  cy.wrap(null).then(() => {
    const m = globalContainer.inject(ganttQuickFiltersModelToken).model;
    m.setSearchMode('jql');
    m.setSearch(v);
  });
  qfInputChain().should($el => {
    expect(($el[0] as HTMLInputElement).value, 'search query applied').to.equal(v);
  });
});

When('I clear the search input', () => {
  qfSearchInput().then($x => {
    if ($x.is('input')) {
      cy.wrap($x).clear();
    } else {
      cy.wrap($x).find('.ant-input-clear-icon').first().click({ force: true });
    }
  });
});

When(/^I click the "Clear quick filters" button$/, () => {
  cy.get('[data-testid="gantt-quick-filters-clear"]').click({ force: true });
});

When(/^I click the "Save as quick filter" button$/, () => {
  cy.get('[data-testid="gantt-save-as-quick-filter-button"]', { timeout: 20000 }).click({ force: true });
});

When(/^I edit the name to "([^"]*)" and click "Save" in the save popover$/, (name: string) => {
  cy.get('[data-testid="gantt-quick-filters-save-name"]').should('be.visible').clear().type(name, { force: true });
  cy.get('[data-testid="gantt-quick-filters-save-confirm"]').click({ force: true });
});

Then('no chip is active', () => {
  cy.get('[data-testid="gantt-quick-filters-row"] [data-active="true"]').should('not.exist');
});

Then(/^the chip "([^"]*)" is active$/, (name: string) => {
  cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]')
    .filter((_, el) => (Cypress.$(el).text() as string).trim() === name)
    .first()
    .should('have.attr', 'data-active', 'true');
});

Then(/^the Gantt toolbar contains a "Quick filters" row with a search input$/, () => {
  cy.get('[data-testid="gantt-quick-filters-row"]', { timeout: 20000 })
    .should('be.visible')
    .and('have.attr', 'aria-label', 'Quick filters');
  cy.get('[data-testid="gantt-quick-filters-search"]', { timeout: 20000 }).should('be.visible');
});

Then(/^the quick filters row contains a chip "([^"]*)"$/, (name: string) => {
  cy.get('[data-testid="gantt-quick-filters-row"]').should('contain.text', name);
});

Then('the search input is empty', () => {
  qfInputChain().should($el => {
    expect(($el[0] as HTMLInputElement).value).to.eq('');
  });
});

Then('there is no hidden count hint', () => {
  cy.get('[data-testid="gantt-quick-filters-hidden-count"]').should('not.exist');
});

Then('the hidden count hint is gone', () => {
  cy.get('[data-testid="gantt-quick-filters-hidden-count"]').should('not.exist');
});

Then(/^the toolbar shows the hidden count hint "([^"]*)"$/, (expected: string) => {
  cy.get('[data-testid="gantt-quick-filters-hidden-count"]').should('contain.text', expected);
});

Then(/^the "Clear quick filters" button is (not )?visible$/, (not: string) => {
  if ((not ?? '').includes('not')) {
    cy.get('[data-testid="gantt-quick-filters-clear"]').should('not.exist');
  } else {
    cy.get('[data-testid="gantt-quick-filters-clear"]', { timeout: 10000 }).should('be.visible');
  }
});

Then(/^the chart shows bars only for "([^"]*)"$/, (onlyKey: string) => {
  parseVisibleBarKeys().should('deep.equal', [onlyKey]);
});

Then(/^the chart shows bars only for "([^"]*)", "([^"]*)", and "([^"]*)"$/, (a: string, b: string, c: string) => {
  parseVisibleBarKeys()
    .should('have.length', 3)
    .then(keys => {
      expect(keys.sort()).to.deep.equal([a, b, c].sort());
    });
});

Then(/^the chart shows bars only for "([^"]*)" and "([^"]*)"$/, (a: string, b: string) => {
  parseVisibleBarKeys()
    .should('have.length', 2)
    .then(keys => {
      expect(keys.sort()).to.deep.equal([a, b].sort());
    });
});

Then(
  /the chart shows bars for "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", and "([^"]*)"$/,
  (a: string, b: string, c: string, d: string, e: string) => {
    parseVisibleBarKeys()
      .should('have.length', 5)
      .then(keys => {
        expect(keys.sort()).to.deep.equal([a, b, c, d, e].sort());
      });
  }
);

Then(
  /^the bars for "([^"]*)", "([^"]*)", "([^"]*)", and "([^"]*)" are hidden$/,
  (a: string, b: string, c: string, d: string) => {
    for (const k of [a, b, c, d]) {
      cy.get(`[data-issue-key="${k}"]`).should('not.exist');
    }
  }
);

Then(/^bars for "([^"]*)" and "([^"]*)" are hidden$/, (a: string, b: string) => {
  cy.get(`[data-issue-key="${a}"]`).should('not.exist');
  cy.get(`[data-issue-key="${b}"]`).should('not.exist');
});

Then('the "Save as quick filter" action is available', () => {
  qfNativeInput().should($i => {
    const v = ($i[0] as HTMLInputElement).value.trim();
    expect(v.length, 'JQL in search so Save chip can render').to.be.greaterThan(0);
  });
  cy.get('[data-testid="gantt-save-as-quick-filter-button"]', { timeout: 20000 }).should('be.visible');
});

Then(/^a new chip "([^"]*)" appears in the chips row$/, (name: string) => {
  cy.get('[data-testid="gantt-quick-filters-row"]', { timeout: 15000 }).should('contain.text', name);
});

Then(/^the search mode toggle is "([^"]*)"$/, (mode: string) => {
  const want = mode.toLowerCase() === 'jql' ? 'jql' : 'text';
  cy.get('[data-testid="gantt-search-mode-toggle"]').should('have.attr', 'data-mode', want);
});

Then(/^the search mode toggle is back to "([^"]*)"$/, (mode: string) => {
  const want = mode.toLowerCase() === 'jql' ? 'jql' : 'text';
  cy.get('[data-testid="gantt-search-mode-toggle"]').should('have.attr', 'data-mode', want);
});

When('I reload the Gantt chart', () => {
  reloadGanttPreservingStorage();
  cy.get('[data-testid="gantt-chart-body"]', { timeout: 20000 }).should('be.visible');
});

Then(/^the row for "([^"]*)" displays a JQL validation error$/, (name: string) => {
  const id = bddQuickFilterIdFromName(name);
  cy.get(`[data-testid="gantt-quick-filter-row-${id}"]`, { timeout: 20000 })
    .find('[data-testid="gantt-quick-filter-jql-error"]')
    .should('exist');
});

Then('the search input has a red error border', () => {
  cy.get('[data-testid="gantt-quick-filters-search-error"]', { timeout: 20000 })
    .should('have.attr', 'data-error', 'true')
    .find('[data-testid="gantt-quick-filters-search"]')
    .should('have.attr', 'aria-invalid', 'true');
});

Then('a tooltip on the search input shows the parser error message', () => {
  cy.get('[data-testid="gantt-quick-filters-search-error"]', { timeout: 20000 }).should('be.visible');
  cy.get('[data-testid="gantt-quick-filters-jql-parser-message"]', { timeout: 20000 }).should($el => {
    expect($el.text().trim().length, 'parser error text').to.be.greaterThan(0);
  });
});

Then(/^there is no "hidden by quick filters" hint$/, () => {
  cy.get('[data-testid="gantt-quick-filters-hidden-count"]').should('not.exist');
});

Then(/^the chip "([^"]*)" no longer appears in the toolbar$/, (name: string) => {
  cy.get('[data-toolbar-chip="true"]')
    .filter((_, el) => (Cypress.$(el).text() as string).trim() === name)
    .should('not.exist');
});

Then(/^the active filter set no longer includes "([^"]*)"$/, (name: string) => {
  const id = bddQuickFilterIdFromName(name);
  cy.wrap(null).then(() => {
    const m = globalContainer.inject(ganttQuickFiltersModelToken).model;
    expect(m.activeIds, 'pruned active ids').to.not.include(id);
  });
});

Then(
  /^all bars "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", and "([^"]*)" remain visible$/,
  (a: string, b: string, c: string, d: string, e: string) => {
    parseVisibleBarKeys()
      .should('have.length', 5)
      .then(keys => {
        expect(keys.sort()).to.deep.equal([a, b, c, d, e].sort());
      });
  }
);

Then('no error is thrown in the console', () => {
  cy.get('@bddConsoleError').should('not.have.been.called');
});

Then(/^the "Save as quick filter" button is NOT visible while the input is empty$/, () => {
  cy.wrap(null).then(() => {
    const m = globalContainer.inject(ganttQuickFiltersModelToken).model;
    m.setSearchMode('jql');
    m.setSearch('');
    expect(m.searchQuery).to.eq('');
  });
  cy.get('[data-testid="gantt-save-as-quick-filter-button"]').should('not.exist');
});

Then(/^the "Save as quick filter" button is NOT visible while the input has a JQL error$/, () => {
  cy.get('[data-testid="gantt-save-as-quick-filter-button"]').should('not.exist');
});

Then(/^the "Save as quick filter" button becomes visible$/, () => {
  cy.get('[data-testid="gantt-save-as-quick-filter-button"]', { timeout: 20000 }).should('be.visible');
});

Then('the popover closes', () => {
  cy.get('body', { timeout: 10000 }).find('.ant-popover:not(.ant-popover-hidden)').should('not.exist');
});

Then('no new chip is added', () => {
  cy.get<number>('@ganttChipCountBeforeSave').then(before => {
    cy.get('[data-testid="gantt-quick-filters-row"] [data-testid^="gantt-quick-filter-"]').should($els => {
      expect($els.length).to.eq(before);
    });
  });
});

Then('the quick filters search matches:', (table: DataTableRows) => {
  const v = (table[0] as { value: string }).value;
  if (v === undefined) {
    throw new Error('quick filters search table needs | value |');
  }
  qfInputChain().should($el => {
    expect(($el[0] as HTMLInputElement).value).to.eq(v);
  });
});

Then(/^the search mode toggle is still "([^"]*)"$/, (mode: string) => {
  const want = mode.toLowerCase() === 'jql' ? 'jql' : 'text';
  cy.get('[data-testid="gantt-search-mode-toggle"]').should('have.attr', 'data-mode', want);
});

Then('the all-hidden quick filter alert is visible', () => {
  cy.get('[data-testid="gantt-quick-filters-all-hidden"]', { timeout: 15000 }).should('be.visible');
  cy.get('[data-testid="gantt-quick-filters-all-hidden"]').should(
    'contain.text',
    'All tasks are hidden by quick filters'
  );
});

Then(/^the search input should still contain "([^"]*)"$/, (fragment: string) => {
  qfInputChain().should($el => {
    expect(($el[0] as HTMLInputElement).value).to.contain(fragment);
  });
});

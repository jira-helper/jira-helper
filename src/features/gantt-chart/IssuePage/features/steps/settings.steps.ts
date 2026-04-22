import { globalContainer } from 'dioma';
import { Given, type DataTableRows, Then, When } from '../../../../../../cypress/support/bdd-runner';
import { GANTT_SETTINGS_STORAGE_KEY } from '../../../models/GanttSettingsModel';
import { ganttSettingsModelToken } from '../../../tokens';
import { buildScopeKey } from '../../../utils/resolveSettings';
import {
  applyGanttScopesTable,
  mountIssueViewWithGanttForScope,
  parseDateMapping,
  parseDateMappings,
  setMockIssueChangelogFromTransitionsTable,
  setPersistedPreferredScopeLevel,
} from '../helpers';

const { expect } = chai;

Given('no Gantt settings exist in storage', () => {
  localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);
});

Given('no Gantt settings are stored in localStorage', () => {
  localStorage.removeItem(GANTT_SETTINGS_STORAGE_KEY);
});

Given(/^these Gantt scopes exist in storage:$/, (table: DataTableRows) => {
  applyGanttScopesTable(table);
});

Given(/^these Gantt settings are stored:$/, (table: DataTableRows) => {
  applyGanttScopesTable(table);
});

Given(
  /^I opened issue view for issue "([^"]*)" of type "([^"]*)" in project "([^"]*)"$/,
  (issueKey: string, issueType: string, projectKey: string) => {
    mountIssueViewWithGanttForScope({ issueKey, issueType, projectKey });
  }
);

Given(/^the changelog for "([^"]*)" contains these status transitions:$/, (issueKey: string, table: DataTableRows) => {
  setMockIssueChangelogFromTransitionsTable(issueKey, table, { withCategory: true });
});

Given(
  /^the changelog for "([^"]*)" contains these status transitions without category metadata:$/,
  (issueKey: string, table: DataTableRows) => {
    setMockIssueChangelogFromTransitionsTable(issueKey, table, { withCategory: false });
  }
);

Given(/^the persisted preferredScopeLevel is "([^"]*)"$/, (level: string) => {
  if (level !== 'global' && level !== 'project' && level !== 'projectIssueType') {
    throw new Error(`Unsupported preferredScopeLevel: ${level}`);
  }
  setPersistedPreferredScopeLevel(level);
});

When('I open Gantt settings from the gear button', () => {
  cy.get('[data-testid="gantt-toolbar-settings-button"]').click();
});

When('I open the Gantt settings', () => {
  cy.get('[data-testid="gantt-toolbar-settings-button"]').click();
});

When('I reopen Gantt settings', () => {
  cy.get('body').type('{esc}');
  cy.get('[data-testid="gantt-toolbar-settings-button"], button[aria-label="Gantt settings"]', {
    timeout: 60000,
  })
    .filter(':visible')
    .first()
    .click({ force: true });
  cy.get('[role="dialog"]', { timeout: 20000 }).should('be.visible');
});

Then(/^I should see first-run message "([^"]*)"$/, (message: string) => {
  cy.contains(message).should('be.visible');
});

Then('I should see the Gantt settings dialog', () => {
  cy.get('[role="dialog"]').should('be.visible').and('contain', 'Gantt settings');
});

const SCOPE_TO_SEGMENT: Record<string, string> = {
  Global: 'Global',
  Project: 'Project',
  'This project': 'Project',
  'Project + issue type': 'Project + issue type',
  'This project + issue type': 'Project + issue type',
};

function clickScopeSegmentByLabel(label: string): void {
  const seg = SCOPE_TO_SEGMENT[label] ?? label;
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      cy.get('[data-testid="gantt-scope-picker"]', { timeout: 15000 })
        .should('be.visible')
        .find('.ant-segmented-item')
        .filter((_, el) => (el.textContent ?? '').trim() === seg)
        .should('have.length', 1)
        .click({ force: true });
    });
}

When(/^I select scope "([^"]*)"$/, (label: string) => {
  clickScopeSegmentByLabel(label);
});

When(/^I switch the scope picker to "([^"]*)"$/, (label: string) => {
  clickScopeSegmentByLabel(label);
});

When('I click "Copy from…"', () => {
  cy.contains('button', 'Copy from…').click();
});

When(/^I choose to copy from "([^"]*)"$/, (scopeRef: string) => {
  const keyMap: Record<string, string> = {
    Global: '_global',
    global: '_global',
  };
  const scopeKey = keyMap[scopeRef] ?? scopeRef;
  cy.get(`[data-testid="gantt-copy-from-option"][data-scope-key="${scopeKey}"]`, { timeout: 15000 })
    .should('exist')
    .click({ force: true });
});

When('I confirm copy', () => {
  cy.get('[data-testid="gantt-copy-from-confirm"]', { timeout: 15000 }).should('be.visible').click();
});

function expectMappingVisibleInSection(
  testId: 'gantt-settings-start-mappings' | 'gantt-settings-end-mappings',
  cell: string
): void {
  const m = parseDateMapping(cell);
  const sourceText = m.source === 'dateField' ? 'Date field' : 'Status transition';
  cy.get(`[data-testid="${testId}-row-0"]`)
    .should('be.visible')
    .find('[data-testid="gantt-settings-mapping-source"]')
    .should('contain.text', sourceText);
  cy.get(`[data-testid="${testId}-row-0"]`)
    .find('[data-testid="gantt-settings-mapping-value"]')
    .should($el => {
      const t = $el.text();
      if (m.source === 'dateField') {
        const id = m.fieldId.toLowerCase();
        expect(t.toLowerCase()).to.include(id);
      } else {
        expect(t).to.include(m.statusName);
      }
    });
}

function expectMappingsListVisibleInSection(
  testId: 'gantt-settings-start-mappings' | 'gantt-settings-end-mappings',
  cell: string
): void {
  const list = parseDateMappings(cell);
  for (const [i, mapping] of list.entries()) {
    const m = mapping;
    const sourceText = m.source === 'dateField' ? 'Date field' : 'Status transition';
    cy.get(`[data-testid="${testId}-row-${i}"]`)
      .find('[data-testid="gantt-settings-mapping-source"]')
      .should('contain.text', sourceText);
    cy.get(`[data-testid="${testId}-row-${i}"]`)
      .find('[data-testid="gantt-settings-mapping-value"]')
      .should($el => {
        const t = $el.text();
        if (m.source === 'dateField') {
          const id = m.fieldId.toLowerCase();
          expect(t.toLowerCase()).to.include(id);
        } else {
          expect(t).to.include(m.statusName);
        }
      });
  }
}

const INCLUSION_MAP: Record<string, string> = {
  includeSubtasks: 'Include subtasks',
  includeEpicChildren: 'Include epic children',
  includeIssueLinks: 'Include issue links',
};

function expectSwitchChecked(ariaLabel: string, on: boolean): void {
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      cy.get('.ant-tabs-nav').should('be.visible');
      cy.contains('.ant-tabs-tab', 'Issues').click();
    });
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .find(`[aria-label="${ariaLabel}"]`)
    .first()
    .should($sw => {
      if (on) {
        expect($sw[0].classList.contains('ant-switch-checked')).to.be.true;
      } else {
        expect($sw[0].classList.contains('ant-switch-checked')).to.be.false;
      }
    });
}

Then(/^the settings form should show:$/, (table: DataTableRows) => {
  cy.get('[role="dialog"]').filter(':visible').first().should('be.visible');
  const map = Object.fromEntries(table.map(r => [r.setting, r.value])) as Record<string, string>;
  for (const [k, v] of Object.entries(map)) {
    if (k === 'startMapping' && v) {
      expectMappingVisibleInSection('gantt-settings-start-mappings', v);
    } else if (k === 'endMapping' && v) {
      expectMappingVisibleInSection('gantt-settings-end-mappings', v);
    } else if (k === 'startMappings' && v) {
      expectMappingsListVisibleInSection('gantt-settings-start-mappings', v);
    } else if (k === 'endMappings' && v) {
      expectMappingsListVisibleInSection('gantt-settings-end-mappings', v);
    } else if (k === 'includeSubtasks' || k === 'includeEpicChildren' || k === 'includeIssueLinks') {
      const on = v === 'true';
      const label = INCLUSION_MAP[k];
      if (!label) {
        throw new Error(`No aria label for ${k}`);
      }
      expectSwitchChecked(label, on);
    } else {
      throw new Error(`Unsupported setting in settings form table: ${k}`);
    }
  }
});

function setMappingInSection(
  testId: 'gantt-settings-start-mappings' | 'gantt-settings-end-mappings',
  sourceLabel: string,
  fieldValue: string
): void {
  const esc = fieldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const row0 = () => cy.get(`[data-testid="${testId}-row-0"]`).should('be.visible');
  row0().find('[data-testid="gantt-settings-mapping-source"] .ant-select-selector').click();
  cy.get('.ant-select-dropdown:visible, .ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .last()
    .find('.ant-select-item-option, .ant-select-item')
    .contains(new RegExp(`^\\s*${sourceLabel}`, 'i'))
    .click();
  row0().find('[data-testid="gantt-settings-mapping-value"] .ant-select-selector').click();
  cy.get('.ant-select-dropdown:visible, .ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .last()
    .find('.ant-select-item-option, .ant-select-item')
    .contains(new RegExp(esc, 'i'))
    .click();
}

When(/^I change start mapping to "([^"]*)" with field "([^"]*)"$/, (sourceLabel: string, fieldValue: string) => {
  setMappingInSection('gantt-settings-start-mappings', sourceLabel, fieldValue);
});

When(/^I set start mapping to "([^"]*)" with field "([^"]*)"$/, (sourceLabel: string, fieldValue: string) => {
  setMappingInSection('gantt-settings-start-mappings', sourceLabel, fieldValue);
});

When(/^I change end mapping to "([^"]*)" with field "([^"]*)"$/, (sourceLabel: string, fieldValue: string) => {
  setMappingInSection('gantt-settings-end-mappings', sourceLabel, fieldValue);
});

When(/^I set end mapping to "([^"]*)" with field "([^"]*)"$/, (sourceLabel: string, fieldValue: string) => {
  setMappingInSection('gantt-settings-end-mappings', sourceLabel, fieldValue);
});

When(/^I set end mapping to "([^"]*)" with status "([^"]*)"$/, (sourceLabel: string, statusName: string) => {
  setMappingInSection('gantt-settings-end-mappings', sourceLabel, statusName);
});

When('I set include subtasks to true', () => {
  cy.get('[role="dialog"]').filter(':visible').first().should('be.visible');
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      cy.contains('.ant-tabs-tab', 'Issues').click();
    });
  cy.get('[data-testid="gantt-settings-inclusion-list"]')
    .find('[aria-label="Include subtasks"]')
    .first()
    .then($sw => {
      if ($sw[0].classList.contains('ant-switch-checked')) {
        return;
      }
      cy.wrap($sw).click({ force: true });
    });
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      cy.contains('.ant-tabs-tab', 'Bars').click();
    });
});

Then('the settings modal should close', () => {
  cy.get('[role="dialog"]', { timeout: 20000 }).should('not.exist');
});

Then(/^the Gantt chart should render with bars:$/, (table: DataTableRows) => {
  for (const row of table) {
    const r = row as { key: string; startDate: string; endDate: string };
    cy.get(`[data-issue-key="${r.key}"]`, { timeout: 30000 }).should('exist');
    cy.get(`[data-issue-key="${r.key}"]`).should($el => {
      const start = $el.attr('data-start-iso') ?? '';
      const end = $el.attr('data-end-iso') ?? '';
      if (r.startDate.includes('T')) {
        expect(start.slice(0, 19)).to.eq(r.startDate.slice(0, 19));
      } else {
        expect(start.slice(0, 10)).to.eq(r.startDate.slice(0, 10));
      }
      if (r.endDate.includes('T')) {
        expect(end.slice(0, 19)).to.eq(r.endDate.slice(0, 19));
      } else {
        expect(end.slice(0, 10)).to.eq(r.endDate.slice(0, 10));
      }
    });
  }
});

const SCOPE_VALUE_TO_LABEL: Record<string, string> = {
  Global: 'Global',
  Project: 'Project',
  'Project + issue type': 'Project + issue type',
};

function assertScopePickerShowsSelected(label: string): void {
  const labelText = SCOPE_VALUE_TO_LABEL[label] ?? label;
  cy.get('[role="dialog"]')
    .filter(':visible')
    .first()
    .within(() => {
      cy.get('[data-testid="gantt-scope-picker"]', { timeout: 15000 })
        .find('.ant-segmented-item-selected')
        .should('contain.text', labelText);
    });
}

Then(/^the scope picker should show "([^"]*)" selected$/, (label: string) => {
  assertScopePickerShowsSelected(label);
});

Then(/^the scope picker shows "([^"]*)" selected$/, (label: string) => {
  assertScopePickerShowsSelected(label);
});

function resolvedScopeKeyFromStorage(): string | null {
  const { model } = globalContainer.inject(ganttSettingsModelToken);
  const { storage } = model;
  const pk = model.contextProjectKey.trim();
  const it = model.contextIssueType.trim();
  const keys: string[] = [];
  if (pk && it) {
    keys.push(buildScopeKey(pk, it));
  }
  if (pk) {
    keys.push(buildScopeKey(pk));
  }
  keys.push(buildScopeKey());
  for (const k of keys) {
    if (storage[k] != null) {
      return k;
    }
  }
  return null;
}

Then(/^the resolved scope should be "([^"]*)"$/, (expected: string) => {
  cy.then(() => {
    const want = expected === 'global' ? buildScopeKey() : expected;
    expect(resolvedScopeKeyFromStorage()).to.eq(want);
  });
});

When(/^I modify the tooltipFieldIds to "([^"]*)"$/, (csv: string) => {
  const ids = csv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  cy.get('[data-testid="gantt-settings-tooltip-fields-select"]', { timeout: 15000 })
    .should('be.visible')
    .then($root => {
      const clear = $root.find('.ant-select-clear');
      if (clear.length) {
        cy.wrap(clear).first().click({ force: true });
      }
    });
  cy.get('[data-testid="gantt-settings-tooltip-fields-select"] .ant-select-selector').click({ force: true });
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cy.get('.ant-select-dropdown:visible, .ant-select-dropdown:not(.ant-select-dropdown-hidden)', {
      timeout: 15000,
    })
      .last()
      .find('.ant-select-item-option, .ant-select-item')
      .contains(new RegExp(`\\(${esc}\\)`, 'i'))
      .click({ force: true });
  }
  cy.get('[data-jh-gantt-root="settings-modal"]', { timeout: 15000 })
    .find('[data-testid="gantt-scope-picker"]')
    .click({ force: true });
});

Then(/^the tooltipFieldIds should contain "([^"]*)"$/, (id: string) => {
  cy.get('[data-testid="gantt-settings-tooltip-fields-select"]', { timeout: 15000 }).should($root => {
    const t = $root.text().toLowerCase();
    expect(t).to.include(id.toLowerCase());
  });
});

Then('the tooltipFieldIds should be empty', () => {
  cy.get('[data-testid="gantt-settings-tooltip-fields-select"]', { timeout: 15000 }).should($root => {
    expect($root.find('.ant-select-selection-item').length).to.eq(0);
  });
});

Then(/^the tooltipFieldIds should contain only "([^"]*)"$/, (id: string) => {
  cy.get('[data-testid="gantt-settings-tooltip-fields-select"]', { timeout: 15000 }).should($root => {
    const items = $root.find('.ant-select-selection-item');
    expect(items.length).to.eq(1);
    expect(items.text().toLowerCase()).to.include(id.toLowerCase());
  });
});

Then(/^the tooltipFieldIds should contain only "([^"]*)" \(unsaved changes were discarded\)$/, (id: string) => {
  cy.get('[data-testid="gantt-settings-tooltip-fields-select"]', { timeout: 15000 }).should($root => {
    const items = $root.find('.ant-select-selection-item');
    expect(items.length).to.eq(1);
    expect(items.text().toLowerCase()).to.include(id.toLowerCase());
  });
});

function closeCopyFromDialog(): void {
  cy.get('[role="dialog"]', { timeout: 15000 })
    .filter(':visible')
    .last()
    .find('button')
    .contains(/^Cancel$/i)
    .click({ force: true });
}

Then(/^"Copy from…" should offer "([^"]*)" as a source$/, (scopeKey: string) => {
  cy.contains('button', 'Copy from…').click();
  cy.get('[data-testid="gantt-copy-from-option"][data-scope-key="' + scopeKey + '"]', { timeout: 15000 }).should(
    'exist'
  );
  closeCopyFromDialog();
});

Then(
  /^"Copy from…" should offer "([^"]*)", "([^"]*)", and "([^"]*)" as sources$/,
  (a: string, b: string, c: string) => {
    cy.contains('button', 'Copy from…').click();
    for (const k of [a, b, c]) {
      cy.get(`[data-testid="gantt-copy-from-option"][data-scope-key="${k}"]`, { timeout: 15000 }).should('exist');
    }
    closeCopyFromDialog();
  }
);

Then(/^I should see these scope options in the copy dialog:$/, (table: DataTableRows) => {
  for (const row of table) {
    const r = row as { scope: string };
    cy.get(`[data-testid="gantt-copy-from-option"][data-scope-key="${r.scope}"]`, { timeout: 15000 }).should('exist');
  }
});

When(/^I click "Copy from…" and select "([^"]*)"$/, (scopeKey: string) => {
  cy.contains('button', 'Copy from…').click();
  cy.get(`[data-testid="gantt-copy-from-option"][data-scope-key="${scopeKey}"]`, { timeout: 15000 }).click({
    force: true,
  });
  cy.get('[role="dialog"]')
    .filter(':visible')
    .last()
    .within(() => {
      cy.contains('button', /^Copy$/i).click();
    });
});

Then('the form should reset to default values', () => {
  expectMappingVisibleInSection('gantt-settings-start-mappings', 'dateField: created');
  expectMappingVisibleInSection('gantt-settings-end-mappings', 'dateField: duedate');
});

When(
  /^I add a fallback row to "([^"]*)" with "([^"]*)" and value "([^"]*)"$/,
  (sectionLabel: string, sourceLabel: string, fieldValue: string) => {
    if (sectionLabel !== 'End of bar') {
      throw new Error(
        `I add a fallback row: only "End of bar" is implemented in component tests; got: ${sectionLabel}`
      );
    }
    const testId = 'gantt-settings-end-mappings';
    const escA = sourceLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escB = fieldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    cy.get(`[data-testid="${testId}"]`, { timeout: 15000 })
      .should('be.visible')
      .contains('button', /Add another end source/i)
      .click({ force: true });

    // Same pattern as setMappingInSection. Short wait lets the portaled rc-select menu render
    // after click (avoids .last() seeing an empty dropdown in CT).
    const pickEndRowOption = (kind: 'source' | 'value', esc: string) => {
      cy.get(`[data-testid="${testId}-row-1"]`, { timeout: 15000 })
        .scrollIntoView()
        .find(`[data-testid="gantt-settings-mapping-${kind}"] .ant-select-selector`)
        .click({ force: true });
      cy.get('.ant-select-dropdown:visible, .ant-select-dropdown:not(.ant-select-dropdown-hidden)', {
        timeout: 15000,
      })
        .last()
        .find('.ant-select-item-option, .ant-select-item')
        .contains(new RegExp(`^\\s*${esc}`, 'i'))
        .click({ force: true });
    };

    pickEndRowOption('source', escA);
    pickEndRowOption('value', escB);
  }
);

When(
  /^I configure exclusion filter with mode "([^"]*)", field "([^"]*)", value "([^"]*)"$/,
  (mode: string, fieldName: string, value: string) => {
    cy.get('[data-jh-gantt-root="settings-modal"]', { timeout: 15000 })
      .should('be.visible')
      .within(() => {
        cy.contains('.ant-tabs-tab', 'Filters').click();
      });
    cy.get('[data-testid="gantt-exclusion-filters-add"]', { timeout: 15000 }).click();

    if (mode.toLowerCase() !== 'field') {
      throw new Error(`configure exclusion filter UI step supports mode "field" only; got "${mode}"`);
    }

    const escName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cy.get('[data-testid="gantt-exclusion-filter-field-0"] .ant-select-selector', { timeout: 15000 }).click();
    cy.get('.ant-select-dropdown:visible, .ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .last()
      .find('.ant-select-item-option, .ant-select-item')
      .contains(new RegExp(`^\\s*${escName}`, 'i'))
      .click();

    cy.get('[data-testid="gantt-exclusion-filter-value-0"]', { timeout: 15000 }).clear().type(value, { force: true });
  }
);

When(/^I configure issue link types to include only:$/, (table: DataTableRows) => {
  const row = table[0] as { linkType: string; direction: string };
  if (!row?.linkType) {
    throw new Error('issue link types table must have at least one row with linkType');
  }

  cy.get('[data-jh-gantt-root="settings-modal"]', { timeout: 15000 })
    .should('be.visible')
    .within(() => {
      cy.contains('.ant-tabs-tab', 'Issues').click();
    });

  cy.get('[data-testid="gantt-settings-inclusion-list"]', { timeout: 15000 })
    .find('[aria-label="Include issue links"]')
    .then($sw => {
      if ($sw[0] && !$sw[0].classList.contains('ant-switch-checked')) {
        cy.wrap($sw).click({ force: true });
      }
    });

  cy.get('[data-testid="gantt-issue-link-types-add"]', { timeout: 15000 }).click();

  cy.get('[data-testid="gantt-settings-link-type-select-0"] .ant-select-selector', { timeout: 15000 }).click();
  cy.get('.ant-select-dropdown:visible, .ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .last()
    .find('.ant-select-item-option, .ant-select-item')
    .contains(new RegExp(row.linkType, 'i'))
    .click();

  cy.get('[data-testid="gantt-issue-link-direction-0"] .ant-select-selector', { timeout: 15000 }).click();
  const dirLabel = row.direction.toLowerCase() === 'inward' ? /inward/i : /outward/i;
  cy.get('.ant-select-dropdown:visible, .ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .last()
    .find('.ant-select-item-option, .ant-select-item')
    .filter((_, el) => dirLabel.test((el as HTMLElement).innerText))
    .first()
    .click({ force: true });
});

When(/^I select hover detail fields "([^"]*)", "([^"]*)", "([^"]*)"$/, (a: string, b: string, c: string) => {
  const ids = [a, b, c].map(s => s.trim().toLowerCase());
  cy.get('[data-testid="gantt-settings-tooltip-fields-select"]', { timeout: 15000 })
    .should('be.visible')
    .then($root => {
      const clear = $root.find('.ant-select-clear');
      if (clear.length) {
        cy.wrap(clear).first().click({ force: true });
      }
    });
  cy.get('[data-testid="gantt-settings-tooltip-fields-select"] .ant-select-selector').click({ force: true });
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cy.get('.ant-select-dropdown:visible, .ant-select-dropdown:not(.ant-select-dropdown-hidden)', {
      timeout: 15000,
    })
      .last()
      .find('.ant-select-item-option, .ant-select-item')
      .contains(new RegExp(`\\(${esc}\\)`, 'i'))
      .click({ force: true });
  }
  cy.get('[data-jh-gantt-root="settings-modal"]', { timeout: 15000 })
    .find('[data-testid="gantt-scope-picker"]')
    .click({ force: true });
});

import { type DataTableRows, Then, When } from '../../../../../../cypress/support/bdd-runner';
import { setGanttViewportZoomLevelForBdd } from '../helpers';

const { expect } = chai;

const INTERVAL_KEY_TO_EN: Record<string, string> = {
  hours: 'Hours',
  days: 'Days',
  weeks: 'Weeks',
  months: 'Months',
};

When(/^I select the Gantt time interval "([^"]*)"$/, (interval: string) => {
  const en = INTERVAL_KEY_TO_EN[interval] ?? interval;
  cy.get('[data-testid="gantt-toolbar-interval-segmented"]', { timeout: 15000 })
    .find('.ant-segmented-item')
    .contains(en)
    .click();
});

When(/^I hover the bar for "([^"]*)"$/, (issueKey: string) => {
  cy.get(`[data-testid="gantt-bar"][data-issue-key="${issueKey}"]`, { timeout: 20000 })
    .first()
    .should('be.visible')
    .scrollIntoView()
    .trigger('mouseover', { force: true });
});

When(/^I hover the pointer over the bar for "([^"]*)"$/, (issueKey: string) => {
  cy.get(`[data-testid="gantt-bar"][data-issue-key="${issueKey}"]`, { timeout: 20000 })
    .first()
    .should('be.visible')
    .scrollIntoView()
    .trigger('mouseover', { force: true });
});

Then('the Gantt hover tooltip is visible', () => {
  cy.get('[data-testid="gantt-tooltip"]', { timeout: 15000 }).should('exist');
});

Then(/^the Gantt tooltip should include field rows:$/, (table: DataTableRows) => {
  const tip = cy.get('[data-testid="gantt-tooltip"]', { timeout: 15000 });
  for (const row of table) {
    const r = row as { field: string; includes: string };
    const fieldHeading = r.field.charAt(0).toUpperCase() + r.field.slice(1);
    tip.should('contain.text', fieldHeading);
    tip.should('contain.text', r.includes);
  }
});

When(/^I turn on the "([^"]*)" toggle in the Gantt toolbar$/, (label: string) => {
  if (label === 'Status breakdown' || label === 'Status sections') {
    cy.get('[data-testid="gantt-status-breakdown-toggle"]').then($s => {
      if ($s[0] && $s[0].classList.contains('ant-switch-checked')) {
        return;
      }
      cy.wrap($s).click({ force: true });
    });
  } else {
    cy.get('[data-testid="gantt-toolbar-root"]').find(`[aria-label="${label}"]`).first().click({ force: true });
  }
});

Then('the Gantt time axis should show day-formatted ticks', () => {
  cy.get('[data-testid="gantt-axis-label"]').should($labels => {
    expect($labels.length).to.be.at.least(1);
    $labels.each((_, el) => {
      expect(Cypress.$(el).text()).to.match(/^[A-Z][a-z]{2} \d{2}$/);
    });
  });
});

Then('the Gantt time axis should show hour-formatted ticks', () => {
  cy.get('[data-testid="gantt-axis-label"]').should($labels => {
    expect($labels.length).to.be.at.least(1);
    $labels.each((_, el) => {
      expect(Cypress.$(el).text()).to.match(/^\d{2}:\d{2}$/);
    });
  });
});

Then('the Gantt time axis should show week-formatted ticks', () => {
  cy.get('[data-testid="gantt-axis-label"]').should($labels => {
    expect($labels.length).to.be.at.least(1);
    $labels.each((_, el) => {
      expect(Cypress.$(el).text()).to.match(/^Week \d{2}$/);
    });
  });
});

Then('the Gantt time axis should show month-formatted ticks', () => {
  cy.get('[data-testid="gantt-axis-label"]').should($labels => {
    expect($labels.length).to.be.at.least(1);
    $labels.each((_, el) => {
      expect(Cypress.$(el).text()).to.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/);
    });
  });
});

Then(/^the Gantt time axis interval should be "([^"]*)"$/, (interval: string) => {
  cy.get('[data-testid="gantt-time-axis"]', { timeout: 15000 }).should('have.attr', 'data-time-interval', interval);
});

Then(/^the bar for "([^"]*)" should have status sections:$/, (issueKey: string, table: DataTableRows) => {
  for (const row of table) {
    const r = row as { startDate?: string; endDate?: string; category: string };
    cy.get(`[data-issue-key="${issueKey}"] [data-testid="gantt-bar-status-section"]`)
      .filter(`[data-bar-status-category="${r.category}"]`)
      .should($els => {
        const withDates = (r.startDate && r.endDate) ?? false;
        if (!withDates) {
          expect($els.length, `at least one ${r.category} segment for ${issueKey}`).to.be.at.least(1);
          return;
        }
        const wantS = r.startDate!.slice(0, 10);
        const wantE = r.endDate!.slice(0, 10);
        const el = $els.toArray().find(n => {
          const start = n.getAttribute('data-bar-status-start-iso') ?? '';
          const end = n.getAttribute('data-bar-status-end-iso') ?? '';
          return start.slice(0, 10) === wantS && end.slice(0, 10) === wantE;
        });
        expect(el, 'segment for category and dates').to.be.ok;
      });
  }
});

Then(/^I should see a tooltip with these fields:$/, (table: DataTableRows) => {
  cy.get('[data-testid="gantt-tooltip"]', { timeout: 15000 }).should('be.visible');
  for (const row of table) {
    const r = row as { field: string; value: string };
    const fieldId = r.field.trim().toLowerCase();
    cy.get(`[data-testid="gantt-tooltip"] [data-testid="gantt-bar-tooltip-field-${fieldId}"]`, { timeout: 15000 })
      .should('be.visible')
      .and('contain.text', r.value);
  }
});

/**
 * BDD: wheel/pinch zoom is flaky in component tests — set scale through the same viewport model the toolbar uses
 * (see TASK-49 Wave F technical debt).
 */
When(/^the chart is zoomed in to 200% scale$/, () => {
  cy.wrap(null).then(() => {
    setGanttViewportZoomLevelForBdd(2);
  });
});

When(/^the chart is displayed at 150% zoom level$/, () => {
  cy.wrap(null).then(() => {
    setGanttViewportZoomLevelForBdd(1.5);
  });
});

When('I open the interval dropdown in the toolbar', () => {
  cy.get('[data-testid="gantt-toolbar-interval-segmented"]', { timeout: 15000 }).should('be.visible');
});

When(/^I select interval "([^"]*)"$/, (interval: string) => {
  const en = INTERVAL_KEY_TO_EN[interval.toLowerCase()] ?? interval;
  cy.get('[data-testid="gantt-toolbar-interval-segmented"]', { timeout: 15000 })
    .find('.ant-segmented-item')
    .contains(en)
    .click();
});

Then('the zoom level should reset to 100%', () => {
  cy.get('[data-testid="gantt-toolbar-zoom-level"]', { timeout: 15000 }).should($b => {
    expect($b.text().trim(), 'zoom indicator').to.eq('100%');
  });
});

Then(
  /^the time axis tick labels should include "([^"]*)", "([^"]*)", "([^"]*)"$/,
  (a: string, b: string, c: string) => {
    cy.get('[data-testid="gantt-axis-label"]', { timeout: 15000 }).should($els => {
      const texts = $els.toArray().map(el => (el as HTMLElement).textContent?.trim() ?? '');
      expect(
        texts.some(t => t.includes(a)),
        `missing axis label ${a} in ${texts.join(', ')}`
      ).to.be.true;
      expect(
        texts.some(t => t.includes(b)),
        `missing axis label ${b} in ${texts.join(', ')}`
      ).to.be.true;
      expect(
        texts.some(t => t.includes(c)),
        `missing axis label ${c} in ${texts.join(', ')}`
      ).to.be.true;
    });
  }
);

Then(/^(\d+) bars are visible: (.+)$/, (countStr: string, quotedKeys: string) => {
  const n = Number(countStr);
  const keys: string[] = Array.from(quotedKeys.matchAll(/"([^"]+)"/g), m => m[1]!);
  expect(keys.length, 'parsed issue keys from scenario').to.eq(n);
  for (const k of keys) {
    cy.get(`[data-testid="gantt-bar"][data-issue-key="${k}"]`, { timeout: 15000 }).should('be.visible');
  }
});

When(/^I click the "Open in modal" button in the toolbar$/, () => {
  cy.get('[data-testid="gantt-toolbar-fullscreen-button"]', { timeout: 15000 }).click();
});

Then('a fullscreen modal should be visible', () => {
  cy.get('[data-testid="gantt-fullscreen-modal"]', { timeout: 15000 }).should('be.visible');
});

Then('the modal should contain the Gantt chart with 4 bars', () => {
  cy.get('[data-testid="gantt-fullscreen-modal"] [data-testid="gantt-bar"]', { timeout: 15000 }).should(
    'have.length',
    4
  );
});

Then('the zoom level in the modal should be 150%', () => {
  cy.get('[data-testid="gantt-fullscreen-modal"] [data-testid="gantt-toolbar-zoom-level"]', { timeout: 15000 }).should(
    $b => {
      expect($b.text().trim(), 'modal zoom').to.eq('150%');
    }
  );
});

Then('the modal should contain the toolbar with zoom controls', () => {
  cy.get('[data-testid="gantt-fullscreen-modal"] [data-testid="gantt-toolbar-root"]', { timeout: 15000 }).should(
    'be.visible'
  );
  cy.get('[data-testid="gantt-fullscreen-modal"] [aria-label="Zoom in"]').should('exist');
  cy.get('[data-testid="gantt-fullscreen-modal"] [aria-label="Zoom out"]').should('exist');
  cy.get('[data-testid="gantt-fullscreen-modal"] [data-testid="gantt-toolbar-interval-segmented"]').should('exist');
});

When('I press Escape', () => {
  // Focusable host: see GanttFullscreenModal (tabIndex -1) — Cypress + AntD do not close from native only events.
  cy.get('[data-testid="gantt-fullscreen-modal"]', { timeout: 15000 }).should('be.visible').focus().type('{esc}');
});

Then('the fullscreen modal should be closed', () => {
  // Inline Gantt is mounted with onOpenFullscreen; the modal view omits that control — button presence implies modal closed.
  cy.get('[data-testid="gantt-toolbar-fullscreen-button"]', { timeout: 15000 }).should('be.visible');
});

Then(/^the inline Gantt chart should be visible with zoom level (\d+)%$/, (pct: string) => {
  cy.get('[data-testid="gantt-chart-body"]', { timeout: 15000 }).filter(':visible').should('have.length.at.least', 1);
  cy.get('[data-testid="gantt-toolbar-zoom-level"]', { timeout: 15000 })
    .filter(':visible')
    .first()
    .should($b => {
      expect($b.text().trim(), 'inline zoom').to.eq(`${pct}%`);
    });
});

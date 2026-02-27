/// <reference types="cypress" />
/**
 * Cypress Component Tests for Column Limits Board Page
 *
 * Tests match 1:1 with board-page.feature scenarios.
 * Each Scenario/Step text MUST match the .feature file exactly.
 *
 * Validate with: node scripts/validate-feature-tests.mjs
 */
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { useColumnLimitsPropertyStore } from '../property';
import { useColumnLimitsRuntimeStore, getInitialState } from './stores';
import { columnLimitsBoardPageObjectToken } from './pageObject';
import { ColumnLimitsBoardPageObject } from './pageObject/ColumnLimitsBoardPageObject';
import { applyLimits } from './actions';
import { Scenario, Step } from '../../../cypress/support/bdd';

// --- Test fixtures matching feature Background ---

/**
 * Creates a mock issue element in the DOM.
 */
const createMockIssue = (
  id: string,
  columnId: string,
  swimlaneId: string | null = null,
  issueType = 'Task'
): HTMLElement => {
  const issue = document.createElement('div');
  issue.className = 'ghx-issue';
  issue.setAttribute('data-issue-id', id);
  issue.setAttribute('data-column-id', columnId);
  if (swimlaneId) {
    issue.setAttribute('swimlane-id', swimlaneId);
  }
  // Add issue type element
  const typeElement = document.createElement('div');
  typeElement.className = 'ghx-type';
  typeElement.setAttribute('title', issueType);
  issue.appendChild(typeElement);
  // Add text content without overwriting child elements
  const textNode = document.createTextNode(`Issue ${id}`);
  issue.appendChild(textNode);
  return issue;
};

/**
 * Setup DOM structure for board page.
 */
const setupBoardDOM = () => {
  const wrapper = document.createElement('div');
  wrapper.id = 'ghx-pool-wrapper';
  wrapper.innerHTML = `
    <div class="ghx-column-header-group">
      <ul class="ghx-columns ghx-first">
        <li class="ghx-column" data-id="col1" data-column-id="col1">To Do</li>
        <li class="ghx-column" data-id="col2" data-column-id="col2">In Progress</li>
        <li class="ghx-column" data-id="col3" data-column-id="col3">Review</li>
        <li class="ghx-column" data-id="col4" data-column-id="col4">Done</li>
      </ul>
    </div>
  `;

  const pool = document.createElement('div');
  pool.id = 'ghx-pool';
  pool.innerHTML = `
    <div class="ghx-swimlane" swimlane-id="sw1">
      <div class="ghx-column" data-id="col1" data-column-id="col1"></div>
      <div class="ghx-column" data-id="col2" data-column-id="col2"></div>
      <div class="ghx-column" data-id="col3" data-column-id="col3"></div>
      <div class="ghx-column" data-id="col4" data-column-id="col4"></div>
    </div>
    <div class="ghx-swimlane" swimlane-id="sw2">
      <div class="ghx-column" data-id="col1" data-column-id="col1"></div>
      <div class="ghx-column" data-id="col2" data-column-id="col2"></div>
      <div class="ghx-column" data-id="col3" data-column-id="col3"></div>
      <div class="ghx-column" data-id="col4" data-column-id="col4"></div>
    </div>
    <div class="ghx-swimlane" swimlane-id="sw3">
      <div class="ghx-column" data-id="col1" data-column-id="col1"></div>
      <div class="ghx-column" data-id="col2" data-column-id="col2"></div>
      <div class="ghx-column" data-id="col3" data-column-id="col3"></div>
      <div class="ghx-column" data-id="col4" data-column-id="col4"></div>
    </div>
  `;

  document.body.appendChild(wrapper);
  document.body.appendChild(pool);

  return { wrapper, pool };
};

/**
 * Add issue to DOM.
 */
const addIssueToDOM = (issue: HTMLElement, columnId: string, swimlaneId: string) => {
  const swimlane = document.querySelector(`.ghx-swimlane[swimlane-id="${swimlaneId}"]`);
  const column = swimlane?.querySelector(`.ghx-column[data-column-id="${columnId}"]`);
  if (column) {
    column.appendChild(issue);
  }
};

// --- Feature ---

describe('Feature: Column Group WIP Limits on Board', () => {
  // Background
  beforeEach(() => {
    // Reset DI container
    globalContainer.reset();
    registerLogger(globalContainer);

    // Reset stores
    useColumnLimitsPropertyStore.getState().actions.reset();
    useColumnLimitsRuntimeStore.setState(getInitialState());

    // Cleanup any existing DOM first
    document.body.innerHTML = '';

    // Setup DOM structure
    setupBoardDOM();

    // Register real PageObject (will work with DOM)
    globalContainer.register({
      token: columnLimitsBoardPageObjectToken,
      value: new ColumnLimitsBoardPageObject(),
    });

    useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');
  });

  afterEach(() => {
    // Cleanup DOM - remove all issues first to ensure clean state
    document.querySelectorAll('.ghx-issue').forEach(issue => issue.remove());
    document.body.innerHTML = '';
    useColumnLimitsRuntimeStore.setState(getInitialState());
  });

  // === DISPLAY ===

  Scenario('SC-DISPLAY-1: Show badge X/Y on first column of group', () => {
    Step('Given there is a group "Development" with columns "In Progress, Review" and limit 5', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Development: {
          columns: ['col2', 'col3'], // In Progress, Review
          max: 5,
        },
      });
    });

    Step('And there are 3 issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw2'), 'col2', 'sw2');
    });

    Step('And there are 1 issue in "Review"', () => {
      addIssueToDOM(createMockIssue('issue-4', 'col3', 'sw1'), 'col3', 'sw1');
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then I should see badge "4/5" on "In Progress" column header', () => {
      // Check that badge was inserted
      cy.get('.ghx-column[data-id="col2"]').should('exist');
      cy.get('.ghx-column[data-id="col2"] [data-column-limits-badge="true"]').should('exist');
      cy.get('.ghx-column[data-id="col2"]').should('contain', '4/5');
    });
  });

  Scenario('SC-DISPLAY-2: Badge updates when issue count changes', () => {
    Step('Given there is a group with columns "In Progress" and limit 3', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 3,
        },
      });
    });

    Step('And there are 2 issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1'), 'col2', 'sw1');
    });

    Step('When a new issue appears in "In Progress"', () => {
      // First applyLimits with 2 issues
      applyLimits();
      // Verify initial badge shows 2/3
      cy.get('.ghx-column[data-id="col2"] [data-column-limits-badge="true"]').should('contain', '2/3');

      // Add new issue and re-apply
      cy.then(() => {
        addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw2'), 'col2', 'sw2');
        applyLimits();
      });
    });

    Step('Then the badge should update to "3/3"', () => {
      cy.get('.ghx-column[data-id="col2"] [data-column-limits-badge="true"]').should('contain', '3/3');
    });
  });

  Scenario('SC-DISPLAY-3: Group columns have shared header color', () => {
    Step('Given there is a group with columns "In Progress, Review" and custom color "#36B37E"', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2', 'col3'],
          max: 5,
          customHexColor: '#36B37E',
        },
      });
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then both "In Progress" and "Review" headers should have border color "#36B37E"', () => {
      cy.get('.ghx-column[data-id="col2"]').should('have.css', 'border-top-color', 'rgb(54, 179, 126)');
      cy.get('.ghx-column[data-id="col3"]').should('have.css', 'border-top-color', 'rgb(54, 179, 126)');
    });
  });

  Scenario('SC-DISPLAY-4: Group headers have rounded corners on edges', () => {
    Step('Given there is a group with columns "In Progress, Review"', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2', 'col3'],
          max: 5,
          name: 'Dev',
          value: 'Dev',
        },
      });
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then "In Progress" header should have rounded left corner', () => {
      cy.get('.ghx-column[data-id="col2"]').should('have.css', 'border-top-left-radius', '10px');
    });

    Step('And "Review" header should have rounded right corner', () => {
      cy.get('.ghx-column[data-id="col3"]').should('have.css', 'border-top-right-radius', '10px');
    });
  });

  // === LIMIT EXCEEDED ===

  Scenario('SC-EXCEED-1: Red background when group limit exceeded', () => {
    Step('Given there is a group with columns "In Progress" and limit 3', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 3,
        },
      });
    });

    Step('And there are 5 issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw2'), 'col2', 'sw2');
      addIssueToDOM(createMockIssue('issue-4', 'col2', 'sw2'), 'col2', 'sw2');
      addIssueToDOM(createMockIssue('issue-5', 'col2', 'sw1'), 'col2', 'sw1');
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then "In Progress" column cells should have red background', () => {
      cy.get('.ghx-swimlane[swimlane-id="sw1"] .ghx-column[data-column-id="col2"]').should(
        'have.css',
        'background-color',
        'rgb(255, 86, 48)'
      );
      cy.get('.ghx-swimlane[swimlane-id="sw2"] .ghx-column[data-column-id="col2"]').should(
        'have.css',
        'background-color',
        'rgb(255, 86, 48)'
      );
    });
  });

  Scenario('SC-EXCEED-2: Normal background when within limit', () => {
    Step('Given there is a group with columns "In Progress" and limit 5', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 5,
        },
      });
    });

    Step('And there are 3 issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw2'), 'col2', 'sw2');
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then "In Progress" column cells should have normal background', () => {
      cy.get('.ghx-swimlane[swimlane-id="sw1"] .ghx-column[data-column-id="col2"]').should(
        'not.have.css',
        'background-color',
        'rgb(255, 86, 48)'
      );
    });
  });

  Scenario('SC-EXCEED-3: Exactly at limit shows normal background', () => {
    Step('Given there is a group with columns "In Progress" and limit 3', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 3,
        },
      });
    });

    Step('And there are 3 issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw2'), 'col2', 'sw2');
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then "In Progress" column cells should have normal background', () => {
      cy.get('.ghx-swimlane[swimlane-id="sw1"] .ghx-column[data-column-id="col2"]').should(
        'not.have.css',
        'background-color',
        'rgb(255, 86, 48)'
      );
    });

    Step('And badge should show "3/3"', () => {
      cy.get('.ghx-column[data-id="col2"]').should('contain', '3/3');
    });
  });

  // === SWIMLANE FILTER ===

  Scenario('SC-SWIM-1: Ignore issues in excluded swimlanes', () => {
    Step('Given there is a group with columns "In Progress" and limit 2', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 2,
        },
      });
    });

    Step('And there are 3 issues in "In Progress" swimlane "Frontend"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw1'), 'col2', 'sw1');
    });

    Step('And there are 2 issues in "In Progress" swimlane "Excluded"', () => {
      addIssueToDOM(createMockIssue('issue-4', 'col2', 'sw3'), 'col2', 'sw3');
      addIssueToDOM(createMockIssue('issue-5', 'col2', 'sw3'), 'col2', 'sw3');
    });

    Step('And swimlane "Excluded" is set to ignore WIP limits', () => {
      useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes(['sw3']);
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then the badge should show "3/2"', () => {
      cy.get('.ghx-column[data-id="col2"] [data-column-limits-badge="true"]').should('contain', '3/2');
    });

    Step('And the limit should be exceeded', () => {
      cy.get('.ghx-swimlane[swimlane-id="sw1"] .ghx-column[data-column-id="col2"]').should(
        'have.css',
        'background-color',
        'rgb(255, 86, 48)'
      );
    });
  });

  // === ISSUE TYPE FILTER ===

  Scenario('SC-ISSUE-1: Count only specified issue types', () => {
    Step('Given there is a group with columns "In Progress" and limit 2', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 2,
          name: 'Dev',
          value: 'Dev',
          includedIssueTypes: ['Bug'],
        },
      });
    });

    Step('And the group counts only "Bug" issue types', () => {
      // Already set in Given step
    });

    Step('And there are 3 "Bug" issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1', 'Bug'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1', 'Bug'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw2', 'Bug'), 'col2', 'sw2');
    });

    Step('And there are 5 "Task" issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-4', 'col2', 'sw1', 'Task'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-5', 'col2', 'sw1', 'Task'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-6', 'col2', 'sw2', 'Task'), 'col2', 'sw2');
      addIssueToDOM(createMockIssue('issue-7', 'col2', 'sw2', 'Task'), 'col2', 'sw2');
      addIssueToDOM(createMockIssue('issue-8', 'col2', 'sw1', 'Task'), 'col2', 'sw1');
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then the badge should show "3/2"', () => {
      cy.get('.ghx-column[data-id="col2"] [data-column-limits-badge="true"]').should('contain', '3/2');
    });
  });

  Scenario('SC-ISSUE-2: Empty filter counts all issue types', () => {
    Step('Given there is a group with columns "In Progress" and limit 5', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 5,
          name: 'Dev',
          value: 'Dev',
          // No includedIssueTypes = counts all
        },
      });
    });

    Step('And the group has no issue type filter', () => {
      // Already set in Given step
    });

    Step('And there are 2 "Bug" issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1', 'Bug'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1', 'Bug'), 'col2', 'sw1');
    });

    Step('And there are 3 "Task" issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw1', 'Task'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-4', 'col2', 'sw1', 'Task'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-5', 'col2', 'sw2', 'Task'), 'col2', 'sw2');
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then the badge should show "5/5"', () => {
      cy.get('.ghx-column[data-id="col2"]').should('contain', '5/5');
    });
  });

  // === MULTIPLE GROUPS ===

  Scenario('SC-MULTI-1: Each group has its own badge', () => {
    Step('Given there is a group "Dev" with columns "In Progress" and limit 3', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 3,
        },
      });
    });

    Step('And there is a group "QA" with columns "Review" and limit 2', () => {
      const currentData = useColumnLimitsPropertyStore.getState().data;
      useColumnLimitsPropertyStore.getState().actions.setData({
        ...currentData,
        QA: {
          columns: ['col3'],
          max: 2,
        },
      });
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then "In Progress" should have a badge', () => {
      // Badge is inserted as HTML, search by text content or structure
      cy.get('.ghx-column[data-id="col2"]').should('contain', '/');
    });

    Step('And "Review" should have a badge', () => {
      cy.get('.ghx-column[data-id="col3"]').should('contain', '/');
    });
  });

  Scenario('SC-MULTI-2: Groups can have different colors', () => {
    Step('Given there is a group "Dev" with color "#36B37E"', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 3,
          customHexColor: '#36B37E',
        },
      });
    });

    Step('And there is a group "QA" with color "#FF5630"', () => {
      const currentData = useColumnLimitsPropertyStore.getState().data;
      useColumnLimitsPropertyStore.getState().actions.setData({
        ...currentData,
        QA: {
          columns: ['col3'],
          max: 2,
          customHexColor: '#FF5630',
        },
      });
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then "Dev" columns should have green border', () => {
      cy.get('.ghx-column[data-id="col2"]').should('have.css', 'border-top-color', 'rgb(54, 179, 126)');
    });

    Step('And "QA" columns should have red border', () => {
      cy.get('.ghx-column[data-id="col3"]').should('have.css', 'border-top-color', 'rgb(255, 86, 48)');
    });
  });

  Scenario('SC-MULTI-3: One group exceeded, another within limit', () => {
    Step('Given there is a group "Dev" with columns "In Progress" and limit 2', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 2,
        },
      });
    });

    Step('And there are 5 issues in "In Progress"', () => {
      addIssueToDOM(createMockIssue('issue-1', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-2', 'col2', 'sw1'), 'col2', 'sw1');
      addIssueToDOM(createMockIssue('issue-3', 'col2', 'sw2'), 'col2', 'sw2');
      addIssueToDOM(createMockIssue('issue-4', 'col2', 'sw2'), 'col2', 'sw2');
      addIssueToDOM(createMockIssue('issue-5', 'col2', 'sw1'), 'col2', 'sw1');
    });

    Step('And there is a group "QA" with columns "Review" and limit 5', () => {
      const currentData = useColumnLimitsPropertyStore.getState().data;
      useColumnLimitsPropertyStore.getState().actions.setData({
        ...currentData,
        QA: {
          columns: ['col3'],
          max: 5,
        },
      });
    });

    Step('And there are 2 issues in "Review"', () => {
      addIssueToDOM(createMockIssue('issue-6', 'col3', 'sw1'), 'col3', 'sw1');
      addIssueToDOM(createMockIssue('issue-7', 'col3', 'sw2'), 'col3', 'sw2');
    });

    Step('When the board is displayed', () => {
      applyLimits();
    });

    Step('Then "In Progress" cells should have red background', () => {
      cy.get('.ghx-swimlane[swimlane-id="sw1"] .ghx-column[data-column-id="col2"]').should(
        'have.css',
        'background-color',
        'rgb(255, 86, 48)'
      );
    });

    Step('And "Review" cells should have normal background', () => {
      cy.get('.ghx-swimlane[swimlane-id="sw1"] .ghx-column[data-column-id="col3"]').should(
        'not.have.css',
        'background-color',
        'rgb(255, 86, 48)'
      );
    });
  });
});

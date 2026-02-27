import { expect, vi } from 'vitest';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { useColumnLimitsPropertyStore } from '../property';
import { useColumnLimitsRuntimeStore, getInitialState } from './stores';
import { columnLimitsBoardPageObjectToken } from './pageObject';
import { applyLimits } from './actions';
import type { IColumnLimitsBoardPageObject } from './pageObject';

const feature = await loadFeature('src/column-limits/BoardPage/board-page.feature');

/**
 * Creates a mock PageObject for testing.
 * All DOM operations are mocked, allowing us to test business logic in isolation.
 */
const createMockPageObject = (): IColumnLimitsBoardPageObject & {
  mockIssues: Map<string, { columnId: string; swimlaneId: string | null; issueType: string }>;
  addIssue: (id: string, columnId: string, issueType: string, swimlaneId?: string | null) => Element;
  issueCounts: Map<string, number>;
  badgeCalls: Map<string, string>;
  styleCalls: Map<string, Partial<CSSStyleDeclaration>>;
} => {
  const mockIssues = new Map<
    string,
    { element: Element; columnId: string; swimlaneId: string | null; issueType: string }
  >();
  const issueCounts = new Map<string, number>();
  const badgeCalls = new Map<string, string>();
  const styleCalls = new Map<string, Partial<CSSStyleDeclaration>>();

  const mockPageObject: IColumnLimitsBoardPageObject & {
    mockIssues: Map<string, { columnId: string; swimlaneId: string | null; issueType: string }>;
    addIssue: (id: string, columnId: string, issueType: string, swimlaneId?: string | null) => Element;
    issueCounts: Map<string, number>;
    badgeCalls: Map<string, string>;
    styleCalls: Map<string, Partial<CSSStyleDeclaration>>;
  } = {
    mockIssues: mockIssues as any,
    issueCounts,
    badgeCalls,
    styleCalls,

    getOrderedColumnIds: () => ['col1', 'col2', 'col3', 'col4'],

    getColumnElement: (columnId: string) => {
      const el = document.createElement('div');
      el.setAttribute('data-column-id', columnId);
      return el;
    },

    getIssuesInColumn: vi.fn((columnId: string, ignoredSwimlanes: string[], includedIssueTypes?: string[]) => {
      // Count issues matching criteria
      let count = 0;
      mockIssues.forEach(issue => {
        if (issue.columnId !== columnId) return;
        if (ignoredSwimlanes.includes(issue.swimlaneId || '')) return;
        if (includedIssueTypes && includedIssueTypes.length > 0 && !includedIssueTypes.includes(issue.issueType))
          return;
        count += 1;
      });
      return count;
    }),

    styleColumn: (columnId: string, styles: Partial<CSSStyleDeclaration>) => {
      styleCalls.set(columnId, styles);
    },

    insertBadge: (columnId: string, html: string) => {
      badgeCalls.set(columnId, html);
    },

    getSwimlaneIds: () => {
      const swimlaneIds = new Set<string>();
      mockIssues.forEach(issue => {
        if (issue.swimlaneId) swimlaneIds.add(issue.swimlaneId);
      });
      return Array.from(swimlaneIds);
    },

    shouldCountIssue: (issue: Element, includedIssueTypes?: string[]) => {
      const issueId = (issue as any).id;
      const issueData = mockIssues.get(issueId);
      if (!issueData) return false;
      if (includedIssueTypes && includedIssueTypes.length > 0) {
        return includedIssueTypes.includes(issueData.issueType);
      }
      return true;
    },

    addIssue(id, columnId, issueType, swimlaneId = null) {
      const element = { id } as unknown as Element;
      mockIssues.set(id, { element, columnId, swimlaneId, issueType });
      return element;
    },
  };

  return mockPageObject;
};

describeFeature(feature, ({ Background, Scenario }) => {
  let mockPageObject: ReturnType<typeof createMockPageObject>;

  Background(({ Given, And }) => {
    Given('I am on a Jira board with column limits configured', () => {
      // Reset everything at the start of each scenario
      globalContainer.reset();
      registerLogger(globalContainer);
      useColumnLimitsRuntimeStore.setState(getInitialState());
      useColumnLimitsPropertyStore.getState().actions.reset();

      mockPageObject = createMockPageObject();
      globalContainer.register({
        token: columnLimitsBoardPageObjectToken,
        value: mockPageObject,
      });

      useColumnLimitsRuntimeStore.getState().actions.setCssNotIssueSubTask('');
    });

    And('there are available columns:', () => {
      // Columns are handled via mock PageObject - no DOM needed
    });

    And('there are available swimlanes:', () => {
      // Swimlanes are handled via mock PageObject - no DOM needed
    });

    And('there are available issue types:', () => {
      // Issue types are handled via mock PageObject - no DOM needed
    });
  });

  // === DISPLAY ===

  Scenario('SC-DISPLAY-1: Show badge X/Y on first column of group', ({ Given, And, When, Then }) => {
    Given('there is a group "Development" with columns "In Progress, Review" and limit 5', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Development: {
          columns: ['col2', 'col3'], // In Progress, Review
          max: 5,
        },
      });
    });

    And('there are 3 issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-2', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-3', 'col2', 'Task', 'sw2');
    });

    And('there are 1 issue in "Review"', () => {
      mockPageObject.addIssue('issue-4', 'col3', 'Task', 'sw1');
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('I should see badge "4/5" on "In Progress" column header', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats).toHaveLength(1);
      expect(groupStats[0].currentCount).toBe(4);
      expect(groupStats[0].limit).toBe(5);
      // Badge should be inserted on first column (col2 = In Progress)
      expect(mockPageObject.badgeCalls.has('col2')).toBe(true);
      const badgeHtml = mockPageObject.badgeCalls.get('col2');
      expect(badgeHtml).toContain('4/5');
    });
  });

  // === LIMIT EXCEEDED ===

  Scenario('SC-EXCEED-1: Red background when group limit exceeded', ({ Given, And, When, Then }) => {
    Given('there is a group with columns "In Progress" and limit 3', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 3,
        },
      });
    });

    And('there are 5 issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-2', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-3', 'col2', 'Task', 'sw2');
      mockPageObject.addIssue('issue-4', 'col2', 'Task', 'sw2');
      mockPageObject.addIssue('issue-5', 'col2', 'Task', 'sw1');
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('"In Progress" column cells should have red background', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats).toHaveLength(1);
      expect(groupStats[0].isOverLimit).toBe(true);
      expect(groupStats[0].currentCount).toBe(5);
      expect(groupStats[0].limit).toBe(3);
    });
  });

  Scenario('SC-EXCEED-2: Normal background when within limit', ({ Given, And, When, Then }) => {
    Given('there is a group with columns "In Progress" and limit 5', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 5,
        },
      });
    });

    And('there are 3 issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-2', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-3', 'col2', 'Task', 'sw2');
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('"In Progress" column cells should have normal background', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats).toHaveLength(1);
      expect(groupStats[0].isOverLimit).toBe(false);
      expect(groupStats[0].currentCount).toBe(3);
      expect(groupStats[0].limit).toBe(5);
    });
  });

  Scenario('SC-EXCEED-3: Exactly at limit shows normal background', ({ Given, And, When, Then }) => {
    Given('there is a group with columns "In Progress" and limit 3', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 3,
        },
      });
    });

    And('there are 3 issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-2', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-3', 'col2', 'Task', 'sw2');
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('"In Progress" column cells should have normal background', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats).toHaveLength(1);
      expect(groupStats[0].isOverLimit).toBe(false);
      expect(groupStats[0].currentCount).toBe(3);
      expect(groupStats[0].limit).toBe(3);
    });

    And('badge should show "3/3"', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats[0].currentCount).toBe(3);
      expect(groupStats[0].limit).toBe(3);
      const badgeHtml = mockPageObject.badgeCalls.get('col2');
      expect(badgeHtml).toContain('3/3');
    });
  });

  // === SWIMLANE FILTER ===

  Scenario('SC-SWIM-1: Ignore issues in excluded swimlanes', ({ Given, And, When, Then }) => {
    Given('there is a group with columns "In Progress" and limit 2', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 2,
        },
      });
    });

    And('there are 3 issues in "In Progress" swimlane "Frontend"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Task', 'sw1'); // Frontend
      mockPageObject.addIssue('issue-2', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-3', 'col2', 'Task', 'sw1');
    });

    And('there are 2 issues in "In Progress" swimlane "Excluded"', () => {
      mockPageObject.addIssue('issue-4', 'col2', 'Task', 'sw3'); // Excluded
      mockPageObject.addIssue('issue-5', 'col2', 'Task', 'sw3');
    });

    And('swimlane "Excluded" is set to ignore WIP limits', () => {
      useColumnLimitsRuntimeStore.getState().actions.setIgnoredSwimlanes(['sw3']); // Excluded
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('the badge should show "3/2"', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats).toHaveLength(1);
      expect(groupStats[0].currentCount).toBe(3); // Only sw1 issues counted
      expect(groupStats[0].limit).toBe(2);
      const badgeHtml = mockPageObject.badgeCalls.get('col2');
      expect(badgeHtml).toContain('3/2');
    });

    And('the limit should be exceeded', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats[0].isOverLimit).toBe(true);
    });
  });

  // === ISSUE TYPE FILTER ===

  Scenario('SC-ISSUE-1: Count only specified issue types', ({ Given, And, When, Then }) => {
    Given('there is a group with columns "In Progress" and limit 2', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 2,
          includedIssueTypes: ['Bug'],
        },
      });
    });

    And('the group counts only "Bug" issue types', () => {
      // Already set in Given step
    });

    And('there are 3 "Bug" issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Bug', 'sw1');
      mockPageObject.addIssue('issue-2', 'col2', 'Bug', 'sw1');
      mockPageObject.addIssue('issue-3', 'col2', 'Bug', 'sw2');
    });

    And('there are 5 "Task" issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-4', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-5', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-6', 'col2', 'Task', 'sw2');
      mockPageObject.addIssue('issue-7', 'col2', 'Task', 'sw2');
      mockPageObject.addIssue('issue-8', 'col2', 'Task', 'sw1');
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('the badge should show "3/2"', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats).toHaveLength(1);
      expect(groupStats[0].currentCount).toBe(3); // Only Bug issues counted
      expect(groupStats[0].limit).toBe(2);
      const badgeHtml = mockPageObject.badgeCalls.get('col2');
      expect(badgeHtml).toContain('3/2');
    });
  });

  Scenario('SC-ISSUE-2: Empty filter counts all issue types', ({ Given, And, When, Then }) => {
    Given('there is a group with columns "In Progress" and limit 5', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 5,
          // No includedIssueTypes = counts all
        },
      });
    });

    And('the group has no issue type filter', () => {
      // Already set in Given step (no includedIssueTypes)
    });

    And('there are 2 "Bug" issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Bug', 'sw1');
      mockPageObject.addIssue('issue-2', 'col2', 'Bug', 'sw1');
    });

    And('there are 3 "Task" issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-3', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-4', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-5', 'col2', 'Task', 'sw2');
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('the badge should show "5/5"', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats).toHaveLength(1);
      expect(groupStats[0].currentCount).toBe(5); // All issues counted
      expect(groupStats[0].limit).toBe(5);
      const badgeHtml = mockPageObject.badgeCalls.get('col2');
      expect(badgeHtml).toContain('5/5');
    });
  });

  Scenario('SC-DISPLAY-2: Badge updates when issue count changes', ({ Given, And, When, Then }) => {
    Given('there is a group with columns "In Progress" and limit 3', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 3,
        },
      });
    });

    And('there are 2 issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-2', 'col2', 'Task', 'sw1');
    });

    When('a new issue appears in "In Progress"', () => {
      applyLimits();
      // Verify initial state
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats[0].currentCount).toBe(2);
      // Add new issue
      mockPageObject.addIssue('issue-3', 'col2', 'Task', 'sw2');
      applyLimits();
    });

    Then('the badge should update to "3/3"', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats[0].currentCount).toBe(3);
      expect(groupStats[0].limit).toBe(3);
      const badgeHtml = mockPageObject.badgeCalls.get('col2');
      expect(badgeHtml).toContain('3/3');
    });
  });

  Scenario('SC-DISPLAY-3: Group columns have shared header color', ({ Given, When, Then }) => {
    Given('there is a group with columns "In Progress, Review" and custom color "#36B37E"', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2', 'col3'], // In Progress, Review
          max: 5,
          customHexColor: '#36B37E',
        },
      });
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('both "In Progress" and "Review" headers should have border color "#36B37E"', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      expect(groupStats).toHaveLength(1);
      expect(groupStats[0].color).toBe('#36B37E');
      // Verify styles were applied to both columns
      expect(mockPageObject.styleCalls.has('col2')).toBe(true);
      expect(mockPageObject.styleCalls.has('col3')).toBe(true);
    });
  });

  Scenario('SC-DISPLAY-4: Group headers have rounded corners on edges', ({ Given, When, Then, And }) => {
    Given('there is a group with columns "In Progress, Review"', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2', 'col3'], // In Progress, Review
          max: 5,
        },
      });
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('"In Progress" header should have rounded left corner', () => {
      const styles = mockPageObject.styleCalls.get('col2');
      expect(styles).toBeDefined();
      // Verify that styling was applied (actual border radius check is in Cypress)
    });

    And('"Review" header should have rounded right corner', () => {
      const styles = mockPageObject.styleCalls.get('col3');
      expect(styles).toBeDefined();
      // Verify that styling was applied (actual border radius check is in Cypress)
    });
  });

  // === MULTIPLE GROUPS ===

  Scenario('SC-MULTI-1: Each group has its own badge', ({ Given, And, When, Then }) => {
    Given('there is a group "Dev" with columns "In Progress" and limit 3', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 3,
        },
      });
    });

    And('there is a group "QA" with columns "Review" and limit 2', () => {
      const currentData = useColumnLimitsPropertyStore.getState().data;
      useColumnLimitsPropertyStore.getState().actions.setData({
        ...currentData,
        QA: {
          columns: ['col3'], // Review
          max: 2,
        },
      });
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('"In Progress" should have a badge', () => {
      expect(mockPageObject.badgeCalls.has('col2')).toBe(true);
    });

    And('"Review" should have a badge', () => {
      expect(mockPageObject.badgeCalls.has('col3')).toBe(true);
    });
  });

  Scenario('SC-MULTI-3: One group exceeded, another within limit', ({ Given, And, When, Then }) => {
    Given('there is a group "Dev" with columns "In Progress" and limit 2', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'], // In Progress
          max: 2,
        },
      });
    });

    And('there are 5 issues in "In Progress"', () => {
      mockPageObject.addIssue('issue-1', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-2', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-3', 'col2', 'Task', 'sw2');
      mockPageObject.addIssue('issue-4', 'col2', 'Task', 'sw2');
      mockPageObject.addIssue('issue-5', 'col2', 'Task', 'sw1');
    });

    And('there is a group "QA" with columns "Review" and limit 5', () => {
      const currentData = useColumnLimitsPropertyStore.getState().data;
      useColumnLimitsPropertyStore.getState().actions.setData({
        ...currentData,
        QA: {
          columns: ['col3'], // Review
          max: 5,
        },
      });
    });

    And('there are 2 issues in "Review"', () => {
      mockPageObject.addIssue('issue-6', 'col3', 'Task', 'sw1');
      mockPageObject.addIssue('issue-7', 'col3', 'Task', 'sw2');
    });

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('"In Progress" cells should have red background', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      const devStats = groupStats.find(s => s.groupId === 'Dev');
      expect(devStats).toBeDefined();
      expect(devStats!.isOverLimit).toBe(true);
      expect(devStats!.currentCount).toBe(5);
    });

    And('"Review" cells should have normal background', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      const qaStats = groupStats.find(s => s.groupId === 'QA');
      expect(qaStats).toBeDefined();
      expect(qaStats!.isOverLimit).toBe(false);
      expect(qaStats!.currentCount).toBe(2);
    });
  });

  Scenario('SC-MULTI-2: Groups can have different colors', ({ Given, And, When, Then }) => {
    Given('there is a group "Dev" with color "#36B37E"', () => {
      useColumnLimitsPropertyStore.getState().actions.setData({
        Dev: {
          columns: ['col2'],
          max: 3,
          customHexColor: '#36B37E',
        },
      });
    });

    And('there is a group "QA" with color "#FF5630"', () => {
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

    When('the board is displayed', () => {
      applyLimits();
    });

    Then('"Dev" columns should have green border', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      const devStats = groupStats.find(s => s.groupId === 'Dev');
      expect(devStats).toBeDefined();
      expect(devStats!.color).toBe('#36B37E');
    });

    And('"QA" columns should have red border', () => {
      const { groupStats } = useColumnLimitsRuntimeStore.getState().data;
      const qaStats = groupStats.find(s => s.groupId === 'QA');
      expect(qaStats).toBeDefined();
      expect(qaStats!.color).toBe('#FF5630');
    });
  });
});

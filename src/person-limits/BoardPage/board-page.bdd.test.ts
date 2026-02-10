import { expect } from 'vitest';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { useRuntimeStore, getInitialState } from './stores';
import { personLimitsBoardPageObjectToken, type IPersonLimitsBoardPageObject } from './pageObject';
import { applyLimits, showOnlyChosen } from './actions';

const feature = await loadFeature('src/person-limits/BoardPage/board-page.feature');

/**
 * Creates a mock PageObject for testing.
 * All DOM operations are mocked, allowing us to test business logic in isolation.
 */
const createMockPageObject = (): IPersonLimitsBoardPageObject & {
  mockIssues: Map<string, { assignee: string; columnId: string; swimlaneId: string | null; type: string }>;
  addIssue: (id: string, assignee: string, columnId: string, type: string, swimlaneId?: string | null) => Element;
  hasCustomSwimlanesValue: boolean;
  backgroundColorCalls: Map<Element, string>;
  visibilityCalls: Map<Element, boolean>;
} => {
  const mockIssues = new Map<
    string,
    { element: Element; assignee: string; columnId: string; swimlaneId: string | null; type: string }
  >();
  const backgroundColorCalls = new Map<Element, string>();
  const visibilityCalls = new Map<Element, boolean>();
  const hasCustomSwimlanesValue = false;

  const mockPageObject: IPersonLimitsBoardPageObject & {
    mockIssues: Map<string, { assignee: string; columnId: string; swimlaneId: string | null; type: string }>;
    addIssue: (id: string, assignee: string, columnId: string, type: string, swimlaneId?: string | null) => Element;
    hasCustomSwimlanesValue: boolean;
    backgroundColorCalls: Map<Element, string>;
    visibilityCalls: Map<Element, boolean>;
  } = {
    selectors: {
      issue: '.ghx-issue',
      avatarImg: '.ghx-avatar-img',
      issueType: '.ghx-type',
      column: '.ghx-column',
      swimlane: '.ghx-swimlane',
      swimlaneHeader: '.ghx-swimlane-header-container',
      parentGroup: '.ghx-parent-group',
    },

    mockIssues: mockIssues as any,
    hasCustomSwimlanesValue,
    backgroundColorCalls,
    visibilityCalls,

    addIssue(id, assignee, columnId, type, swimlaneId = null) {
      const element = { id } as unknown as Element;
      mockIssues.set(id, { element, assignee, columnId, swimlaneId, type });
      return element;
    },

    getIssues() {
      return Array.from(mockIssues.values()).map(i => i.element);
    },

    getAssigneeFromIssue(issue: Element) {
      const { id } = issue as any;
      return mockIssues.get(id)?.assignee ?? null;
    },

    getIssueType(issue: Element) {
      const { id } = issue as any;
      return mockIssues.get(id)?.type ?? null;
    },

    getColumnId(issue: Element) {
      const { id } = issue as any;
      return mockIssues.get(id)?.columnId ?? null;
    },

    getColumnIdFromColumn(column: Element) {
      return (column as any).columnId ?? null;
    },

    getSwimlaneId(issue: Element) {
      const { id } = issue as any;
      return mockIssues.get(id)?.swimlaneId ?? null;
    },

    hasCustomSwimlanes() {
      return mockPageObject.hasCustomSwimlanesValue;
    },

    getSwimlanes() {
      if (!mockPageObject.hasCustomSwimlanesValue) return [];
      const swimlaneIds = new Set<string>();
      mockIssues.forEach(issue => {
        if (issue.swimlaneId) swimlaneIds.add(issue.swimlaneId);
      });
      return Array.from(swimlaneIds).map(id => ({ getAttribute: () => id }) as unknown as Element);
    },

    getColumnsInSwimlane(swimlane: Element) {
      const swimlaneId = swimlane.getAttribute?.('swimlane-id') ?? (swimlane as any).id;
      const columnIds = new Set<string>();
      mockIssues.forEach(issue => {
        if (issue.swimlaneId === swimlaneId) columnIds.add(issue.columnId);
      });
      return Array.from(columnIds).map(
        id =>
          ({
            columnId: id,
            querySelectorAll: (selector: string) => {
              if (selector === '.ghx-issue') {
                return Array.from(mockIssues.values())
                  .filter(i => i.columnId === id && i.swimlaneId === swimlaneId)
                  .map(i => i.element);
              }
              return [];
            },
          }) as unknown as Element
      );
    },

    getColumns() {
      const columnIds = new Set<string>();
      mockIssues.forEach(issue => columnIds.add(issue.columnId));
      return Array.from(columnIds).map(
        id =>
          ({
            columnId: id,
            querySelectorAll: (selector: string) => {
              if (selector === '.ghx-issue') {
                return Array.from(mockIssues.values())
                  .filter(i => i.columnId === id)
                  .map(i => i.element);
              }
              return [];
            },
          }) as unknown as Element
      );
    },

    getParentGroups() {
      return [];
    },

    countIssueVisibility() {
      return { total: 0, hidden: 0 };
    },

    setIssueBackgroundColor(issue: Element, color: string) {
      backgroundColorCalls.set(issue, color);
    },

    resetIssueBackgroundColor(issue: Element) {
      backgroundColorCalls.delete(issue);
    },

    setIssueVisibility(issue: Element, visible: boolean) {
      visibilityCalls.set(issue, visible);
    },

    setSwimlaneVisibility() {},
    setParentGroupVisibility() {},
  };

  return mockPageObject;
};

describeFeature(feature, ({ Background, Scenario }) => {
  let mockPageObject: ReturnType<typeof createMockPageObject>;
  let limits: any[] = [];

  Background(({ Given, And }) => {
    Given('the board is loaded', () => {
      // Reset everything at the start of each scenario
      globalContainer.reset();
      registerLogger(globalContainer);
      useRuntimeStore.setState(getInitialState());

      mockPageObject = createMockPageObject();
      globalContainer.register({
        token: personLimitsBoardPageObjectToken,
        value: mockPageObject,
      });

      useRuntimeStore.getState().actions.setCssSelectorOfIssues('.ghx-issue');
      limits = [];
    });

    And('there are available columns:', () => {
      // Columns are handled via mock PageObject - no DOM needed
    });

    And('there are available swimlanes:', () => {
      // Swimlanes are handled via mock PageObject - no DOM needed
    });
  });

  Scenario('Board shows cards count for a person with limit', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "john.doe" with value 5 issues', () => {
      limits.push({
        id: 1,
        person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
        limit: 5,
        columns: [],
        swimlanes: [],
      });
    });

    And('"john.doe" has 4 issues in the board:', () => {
      mockPageObject.addIssue('issue-1', 'John Doe', 'col1', 'Task');
      mockPageObject.addIssue('issue-2', 'John Doe', 'col1', 'Task');
      mockPageObject.addIssue('issue-3', 'John Doe', 'col2', 'Task');
      mockPageObject.addIssue('issue-4', 'John Doe', 'col2', 'Task');
    });

    When('the board is displayed', () => {
      applyLimits({ limits });
    });

    Then('the counter for "john.doe" should show "4 / 5"', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats).toHaveLength(1);
      expect(stats[0].issues.length).toBe(4);
      expect(stats[0].limit).toBe(5);
    });

    And('the counter for "john.doe" should be green', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats[0].issues.length).toBeLessThan(stats[0].limit);
    });
  });

  Scenario('Board highlights person exceeding limit', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "jane.doe" with value 3 issues', () => {
      limits.push({
        id: 2,
        person: { name: 'jane.doe', displayName: 'Jane Doe', avatar: '' },
        limit: 3,
        columns: [],
        swimlanes: [],
      });
    });

    And('"jane.doe" has 4 issues in the board:', () => {
      mockPageObject.addIssue('issue-1', 'Jane Doe', 'col2', 'Task');
      mockPageObject.addIssue('issue-2', 'Jane Doe', 'col2', 'Task');
      mockPageObject.addIssue('issue-3', 'Jane Doe', 'col2', 'Task');
      mockPageObject.addIssue('issue-4', 'Jane Doe', 'col2', 'Task');
    });

    When('the board is displayed', () => {
      applyLimits({ limits });
    });

    Then('the counter for "jane.doe" should show "4 / 3"', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats).toHaveLength(1);
      expect(stats[0].issues.length).toBe(4);
      expect(stats[0].limit).toBe(3);
    });

    And('the counter for "jane.doe" should be red', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats[0].issues.length).toBeGreaterThan(stats[0].limit);
    });

    And('all 4 issues for "jane.doe" should be highlighted red', () => {
      expect(mockPageObject.backgroundColorCalls.size).toBe(4);
      mockPageObject.backgroundColorCalls.forEach(color => {
        expect(color).toBe('#ff5630');
      });
    });
  });

  Scenario('Board applies column-specific limits', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "john.doe" with value 2 issues in columns "col2"', () => {
      limits.push({
        id: 1,
        person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
        limit: 2,
        columns: [{ id: 'col2', name: 'In Progress' }],
        swimlanes: [],
      });
    });

    And('"john.doe" has issues in the board:', () => {
      mockPageObject.addIssue('issue-1', 'John Doe', 'col1', 'Task');
      mockPageObject.addIssue('issue-2', 'John Doe', 'col2', 'Task');
      mockPageObject.addIssue('issue-3', 'John Doe', 'col2', 'Task');
      mockPageObject.addIssue('issue-4', 'John Doe', 'col2', 'Task');
    });

    When('the board is displayed', () => {
      applyLimits({ limits });
    });

    Then('the counter for "john.doe" should show "3 / 2"', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats).toHaveLength(1);
      expect(stats[0].issues.length).toBe(3);
      expect(stats[0].limit).toBe(2);
    });

    And('the counter for "john.doe" should be red', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats[0].issues.length).toBeGreaterThan(stats[0].limit);
    });

    And('only 3 issues in "col2" for "john.doe" should be highlighted red', () => {
      expect(mockPageObject.backgroundColorCalls.size).toBe(3);
    });
  });

  Scenario('Board applies swimlane-specific limits', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "john.doe" with value 1 issue in swimlanes "sw1"', () => {
      limits.push({
        id: 1,
        person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
        limit: 1,
        columns: [],
        swimlanes: [{ id: 'sw1', name: 'Swimlane 1' }],
      });
    });

    And('"john.doe" has issues in the board:', () => {
      mockPageObject.hasCustomSwimlanesValue = true;
      mockPageObject.addIssue('issue-1', 'John Doe', 'col2', 'Task', 'sw1');
      mockPageObject.addIssue('issue-2', 'John Doe', 'col2', 'Task', 'sw2');
    });

    When('the board is displayed', () => {
      applyLimits({ limits });
    });

    Then('the counter for "john.doe" should show "1 / 1"', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats).toHaveLength(1);
      expect(stats[0].issues.length).toBe(1);
      expect(stats[0].limit).toBe(1);
    });

    And('the counter for "john.doe" should be yellow', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats[0].issues.length).toBe(stats[0].limit);
    });
  });

  Scenario('Board applies issue type filter', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "john.doe" with value 2 issues for types "Bug, Task"', () => {
      limits.push({
        id: 1,
        person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
        limit: 2,
        columns: [],
        swimlanes: [],
        includedIssueTypes: ['Bug', 'Task'],
      });
    });

    And('"john.doe" has issues in the board:', () => {
      mockPageObject.addIssue('issue-1', 'John Doe', 'col2', 'Bug');
      mockPageObject.addIssue('issue-2', 'John Doe', 'col2', 'Task');
      mockPageObject.addIssue('issue-3', 'John Doe', 'col2', 'Story');
    });

    When('the board is displayed', () => {
      applyLimits({ limits });
    });

    Then('the counter for "john.doe" should show "2 / 2"', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats).toHaveLength(1);
      expect(stats[0].issues.length).toBe(2);
      expect(stats[0].limit).toBe(2);
    });

    And('the counter for "john.doe" should be yellow', () => {
      const { stats } = useRuntimeStore.getState().data;
      expect(stats[0].issues.length).toBe(stats[0].limit);
    });
  });

  Scenario('Filtering by clicking on avatar', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "john.doe" with value 2 issues in columns "col2"', () => {
      limits.push({
        id: 1,
        person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
        limit: 2,
        columns: [{ id: 'col2', name: 'In Progress' }],
        swimlanes: [],
      });
    });

    And('"john.doe" has issues in the board:', () => {
      mockPageObject.addIssue('1', 'John Doe', 'col1', 'Task');
      mockPageObject.addIssue('2', 'John Doe', 'col2', 'Task');
    });

    And('"jane.doe" has issues in the board:', () => {
      mockPageObject.addIssue('3', 'Jane Doe', 'col2', 'Task');
    });

    When('the user clicks on "john.doe" avatar', () => {
      applyLimits({ limits });
      // Get the limit id from stats after applying limits
      const { stats } = useRuntimeStore.getState().data;
      const johnLimit = stats.find(s => s.person.name === 'john.doe');
      expect(johnLimit).toBeDefined();
      useRuntimeStore.getState().actions.toggleActiveLimitId(johnLimit!.id);
      showOnlyChosen();
    });

    Then('only issue "2" should be visible', () => {
      const issue2 = Array.from(mockPageObject.visibilityCalls.entries()).find(([el]) => (el as any).id === '2');
      expect(issue2?.[1]).toBe(true);
    });

    And('issue "1" should be hidden', () => {
      const issue1 = Array.from(mockPageObject.visibilityCalls.entries()).find(([el]) => (el as any).id === '1');
      expect(issue1?.[1]).toBe(false);
    });

    And('issue "3" should be hidden', () => {
      const issue3 = Array.from(mockPageObject.visibilityCalls.entries()).find(([el]) => (el as any).id === '3');
      expect(issue3?.[1]).toBe(false);
    });
  });

  Scenario('Filtering by clicking on second limit of same person', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "john.doe" with value 2 issues in columns "col1"', () => {
      limits.push({
        id: 1,
        person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
        limit: 2,
        columns: [{ id: 'col1', name: 'To Do' }],
        swimlanes: [],
      });
    });

    And('there is a second WIP limit for "john.doe" with value 1 issue in columns "col2"', () => {
      limits.push({
        id: 2,
        person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
        limit: 1,
        columns: [{ id: 'col2', name: 'In Progress' }],
        swimlanes: [],
      });
    });

    And('"john.doe" has issues in the board:', () => {
      mockPageObject.addIssue('1', 'John Doe', 'col1', 'Task');
      mockPageObject.addIssue('2', 'John Doe', 'col2', 'Task');
    });

    When('the user clicks on the second "john.doe" avatar', () => {
      applyLimits({ limits });
      // Get the id of the second limit (col2) from stats
      const { stats } = useRuntimeStore.getState().data;
      const secondLimit = stats.find(s => s.columns.some(c => c.id === 'col2'));
      expect(secondLimit).toBeDefined();
      useRuntimeStore.getState().actions.toggleActiveLimitId(secondLimit!.id);
      showOnlyChosen();
    });

    Then('only issue "2" should be visible', () => {
      const issue2 = Array.from(mockPageObject.visibilityCalls.entries()).find(([el]) => (el as any).id === '2');
      expect(issue2?.[1]).toBe(true);
    });

    And('issue "1" should be hidden', () => {
      const issue1 = Array.from(mockPageObject.visibilityCalls.entries()).find(([el]) => (el as any).id === '1');
      expect(issue1?.[1]).toBe(false);
    });
  });
});

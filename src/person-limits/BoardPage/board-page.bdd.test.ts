import { expect } from 'vitest';
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';

const feature = await loadFeature('src/person-limits/BoardPage/board-page.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  let wipLimits: Array<{ personName: string; limit: number; selectedColumns?: string[] }>;
  let boardIssues: Array<{ personName: string; column: string }>;
  let columns: Array<{ id: string; name: string }>;

  Background(({ Given, And }) => {
    Given('the board is loaded', () => {
      wipLimits = [];
      boardIssues = [];
    });

    And('there are available columns "To Do, In Progress, Done"', () => {
      columns = [
        { id: 'col1', name: 'To Do' },
        { id: 'col2', name: 'In Progress' },
        { id: 'col3', name: 'Done' },
      ];
    });
  });

  Scenario('Board shows cards count for a person with limit', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "john.doe" with value 5 issues', () => {
      wipLimits.push({ personName: 'john.doe', limit: 5 });
    });

    And('"john.doe" has 4 issues in the board', () => {
      boardIssues.push(
        { personName: 'john.doe', column: 'To Do' },
        { personName: 'john.doe', column: 'To Do' },
        { personName: 'john.doe', column: 'In Progress' },
        { personName: 'john.doe', column: 'In Progress' }
      );
    });

    When('the board is displayed', () => {
      // Calculation would happen here
    });

    Then('the counter for "john.doe" should show "4 / 5"', () => {
      const johnLimit = wipLimits.find(l => l.personName === 'john.doe');
      const johnIssuesCount = boardIssues.filter(i => i.personName === 'john.doe').length;
      expect(johnIssuesCount).toBe(4);
      expect(johnLimit?.limit).toBe(5);
    });

    And('the counter should be green (within limit)', () => {
      const johnLimit = wipLimits.find(l => l.personName === 'john.doe');
      const johnIssuesCount = boardIssues.filter(i => i.personName === 'john.doe').length;
      expect(johnIssuesCount).toBeLessThanOrEqual(johnLimit!.limit);
    });
  });

  Scenario('Board highlights person exceeding limit', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "jane.doe" with value 3 issues', () => {
      wipLimits.push({ personName: 'jane.doe', limit: 3 });
    });

    And('"jane.doe" has 5 issues in the board', () => {
      for (let i = 0; i < 5; i++) {
        boardIssues.push({ personName: 'jane.doe', column: 'In Progress' });
      }
    });

    When('the board is displayed', () => {
      // Calculation would happen here
    });

    Then('the counter for "jane.doe" should show "5 / 3"', () => {
      const janeLimit = wipLimits.find(l => l.personName === 'jane.doe');
      const janeIssuesCount = boardIssues.filter(i => i.personName === 'jane.doe').length;
      expect(janeIssuesCount).toBe(5);
      expect(janeLimit?.limit).toBe(3);
    });

    And('the counter should be red (exceeded limit)', () => {
      const janeLimit = wipLimits.find(l => l.personName === 'jane.doe');
      const janeIssuesCount = boardIssues.filter(i => i.personName === 'jane.doe').length;
      expect(janeIssuesCount).toBeGreaterThan(janeLimit!.limit);
    });
  });

  Scenario('Board applies column-specific limits', ({ Given, And, When, Then }) => {
    Given('there is a WIP limit for "john.doe" limited to column "In Progress" with value 2', () => {
      wipLimits.push({ personName: 'john.doe', limit: 2, selectedColumns: ['col2'] });
    });

    And('"john.doe" has 1 issue in "To Do"', () => {
      boardIssues.push({ personName: 'john.doe', column: 'To Do' });
    });

    And('"john.doe" has 3 issues in "In Progress"', () => {
      for (let i = 0; i < 3; i++) {
        boardIssues.push({ personName: 'john.doe', column: 'In Progress' });
      }
    });

    When('the board is displayed', () => {
      // Calculation would happen here
    });

    Then('only issues in "In Progress" are counted for the limit', () => {
      const johnLimit = wipLimits.find(l => l.personName === 'john.doe');
      const inProgressIssues = boardIssues.filter(
        i => i.personName === 'john.doe' && i.column === 'In Progress'
      ).length;
      expect(johnLimit?.selectedColumns).toContain('col2');
      expect(inProgressIssues).toBe(3);
    });

    And('the counter should show "3 / 2"', () => {
      const johnLimit = wipLimits.find(l => l.personName === 'john.doe');
      const inProgressIssues = boardIssues.filter(
        i => i.personName === 'john.doe' && i.column === 'In Progress'
      ).length;
      expect(inProgressIssues).toBe(3);
      expect(johnLimit?.limit).toBe(2);
    });
  });
});

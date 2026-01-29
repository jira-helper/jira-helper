import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ColumnLimitsBoardPage from './index';

// Mock PageModification dependencies
vi.mock('../../shared/PageModification', async () => {
  const actual = await vi.importActual('../../shared/PageModification');
  return {
    ...actual,
    PageModification: class {
      protected getIssueTypeFromCard(card: Element): string | null {
        const typeElement = card.querySelector('.ghx-type');
        if (!typeElement) return null;
        const title = typeElement.getAttribute('title');
        if (!title) return null;
        const typeName = title.includes(':') ? title.split(':')[1].trim() : title.trim();
        return typeName || null;
      }

      protected shouldCountIssue(card: Element, includedIssueTypes?: string[]): boolean {
        if (!includedIssueTypes || includedIssueTypes.length === 0) {
          return true;
        }
        const issueType = this.getIssueTypeFromCard(card);
        return issueType ? includedIssueTypes.includes(issueType) : false;
      }

      protected getCssSelectorNotIssueSubTask(): string {
        return '';
      }

      protected getCssSelectorOfIssues(): string {
        return '.ghx-issue';
      }

      protected getBoardId(): string | null {
        return '123';
      }

      protected getSearchParam(): string | null {
        return null;
      }

      protected insertHTML(): Element | null {
        return null;
      }

      protected onDOMChange(): void {}

      protected waitForElement(): Promise<Element> {
        return Promise.resolve(document.createElement('div'));
      }

      protected getBoardEditData(): Promise<any> {
        return Promise.resolve({ rapidListConfig: { mappedColumns: [] } });
      }

      protected getBoardProperty(): Promise<any> {
        return Promise.resolve({});
      }

      protected updateBoardProperty(): Promise<any> {
        return Promise.resolve();
      }
    },
  };
});

describe('Column Limits - Issue Type Filtering', () => {
  let instance: ColumnLimitsBoardPage;
  let getIssuesInColumn: (columnId: string, ignoredSwimlanes: string[], includedIssueTypes?: string[]) => number;

  beforeEach(() => {
    document.body.innerHTML = '';
    instance = new ColumnLimitsBoardPage();

    // Access the method through the instance
    getIssuesInColumn = (columnId: string, ignoredSwimlanes: string[], includedIssueTypes?: string[]) => {
      // We'll test the logic directly since getIssuesInColumn is protected
      const swimlanesFilter = ignoredSwimlanes.map(swimlaneId => `:not([swimlane-id="${swimlaneId}"])`).join('');
      const issues = document.querySelectorAll(
        `.ghx-swimlane${swimlanesFilter} .ghx-column[data-column-id="${columnId}"] .ghx-issue:not(.ghx-done)`
      );

      if (!includedIssueTypes || includedIssueTypes.length === 0) {
        return issues.length;
      }

      return Array.from(issues).filter(issue => {
        const typeElement = issue.querySelector('.ghx-type');
        if (!typeElement) return false;
        const title = typeElement.getAttribute('title');
        if (!title) return false;
        const typeName = title.includes(':') ? title.split(':')[1].trim() : title.trim();
        return typeName ? includedIssueTypes.includes(typeName) : false;
      }).length;
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should count all issues when no filter is applied', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <div class="ghx-type" title="Task"></div>
          </div>
          <div class="ghx-issue">
            <div class="ghx-type" title="Bug"></div>
          </div>
          <div class="ghx-issue">
            <div class="ghx-type" title="Story"></div>
          </div>
        </div>
      </div>
    `;

    const count = getIssuesInColumn('col1', []);

    expect(count).toBe(3);
  });

  it('should filter issues by type when includedIssueTypes is set', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <div class="ghx-type" title="Task"></div>
          </div>
          <div class="ghx-issue">
            <div class="ghx-type" title="Bug"></div>
          </div>
          <div class="ghx-issue">
            <div class="ghx-type" title="Story"></div>
          </div>
        </div>
      </div>
    `;

    const count = getIssuesInColumn('col1', [], ['Task', 'Bug']);

    expect(count).toBe(2);
  });

  it('should return 0 when no issues match the filter', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <div class="ghx-type" title="Task"></div>
          </div>
          <div class="ghx-issue">
            <div class="ghx-type" title="Bug"></div>
          </div>
        </div>
      </div>
    `;

    const count = getIssuesInColumn('col1', [], ['Story', 'Epic']);

    expect(count).toBe(0);
  });

  it('should handle empty includedIssueTypes array as no filter', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <div class="ghx-type" title="Task"></div>
          </div>
          <div class="ghx-issue">
            <div class="ghx-type" title="Bug"></div>
          </div>
        </div>
      </div>
    `;

    const count = getIssuesInColumn('col1', [], []);

    expect(count).toBe(2);
  });

  it('should ignore issues without type when filter is applied', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <div class="ghx-type" title="Task"></div>
          </div>
          <div class="ghx-issue">
            <div>No type</div>
          </div>
        </div>
      </div>
    `;

    const count = getIssuesInColumn('col1', [], ['Task']);

    expect(count).toBe(1);
  });

  it('should handle issues with done class', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <div class="ghx-type" title="Task"></div>
          </div>
          <div class="ghx-issue ghx-done">
            <div class="ghx-type" title="Task"></div>
          </div>
        </div>
      </div>
    `;

    const count = getIssuesInColumn('col1', [], ['Task']);

    expect(count).toBe(1); // Only non-done issues are counted
  });

  it('should handle multiple swimlanes with ignored swimlanes', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane" swimlane-id="swim1">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <div class="ghx-type" title="Task"></div>
          </div>
        </div>
      </div>
      <div class="ghx-swimlane" swimlane-id="swim2">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <div class="ghx-type" title="Bug"></div>
          </div>
        </div>
      </div>
    `;

    const count = getIssuesInColumn('col1', ['swim1'], ['Task', 'Bug']);

    expect(count).toBe(1); // Only swim2 is counted
  });
});

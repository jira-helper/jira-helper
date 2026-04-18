import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoardRuntimeModel } from './BoardRuntimeModel';
import type { PropertyModel } from '../../property/PropertyModel';
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import type { Logger } from 'src/shared/Logger';
import type { PersonLimit } from '../../property/types';

const OVER_LIMIT_BG = '#ff5630';

describe('BoardRuntimeModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockLogger: Logger;

  beforeEach(() => {
    mockPropertyModel = {
      data: { limits: [] },
    } as unknown as PropertyModel;

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const modelWithLimits = (limits: PersonLimit[]) => {
    (mockPropertyModel as { data: { limits: PersonLimit[] } }).data = { limits };
    return new BoardRuntimeModel(mockPropertyModel, BoardPagePageObject, mockLogger);
  };

  const personJohn = {
    name: 'john.doe',
    displayName: 'John Doe',
    self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
    avatar: '',
  };

  it('should count issues for a person limit', () => {
    document.body.innerHTML = `
      <div id="ghx-pool">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            <div class="ghx-type" title="Task"></div>
          </div>
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            <div class="ghx-type" title="Bug"></div>
          </div>
        </div>
        <div class="ghx-column" data-column-id="col2">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            <div class="ghx-type" title="Task"></div>
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        person: personJohn,
        limit: 5,
        columns: [],
        swimlanes: [],
        showAllPersonIssues: true,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';

    const stats = model.calculateStats();

    expect(stats).toHaveLength(1);
    expect(stats[0].issues.length).toBe(3);
    expect(stats[0].limit).toBe(5);
  });

  it('should filter by column', () => {
    document.body.innerHTML = `
      <div id="ghx-pool">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
        </div>
        <div class="ghx-column" data-column-id="col2">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        person: personJohn,
        limit: 2,
        columns: [{ id: 'col2', name: 'In Progress' }],
        swimlanes: [],
        showAllPersonIssues: true,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';

    const stats = model.calculateStats();

    expect(stats).toHaveLength(1);
    expect(stats[0].issues.length).toBe(2);
  });

  it('apply clears backgrounds then highlights issues when count exceeds limit', () => {
    document.body.innerHTML = `
      <div id="ghx-pool">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            <div class="ghx-type" title="Task"></div>
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        person: personJohn,
        limit: 1,
        columns: [],
        swimlanes: [],
        showAllPersonIssues: true,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';

    const issues = document.querySelectorAll('.ghx-issue');
    issues.forEach(el => {
      (el as HTMLElement).style.backgroundColor = 'yellow';
    });

    model.apply();

    issues.forEach(issue => {
      expect((issue as HTMLElement).style.backgroundColor).toBe(OVER_LIMIT_BG);
    });

    const thirdParty = document.createElement('div');
    thirdParty.className = 'ghx-issue';
    document.querySelector('.ghx-column')!.appendChild(thirdParty);
    model.apply();
    expect((thirdParty as HTMLElement).style.backgroundColor).toBe('');
  });

  it('showOnlyChosen with no active limit shows every issue and clears aggregation hiding', () => {
    document.body.innerHTML = `
      <div id="ghx-pool">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      { id: 1, person: personJohn, limit: 5, columns: [], swimlanes: [], showAllPersonIssues: true },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';
    model.calculateStats();

    const issue = document.querySelector('.ghx-issue')!;
    BoardPagePageObject.setIssueVisibility(issue, false);
    expect(issue.classList.contains('no-visibility')).toBe(true);

    model.activeLimitId = null;
    model.showOnlyChosen();

    expect(issue.classList.contains('no-visibility')).toBe(false);
  });

  it('showOnlyChosen with active limit and showAllPersonIssues shows only assignee matches', () => {
    document.body.innerHTML = `
      <div id="ghx-pool">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue" id="i1">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
          <div class="ghx-issue" id="i2">
            <img class="ghx-avatar-img" alt="Assignee: Jane Doe" />
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        person: personJohn,
        limit: 5,
        columns: [],
        swimlanes: [],
        showAllPersonIssues: true,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';
    model.calculateStats();
    model.activeLimitId = model.stats[0].id;

    model.showOnlyChosen();

    expect(document.getElementById('i1')!.classList.contains('no-visibility')).toBe(false);
    expect(document.getElementById('i2')!.classList.contains('no-visibility')).toBe(true);
  });

  it('showOnlyChosen with showAllPersonIssues false uses limit scope', () => {
    document.body.innerHTML = `
      <div id="ghx-pool">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue" id="a">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
        </div>
        <div class="ghx-column" data-column-id="col2">
          <div class="ghx-issue" id="b">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        person: personJohn,
        limit: 5,
        columns: [{ id: 'col1', name: 'To Do' }],
        swimlanes: [],
        showAllPersonIssues: false,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';
    model.calculateStats();
    model.activeLimitId = model.stats[0].id;

    model.showOnlyChosen();

    expect(document.getElementById('a')!.classList.contains('no-visibility')).toBe(false);
    expect(document.getElementById('b')!.classList.contains('no-visibility')).toBe(true);
  });

  it('toggleActiveLimitId sets active limit then clears on second toggle', () => {
    document.body.innerHTML = `
      <div id="ghx-pool">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: John Doe" />
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      { id: 1, person: personJohn, limit: 5, columns: [], swimlanes: [], showAllPersonIssues: true },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';
    model.calculateStats();
    const { id } = model.stats[0];

    model.toggleActiveLimitId(id);
    expect(model.activeLimitId).toBe(id);

    model.toggleActiveLimitId(id);
    expect(model.activeLimitId).toBeNull();
  });

  it('reset restores stats, activeLimitId and issue selector defaults', () => {
    const model = modelWithLimits([]);
    model.stats = [{ issues: [] } as any];
    model.activeLimitId = 42;
    model.cssSelectorOfIssues = '.custom';

    model.reset();

    expect(model.stats).toEqual([]);
    expect(model.activeLimitId).toBeNull();
    expect(model.cssSelectorOfIssues).toBe('.ghx-issue');
  });

  it('calculateStats with custom swimlanes only counts issues in scoped swimlanes', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane-header" aria-label="custom swimlanes"></div>
      <div id="ghx-pool">
        <div class="ghx-swimlane" swimlane-id="sw1">
          <div class="ghx-swimlane-header"></div>
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
              <div class="ghx-type" title="Task"></div>
            </div>
          </div>
        </div>
        <div class="ghx-swimlane" swimlane-id="sw2">
          <div class="ghx-swimlane-header"></div>
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
              <div class="ghx-type" title="Task"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        person: personJohn,
        limit: 10,
        columns: [],
        swimlanes: [{ id: 'sw1', name: 'Team A' }],
        showAllPersonIssues: true,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';

    const stats = model.calculateStats();

    expect(stats[0].issues.length).toBe(1);
  });

  it('showOnlyChosen hides parent group when all its issues are filtered out', () => {
    document.body.innerHTML = `
      <div class="ghx-parent-group" id="pg">
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: Jane Doe" />
          </div>
        </div>
        <div class="ghx-column" data-column-id="col1">
          <div class="ghx-issue">
            <img class="ghx-avatar-img" alt="Assignee: Jane Doe" />
          </div>
        </div>
      </div>
      <div id="ghx-pool">
        <div class="ghx-column" data-column-id="col1"></div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        person: personJohn,
        limit: 5,
        columns: [],
        swimlanes: [],
        showAllPersonIssues: true,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';
    model.calculateStats();
    model.activeLimitId = model.stats[0].id;

    model.showOnlyChosen();

    const pg = document.getElementById('pg')!;
    expect(pg.classList.contains('no-visibility')).toBe(true);
  });

  it('showOnlyChosen hides swimlane when every issue in it is filtered out', () => {
    document.body.innerHTML = `
      <div class="ghx-swimlane-header" aria-label="custom swimlanes"></div>
      <div id="ghx-pool">
        <div class="ghx-swimlane" swimlane-id="sw1" id="sw-el">
          <div class="ghx-swimlane-header"></div>
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue">
              <img class="ghx-avatar-img" alt="Assignee: Jane Doe" />
            </div>
          </div>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        person: personJohn,
        limit: 5,
        columns: [],
        swimlanes: [],
        showAllPersonIssues: true,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';
    model.calculateStats();
    model.activeLimitId = model.stats[0].id;

    model.showOnlyChosen();

    expect(document.getElementById('sw-el')!.classList.contains('no-visibility')).toBe(true);
  });
});

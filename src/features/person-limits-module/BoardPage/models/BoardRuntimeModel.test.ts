import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoardRuntimeModel } from './BoardRuntimeModel';
import type { PropertyModel } from '../../property/PropertyModel';
import { BoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import type { Logger } from 'src/infrastructure/logging/Logger';
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
        persons: [personJohn],
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
        persons: [personJohn],
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
        persons: [personJohn],
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
      { id: 1, persons: [personJohn], limit: 5, columns: [], swimlanes: [], showAllPersonIssues: true },
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
        persons: [personJohn],
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
        persons: [personJohn],
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

  describe('per-person vs shared limit highlighting', () => {
    const personJane = {
      name: 'jane.doe',
      displayName: 'Jane Doe',
      self: 'https://jira.example.com/rest/api/2/user?username=jane.doe',
      avatar: '',
    };

    it('toggleActivePerson with personName narrows showOnlyChosen to that single assignee', () => {
      document.body.innerHTML = `
        <div id="ghx-pool">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue" id="i-john">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            </div>
            <div class="ghx-issue" id="i-jane">
              <img class="ghx-avatar-img" alt="Assignee: Jane Doe" />
            </div>
          </div>
        </div>
      `;

      const model = modelWithLimits([
        {
          id: 1,
          persons: [personJohn, personJane],
          limit: 5,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: true,
          sharedLimit: false,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';
      model.calculateStats();

      model.toggleActivePerson(model.stats[0].id, 'john.doe');

      expect(document.getElementById('i-john')!.classList.contains('no-visibility')).toBe(false);
      expect(document.getElementById('i-jane')!.classList.contains('no-visibility')).toBe(true);
    });

    it('toggleActivePerson with personName=null highlights all persons in the limit', () => {
      document.body.innerHTML = `
        <div id="ghx-pool">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue" id="i-john">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            </div>
            <div class="ghx-issue" id="i-jane">
              <img class="ghx-avatar-img" alt="Assignee: Jane Doe" />
            </div>
            <div class="ghx-issue" id="i-other">
              <img class="ghx-avatar-img" alt="Assignee: Bob" />
            </div>
          </div>
        </div>
      `;

      const model = modelWithLimits([
        {
          id: 1,
          persons: [personJohn, personJane],
          limit: 5,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: true,
          sharedLimit: true,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';
      model.calculateStats();

      model.toggleActivePerson(model.stats[0].id, null);

      expect(document.getElementById('i-john')!.classList.contains('no-visibility')).toBe(false);
      expect(document.getElementById('i-jane')!.classList.contains('no-visibility')).toBe(false);
      expect(document.getElementById('i-other')!.classList.contains('no-visibility')).toBe(true);
    });

    it('toggleActivePerson called twice with same args clears the selection', () => {
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
        {
          id: 1,
          persons: [personJohn, personJane],
          limit: 5,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: true,
          sharedLimit: false,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';
      model.calculateStats();
      const { id } = model.stats[0];

      model.toggleActivePerson(id, 'john.doe');
      expect(model.activePerson).toEqual({ limitId: id, personName: 'john.doe' });

      model.toggleActivePerson(id, 'john.doe');
      expect(model.activePerson).toBeNull();
    });

    it('apply highlights only the offending person in a per-person limit', () => {
      document.body.innerHTML = `
        <div id="ghx-pool">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue" id="o1">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            </div>
            <div class="ghx-issue" id="o2">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            </div>
            <div class="ghx-issue" id="under">
              <img class="ghx-avatar-img" alt="Assignee: Jane Doe" />
            </div>
          </div>
        </div>
      `;

      const model = modelWithLimits([
        {
          id: 1,
          persons: [personJohn, personJane],
          limit: 1,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: true,
          sharedLimit: false,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';

      model.apply();

      expect((document.getElementById('o1') as HTMLElement).style.backgroundColor).toBe(OVER_LIMIT_BG);
      expect((document.getElementById('o2') as HTMLElement).style.backgroundColor).toBe(OVER_LIMIT_BG);
      expect((document.getElementById('under') as HTMLElement).style.backgroundColor).toBe('');
    });

    it('apply highlights all issues in a shared limit when total exceeds the bucket', () => {
      document.body.innerHTML = `
        <div id="ghx-pool">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue" id="j1">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            </div>
            <div class="ghx-issue" id="j2">
              <img class="ghx-avatar-img" alt="Assignee: Jane Doe" />
            </div>
          </div>
        </div>
      `;

      const model = modelWithLimits([
        {
          id: 1,
          persons: [personJohn, personJane],
          limit: 1,
          columns: [],
          swimlanes: [],
          showAllPersonIssues: true,
          sharedLimit: true,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';

      model.apply();

      expect((document.getElementById('j1') as HTMLElement).style.backgroundColor).toBe(OVER_LIMIT_BG);
      expect((document.getElementById('j2') as HTMLElement).style.backgroundColor).toBe(OVER_LIMIT_BG);
    });
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
      { id: 1, persons: [personJohn], limit: 5, columns: [], swimlanes: [], showAllPersonIssues: true },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';
    model.calculateStats();
    const { id } = model.stats[0];

    model.toggleActiveLimitId(id);
    expect(model.activeLimitId).toBe(id);

    model.toggleActiveLimitId(id);
    expect(model.activeLimitId).toBeNull();
  });

  it('reset restores stats, activePerson and issue selector defaults', () => {
    const model = modelWithLimits([]);
    model.stats = [{ issues: [] } as any];
    model.activePerson = { limitId: 42, personName: null };
    model.cssSelectorOfIssues = '.custom';
    model.setSwimlanesActive(false);

    model.reset();

    expect(model.stats).toEqual([]);
    expect(model.activePerson).toBeNull();
    expect(model.activeLimitId).toBeNull();
    expect(model.cssSelectorOfIssues).toBe('.ghx-issue');
  });

  describe('swimlane strategy handling', () => {
    // Jira's editmodel returns historical query swimlanes regardless of the active strategy.
    // When the board's strategy is not "custom", those saved entries do not exist in the DOM,
    // so the runtime must ignore the swimlane filter on saved limits to avoid filtering everything out.

    it('calculateStats ignores saved swimlane filter when swimlanes are inactive', () => {
      // Board renders without swimlane wrappers (strategy = "none" / "epic" / "assignee" / etc.)
      document.body.innerHTML = `
        <div id="ghx-pool">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue" id="i1">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            </div>
            <div class="ghx-issue" id="i2">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            </div>
          </div>
        </div>
      `;

      const model = modelWithLimits([
        {
          id: 1,
          persons: [personJohn],
          limit: 5,
          columns: [],
          // Stale swimlane filter saved by the user when the board still had custom swimlanes.
          swimlanes: [{ id: 'sw-old', name: 'Old Swimlane' }],
          showAllPersonIssues: true,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';
      model.setSwimlanesActive(false);

      const stats = model.calculateStats();

      expect(stats[0].issues.length).toBe(2);
    });

    it('calculateStats keeps respecting saved swimlane filter when swimlanes are active (default)', () => {
      // Custom swimlanes, but the limit only targets sw1.
      document.body.innerHTML = `
        <div class="ghx-swimlane-header" aria-label="custom swimlanes"></div>
        <div id="ghx-pool">
          <div class="ghx-swimlane" swimlane-id="sw1">
            <div class="ghx-swimlane-header"></div>
            <div class="ghx-column" data-column-id="col1">
              <div class="ghx-issue">
                <img class="ghx-avatar-img" alt="Assignee: John Doe" />
              </div>
            </div>
          </div>
          <div class="ghx-swimlane" swimlane-id="sw2">
            <div class="ghx-swimlane-header"></div>
            <div class="ghx-column" data-column-id="col1">
              <div class="ghx-issue">
                <img class="ghx-avatar-img" alt="Assignee: John Doe" />
              </div>
            </div>
          </div>
        </div>
      `;

      const model = modelWithLimits([
        {
          id: 1,
          persons: [personJohn],
          limit: 10,
          columns: [],
          swimlanes: [{ id: 'sw1', name: 'Team A' }],
          showAllPersonIssues: true,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';
      // No setSwimlanesActive call → defaults to true (custom strategy).

      const stats = model.calculateStats();

      expect(stats[0].issues.length).toBe(1);
    });

    it('showOnlyChosen ignores saved swimlane filter when swimlanes are inactive', () => {
      document.body.innerHTML = `
        <div id="ghx-pool">
          <div class="ghx-column" data-column-id="col1">
            <div class="ghx-issue" id="a">
              <img class="ghx-avatar-img" alt="Assignee: John Doe" />
            </div>
          </div>
        </div>
      `;

      const model = modelWithLimits([
        {
          id: 1,
          persons: [personJohn],
          limit: 5,
          columns: [],
          // Saved swimlane that no longer exists in DOM.
          swimlanes: [{ id: 'sw-old', name: 'Old' }],
          // showAllPersonIssues=false → goes through the per-issue scope check.
          showAllPersonIssues: false,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';
      model.setSwimlanesActive(false);
      model.calculateStats();
      model.activeLimitId = model.stats[0].id;

      model.showOnlyChosen();

      expect(document.getElementById('a')!.classList.contains('no-visibility')).toBe(false);
    });

    it('reset restores swimlanesActive to true', () => {
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
        {
          id: 1,
          persons: [personJohn],
          limit: 5,
          columns: [],
          swimlanes: [{ id: 'sw-missing', name: 'Missing' }],
          showAllPersonIssues: true,
        },
      ]);
      model.cssSelectorOfIssues = '.ghx-issue';
      model.setSwimlanesActive(false);

      model.reset();

      // After reset, default behavior (active=true) → saved swimlanes filter is respected,
      // so issues without a matching swimlaneId in the DOM are not counted.
      const stats = model.calculateStats();
      expect(stats[0].issues.length).toBe(0);
    });
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
        persons: [personJohn],
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

  // Regression for: "0/N counter despite issues being present" on boards where
  // only the default swimlane (e.g. "Everything Else") is visible. Jira does
  // not render `.ghx-swimlane-header` for default swimlanes, so the legacy
  // header-based swimlane discovery returned an empty list and made every
  // saved swimlane filter reject every issue.
  it('calculateStats counts issues inside a swimlane that has no .ghx-swimlane-header (default swimlane)', () => {
    document.body.innerHTML = `
      <div id="ghx-pool">
        <div class="ghx-swimlane ghx-first" swimlane-id="1201235">
          <ul class="ghx-columns">
            <li class="ghx-column" data-column-id="col1">
              <div class="ghx-issue" id="i1">
                <img class="ghx-avatar-img" alt="Assignee: John Doe" />
              </div>
              <div class="ghx-issue" id="i2">
                <img class="ghx-avatar-img" alt="Assignee: John Doe" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    `;

    const model = modelWithLimits([
      {
        id: 1,
        persons: [personJohn],
        limit: 5,
        columns: [{ id: 'col1', name: 'To Do' }],
        // Saved both possible swimlanes; only "1201235" survives in the DOM.
        swimlanes: [
          { id: '1201234', name: 'Expedite' },
          { id: '1201235', name: 'Everything Else' },
        ],
        showAllPersonIssues: true,
      },
    ]);
    model.cssSelectorOfIssues = '.ghx-issue';

    const stats = model.calculateStats();

    expect(stats[0].issues.length).toBe(2);
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
        persons: [personJohn],
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
        persons: [personJohn],
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

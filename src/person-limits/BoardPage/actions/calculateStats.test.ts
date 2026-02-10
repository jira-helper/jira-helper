import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { globalContainer } from 'dioma';
import { registerLogger } from 'src/shared/Logger';
import { registerPersonLimitsBoardPageObjectInDI } from '../pageObject';
import { useRuntimeStore, getInitialState } from '../stores';
import { calculateStats } from './calculateStats';

describe('calculateStats', () => {
  beforeEach(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
    registerPersonLimitsBoardPageObjectInDI(globalContainer);
    useRuntimeStore.setState(getInitialState());
  });

  afterEach(() => {
    globalContainer.reset();
    document.body.innerHTML = '';
  });

  it('should count issues for a person limit', () => {
    // Setup DOM
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

    // Setup store
    useRuntimeStore.getState().actions.setCssSelectorOfIssues('.ghx-issue');

    // Setup limits
    const personLimits = {
      limits: [
        {
          id: 1,
          person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
          limit: 5,
          columns: [],
          swimlanes: [],
        },
      ],
    };

    // Act
    const stats = calculateStats(personLimits);

    // Assert
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

    useRuntimeStore.getState().actions.setCssSelectorOfIssues('.ghx-issue');

    const personLimits = {
      limits: [
        {
          id: 1,
          person: { name: 'john.doe', displayName: 'John Doe', avatar: '' },
          limit: 2,
          columns: [{ id: 'col2', name: 'In Progress' }],
          swimlanes: [],
        },
      ],
    };

    const stats = calculateStats(personLimits);

    expect(stats).toHaveLength(1);
    expect(stats[0].issues.length).toBe(2);
  });
});

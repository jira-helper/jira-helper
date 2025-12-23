import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { IssueLink } from '../types';
import { useAdditionalCardElementsBoardPropertyStore } from './additionalCardElementsBoardProperty';

describe('Additional Card Elements Store', () => {
  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
  });

  beforeEach(() => {
    // Reset to initial state before each test
    useAdditionalCardElementsBoardPropertyStore.setState(useAdditionalCardElementsBoardPropertyStore.getInitialState());
  });

  afterAll(() => {
    globalContainer.reset();
  });
  describe('IssueLink structure', () => {
    it('should support field mode issue selector', () => {
      const issueLink: IssueLink = {
        name: 'Field-based Link',
        linkType: { id: 'relates', direction: 'inward' },
        issueSelector: {
          mode: 'field',
          fieldId: 'priority',
          value: 'High',
        },
        color: '#ff0000',
      };

      expect(issueLink.issueSelector?.mode).toBe('field');
      expect(issueLink.issueSelector?.fieldId).toBe('priority');
      expect(issueLink.issueSelector?.value).toBe('High');
    });

    it('should support JQL mode issue selector', () => {
      const issueLink: IssueLink = {
        name: 'JQL-based Link',
        linkType: { id: 'blocks', direction: 'outward' },
        issueSelector: {
          mode: 'jql',
          jql: 'status != "Done" AND priority in ("High", "Critical")',
        },
        color: '#00ff00',
      };

      expect(issueLink.issueSelector?.mode).toBe('jql');
      expect(issueLink.issueSelector?.jql).toBe('status != "Done" AND priority in ("High", "Critical")');
    });

    it('should support issue link without selector', () => {
      const issueLink: IssueLink = {
        name: 'Simple Link',
        linkType: { id: 'relates', direction: 'inward' },
      };

      expect(issueLink.issueSelector).toBeUndefined();
    });
  });

  describe('Board property structure', () => {
    it('should support all required fields', () => {
      const boardProperty = {
        enabled: true,
        columnsToTrack: ['To Do', 'In Progress', 'Done'],
        showInBacklog: true,
        issueLinks: [
          {
            name: 'Parent Tasks',
            linkType: { id: 'relates', direction: 'inward' },
            issueSelector: {
              mode: 'jql',
              jql: 'status != "Done"',
            },
            color: '#ff0000',
          },
        ],
      };

      expect(boardProperty.enabled).toBe(true);
      expect(boardProperty.columnsToTrack).toHaveLength(3);
      expect(boardProperty.showInBacklog).toBe(true);
      expect(boardProperty.issueLinks).toHaveLength(1);
    });
  });

  describe('setShowInBacklog action', () => {
    it('should update showInBacklog to true', () => {
      // ARRANGE
      const store = useAdditionalCardElementsBoardPropertyStore.getState();
      expect(store.data.showInBacklog).toBe(false);

      // ACT
      store.actions.setShowInBacklog(true);

      // ASSERT
      const { showInBacklog } = useAdditionalCardElementsBoardPropertyStore.getState().data;
      expect(showInBacklog).toBe(true);
    });

    it('should update showInBacklog to false', () => {
      // ARRANGE
      const store = useAdditionalCardElementsBoardPropertyStore.getState();
      store.actions.setShowInBacklog(true);

      // Verify it was set to true
      const stateAfterTrue = useAdditionalCardElementsBoardPropertyStore.getState();
      expect(stateAfterTrue.data.showInBacklog).toBe(true);

      // ACT
      store.actions.setShowInBacklog(false);

      // ASSERT
      const { showInBacklog } = useAdditionalCardElementsBoardPropertyStore.getState().data;
      expect(showInBacklog).toBe(false);
    });

    it('should have showInBacklog default value as false', () => {
      // ARRANGE & ACT
      const { showInBacklog } = useAdditionalCardElementsBoardPropertyStore.getState().data;

      // ASSERT
      expect(showInBacklog).toBe(false);
    });
  });

  describe('loadAdditionalCardElementsBoardProperty with showInBacklog', () => {
    it('should load showInBacklog from Board Property', () => {
      // This test verifies that setData correctly handles showInBacklog
      // ARRANGE
      const store = useAdditionalCardElementsBoardPropertyStore.getState();
      const testData = {
        enabled: true,
        showInBacklog: true,
        columnsToTrack: ['To Do'],
        issueLinks: [],
      };

      // ACT
      store.actions.setData(testData);

      // ASSERT
      const { data } = useAdditionalCardElementsBoardPropertyStore.getState();
      expect(data.showInBacklog).toBe(true);
      expect(data.enabled).toBe(true);
    });

    it('should use default false when showInBacklog is not provided', () => {
      // ARRANGE
      const store = useAdditionalCardElementsBoardPropertyStore.getState();
      const testData = {
        enabled: true,
        columnsToTrack: ['To Do'],
        issueLinks: [],
        // showInBacklog is missing
      };

      // ACT
      store.actions.setData(testData);

      // ASSERT
      const { data } = useAdditionalCardElementsBoardPropertyStore.getState();
      expect(data.showInBacklog).toBe(false); // Should use default from initialData
      expect(data.enabled).toBe(true);
    });
  });
});

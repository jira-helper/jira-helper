import { describe, it, expect } from 'vitest';
import { IssueLink } from '../types';

describe('Additional Card Elements Store Types', () => {
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
      expect(boardProperty.issueLinks).toHaveLength(1);
    });
  });
});

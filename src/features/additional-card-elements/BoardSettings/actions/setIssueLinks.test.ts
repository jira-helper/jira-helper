import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { setIssueLinks } from './setIssueLinks';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';
import { IssueLink } from '../../types';

describe('setIssueLinks', () => {
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

  it('should update issueLinks with provided array', () => {
    // ARRANGE
    const issueLinks: IssueLink[] = [
      {
        name: 'Parent Tasks',
        linkType: { id: '1', direction: 'inward' },
        issueSelector: { mode: 'jql', jql: 'status = "Open"' },
      },
      {
        name: 'Child Tasks',
        linkType: { id: '2', direction: 'outward' },
        issueSelector: { mode: 'jql', jql: 'priority = "High"' },
      },
    ];

    // ACT
    setIssueLinks(issueLinks);

    // ASSERT
    const { issueLinks: result } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(result).toEqual(issueLinks);
  });

  it('should handle empty issue links array', () => {
    // ARRANGE
    const issueLinks: IssueLink[] = [];

    // ACT
    setIssueLinks(issueLinks);

    // ASSERT
    const { issueLinks: result } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(result).toEqual([]);
  });

  it('should replace existing issueLinks with new array', () => {
    // ARRANGE - Set initial state with some links
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        issueLinks: [{ name: 'Old Link', linkType: { id: 'old', direction: 'inward' }, jql: 'old' }],
      },
    }));

    const newIssueLinks: IssueLink[] = [
      {
        name: 'New Link 1',
        linkType: { id: 'new1', direction: 'outward' },
        issueSelector: { mode: 'jql', jql: 'new1' },
      },
      {
        name: 'New Link 2',
        linkType: { id: 'new2', direction: 'inward' },
        issueSelector: { mode: 'jql', jql: 'new2' },
      },
    ];

    // ACT
    setIssueLinks(newIssueLinks);

    // ASSERT
    const { issueLinks: result } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(result).toEqual(newIssueLinks);
  });
});

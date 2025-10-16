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
      { linkType: { id: '1', direction: 'inward' }, jql: 'status = "Open"' },
      { linkType: { id: '2', direction: 'outward' }, jql: 'priority = "High"' },
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
        issueLinks: [{ linkType: { id: 'old', direction: 'inward' }, jql: 'old' }],
      },
    }));

    const newIssueLinks: IssueLink[] = [
      { linkType: { id: 'new1', direction: 'outward' }, jql: 'new1' },
      { linkType: { id: 'new2', direction: 'inward' }, jql: 'new2' },
    ];

    // ACT
    setIssueLinks(newIssueLinks);

    // ASSERT
    const { issueLinks: result } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(result).toEqual(newIssueLinks);
  });
});

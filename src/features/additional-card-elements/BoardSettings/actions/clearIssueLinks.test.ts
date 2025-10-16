import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { clearIssueLinks } from './clearIssueLinks';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';

describe('clearIssueLinks', () => {
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

  it('should clear all issueLinks', () => {
    // ARRANGE - Set initial state with some links
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        issueLinks: [
          { linkType: { id: '1', direction: 'inward' }, jql: 'status = "Open"' },
          { linkType: { id: '2', direction: 'outward' }, jql: 'priority = "High"' },
        ],
      },
    }));

    // ACT
    clearIssueLinks();

    // ASSERT
    const { issueLinks } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(issueLinks).toEqual([]);
  });

  it('should work even if issueLinks is already empty', () => {
    // ARRANGE - Ensure empty state
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        issueLinks: [],
      },
    }));

    // ACT
    clearIssueLinks();

    // ASSERT
    const { issueLinks } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(issueLinks).toEqual([]);
  });

  it('should be callable multiple times', () => {
    // ARRANGE - Set initial state with some links
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        issueLinks: [{ linkType: { id: '1', direction: 'inward' }, jql: 'status = "Open"' }],
      },
    }));

    // ACT - Call multiple times
    clearIssueLinks();
    clearIssueLinks();

    // ASSERT
    const { issueLinks } = useAdditionalCardElementsBoardPropertyStore.getState().data;
    expect(issueLinks).toEqual([]);
  });
});

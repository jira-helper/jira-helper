/* eslint-disable react/button-has-type */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IssueLinkSettings } from './IssueLinkSettings';

// Mock the store
const mockStore = {
  data: {
    enabled: true,
    columnsToTrack: [] as string[],
    issueLinks: [] as any[],
  },
  actions: {
    setEnabled: vi.fn(),
    setData: vi.fn(),
    setColumns: vi.fn(),
    setIssueLinks: vi.fn(),
    addIssueLink: vi.fn(),
    updateIssueLink: vi.fn(),
    removeIssueLink: vi.fn(),
    clearIssueLinks: vi.fn(),
  },
};

vi.mock('../../stores/additionalCardElementsBoardProperty', () => ({
  useAdditionalCardElementsBoardPropertyStore: () => mockStore,
}));

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: () => ({
    issueLinksTitle: 'Issue Link Configurations',
    issueLinksDescription: 'Configure how related issues are displayed on cards.',
    addLink: 'Add Link Configuration',
    clearAll: 'Clear All Configurations',
    noLinksConfigured: 'No link configurations yet.',
    loadingLinkTypes: 'Loading available link types...',
    errorLoadingLinkTypes: 'Failed to load link types.',
  }),
}));

// Mock the useGetIssueLinkTypes hook
const mockUseGetIssueLinkTypes = vi.fn(() => ({
  linkTypes: [
    { id: 'relates', outward: 'relates to', inward: 'is related to' },
    { id: 'blocks', outward: 'blocks', inward: 'is blocked by' },
  ],
  isLoading: false,
  error: null,
}));

vi.mock('src/shared/jira/stores/useGetIssueLinkTypes', () => ({
  useGetIssueLinkTypes: () => mockUseGetIssueLinkTypes(),
}));

// Mock the IssueLinkItem component
vi.mock('./IssueLinkItem', () => ({
  IssueLinkItem: ({ link, index, onUpdate, onRemove }: any) => (
    <div data-testid={`issue-link-item-${index}`}>
      <span>{link.name}</span>
      <button onClick={() => onUpdate(index, { ...link, name: 'Updated Link' })}>Update</button>
      <button onClick={() => onRemove(index)}>Remove</button>
    </div>
  ),
}));

describe('IssueLinkSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default state
    mockUseGetIssueLinkTypes.mockReturnValue({
      linkTypes: [
        { id: 'relates', outward: 'relates to', inward: 'is related to' },
        { id: 'blocks', outward: 'blocks', inward: 'is blocked by' },
      ],
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders with empty issue links', () => {
      mockStore.data.issueLinks = [];

      render(<IssueLinkSettings />);

      expect(screen.getByText('Issue Link Configurations')).toBeInTheDocument();
      expect(screen.getByText('Configure how related issues are displayed on cards.')).toBeInTheDocument();
      expect(screen.getByText('No link configurations yet.')).toBeInTheDocument();
      expect(screen.getByTestId('add-issue-link-button')).toBeInTheDocument();
      expect(screen.queryByTestId('clear-all-issue-links-button')).not.toBeInTheDocument();
    });

    it('renders with existing issue links', () => {
      mockStore.data.issueLinks = [
        {
          name: 'Test Link',
          linkType: { id: 'relates', direction: 'inward' },
          issueSelector: { mode: 'jql', jql: 'status = "Open"' },
        },
      ];

      render(<IssueLinkSettings />);

      expect(screen.getByTestId('issue-link-item-0')).toBeInTheDocument();
      expect(screen.getByText('Test Link')).toBeInTheDocument();
      expect(screen.getByTestId('clear-all-issue-links-button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('adds new issue link when add button is clicked', () => {
      mockStore.data.issueLinks = [];

      render(<IssueLinkSettings />);

      const addButton = screen.getByTestId('add-issue-link-button');
      fireEvent.click(addButton);

      expect(mockStore.actions.addIssueLink).toHaveBeenCalledWith({
        name: 'Link 1',
        linkType: { id: 'relates', direction: 'outward' },
        trackAllTasks: true,
        trackAllLinkedTasks: true,
      });
    });

    it('clears all issue links when clear button is clicked', () => {
      mockStore.data.issueLinks = [
        {
          name: 'Test Link',
          linkType: { id: 'relates', direction: 'inward' },
          issueSelector: { mode: 'jql', jql: 'status = "Open"' },
        },
      ];

      render(<IssueLinkSettings />);

      const clearButton = screen.getByTestId('clear-all-issue-links-button');
      fireEvent.click(clearButton);

      expect(mockStore.actions.clearIssueLinks).toHaveBeenCalled();
    });

    it('updates issue link when update is called', () => {
      mockStore.data.issueLinks = [
        {
          name: 'Test Link',
          linkType: { id: 'relates', direction: 'inward' },
          issueSelector: { mode: 'jql', jql: 'status = "Open"' },
        },
      ];

      render(<IssueLinkSettings />);

      const updateButton = screen.getByText('Update');
      fireEvent.click(updateButton);

      expect(mockStore.actions.updateIssueLink).toHaveBeenCalledWith(0, {
        name: 'Updated Link',
        linkType: { id: 'relates', direction: 'inward' },
        issueSelector: { mode: 'jql', jql: 'status = "Open"' },
      });
    });

    it('removes issue link when remove is called', () => {
      mockStore.data.issueLinks = [
        {
          name: 'Test Link',
          linkType: { id: 'relates', direction: 'inward' },
          issueSelector: { mode: 'jql', jql: 'status = "Open"' },
        },
      ];

      render(<IssueLinkSettings />);

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(mockStore.actions.removeIssueLink).toHaveBeenCalledWith(0);
    });
  });

  describe('Loading States', () => {
    it('shows loading state when link types are loading', () => {
      // Mock the hook to return loading state
      mockUseGetIssueLinkTypes.mockReturnValueOnce({
        linkTypes: [],
        isLoading: true,
        error: null,
      });

      const { container } = render(<IssueLinkSettings />);

      // Check that Spin component is rendered (it has ant-spin class)
      const spinElement = container.querySelector('.ant-spin');
      expect(spinElement).toBeInTheDocument();
    });

    it('shows error state when link types fail to load', () => {
      // Mock the hook to return error state
      mockUseGetIssueLinkTypes.mockReturnValueOnce({
        linkTypes: [],
        isLoading: false,
        error: new Error('Failed to load') as any,
      });

      render(<IssueLinkSettings />);

      expect(screen.getByText('Failed to load link types.')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdditionalCardElementsSettings } from './AdditionalCardElementsSettings';

// Mock the store
const mockStore = {
  data: {
    enabled: false,
    columnsToTrack: [],
    issueLinks: [],
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

vi.mock('../stores/additionalCardElementsBoardProperty', () => ({
  useAdditionalCardElementsBoardPropertyStore: () => mockStore,
}));

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: () => ({
    title: 'Additional Card Elements',
    resetButton: 'Reset all settings',
    enableFeature: 'Enable additional card elements',
    columnsTitle: 'Column Settings',
    columnsDescription: 'Select columns where additional card elements should be displayed',
    issueLinksTitle: 'Issue Link Settings',
  }),
}));

// Mock the ColumnSelectorContainer
vi.mock('src/shared/components', () => ({
  ColumnSelectorContainer: ({ title, description, testIdPrefix }: any) => (
    <div data-testid={`${testIdPrefix}-column-selector`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

// Mock the IssueLinkSettings
vi.mock('./IssueLinkSettings', () => ({
  IssueLinkSettings: () => <div data-testid="issue-link-settings">Issue Link Settings</div>,
}));

describe('AdditionalCardElementsSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with disabled state', () => {
      mockStore.data.enabled = false;

      render(<AdditionalCardElementsSettings />);

      expect(screen.getByText('Additional Card Elements')).toBeInTheDocument();
      expect(screen.getByText('Enable additional card elements')).toBeInTheDocument();
      expect(screen.getByTestId('additional-card-elements-enabled-checkbox')).not.toBeChecked();
      expect(screen.getByTestId('reset-board-property-button')).toBeDisabled();
      expect(screen.queryByTestId('additional-card-elements-column-selector')).not.toBeInTheDocument();
      expect(screen.queryByTestId('issue-link-settings')).not.toBeInTheDocument();
    });

    it('renders with enabled state', () => {
      mockStore.data.enabled = true;

      render(<AdditionalCardElementsSettings />);

      expect(screen.getByTestId('additional-card-elements-enabled-checkbox')).toBeChecked();
      expect(screen.getByTestId('reset-board-property-button')).not.toBeDisabled();
      expect(screen.getByTestId('additional-card-elements-column-selector')).toBeInTheDocument();
      expect(screen.getByTestId('issue-link-settings')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('toggles enabled state when checkbox is clicked', () => {
      mockStore.data.enabled = false;

      render(<AdditionalCardElementsSettings />);

      const checkbox = screen.getByTestId('additional-card-elements-enabled-checkbox');
      fireEvent.click(checkbox);

      expect(mockStore.actions.setEnabled).toHaveBeenCalledWith(true);
    });

    it('resets settings when reset button is clicked', () => {
      mockStore.data.enabled = true;

      render(<AdditionalCardElementsSettings />);

      const resetButton = screen.getByTestId('reset-board-property-button');
      fireEvent.click(resetButton);

      expect(mockStore.actions.setData).toHaveBeenCalledWith({
        enabled: false,
        columnsToTrack: [],
        issueLinks: [],
      });
    });

    it('does not show additional settings when disabled', () => {
      mockStore.data.enabled = false;

      render(<AdditionalCardElementsSettings />);

      expect(screen.queryByTestId('additional-card-elements-column-selector')).not.toBeInTheDocument();
      expect(screen.queryByTestId('issue-link-settings')).not.toBeInTheDocument();
    });

    it('shows additional settings when enabled', () => {
      mockStore.data.enabled = true;

      render(<AdditionalCardElementsSettings />);

      expect(screen.getByTestId('additional-card-elements-column-selector')).toBeInTheDocument();
      expect(screen.getByTestId('issue-link-settings')).toBeInTheDocument();
    });
  });

  describe('Column Settings Integration', () => {
    it('passes correct props to ColumnSelectorContainer when enabled', () => {
      mockStore.data.enabled = true;
      mockStore.data.columnsToTrack = ['To Do', 'In Progress'];

      render(<AdditionalCardElementsSettings />);

      const columnSelector = screen.getByTestId('additional-card-elements-column-selector');
      expect(columnSelector).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('uses data from store for checkbox state', () => {
      mockStore.data.enabled = true;

      render(<AdditionalCardElementsSettings />);

      expect(screen.getByTestId('additional-card-elements-enabled-checkbox')).toBeChecked();
    });

    it('uses data from store for button disabled state', () => {
      mockStore.data.enabled = false;

      render(<AdditionalCardElementsSettings />);

      expect(screen.getByTestId('reset-board-property-button')).toBeDisabled();
    });

    it('uses data from store for columns', () => {
      mockStore.data.enabled = true;
      mockStore.data.columnsToTrack = ['Done'];

      render(<AdditionalCardElementsSettings />);

      expect(screen.getByTestId('additional-card-elements-column-selector')).toBeInTheDocument();
    });
  });
});

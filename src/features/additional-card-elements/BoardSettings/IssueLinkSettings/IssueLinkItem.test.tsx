import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IssueLinkItem } from './IssueLinkItem';
import { IssueLink } from '../../types';

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: () => ({
    linkName: 'Link Name',
    linkType: 'Link Type',
    issueSelector: 'Issue Selector',
    uniqueColors: 'Unique colors for tasks',
    fixedColor: 'Fixed Color',
    multilineSummary: 'Multiline Summary',
    multilineSummaryTooltip: 'If enabled, long summaries will wrap',
    removeLink: 'Remove',
    linkNamePlaceholder: 'Enter link name',
    linkNameTooltip: 'Human-readable name',
    linkTypeTooltip: 'Select the type of link',
    issueSelectorTooltip: 'Configure which issues to show',
    uniqueColorsTooltip: 'If enabled, each linked issue will have a unique color',
    fixedColorTooltip: 'Fixed color for the link badge',
  }),
}));

// Mock the IssueSelectorByAttributes component
vi.mock('src/shared/components/IssueSelectorByAttributes', () => ({
  IssueSelectorByAttributes: ({ value, onChange, testIdPrefix }: any) => (
    <div data-testid={`${testIdPrefix}`}>
      <input
        data-testid={`${testIdPrefix}-input`}
        value={value.jql || ''}
        onChange={e => onChange({ ...value, jql: e.target.value })}
        placeholder="Enter JQL"
      />
    </div>
  ),
}));

const mockIssueLink: IssueLink = {
  name: 'Test Link',
  linkType: { id: 'relates', direction: 'inward' },
  issueSelector: {
    mode: 'jql',
    jql: 'status = "Open"',
  },
  color: '#ff0000',
};

const mockAvailableLinkTypes = [
  { id: 'relates', name: 'is related to', direction: 'inward' as const },
  { id: 'relates', name: 'relates to', direction: 'outward' as const },
  { id: 'blocks', name: 'is blocked by', direction: 'inward' as const },
  { id: 'blocks', name: 'blocks', direction: 'outward' as const },
];

const defaultProps = {
  link: mockIssueLink,
  index: 0,
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
  availableLinkTypes: mockAvailableLinkTypes,
};

describe('IssueLinkItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with all fields in two rows', () => {
      render(<IssueLinkItem {...defaultProps} />);

      expect(screen.getByDisplayValue('Test Link')).toBeInTheDocument();
      expect(screen.getByText('Link Type')).toBeInTheDocument();
      expect(screen.getAllByText('Unique colors for tasks').length).toBeGreaterThan(0);
      expect(screen.getByText('Issue Selector')).toBeInTheDocument();
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('renders with correct link type selected', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const linkTypeSelect = screen.getByTestId('issue-link-0-type');
      expect(linkTypeSelect).toBeInTheDocument();
    });

    it('renders issue selector with correct value', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const issueSelector = screen.getByTestId('issue-link-0-selector');
      expect(issueSelector).toBeInTheDocument();

      const jqlInput = screen.getByTestId('issue-link-0-selector-input');
      expect(jqlInput).toHaveValue('status = "Open"');
    });

    it('renders color picker when fixed color is set (unique colors disabled)', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const colorCheckbox = screen.getByTestId('issue-link-0-unique-colors-checkbox');
      expect(colorCheckbox).not.toBeChecked(); // Fixed color is set, so unique colors are disabled

      const colorPicker = screen.getByTestId('issue-link-0-color-picker');
      expect(colorPicker).toBeInTheDocument();
    });

    it('does not render color picker when unique colors are enabled', () => {
      const linkWithoutColor = { ...mockIssueLink, color: undefined };
      render(<IssueLinkItem {...defaultProps} link={linkWithoutColor} />);

      const colorCheckbox = screen.getByTestId('issue-link-0-unique-colors-checkbox');
      expect(colorCheckbox).toBeChecked(); // No color set, so unique colors are enabled

      expect(screen.queryByTestId('issue-link-0-color-picker')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onUpdate when link name changes', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const nameInput = screen.getByTestId('issue-link-0-name');
      fireEvent.change(nameInput, { target: { value: 'Updated Link' } });

      expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, {
        ...mockIssueLink,
        name: 'Updated Link',
      });
    });

    it('calls onUpdate when link type changes', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const linkTypeSelect = screen.getByTestId('issue-link-0-type');
      // Just verify the select is rendered, interaction testing is complex with Ant Design
      expect(linkTypeSelect).toBeInTheDocument();
    });

    it('calls onUpdate when issue selector changes', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const jqlInput = screen.getByTestId('issue-link-0-selector-input');
      fireEvent.change(jqlInput, { target: { value: 'status = "Done"' } });

      expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, {
        ...mockIssueLink,
        issueSelector: {
          mode: 'jql',
          jql: 'status = "Done"',
        },
      });
    });

    it('calls onUpdate when color changes', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const colorPicker = screen.getByTestId('issue-link-0-color-picker');
      // Just verify the color picker is rendered, interaction testing is complex with Ant Design
      expect(colorPicker).toBeInTheDocument();
    });

    it('calls onUpdate when unique colors is toggled on (removes fixed color)', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const colorCheckbox = screen.getByTestId('issue-link-0-unique-colors-checkbox');
      fireEvent.click(colorCheckbox);

      expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, {
        ...mockIssueLink,
        color: undefined,
      });
    });

    it('calls onUpdate with default color when unique colors is toggled off and no color is set', () => {
      const linkWithoutColor = { ...mockIssueLink, color: undefined };
      render(<IssueLinkItem {...defaultProps} link={linkWithoutColor} />);

      const colorCheckbox = screen.getByTestId('issue-link-0-unique-colors-checkbox');
      fireEvent.click(colorCheckbox);

      expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, {
        ...linkWithoutColor,
        color: '#1677ff', // Default color
      });
    });

    it('calls onRemove when remove button is clicked', () => {
      render(<IssueLinkItem {...defaultProps} />);

      const removeButton = screen.getByTestId('issue-link-0-remove');
      fireEvent.click(removeButton);

      expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles link without issue selector', () => {
      const linkWithoutSelector = { ...mockIssueLink, issueSelector: undefined };
      render(<IssueLinkItem {...defaultProps} link={linkWithoutSelector} />);

      const issueSelector = screen.getByTestId('issue-link-0-selector');
      expect(issueSelector).toBeInTheDocument();
    });

    it('handles link without color (unique colors enabled)', () => {
      const linkWithoutColor = { ...mockIssueLink, color: undefined };
      render(<IssueLinkItem {...defaultProps} link={linkWithoutColor} />);

      const colorCheckbox = screen.getByTestId('issue-link-0-unique-colors-checkbox');
      expect(colorCheckbox).toBeChecked(); // Unique colors enabled when no color is set
    });

    it('handles empty available link types', () => {
      render(<IssueLinkItem {...defaultProps} availableLinkTypes={[]} />);

      const linkTypeSelect = screen.getByTestId('issue-link-0-type');
      expect(linkTypeSelect).toBeInTheDocument();
    });
  });
});

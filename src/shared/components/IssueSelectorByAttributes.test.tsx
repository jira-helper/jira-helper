import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IssueSelectorByAttributes } from './IssueSelectorByAttributes';
import { IssueSelector } from './IssueSelectorByAttributes.types';

// Mock the JQL parser
vi.mock('src/shared/jql/simpleJqlParser', () => ({
  parseJql: vi.fn((jql: string) => {
    if (jql.includes('invalid')) {
      throw new Error('Invalid JQL syntax');
    }
    return { type: 'valid', jql };
  }),
}));

// Mock the JQL parser info tooltip
vi.mock('src/shared/jql/JqlParserInfoTooltip', () => ({
  JqlParserInfoTooltip: () => <div data-testid="jql-tooltip">JQL Info</div>,
}));

// Mock the throttle utility
vi.mock('src/shared/utils', () => ({
  throttle: (fn: any) => fn,
}));

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: () => ({
    selectField: 'Select field',
    fieldValue: 'Field value',
    jql: 'JQL',
    mode: 'Group by',
    modeField: 'Field value',
    modeJql: 'JQL',
    jqlInvalid: 'Invalid JQL',
    fieldValuePlaceholder: 'Enter field value',
    jqlPlaceholder: 'Enter JQL query',
    fieldTooltip: 'Select a field to filter by',
    valueTooltip: 'Enter the value to match',
    jqlTooltip: 'Enter JQL query to filter issues',
  }),
}));

const mockFields = [
  { id: 'priority', name: 'Priority' },
  { id: 'status', name: 'Status' },
  { id: 'assignee', name: 'Assignee' },
  { id: 'labels', name: 'Labels' },
];

const defaultProps = {
  value: {
    mode: 'field' as const,
    fieldId: '',
    value: '',
    jql: '',
  },
  onChange: vi.fn(),
  fields: mockFields,
  testIdPrefix: 'test-selector',
};

describe('IssueSelectorByAttributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<IssueSelectorByAttributes {...defaultProps} />);

      expect(screen.getByTestId('test-selector-mode')).toBeInTheDocument();
      expect(screen.getByTestId('test-selector-field-select')).toBeInTheDocument();
      expect(screen.getByTestId('test-selector-field-value')).toBeInTheDocument();
    });

    it('renders in JQL mode when specified', () => {
      const props = {
        ...defaultProps,
        value: {
          mode: 'jql' as const,
          fieldId: '',
          value: '',
          jql: 'status = "Open"',
        },
      };

      render(<IssueSelectorByAttributes {...props} />);

      expect(screen.getByTestId('test-selector-jql-input')).toBeInTheDocument();
      expect(screen.queryByTestId('test-selector-field-select')).not.toBeInTheDocument();
    });

    it('renders as disabled when disabled prop is true', () => {
      render(<IssueSelectorByAttributes {...defaultProps} disabled />);

      expect(screen.getByTestId('test-selector-mode')).toBeInTheDocument();
      expect(screen.getByTestId('test-selector-field-select')).toBeInTheDocument();
      expect(screen.getByTestId('test-selector-field-value')).toBeInTheDocument();
    });
  });

  describe('Value synchronization', () => {
    it('syncs field value when prop changes', () => {
      const { rerender } = render(<IssueSelectorByAttributes {...defaultProps} />);

      const newProps = {
        ...defaultProps,
        value: {
          ...defaultProps.value,
          value: 'High',
        },
      };

      rerender(<IssueSelectorByAttributes {...newProps} />);

      const fieldValueInput = screen.getByTestId('test-selector-field-value');
      expect(fieldValueInput).toHaveValue('High');
    });

    it('syncs JQL value when prop changes', () => {
      const props = {
        ...defaultProps,
        value: {
          mode: 'jql' as const,
          fieldId: '',
          value: '',
          jql: '',
        },
      };

      const { rerender } = render(<IssueSelectorByAttributes {...props} />);

      const newProps = {
        ...props,
        value: {
          ...props.value,
          jql: 'status = "Open"',
        },
      };

      rerender(<IssueSelectorByAttributes {...newProps} />);

      const jqlInput = screen.getByTestId('test-selector-jql-input');
      expect(jqlInput).toHaveValue('status = "Open"');
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for form elements', () => {
      render(<IssueSelectorByAttributes {...defaultProps} />);

      expect(screen.getByLabelText('Group by')).toBeInTheDocument();
      expect(screen.getByLabelText('Select field')).toBeInTheDocument();
      expect(screen.getByLabelText('Field value')).toBeInTheDocument();
    });

    it('has proper labels in JQL mode', () => {
      const props = {
        ...defaultProps,
        value: {
          mode: 'jql' as const,
          fieldId: '',
          value: '',
          jql: '',
        },
      };

      render(<IssueSelectorByAttributes {...props} />);

      expect(screen.getByLabelText('JQL')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty fields array', () => {
      const props = {
        ...defaultProps,
        fields: [],
      };

      render(<IssueSelectorByAttributes {...props} />);

      const fieldSelect = screen.getByTestId('test-selector-field-select');
      expect(fieldSelect).toBeInTheDocument();
    });

    it('handles undefined fieldId gracefully', () => {
      const props = {
        ...defaultProps,
        value: {
          ...defaultProps.value,
          fieldId: undefined,
        },
      };

      render(<IssueSelectorByAttributes {...props} />);

      const fieldSelect = screen.getByTestId('test-selector-field-select');
      expect(fieldSelect).toBeInTheDocument();
    });
  });
});

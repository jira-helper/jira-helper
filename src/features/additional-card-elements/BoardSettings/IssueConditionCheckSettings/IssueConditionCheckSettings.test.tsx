import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IssueConditionCheckSettings } from './IssueConditionCheckSettings';
import { IssueConditionCheckItem } from './IssueConditionCheckItem';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';
import { IssueConditionCheck } from '../../types';

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: (texts: Record<string, { en: string; ru: string }>) =>
    Object.fromEntries(Object.entries(texts).map(([key, value]) => [key, value.en])),
}));

describe('IssueConditionCheckSettings', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAdditionalCardElementsBoardPropertyStore.setState({
      data: {
        enabled: true,
        columnsToTrack: [],
        showInBacklog: false,
        issueLinks: [],
        daysInColumn: {
          enabled: false,
          warningThreshold: undefined,
          dangerThreshold: undefined,
          usePerColumnThresholds: false,
          perColumnThresholds: {},
        },
        daysToDeadline: {
          enabled: false,
          fieldId: undefined,
          displayMode: 'always',
          displayThreshold: undefined,
          warningThreshold: undefined,
        },
        issueConditionChecks: [],
      },
      state: 'loaded',
    });
  });

  it('should render the settings card', () => {
    render(<IssueConditionCheckSettings />);

    expect(screen.getByTestId('issue-condition-check-settings')).toBeInTheDocument();
    expect(screen.getByText('Issue Condition Checks')).toBeInTheDocument();
  });

  it('should show empty state when no checks configured', () => {
    render(<IssueConditionCheckSettings />);

    expect(
      screen.getByText(/No condition checks configured yet/)
    ).toBeInTheDocument();
  });

  it('should add a new check when clicking add button', async () => {
    render(<IssueConditionCheckSettings />);

    const addButton = screen.getByTestId('add-condition-check-button');
    await userEvent.click(addButton);

    // Check that a new check was added
    const state = useAdditionalCardElementsBoardPropertyStore.getState();
    expect(state.data.issueConditionChecks).toHaveLength(1);
    expect(state.data.issueConditionChecks[0].name).toBe('Check 1');
  });

  it('should render existing checks', () => {
    // Set up store with existing checks
    useAdditionalCardElementsBoardPropertyStore.setState({
      data: {
        ...useAdditionalCardElementsBoardPropertyStore.getState().data,
        issueConditionChecks: [
          {
            id: 'check-1',
            name: 'Test Check 1',
            enabled: true,
            mode: 'simple',
            icon: 'warning',
            color: 'yellow',
            tooltipText: 'Test tooltip 1',
            jql: 'status = Open',
          },
          {
            id: 'check-2',
            name: 'Test Check 2',
            enabled: false,
            mode: 'withSubtasks',
            icon: 'bug',
            color: 'red',
            tooltipText: 'Test tooltip 2',
            issueJql: 'status = "In Progress"',
            subtaskJql: 'status = "To Do"',
          },
        ],
      },
    });

    render(<IssueConditionCheckSettings />);

    expect(screen.getByTestId('condition-check-item-check-1')).toBeInTheDocument();
    expect(screen.getByTestId('condition-check-item-check-2')).toBeInTheDocument();
  });

  it('should show clear all button when checks exist', () => {
    useAdditionalCardElementsBoardPropertyStore.setState({
      data: {
        ...useAdditionalCardElementsBoardPropertyStore.getState().data,
        issueConditionChecks: [
          {
            id: 'check-1',
            name: 'Test Check',
            enabled: true,
            mode: 'simple',
            icon: 'warning',
            color: 'yellow',
            tooltipText: 'Test',
            jql: 'status = Open',
          },
        ],
      },
    });

    render(<IssueConditionCheckSettings />);

    expect(screen.getByTestId('clear-all-condition-checks-button')).toBeInTheDocument();
  });

  it('should clear all checks when clicking clear all button', async () => {
    useAdditionalCardElementsBoardPropertyStore.setState({
      data: {
        ...useAdditionalCardElementsBoardPropertyStore.getState().data,
        issueConditionChecks: [
          {
            id: 'check-1',
            name: 'Test Check',
            enabled: true,
            mode: 'simple',
            icon: 'warning',
            color: 'yellow',
            tooltipText: 'Test',
            jql: 'status = Open',
          },
        ],
      },
    });

    render(<IssueConditionCheckSettings />);

    const clearButton = screen.getByTestId('clear-all-condition-checks-button');
    await userEvent.click(clearButton);

    const state = useAdditionalCardElementsBoardPropertyStore.getState();
    expect(state.data.issueConditionChecks).toHaveLength(0);
  });
});

describe('IssueConditionCheckItem', () => {
  const defaultCheck: IssueConditionCheck = {
    id: 'test-check',
    name: 'Test Check',
    enabled: true,
    mode: 'simple',
    icon: 'warning',
    color: 'yellow',
    tooltipText: 'Test tooltip',
    jql: 'status = Open',
  };

  const defaultProps = {
    check: defaultCheck,
    onUpdate: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the check item', () => {
    render(<IssueConditionCheckItem {...defaultProps} />);

    expect(screen.getByTestId('condition-check-item-test-check')).toBeInTheDocument();
  });

  it('should display check name', () => {
    render(<IssueConditionCheckItem {...defaultProps} />);

    expect(screen.getByDisplayValue('Test Check')).toBeInTheDocument();
  });

  it('should toggle enabled state', async () => {
    const onUpdate = vi.fn();
    render(<IssueConditionCheckItem {...defaultProps} onUpdate={onUpdate} />);

    const enabledSwitch = screen.getByTestId('condition-check-enabled-test-check');
    await userEvent.click(enabledSwitch);

    expect(onUpdate).toHaveBeenCalledWith('test-check', { enabled: false });
  });

  it('should update name when changed', async () => {
    const onUpdate = vi.fn();
    render(<IssueConditionCheckItem {...defaultProps} onUpdate={onUpdate} />);

    const nameInput = screen.getByTestId('condition-check-name-test-check');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');

    expect(onUpdate).toHaveBeenCalled();
  });

  it('should show simple JQL input in simple mode', () => {
    render(<IssueConditionCheckItem {...defaultProps} />);

    expect(screen.getByTestId('condition-check-jql-test-check')).toBeInTheDocument();
    expect(screen.queryByTestId('condition-check-issue-jql-test-check')).not.toBeInTheDocument();
    expect(screen.queryByTestId('condition-check-subtask-jql-test-check')).not.toBeInTheDocument();
  });

  it('should show issue and subtask JQL inputs in withSubtasks mode', () => {
    const checkWithSubtasks: IssueConditionCheck = {
      ...defaultCheck,
      mode: 'withSubtasks',
      issueJql: 'status = "In Progress"',
      subtaskJql: 'status = "To Do"',
    };

    render(<IssueConditionCheckItem {...defaultProps} check={checkWithSubtasks} />);

    expect(screen.queryByTestId('condition-check-jql-test-check')).not.toBeInTheDocument();
    expect(screen.getByTestId('condition-check-issue-jql-test-check')).toBeInTheDocument();
    expect(screen.getByTestId('condition-check-subtask-jql-test-check')).toBeInTheDocument();
  });

  it('should call onRemove when remove button clicked', async () => {
    const onRemove = vi.fn();
    render(<IssueConditionCheckItem {...defaultProps} onRemove={onRemove} />);

    const removeButton = screen.getByTestId('condition-check-remove-test-check');
    await userEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith('test-check');
  });

  it('should show JQL validation status for valid JQL', () => {
    render(<IssueConditionCheckItem {...defaultProps} />);

    expect(screen.getByText('JQL is valid')).toBeInTheDocument();
  });

  it('should show JQL validation error for invalid JQL', () => {
    const checkWithInvalidJql: IssueConditionCheck = {
      ...defaultCheck,
      jql: 'invalid jql with spaces',
    };

    render(<IssueConditionCheckItem {...defaultProps} check={checkWithInvalidJql} />);

    expect(screen.getByText(/JQL is invalid/)).toBeInTheDocument();
  });

  it('should display icon selector', () => {
    render(<IssueConditionCheckItem {...defaultProps} />);

    expect(screen.getByTestId('condition-check-icon-test-check')).toBeInTheDocument();
  });

  it('should display color selector', () => {
    render(<IssueConditionCheckItem {...defaultProps} />);

    expect(screen.getByTestId('condition-check-color-test-check')).toBeInTheDocument();
  });

  it('should display tooltip text input', () => {
    render(<IssueConditionCheckItem {...defaultProps} />);

    expect(screen.getByTestId('condition-check-tooltip-test-check')).toBeInTheDocument();
  });

  it('should display preview section', () => {
    render(<IssueConditionCheckItem {...defaultProps} />);

    expect(screen.getByText('Preview:')).toBeInTheDocument();
  });

  it('should have reduced opacity when disabled', () => {
    const disabledCheck: IssueConditionCheck = {
      ...defaultCheck,
      enabled: false,
    };

    render(<IssueConditionCheckItem {...defaultProps} check={disabledCheck} />);

    const card = screen.getByTestId('condition-check-item-test-check');
    expect(card).toHaveStyle({ opacity: '0.7' });
  });
});

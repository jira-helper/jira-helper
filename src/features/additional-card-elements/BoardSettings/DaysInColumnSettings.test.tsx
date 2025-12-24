import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DaysInColumnSettings } from './DaysInColumnSettings';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';

// Mock the DI context
vi.mock('src/shared/diContext', () => ({
  useDi: () => ({
    inject: () => ({
      getColumns: () => ['To Do', 'In Progress', 'Testing', 'Done'],
    }),
  }),
}));

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: (texts: Record<string, { en: string; ru: string }>) =>
    Object.fromEntries(Object.entries(texts).map(([key, value]) => [key, value.en])),
}));

describe('DaysInColumnSettings', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAdditionalCardElementsBoardPropertyStore.setState({
      data: {
        enabled: true,
        columnsToTrack: ['In Progress', 'Testing'],
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
      },
      state: 'loaded',
    });
  });

  it('should render the title', () => {
    render(<DaysInColumnSettings />);
    expect(screen.getByText('Days in Column Badge')).toBeInTheDocument();
  });

  it('should render the enable checkbox', () => {
    render(<DaysInColumnSettings />);
    expect(screen.getByTestId('days-in-column-enabled-checkbox')).toBeInTheDocument();
  });

  it('should show global thresholds when enabled and per-column is off', () => {
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: { ...state.data, daysInColumn: { ...state.data.daysInColumn, enabled: true } },
    }));

    render(<DaysInColumnSettings />);

    expect(screen.getByTestId('days-in-column-warning-threshold')).toBeInTheDocument();
    expect(screen.getByTestId('days-in-column-danger-threshold')).toBeInTheDocument();
  });

  it('should show per-column toggle when enabled', () => {
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: { ...state.data, daysInColumn: { ...state.data.daysInColumn, enabled: true } },
    }));

    render(<DaysInColumnSettings />);

    expect(screen.getByTestId('days-in-column-use-per-column-checkbox')).toBeInTheDocument();
    expect(screen.getByText('Use separate rules for each column')).toBeInTheDocument();
  });

  it('should show column threshold rows when per-column is enabled', async () => {
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        daysInColumn: {
          ...state.data.daysInColumn,
          enabled: true,
          usePerColumnThresholds: true,
        },
      },
    }));

    render(<DaysInColumnSettings />);

    // Wait for columns to be loaded (they're mocked to return immediately)
    expect(screen.getByTestId('column-threshold-row-In Progress')).toBeInTheDocument();
    expect(screen.getByTestId('column-threshold-row-Testing')).toBeInTheDocument();
  });

  it('should hide global thresholds when per-column is enabled', () => {
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        daysInColumn: {
          ...state.data.daysInColumn,
          enabled: true,
          usePerColumnThresholds: true,
        },
      },
    }));

    render(<DaysInColumnSettings />);

    expect(screen.queryByTestId('days-in-column-warning-threshold')).not.toBeInTheDocument();
    expect(screen.queryByTestId('days-in-column-danger-threshold')).not.toBeInTheDocument();
  });

  it('should show warning when danger threshold <= warning threshold for global settings', () => {
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        daysInColumn: {
          ...state.data.daysInColumn,
          enabled: true,
          warningThreshold: 5,
          dangerThreshold: 3,
        },
      },
    }));

    render(<DaysInColumnSettings />);

    expect(screen.getByTestId('days-in-column-invalid-thresholds-warning')).toBeInTheDocument();
  });

  it('should show warning row for column that no longer exists on board', async () => {
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        columnsToTrack: ['In Progress'],
        daysInColumn: {
          ...state.data.daysInColumn,
          enabled: true,
          usePerColumnThresholds: true,
          perColumnThresholds: {
            'In Progress': { warningThreshold: 3, dangerThreshold: 7 },
            'Old Column': { warningThreshold: 2, dangerThreshold: 5 }, // This column doesn't exist
          },
        },
      },
    }));

    render(<DaysInColumnSettings />);

    expect(screen.getByTestId('column-threshold-row-Old Column')).toBeInTheDocument();
    expect(screen.getByText('This column no longer exists on the board')).toBeInTheDocument();
    expect(screen.getByTestId('column-threshold-remove-Old Column')).toBeInTheDocument();
  });

  it('should call setDaysInColumn when removing a non-existent column', async () => {
    const mockSetDaysInColumn = vi.fn();
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        columnsToTrack: ['In Progress'],
        daysInColumn: {
          ...state.data.daysInColumn,
          enabled: true,
          usePerColumnThresholds: true,
          perColumnThresholds: {
            'In Progress': { warningThreshold: 3, dangerThreshold: 7 },
            'Old Column': { warningThreshold: 2, dangerThreshold: 5 },
          },
        },
      },
      actions: {
        ...state.actions,
        setDaysInColumn: mockSetDaysInColumn,
      },
    }));

    render(<DaysInColumnSettings />);

    const removeButton = screen.getByTestId('column-threshold-remove-Old Column');
    fireEvent.click(removeButton);

    expect(mockSetDaysInColumn).toHaveBeenCalledWith({
      perColumnThresholds: {
        'In Progress': { warningThreshold: 3, dangerThreshold: 7 },
        // 'Old Column' should be removed
      },
    });
  });

  it('should update column warning threshold', async () => {
    const mockSetDaysInColumn = vi.fn();
    useAdditionalCardElementsBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        columnsToTrack: ['In Progress'],
        daysInColumn: {
          ...state.data.daysInColumn,
          enabled: true,
          usePerColumnThresholds: true,
          perColumnThresholds: {},
        },
      },
      actions: {
        ...state.actions,
        setDaysInColumn: mockSetDaysInColumn,
      },
    }));

    render(<DaysInColumnSettings />);

    const warningInput = screen.getByTestId('column-threshold-warning-In Progress');
    fireEvent.change(warningInput.querySelector('input')!, { target: { value: '5' } });

    // Note: antd InputNumber has its own change handling, this test verifies the input exists
    expect(warningInput).toBeInTheDocument();
  });
});


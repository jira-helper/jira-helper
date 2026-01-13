import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Container } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { boardPagePageObjectToken, IBoardPagePageObject } from 'src/page-objects/BoardPage';
import { DaysInColumnSettings } from './DaysInColumnSettings';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';
import * as useDaysInColumnSettingsModule from './hooks/useDaysInColumnSettings';

// Mock the texts hook
vi.mock('src/shared/texts', () => ({
  useGetTextsByLocale: (texts: Record<string, { en: string; ru: string }>) =>
    Object.fromEntries(Object.entries(texts).map(([key, value]) => [key, value.en])),
}));

// Mock the hook
vi.mock('./hooks/useDaysInColumnSettings');

describe('DaysInColumnSettings', () => {
  let container: Container;
  const mockGetColumns = vi.fn(() => ['To Do', 'In Progress', 'Testing', 'Done']);

  const defaultHookReturn = {
    daysInColumn: {
      enabled: false,
      warningThreshold: undefined,
      dangerThreshold: undefined,
      usePerColumnThresholds: false,
      perColumnThresholds: {},
    },
    columnsToTrack: ['In Progress', 'Testing'],
    boardColumns: ['To Do', 'In Progress', 'Testing', 'Done'],
    columnsForThresholds: [
      { name: 'In Progress', existsOnBoard: true },
      { name: 'Testing', existsOnBoard: true },
    ],
    hasInvalidGlobalThresholds: false,
    handleEnabledChange: vi.fn(),
    handleWarningThresholdChange: vi.fn(),
    handleDangerThresholdChange: vi.fn(),
    handleUsePerColumnThresholdsChange: vi.fn(),
    handleColumnWarningChange: vi.fn(),
    handleColumnDangerChange: vi.fn(),
    handleRemoveColumn: vi.fn(),
  };

  beforeEach(() => {
    container = new Container();

    // Register mock boardPagePageObject (still needed for DI context)
    const mockBoardPagePageObject: IBoardPagePageObject = {
      selectors: {
        pool: '#ghx-pool',
        issue: '.ghx-issue',
        flagged: '.ghx-flagged',
        grabber: '.ghx-grabber',
        grabberTransparent: '.ghx-grabber-transparent',
        sidebar: '.aui-sidebar',
        column: '.ghx-column',
        columnHeader: '#ghx-column-headers',
        columnTitle: '.ghx-column-title',
        daysInColumn: '.ghx-days',
      },
      classlist: {
        flagged: 'ghx-flagged',
      },
      getColumns: mockGetColumns,
      listenCards: () => () => {},
      getColumnOfIssue: () => '',
      getDaysInColumn: () => null,
      hideDaysInColumn: () => {},
      getHtml: () => '',
    };

    container.register({
      token: boardPagePageObjectToken,
      value: mockBoardPagePageObject,
    });

    mockGetColumns.mockClear();

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

    // Setup default mock return
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue(defaultHookReturn);
  });

  it('should render the title', () => {
    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    expect(screen.getByText('Days in Column Badge')).toBeInTheDocument();
  });

  it('should render the enable checkbox', () => {
    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    expect(screen.getByTestId('days-in-column-enabled-checkbox')).toBeInTheDocument();
  });

  it('should show global thresholds when enabled and per-column is off', () => {
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue({
      ...defaultHookReturn,
      daysInColumn: {
        ...defaultHookReturn.daysInColumn,
        enabled: true,
      },
    });

    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    expect(screen.getByTestId('days-in-column-warning-threshold')).toBeInTheDocument();
    expect(screen.getByTestId('days-in-column-danger-threshold')).toBeInTheDocument();
  });

  it('should show per-column toggle when enabled', () => {
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue({
      ...defaultHookReturn,
      daysInColumn: {
        ...defaultHookReturn.daysInColumn,
        enabled: true,
      },
    });

    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    expect(screen.getByTestId('days-in-column-use-per-column-checkbox')).toBeInTheDocument();
    expect(screen.getByText('Use separate rules for each column')).toBeInTheDocument();
  });

  it('should show column threshold rows when per-column is enabled', () => {
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue({
      ...defaultHookReturn,
      daysInColumn: {
        ...defaultHookReturn.daysInColumn,
        enabled: true,
        usePerColumnThresholds: true,
      },
    });

    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    expect(screen.getByTestId('column-threshold-row-In Progress')).toBeInTheDocument();
    expect(screen.getByTestId('column-threshold-row-Testing')).toBeInTheDocument();
  });

  it('should hide global thresholds when per-column is enabled', () => {
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue({
      ...defaultHookReturn,
      daysInColumn: {
        ...defaultHookReturn.daysInColumn,
        enabled: true,
        usePerColumnThresholds: true,
      },
    });

    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    expect(screen.queryByTestId('days-in-column-warning-threshold')).not.toBeInTheDocument();
    expect(screen.queryByTestId('days-in-column-danger-threshold')).not.toBeInTheDocument();
  });

  it('should show warning when danger threshold <= warning threshold for global settings', () => {
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue({
      ...defaultHookReturn,
      daysInColumn: {
        ...defaultHookReturn.daysInColumn,
        enabled: true,
        warningThreshold: 5,
        dangerThreshold: 3,
      },
      hasInvalidGlobalThresholds: true,
    });

    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    expect(screen.getByTestId('days-in-column-invalid-thresholds-warning')).toBeInTheDocument();
  });

  it('should show warning row for column that no longer exists on board', () => {
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue({
      ...defaultHookReturn,
      columnsToTrack: ['In Progress'],
      daysInColumn: {
        ...defaultHookReturn.daysInColumn,
        enabled: true,
        usePerColumnThresholds: true,
        perColumnThresholds: {
          'In Progress': { warningThreshold: 3, dangerThreshold: 7 },
          'Old Column': { warningThreshold: 2, dangerThreshold: 5 },
        },
      },
      columnsForThresholds: [
        { name: 'In Progress', existsOnBoard: true },
        { name: 'Old Column', existsOnBoard: false },
      ],
    });

    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    expect(screen.getByTestId('column-threshold-row-Old Column')).toBeInTheDocument();
    expect(screen.getByText('This column no longer exists on the board')).toBeInTheDocument();
    expect(screen.getByTestId('column-threshold-remove-Old Column')).toBeInTheDocument();
  });

  it('should call handleRemoveColumn when removing a non-existent column', () => {
    const mockHandleRemoveColumn = vi.fn();
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue({
      ...defaultHookReturn,
      columnsToTrack: ['In Progress'],
      daysInColumn: {
        ...defaultHookReturn.daysInColumn,
        enabled: true,
        usePerColumnThresholds: true,
        perColumnThresholds: {
          'In Progress': { warningThreshold: 3, dangerThreshold: 7 },
          'Old Column': { warningThreshold: 2, dangerThreshold: 5 },
        },
      },
      columnsForThresholds: [
        { name: 'In Progress', existsOnBoard: true },
        { name: 'Old Column', existsOnBoard: false },
      ],
      handleRemoveColumn: mockHandleRemoveColumn,
    });

    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    const removeButton = screen.getByTestId('column-threshold-remove-Old Column');
    fireEvent.click(removeButton);

    expect(mockHandleRemoveColumn).toHaveBeenCalledWith('Old Column');
  });

  it('should render column threshold input', () => {
    vi.mocked(useDaysInColumnSettingsModule.useDaysInColumnSettings).mockReturnValue({
      ...defaultHookReturn,
      columnsToTrack: ['In Progress'],
      daysInColumn: {
        ...defaultHookReturn.daysInColumn,
        enabled: true,
        usePerColumnThresholds: true,
        perColumnThresholds: {},
      },
      columnsForThresholds: [{ name: 'In Progress', existsOnBoard: true }],
    });

    render(
      <WithDi container={container}>
        <DaysInColumnSettings />
      </WithDi>
    );

    const warningInput = screen.getByTestId('column-threshold-warning-In Progress');
    expect(warningInput).toBeInTheDocument();
  });
});

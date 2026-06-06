import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import type { GanttBar } from '../../types';
import { GanttTooltip } from './GanttTooltip';

function makeBar(overrides: Partial<GanttBar> = {}): GanttBar {
  const startDate = new Date('2024-06-01T00:00:00.000Z');
  const endDate = new Date('2024-06-11T00:00:00.000Z');
  return {
    issueKey: 'PROJ-1',
    issueId: '1',
    label: 'PROJ-1: Test issue',
    startDate,
    endDate,
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {},
    statusCategory: 'inProgress',
    ...overrides,
  };
}

function renderTooltip(bar: GanttBar | null, position: { x: number; y: number } | null, showStatusSections = false) {
  render(
    <WithDi container={globalContainer}>
      <GanttTooltip bar={bar} position={position} showStatusSections={showStatusSections} />
    </WithDi>
  );
}

describe('GanttTooltip', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
  });

  it('does not render when bar is null', () => {
    renderTooltip(null, { x: 10, y: 20 });

    expect(screen.queryByTestId('gantt-tooltip')).toBeNull();
  });

  it('does not render when position is null', () => {
    renderTooltip(makeBar(), null);

    expect(screen.queryByTestId('gantt-tooltip')).toBeNull();
  });

  it('shows full bar label, dates, tooltip fields, and applies position', () => {
    const bar = makeBar({
      tooltipFields: { customfield_10001: 'High', priority: 'Major' },
    });
    renderTooltip(bar, { x: 42, y: 24 });

    const tip = screen.getByTestId('gantt-tooltip');
    expect(tip).toBeInTheDocument();
    expect(tip).toHaveClass('jh-gantt-tooltip');
    expect(tip.style.left).toBe('42px');
    expect(tip.style.top).toBe('24px');

    expect(screen.getByText('PROJ-1: Test issue')).toBeInTheDocument();
    expect(screen.getByText(/2024-06-01/)).toBeInTheDocument();
    expect(screen.getByText(/2024-06-11/)).toBeInTheDocument();
    expect(screen.getByText(/customfield_10001/)).toBeInTheDocument();
    expect(screen.getByText(/High/)).toBeInTheDocument();
    expect(screen.getByTestId('gantt-bar-tooltip-field-priority')).toHaveTextContent(/Priority/);
    expect(screen.getByTestId('gantt-bar-tooltip-field-priority')).toHaveTextContent('Major');
  });

  it('always shows the full label as the tooltip title', () => {
    renderTooltip(makeBar({ label: 'PROJ-99: Fix the thing' }), { x: 0, y: 0 });

    expect(screen.getByText('PROJ-99: Fix the thing')).toBeInTheDocument();
  });

  it('shows open-ended warning when isOpenEnded is true', () => {
    renderTooltip(makeBar({ isOpenEnded: true }), { x: 0, y: 0 });

    expect(screen.getByText(/not fixed|open-ended|Открыт/i)).toBeInTheDocument();
  });

  // A3: when status breakdown overrides a custom color rule, tell the user.
  it('shows hint when showStatusSections is true and bar has a barColor', () => {
    renderTooltip(makeBar({ barColor: '#FF5630' }), { x: 0, y: 0 }, true);

    expect(screen.getByTestId('gantt-tooltip-color-overridden')).toBeInTheDocument();
  });

  it('does not show the override hint when showStatusSections is false', () => {
    renderTooltip(makeBar({ barColor: '#FF5630' }), { x: 0, y: 0 }, false);

    expect(screen.queryByTestId('gantt-tooltip-color-overridden')).toBeNull();
  });

  it('does not show the override hint when bar has no barColor', () => {
    renderTooltip(makeBar(), { x: 0, y: 0 }, true);

    expect(screen.queryByTestId('gantt-tooltip-color-overridden')).toBeNull();
  });

  it('shows status history when status sections are enabled', () => {
    renderTooltip(
      makeBar({
        statusSections: [
          {
            statusName: 'ToDo',
            category: 'todo',
            startDate: new Date('2026-01-02T00:00:00.000Z'),
            endDate: new Date('2026-01-03T03:02:01.000Z'),
          },
          {
            statusName: 'Developing',
            category: 'inProgress',
            startDate: new Date('2026-01-03T03:02:01.000Z'),
            endDate: new Date('2026-01-03T03:03:11.000Z'),
          },
          {
            statusName: 'ToDo',
            category: 'todo',
            startDate: new Date('2026-01-03T03:03:11.000Z'),
            endDate: new Date('2026-01-12T06:07:16.000Z'),
          },
        ],
      }),
      { x: 0, y: 0 },
      true
    );

    expect(screen.getByTestId('gantt-tooltip-status-history')).toHaveTextContent('Status History:');
    expect(screen.getByText('ToDo: 2026-01-02 - 2026-01-03 (1d 3h 2m 1sec)')).toBeInTheDocument();
    expect(screen.getByText('Developing: 2026-01-03 (1m 10sec)')).toBeInTheDocument();
    expect(screen.getByText('ToDo: 2026-01-03 - 2026-01-12 (1w 2d 3h 4m 5sec)')).toBeInTheDocument();
  });

  it('does not show status history when status sections are disabled', () => {
    renderTooltip(
      makeBar({
        statusSections: [
          {
            statusName: 'ToDo',
            category: 'todo',
            startDate: new Date('2026-01-02T00:00:00.000Z'),
            endDate: new Date('2026-01-03T00:00:00.000Z'),
          },
        ],
      }),
      { x: 0, y: 0 },
      false
    );

    expect(screen.queryByTestId('gantt-tooltip-status-history')).toBeNull();
  });
});

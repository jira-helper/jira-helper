import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
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

function renderTooltip(bar: GanttBar | null, position: { x: number; y: number } | null) {
  render(
    <WithDi container={globalContainer}>
      <GanttTooltip bar={bar} position={position} />
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
    expect(tip).toHaveStyle({ position: 'fixed', left: '42px', top: '24px' });

    expect(screen.getByText('PROJ-1: Test issue')).toBeInTheDocument();
    expect(screen.getByText(/2024-06-01/)).toBeInTheDocument();
    expect(screen.getByText(/2024-06-11/)).toBeInTheDocument();
    expect(screen.getByText(/customfield_10001/)).toBeInTheDocument();
    expect(screen.getByText(/High/)).toBeInTheDocument();
    expect(screen.getByText(/priority/)).toBeInTheDocument();
    expect(screen.getByText(/Major/)).toBeInTheDocument();
  });

  it('always shows the full label as the tooltip title', () => {
    renderTooltip(makeBar({ label: 'PROJ-99: Fix the thing' }), { x: 0, y: 0 });

    expect(screen.getByText('PROJ-99: Fix the thing')).toBeInTheDocument();
  });

  it('shows open-ended warning when isOpenEnded is true', () => {
    renderTooltip(makeBar({ isOpenEnded: true }), { x: 0, y: 0 });

    expect(screen.getByText(/not fixed|open-ended|Открыт/i)).toBeInTheDocument();
  });
});

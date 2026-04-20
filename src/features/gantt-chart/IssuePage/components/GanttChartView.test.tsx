import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { proxy } from 'valtio';
import type { GanttBar } from '../../types';
import { GanttViewportModel } from '../../models/GanttViewportModel';
import { GanttChartView, GANTT_CHART_DEFAULT_WIDTH } from './GanttChartView';

function makeBar(overrides: Partial<GanttBar> = {}): GanttBar {
  const startDate = new Date('2024-06-01T00:00:00.000Z');
  const endDate = new Date('2024-06-11T00:00:00.000Z');
  return {
    issueKey: 'PROJ-1',
    issueId: '1',
    label: 'PROJ-1',
    startDate,
    endDate,
    isOpenEnded: false,
    statusSections: [],
    tooltipFields: {},
    statusCategory: 'inProgress',
    ...overrides,
  };
}

describe('GanttChartView', () => {
  it('renders an svg root', () => {
    const { container } = render(<GanttChartView bars={[makeBar()]} showStatusSections={false} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('uses default width when width prop is omitted', () => {
    const { container } = render(<GanttChartView bars={[makeBar()]} showStatusSections={false} />);

    expect(container.querySelector('svg')).toHaveAttribute('width', String(GANTT_CHART_DEFAULT_WIDTH));
  });

  it('renders one gantt bar row per bar', () => {
    const bars = [
      makeBar({ issueKey: 'PROJ-1' }),
      makeBar({
        issueKey: 'PROJ-2',
        label: 'PROJ-2',
        startDate: new Date('2024-06-02T00:00:00.000Z'),
        endDate: new Date('2024-06-12T00:00:00.000Z'),
      }),
      makeBar({
        issueKey: 'PROJ-3',
        label: 'PROJ-3',
        startDate: new Date('2024-06-03T00:00:00.000Z'),
        endDate: new Date('2024-06-13T00:00:00.000Z'),
      }),
    ];

    render(<GanttChartView bars={bars} showStatusSections={false} />);

    expect(screen.getAllByTestId('gantt-bar')).toHaveLength(3);
  });

  it('shows time axis tick labels in day interval format (MMM dd, UTC)', () => {
    render(<GanttChartView bars={[makeBar()]} showStatusSections={false} />);

    const labels = screen.getAllByTestId('gantt-axis-label');
    expect(labels.length).toBeGreaterThan(0);
    for (const el of labels) {
      expect(el.textContent ?? '').toMatch(/^[A-Z][a-z]{2} \d{2}$/);
    }
  });

  it('formats axis in HH:mm (UTC) when viewport interval is hours', () => {
    const viewport = proxy(new GanttViewportModel());
    viewport.setInterval('hours');
    const bars = [
      makeBar({
        startDate: new Date('2024-06-01T00:00:00.000Z'),
        endDate: new Date('2024-06-01T06:00:00.000Z'),
      }),
    ];
    render(<GanttChartView bars={bars} showStatusSections={false} viewportModel={viewport} />);

    for (const el of screen.getAllByTestId('gantt-axis-label')) {
      expect(el.textContent ?? '').toMatch(/^\d{2}:\d{2}$/);
    }
  });
});

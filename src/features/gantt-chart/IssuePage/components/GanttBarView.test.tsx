import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { GanttBar } from '../../types';
import { GanttBarView } from './GanttBarView';

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
    statusSections: [
      {
        statusName: 'To Do',
        category: 'todo',
        startDate,
        endDate: new Date('2024-06-04T00:00:00.000Z'),
      },
      {
        statusName: 'In Progress',
        category: 'inProgress',
        startDate: new Date('2024-06-04T00:00:00.000Z'),
        endDate,
      },
    ],
    tooltipFields: {},
    statusCategory: 'inProgress',
    ...overrides,
  };
}

describe('GanttBarView', () => {
  it('renders a rect with the given geometry and status category fill', () => {
    const bar = makeBar({ statusCategory: 'done' });
    const { container } = render(
      <svg>
        <GanttBarView bar={bar} x={12} y={34} width={200} height={24} />
      </svg>
    );

    const group = screen.getByTestId('gantt-bar');
    const barRects = group.querySelectorAll('[data-bar-rect="true"]');
    expect(barRects).toHaveLength(1);
    expect(barRects[0]).toHaveAttribute('x', '12');
    expect(barRects[0]).toHaveAttribute('y', '34');
    expect(barRects[0]).toHaveAttribute('width', '200');
    expect(barRects[0]).toHaveAttribute('height', '24');
    expect(barRects[0]).toHaveAttribute('fill', '#ABF5D1');
    expect(container.querySelector('text')?.textContent).toBe('PROJ-1: Test issue');
  });

  it('uses barColor as rect fill when barColor is set and status sections are off', () => {
    const bar = makeBar({ statusCategory: 'done', barColor: '#FF5630' });
    const { container } = render(
      <svg>
        <GanttBarView bar={bar} x={0} y={0} width={100} height={20} />
      </svg>
    );
    const group = screen.getByTestId('gantt-bar');
    const barRects = group.querySelectorAll('[data-bar-rect="true"]');
    expect(barRects).toHaveLength(1);
    expect(barRects[0]).toHaveAttribute('fill', '#FF5630');
    expect(container.querySelector('text')).toBeTruthy();
  });

  it('shows the bar label inside the bar when there is enough horizontal room', () => {
    const bar = makeBar({ label: 'TASK-42 summary' });
    render(
      <svg>
        <GanttBarView bar={bar} x={0} y={0} width={240} height={20} />
      </svg>
    );

    expect(screen.getByText('TASK-42 summary')).toBeInTheDocument();
  });

  it('truncates the label with an ellipsis when the bar is too narrow', () => {
    const bar = makeBar({ label: 'TASK-42 a very very long summary that does not fit' });
    render(
      <svg>
        <GanttBarView bar={bar} x={0} y={0} width={100} height={20} />
      </svg>
    );

    const text = document.querySelector('text');
    expect(text?.textContent ?? '').toMatch(/…$/);
  });

  it('calls onMouseEnter with bar and event, and onMouseLeave', () => {
    const bar = makeBar();
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();

    render(
      <svg>
        <GanttBarView
          bar={bar}
          x={0}
          y={0}
          width={100}
          height={20}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </svg>
    );

    const group = screen.getByTestId('gantt-bar');
    fireEvent.mouseEnter(group);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    expect(onMouseEnter).toHaveBeenCalledWith(bar, expect.any(Object));

    fireEvent.mouseLeave(group);
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('calls onClick with the bar', () => {
    const bar = makeBar();
    const onClick = vi.fn();

    render(
      <svg>
        <GanttBarView bar={bar} x={0} y={0} width={100} height={20} onClick={onClick} />
      </svg>
    );

    fireEvent.click(screen.getByTestId('gantt-bar'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(bar);
  });

  it('renders open-ended marker when isOpenEnded is true', () => {
    const bar = makeBar({ isOpenEnded: true });
    render(
      <svg>
        <GanttBarView bar={bar} x={10} y={0} width={100} height={20} />
      </svg>
    );

    expect(screen.getByTestId('gantt-bar-open-ended')).toBeInTheDocument();
  });

  it('status sections take precedence over barColor when showStatusSections is on', () => {
    // A3: when the user enables status breakdown, custom color rules must be ignored.
    const bar = makeBar({ barColor: '#FF5630' });
    render(
      <svg>
        <GanttBarView bar={bar} x={10} y={0} width={100} height={20} showStatusSections />
      </svg>
    );

    const group = screen.getByTestId('gantt-bar');
    const barRects = group.querySelectorAll('[data-bar-rect="true"]');
    expect(barRects).toHaveLength(2);
    expect(barRects[0]).toHaveAttribute('fill', '#DFE1E6');
    expect(barRects[1]).toHaveAttribute('fill', '#B3D4FF');
  });

  it('with showStatusSections draws one rect per section with proportional widths and category colors', () => {
    const bar = makeBar();
    const { container } = render(
      <svg>
        <GanttBarView bar={bar} x={10} y={0} width={100} height={20} showStatusSections />
      </svg>
    );

    const group = screen.getByTestId('gantt-bar');
    const barRects = group.querySelectorAll('[data-bar-rect="true"]');

    expect(barRects).toHaveLength(2);
    expect(barRects[0]).toHaveAttribute('x', '10');
    expect(barRects[0]).toHaveAttribute('width', '30');
    expect(barRects[0]).toHaveAttribute('fill', '#DFE1E6');

    expect(barRects[1]).toHaveAttribute('x', '40');
    expect(barRects[1]).toHaveAttribute('width', '70');
    expect(barRects[1]).toHaveAttribute('fill', '#B3D4FF');

    expect(container.querySelector('clipPath rect')).toHaveAttribute('x', '10');
    expect(container.querySelector('clipPath rect')).toHaveAttribute('width', '100');
  });
});

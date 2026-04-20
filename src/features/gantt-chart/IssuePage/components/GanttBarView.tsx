import React, { useId, useState } from 'react';
import type { ActiveStatuses } from 'src/features/sub-tasks-progress/types';
import type { GanttBar } from '../../types';

export interface GanttBarViewProps {
  bar: GanttBar;
  x: number;
  y: number;
  width: number;
  height: number;
  onMouseEnter?: (bar: GanttBar, event: React.MouseEvent<SVGGElement>) => void;
  onMouseLeave?: () => void;
  onClick?: (bar: GanttBar) => void;
  showStatusSections?: boolean;
}

const ganttBarColors: Record<ActiveStatuses, string> = {
  blocked: '#FFBDAD',
  todo: '#DFE1E6',
  inProgress: '#B3D4FF',
  done: '#ABF5D1',
};

function fillForCategory(category: GanttBar['statusCategory']): string {
  return ganttBarColors[category as ActiveStatuses] ?? ganttBarColors.todo;
}

function computeDrawableRects(
  bar: GanttBar,
  x: number,
  width: number,
  showStatusSections: boolean
): Array<{ x: number; width: number; fill: string }> {
  const fallbackFill = fillForCategory(bar.statusCategory);

  if (bar.barColor !== undefined && bar.barColor !== '') {
    return [{ x, width, fill: bar.barColor }];
  }

  if (!showStatusSections || bar.statusSections.length === 0) {
    return [{ x, width, fill: fallbackFill }];
  }

  const barStart = bar.startDate.getTime();
  const barEnd = bar.endDate.getTime();
  const span = barEnd - barStart;
  if (span <= 0) {
    return [{ x, width, fill: fallbackFill }];
  }

  const rects: Array<{ x: number; width: number; fill: string }> = [];
  for (const section of bar.statusSections) {
    const sStart = Math.max(barStart, section.startDate.getTime());
    const sEnd = Math.min(barEnd, section.endDate.getTime());
    if (sEnd <= sStart) continue;
    const left = ((sStart - barStart) / span) * width;
    const w = ((sEnd - sStart) / span) * width;
    rects.push({
      x: x + left,
      width: w,
      fill: fillForCategory(section.category),
    });
  }

  return rects.length > 0 ? rects : [{ x, width, fill: fallbackFill }];
}

/**
 * Single Gantt bar: SVG geometry, optional status-colored segments, clipped label.
 */
export function GanttBarView({
  bar,
  x,
  y,
  width,
  height,
  onMouseEnter,
  onMouseLeave,
  onClick,
  showStatusSections = false,
}: GanttBarViewProps) {
  const rawId = useId();
  const clipId = `jh-gantt-bar-clip-${rawId.replace(/:/g, '')}`;
  const [hovered, setHovered] = useState(false);

  const rects = computeDrawableRects(bar, x, width, showStatusSections);
  const fontSize = Math.min(height * 0.55, 12);
  const cornerR = rects.length === 1 ? 2 : 0;

  const endIso = bar.endDate.toISOString();

  return (
    <g
      data-testid="gantt-bar"
      data-issue-key={bar.issueKey}
      data-start-iso={bar.startDate.toISOString()}
      data-end-iso={endIso}
      style={{ cursor: onClick ? 'pointer' : undefined }}
      onMouseEnter={e => {
        setHovered(true);
        onMouseEnter?.(bar, e);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onMouseLeave?.();
      }}
      onClick={() => onClick?.(bar)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width} height={height} rx={2} ry={2} />
        </clipPath>
      </defs>
      {rects.map((r, i) => (
        <rect
          key={`${bar.issueKey}-seg-${i}`}
          data-bar-rect="true"
          x={r.x}
          y={y}
          width={r.width}
          height={height}
          fill={r.fill}
          rx={cornerR}
          ry={cornerR}
          stroke={hovered ? '#172B4D' : 'none'}
          strokeWidth={hovered ? 1.5 : 0}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <text
        x={x + 4}
        y={y + height / 2}
        dominantBaseline="middle"
        textAnchor="start"
        clipPath={`url(#${clipId})`}
        style={{
          fontSize,
          pointerEvents: 'none',
          userSelect: 'none',
          fill: '#172B4D',
        }}
      >
        {bar.label}
      </text>
      {bar.isOpenEnded ? (
        <g
          data-testid="gantt-bar-open-ended-warning"
          transform={`translate(${x + width - 12}, ${y + height / 2})`}
          style={{ pointerEvents: 'none' }}
        >
          <title>Open-ended bar</title>
          <path d="M0,-7 L6,5 L-6,5 Z" fill="#FFAB00" stroke="#172B4D" strokeWidth={0.35} />
        </g>
      ) : null}
    </g>
  );
}

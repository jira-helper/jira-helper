import React, { useId, useState } from 'react';
import type { ActiveStatuses } from 'src/features/sub-tasks-progress/types';
import type { GanttBar } from '../../types';
import './gantt-ui.css';

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

/** WCAG relative luminance for an sRGB component in [0..1]. */
function srgbToLin(channel0to1: number): number {
  return channel0to1 <= 0.03928 ? channel0to1 / 12.92 : Math.pow((channel0to1 + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLin(r / 255) + 0.7152 * srgbToLin(g / 255) + 0.0722 * srgbToLin(b / 255);
}

function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Returns '#FFFFFF' or '#172B4D' (Jira N800) for the given bg, picking whichever
 * meets WCAG AA (>= 4.5:1) for normal text. If both fail, returns the higher-contrast one.
 */
function readableTextColorFor(bg: string): string {
  const dark = '#172B4D';
  const light = '#FFFFFF';
  const hex = bg.replace('#', '');
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map(c => c + c)
          .join('')
      : hex;
  if (normalized.length !== 6) return dark;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some(v => Number.isNaN(v))) return dark;
  const bgLum = relativeLuminance(r, g, b);
  const darkLum = relativeLuminance(0x17, 0x2b, 0x4d);
  const lightLum = 1;
  const darkRatio = contrastRatio(darkLum, bgLum);
  const lightRatio = contrastRatio(lightLum, bgLum);
  return darkRatio >= lightRatio ? dark : light;
}

/** Slightly darker border to increase contrast around the bar regardless of fill. */
const BAR_BORDER_COLOR = 'rgba(9,30,66,0.25)';

type DrawableBarRect = {
  x: number;
  width: number;
  fill: string;
  /** Set when this rect is a status-breakdown segment (BDD: `[data-testid="gantt-bar-status-section"]`). */
  statusCategory?: GanttBar['statusCategory'];
  statusStartDate?: Date;
  statusEndDate?: Date;
};

function computeDrawableRects(bar: GanttBar, x: number, width: number, showStatusSections: boolean): DrawableBarRect[] {
  const fallbackFill = fillForCategory(bar.statusCategory);
  const hasCustomColor = bar.barColor !== undefined && bar.barColor !== '';
  const useStatusSections = showStatusSections && bar.statusSections.length > 0;

  // Status breakdown wins over custom color rules — see GanttTooltip for the user-visible hint.
  if (!useStatusSections) {
    if (hasCustomColor) {
      return [{ x, width, fill: bar.barColor as string }];
    }
    return [{ x, width, fill: fallbackFill }];
  }

  const barStart = bar.startDate.getTime();
  const barEnd = bar.endDate.getTime();
  const span = barEnd - barStart;
  if (span <= 0) {
    return [{ x, width, fill: fallbackFill }];
  }

  const rects: DrawableBarRect[] = [];
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
      statusCategory: section.category,
      statusStartDate: section.startDate,
      statusEndDate: section.endDate,
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
  const fontSize = Math.min(height * 0.5, 13);
  const cornerR = rects.length === 1 ? 3 : 0;
  const dominantFill = rects[0]?.fill ?? '#DFE1E6';
  const textColor = readableTextColorFor(dominantFill);

  const charPx = fontSize * 0.55;
  const innerPaddingPx = 16;
  const reservedForOpenEndedFadePx = bar.isOpenEnded ? 12 : 4;
  const availableTextPx = Math.max(0, width - innerPaddingPx - reservedForOpenEndedFadePx);
  const maxChars = Math.max(0, Math.floor(availableTextPx / charPx));
  let displayLabel: string | null = null;
  if (maxChars >= 3) {
    displayLabel = bar.label.length <= maxChars ? bar.label : `${bar.label.slice(0, Math.max(0, maxChars - 1))}…`;
  }

  const endIso = bar.endDate.toISOString();

  return (
    <g
      data-testid="gantt-bar"
      data-issue-key={bar.issueKey}
      data-start-iso={bar.startDate.toISOString()}
      data-end-iso={endIso}
      className={onClick ? 'jh-gantt-bar--clickable' : undefined}
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
          {...(r.statusCategory != null
            ? {
                'data-testid': 'gantt-bar-status-section',
                'data-bar-status-category': r.statusCategory,
                'data-bar-status-start-iso': r.statusStartDate?.toISOString() ?? '',
                'data-bar-status-end-iso': r.statusEndDate?.toISOString() ?? '',
              }
            : {})}
          x={r.x}
          y={y}
          width={r.width}
          height={height}
          fill={r.fill}
          rx={cornerR}
          ry={cornerR}
          stroke={hovered ? '#172B4D' : BAR_BORDER_COLOR}
          strokeWidth={hovered ? 1.5 : 1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {rects.length > 1
        ? rects
            .slice(1)
            .map((r, i) => (
              <line
                key={`${bar.issueKey}-divider-${i}`}
                x1={r.x}
                y1={y + 1}
                x2={r.x}
                y2={y + height - 1}
                stroke="rgba(9,30,66,0.35)"
                strokeWidth={0.75}
                vectorEffect="non-scaling-stroke"
                clipPath={`url(#${clipId})`}
                pointerEvents="none"
              />
            ))
        : null}
      {displayLabel !== null ? (
        <text
          x={x + 8}
          y={y + height / 2}
          dominantBaseline="middle"
          textAnchor="start"
          clipPath={`url(#${clipId})`}
          className="jh-gantt-bar-label"
          fontSize={fontSize}
          fontWeight={500}
          fill={textColor}
        >
          {displayLabel}
        </text>
      ) : null}
      {bar.isOpenEnded ? (
        <g
          data-testid="gantt-bar-open-ended"
          className="jh-gantt-bar-open-ended"
          aria-label="Open-ended bar — no end date"
          clipPath={`url(#${clipId})`}
        >
          <title>Open-ended bar — no end date</title>
          <line
            x1={x + width}
            y1={y + 1}
            x2={x + width}
            y2={y + height - 1}
            stroke="#172B4D"
            strokeWidth={1.5}
            strokeDasharray="2 2"
            opacity={0.55}
          />
        </g>
      ) : null}
    </g>
  );
}

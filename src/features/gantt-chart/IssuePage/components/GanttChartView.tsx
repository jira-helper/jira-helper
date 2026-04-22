import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { proxy } from 'valtio';
import type { GanttBar, TimeInterval } from '../../types';
import { GanttViewportModel } from '../../models/GanttViewportModel';
import { useGanttZoom } from '../../hooks/useGanttZoom';
import { useGanttViewportTransform } from '../../hooks/useGanttViewportTransform';
import { useGanttViewportInterval } from '../../hooks/useGanttViewportInterval';
import { computeTimeScale } from '../../utils/computeTimeScale';
import { GanttBarView } from './GanttBarView';
import { useContainerWidth } from '../../hooks/useContainerWidth';

/** Row height for one Gantt bar (px). */
export const BAR_HEIGHT = 28;
/** Vertical gap between bar rows (px). */
export const BAR_GAP = 8;
/** Top margin reserved for the time axis labels (px). */
export const MARGIN_TOP = 44;
/** Left margin reserved for future row labels; chart area starts after this (px). */
export const MARGIN_LEFT = 8;
/** Bottom padding reserved for legend/scrollbar room (px). */
export const MARGIN_BOTTOM = 8;

export const GANTT_CHART_DEFAULT_WIDTH = 800;

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export interface GanttChartViewProps {
  bars: GanttBar[];
  showStatusSections: boolean;
  /** When set (e.g. from DI), wheel/pinch zoom and pan are wired via d3-zoom. */
  viewportModel?: GanttViewportModel;
  onBarHover?: (bar: GanttBar | null, event?: React.MouseEvent) => void;
  onBarClick?: (bar: GanttBar) => void;
  /** When set, the chart is grown to at least this many pixels tall (extra rows are empty zebra). */
  minHeightPx?: number;
  /** When true, height grows to fill the parent container's available vertical space (uses ResizeObserver). */
  fillVerticalSpace?: boolean;
}

interface MonthGroup {
  label: string;
  startMs: number;
  endMs: number;
}

/** Builds month groups for the supergroup row (Days/Hours/Weeks scales). */
function buildMonthGroups(domainStartMs: number, domainEndMs: number): MonthGroup[] {
  if (!Number.isFinite(domainStartMs) || !Number.isFinite(domainEndMs) || domainEndMs <= domainStartMs) return [];
  const groups: MonthGroup[] = [];
  const start = new Date(domainStartMs);
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cursor.getTime() < domainEndMs) {
    const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
    const segStart = Math.max(cursor.getTime(), domainStartMs);
    const segEnd = Math.min(next.getTime(), domainEndMs);
    groups.push({
      label: `${MONTH_SHORT[cursor.getUTCMonth()]} ${cursor.getUTCFullYear()}`,
      startMs: segStart,
      endMs: segEnd,
    });
    cursor = next;
  }
  return groups;
}

/** Returns weekend (Sat/Sun) UTC day-start timestamps within [startMs, endMs]. */
function weekendDays(startMs: number, endMs: number): number[] {
  if (endMs <= startMs) return [];
  const out: number[] = [];
  const start = new Date(startMs);
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  while (cursor.getTime() < endMs) {
    const dow = cursor.getUTCDay();
    if (dow === 0 || dow === 6) out.push(cursor.getTime());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/** Adaptively prunes ticks to keep label spacing >= minPx. */
function pruneTicks(ticks: Date[], scale: (d: Date) => number, minPx: number): Date[] {
  if (ticks.length <= 2) return ticks;
  const out: Date[] = [ticks[0]];
  let lastX = scale(ticks[0]);
  for (let i = 1; i < ticks.length; i++) {
    const x = scale(ticks[i]);
    if (x - lastX >= minPx) {
      out.push(ticks[i]);
      lastX = x;
    }
  }
  return out;
}

/**
 * Main Gantt chart SVG: time axis, grid, weekend shading, today marker, and bar rows.
 * Automatically fills the width of its container via ResizeObserver.
 */
export function GanttChartView({
  bars,
  showStatusSections,
  viewportModel: viewportModelProp,
  onBarHover,
  onBarClick,
  minHeightPx,
  fillVerticalSpace = false,
}: GanttChartViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef, GANTT_CHART_DEFAULT_WIDTH);
  const [availableHeightPx, setAvailableHeightPx] = useState<number>(0);

  useLayoutEffect(() => {
    if (!fillVerticalSpace) return;
    const node = containerRef.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      const { top } = rect;
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
      const buffer = 24;
      const room = Math.max(0, viewportH - top - buffer);
      setAvailableHeightPx(room);
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(node);
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, [fillVerticalSpace]);

  useEffect(() => {
    if (!fillVerticalSpace) return;
    const id = window.setTimeout(() => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
      setAvailableHeightPx(Math.max(0, viewportH - rect.top - 24));
    }, 50);
    return () => window.clearTimeout(id);
  }, [fillVerticalSpace, bars.length]);

  const viewportFallbackRef = useRef<GanttViewportModel | null>(null);
  if (!viewportFallbackRef.current) {
    viewportFallbackRef.current = proxy(new GanttViewportModel());
  }
  const viewportModelForTransform = viewportModelProp ?? viewportFallbackRef.current;
  const viewportTransform = useGanttViewportTransform(viewportModelForTransform);
  const interval = useGanttViewportInterval(viewportModelForTransform);

  useGanttZoom(svgRef, viewportModelProp ?? null);

  const width = containerWidth;
  const chartInnerWidth = Math.max(0, width - MARGIN_LEFT);

  const naturalRowsHeight = bars.length * BAR_HEIGHT + Math.max(0, bars.length - 1) * BAR_GAP;
  const naturalHeight = MARGIN_TOP + naturalRowsHeight + MARGIN_BOTTOM;
  const fillTarget = fillVerticalSpace ? availableHeightPx : 0;

  const MAX_BAR_HEIGHT = 40;
  const MAX_BAR_GAP = 14;
  const useFill = fillVerticalSpace && bars.length > 0 && fillTarget > naturalHeight;
  let effectiveBarHeight = BAR_HEIGHT;
  let effectiveBarGap = BAR_GAP;
  let effectiveRowsHeight = naturalRowsHeight;
  if (useFill) {
    const availableForRows = Math.max(0, fillTarget - MARGIN_TOP - MARGIN_BOTTOM);
    const stride = availableForRows / bars.length;
    const desiredHeight = Math.min(MAX_BAR_HEIGHT, Math.max(BAR_HEIGHT, stride * 0.78));
    const desiredGap = Math.min(MAX_BAR_GAP, Math.max(BAR_GAP, stride - desiredHeight));
    effectiveBarHeight = desiredHeight;
    effectiveBarGap = desiredGap;
    effectiveRowsHeight = bars.length * effectiveBarHeight + Math.max(0, bars.length - 1) * effectiveBarGap;
  }

  const svgHeight = Math.max(MARGIN_TOP + effectiveRowsHeight + MARGIN_BOTTOM, minHeightPx ?? 0, fillTarget);
  const chartTop = MARGIN_TOP;
  const chartBottom = svgHeight - MARGIN_BOTTOM;
  const dataBottom = MARGIN_TOP + effectiveRowsHeight;
  const rowStripeStride = effectiveBarHeight + effectiveBarGap;

  const { scale, ticks, tickFormat } = computeTimeScale(bars, chartInnerWidth, interval);

  const minLabelSpacingPx = interval === 'hours' ? 36 : interval === 'days' ? 32 : 50;
  const visibleTicks = useMemo(
    () => pruneTicks(ticks, t => MARGIN_LEFT + scale(t), minLabelSpacingPx),
    [ticks, scale, minLabelSpacingPx]
  );

  const showMonthHeader: boolean = interval === 'hours' || interval === 'days' || interval === 'weeks';
  const [domainStart, domainEnd] = scale.domain() as [Date, Date];
  const monthGroups = useMemo(
    () => (showMonthHeader ? buildMonthGroups(domainStart.getTime(), domainEnd.getTime()) : []),
    [showMonthHeader, domainStart, domainEnd]
  );

  const showWeekends: boolean = interval === 'days' || interval === 'hours';
  const weekendStarts = useMemo(
    () => (showWeekends ? weekendDays(domainStart.getTime(), domainEnd.getTime()) : []),
    [showWeekends, domainStart, domainEnd]
  );

  const nowMs = Date.now();
  const todayInRange = nowMs >= domainStart.getTime() && nowMs <= domainEnd.getTime();
  const todayX = todayInRange ? MARGIN_LEFT + scale(new Date(nowMs)) : null;

  const dayWidthPx = (() => {
    if (chartInnerWidth <= 0) return 0;
    const ms = domainEnd.getTime() - domainStart.getTime();
    if (ms <= 0) return 0;
    return (chartInnerWidth / ms) * 86_400_000;
  })();

  const { k: zk, x: tx, y: ty } = viewportTransform;

  const monthHeaderY = 4;
  const monthHeaderHeight = 18;
  const tickLabelY = MARGIN_TOP - 6;
  const tickRowTop = MARGIN_TOP - 22;

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg
        ref={svgRef}
        data-testid="gantt-chart-svg"
        width={width}
        height={svgHeight}
        role="img"
        aria-label="Gantt chart"
      >
        <g transform={`translate(${tx},${ty}) scale(${zk})`}>
          <g data-testid="gantt-row-striping">
            {bars.map((_, i) => {
              if (i % 2 !== 0) return null;
              const rowY = MARGIN_TOP + i * rowStripeStride - effectiveBarGap / 2;
              const rowH = Math.min(rowStripeStride, Math.max(0, dataBottom - rowY));
              if (rowH <= 0) return null;
              return (
                <rect
                  key={`row-${i}`}
                  x={MARGIN_LEFT}
                  y={rowY}
                  width={chartInnerWidth}
                  height={rowH}
                  fill="rgba(9,30,66,0.025)"
                />
              );
            })}
          </g>
          <g data-testid="gantt-weekend-shading">
            {showWeekends &&
              dayWidthPx > 0 &&
              weekendStarts.map((ms, i) => {
                const x = MARGIN_LEFT + scale(new Date(ms));
                return (
                  <rect
                    key={`we-${i}`}
                    x={x}
                    y={chartTop}
                    width={Math.max(0.5, dayWidthPx)}
                    height={Math.max(0, dataBottom - chartTop)}
                    fill="rgba(9,30,66,0.09)"
                  />
                );
              })}
          </g>

          <g data-testid="gantt-grid">
            {visibleTicks.map((tm, i) => {
              const x = MARGIN_LEFT + scale(tm);
              return (
                <line key={`grid-${i}`} x1={x} y1={chartTop} x2={x} y2={chartBottom} stroke="#EBECF0" strokeWidth={1} />
              );
            })}
          </g>

          {dataBottom < chartBottom - 4 ? (
            <g data-testid="gantt-data-end">
              <line
                x1={MARGIN_LEFT}
                y1={dataBottom + 4}
                x2={MARGIN_LEFT + chartInnerWidth}
                y2={dataBottom + 4}
                stroke="#C1C7D0"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            </g>
          ) : null}

          {showMonthHeader && monthGroups.length > 0 ? (
            <g data-testid="gantt-month-header">
              {monthGroups.map((g, i) => {
                const x0 = MARGIN_LEFT + scale(new Date(g.startMs));
                const x1 = MARGIN_LEFT + scale(new Date(g.endMs));
                const w = Math.max(0, x1 - x0);
                if (w < 30) return null;
                return (
                  <g key={`month-${i}`}>
                    <rect
                      x={x0}
                      y={monthHeaderY}
                      width={w}
                      height={monthHeaderHeight}
                      fill="#F4F5F7"
                      stroke="#DFE1E6"
                      strokeWidth={0.5}
                    />
                    <text
                      x={x0 + w / 2}
                      y={monthHeaderY + monthHeaderHeight / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontSize: 11, fontWeight: 600, fill: '#42526E' }}
                    >
                      {g.label}
                    </text>
                  </g>
                );
              })}
            </g>
          ) : null}

          <g data-testid="gantt-time-axis">
            <line
              x1={MARGIN_LEFT}
              y1={tickRowTop}
              x2={MARGIN_LEFT + chartInnerWidth}
              y2={tickRowTop}
              stroke="#DFE1E6"
              strokeWidth={1}
            />
            {visibleTicks.map((tm, i) => {
              const x = MARGIN_LEFT + scale(tm);
              return (
                <g key={`tick-${i}`}>
                  <line x1={x} y1={tickRowTop} x2={x} y2={tickRowTop + 4} stroke="#C1C7D0" strokeWidth={1} />
                  <text
                    data-testid="gantt-axis-label"
                    x={x}
                    y={tickLabelY}
                    textAnchor="middle"
                    style={{ fontSize: 11, fill: '#42526E' }}
                  >
                    {tickFormat(tm)}
                  </text>
                </g>
              );
            })}
          </g>

          {bars.map((bar, i) => {
            const x0 = MARGIN_LEFT + scale(bar.startDate);
            const x1 = MARGIN_LEFT + scale(bar.endDate);
            const barWidth = Math.max(1, x1 - x0);
            const y = MARGIN_TOP + i * (effectiveBarHeight + effectiveBarGap);
            return (
              <GanttBarView
                key={bar.issueKey}
                bar={bar}
                x={x0}
                y={y}
                width={barWidth}
                height={effectiveBarHeight}
                showStatusSections={showStatusSections}
                onMouseEnter={(b, e) => onBarHover?.(b, e)}
                onMouseLeave={() => onBarHover?.(null)}
                onClick={onBarClick}
              />
            );
          })}

          {todayX !== null
            ? (() => {
                const badgeW = 36;
                const half = badgeW / 2;
                const minCx = MARGIN_LEFT + half + 1;
                const maxCx = MARGIN_LEFT + chartInnerWidth - half - 1;
                const cx = Math.min(maxCx, Math.max(minCx, todayX));
                return (
                  <g data-testid="gantt-today-marker" style={{ pointerEvents: 'none' }}>
                    <line
                      x1={todayX}
                      y1={monthHeaderY + monthHeaderHeight}
                      x2={todayX}
                      y2={chartBottom}
                      stroke="#2684FF"
                      strokeWidth={1.5}
                      strokeDasharray="5 3"
                      opacity={0.8}
                    />
                    <rect x={cx - half} y={tickRowTop - 12} width={badgeW} height={12} rx={2} fill="#0052CC" />
                    <text
                      x={cx}
                      y={tickRowTop - 3}
                      textAnchor="middle"
                      style={{ fontSize: 9, fontWeight: 700, fill: '#FFFFFF', letterSpacing: 0.4 }}
                    >
                      TODAY
                    </text>
                  </g>
                );
              })()
            : null}
        </g>
      </svg>
    </div>
  );
}

// keep referenced TimeInterval for type re-exports if needed elsewhere
export type { TimeInterval };

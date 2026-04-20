import React, { useRef } from 'react';
import { proxy } from 'valtio';
import type { GanttBar } from '../../types';
import { GanttViewportModel } from '../../models/GanttViewportModel';
import { useGanttZoom } from '../../hooks/useGanttZoom';
import { useGanttViewportTransform } from '../../hooks/useGanttViewportTransform';
import { useGanttViewportInterval } from '../../hooks/useGanttViewportInterval';
import { computeTimeScale } from '../../utils/computeTimeScale';
import { GanttBarView } from './GanttBarView';
import { useContainerWidth } from '../../hooks/useContainerWidth';

/** Row height for one Gantt bar (px). */
export const BAR_HEIGHT = 32;
/** Vertical gap between bar rows (px). */
export const BAR_GAP = 4;
/** Top margin reserved for the time axis labels (px). */
export const MARGIN_TOP = 30;
/** Left margin reserved for future row labels; chart area starts after this (px). */
export const MARGIN_LEFT = 120;

export const GANTT_CHART_DEFAULT_WIDTH = 800;

export interface GanttChartViewProps {
  bars: GanttBar[];
  showStatusSections: boolean;
  /** When set (e.g. from DI), wheel/pinch zoom and pan are wired via d3-zoom. */
  viewportModel?: GanttViewportModel;
  onBarHover?: (bar: GanttBar | null, event?: React.MouseEvent) => void;
  onBarClick?: (bar: GanttBar) => void;
}

/**
 * Main Gantt chart SVG: time axis, grid, and bar rows (presentation only).
 * Automatically fills the width of its container via ResizeObserver.
 */
export function GanttChartView({
  bars,
  showStatusSections,
  viewportModel: viewportModelProp,
  onBarHover,
  onBarClick,
}: GanttChartViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef, GANTT_CHART_DEFAULT_WIDTH);

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
  const svgHeight = MARGIN_TOP + bars.length * BAR_HEIGHT + Math.max(0, bars.length - 1) * BAR_GAP;

  const { scale, ticks, tickFormat } = computeTimeScale(bars, chartInnerWidth, interval);

  const { k: zk, x: tx, y: ty } = viewportTransform;

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
          <g data-testid="gantt-grid">
            {ticks.map((tm, i) => {
              const x = MARGIN_LEFT + scale(tm);
              return (
                <line key={`grid-${i}`} x1={x} y1={MARGIN_TOP} x2={x} y2={svgHeight} stroke="#DFE1E6" strokeWidth={1} />
              );
            })}
          </g>
          <g data-testid="gantt-time-axis">
            {ticks.map((tm, i) => {
              const x = MARGIN_LEFT + scale(tm);
              return (
                <text
                  key={`tick-${i}`}
                  data-testid="gantt-axis-label"
                  x={x}
                  y={20}
                  textAnchor="middle"
                  style={{ fontSize: 10, fill: '#42526E' }}
                >
                  {tickFormat(tm)}
                </text>
              );
            })}
          </g>
          {bars.map((bar, i) => {
            const x0 = MARGIN_LEFT + scale(bar.startDate);
            const x1 = MARGIN_LEFT + scale(bar.endDate);
            const barWidth = Math.max(1, x1 - x0);
            const y = MARGIN_TOP + i * (BAR_HEIGHT + BAR_GAP);
            return (
              <GanttBarView
                key={bar.issueKey}
                bar={bar}
                x={x0}
                y={y}
                width={barWidth}
                height={BAR_HEIGHT}
                showStatusSections={showStatusSections}
                onMouseEnter={(b, e) => onBarHover?.(b, e)}
                onMouseLeave={() => onBarHover?.(null)}
                onClick={onBarClick}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

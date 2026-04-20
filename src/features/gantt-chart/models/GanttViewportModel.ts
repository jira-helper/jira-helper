import type { TimeInterval } from '../types';

/** d3.zoom identity-compatible transform (scale `k`, translate `x`/`y`). */
export type GanttZoomTransform = {
  k: number;
  x: number;
  y: number;
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP_RATIO = 1.2;

function clampZoom(k: number): number {
  if (k < MIN_ZOOM) return MIN_ZOOM;
  if (k > MAX_ZOOM) return MAX_ZOOM;
  return k;
}

/**
 * @module GanttViewportModel
 *
 * Viewport state for the Gantt chart: zoom, pan, time-axis interval, and d3-zoom-compatible transform.
 */
export class GanttViewportModel {
  zoomLevel: number = 1;

  panOffset: { x: number; y: number } = { x: 0, y: 0 };

  interval: TimeInterval = 'days';

  transform: GanttZoomTransform = { k: 1, x: 0, y: 0 };

  setZoomLevel(level: number): void {
    const k = clampZoom(level);
    this.zoomLevel = k;
    this.transform = { ...this.transform, k };
  }

  zoomIn(): void {
    this.setZoomLevel(this.zoomLevel * ZOOM_STEP_RATIO);
  }

  zoomOut(): void {
    this.setZoomLevel(this.zoomLevel / ZOOM_STEP_RATIO);
  }

  resetZoom(): void {
    this.setZoomLevel(1);
  }

  setInterval(interval: TimeInterval): void {
    this.interval = interval;
  }

  setTransform(transform: GanttZoomTransform): void {
    const k = clampZoom(transform.k);
    this.transform = { k, x: transform.x, y: transform.y };
    this.zoomLevel = k;
    this.panOffset = { x: transform.x, y: transform.y };
  }

  setPanOffset(offset: { x: number; y: number }): void {
    this.panOffset = { x: offset.x, y: offset.y };
    this.transform = { ...this.transform, x: offset.x, y: offset.y };
  }

  reset(): void {
    this.zoomLevel = 1;
    this.panOffset = { x: 0, y: 0 };
    this.interval = 'days';
    this.transform = { k: 1, x: 0, y: 0 };
  }
}

import { describe, it, expect, beforeEach } from 'vitest';
import { proxy } from 'valtio';
import type { TimeInterval } from '../types';
import { GanttViewportModel } from './GanttViewportModel';

describe('GanttViewportModel', () => {
  let model: GanttViewportModel;

  beforeEach(() => {
    model = proxy(new GanttViewportModel());
  });

  it('initial state: zoom 100%, zero pan, default interval, identity transform', () => {
    expect(model.zoomLevel).toBe(1);
    expect(model.panOffset).toEqual({ x: 0, y: 0 });
    expect(model.interval).toBe('days');
    expect(model.transform).toEqual({ k: 1, x: 0, y: 0 });
  });

  it('setZoomLevel updates zoomLevel and transform.k, preserves pan', () => {
    model.panOffset = { x: 10, y: -5 };
    model.transform = { k: 1, x: 10, y: -5 };

    model.setZoomLevel(2);

    expect(model.zoomLevel).toBe(2);
    expect(model.transform).toEqual({ k: 2, x: 10, y: -5 });
    expect(model.panOffset).toEqual({ x: 10, y: -5 });
  });

  it('setZoomLevel clamps to minimum 0.1', () => {
    model.setZoomLevel(0.01);
    expect(model.zoomLevel).toBe(0.1);
    expect(model.transform.k).toBe(0.1);
  });

  it('setZoomLevel clamps to maximum 10', () => {
    model.setZoomLevel(100);
    expect(model.zoomLevel).toBe(10);
    expect(model.transform.k).toBe(10);
  });

  it('zoomIn multiplies zoom up to max10', () => {
    model.setZoomLevel(1);
    model.zoomIn();
    expect(model.zoomLevel).toBeGreaterThan(1);
    expect(model.zoomLevel).toBe(model.transform.k);
    expect(model.zoomLevel).toBeLessThanOrEqual(10);

    model.setZoomLevel(10);
    model.zoomIn();
    expect(model.zoomLevel).toBe(10);
  });

  it('zoomOut divides zoom down to min 0.1', () => {
    model.setZoomLevel(1);
    model.zoomOut();
    expect(model.zoomLevel).toBeLessThan(1);
    expect(model.zoomLevel).toBe(model.transform.k);
    expect(model.zoomLevel).toBeGreaterThanOrEqual(0.1);

    model.setZoomLevel(0.1);
    model.zoomOut();
    expect(model.zoomLevel).toBe(0.1);
  });

  it('resetZoom sets zoom to 100% without clearing pan', () => {
    model.setZoomLevel(3);
    model.setPanOffset({ x: 40, y: 8 });

    model.resetZoom();

    expect(model.zoomLevel).toBe(1);
    expect(model.transform.k).toBe(1);
    expect(model.panOffset).toEqual({ x: 40, y: 8 });
    expect(model.transform.x).toBe(40);
    expect(model.transform.y).toBe(8);
  });

  it('setInterval updates interval', () => {
    const next: TimeInterval = 'weeks';
    model.setInterval(next);
    expect(model.interval).toBe('weeks');
  });

  it('setTransform updates transform, zoomLevel, and panOffset; clamps k', () => {
    model.setTransform({ k: 5, x: 12, y: -3 });

    expect(model.transform).toEqual({ k: 5, x: 12, y: -3 });
    expect(model.zoomLevel).toBe(5);
    expect(model.panOffset).toEqual({ x: 12, y: -3 });

    model.setTransform({ k: 99, x: 1, y: 2 });
    expect(model.zoomLevel).toBe(10);
    expect(model.transform).toEqual({ k: 10, x: 1, y: 2 });

    model.setTransform({ k: 0.01, x: 0, y: 0 });
    expect(model.zoomLevel).toBe(0.1);
    expect(model.transform.k).toBe(0.1);
  });

  it('setPanOffset updates panOffset and transform x/y, preserves k', () => {
    model.setZoomLevel(2);
    model.setPanOffset({ x: 7, y: 9 });

    expect(model.panOffset).toEqual({ x: 7, y: 9 });
    expect(model.transform).toEqual({ k: 2, x: 7, y: 9 });
    expect(model.zoomLevel).toBe(2);
  });

  it('reset restores defaults', () => {
    model.setZoomLevel(4);
    model.setPanOffset({ x: 1, y: 2 });
    model.setInterval('months');
    model.setTransform({ k: 4, x: 1, y: 2 });

    model.reset();

    expect(model.zoomLevel).toBe(1);
    expect(model.panOffset).toEqual({ x: 0, y: 0 });
    expect(model.interval).toBe('days');
    expect(model.transform).toEqual({ k: 1, x: 0, y: 0 });
  });
});

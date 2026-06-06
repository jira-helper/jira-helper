import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { proxy } from 'valtio';
import { GanttViewportModel } from '../models/GanttViewportModel';
import { useGanttViewportTransform } from './useGanttViewportTransform';

const VIEWPORT_MIN_ZOOM = 0.1;
const VIEWPORT_MAX_ZOOM = 10;

function getFallbackViewportModel(): GanttViewportModel {
  return proxy(new GanttViewportModel());
}

/**
 * Attaches d3-zoom to an SVG root and keeps {@link GanttViewportModel.transform} in sync.
 * User gestures update the model; external model updates (toolbar, reset) update d3’s internal transform.
 *
 * When `viewportModel` is omitted, zoom is not attached (e.g. Storybook / tests without DI viewport).
 */
export function useGanttZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  viewportModel: GanttViewportModel | null | undefined,
  options?: { minZoom?: number; maxZoom?: number }
): void {
  const minZoom = options?.minZoom ?? VIEWPORT_MIN_ZOOM;
  const maxZoom = options?.maxZoom ?? VIEWPORT_MAX_ZOOM;

  const fallbackRef = useRef<GanttViewportModel | null>(null);
  if (!fallbackRef.current) {
    fallbackRef.current = getFallbackViewportModel();
  }

  const modelForSnap = viewportModel ?? fallbackRef.current;
  const transformSnap = useGanttViewportTransform(modelForSnap);

  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!viewportModel) return undefined;

    const el = svgRef.current;
    if (!el) return undefined;

    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([minZoom, maxZoom])
      .on('zoom', event => {
        if (!event.sourceEvent) return;
        viewportModel.setTransform({
          k: event.transform.k,
          x: event.transform.x,
          y: event.transform.y,
        });
      });

    zoomRef.current = z;
    select(el).call(z);

    return () => {
      select(el).on('.zoom', null);
      zoomRef.current = null;
    };
  }, [svgRef, viewportModel, minZoom, maxZoom]);

  useEffect(() => {
    if (!viewportModel) return;

    const el = svgRef.current;
    const z = zoomRef.current;
    if (!el || !z) return;

    const t = zoomIdentity.translate(transformSnap.x, transformSnap.y).scale(transformSnap.k);
    select(el).call(z.transform, t);
  }, [viewportModel, transformSnap.x, transformSnap.y, transformSnap.k, svgRef]);
}

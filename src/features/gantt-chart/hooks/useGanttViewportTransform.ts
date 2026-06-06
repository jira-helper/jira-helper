import { useSyncExternalStore } from 'react';
import { subscribe } from 'valtio';
import type { GanttViewportModel, GanttZoomTransform } from '../models/GanttViewportModel';

/**
 * Subscribes to {@link GanttViewportModel.transform} without `useSnapshot` (forbidden outside `module.ts` in this repo).
 */
export function useGanttViewportTransform(model: GanttViewportModel): GanttZoomTransform {
  return useSyncExternalStore(
    onChange => subscribe(model, onChange),
    () => model.transform,
    () => ({ k: 1, x: 0, y: 0 })
  );
}

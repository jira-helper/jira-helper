import { useSyncExternalStore } from 'react';
import { subscribe } from 'valtio';
import type { GanttViewportModel } from '../models/GanttViewportModel';
import type { TimeInterval } from '../types';

/**
 * Subscribes to {@link GanttViewportModel.interval} so axis formatting updates when the toolbar interval changes.
 */
export function useGanttViewportInterval(model: GanttViewportModel): TimeInterval {
  return useSyncExternalStore(
    onChange => subscribe(model, onChange),
    () => model.interval,
    () => 'days'
  );
}

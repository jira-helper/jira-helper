import { BOARD_PROPERTIES } from 'src/shared/constants';

export const SLA_CONFIG_BOARD_PROPERTY_KEY = BOARD_PROPERTIES.SLA_CONFIG;

export type SlaConfigData = { value: number };

export type SlaConfigSnapshotState = 'initial' | 'loaded';

export type SlaConfigSnapshot = {
  state: SlaConfigSnapshotState;
  data: SlaConfigData | null;
};

let snapshot: SlaConfigSnapshot = { state: 'initial', data: null };

/** Read-only SLA config cache for diagnostic export (updated by AddSlaLine lifecycle). */
export function getSlaConfigSnapshot(): SlaConfigSnapshot {
  return snapshot;
}

export function setSlaConfigSnapshot(data: SlaConfigData): void {
  snapshot = { state: 'loaded', data };
}

/** For tests only. */
export function resetSlaConfigSnapshot(): void {
  snapshot = { state: 'initial', data: null };
}

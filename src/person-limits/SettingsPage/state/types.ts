/**
 * Types for Personal WIP Limits UI and state.
 * PersonLimit is defined in property module; re-exported here for convenience.
 */

export type { PersonLimit } from '../property/types';

export type Column = {
  id: string;
  name: string;
  isKanPlanColumn?: boolean;
};

export type Swimlane = {
  id?: string;
  name: string;
};

/**
 * Form data structure - represents the current state of the form
 */
export type FormData = {
  personName: string;
  limit: number;
  selectedColumns: string[];
  swimlanes: string[];
  includedIssueTypes?: string[];
};

/**
 * @deprecated Legacy type; state is managed by settingsUIStore
 */
export type PersonalWipLimitsState = {
  limits: import('../property/types').PersonLimit[];
  checkedIds: number[];
  editingId: number | null;
};

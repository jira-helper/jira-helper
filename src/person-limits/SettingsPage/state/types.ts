/**
 * Types for Personal WIP Limits UI and state.
 * PersonLimit is defined in property module; re-exported here for convenience.
 */

export type { PersonLimit } from '../../property/types';

export type Column = {
  id: string;
  name: string;
  isKanPlanColumn?: boolean;
};

export type Swimlane = {
  id?: string;
  name: string;
};

export type { SelectedPerson } from '../stores/settingsUIStore.types';

/**
 * Form data structure - represents the current state of the form.
 * `person` holds the fully resolved Jira user selected via PersonNameSelect.
 */
export type FormData = {
  person: import('../stores/settingsUIStore.types').SelectedPerson | null;
  limit: number;
  selectedColumns: string[];
  swimlanes: string[];
  includedIssueTypes?: string[];
  showAllPersonIssues?: boolean;
};

/**
 * @deprecated Legacy type; state is managed by settingsUIStore
 */
export type PersonalWipLimitsState = {
  limits: import('../../property/types').PersonLimit[];
  editingId: number | null;
};

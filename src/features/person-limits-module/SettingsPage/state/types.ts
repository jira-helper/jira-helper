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

export type SelectedPerson = {
  name: string;
  displayName: string;
  self: string;
};

/**
 * Form data structure — current state of the form.
 * `persons` holds the fully resolved Jira users selected via PersonNameSelect.
 */
export type FormData = {
  persons: SelectedPerson[];
  limit: number;
  selectedColumns: string[];
  swimlanes: string[];
  includedIssueTypes?: string[];
  showAllPersonIssues?: boolean;
  /**
   * When true, the limit applies as a single shared bucket across all selected persons:
   * each avatar shows `total/limit`, and clicking any avatar highlights all of them.
   * Defaults to `false` (per-person counters and highlighting).
   */
  sharedLimit?: boolean;
};

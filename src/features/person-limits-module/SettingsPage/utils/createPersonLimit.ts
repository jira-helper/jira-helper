import type { FormData, PersonLimit, Column, Swimlane, SelectedPerson } from '../state/types';
import { transformFormData } from './transformFormData';

/**
 * Create a new PersonLimit from FormData.
 *
 * Accepts an array of persons — the limit will apply to each of them with the
 * same threshold, columns, swimlanes and issue type filters.
 */
export function createPersonLimit({
  formData,
  persons,
  columns,
  swimlanes,
  id,
}: {
  formData: FormData;
  persons: Array<Pick<SelectedPerson, 'name' | 'displayName' | 'self'>>;
  columns: Column[];
  swimlanes: Swimlane[];
  id: number;
}): PersonLimit {
  if (persons.length === 0) {
    throw new Error('createPersonLimit: at least one person is required');
  }

  const { columns: columnObjects, swimlanes: swimlaneObjects } = transformFormData({
    selectedColumnIds: formData.selectedColumns,
    selectedSwimlaneIds: formData.swimlanes,
    columns,
    swimlanes,
  });

  const personLimit: PersonLimit = {
    id,
    persons: persons.map(p => ({
      name: p.name,
      displayName: p.displayName,
      self: p.self,
    })),
    limit: formData.limit,
    columns: columnObjects,
    swimlanes: swimlaneObjects,
    showAllPersonIssues: formData.showAllPersonIssues ?? true,
    // sharedLimit only meaningful for ≥2 persons; the form should hide the
    // checkbox when persons.length < 2, but we still normalize defensively here.
    sharedLimit: persons.length >= 2 ? (formData.sharedLimit ?? false) : false,
  };

  if (formData.includedIssueTypes && formData.includedIssueTypes.length > 0) {
    personLimit.includedIssueTypes = formData.includedIssueTypes;
  }

  return personLimit;
}

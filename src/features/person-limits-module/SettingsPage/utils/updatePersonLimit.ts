import type { FormData, PersonLimit, Column, Swimlane } from '../state/types';
import { transformFormData } from './transformFormData';

/**
 * Update an existing PersonLimit from FormData
 * Preserves person data from existing limit
 */
export function updatePersonLimit({
  existingLimit,
  formData,
  columns,
  swimlanes,
}: {
  existingLimit: PersonLimit;
  formData: FormData;
  columns: Column[];
  swimlanes: Swimlane[];
}): PersonLimit {
  const { columns: columnObjects, swimlanes: swimlaneObjects } = transformFormData({
    selectedColumnIds: formData.selectedColumns,
    selectedSwimlaneIds: formData.swimlanes,
    columns,
    swimlanes,
  });

  const persons =
    formData.persons && formData.persons.length > 0
      ? formData.persons.map(p => ({
          name: p.name,
          displayName: p.displayName,
          self: p.self,
        }))
      : existingLimit.persons;

  const updatedLimit: PersonLimit = {
    ...existingLimit,
    limit: formData.limit,
    columns: columnObjects,
    swimlanes: swimlaneObjects,
    showAllPersonIssues: formData.showAllPersonIssues ?? existingLimit.showAllPersonIssues,
    persons,
    // Reset sharedLimit when reduced to a single person; otherwise apply form value
    // (or fall back to the previous setting).
    sharedLimit: persons.length < 2 ? false : (formData.sharedLimit ?? existingLimit.sharedLimit ?? false),
  };

  // Update or remove includedIssueTypes
  if (formData.includedIssueTypes && formData.includedIssueTypes.length > 0) {
    updatedLimit.includedIssueTypes = formData.includedIssueTypes;
  } else {
    delete updatedLimit.includedIssueTypes;
  }

  return updatedLimit;
}

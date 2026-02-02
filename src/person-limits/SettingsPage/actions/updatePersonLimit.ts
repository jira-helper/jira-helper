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

  const updatedLimit: PersonLimit = {
    ...existingLimit,
    limit: formData.limit,
    columns: columnObjects,
    swimlanes: swimlaneObjects,
    // Preserve person data
    person: {
      ...existingLimit.person,
    },
  };

  // Update or remove includedIssueTypes
  if (formData.includedIssueTypes && formData.includedIssueTypes.length > 0) {
    updatedLimit.includedIssueTypes = formData.includedIssueTypes;
  } else {
    delete updatedLimit.includedIssueTypes;
  }

  return updatedLimit;
}

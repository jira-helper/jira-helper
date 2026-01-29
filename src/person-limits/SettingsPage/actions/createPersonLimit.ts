import type { FormData, PersonLimit } from '../state/types';
import { transformFormData } from './transformFormData';
import type { Column, Swimlane } from '../state/types';

/**
 * Create a new PersonLimit from FormData
 */
export function createPersonLimit({
  formData,
  person,
  columns,
  swimlanes,
  id,
}: {
  formData: FormData;
  person: {
    name: string;
    displayName: string;
    self: string;
    avatar: string;
  };
  columns: Column[];
  swimlanes: Swimlane[];
  id: number;
}): PersonLimit {
  const { columns: columnObjects, swimlanes: swimlaneObjects } = transformFormData({
    selectedColumnIds: formData.selectedColumns,
    selectedSwimlaneIds: formData.swimlanes,
    columns,
    swimlanes,
  });

  const personLimit: PersonLimit = {
    id,
    person,
    limit: formData.limit,
    columns: columnObjects,
    swimlanes: swimlaneObjects,
  };

  if (formData.includedIssueTypes && formData.includedIssueTypes.length > 0) {
    personLimit.includedIssueTypes = formData.includedIssueTypes;
  }

  return personLimit;
}

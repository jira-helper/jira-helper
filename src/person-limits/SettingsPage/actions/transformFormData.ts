import type { Column, Swimlane } from '../state/types';

/**
 * Transform form data (selected IDs) into column and swimlane objects.
 * 
 * Special convention:
 * - Empty array [] means "all columns/swimlanes" and is preserved as empty array
 * - Non-empty arrays are transformed to objects
 */
export function transformFormData({
  selectedColumnIds,
  selectedSwimlaneIds,
  columns,
  swimlanes,
}: {
  selectedColumnIds: string[];
  selectedSwimlaneIds: string[];
  columns: Column[];
  swimlanes: Swimlane[];
}): {
  columns: Array<{ id: string; name: string }>;
  swimlanes: Array<{ id: string; name: string }>;
} {
  // If empty array, preserve it (means "all")
  if (selectedColumnIds.length === 0) {
    return {
      columns: [],
      swimlanes: selectedSwimlaneIds.length === 0 
        ? [] 
        : selectedSwimlaneIds
            .map(id => {
              const swimlane = swimlanes.find(swim => swim.id === id || swim.name === id);
              if (swimlane) {
                return {
                  id: swimlane.id || swimlane.name,
                  name: swimlane.name,
                };
              }
              return null;
            })
            .filter((swim): swim is { id: string; name: string } => swim !== null),
    };
  }

  if (selectedSwimlaneIds.length === 0) {
    return {
      columns: selectedColumnIds
        .map(id => {
          const column = columns.find(col => col.id === id);
          return column ? { id: column.id, name: column.name } : null;
        })
        .filter((col): col is { id: string; name: string } => col !== null),
      swimlanes: [],
    };
  }

  // Transform column IDs to column objects
  const columnObjects = selectedColumnIds
    .map(id => {
      const column = columns.find(col => col.id === id);
      return column ? { id: column.id, name: column.name } : null;
    })
    .filter((col): col is { id: string; name: string } => col !== null);

  // Transform swimlane IDs to swimlane objects
  // Handle both id and name matching (if id is not available, use name as id)
  const swimlaneObjects = selectedSwimlaneIds
    .map(id => {
      const swimlane = swimlanes.find(swim => swim.id === id || swim.name === id);
      if (swimlane) {
        return {
          id: swimlane.id || swimlane.name,
          name: swimlane.name,
        };
      }
      return null;
    })
    .filter((swim): swim is { id: string; name: string } => swim !== null);

  return {
    columns: columnObjects,
    swimlanes: swimlaneObjects,
  };
}

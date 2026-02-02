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
      swimlanes:
        selectedSwimlaneIds.length === 0
          ? []
          : selectedSwimlaneIds
              .map(id => {
                // Normalize to strings for comparison (swim.id can be number from API, id is string from form)
                const swimlane = swimlanes.find(swim => String(swim.id) === String(id) || swim.name === id);
                if (swimlane) {
                  return {
                    id: String(swimlane.id || swimlane.name),
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
          // Normalize to strings for comparison (col.id can be number from API, id is string from form)
          const column = columns.find(col => String(col.id) === String(id));
          return column ? { id: String(column.id), name: column.name } : null;
        })
        .filter((col): col is { id: string; name: string } => col !== null),
      swimlanes: [],
    };
  }

  // Transform column IDs to column objects
  const columnObjects = selectedColumnIds
    .map(id => {
      // Normalize to strings for comparison (col.id can be number from API, id is string from form)
      const column = columns.find(col => String(col.id) === String(id));
      return column ? { id: String(column.id), name: column.name } : null;
    })
    .filter((col): col is { id: string; name: string } => col !== null);

  // Transform swimlane IDs to swimlane objects
  // Handle both id and name matching (if id is not available, use name as id)
  const swimlaneObjects = selectedSwimlaneIds
    .map(id => {
      // Normalize to strings for comparison (swim.id can be number from API, id is string from form)
      const swimlane = swimlanes.find(swim => String(swim.id) === String(id) || swim.name === id);
      if (swimlane) {
        return {
          id: String(swimlane.id || swimlane.name),
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

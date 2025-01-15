import { fireEvent, screen } from '@testing-library/react';
import { AvailableColorSchemas } from '../../colorSchemas';
import { setSelectedColorScheme } from '../../actions/setSelectedColorScheme';
import { setGroupingField } from '../../actions/setGroupingField';
import { GroupFields, Status } from '../../types';

export const BoardSettingsTabContentPageObject = {
  getColumns: () => {
    const columns = screen.getAllByTestId('sub-task-progress-column');
    return columns.map(column => ({
      name: column.querySelector('[data-testid="sub-task-progress-column-name"]')?.textContent || '',
      checked: column.querySelector('[data-testid="sub-task-progress-column-checkbox"]')?.matches(':checked') || false,
      click: () => fireEvent.click(column.querySelector('[data-testid="sub-task-progress-column-checkbox"]')!),
    }));
  },

  getColorScheme: () => {
    const colorScheme = screen.getByTestId('color-scheme-chooser');
    const colorSchemeOption = colorScheme.querySelector('[data-testid="color-scheme-chooser-option"]');
    return colorSchemeOption?.textContent;
  },

  setColorScheme: async (colorScheme: AvailableColorSchemas) => {
    // we cant set color scheme directly because antd is not ready to be used via testing-library
    setSelectedColorScheme(colorScheme);
  },

  setGroupingField: (groupingField: GroupFields) => {
    // we cant set grouping field directly because antd is not ready to be used via testing-library
    setGroupingField(groupingField);
  },

  getGroupingField: () => {
    const groupingField = screen.getByTestId('grouping-field-option');
    return groupingField.textContent;
  },

  getStatusMapping: (): Record<string, Status> => {
    const columns = screen.getAllByTestId('status-mapping-column');

    const statusMapping: Record<string, Status> = {};
    columns.forEach(column => {
      const columnName = column.querySelector('[data-testid="status-mapping-column-name"]')?.textContent || '';
      const statuses = column.querySelectorAll('[data-testid="status-mapping-column-status-card"]');
      statuses.forEach(status => {
        if (!status.textContent) throw new Error('Status text content is empty');
        statusMapping[status.textContent] = columnName as Status;
      });
    });
    return statusMapping;
  },
};

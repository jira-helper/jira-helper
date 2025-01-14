import { fireEvent, screen } from '@testing-library/react';
import { AvailableColorSchemas } from './colorSchemas';
import { setSelectedColorScheme } from './actions/setSelectedColorScheme';
import { setGroupingField } from './actions/setGroupingField';
import { GroupFields } from './types';

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
};

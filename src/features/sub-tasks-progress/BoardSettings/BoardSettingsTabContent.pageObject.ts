import { fireEvent, screen } from '@testing-library/react';

import { GroupFields, Status } from '../types';

import { setGroupingField } from './GroupingSettings/actions/setGroupingField';

export const BoardSettingsTabContentPageObject = {
  toggleEnabled: () => {
    fireEvent.click(screen.getByTestId('sub-task-progress-board-settings-enabled-checkbox'));
  },

  getResetButton: () => {
    return screen.getByTestId('reset-board-property-button');
  },

  getCountSettingsCheckboxes: () => {
    return screen.getByTestId('count-settings-card').querySelectorAll('checkbox');
  },

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

  setGroupingField: (groupingField: GroupFields) => {
    // we cant set grouping field directly because antd is not ready to be used via testing-library
    setGroupingField(groupingField);
  },

  getGroupingField: () => {
    const groupingField = screen.getByTestId('grouping-field-option');
    return groupingField.textContent;
  },

  getStatusMapping: (): Record<string, Status> => {
    const names = screen.getAllByTestId('subtasks-settings-status-name').map(name => name.textContent?.trim() || '');
    const values = screen
      .getAllByTestId('subtasks-settings-status-select')
      .map(select => select.textContent?.trim() || '');
    const statusMapping: Record<string, Status> = {};
    names.forEach((name, index) => {
      statusMapping[name!] = values[index] as Status;
    });
    return statusMapping;
  },
};

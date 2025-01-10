import { updateBoardProperty } from 'src/shared/jira/actions/updateBoardProperty';
import { AvailableColorSchemas } from '../colorSchemas';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const setSelectedColorScheme = (colorScheme: AvailableColorSchemas) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setSelectedColorScheme(colorScheme);
  updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data);
};

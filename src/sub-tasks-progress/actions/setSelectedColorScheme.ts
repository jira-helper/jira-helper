import { useJiraBoardPropertiesStore } from 'src/shared/jira/stores/jiraBoardProperties/jiraBoardProperties';
import { updateBoardProperty } from 'src/shared/jira/actions/updateBoardProperty';
import { AvailableColorSchemas } from '../colorSchemas';

export const setSelectedColorScheme = (colorScheme: AvailableColorSchemas) => {
  const currentState = useJiraBoardPropertiesStore.getState().properties['sub-task-progress'];
  const newState = { ...currentState, selectedColorScheme: colorScheme };
  updateBoardProperty('sub-task-progress', newState);
};

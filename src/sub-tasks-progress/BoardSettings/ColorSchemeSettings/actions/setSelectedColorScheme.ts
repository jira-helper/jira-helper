import { AvailableColorSchemas } from '../../../colorSchemas';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setSelectedColorScheme = (colorScheme: AvailableColorSchemas) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setSelectedColorScheme(colorScheme);
};

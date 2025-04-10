import { createAction } from 'src/shared/action';
import { AvailableColorSchemas } from '../../../colorSchemas';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setSelectedColorScheme = createAction({
  name: 'setSelectedColorScheme',
  handler(colorScheme: AvailableColorSchemas) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setSelectedColorScheme(colorScheme);
  },
});

import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setUseCustomColorScheme = createAction({
  name: 'setUseCustomColorScheme',
  handler(useCustomColorScheme: boolean) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setUseCustomColorScheme(useCustomColorScheme);
  },
});

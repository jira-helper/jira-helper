import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const changeUseCustomColorScheme = createAction({
  name: 'changeUseCustomColorScheme',
  handler(useCustomColorScheme: boolean) {
    useSubTaskProgressBoardPropertyStore.getState().actions.setUseCustomColorScheme(useCustomColorScheme);
  },
});

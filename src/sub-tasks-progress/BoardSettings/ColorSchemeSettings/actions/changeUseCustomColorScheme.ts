import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const changeUseCustomColorScheme = (useCustomColorScheme: boolean) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setUseCustomColorScheme(useCustomColorScheme);
};

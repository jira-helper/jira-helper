import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { AvailableColorSchemas } from '../../../colorSchemas';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setSelectedColorScheme = (colorScheme: AvailableColorSchemas) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setSelectedColorScheme(colorScheme);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};

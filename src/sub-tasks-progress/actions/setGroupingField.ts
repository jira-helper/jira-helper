import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';
import { GroupFields } from '../types';

export const setGroupingField = (groupingField: GroupFields) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setGroupingField(groupingField);
  globalContainer
    .inject(BoardPropertyServiceToken)
    .updateBoardProperty('sub-task-progress', useSubTaskProgressBoardPropertyStore.getState().data, {});
};

import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setColumns = (columns: { name: string; enabled: boolean }[]) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.setColumns(columns);
};

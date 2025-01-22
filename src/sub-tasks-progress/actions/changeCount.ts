import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';

export const changeCount = (countType: 'subtasks' | 'epics' | 'linkedIssues', value: boolean) => {
  useSubTaskProgressBoardPropertyStore.getState().actions.changeCount(countType, value);
};

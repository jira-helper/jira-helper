import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const enableGroupingByField = createAction({
  name: 'enableGroupingByField',
  handler: (enabled: boolean) => {
    const { actions } = useSubTaskProgressBoardPropertyStore.getState();
    actions.setEnableGroupByField(enabled);
  },
});

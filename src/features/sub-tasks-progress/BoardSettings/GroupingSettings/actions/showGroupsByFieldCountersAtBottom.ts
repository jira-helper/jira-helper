import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const showGroupsByFieldCountersAtBottom = createAction({
  name: 'showGroupsByFieldCountersAtBottom',
  handler: (show: boolean) => {
    const { actions } = useSubTaskProgressBoardPropertyStore.getState();
    actions.setShowGroupsByFieldCountersAtBottom(show);
  },
});

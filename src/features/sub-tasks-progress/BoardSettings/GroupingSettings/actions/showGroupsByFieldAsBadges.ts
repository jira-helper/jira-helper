import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const showGroupsByFieldAsBadges = createAction({
  name: 'showGroupsByFieldAsBadges',
  handler: (show: boolean) => {
    const { actions } = useSubTaskProgressBoardPropertyStore.getState();
    actions.setShowGroupsByFieldAsCounters(show);
  },
});

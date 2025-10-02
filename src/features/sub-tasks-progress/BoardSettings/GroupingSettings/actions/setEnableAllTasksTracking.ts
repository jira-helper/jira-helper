import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setEnableAllTasksTracking = createAction({
  name: 'setEnableAllTasksTracking',
  async handler(enabled: boolean) {
    const { actions } = useSubTaskProgressBoardPropertyStore.getState();
    actions.setEnableAllTasksTracking(enabled);
  },
});

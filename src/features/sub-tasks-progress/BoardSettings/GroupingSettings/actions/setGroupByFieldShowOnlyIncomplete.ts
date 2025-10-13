import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';

export const setGroupByFieldShowOnlyIncomplete = createAction({
  name: 'setGroupByFieldShowOnlyIncomplete',
  async handler(showOnlyIncomplete: boolean) {
    const { actions } = useSubTaskProgressBoardPropertyStore.getState();
    actions.setGroupByFieldShowOnlyIncomplete(showOnlyIncomplete);
  },
});

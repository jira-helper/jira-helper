import { createAction } from 'src/shared/action';
import { useSubTaskProgressBoardPropertyStore } from '../../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { CustomGroup } from './types';

export const addCustomGroup = createAction({
  name: 'addCustomGroup',
  handler() {
    useSubTaskProgressBoardPropertyStore.getState().actions.addCustomGroup();
  },
});

export const updateCustomGroup = createAction({
  name: 'updateCustomGroup',
  handler<Key extends keyof CustomGroup>(id: number, key: Key, value: CustomGroup[Key]) {
    useSubTaskProgressBoardPropertyStore.getState().actions.updateCustomGroup(id, key, value);
  },
});

export const removeCustomGroup = createAction({
  name: 'removeCustomGroup',
  handler(id: number) {
    useSubTaskProgressBoardPropertyStore.getState().actions.removeCustomGroup(id);
  },
});

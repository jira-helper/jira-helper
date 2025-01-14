import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from '../../shared/boardPropertyService';
import { useSubTaskProgressBoardPropertyStore } from '../stores/subTaskProgressBoardProperty';
import { BoardProperty } from '../types';

export const loadSubTaskProgressBoardProperty = async () => {
  // dont load if it loaded already
  if (
    useSubTaskProgressBoardPropertyStore.getState().state === 'loaded' ||
    useSubTaskProgressBoardPropertyStore.getState().state === 'loading'
  ) {
    return;
  }
  useSubTaskProgressBoardPropertyStore.getState().actions.setState('loading');
  const propertyData = await globalContainer
    .inject(BoardPropertyServiceToken)
    .getBoardProperty<BoardProperty | undefined>('sub-task-progress');

  if (!propertyData) {
    return;
  }
  useSubTaskProgressBoardPropertyStore.getState().actions.setData(propertyData);
  useSubTaskProgressBoardPropertyStore.getState().actions.setState('loaded');
};

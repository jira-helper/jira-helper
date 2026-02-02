import { getBoardIdFromURL } from 'src/routing';
import { getBoardProperty } from 'src/shared/jiraApi';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { useColumnLimitsPropertyStore } from '../store';
import type { WipLimitsProperty } from '../../types';

export const loadColumnLimitsProperty = async (): Promise<void> => {
  const store = useColumnLimitsPropertyStore.getState();
  if (store.state !== 'initial') return;

  store.actions.setState('loading');

  const boardId = getBoardIdFromURL();
  if (!boardId) {
    store.actions.setData({});
    store.actions.setState('loaded');
    return;
  }

  const data = await getBoardProperty<WipLimitsProperty>(boardId, BOARD_PROPERTIES.WIP_LIMITS_SETTINGS);
  store.actions.setData(data ?? {});
  store.actions.setState('loaded');
};

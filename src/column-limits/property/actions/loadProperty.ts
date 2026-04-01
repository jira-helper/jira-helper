import { routingServiceToken } from 'src/routing';
import { getBoardPropertyToken } from 'src/shared/di/jiraApiTokens';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { createAction } from 'src/shared/action';
import { useColumnLimitsPropertyStore } from '../store';
import type { WipLimitsProperty } from '../../types';

export const loadColumnLimitsProperty = createAction({
  name: 'loadColumnLimitsProperty',
  async handler(): Promise<void> {
    const store = useColumnLimitsPropertyStore.getState();
    if (store.state !== 'initial') return;

    store.actions.setState('loading');

    const boardId = this.di.inject(routingServiceToken).getBoardIdFromURL();
    if (!boardId) {
      store.actions.setData({});
      store.actions.setState('loaded');
      return;
    }

    const getBoardProperty = this.di.inject(getBoardPropertyToken);
    const data = await getBoardProperty<WipLimitsProperty>(boardId, BOARD_PROPERTIES.WIP_LIMITS_SETTINGS);
    store.actions.setData(data ?? {});
    store.actions.setState('loaded');
  },
});

import { routingServiceToken } from 'src/routing';
import { getBoardPropertyToken } from 'src/shared/di/jiraApiTokens';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { createAction } from 'src/shared/action';
import { usePersonWipLimitsPropertyStore } from '../store';
import { migrateProperty } from '../migrateProperty';
import type { PersonWipLimitsProperty_2_29 } from '../types';

export const loadPersonWipLimitsProperty = createAction({
  name: 'loadPersonWipLimitsProperty',
  async handler(): Promise<void> {
    const store = usePersonWipLimitsPropertyStore.getState();
    if (store.state !== 'initial') return;

    store.actions.setState('loading');

    const boardId = this.di.inject(routingServiceToken).getBoardIdFromURL();
    if (!boardId) {
      store.actions.setData({ limits: [] });
      store.actions.setState('loaded');
      return;
    }

    const getBoardProperty = this.di.inject(getBoardPropertyToken);
    const data = await getBoardProperty<PersonWipLimitsProperty_2_29>(boardId, BOARD_PROPERTIES.PERSON_LIMITS);
    store.actions.setData(migrateProperty(data ?? { limits: [] }));
    store.actions.setState('loaded');
  },
});

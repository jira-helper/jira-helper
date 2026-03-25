import { routingServiceToken } from 'src/routing';
import { getBoardProperty } from 'src/shared/jiraApi';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { createAction } from 'src/shared/action';
import { usePersonWipLimitsPropertyStore } from '../store';
import type { PersonWipLimitsProperty } from '../types';

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

    const data = await getBoardProperty<PersonWipLimitsProperty>(boardId, BOARD_PROPERTIES.PERSON_LIMITS);
    store.actions.setData(data ?? { limits: [] });
    store.actions.setState('loaded');
  },
});

import { createAction } from 'src/shared/action';
import { loggerToken } from 'src/shared/Logger';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { AdditionalCardElementsBoardProperty } from '../../types';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';

export const loadAdditionalCardElementsBoardProperty = createAction({
  name: 'loadAdditionalCardElementsBoardProperty',
  async handler() {
    const state = useAdditionalCardElementsBoardPropertyStore.getState();
    const { actions } = state;
    const log = this.di.inject(loggerToken).getPrefixedLog('loadAdditionalCardElementsBoardProperty');

    // dont load if it loaded already
    if (state.state === 'loaded' || state.state === 'loading') {
      return;
    }
    actions.setState('loading');

    const boardPropertyService = this.di.inject(BoardPropertyServiceToken);

    const propertyData = await boardPropertyService
      .getBoardProperty<AdditionalCardElementsBoardProperty | undefined>('additional-card-elements')
      .catch(e => {
        log(e.toString(), 'error');
        return undefined;
      });

    if (!propertyData) {
      actions.setData({});
      actions.setState('loaded');
      return;
    }
    actions.setData(propertyData);
    actions.setState('loaded');
  },
});

import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { createAction } from 'src/shared/action';
import { useJiraBoardPropertiesStore } from '../jiraBoardPropertiesStore';

export const updateBoardProperty = createAction({
  name: 'updateBoardProperty',
  async handler(key: string, value: any) {
    useJiraBoardPropertiesStore.getState().actions.setPropertyValue(key, value);
    const boardService = globalContainer.inject(BoardPropertyServiceToken);
    boardService.updateBoardProperty(key, value, {});
  },
});

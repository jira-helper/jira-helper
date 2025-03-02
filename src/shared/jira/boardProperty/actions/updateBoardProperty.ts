import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useJiraBoardPropertiesStore } from '../jiraBoardPropertiesStore';

export const updateBoardProperty = async <T>(key: string, value: T): Promise<void> => {
  useJiraBoardPropertiesStore.getState().actions.setPropertyValue(key, value);
  const boardService = globalContainer.inject(BoardPropertyServiceToken);
  boardService.updateBoardProperty(key, value, {});
};

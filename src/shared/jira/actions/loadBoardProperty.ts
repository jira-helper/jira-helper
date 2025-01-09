import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { useJiraBoardPropertiesStore } from 'src/shared/jira/stores/jiraBoardProperties/jiraBoardProperties';

export const loadBoardProperty = async <T>(key: string) => {
  const { value = undefined, loading = false } = useJiraBoardPropertiesStore.getState().properties[key] ?? {};

  if (loading) {
    return;
  }
  if (value) {
    return;
  }

  useJiraBoardPropertiesStore.getState().actions.startLoading(key);
  const boardService = globalContainer.inject(BoardPropertyServiceToken);
  const propertyResult = await boardService.getBoardProperty<T>(key);
  if (!propertyResult) {
    useJiraBoardPropertiesStore.getState().actions.finishLoading(key);
    throw new Error('Failed to load board property');
  }
  useJiraBoardPropertiesStore.getState().actions.setPropertyValue(key, propertyResult);
};

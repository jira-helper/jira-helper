import { useSubTaskProgressBoardPropertyStore } from 'src/sub-tasks-progress/stores/subTaskProgressBoardProperty';

export const useGetSettings = () => {
  const propertyData = useSubTaskProgressBoardPropertyStore(state => state.data);
  const propertyState = useSubTaskProgressBoardPropertyStore(state => state.state);

  return { settings: propertyData, state: propertyState };
};

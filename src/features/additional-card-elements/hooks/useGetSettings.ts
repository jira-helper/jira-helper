import { useShallow } from 'zustand/react/shallow';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';

export const useGetSettings = () => {
  const { data, state } = useAdditionalCardElementsBoardPropertyStore(
    useShallow(innerState => ({
      data: innerState.data,
      state: innerState.state,
    }))
  );

  return {
    settings: data,
    state,
  };
};

import { useShallow } from 'zustand/react/shallow';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';

export const useGetSettings = () => {
  const { data, state } = useAdditionalCardElementsBoardPropertyStore(
    useShallow(state => ({
      data: state.data,
      state: state.state,
    }))
  );

  return {
    settings: data,
    state,
  };
};

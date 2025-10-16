import { createAction } from 'src/shared/action';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';

export const setColumns = createAction({
  name: 'setColumns',
  handler: (columns: { name: string; enabled: boolean }[]) => {
    useAdditionalCardElementsBoardPropertyStore.getState().actions.setColumns(columns);
  },
});

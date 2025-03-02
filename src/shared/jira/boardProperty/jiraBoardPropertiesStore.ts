import { create } from 'zustand';
import { produce } from 'immer';

export type State = {
  [key: string]:
    | {
        value: any;
        loading: boolean;
      }
    | undefined;
};

type Actions = {
  setPropertyValue: (key: string, value: any) => void;
  startLoading: (key: string) => void;
  finishLoading: (key: string) => void;
};

type StoreState = {
  properties: State;
  actions: Actions;
};

export const useJiraBoardPropertiesStore = create<StoreState>(set => ({
  properties: {},
  actions: {
    setPropertyValue: (key: string, value: any) =>
      set(
        produce(state => {
          state.properties[key].value = value;
        })
      ),
    startLoading: (key: string) =>
      set(
        produce<StoreState>(state => {
          if (!state.properties[key]) {
            state.properties[key] = { value: undefined, loading: true };
          }
        })
      ),
    finishLoading: (key: string) =>
      set(
        produce<StoreState>(state => {
          if (state.properties[key]) {
            state.properties[key].loading = false;
          }
        })
      ),
  },
}));

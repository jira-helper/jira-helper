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

export type StoreState = {
  properties: State;
  actions: Actions;
};

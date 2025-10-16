import { create } from 'zustand';
import { produce } from 'immer';
import { State } from './additionalCardElementsBoardProperty.types';
import { AdditionalCardElementsBoardProperty, IssueLink } from '../types';

const initialData: Required<AdditionalCardElementsBoardProperty> = {
  columnsToTrack: [],
  issueLinks: [],
};

export const useAdditionalCardElementsBoardPropertyStore = create<State>()(set => ({
  data: initialData,
  state: 'initial',
  actions: {
    setData: data => {
      return set({ data: { ...initialData, ...data } });
    },

    setState: state => set({ state }),

    setColumns: columns =>
      set(
        produce((state: State) => {
          state.data.columnsToTrack = columns.filter(c => c.enabled).map(c => c.name);
        })
      ),

    setIssueLinks: (issueLinks: IssueLink[]) =>
      set(
        produce((state: State) => {
          state.data.issueLinks = issueLinks;
        })
      ),

    clearIssueLinks: () =>
      set(
        produce((state: State) => {
          state.data.issueLinks = [];
        })
      ),
  },
}));

// Add getInitialState method for testing
useAdditionalCardElementsBoardPropertyStore.getInitialState = () => ({
  data: initialData,
  state: 'initial',
  actions: {
    setData: (data: any) => {
      useAdditionalCardElementsBoardPropertyStore.setState({ data: { ...initialData, ...data } });
    },
    setState: (state: any) => {
      useAdditionalCardElementsBoardPropertyStore.setState({ state });
    },
    setColumns: (columns: { name: string; enabled: boolean }[]) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.columnsToTrack = columns.filter(c => c.enabled).map(c => c.name);
        })
      );
    },
    setIssueLinks: (issueLinks: IssueLink[]) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.issueLinks = issueLinks;
        })
      );
    },
    clearIssueLinks: () => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.issueLinks = [];
        })
      );
    },
  },
});

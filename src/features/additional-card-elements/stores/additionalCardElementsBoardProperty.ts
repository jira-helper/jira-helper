import { create } from 'zustand';
import { produce } from 'immer';
import { State } from './additionalCardElementsBoardProperty.types';
import { AdditionalCardElementsBoardProperty, IssueLink } from '../types';

const initialData: Required<AdditionalCardElementsBoardProperty> = {
  enabled: false,
  columnsToTrack: [],
  showInBacklog: false,
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

    setEnabled: enabled =>
      set(
        produce((state: State) => {
          state.data.enabled = enabled;
        })
      ),

    setColumns: columns =>
      set(
        produce((state: State) => {
          state.data.columnsToTrack = columns.filter(c => c.enabled).map(c => c.name);
        })
      ),

    setShowInBacklog: (showInBacklog: boolean) =>
      set(
        produce((state: State) => {
          state.data.showInBacklog = showInBacklog;
        })
      ),

    setIssueLinks: (issueLinks: IssueLink[]) =>
      set(
        produce((state: State) => {
          state.data.issueLinks = issueLinks;
        })
      ),

    addIssueLink: (issueLink: IssueLink) =>
      set(
        produce((state: State) => {
          state.data.issueLinks.push(issueLink);
        })
      ),

    updateIssueLink: (index: number, issueLink: IssueLink) =>
      set(
        produce((state: State) => {
          if (index >= 0 && index < state.data.issueLinks.length) {
            state.data.issueLinks[index] = issueLink;
          }
        })
      ),

    removeIssueLink: (index: number) =>
      set(
        produce((state: State) => {
          if (index >= 0 && index < state.data.issueLinks.length) {
            state.data.issueLinks.splice(index, 1);
          }
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
    setEnabled: (enabled: boolean) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.enabled = enabled;
        })
      );
    },
    setColumns: (columns: { name: string; enabled: boolean }[]) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.columnsToTrack = columns.filter(c => c.enabled).map(c => c.name);
        })
      );
    },
    setShowInBacklog: (showInBacklog: boolean) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.showInBacklog = showInBacklog;
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
    addIssueLink: (issueLink: IssueLink) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.issueLinks.push(issueLink);
        })
      );
    },
    updateIssueLink: (index: number, issueLink: IssueLink) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          if (index >= 0 && index < state.data.issueLinks.length) {
            state.data.issueLinks[index] = issueLink;
          }
        })
      );
    },
    removeIssueLink: (index: number) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          if (index >= 0 && index < state.data.issueLinks.length) {
            state.data.issueLinks.splice(index, 1);
          }
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

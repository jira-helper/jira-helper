import { create } from 'zustand';
import { produce } from 'immer';
import { RequiredBoardProperty, State } from './additionalCardElementsBoardProperty.types';
import { DaysInColumnSettings, DaysToDeadlineSettings, IssueLink } from '../types';

const DEFAULT_DAYS_IN_COLUMN: DaysInColumnSettings = {
  enabled: false,
  warningThreshold: undefined,
  dangerThreshold: undefined,
};

const DEFAULT_DAYS_TO_DEADLINE: DaysToDeadlineSettings = {
  enabled: false,
  fieldId: undefined,
  displayMode: 'always',
  displayThreshold: undefined,
  warningThreshold: undefined,
};

const initialData: RequiredBoardProperty = {
  enabled: false,
  columnsToTrack: [],
  showInBacklog: false,
  issueLinks: [],
  daysInColumn: DEFAULT_DAYS_IN_COLUMN,
  daysToDeadline: DEFAULT_DAYS_TO_DEADLINE,
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

    setDaysInColumn: (settings: Partial<DaysInColumnSettings>) =>
      set(
        produce((state: State) => {
          state.data.daysInColumn = { ...state.data.daysInColumn, ...settings };
        })
      ),

    setDaysToDeadline: (settings: Partial<DaysToDeadlineSettings>) =>
      set(
        produce((state: State) => {
          state.data.daysToDeadline = { ...state.data.daysToDeadline, ...settings };
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
    setDaysInColumn: (settings: Partial<DaysInColumnSettings>) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.daysInColumn = { ...state.data.daysInColumn, ...settings };
        })
      );
    },
    setDaysToDeadline: (settings: Partial<DaysToDeadlineSettings>) => {
      useAdditionalCardElementsBoardPropertyStore.setState(
        produce((state: State) => {
          state.data.daysToDeadline = { ...state.data.daysToDeadline, ...settings };
        })
      );
    },
  },
});

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { JiraIssueLinkType } from '../types';

interface JiraIssueLinkTypesState {
  linkTypes: JiraIssueLinkType[];
  isLoading: boolean;
  error: Error | null;
  setLinkTypes: (linkTypes: JiraIssueLinkType[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useJiraIssueLinkTypesStore = create<JiraIssueLinkTypesState>()(
  immer(set => ({
    linkTypes: [],
    isLoading: false,
    error: null,
    setLinkTypes: linkTypes =>
      set(state => {
        state.linkTypes = linkTypes;
      }),
    setLoading: isLoading =>
      set(state => {
        state.isLoading = isLoading;
      }),
    setError: error =>
      set(state => {
        state.error = error;
      }),
  }))
);

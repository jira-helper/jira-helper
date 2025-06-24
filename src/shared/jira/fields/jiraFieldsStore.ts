import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { JiraField } from '../types';

interface JiraFieldsState {
  fields: JiraField[];
  isLoading: boolean;
  error: Error | null;
  setFields: (fields: JiraField[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useJiraFieldsStore = create<JiraFieldsState>()(
  immer(set => ({
    fields: [],
    isLoading: false,
    error: null,
    setFields: fields =>
      set(state => {
        state.fields = fields;
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

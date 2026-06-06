import { create } from 'zustand';
import { produce } from 'immer';
import { JiraField } from '../types';

interface JiraFieldsState {
  fields: JiraField[];
  isLoading: boolean;
  error: Error | null;
  setFields: (fields: JiraField[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useJiraFieldsStore = create<JiraFieldsState>(set => ({
  fields: [],
  isLoading: false,
  error: null,
  setFields: fields =>
    set(
      produce(state => {
        state.fields = fields;
      })
    ),
  setLoading: isLoading =>
    set(
      produce(state => {
        state.isLoading = isLoading;
      })
    ),
  setError: error =>
    set(
      produce(state => {
        state.error = error;
      })
    ),
}));

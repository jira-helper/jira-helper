import { useEffect, useRef } from 'react';
import { useJiraFieldsStore } from './jiraFieldsStore';
import { loadJiraFields } from './loadJiraFields';

export const useGetFields = () => {
  const { fields, isLoading, error } = useJiraFieldsStore();

  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (fields.length === 0 && !isLoading && !error) {
      const controller = new AbortController();
      abortController.current = controller;

      loadJiraFields(controller.signal);
    }
  }, [fields.length, isLoading, error]);

  useEffect(() => {
    return () => {
      abortController.current?.abort();
    };
  }, []);

  return { fields, isLoading, error };
};

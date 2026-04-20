import { useEffect, useRef } from 'react';
import { useJiraStatusesStore } from './jiraStatusesStore';
import { loadJiraStatuses } from './loadJiraStatuses';

export const useGetStatuses = () => {
  const { statuses, isLoading, error } = useJiraStatusesStore();

  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (statuses.length === 0 && !isLoading && !error) {
      const controller = new AbortController();
      abortController.current = controller;

      loadJiraStatuses(controller.signal);
    }
  }, [statuses.length, isLoading, error]);

  useEffect(() => {
    return () => {
      abortController.current?.abort();
    };
  }, []);

  return { statuses, isLoading, error };
};

import { useEffect, useRef } from 'react';
import { useJiraStatusesStore } from './jiraStatusesStore';
import { loadJiraStatuses } from './loadJiraStatuses';

export const useGetStatuses = () => {
  const { statuses, isLoading, error } = useJiraStatusesStore();

  const abortController = useRef<AbortController | null>(null);
  const attemptedLoadRef = useRef(false);

  useEffect(() => {
    if (statuses.length > 0) {
      attemptedLoadRef.current = false;
      return;
    }
    if (!isLoading && !attemptedLoadRef.current) {
      const controller = new AbortController();
      abortController.current = controller;
      attemptedLoadRef.current = true;

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

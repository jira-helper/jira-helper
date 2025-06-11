import { useEffect, useRef } from 'react';
import { useJiraIssueLinkTypesStore } from './jiraIssueLinkTypesStore';
import { loadJiraIssueLinkTypes } from './loadJiraIssueLinkTypes';

export const useGetIssueLinkTypes = () => {
  const { linkTypes, isLoading, error } = useJiraIssueLinkTypesStore();

  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (linkTypes.length === 0 && !isLoading && !error) {
      const controller = new AbortController();
      loadJiraIssueLinkTypes(controller.signal);
    }
  }, [linkTypes.length, isLoading, error]);

  useEffect(() => {
    return () => {
      abortController.current?.abort();
    };
  }, []);

  return { linkTypes, isLoading, error };
};

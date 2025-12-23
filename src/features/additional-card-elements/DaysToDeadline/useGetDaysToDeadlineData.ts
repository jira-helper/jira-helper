import { useEffect, useState } from 'react';
import { globalContainer } from 'dioma';
import { JiraServiceToken } from 'src/shared/jira/jiraService';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';
import { calculateDaysRemaining, getDaysToDeadlineColor, formatDaysToDeadline } from './utils';
import { BadgeColor } from '../Badge';

export interface DaysToDeadlineData {
  text: string;
  color: BadgeColor;
  days: number;
}

export function useGetDaysToDeadlineData(issueKey: string): DaysToDeadlineData | null {
  const settings = useAdditionalCardElementsBoardPropertyStore(state => state.data.daysToDeadline);
  const [data, setData] = useState<DaysToDeadlineData | null>(null);

  useEffect(() => {
    if (!settings.enabled || !settings.fieldId) {
      setData(null);
      return undefined;
    }

    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const jiraService = globalContainer.inject(JiraServiceToken);
        const issueResult = await jiraService.fetchJiraIssue(issueKey, abortController.signal);
        if (issueResult.err) {
          setData(null);
          return;
        }

        const issue = issueResult.val;
        const fieldValue = issue.fields[settings.fieldId!];

        const days = calculateDaysRemaining(fieldValue as string);

        if (days === null) {
          setData(null);
          return;
        }

        // Check display mode
        const displayMode = settings.displayMode || 'always';
        const shouldDisplay = (() => {
          if (displayMode === 'always') {
            return true;
          }
          if (displayMode === 'overdueOnly') {
            return days < 0;
          }
          if (displayMode === 'lessThanOrOverdue') {
            const threshold = settings.displayThreshold;
            if (threshold === undefined) {
              return days < 0; // If threshold not set, show only overdue
            }
            return days < 0 || days <= threshold;
          }
          return true;
        })();

        if (!shouldDisplay) {
          setData(null);
          return;
        }

        const color = getDaysToDeadlineColor(days, settings);
        if (color === null) {
          setData(null);
          return;
        }

        const text = formatDaysToDeadline(days);
        setData({ text, color, days });
      } catch {
        setData(null);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [issueKey, settings]);

  return data;
}

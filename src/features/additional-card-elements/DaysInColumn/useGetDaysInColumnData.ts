import { useMemo } from 'react';
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';
import { getDaysInColumnColor, formatDaysInColumn } from './utils';
import { BadgeColor } from '../Badge';

export interface DaysInColumnData {
  text: string;
  color: BadgeColor;
  days: number;
}

export function useGetDaysInColumnData(issueKey: string): DaysInColumnData | null {
  const settings = useAdditionalCardElementsBoardPropertyStore(state => state.data.daysInColumn);

  return useMemo(() => {
    if (!settings.enabled) {
      return null;
    }

    const days = BoardPagePageObject.getDaysInColumn(issueKey);
    if (days === null) {
      return null;
    }

    // Get column name for per-column thresholds
    const columnName = BoardPagePageObject.getColumnOfIssue(issueKey);
    const color = getDaysInColumnColor(days, settings, columnName);
    const text = formatDaysInColumn(days);

    return { text, color, days };
  }, [issueKey, settings]);
}

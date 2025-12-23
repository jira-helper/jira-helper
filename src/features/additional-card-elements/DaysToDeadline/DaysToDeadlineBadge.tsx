import React from 'react';
import { Badge } from '../Badge';
import { useGetDaysToDeadlineData } from './useGetDaysToDeadlineData';

export interface DaysToDeadlineBadgeProps {
  issueKey: string;
}

export const DaysToDeadlineBadge: React.FC<DaysToDeadlineBadgeProps> = ({ issueKey }) => {
  const data = useGetDaysToDeadlineData(issueKey);

  if (!data) {
    return null;
  }

  const content =
    data.days === 0 ? (
      <span style={{ fontSize: '14px', lineHeight: '14px' }}>{data.text}</span>
    ) : (
      <span style={{ fontSize: '14px', lineHeight: '14px' }}>{data.text}</span>
    );

  return <Badge color={data.color}>{content}</Badge>;
};

import React from 'react';
import { Badge } from '../Badge';
import { useGetDaysInColumnData } from './useGetDaysInColumnData';

export interface DaysInColumnBadgeProps {
  issueKey: string;
}

export const DaysInColumnBadge: React.FC<DaysInColumnBadgeProps> = ({ issueKey }) => {
  const data = useGetDaysInColumnData(issueKey);

  if (!data) {
    return null;
  }

  return (
    <Badge color={data.color}>
      <span style={{ fontSize: '14px', lineHeight: '14px' }}>{data.text}</span>
    </Badge>
  );
};

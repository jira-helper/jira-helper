import Tooltip from 'antd/es/tooltip';
import React from 'react';
import { ColorScheme, Status, SubTasksProgress } from '../../types';

export const SubTasksProgressComponent = (props: { progress: SubTasksProgress; colorScheme: ColorScheme }) => {
  const { progress, colorScheme } = props;
  const totalCount = Object.values(progress).reduce((acc, count) => acc + count, 0);

  if (totalCount === 0) {
    return null;
  }

  // Filter out statuses with 0 count
  const activeStatuses = Object.entries(progress)
    .filter(([, count]) => count > 0)
    .map(([status]) => status as Status);

  // Calculate proportional widths based on counts
  const totalWidth = 200;
  const margin = 2;
  const availableWidth = totalWidth - margin * activeStatuses.length;

  const title = Object.entries(progress)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${count} ${status}`)
    .join(' / ');

  const getProgressBarStyle = (isFirst: boolean, isLast: boolean) => ({
    display: 'block',
    height: '8px',
    /**
     * first and last bar have rounded corners
     */
    borderRadius: `${isFirst ? '4px' : '0'} ${isLast ? '4px' : '0'} ${isLast ? '4px' : '0'} ${isFirst ? '4px' : '0'}`,
  });

  return (
    <Tooltip title={title}>
      <div style={{ display: 'flex', gap: `${margin}px`, width: `${totalWidth}px` }}>
        {activeStatuses.map(status => {
          const proportion = progress[status] / totalCount;
          const width = Math.max(availableWidth * proportion, 10);
          const isFirst = activeStatuses.indexOf(status) === 0;
          const isLast = activeStatuses.indexOf(status) === activeStatuses.length - 1;
          return (
            <span
              key={status}
              style={{
                ...getProgressBarStyle(isFirst, isLast),
                width: `${width}px`,
                backgroundColor: colorScheme[status],
              }}
            />
          );
        })}
      </div>
    </Tooltip>
  );
};

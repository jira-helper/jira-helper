import Tooltip from 'antd/es/tooltip';
import React from 'react';
import { ActiveStatuses, ColorScheme, SubTasksProgress } from '../../types';

export const SubTasksProgressComponent = (props: { progress: SubTasksProgress; colorScheme: ColorScheme }) => {
  const { progress, colorScheme } = props;
  const totalCount = Object.values(progress).reduce((acc, count) => acc + count, 0);

  if (totalCount === 0) {
    return null;
  }

  // Filter out statuses with 0 count
  const activeStatuses = Object.entries(progress)
    .filter(([, count]) => count > 0)
    .map(([status]) => status as ActiveStatuses);

  // Calculate proportional widths based on counts
  const totalWidth = 100;

  const availableWidth = 100;

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
      <div style={{ display: 'flex', gap: '0px', width: `${totalWidth}%` }}>
        {activeStatuses.map(status => {
          const proportion = progress[status] / totalCount;

          const width = Math.ceil(availableWidth * proportion);
          const isFirst = activeStatuses.indexOf(status) === 0;
          const isLast = activeStatuses.indexOf(status) === activeStatuses.length - 1;
          return (
            <span
              key={status}
              style={{
                ...getProgressBarStyle(isFirst, isLast),
                width: `${width}%`,
                backgroundColor: colorScheme[status],
              }}
            />
          );
        })}
      </div>
    </Tooltip>
  );
};

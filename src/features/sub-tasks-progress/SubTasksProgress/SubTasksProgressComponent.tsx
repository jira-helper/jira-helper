import Tooltip from 'antd/es/tooltip';
import React from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import { ActiveStatuses, SubTasksProgress } from '../types';
import styles from './SubTasksProgressComponent.module.css';
import { jiraColorScheme } from '../colorSchemas';
import { StatusNamesTexts } from '../constants';

export const SubTasksProgressComponent = (props: { progress: SubTasksProgress }) => {
  const texts = useGetTextsByLocale(StatusNamesTexts);
  const { progress } = props;
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
    .map(([status, count]) => `${count} ${texts[status as keyof SubTasksProgress]}`)
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
      <div className={styles.container} style={{ width: `${totalWidth}%` }}>
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
                backgroundColor: jiraColorScheme[status],
              }}
            />
          );
        })}
      </div>
    </Tooltip>
  );
};

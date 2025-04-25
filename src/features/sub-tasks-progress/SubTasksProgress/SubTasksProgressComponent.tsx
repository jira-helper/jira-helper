import Tooltip from 'antd/es/tooltip';
import React from 'react';
import { useGetTextsByLocale } from 'src/shared/texts';
import { ActiveStatuses, ColorScheme, SubTasksProgress } from '../types';
import styles from './SubTasksProgressComponent.module.css';

const TEXTS: Record<keyof SubTasksProgress, { en: string; ru: string }> = {
  todo: {
    en: 'To Do',
    ru: 'К выполнению',
  },
  inProgress: {
    en: 'In Progress',
    ru: 'В работе',
  },
  almostDone: {
    en: 'Almost Done',
    ru: 'Почти выполнено',
  },
  done: {
    en: 'Done',
    ru: 'Выполнено',
  },
  blocked: {
    en: 'Blocked',
    ru: 'Заблокировано',
  },
  unmapped: {
    en: 'Unknown',
    ru: 'Неизвестно',
  },
};
export const SubTasksProgressComponent = (props: { progress: SubTasksProgress; colorScheme: ColorScheme }) => {
  const texts = useGetTextsByLocale(TEXTS);
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
                backgroundColor: colorScheme[status],
              }}
            />
          );
        })}
      </div>
    </Tooltip>
  );
};

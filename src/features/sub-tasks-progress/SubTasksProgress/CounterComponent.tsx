import React from 'react';
import { Tag, Tooltip } from 'antd';
import { WarningFilled } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import styles from './CounterComponent.module.css';
import { SubTasksProgress } from '../types';
import { StatusNamesTexts } from '../constants';

interface CounterComponentProps {
  groupName: string;
  progress: SubTasksProgress;
  pendingColor: string;
  doneColor: string;
  comments: string[];
}

export const CounterComponent: React.FC<CounterComponentProps> = ({
  groupName,
  progress,
  pendingColor,
  doneColor,
  comments,
}) => {
  const texts = useGetTextsByLocale(StatusNamesTexts);
  const current = progress.done;
  const total = Object.values(progress).reduce((acc, curr) => acc + curr, 0);
  const isComplete = current === total;
  const backgroundColor = isComplete ? doneColor : pendingColor;
  const counterText = `${groupName} ${current}/${total}`;

  const warningContent =
    comments.length > 0 ? (
      <Tooltip
        title={comments.map(comment => (
          <div key={comment}>{comment}</div>
        ))}
      >
        <WarningFilled style={{ color: '#faad14' }} />
      </Tooltip>
    ) : undefined;

  const tooltipText = Object.entries(progress)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${count} ${texts[status as keyof SubTasksProgress]}`)
    .join(' / ');

  return (
    <Tag color={backgroundColor} style={{ margin: 0 }}>
      <span className={styles.counterContent}>
        <Tooltip title={tooltipText}>{counterText}</Tooltip>
        {warningContent}
      </span>
    </Tag>
  );
};

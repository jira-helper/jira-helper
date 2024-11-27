import Tooltip from 'antd/es/tooltip';
import Progress from 'antd/es/progress';
import React from 'react';
import { ColorScheme, Status, SubTasksProgress } from './types';

export const SubTasksProgressComponent = (props: { progress: SubTasksProgress; colorScheme: ColorScheme }) => {
  const { progress, colorScheme } = props;
  const totalCount = Object.values(progress).reduce((acc, count) => acc + count, 0);

  const percent = Math.floor((progress.done / totalCount) * 100);

  const strokeColor = [];
  for (const status in progress) {
    const count = progress[status as Status];
    const color = colorScheme[status as Status];
    for (let i = 0; i < count; i++) {
      strokeColor.push(color);
    }
  }

  const title = Object.entries(progress)
    .map(([status, count]) => `${count} ${status}`)
    .join(' / ');

  const margin = 2;
  const stepWidth = (200 - margin * totalCount) / totalCount;
  // what if total count > 100 or 200? Need simpler to make 5 steps
  return (
    <Tooltip title={title}>
      <Progress percent={percent} steps={totalCount} strokeColor={strokeColor} size={{ width: stepWidth }} />
    </Tooltip>
  );
};

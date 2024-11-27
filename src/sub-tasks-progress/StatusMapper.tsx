import Progress from 'antd/es/progress';
import Tooltip from 'antd/es/tooltip';
import React from 'react';

type Status = 'backlog' | 'todo' | 'inProgress' | 'almostDone' | 'done';
type SubTasksProgress = {
  [key in Status]: number;
};

/**
 * used to map statuses to colors
 */
type ColorScheme = {
  [key in Status]: string;
};

const JiraColorScheme: ColorScheme = {
  backlog: '#000000',
  todo: '#000000',
  inProgress: '#000000',
  almostDone: '#000000',
  done: '#000000',
};

const yellowGreenColorScheme: ColorScheme = {
  backlog: '#000000',
  todo: '#000000',
  inProgress: '#000000',
  almostDone: '#000000',
  done: '#000000',
};

export const SubTasksProgress = (props: { progress: SubTasksProgress; colorScheme: ColorScheme }) => {
  const { progress, colorScheme } = props;
  const totalCount = Object.values(progress).reduce((acc, count) => acc + count, 0);
  const percent = (progress.done / totalCount) * 100;

  const strokeColor = [];
  for (const status in progress) {
    const count = progress[status];
    const color = colorScheme[status];
    for (let i = 0; i < count; i++) {
      strokeColor.push(color);
    }
  }

  const title = Object.entries(progress)
    .map(([status, count]) => `${count} ${status}`)
    .join(' / ');
  return (
    <Tooltip title={title}>
      <Progress percent={percent} steps={totalCount} strokeColor={strokeColor} />
    </Tooltip>
  );
};

const SchemeChooser = (props: { scheme: ColorScheme; onSelect: (scheme: ColorScheme) => void }) => {
  const { scheme, onSelect } = props;
  <Tooltip title="3 done / 3 in progress / 4 to do">
    <Progress percent={60} success={{ percent: 30 }} />
  </Tooltip>;

  return <div>SchemeChooser</div>;
};

export const StatusMapper = () => {
  return <div>StatusMapper</div>;
};

import React from 'react';
import { WarningFilled } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';
import { SubTasksProgress, ColorScheme } from '../types';
import { SubTasksProgressComponent } from './SubTasksProgressComponent';
import styles from './SubTaskProgressByGroup.module.css';
/**
 * shows group name and progress bar
 */
export const SubTaskProgressByGroup = (props: {
  groupName: string;
  progress: SubTasksProgress;
  colorScheme: ColorScheme;
  warning?: React.ReactNode;
}) => {
  const { groupName, progress, colorScheme, warning } = props;
  const count = Object.values(progress).reduce((acc, c) => acc + c, 0);
  return (
    <>
      <div className={styles.group}>
        <span className={styles.groupName} title={groupName}>
          {groupName}
        </span>{' '}
        ({count})
        {warning && (
          <Tooltip title={warning}>
            <WarningFilled style={{ color: '#faad14' }} />
          </Tooltip>
        )}
      </div>
      <SubTasksProgressComponent progress={progress} colorScheme={colorScheme} />
    </>
  );
};

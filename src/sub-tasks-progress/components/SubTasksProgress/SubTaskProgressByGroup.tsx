import React from 'react';
import { WarningFilled } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';
import { SubTasksProgress, ColorScheme } from '../../types';
import { SubTasksProgressComponent } from './SubTasksProgressComponent';

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
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        {groupName}
        {warning && (
          <Tooltip title={warning}>
            <WarningFilled style={{ color: '#faad14' }} />
          </Tooltip>
        )}
      </div>
      <SubTasksProgressComponent progress={progress} colorScheme={colorScheme} />
    </div>
  );
};

import React from 'react';
import { Checkbox } from 'antd';

import { useGetSettings } from 'src/sub-tasks-progress/SubTaskProgressSettings/hooks/useGetSettings';
import { jiraColorScheme } from '../../colorSchemas';
import { useGetSubtasksForStatusSettings } from './hooks/useGetSubtasksForStatusSettings';
import { toggleIgnoreStatus } from './actions/toggleIgnoreStatus';

export const StatusCategorySettings = () => {
  const { settings } = useGetSettings();
  const { statuses } = useGetSubtasksForStatusSettings();

  if (settings.useCustomColorScheme) {
    return null;
  }

  const mapStatusCategeoryToColor = (statusCategory: 'new' | 'indeterminate' | 'done') => {
    if (statusCategory === 'new') {
      return jiraColorScheme.todo;
    }
    if (statusCategory === 'indeterminate') {
      return jiraColorScheme.inProgress;
    }
    return jiraColorScheme.done;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gap: 10,
        width: 'max-content',
        alignItems: 'center',
      }}
    >
      {Object.entries(statuses).map(([statusId, status]) => {
        const statusIdNumber = parseInt(statusId, 10);
        if (Number.isNaN(statusIdNumber)) {
          return null;
        }
        return (
          <>
            {status.name}
            <span
              style={{
                display: 'inline-block',
                width: '1em',
                height: '1em',
                backgroundColor: mapStatusCategeoryToColor(status.statusCategory),
                marginRight: '0.5em',
              }}
            />
            <Checkbox
              checked={settings.ignoredStatuses.includes(statusIdNumber)}
              onChange={() => {
                toggleIgnoreStatus(statusIdNumber);
              }}
            >
              Ignore status
            </Checkbox>
          </>
        );
      })}
    </div>
  );
};

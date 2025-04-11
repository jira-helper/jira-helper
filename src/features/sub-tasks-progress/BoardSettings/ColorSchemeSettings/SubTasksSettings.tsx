import React from 'react';
import { Checkbox, Select, Tooltip } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import { useGetSettings } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/hooks/useGetSettings';
import { useGetTextsByLocale } from 'src/shared/texts';
import { availableStatuses, jiraColorScheme, yellowGreenColorScheme } from '../../colorSchemas';
import { useGetSubtasksForStatusSettings } from './hooks/useGetSubtasksForStatusSettings';
import { moveBoardStatusToProgressStatus } from './actions/moveBoardStatusToProgressStatus';
import { toggleIgnoreStatus } from './actions/toggleIgnoreStatus';

const TEXTS = {
  ignoreStatus: {
    en: 'Ignore status',
    ru: 'Игнорировать статус',
  },
};
export const SubTasksSettings = () => {
  const { statuses } = useGetSubtasksForStatusSettings();
  const { settings } = useGetSettings();
  const texts = useGetTextsByLocale(TEXTS);
  if (!settings.useCustomColorScheme) {
    return null;
  }

  const statusMapping = settings.newStatusMapping;
  const colorScheme = settings.selectedColorScheme === 'jira' ? jiraColorScheme : yellowGreenColorScheme;

  return (
    <div
      data-testid="subtasks-settings"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto auto auto',
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
        const projects = status.projects.join(', ');
        return (
          <>
            <span data-testid="subtasks-settings-status-name"> {status.name}</span>
            {projects.length > 0 ? (
              <Tooltip title={`projects: ${projects}`}>
                <span>
                  <InfoCircleFilled style={{ color: '#1677ff' }} />
                </span>
              </Tooltip>
            ) : (
              <span />
            )}
            <Select
              data-testid="subtasks-settings-status-select"
              style={{ minWidth: 140 }}
              disabled={!settings.enabled}
              value={statusMapping[statusIdNumber]?.progressStatus || 'unmapped'}
              onChange={value => {
                moveBoardStatusToProgressStatus(statusIdNumber, status.name, value);
              }}
            >
              {availableStatuses.map(avStatus => {
                return (
                  <Select.Option key={avStatus} value={avStatus} data-testid="subtasks-settings-status-select-option">
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '1em',
                          height: '1em',
                          backgroundColor: colorScheme[avStatus],
                          marginRight: '0.5em',
                        }}
                      />
                      {avStatus}
                    </span>
                  </Select.Option>
                );
              })}
            </Select>
            <Checkbox
              data-testid="subtasks-settings-status-checkbox"
              disabled={!settings.enabled}
              checked={settings.ignoredStatuses.includes(statusIdNumber)}
              onChange={() => {
                toggleIgnoreStatus(statusIdNumber);
              }}
            >
              {texts.ignoreStatus}
            </Checkbox>
          </>
        );
      })}
    </div>
  );
};

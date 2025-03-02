import React from 'react';
import { Checkbox, Select, Tooltip } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import { useGetSettings } from '../../hooks/useGetSettings';
import { availableStatuses, jiraColorScheme, yellowGreenColorScheme } from '../../colorSchemas';
import { useGetSubtasksForStatusSettings } from './hooks/useGetSubtasksForStatusSettings';
import { newMoveBoardStatusToProgressStatus } from './actions/newMoveBoardStatusToProgressStatus';
import { toggleIgnoreStatus } from './actions/toggleIgnoreStatus';

export const SubTasksSettings = () => {
  const { statuses } = useGetSubtasksForStatusSettings();
  const { settings } = useGetSettings();

  if (!settings.useCustomColorScheme) {
    return null;
  }

  const statusMapping = settings.newStatusMapping;
  const colorScheme = settings.selectedColorScheme === 'jira' ? jiraColorScheme : yellowGreenColorScheme;

  return (
    <div
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
            <span> {status.name}</span>
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
              style={{ minWidth: 140 }}
              value={statusMapping[statusIdNumber]?.progressStatus || 'unmapped'}
              onChange={value => {
                newMoveBoardStatusToProgressStatus(statusIdNumber, status.name, value);
              }}
            >
              {availableStatuses.map(avStatus => {
                return (
                  <Select.Option key={avStatus} value={avStatus}>
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

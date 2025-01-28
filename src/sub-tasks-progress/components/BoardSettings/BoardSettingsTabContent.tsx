import Checkbox from 'antd/es/checkbox';
import Spin from 'antd/es/spin';
import React, { useMemo, useState } from 'react';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useShallow } from 'zustand/react/shallow';
import Select from 'antd/es/select';

import { Badge, Tag, Tooltip } from 'antd';

import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks/jiraSubtasks';

import { useDi } from 'src/shared/diContext';

import {
  moveBoardStatusToProgressStatus,
  newMoveBoardStatusToProgressStatus,
} from 'src/sub-tasks-progress/actions/moveBoardStatusToProgressStatus';
import { CloseCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import { changeCount } from 'src/sub-tasks-progress/actions/changeCount';
import { resetBoardProperty } from 'src/sub-tasks-progress/actions/resetBoardProperty';
import { removeIgnoredGroup } from 'src/sub-tasks-progress/actions/removeIgnoredGroup';
import { addIgnoredGroup } from 'src/sub-tasks-progress/actions/addIgnoredGroup';
import { availableColorSchemas, availableStatuses, jiraColorScheme, yellowGreenColorScheme } from '../../colorSchemas';
import { SubTasksProgressComponent } from '../SubTasksProgress/SubTasksProgressComponent';
import { subTasksProgress } from '../SubTasksProgress/testData';
import { GroupFields, Status } from '../../types';
import { setSelectedColorScheme } from '../../actions/setSelectedColorScheme';
import { useSubTaskProgressBoardPropertyStore } from '../../stores/subTaskProgressBoardProperty';

import { setColumns } from '../../actions/setColumns';
import { setGroupingField } from '../../actions/setGroupingField';
import { useGetSettings } from '../../hooks/useGetSettings';

export const ColumnsSettingsPure = (props: {
  columns: { name: string; enabled: boolean }[];
  onUpdate: (columns: { name: string; enabled: boolean }[]) => void;
  loading?: boolean;
}) => {
  return (
    <div>
      <p>Select columns where sub-tasks progress should be tracked:</p>
      {props.loading && <Spin />}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {props.columns.map(column => (
          <div key={column.name} data-testid="sub-task-progress-column">
            <Checkbox
              data-testid="sub-task-progress-column-checkbox"
              checked={column.enabled}
              onChange={() => {
                const updatedColumns = props.columns.map(c => {
                  if (c.name === column.name) {
                    return { ...c, enabled: !c.enabled };
                  }
                  return c;
                });
                props.onUpdate(updatedColumns);
              }}
            >
              <span data-testid="sub-task-progress-column-name">{column.name}</span>
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  );
};

const useGetAllSubtasks = () => {
  const { data } = useJiraSubtasksStore(
    useShallow(state => {
      return { data: state.data };
    })
  );
  const loading = Object.values(data).some(item => item?.state === 'loading');
  const issues = Object.values(data).flatMap(item => [...(item?.subtasks || []), ...(item?.externalLinks || [])]);
  return { issues, loading };
};

const ColumnsSettingsContainer = () => {
  const boardPagePageObject = useDi().inject(boardPagePageObjectToken) as typeof BoardPagePageObject;
  const [columnsFromBoard] = useState<string[]>(boardPagePageObject.getColumns());

  const propertyData = useSubTaskProgressBoardPropertyStore(useShallow(state => state.data));

  const columns = useMemo(() => {
    const columnsToTrack = propertyData?.columnsToTrack || [];
    const columnsToState = columnsFromBoard.map(column => ({
      name: column,
      enabled: columnsToTrack.includes(column),
    }));
    return columnsToState;
  }, [propertyData, columnsFromBoard]);

  const propertyState = useSubTaskProgressBoardPropertyStore(useShallow(state => state.state));

  return (
    <ColumnsSettingsPure
      columns={columns}
      onUpdate={setColumns}
      loading={propertyState === 'loading' || propertyState === 'initial'}
    />
  );
};

const groupingFields: GroupFields[] = ['project', 'assignee', 'reporter', 'priority', 'creator', 'issueType'];

const SubTasksSettings = () => {
  const { issues } = useGetAllSubtasks();
  const { settings } = useGetSettings();

  const statusProjectMap: Record<number, string[] | undefined> = {};
  const statusNameMap: Record<number, string | undefined> = {};
  issues.forEach(issue => {
    const project = issue.fields.project.key;
    const statusName = issue.fields.status.name;
    const statusId = issue.fields.status.id;
    if (!statusProjectMap[statusId]) {
      statusProjectMap[statusId] = [];
    }
    if (!statusProjectMap[statusId].includes(project)) {
      statusProjectMap[statusId].push(project);
    }
    statusNameMap[statusId] = statusName;
  });
  const statuses = Object.keys(statusProjectMap);
  const statusMapping = settings.newStatusMapping;
  const actualStatusMapping: Record<
    number,
    {
      name: string;
      progressStatus: Status;
    }
  > = {
    ...statusMapping,
  };

  statuses.forEach(statusId => {
    const statusIdNumber = parseInt(statusId, 10);
    if (Number.isNaN(statusIdNumber)) {
      return;
    }
    actualStatusMapping[statusIdNumber] = statusMapping[statusIdNumber] ?? {
      name: statusNameMap[statusIdNumber] ?? 'unknown',
      progressStatus: 'unmapped',
    };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: 10, width: 'max-content' }}>
      {Object.keys(actualStatusMapping).map(statusId => {
        const statusIdNumber = parseInt(statusId, 10);
        if (Number.isNaN(statusIdNumber)) {
          return null;
        }
        return (
          <>
            <span> {statusNameMap[statusIdNumber]}</span>
            {statusProjectMap[statusIdNumber] && statusProjectMap[statusIdNumber]?.length > 0 ? (
              <Tooltip title={`projects: ${statusProjectMap[statusIdNumber].join(', ')}`}>
                <span>
                  <InfoCircleFilled style={{ color: '#1677ff' }} />
                </span>
              </Tooltip>
            ) : (
              <span />
            )}
            <Select
              style={{ minWidth: 140 }}
              value={actualStatusMapping[statusIdNumber].progressStatus}
              onChange={value => {
                newMoveBoardStatusToProgressStatus(statusIdNumber, statusNameMap[statusIdNumber] || 'unknown', value);
              }}
            >
              {availableStatuses.map(avStatus => {
                return (
                  <Select.Option key={avStatus} value={avStatus}>
                    {avStatus}
                  </Select.Option>
                );
              })}
            </Select>
          </>
        );
      })}
    </div>
  );
};

const ColorSchemeChooser = () => {
  const { settings } = useGetSettings();
  const selectedColorScheme = settings?.selectedColorScheme ?? availableColorSchemas[0];
  const isEnabled = settings?.useCustomColorScheme ?? false;
  if (!isEnabled) {
    return null;
  }
  /**
   * use Select from antd
   */
  return (
    <div>
      <p>Select color scheme:</p>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Select
          data-testid="color-scheme-chooser"
          value={selectedColorScheme}
          onChange={setSelectedColorScheme}
          style={{ minWidth: 140 }} // Set min width to accommodate "yellowGreen"
          options={availableColorSchemas.map(schema => ({
            value: schema,
            label: <span data-testid="color-scheme-chooser-option">{schema}</span>,
          }))}
        />
        <span>
          Example:
          <SubTasksProgressComponent
            progress={subTasksProgress.smallMixed}
            colorScheme={selectedColorScheme === 'jira' ? jiraColorScheme : yellowGreenColorScheme}
          />
        </span>
      </div>
    </div>
  );
};

const useGetAvailableGroups = (groupingField: GroupFields) => {
  const { issues } = useGetAllSubtasks();

  const availableGroups = useMemo(() => {
    const uniqueGroups = new Set<string>();
    issues.forEach(issue => {
      const value = issue[groupingField];
      uniqueGroups.add(value);
    });
    return Array.from(uniqueGroups);
  }, [issues, groupingField]);
  return availableGroups;
};

const GroupingSettings = () => {
  const { settings } = useGetSettings();
  const availableGroups = useGetAvailableGroups(settings.groupingField);
  const ignoredGroups = settings.ignoredGroups || [];
  const groupsAvailableToIgnore = availableGroups.filter(group => !ignoredGroups.includes(group));

  return (
    <div>
      <div>
        <p>Select grouping field:</p>
        <Select
          style={{ minWidth: 140 }}
          value={settings?.groupingField || 'project'}
          onChange={setGroupingField}
          options={groupingFields.map(field => ({
            value: field,
            label: <span data-testid="grouping-field-option">{field}</span>,
          }))}
        />
      </div>
      {ignoredGroups ? (
        <div>
          <p>ignored groups</p>
          {ignoredGroups.map(group => (
            <Tag key={group} color="blue" closable closeIcon onClose={() => removeIgnoredGroup(group)}>
              {group}
            </Tag>
          ))}
        </div>
      ) : null}
      {groupsAvailableToIgnore.length > 0 ? (
        <div>
          <p>Add group to ignore:</p>
          <Select
            style={{ minWidth: 140 }}
            value="choose group to ignore"
            onChange={addIgnoredGroup}
            options={groupsAvailableToIgnore.map(group => ({
              value: group,
              label: <span data-testid="ignored-group-option">{group}</span>,
            }))}
          />
        </div>
      ) : null}
    </div>
  );
};

const CountSettings = () => {
  const { settings } = useGetSettings();
  return (
    <div>
      <p>Count settings</p>
      <Checkbox
        checked={settings.countSubtasksOfIssue}
        onChange={() => {
          changeCount('subtasks', !settings.countSubtasksOfIssue);
        }}
      >
        Count subtasks of issue
      </Checkbox>
      <Checkbox
        checked={settings.countIssuesInEpic}
        onChange={() => {
          changeCount('epics', !settings.countIssuesInEpic);
        }}
      >
        Count issues in epic
      </Checkbox>
      <Checkbox
        checked={settings.countLinkedIssues}
        onChange={() => {
          changeCount('linkedIssues', !settings.countLinkedIssues);
        }}
      >
        Count linked issues
      </Checkbox>
    </div>
  );
};

export const BoardSettingsTabContent = () => {
  return (
    <div>
      Sub-tasks progress
      <button type="button" onClick={resetBoardProperty}>
        Reset
      </button>
      <CountSettings />
      <ColorSchemeChooser />
      <ColumnsSettingsContainer />
      <GroupingSettings />
      <SubTasksSettings />
    </div>
  );
};

import Checkbox from 'antd/es/checkbox';
import Spin from 'antd/es/spin';
import React, { useMemo, useState } from 'react';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useShallow } from 'zustand/react/shallow';
import Select from 'antd/es/select';

import { Tooltip } from 'antd';

import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks/jiraSubtasks';

import { useDi } from 'src/shared/diContext';

import { moveBoardStatusToProgressStatus } from 'src/sub-tasks-progress/actions/moveBoardStatusToProgressStatus';
import { InfoCircleFilled } from '@ant-design/icons';
import { changeCount } from 'src/sub-tasks-progress/actions/changeCount';
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

  const statusProjectMap: Record<string, string[] | undefined> = {};
  issues.forEach(issue => {
    const project = issue.fields.project.key;
    const status = issue.fields.status.name;
    if (!statusProjectMap[status]) {
      statusProjectMap[status] = [];
    }
    if (!statusProjectMap[status].includes(project)) {
      statusProjectMap[status].push(project);
    }
  });
  const statuses = Object.keys(statusProjectMap);
  const statusMapping = settings?.statusMapping ?? {};
  const actualStatusMapping: Record<string, Status> = {
    ...statusMapping,
  };

  statuses.forEach(status => {
    actualStatusMapping[status] = statusMapping[status] ?? 'unmapped';
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: 10, width: 'max-content' }}>
      {Object.keys(statusMapping).map(status => {
        return (
          <>
            <span> {status}</span>
            {statusProjectMap[status] && statusProjectMap[status]?.length > 0 ? (
              <Tooltip title={`projects: ${statusProjectMap[status].join(', ')}`}>
                <span>
                  <InfoCircleFilled style={{ color: '#1677ff' }} />
                </span>
              </Tooltip>
            ) : (
              <span />
            )}
            <Select
              style={{ minWidth: 140 }}
              value={statusMapping[status]}
              onChange={value => {
                moveBoardStatusToProgressStatus(status, value);
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

const GroupingSettings = () => {
  const { settings } = useGetSettings();

  return (
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
      <CountSettings />
      <ColorSchemeChooser />
      <ColumnsSettingsContainer />
      <GroupingSettings />
      <SubTasksSettings />
    </div>
  );
};

import Checkbox from 'antd/es/checkbox';
import Spin from 'antd/es/spin';
import React, { useMemo, useState } from 'react';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useShallow } from 'zustand/react/shallow';
import Select from 'antd/es/select';

import { Card, Divider, Tag, Tooltip } from 'antd';

import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks/jiraSubtasks';

import { useDi } from 'src/shared/diContext';

import { newMoveBoardStatusToProgressStatus } from 'src/sub-tasks-progress/actions/moveBoardStatusToProgressStatus';
import { InfoCircleFilled } from '@ant-design/icons';
import { changeCount } from 'src/sub-tasks-progress/actions/changeCount';
import { resetBoardProperty } from 'src/sub-tasks-progress/actions/resetBoardProperty';
import { removeIgnoredGroup } from 'src/sub-tasks-progress/actions/removeIgnoredGroup';
import { addIgnoredGroup } from 'src/sub-tasks-progress/actions/addIgnoredGroup';
import { changeUseCustomColorScheme } from 'src/sub-tasks-progress/actions/changeUseCustomColorScheme';
import { toggleIgnoreStatus } from 'src/sub-tasks-progress/actions/toggleIgnoreStatus';
import { availableColorSchemas, availableStatuses, jiraColorScheme, yellowGreenColorScheme } from '../../colorSchemas';
import { SubTasksProgressComponent } from '../SubTasksProgress/SubTasksProgressComponent';
import { subTasksProgress } from '../SubTasksProgress/testData';
import { GroupFields } from '../../types';
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
    <Card title="Columns Settings" style={{ marginBottom: '16px' }} type="inner">
      <p style={{ marginBottom: '16px' }}>Select columns where sub-tasks progress should be tracked:</p>
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
    </Card>
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

const useGetSubtasksForStatusSettings = () => {
  const { issues } = useGetAllSubtasks();

  const statuses: Record<
    number,
    { projects: string[]; name: string; statusCategory: 'new' | 'indeterminate' | 'done' }
  > = {};
  issues.forEach(issue => {
    const project = issue.fields.project.key;
    const statusName = issue.fields.status.name;
    const { statusId } = issue;

    if (!statuses[statusId]) {
      statuses[statusId] = {
        projects: [],
        name: statusName,
        statusCategory: issue.statusCategory,
      };
    }

    if (!statuses[statusId].projects.includes(project)) {
      statuses[statusId].projects.push(project);
    }
  });

  return { statuses };
};

const SubTasksSettings = () => {
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

const StatusCategorySettings = () => {
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

const ColorSchemeChooser = () => {
  const { settings } = useGetSettings();
  const selectedColorScheme = settings?.selectedColorScheme ?? availableColorSchemas[0];

  return (
    <Card title="Color Scheme" style={{ marginBottom: '16px' }} type="inner">
      <div style={{ marginBottom: '16px' }}>
        <Checkbox
          checked={settings.useCustomColorScheme}
          onChange={() => {
            changeUseCustomColorScheme(!settings.useCustomColorScheme);
          }}
        >
          Use custom color scheme
        </Checkbox>
      </div>
      <StatusCategorySettings />
      {settings.useCustomColorScheme ? (
        <>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ marginBottom: '8px' }}>Select color scheme:</p>
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
              <span style={{ minWidth: 200 }}>
                Example:
                <SubTasksProgressComponent
                  progress={subTasksProgress.smallMixed}
                  colorScheme={selectedColorScheme === 'jira' ? jiraColorScheme : yellowGreenColorScheme}
                />
              </span>
            </div>
          </div>

          <SubTasksSettings />
        </>
      ) : null}
    </Card>
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
    <Card title="Grouping Settings" style={{ marginBottom: '16px' }} type="inner">
      <div style={{ marginBottom: '24px' }}>
        <p style={{ marginBottom: '16px' }}>Select grouping field:</p>
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
      {ignoredGroups.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ marginBottom: '16px' }}>ignored groups</p>
          {ignoredGroups.map(group => (
            <Tag key={group} color="blue" closable closeIcon onClose={() => removeIgnoredGroup(group)}>
              {group}
            </Tag>
          ))}
        </div>
      ) : null}
      {groupsAvailableToIgnore.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ marginBottom: '16px' }}>Add group to ignore:</p>
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
    </Card>
  );
};

const CountSettings = () => {
  const { settings } = useGetSettings();
  return (
    <Card title="Count Settings" style={{ marginBottom: '16px' }} type="inner">
      <div style={{ marginBottom: '16px' }}>
        <div> Epic</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countEpicIssues}
            onChange={() => {
              changeCount('countEpicIssues', !settings.countEpicIssues);
            }}
          >
            Count issues of epic
          </Checkbox>
          <Checkbox
            checked={settings.countEpicLinkedIssues}
            onChange={() => {
              changeCount('countEpicLinkedIssues', !settings.countEpicLinkedIssues);
            }}
          >
            Count linked issues of epic
          </Checkbox>
          <Checkbox
            checked={settings.countEpicExternalLinks}
            onChange={() => {
              changeCount('countEpicExternalLinks', !settings.countEpicExternalLinks);
            }}
          >
            Count external links of epic
          </Checkbox>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div> Issues</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countIssuesSubtasks}
            onChange={() => {
              changeCount('countIssuesSubtasks', !settings.countIssuesSubtasks);
            }}
          >
            Count sub-tasks
          </Checkbox>
          <Checkbox
            checked={settings.countIssuesLinkedIssues}
            onChange={() => {
              changeCount('countIssuesLinkedIssues', !settings.countIssuesLinkedIssues);
            }}
          >
            Count linked issues
          </Checkbox>
          <Checkbox
            checked={settings.countIssuesExternalLinks}
            onChange={() => {
              changeCount('countIssuesExternalLinks', !settings.countIssuesExternalLinks);
            }}
          >
            Count external links
          </Checkbox>
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <div> SubTasks</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countSubtasksLinkedIssues}
            onChange={() => {
              changeCount('countSubtasksLinkedIssues', !settings.countSubtasksLinkedIssues);
            }}
          >
            Count linked issues
          </Checkbox>
          <Checkbox
            checked={settings.countSubtasksExternalLinks}
            onChange={() => {
              changeCount('countSubtasksExternalLinks', !settings.countSubtasksExternalLinks);
            }}
          >
            Count external links
          </Checkbox>
        </div>
      </div>
    </Card>
  );
};

export const BoardSettingsTabContent = () => {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>Sub-tasks progress</h2>
      <button type="button" onClick={resetBoardProperty}>
        Reset
      </button>

      <Divider />

      <ColumnsSettingsContainer />
      <GroupingSettings />
      <CountSettings />

      <ColorSchemeChooser />
    </div>
  );
};

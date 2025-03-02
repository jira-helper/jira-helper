import React, { useMemo } from 'react';
import { Card, Select, Tag } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks/jiraSubtasks';
import { useGetSettings } from 'src/sub-tasks-progress/SubTaskProgressSettings/hooks/useGetSettings';
import { GroupFields } from '../../types';
import { setGroupingField } from './actions/setGroupingField';
import { removeIgnoredGroup } from './actions/removeIgnoredGroup';
import { addIgnoredGroup } from './actions/addIgnoredGroup';

const groupingFields: GroupFields[] = ['project', 'assignee', 'reporter', 'priority', 'creator', 'issueType'];

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

export const GroupingSettings = () => {
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

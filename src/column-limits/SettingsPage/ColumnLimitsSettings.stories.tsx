import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColumnLimitsForm } from './ColumnLimitsForm';

const meta: Meta = {
  title: 'ColumnLimits/ColumnLimitsSettings',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

interface ColumnLimitsSettingsDemoProps {
  groups: Array<{
    id: string;
    name: string;
    columns: string[];
    max?: number;
    customHexColor?: string;
    includedIssueTypes?: string[];
  }>;
  availableColumns: Array<{ id: string; name: string }>;
}

const ColumnLimitsSettingsDemo: React.FC<ColumnLimitsSettingsDemoProps> = ({ groups, availableColumns }) => {
  const [wipLimits, setWipLimits] = useState<Record<string, any>>(() => {
    const limits: Record<string, any> = {};
    groups.forEach(group => {
      if (group.id !== 'Without Group') {
        limits[group.id] = {
          columns: group.columns,
          max: group.max,
          customHexColor: group.customHexColor,
          includedIssueTypes: group.includedIssueTypes,
        };
      }
    });
    return limits;
  });

  const [issueTypeSelectorStates, setIssueTypeSelectorStates] = useState<
    Record<
      string,
      {
        countAllTypes: boolean;
        projectKey: string;
        selectedTypes: string[];
      }
    >
  >(() => {
    const states: Record<string, { countAllTypes: boolean; projectKey: string; selectedTypes: string[] }> = {};
    groups.forEach(group => {
      if (group.id !== 'Without Group') {
        states[group.id] = {
          countAllTypes: !group.includedIssueTypes || group.includedIssueTypes.length === 0,
          projectKey: '',
          selectedTypes: group.includedIssueTypes || [],
        };
      }
    });
    return states;
  });

  // Memoize callbacks to prevent infinite loops
  const handleLimitChange = React.useCallback((groupId: string, limit: number) => {
    setWipLimits(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        max: limit,
      },
    }));
  }, []);

  const handleColorChange = React.useCallback((groupId: string, color: string) => {
    setWipLimits(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        customHexColor: color,
      },
    }));
  }, []);

  const handleIssueTypesChange = React.useCallback(
    (groupId: string, selectedTypes: string[], countAllTypes: boolean) => {
      setIssueTypeSelectorStates(prev => ({
        ...prev,
        [groupId]: {
          countAllTypes,
          projectKey: prev[groupId]?.projectKey || '',
          selectedTypes,
        },
      }));
      setWipLimits(prev => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          includedIssueTypes: countAllTypes ? undefined : selectedTypes,
        },
      }));
    },
    []
  );

  const withoutGroupId = 'Without Group';
  const withoutGroup = groups.find(g => g.id === withoutGroupId);
  const withoutGroupColumns = (withoutGroup?.columns || [])
    .map(colId => {
      const col = availableColumns.find(c => c.id === colId);
      return col ? { id: col.id, name: col.name } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string }>;

  const groupsData = groups
    .filter(g => g.id !== withoutGroupId)
    .map(group => {
      const wipLimit = wipLimits[group.id] || {};
      return {
        id: group.id,
        columns: group.columns
          .map(colId => {
            const col = availableColumns.find(c => c.id === colId);
            return col ? { id: col.id, name: col.name } : null;
          })
          .filter(Boolean) as Array<{ id: string; name: string }>,
        max: wipLimit.max || group.max,
        customHexColor: wipLimit.customHexColor || group.customHexColor,
        includedIssueTypes: wipLimit.includedIssueTypes || group.includedIssueTypes,
      };
    });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <h2 style={{ marginBottom: '20px' }}>Column Limits Settings</h2>
      <ColumnLimitsForm
        withoutGroupColumns={withoutGroupColumns}
        groups={groupsData}
        onLimitChange={handleLimitChange}
        onColorChange={handleColorChange}
        onIssueTypesChange={handleIssueTypesChange}
        onColumnDragStart={() => {}}
        onColumnDragEnd={() => {}}
        onDrop={e => {
          e.preventDefault();
        }}
        onDragOver={e => {
          e.preventDefault();
        }}
        onDragLeave={() => {
          // Handle drag leave
        }}
        issueTypeSelectorStates={issueTypeSelectorStates}
        formId="jh-wip-limits-form"
        allGroupsId="jh-all-groups"
        createGroupDropzoneId="jh-column-dropzone"
      />
    </div>
  );
};

const mockColumns = [
  { id: 'col1', name: 'To Do' },
  { id: 'col2', name: 'In Progress' },
  { id: 'col3', name: 'Code Review' },
  { id: 'col4', name: 'Testing' },
  { id: 'col5', name: 'Done' },
];

export const EmptyState: StoryObj = {
  render: () => (
    <ColumnLimitsSettingsDemo
      groups={[{ id: 'Without Group', name: 'Without Group', columns: ['col1', 'col2', 'col3'] }]}
      availableColumns={mockColumns}
    />
  ),
};

export const SingleGroup: StoryObj = {
  render: () => (
    <ColumnLimitsSettingsDemo
      groups={[
        { id: 'Without Group', name: 'Without Group', columns: ['col1'] },
        {
          id: 'group1',
          name: 'Development Flow',
          columns: ['col2', 'col3'],
          max: 5,
          customHexColor: '#70cde0',
        },
      ]}
      availableColumns={mockColumns}
    />
  ),
};

export const MultipleGroups: StoryObj = {
  render: () => (
    <ColumnLimitsSettingsDemo
      groups={[
        { id: 'Without Group', name: 'Without Group', columns: ['col1'] },
        {
          id: 'group1',
          name: 'Development Flow',
          columns: ['col2', 'col3'],
          max: 5,
          customHexColor: '#70cde0',
        },
        {
          id: 'group2',
          name: 'Testing Flow',
          columns: ['col4'],
          max: 3,
          customHexColor: '#d3d1ff',
        },
      ]}
      availableColumns={mockColumns}
    />
  ),
};

export const WithIssueTypeFilter: StoryObj = {
  render: () => (
    <ColumnLimitsSettingsDemo
      groups={[
        { id: 'Without Group', name: 'Without Group', columns: ['col1'] },
        {
          id: 'group1',
          name: 'Development Flow',
          columns: ['col2', 'col3'],
          max: 5,
          customHexColor: '#70cde0',
          includedIssueTypes: ['Task', 'Bug'],
        },
        {
          id: 'group2',
          name: 'Testing Flow',
          columns: ['col4'],
          max: 3,
          customHexColor: '#d3d1ff',
          includedIssueTypes: ['Bug', 'Story'],
        },
      ]}
      availableColumns={mockColumns}
    />
  ),
};

export const ComplexConfiguration: StoryObj = {
  render: () => (
    <ColumnLimitsSettingsDemo
      groups={[
        { id: 'Without Group', name: 'Without Group', columns: ['col1', 'col5'] },
        {
          id: 'group1',
          name: 'Development Flow',
          columns: ['col2', 'col3', 'col4'],
          max: 8,
          customHexColor: '#70cde0',
          includedIssueTypes: ['Task', 'Bug'],
        },
        {
          id: 'group2',
          name: 'Testing Flow',
          columns: ['col4'],
          max: 3,
          customHexColor: '#d3d1ff',
        },
        {
          id: 'group3',
          name: 'Review Flow',
          columns: ['col3'],
          max: 2,
          customHexColor: '#f9aa9b',
          includedIssueTypes: ['Task', 'Story', 'Feature Request'],
        },
      ]}
      availableColumns={mockColumns}
    />
  ),
};

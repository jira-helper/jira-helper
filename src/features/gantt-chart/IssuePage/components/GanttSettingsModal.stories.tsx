import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { useJiraFieldsStore } from 'src/infrastructure/jira/fields/jiraFieldsStore';
import { useJiraIssueLinkTypesStore } from 'src/infrastructure/jira/stores/jiraIssueLinkTypesStore';
import type { JiraField, JiraIssueLinkType, JiraStatus } from 'src/infrastructure/jira/types';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';
import type { GanttScopeSettings, SettingsScope } from '../../types';
import { GanttSettingsModal } from './GanttSettingsModal';

const noop = () => {};

const storyFields: JiraField[] = [
  {
    id: 'customfield_10015',
    name: 'Start date',
    custom: true,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['cf[10015]'],
    schema: { type: 'date' },
  },
  {
    id: 'duedate',
    name: 'Due date',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['duedate'],
    schema: { type: 'date' },
  },
  {
    id: 'assignee',
    name: 'Assignee',
    custom: false,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['assignee'],
    schema: { type: 'user' },
  },
  {
    id: 'status',
    name: 'Status',
    custom: false,
    orderable: false,
    navigable: true,
    searchable: true,
    clauseNames: ['status'],
    schema: { type: 'status' },
  },
  {
    id: 'priority',
    name: 'Priority',
    custom: false,
    orderable: false,
    navigable: true,
    searchable: true,
    clauseNames: ['priority'],
    schema: { type: 'priority' },
  },
  {
    id: 'issuetype',
    name: 'Issue Type',
    custom: false,
    orderable: false,
    navigable: true,
    searchable: true,
    clauseNames: ['issuetype'],
    schema: { type: 'issuetype' },
  },
  {
    id: 'customfield_178101',
    name: 'Team',
    custom: true,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['cf[178101]'],
    schema: { type: 'string' },
  },
];

const storyStatuses: JiraStatus[] = [
  { id: '1', name: 'To Do', statusCategory: { id: 2, key: 'new', colorName: 'blue-gray', name: 'To Do' } },
  {
    id: '2',
    name: 'In Progress',
    statusCategory: { id: 4, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
  },
  { id: '3', name: 'Done', statusCategory: { id: 3, key: 'done', colorName: 'green', name: 'Done' } },
];

const storyLinkTypes: JiraIssueLinkType[] = [
  { id: 'Blocks', name: 'Blocks', inward: 'is blocked by', outward: 'blocks', self: '' },
  { id: 'Relates', name: 'Relates', inward: 'relates to', outward: 'relates to', self: '' },
];

function seedStoryJiraMetadata() {
  useJiraFieldsStore.setState({ fields: storyFields, isLoading: false, error: null });
  useJiraStatusesStore.setState({ statuses: storyStatuses, isLoading: false, error: null });
  useJiraIssueLinkTypesStore.setState({ linkTypes: storyLinkTypes, isLoading: false, error: null });
}

const projectIssueScope: SettingsScope = {
  level: 'projectIssueType',
  projectKey: 'DEMO',
  issueType: 'Story',
};

const draftDefault: GanttScopeSettings = {
  startMappings: [{ source: 'dateField', fieldId: 'customfield_10015' }],
  endMappings: [{ source: 'dateField', fieldId: 'duedate' }],
  colorRules: [],
  tooltipFieldIds: ['assignee', 'status', 'priority'],
  exclusionFilters: [{ mode: 'field', fieldId: 'issuetype', value: 'Bug' }],
  hideCompletedTasks: false,
  includeSubtasks: true,
  includeEpicChildren: true,
  includeIssueLinks: false,
  issueLinkTypesToInclude: [],
};

const draftWithLinkTypes: GanttScopeSettings = {
  ...draftDefault,
  exclusionFilters: [],
  hideCompletedTasks: false,
  includeIssueLinks: true,
  issueLinkTypesToInclude: [
    { id: 'Blocks', direction: 'outward' },
    { id: 'Relates', direction: 'inward' },
  ],
};

const draftWithStatusProgressMapping: GanttScopeSettings = {
  ...draftDefault,
  statusProgressMapping: {
    '1': { statusId: '1', statusName: 'To Do', bucket: 'todo' },
    '2': { statusId: '2', statusName: 'In Progress', bucket: 'inProgress' },
    '3': { statusId: '3', statusName: 'Done', bucket: 'done' },
  },
};

const draftWithMissingStatusProgressMapping: GanttScopeSettings = {
  ...draftDefault,
  statusProgressMapping: {
    '99': { statusId: '99', statusName: 'QA Review', bucket: 'inProgress' },
  },
};

/**
 * Pre-fills the Quick filters list with one valid JQL preset and one preset whose JQL is intentionally
 * malformed. Use this story to visually verify that the quick-filter row stays aligned even when the
 * AntD validator renders an error message under the JQL input (regression: action buttons used to jump
 * to a new line because they were positioned with a hard-coded `marginTop`).
 */
const draftWithQuickFiltersAndJqlError: GanttScopeSettings = {
  ...draftDefault,
  exclusionFilters: [
    { mode: 'jql', jql: '((( totally broken' },
    { mode: 'field', fieldId: 'issuetype', value: 'Bug' },
  ],
  quickFilters: [
    {
      id: 'qf-valid',
      name: 'My TRPA',
      selector: { mode: 'jql', jql: 'project = TRPA AND priority = High' },
    },
    {
      id: 'qf-broken',
      name: 'Broken JQL',
      selector: { mode: 'jql', jql: '((( broken paren' },
    },
    {
      id: 'qf-field',
      name: 'Backend',
      selector: { mode: 'field', fieldId: 'customfield_178101', value: 'Backend' },
    },
  ],
};

const meta: Meta<typeof GanttSettingsModal> = {
  title: 'GanttChart/IssuePage/GanttSettingsModal',
  component: GanttSettingsModal,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    visible: true,
    currentScope: projectIssueScope,
    onDraftChange: noop,
    onSave: noop,
    onCancel: noop,
    onScopeLevelChange: noop,
    onCopyFrom: noop,
  },
  decorators: [
    Story => {
      seedStoryJiraMetadata();
      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof GanttSettingsModal>;

export const Default: Story = {
  args: {
    draft: draftDefault,
  },
};

export const NoDraft: Story = {
  args: {
    draft: null,
  },
};

export const WithLinkTypes: Story = {
  args: {
    draft: draftWithLinkTypes,
  },
};

export const EmptyStatusProgressMapping: Story = {
  args: {
    draft: draftDefault,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the production placement of the Status progress mapping section on the Bars tab after Start/End of bar and before tooltip fields, with no saved mapping rows.',
      },
    },
  },
};

export const WithStatusProgressMapping: Story = {
  args: {
    draft: draftWithStatusProgressMapping,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows saved Jira status id mappings using labels from the Jira statuses store and the three allowed progress buckets.',
      },
    },
  },
};

export const MissingStatusProgressMappingFallback: Story = {
  args: {
    draft: draftWithMissingStatusProgressMapping,
  },
  render: args => {
    useJiraStatusesStore.setState({
      statuses: storyStatuses.filter(status => status.id !== '99'),
      isLoading: false,
      error: null,
    });
    return <GanttSettingsModal {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the saved fallback status name when a persisted Jira status id is not present in the current statuses response.',
      },
    },
  },
};

export const WithJqlValidationError: Story = {
  args: {
    draft: draftWithQuickFiltersAndJqlError,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Verifies layout stability of the Quick filters and Exclusion filters lists when an invalid ' +
          'JQL preset triggers the validator error message. The action buttons (move/delete) must stay ' +
          'aligned with the input baseline regardless of error message height.',
      },
    },
  },
};

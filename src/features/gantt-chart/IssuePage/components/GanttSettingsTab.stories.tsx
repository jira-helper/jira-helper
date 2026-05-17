import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { globalContainer } from 'dioma';
import { Ok } from 'ts-results';
import { WithDi } from 'src/infrastructure/di/diContext';
import { useJiraFieldsStore } from 'src/infrastructure/jira/fields/jiraFieldsStore';
import { useJiraIssueLinkTypesStore } from 'src/infrastructure/jira/stores/jiraIssueLinkTypesStore';
import type { JiraField, JiraIssueLinkType, JiraIssueMapped, JiraStatus } from 'src/infrastructure/jira/types';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';
import { JiraServiceToken, type IJiraService } from 'src/infrastructure/jira/jiraService';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { ganttChartModule } from '../../module';
import { ganttSettingsModelToken } from '../../tokens';
import type { GanttScopeSettings, SettingsScope } from '../../types';
import { buildScopeKey } from '../../utils/resolveSettings';
import { applyInitialGanttScopeForIssueView } from '../../utils/applyInitialGanttScopeForIssueView';
import { GANTT_SETTINGS_STORAGE_KEY } from '../../models/GanttSettingsModel';
import { GanttSettingsTab } from './GanttSettingsTab';

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

function seedStoryJiraMetadata(): void {
  useJiraFieldsStore.setState({ fields: storyFields, isLoading: false, error: null });
  useJiraStatusesStore.setState({ statuses: storyStatuses, isLoading: false, error: null });
  useJiraIssueLinkTypesStore.setState({ linkTypes: storyLinkTypes, isLoading: false, error: null });
}

const projectIssueScope: SettingsScope = {
  level: 'projectIssueType',
  projectKey: 'DEMO',
  issueType: 'Story',
};

const scopeKey = buildScopeKey(projectIssueScope.projectKey, projectIssueScope.issueType);

const draftForStory: GanttScopeSettings = {
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

const mockJiraService: IJiraService = {
  fetchJiraIssue: async () => Ok({} as JiraIssueMapped),
  fetchSubtasks: async () => Ok({ subtasks: [], externalLinks: [] }),
  getExternalIssues: async () => Ok([]),
  getProjectFields: async () => Ok([]),
  getIssueLinkTypes: async () => Ok([]),
  getStatuses: async () => Ok([]),
  addWatcher: async () => Ok(undefined),
};

function ensureStoryJiraService(): void {
  try {
    globalContainer.inject(JiraServiceToken);
  } catch {
    globalContainer.register({ token: JiraServiceToken, value: mockJiraService });
  }
}

function setupGanttSettingsTabStory(ganttEnabled: boolean): void {
  registerTestDependencies(globalContainer);
  ensureStoryJiraService();
  ganttChartModule.ensure(globalContainer);

  localStorage.setItem(
    GANTT_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      storage: { [scopeKey]: draftForStory },
      statusBreakdownEnabled: false,
      preferredScopeLevel: 'projectIssueType',
    })
  );

  seedStoryJiraMetadata();

  const { model } = globalContainer.inject(ganttSettingsModelToken);
  model.reset();
  model.load();
  model.setFeatureEnabled(ganttEnabled);
  model.contextProjectKey = projectIssueScope.projectKey ?? '';
  model.contextIssueType = projectIssueScope.issueType ?? '';
  applyInitialGanttScopeForIssueView(model);
}

function GanttSettingsTabStoryShell({ ganttEnabled }: { ganttEnabled: boolean }) {
  React.useMemo(() => {
    setupGanttSettingsTabStory(ganttEnabled);
    return true;
  }, [ganttEnabled]);
  return (
    <WithDi container={globalContainer}>
      <GanttSettingsTab />
    </WithDi>
  );
}

const meta: Meta<typeof GanttSettingsTabStoryShell> = {
  title: 'GanttChart/IssuePage/GanttSettingsTab',
  component: GanttSettingsTabStoryShell,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GanttSettingsTabStoryShell>;

export const LocalToggleEnabled: Story = {
  args: { ganttEnabled: true },
};

export const LocalToggleDisabled: Story = {
  args: { ganttEnabled: false },
};

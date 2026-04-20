import type { Meta, StoryObj } from '@storybook/react-vite';
import type { GanttScopeSettings, SettingsScope } from '../../types';
import { GanttSettingsModal } from './GanttSettingsModal';

const noop = () => {};

const projectIssueScope: SettingsScope = {
  level: 'projectIssueType',
  projectKey: 'DEMO',
  issueType: 'Story',
};

const draftDefault: GanttScopeSettings = {
  startMapping: { source: 'dateField', fieldId: 'customfield_10015' },
  endMapping: { source: 'dateField', fieldId: 'duedate' },
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

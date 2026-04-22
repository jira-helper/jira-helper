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

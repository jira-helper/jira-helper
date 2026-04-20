import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/shared/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { useJiraFieldsStore } from 'src/shared/jira/fields/jiraFieldsStore';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';
import { useJiraIssueLinkTypesStore } from 'src/shared/jira/stores/jiraIssueLinkTypesStore';
import type { JiraField, JiraIssueLinkType, JiraStatus } from 'src/shared/jira/types';
import type { GanttScopeSettings, SettingsScope } from '../../types';
import { GanttSettingsModal } from './GanttSettingsModal';

const mockJiraFields: JiraField[] = [
  {
    id: 'created',
    name: 'Created',
    custom: false,
    orderable: false,
    navigable: true,
    searchable: true,
    clauseNames: ['created'],
    schema: { type: 'datetime' },
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
    id: 'summary',
    name: 'Summary',
    custom: false,
    orderable: false,
    navigable: true,
    searchable: true,
    clauseNames: ['summary'],
    schema: { type: 'string' },
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
    id: 'customfield_10001',
    name: 'Custom',
    custom: true,
    orderable: true,
    navigable: true,
    searchable: true,
    clauseNames: ['cf[10001]'],
    schema: { type: 'string' },
  },
];

const mockStatuses: JiraStatus[] = [
  {
    id: '1',
    name: 'Open',
    statusCategory: { id: 1, key: 'new', colorName: 'blue-gray', name: 'To Do' },
  },
];

const mockLinkTypes: JiraIssueLinkType[] = [
  {
    id: '10000',
    name: 'Blocks',
    inward: 'is blocked by',
    outward: 'blocks',
    self: 'http://localhost',
  },
];

const baseDraft: GanttScopeSettings = {
  startMapping: { source: 'dateField', fieldId: 'created' },
  endMapping: { source: 'dateField', fieldId: 'duedate' },
  colorRules: [],
  tooltipFieldIds: ['summary', 'status'],
  exclusionFilters: [{ mode: 'field', fieldId: 'issuetype', value: 'Bug' }],
  hideCompletedTasks: false,
  includeSubtasks: true,
  includeEpicChildren: false,
  includeIssueLinks: false,
  issueLinkTypesToInclude: [],
};

const projectIssueScope: SettingsScope = {
  level: 'projectIssueType',
  projectKey: 'PROJ',
  issueType: 'Story',
};

const defaultCallbacks = {
  onDraftChange: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
  onScopeLevelChange: vi.fn(),
  onCopyFrom: vi.fn(),
};

function seedJiraMetadataStores() {
  useJiraFieldsStore.setState({ fields: mockJiraFields, isLoading: false, error: null });
  useJiraStatusesStore.setState({ statuses: mockStatuses, isLoading: false, error: null });
  useJiraIssueLinkTypesStore.setState({ linkTypes: mockLinkTypes, isLoading: false, error: null });
}

function openAntSelect(testId: string) {
  const root = screen.getByTestId(testId);
  const selector = root.querySelector('.ant-select-selector');
  expect(selector).toBeTruthy();
  fireEvent.mouseDown(selector!);
}

function renderModal(overrides: Partial<React.ComponentProps<typeof GanttSettingsModal>> = {}) {
  const props = {
    visible: true,
    draft: baseDraft,
    currentScope: projectIssueScope,
    ...defaultCallbacks,
    ...overrides,
  };
  render(
    <WithDi container={globalContainer}>
      <GanttSettingsModal {...props} />
    </WithDi>
  );
  return props;
}

describe('GanttSettingsModal', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
    seedJiraMetadataStores();
    vi.clearAllMocks();
  });

  it('does not show dialog when not visible', () => {
    renderModal({ visible: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders draft values in the form', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Bar colors')).toBeInTheDocument();
    expect(within(dialog).getByText('Summary (summary)')).toBeInTheDocument();
    expect(within(dialog).getByText('Status (status)')).toBeInTheDocument();
    expect(within(dialog).getByText('Created (created)')).toBeInTheDocument();
    expect(within(dialog).getByText('Due date (duedate)')).toBeInTheDocument();
  });

  it('calls onSave when Save is clicked', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCopyFrom when Copy from is clicked', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: 'Copy from…' }));

    expect(props.onCopyFrom).toHaveBeenCalledTimes(1);
  });

  it('calls onDraftChange when a color rule is added', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: /add color rule/i }));

    await waitFor(() => {
      const lastCall = props.onDraftChange.mock.calls[props.onDraftChange.mock.calls.length - 1][0];
      expect(lastCall.colorRules).toHaveLength(1);
      expect(lastCall.colorRules?.[0]).toMatchObject({
        color: '#FF5630',
        selector: { mode: 'field' },
      });
    });
  });

  it('calls onScopeLevelChange when scope level changes', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('radio', { name: 'Global' }));

    expect(props.onScopeLevelChange).toHaveBeenCalledWith('global');
  });

  it('calls onDraftChange when tooltip fields change', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    openAntSelect('gantt-settings-tooltip-fields-select');
    await user.click(await screen.findByText('Priority (priority)', { selector: '.ant-select-item-option-content' }));

    await waitFor(() => {
      const lastCall = props.onDraftChange.mock.calls[props.onDraftChange.mock.calls.length - 1][0];
      expect(lastCall.tooltipFieldIds).toContain('priority');
    });
  });

  it('renders issue inclusion switches from draft', () => {
    renderModal();

    expect(screen.getByRole('switch', { name: 'Include subtasks' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Include epic children' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Include issue links' })).not.toBeChecked();
  });

  it('calls onDraftChange when Include epic children is toggled', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('switch', { name: 'Include epic children' }));

    expect(props.onDraftChange).toHaveBeenCalled();
    const lastCall = props.onDraftChange.mock.calls[props.onDraftChange.mock.calls.length - 1][0];
    expect(lastCall).toMatchObject({ includeEpicChildren: true });
  });

  it('calls onDraftChange when Include subtasks is toggled off', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('switch', { name: 'Include subtasks' }));

    expect(props.onDraftChange).toHaveBeenCalled();
    const lastCall = props.onDraftChange.mock.calls[props.onDraftChange.mock.calls.length - 1][0];
    expect(lastCall).toMatchObject({ includeSubtasks: false });
  });

  it('shows link type list when Include issue links is on', async () => {
    const user = userEvent.setup();
    renderModal();

    expect(screen.queryByRole('button', { name: /add link type/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'Include issue links' }));

    expect(screen.getByText(/Restrict by link type and direction/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add link type/i })).toBeInTheDocument();
  });

  it('calls onDraftChange with issueLinkTypesToInclude when row link type is selected', async () => {
    const user = userEvent.setup();
    const props = renderModal({ draft: { ...baseDraft, includeIssueLinks: true } });

    await user.click(screen.getByRole('button', { name: /add link type/i }));

    openAntSelect('gantt-settings-link-type-select-0');
    await user.click(
      await screen.findByText('Blocks (is blocked by / blocks)', {
        selector: '.ant-select-item-option-content',
      })
    );

    await waitFor(() => {
      const callsWithLinks = props.onDraftChange.mock.calls
        .map(c => c[0] as Partial<GanttScopeSettings>)
        .filter(c => (c.issueLinkTypesToInclude?.length ?? 0) > 0);
      expect(callsWithLinks[callsWithLinks.length - 1]?.issueLinkTypesToInclude).toEqual([
        { id: '10000', direction: 'outward' },
      ]);
    });
  });
});

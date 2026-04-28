import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { useJiraFieldsStore } from 'src/infrastructure/jira/fields/jiraFieldsStore';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';
import { useJiraIssueLinkTypesStore } from 'src/infrastructure/jira/stores/jiraIssueLinkTypesStore';
import type { JiraField, JiraIssueLinkType, JiraStatus } from 'src/infrastructure/jira/types';
import type { GanttScopeSettings, SettingsScope } from '../../types';
import { GanttSettingsModal } from './GanttSettingsModal';

vi.setConfig({ testTimeout: 15000 });

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
  {
    id: '2',
    name: 'In Progress',
    statusCategory: { id: 2, key: 'indeterminate', colorName: 'yellow', name: 'In Progress' },
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
  startMappings: [{ source: 'dateField', fieldId: 'created' }],
  endMappings: [{ source: 'dateField', fieldId: 'duedate' }],
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

async function findAntSelectOption(label: string) {
  return screen.findByText((_, element) => {
    return element?.classList.contains('ant-select-item-option-content') === true && element.textContent === label;
  });
}

/**
 * Activate one of the settings modal tabs (Bars / Issues / Filters).
 * The modal renders all tabs (forceRender) but inactive panels are display:none,
 * which hides them from accessibility queries — so tests must activate the tab
 * before querying for elements inside it.
 */
async function activateTab(name: RegExp) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('tab', { name }));
}

function renderModal(overrides: Partial<React.ComponentProps<typeof GanttSettingsModal>> = {}) {
  const props = {
    visible: true,
    draft: baseDraft,
    currentScope: projectIssueScope,
    ...defaultCallbacks,
    ...overrides,
  } as React.ComponentProps<typeof GanttSettingsModal> & typeof defaultCallbacks;
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

    await user.click(screen.getByRole('button', { name: /copy from/i }));

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

  it('persists color rule name from the bar colors section', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: /add color rule/i }));
    await user.type(screen.getByTestId('gantt-color-rule-name-0'), 'Critical work');

    await waitFor(() => {
      const lastCall = props.onDraftChange.mock.calls.at(-1)?.[0] as Partial<GanttScopeSettings> | undefined;
      expect(lastCall?.colorRules?.[0]).toMatchObject({
        name: 'Critical work',
        color: '#FF5630',
      });
    });
  });

  it('calls onScopeLevelChange when scope level changes', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    const globalOption = screen
      .getAllByRole('option')
      .find(o => o.getAttribute('title') === 'Global' || o.textContent === 'Global');
    expect(globalOption).toBeTruthy();
    await user.click(globalOption!);

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

  it('renders issue inclusion switches from draft', async () => {
    renderModal();
    await activateTab(/issues/i);

    expect(screen.getByRole('switch', { name: 'Include subtasks' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Include epic children' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Include issue links' })).not.toBeChecked();
  });

  it('calls onDraftChange when Include epic children is toggled', async () => {
    const user = userEvent.setup();
    const props = renderModal();
    await activateTab(/issues/i);

    await user.click(screen.getByRole('switch', { name: 'Include epic children' }));

    expect(props.onDraftChange).toHaveBeenCalled();
    const lastCall = props.onDraftChange.mock.calls[props.onDraftChange.mock.calls.length - 1][0];
    expect(lastCall).toMatchObject({ includeEpicChildren: true });
  });

  it('calls onDraftChange when Include subtasks is toggled off', async () => {
    const user = userEvent.setup();
    const props = renderModal();
    await activateTab(/issues/i);

    await user.click(screen.getByRole('switch', { name: 'Include subtasks' }));

    expect(props.onDraftChange).toHaveBeenCalled();
    const lastCall = props.onDraftChange.mock.calls[props.onDraftChange.mock.calls.length - 1][0];
    expect(lastCall).toMatchObject({ includeSubtasks: false });
  });

  it('shows link type list when Include issue links is on', async () => {
    renderModal({ draft: { ...baseDraft, includeIssueLinks: true } });
    await activateTab(/issues/i);

    expect(screen.getByText(/Restrict by link type and direction/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add link type/i })).toBeInTheDocument();
  });

  // A2: when the user changes a date-mapping `source` (e.g. dateField → statusTransition),
  // the dependent `detail` (fieldId/statusName) must be cleared so we do not save mismatched data.
  it('resets the detail value when start-mapping source changes from dateField to statusTransition', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    const startSection = screen.getByTestId('gantt-settings-start-mappings');
    const selectors = startSection.querySelectorAll('.ant-select-selector');
    expect(selectors.length).toBeGreaterThan(0);
    fireEvent.mouseDown(selectors[0]);

    const option = await screen.findByText('Status transition', { selector: '.ant-select-item-option-content' });
    await user.click(option);

    await waitFor(() => {
      const payloads = props.onDraftChange.mock.calls.map(c => c[0] as Partial<GanttScopeSettings>);
      const last = payloads[payloads.length - 1];
      expect(last?.startMappings?.[0]).toMatchObject({ source: 'statusTransition' });
      // The previous `created` field id must NOT carry over as a status name.
      expect(last?.startMappings?.[0]?.statusName ?? '').toBe('');
      expect(last?.startMappings?.[0]?.fieldId ?? '').toBe('');
    });
  });

  it('saves statusTransition mapping with status id and fallback status name', async () => {
    const user = userEvent.setup();
    const props = renderModal({
      draft: {
        ...baseDraft,
        startMappings: [{ source: 'statusTransition', statusId: '1', statusName: 'Open' }],
      },
    });

    const startSection = screen.getByTestId('gantt-settings-start-mappings');
    const valueSelects = startSection.querySelectorAll(
      '[data-testid="gantt-settings-mapping-value"] .ant-select-selector'
    );
    expect(valueSelects.length).toBeGreaterThan(0);
    fireEvent.mouseDown(valueSelects[0]);
    await user.click(await screen.findByText('In Progress', { selector: '.ant-select-item-option-content' }));

    await waitFor(() => {
      const last = props.onDraftChange.mock.calls.at(-1)?.[0] as Partial<GanttScopeSettings> | undefined;
      expect(last?.startMappings?.[0]).toEqual({
        source: 'statusTransition',
        statusId: '2',
        statusName: 'In Progress',
      });
    });
  });

  it('renders legacy statusTransition name as fallback without saving it as status id', async () => {
    const user = userEvent.setup();
    const props = renderModal({
      draft: {
        ...baseDraft,
        startMappings: [{ source: 'statusTransition', statusName: 'Legacy Done' }],
      },
    });

    const startSection = screen.getByTestId('gantt-settings-start-mappings');
    expect(within(startSection).getByText('Legacy Done')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(props.onSave).toHaveBeenCalledTimes(1);
    expect(props.onDraftChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        startMappings: [expect.objectContaining({ statusId: 'Legacy Done' })],
      })
    );
  });

  it('renders status progress mapping after start/end mappings and before tooltip fields', () => {
    renderModal();

    const start = screen.getByText('Start of bar');
    const end = screen.getByText('End of bar');
    const mapping = screen.getByText('Status progress mapping');
    const tooltip = screen.getByText('Bar tooltip fields');

    expect(start.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(end.compareDocumentPosition(mapping) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(mapping.compareDocumentPosition(tooltip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('patches draft statusProgressMapping when a status mapping row changes', async () => {
    const user = userEvent.setup();
    const props = renderModal({
      draft: {
        ...baseDraft,
        statusProgressMapping: {
          '1': { statusId: '1', statusName: 'Open', bucket: 'todo' },
        },
      },
    });

    openAntSelect('status-progress-mapping-status-0');
    await user.click(await screen.findByText('In Progress', { selector: '.ant-select-item-option-content' }));

    openAntSelect('status-progress-mapping-bucket-0');
    await user.click(await findAntSelectOption('Done'));

    await waitFor(() => {
      const last = props.onDraftChange.mock.calls.at(-1)?.[0] as Partial<GanttScopeSettings> | undefined;
      expect(last?.statusProgressMapping).toEqual({
        '2': { statusId: '2', statusName: 'In Progress', bucket: 'done' },
      });
    });
  });

  it('does not persist arbitrary status search text as a Gantt status mapping row', async () => {
    const user = userEvent.setup();
    const props = renderModal({
      draft: {
        ...baseDraft,
        statusProgressMapping: {
          '1': { statusId: '1', statusName: 'Open', bucket: 'todo' },
        },
      },
    });

    openAntSelect('status-progress-mapping-status-0');
    await user.type(screen.getByRole('combobox', { name: 'Jira status' }), 'Missing Status');

    expect(screen.getByText('No status found')).toBeInTheDocument();
    expect(props.onDraftChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        statusProgressMapping: expect.objectContaining({
          'Missing Status': expect.anything(),
        }),
      })
    );
  });

  it('clears draft statusProgressMapping when the last valid row is removed and an empty row remains', async () => {
    const user = userEvent.setup();
    const props = renderModal({
      draft: {
        ...baseDraft,
        statusProgressMapping: {
          '1': { statusId: '1', statusName: 'Open', bucket: 'todo' },
        },
      },
    });

    await user.click(screen.getByRole('button', { name: '+ Add status mapping' }));
    await user.click(screen.getAllByRole('button', { name: 'Remove status mapping' })[0]);

    await waitFor(() => {
      const last = props.onDraftChange.mock.calls.at(-1)?.[0] as Partial<GanttScopeSettings> | undefined;
      expect(last?.statusProgressMapping).toEqual({});
    });
  });

  it('keeps a new empty status mapping row local until a status is selected', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: '+ Add status mapping' }));

    expect(screen.getByTestId('status-progress-mapping-status-0')).toBeInTheDocument();
    expect(props.onDraftChange).not.toHaveBeenCalled();
  });

  it('calls onDraftChange with issueLinkTypesToInclude when row link type is selected', async () => {
    const user = userEvent.setup();
    const props = renderModal({ draft: { ...baseDraft, includeIssueLinks: true } });
    await activateTab(/issues/i);

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
  }, 15000);
});

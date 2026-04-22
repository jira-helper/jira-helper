import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ok } from 'ts-results';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerTestDependencies } from 'src/shared/testTools/registerTestDI';
import { JiraServiceToken, type IJiraService } from 'src/infrastructure/jira/jiraService';
import { useJiraFieldsStore } from 'src/infrastructure/jira/fields/jiraFieldsStore';
import { useJiraIssueLinkTypesStore } from 'src/infrastructure/jira/stores/jiraIssueLinkTypesStore';
import { useJiraStatusesStore } from 'src/shared/jira/stores/jiraStatusesStore';
import type { JiraField, JiraIssueLinkType, JiraStatus } from 'src/infrastructure/jira/types';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { ganttChartModule } from '../../module';
import { GanttSettingsContainer } from './GanttSettingsContainer';

/** Non-empty stores so GanttSettingsModal hooks do not auto-trigger Jira API loads in tests. */
function seedJiraMetadataForModal() {
  const placeholderField: JiraField = {
    id: 'summary',
    name: 'Summary',
    custom: false,
    orderable: false,
    navigable: true,
    searchable: true,
    clauseNames: ['summary'],
    schema: { type: 'string' },
  };
  const placeholderStatus: JiraStatus = {
    id: '1',
    name: 'Open',
    statusCategory: { id: 1, key: 'new', colorName: 'blue-gray', name: 'To Do' },
  };
  const placeholderLink: JiraIssueLinkType = {
    id: '10000',
    name: 'Blocks',
    inward: 'is blocked by',
    outward: 'blocks',
    self: 'http://localhost',
  };
  useJiraFieldsStore.setState({ fields: [placeholderField], isLoading: false, error: null });
  useJiraStatusesStore.setState({ statuses: [placeholderStatus], isLoading: false, error: null });
  useJiraIssueLinkTypesStore.setState({ linkTypes: [placeholderLink], isLoading: false, error: null });
}

describe('GanttSettingsContainer', () => {
  beforeEach(() => {
    globalContainer.reset();
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    registerTestDependencies(globalContainer);
    seedJiraMetadataForModal();
    vi.clearAllMocks();
    const mockJira: IJiraService = {
      fetchSubtasks: vi.fn().mockResolvedValue(Ok({ subtasks: [], externalLinks: [] })),
      fetchJiraIssue: vi.fn(),
      getExternalIssues: vi.fn(),
      getProjectFields: vi.fn(),
      getIssueLinkTypes: vi.fn(),
    };
    globalContainer.register({ token: JiraServiceToken, value: mockJira });
    ganttChartModule.ensure(globalContainer);
  });

  it('does not show settings modal when not visible', () => {
    render(
      <WithDi container={globalContainer}>
        <GanttSettingsContainer container={globalContainer} visible={false} onClose={vi.fn()} />
      </WithDi>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders settings modal when visible', () => {
    render(
      <WithDi container={globalContainer}>
        <GanttSettingsContainer container={globalContainer} visible onClose={vi.fn()} />
      </WithDi>
    );

    expect(screen.getByRole('dialog', { name: 'Gantt settings' })).toBeInTheDocument();
  });
});

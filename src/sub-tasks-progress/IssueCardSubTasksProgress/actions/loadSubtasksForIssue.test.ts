import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { registerLogger } from 'src/shared/Logger';
import { globalContainer } from 'dioma';
import { Ok } from 'ts-results';
import { IJiraService, JiraServiceToken } from 'src/shared/jira/jiraService';
import { ExternalIssueMapped, JiraIssueMapped } from 'src/shared/jira/types';
import { JiraTestDataBuilder } from 'src/shared/jira/testData';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';
import { useJiraExternalIssuesStore } from 'src/shared/jira/stores/jiraExternalIssues';
import { useSubTaskProgressBoardPropertyStore } from '../../SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { loadSubtasksForIssue } from './loadSubtasksForIssue';

describe('loadSubtasksForIssue', () => {
  // Mock JiraService
  const mockJiraService = {
    fetchSubtasks: vi.fn<IJiraService['fetchSubtasks']>().mockResolvedValue(Ok({ subtasks: [], externalLinks: [] })),
    getExternalIssues: vi.fn<IJiraService['getExternalIssues']>().mockResolvedValue(Ok([])),
    fetchJiraIssue: vi.fn<IJiraService['fetchJiraIssue']>().mockResolvedValue(Ok({} as JiraIssueMapped)),
  };

  beforeAll(() => {
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({ token: JiraServiceToken, value: mockJiraService });
  });

  beforeEach(() => {
    vi.resetAllMocks();
    // Reset store states
    useSubTaskProgressBoardPropertyStore.setState(useSubTaskProgressBoardPropertyStore.getInitialState());
  });

  afterAll(() => {
    globalContainer.reset();
  });

  it('should load subtasks and external issues for issue when both types of settings are enabled', async () => {
    // GIVEN both subtask and external links settings in useSubTaskProgressBoardPropertyStore are enabled
    useSubTaskProgressBoardPropertyStore.setState(state => ({
      ...state,
      data: {
        ...state.data,
        countIssuesSubtasks: true,
        countIssuesExternalLinks: true,
      },
    }));

    const issue = new JiraTestDataBuilder().key('TEST-123').build();
    // GIVEN the issue has subtasks and external links
    mockJiraService.fetchJiraIssue.mockResolvedValue(Ok(issue));

    const subtasks = [new JiraTestDataBuilder().key('TEST-1').build(), new JiraTestDataBuilder().key('TEST-2').build()];
    mockJiraService.fetchSubtasks.mockResolvedValue(Ok({ externalLinks: [], subtasks }));

    const externalIssueData = {
      status: 'Done',
      project: 'TEST-EXTERNAL',
      issueKey: 'TEST-1',
      summary: 'Test subtask',
      statusColor: 'green',
    } as ExternalIssueMapped;

    mockJiraService.getExternalIssues.mockResolvedValue(Ok([externalIssueData]));

    const issueKey = 'TEST-123';
    const abortSignal = new AbortController().signal;

    // WHEN loadSubtasksForIssue is called with an issue key and abort signal
    await loadSubtasksForIssue(issueKey, abortSignal);

    // AND JiraService.fetchSubtasks should be called with the issue key and abort signal
    expect(mockJiraService.fetchSubtasks).toHaveBeenCalledWith(issueKey, abortSignal);

    // AND JiraService.getExternalIssues should be called with the issue key and abort signal
    expect(mockJiraService.getExternalIssues).toHaveBeenCalledWith(issueKey, abortSignal);

    // AND the subtasks store should have the correct state
    expect(useJiraSubtasksStore.getState().data[issueKey]).toEqual({
      subtasks,
      externalLinks: [],
      state: 'loaded',
    });
    // AND the external links store should have the correct state
    expect(useJiraExternalIssuesStore.getState().data[issueKey]).toEqual({
      externalIssues: [externalIssueData],
      state: 'loaded',
    });
  });
});

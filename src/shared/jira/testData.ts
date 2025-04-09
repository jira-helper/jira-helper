import { mapJiraIssue } from './jiraService';
import { JiraIssue, JiraIssueMapped } from './types';

const baseMock: JiraIssue = {
  fields: {
    issuetype: {
      name: 'Task',
      subtask: false,
    },
    subtasks: [],
    status: {
      id: '1',
      name: 'Done',
      statusCategory: {
        id: 3,
        key: 'done',
        colorName: 'green',
        name: 'Done',
      },
    },
    issuelinks: [],
    project: {
      key: 'TEST',
    },
    comment: undefined,
    summary: 'Test issue',
    components: [],
    creator: {
      active: true,
      avatarUrls: {
        '48x48': 'https://example.com/avatar.png',
        '24x24': 'https://example.com/avatar.png',
        '16x16': 'https://example.com/avatar.png',
      },
      displayName: 'John Doe',
      emailAddress: 'john.doe@example.com',
      key: 'john.doe',
      name: 'John Doe',
      timeZone: 'Europe/London',
    },

    assignee: {
      active: true,
      avatarUrls: {
        '48x48': 'https://example.com/avatar.png',
        '24x24': 'https://example.com/avatar.png',
        '16x16': 'https://example.com/avatar.png',
      },
      displayName: 'John Doe',
      emailAddress: 'john.doe@example.com',
      key: 'john.doe',
      name: 'John Doe',
      self: 'https://example.com/john.doe',
      timeZone: 'Europe/London',
    },
    reporter: {
      active: true,
      avatarUrls: {
        '48x48': 'https://example.com/avatar.png',
        '24x24': 'https://example.com/avatar.png',
        '16x16': 'https://example.com/avatar.png',
      },
      displayName: 'John Doe',
      emailAddress: 'john.doe@example.com',
      key: 'john.doe',
      name: 'John Doe',
      self: 'https://example.com/john.doe',
      timeZone: 'Europe/London',
    },
    priority: {
      iconUrl: 'https://example.com/avatar.png',
      id: '1',
      name: 'High',
      self: 'https://example.com/priority',
    },
    created: '2021-01-01',
  },
  id: '1',
  key: 'TEST-123',
  changelog: undefined,
};

export class JiraTestDataBuilder {
  private mock: JiraIssue = JSON.parse(JSON.stringify(baseMock));

  constructor() {}

  key(key: string) {
    this.mock.key = key;
    return this;
  }

  status({
    status,
    statusId,
    statusCategory,
    statusColor,
  }: {
    status: string;
    statusId: number;
    statusCategory: 'new' | 'indeterminate' | 'done';
    statusColor: string;
  }) {
    this.mock.fields.status = {
      id: statusId.toString(),
      name: status,
      statusCategory: { id: 1, key: statusCategory, colorName: statusColor, name: statusCategory },
    };
    return this;
  }

  build(): JiraIssueMapped {
    return mapJiraIssue(this.mock);
  }
}

export const getBaseMock = (): JiraIssueMapped => JSON.parse(JSON.stringify(baseMock));

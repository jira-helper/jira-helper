export type JiraIssue = {
  fields: {
    issuetype: {
      name: string;
      subtask: boolean;
    };
    subtasks: {
      // example of id: "10506487"
      id: string;
      // example of key: "THF-2012"
      key: string;
      fields: {
        summary: string;
        status: {
          name: string;
        };
        issuetype: {
          name: string;
          subtask: boolean;
        };
      };
    }[];
    status: {
      id: string;
      name: string;
      statusCategory: {
        id: number;
        key: 'new' | 'indeterminate' | 'done';
        colorName: string; // yellow for example
        name: string;
      };
    };
    issuelinks: {
      id: string;
      self: string;
      type: {
        id: string;
        name: string;
        inward: string;
        outward: string;
        self: string;
      };
      outwardIssue?: {
        id: string;
        key: string;
        self: string;
        fields: {
          summary: string;
          status: {
            self: string;
            description: string;
            iconUrl: string;
            name: string;
            id: string;
            statusCategory: {
              self: string;
              id: number;
              key: string;
              colorName: string;
              name: string;
            };
          };
          priority: {
            self: string;
            iconUrl: string;
            name: string;
            id: string;
          };
          issuetype: {
            self: string;
            id: string;
            description: string;
            iconUrl: string;
            name: string;
            subtask: boolean;
            avatarId: number;
          };
        };
      };
      inwardIssue?: {
        id: string;
        key: string;
        self: string;
        fields: {
          summary: string;
          status: {
            self: string;
            description: string;
            iconUrl: string;
            name: string;
            id: string;
            statusCategory: {
              self: string;
              id: number;
              key: string;
              colorName: string;
              name: string;
            };
          };
          priority: {
            self: string;
            iconUrl: string;
            name: string;
            id: string;
          };
          issuetype: {
            self: string;
            id: string;
            description: string;
            iconUrl: string;
            name: string;
            subtask: boolean;
            avatarId: number;
          };
        };
      };
    }[];
    project: {
      key: string;
    };
    comment?: {
      comments: {
        updated: string;
        body: string;
      }[];
    };
    summary: string;
    components: {
      name: string;
    }[];
    creator: {
      active: boolean;
      avatarUrls: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
      };
      displayName: string;
      emailAddress: string;
      key: string;
      name: string;
      timeZone: string;
    };

    assignee: {
      active: boolean;
      avatarUrls: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
      };
      displayName: string;
      emailAddress: string;
      key: string;
      name: string;
      self: string;
      timeZone: string;
    };
    reporter: {
      active: boolean;
      avatarUrls: {
        '48x48': string;
        '24x24': string;
        '16x16': string;
      };
      displayName: string;
      emailAddress: string;
      key: string;
      name: string;
      self: string;
      timeZone: string;
    };
    priority: {
      iconUrl: string;
      id: string;
      name: string;
      self: string;
    };
    created: string;
  } & Record<string, any>;
  id: string;
  key: string;
  changelog?: {
    histories: {
      id: string;
      author: {
        self: string;
        name: string;
        key: string;
        emailAddress: string;
        avatarUrls: {
          '48x48': string;
          '24x24': string;
          '16x16': string;
          '32x32': string;
        };
        displayName: string;
        active: boolean;
        timeZone: string;
      };
      created: string;
      items: {
        field: string;
        fieldtype: string;
        from: string;
        to: string;
        fromString: string;
        toString: string;
      }[];
    }[];
    startAt: number;
    total: number;
    maxResults: number;
  };
};

export type JiraIssueMapped = JiraIssue & {
  id: string;
  key: string;
  project: string;
  summary: string;
  status: string;
  statusId: number;
  statusCategory: 'new' | 'indeterminate' | 'done';
  statusColor: string;
  assignee: string;
  created: string;
  reporter: string;
  priority: string;
  creator: string;
  issueType: 'Epic' | 'Task' | 'Sub-task';
  issueTypeName: string;
  isFlagged: boolean;
  isBlockedByLinks: boolean;
};

export type RemoteLink = {
  id: number;
  // "https://jira3.tcsbank.ru/rest/api/2/issue/AUTOB2B-6/remotelink/55350"
  self: string;
  globalId: string;
  application: {
    // "com.atlassian.jira",
    type?: string;
    // "JIRA | TCS Bank"
    name?: string;
  };
  relationship: string;
  object: {
    url: string;
    // "SMEDE-5372",
    title: string;
    icon: {};
    status: {
      icon: {};
    };
  };
};

export type ExternalIssueMapped = {
  status: string;
  project: string;
  issueKey: string;
  summary: string;
  relationship: string;
  // @see https://developer.atlassian.com/server/jira/platform/jira-issue-statuses-as-lozenges/
  // @see /rest/api/2/statuscategory/
  statusColor: // no category => unmapped
  | 'medium-gray'
    // done
    | 'green'
    // in progress
    | 'yellow'
    | 'brown'
    | 'warm-red'
    // Todo\new
    | 'blue-gray';
};

export type JiraField = {
  id: string;
  name: string;
  custom: boolean;
  orderable: boolean;
  navigable: boolean;
  searchable: boolean;
  clauseNames: string[];
  schema?: {
    type:
      | 'number'
      | 'any'
      | 'string'
      | 'resolution'
      | 'user'
      | 'array'
      | 'option-with-child'
      | 'date'
      | 'datetime'
      | 'option'
      | 'votes'
      | 'timetracking'
      | 'progress'
      | 'project'
      | 'watches'
      | 'version'
      | 'issuetype'
      | 'status'
      | 'comments-page'
      | 'priority'
      | 'securitylevel';

    custom?: string;
    customId?: number;
    items?: string;
    system?: string;
  };
};

export type JiraIssueLinkType = {
  id: string;
  name: string;
  inward: string;
  outward: string;
  self: string;
};

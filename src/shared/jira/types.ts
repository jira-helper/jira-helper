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
      name: string;
    };
    issuelinks: {
      type: {
        invard: string;
      };
      invardIssue: {
        fields: {
          status: string;
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
  };
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

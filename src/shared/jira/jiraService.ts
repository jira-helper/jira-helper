import { Err, Ok, Result } from 'ts-results';
import { Container, Token } from 'dioma';
import {
  getExternalIssues,
  getIssueLinkTypes,
  getJiraIssue,
  getProjectFields,
  renderRemoteLink,
  searchIssues,
} from '../jiraApi';
import { ExternalIssueMapped, JiraField, JiraIssue, JiraIssueMapped, RemoteLink } from './types';

class CacheWithTTL<T> {
  private cache: { [key: string]: { value: T; timestamp: number } } = {};

  private ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  get(key: string) {
    const item = this.cache[key];
    if (!item || item.timestamp + this.ttl < Date.now()) {
      delete this.cache[key];
      return null;
    }
    return item.value;
  }

  getValues() {
    return Object.values(this.cache).map(item => item.value);
  }

  set(key: string, value: T) {
    this.cache[key] = { value, timestamp: Date.now() };
  }

  size() {
    return Object.keys(this.cache).length;
  }
}

type NewTask<T> = {
  cb: () => Promise<T>;
  abortSignal: AbortSignal;
  key: string;
};

type RegiseteredTask<T> = NewTask<T> & {
  promise: Promise<T>;
};

class TaskQueue {
  private queue: RegiseteredTask<any>[] = [];

  private concurrentTasks = 3;

  private runningTasksCount = 0;

  register<T>(task: NewTask<T> & { priority?: 'high' }) {
    let resolve: (value: T) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const queueItem = { ...task, cb: () => task.cb().then(resolve, reject), promise };

    if (task.priority === 'high') {
      this.queue.unshift(queueItem);
    } else {
      this.queue.push(queueItem);
    }

    task.abortSignal.addEventListener('abort', () => {
      this.queue = this.queue.filter(t => t.key !== task.key);
    });

    this.run();
    return promise;
  }

  private async run() {
    if (this.runningTasksCount >= this.concurrentTasks) {
      return;
    }
    const task = this.queue.shift();
    if (!task) {
      return;
    }
    this.runningTasksCount += 1;
    try {
      const result = await task.cb();

      return result;
    } finally {
      this.runningTasksCount -= 1;

      setTimeout(() => {
        this.run();
      }, this.getDelay());
    }
  }

  getQueueSize() {
    return this.queue.length;
  }

  getTasksCount(keyPredicate: (key: string) => boolean) {
    return this.queue.filter(task => keyPredicate(task.key)).length;
  }

  private getDelay() {
    return Math.random() * 300;
  }
}

const mapJiraIssueType = (jiraIssue: JiraIssue): JiraIssueMapped['issueType'] => {
  if (jiraIssue.fields.issuetype.name === 'Epic') {
    return 'Epic';
  }
  if (jiraIssue.fields.issuetype.subtask) {
    return 'Sub-task';
  }
  return 'Task';
};

const getIsFlagged = (issue: JiraIssue) => {
  if (issue.fields.status.statusCategory.key === 'done') {
    return false;
  }
  return Object.values(issue.fields).some((field: unknown) => {
    if (field == null) {
      return false;
    }
    if (Array.isArray(field)) {
      return field.some(item => item?.value === 'Impediment');
    }
    // @ts-expect-error
    if (field?.value === 'Impediment') {
      return true;
    }
    return false;
  });
};

const getIsBlockedByLinks = (issue: JiraIssue) => {
  if (issue.fields.status.statusCategory.key === 'done') {
    return false;
  }
  return issue.fields.issuelinks.some(issueLink => {
    return (
      issueLink.type.inward === 'is blocked by' && issueLink.inwardIssue?.fields.status.statusCategory.key !== 'done'
    );
  });
};

export const mapJiraIssue = (jiraIssue: JiraIssue): JiraIssueMapped => {
  return {
    ...jiraIssue,
    id: jiraIssue.id,
    key: jiraIssue.key,
    project: jiraIssue.fields.project.key,
    summary: jiraIssue.fields.summary,
    status: jiraIssue.fields.status.name,
    statusId: parseInt(jiraIssue.fields.status.id, 10),
    statusCategory: jiraIssue.fields.status.statusCategory.key,
    statusColor: jiraIssue.fields.status.statusCategory.colorName,
    assignee: jiraIssue.fields.assignee?.displayName || 'none',
    created: jiraIssue.fields.created,
    reporter: jiraIssue.fields.reporter?.displayName || 'none',
    priority: jiraIssue.fields.priority?.name || 'none',
    creator: jiraIssue.fields.creator?.displayName || 'none',
    issueType: mapJiraIssueType(jiraIssue),
    issueTypeName: jiraIssue.fields.issuetype.name,
    isFlagged: getIsFlagged(jiraIssue),
    isBlockedByLinks: getIsBlockedByLinks(jiraIssue),
  };
};

export type Subtasks = {
  subtasks: JiraIssueMapped[];
  externalLinks: JiraIssueMapped[];
};
const MINUTE = 1000 * 60;

class SubtasksService {
  private cache = new CacheWithTTL<Subtasks>(30 * MINUTE);

  updateSubtasks(issueKey: string, subtasks: Subtasks) {
    this.cache.set(issueKey, subtasks);
  }

  getSubtasks(issueKey: string) {
    return this.cache.get(issueKey);
  }

  getAllSubtasks() {
    return this.cache.getValues();
  }
}

class JiraIssuesService {
  private cache = new CacheWithTTL<JiraIssueMapped>(30 * MINUTE);

  updateJiraIssue(issueId: string, issue: JiraIssueMapped) {
    this.cache.set(issueId, issue);
  }

  getJiraIssue(issueId: string) {
    return this.cache.get(issueId);
  }
}

class ExternalIssuesService {
  private cache = new CacheWithTTL<ExternalIssueMapped[]>(30 * MINUTE);

  updateExternalIssues(issueKey: string, issues: ExternalIssueMapped[]) {
    this.cache.set(issueKey, issues);
  }

  getExternalIssue(issueKey: string) {
    return this.cache.get(issueKey);
  }

  getAllExternalIssues() {
    return this.cache.getValues();
  }
}

class LocalStorageCache<T> {
  private readonly ttl: number;

  private readonly storageKey: string;

  constructor(storageKey: string, ttl: number) {
    this.storageKey = storageKey;
    this.ttl = ttl;
  }

  get(): T | null {
    const item = localStorage.getItem(this.storageKey);
    if (!item) {
      return null;
    }

    try {
      const { value, timestamp } = JSON.parse(item);
      if (timestamp + this.ttl < Date.now()) {
        localStorage.removeItem(this.storageKey);
        return null;
      }
      return value;
    } catch {
      return null;
    }
  }

  set(value: T): void {
    const item = JSON.stringify({
      value,
      timestamp: Date.now(),
    });
    localStorage.setItem(this.storageKey, item);
  }
}

export interface IJiraService {
  fetchJiraIssue: (issueId: string, abortSignal: AbortSignal) => Promise<Result<JiraIssueMapped, Error>>;
  fetchSubtasks: (issueId: string, abortSignal: AbortSignal) => Promise<Result<Subtasks, Error>>;
  getExternalIssues: (issueKey: string, signal: AbortSignal) => Promise<Result<ExternalIssueMapped[], Error>>;
  getProjectFields: (abortSignal: AbortSignal) => Promise<Result<any, Error>>;
  getIssueLinkTypes: (abortSignal: AbortSignal) => Promise<Result<any, Error>>;
}

export class JiraService implements IJiraService {
  private queue = new TaskQueue();

  private subtasksService = new SubtasksService();

  private jiraIssuesService = new JiraIssuesService();

  private externalIssuesService = new ExternalIssuesService();

  private projectFieldsCache = new LocalStorageCache<JiraField[]>('jira-helper-fields', 7 * 24 * 60 * 60 * 1000); // 1 week

  private issueLinkTypesCache = new LocalStorageCache<any[]>('jira-helper-issue-link-types', 7 * 24 * 60 * 60 * 1000); // 1 week

  static getInstance() {
    if (!JiraService.instance) {
      JiraService.instance = new JiraService();
    }
    return JiraService.instance;
  }

  private static instance: JiraService;

  async fetchJiraIssue(issueId: string, abortSignal: AbortSignal): Promise<Result<JiraIssueMapped, Error>> {
    const issue = this.jiraIssuesService.getJiraIssue(issueId);
    if (issue) {
      return Ok(issue);
    }

    try {
      const mappedJiraIssue = await this.queue.register({
        key: `fetchJiraIssue-${issueId}`,
        cb: async () => {
          // TODO: возможно что пока задача была в очереди, issue уже загрузили
          const cachedIssue = this.jiraIssuesService.getJiraIssue(issueId);
          if (cachedIssue) {
            return Ok(cachedIssue);
          }
          const apiJiraIssue = await getJiraIssue(issueId, {
            signal: abortSignal,
          });
          if (apiJiraIssue.err) {
            return Err(apiJiraIssue.val);
          }
          const mappedIssue = mapJiraIssue(apiJiraIssue.val);
          this.jiraIssuesService.updateJiraIssue(issueId, mappedIssue);
          return Ok(mappedIssue);
        },
        abortSignal,
      });

      return mappedJiraIssue;
    } catch (error) {
      if (error instanceof Error) {
        const message = `Failed to fetch Jira issue ${issueId}: ${error.message}`;
        error.message = message;
        return Err(error);
      }
      return Err(new Error(`Unknown error: ${error}`));
    }
  }

  async fetchSubtasks(issueId: string, abortSignal: AbortSignal): Promise<Result<Subtasks, Error>> {
    const SUBTASK_JQL = `parent = ${issueId}`;
    const EPIC_TASKS_JQL = `"Epic Link" = ${issueId}`;
    const LINKED_ISSUES_JQL = `issue in linkedIssues(${issueId})`;

    const subtasks = this.subtasksService.getSubtasks(issueId);
    if (subtasks) {
      return Ok(subtasks);
    }

    const JQL = `${SUBTASK_JQL} OR ${EPIC_TASKS_JQL} OR ${LINKED_ISSUES_JQL}`;

    const allSubtasksResponse = await this.queue.register({
      key: `fetchSubtasks-${issueId}-all`,
      cb: () =>
        searchIssues(
          JQL,
          {
            maxResults: 100,
            expand: ['changelog'],
          },
          {
            signal: abortSignal,
          }
        ),
      abortSignal,
    });

    if (allSubtasksResponse.err) {
      return Err(allSubtasksResponse.val);
    }

    const allSubtasksData = await allSubtasksResponse.val.json();
    const allSubtasks = allSubtasksData.issues.map(mapJiraIssue);
    this.subtasksService.updateSubtasks(issueId, {
      subtasks: allSubtasks,
      externalLinks: [],
    });
    return Ok({ subtasks: allSubtasks, externalLinks: [] });
  }

  async getExternalIssues(issueKey: string, signal: AbortSignal): Promise<Result<ExternalIssueMapped[], Error>> {
    const externalIssues = this.externalIssuesService.getExternalIssue(issueKey);
    if (externalIssues) {
      return Ok(externalIssues);
    }

    const externalIssuesResult = await this.queue.register({
      key: `getExternalIssues-${issueKey}`,
      cb: () => getExternalIssues(issueKey, { signal }),
      abortSignal: signal,
    });

    if (externalIssuesResult.err) {
      return Err(externalIssuesResult.val);
    }

    const externalIssuesResponse = await externalIssuesResult.val;
    const isRemoteLinksResponse = (response: any): response is RemoteLink[] => {
      if (!Array.isArray(response)) {
        return false;
      }
      return response.every(o => typeof o?.application?.type === 'string');
    };
    if (!isRemoteLinksResponse(externalIssuesResponse)) {
      return Err(new Error('Invalid response, expected remoteLinks'));
    }
    const issues = externalIssuesResponse.filter(o => o.application.type === 'com.atlassian.jira');
    if (!issues.length) {
      return Ok([]);
    }

    const project = issues[0].object.title.split('-')[0];
    const externalIssueKey = issues[0].object.title;

    const result: ExternalIssueMapped[] = [];
    for (const issue of issues) {
      // eslint-disable-next-line no-await-in-loop
      const render = await this.queue.register({
        key: `renderRemoteLink-${issue.id}`,
        cb: () => renderRemoteLink(issue.id, { signal }),
        abortSignal: signal,
      });
      if (render.err) {
        return Err(render.val);
      }
      const html = render.val;

      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');

      const status = dom.querySelector('.status span')?.textContent;

      const summary = dom.querySelector('.link-summary')?.textContent;

      if (!status || !summary) {
        continue;
      }

      // @see https://developer.atlassian.com/server/jira/platform/jira-issue-statuses-as-lozenges/
      /** example
       * 






















<p>
            <img src="https://jira.tcsbank.ru/secure/viewavatar?size=xsmall&amp;avatarId=16518&amp;avatarType=issuetype" width="16" height="16" title="[JIRA | TCS Bank] Task - Basic.Default.A task that needs to be done." alt="[JIRA | TCS Bank] Task - Basic.Default.A task that needs to be done." />
        <span title="[JIRA | TCS Bank] SCAT-414: Тест на пробуждение">
        <a href="https://jira.tcsbank.ru/browse/SCAT-414"
           class="link-title"
            target="_blank"             rel="noopener"         >SCAT-414</a> <span class="link-summary">Тест на пробуждение</span>
    </span>
</p>
<ul class="link-snapshot">
            <li class="status">
                <span class=" jira-issue-status-lozenge aui-lozenge jira-issue-status-lozenge-blue-gray jira-issue-status-lozenge-new aui-lozenge-subtle jira-issue-status-lozenge-max-width-short" data-tooltip="&lt;span class=&quot;jira-issue-status-tooltip-title&quot;&gt;New&lt;/span&gt;">New</span>
                </li>
    </ul>

       * 
       * 
       */
      const className = 'jira-issue-status-lozenge';
      const statusTextElement = dom.querySelector(`.${className}`);
      let statusColor: string | undefined;
      if (statusTextElement) {
        statusColor = statusTextElement
          .getAttribute('class')
          ?.split(' ')
          .find(c => {
            const isStatusLozenge = c.startsWith('jira-issue-status-lozenge-');
            const availableStatuses = ['medium-gray', 'green', 'yellow', 'brown', 'warm-red', 'blue-gray'];
            return isStatusLozenge && availableStatuses.some(st => c.includes(st));
          })
          ?.replace('jira-issue-status-lozenge-', '');
      }

      result.push({
        status,
        project,
        issueKey: externalIssueKey,
        summary,
        statusColor: statusColor as 'medium-gray' | 'green' | 'yellow' | 'brown' | 'warm-red' | 'blue-gray',
      });
    }

    this.externalIssuesService.updateExternalIssues(issueKey, result);

    return Ok(result);
  }

  isFetchingSubtasks() {
    return !!this.queue.getTasksCount(key => key.startsWith('fetchSubtasks'));
  }

  async getProjectFields(abortSignal: AbortSignal): Promise<Result<JiraField[], Error>> {
    const cachedFields = this.projectFieldsCache.get();
    if (cachedFields) {
      return Ok(cachedFields);
    }

    try {
      const fields = await this.queue.register({
        key: 'getProjectFields',
        cb: async () => {
          const result = await getProjectFields({
            signal: abortSignal,
          });
          if (result.err) {
            return Err(result.val);
          }
          this.projectFieldsCache.set(result.val);
          return Ok(result.val);
        },
        abortSignal,
        priority: 'high',
      });

      return fields;
    } catch (error) {
      if (error instanceof Error) {
        const message = `Failed to fetch project fields: ${error.message}`;
        error.message = message;
        return Err(error);
      }
      return Err(new Error(`Unknown error: ${error}`));
    }
  }

  async getIssueLinkTypes(abortSignal: AbortSignal): Promise<Result<any[], Error>> {
    const cached = this.issueLinkTypesCache.get();
    if (cached) {
      return Ok(cached);
    }

    const issueLinkTypes = await this.queue.register({
      key: 'getIssueLinkTypes',
      cb: async () => {
        const result = await getIssueLinkTypes({ signal: abortSignal });
        if (result.err) {
          return Err(result.val);
        }
        this.issueLinkTypesCache.set(result.val);
        return Ok(result.val);
      },
      abortSignal,
      priority: 'high',
    });

    return issueLinkTypes;
  }
}

export const JiraServiceToken = new Token<IJiraService>('JiraService');
export const registerJiraServiceInDI = (container: Container) => {
  container.register({ token: JiraServiceToken, factory: () => JiraService.getInstance() });
};

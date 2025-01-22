import { Err, Ok, Result } from 'ts-results';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Container, Token } from 'dioma';
import { getJiraIssue, searchIssues } from '../jiraApi';
import { JiraIssue } from './types';

class CacheWithTTL<T> extends EventEmitter {
  private cache: { [key: string]: { value: T; timestamp: number } } = {};

  private ttl: number;

  constructor(ttl: number) {
    super();
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
    this.emit('change', key, value);
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

type TaskQueueEvents = {
  'task-registered': (key: string) => void;
  'task-done': (key: string) => void;
};

class TaskQueue extends (EventEmitter as new () => TypedEmitter<TaskQueueEvents>) {
  private queue: RegiseteredTask<any>[] = [];

  private concurrentTasks = 3;

  private runningTasksCount = 0;

  register<T>(task: NewTask<T>) {
    let resolve: (value: T) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.queue.push({ ...task, cb: () => task.cb().then(resolve, reject), promise });
    console.log('queue', this.queue.length);
    task.abortSignal.addEventListener('abort', () => {
      this.queue = this.queue.filter(t => t.key !== task.key);
    });
    this.emit('task-registered', task.key);
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
      this.emit('task-done', task.key);

      this.run();
    }
  }

  getQueueSize() {
    return this.queue.length;
  }

  getTasksCount(keyPredicate: (key: string) => boolean) {
    return this.queue.filter(task => keyPredicate(task.key)).length;
  }
}

type JiraIssueMapped = JiraIssue & {
  id: string;
  project: string;
  summary: string;
  status: string;
  assignee: string;
  created: string;
  reporter: string;
  priority: string;
  creator: string;
  issueType: string;
};

const mapJiraIssue = (jiraIssue: JiraIssue): JiraIssueMapped => {
  return {
    ...jiraIssue,
    id: jiraIssue.id,
    project: jiraIssue.fields.project.key,
    summary: jiraIssue.fields.summary,
    status: jiraIssue.fields.status.name,
    assignee: jiraIssue.fields.assignee?.displayName || 'none',
    created: jiraIssue.fields.created,
    reporter: jiraIssue.fields.reporter?.displayName || 'none',
    priority: jiraIssue.fields.priority?.name || 'none',
    creator: jiraIssue.fields.creator?.displayName || 'none',
    issueType: jiraIssue.fields.issuetype.name,
  };
};

export type Subtasks = {
  subtasks: JiraIssueMapped[];
  externalLinks: JiraIssueMapped[];
};
const MINUTE = 1000 * 60;

type SubtasksServiceEvents = {
  'subtasks-updated': (subtasks: Subtasks) => void;
};
class SubtasksService extends (EventEmitter as new () => TypedEmitter<SubtasksServiceEvents>) {
  private cache = new CacheWithTTL<Subtasks>(30 * MINUTE);

  updateSubtasks(issueId: string, subtasks: Subtasks) {
    this.cache.set(issueId, subtasks);
    this.emit('subtasks-updated', subtasks);
  }

  getSubtasks(issueId: string) {
    return this.cache.get(issueId);
  }

  getAllSubtasks() {
    return this.cache.getValues();
  }
}

type JiraIssuesServiceEvents = {
  'jira-issue-updated': (issue: JiraIssueMapped) => void;
};

class JiraIssuesService extends (EventEmitter as new () => TypedEmitter<JiraIssuesServiceEvents>) {
  private cache = new CacheWithTTL<JiraIssueMapped>(30 * MINUTE);

  updateJiraIssue(issueId: string, issue: JiraIssueMapped) {
    this.cache.set(issueId, issue);
    this.emit('jira-issue-updated', issue);
  }

  getJiraIssue(issueId: string) {
    return this.cache.get(issueId);
  }
}

type JiraServiceEvents = {
  'fetching-issue-started': () => void;
  'fetching-issue-done': () => void;
  'fetching-subtasks-started': () => void;
  'fetching-subtasks-done': () => void;
};

export class JiraService extends (EventEmitter as new () => TypedEmitter<JiraServiceEvents>) {
  private queue = new TaskQueue();

  public subtasksService = new SubtasksService();

  public jiraIssuesService = new JiraIssuesService();

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
      const apiJiraIssue = await this.queue.register({
        key: `fetchJiraIssue-${issueId}`,
        cb: () => getJiraIssue(issueId),
        abortSignal,
      });

      const mappedJiraIssue = mapJiraIssue(apiJiraIssue);
      this.jiraIssuesService.updateJiraIssue(issueId, mappedJiraIssue);
      return Ok(mappedJiraIssue);
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
      console.log('subtasks already fetched');
      return Ok(subtasks);
    }

    this.emit('fetching-subtasks-started');
    console.log('registersubtasks');

    let jiraIssue: JiraIssueMapped | null = null;
    jiraIssue = this.jiraIssuesService.getJiraIssue(issueId);

    console.log('jiraIssue', jiraIssue);
    if (!jiraIssue) {
      const jiraIssueResult = await this.fetchJiraIssue(issueId, abortSignal);
      if (jiraIssueResult.err) {
        return Err(jiraIssueResult.val);
      }
      jiraIssue = jiraIssueResult.val;
    }

    // TODO: сделать второй запрос за экстернал линками
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

  isFetchingSubtasks() {
    return !!this.queue.getTasksCount(key => key.startsWith('fetchSubtasks'));
  }
}

export const JiraServiceToken = new Token<JiraService>('JiraService');
export const registerJiraServiceInDI = (container: Container) => {
  container.register({ token: JiraServiceToken, factory: () => JiraService.getInstance() });
};

import { Err, Ok, Result } from 'ts-results';
import { getJiraIssue, searchIssues } from '../jiraApi';
import { JiraIssue } from './types';

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

  set(key: string, value: T) {
    this.cache[key] = { value, timestamp: Date.now() };
  }
}

class EventEmitter {
  private listeners: ((...args: any[]) => void)[] = [];

  addListener(listener: (...args: any[]) => void) {
    this.listeners.push(listener);
    return () => this.removeListener(listener);
  }

  emit(...args: any[]) {
    this.listeners.forEach(listener => listener(...args));
  }

  removeListener(listener: (...args: any[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
}

class StatefullEventEmitter<T> extends EventEmitter {
  private state: T;

  constructor(initialState: T) {
    super();
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  setState(state: T) {
    this.state = state;
    this.emit(state);
  }

  addListener(listener: (state: T) => void) {
    const cleanup = super.addListener(listener);
    listener(this.state);
    return cleanup;
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

  register<T>(task: NewTask<T>) {
    let resolve: (value: T) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.queue.push({ ...task, cb: () => task.cb().then(resolve, reject), promise });
    task.abortSignal.addEventListener('abort', () => {
      this.queue = this.queue.filter(t => t.key !== task.key);
    });
    this.run();
    return promise;
  }

  async run() {
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
      this.queue.push(task);
      return result;
    } finally {
      this.runningTasksCount -= 1;
      this.run();
    }
  }
}

type JiraIssueMapped = JiraIssue & {
  id: string;
  project: string;
  summary: string;
  status: string;
  assignee: string;
  created: string;
};

const mapJiraIssue = (jiraIssue: JiraIssue): JiraIssueMapped => {
  return {
    ...jiraIssue,
    id: jiraIssue.id,
    project: jiraIssue.fields.project.key,
    summary: jiraIssue.fields.summary,
    status: jiraIssue.fields.status.name,
    assignee: jiraIssue.fields.assignee?.displayName || '',
    created: jiraIssue.fields.created,
  };
};

type Subtasks = {
  subtasks: JiraIssueMapped[];
  externalLinks: JiraIssueMapped[];
};
const MINUTE = 1000 * 60;
export class JiraService {
  queue = new TaskQueue();

  static getInstance() {
    if (!JiraService.instance) {
      JiraService.instance = new JiraService();
    }
    return JiraService.instance;
  }

  private static instance: JiraService;

  caches = {
    jiraIssuesCache: new CacheWithTTL<JiraIssueMapped>(30 * MINUTE),
    subtasksCache: new CacheWithTTL<Subtasks>(30 * MINUTE),
  };

  jiraIssuesEventEmitter = new StatefullEventEmitter<JiraIssueMapped[]>([]);

  issuesLoadingEventEmitter = new StatefullEventEmitter(false);

  subtasksEventEmitter = new StatefullEventEmitter<Subtasks[]>([]);

  async fetchJiraIssue(issueId: string, abortSignal: AbortSignal): Promise<Result<JiraIssueMapped, Error>> {
    const issue = this.caches.jiraIssuesCache.get(issueId);
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
      this.caches.jiraIssuesCache.set(issueId, mappedJiraIssue);
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
    const subtasks = this.caches.subtasksCache.get(issueId);
    if (subtasks) {
      return Ok(subtasks);
    }

    const subtasksResult = await this.queue.register({
      key: `fetchSubtasks-${issueId}`,
      cb: async () => {
        let jiraIssue: JiraIssueMapped | null = null;
        jiraIssue = this.caches.jiraIssuesCache.get(issueId);

        if (!jiraIssue) {
          const jiraIssueResult = await this.fetchJiraIssue(issueId, abortSignal);
          if (jiraIssueResult.err) {
            return Err(jiraIssueResult.val);
          }
          jiraIssue = jiraIssueResult.val;
        }

        // TODO: сделать второй запрос на экстернал линками
        const JQL = `${SUBTASK_JQL} OR ${EPIC_TASKS_JQL} OR ${LINKED_ISSUES_JQL}`;

        const allSubtasksResponse = await searchIssues(
          JQL,
          {
            maxResults: 100,
            expand: ['changelog'],
          },
          {
            signal: abortSignal,
          }
        );
        if (allSubtasksResponse.err) {
          return Err(allSubtasksResponse.val);
        }

        const allSubtasksData = await allSubtasksResponse.val.json();
        const allSubtasks = allSubtasksData.issues.map(mapJiraIssue);
        this.caches.subtasksCache.set(issueId, {
          subtasks: allSubtasks,
          externalLinks: [],
        });
        return Ok({ subtasks: allSubtasks, externalLinks: [] });
      },
      abortSignal,
    });

    return subtasksResult;
  }
}

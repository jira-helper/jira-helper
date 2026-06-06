declare global {
  interface Window {
    contextPath?: string;
  }
}

/**
 * Path prefix of the Jira webapp (e.g. `/jira`), or empty string when Jira is at the host root.
 * No trailing slash.
 */
export const getJiraPathPrefix = (): string => {
  const { location } = window;
  if (typeof window.contextPath === 'string') {
    return window.contextPath.replace(/\/$/, '');
  }
  if (location.hostname.indexOf('atlassian.net') === -1 && location.toString().split('/')[3] === 'jira') {
    return '/jira';
  }
  return '';
};

/**
 * Origin + context path (no trailing slash). Same base as REST calls in `jiraApi.ts`.
 */
export const getJiraWebBaseUrl = (): string => `${window.location.origin}${getJiraPathPrefix()}`;

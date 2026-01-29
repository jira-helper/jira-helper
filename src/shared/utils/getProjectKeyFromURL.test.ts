import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getProjectKeyFromURL } from './getProjectKeyFromURL';

describe('getProjectKeyFromURL', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // @ts-expect-error - mocking location
    delete window.location;
    // @ts-expect-error - mocking location
    window.location = { ...originalLocation };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('should extract project key from new URL format', () => {
    // @ts-expect-error - mocking location
    window.location = {
      pathname: '/jira/software/c/projects/MP/boards/138',
      href: 'https://company.atlassian.net/jira/software/c/projects/MP/boards/138',
      search: '',
    };

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('MP');
  });

  it('should extract project key from old URL format query parameter', () => {
    // @ts-expect-error - mocking location
    window.location = {
      pathname: '/secure/RapidBoard.jspa',
      href: 'https://company.atlassian.net/secure/RapidBoard.jspa?projectKey=PN&rapidView=12',
      search: '?projectKey=PN&rapidView=12',
    };

    // Mock URLSearchParams
    const originalURLSearchParams = window.URLSearchParams;
    // @ts-expect-error - mocking URLSearchParams
    window.URLSearchParams = class {
      constructor(search: string) {
        this.search = search;
      }
      get(key: string) {
        const params = new Map();
        this.search
          .substring(1)
          .split('&')
          .forEach(param => {
            const [k, v] = param.split('=');
            params.set(k, v);
          });
        return params.get(key);
      }
    };

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('PN');

    window.URLSearchParams = originalURLSearchParams;
  });

  it('should handle URL with multiple path segments', () => {
    // @ts-expect-error - mocking location
    window.location = {
      pathname: '/jira/software/c/projects/DEV/boards/42/reports/control-chart',
      href: 'https://company.atlassian.net/jira/software/c/projects/DEV/boards/42/reports/control-chart',
      search: '',
    };

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('DEV');
  });

  it('should return null when project key not found in URL', () => {
    // @ts-expect-error - mocking location
    window.location = {
      pathname: '/some/other/path',
      href: 'https://company.atlassian.net/some/other/path',
      search: '',
    };

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBeNull();
  });

  it('should handle case-insensitive project keys', () => {
    // @ts-expect-error - mocking location
    window.location = {
      pathname: '/jira/software/c/projects/abc/boards/1',
      href: 'https://company.atlassian.net/jira/software/c/projects/abc/boards/1',
      search: '',
    };

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('abc');
  });

  it('should prefer query parameter over pathname', () => {
    // @ts-expect-error - mocking location
    window.location = {
      pathname: '/jira/software/c/projects/MP/boards/138',
      href: 'https://company.atlassian.net/jira/software/c/projects/MP/boards/138?projectKey=PN',
      search: '?projectKey=PN',
    };

    // Mock URLSearchParams
    const originalURLSearchParams = window.URLSearchParams;
    // @ts-expect-error - mocking URLSearchParams
    window.URLSearchParams = class {
      constructor(search: string) {
        this.search = search;
      }
      get(key: string) {
        const params = new Map();
        this.search
          .substring(1)
          .split('&')
          .forEach(param => {
            const [k, v] = param.split('=');
            params.set(k, v);
          });
        return params.get(key);
      }
    };

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('PN');

    window.URLSearchParams = originalURLSearchParams;
  });
});

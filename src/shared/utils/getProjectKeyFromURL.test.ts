import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getProjectKeyFromURL } from './getProjectKeyFromURL';

class MockURLSearchParams {
  private searchStr: string;

  constructor(search: string) {
    this.searchStr = search;
  }

  get(key: string) {
    const params = new Map<string, string>();
    this.searchStr
      .substring(1)
      .split('&')
      .forEach((param: string) => {
        const [k, v] = param.split('=');
        if (k && v) params.set(k, v);
      });
    return params.get(key) ?? null;
  }
}

describe('getProjectKeyFromURL', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should extract project key from new URL format', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/jira/software/c/projects/MP/boards/138',
        href: 'https://company.atlassian.net/jira/software/c/projects/MP/boards/138',
        search: '',
      },
      writable: true,
    });

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('MP');
  });

  it('should extract project key from old URL format query parameter', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/secure/RapidBoard.jspa',
        href: 'https://company.atlassian.net/secure/RapidBoard.jspa?projectKey=PN&rapidView=12',
        search: '?projectKey=PN&rapidView=12',
      },
      writable: true,
    });

    const originalURLSearchParams = window.URLSearchParams;
    Object.defineProperty(window, 'URLSearchParams', {
      value: MockURLSearchParams,
      writable: true,
    });

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('PN');

    Object.defineProperty(window, 'URLSearchParams', {
      value: originalURLSearchParams,
      writable: true,
    });
  });

  it('should handle URL with multiple path segments', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/jira/software/c/projects/DEV/boards/42/reports/control-chart',
        href: 'https://company.atlassian.net/jira/software/c/projects/DEV/boards/42/reports/control-chart',
        search: '',
      },
      writable: true,
    });

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('DEV');
  });

  it('should return null when project key not found in URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/some/other/path',
        href: 'https://company.atlassian.net/some/other/path',
        search: '',
      },
      writable: true,
    });

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBeNull();
  });

  it('should handle case-insensitive project keys', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/jira/software/c/projects/abc/boards/1',
        href: 'https://company.atlassian.net/jira/software/c/projects/abc/boards/1',
        search: '',
      },
      writable: true,
    });

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('abc');
  });

  it('should prefer query parameter over pathname', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/jira/software/c/projects/MP/boards/138',
        href: 'https://company.atlassian.net/jira/software/c/projects/MP/boards/138?projectKey=PN',
        search: '?projectKey=PN',
      },
      writable: true,
    });

    const originalURLSearchParams = window.URLSearchParams;
    Object.defineProperty(window, 'URLSearchParams', {
      value: MockURLSearchParams,
      writable: true,
    });

    const projectKey = getProjectKeyFromURL();

    expect(projectKey).toBe('PN');

    Object.defineProperty(window, 'URLSearchParams', {
      value: originalURLSearchParams,
      writable: true,
    });
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { globalContainer } from 'dioma';
import { registerRoutingServiceInDI, routingServiceToken } from 'src/routing';
import { registerExtensionApiServiceInDI } from 'src/shared/ExtensionApiService';

describe('RoutingService.getProjectKeyFromURL', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    globalContainer.reset();
    registerExtensionApiServiceInDI(globalContainer);
    registerRoutingServiceInDI(globalContainer);
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

  const getProjectKeyFromURL = () => globalContainer.inject(routingServiceToken).getProjectKeyFromURL();

  it('should extract project key from new URL format', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/jira/software/c/projects/MP/boards/138',
        href: 'https://company.atlassian.net/jira/software/c/projects/MP/boards/138',
        search: '',
      },
      writable: true,
    });

    expect(getProjectKeyFromURL()).toBe('MP');
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

    expect(getProjectKeyFromURL()).toBe('PN');
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

    expect(getProjectKeyFromURL()).toBe('DEV');
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

    expect(getProjectKeyFromURL()).toBeNull();
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

    expect(getProjectKeyFromURL()).toBe('abc');
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

    expect(getProjectKeyFromURL()).toBe('PN');
  });
});

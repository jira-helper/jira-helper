/* eslint-disable @typescript-eslint/no-unused-vars -- Legacy Jira Cloud server API adapter logs fallback paths. */
import type { Container } from 'dioma';
import { boardPagePageObjectToken } from '../../../infrastructure/page-objects/BoardPage';
import { Ok, Err } from 'ts-results';
import {
  getBoardPropertyToken,
  getBoardEditDataToken,
  updateBoardPropertyToken,
  deleteBoardPropertyToken,
  searchUsersToken,
  buildAvatarUrlToken,
  getProjectIssueTypesToken,
} from '../../../infrastructure/di/jiraApiTokens';
import type { JiraUser } from '../../../infrastructure/jira/jiraApi';
import { getBoardEditDataCloud, getProjectIssueTypesCloud, searchUsersCloud } from '../jiraApi.cloud';
import type { CloudJiraUser } from '../jiraApi.cloud';
import { SettingsStorage } from '../SettingsStorage';
import { getBoardPropertyFromApi } from './boardPropertyApi.cloud';
import { findCloudAvatarUrlFromDom } from './findCloudAvatarUrlFromDom';

export function registerServerApiCloudAdapters(container: Container): void {
  const boardPage = container.inject(boardPagePageObjectToken);
  const storage = new SettingsStorage(boardPage as any);

  container.register({
    token: getBoardPropertyToken,
    value: async <T>(_boardId: string, property: string, _options?: any): Promise<T | undefined> =>
      getBoardPropertyFromApi<T>({
        property,
        fetchFromApi: () => storage.get<any>(property),
      }),
  });

  container.register({
    token: getBoardEditDataToken,
    value: (_boardId: string, options?: { abortPromise?: Promise<void> }) =>
      getBoardEditDataCloud(boardPage as any, options?.abortPromise),
  });

  container.register({
    token: updateBoardPropertyToken,
    value: async (_boardId: string, property: string, value: any, _options?: any) => {
      await storage.set(property, value);
    },
  });

  container.register({
    token: deleteBoardPropertyToken,
    value: async (_boardId: string, property: string, _options?: any) => {
      await storage.delete(property);
    },
  });

  container.register({
    token: searchUsersToken,
    value: async (query: string): Promise<JiraUser[]> => {
      const users = await searchUsersCloud(query, boardPage as any);
      return users.map((u: CloudJiraUser) => ({
        name: u.accountId ?? u.displayName,
        displayName: u.displayName,
        avatarUrls: u.avatarUrls ?? {},
        self: '',
      }));
    },
  });

  container.register({
    token: getProjectIssueTypesToken,
    value: async (projectKey: string) => {
      try {
        const types = await getProjectIssueTypesCloud(projectKey);
        return Ok(types);
      } catch (error) {
        return Err(error instanceof Error ? error : new Error(String(error)));
      }
    },
  });

  const serverBuildAvatarUrl = container.inject(buildAvatarUrlToken);
  const avatarCache = new Map<string, string>();
  container.register({
    token: buildAvatarUrlToken,
    value: (username: string): string => {
      const cached = avatarCache.get(username);
      if (cached) return cached;

      const foundUrl = findCloudAvatarUrlFromDom(username);

      if (foundUrl) {
        avatarCache.set(username, foundUrl);
        return foundUrl;
      }

      return serverBuildAvatarUrl(username);
    },
  });
}

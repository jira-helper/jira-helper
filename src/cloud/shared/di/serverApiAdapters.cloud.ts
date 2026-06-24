import type { Container } from 'dioma';
import { boardPagePageObjectToken } from '../../../infrastructure/page-objects/BoardPage';
import {
  getBoardPropertyToken,
  getBoardEditDataToken,
  updateBoardPropertyToken,
  deleteBoardPropertyToken,
  searchUsersToken,
  buildAvatarUrlToken,
} from '../../../infrastructure/di/jiraApiTokens';
import type { JiraUser } from '../../../infrastructure/jira/jiraApi';
import { getBoardEditDataCloud, searchUsersCloud } from '../jiraApi.cloud';
import type { CloudJiraUser } from '../jiraApi.cloud';
import { SettingsStorage } from '../SettingsStorage';

const LS_PREFIX = 'jh-prop-';

export function registerServerApiCloudAdapters(container: Container): void {
  const boardPage = container.inject(boardPagePageObjectToken);
  const storage = new SettingsStorage(boardPage as any);

  container.register({
    token: getBoardPropertyToken,
    value: async <T>(_boardId: string, property: string, _options?: any): Promise<T | undefined> => {
      console.log(`[CloudAdapter:getBoardProperty] property="${property}"`);

      const local = localStorage.getItem(`${LS_PREFIX}${property}`);
      if (local) {
        try {
          const parsed = JSON.parse(local) as T;
          const isEmpty =
            typeof parsed === 'object' &&
            !Array.isArray(parsed) &&
            parsed !== null &&
            Object.keys(parsed as object).length === 0;
          if (!isEmpty) {
            console.log('[CloudAdapter:getBoardProperty] from localStorage cache');
            return parsed;
          }
          console.log('[CloudAdapter:getBoardProperty] localStorage cache is empty, proceeding to API');
        } catch {
          console.log('[CloudAdapter:getBoardProperty] localStorage cache parse failed');
        }
      }

      let api = await storage.get<any>(property);
      console.log('[CloudAdapter:getBoardProperty] storage.get returned:', api === null ? 'null' : typeof api);

      if (api !== null) {
        if (typeof api === 'object' && 'value' in api) {
          console.log('[CloudAdapter:getBoardProperty] unwrapping value wrapper');
          api = api.value as T;
        }
        localStorage.setItem(`${LS_PREFIX}${property}`, JSON.stringify(api));
        console.log('[CloudAdapter:getBoardProperty] cached in localStorage');
      }

      const result = api ?? undefined;
      console.log(
        '[CloudAdapter:getBoardProperty] returning:',
        result === undefined ? 'undefined' : JSON.stringify(result).substring(0, 100)
      );
      return result;
    },
  });

  container.register({
    token: getBoardEditDataToken,
    value: (_boardId: string, options?: { abortPromise?: Promise<void> }) =>
      getBoardEditDataCloud(boardPage as any, options?.abortPromise),
  });

  container.register({
    token: updateBoardPropertyToken,
    value: async (_boardId: string, property: string, value: any, _options?: any) => {
      localStorage.setItem(`${LS_PREFIX}${property}`, JSON.stringify(value));
      await storage.set(property, value);
    },
  });

  container.register({
    token: deleteBoardPropertyToken,
    value: async (_boardId: string, property: string, _options?: any) => {
      localStorage.removeItem(`${LS_PREFIX}${property}`);
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

  const serverBuildAvatarUrl = container.inject(buildAvatarUrlToken);
  const avatarCache = new Map<string, string>();
  container.register({
    token: buildAvatarUrlToken,
    value: (username: string): string => {
      const cached = avatarCache.get(username);
      if (cached) return cached;

      let foundUrl: string | null = null;
      try {
        const cards = document.querySelectorAll<HTMLElement>('[data-testid="platform-board-kit.ui.card.card"]');
        for (const card of Array.from(cards)) {
          const hidden = card.querySelectorAll('[hidden], [aria-hidden="true"]');
          let found = false;
          for (const el of Array.from(hidden)) {
            const text = el.textContent?.trim() || '';
            const match = text.match(/^(?:Исполнитель|Assignee):\s*(.+)$/i);
            if (match && match[1].trim().toLowerCase() === username.toLowerCase()) {
              found = true;
              break;
            }
          }
          if (!found) continue;
          const avatarImg = card.querySelector<HTMLImageElement>(
            '[data-testid="software-board.common.fields.assignee-field-static.avatar-wrapper"] img'
          );
          if (avatarImg?.src) { foundUrl = avatarImg.src; break; }
          const gravatar = card.querySelector<HTMLImageElement>('img[src*="gravatar.com"]');
          if (gravatar?.src) { foundUrl = gravatar.src; break; }
          const anyAvatar = card.querySelector<HTMLImageElement>('img[src*="avatar"]');
          if (anyAvatar?.src) { foundUrl = anyAvatar.src; break; }
        }
      } catch {}

      if (foundUrl) {
        avatarCache.set(username, foundUrl);
        return foundUrl;
      }

      const fallbackUrl = serverBuildAvatarUrl(username);
      if (fallbackUrl) avatarCache.set(username, fallbackUrl);
      return fallbackUrl;
    },
  });
}

// src/cloud/shared/jiraApi.cloud.ts
// Cloud API адаптеры для Jira Cloud

import type { IBoardPagePageObject } from './BoardPagePageObject';

export interface CloudBoardEditData {
  canEdit?: boolean;
  rapidListConfig?: {
    currentStatisticsField?: {
      typeId?: string;
    };
    mappedColumns?: Array<{
      id: string;
      name: string;
      isKanPlanColumn?: boolean;
    }>;
  };
  swimlanesConfig?: {
    swimlanes?: Array<{
      id?: string;
      name: string;
    }>;
  };
}

export interface CloudJiraUser {
  accountId: string;
  displayName: string;
  avatarUrls?: {
    '48x48': string;
    '32x32': string;
    '24x24': string;
    '16x16': string;
  };
}

/**
 * Получает данные доски для Cloud
 * Использует agile/1.0/board/{id}/configuration вместо greenhopper endpoint
 */
export const getBoardEditDataCloud = async (
  boardPage: IBoardPagePageObject,
  abortPromise?: Promise<void>
): Promise<CloudBoardEditData> => {
  const boardId = boardPage.getBoardId();
  if (!boardId) {
    return {};
  }

  const url = `/rest/agile/1.0/board/${boardId}/configuration`;

  try {
    const fetchPromise = fetch(url, {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = abortPromise
      ? await Promise.race([fetchPromise, abortPromise.then(() => null as Response | null)])
      : await fetchPromise;

    if (!response || !response.ok) {
      if (response) {
        console.warn('[getBoardEditDataCloud] Failed to fetch board config:', response.status);
      }
      return { canEdit: false };
    }

    const data = await response.json();

    const apiColumns = data.columnConfig?.columns ?? [];
    const domColumnSelectors = [
      '[data-testid="platform-board-kit.ui.column.draggable-column"]',
      '[data-testid="platform-board-kit.ui.column.column-container"]',
      '[data-testid*="column"]',
    ];

    let domColumnElements: Element[] = [];
    for (const sel of domColumnSelectors) {
      domColumnElements = Array.from(document.querySelectorAll(sel));
      if (domColumnElements.length > 0) break;
    }

    const mappedColumns: Array<{ id: string; name: string }> = apiColumns.map((col: any, index: number) => {
      const domEl = domColumnElements[index];
      const domId = domEl?.getAttribute('data-column-id') || domEl?.getAttribute('data-id');
      const statusId = col.statuses?.[0]?.id;
      const id = domId || String(statusId ?? col.name);
      return { id, name: col.name };
    });

    if (mappedColumns.length > 0) {
      console.log('[getBoardEditDataCloud] Cached columns:', mappedColumns.map(c => `${c.id}=${c.name}`));
      boardPage.setCachedColumns?.(mappedColumns);
    }

    const mappedPositions = data.columnConfig?.columns?.map((col: any, index: number) => ({
      id: `column-${index}`,
      name: col.name,
      isKanPlanColumn: false,
    })) ?? [];

    console.log('[getBoardEditDataCloud] Using positional column IDs:', mappedPositions.map((c: { id: string; name: string }) => `${c.id}=${c.name}`));

    return {
      canEdit: data.editEnabled ?? true,
      rapidListConfig: {
        currentStatisticsField: {
          typeId: data.statistics?.typeId ?? 'none',
        },
        mappedColumns: mappedPositions,
      },
      swimlanesConfig: {
        swimlanes: data.swimlaneConfig?.swimlanes?.map((sw: any) => ({
          id: String(sw.id ?? sw.name),
          name: sw.name,
        })) ?? [],
      },
    };
  } catch (error) {
    console.error('[getBoardEditDataCloud] Error:', error);
    return { canEdit: false };
  }
};

/**
 * Поиск пользователей в Cloud
 * Использует accountId вместо username
 */
export const searchUsersCloud = async (
  query: string,
  boardPage: IBoardPagePageObject
): Promise<CloudJiraUser[]> => {
  if (!query || query.length < 1) {
    return [];
  }

  const url = `/rest/api/2/user/search?query=${encodeURIComponent(query)}&maxResults=10`;

  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('[searchUsersCloud] Failed to search users:', response.status);
      return [];
    }

    const users = await response.json();
    return users.map((user: any) => ({
      accountId: user.accountId ?? user.name,
      displayName: user.displayName ?? user.name ?? 'Unknown',
      avatarUrls: user.avatarUrls,
    }));
  } catch (error) {
    console.error('[searchUsersCloud] Error:', error);
    return [];
  }
};

/**
 * Построение URL аватара для Cloud
 * Использует avatarUrls из API или строит URL по accountId
 */
export const buildAvatarUrlCloud = (
  user: { accountId?: string; avatarUrls?: Record<string, string> },
  size: '48x48' | '32x32' | '24x24' | '16x16' = '48x48'
): string => {
  if (user.avatarUrls?.[size]) {
    return user.avatarUrls[size];
  }

  // Fallback: Jira Cloud avatar URL pattern
  if (user.accountId) {
    return `/jira/avatars/users/${user.accountId}?size=${size}`;
  }

  return '';
};

/**
 * Получение данных board properties для Cloud
 */
export const getBoardPropertyCloud = async <T>(
  boardPage: IBoardPagePageObject,
  key: string
): Promise<T | undefined> => {
  const boardId = boardPage.getBoardId();
  if (!boardId) {
    return undefined;
  }

  const url = `/rest/agile/1.0/board/${boardId}/properties/${key}`;

  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    return data.value as T;
  } catch (error) {
    console.error('[getBoardPropertyCloud] Error:', error);
    return undefined;
  }
};

/**
 * Сохранение данных board properties для Cloud
 */
export const updateBoardPropertyCloud = async (
  boardPage: IBoardPagePageObject,
  key: string,
  value: unknown
): Promise<boolean> => {
  const boardId = boardPage.getBoardId();
  if (!boardId) {
    return false;
  }

  const url = `/rest/agile/1.0/board/${boardId}/properties/${key}`;

  try {
    const body = JSON.stringify({ value });
    console.log(`[updateBoardPropertyCloud] PUT ${url}`, JSON.parse(body));

    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    console.log(`[updateBoardPropertyCloud] Response: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[updateBoardPropertyCloud] Failed: ${response.status}`, text);
    }
    return response.ok;
  } catch (error) {
    console.error('[updateBoardPropertyCloud] Error:', error);
    return false;
  }
};

/**
 * Удаление данных board properties для Cloud
 */
export const deleteBoardPropertyCloud = async (
  boardPage: IBoardPagePageObject,
  key: string
): Promise<boolean> => {
  const boardId = boardPage.getBoardId();
  if (!boardId) {
    return false;
  }

  const url = `/rest/agile/1.0/board/${boardId}/properties/${key}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'same-origin',
    });

    return response.status === 204 || response.ok;
  } catch (error) {
    console.error('[deleteBoardPropertyCloud] Error:', error);
    return false;
  }
};
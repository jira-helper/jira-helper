/* eslint-disable no-console, @typescript-eslint/no-unused-vars -- Legacy Jira Cloud API adapter logs network and DOM fallback diagnostics. */
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
    swimlaneStrategy?: string;
    swimlanes?: Array<{
      id?: string;
      name: string;
    }>;
  };
}

type AllDataResponse = {
  columnsData?: {
    columns?: Array<{ id: string | number; name: string; statusIds?: string[] }>;
  };
  swimlanesData?: {
    customSwimlanesData?: {
      swimlanes?: Array<{ id: string | number; name: string; issueIds?: number[] }>;
    };
    swimlanes?: Array<{ id: string | number; name: string; issueIds?: number[] }>;
  };
  issuesData?: {
    issues?: Array<{
      id: number;
      key?: string;
      statusId: string;
      typeName?: string;
      assigneeAccountId?: string;
      assigneeName?: string;
    }>;
  };
};

function parseAllDataWorkData(data: AllDataResponse) {
  const columns =
    data.columnsData?.columns?.map(col => ({
      id: String(col.id),
      name: col.name,
      statusIds: (col.statusIds ?? []).map(String),
    })) ?? [];

  const rawSwimlanes = data.swimlanesData?.customSwimlanesData?.swimlanes ?? data.swimlanesData?.swimlanes ?? [];

  const swimlanes = rawSwimlanes.map(sw => ({
    id: String(sw.id),
    name: sw.name,
    issueIds: sw.issueIds ?? [],
  }));

  const issues =
    data.issuesData?.issues?.map(issue => {
      const parsed: {
        id: number;
        statusId: string;
        typeName?: string;
        key?: string;
        assigneeAccountId?: string;
        assigneeName?: string;
      } = {
        id: issue.id,
        statusId: String(issue.statusId),
        typeName: issue.typeName,
      };
      if (issue.key) parsed.key = issue.key;
      if (issue.assigneeAccountId) parsed.assigneeAccountId = issue.assigneeAccountId;
      if (issue.assigneeName) parsed.assigneeName = issue.assigneeName;
      return parsed;
    }) ?? [];

  if (columns.length === 0 && swimlanes.length === 0 && issues.length === 0) {
    return null;
  }

  return { columns, swimlanes, issues };
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
 * Получает данные доски для Cloud через greenhopper editmodel (как Server).
 * Исключает KanPlan-колонки и колонки без mappedStatuses — они не рендерятся на борде.
 */
export const getBoardEditDataCloud = async (
  boardPage: IBoardPagePageObject,
  abortPromise?: Promise<void>
): Promise<CloudBoardEditData> => {
  const boardId = boardPage.getBoardId();
  if (!boardId) {
    return {};
  }

  const url = `/rest/greenhopper/1.0/rapidviewconfig/editmodel.json?rapidViewId=${boardId}`;

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
        console.warn('[getBoardEditDataCloud] Failed to fetch board editmodel:', response.status);
      }
      return { canEdit: false };
    }

    const data = await response.json();
    const rawColumns = data.rapidListConfig?.mappedColumns ?? [];

    const visibleColumns = rawColumns.filter(
      (col: { isKanPlanColumn?: boolean; mappedStatuses?: Array<{ id: string | number }> }) =>
        col.isKanPlanColumn !== true && (col.mappedStatuses?.length ?? 0) > 0
    );

    const mappedColumns = visibleColumns.map(
      (col: { id: number | string; name: string; isKanPlanColumn?: boolean }) => ({
        id: String(col.id),
        name: col.name,
        isKanPlanColumn: col.isKanPlanColumn ?? false,
      })
    );

    const cacheColumns = visibleColumns.map(
      (col: { id: number | string; name: string; mappedStatuses?: Array<{ id: string | number }> }) => ({
        id: String(col.id),
        name: col.name,
        statusIds: (col.mappedStatuses ?? []).map((s: { id: string | number }) => String(s.id)),
      })
    );

    const editmodelSwimlanes =
      data.swimlanesConfig?.swimlanes?.map((sw: { id?: string | number; name: string }) => ({
        id: String(sw.id ?? sw.name),
        name: sw.name,
      })) ?? [];

    if (cacheColumns.length > 0) {
      console.log(
        '[getBoardEditDataCloud] Cached visible columns:',
        cacheColumns.map((c: { id: string; name: string }) => `${c.id}=${c.name}`)
      );
      boardPage.setCachedColumns?.(cacheColumns);
    }

    if (editmodelSwimlanes.length > 0) {
      boardPage.setSwimlanesCache?.(editmodelSwimlanes);
    }

    const allDataUrl = `/rest/greenhopper/1.0/xboard/work/allData.json?rapidViewId=${boardId}`;
    try {
      const allDataFetch = fetch(allDataUrl, {
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const allDataResponse = abortPromise
        ? await Promise.race([allDataFetch, abortPromise.then(() => null as Response | null)])
        : await allDataFetch;

      if (allDataResponse?.ok) {
        const allData = (await allDataResponse.json()) as AllDataResponse;
        const workData = parseAllDataWorkData(allData);
        if (workData) {
          const mergedColumns = cacheColumns.length > 0 ? cacheColumns : workData.columns;
          const columnsWithStatusIds = mergedColumns.map((col: { id: string; name: string; statusIds?: string[] }) => {
            const fromAllData = workData.columns.find(c => c.id === col.id);
            const statusIds = col.statusIds?.length
              ? col.statusIds
              : fromAllData?.statusIds?.length
                ? fromAllData.statusIds
                : [];
            return { ...col, statusIds };
          });

          boardPage.setBoardWorkData?.({
            columns: columnsWithStatusIds,
            swimlanes: workData.swimlanes,
            issues: workData.issues,
          });
        }
      } else if (allDataResponse) {
        console.warn('[getBoardEditDataCloud] Failed to fetch allData:', allDataResponse.status);
      }
    } catch (allDataError) {
      console.warn('[getBoardEditDataCloud] allData fetch error:', allDataError);
    }

    return {
      canEdit: data.canEdit ?? true,
      rapidListConfig: {
        currentStatisticsField: data.rapidListConfig?.currentStatisticsField,
        mappedColumns,
      },
      swimlanesConfig: data.swimlanesConfig
        ? {
            swimlaneStrategy: data.swimlanesConfig.swimlaneStrategy,
            swimlanes: editmodelSwimlanes,
          }
        : undefined,
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
export type CloudProjectIssueType = {
  id: string;
  name: string;
  subtask: boolean;
};

/**
 * Issue types for a project key — used by person/column limit settings pickers.
 * Cloud REST: GET /rest/api/2/project/{projectKey}
 */
export const getProjectIssueTypesCloud = async (projectKey: string): Promise<CloudProjectIssueType[]> => {
  const key = projectKey.trim();
  if (!key) return [];

  const url = `/rest/api/2/project/${encodeURIComponent(key)}`;
  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      console.warn('[getProjectIssueTypesCloud] Failed:', response.status, key);
      return [];
    }
    const data = (await response.json()) as { issueTypes?: Array<{ id?: string; name?: string; subtask?: boolean }> };
    return (data.issueTypes ?? []).map(type => ({
      id: String(type.id ?? ''),
      name: type.name ?? '',
      subtask: Boolean(type.subtask),
    }));
  } catch (error) {
    console.error('[getProjectIssueTypesCloud] Error:', error);
    return [];
  }
};

export const searchUsersCloud = async (query: string, boardPage: IBoardPagePageObject): Promise<CloudJiraUser[]> => {
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
export const deleteBoardPropertyCloud = async (boardPage: IBoardPagePageObject, key: string): Promise<boolean> => {
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

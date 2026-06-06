import type { Container } from 'dioma';
import { boardPagePageObjectToken } from '../../../infrastructure/page-objects/BoardPage';
import {
  getBoardPropertyToken,
  getBoardEditDataToken,
  updateBoardPropertyToken,
  deleteBoardPropertyToken,
} from '../../../infrastructure/di/jiraApiTokens';
import { getBoardEditDataCloud } from '../jiraApi.cloud';
import { SettingsStorage } from '../SettingsStorage';
import type { WipLimitsProperty } from '../../../features/column-limits-module/types';
import { BOARD_PROPERTIES } from '../../../shared/constants';

const LS_PREFIX = 'jh-prop-';

function getBoardColumns(boardPage: any): Array<{ id: string; name: string }> {
  return boardPage.getOrderedColumns() || [];
}

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
          const isEmpty = typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null && Object.keys(parsed as object).length === 0;
          if (!isEmpty) {
            console.log(`[CloudAdapter:getBoardProperty] from localStorage cache`);
            return parsed;
          }
          console.log(`[CloudAdapter:getBoardProperty] localStorage cache is empty, proceeding to API`);
        } catch {
          console.log(`[CloudAdapter:getBoardProperty] localStorage cache parse failed`);
        }
      }

      let api = await storage.get<any>(property);
      console.log(`[CloudAdapter:getBoardProperty] storage.get returned:`, api === null ? 'null' : typeof api);

      if (api !== null) {
        if (typeof api === 'object' && 'value' in api) {
          console.log(`[CloudAdapter:getBoardProperty] unwrapping value wrapper`);
          api = api.value as T;
        }
        localStorage.setItem(`${LS_PREFIX}${property}`, JSON.stringify(api));
        console.log(`[CloudAdapter:getBoardProperty] cached in localStorage`);
      }

      const result = api ?? undefined;
      console.log(`[CloudAdapter:getBoardProperty] returning:`, result === undefined ? 'undefined' : JSON.stringify(result).substring(0, 100));
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
}

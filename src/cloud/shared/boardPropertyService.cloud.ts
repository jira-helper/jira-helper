// src/cloud/shared/boardPropertyService.cloud.ts
// BoardPropertyService для Jira Cloud

import type { IBoardPagePageObject } from './BoardPagePageObject';
import {
  getBoardPropertyCloud,
  updateBoardPropertyCloud,
  deleteBoardPropertyCloud,
} from './jiraApi.cloud';

export interface BoardPropertyServiceI {
  getBoardProperty<T>(property: string): Promise<T | undefined>;
  updateBoardProperty<T>(property: string, value: T): Promise<boolean>;
  deleteBoardProperty(property: string): Promise<boolean>;
}

export const createBoardPropertyServiceCloud = (
  boardPage: IBoardPagePageObject
): BoardPropertyServiceI => ({
  async getBoardProperty<T>(property: string): Promise<T | undefined> {
    return getBoardPropertyCloud<T>(boardPage, property);
  },

  async updateBoardProperty<T>(property: string, value: T): Promise<boolean> {
    return updateBoardPropertyCloud(boardPage, property, value);
  },

  async deleteBoardProperty(property: string): Promise<boolean> {
    return deleteBoardPropertyCloud(boardPage, property);
  },
});
// src/cloud/shared/di/jiraApiTokens.cloud.ts
// DI-токены для Cloud API адаптеров

import { Token, Container } from 'dioma';
import type { IBoardPagePageObject } from '../BoardPagePageObject';
import type { CloudBoardEditData, CloudJiraUser } from '../jiraApi.cloud';
import {
  getBoardEditDataCloud,
  searchUsersCloud,
  buildAvatarUrlCloud,
  getBoardPropertyCloud,
  updateBoardPropertyCloud,
  deleteBoardPropertyCloud,
} from '../jiraApi.cloud';

export type GetBoardEditDataCloud = (
  boardPage: IBoardPagePageObject,
  abortPromise?: Promise<void>
) => Promise<CloudBoardEditData>;

export type SearchUsersCloud = (query: string, boardPage: IBoardPagePageObject) => Promise<CloudJiraUser[]>;

export type BuildAvatarUrlCloud = (
  user: { accountId?: string; avatarUrls?: Record<string, string> },
  size?: '48x48' | '32x32' | '24x24' | '16x16'
) => string;

export type GetBoardPropertyCloud = <T>(boardPage: IBoardPagePageObject, key: string) => Promise<T | undefined>;

export type UpdateBoardPropertyCloud = (
  boardPage: IBoardPagePageObject,
  key: string,
  value: unknown
) => Promise<boolean>;

export type DeleteBoardPropertyCloud = (boardPage: IBoardPagePageObject, key: string) => Promise<boolean>;

export const getBoardEditDataCloudToken = new Token<GetBoardEditDataCloud>('getBoardEditDataCloud');
export const searchUsersCloudToken = new Token<SearchUsersCloud>('searchUsersCloud');
export const buildAvatarUrlCloudToken = new Token<BuildAvatarUrlCloud>('buildAvatarUrlCloud');
export const getBoardPropertyCloudToken = new Token<GetBoardPropertyCloud>('getBoardPropertyCloud');
export const updateBoardPropertyCloudToken = new Token<UpdateBoardPropertyCloud>('updateBoardPropertyCloud');
export const deleteBoardPropertyCloudToken = new Token<DeleteBoardPropertyCloud>('deleteBoardPropertyCloud');

export const registerJiraApiCloudInDI = (container: Container): void => {
  container.register({ token: getBoardEditDataCloudToken, value: getBoardEditDataCloud });
  container.register({ token: searchUsersCloudToken, value: searchUsersCloud });
  container.register({ token: buildAvatarUrlCloudToken, value: buildAvatarUrlCloud });
  container.register({ token: getBoardPropertyCloudToken, value: getBoardPropertyCloud });
  container.register({ token: updateBoardPropertyCloudToken, value: updateBoardPropertyCloud });
  container.register({ token: deleteBoardPropertyCloudToken, value: deleteBoardPropertyCloud });
};
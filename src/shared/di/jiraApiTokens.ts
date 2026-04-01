import { Token, Container } from 'dioma';
import {
  updateBoardProperty,
  getBoardProperty,
  deleteBoardProperty,
  getBoardEditData,
  searchUsers,
  getProjectIssueTypes,
  loadFlaggedIssues,
  loadNewIssueViewEnabled,
} from 'src/shared/jiraApi';
import type { JiraUser, ProjectIssueType } from 'src/shared/jiraApi';
import type { Result } from 'ts-results';
import { buildAvatarUrl } from 'src/shared/utils/avatarUrl';

export type UpdateBoardProperty = typeof updateBoardProperty;
export const updateBoardPropertyToken = new Token<UpdateBoardProperty>('updateBoardProperty');

export type GetBoardProperty = typeof getBoardProperty;
export const getBoardPropertyToken = new Token<GetBoardProperty>('getBoardProperty');

export type DeleteBoardProperty = typeof deleteBoardProperty;
export const deleteBoardPropertyToken = new Token<DeleteBoardProperty>('deleteBoardProperty');

export type GetBoardEditData = typeof getBoardEditData;
export const getBoardEditDataToken = new Token<GetBoardEditData>('getBoardEditData');

export type SearchUsers = (query: string) => Promise<JiraUser[]>;
export const searchUsersToken = new Token<SearchUsers>('searchUsers');

export type GetProjectIssueTypes = (projectKey: string) => Promise<Result<ProjectIssueType[], Error>>;
export const getProjectIssueTypesToken = new Token<GetProjectIssueTypes>('getProjectIssueTypes');

export type LoadFlaggedIssues = typeof loadFlaggedIssues;
export const loadFlaggedIssuesToken = new Token<LoadFlaggedIssues>('loadFlaggedIssues');

export type LoadNewIssueViewEnabled = typeof loadNewIssueViewEnabled;
export const loadNewIssueViewEnabledToken = new Token<LoadNewIssueViewEnabled>('loadNewIssueViewEnabled');

export type BuildAvatarUrl = typeof buildAvatarUrl;
export const buildAvatarUrlToken = new Token<BuildAvatarUrl>('buildAvatarUrl');

export const registerJiraApiInDI = (container: Container) => {
  container.register({ token: updateBoardPropertyToken, value: updateBoardProperty });
  container.register({ token: getBoardPropertyToken, value: getBoardProperty });
  container.register({ token: deleteBoardPropertyToken, value: deleteBoardProperty });
  container.register({ token: getBoardEditDataToken, value: getBoardEditData });
  container.register({ token: searchUsersToken, value: searchUsers });
  container.register({ token: getProjectIssueTypesToken, value: getProjectIssueTypes });
  container.register({ token: loadFlaggedIssuesToken, value: loadFlaggedIssues });
  container.register({ token: loadNewIssueViewEnabledToken, value: loadNewIssueViewEnabled });
  container.register({ token: buildAvatarUrlToken, value: buildAvatarUrl });
};

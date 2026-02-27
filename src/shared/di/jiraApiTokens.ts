import { Token, Container } from 'dioma';
import { updateBoardProperty, getBoardProperty, searchUsers, getProjectIssueTypes } from 'src/shared/jiraApi';
import type { JiraUser, ProjectIssueType } from 'src/shared/jiraApi';
import type { Result } from 'ts-results';

export type UpdateBoardProperty = typeof updateBoardProperty;
export const updateBoardPropertyToken = new Token<UpdateBoardProperty>('updateBoardProperty');

export type GetBoardProperty = typeof getBoardProperty;
export const getBoardPropertyToken = new Token<GetBoardProperty>('getBoardProperty');

export type SearchUsers = (query: string) => Promise<JiraUser[]>;
export const searchUsersToken = new Token<SearchUsers>('searchUsers');

export type GetProjectIssueTypes = (projectKey: string) => Promise<Result<ProjectIssueType[], Error>>;
export const getProjectIssueTypesToken = new Token<GetProjectIssueTypes>('getProjectIssueTypes');

export const registerJiraApiInDI = (container: Container) => {
  container.register({ token: updateBoardPropertyToken, value: updateBoardProperty });
  container.register({ token: getBoardPropertyToken, value: getBoardProperty });
  container.register({ token: searchUsersToken, value: searchUsers });
  container.register({ token: getProjectIssueTypesToken, value: getProjectIssueTypes });
};

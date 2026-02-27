import { Token, Container } from 'dioma';
import { updateBoardProperty, getBoardProperty, searchUsers } from 'src/shared/jiraApi';
import type { JiraUser } from 'src/shared/jiraApi';

export type UpdateBoardProperty = typeof updateBoardProperty;
export const updateBoardPropertyToken = new Token<UpdateBoardProperty>('updateBoardProperty');

export type GetBoardProperty = typeof getBoardProperty;
export const getBoardPropertyToken = new Token<GetBoardProperty>('getBoardProperty');

export type SearchUsers = (query: string) => Promise<JiraUser[]>;
export const searchUsersToken = new Token<SearchUsers>('searchUsers');

export const registerJiraApiInDI = (container: Container) => {
  container.register({ token: updateBoardPropertyToken, value: updateBoardProperty });
  container.register({ token: getBoardPropertyToken, value: getBoardProperty });
  container.register({ token: searchUsersToken, value: searchUsers });
};

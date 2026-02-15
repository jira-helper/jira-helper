import { Token, Container } from 'dioma';
import { updateBoardProperty } from 'src/shared/jiraApi';

export type UpdateBoardProperty = typeof updateBoardProperty;
export const updateBoardPropertyToken = new Token<UpdateBoardProperty>('updateBoardProperty');

export const registerJiraApiInDI = (container: Container) => {
  container.register({ token: updateBoardPropertyToken, value: updateBoardProperty });
};

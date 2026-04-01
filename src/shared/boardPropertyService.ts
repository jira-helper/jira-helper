import { Container, Token, globalContainer } from 'dioma';
import { routingServiceToken } from 'src/routing';
import { deleteBoardPropertyToken, getBoardPropertyToken, updateBoardPropertyToken } from './di/jiraApiTokens';

export interface BoardPropertyServiceI {
  getBoardProperty<T>(property: string): Promise<T | undefined>;
  updateBoardProperty<T>(property: string, value: T, params: Record<string, any>): void;
  deleteBoardProperty(property: string, params: Record<string, any>): void;
}

export const BoardPropertyServiceToken = new Token<BoardPropertyServiceI>('BoardPropertyService');

/**
 * Service to manage board properties
 */

export const BoardPropertyService = {
  getBoardProperty<T>(property: string): Promise<T | undefined> {
    const boardId = globalContainer.inject(routingServiceToken).getBoardIdFromURL();
    if (!boardId) {
      return Promise.reject(new Error('no board id'));
    }
    return globalContainer.inject(getBoardPropertyToken)<T>(boardId, property);
  },

  updateBoardProperty<T>(property: string, value: T, params: Record<string, any> = {}): void {
    const boardId = globalContainer.inject(routingServiceToken).getBoardIdFromURL();
    if (!boardId) {
      throw new Error('no board id');
    }
    globalContainer.inject(updateBoardPropertyToken)(boardId, property, value, params);
  },

  deleteBoardProperty(property: string, params: Record<string, any> = {}): void {
    const boardId = globalContainer.inject(routingServiceToken).getBoardIdFromURL();
    if (!boardId) {
      throw new Error('no board id');
    }
    globalContainer.inject(deleteBoardPropertyToken)(boardId, property, params);
  },
};

export const registerBoardPropertyServiceInDI = (container: Container) => {
  container.register({ token: BoardPropertyServiceToken, value: BoardPropertyService });
};

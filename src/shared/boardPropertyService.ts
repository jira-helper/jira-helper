import { getBoardIdFromURL } from 'src/routing';
import { Token, globalContainer } from 'dioma';
import { deleteBoardProperty, getBoardProperty, updateBoardProperty } from './jiraApi';

interface BoardPropertyServiceI {
  getBoardProperty<T>(property: string): Promise<T | undefined>;
  updateBoardProperty<T>(property: string, value: T, params: Record<string, any>): void;
  deleteBoardProperty(property: string, params: Record<string, any>): void;
}

export const BoardPropertyServiceToken = new Token<BoardPropertyServiceI>('BoardPropertyService');

/**
 * Service to manage board properties
 */
export class BoardPropertyService {
  static getBoardProperty<T>(property: string): Promise<T | undefined> {
    const boardId = getBoardIdFromURL();
    if (!boardId) {
      return Promise.reject(new Error('no board id'));
    }
    return getBoardProperty<T>(boardId, property);
  }

  static updateBoardProperty<T>(property: string, value: T, params: Record<string, any> = {}): void {
    const boardId = getBoardIdFromURL();
    if (!boardId) {
      throw new Error('no board id');
    }
    updateBoardProperty(boardId, property, value, params);
  }

  static deleteBoardProperty(property: string, params: Record<string, any> = {}): void {
    const boardId = getBoardIdFromURL();
    if (!boardId) {
      throw new Error('no board id');
    }
    deleteBoardProperty(boardId, property, params);
  }
}

globalContainer.register({ token: BoardPropertyServiceToken, value: BoardPropertyService });

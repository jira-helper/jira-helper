import { Token, Container } from 'dioma';
import { getBoardIdFromURL } from 'src/routing';

export type GetBoardIdFromURL = typeof getBoardIdFromURL;
export const getBoardIdFromURLToken = new Token<GetBoardIdFromURL>('getBoardIdFromURL');

export const registerRoutingInDI = (container: Container) => {
  container.register({ token: getBoardIdFromURLToken, value: getBoardIdFromURL });
};

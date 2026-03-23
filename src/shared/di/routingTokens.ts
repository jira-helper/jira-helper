import { Token, Container } from 'dioma';
import { routingServiceToken } from 'src/routing/tokens';

export type GetBoardIdFromURL = () => string | null;
export const getBoardIdFromURLToken = new Token<GetBoardIdFromURL>('getBoardIdFromURL');

export const registerRoutingInDI = (container: Container) => {
  const routingService = container.inject(routingServiceToken);
  container.register({ token: getBoardIdFromURLToken, value: () => routingService.getBoardIdFromURL() });
};

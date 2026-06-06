import { Container, Token } from 'dioma';
import type { ILocalStorageService } from './LocalStorageService';
import { LocalStorageService } from './LocalStorageService';

export const localStorageServiceToken = new Token<ILocalStorageService>('localStorageService');

export const registerLocalStorageServiceInDI = (container: Container) => {
  container.register({ token: localStorageServiceToken, value: new LocalStorageService() });
};

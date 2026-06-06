import { Container } from 'dioma';
import { WipLimitCellsBoardPageObject } from './WipLimitCellsBoardPageObject';
import { wipLimitCellsBoardPageObjectToken } from './wipLimitCellsBoardPageObjectToken';

export { wipLimitCellsBoardPageObjectToken } from './wipLimitCellsBoardPageObjectToken';
export type { IWipLimitCellsBoardPageObject } from './IWipLimitCellsBoardPageObject';
export { WipLimitCellsBoardPageObject } from './WipLimitCellsBoardPageObject';

/**
 * Register WipLimitCellsBoardPageObject in DI container.
 * Call this in BoardPage.apply() before using actions.
 */
export const registerWipLimitCellsBoardPageObjectInDI = (container: Container): void => {
  container.register({
    token: wipLimitCellsBoardPageObjectToken,
    value: WipLimitCellsBoardPageObject,
  });
};

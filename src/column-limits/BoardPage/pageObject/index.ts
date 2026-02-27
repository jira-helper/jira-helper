import { Container } from 'dioma';
import { ColumnLimitsBoardPageObject } from './ColumnLimitsBoardPageObject';
import { columnLimitsBoardPageObjectToken } from './columnLimitsBoardPageObjectToken';

export { columnLimitsBoardPageObjectToken } from './columnLimitsBoardPageObjectToken';
export type { IColumnLimitsBoardPageObject } from './IColumnLimitsBoardPageObject';
export { ColumnLimitsBoardPageObject } from './ColumnLimitsBoardPageObject';

/**
 * Register ColumnLimitsBoardPageObject in DI container.
 * Call this in BoardPage.apply() before using actions.
 */
export const registerColumnLimitsBoardPageObjectInDI = (container: Container): void => {
  container.register({
    token: columnLimitsBoardPageObjectToken,
    factory: () => new ColumnLimitsBoardPageObject(),
  });
};

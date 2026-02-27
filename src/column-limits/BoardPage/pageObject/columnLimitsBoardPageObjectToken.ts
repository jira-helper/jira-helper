import { Token } from 'dioma';
import type { IColumnLimitsBoardPageObject } from './IColumnLimitsBoardPageObject';

/**
 * DI token for ColumnLimitsBoardPageObject.
 *
 * Usage in actions:
 * ```ts
 * const pageObject = this.di.inject(columnLimitsBoardPageObjectToken);
 * ```
 *
 * In tests, mock by registering a fake implementation:
 * ```ts
 * container.register({
 *   token: columnLimitsBoardPageObjectToken,
 *   value: mockPageObject
 * });
 * ```
 */
export const columnLimitsBoardPageObjectToken = new Token<IColumnLimitsBoardPageObject>('columnLimitsBoardPageObject');

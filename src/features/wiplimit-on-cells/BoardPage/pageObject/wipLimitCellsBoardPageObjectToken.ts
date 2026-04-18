import { Token } from 'dioma';
import type { IWipLimitCellsBoardPageObject } from './IWipLimitCellsBoardPageObject';

/**
 * DI token for WipLimitCellsBoardPageObject.
 *
 * Usage in actions:
 * ```ts
 * const pageObject = this.di.inject(wipLimitCellsBoardPageObjectToken);
 * ```
 *
 * In tests, mock by registering a fake implementation:
 * ```ts
 * container.register({
 *   token: wipLimitCellsBoardPageObjectToken,
 *   value: mockPageObject
 * });
 * ```
 */
export const wipLimitCellsBoardPageObjectToken = new Token<IWipLimitCellsBoardPageObject>(
  'wipLimitCellsBoardPageObject'
);

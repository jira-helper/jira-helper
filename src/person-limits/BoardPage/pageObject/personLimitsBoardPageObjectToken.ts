import { Token } from 'dioma';
import type { IPersonLimitsBoardPageObject } from './IPersonLimitsBoardPageObject';

/**
 * DI token for PersonLimitsBoardPageObject.
 *
 * Usage in actions:
 * ```ts
 * const pageObject = this.di.inject(personLimitsBoardPageObjectToken);
 * ```
 *
 * In tests, mock by registering a fake implementation:
 * ```ts
 * container.register({
 *   token: personLimitsBoardPageObjectToken,
 *   value: mockPageObject
 * });
 * ```
 */
export const personLimitsBoardPageObjectToken = new Token<IPersonLimitsBoardPageObject>('personLimitsBoardPageObject');

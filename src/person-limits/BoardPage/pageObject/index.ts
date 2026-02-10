import { Container } from 'dioma';
import { PersonLimitsBoardPageObject } from './PersonLimitsBoardPageObject';
import { personLimitsBoardPageObjectToken } from './personLimitsBoardPageObjectToken';

export { personLimitsBoardPageObjectToken } from './personLimitsBoardPageObjectToken';
export type { IPersonLimitsBoardPageObject } from './IPersonLimitsBoardPageObject';
export { PersonLimitsBoardPageObject } from './PersonLimitsBoardPageObject';

/**
 * Register PersonLimitsBoardPageObject in DI container.
 * Call this in BoardPage.apply() before using actions.
 */
export const registerPersonLimitsBoardPageObjectInDI = (container: Container): void => {
  container.register({
    token: personLimitsBoardPageObjectToken,
    value: PersonLimitsBoardPageObject,
  });
};

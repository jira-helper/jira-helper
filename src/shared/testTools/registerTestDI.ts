import type { Container } from 'dioma';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';

/**
 * Registers common test dependencies: Logger and LocaleProvider.
 * Use after globalContainer.reset() in test setup.
 */
export const registerTestDependencies = (container: Container) => {
  registerLogger(container);
  container.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
};

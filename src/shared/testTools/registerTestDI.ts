import type { Container } from 'dioma';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { registerLogger } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';

/**
 * Registers common test dependencies: Logger, LocaleProvider, and diagnostic module.
 * Use after globalContainer.reset() in test setup.
 */
export const registerTestDependencies = (container: Container) => {
  registerLogger(container);
  container.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
  diagnosticModule.ensure(container);
};

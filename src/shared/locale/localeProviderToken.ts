import { Token } from 'dioma';
import type { ILocaleProvider } from './ILocaleProvider';

/**
 * DI token for ILocaleProvider.
 *
 * Usage in components:
 * ```ts
 * const localeProvider = container.inject(localeProviderToken);
 * const jiraLocale = localeProvider.getJiraLocale();
 * ```
 *
 * In tests:
 * ```ts
 * container.register({
 *   token: localeProviderToken,
 *   value: new MockLocaleProvider('en')
 * });
 * ```
 */
export const localeProviderToken = new Token<ILocaleProvider>('localeProvider');

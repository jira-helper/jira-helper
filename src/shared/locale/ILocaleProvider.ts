/**
 * Interface for locale provider.
 * Allows mocking Jira locale detection in tests.
 */
export interface ILocaleProvider {
  /** Get locale from Jira DOM (meta tag) */
  getJiraLocale(): string | null;
}

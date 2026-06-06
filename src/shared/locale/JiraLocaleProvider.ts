import type { ILocaleProvider } from './ILocaleProvider';

/**
 * Production implementation of ILocaleProvider.
 * Reads locale from Jira's meta tag in DOM.
 */
export class JiraLocaleProvider implements ILocaleProvider {
  getJiraLocale(): string | null {
    return document.querySelector('meta[name="ajs-user-locale"]')?.getAttribute('content') ?? null;
  }
}

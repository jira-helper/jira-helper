import type { ILocaleProvider } from './ILocaleProvider';

/**
 * Mock implementation of ILocaleProvider for tests.
 * Returns a fixed locale value.
 */
export class MockLocaleProvider implements ILocaleProvider {
  constructor(private locale: string | null = 'en') {}

  getJiraLocale(): string | null {
    return this.locale;
  }

  /** Update locale (useful for testing locale changes) */
  setLocale(locale: string | null): void {
    this.locale = locale;
  }
}

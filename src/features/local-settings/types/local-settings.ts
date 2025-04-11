// src/features/global-settings/types/globalSettings.ts
export type Locale = 'auto' | 'ru' | 'en';

export interface LocalSettings {
  locale: Locale;
}

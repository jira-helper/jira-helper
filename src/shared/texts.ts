import { useMemo } from 'react';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { useDi } from './diContext';
import { localeProviderToken } from './locale';

export type Texts<textsKeys extends string = string> = {
  [key in textsKeys]: {
    ru: string;
    en: string;
  };
};

const useGetLocale = (): 'ru' | 'en' => {
  const container = useDi();
  const localeProvider = container.inject(localeProviderToken);
  const settingsLocale = useLocalSettingsStore(state => state.settings.locale);

  if (settingsLocale !== 'auto') {
    return settingsLocale;
  }

  const jiraLocale = localeProvider.getJiraLocale();
  return jiraLocale === 'ru' ? 'ru' : 'en';
};

export const useGetTextsByLocale = <textsKeys extends string>(texts: Texts<textsKeys>): Record<textsKeys, string> => {
  const locale = useGetLocale();

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(texts).map(([key, value]) => [key, (value as { ru: string; en: string })[locale]])
      ) as Record<textsKeys, string>,
    [texts, locale]
  );
};

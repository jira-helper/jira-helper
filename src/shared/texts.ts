import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';

export type Texts<textsKeys extends string = string> = {
  [key in textsKeys]: {
    ru: string;
    en: string;
  };
};

const getJiraLocale = () => {
  const jiraLocale = document.querySelector('meta[name="ajs-user-locale"]')?.getAttribute('content');
  return jiraLocale || null;
};

const useGetLocale = () => {
  const { settings } = useLocalSettingsStore();
  const { locale } = settings;
  if (locale !== 'auto') {
    return locale;
  }

  const jiralocale = getJiraLocale();
  if (jiralocale === 'ru') {
    return 'ru';
  }
  return 'en';
};

export const useGetTextsByLocale = <textsKeys extends string>(texts: Texts<textsKeys>): Record<textsKeys, string> => {
  const locale = useGetLocale();

  // @ts-expect-error
  return Object.fromEntries(
    Object.entries(texts).map(([key, value]) => {
      // @ts-expect-error
      return [key, value[locale]];
    })
  );
};

export const useGetText = <textsKeys extends string>(texts: Texts<textsKeys>, key: textsKeys) => {
  const locale = useGetLocale();

  return texts[key][locale];
};

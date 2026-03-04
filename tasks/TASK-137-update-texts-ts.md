# TASK-137: Обновить texts.ts для использования DI

**Status**: DONE  
**Epic**: [EPIC-13](./EPIC-13-i18n-di-localization.md)  
**Phase**: 1 - Infrastructure  
**Depends on**: TASK-136

---

## Цель

Обновить `src/shared/texts.ts` чтобы использовать `localeProviderToken` для получения Jira локали.

---

## Текущая реализация

```typescript
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
```

---

## Новая реализация

```typescript
import { useDi } from './diContext';
import { localeProviderToken } from './locale';

const useGetLocale = (): 'ru' | 'en' => {
  const container = useDi();
  const localeProvider = container.inject(localeProviderToken);
  const { settings } = useLocalSettingsStore();
  
  if (settings.locale !== 'auto') {
    return settings.locale;
  }

  const jiraLocale = localeProvider.getJiraLocale();
  return jiraLocale === 'ru' ? 'ru' : 'en';
};

export const useGetTextsByLocale = <textsKeys extends string>(
  texts: Texts<textsKeys>
): Record<textsKeys, string> => {
  const locale = useGetLocale();

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(texts).map(([key, value]) => [key, (value as { ru: string; en: string })[locale]])
      ) as Record<textsKeys, string>,
    [texts, locale]
  );
};
```

---

## Изменения

1. Удалить функцию `getJiraLocale()` (перенесена в `JiraLocaleProvider`)
2. Добавить импорт `useDi` и `localeProviderToken`
3. Обновить `useGetLocale` для использования DI
4. Добавить `useMemo` для оптимизации `useGetTextsByLocale`
5. Удалить `useGetText` если не используется (проверить)

---

## Acceptance Criteria

- [ ] `texts.ts` использует `localeProviderToken` через DI
- [ ] Функция `getJiraLocale` удалена из `texts.ts`
- [ ] Добавлена мемоизация в `useGetTextsByLocale`
- [ ] Типы корректны
- [ ] ESLint без ошибок

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- Удалена функция `getJiraLocale()` из texts.ts
- Добавлены импорты: `useMemo`, `useDi`, `localeProviderToken`
- Обновлён `useGetLocale` для использования DI через `localeProviderToken`
- Добавлена мемоизация в `useGetTextsByLocale` через `useMemo`
- Удалён неиспользуемый `useGetText`
- ESLint и TypeScript проверки пройдены
- Примечание: 15 тестов падают до выполнения TASK-138 (регистрация LocaleProvider в тестовых хелперах)

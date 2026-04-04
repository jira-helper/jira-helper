# TASK-138: Зарегистрировать LocaleProvider в контейнерах

**Status**: DONE  
**Epic**: [EPIC-13](./EPIC-13-i18n-di-localization.md)  
**Phase**: 1 - Infrastructure  
**Depends on**: TASK-136, TASK-137

---

## Цель

Зарегистрировать `JiraLocaleProvider` в production контейнере и `MockLocaleProvider` в тестовых хелперах.

---

## Что сделать

### 1. Production регистрация

Найти где регистрируются глобальные зависимости (вероятно в `src/shared/di/` или при инициализации приложения) и добавить:

```typescript
import { localeProviderToken, JiraLocaleProvider } from 'src/shared/locale';

globalContainer.register({
  token: localeProviderToken,
  value: new JiraLocaleProvider(),
});
```

### 2. Тестовые хелперы (Cypress)

В файлах `features/helpers.tsx` для каждой фичи добавить регистрацию `MockLocaleProvider`:

```typescript
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';

// В setupBackground или аналогичной функции:
container.register({
  token: localeProviderToken,
  value: new MockLocaleProvider('en'),
});
```

### 3. Тестовые хелперы (Vitest)

Если есть глобальный setup для vitest тестов, добавить туда регистрацию:

```typescript
import { globalContainer } from 'dioma';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';

beforeAll(() => {
  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });
});
```

---

## Файлы для изменения

1. Production bootstrap (найти где инициализируется приложение)
2. `src/column-limits/BoardPage/features/helpers.tsx`
3. `src/column-limits/SettingsPage/features/helpers.tsx`
4. `src/person-limits/BoardPage/features/helpers.tsx`
5. `src/person-limits/SettingsPage/features/helpers.tsx`
6. `src/wiplimit-on-cells/BoardPage/features/helpers.tsx`
7. `src/wiplimit-on-cells/SettingsPage/features/helpers.tsx`
8. Vitest setup (если есть)

---

## Acceptance Criteria

- [x] `JiraLocaleProvider` зарегистрирован в production
- [x] `MockLocaleProvider('en')` зарегистрирован во всех Cypress helpers (5 из 6 — wiplimit-on-cells SettingsPage не использует globalContainer)
- [x] `MockLocaleProvider('en')` зарегистрирован в Vitest через `registerTestDependencies` в тестах с useGetTextsByLocale
- [x] Все существующие тесты проходят
- [x] ESLint без ошибок

---

## Результаты

**Дата**: 2026-03-04

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- Production: `JiraLocaleProvider` зарегистрирован в `src/content.ts` (initDiContainer)
- Storybook: `MockLocaleProvider('en')` зарегистрирован в `.storybook/preview.tsx`
- Cypress helpers: `MockLocaleProvider('en')` добавлен в 5 helpers (column-limits BoardPage/SettingsPage, person-limits BoardPage/SettingsPage, wiplimit-on-cells BoardPage). wiplimit-on-cells SettingsPage не использует globalContainer
- Vitest: создан `registerTestDependencies` в `src/shared/testTools/registerTestDI.ts`, используется в LocalSettingsTab.test.tsx и BoardSettingsTabContent.test.tsx
- Все 555 Vitest тестов проходят
- Cypress component тесты wiplimit-on-cells проходят
- ESLint без ошибок, build успешен

# TASK-143: Создать buildAvatarUrl утилиту и DI токен

**Status**: DONE

**Parent**: [EPIC-15](./EPIC-15-dynamic-avatars.md)

---

## Описание

Создать функцию `buildAvatarUrl` которая генерирует стабильный URL аватарки пользователя, и зарегистрировать её как DI токен в `jiraApiTokens.ts` рядом с другими Jira API токенами.

## Файлы

```
src/shared/
├── utils/
│   ├── avatarUrl.ts        # новый
│   ├── avatarUrl.test.ts   # новый
│   └── index.ts            # изменение (экспорт)
└── di/
    └── jiraApiTokens.ts    # изменение (токен)
```

## Что сделать

1. Создать `src/shared/utils/avatarUrl.ts`:
   ```typescript
   export const buildAvatarUrl = (username: string): string => {
     return `/secure/useravatar?username=${encodeURIComponent(username)}`;
   };
   ```

2. Создать тесты `src/shared/utils/avatarUrl.test.ts`:
   - URL с обычным username
   - URL encoding для спецсимволов
   - Пустой username

3. Добавить экспорт в `src/shared/utils/index.ts`

4. Добавить в `src/shared/di/jiraApiTokens.ts`:
   ```typescript
   import { buildAvatarUrl } from 'src/shared/utils/avatarUrl';
   
   export type BuildAvatarUrl = (username: string) => string;
   export const buildAvatarUrlToken = new Token<BuildAvatarUrl>('buildAvatarUrl');
   
   // В registerJiraApiInDI:
   container.register({ token: buildAvatarUrlToken, value: buildAvatarUrl });
   ```

## Критерии приёмки

- [x] Функция `buildAvatarUrl` создана и экспортирована
- [x] Тесты покрывают основные кейсы
- [x] `buildAvatarUrlToken` зарегистрирован в `registerJiraApiInDI()`
- [x] Тесты проходят: `npm test -- avatarUrl`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: `src/shared/di/jiraApiTokens.ts` — паттерн регистрации токенов
- Референс: `src/shared/utils/issueTypeSelector.ts` — пример утилиты

---

## Результаты

**Дата**: 2026-03-10

**Агент**: Coder

**Статус**: DONE

**Что сделано**:
- Создан `src/shared/utils/avatarUrl.ts` с функцией `buildAvatarUrl(username: string): string`
- Создан `src/shared/utils/avatarUrl.test.ts` — 4 теста: обычный username, спецсимволы (@, пробелы), unicode, пустой username
- Создан `src/shared/utils/index.ts` с экспортом `buildAvatarUrl`
- Добавлены `BuildAvatarUrl` тип, `buildAvatarUrlToken` и регистрация в `registerJiraApiInDI()` в `src/shared/di/jiraApiTokens.ts`
- Тесты проходят, ESLint без ошибок, build успешен

**Проблемы и решения**:

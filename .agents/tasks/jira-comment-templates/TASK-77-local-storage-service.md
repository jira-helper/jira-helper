# TASK-77: LocalStorage Service Infrastructure

**Status**: VERIFICATION
**Type**: api

**Parent**: [EPIC-5](./EPIC-5-jira-comment-templates.md)

---

## Описание

Добавить общий infrastructure service для безопасной работы с browser `localStorage`. Сервис должен быть generic, Result-returning и не знать ничего о шаблонах комментариев или формате payload.

## Файлы

```
src/infrastructure/storage/
├── LocalStorageService.ts       # новый
├── tokens.ts                    # новый
└── LocalStorageService.test.ts  # новый
```

## Что сделать

1. Описать `ILocalStorageService` с методами `getItem`, `setItem`, `removeItem`.
2. Реализовать `LocalStorageService`, который оборачивает `localStorage` и преобразует browser exceptions в `Err(Error)`.
3. Добавить `localStorageServiceToken` для DI.
4. Покрыть unit tests успешные get/set/remove и ошибки browser storage.
5. Не добавлять template-specific key, parse или defaults в infrastructure layer.

## Критерии приёмки

- [x] Сервис не зависит от feature-кода и не содержит бизнес-логики шаблонов.
- [x] Все методы возвращают `Result` по существующему проектному паттерну.
- [x] Unit tests покрывают success и exception paths.
- [x] Тесты проходят: `npm test`.
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`.

## Зависимости

- Зависит от: нет.
- Референс: [target-design.md](./target-design.md)

---

## Результаты

**Дата**: 2026-04-30

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены `src/infrastructure/storage/LocalStorageService.ts` (`ILocalStorageService`, `LocalStorageService` с `Ok`/`Err` из `ts-results`, опциональная инъекция `Storage` для тестов, по умолчанию `globalThis.localStorage`).
- Добавлены `src/infrastructure/storage/tokens.ts`: `localStorageServiceToken`, `registerLocalStorageServiceInDI`.
- Добавлены unit-тесты `LocalStorageService.test.ts`: in-memory и реальный `localStorage`, ошибки через подставной `Storage`.

**Проблемы и решения**:

- В тестах для `Err` у `ts-results` используется поле `val`, а не `unwrapErr()` — исправлены ассерты.

**Проверки**:

- `npx vitest run src/infrastructure/storage/LocalStorageService.test.ts` — ok.
- `npx eslint src/infrastructure/storage/LocalStorageService.ts src/infrastructure/storage/tokens.ts src/infrastructure/storage/LocalStorageService.test.ts --fix` — ok.
- `npm test -- --run` — ok (134 files, 1464 tests).

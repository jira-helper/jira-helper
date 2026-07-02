# TASK-107: sub-tasks-progress + additional-card-elements diagnostic

**Status**: DONE
**Type**: di-wiring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic callbacks для legacy zustand board property stores: `sub-tasks-progress` и `additional-card-elements`.

## Файлы

```
src/features/sub-tasks-progress/
└── diagnosticRegistration.ts       # новый + вызов из bootstrap

src/features/additional-card-elements/
└── diagnosticRegistration.ts       # новый + вызов из bootstrap

src/content.ts                      # ensure init вызывает registration
```

## Что сделать

1. `sub-tasks-progress`: callback `sub-tasks-progress` — boardProperty + localStorage userGuide keys (requirements §5).
2. `additional-card-elements`: callback `additional-card-elements` — boardProperty only, runtime null.
3. Registration в existing init path (legacy DI/init function или content.ts после ensure).
4. Unit test каждого callback.

## Критерии приёмки

- [x] Оба featureName по §5.4
- [x] Unit test per feature callback
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5.6 legacy init

---

## Результаты

**Дата**: 2026-05-20

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены `diagnosticRegistration.ts` для `sub-tasks-progress` и `additional-card-elements` с read-only snapshot zustand store + user guide localStorage.
- Регистрация подключена в `content.ts` сразу после `diagnosticModule.ensure`.
- Unit-тесты (3 на фичу): регистрация featureName, payload §5.3, отсутствие side effects при collect.

**Проблемы и решения**:

- В тестах `diagnosticModule.ensure` требовал `loggerToken` — добавлен mock Logger в `beforeEach`, как в `diagnostic-module/module.test.ts`.

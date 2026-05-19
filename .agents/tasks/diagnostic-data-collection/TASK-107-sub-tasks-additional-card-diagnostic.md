# TASK-107: sub-tasks-progress + additional-card-elements diagnostic

**Status**: TODO
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

- [ ] Оба featureName по §5.4
- [ ] Unit test per feature callback
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5.6 legacy init

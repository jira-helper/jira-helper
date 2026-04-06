# TASK-197: BoardRuntimeModel + BoardRuntimeModel.test.ts

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Реализовать valtio `BoardRuntimeModel` — замену `useRuntimeStore` и action-ов `calculateStats`, `applyLimits`, `showOnlyChosen`. Модель читает limits из `PropertyModel`, считает статистику и управляет DOM **только** через `IBoardPagePageObject`. Чистые функции (`isPersonLimitAppliedToIssue`, `isPersonsIssue`, `computeLimitId`) — прямой import из `BoardPage/utils/`. Добавить `boardRuntimeModelToken` в `tokens.ts` и регистрацию в `module.ts` с инжектом `boardPagePageObjectToken`.

## Файлы

```
src/person-limits/
├── tokens.ts                 # добавить boardRuntimeModelToken
├── module.ts                 # зарегистрировать BoardRuntimeModel
└── BoardPage/models/
    ├── BoardRuntimeModel.ts       # новый
    ├── BoardRuntimeModel.test.ts  # новый (миграция calculateStats.test.ts и др.)
    └── types.ts                   # новый или рядом — PersonLimitStats и др. (по target-design)
```

## Что сделать

1. Реализовать `BoardRuntimeModel` по контракту [target-design.md](./target-design.md) (секция BoardRuntimeModel): `apply`, `calculateStats`, `showOnlyChosen`, `toggleActiveLimitId`, состояние `stats` / `activeLimitId`, без прямого `document`.
2. Вынести/сохранить типы (`PersonLimitStats` и т.д.) согласно target-design; убрать зависимость от удаляемого `runtimeStore.types.ts` на этапе TASK-201.
3. Добавить `boardRuntimeModelToken` в `tokens.ts` (`createModelToken<BoardRuntimeModel>`).
4. Зарегистрировать модель в `PersonLimitsModule` с зависимостями: `propertyModelToken`, `boardPagePageObjectToken`, `loggerToken`.
5. Перенести/написать unit-тесты: логика из `BoardPage/actions/calculateStats.test.ts` и связанные кейсы; сценарии [board-runtime.feature](./board-runtime.feature) на уровне unit/mocks PO.

## Критерии приёмки

- [ ] `BoardRuntimeModel` соответствует контракту target-design; DOM только через `IBoardPagePageObject`.
- [ ] `tokens.ts` содержит `boardRuntimeModelToken`; `module.ts` регистрирует модель.
- [ ] Unit-тесты покрывают ключевую логику (stats, фильтрация — с моком PO).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от:
  - [TASK-193](./TASK-193-infrastructure-tokens-module.md) (tokens + module, PropertyModel)
  - [TASK-194](./TASK-194-property-model.md)
  - [TASK-196](./TASK-196-board-page-page-object-person-limits.md) (методы PO)
- BDD: [board-runtime.feature](./board-runtime.feature), [di-integration.feature](./di-integration.feature) (@SC-DI-1, @SC-DI-3)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}

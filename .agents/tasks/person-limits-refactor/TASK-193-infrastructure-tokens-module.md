# TASK-193: tokens.ts + module.ts (инфраструктура DI)

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Добавить `tokens.ts` и класс `PersonLimitsModule extends Module` с `registerPersonLimitsModule` / экспортом `personLimitsModule` по образцу `column-limits` / `swimlane-wip-limits`. На этапе Phase 1 в `tokens.ts` объявляется **`propertyModelToken`**; `boardRuntimeModelToken` и `settingsUIModelToken` дописываются в **TASK-197** и **TASK-202**, когда появятся классы `BoardRuntimeModel` и `SettingsUIModel`. В `module.ts` на этом шаге регистрируется **только** `PropertyModel` через `lazy()` + `modelEntry()` + `proxy` / `useSnapshot`, как в target-design.

Итоговое содержимое `tokens.ts` с тремя токенами — в [target-design.md](./target-design.md); к концу EPIC файл должен совпасть с контрактом.

## Файлы

```
src/person-limits/
├── tokens.ts       # новый (минимум: propertyModelToken; дополнить в TASK-197/202)
├── module.ts       # новый (регистрация PropertyModel)
└── module.test.ts  # новый — по аналогии с column-limits / swimlane-wip-limits (желательно)
```

## Что сделать

1. Создать `tokens.ts` с `propertyModelToken` через `createModelToken<PropertyModel>` (полную тройку токенов — в TASK-197 и TASK-202).
2. Реализовать `PersonLimitsModule.register` с регистрацией только `PropertyModel` (инжекты `BoardPropertyServiceToken`, `loggerToken` — как в [target-design.md](./target-design.md)).
3. Экспортировать `personLimitsModule` (экземпляр модуля) и при необходимости функцию-обёртку регистрации, согласованную с другими фичами.
4. Добавить `module.test.ts`: резолв токена PropertyModel после `ensure`, отсутствие eager side effects до первого резолва (по контракту [di-integration.feature](./di-integration.feature)).
5. При необходимости точечно обновить `src/person-limits/index.ts` для реэкспорта (без массового рефакторинга потребителей до следующих задач).

## Критерии приёмки

- [ ] DI регистрирует `PropertyModel` с корректным `propertyModelToken`.
- [ ] Публичный API модуля совместим с дальнейшим расширением (TASK-197, TASK-202).
- [ ] `module.test.ts` покрывает базовую регистрацию (и при возможности lazy-поведение).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-194](./TASK-194-property-model.md) (нужен класс `PropertyModel` и стабильные импорты).
- Референсы:
  - `src/column-limits/tokens.ts`, `src/column-limits/module.ts`, `src/column-limits/module.test.ts`
  - `src/swimlane-wip-limits/module.ts`
  - [target-design.md](./target-design.md) — секции `tokens.ts`, `module.ts`

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}

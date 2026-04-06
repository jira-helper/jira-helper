# TASK-194: PropertyModel + PropertyModel.test.ts

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Реализовать valtio-класс `PropertyModel` — замену `usePersonWipLimitsPropertyStore` и action-ов `loadProperty` / `saveProperty`. Загрузка и сохранение `PersonWipLimitsProperty` в Jira Board Property `PERSON_LIMITS`, вызов `migrateProperty` при загрузке, методы `load()` / `persist()` с возвратом `Result<T, Error>` по образцу column-limits. Обновить `property/index.ts` для экспорта модели вместо/поверх legacy store (до финального удаления store в TASK-208).

## Файлы

```
src/person-limits/property/
├── PropertyModel.ts        # новый
├── PropertyModel.test.ts   # новый (сценарии из property-model.feature)
├── index.ts                # изменение экспортов
├── types.ts                # без изменений
├── migrateProperty.ts      # без изменений (используется из PropertyModel)
└── migrateProperty.test.ts # без изменений (или дополнить при необходимости)
```

## Что сделать

1. Реализовать `PropertyModel` по контракту [target-design.md](./target-design.md) (секция PropertyModel): состояние property, ошибки load/persist, `reset()`, DI через constructor (`BoardPropertyServiceI`, `Logger`).
2. Перенести/написать unit-тесты: покрыть сценарии [property-model.feature](./property-model.feature) (миграция v2.29, пустое/отсутствующее property, Ok/Err на load и persist).
3. Обновить `property/index.ts`: экспорт `PropertyModel`; не удалять `store.ts` в этой задаче (удаление в TASK-208).
4. Не подключать `module.ts` здесь — это [TASK-193](./TASK-193-infrastructure-tokens-module.md).

## Критерии приёмки

- [ ] `load()` / `persist()` возвращают `Result`, не бросают в типичных ошибках API; UI может читать состояние ошибки.
- [ ] После загрузки применяется `migrateProperty`; формат данных совместим с существующим property.
- [ ] Unit-тесты покрывают ключевые сценарии из `property-model.feature`.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (первая задача цепочки Phase 1 по смыслу; перед TASK-193 логически должна быть завершена).
- BDD-референс: [property-model.feature](./property-model.feature)
- Референс кода: `src/column-limits/property/PropertyModel.ts`, `PropertyModel.test.ts`

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}

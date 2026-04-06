# TASK-208: Final cleanup — property/store, interface, property/actions, exports

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Удалить оставшийся legacy слой property: `property/store.ts`, `property/store.test.ts`, `property/interface.ts`, `property/actions/` (`loadProperty`, `saveProperty`). Обновить публичные экспорты в `property/index.ts`, `person-limits/index.ts` и по всему репозиторию. Убедиться, что нет ссылок на старые токены/сторы. Согласуется с [target-design.md](./target-design.md) (структура после рефакторинга).

## Файлы

```
src/person-limits/property/
├── store.ts              # DELETE
├── store.test.ts         # DELETE
├── interface.ts          # DELETE
├── actions/              # DELETE folder
├── index.ts              # изменение экспортов
└── PropertyModel.ts      # без удаления
```

## Что сделать

1. `grep` по репозиторию на `usePersonWipLimitsPropertyStore`, старые action-импорты, `interface.ts`.
2. Удалить файлы; починить сборку.
3. Прогнать `npm test`, `npm run build`, линтер.

## Критерии приёмки

- [ ] Legacy property store/actions/interface отсутствуют.
- [ ] Экспорты модуля person-limits согласованы с архитектурой Model + module.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-207](./TASK-207-settings-delete-legacy-stores-actions.md) (и косвенно весь предыдущий EPIC)
- Референс: [TASK-186 column-limits](../column-limits-refactor/TASK-186-final-cleanup.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}

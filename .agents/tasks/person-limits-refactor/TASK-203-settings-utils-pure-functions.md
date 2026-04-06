# TASK-203: Перенос pure functions из SettingsPage/actions/ в utils/

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Перенести чистые функции и их тесты в `SettingsPage/utils/`: `createPersonLimit`, `updatePersonLimit`, `transformFormData` (+ `*.test.ts`). Обновить импорты в `SettingsUIModel`, контейнерах и unit-тестах. После переноса старые пути в `actions/` не должны использоваться (окончательное удаление папки `actions/` — в [TASK-207](./TASK-207-settings-delete-legacy-stores-actions.md)).

## Файлы

```
src/person-limits/SettingsPage/utils/
├── createPersonLimit.ts
├── createPersonLimit.test.ts
├── updatePersonLimit.ts
├── updatePersonLimit.test.ts
├── transformFormData.ts
└── transformFormData.test.ts

src/person-limits/SettingsPage/actions/
├── createPersonLimit.ts      # REMOVE после переноса
├── updatePersonLimit.ts
├── transformFormData.ts
└── *.test.ts
```

## Что сделать

1. Создать файлы в `utils/` с сохранением публичного поведения функций (копия + delete из actions на этапе TASK-207 или move в одном PR — согласно дифф-стратегии исполнителя).
2. Обновить все импорты на `utils/`.
3. Прогнать тесты, затронутые переносом.

## Критерии приёмки

- [ ] Все потребители импортируют pure functions из `SettingsPage/utils/`.
- [ ] Поведение функций не изменилось (тесты зелёные).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-202](./TASK-202-settings-ui-model.md) (модель должна существовать; импорты обновляются вместе с переносом)
- Requirements: [requirements.md](./requirements.md) § FR-3

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}

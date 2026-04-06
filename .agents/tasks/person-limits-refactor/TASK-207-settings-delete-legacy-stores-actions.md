# TASK-207: Удаление SettingsPage legacy — stores и actions

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Удалить `SettingsPage/stores/` и `SettingsPage/actions/` после полной миграции на `SettingsUIModel` и `utils/`. Удалить устаревшие тесты, перенесённые в `SettingsUIModel.test.ts` и utils-тесты. Починить все импорты по `src/person-limits` и внешним точкам.

## Файлы

```
src/person-limits/SettingsPage/stores/     # DELETE folder
src/person-limits/SettingsPage/actions/    # DELETE folder (если ещё осталась после TASK-203)
```

## Что сделать

1. Убедиться, что ни один файл не импортирует удаляемые store/actions.
2. Удалить папки и обновить barrel-файлы.
3. Проверить, что типы (`FormData`, и т.д.) живут в согласованном месте — по target-design (`state/types.ts` / re-export из модели).

## Критерии приёмки

- [ ] Нет zustand `useSettingsUIStore` в person-limits.
- [ ] Нет `createAction` action-файлов в SettingsPage.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-206](./TASK-206-settings-page-bdd-tests.md)
- Связано с: [TASK-203](./TASK-203-settings-utils-pure-functions.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}

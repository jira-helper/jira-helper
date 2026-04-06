# TASK-201: Удаление BoardPage legacy — stores, actions, pageObject

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Удалить устаревшие слои Board page: `BoardPage/stores/`, `BoardPage/actions/`, `BoardPage/pageObject/` (включая `personLimitsBoardPageObjectToken`), после того как весь код перешёл на `BoardRuntimeModel` и общий `BoardPagePageObject`. Обновить импорты по проекту; перенести `getNameFromTooltip.test.ts` согласно [target-design.md](./target-design.md) (в `BoardPage/utils/` или `page-objects/` — как принято в реализации).

## Файлы

```
src/person-limits/BoardPage/stores/           # DELETE folder
src/person-limits/BoardPage/actions/          # DELETE folder
src/person-limits/BoardPage/pageObject/       # DELETE folder
src/person-limits/BoardPage/**/*.ts(x)        # правки импортов
```

## Что сделать

1. Убедиться, что нет оставшихся ссылок на удаляемые модули (`grep` по `src/`).
2. Удалить файлы и папки; починить barrel-экспорты, если были.
3. Перенести тесты, которые относятся к утилитам PO (например `getNameFromTooltip`), без потери покрытия.
4. Запустить unit + Cypress по затронутым областям.

## Критерии приёмки

- [ ] `BoardPage/stores`, `actions`, `pageObject` отсутствуют в репозитории.
- [ ] Сборка и тесты без ссылок на удалённые пути.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-200](./TASK-200-board-page-bdd-tests.md) (BDD зелёные до удаления)
- Предыдущая миграция кода: [TASK-198](./TASK-198-board-page-index-migration.md), [TASK-199](./TASK-199-avatars-container-use-model.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}

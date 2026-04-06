# TASK-198: BoardPage/index.ts — миграция на BoardRuntimeModel и PropertyModel

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Обновить точку входа `PersonLimitsBoardPage` (`BoardPage/index.ts`): вместо zustand-сторов и `createAction` использовать DI-резолв `boardRuntimeModelToken` и `propertyModelToken`, подписку на мутации доски, вызовы `model.apply()`, загрузку property через `PropertyModel.load()` / `setData` по текущему lifecycle PageModification. Убрать использование `PersonLimitsBoardPageObject` там, где он инжектился напрямую — далее DOM только через зарегистрированный `IBoardPagePageObject` (уже в контейнере).

## Файлы

```
src/person-limits/BoardPage/index.ts          # основные изменения
src/person-limits/BoardPage/**/*.ts           # точечно: хелперы импорта DI, без изменения View
```

## Что сделать

1. Заменить обращения к `useRuntimeStore` / actions на методы `BoardRuntimeModel` (через контейнер: `inject(boardRuntimeModelToken)` или принятый в проекте паттерн для PageModification).
2. Загрузку/синхронизацию property перевести на `PropertyModel` (согласованно с [TASK-205](./TASK-205-settings-page-index-load-property.md) для settings — не дублировать загрузку без нужды).
3. Сохранить поведение mutation observer и порядок вызовов apply/showOnlyChosen как в текущей реализации.
4. Не удалять папки `stores/`, `actions/`, `pageObject/` в этой задаче — [TASK-201](./TASK-201-board-page-delete-legacy.md).

## Критерии приёмки

- [ ] Board page не использует `useRuntimeStore` / старые action-файлы для основного потока.
- [ ] Регистрация PageModification инициализирует модели из DI и корректно отписывается при teardown (если применимо).
- [ ] Нет регрессий в ручном smoke (аватары, бейджи, клик по фильтру).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-197](./TASK-197-board-runtime-model.md)
- Далее: [TASK-199](./TASK-199-avatars-container-use-model.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}

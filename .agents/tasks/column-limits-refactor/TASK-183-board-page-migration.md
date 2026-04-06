# TASK-183: Миграция Board page — index, helpers, удаление legacy

**Status**: VERIFICATION

**Parent**: [EPIC-18](./EPIC-18-column-limits-refactor.md)

---

## Описание

Подключить `BoardRuntimeModel` в точке входа Board page: `registerColumnLimitsModule`, `setData` / `setCssNotIssueSubTask` / `apply`, подписка на `#ghx-pool`. Адаптировать Cypress helpers и step definitions. Удалить zustand runtime store, actions и `ColumnLimitsBoardPageObject`.

## Файлы

**Изменить:**

```
src/column-limits/BoardPage/index.ts
src/column-limits/BoardPage/features/helpers.tsx
src/column-limits/BoardPage/features/*.feature.cy.tsx   # по необходимости — steps
src/column-limits/BoardPage/features/steps/common.steps.ts
```

**Удалить каталоги/файлы:**

```
src/column-limits/BoardPage/stores/
src/column-limits/BoardPage/actions/
src/column-limits/BoardPage/pageObject/
```

## Поведение entry point (из target-design)

`ColumnLimitsBoardPage.apply` (упрощённо):

1. `registerColumnLimitsModule(this.container)` — один раз на модификацию
2. `propertyModel.setData(boardGroups)`
3. `boardRuntimeModel.setCssNotIssueSubTask(css)`
4. `boardRuntimeModel.apply()`
5. `this.onDOMChange('#ghx-pool', () => boardRuntimeModel.apply())`

Инжект моделей через `boardRuntimeModelToken` / `propertyModelToken` из контейнера PageModification.

## Что сделать

1. Обновить `BoardPage/index.ts`: убрать импорты stores/actions/pageObject; использовать DI и `BoardRuntimeModel` / `PropertyModel`.
2. Обновить `features/helpers.tsx`: регистрация модуля и сброс моделей вместо zustand + регистрация column-limits page object (см. target-design).
3. Пройтись по `*.feature.cy.tsx` / `common.steps.ts` — заменить обращения к старым stores/helpers.
4. Удалить перечисленные папки; почистить barrel-файлы, если были.
5. Запустить Cypress component tests для `BoardPage/features/`.

## Критерии приёмки

- [ ] Board page работает через `registerColumnLimitsModule` и `BoardRuntimeModel`; прямых импортов удалённых модулей нет.
- [ ] BDD-тесты Board page проходят после адаптации helpers.
- [ ] Папки `stores/`, `actions/`, `pageObject/` под `BoardPage/` отсутствуют.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-182](./TASK-182-board-runtime-model.md)
- Референсы:
  - `src/swimlane-wip-limits/BoardPage/BoardPageModification.ts` или `index.ts`
  - `src/swimlane-wip-limits/BoardPage/features/helpers.tsx` (если есть)
  - `src/features/field-limits/BoardPage/BoardPageModification.ts`
  - `src/column-limits/BoardPage/features/helpers.tsx` (текущее состояние)

---

## Результаты

**Дата**: 2026-04-05

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `BoardPage/index.ts`: `registerColumnLimitsModule`, `PropertyModel.setData`, `BoardRuntimeModel.setCssNotIssueSubTask` / `apply`, подписка `#ghx-pool`; тип данных `WipLimitsProperty`; async `loadData` с нормализацией `undefined` свойства.
- `features/helpers.tsx`: DI через mock `BoardPropertyServiceToken`, `BoardPagePageObject`, `registerColumnLimitsModule`, сброс `propertyModel` / `BoardRuntimeModel`; в мок доске добавлен `.ghx-swimlane-header` под `BoardPagePageObject.getSwimlanes()`.
- `features/steps/common.steps.ts`: шаги через `propertyModelToken` / `boardRuntimeModelToken` вместо zustand и `applyLimits`.
- Удалены каталоги `BoardPage/stores/`, `BoardPage/actions/`, `BoardPage/pageObject/` со всеми файлами.

**Проблемы и решения**:

- Cypress `swimlane-filter`: после миграции падал SC-SWIM-BOARD-1 (`3/1` вместо `2/1`), т.к. `getSwimlaneIds()` был пустым без `.ghx-swimlane-header` в тестовом DOM — добавлен заголовок в `helpers.tsx`.

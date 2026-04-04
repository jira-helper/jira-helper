# TASK-162: BoardPageModification

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать точку входа для Board Page — PageModification, который инициализирует BoardRuntimeModel, рендерит FieldLimitsList и настраивает обновление при изменении DOM.

## Файлы

```
src/features/field-limits/BoardPage/
├── BoardPageModification.ts    # новый
└── index.ts                    # новый (реэкспорт)
```

## Что сделать

1. Создать `BoardPageModification extends PageModification`:

   - `shouldApply()` → `!view || view === 'detail'`
   - `getModificationId()` → `'field-limits-board-${boardId}'`
   - `waitForLoading()` → `waitForElement('.ghx-swimlane')`
   - `loadData()` → `Promise.all([getBoardEditData(), getBoardProperty(FIELD_LIMITS)])`
   - `apply([boardEditData, fieldLimits])`:
     1. Если `fieldLimits` пуст — return
     2. `registerFieldLimitsModule(globalContainer)`
     3. Получить `boardRuntimeModel` из DI
     4. `await model.initialize(boardEditData)`
     5. Вставить `FieldLimitsList` через PageObject `insertSubnavComponent`
     6. `onDOMChange('#ghx-pool', () => model.recalculate())`
     7. `onDOMChange('#ghx-view-selector', () => checkIfListExists())`

   - Cleanup: `model.destroy()`, unmount React

2. Создать `index.ts` с реэкспортом `BoardPageModification`

## Критерии приёмки

- [x] Рендерится на board page при наличии field limits
- [x] registerFieldLimitsModule вызывается в apply()
- [x] FieldLimitsList вставляется в #subnav-title
- [x] DOM changes вызывают recalculate()
- [x] Cleanup: destroy model + unmount React при уходе со страницы
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-150](./TASK-150-field-limits-module.md), [TASK-159](./TASK-159-field-limits-board-runtime-model.md), [TASK-161](./TASK-161-field-limits-list.md)
- Референс: `src/swimlane-wip-limits/BoardPage/BoardPageModification.ts`
- Legacy код: `src/field-limits/BoardPage/index.ts:59-96` (shouldApply, waitForLoading, loadData, apply)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `BoardPageModification.ts` — shouldApply, getModificationId, waitForLoading, loadData, apply
- Создан `BoardPageModification.test.ts` — 7 тестов (shouldApply, getModificationId, waitForLoading, loadData)
- Создан `index.ts` с реэкспортом
- Обновлён `module.ts` — добавлены регистрации PropertyModel, SettingsUIModel, FieldLimitsBoardPageObject, BoardRuntimeModel (необходимо для работы BoardPageModification)
- `npm test` — 769 passed
- `npm run lint:eslint -- --fix` — без ошибок
- `npm run build:dev` — успешно

**Проблемы и решения**:

- module.ts был заглушкой — обновлён для регистрации всех моделей, иначе inject в apply() падал бы

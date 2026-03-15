# TASK-159: BoardRuntimeModel + тесты

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать BoardRuntimeModel — Valtio-модель для runtime-подсчёта field limits на доске. Объединяет данные из PropertyModel, DOM-запросы через PageObject и pure functions для вычислений. Управляет card coloring.

## Файлы

```
src/features/field-limits/BoardPage/models/
├── BoardRuntimeModel.ts        # новый
└── BoardRuntimeModel.test.ts   # новый
```

## Что сделать

1. Создать `BoardRuntimeModel` с API из Target Design:

   **State:**
   - `settings: FieldLimitsSettings`
   - `stats: Record<string, FieldLimitStats>`
   - `isInitialized: boolean`
   - `cardLayoutFields: CardLayoutField[]` — для маппинга fieldId → fieldName
   - `cssSelectorOfIssues: string` — CSS-селектор для карточек

   **Constructor:** `(propertyModel, fieldLimitsPageObject, boardPageObject, logger)`

   **Methods:**
   - `initialize(boardEditData)` → `Result<void, Error>`:
     1. Загрузить settings через propertyModel
     2. Извлечь cardLayoutFields из boardEditData
     3. Вычислить cssSelectorOfIssues
     4. Вызвать `recalculate()`

   - `recalculate()`:
     1. Для каждого limit в settings:
        - Определить calcType через `parseCalcType(fieldValue)`
        - Пройти по колонкам/swimlanes
        - Для каждой карточки: найти extra-field с нужным fieldName
        - Подсчитать значения через `calculateFieldValue(texts, fieldValue, calcType)`
        - Собрать stats: current, limit, isOverLimit, isOnLimit
     2. Вызвать `colorCards()`

   - `colorCards()`:
     - Для лимитов с isOverLimit: покрасить карточки через pageObject.colorCard

   - `destroy()` → cleanup, reset styles
   - `reset()`

   **Queries:**
   - `getLimitStats(limitKey)`, `isOverLimit(limitKey)`, `getBadgeColor(limitKey)`, `getBadgeText(limitKey)`

2. Вычисление `cssSelectorOfIssues`:
   - Из legacy: `getCssSelectorOfIssues(boardEditData)` → `.ghx-issue` или `.ghx-issue:not(.ghx-issue-subtask)`
   - Зависит от `boardEditData.rapidListConfig.currentStatisticsField.typeId`

3. Логика подсчёта по swimlanes:
   - Если есть custom swimlanes (проверить через boardPageObject) — считать per swimlane+column
   - Иначе — считать per column
   - Legacy: `src/field-limits/BoardPage/index.ts:337-360`

4. Написать unit-тесты с моками PageObject и PropertyModel

## Критерии приёмки

- [ ] Вся расчётная логика перенесена из legacy BoardPage
- [ ] Использует pure functions из TASK-149
- [ ] Использует PageObject из TASK-158 для DOM-запросов
- [ ] Card coloring через pageObject (не напрямую)
- [ ] getBadgeColor возвращает правильные цвета (COLORS.OVER_WIP_LIMITS, ON_THE_LIMIT, BELOW_THE_LIMIT)
- [ ] Unit-тесты с моками
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-148](./TASK-148-field-limits-types-tokens.md), [TASK-149](./TASK-149-field-limits-pure-functions.md), [TASK-151](./TASK-151-field-limits-property-model.md), [TASK-158](./TASK-158-field-limits-board-pageobject.md)
- Референс: `src/swimlane-wip-limits/BoardPage/models/BoardRuntimeModel.ts`
- Legacy код: `src/field-limits/BoardPage/index.ts` (вся расчётная логика)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/features/field-limits/BoardPage/models/BoardRuntimeModel.ts` — Valtio-модель для runtime-подсчёта field limits
- Создан `src/features/field-limits/BoardPage/models/BoardRuntimeModel.test.ts` — 16 unit-тестов с моками
- Вся расчётная логика перенесена из legacy (getCssSelectorOfIssues, countIssuesInColumn, recalculate, colorCards)
- Использует parseCalcType и calculateFieldValue из TASK-149
- Card coloring через fieldLimitsPageObject
- getBadgeColor возвращает COLORS.OVER_WIP_LIMITS, ON_THE_LIMIT, BELOW_THE_LIMIT

**Проблемы и решения**:

Нет

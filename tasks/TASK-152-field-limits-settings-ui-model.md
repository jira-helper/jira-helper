# TASK-152: SettingsUIModel + тесты

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать SettingsUIModel — Valtio-модель для управления состоянием модалки настроек Field WIP Limits. Инкапсулирует всю логику CRUD операций над лимитами, массовое применение колонок/swimlanes, и жизненный цикл модалки (open/save/close).

## Файлы

```
src/features/field-limits/SettingsPage/models/
├── SettingsUIModel.ts        # новый
└── SettingsUIModel.test.ts   # новый
```

## Что сделать

1. Создать `SettingsUIModel` с полным API из Target Design:

   **State:**
   - `isOpen`, `isLoading`, `isSaving`, `error`
   - `draft: FieldLimitsSettings` — редактируемая копия
   - `cardLayoutFields`, `columns`, `swimlanes` — данные доски
   - `editingLimitKey: string | null`

   **Lifecycle:**
   - `open()` — загружает настройки + данные доски, открывает модалку
   - `save()` — сохраняет draft через PropertyModel, закрывает
   - `close()` — сбрасывает состояние без сохранения

   **CRUD:**
   - `addLimit(input: LimitFormInput)` — генерирует ключ через `createLimitKey`, добавляет в draft
   - `updateLimit(limitKey, input)` — обновляет существующий лимит
   - `deleteLimit(limitKey)` — удаляет лимит из draft
   - `setEditingLimitKey(key | null)` — переключает режим редактирования
   - `setLimitColor(limitKey, color)` — меняет цвет badge

   **Массовые операции:**
   - `applyColumnsToSelected(selectedKeys, columnIds)` — применяет колонки к выбранным лимитам
   - `applySwimlanesToSelected(selectedKeys, swimlaneIds)` — применяет swimlanes к выбранным

   **Queries:**
   - `get hasUnsavedChanges` — сравнение draft с propertyModel.settings

2. Конструктор: `(propertyModel, getBoardEditData, logger)`

3. В `open()`:
   - Из `boardEditData` извлечь `cardLayoutFields`, `columns` (без KanPlan), `swimlanes`
   - Draft = глубокая копия `propertyModel.settings`

4. Написать unit-тесты на все операции

## Критерии приёмки

- [ ] Все методы из Target Design реализованы
- [ ] `open()` загружает cardLayoutFields, columns, swimlanes из boardEditData
- [ ] CRUD операции корректно мутируют draft
- [ ] Массовые операции работают на выбранных ключах
- [ ] `hasUnsavedChanges` правильно определяет изменения
- [ ] Unit-тесты покрывают все операции
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-148](./TASK-148-field-limits-types-tokens.md), [TASK-149](./TASK-149-field-limits-pure-functions.md) (createLimitKey), [TASK-151](./TASK-151-field-limits-property-model.md)
- Референс: `src/swimlane-wip-limits/SettingsPage/models/SettingsUIModel.ts`
- Legacy код: `src/field-limits/SettingsPage/index.ts` (все методы handleEdit/handleAdd/handleConfirm)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/features/field-limits/SettingsPage/models/SettingsUIModel.ts` — Valtio-модель с полным API (open/save/close, CRUD, массовые операции, hasUnsavedChanges)
- Создан `src/features/field-limits/SettingsPage/models/SettingsUIModel.test.ts` — 21 unit-тест

**Проблемы и решения**:

- ESLint `no-unused-vars` для `const { [limitKey]: _, ...rest }` — заменено на `delete limits[limitKey]`
- Тест `hasUnsavedChanges` — mock PropertyModel не обновлял `settings` при `load()`, добавлен `mockPropertyModel.settings = JSON.parse(JSON.stringify(mockSettings))`
- Тест `save` — после `close()` draft сбрасывается, сохранён `draftBeforeSave` до вызова save для assertion

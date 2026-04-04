# TASK-53: Рефакторинг index.ts BoardPage

**Status**: DONE

**Parent**: [EPIC-6](./EPIC-6-column-limits-modernization.md)

---

## Описание

Рефакторинг entry point `index.ts` для использования новой архитектуры: actions, stores, pageObject. После рефакторинга index.ts должен быть тонким слоем, который только координирует загрузку данных и вызов actions.

## Файлы

```
src/column-limits/BoardPage/
├── index.ts   # изменение - упрощение
```

## Что сделать

1. Удалить методы, вынесенные в actions/pageObject:
   - `styleColumnHeaders()` → action
   - `styleColumnsWithLimitations()` → action
   - `getOrderedColumns()` → pageObject
   - `getIssuesInColumn()` → pageObject

2. Обновить `apply()`:

```typescript
apply(data: [EditData?, BoardGroup?, SwimlanesSettings?]): void {
  if (!data) return;
  const [editData, boardGroups, swimlanesSettings] = data;
  if (!boardGroups || Object.keys(boardGroups).length === 0) return;

  // Register PageObject in DI
  try {
    globalContainer.inject(columnLimitsBoardPageObjectToken);
  } catch {
    registerColumnLimitsBoardPageObjectInDI(globalContainer);
  }

  // Initialize property store
  const propertyStore = useColumnLimitsPropertyStore.getState();
  propertyStore.actions.setData(boardGroups);

  // Initialize runtime store
  const { actions } = useColumnLimitsRuntimeStore.getState();
  const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
  actions.setCssNotIssueSubTask(cssNotIssueSubTask);
  
  const ignoredSwimlanes = Object.keys(swimlanesSettings || {})
    .filter(id => swimlanesSettings![id].ignoreWipInColumns);
  actions.setIgnoredSwimlanes(ignoredSwimlanes);

  // Apply limits
  applyLimits();

  // Watch for DOM changes
  this.onDOMChange('#ghx-pool', () => {
    applyLimits();
  });
}
```

3. Оставить только:
   - `shouldApply()`
   - `getModificationId()`
   - `waitForLoading()`
   - `loadData()`
   - `apply()`
   - `getCssSelectorNotIssueSubTask()` (или вынести в utils)

## Критерии приёмки

- [x] index.ts < 80 строк (65 строк кода класса + интерфейсы)
- [x] Вся бизнес-логика в actions
- [x] Все DOM операции через PageObject
- [x] Данные читаются из property store
- [x] Функциональность сохранена
- [x] Код компилируется: `npm run build:dev`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix src/column-limits/BoardPage/index.ts`

## Зависимости

- Зависит от: [TASK-50](./TASK-50-column-limits-boardpage-pageobject.md), [TASK-51](./TASK-51-column-limits-boardpage-store.md), [TASK-52](./TASK-52-column-limits-boardpage-actions.md)
- Референс: `src/person-limits/BoardPage/index.ts`

---

## Результаты

**Дата**: 2026-02-16

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Рефакторинг выполнен успешно:
- Удалены методы: styleColumnHeaders(), styleColumnsWithLimitations(), getOrderedColumns(), getIssuesInColumn()
- Удалены приватные поля: boardGroups, swimlanesSettings, mappedColumns, cssNotIssueSubTask
- Переписан apply() для использования новой архитектуры (stores, actions, pageObject)
- Код класса сократился с ~210 строк до ~65 строк
- Все проверки пройдены: компиляция, линтер
```

**Проблемы и решения**:

```

```

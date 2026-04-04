# TASK-111: Удалить глобальный ignoredSwimlanes

**Status**: DONE

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Удалить глобальный `ignoredSwimlanes` из runtimeStore и убрать загрузку SwimlanesSettings из BoardPage/index.ts.

## Что сделать

### 1. Обновить runtimeStore.ts

**Файл**: `src/column-limits/BoardPage/stores/runtimeStore.ts`

```typescript
// BEFORE
export interface ColumnLimitsRuntimeData {
  groupStats: Record<string, GroupStats>;
  ignoredSwimlanes: string[];  // REMOVE
  cssNotIssueSubTask: string;
}

// Удалить action
setIgnoredSwimlanes: (swimlanes: string[]) => void;  // REMOVE

// AFTER
export interface ColumnLimitsRuntimeData {
  groupStats: Record<string, GroupStats>;
  cssNotIssueSubTask: string;
}
```

### 2. Обновить runtimeStore.types.ts

Удалить `ignoredSwimlanes` из типов.

### 3. Обновить BoardPage/index.ts

**Файл**: `src/column-limits/BoardPage/index.ts`

```typescript
// BEFORE
apply(data: [EditData?, BoardGroup?, SwimlanesSettings?]): void {
  const [editData, boardGroups, swimlanesSettings] = data;
  // ...
  const ignoredSwimlanes = Object.keys(swimlanesSettings)
    .filter(id => swimlanesSettings[id].ignoreWipInColumns);
  actions.setIgnoredSwimlanes(ignoredSwimlanes);
}

// AFTER
apply(data: [EditData?, BoardGroup?]): void {
  const [editData, boardGroups] = data;
  // swimlanesSettings больше не нужен
  // swimlanes теперь в каждой группе boardGroups[groupId].swimlanes
}
```

### 4. Удалить загрузку SwimlanesSettings

Убрать импорт и использование `getSwimlanesSettings` в index.ts.

## Критерии приёмки

- [x] `ignoredSwimlanes` удалён из runtimeStore (RuntimeData)
- [x] `setIgnoredSwimlanes` action удалён
- [x] SwimlanesSettings больше не загружается в BoardPage
- [x] Build проходит (TypeScript ✓)
- [x] Lint проходит (ESLint ✓)

## Зависимости

- Зависит от: TASK-110 (calculateGroupStats)

---

## Результат

### Изменения

1. **runtimeStore.types.ts**:
   - Удалён `ignoredSwimlanes: string[]` из `RuntimeData`
   - Удалён `setIgnoredSwimlanes` из `RuntimeActions`
   - Удалён из `getInitialData()`
   - Добавлен `ignoredSwimlanes: string[]` в `GroupStats` (per-group)

2. **runtimeStore.ts**:
   - Удалён action `setIgnoredSwimlanes`

3. **runtimeStore.test.ts**:
   - Удалены тесты для `setIgnoredSwimlanes`
   - Обновлены GroupStats объекты с `ignoredSwimlanes: []`

4. **BoardPage/index.ts**:
   - Удалён импорт `mergeSwimlaneSettings`
   - Удалён интерфейс `SwimlanesSettings`
   - `loadData()` больше не загружает SwimlanesSettings
   - `apply()` больше не вызывает `setIgnoredSwimlanes()`

5. **calculateGroupStats.ts**:
   - Добавлено `ignoredSwimlanes` в возвращаемый `GroupStats`

6. **styleColumnsWithLimits.ts**:
   - Использует `stat.ignoredSwimlanes` вместо глобального

7. **common.steps.ts**:
   - Удалён степ `swimlane {string} is set to ignore WIP limits`
   - Удалён неиспользуемый импорт `useColumnLimitsRuntimeStore`

### Тесты

- Unit tests: 555 passed ✓
- Cypress component tests: 213 passed ✓

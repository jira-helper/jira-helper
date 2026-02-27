# TASK-111: Удалить глобальный ignoredSwimlanes

**Status**: TODO

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

- [ ] `ignoredSwimlanes` удалён из runtimeStore
- [ ] `setIgnoredSwimlanes` action удалён
- [ ] SwimlanesSettings больше не загружается в BoardPage
- [ ] Build проходит
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-110 (calculateGroupStats)

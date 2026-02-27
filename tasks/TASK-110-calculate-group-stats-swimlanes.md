# TASK-110: Обновить calculateGroupStats — использовать group.swimlanes

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Изменить логику подсчёта задач чтобы использовать per-group swimlanes вместо глобального `ignoredSwimlanes`.

## Что сделать

### 1. Обновить calculateGroupStats.ts

**Файл**: `src/column-limits/BoardPage/actions/calculateGroupStats.ts`

```typescript
// BEFORE
export function calculateGroupStats(
  group: ColumnLimitGroup,
  pageObject: ColumnLimitsBoardPageObject,
  ignoredSwimlanes: string[],  // GLOBAL
  cssNotIssueSubTask: string
): GroupStats {
  const issueCount = group.columns.reduce(
    (acc, columnId) =>
      acc + pageObject.getIssuesInColumn(columnId, ignoredSwimlanes, includedIssueTypes, cssNotIssueSubTask),
    0
  );
  // ...
}

// AFTER
export function calculateGroupStats(
  group: ColumnLimitGroup,
  pageObject: ColumnLimitsBoardPageObject,
  allSwimlaneIds: string[],  // All available swimlane IDs
  cssNotIssueSubTask: string
): GroupStats {
  // Derive ignoredSwimlanes from group.swimlanes
  const groupSwimlaneIds = group.swimlanes?.map(s => s.id) || [];
  
  // Empty or undefined = all swimlanes (no ignored)
  const ignoredSwimlanes = groupSwimlaneIds.length === 0
    ? []
    : allSwimlaneIds.filter(id => !groupSwimlaneIds.includes(id));

  const issueCount = group.columns.reduce(
    (acc, columnId) =>
      acc + pageObject.getIssuesInColumn(columnId, ignoredSwimlanes, includedIssueTypes, cssNotIssueSubTask),
    0
  );
  // ...
}
```

### 2. Обновить вызовы

Обновить все места где вызывается `calculateGroupStats` чтобы передавать `allSwimlaneIds` вместо `ignoredSwimlanes`.

## Критерии приёмки

- [ ] `calculateGroupStats` использует `group.swimlanes`
- [ ] Empty/undefined swimlanes = all (no ignored)
- [ ] Explicit swimlanes = ignore others
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-106 (types), TASK-107 (property)

# TASK-106: Обновить types.ts — добавить swimlanes

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Добавить поле `swimlanes` в типы `ColumnLimitGroup` и `UIGroup`.

## Что сделать

### 1. Обновить types.ts

**Файл**: `src/column-limits/types.ts`

```typescript
// BEFORE
export type ColumnLimitGroup = {
  columns: string[];
  max?: number;
  customHexColor?: string;
  includedIssueTypes?: string[];
};

export type UIGroup = {
  id: string;
  columns: Column[];
  max?: number;
  customHexColor?: string;
  includedIssueTypes?: string[];
};

// AFTER
export type ColumnLimitGroup = {
  columns: string[];
  max?: number;
  customHexColor?: string;
  includedIssueTypes?: string[];
  swimlanes?: Array<{ id: string; name: string }>;  // NEW: empty = all
};

export type UIGroup = {
  id: string;
  columns: Column[];
  max?: number;
  customHexColor?: string;
  includedIssueTypes?: string[];
  swimlanes?: Array<{ id: string; name: string }>;  // NEW
};
```

## Convention

| `swimlanes` value | Meaning |
|-------------------|---------|
| `undefined` | All swimlanes (backward compat) |
| `[]` (empty array) | All swimlanes |
| `[{id: "sw1", name: "Frontend"}]` | Only Frontend swimlane |

## Критерии приёмки

- [ ] `swimlanes` добавлен в `ColumnLimitGroup`
- [ ] `swimlanes` добавлен в `UIGroup`
- [ ] TypeScript компилируется без ошибок
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-104 (можно параллельно с shared component)

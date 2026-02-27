# TASK-107: Обновить property store для swimlanes

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Обновить `initFromProperty` и `saveToProperty` для маппинга swimlanes.

## Что сделать

### 1. Обновить initFromProperty.ts

**Файл**: `src/column-limits/SettingsPage/actions/initFromProperty.ts`

```typescript
// При загрузке из property маппим swimlanes в UI state
const uiGroup: UIGroup = {
  id: groupId,
  columns: group.columns.map(colId => columnMap[colId]).filter(Boolean),
  max: group.max,
  customHexColor: group.customHexColor,
  includedIssueTypes: group.includedIssueTypes,
  swimlanes: group.swimlanes,  // NEW: pass through (undefined = all)
};
```

### 2. Обновить saveToProperty.ts

**Файл**: `src/column-limits/SettingsPage/actions/saveToProperty.ts`

```typescript
// При сохранении маппим swimlanes из UI state в property
const propertyGroup: ColumnLimitGroup = {
  columns: uiGroup.columns.map(col => col.id),
  max: uiGroup.max,
  customHexColor: uiGroup.customHexColor,
  includedIssueTypes: uiGroup.includedIssueTypes,
  swimlanes: uiGroup.swimlanes?.length ? uiGroup.swimlanes : undefined,  // NEW
};
```

### 3. Backward compatibility

- Если `group.swimlanes` отсутствует в property → undefined (= все)
- Если `group.swimlanes` пустой массив → undefined при сохранении (= все)

## Критерии приёмки

- [ ] `initFromProperty` загружает swimlanes
- [ ] `saveToProperty` сохраняет swimlanes
- [ ] Backward compatibility: старые настройки работают
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-106 (types)

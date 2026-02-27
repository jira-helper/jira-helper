# TASK-108: Обновить settingsUIStore — добавить setGroupSwimlanes

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Добавить action `setGroupSwimlanes` в settingsUIStore для Column Limits.

## Что сделать

### 1. Обновить settingsUIStore.ts

**Файл**: `src/column-limits/SettingsPage/stores/settingsUIStore.ts`

```typescript
// Добавить action
setGroupSwimlanes: (groupId: string, swimlanes: Array<{ id: string; name: string }>) =>
  set(
    produce((state: SettingsUIState) => {
      const group = state.groups.find(g => g.id === groupId);
      if (group) {
        // Empty array = all (convention)
        group.swimlanes = swimlanes.length === 0 ? undefined : swimlanes;
      }
    })
  ),
```

### 2. Обновить types

**Файл**: `src/column-limits/SettingsPage/stores/settingsUIStore.types.ts`

```typescript
// Добавить в SettingsUIActions
setGroupSwimlanes: (groupId: string, swimlanes: Array<{ id: string; name: string }>) => void;
```

## Критерии приёмки

- [ ] Action `setGroupSwimlanes` добавлен
- [ ] Types обновлены
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-106 (types), TASK-107 (property)

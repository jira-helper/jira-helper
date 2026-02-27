# TASK-109: Интегрировать SwimlaneSelector в ColumnLimitsForm

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Добавить `SwimlaneSelector` компонент в каждую группу в `ColumnLimitsForm`.

## Что сделать

### 1. Обновить ColumnLimitsForm.tsx

**Файл**: `src/column-limits/SettingsPage/ColumnLimitsForm.tsx`

```tsx
import { SwimlaneSelector } from 'src/shared/components/SwimlaneSelector';

// В props добавить
interface ColumnLimitsFormProps {
  // ... existing props
  swimlanes: Array<{ id: string; name: string }>;  // NEW
}

// В ColumnGroup компоненте
const ColumnGroup: React.FC<{ group: UIGroup }> = ({ group }) => {
  const selectedSwimlaneIds = group.swimlanes?.map(s => s.id) || [];

  return (
    <Card className={styles.columnGroupJH}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Existing: Limit input + Color picker */}
        {/* Existing: Column dropzone */}
        
        {/* NEW: Swimlane selector */}
        <SwimlaneSelector
          swimlanes={availableSwimlanes}
          value={selectedSwimlaneIds}
          onChange={(ids) => {
            const selectedSwimlanes = availableSwimlanes.filter(s => ids.includes(s.id));
            actions.setGroupSwimlanes(group.id, selectedSwimlanes);
          }}
        />

        {/* Existing: Issue type selector */}
      </Space>
    </Card>
  );
};
```

### 2. Передать swimlanes из контейнера

Убедиться что `swimlanes` передаются из `SettingsModalContainer` в `ColumnLimitsForm`.

## Критерии приёмки

- [ ] `SwimlaneSelector` рендерится в каждой группе
- [ ] `onChange` вызывает `actions.setGroupSwimlanes`
- [ ] Swimlanes отображаются корректно
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-104 (shared component), TASK-108 (store action)

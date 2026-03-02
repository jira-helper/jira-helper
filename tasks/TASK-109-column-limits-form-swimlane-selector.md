# TASK-109: Интегрировать SwimlaneSelector в ColumnLimitsForm

**Status**: DONE

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

- [x] `SwimlaneSelector` рендерится в каждой группе
- [x] `onChange` вызывает `actions.setGroupSwimlanes`
- [x] Swimlanes отображаются корректно
- [x] Lint проходит

## Зависимости

- Зависит от: TASK-104 (shared component), TASK-108 (store action)

---

## Результаты

**Дата**: 2025-03-02

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

- Добавлен SwimlaneSelector в каждую группу в ColumnLimitsForm
- Swimlanes загружаются из board edit data (swimlanesConfig) в SettingsWIPLimits
- Цепочка: SettingsWIPLimits → SettingsButtonContainer → SettingsModalContainer → ColumnLimitsForm
- SwimlaneSelector показывается только при swimlanes.length > 0 и onSwimlanesChange
- Добавлена story WithSwimlaneSelector в ColumnLimitsSettings.stories.tsx

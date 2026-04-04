# TASK-104: Создать shared SwimlaneSelector компонент

**Status**: DONE

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Создать переиспользуемый компонент `SwimlaneSelector` в `src/shared/components/`.

## Что сделать

### 1. Создать структуру

```
src/shared/components/SwimlaneSelector/
├── index.ts
├── SwimlaneSelector.tsx
└── SwimlaneSelector.stories.tsx
```

### 2. Реализовать компонент

```tsx
// src/shared/components/SwimlaneSelector/SwimlaneSelector.tsx

export type Swimlane = {
  id: string;
  name: string;
};

export interface SwimlaneSelectorProps {
  /** Available swimlanes to choose from */
  swimlanes: Swimlane[];
  /** Currently selected swimlane IDs (empty = all) */
  value: string[];
  /** Callback when selection changes */
  onChange: (selectedIds: string[]) => void;
  /** Label text (default: "Swimlanes") */
  label?: string;
  /** "All" checkbox text (default: "All swimlanes") */
  allLabel?: string;
}

export const SwimlaneSelector: React.FC<SwimlaneSelectorProps> = ({
  swimlanes,
  value,
  onChange,
  label = 'Swimlanes',
  allLabel = 'All swimlanes',
}) => {
  // Empty value = all selected (convention)
  const allIds = swimlanes.map(s => String(s.id));
  const isAllSelected = value.length === 0 || value.length === swimlanes.length;
  const [showList, setShowList] = useState(!isAllSelected);
  const currentValue = isAllSelected ? allIds : value.map(String);

  const handleAllChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      onChange([]);  // Empty = all
      setShowList(false);
    } else {
      setShowList(true);
    }
  };

  const handleGroupChange = (checkedIds: string[]) => {
    if (checkedIds.length === swimlanes.length) {
      onChange([]);
      setShowList(false);
    } else {
      onChange(checkedIds);
    }
  };

  return (
    <div>
      {label && <div style={{ marginBottom: 4 }}>{label}</div>}
      <Checkbox
        style={{ marginBottom: 8 }}
        checked={isAllSelected && !showList}
        onChange={handleAllChange}
      >
        {allLabel}
      </Checkbox>
      {showList && (
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          padding: '8px',
        }}>
          <Checkbox.Group
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}
            value={currentValue}
            options={swimlanes.map(s => ({ label: s.name, value: String(s.id) }))}
            onChange={handleGroupChange}
          />
        </div>
      )}
    </div>
  );
};
```

### 3. Создать Storybook stories

- Default state (all selected)
- Expanded state (some selected)
- Empty swimlanes list
- Single swimlane

## Критерии приёмки

- [ ] Компонент создан в `src/shared/components/SwimlaneSelector/`
- [ ] Props: `swimlanes`, `value`, `onChange`, `label?`, `allLabel?`
- [ ] "All swimlanes" checkbox работает
- [ ] Expand/collapse работает
- [ ] Storybook stories созданы
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-102, TASK-103 (feature файлы сначала)

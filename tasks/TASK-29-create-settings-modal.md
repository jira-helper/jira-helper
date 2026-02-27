# TASK-29: Создать SettingsModal Container + View

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Создать Modal-компонент для редактирования WIP limits: View (обёртка с Save/Cancel) и Container (подключение к store, координация actions). Заменяет использование `Popup` класса.

## Файлы

```
src/wiplimit-on-cells/SettingsPage/components/SettingsModal/
├── SettingsModal.tsx               # новый — View: modal wrapper
├── SettingsModalContainer.tsx      # новый — Container: useStore, save/cancel
└── SettingsModal.stories.tsx       # новый — Storybook stories
```

## Что сделать

1. Создать `SettingsModal.tsx` — View-компонент:
   - Title, children, Save/Cancel buttons
   - Clear button
   - Props: `title`, `onSave`, `onCancel`, `onClear`, `children`

2. Создать `SettingsModalContainer.tsx` — Container:
   - `useWipLimitCellsSettingsUIStore` для данных ranges
   - Рендерит `SettingsModal` с `RangeForm` и `RangeTable` внутри
   - `onSave` → `saveToProperty()` action
   - `onCancel` → `initFromProperty()` action
   - `onClear` → `clearSettings()` action
   - `getNameLabel` — хелпер для отображения swimlane/column name

3. Создать `SettingsModal.stories.tsx`:
   - Empty modal, With ranges, With form

## Код после

```typescript
// SettingsModalContainer.tsx
export const SettingsModalContainer: React.FC<SettingsModalContainerProps> = ({
  swimlanes, columns, onClose, onSave
}) => {
  const { data, actions } = useWipLimitCellsSettingsUIStore();

  const getNameLabel = (swimlaneId: string, columnId: string) => {
    const sw = swimlanes.find(s => s.id.toString() === swimlaneId.toString());
    const col = columns.find(c => c.id.toString() === columnId.toString());
    return `${sw?.name} / ${col?.name}`;
  };

  return (
    <SettingsModal title="Edit WipLimit on cells" onSave={onSave} onCancel={onClose} onClear={...}>
      <RangeForm
        swimlanes={swimlanes}
        columns={columns}
        onAddRange={(name) => actions.addRange(name)}
        onAddCell={(name, cell) => actions.addCells(name, cell)}
        existingRangeNames={data.ranges.map(r => r.name)}
      />
      <RangeTable
        ranges={data.ranges}
        onDeleteRange={(name) => actions.deleteRange(name)}
        onDeleteCell={(name, sw, col) => actions.deleteCells(name, sw, col)}
        onChangeField={(name, field, value) => actions.changeField(name, field, value)}
        onSelectRange={() => {}}
        getNameLabel={getNameLabel}
      />
    </SettingsModal>
  );
};
```

## Критерии приёмки

- [ ] View-компонент не содержит бизнес-логику
- [ ] Container подключен к Settings UI Store
- [ ] Save/Cancel/Clear работают через actions
- [ ] Storybook stories
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-26](./TASK-26-create-settings-ui-store.md), [TASK-27](./TASK-27-create-range-table-react.md), [TASK-28](./TASK-28-create-range-form.md)
- Референс: `src/person-limits/SettingsPage/components/SettingsModal/`

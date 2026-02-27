# TASK-30: Создать SettingsButton Container + View

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Создать кнопку "Edit Wip limits by cells": View (button UI) и Container (open/close modal, init/save data). Это корневой React-компонент, рендерящийся через `createRoot`.

## Файлы

```
src/wiplimit-on-cells/SettingsPage/components/SettingsButton/
├── SettingsButton.tsx              # новый — View: button UI
├── SettingsButtonContainer.tsx     # новый — Container: open/close, init/save
└── SettingsButton.stories.tsx      # новый — Storybook stories
```

## Что сделать

1. Создать `SettingsButton.tsx` — View:
   - `<button class="aui-button">Edit Wip limits by cells</button>`
   - Props: `onClick`

2. Создать `SettingsButtonContainer.tsx` — Container:
   - `useState(isModalOpen)` — только для UI (open/close)
   - `handleOpen()`: `initFromProperty()`, set swimlanes/columns, open modal
   - `handleClose()`: `initFromProperty()`, close modal (отмена изменений)
   - `handleSave()`: `saveToProperty()`, close modal
   - Рендерит `SettingsButton` + условно `SettingsModalContainer`

3. Создать `SettingsButton.stories.tsx`

## Код после

```typescript
// SettingsButtonContainer.tsx
export const SettingsButtonContainer: React.FC<SettingsButtonContainerProps> = ({
  swimlanes, columns
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    initFromProperty();
    const { actions } = useWipLimitCellsSettingsUIStore.getState();
    actions.setSwimlanes(swimlanes);
    actions.setColumns(columns);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    initFromProperty();
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    await saveToProperty();
    setIsModalOpen(false);
  };

  return (
    <>
      <SettingsButton onClick={handleOpen} />
      {isModalOpen && (
        <SettingsModalContainer
          swimlanes={swimlanes}
          columns={columns}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
};
```

## Критерии приёмки

- [ ] View-компонент чистый (только props)
- [ ] Container управляет lifecycle: init → edit → save/cancel
- [ ] `useState` только для UI-состояния (isModalOpen)
- [ ] Storybook stories
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-22](./TASK-22-create-property-store.md), [TASK-26](./TASK-26-create-settings-ui-store.md), [TASK-29](./TASK-29-create-settings-modal.md)
- Референс: `src/person-limits/SettingsPage/components/SettingsButton/`

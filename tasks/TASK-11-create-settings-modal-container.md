# TASK-11: Создать SettingsModalContainer

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-10](./TASK-10-create-settings-modal-stories.md)

---

## Описание

Создать Container-компонент для модалки, который подключается к store и передаёт данные в View.

## Файлы для создания/изменения

```
src/column-limits/SettingsPage/components/SettingsModal/
├── SettingsModalContainer.tsx   # <-- новый файл
└── index.ts                     # <-- обновить экспорты
```

## Что сделать

### 1. Создать `SettingsModalContainer.tsx`

```typescript
import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { useColumnLimitsSettingsUIStore } from '../../stores/settingsUIStore';
import { ColumnLimitsForm } from '../../ColumnLimitsForm';
import { moveColumn } from '../../actions';
import type { Column } from '../../../types';

export type SettingsModalContainerProps = {
  onClose: () => void;
  onSave: () => Promise<void>;
};

export const SettingsModalContainer: React.FC<SettingsModalContainerProps> = ({
  onClose,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const withoutGroupColumns = useColumnLimitsSettingsUIStore(state => state.data.withoutGroupColumns);
  const groups = useColumnLimitsSettingsUIStore(state => state.data.groups);
  const issueTypeSelectorStates = useColumnLimitsSettingsUIStore(state => state.data.issueTypeSelectorStates);
  const actions = useColumnLimitsSettingsUIStore(state => state.actions);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers for ColumnLimitsForm
  const handleLimitChange = (groupId: string, limit: number) => {
    actions.setGroupLimit(groupId, limit);
  };

  const handleColorChange = (groupId: string) => {
    // TODO: Будет реализовано в TASK-14 (ColorPickerButton)
    console.log('Color change for group:', groupId);
  };

  const handleIssueTypesChange = (groupId: string, selectedTypes: string[], countAllTypes: boolean) => {
    actions.setIssueTypeState(groupId, {
      countAllTypes,
      projectKey: issueTypeSelectorStates[groupId]?.projectKey ?? '',
      selectedTypes,
    });
  };

  const handleMoveColumn = (column: Column, fromGroupId: string, toGroupId: string) => {
    moveColumn(column, fromGroupId, toGroupId);
  };

  return (
    <SettingsModal
      title="Limits for groups"
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <ColumnLimitsForm
        withoutGroupColumns={withoutGroupColumns}
        groups={groups}
        issueTypeSelectorStates={issueTypeSelectorStates}
        onLimitChange={handleLimitChange}
        onColorChange={handleColorChange}
        onIssueTypesChange={handleIssueTypesChange}
        onColumnDragStart={() => {}}
        onColumnDragEnd={() => {}}
        onDrop={() => {}}
        onDragOver={() => {}}
        onDragLeave={() => {}}
        formId="jh-wip-limits-form"
        allGroupsId="jh-all-groups"
        createGroupDropzoneId="jh-column-dropzone"
      />
    </SettingsModal>
  );
};
```

### 2. Обновить `index.ts`

```typescript
export { SettingsModal } from './SettingsModal';
export type { SettingsModalProps } from './SettingsModal';

export { SettingsModalContainer } from './SettingsModalContainer';
export type { SettingsModalContainerProps } from './SettingsModalContainer';
```

### 3. Обновить SettingsButtonContainer

В файле `src/column-limits/SettingsPage/components/SettingsButton/SettingsButtonContainer.tsx`:

1. Добавить импорт: `import { SettingsModalContainer } from '../SettingsModal';`
2. Заменить placeholder на `<SettingsModalContainer onClose={handleClose} onSave={handleSave} />`

## Критерии приёмки

- [ ] Файл `SettingsModalContainer.tsx` создан
- [ ] Компонент подключается к `useColumnLimitsSettingsUIStore`
- [ ] Компонент передаёт данные в `SettingsModal`
- [ ] `handleSave` устанавливает `isSaving` и вызывает `onSave`
- [ ] `SettingsButtonContainer` использует `SettingsModalContainer`
- [ ] Экспорт обновлен в `index.ts`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/components/`

## Проблемы с линтером

```
(место для записи ошибок)
```

---

## Результаты

**Дата**: 

**Агент**: 

**Статус**: 

**Комментарии**:

```
(место для комментариев агента)
```

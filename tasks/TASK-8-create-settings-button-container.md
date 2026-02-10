# TASK-8: Создать SettingsButtonContainer

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-7](./TASK-7-create-settings-button-stories.md)

---

## Описание

Создать Container-компонент для кнопки, который управляет состоянием модалки и инициализацией данных.

## Файлы для создания

```
src/column-limits/SettingsPage/components/SettingsButton/
├── SettingsButtonContainer.tsx   # <-- новый файл
└── index.ts                      # <-- обновить экспорты
```

## Что сделать

### 1. Создать `SettingsButtonContainer.tsx`

```typescript
import React, { useState } from 'react';
import { SettingsButton } from './SettingsButton';
import { useColumnLimitsPropertyStore } from '../../../property/store';
import { useColumnLimitsSettingsUIStore } from '../../stores/settingsUIStore';
import { mapColumnsToGroups } from '../../../shared/utils';
import { buildInitDataFromGroupMap } from '../../utils/buildInitData';
import { initFromProperty, saveToProperty } from '../../actions';
import { WITHOUT_GROUP_ID } from '../../../types';
// TODO: Импорт SettingsModalContainer будет добавлен в TASK-11

export type SettingsButtonContainerProps = {
  getColumns: () => NodeListOf<Element>;
  getColumnName: (el: HTMLElement) => string;
};

export const SettingsButtonContainer: React.FC<SettingsButtonContainerProps> = ({
  getColumns,
  getColumnName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    const wipLimits = useColumnLimitsPropertyStore.getState().data;
    const groupMap = mapColumnsToGroups({
      columnsHtmlNodes: Array.from(getColumns()) as HTMLElement[],
      wipLimits,
      withoutGroupId: WITHOUT_GROUP_ID,
    });
    const initData = buildInitDataFromGroupMap(groupMap, wipLimits, getColumnName);
    
    useColumnLimitsSettingsUIStore.getState().actions.reset();
    initFromProperty(initData);
    
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    const columnIds = Array.from(getColumns())
      .map(el => el.getAttribute('data-column-id'))
      .filter((id): id is string => id != null);
    
    await saveToProperty(columnIds);
    setIsModalOpen(false);
  };

  return (
    <>
      <SettingsButton onClick={handleOpen} />
      {/* TODO: SettingsModalContainer будет добавлен в TASK-11 */}
      {isModalOpen && (
        <div>Modal placeholder - will be replaced in TASK-11</div>
      )}
    </>
  );
};
```

### 2. Обновить `index.ts`

```typescript
export { SettingsButton } from './SettingsButton';
export type { SettingsButtonProps } from './SettingsButton';

export { SettingsButtonContainer } from './SettingsButtonContainer';
export type { SettingsButtonContainerProps } from './SettingsButtonContainer';
```

## Критерии приёмки

- [ ] Файл `SettingsButtonContainer.tsx` создан
- [ ] Компонент использует `useState` для `isModalOpen`
- [ ] `handleOpen` инициализирует UI store из property store
- [ ] `handleClose` закрывает модалку
- [ ] `handleSave` сохраняет и закрывает модалку
- [ ] Экспорт обновлен в `index.ts`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/components/SettingsButton/`

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

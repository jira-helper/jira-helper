# TASK-5: Создать SettingsButtonContainer

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Создать Container-компонент `SettingsButtonContainer`, который управляет открытием/закрытием модалки, инициализирует store из property и передаёт boardData в `SettingsModalContainer`. Аналогичен `column-limits/SettingsPage/components/SettingsButton/SettingsButtonContainer.tsx`.

## Файлы

```
src/person-limits/SettingsPage/components/SettingsButton/
├── index.ts                        # изменение — добавить экспорт Container
└── SettingsButtonContainer.tsx     # новый
```

## Что сделать

1. Создать `SettingsButtonContainer.tsx`:
   ```typescript
   import React, { useState } from 'react';
   import { SettingsButton } from './SettingsButton';
   import { SettingsModalContainer } from '../SettingsModal';
   import { initFromProperty, saveToProperty } from '../../actions';
   import type { Column, Swimlane } from '../../state/types';

   export type SettingsButtonContainerProps = {
     boardDataColumns: Column[];
     boardDataSwimlanes: Swimlane[];
   };

   export const SettingsButtonContainer: React.FC<SettingsButtonContainerProps> = ({
     boardDataColumns,
     boardDataSwimlanes,
   }) => {
     const [isModalOpen, setIsModalOpen] = useState(false);

     const handleOpen = () => {
       initFromProperty();
       setIsModalOpen(true);
     };

     const handleClose = () => {
       initFromProperty(); // restore state on cancel
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
             columns={boardDataColumns}
             swimlanes={boardDataSwimlanes}
             onClose={handleClose}
             onSave={handleSave}
           />
         )}
       </>
     );
   };
   ```

2. Обновить `index.ts`:
   ```typescript
   export { SettingsButton } from './SettingsButton';
   export type { SettingsButtonProps } from './SettingsButton';

   export { SettingsButtonContainer } from './SettingsButtonContainer';
   export type { SettingsButtonContainerProps } from './SettingsButtonContainer';
   ```

## Код до/после (index.tsx → SettingsButtonContainer)

```typescript
// До (в index.tsx):
renderEditButton(): void {
  this.DOMeditBtn = this.insertHTML(/*...*/,  groupSettingsBtnTemplate());
  this.popup = new Popup({ title: 'Personal WIP Limit', onConfirm: this.handleSubmit, onCancel: this.handleClose });
  this.addEventListener(this.DOMeditBtn!, 'click', this.openPersonalSettingsPopup);
}

openPersonalSettingsPopup = async (): Promise<void> => {
  await this.popup!.render();
  initFromProperty();
  this.popup!.appendReactComponentToContent(<PersonalWipLimitContainer ... />);
};

handleSubmit = async (unmountPopup: Function): Promise<void> => {
  await saveToProperty();
  unmountPopup();
};

handleClose = async (unmountPopup: Function): Promise<void> => {
  initFromProperty();
  unmountPopup();
};

// После (в SettingsButtonContainer.tsx):
// Вся эта логика инкапсулирована в одном React-компоненте (см. выше)
```

## Тестирование

> **НЕ используем react-testing-library.** Пишем Cypress component tests (`.cy.tsx`).

## Критерии приёмки

- [ ] `SettingsButtonContainer` рендерит `SettingsButton`
- [ ] При клике на кнопку — `initFromProperty()` + открытие модалки
- [ ] При сохранении — `saveToProperty()` + закрытие модалки
- [ ] При отмене — `initFromProperty()` (восстановление) + закрытие модалки
- [ ] `boardDataColumns` и `boardDataSwimlanes` передаются в `SettingsModalContainer`
- [ ] Экспорты в `index.ts` обновлены
- [ ] Cypress тесты проходят (если написаны)
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-2](./TASK-2-create-settings-button-view.md), [TASK-4](./TASK-4-create-settings-modal-container.md)
- Блокирует: [TASK-6](./TASK-6-refactor-index-tsx.md)
- Референс: `src/column-limits/SettingsPage/components/SettingsButton/SettingsButtonContainer.tsx`

---

## Результаты

**Дата**: 2026-02-11

**Агент**: coder

**Статус**: DONE

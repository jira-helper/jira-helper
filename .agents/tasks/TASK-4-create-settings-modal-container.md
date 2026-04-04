# TASK-4: Создать SettingsModalContainer

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Создать Container-компонент `SettingsModalContainer`, который оборачивает `PersonalWipLimitContainer` в `SettingsModal`. Сюда переносится бизнес-логика из `index.tsx`: обработка `onAddLimit` (вызов API `getUser`, создание/обновление лимита), управление состоянием сохранения.

## Файлы

```
src/person-limits/SettingsPage/components/SettingsModal/
├── index.ts                        # изменение — добавить экспорт Container
└── SettingsModalContainer.tsx      # новый — Container компонент
```

## Что сделать

1. Создать `SettingsModalContainer.tsx`:
   ```typescript
   import React, { useState } from 'react';
   import { SettingsModal } from './SettingsModal';
   import { PersonalWipLimitContainer } from '../PersonalWipLimitContainer';
   import { useSettingsUIStore } from '../../stores/settingsUIStore';
   import { createPersonLimit, updatePersonLimit } from '../../actions';
   import { getUser } from '../../../../shared/jiraApi';
   import type { FormData, Column, Swimlane } from '../../state/types';

   export type SettingsModalContainerProps = {
     columns: Column[];
     swimlanes: Swimlane[];
     onClose: () => void;
     onSave: () => Promise<void>;
   };
   ```

2. Реализовать логику `handleAddLimit`:
   - Проверить `editingId` из store
   - Если редактирование — вызвать `updatePersonLimit` и `store.actions.updateLimit`
   - Если добавление — вызвать `getUser(formData.personName)`, затем `createPersonLimit` и `store.actions.addLimit`
   - Эта логика переносится из `index.tsx` методов `onAddLimit` и `onEditLimit`

3. Реализовать `handleSave` с loading state:
   ```typescript
   const handleSave = async () => {
     setIsSaving(true);
     try { await onSave(); } finally { setIsSaving(false); }
   };
   ```

4. Рендер:
   ```tsx
   <SettingsModal title="Personal WIP Limit" onClose={onClose} onSave={handleSave} isSaving={isSaving}>
     <PersonalWipLimitContainer columns={columns} swimlanes={swimlanes} onAddLimit={handleAddLimit} />
   </SettingsModal>
   ```

5. Обновить `index.ts` — добавить экспорт:
   ```typescript
   export { SettingsModalContainer } from './SettingsModalContainer';
   export type { SettingsModalContainerProps } from './SettingsModalContainer';
   ```

## Код до/после (index.tsx → SettingsModalContainer)

```typescript
// До (в index.tsx):
onAddLimit = async (formData: FormData): Promise<void> => {
  const store = useSettingsUIStore.getState();
  if (store.data.editingId !== null) {
    await this.onEditLimit(formData);
    return;
  }
  const fullPerson = await getUser(formData.personName);
  const personLimit = createPersonLimit({
    formData,
    person: { name: fullPerson.name ?? fullPerson.displayName, displayName: fullPerson.displayName, self: fullPerson.self, avatar: fullPerson.avatarUrls['32x32'] },
    columns: this.boardDataColumns || [],
    swimlanes: this.boardDataSwimlanes || [],
    id: Date.now(),
  });
  store.actions.addLimit(personLimit);
};

// После (в SettingsModalContainer.tsx):
const handleAddLimit = async (formData: FormData) => {
  const store = useSettingsUIStore.getState();
  if (store.data.editingId !== null) {
    const existingLimit = store.data.limits.find(l => l.id === store.data.editingId);
    if (!existingLimit) return;
    const updatedLimit = updatePersonLimit({ existingLimit, formData, columns, swimlanes });
    store.actions.updateLimit(store.data.editingId, updatedLimit);
  } else {
    const fullPerson = await getUser(formData.personName);
    const personLimit = createPersonLimit({
      formData,
      person: { name: fullPerson.name ?? fullPerson.displayName, displayName: fullPerson.displayName, self: fullPerson.self, avatar: fullPerson.avatarUrls['32x32'] },
      columns,
      swimlanes,
      id: Date.now(),
    });
    store.actions.addLimit(personLimit);
  }
};
```

## Тестирование

> **НЕ используем react-testing-library.** Пишем Cypress component tests (`.cy.tsx`).

## Критерии приёмки

- [ ] `SettingsModalContainer` рендерит `SettingsModal` с `PersonalWipLimitContainer` внутри
- [ ] `handleAddLimit` корректно обрабатывает добавление (с вызовом `getUser` API)
- [ ] `handleAddLimit` корректно обрабатывает редактирование (с `updatePersonLimit`)
- [ ] Loading state (`isSaving`) работает при сохранении
- [ ] Экспорты в `index.ts` обновлены
- [ ] Cypress тесты проходят (если написаны)
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-extract-constants.md), [TASK-3](./TASK-3-create-settings-modal-view.md)
- Блокирует: [TASK-5](./TASK-5-create-settings-button-container.md)
- Референс: `src/column-limits/SettingsPage/components/SettingsModal/SettingsModalContainer.tsx`

---

## Результаты

**Дата**: 2026-02-11

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Создан `SettingsModalContainer.tsx` с логикой обработки добавления/редактирования лимитов:
- Реализован `handleAddLimit` с поддержкой режимов добавления (с вызовом `getUser` API) и редактирования (с `updatePersonLimit`)
- Реализован `handleSave` с управлением loading state (`isSaving`)
- Контейнер оборачивает `PersonalWipLimitContainer` в `SettingsModal`

Обновлён `index.ts` для экспорта контейнера и его типов.

Созданы Cypress component tests (`.cy.tsx`) для проверки:
- Рендеринга модалки с формой внутри
- Вызова `onClose` при клике на Cancel
- Вызова `onSave` при клике на Save
- Loading state при сохранении
- Блокировки кнопки Cancel во время сохранения

Все файлы прошли проверку ESLint без ошибок.
